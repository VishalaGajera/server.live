const express = require("express");
const cartProductController = require("../Controllers/CartProductController");

const CartProductRouter = express.Router();

CartProductRouter.post("/insertData", cartProductController.addCartProduct);
CartProductRouter.get(
  "/fetchCartProduct/:userId",
  cartProductController.fetchCartProduct
);
CartProductRouter.put(
  "/updateData/:id",
  cartProductController.updateCartProduct
);
CartProductRouter.delete(
  "/getCartProduct/:id",
  cartProductController.deleteCartProduct
);
CartProductRouter.delete(
  "/getAllCartProduct/:id",
  cartProductController.deleteAllCartProduct
);

module.exports = CartProductRouter;
