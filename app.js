const express = require("express");
const { getCategories } = require("./controllers/controllers");

const app = express();

app.get("/api/categories", getCategories);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Endpoint does not exist" });
});

module.exports = app;
