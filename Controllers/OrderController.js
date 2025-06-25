const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../Models/OrderModel");
const { SendMailToApplicient } = require("../mailServices");

function generateOrderId() {
  const randomNumber = Math.floor(100000000 + Math.random() * 900000000); // 9-digit number
  return `ORD${randomNumber}`;
}

exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      email,
      phone,
      firstName,
      lastName,
      city,
      district,
      street,
      items,
      shippingCost,
      subtotal,
      total,
      shippingMethod,
      payment,
    } = req.body;

    // Basic validation
    if (
      !userId ||
      !email ||
      !phone ||
      !firstName ||
      !lastName ||
      !city ||
      !district ||
      !street ||
      !items?.length ||
      !shippingCost ||
      !subtotal ||
      !total ||
      !shippingMethod ||
      !payment?.method
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Set paymentStatus dynamically
    let paymentStatus = "pending";
    if (payment.method === "cod") {
      paymentStatus = "cod";
    }

    const orderId = generateOrderId();

    const order = new Order({
      userId,
      orderId,
      email,
      phone,
      firstName,
      lastName,
      address: {
        city,
        district,
        street,
      },
      items,
      shippingCost,
      subtotal,
      total,
      shippingMethod,
      payment,
      paymentStatus,
      orderStatus: "pending", // default
    });

    const savedOrder = await order.save();

    const to = email;
    const subject = "🛒 Order Confirmation - CC Traders";
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .order-id {
            background-color: #e8f5e8;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            margin: 20px 0;
            border-left: 4px solid #27ae60;
        }
        .section {
            margin: 25px 0;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 5px;
        }
        .item-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .item-table th,
        .item-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        .item-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .total-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
        }
        .total-final {
            font-weight: bold;
            font-size: 18px;
            color: #27ae60;
            border-top: 2px solid #27ae60;
            padding-top: 10px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        .info-box {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 3px solid #3498db;
        }
        .info-box h4 {
            margin: 0 0 10px 0;
            color: #2c3e50;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 14px;
        }
        .contact-info {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            .email-container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">CC Traders</div>
            <p style="margin: 0; color: #666;">Your Order Has Been Confirmed! 🎉</p>
        </div>

        <!-- Greeting -->
        <div class="section">
            <h2 style="color: #2c3e50; margin-bottom: 10px;">Hello ${firstName} ${lastName},</h2>
            <p>Thank you for your order! We're excited to get your items to you as soon as possible.</p>
        </div>

        <!-- Order ID -->
        <div class="order-id">
            <strong>Order ID: ${orderId}</strong>
            <br>
            <small>Please save this order ID for your records</small>
        </div>

        <!-- Order Details -->
        <div class="section">
            <h3 class="section-title">📦 Order Summary</h3>
            <table class="item-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Size</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items
                      .map(
                        (item) => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.size}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price}</td>
                            <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>
        </div>

        <!-- Pricing Breakdown -->
        <div class="total-section">
            <h3 class="section-title">💰 Pricing Breakdown</h3>
            <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${subtotal}</span>
            </div>
            <div class="total-row">
                <span>Shipping (${shippingMethod}):</span>
                <span>₹${shippingCost}</span>
            </div>
            <div class="total-row total-final">
                <span>Total Amount:</span>
                <span>₹${total}</span>
            </div>
        </div>

        <!-- Shipping & Payment Info -->
        <div class="info-grid">
            <div class="info-box">
                <h4>🚚 Shipping Address</h4>
                <p style="margin: 0;">
                    ${firstName} ${lastName}<br>
                    ${street}<br>
                    ${district}, ${city}
                </p>
            </div>
            <div class="info-box">
                <h4>💳 Payment Information</h4>
                <p style="margin: 0;">
                    Method: ${payment.method.toUpperCase()}<br>
                    Status: ${
                      paymentStatus === "cod" ? "Cash on Delivery" : "Paid"
                    }
                </p>
            </div>
        </div>

        <!-- Contact Information -->
        <div class="contact-info">
            <h4 style="margin: 0 0 10px 0;">📞 Need Help?</h4>
            <p style="margin: 0;">
                If you have any questions about your order, please contact us:<br>
                <strong>Email:</strong> info@cctraders.ca<br>
                <strong>Phone:</strong> +1 (437) 606-3251<br>
                <strong>Website:</strong> www.cctraders.ca
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Thank you for choosing CC Traders! 🙏</p>
            <p style="font-size: 12px; color: #999;">
                This is an automated email from CC Traders. Please do not reply to this email.<br>
                If you need assistance, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>
    `;

    const mailResponse = await SendMailToApplicient(
      "info@cctraders.ca",
      subject,
      html,
      to
    );
    if (!mailResponse.success) {
      console.warn(
        "Order saved, but email failed to send:",
        mailResponse.message
      );
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: savedOrder._id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// GET /order/:orderId - Get order by ID
// router.get("/:orderId", authenticateUser, async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(orderId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid order ID format",
//       });
//     }

//     const order = await Order.findById(orderId)
//       .populate("userId", "name email")
//       .populate("items.productId", "name price category images");

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: order,
//     });
//   } catch (error) {
//     console.error("Error fetching order:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error while fetching order",
//     });
//   }
// });

// // GET /order/user/:userId - Get orders by user ID
// router.get("/user/:userId", authenticateUser, async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { page = 1, limit = 10, status } = req.query;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user ID format",
//       });
//     }

//     const query = { userId };
//     if (status) {
//       query.orderStatus = status;
//     }

//     const orders = await Order.find(query)
//       .populate("items.productId", "name price category images")
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const totalOrders = await Order.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       data: orders,
//       pagination: {
//         currentPage: page,
//         totalPages: Math.ceil(totalOrders / limit),
//         totalOrders,
//         hasNextPage: page < Math.ceil(totalOrders / limit),
//         hasPrevPage: page > 1,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching user orders:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error while fetching orders",
//     });
//   }
// });

// // PUT /order/:orderId/status - Update order status
// router.put("/:orderId/status", authenticateUser, async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { orderStatus, paymentStatus } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(orderId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid order ID format",
//       });
//     }

//     const updateData = {};
//     if (orderStatus) updateData.orderStatus = orderStatus;
//     if (paymentStatus) updateData.paymentStatus = paymentStatus;

//     const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedOrder) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Order status updated successfully",
//       data: updatedOrder,
//     });
//   } catch (error) {
//     console.error("Error updating order status:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error while updating order status",
//     });
//   }
// });
