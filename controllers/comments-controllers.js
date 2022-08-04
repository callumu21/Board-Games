const {
  removeComment,
  updateCommentById,
} = require("../models/comments-models");

exports.patchCommentById = async (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;

  try {
    const comment = await updateCommentById(comment_id, inc_votes);
    res.status(200).send({ comment });
  } catch (err) {
    next(err);
  }
};

exports.deleteCommentById = async (req, res, next) => {
  const { comment_id } = req.params;

  try {
    await removeComment(comment_id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
