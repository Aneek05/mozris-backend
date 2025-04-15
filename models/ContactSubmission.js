const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  }
}, { timestamps: true }); // adds createdAt and updatedAt

module.exports = mongoose.model('ContactSubmission', contactSubmissionSchema);
