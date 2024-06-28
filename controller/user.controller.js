const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const xlsx = require('xlsx');

//Load input validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

//Load User model
const User = require("../models/User");
const Ticket = require("../models/Tickets");

exports.test = (req, res) => {
  res.json({ msg: "User works" });
};

exports.register = (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  //Check Validation
  if (!isValid) {
    return res.status(404).json(errors);
  }
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
      });
      // bcrypt.hash(newUser.password, 12) Can be done in this way too but below one is more secure
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => {
              res.json(user);
            })
            .catch((err) => {
              console.log(err);
            });
        });
      });
    }
  });
};

exports.login = (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  //Check Validation
  if (!isValid) {
    return res.status(404).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  //Find user by email
  User.findOne({ email }).then((user) => {
    //Check
    if (!user) {
      errors.email = "user not found";
      return res.status(404).json(errors);
    }

    //Check Password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        //user matched
        const payload = {
          id: user.id,
          name: user.name,
        };

        //sign the token
        jwt.sign(
          payload,
          process.env.secretOrKey,
          { expiresIn: 1000000 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        errors.password = "Password incoorect";
        return res.status(404).json(errors);
      }
    });
  });
};

exports.current = async (req, res) => {
  try{const userid = req.userId;
  existingUser = await User.findById(userid);

  for(i = 0 ; i<existingUser.bookings.length ; i++){
    if (existingUser.bookings){
      await Ticket.findById(existingUser.bookings[i])
        .then(book => {
          obj = {
            name: existingUser.name,
            email: existingUser.email,
            title: book.title,
            screen_name: book.screen_name,
            seatNumber: book.seatNumber,
            time: book.time,
            seats: book.ticket_len,
            ticket_cost: book.ticket_cost
          }
        })
      } else{
        obj={ 
          name: existingUser.name,
          email: existingUser.email,
          bookings: []
        }
      }
    }
    
  return res.status(200).json(obj)
  }catch{(err) => res.status(404).json({ message: `${err.message}` })};
};

exports.getusers = (req, res) => {
  User.find()
    .then((user) => res.json(user))
    .catch((err) => res.status(404).json({ nouserfound: "No users found" }));
};


exports.booking = async (req,res) => {
  const existingUser = await User.findById(req.userId);
  const array = []
  for(const ele of existingUser.bookings){
  const booking = await Ticket.find(ele);
  array.push(booking)
  }
  if (!existingUser){
    return res.json({ nouserfound: "No user found" });
  } 
  if(existingUser.bookings.length === 0){
    return res.json({nobookings: "No bookings for you"})
  }
  return res.json(array)
} 

exports.exportToExcel = async (req,res) => {

  try {
    const data = await User.find({}, {name: 1, email: 1, _id: 0, bookings:1});
    result = [];
    console.log(data)
    // console.log(data[0].bookings[0])
    // console.log(existingBoooking.title)
    // return res.json(data[0].bookings[0].toString())
    for(j = 0; j < data.length; j++) {
      if(data[j].bookings.length === 0){
        obj = {
          name: data[j].name,
          email: data[j].email,
          movie: "",
          seats: "",
          price: "",
          timeslot: ""
        }
        result.push(obj)
      } else{
        for(i = 0; i < data[j].bookings.length; i++){
          await Ticket.findById(data[j].bookings[i])
            .then(existingBooking => {
              console.log(data[j].bookings[i])
              console.log(existingBooking.title)
              seating = existingBooking.seatNumber.join(',')
              movie_name = existingBooking.title,
              cost = existingBooking.ticket_cost,
              time_slot = existingBooking.time
              obj = {
                name: data[j].name,
                email: data[j].email,
                movie: movie_name,
                seats: seating,
                price: cost,
                timeslot: time_slot
          }
          result.push(obj)          
        })
      }
      }
    }
    
    console.log('Data fetched from MongoDB:', data);
    const ans = JSON.parse(JSON.stringify(result));
    // Convert the data to a worksheet
    const worksheet = xlsx.utils.json_to_sheet(ans);

    // Create a new workbook and append the worksheet
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet2');

    // Write the workbook to a file
    xlsx.writeFile(workbook, "Users.xlsx");
    console.log('Data exported to Excel file successfully');
    return res.status(200).json(ans);  

  } catch (error) {
    console.error('Error connecting to MongoDB or exporting data:', error);
  } 
  return res.json(result)
}