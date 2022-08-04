const db = require("../db/connection");

exports.updateCommentById = async (comment_id, voteChange) => {
  if (isNaN(voteChange)) {
    return Promise.reject({
      status: 400,
      msg: "No valid vote change was included on the request body",
    });
  }
  const { rows: comment } = await db.query(
    `UPDATE comments
         SET votes = votes + $1
          WHERE comment_id = $2
          RETURNING *`,
    [voteChange, comment_id]
  );

  if (comment.length === 0) {
    return Promise.reject({ status: 404, msg: "Comment does not exist" });
  } else {
    return comment[0];
  }
};

exports.removeComment = async (comment_id) => {
  const { rows: comment } = await db.query(
    "DELETE FROM comments WHERE comment_id = $1 RETURNING *",
    [comment_id]
  );

  if (comment.length === 0) {
    return Promise.reject({ status: 404, msg: "No comment found" });
  } else {
    return;
  }
};
