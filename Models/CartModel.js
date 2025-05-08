const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "products" },
  size: { type: String, required: true },
  price: { type: String, required: true },
  quantity: { type: Number, default: 1 },
});

const Cart = mongoose.model("carts", cartSchema);

module.exports = Cart;
