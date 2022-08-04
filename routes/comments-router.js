const commentsRouter = require("express").Router();
const { deleteCommentById } = require("../controllers/controllers");

commentsRouter.delete("/:comment_id", deleteCommentById);

module.exports = commentsRouter;
