export interface Expense {
    _id?: string;  // MongoDB uses string IDs
    description: string;
    amount: number;
    date: Date;
    category: string;
}