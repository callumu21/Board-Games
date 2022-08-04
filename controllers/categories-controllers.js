const { fetchCategories } = require("../models/categories-models");

exports.getCategories = async (req, res, next) => {
  const categories = await fetchCategories();

  res.status(200).send({ categories });
};
