const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// MongoDB model
const Contact = mongoose.models.Contact || mongoose.model('Contact', new mongoose.Schema({
  name: String,
  email: String,
  message: String,
}));

router.post('/', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('MongoDB Error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;