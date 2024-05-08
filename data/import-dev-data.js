const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Movie = require("./../Models/movieModels");
dotenv.config({ path: "./config.env" });

//Connect to Mongodb
mongoose
  .connect(process.env.CONN_STR, {
    useNewUrlParser: true,
  })
  .then((conn) => {
    // console.log(conn);
    console.log("DB connection Succusfull");
  })
  .catch((erro) => {
    console.log("Some error has been ocuerd");
  });

//Readmovies.json file
const movies = fs.readFileSync("./data/movies.json", "utf-8");

const deleteMovies = async () => {
  try {
    await Movie.deleteMany();
    console.log("Data sucessfully Deleted!");
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
};

const importMovies = async () => {
  try {
    await Movie.create(movies);
    console.log("Data sucessfully imported!");
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importMovies();
}
if (process.argv[2] === "--delete") {
  deleteMovies();
}
