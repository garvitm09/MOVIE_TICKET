const mongoose = require("mongoose");
const Ticket = require("../models/Tickets");
const Movie = require("../models/Movie");
const Screen = require("../models/Screen");
const User = require("../models/User");



exports.booking = async (req, res, next) => {
  const { movie, date, seatNumber, user } = req.body;

  let existingMovie;
  let existingUser;
  let existingScreen;
  try {
    existingUser = await User.findById(req.userId);
    existingMovie = await Movie.findOne({title: req.body.title});
    existingScreen = await Screen.findOne({screen: req.body.screen_name});

  } catch (err) {
    return console.log(err);
  }
  if (!existingMovie) {
    return res.status(404).json({ message: "Movie Not Found With Given ID" });
  }
  if (!existingUser) {
    return res.status(404).json({ message: "User not found with given ID " });
  }
  if(!existingScreen){
    return res.status(404).json({ message: "Screen not found with given name " });
  }
  if(existingScreen.seats === 0){
    return res.status(500).json({message: "All seats are booked"})
  }
  const screens = await Screen.find({screen: req.body.screen_name})
  timeslots = [];
  for (i = 0; i < screens.length; i++){
    timeslots.push(screens[i].timeslot)
  }

  time = req.body.time
  istime = timeslots.indexOf(time)
  ticket_len = seatNumber.length
  aval_seats = existingScreen.seats - ticket_len
  cost  = existingScreen.price * ticket_len
  const inbooking = seatNumber.filter(element => existingScreen.booked_seats.includes(element))
  const notinbooking = seatNumber.filter(element => !existingScreen.booked_seats.includes(element))
  if(istime === -1){
    return  res.json({message: `Time slot ${timeslots}`})
  }
  if(inbooking.length > 0){
    return res.json({message: `${inbooking} are booked`})
  }
  
  if(aval_seats < 0){
    return res.json({message: `Only ${existingScreen.seats} seat available for booking`})
  }

  let newBooking;
  try {
    newBooking = new Ticket({
      title: req.body.title,
      screen_name: req.body.screen_name,
      seatNumber: req.body.seatNumber,
      ticket_cost: cost,  
      time: req.body.time,
      user: req.userId,
      movie: existingMovie.id,
      screen: existingScreen.id
    });

    const session = await mongoose.startSession();
    session.startTransaction();
    existingScreen.booked_seats.push(...req.body.seatNumber)
    existingUser.bookings.push(newBooking);
    existingScreen.booking.push(newBooking);
    existingScreen.seats = aval_seats;
    await existingUser.save({ session });
    await existingScreen.save({ session });
    await newBooking.save({ session });
    session.commitTransaction();
  } catch (err) {
    return console.log(err);
  }

  if (!newBooking) {
    return res.status(500).json({ message: "Unable to create a booking" });
  }

return res.status(201).json({ newBooking });
};


exports.getBookingById = async (req, res, next) => {
  const id = req.params.id;
  let booking;
  try {
    booking = await Ticket.findById(id);
  } catch (err) {
    return console.log(err);
  }
  if (!booking) {
    return res.status(500).json({ message: "Unexpected Error" });
  }
  return res.status(200).json({ booking });
};


exports.deleteBooking = async (req, res, next) => {
  const id = req.params.bookid;
  let booking;
  let existingUser;
  let existingScreen;
  try {
    booking = await Ticket.findById(id);
    existingUser = await User.findById(req.userId);
    existingScreen = await Screen.findById(booking.screen)
    seat_len = booking.seatNumber.length
    existingScreen.seats += seat_len
    booked = existingScreen.booked_seats
    existingScreen.booked_seats = booked.filter(element => !booking.seatNumber.includes(element));
    booking = await Ticket.findByIdAndDelete(id);

    const session = await mongoose.startSession();
    session.startTransaction();
    await existingUser.bookings.pull(booking);
    await existingScreen.booking.pull(booking);
    await existingScreen.save({ session });
    await existingUser.save({ session });
    session.commitTransaction();
  } catch (err) {
    return console.log(err);
  }
  if (!booking) {
    return res.status(500).json({ message: "Unable to Delete" });
  }
  return res.status(200).json({ message: "Successfully Deleted" });
};


