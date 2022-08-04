const reviewsRouter = require("express").Router();
const {
  getReviews,
  getReviewById,
  patchReview,
  getCommentsByReviewId,
  postCommentByReviewId,
} = require("../controllers/controllers");

reviewsRouter.get("/", getReviews);

reviewsRouter.route("/:review_id").get(getReviewById).patch(patchReview);

reviewsRouter
  .route("/:review_id/comments")
  .get(getCommentsByReviewId)
  .post(postCommentByReviewId);

module.exports = reviewsRouter;
