import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Expense } from '../models/expense';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  constructor(private mockDataService: MockDataService) {}

  getExpenses(): Observable<Expense[]> {
    // Return mock data instead of HTTP call
    return of(this.mockDataService.getMockExpenses());
  }

  getExpense(id: string): Observable<Expense> {
    const expense = this.mockDataService.getMockExpenses().find(e => e.id === id);
    return of(expense as Expense);
  }

  addExpense(expense: Expense): Observable<Expense> {
    this.mockDataService.addMockExpense(expense);
    return of(expense);
  }

  updateExpense(expense: Expense): Observable<Expense> {
    this.mockDataService.updateMockExpense(expense);
    return of(expense);
  }

  deleteExpense(id: string): Observable<void> {
    this.mockDataService.deleteMockExpense(id);
    return of(void 0);
  }
}