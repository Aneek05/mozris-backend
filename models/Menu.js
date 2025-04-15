const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  date: {
    type: String, // e.g., '2024-04-14'
    required: true,
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Midnight Snacks'],
    required: true,
  },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);
