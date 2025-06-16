const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      unique: true,
      sparse: true, 
    },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: {
      city: { type: String, required: true },
      district: { type: String, required: true },
      street: { type: String, required: true },
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        size: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    shippingCost: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    shippingMethod: { type: String, required: true },
    payment: {
      method: { type: String, required: true },
      cardName: { type: String },
      cardNumberLast4: { type: String },
      expiry: { type: String },
      phonepeNumber: { type: String },
      googlePayId: { type: String },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "cod"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

orderSchema.plugin(autopopulate);
const Order = mongoose.model("orders", orderSchema);

module.exports = Order;
