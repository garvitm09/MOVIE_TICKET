const Admin = require("../models/Admin");
const Screen = require("../models/Screen");
const Movie = require("../models/Movie");
const Ticket = require("../models/Tickets");
const mongoose = require("mongoose");
const xlsx = require("xlsx");

const validateScreenInput = require("../validation/screen");

exports.addScreen = async (req, res, next) => {
  const { errors, isValid } = validateScreenInput(req.body);
  if (!isValid) {
    //Check errors
    return res.status(404).json(errors);
  }
  let existingAdmin;
  let existingMovie;
  let existingScreen
  try{
  existingAdmin = await Admin.findById({ _id: req.userId });
  existingMovie = await Movie.findOne({title: req.body.title});
  existingScreen = await Screen.findOne({ screen: req.body.screen });
  
}catch(err){
    return res.json({message: err.message})
}

  if(!existingMovie){
    return res.status(404).json({message: "No such movie is available"})
  }

  const screens = await Screen.find({screen: req.body.screen})
  timeslots = [];
  for (i = 0; i < screens.length; i++){
    timeslots.push(screens[i].timeslot)
  }
  
  const result = timeslots.includes(req.body.timeslot)
  if (existingScreen && result === true ){
    return res.json({message: "There's a movie on this slot"})
  }
  
  let newScreen;
  try {
      newScreen = new Screen({
          screen: req.body.screen,
          timeslot: req.body.timeslot,
          seats: req.body.seats,
          title: req.body.title,
          price: req.body.price,
          admin: existingAdmin.id,
          movie: existingMovie.id,
        });
        const adminscreen = {
          screen_name: req.body.screen,
          movie: req.body.title,
          // ticket: req.body.price,
          time_slot: req.body.timeslot
        }
        
        const session = await mongoose.startSession();
        session.startTransaction();
        existingAdmin.screen.push(adminscreen);
        await existingAdmin.save({session});
        await newScreen.save({session});
        session.commitTransaction();
      } catch(err){
          return res.status(400).json({message: err.message});
        }
        if(!newScreen){
            return res.satus(500).json({ message: "Unable to create a Session"})
          }
    return res.status(200).json(newScreen);
  };
        

  exports.deleteScreen = async (req, res) => {

  let existingAdmin;
  let existingScreen;
  try {
    existingAdmin = await Admin.findById(req.userId);
    existingScreen = await Screen.findOne({screen: req.body.screen});
  } catch (err) {
    return res.satus(500).json({message: err.message});
  }  if (!existingAdmin) {
    return res.status(404).json({ message: "Admin Not Found With Given ID" });
  } if(!existingScreen){
    return res.json({message: "Screen doesn't exist"});
  }
  try{
    for(i = 0; i < existingAdmin.screen.length; i++){
      if(existingAdmin.screen[i].screen_name === req.body.screen){
        existingAdmin.screen.splice(i,1)
      }
    }
  
    await existingScreen.deleteOne();
    const session = await mongoose.startSession();
    session.startTransaction();
    existingAdmin.save({session});  
    session.commitTransaction();
  }catch(err){
    return res.status(500).json({ message: err.message });
  }
  return res.status(200).json({success: true})
};


exports.getallscreens = (req, res) => {
  Screen.find()
    .then((screen) => res.status(200).json(screen))
    .catch((err) =>
      res.status(404).json({ noscreenfound: "No screens currently available" })
    );
};


exports.screenrevenue = async (req,res) => {
  let existingAdmin;
  let existingScreen;
  try{
    existingAdmin = await Admin.findById({_id: req.userId}) 
    existingScreen = await Screen.find({screen: req.body.screen});
    
    
  }catch(err){
    return res.status(500).json({message: err.message});
  }
  if(!existingAdmin){
    return res.status(404).json({message: "Admin not authorized"} )
  }
  if(!existingScreen){
    return res.status(404).json({message: "Screen not found"});
  }
  // if(!existingTickets){
  //   return res.status(404).json({message: "No tickets booked"} )
  // }

  array = [];
  revenue = 0;
  for (i = 0; i < existingScreen.length; i++){
    revenue += existingScreen[i].booked_seats.length * existingScreen[i].price 
  }
  
  return res.json({total_revenue: revenue})
}


exports.revenuebydate = async (req,res) => {
  // let existingAdmin;
  let existingScreen;
  let existingTickets;
  try{
    // existingAdmin = await Admin.findById({_id: req.userId}) 
    existingScreen = await Screen.find({screen: req.body.screen});
    existingTickets = await Ticket.find({screen_name: req.body.screen})
    
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


exports.exportToExcel = async (req,res) => {
  
  try {
    const data = await Screen.find({}, {screen: 1, timeslot: 1, _id: 0, price:1, title: 1, seats: 1, booked_seats:1});
    
    result = [];
    for(i = 0; i < data.length; i++){
      booked_ = data[i].booked_seats.join(',');
      rev = data[i].price * data[i].booked_seats.length;
      obj = {
        screen: data[i].screen,
        title: data[i].title,
        timeslot: data[i].timeslot,
        aval_seats: data[i].seats,
        booked: booked_,
        revenue: rev
      }
      result.push(obj)
    }

    
    console.log('Data fetched from MongoDB:', data);
    const ans = JSON.parse(JSON.stringify(result));
    // Convert the data to a worksheet
    const worksheet = xlsx.utils.json_to_sheet(ans);

    // Create a new workbook and append the worksheet
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet3');

    // Write the workbook to a file
    xlsx.writeFile(workbook, "Screen.xlsx");
    console.log('Data exported to Excel file successfully');
    return res.status(200).json(ans);  

  } catch (error) {
    console.error('Error connecting to MongoDB or exporting data:', error);
  } 

}