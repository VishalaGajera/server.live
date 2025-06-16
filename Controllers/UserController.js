const path = require("path");
const mongoose = require("mongoose");
const User = require("../Models/AuthModel");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

exports.addUser = async (req, res) => {
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

    const newUser = new User({
      image,
      name,
      description,
      categoryId: new mongoose.Types.ObjectId(categoryId),
      price_per_lb: parseFloat(price_per_lb),
      sizes,
      rating: parseInt(rating) || 5,
    });

    await newUser.save();

    res
      .status(201)
      .json({ message: "User added successfully!", product: newUser });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// exports.getAllUsers = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const pageSize = parseInt(req.query.limit) || 12;
//     const categoryId = req.query.categoryId;

//     const filter = { isDelete: false };
//     if (categoryId) {
//       filter.categoryId = new mongoose.Types.ObjectId(categoryId);
//     }

//     const skip = (page - 1) * pageSize;

//     const products = await User.find(filter)
//       .skip(skip)
//       .limit(pageSize);

//     const totalUsers = await User.countDocuments(filter);

//     if (!products || products.length === 0) {
//       return res.status(404).json({ message: "No products found." });
//     }

//     res.status(200).json({
//       products,
//       metadata: {
//         totalcount: totalUsers,
//         totalpages: Math.ceil(totalUsers / pageSize),
//         page,
//         count: products.length,
//       },
//     });
//   } catch (err) {
//     console.error("Error fetching products:", err);
//     res.status(500).json({ message: "Server error. Please try again later." });
//   }
// };

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 12;
    const categoryId = req.query.categoryId;

    const skip = (page - 1) * pageSize;

    const filter = categoryId !== "all" ? { categoryId, isDelete: false } : {};

    // Query the products
    const products = await User.find(filter).skip(skip).limit(pageSize);

    const totalUsers = await User.countDocuments(filter);

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found." });
    }

    res.status(200).json({
      products,
      metadata: {
        totalcount: totalUsers,
        totalpages: Math.ceil(totalUsers / pageSize),
        page,
        count: products.length,
      },
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

exports.editUser = async (req, res) => {
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

    const updatedUser = await User.findByIdAndUpdate(
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

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "User updated successfully!",
      product: updatedUser,
    });
  } catch (err) {
    console.error("Error editing product:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await User.findById(id);
    if (!product) {
      return res.status(404).json({ message: "User not found." });
    }

    product.isDelete = true;
    await product.save();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.editAllUser = async (req, res) => {
  try {
    const { oldCategoryId, newCategoryId } = req.body;

    if (!oldCategoryId || !newCategoryId) {
      return res
        .status(400)
        .json({ message: "Both old and new category IDs are required." });
    }

    const updatedUsers = await User.updateMany(
      { categoryId: new mongoose.Types.ObjectId(oldCategoryId) },
      { categoryId: new mongoose.Types.ObjectId(newCategoryId) },
      { new: true }
    );

    if (updatedUsers.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No products found for the given category." });
    }

    res.status(200).json({
      message: "Users updated successfully!",
      updatedCount: updatedUsers.modifiedCount,
    });
  } catch (err) {
    console.error("Error editing products:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

exports.addCartUser = async (req, res) => {
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

exports.fetchCartUser = async (req, res) => {
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
