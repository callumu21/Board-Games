const { fetchUsers, fetchUserByUsername } = require("../models/users-models");

exports.getUsers = async (req, res, next) => {
  const users = await fetchUsers();
  res.status(200).send({ users });
};

exports.getUserByUsername = async (req, res, next) => {
  const { username } = req.params;

  try {
    const user = await fetchUserByUsername(username);
    res.status(200).send({ user });
  } catch (err) {
    next(err);
  }
};
