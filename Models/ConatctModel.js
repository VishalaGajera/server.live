const mongoose = require('mongoose');
const autopopulate = require("mongoose-autopopulate");

const contactSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
},
    { timestamps: true }
);
contactSchema.plugin(autopopulate);
module.exports = mongoose.model('Contact', contactSchema);