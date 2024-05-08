const mongoose = require("mongoose");
const fs = require("fs");
const validator = require("validator");

const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required filed"],
      unique: true,
      maxlength: [100, "Movie name must not have more than 100"],
      minlength: [4, "Movie name must have at leasest 4 charchter"],
      trim: true,
      // validate: [validator.isAlpha, "Name Should only contain alphabests"],
    },
    description: {
      type: String,
      required: [true, "Description is required filed"],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "Duration is requred field"],
    },
    ratings: {
      type: Number,
      // min: [1, "Ratings must be 1 or above"],
      // max: [10, "Ratings must be 10 or belowe"],
      validate: {
        validator: function (value) {
          return value >= 1 && value <= 10;
        },
        message: "Rating  ({VALUE}) should be above 1 and below 10",
      },
    },
    totalRating: { type: Number },
    releaseYear: {
      type: Number,
      required: [true, "Release Year is requred field"],
    },
    releaseDate: { type: Date },
    createdAt: { type: Date, default: Date.now(), select: true },
    genres: { type: [String], required: [true, "Genres is requred field"] },
    directors: {
      type: [String],
      required: [true, "Directors is requred field"],
    },
    coverImage: {
      type: String,
      required: [true, "Cover Image is requred field"],
    },
    actors: { type: [String], required: [true, "Actors is requred field"] },
    price: { type: Number, required: [true, "Price is requred field"] },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

movieSchema.virtual("durationInHouers").get(function () {
  return this.duration / 60;
});

movieSchema.pre(/^find/, function (next) {
  this.find({ releaseDate: { $lte: Date.now() } });
  this.startTime = Date.now();
  next();
});

movieSchema.post(/^find/, function (docs, next) {
  this.find({ releaseDate: { $lte: Date.now() } });
  this.endTime = Date.now();

  const content = `Query took ${
    this.endTime - this.startTime
  } millisecond to fetch the documents`;
  fs.writeFileSync("./Log/log.txt", content, { flag: "a" }, (err) => {
    console.log(err.message);
  });
  next();
});

movieSchema.pre("aggregate", function (next) {
  console.log(
    this.pipeline().unshift({ $match: { releaseDate: { $lte: new Date() } } })
  );
  next();
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
