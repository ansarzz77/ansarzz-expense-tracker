import { useContext, useState } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { TransactionItem } from './TransactionItem';
import type { Transaction } from '../context/AppReducer';

export const UpcomingMonth = () => {
  const { transactions } = useContext(GlobalContext);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const now = new Date();
  const nextMonth = (now.getMonth() + 1) % 12;
  const nextMonthYear = now.getFullYear() + (now.getMonth() === 11 ? 1 : 0);

  // Filter transactions for the upcoming month and year
  const upcomingMonthTransactions = transactions.filter((t: Transaction) => {
    const tDate = new Date(t.dueDate);
    return tDate.getMonth() === nextMonth && 
           tDate.getFullYear() === nextMonthYear;
  });

  // Expected Income for upcoming month
  const expIncome = upcomingMonthTransactions
    .filter((t: Transaction) => t.type === 'income')
    .reduce((acc: number, item: Transaction) => (acc += item.amount), 0)
    .toFixed(2);

  // Expected Expense for upcoming month
  const expExpense = upcomingMonthTransactions
    .filter((t: Transaction) => t.type === 'expense')
    .reduce((acc: number, item: Transaction) => (acc += item.amount), 0)
    .toFixed(2);

  // Projected Balance for upcoming month
  const projBalance = (
    upcomingMonthTransactions.reduce((acc: number, t: Transaction) => acc + (t.type === 'income' ? t.amount : -t.amount), 0)
  ).toFixed(2);

  // Get month name
  const monthName = new Date(nextMonthYear, nextMonth).toLocaleString('default', { month: 'long' });

  return (
    <div className="upcoming-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, border: 0, padding: 0 }}>Expected for {monthName}</h3>
        <button 
          className="icon-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ fontSize: '0.8rem', padding: '2px 10px' }}
        >
          {isCollapsed ? 'Show Details ▼' : 'Hide Details ▲'}
        </button>
      </div>
      
      <div className="projected-summary" style={{ background: '#eef2f7' }}>
        <div className="proj-item">
          <span>Exp. Income</span>
          <span className="plus">₹{expIncome}</span>
        </div>
        <div className="proj-item">
          <span>Exp. Expense</span>
          <span className="minus">₹{expExpense}</span>
        </div>
        <div className="proj-item" style={{ borderLeft: '1px solid #dee2e6' }}>
          <span>Proj. Balance</span>
          <span style={{ color: +projBalance >= 0 ? 'var(--income-color)' : 'var(--expense-color)' }}>
            ₹{projBalance}
          </span>
        </div>
      </div>

      {!isCollapsed && (
        <ul className="list">
          {upcomingMonthTransactions.length === 0 ? (
            <p className="empty-msg">No entries for {monthName} yet.</p>
          ) : (
            upcomingMonthTransactions.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          )}
        </ul>
      )}
      <div style={{ borderBottom: '1px solid #e1e8ed', margin: '20px 0' }}></div>
    </div>
  );
};
