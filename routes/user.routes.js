const express = require('express');
const userController = require('../controller/user.controller');
const isAuth = require('../middleware/isAuth');


const router = express.Router();

router.post('/login', userController.login);

router.post('/register', userController.register);

router.get('/current', isAuth, userController.current);

router.get('/allusers', userController.getusers);

router.get('/booking', isAuth, userController.booking);

router.get('/exportexcel', userController.exportToExcel);

module.exports = router;
