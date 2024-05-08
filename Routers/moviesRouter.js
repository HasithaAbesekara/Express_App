const express = require("express");
const movesController = require("./../Controllers/moviesController");
const authController = require("../Controllers/authController");

const router = express.Router();

// router.param("id", movesController.chakedIn);
router
  .route("/highest-rated")
  .get(movesController.getHighestRated, movesController.getAllMovies);

router.route("/movie-stats").get(movesController.getMoviesStats);

router.route("/movies-by-genre/:genre").get(movesController.getMoviesGenre);

router
  .route("/")
  .get(authController.protect, movesController.getAllMovies)
  .post(movesController.createMovie);

router
  .route("/:id")
  .patch(authController.protect, movesController.updateMovie)
  .delete(
    authController.protect,
    authController.restrict("admin"),
    movesController.deletMovie
  )
  .get(movesController.getMovie);

module.exports = router;
