const db = require("../db/connection");

exports.fetchUsers = async () => {
  const { rows: users } = await db.query("SELECT * FROM users");
  return users;
};

exports.fetchUserByUsername = async (username) => {
  const { rows: user } = await db.query(
    "SELECT username, avatar_url, name FROM users WHERE username = $1",
    [username]
  );

  if (user.length === 0) {
    return Promise.reject({ status: 404, msg: "User does not exist" });
  } else {
    return user[0];
  }
};
