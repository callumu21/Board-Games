const apiRouter = require("express").Router();
const categoriesRouter = require("./categories-router");
const reviewsRouter = require("./reviews-router");
const commentsRouter = require("./comments-router");
const usersRouter = require("./users-router");
const { getEndpoints } = require("../controllers/api-controllers");

apiRouter.get("/", getEndpoints);

apiRouter.use("/categories", categoriesRouter);

apiRouter.use("/reviews", reviewsRouter);

apiRouter.use("/users", usersRouter);

apiRouter.use("/comments", commentsRouter);

module.exports = apiRouter;
