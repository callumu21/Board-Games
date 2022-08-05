const categoriesRouter = require("express").Router();
const {
  getCategories,
  postCategory,
} = require("../controllers/categories-controllers");

categoriesRouter.route("/").get(getCategories).post(postCategory);

module.exports = categoriesRouter;
