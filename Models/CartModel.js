const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", autopopulate: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "products", autopopulate: true },
  size: { type: String, required: true },
  price: { type: String, required: true },
  quantity: { type: Number, default: 1 },
});

cartSchema.plugin(autopopulate);

const Cart = mongoose.model("carts", cartSchema);

module.exports = Cart;
