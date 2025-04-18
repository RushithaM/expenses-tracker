import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CategoryBudget } from '../models/expense';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private categoryBudgets: CategoryBudget[] = [
    { category: 'Food', limit: 300, currentSpent: 0 },
    { category: 'Transport', limit: 200, currentSpent: 0 },
    { category: 'Entertainment', limit: 200, currentSpent: 0 },
    { category: 'Bills', limit: 500, currentSpent: 0 },
    { category: 'Shopping', limit: 300, currentSpent: 0 },
    { category: 'Other', limit: 200, currentSpent: 0 }
  ];

  getBudgets(): Observable<CategoryBudget[]> {
    return of(this.categoryBudgets);
  }

  updateBudget(budget: CategoryBudget): Observable<CategoryBudget> {
    const index = this.categoryBudgets.findIndex(b => b.category === budget.category);
    if (index !== -1) {
      this.categoryBudgets[index] = budget;
    }
    return of(budget);
  }

  updateSpentAmount(category: string, amount: number): void {
    const budget = this.categoryBudgets.find(b => b.category === category);
    if (budget) {
      budget.currentSpent += amount;
    }
  }

  checkBudgetExceeded(category: string): boolean {
    const budget = this.categoryBudgets.find(b => b.category === category);
    return budget ? budget.currentSpent > budget.limit : false;
  }

  resetMonthlySpent(): void {
    this.categoryBudgets.forEach(budget => {
      budget.currentSpent = 0;
    });
  }
} 