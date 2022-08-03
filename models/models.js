const db = require("../db/connection");
const { checkExists } = require("../utils/checkExists");

exports.fetchCategories = () => {
  return db.query("SELECT * FROM categories").then(({ rows: categories }) => {
    return categories;
  });
};

exports.selectReview = (review_id) => {
  return db
    .query(
      `SELECT reviews.*, COUNT(comments.review_id)::int AS comment_count FROM reviews 
      LEFT OUTER JOIN comments ON comments.review_id = reviews.review_id 
      WHERE reviews.review_id = $1 
      GROUP BY reviews.review_id`,
      [review_id]
    )
    .then(({ rows: review }) => {
      return review.length > 0
        ? review[0]
        : Promise.reject({ status: 404, msg: "Review does not exist" });
    });
};

exports.updateReview = (review_id, voteChange) => {
  if (isNaN(voteChange)) {
    return Promise.reject({
      status: 400,
      msg: "No valid vote change was included on the request body",
    });
  }
  return db
    .query(
      "UPDATE reviews SET votes = votes + $1 WHERE review_id = $2 RETURNING *",
      [voteChange, review_id]
    )
    .then(({ rows: review }) => {
      return review.length > 0
        ? review[0]
        : Promise.reject({ status: 404, msg: "Review does not exist" });
    });
};

exports.fetchUsers = () => {
  return db.query("SELECT * FROM users").then(({ rows: users }) => users);
};

exports.fetchReviews = (sort_by = "created_at", order = "desc", category) => {
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
    queryString += `WHERE reviews.category = $1`;
    categoryQuery.push(category);
  }

  queryString += `GROUP BY reviews.review_id 
                  ORDER BY reviews.${sort_by} ${order}`;

  return db.query(queryString, categoryQuery).then(({ rows: reviews }) => {
    if (reviews.length === 0) {
      return checkExists("categories", "slug", category).then(() => {
        return Promise.reject({
          status: 404,
          msg: "This category has no associated reviews",
        });
      });
    } else {
      return reviews;
    }
  });
};

exports.fetchCommentsByReviewId = (review_id) => {
  return db
    .query("SELECT * FROM comments WHERE review_id = $1", [review_id])
    .then(({ rows: comments }) => {
      return comments;
    });
};

exports.addCommentByReviewId = (review_id, body, author) => {
  if (!body || !author) {
    const missingContent =
      !body && !author ? "body and author" : !body ? "body" : "author";

    return Promise.reject({
      status: 400,
      msg: `Missing valid ${missingContent} information`,
    });
  }

  return db
    .query(
      `INSERT INTO comments
    (body, author, review_id)
    VALUES
    ($1, $2, $3)
    RETURNING *`,
      [body, author, review_id]
    )
    .then(({ rows: comment }) => {
      return comment[0];
    });
};
