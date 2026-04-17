import { useContext, useState } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { TransactionItem } from './TransactionItem';
import type { Transaction } from '../context/AppReducer';

export const TransactionList = () => {
  const { transactions } = useContext(GlobalContext);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const completedTransactions = transactions.filter((t: Transaction) => t.status === 'completed');

  return (
    <div className="history-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, border: 0, padding: 0 }}>Actual History</h3>
        <button 
          className="icon-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ fontSize: '0.8rem', padding: '2px 10px' }}
        >
          {isCollapsed ? 'Show History ▼' : 'Hide History ▲'}
        </button>
      </div>

      {!isCollapsed && (
        <ul className="list">
          {completedTransactions.length === 0 ? (
            <p className="empty-msg">No completed transactions yet.</p>
          ) : (
            completedTransactions.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          )}
        </ul>
      )}
      <div style={{ borderBottom: '1px solid #e1e8ed', margin: '20px 0' }}></div>
    </div>
  );
};
