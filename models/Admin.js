const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create schema
const AdminSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone:{
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    revenue_admin:{
        type: Number,
    },
    screen: [{
            screen_name:{type: String},
            movie:{type: String},
            ticket:{type: String}
            }],
    movie:[{type: String}],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Admin = mongoose.model('admin', AdminSchema);