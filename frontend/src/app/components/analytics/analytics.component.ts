import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { BudgetService } from '../../services/budget.service';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { Expense, CategoryBudget } from '../../models/expense';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  @ViewChild('monthlyTrendChart') monthlyTrendCanvas!: ElementRef;
  @ViewChild('categoryBreakdownChart') categoryBreakdownCanvas!: ElementRef;
  @ViewChild('budgetComparisonChart') budgetComparisonCanvas!: ElementRef;

  expenses: Expense[] = [];
  categoryBudgets: CategoryBudget[] = [];
  monthlyTrendChart: Chart | undefined;
  categoryBreakdownChart: Chart | undefined;
  budgetComparisonChart: Chart | undefined;
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;

  constructor(
    private expenseService: ExpenseService,
    private budgetService: BudgetService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.expenseService.getExpenses().subscribe(expenses => {
      this.expenses = expenses;
      this.budgetService.getBudgets().subscribe(budgets => {
        this.categoryBudgets = budgets;
        this.initializeCharts();
      });
    });
  }

  private initializeCharts(): void {
    this.createMonthlyTrendChart();
    this.createCategoryBreakdownChart();
    this.createBudgetComparisonChart();
  }

  private createMonthlyTrendChart(): void {
    const monthlyData = this.calculateMonthlyTrends();
    
    this.monthlyTrendChart = new Chart(this.monthlyTrendCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: monthlyData.labels,
        datasets: [{
          label: 'Monthly Expenses',
          data: monthlyData.values,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Monthly Spending Trends'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount ($)'
            }
          }
        }
      }
    });
  }

  private createCategoryBreakdownChart(): void {
    const categoryData = this.calculateCategoryBreakdown();
    
    this.categoryBreakdownChart = new Chart(this.categoryBreakdownCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: categoryData.labels,
        datasets: [{
          data: categoryData.values,
          backgroundColor: [
            '#3498db', '#e74c3c', '#2ecc71', '#f1c40f', 
            '#9b59b6', '#e67e22', '#1abc9c', '#34495e'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Expense Distribution by Category'
          },
          legend: {
            position: 'right'
          }
        }
      }
    });
  }

  private createBudgetComparisonChart(): void {
    const budgetData = this.calculateBudgetComparison();
    
    this.budgetComparisonChart = new Chart(this.budgetComparisonCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: budgetData.labels,
        datasets: [
          {
            label: 'Budget',
            data: budgetData.budgetValues,
            backgroundColor: 'rgba(46, 204, 113, 0.5)'
          },
          {
            label: 'Actual',
            data: budgetData.actualValues,
            backgroundColor: 'rgba(231, 76, 60, 0.5)'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Budget vs Actual Spending'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Amount ($)'
            }
          }
        }
      }
    });
  }

  private calculateMonthlyTrends() {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(this.selectedYear, i, 1);
      return date.toLocaleString('default', { month: 'short' });
    });

    const monthlyTotals = Array(12).fill(0);
    
    this.expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getFullYear() === this.selectedYear) {
        monthlyTotals[expenseDate.getMonth()] += expense.amount;
      }
    });

    return {
      labels: months,
      values: monthlyTotals
    };
  }

  private calculateCategoryBreakdown() {
    const categoryTotals = new Map<string, number>();
    
    this.expenses.forEach(expense => {
      const currentTotal = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, currentTotal + expense.amount);
    });

    return {
      labels: Array.from(categoryTotals.keys()),
      values: Array.from(categoryTotals.values())
    };
  }

  private calculateBudgetComparison() {
    const budgetMap = new Map<string, number>();
    const actualMap = new Map<string, number>();

    this.categoryBudgets.forEach(budget => {
      budgetMap.set(budget.category, budget.limit);
      actualMap.set(budget.category, 0);
    });

    this.expenses.forEach(expense => {
      const currentTotal = actualMap.get(expense.category) || 0;
      actualMap.set(expense.category, currentTotal + expense.amount);
    });

    return {
      labels: Array.from(budgetMap.keys()),
      budgetValues: Array.from(budgetMap.values()),
      actualValues: Array.from(actualMap.values())
    };
  }

  exportToCsv(): void {
    const csvData = this.generateCsvData();
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense_report_${this.selectedYear}_${this.selectedMonth}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportToPdf(): void {
    // We'll implement PDF export using a library like jsPDF
    // This is a placeholder for now
    console.log('PDF export to be implemented');
  }

  private generateCsvData(): string {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Type'];
    const rows = this.expenses.map(expense => [
      expense.date,
      expense.description,
      expense.category,
      expense.amount.toFixed(2),
      expense.isRecurring ? 'Recurring' : 'One-time'
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  getTotalExpenses(): number {
    return this.expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  getBudgetStatus(): number {
    const totalBudget = this.categoryBudgets.reduce((total, budget) => total + budget.limit, 0);
    const totalExpenses = this.getTotalExpenses();
    return totalBudget - totalExpenses;
  }

  isOverBudget(): boolean {
    return this.getBudgetStatus() < 0;
  }

  getTopCategory(): string {
    const categoryTotals = new Map<string, number>();
    
    this.expenses.forEach(expense => {
      const currentTotal = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, currentTotal + expense.amount);
    });

    let maxCategory = '';
    let maxAmount = 0;

    categoryTotals.forEach((amount, category) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        maxCategory = category;
      }
    });

    return maxCategory ? `${maxCategory} ($${maxAmount.toFixed(2)})` : 'No expenses';
  }
} 