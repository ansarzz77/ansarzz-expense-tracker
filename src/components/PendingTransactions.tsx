import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { TransactionItem } from './TransactionItem';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const PendingTransactions = () => {
  const { transactions } = useContext(GlobalContext);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter transactions for the current month and year using manual parsing
  const currentMonthTransactions = transactions.filter(t => {
    const [y, m, d] = t.dueDate.split('-').map(Number);
    const tDate = new Date(y, m - 1, d);
    return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
  });

  // Pending items specifically for the current month (for the list display)
  const pendingTransactions = currentMonthTransactions.filter(t => t.status === 'pending');

  // Expected Income for current month only (completed + pending)
  const upcomingIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, item) => (acc += item.amount), 0)
    .toFixed(2);

  // Expected Expense for current month only (completed + pending)
  const upcomingExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, item) => (acc += item.amount), 0)
    .toFixed(2);

  // Projected Balance for current month only
  const projectedBalance = currentMonthTransactions
    .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0)
    .toFixed(2);

  const monthName = MONTH_NAMES[currentMonth];

  return (
    <div className="pending-section">
      <h3>Dues for {monthName}</h3>
      <div className="projected-summary">
        <div className="proj-item">
          <span>Proj. Income</span>
          <span className="plus">₹{upcomingIncome}</span>
        </div>
        <div className="proj-item">
          <span>Proj. Expense</span>
          <span className="minus">₹{upcomingExpense}</span>
        </div>
        <div className="proj-item" style={{ borderLeft: '1px solid #dee2e6' }}>
          <span>Proj. Balance</span>
          <span style={{ color: +projectedBalance >= 0 ? 'var(--income-color)' : 'var(--expense-color)' }}>
            ₹{projectedBalance}
          </span>
        </div>
      </div>
      <ul className="list">
        {pendingTransactions.length === 0 ? (
          <p className="empty-msg">No pending items for this month.</p>
        ) : (
          pendingTransactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        )}
      </ul>
    </div>
  );
};
