import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import { TransactionItem } from './TransactionItem';

export const TransactionList = () => {
  const { transactions } = useContext(GlobalContext);

  const completedTransactions = transactions.filter(t => t.status === 'completed');

  return (
    <>
      <h3>Actual History</h3>
      <ul className="list">
        {completedTransactions.length === 0 ? (
          <p className="empty-msg">No completed transactions yet.</p>
        ) : (
          completedTransactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        )}
      </ul>
    </>
  );
};
