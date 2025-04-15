const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
  paid: {
    type: Boolean,
    default: false,
  },
  delivered: {
    type: Boolean,
    default: false,
  },
  date: {
    type: String, // e.g., '2024-04-14'
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);