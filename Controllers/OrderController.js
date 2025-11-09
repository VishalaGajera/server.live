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

    const to_email = email;
    const subject = "🛒 Order Confirmation - CC Traders";

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation - CC Trader</title>

  <style>
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      background: #f2f5f9;
      margin: 0;
      padding: 25px;
      color: #333;
    }

    .email-wrapper {
      max-width: 650px;
      margin: auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
    }

    .header {
      background: linear-gradient(90deg, #0078d7, #00a2ff);
      padding: 25px;
      text-align: center;
      color: white;
    }

    .header h1 {
      margin: 0;
      font-size: 26px;
      letter-spacing: 0.5px;
    }

    .header p {
      font-size: 15px;
      opacity: 0.9;
      margin-top: 6px;
    }

    .content {
      padding: 30px;
    }

    h2 {
      margin-top: 0;
      color: #1e3a8a;
      font-size: 22px;
    }

    .order-box {
      background: #f0faff;
      border-left: 4px solid #0078d7;
      padding: 18px;
      border-radius: 8px;
      margin: 25px 0;
    }

    .order-box strong {
      font-size: 18px;
      color: #0078d7;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    th {
      background: #eef3f8;
      padding: 12px;
      text-align: left;
      border: 1px solid #e2e8f0;
      font-size: 14px;
      font-weight: 600;
    }

    td {
      padding: 12px;
      border: 1px solid #e2e8f0;
      font-size: 14px;
    }

    .total-section {
      margin-top: 30px;
      background: #fafafa;
      padding: 20px;
      border-radius: 8px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 15px;
    }

    .total-final {
      border-top: 2px solid #0078d7;
      margin-top: 10px;
      padding-top: 10px;
      font-weight: bold;
      color: #0078d7;
      font-size: 18px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 25px;
    }

    .info-box {
      background: #f7fafe;
      padding: 16px;
      border-left: 4px solid #0078d7;
      border-radius: 8px;
      margin-bottom: 10px;
    }

    .info-box h4 {
      margin: 0 0 10px;
      font-size: 16px;
      color: #1e3a8a;
    }

    .contact-section {
      background: #eaf4ff;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
      text-align: center;
    }

    .footer {
      text-align: center;
      padding: 25px 20px;
      font-size: 13px;
      color: #666;
    }

    @media (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
      .content {
        padding: 20px;
      }
    }
  </style>
</head>

<body>

  <div class="email-wrapper">

    <!-- HEADER -->
    <div class="header">
      <h1>CC Trader</h1>
      <p>Your order has been successfully confirmed 🎉</p>
    </div>

    <!-- BODY CONTENT -->
    <div class="content">

      <h2>Hello ${firstName} ${lastName},</h2>
      <p>Thank you for shopping with <strong>CC Trader</strong>!  
         We're preparing your order and will notify you once it ships.</p>

      <!-- ORDER ID BOX -->
      <div class="order-box">
        <strong>Order ID: ${orderId}</strong><br />
        <small>Keep this ID for future reference.</small>
      </div>

      <!-- ORDER SUMMARY TABLE -->
      <h3 style="margin-top: 25px; color:#1e3a8a;">📦 Order Summary</h3>

      <table>
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

      <!-- PRICING BREAKDOWN -->
      <div class="total-section">
        <div class="total-row"><span>Subtotal:</span><span>₹${subtotal}</span></div>
        <div class="total-row"><span>Shipping (${shippingMethod}):</span><span>₹${shippingCost}</span></div>
        
        <div class="total-row total-final">
          <span>Total Amount:</span><span>₹${total}</span>
        </div>
      </div>

      <!-- ADDRESS + PAYMENT GRID -->
      <div class="info-grid">
        <div class="info-box">
          <h4>🚚 Shipping Address</h4>
          <p>
            ${firstName} ${lastName}<br />
            ${street}<br />
            ${district}, ${city}
          </p>
        </div>

        <div class="info-box">
          <h4>💳 Payment Details</h4>
          <p>
            Method: ${payment.method.toUpperCase()}<br />
            Status: ${paymentStatus === "cod" ? "Cash on Delivery" : "Paid"}
          </p>
        </div>
      </div>

      <!-- CONTACT SECTION -->
      <div class="contact-section">
        <h4>Need Help?</h4>
        <p style="margin:0;">
          📧 Email: info@cctraders.ca<br />
          📞 Phone: +1 (437) 606-3251<br />
          🌐 Website: www.cctraders.ca
        </p>
      </div>

    </div>

    <!-- FOOTER -->
    <div class="footer">
      Thank you for choosing CC Trader! 🙏 <br />
      <span style="font-size: 12px; display:block; margin-top:8px; color:#999;">
        This is an automated email. Please do not reply.
      </span>
    </div>

  </div>

</body>
</html>
`;

    const emailResult = await SendMailToApplicient(
      "info@cctraders.ca",
      to_email,
      subject,
      htmlContent
    );

    if (!emailResult.success) {
      return res
        .status(500)
        .json({
          message:
            "Your order was placed, but we were unable to send the confirmation email. Please check again later",
        });
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
