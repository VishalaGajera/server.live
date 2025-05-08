const express = require("express");
const productController = require("../Controllers/ProductController");

const ProductRouter = express.Router();

ProductRouter.get("/getAllProducts", productController.getAllProducts);
ProductRouter.post("/insertData", productController.addProduct);
ProductRouter.put("/updateData/:id", productController.editProduct);
ProductRouter.put("/updateAllData", productController.editAllProduct);
ProductRouter.delete("/deleteData/:id", productController.deleteProduct);
ProductRouter.post("/cart", productController.addCartProduct);
ProductRouter.get("/cart/:userId", productController.fetchCartProduct);

module.exports = ProductRouter;
