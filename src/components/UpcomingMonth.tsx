import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { TransactionItem } from './TransactionItem';

export const UpcomingMonth = () => {
  const { transactions } = useContext(GlobalContext);

  const now = new Date();
  const nextMonth = (now.getMonth() + 1) % 12;
  const nextMonthYear = now.getFullYear() + (now.getMonth() === 11 ? 1 : 0);

  // Filter transactions for the upcoming month and year
  const upcomingMonthTransactions = transactions.filter(t => {
    const tDate = new Date(t.dueDate);
    return tDate.getMonth() === nextMonth && 
           tDate.getFullYear() === nextMonthYear;
  });

  // Expected Income for upcoming month
  const expIncome = upcomingMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, item) => (acc += item.amount), 0)
    .toFixed(2);

  // Expected Expense for upcoming month
  const expExpense = upcomingMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, item) => (acc += item.amount), 0)
    .toFixed(2);

  // Projected Balance for upcoming month
  const projBalance = (
    upcomingMonthTransactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0)
  ).toFixed(2);

  // Get month name
  const monthName = new Date(nextMonthYear, nextMonth).toLocaleString('default', { month: 'long' });

  return (
    <div className="upcoming-section">
      <h3>Expected for {monthName}</h3>
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
      <ul className="list">
        {upcomingMonthTransactions.length === 0 ? (
          <p className="empty-msg">No entries for {monthName} yet.</p>
        ) : (
          upcomingMonthTransactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        )}
      </ul>
    </div>
  );
};
