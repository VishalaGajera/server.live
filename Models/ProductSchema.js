const mongoose = require("mongoose");

// Define the main product schema
const productSchema = new mongoose.Schema({
  image: { type: String, required: true },
  name: { type: String, required: true }, 
  description: { type: String, required: true },
  category: { type: String, required: true }, 
  price_per_lb: { type: Number, required: true },
  sizes: {
    type: Map,
    of: Number,
    required: true,
  },
  rating: { type: Number, min: 0, max: 5, required: true },
  isDelete: { type: Boolean, default: false }
});

// Create the Product model
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
