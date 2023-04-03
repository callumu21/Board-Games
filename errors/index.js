exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Value does not match expected data type" });
  } else if (err.code === "23502") {
    res.status(400).send({ msg: "Expected value cannot be null" });
  } else if (err.code === "23503") {
    res.status(400).send({
      msg: "Required value does not exist",
    });
  } else next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal server error" });
};
