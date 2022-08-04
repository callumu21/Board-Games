const usersRouter = require("express").Router();
const { getUsers } = require("../controllers/controllers");

usersRouter.get("/", getUsers);

module.exports = usersRouter;
