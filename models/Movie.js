const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  genre: 
    { type: String,
    required: true }
  ,
  rating: {
    type: String,
    required: true,
  },
  revenue_Movie:{
    type: Number
  },
  admin: {
    type: mongoose.Types.ObjectId,
    ref: "admin",
    required: true,
  },
  date: {
      type: Date,
      default: Date.now
  }
});

module.exports = Movie = mongoose.model("movies", MovieSchema);