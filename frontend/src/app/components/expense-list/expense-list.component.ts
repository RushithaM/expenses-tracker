import { Component, OnInit } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { BudgetService } from '../../services/budget.service';
import { Expense, CategoryBudget } from '../../models/expense';
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
  categoryBudgets: { [category: string]: CategoryBudget } = {};

  constructor(
    private expenseService: ExpenseService,
    private budgetService: BudgetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
    this.loadBudgets();
  }

  loadExpenses(): void {
    this.expenseService.getExpenses().subscribe({
      next: (expenses) => {
        this.expenses = expenses;
        this.groupExpensesByCategory();
      },
      error: (error) => {
        console.error('Error loading expenses:', error);
      }
    });
  }

  loadBudgets(): void {
    this.budgetService.getBudgets().subscribe({
      next: (budgets) => {
        this.categoryBudgets = budgets.reduce((acc, budget) => {
          acc[budget.category] = budget;
          return acc;
        }, {} as { [category: string]: CategoryBudget });
      },
      error: (error) => {
        console.error('Error loading budgets:', error);
      }
    });
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

  editExpense(id: string): void {
    this.router.navigate(['/edit', id]);
  }

  deleteExpense(id: string): void {
    this.expenseService.deleteExpense(id).subscribe({
      next: () => {
        this.loadExpenses();
      },
      error: (error) => {
        console.error('Error deleting expense:', error);
      }
    });
  }
}