const connectDatabase = require('./Config/Database.js')
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require("cors");
const mongoose = require('mongoose');
const port = process.env.PORT;
// const morgan = require('morgan');
const path = require('path');
const { SendMailToApplicient } = require('./mailServices.js')
const Contact = require('./Models/ConatctSchema.js');
const ProductRouter = require('./Routes/ProductRoutes.js');

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });

// app.use(morgan('dev'));
connectDatabase();

// Path For Set Product Images
let imagePath = path.join(__dirname, 'public', 'images')
app.use('/public/images', express.static(imagePath));
app.use('/api/product',ProductRouter)

app.post('/api/contact', async (req, res) => {
    const { firstName, lastName, subject, message, email } = req.body;

    if (!firstName || !lastName || !subject || !message || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Save contact to database
        const newContact = new Contact({ firstName, lastName, subject, message, email });
        await newContact.save();

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

        const from = email;
        const Subject = `New Contact Form Submission: ${subject}`;
        const text = `You have a new contact form submission:
            Name: ${firstName} ${lastName}
            Subject: ${subject}
            Message: ${message}`;

        const Info = await SendMailToApplicient(from, Subject, text);
        console.log("Info.success:", Info.success);
        if (!Info.success) {
            res.status(200).json({ message: Info.message});
        }
        res.status(200).json({ message: 'Contact saved and email sent successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => console.log(`Server ready on port ${port}.`));

module.exports =  app;
