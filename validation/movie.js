const Validator = require('validator');
const isEmpty = require('./is_empty');

module.exports = function validateMovieInput(data){
    let errors = {};
    data.title = !isEmpty(data.title) ? data.title: '';
    data.description = !isEmpty(data.description) ? data.description: '';
    data.genre = !isEmpty(data.genre) ? data.genre: '';
    data.timeslots = !isEmpty(data.timeslots) ? data.timeslots: [];
    data.rating = !isEmpty(data.rating) ? data.rating: '';
    data.date = !isEmpty(data.date) ? data.date: '';
    
    if(Validator.isEmpty(data.title)){
        errors.title = 'Title field is required';
    }
    if(Validator.isEmpty(data.description)){
        errors.description = 'Description field is required';
    }
    if(Validator.isEmpty(data.genre)){
        errors.genre = 'Genre field is required';
    }
    // if(Validator.isEmpty(data.timeslots)){
    //     errors.timeslots = 'Timeslots field is required';
    // }
    // if(Validator.isEmpty(data.screen)){
    //     errors.screen = 'Screen field is required';
    // }
    if(Validator.isEmpty(data.rating)){
        errors.rating = 'Rating field is required';
    }
    // if(Validator.isEmpty(data.date)){
    //     errors.date = 'Date field is required';
    // }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};