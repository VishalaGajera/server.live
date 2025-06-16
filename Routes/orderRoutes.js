const express = require("express");
const orderController = require("../Controllers/OrderController");

const OrderRouter = express.Router();

OrderRouter.post("/insertData", orderController.createOrder);

module.exports = OrderRouter;
