const db = require("../db/connection");

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

exports.fetchReviews = () => {
  return db
    .query(
      `SELECT reviews.*, COUNT(comments.review_id)::int AS comment_count FROM reviews
       LEFT OUTER JOIN comments ON comments.review_id = reviews.review_id
       GROUP BY reviews.review_id
       ORDER BY reviews.created_at DESC`
    )
    .then(({ rows: reviews }) => reviews);
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
