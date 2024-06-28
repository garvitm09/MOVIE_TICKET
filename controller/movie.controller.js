const Admin = require("../models/Admin");
const Movie = require("../models/Movie");
const Ticket = require("../models/Tickets");
const mongoose = require("mongoose");

const validateMovieInput = require('../validation/movie');

exports.addMovie = async(req, res, next) => {
const {errors, isValid} = validateMovieInput(req.body);
if(!isValid){
//Check errors
  return res.status(404).json(errors);
}

let existingAdmin;
let existingMovie;
try {
  existingAdmin = await Admin.findById(req.userId);
  existingMovie = await Movie.findOne({title: req.body.title});
} catch (err) {
  return res.satus(500).json({message: err.message});
}  if (!existingAdmin) {
  return res.status(404).json({ message: "Admin Not Found With Given ID" });
} if(existingMovie){
  return res.json({message: "Movie already exists"});
}
let newMovie;
try{
  {
    newMovie = new Movie({
      title: req.body.title,
      description: req.body.description,
      genre: req.body.genre,
      rating: req.body.rating,
      admin: existingAdmin.id
    })
    const session = await mongoose.startSession();
    session.startTransaction();
    // existingAdmin.movie.push(req.body.title)
    // await existingAdmin.save({session});
    await newMovie.save({session});
    session.commitTransaction();
  }
}catch (err) {
  return res.status(500).json({message: err.message});
}
if(!newMovie){
  return res.status(500).json({ message: "Unable to create." });
}
return res.status(200).json(newMovie);
}


exports.deleteMovie = async (req, res) => {

  let existingAdmin;
  let existingMovie;
  try {
    existingAdmin = await Admin.findById(req.userId);
    existingMovie = await Movie.findOne({title: req.body.title});
  } catch (err) {
    return res.satus(500).json({message: err.message});
  }  if (!existingAdmin) {
    return res.status(404).json({ message: "Admin Not Found With Given ID" });
  } if(!existingMovie){
    return res.json({message: "Movie doesn't exists"});
  }
  try{
    for(i = 0; i < existingAdmin.screen.length; i++){
      if(existingAdmin.screen[i].movie === req.body.title){
        existingAdmin.screen.splice(i,1)
      }
    }
    await existingMovie.deleteOne();

    const session = await mongoose.startSession();
    session.startTransaction();
    existingAdmin.save({session});
    session.commitTransaction();
  }catch(err){
    return res.status(500).json({ message: err.message });
  }
  return res.status(200).json({success: true})
};



exports.getallmovies = (req, res) =>{
  Movie.find()
    .then(movies => res.status(200).json(movies))
    .catch(err => res.status(404).json({nomoviefound: 'No movies currently available'})) 
}

exports.movierevenue = async (req,res) => {
  let existingAdmin;
  let existingMovie;
  let existingTickets;
  try{
    existingAdmin = await Admin.findById({_id: req.userId}) 
    existingMovie = await Movie.findOne({title: req.body.title})
    existingTickets = await Ticket.find({title: req.body.title})
  }catch(err){
    return res.status(500).json({message: err.message});
  }
  if(!existingAdmin){
    return res.status(404).json({message: "Admin not authorized"} )
  }
  if(!existingMovie){
    return res.status(404).json({message: "Movie not found"} )
  }
  if(!existingTickets){
    return res.status(404).json({message: "No tickets booked"} )
  }
  array = [];
  revenue = 0;
  for (i = 0; i < existingTickets.length; i++){
    array.push(existingTickets[i].ticket_cost)
    revenue += existingTickets[i].ticket_cost;
  }
  return res.json({total_revenue: revenue})
}
  // return res.status(200).json({existingMovie.revenue_movie})

  exports.revenuebydate = async (req,res) => {
    // let existingAdmin;
    let existingMovie;
    let existingTickets;
    try{
      // existingAdmin = await Admin.findById({_id: req.userId}) 
      existingMovie = await Movie.find({title: req.body.title})
      existingTickets = await Ticket.find({title: req.body.title})
      
    }catch(err){
      return res.status(500).json({message: err.message});
    }
    // if(!existingAdmin){
    //   return res.status(404).json({message: "Admin not authorized"} )
    // }
    if(!existingTickets){
      return res.status(404).json({message: "Screen not found"});
    }
    array = [];
    for(i = 0; i < existingTickets.length; i++) {
      array.push(existingTickets[i].date.getMinutes())
    }
    revenue = 0;
    for (i = 0; i < existingTickets.length; i++) {
      if(existingTickets[i].date.getMinutes() <= parseInt(req.body.time)){
        revenue += existingTickets[i].ticket_cost
      }}
      return res.json(revenue)
  }