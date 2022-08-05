const {
  selectReview,
  updateReview,
  fetchReviews,
  addReview,
  fetchCommentsByReviewId,
  addCommentByReviewId,
} = require("../models/reviews-models");

exports.getReviews = async (req, res, next) => {
  const { sort_by, order, category, limit, p: page } = req.query;

  try {
    const { reviews, totalCount: total_count } = await fetchReviews(
      sort_by,
      order,
      category,
      limit,
      page
    );
    res.status(200).send({ total_count, page: Number(page) || 1, reviews });
  } catch (err) {
    next(err);
  }
};

exports.postReview = async (req, res, next) => {
  try {
    const review = await addReview(req.body);
    res.status(201).send({ review });
  } catch (err) {
    next(err);
  }
};

exports.getReviewById = async (req, res, next) => {
  const { review_id } = req.params;

  try {
    const review = await selectReview(review_id);
    res.status(200).send({ review });
  } catch (err) {
    next(err);
  }
};

exports.patchReview = async (req, res, next) => {
  const { review_id } = req.params;
  const { inc_votes } = req.body;

  try {
    const review = await updateReview(review_id, inc_votes);
    res.status(200).send({ review });
  } catch (err) {
    next(err);
  }
};

exports.getCommentsByReviewId = async (req, res, next) => {
  const { review_id } = req.params;
  const { limit, p: page } = req.query;

  try {
    const [comments] = await Promise.all([
      fetchCommentsByReviewId(review_id, limit, page),
      selectReview(review_id),
    ]);
    res.status(200).send({ comments });
  } catch (err) {
    next(err);
  }
};

exports.postCommentByReviewId = async (req, res, next) => {
  const { review_id } = req.params;
  const { body, username } = req.body;

  try {
    const [_, comment] = await Promise.all([
      selectReview(review_id),
      addCommentByReviewId(review_id, body, username),
    ]);
    res.status(201).send({ comment });
  } catch (err) {
    next(err);
  }
};
