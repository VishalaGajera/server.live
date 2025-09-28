const express = require("express");
const cartProductController = require("../Controllers/CartProductController");

const CartProductRouter = express.Router();

CartProductRouter.post("/insertData", cartProductController.addCartProduct);
CartProductRouter.get(
  "/fetchCartProduct/:userId",
  cartProductController.fetchCartProduct
);
CartProductRouter.patch(
  "/updateData/:id",
  cartProductController.updateCartProduct
);
CartProductRouter.delete(
  "/deleteCartProduct/:id",
  cartProductController.deleteCartProduct
);
CartProductRouter.delete(
  "/deleteAllCartProduct/:id",
  cartProductController.deleteAllCartProduct
);

module.exports = CartProductRouter;
