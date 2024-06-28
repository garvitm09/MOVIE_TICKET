const express = require('express');
const bookingController = require('../controller/booking.controller');
const isAuth = require('../middleware/isAuth');
const router = express.Router();

router.post('/booking', isAuth, bookingController.booking);

router.get('/getBooking', isAuth, bookingController.getBookingById)

router.delete('/deletebooking/:bookid', isAuth, bookingController.deleteBooking);

module.exports = router;
