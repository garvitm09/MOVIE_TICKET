const Validator = require('validator');
const isEmpty = require('./is_empty');

module.exports = function validateLoginInput(data){
    let errors = {};
    data.email = !isEmpty(data.email) ? data.email: '';
    data.password = !isEmpty(data.password) ? data.password: '';
    
    if(Validator.isEmpty(data.email)){
        errors.email_empty = 'Email is required';
    }
    if(!Validator.isEmail(data.email)){
        errors.email_invalid = 'Email is invalid';
    }
    if(Validator.isEmpty(data.password)){
        errors.password_empty = 'Password field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};