const CoustomError = require("../Utils/CoustomError");

const devErrors = (res, error) => {
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};

const castErrorHandler = (err) => {
  const msg = `Inavlid value ${err.value} for field ${err.path}!`;
  return new CoustomError(msg, 400);
};

const duplicateErrorHandler = (err) => {
  const name = err.keyValue.name;
  const msg = `There is already a movie with name ${name}.Please use another name!`;
  return new CoustomError(msg, 400);
};

const handleExpierJWT = (err) => {
  return new CoustomError("JWT has expied.please login agin", 401);
};

const handleJWTError = (err) => {
  return new CoustomError("Invalid Token.please login agin", 401);
};

const validationErrorHandler = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  const errorMesages = errors.join(". ");
  const msg = `Inavlid inpu data: ${errorMesages}`;

  return new CoustomError(msg, 400);
};

const prodErrors = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Somthing went wrong! please try agnin later",
    });
  }
};

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV == "development") {
    devErrors(res, error);
  } else if (process.env.NODE_ENV == "production") {
    if (error.name === "CastError") error = castErrorHandler(error);
    if (error.code === 11000) error = duplicateErrorHandler(error);
    if (error.name === "ValidationError") error = validationErrorHandler(error);
    if (error.name === "TokenExpiredError") error = handleExpierJWT(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError(error);

    prodErrors(res, error);
  }
};
