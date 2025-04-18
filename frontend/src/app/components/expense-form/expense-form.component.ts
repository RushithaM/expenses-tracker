import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { BudgetService } from '../../services/budget.service';
import { Expense } from '../../models/expense';
import { Location } from '@angular/common';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.css']
})
export class ExpenseFormComponent implements OnInit {
  @ViewChild('expenseForm') expenseForm!: NgForm;
  
  expense: Expense = {
    id: '',
    description: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurringInterval: 'monthly',
    nextDueDate: new Date().toISOString().split('T')[0]
  };
  
  isEditing = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  categories = [
    'Food',
    'Transport',
    'Entertainment',
    'Bills',
    'Shopping',
    'Healthcare',
    'Housing',
    'Utilities',
    'Other'
  ];

  constructor(
    private expenseService: ExpenseService,
    private budgetService: BudgetService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.loadExpense(id);
    }
  }

  loadExpense(id: string): void {
    this.isSubmitting = true;
    this.expenseService.getExpense(id).subscribe({
      next: (expense) => {
        // Format dates for input fields
        expense.date = new Date(expense.date).toISOString().split('T')[0];
        if (expense.nextDueDate) {
          expense.nextDueDate = new Date(expense.nextDueDate).toISOString().split('T')[0];
        }
        this.expense = expense;
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error loading expense:', error);
        this.errorMessage = 'Failed to load expense details. Please try again.';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/expenses']), 2000);
      }
    });
  }

  onSubmit(): void {
    if (this.expenseForm.form.valid) {
      this.isSubmitting = true;
      this.clearMessages();

      // Update budget tracking
      this.budgetService.updateSpentAmount(this.expense.category, this.expense.amount);

      const operation = this.isEditing
        ? this.expenseService.updateExpense(this.expense)
        : this.expenseService.addExpense({ ...this.expense });

      operation.subscribe({
        next: () => {
          this.successMessage = `Expense successfully ${this.isEditing ? 'updated' : 'added'}!`;
          setTimeout(() => this.router.navigate(['/expenses']), 1500);
        },
        error: (error) => {
          console.error('Error saving expense:', error);
          this.errorMessage = `Failed to ${this.isEditing ? 'update' : 'add'} expense. Please try again.`;
          this.isSubmitting = false;
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.expenseForm.controls).forEach(key => {
        const control = this.expenseForm.controls[key];
        control.markAsTouched();
      });
    }
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  goBack(): void {
    this.location.back();
  }

  // Helper method to check if the form is valid
  isFormValid(): boolean {
    if (!this.expenseForm) return false;
    return this.expenseForm.form.valid;
  }

  // Helper method to format currency
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}