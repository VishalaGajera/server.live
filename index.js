const connectDatabase = require("./Config/Database.js");
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const port = process.env.PORT;
// const morgan = require('morgan');
const path = require("path");
const { SendMailToApplicient } = require("./mailServices.js");
const Contact = require("./Models/ConatctSchema.js");
const ProductRouter = require("./Routes/ProductRoutes.js");
const CategoryRouter = require("./Routes/CategoryRoutes.js");
const Product = require("./Models/ProductSchema.js");

app.use(express.json());
app.use(cors());

// app.use(morgan('dev'));
connectDatabase();

// Path For Set Product Images
let imagePath = path.join(__dirname, "public", "images");
app.use("/public/images", express.static(imagePath));
app.use("/api/product", ProductRouter);
app.use("/api/category", CategoryRouter);

// Send email
// const mailOptions = {
//     from: email,
//     // to: process.env.EMAIL_RECEIVER, // Change to your recipient email
//     subject: `New Contact Form Submission: ${subject}`,
//     text: `You have a new contact form submission:
//         Name: ${firstName} ${lastName}
//         Subject: ${subject}
//         Message: ${message}`,
// };
app.post("/api/contact", async (req, res) => {
    const { firstName, lastName, subject, message, email } = req.body;
  
    // Validate input
    if (!firstName || !lastName || !subject || !message || !email) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
    try {
      // Save to DB
      const newContact = new Contact({
        firstName,
        lastName,
        subject,
        message,
        email,
      });
      await newContact.save();
  
      // Prepare Email
      const from = email;
      const Subject = `New Contact Form Submission: ${subject}`;
  
      const html = `
        <h2>📩 New Contact Form Submission</h2>
        <p><strong>Full Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p style="background: #f9f9f9; padding: 10px; border-left: 4px solid #ccc;">
          ${message}
        </p>
        <hr>
        <p style="font-size: 0.9em; color: #777;">Submitted on: ${new Date().toLocaleString()}</p>
      `;
  
      // Send Email
      const Info = await SendMailToApplicient(from, Subject, html); // null for text, using html
  
      if (!Info.success) {
        return res.status(500).json({ error: Info.message || "Failed to send email" });
      }
  
      return res.status(200).json({ message: "Contact saved and email sent successfully" });
  
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  

app.put("/api/updateProductCategory", async (req, res) => {
  const { categoryId, categoryName } = req.body;
  console.log(req.body);

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

    res
      .status(200)
      .json({
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
