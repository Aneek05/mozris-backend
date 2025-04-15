const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Generate next order ID
const generateOrderId = async () => {
  const count = await Order.countDocuments();
  const next = count + 1;
  return `ORD${String(next).padStart(3, '0')}`;
};

// Save order
router.post('/', async (req, res) => {
  const { name, items, paid } = req.body;
  const date = new Date().toISOString().split('T')[0];
  try {
    const orderId = await generateOrderId();
    const newOrder = await Order.create({ orderId, name, items, paid, date });
    res.json({ success: true, orderId });
  } catch {
    res.status(500).json({ success: false });
  }
});

// Get order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.json({ success: false });
    res.json({ success: true, order });
  } catch {
    res.status(500).json({ success: false });
  }
});

// Mark as delivered
router.put('/deliver/:orderId', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { delivered: true },
      { new: true }
    );
    if (!order) return res.json({ success: false });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

// Delivered orders by date
router.get('/delivered', async (req, res) => {
  const date = req.query.date;
  try {
    const orders = await Order.find({ date, delivered: true });
    res.json({ success: true, orders });
  } catch {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
