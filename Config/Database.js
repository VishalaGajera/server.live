const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    await mongoose.connect("mongodb+srv://vishalagajera:r7WDhUhDDLqaoFP1@cluster0.rqw5i.mongodb.net/ECommerce?retryWrites=true&w=majority");
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDatabase;
