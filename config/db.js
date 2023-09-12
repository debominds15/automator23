const mongoose = require("mongoose");
require('dotenv').config()


// Make connection to MongoDB
const connectToMongoDB = async () => {
  try {
    mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/automator", {
        useNewUrlParser: true,
        //useCreateIndex: true,
      useUnifiedTopology: true
      /*useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,*/
    });

    console.log("Connected to MongoDB...");
  } catch (err) {
    console.error(err.message);
    // Terminate the application
    process.exit(1);
  }
};


module.exports = connectToMongoDB;