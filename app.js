//import package

const express = require("express");
const morgan = require("morgan");
const movieRouter = require("./Routers/moviesRouter");
const authRouter = require("./Routers/authRouter");
const CustomeError = require("./Utils/CoustomError");
const globalErrorHander = require("./Controllers/errorController");
const userRouter = require("./Routers/userRouter");

let app = express();

// const logger = function (req, res, next) {
//   console.log("Custome middleware called");
//   next();
// };

//middle ware
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.static("./public"));
app.use((req, res, next) => {
  req.requesteAt = new Date().toISOString();
  next();
});

app.use("/api/v1/movies", movieRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.all("*", (req, res, next) => {
  const err = new CustomeError(
    `Can t find s ${req.originalUrl} on the server`,
    404
  );
  next(err);
});

app.use(globalErrorHander);

//Create a Server
module.exports = app;
