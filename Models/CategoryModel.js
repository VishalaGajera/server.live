const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  isDelete: { type: Boolean, default: false },
});
categorySchema.plugin(autopopulate);
const Category = mongoose.model("categories", categorySchema);

module.exports = Category;


