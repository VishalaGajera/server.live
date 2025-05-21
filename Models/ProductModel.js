const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

// Define the main product schema
const productSchema = new mongoose.Schema({
  image: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categories",
    autopopulate: true,
    required: true,
  },
  price_per_lb: { type: Number, required: true },
  sizes: {
    type: Map,
    of: Number,
    required: true,
  },
  rating: { type: Number, min: 0, max: 5, required: true },
  isDelete: { type: Boolean, default: false },
});

productSchema.plugin(autopopulate);
const Product = mongoose.model("products", productSchema);

module.exports = Product;
