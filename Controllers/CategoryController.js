const Category = require("../Models/CategoryModel");

// Create Category
exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read All Categories  
exports.getAllCategorys = async (req, res) => {
  try {
    const categories = await Category.find({ isDelete: false });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read Single Category
exports.getCategorys = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category || category.isDelete) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Category
exports.editCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: name },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res
      .status(201)
      .json({ message: "Category Update successfully", category: category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Soft Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isDelete: true },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
