const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');

// Get all expenses
router.get('/', expenseController.getAllExpenses);

// Get single expense
router.get('/:id', expenseController.getExpense);

// Create new expense
router.post('/', expenseController.createExpense);

// Update expense
router.put('/:id', expenseController.updateExpense);

// Delete expense
router.delete('/:id', expenseController.deleteExpense);

module.exports = router; 