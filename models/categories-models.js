const db = require("../db/connection");

exports.fetchCategories = async () => {
  const { rows: categories } = await db.query("SELECT * FROM categories");

  return categories;
};
