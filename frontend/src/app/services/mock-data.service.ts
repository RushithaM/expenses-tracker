import { Injectable } from '@angular/core';
import { Expense } from '../models/expense';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private mockExpenses: Expense[] = [
    // Current Month
    {
      id: '1',
      description: 'Monthly Rent',
      amount: 1200,
      category: 'Housing',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 20).toISOString(),
    },
    {
      id: '2',
      description: 'Grocery Shopping - Walmart',
      amount: 85.75,
      category: 'Food',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 20).toISOString(),
    },
    {
      id: '3',
      description: 'Electric Bill',
      amount: 45.50,
      category: 'Utilities',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString(),
    },
    {
      id: '4',
      description: 'Gas Bill',
      amount: 75.00,
      category: 'Transport',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString(),
    },
    {
      id: '5',
      description: 'Internet Bill',
      amount: 120.00,
      category: 'Bills',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 23).toISOString(),
    },
    {
      id: '6',
      description: 'Movie Night',
      amount: 45.00,
      category: 'Entertainment',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 18).toISOString(),
    },
    {
      id: '7',
      description: 'New Clothes - H&M',
      amount: 125.50,
      category: 'Shopping',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 19).toISOString(),
    },
    {
      id: '8',
      description: 'Doctor Visit',
      amount: 95.00,
      category: 'Healthcare',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 21).toISOString(),
    },

    // Previous Month
    {
      id: '9',
      description: 'Previous Month Rent',
      amount: 1200,
      category: 'Housing',
      date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 20).toISOString(),
    },
    {
      id: '10',
      description: 'Previous Month Groceries',
      amount: 95.25,
      category: 'Food',
      date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 20).toISOString(),
    },
    {
      id: '11',
      description: 'Previous Electric Bill',
      amount: 42.50,
      category: 'Utilities',
      date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 10).toISOString(),
    },
    {
      id: '12',
      description: 'Previous Internet Bill',
      amount: 65.00,
      category: 'Bills',
      date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15).toISOString(),
    },
    {
      id: '13',
      description: 'Previous Bus Pass',
      amount: 75.00,
      category: 'Transport',
      date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 18).toISOString(),
    }
  ];

  getMockExpenses(): Expense[] {
    return this.mockExpenses;
  }

  addMockExpense(expense: Expense): void {
    this.mockExpenses.push({
      ...expense,
      id: (this.mockExpenses.length + 1).toString()
    });
  }

  deleteMockExpense(id: string): void {
    const index = this.mockExpenses.findIndex(e => e.id === id);
    if (index !== -1) {
      this.mockExpenses.splice(index, 1);
    }
  }

  updateMockExpense(expense: Expense): void {
    const index = this.mockExpenses.findIndex(e => e.id === expense.id);
    if (index !== -1) {
      this.mockExpenses[index] = expense;
    }
  }
} 