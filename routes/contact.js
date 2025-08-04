const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// MongoDB model
const Contact = mongoose.models.Contact || mongoose.model('Contact', new mongoose.Schema({
  name: String,
  email: String,
  message: String,
}));

// Email transporter (Zoho SMTP)
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();

    // Respond quickly to frontend
    res.status(200).json({ success: true });

    // Send email in background
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'info@hahutechsolutions.com',
      subject: 'New Contact Form Submission',
      text: `Name: ${contact.name}\nEmail: ${contact.email}\nMessage: ${contact.message}`
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Email sending failed:', err);
      } else {
        console.log('Email sent successfully.');
      }
    });

  } catch (error) {
    console.error('MongoDB Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;