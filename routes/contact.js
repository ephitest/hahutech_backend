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
    user: 'ephremderesso@hahutechsolutions.com',
    pass: 'NgNSpbZaJmfY'
  }
});

router.post('/', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();

    // Email Notification
    const mailOptions = {
      from: 'ephremderesso@hahutechsolutions.com',
      to: 'info@hahutechsolutions.com',
      subject: 'New Contact Form Submission',
      text: `Name: ${contact.name}\nEmail: ${contact.email}\nMessage: ${contact.message}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('MongoDB or Email Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;