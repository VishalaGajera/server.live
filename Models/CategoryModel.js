const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  isDelete: { type: Boolean, default: false },
});

const Category = mongoose.model("categories", categorySchema);

module.exports = Category;


