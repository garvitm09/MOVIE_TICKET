const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScreenSchema = new Schema({
    screen :{
        type: String,
        required: true
    },
    timeslot: {
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    seats: {
        type: Number,
        required: true
    },
    booked_seats:[{
        type: String
    }],
    title:{
        type: String,
        required: true
    },
    movie: {
        type: mongoose.Types.ObjectId,
        ref: 'movies',
        required: true
    },
    revenue_screen: {
        type: Number
    },
    admin: {
        type: mongoose.Types.ObjectId,
        ref: 'admin',
        required: true
    },
    booking: [
        { type: mongoose.Types.ObjectId,
            ref: "tickets" }    
    ],
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = Screen = mongoose.model('screens', ScreenSchema)