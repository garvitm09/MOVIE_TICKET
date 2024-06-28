const express = require('express');
const movieController = require('../controller/movie.controller');
const isAuth = require('../middleware/isAuth');
const router = express.Router();

router.post('/addmovie', isAuth, movieController.addMovie);

router.get('/allmovies', movieController.getallmovies);

router.delete('/deletemovie', isAuth, movieController.deleteMovie);

router.get('/revenuebydate', movieController.revenuebydate)

router.get('/movierevenue', isAuth, movieController.movierevenue)

module.exports = router;