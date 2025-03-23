const path = require("path");
const Product = require("../Models/ProductSchema");

exports.addProduct = async (req, res) => {
  try {
    const { image, name, description, category, price_per_lb, sizes, rating } =
      req.body;

    if (
      !image ||
      !name ||
      !description ||
      !category ||
      !price_per_lb ||
      !sizes
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newProduct = new Product({
      image,
      name,
      description,
      category,
      price_per_lb: parseFloat(price_per_lb),
      sizes,
      rating: parseInt(rating) || 5,
    });

    // Save to the database
    await newProduct.save();

    // Respond with success message
    res.status(201).json({ message: "Product added successfully!" });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

exports.getAllProducts = async (req, res) => {
  //aa api postman ma open kar
  try {
    const page = parseInt(req.query.page) || 1; // ker have
    const pageSize = parseInt(req.query.limit) || 12;
    const category = req.query.category

    const skip = (page - 1) * pageSize;

    const products = await Product.find({ isDelete: false  , ...(category ? {category : category } : {})})
      .skip(skip)
      .limit(pageSize || 10);

    const allProduct = await Product.find({ isDelete: false , ...(category ? {category : category } : {})});

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found." });
    }

    res.status(200).json({
      products,
      metadata: {
        totalcount: allProduct.length,
        totalpages:  Math.ceil(allProduct.length / pageSize),
        page: page || 1,
        count: products.length,
      },
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

exports.editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { image, name, description, category, price_per_lb, sizes, rating } =
      req.body;

    if (
      !image ||
      !name ||
      !description ||
      !category ||
      !price_per_lb ||
      !sizes
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        image,
        name,
        description,
        category,
        price_per_lb,
        sizes,
        rating: parseInt(rating) || 5,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json({
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("Error editing product:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(401).json({ message: "Product not found" });
    }

    product.isDelete = true;
    await product.save();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.editAllProduct = async (req, res) => {
  console.log("called...");
  try {
    const updatedProduct = await Product.updateMany(
      {category:'Beans & Lentils'},
      { category: 'Beans_Lentils' },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json({
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("Error editing product:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
