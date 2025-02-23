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
    this.expenseService.getExpenses().subscribe(expenses => {
      this.calculateTotals(expenses);
      this.recentExpenses = expenses.slice(-5).reverse();
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