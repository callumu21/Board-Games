const db = require("../db/connection");
const { checkExists } = require("../utils/checkExists");

exports.fetchReviews = async (
  sort_by = "created_at",
  order = "desc",
  category,
  limit = 10,
  page = 1
) => {
  const validSortByQueries = [
    "review_id",
    "title",
    "category",
    "designer",
    "owner",
    "review_body",
    "review_img_url",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrderQueries = ["asc", "desc"];

  if (!validSortByQueries.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by query" });
  }

  if (!validOrderQueries.includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  let queryString = `SELECT reviews.owner, reviews.title, reviews.review_id, reviews.category, reviews.review_img_url, reviews.created_at, reviews.votes, reviews.designer,  COUNT(comments.review_id)::int AS comment_count FROM reviews
                      LEFT OUTER JOIN comments ON comments.review_id = reviews.review_id `;
  const categoryQuery = [];

  if (category) {
    queryString += `WHERE reviews.category = $1 `;
    categoryQuery.push(category);
  }

  queryString += `GROUP BY reviews.review_id 
                  ORDER BY reviews.${sort_by} ${order} `;

  const { rows: totalResults } = await db.query(queryString, categoryQuery);

  const totalCount = totalResults.length;

  if (isNaN(limit) || isNaN(page)) {
    return Promise.reject({
      status: 400,
      msg: "Limit and page queries should be a number value",
    });
  } else {
    const offset = (page - 1) * limit;
    queryString += category ? `LIMIT $2 OFFSET $3` : `LIMIT $1 OFFSET $2`;
    categoryQuery.push(limit, offset);
  }

  const { rows: reviews } = await db.query(queryString, categoryQuery);

  if (reviews.length === 0) {
    await checkExists("categories", "slug", category);
    return Promise.reject({
      status: 404,
      msg: "This category has no associated reviews",
    });
  } else {
    return { reviews, totalCount };
  }
};

exports.selectReview = async (review_id) => {
  const { rows: review } = await db.query(
    `SELECT reviews.*, COUNT(comments.review_id)::int AS comment_count FROM reviews 
        LEFT OUTER JOIN comments ON comments.review_id = reviews.review_id 
        WHERE reviews.review_id = $1 
        GROUP BY reviews.review_id`,
    [review_id]
  );

  return review.length > 0
    ? review[0]
    : Promise.reject({ status: 404, msg: "Review does not exist" });
};

exports.addReview = async (review_object) => {
  const { owner, title, review_body, designer, category } = review_object;

  const types = [owner, title, review_body, designer, category].map(
    (value) => typeof value
  );

  if (types.includes("object")) {
    return Promise.reject({
      status: 400,
      msg: "Values should only be strings",
    });
  }

  const { rows: review } = await db.query(
    `INSERT INTO reviews
      (owner, title, review_body, designer, category)
      VALUES
      ($1, $2, $3, $4, $5)
      RETURNING *`,
    [owner, title, review_body, designer, category]
  );

  return review[0];
};

exports.updateReview = async (review_id, voteChange) => {
  if (isNaN(voteChange)) {
    return Promise.reject({
      status: 400,
      msg: "No valid vote change was included on the request body",
    });
  }
  const { rows: review } = await db.query(
    "UPDATE reviews SET votes = votes + $1 WHERE review_id = $2 RETURNING *",
    [voteChange, review_id]
  );

  return review.length > 0
    ? review[0]
    : Promise.reject({ status: 404, msg: "Review does not exist" });
};

exports.fetchCommentsByReviewId = async (review_id, limit = 10, page = 1) => {
  let queryString = "SELECT * FROM comments WHERE review_id = $1";
  const queryValues = [review_id];

  if (isNaN(limit) || isNaN(page)) {
    return Promise.reject({
      status: 400,
      msg: "Limit and page queries should be a number value",
    });
  } else {
    const offset = (page - 1) * limit;
    queryString += `LIMIT $2 OFFSET $3`;
    queryValues.push(limit, offset);
  }

  const { rows: comments } = await db.query(queryString, queryValues);

  return comments;
};

exports.addCommentByReviewId = async (review_id, body, author) => {
  if (!body || !author) {
    const missingContent =
      !body && !author ? "body and author" : !body ? "body" : "author";

    return Promise.reject({
      status: 400,
      msg: `Missing valid ${missingContent} information`,
    });
  }

  const { rows: comment } = await db.query(
    `INSERT INTO comments
      (body, author, review_id)
      VALUES
      ($1, $2, $3)
      RETURNING *`,
    [body, author, review_id]
  );

  return comment[0];
};

exports.removeReview = async (review_id) => {
  const { rows: review } = await db.query(
    "DELETE FROM reviews WHERE review_id = $1 RETURNING *",
    [review_id]
  );

  if (review.length === 0) {
    return Promise.reject({ status: 404, msg: "No review found" });
  } else {
    return review[0];
  }
};
