const express = require("express");
const productController = require("../Controllers/ProductController");

const ProductRouter = express.Router();

ProductRouter.get("/getAllProducts", productController.getAllProducts);
ProductRouter.post("/insertData", productController.addProduct);
// ProductRouter.post("/login", adminController.loginAdmin);
// ProductRouter.get("/fetchData/:id", adminController.getAdminById);
ProductRouter.put("/updateData/:id", productController.editProduct);
// ProductRouter.delete("/deleteData/:id", adminController.deleteAdmin);

module.exports = ProductRouter;
