const express = require('express');
const adminController = require('../controller/admin.controller');
const isAuth = require('../middleware/isAuth');
const router = express.Router();

router.post('/login',adminController.login);

router.post('/register', adminController.register);

router.get('/alladmins', adminController.getadmins);

router.get('/getallbookings',isAuth, adminController.getallbookings);

router.get('/getdate', isAuth, adminController.getDate);

router.get('/current', isAuth, adminController.current);

router.get('/exportexcel', adminController.exportToExcel);

module.exports = router;
