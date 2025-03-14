const mongoose = require('mongoose');

// Define the main product schema
const productSchema = new mongoose.Schema({
    image: { type: String, required: true },   // e.g., "/Images/Flours/Sher_Corn_Flour_4lb.png"
    name: { type: String, required: true },    // e.g., "Sher Corn Flour"
    description: { type: String, required: true }, // e.g., product description
    category: { type: String, required: true },    // e.g., "Flours"
    price_per_lb: { type: Number, required: true }, // e.g., 1.37
    sizes: {
        type: Map,
        of: Number,  // Dynamic keys with numerical values (e.g., "4LB": 5.49)
        required: true
    },
    rating: { type: Number, min: 0, max: 5, required: true } // e.g., 5
});

// Create the Product model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;