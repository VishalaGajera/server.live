const express = require("express");
const router = express.Router();
const Order = require("../Models/Order.js");
const mongoose = require("mongoose");

// Middleware to verify user authentication (you should implement this)
const authenticateUser = (req, res, next) => {
  // Your authentication logic here
  // For now, assuming user is authenticated and user info is in req.user
  next();
};

// POST /order/create - Create a new order
router.post("/create", authenticateUser, async (req, res) => {
  try {
    const {
      userId,
      contact,
      shippingAddress,
      items,
      shippingCost,
      subtotal,
      total,
      payment,
    } = req.body;

    // Validation
    if (
      !userId ||
      !contact ||
      !shippingAddress ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate contact information
    if (!contact.email || !contact.phone) {
      return res.status(400).json({
        success: false,
        message: "Contact email and phone are required",
      });
    }

    // Validate shipping address
    const { firstName, lastName, city, district, street } = shippingAddress;
    if (!firstName || !lastName || !city || !district || !street) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    // Validate items
    for (const item of items) {
      if (
        !item.productId ||
        !item.name ||
        !item.size ||
        !item.quantity ||
        !item.price
      ) {
        return res.status(400).json({
          success: false,
          message: "All item fields are required",
        });
      }
    }

    // Validate payment method
    if (!payment || !payment.method) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    // Validate payment details based on method
    if (payment.method === "creditcard") {
      if (
        !payment.cardName ||
        !payment.cardNumber ||
        !payment.expiry ||
        !payment.cvv
      ) {
        return res.status(400).json({
          success: false,
          message: "Complete credit card information is required",
        });
      }
    } else if (payment.method === "phonepe") {
      if (!payment.phonepeNumber) {
        return res.status(400).json({
          success: false,
          message: "PhonePe number is required",
        });
      }
    } else if (payment.method === "googlepay") {
      if (!payment.googlePayId) {
        return res.status(400).json({
          success: false,
          message: "Google Pay ID is required",
        });
      }
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Calculate totals to verify (optional security check)
    const calculatedSubtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const calculatedTotal = calculatedSubtotal + (shippingCost || 0);

    // You might want to add a tolerance for floating point calculations
    if (
      Math.abs(calculatedSubtotal - subtotal) > 0.01 ||
      Math.abs(calculatedTotal - total) > 0.01
    ) {
      return res.status(400).json({
        success: false,
        message: "Price calculation mismatch",
      });
    }

    // Create new order
    const newOrder = new Order({
      userId,
      contact,
      shippingAddress,
      items,
      shippingCost: shippingCost || 0,
      subtotal,
      total,
      payment,
    });

    // Save order to database
    const savedOrder = await newOrder.save();

    // Populate product details if needed
    await savedOrder.populate("items.productId", "name price category");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: savedOrder._id,
        orderNumber: savedOrder.orderNumber,
        orderStatus: savedOrder.orderStatus,
        paymentStatus: savedOrder.paymentStatus,
        total: savedOrder.total,
        createdAt: savedOrder.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);

    // Handle specific mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    // Handle duplicate key error (for orderNumber)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Order number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while creating order",
    });
  }
});

// GET /order/:orderId - Get order by ID
router.get("/:orderId", authenticateUser, async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const order = await Order.findById(orderId)
      .populate("userId", "name email")
      .populate("items.productId", "name price category images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching order",
    });
  }
});

// GET /order/user/:userId - Get orders by user ID
router.get("/user/:userId", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const query = { userId };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate("items.productId", "name price category images")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNextPage: page < Math.ceil(totalOrders / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching orders",
    });
  }
});

// PUT /order/:orderId/status - Update order status
router.put("/:orderId/status", authenticateUser, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating order status",
    });
  }
});

module.exports = router;
