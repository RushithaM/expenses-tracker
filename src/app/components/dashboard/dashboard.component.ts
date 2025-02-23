import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalExpenses: number = 0;
  categoryTotals: { [key: string]: number } = {};
  recentExpenses: Expense[] = [];

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.expenseService.getExpenses().subscribe({
      next: (expenses) => {
        // Sort expenses by date in descending order
        const sortedExpenses = expenses.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // Get the 5 most recent expenses
        this.recentExpenses = sortedExpenses.slice(0, 5);
        
        // Calculate totals for all expenses
        this.calculateTotals(expenses);
      },
      error: (error) => {
        console.error('Error loading expenses:', error);
      }
    });
  }

  private calculateTotals(expenses: Expense[]): void {
    this.totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    this.categoryTotals = expenses.reduce((totals, expense) => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
      return totals;
    }, {} as { [key: string]: number });
  }
}