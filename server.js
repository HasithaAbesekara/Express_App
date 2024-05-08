const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// process.on("uncaughtException", (err) => {
//   console.log(err.name, err.message);
//   console.log("Uncaught Exception occured shutting down...");
//   process.exit(1);
// });

const app = require("./app");

// console.log(app.get("env"));
// console.log(process.env);

mongoose
  .connect(process.env.CONN_STR, {
    useNewUrlParser: true,
  })
  .then((conn) => {
    // console.log(conn);
    console.log("DB connection Succusfull");
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log("Server has Started");
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandel rejection occured shutting down...");

  server.close(() => {
    process.exit(1);
  });
});
