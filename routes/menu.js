const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');

// Save menu
router.post('/', async (req, res) => {
  const { date, mealType, items } = req.body;

  try {
    const existing = await Menu.findOne({ date, mealType });
    if (existing) {
      existing.items = [...existing.items, ...items];
      await existing.save();
    } else {
      await Menu.create({ date, mealType, items });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Menu save failed' });
  }
});

// Get today's full menu (all meals)
router.get('/today', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const menus = await Menu.find({ date: today });
    const allItems = menus.flatMap(m => m.items);
    res.json({ success: true, menus: allItems });
  } catch {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
