const express = require("express");
const orderController = require("../Controllers/OrderController");

const OrderRouter = express.Router();

OrderRouter.post("/insertData", orderController.createOrder);
// OrderRouter.post("/insertData", orderController.addProduct);
// OrderRouter.put("/updateData/:id", orderController.editProduct);
// OrderRouter.put("/updateAllData", orderController.editAllProduct);
// OrderRouter.delete("/deleteData/:id", orderController.deleteProduct);
// OrderRouter.post("/cart", orderController.addCartProduct);
// OrderRouter.get("/cart/:userId", orderController.fetchCartProduct);

module.exports = OrderRouter;
