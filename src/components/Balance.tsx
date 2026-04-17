import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import type { Transaction } from '../context/AppReducer';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const Balance = () => {
  const { transactions } = useContext(GlobalContext);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Actual Balance: Total of all COMPLETED items across ALL time (total cash on hand)
  const actualTransactions = transactions.filter((t: Transaction) => t.status === 'completed');
  const actualTotal = actualTransactions.reduce((acc: number, t: Transaction) => 
    acc + (t.type === 'income' ? t.amount : -t.amount), 0
  ).toFixed(2);

  // Current Month's Pending Dues
  const currentMonthPending = transactions.filter((t: Transaction) => {
    const [y, m, d] = t.dueDate.split('-').map(Number);
    const tDate = new Date(y, m - 1, d);
    return t.status === 'pending' && 
           tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
  });

  const pendingTotal = currentMonthPending.reduce((acc: number, t: Transaction) => 
    acc + (t.type === 'income' ? t.amount : -t.amount), 0
  ).toFixed(2);

  const monthName = MONTH_NAMES[currentMonth];

  return (
    <div className="balance-container">
      <h4>Total Actual Balance</h4>
      <h1>₹{actualTotal}</h1>
      <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span>{monthName} Dues: </span>
        <span style={{ fontWeight: 'bold', color: +pendingTotal >= 0 ? 'var(--income-color)' : 'var(--expense-color)' }}>
          ₹{pendingTotal}
        </span>
      </div>
    </div>
  );
};
