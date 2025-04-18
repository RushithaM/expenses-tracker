import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('categoryChart') private chartCanvas!: ElementRef;
  private chart: Chart | undefined;

  totalExpenses: number = 0;
  previousMonthExpenses: number = 0;
  monthlyChange: number = 0;
  monthlyChangePercentage: number = 0;
  categoryTotals: { [key: string]: number } = {};
  recentExpenses: Expense[] = [];
  categoryBudgets: { [key: string]: number } = {
    'Bills': 500,
    'Food': 300,
    'Housing': 1500,
    'Transport': 200,
    'Utilities': 150,
    'Entertainment': 200,
    'Shopping': 300,
    'Healthcare': 250
  };
  chartType: 'pie' | 'bar' = 'pie';
  loading: boolean = true;
  searchTerm: string = '';
  totalBudget: number = 0;
  remainingBudget: number = 0;
  overBudgetCategories: string[] = [];
  selectedTimeframe: 'month' | 'quarter' | 'year' = 'month';
  
  // Sorting and filtering
  categorySortOption: string = 'amount-desc';
  transactionSortOption: string = 'date-desc';
  activeFilters: string[] = [];
  sortedCategories: { key: string; value: number }[] = [];
  filteredAndSortedTransactions: Expense[] = [];
  private chartInitialized: boolean = false;

  constructor(private expenseService: ExpenseService) {
    this.totalBudget = Object.values(this.categoryBudgets).reduce((a, b) => a + b, 0);
  }

  ngOnInit(): void {
    this.loadExpenses();
  }

  ngAfterViewInit(): void {
    this.chartInitialized = true;
    if (Object.keys(this.categoryTotals).length > 0) {
      this.initializeChart();
    }
  }

  loadExpenses(): void {
    this.loading = true;
    this.expenseService.getExpenses().subscribe({
      next: (expenses) => {
        // Sort expenses by date in descending order
        const sortedExpenses = expenses.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // Filter expenses based on selected timeframe
        const filteredExpenses = this.filterExpensesByTimeframe(expenses);
        
        // Get the current period's expenses
        const currentPeriodExpenses = filteredExpenses.current;
        
        // Get previous period's expenses
        const previousPeriodExpenses = filteredExpenses.previous;

        // Calculate period-over-period changes
        this.calculatePeriodChanges(currentPeriodExpenses, previousPeriodExpenses);
        
        // Get recent transactions
        this.recentExpenses = sortedExpenses.slice(0, 5);
        
        // Calculate category totals
        this.calculateTotals(currentPeriodExpenses);
        this.identifyOverBudgetCategories();
        
        // Sort categories and transactions
        this.sortCategories();
        this.sortAndFilterTransactions();
        
        // Initialize or update chart only if the view is ready
        if (this.chartInitialized) {
          setTimeout(() => {
            this.initializeChart();
            this.loading = false;
          }, 100);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading expenses:', error);
        this.loading = false;
      }
    });
  }

  private filterExpensesByTimeframe(expenses: Expense[]): { current: Expense[], previous: Expense[] } {
    const now = new Date();
    let currentStart: Date;
    let currentEnd: Date;
    let previousStart: Date;
    let previousEnd: Date;

    switch (this.selectedTimeframe) {
      case 'month':
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
        currentEnd = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        previousStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
        previousEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);
        break;
      case 'year':
        currentStart = new Date(now.getFullYear(), 0, 1);
        currentEnd = new Date(now.getFullYear(), 11, 31);
        previousStart = new Date(now.getFullYear() - 1, 0, 1);
        previousEnd = new Date(now.getFullYear() - 1, 11, 31);
        break;
    }

    return {
      current: expenses.filter(expense => {
        const date = new Date(expense.date);
        return date >= currentStart && date <= currentEnd;
      }),
      previous: expenses.filter(expense => {
        const date = new Date(expense.date);
        return date >= previousStart && date <= previousEnd;
      })
    };
  }

  private calculatePeriodChanges(currentExpenses: Expense[], previousExpenses: Expense[]): void {
    this.totalExpenses = currentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    this.previousMonthExpenses = previousExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    this.monthlyChange = this.totalExpenses - this.previousMonthExpenses;
    this.monthlyChangePercentage = this.previousMonthExpenses ? 
      (this.monthlyChange / this.previousMonthExpenses) * 100 : 0;
  }

  private calculateTotals(expenses: Expense[]): void {
    this.categoryTotals = expenses.reduce((totals, expense) => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
      return totals;
    }, {} as { [key: string]: number });

    this.remainingBudget = this.totalBudget - this.totalExpenses;
    this.sortCategories();
  }

  private sortCategories(): void {
    const categories = Object.entries(this.categoryTotals).map(([key, value]) => ({ key, value }));
    
    switch (this.categorySortOption) {
      case 'amount-desc':
        categories.sort((a, b) => b.value - a.value);
        break;
      case 'amount-asc':
        categories.sort((a, b) => a.value - b.value);
        break;
      case 'name-asc':
        categories.sort((a, b) => a.key.localeCompare(b.key));
        break;
      case 'name-desc':
        categories.sort((a, b) => b.key.localeCompare(a.key));
        break;
      case 'budget':
        categories.sort((a, b) => {
          const budgetUtilA = this.getBudgetUtilization(a.key);
          const budgetUtilB = this.getBudgetUtilization(b.key);
          return budgetUtilB - budgetUtilA;
        });
        break;
    }
    
    this.sortedCategories = categories;
  }

  private sortAndFilterTransactions(): void {
    let filtered = this.recentExpenses;
    
    // Apply search term filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(term) ||
        expense.category.toLowerCase().includes(term)
      );
    }
    
    // Apply active filters
    if (this.activeFilters.length > 0) {
      filtered = filtered.filter(expense => 
        this.activeFilters.includes(expense.category)
      );
    }
    
    // Apply sorting
    switch (this.transactionSortOption) {
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'amount-desc':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-asc':
        filtered.sort((a, b) => a.amount - b.amount);
        break;
    }
    
    this.filteredAndSortedTransactions = filtered;
  }

  changeCategorySort(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.categorySortOption = select.value;
    this.sortCategories();
  }

  changeTransactionSort(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.transactionSortOption = select.value;
    this.sortAndFilterTransactions();
  }

  changeTimeframe(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedTimeframe = select.value as 'month' | 'quarter' | 'year';
    this.loadExpenses();
  }

  onSearchChange(): void {
    this.sortAndFilterTransactions();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.sortAndFilterTransactions();
  }

  addFilter(category: string): void {
    if (!this.activeFilters.includes(category)) {
      this.activeFilters.push(category);
      this.sortAndFilterTransactions();
    }
  }

  removeFilter(filter: string): void {
    this.activeFilters = this.activeFilters.filter(f => f !== filter);
    this.sortAndFilterTransactions();
  }

  showCategoryDetails(category: string): void {
    this.addFilter(category);
  }

  showTransactionDetails(expense: Expense): void {
    // TODO: Implement transaction details modal or navigation
    console.log('Show details for transaction:', expense);
  }

  private identifyOverBudgetCategories(): void {
    this.overBudgetCategories = Object.entries(this.categoryTotals)
      .filter(([category, amount]) => {
        const budget = this.categoryBudgets[category] || 0;
        return amount > budget;
      })
      .map(([category]) => category);
  }

  getCategoryTrend(category: string): 'up' | 'down' | 'stable' {
    const currentAmount = this.categoryTotals[category] || 0;
    const budget = this.categoryBudgets[category] || 0;
    
    if (currentAmount > budget) return 'up';
    if (currentAmount < budget * 0.8) return 'down';
    return 'stable';
  }

  toggleChartType(): void {
    this.chartType = this.chartType === 'pie' ? 'bar' : 'pie';
    this.initializeChart();
  }

  getBudgetUtilization(category: string): number {
    const spent = this.categoryTotals[category] || 0;
    const budget = this.categoryBudgets[category] || 0;
    return budget > 0 ? (spent / budget) * 100 : 0;
  }

  getRemainingBudget(category: string): number {
    const spent = this.categoryTotals[category] || 0;
    const budget = this.categoryBudgets[category] || 0;
    return budget - spent;
  }

  getBudgetStatus(category: string): 'safe' | 'warning' | 'danger' {
    const utilization = this.getBudgetUtilization(category);
    if (utilization >= 90) return 'danger';
    if (utilization >= 75) return 'warning';
    return 'safe';
  }

  isOverBudget(category: string): boolean {
    return this.overBudgetCategories.includes(category);
  }

  abs(value: number): number {
    return Math.abs(value);
  }

  private initializeChart(): void {
    if (!this.chartCanvas?.nativeElement) {
      console.warn('Chart canvas element not found, skipping chart initialization');
      return;
    }

    try {
      if (this.chart) {
        this.chart.destroy();
      }

      const categories = this.sortedCategories.map(c => c.key);
      const amounts = this.sortedCategories.map(c => c.value);

      if (categories.length === 0) {
        console.warn('No data available for chart');
        return;
      }

      const colors = this.generateColors(categories.length);

      const config: ChartConfiguration = {
        type: this.chartType,
        data: {
          labels: categories,
          datasets: [{
            data: amounts,
            backgroundColor: colors,
            borderWidth: 1,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 10,
              bottom: 10,
              left: 10,
              right: 10
            }
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 15,
                font: {
                  size: 11
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw as number;
                  const total = amounts.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  const budget = this.categoryBudgets[categories[context.dataIndex]];
                  const utilization = ((value / budget) * 100).toFixed(1);
                  return [
                    `Amount: $${value.toFixed(2)} (${percentage}% of total)`,
                    `Budget: $${budget.toFixed(2)} (${utilization}% used)`
                  ];
                }
              }
            },
            title: {
              display: true,
              text: 'Expense Distribution by Category',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: {
                top: 10,
                bottom: 15
              }
            }
          }
        }
      };

      this.chart = new Chart(this.chartCanvas.nativeElement, config);
    } catch (error) {
      console.error('Error creating chart:', error);
      this.loading = false;
    }
  }

  private generateColors(count: number): string[] {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40'
    ];
    
    while (colors.length < count) {
      colors.push(...colors);
    }
    
    return colors.slice(0, count);
  }

  getProgressRingOffset(): number {
    // Calculate the percentage of budget used
    const budgetUtilization = this.totalBudget > 0 ? (this.totalExpenses / this.totalBudget) * 100 : 0;
    // Limit to 100%
    const percentage = Math.min(budgetUtilization, 100);
    // Calculate the offset (circumference - (percentage * circumference / 100))
    const circumference = 339.292; // 2 * π * radius (54)
    return circumference - (percentage * circumference / 100);
  }
}