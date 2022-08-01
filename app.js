const express = require("express");
const {
  getCategories,
  getReviews,
  getReviewById,
  patchReview,
  getUsers,
} = require("./controllers/controllers");
const {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
} = require("./errors");

const app = express();

app.use(express.json());

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id", getReviewById);
app.patch("/api/reviews/:review_id", patchReview);

app.get("/api/users", getUsers);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Endpoint does not exist" });
});

// Error-handling middleware functions

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = app;
