import { useContext, useState } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { TransactionItem } from './TransactionItem';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const FutureProjections = () => {
  const { transactions } = useContext(GlobalContext);
  const [collapsedMonths, setCollapsedMonths] = useState<Record<number, boolean>>({
    0: true, // Index 0 (Month +1)
    1: true, // Index 1 (Month +2)
    2: true  // Index 2 (Month +3)
  });

  const toggleMonth = (index: number) => {
    setCollapsedMonths(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getMonthData = (monthsAhead: number) => {
    const now = new Date();
    // Create a date for the 1st of the target month in local time
    const targetDate = new Date(now.getFullYear(), now.getMonth() + monthsAhead, 1);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    const monthTransactions = transactions.filter(t => {
      // Split YYYY-MM-DD and create local date to compare
      const [y, m, d] = t.dueDate.split('-').map(Number);
      const tDate = new Date(y, m - 1, d);
      return tDate.getMonth() === targetMonth && tDate.getFullYear() === targetYear;
    });

    const expIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, item) => (acc += item.amount), 0)
      .toFixed(2);

    const expExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, item) => (acc += item.amount), 0)
      .toFixed(2);

    const projBalance = (
      monthTransactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0)
    ).toFixed(2);

    const monthName = `${MONTH_NAMES[targetMonth]} ${targetYear}`;

    // For future months, we likely only care about pending items in the list
    const pendingOnly = monthTransactions.filter(t => t.status === 'pending');

    return {
      monthName,
      expIncome,
      expExpense,
      projBalance,
      pendingOnly
    };
  };

  const projections = [getMonthData(1), getMonthData(2), getMonthData(3)];

  return (
    <div className="future-projections">
      {projections.map((data, index) => (
        <div key={index} className="upcoming-section" style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, border: 0, padding: 0 }}>Expected for {data.monthName}</h3>
            <button 
              className="icon-btn" 
              onClick={() => toggleMonth(index)}
              style={{ fontSize: '0.8rem', padding: '2px 10px' }}
            >
              {collapsedMonths[index] ? 'Show Details ▼' : 'Hide Details ▲'}
            </button>
          </div>

          <div className="projected-summary" style={{ background: index === 0 ? '#eef2f7' : index === 1 ? '#f1f5f9' : '#f8fafc' }}>
            <div className="proj-item">
              <span>Proj. Income</span>
              <span className="plus">₹{data.expIncome}</span>
            </div>
            <div className="proj-item">
              <span>Proj. Expense</span>
              <span className="minus">₹{data.expExpense}</span>
            </div>
            <div className="proj-item" style={{ borderLeft: '1px solid #dee2e6' }}>
              <span>Proj. Balance</span>
              <span style={{ color: +data.projBalance >= 0 ? 'var(--income-color)' : 'var(--expense-color)' }}>
                ₹{data.projBalance}
              </span>
            </div>
          </div>

          {!collapsedMonths[index] && (
            <ul className="list">
              {data.pendingOnly.length === 0 ? (
                <p className="empty-msg">No entries for {data.monthName} yet.</p>
              ) : (
                data.pendingOnly.map(transaction => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))
              )}
            </ul>
          )}
          <div style={{ borderBottom: '1px solid #e1e8ed', margin: '20px 0' }}></div>
        </div>
      ))}
    </div>
  );
};
