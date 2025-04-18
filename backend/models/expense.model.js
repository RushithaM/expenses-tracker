const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  category: {
    type: String,
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringInterval: {
    type: String,
    enum: ['monthly', 'weekly', 'yearly'],
    required: function() { return this.isRecurring; }
  },
  nextDueDate: {
    type: Date,
    required: function() { return this.isRecurring; }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema); 