const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require('passport');
const xlsx = require('xlsx');


const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');


const Admin = require("../models/Admin");

exports.test = (req, res) => {
  res.json({ msg: "Admin works" });
};


exports.register = (req, res) => {
  const {errors, isValid} = validateRegisterInput(req.body);
  
  //Check Validation
  if(!isValid){
    return res.status(404).json(errors);
  }
  Admin.findOne({ email: req.body.email }).then((admin) => {
    if (admin) {
      errors.email = 'Email already exists'
      return res.status(400).json(errors);
    } else {
      const newAdmin = new Admin({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      // bcrypt.hash(newAdmin.password, 12) Can be done in this way too but below one is more secure
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newAdmin.password, salt, (err, hash) => {
          if (err) throw err;
          newAdmin.password = hash;
          newAdmin
            .save()
            .then((admin) => {
              res.json(admin);
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
  const {errors, isValid} = validateLoginInput(req.body);
  
  //Check Validation
  if(!isValid){
    return res.status(404).json(errors);
  }
    const email = req.body.email;
    const password = req.body.password;

    //Find admin by email
    Admin.findOne({email})
        .then(admin => {
            //Check
            if(!admin){
              errors.email = 'admin not found';
                return res.status(404).json(errors)
            }

            //Check Password
            bcrypt.compare(password, admin.password)
                .then(isMatch =>{
                    if(isMatch){
                      //admin matched
                        const payload = {
                            id: admin.id,
                            name: admin.name
                        }

                      //sign the token
                      jwt.sign(payload,process.env.secretOrKey, {expiresIn: 1000000}, (err,token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        })
                      });
                    }
                    else{
                      errors.password = "Password incoorect"
                        return res.status(404).json(errors)
                    }
                })
        })
}


exports.current = (req, res) => {
  const adminid = req.userId;
  Admin.findById(adminid)
    .then(admin =>{
      res.json({
        id: admin.id,
        name: admin.name,
        email: admin.email
    })    
  })
  .catch(err => res.status(404).json({message: `${err.message}`}))  
}

exports.getadmins = (req, res) =>{
  Admin.find()
    .then(admin => res.json(admin))
    .catch(err => res.status(404).json({noadminfound: 'No admins found'})) 
}

exports.getallbookings = (req, res) => {
  Ticket.find()
  .then(tickets => res.json(tickets))
  .catch(err => res.status(404).json({noticketfound: 'No bookings yet'}))
}

exports.getDate = (req, res) => {
  Admin.findById(req.userId)
    .then(admin =>{
      res.json(admin.date.getDate());
    }).catch(err =>{
      message: err.message
    });
};


exports.exportToExcel = async (req,res) => {

  try {

    
    const data = await Admin.find({}, {name: 1, email: 1, _id: 0, screen:1});
    result = [];
    for(j = 0; j < data.length; j++) {
      if(data[j].screen.length === 0){
        obj = {
          name: data[j].name,
          email: data[j].email,
          screen:"",
          movie: "",
          ticket: "",
          timeslot: ""
        }
        result.push(obj)
      } else{
      for(i = 0; i < data[j].screen.length; i++){
        screen_name = data[j].screen[i].screen_name,
        movie_name = data[j].screen[i].movie,
        price = data[j].screen[i].ticket,
        time = data[j].screen[i].time_slot
        obj = {
          name: data[j].name,
          email: data[j].email,
          screen: screen_name,
          movie: movie_name,
          timslot: time,
          ticket: price
        }
        result.push(obj)
      }
    }
    }
    console.log('Data fetched from MongoDB:', data);
    const ans = JSON.parse(JSON.stringify(result));
    // Convert the data to a worksheet
    const worksheet = xlsx.utils.json_to_sheet(ans);

    // Create a new workbook and append the worksheet
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write the workbook to a file
    xlsx.writeFile(workbook, "Admins.xlsx");
    console.log('Data exported to Excel file successfully');
    return res.status(200).json(ans);  

  } catch (error) {
    console.error('Error connecting to MongoDB or exporting data:', error);
  } 
}