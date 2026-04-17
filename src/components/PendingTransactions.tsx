import { useContext, useState } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { TransactionItem } from './TransactionItem';
import type { Transaction } from '../context/AppReducer';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const PendingTransactions = () => {
  const { transactions } = useContext(GlobalContext);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter transactions for the current month and year using manual parsing
  const currentMonthTransactions = transactions.filter((t: Transaction) => {
    const [y, m, d] = t.dueDate.split('-').map(Number);
    const tDate = new Date(y, m - 1, d);
    return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
  });

  // Pending items specifically for the current month (for the list display)
  const pendingTransactions = currentMonthTransactions.filter((t: Transaction) => t.status === 'pending');

  // Expected Income for current month only (completed + pending)
  const upcomingIncome = currentMonthTransactions
    .filter((t: Transaction) => t.type === 'income')
    .reduce((acc: number, item: Transaction) => (acc += item.amount), 0)
    .toFixed(2);

  // Expected Expense for current month only (completed + pending)
  const upcomingExpense = currentMonthTransactions
    .filter((t: Transaction) => t.type === 'expense')
    .reduce((acc: number, item: Transaction) => (acc += item.amount), 0)
    .toFixed(2);

  // Projected Balance for current month only
  const projectedBalance = currentMonthTransactions
    .reduce((acc: number, t: Transaction) => acc + (t.type === 'income' ? t.amount : -t.amount), 0)
    .toFixed(2);

  const monthName = MONTH_NAMES[currentMonth];

  return (
    <div className="pending-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, border: 0, padding: 0 }}>Dues for {monthName}</h3>
        <button 
          className="icon-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ fontSize: '0.8rem', padding: '2px 10px' }}
        >
          {isCollapsed ? 'Show Dues ▼' : 'Hide Dues ▲'}
        </button>
      </div>

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

      {!isCollapsed && (
        <ul className="list">
          {pendingTransactions.length === 0 ? (
            <p className="empty-msg">No pending items for this month.</p>
          ) : (
            pendingTransactions.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          )}
        </ul>
      )}
      <div style={{ borderBottom: '1px solid #e1e8ed', margin: '20px 0' }}></div>
    </div>
  );
};
