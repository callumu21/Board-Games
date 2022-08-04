const usersRouter = require("express").Router();
const { getUsers, getUserByUsername } = require("../controllers/controllers");

usersRouter.get("/", getUsers);

usersRouter.get("/:username", getUserByUsername);

module.exports = usersRouter;
