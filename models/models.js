const db = require("../db/connection");

exports.fetchCategories = () => {
  return db.query("SELECT * FROM categories").then(({ rows: categories }) => {
    return categories;
  });
};

exports.selectReview = (review_id) => {
  return db
    .query("SELECT * FROM reviews WHERE review_id = $1", [review_id])
    .then(({ rows: review }) => {
      return review.length > 0
        ? review[0]
        : Promise.reject({ status: 404, msg: "Review does not exist" });
    });
};
