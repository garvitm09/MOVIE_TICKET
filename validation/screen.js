const Validator = require('validator');
const isEmpty = require('./is_empty');

module.exports = function validateScreennput(data){
    let errors = {};
    data.screen = !isEmpty(data.screen) ? data.screen: '';
    data.timeslots = !isEmpty(data.timeslots) ? data.timeslots: [];
    data.seats = !isEmpty(data.seats) ? data.seats: 0;

    if(Validator.isEmpty(data.screen)){
        errors.screen = 'Screen field is required';
    }
    if(Validator.isEmpty(data.title)){
        errors.title = 'Title field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};