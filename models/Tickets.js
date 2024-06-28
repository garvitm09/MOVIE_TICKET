const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
    movie: {
      type: mongoose.Types.ObjectId,
      ref: "movies",
      required: true,
    },
    title:{
      type: String,
      required: true
    },
    screen_name: {
      type: String,
      required: true,
    },
    screen: {
      type: mongoose.Types.ObjectId,
      required: true
    },
    ticket_cost:{
      type: Number
    },
    seatNumber: [{
      type: Number,
      required: true,
    }],
    time:{
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
  });
  
module.exports = Ticket = mongoose.model('tickets', TicketSchema)