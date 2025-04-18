# Expense Tracker Application

A full-stack expense tracking application built with Angular and Node.js.

## Project Structure

```
expense-tracker/
├── frontend/           # Angular frontend application
│   ├── src/           # Source files
│   ├── angular.json   # Angular configuration
│   └── package.json   # Frontend dependencies
│
├── backend/           # Node.js backend application
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── middleware/   # Custom middleware
│   ├── server.js     # Main application file
│   └── package.json  # Backend dependencies
│
└── package.json      # Root package.json for running both frontend and backend
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Angular CLI

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Configure environment variables:
   - Create a `.env` file in the backend directory
   - Add the following variables:
     ```
     PORT=3000
     MONGO_URI=your_mongodb_connection_string
     NODE_ENV=development
     ```

## Running the Application

### Development Mode

Run both frontend and backend in development mode:
```bash
npm run dev
```

Or run them separately:
- Frontend only: `npm run dev:frontend`
- Backend only: `npm run dev:backend`

### Production Mode

Run both frontend and backend in production mode:
```bash
npm start
```

## API Endpoints

- GET `/api/expenses` - Get all expenses
- GET `/api/expenses/:id` - Get single expense
- POST `/api/expenses` - Create new expense
- PUT `/api/expenses/:id` - Update expense
- DELETE `/api/expenses/:id` - Delete expense

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
