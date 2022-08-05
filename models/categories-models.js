const db = require("../db/connection");

exports.fetchCategories = async () => {
  const { rows: categories } = await db.query("SELECT * FROM categories");

  return categories;
};

exports.addCategory = async ({ slug, description }) => {
  if (!slug) {
    return Promise.reject({
      status: 400,
      msg: "Category should include a valid slug",
    });
  } else if (!description) {
    return Promise.reject({
      status: 400,
      msg: "Category should include a valid description",
    });
  }

  const { rows: category } = await db.query(
    `INSERT INTO categories
    (slug, description)
    VALUES
    ($1, $2)
    RETURNING *`,
    [slug, description]
  );
  return category[0];
};
