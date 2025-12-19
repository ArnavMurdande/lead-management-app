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
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

leadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
