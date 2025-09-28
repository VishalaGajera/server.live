const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['verified', 'unverified'], 
    default: 'unverified' 
  },
  otp: { type: String },
  otpExpiration: { type: Date },
  otpAttempts: { type: Number, default: 0 }
});
userSchema.plugin(autopopulate);
module.exports = mongoose.model("users", userSchema);
