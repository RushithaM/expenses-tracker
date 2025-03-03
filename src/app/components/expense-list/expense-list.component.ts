import { Component, OnInit } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, FormsModule, KeyValuePipe],
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.css']
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = [];
  groupedExpenses: { [category: string]: Expense[] } = {};

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.expenseService.getExpenses().subscribe(
      (expenses) => {
        this.expenses = expenses;
        this.groupExpensesByCategory();
      },
      (error) => {
        console.error('Error loading expenses:', error);
      }
    );
  }

  groupExpensesByCategory(): void {
    this.groupedExpenses = this.expenses.reduce((acc: { [category: string]: Expense[] }, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = [];
      }
      acc[expense.category].push(expense);
      return acc;
    }, {});
  }

  deleteExpense(id: string): void {
    this.expenseService.deleteExpense(id).subscribe(
      () => {
        this.loadExpenses();
      },
      (error) => {
        console.error('Error deleting expense:', error);
      }
    );
  }
}