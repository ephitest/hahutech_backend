const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Visitor Schema
const visitorSchema = new mongoose.Schema({
  ip: String,
  userAgent: String,
  date: { type: Date, default: Date.now }
});

// Visitor Model
const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema);

// 📌 Track a new visit
router.post('/', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Save visit to MongoDB
    const visit = new Visitor({ ip, userAgent });
    await visit.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving visitor:', error);
    res.status(500).json({ success: false });
  }
});

// 📌 Get visit statistics
router.get('/stats', async (req, res) => {
  try {
    const total = await Visitor.countDocuments();
    const today = await Visitor.countDocuments({
      date: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    });
    res.json({ total, today });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;