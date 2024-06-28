const mongoose = require('mongoose');

const connectToMongoDB = async () => {
  await mongoose.connect("mongodb+srv://garvitbkn10:garvit@garvitm09.cm9avcf.mongodb.net/bookings", {});
  console.log("Connected to MongoDB");
}

module.exports = connectToMongoDB;