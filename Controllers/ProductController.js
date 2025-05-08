// const path = require("path");
// const Product = require("../Models/ProductSchema");

// exports.addProduct = async (req, res) => {
//   try {
//     const { image, name, description, category, price_per_lb, sizes, rating } =
//       req.body;

//     if (
//       !image ||
//       !name ||
//       !description ||
//       !category ||
//       !price_per_lb ||
//       !sizes
//     ) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     const newProduct = new Product({
//       image,
//       name,
//       description,
//       category,
//       price_per_lb: parseFloat(price_per_lb),
//       sizes,
//       rating: parseInt(rating) || 5,
//     });

//     // Save to the database
//     await newProduct.save();

//     // Respond with success message
//     res.status(201).json({ message: "Product added successfully!" });
//   } catch (err) {
//     console.error("Error adding product:", err);
//     res.status(500).json({ message: "Server error. Please try again later." });
//   }
// };

// exports.getAllProducts = async (req, res) => {
//   //aa api postman ma open kar
//   try {
//     const page = parseInt(req.query.page) || 1; // ker have
//     const pageSize = parseInt(req.query.limit) || 12;
//     const category = req.query.category

//     const skip = (page - 1) * pageSize;

//     const products = await Product.find({ isDelete: false  , ...(category ? {category : category } : {})})
//       .skip(skip)
//       .limit(pageSize || 10);

//     const allProduct = await Product.find({ isDelete: false , ...(category ? {category : category } : {})});

//     if (!products || products.length === 0) {
//       return res.status(404).json({ message: "No products found." });
//     }

//     res.status(200).json({
//       products,
//       metadata: {
//         totalcount: allProduct.length,
//         totalpages:  Math.ceil(allProduct.length / pageSize),
//         page: page || 1,
//         count: products.length,
//       },
//     });
//   } catch (err) {
//     console.error("Error fetching products:", err);
//     res.status(500).json({ message: "Server error. Please try again later." });
//   }
// };

// exports.editProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { image, name, description, category, price_per_lb, sizes, rating } =
//       req.body;

//     if (
//       !image ||
//       !name ||
//       !description ||
//       !category ||
//       !price_per_lb ||
//       !sizes
//     ) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     const updatedProduct = await Product.findByIdAndUpdate(
//       id,
//       {
//         image,
//         name,
//         description,
//         category,
//         price_per_lb,
//         sizes,
//         rating: parseInt(rating) || 5,
//       },
//       { new: true }
//     );

//     if (!updatedProduct) {
//       return res.status(404).json({ message: "Product not found." });
//     }

//     res.status(200).json({
//       message: "Product updated successfully!",
//       product: updatedProduct,
//     });
//   } catch (err) {
//     console.error("Error editing product:", err);
//     res.status(500).json({ message: "Server error. Please try again later." });
//   }
// };

// exports.deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(401).json({ message: "Product not found" });
//     }

//     product.isDelete = true;
//     await product.save();

//     res.status(200).json({ message: "Product deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// exports.editAllProduct = async (req, res) => {
//   console.log("called...");
//   try {
//     const updatedProduct = await Product.updateMany(
//       {category:'Beans & Lentils'},
//       { category: 'Beans_Lentils' },
//       { new: true }
//     );

//     if (!updatedProduct) {
//       return res.status(404).json({ message: "Product not found." });
//     }

//     res.status(200).json({
//       message: "Product updated successfully!",
//       product: updatedProduct,
//     });
//   } catch (err) {
//     console.error("Error editing product:", err);
//     res.status(500).json({ message: "Server error. Please try again later." });
//   }
// };

const path = require("path");
const mongoose = require("mongoose");
const Product = require("../Models/ProductSchema");

exports.addProduct = async (req, res) => {
  try {
    const {
      image,
      name,
      description,
      categoryId,
      price_per_lb,
      sizes,
      rating,
    } = req.body;

    if (
      !image ||
      !name ||
      !description ||
      !categoryId ||
      !price_per_lb ||
      !sizes
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newProduct = new Product({
      image,
      name,
      description,
      categoryId: new mongoose.Types.ObjectId(categoryId),
      price_per_lb: parseFloat(price_per_lb),
      sizes,
      rating: parseInt(rating) || 5,
    });

    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product added successfully!", product: newProduct });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// exports.getAllProducts = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const pageSize = parseInt(req.query.limit) || 12;
//     const categoryId = req.query.categoryId;

//     const filter = { isDelete: false };
//     if (categoryId) {
//       filter.categoryId = new mongoose.Types.ObjectId(categoryId);
//     }

//     const skip = (page - 1) * pageSize;

//     const products = await Product.find(filter)
//       .skip(skip)
//       .limit(pageSize);

//     const totalProducts = await Product.countDocuments(filter);

//     if (!products || products.length === 0) {
//       return res.status(404).json({ message: "No products found." });
//     }

//     res.status(200).json({
//       products,
//       metadata: {
//         totalcount: totalProducts,
//         totalpages: Math.ceil(totalProducts / pageSize),
//         page,
//         count: products.length,
//       },
//     });
//   } catch (err) {
//     console.error("Error fetching products:", err);
//     res.status(500).json({ message: "Server error. Please try again later." });
//   }
// };

exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 12;
    const categoryId = req.query.categoryId;

    const skip = (page - 1) * pageSize;

    const filter = categoryId !== "all" ? { categoryId, isDelete: false } : {};

    // Query the products
    const products = await Product.find(filter).skip(skip).limit(pageSize);

    const totalProducts = await Product.countDocuments(filter);

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found." });
    }

    res.status(200).json({
      products,
      metadata: {
        totalcount: totalProducts,
        totalpages: Math.ceil(totalProducts / pageSize),
        page,
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
    const {
      image,
      name,
      description,
      categoryId,
      price_per_lb,
      sizes,
      rating,
    } = req.body;

    if (
      !image ||
      !name ||
      !description ||
      !categoryId ||
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
        categoryId: new mongoose.Types.ObjectId(categoryId),
        price_per_lb: parseFloat(price_per_lb),
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
      return res.status(404).json({ message: "Product not found." });
    }

    product.isDelete = true;
    await product.save();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.editAllProduct = async (req, res) => {
  try {
    const { oldCategoryId, newCategoryId } = req.body;

    if (!oldCategoryId || !newCategoryId) {
      return res
        .status(400)
        .json({ message: "Both old and new category IDs are required." });
    }

    const updatedProducts = await Product.updateMany(
      { categoryId: new mongoose.Types.ObjectId(oldCategoryId) },
      { categoryId: new mongoose.Types.ObjectId(newCategoryId) },
      { new: true }
    );

    if (updatedProducts.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No products found for the given category." });
    }

    res.status(200).json({
      message: "Products updated successfully!",
      updatedCount: updatedProducts.modifiedCount,
    });
  } catch (err) {
    console.error("Error editing products:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

exports.addCartProduct = async (req, res) => {
  const { userId, productId, size, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.size === size
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, size, quantity });
    }

    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.fetchCartProduct = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate(
      "items.productId"
    );
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    res.status(200).json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
