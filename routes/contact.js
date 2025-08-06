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

    // Respond to frontend immediately
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
        console.error('Email sending failed:', JSON.stringify(err, null, 2));

        // Retry once after 3 seconds
        console.log("Retrying email send in 3 seconds...");
        setTimeout(() => {
          transporter.sendMail(mailOptions, (retryErr) => {
            if (retryErr) {
              console.error("Retry failed:", JSON.stringify(retryErr, null, 2));
            } else {
              console.log("Email sent successfully on retry.");
            }
          });
        }, 3000);

      } else {
        console.log("Email sent successfully on first attempt.");
      }
    });

  } catch (error) {
    console.error('MongoDB or Email Error:', JSON.stringify(error, null, 2));
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;