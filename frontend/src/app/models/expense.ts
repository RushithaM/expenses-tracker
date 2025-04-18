export interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;  // Using string for ISO date format
    isRecurring?: boolean;
    recurringInterval?: 'monthly' | 'weekly' | 'yearly';
    nextDueDate?: string;
}

export interface CategoryBudget {
    category: string;
    limit: number;
    currentSpent: number;
}