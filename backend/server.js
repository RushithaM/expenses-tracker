const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

// Load environment variables
dotenv.config();

app.use(cors());
app.use(express.json());

// Get MongoDB URI from environment variable
const mongoUri = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect('______________________________');

// Define Expense Schema
const expenseSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  date: Date,
  category: String
});

const Expense = mongoose.model('Expense', expenseSchema);

// Get all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find()
      .sort({ date: -1 }) // Sort by date in descending order (newest first)
      .exec();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new expense
app.post('/api/expenses', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 