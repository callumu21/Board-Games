const express = require("express");
const { getCategories, getReviewById } = require("./controllers/controllers");

const app = express();

app.get("/api/categories", getCategories);

app.get("/api/reviews/:review_id", getReviewById);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Endpoint does not exist" });
});

// Error-handling middleware functions

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Please enter a valid ID" });
  } else {
    res.status(err.status).send({ msg: err.msg });
  }
});

module.exports = app;
