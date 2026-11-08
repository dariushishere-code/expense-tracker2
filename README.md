# Expense Tracker

A modern personal finance application built with React, TypeScript, Redux Toolkit, and Tailwind CSS.

## Features

- **Authentication**: Sign up / Login with data stored in LocalStorage
- **Transactions**: Add, edit, delete income & expenses with title, amount, date, category, wallet
- **Categories**: Default categories + custom categories
- **Multi-Wallet**: Manage cash, bank, credit wallets and transfer between them
- **Charts**: Pie charts (expenses by category) and line/bar charts (trends over time)
- **Filters & Search**: Search by title/amount, filter by type, category, date range
- **Reminders**: Recurring expense reminders (weekly/monthly) with due-soon notifications
- **Import / Export**: CSV export and import of transactions
- **Responsive UI**: Mobile-friendly design with Tailwind CSS
- **State Management**: Redux Toolkit for global state + LocalStorage persistence

## Tech Stack

- React 19 + TypeScript
- Vite
- Redux Toolkit + React Redux
- React Router DOM
- Recharts
- date-fns
- Tailwind CSS v4

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
  components/   # Shared layout components
  pages/        # Route pages
  store/        # Redux slices
  hooks/        # Typed Redux hooks
  types/        # TypeScript interfaces
  utils/        # LocalStorage helpers
```

## Usage Notes

1. Create an account on the Sign Up page.
2. Default categories and wallets are created automatically.
3. Add transactions from the Transactions page.
4. View insights on Dashboard and Reports.
5. Manage wallets and transfer funds on the Wallets page.
6. Set recurring reminders on the Reminders page.
7. Export/import data and customize categories in Settings.

## Homework Requirements Covered

1. Expense & income management with title, amount, date, category
2. Authentication & user management (LocalStorage)
3. Categories (predefined + custom)
4. Pie Chart & Line Chart reports
5. Redux for state management + LocalStorage persistence
6. Search & filter transactions
7. Responsive design with Tailwind CSS
8. Recurring expense reminders
9. Multi-wallet support + transfers
10. CSV import / export

---

Expense Tracker - Frontend Homework
