const connectDatabase = require("./Config/Database.js");
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT;
const path = require("path");
const { SendMailToApplicient } = require("./mailServices.js");
const Contact = require("./Models/ConatctModel.js");
const ProductRouter = require("./Routes/ProductRoutes.js");
const CategoryRouter = require("./Routes/CategoryRoutes.js");
const CartRouter = require("./Routes/CartProductRoutes.js");
const Product = require("./Models/ProductModel.js");
const AuthRouter = require("./Routes/AuthRoutes.js");
const OrderRouter = require("./Routes/orderRoutes.js");
const UserRouter = require("./Routes/UserRoute.js");
const authMiddleware = require("./middleware/auth.middleware.js");

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://cctraders.ca",
  "https://cctraders-admin.vercel.app",
  "https://e-commerce-ten-ebon-93.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// app.use(cors())

connectDatabase();

let imagePath = path.join(__dirname, "public", "images");
app.use("/public/images", express.static(imagePath));
app.use("/api/product", ProductRouter);
app.use("/api/category", CategoryRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/order", OrderRouter);
app.use("/api/user", UserRouter);
app.use("/api/cart", CartRouter);

app.post("/api/contact", async (req, res) => {
  const { firstName, lastName, subject, message, email } = req.body;

  if (!firstName || !lastName || !subject || !message || !email) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newContact = new Contact({
      firstName,
      lastName,
      subject,
      message,
      email,
    });
    await newContact.save();

    const from = email;
    const Subject = `${subject}`;

    // Send Email
    const name = `${firstName} ${lastName}`;
    const submitted_date = new Date().toLocaleString();
    const htmlContact = `<div style="
  max-width: 600px;
  margin: auto;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  font-family: 'Segoe UI', Arial, sans-serif;
  color: #333;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
">
  <div style="
    background: linear-gradient(90deg, #0078d7, #00a0ff);
    color: #fff;
    padding: 18px 25px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  ">
    <h2 style="margin: 0; font-size: 20px;">📩 New Contact Form Submission</h2>
  </div>

  <div style="padding: 25px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; width: 150px; font-weight: 600;">Full Name:</td>
        <td style="padding: 8px 0;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: 600;">Email:</td>
        <td style="padding: 8px 0;">${from}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: 600;">Subject:</td>
        <td style="padding: 8px 0;">${subject}</td>
      </tr>
    </table>

    <div style="margin-top: 20px;">
      <p style="font-weight: 600; margin-bottom: 8px;">Message:</p>
      <div style="
        background: #f5f8fa;
        padding: 15px;
        border-left: 4px solid #0078d7;
        border-radius: 5px;
      ">
        ${message}
      </div>
    </div>

    <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;">

    <p style="font-size: 0.9em; color: #888;">
      🕒 Submitted on: <strong>${submitted_date}</strong>
    </p>
  </div>

  <div style="
    background: #f9f9f9;
    text-align: center;
    padding: 15px;
    border-top: 1px solid #eee;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    font-size: 0.85em;
    color: #777;
  ">
    <p style="margin: 0;">This inquiry was submitted through the official contact form on <a href="https://cctraders.ca/" style="color: #0078d7; text-decoration: none;">cctrander.ca</a>.</p>

  </div>
</div>
`;
    const Info = await SendMailToApplicient(
      from,
      "info@cctraders.ca",
      "New Customer Inquiry from cctrader.ca",
      htmlContact,
      name
    );

    if (!Info.success) {
      return res
        .status(500)
        .json({
          message:
            "We couldn't send your inquiry at the moment. Please try again later.",
        });
    }

    return res
      .status(200)
      .json({ message: "Contact saved and email sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/updateProductCategory", async (req, res) => {
  const { categoryId, categoryName } = req.body;

  if (!categoryId || !categoryName) {
    return res
      .status(400)
      .json({ error: "category ID and Category Name are required" });
  }

  try {
    const updatedProduct = await Product.updateMany(
      { category: categoryName },
      {
        $set: {
          category: categoryId,
        },
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({
      message: "Product category updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => console.log(`Server ready on port ${port}.`));

module.exports = app;
