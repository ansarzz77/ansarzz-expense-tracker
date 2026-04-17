import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import type { Transaction } from '../context/AppReducer';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const IncomeExpenses = () => {
  const { transactions } = useContext(GlobalContext);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Previous month logic
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const getMonthTotals = (month: number, year: number) => {
    const monthCompleted = transactions.filter((t: Transaction) => {
      if (t.status !== 'completed') return false;
      const dateStr = t.paidDate || t.dueDate;
      const [y, m] = dateStr.split('-').map(Number);
      return (m - 1) === month && y === year;
    });

    const income = monthCompleted
      .filter((t: Transaction) => t.type === 'income')
      .reduce((acc: number, item: Transaction) => acc + item.amount, 0);

    const expense = monthCompleted
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((acc: number, item: Transaction) => acc + item.amount, 0);

    return { income, expense };
  };

  const currentTotals = getMonthTotals(currentMonth, currentYear);
  const previousTotals = getMonthTotals(prevMonth, prevYear);

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const incomeTrend = calculateTrend(currentTotals.income, previousTotals.income);
  const expenseTrend = calculateTrend(currentTotals.expense, previousTotals.expense);

  const renderTrend = (value: number, type: 'income' | 'expense') => {
    if (value === 0 && currentTotals[type] === 0 && previousTotals[type] === 0) return null;
    
    const isPositive = value > 0;
    const isNeutral = value === 0;
    
    // For income, positive is good. For expense, negative is good.
    let colorClass = '';
    if (type === 'income') {
      colorClass = isPositive ? 'trend-up-good' : (isNeutral ? 'trend-neutral' : 'trend-down-bad');
    } else {
      colorClass = isPositive ? 'trend-up-bad' : (isNeutral ? 'trend-neutral' : 'trend-down-good');
    }

    const icon = isPositive ? '▲' : (isNeutral ? '•' : '▼');
    
    return (
      <span className={`trend-indicator ${colorClass}`}>
        {icon} {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  const monthName = MONTH_NAMES[currentMonth];

  return (
    <div className="inc-exp-container">
      <div>
        <h4>{monthName} Actual Income</h4>
        <p className="money plus">+₹{currentTotals.income.toFixed(2)}</p>
        {renderTrend(incomeTrend, 'income')}
      </div>
      <div>
        <h4>{monthName} Actual Expense</h4>
        <p className="money minus">-₹{currentTotals.expense.toFixed(2)}</p>
        {renderTrend(expenseTrend, 'expense')}
      </div>
    </div>
  );
};
