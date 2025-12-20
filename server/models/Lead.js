const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  source: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Qualified', 'Lost', 'Won'], 
    default: 'New' 
  },
  tags: [{ type: String }],
  notes: [{ 
    text: String, 
    date: { type: Date, default: Date.now },
    author: String
  }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true // ✅ This automatically manages createdAt and updatedAt
});

// ❌ REMOVED: The manual pre('save') hook that was causing issues.

module.exports = mongoose.model('Lead', leadSchema);