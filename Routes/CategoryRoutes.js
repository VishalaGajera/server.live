const express = require("express");
const categoryController = require("../Controllers/CategoryController");

const CategoryRouter = express.Router();

CategoryRouter.get("/getAllCategory", categoryController.getAllCategorys);
CategoryRouter.get("/getCategory", categoryController.getCategorys);
CategoryRouter.post("/insertData", categoryController.addCategory);
CategoryRouter.put("/updateData/:id", categoryController.editCategory);
CategoryRouter.delete("/deleteData/:id", categoryController.deleteCategory);

module.exports = CategoryRouter;
