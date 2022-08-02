exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid PSQL input" });
  } else if (err.code === "23502") {
    res
      .status(400)
      .send({ msg: "Attempted to insert null into a not-null constraint" });
  } else if (err.code === "23503") {
    res.status(400).send({
      msg: "Attempted to reference a foreign key not present in the database",
    });
  } else next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal server error" });
};
