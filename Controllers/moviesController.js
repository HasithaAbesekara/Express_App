// const fs = require("fs");
const CoustomError = require("../Utils/CoustomError");
const Movie = require("./../Models/movieModels");
const ApiFeatures = require("./../Utils/ApiFeatures");
const asyncErrorHandler = require("./../Utils/asyncErrorHandler");

// let movies = JSON.parse(fs.readFileSync("./data/movies.json"));
exports.getHighestRated = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratings";

  next();
};

exports.getAllMovies = asyncErrorHandler(async (req, res, next) => {
  const features = new ApiFeatures(Movie.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  let movies = await features.query;
  //Mongoose 6.0 or less
  /**************Mongoose 6.0 or less************** 
      const excludeFields = ['sort', 'page', 'limit', 'fields'];
      const queryObj = {...req.query};
      excludeFields.forEach((el) => {
          delete queryObj[el]
      })
      const movies = await Movie.find(queryObj);
      **************************************************/

  res.status(200).json({
    status: "success",
    length: movies.length,
    data: {
      movies,
    },
  });
});

exports.getMovie = asyncErrorHandler(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    const error = new CoustomError("Movie with that ID is not found!", 404);
    return next(error);
  }

  res.status(200).json({
    status: "Succes",
    data: {
      movie,
    },
  });
});

exports.createMovie = asyncErrorHandler(async (req, res, next) => {
  const movie = await Movie.create(req.body);
  res.status(201).json({
    status: "Succes",
    data: {
      movie,
    },
  });
});

exports.updateMovie = async (req, res, next) => {
  try {
    const updateMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updateMovie) {
      const error = new CoustomError("Movie with that ID is not found!", 404);
      return next(error);
    }

    res.status(201).json({
      status: "Succes in Update",
      data: {
        updateMovie,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "Fail",
      message: err.message,
    });
  }
};

exports.deletMovie = asyncErrorHandler(async (req, res, next) => {
  const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

  if (!deletedMovie) {
    const error = new CoustomError("Movie with that ID is not found!", 404);
    return next(error);
  }

  res.status(204).json({
    status: "Succesfull delete",
    data: null,
  });
});

//Aggrigation pipleine using &match and &group this also using min,max etc...

exports.getMoviesStats = asyncErrorHandler(async (req, res, next) => {
  const stats = await Movie.aggregate([
    { $match: { ratings: { $gte: 4.5 } } },
    {
      $group: {
        _id: "$releaseYear",
        avgRating: { $avg: "$ratings" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        priceTotal: { $sum: "$price" },
        movieCount: { $sum: 1 },
      },
    },
    { $sort: { minPrice: 1 } },
    // { $match: { maxPrice: { $gte: 60 } } },
  ]);

  res.status(200).json({
    status: "Succesfull",
    count: stats.length,
    data: {
      stats,
    },
  });
});

exports.getMoviesGenre = asyncErrorHandler(async (req, res, next) => {
  const genre = req.params.genre;
  const movies = await Movie.aggregate([
    { $unwind: "$genres" },
    {
      $group: {
        _id: "$genres",
        movieCount: { $sum: 1 },
        movies: { $push: "$name" },
      },
    },
    { $addFields: { genre: "$_id" } },
    { $project: { _id: 0 } },

    // // { $limit: 6 },
    { $match: { genre: genre } },
  ]);

  res.status(200).json({
    status: "Succesfull",
    count: movies.length,
    data: {
      movies,
    },
  });
});
