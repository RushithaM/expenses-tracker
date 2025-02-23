import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.css']
})
export class ExpenseFormComponent {
  expense: Expense = {
    description: '',
    amount: 0,
    date: new Date(),
    category: ''
  };

  constructor(
    private expenseService: ExpenseService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.expense.description && this.expense.amount) {
      this.expenseService.addExpense({ ...this.expense }).subscribe({
        next: () => {
          // Navigate back to dashboard after successful submission
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error adding expense:', error);
        }
      });
    }
  }
}