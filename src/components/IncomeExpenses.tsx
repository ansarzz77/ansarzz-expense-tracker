import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const IncomeExpenses = () => {
  const { transactions } = useContext(GlobalContext);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Completed items in current month
  const currentMonthCompleted = transactions.filter(t => {
    const [y, m, d] = t.dueDate.split('-').map(Number);
    const tDate = new Date(y, m - 1, d);
    return t.status === 'completed' && 
           tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
  });

  const income = currentMonthCompleted
    .filter(transaction => transaction.type === 'income')
    .reduce((acc, item) => (acc += item.amount), 0)
    .toFixed(2);

  const expense = currentMonthCompleted
    .filter(transaction => transaction.type === 'expense')
    .reduce((acc, item) => (acc += item.amount), 0)
    .toFixed(2);

  const monthName = MONTH_NAMES[currentMonth];

  return (
    <div className="inc-exp-container">
      <div>
        <h4>{monthName} Actual Income</h4>
        <p className="money plus">+₹{income}</p>
      </div>
      <div>
        <h4>{monthName} Actual Expense</h4>
        <p className="money minus">-₹{expense}</p>
      </div>
    </div>
  );
};
