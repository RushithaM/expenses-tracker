import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Expense } from '../models/expense';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expenses: Expense[] = [];
  private expensesSubject = new BehaviorSubject<Expense[]>([]);

  constructor() {}

  addExpense(expense: Expense): void {
    expense.id = this.generateId();
    this.expenses.push(expense);
    this.expensesSubject.next(this.expenses);
  }

  getExpenses(): Observable<Expense[]> {
    return this.expensesSubject.asObservable();
  }

  deleteExpense(id: number): Observable<void> {
    return new Observable<void>(observer => {
      this.expenses = this.expenses.filter(expense => expense.id !== id);
      this.expensesSubject.next(this.expenses);
      observer.next();
      observer.complete();
    });
  }

  private generateId(): number {
    return this.expenses.length > 0 
      ? Math.max(...this.expenses.map(expense => expense.id || 0)) + 1 
      : 1;
  }
}