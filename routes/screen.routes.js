const express = require('express');
const screenController = require('../controller/screen.controller');
const isAuth = require('../middleware/isAuth');
const router = express.Router();

router.post('/addscreen', isAuth, screenController.addScreen);

router.get('/allscreens', isAuth, screenController.getallscreens);

router.get('/screenrevenue', isAuth, screenController.screenrevenue)

router.get('/revenuebydate', screenController.revenuebydate)

router.get('/exportexcel', screenController.exportToExcel);

router.delete('/deletescreens', isAuth, screenController.deleteScreen);

module.exports = router;