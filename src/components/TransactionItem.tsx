import { useContext, useState } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import type { Transaction } from '../context/AppReducer';
import { motion } from 'framer-motion';

export const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const { deleteTransaction, updateTransaction, settleTransaction, addRecurringPlan } = useContext(GlobalContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(transaction.text);
  const [editAmount, setEditAmount] = useState(transaction.amount);
  const [editCategory, setEditCategory] = useState(transaction.category);
  const [editType, setEditType] = useState(transaction.type);
  const [editStatus, setEditStatus] = useState(transaction.status);
  const [editDate, setEditDate] = useState(transaction.dueDate);
  const [editNote, setEditNote] = useState(transaction.note);

  const sign = transaction.type === 'income' ? '+' : '-';

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateTransaction({
      ...transaction,
      text: editText,
      amount: editAmount,
      category: editCategory,
      type: editType,
      status: editStatus,
      dueDate: editDate,
      note: editNote,
    });
    setIsEditing(false);
  };

  const onSettle = () => {
    const today = new Date().toISOString().split('T')[0];
    settleTransaction(transaction.id, today);
  };

  const makeRecurring = (frequency: 'monthly' | 'quarterly' | 'yearly') => {
    addRecurringPlan({
      id: Math.floor(Math.random() * 100000000),
      text: transaction.text,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      frequency,
      startDate: transaction.dueDate,
      note: transaction.note,
    });
    // Delete the one-time item as it's now part of a plan
    deleteTransaction(transaction.id);
  };

  if (isEditing) {
    return (
      <motion.li 
        layout
        layoutId={String(transaction.id)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={editType === 'income' ? 'plus editing' : 'minus editing'} 
        style={{ display: 'block' }}
      >
        <form onSubmit={handleUpdate} className="edit-form">
          <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} required />
          <input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(+e.target.value)} required />
          <select value={editType} onChange={(e) => setEditType(e.target.value as 'income' | 'expense')}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as 'completed' | 'pending')}>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
          <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
            <option value="General">General</option>
            <option value="Food">Food</option>
            <option value="Rent">Rent</option>
            <option value="Salary">Salary</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Transportation">Transportation</option>
            <option value="Shopping">Shopping</option>
            <option value="Loan Instalment">Loan Instalment</option>
            <option value="Society Maintenance">Society Maintenance</option>
            <option value="Property Tax">Property Tax</option>
            <option value="Utility-Self">Utility-Self</option>
            <option value="Utility-Parents">Utility-Parents</option>
            <option value="Car Expense">Car Expense</option>
            <option value="Mom Dad to Spent">Mom Dad to Spent</option>
            <option value="Spouse Contribution">Spouse Contribution</option>
            <option value="Kids Madrassa">Kids Madrassa</option>
            <option value="Investment">Investment</option>
            <option value="Credit Card">Credit Card</option>
          </select>
          <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
          <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Note" />
          <div className="edit-buttons">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </motion.li>
    );
  }

  return (
    <motion.li 
      layout
      layoutId={String(transaction.id)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={transaction.type === 'income' ? 'plus' : 'minus'}
    >
      <div className="transaction-info">
        <span className="transaction-text">{transaction.text}</span>
        <div className="transaction-meta">
          <span className="transaction-category">{transaction.category}</span>
          <span className="transaction-date">Due: {transaction.dueDate}</span>
          {transaction.paidDate && <span className="transaction-paid">Paid: {transaction.paidDate}</span>}
          <span className={`status-badge ${transaction.status}`}>{transaction.status}</span>
        </div>
        {transaction.note && <p className="transaction-note">{transaction.note}</p>}
        {!transaction.planId && transaction.status === 'pending' && (
          <div className="recurring-upsell">
            <span>Repeat: </span>
            <button onClick={() => makeRecurring('monthly')}>Monthly</button>
            <button onClick={() => makeRecurring('quarterly')}>Quarterly</button>
          </div>
        )}
      </div>
      <div className="transaction-amount-container">
        <div className="transaction-amount">
          <span>{sign}₹{Math.abs(transaction.amount).toFixed(2)}</span>
        </div>
        <div className="action-btns">
          {transaction.status === 'pending' && (
            <button onClick={onSettle} className="settle-btn" title="Mark as Settle">✓</button>
          )}
          <button onClick={() => setIsEditing(true)} className="edit-btn-icon">✎</button>
          <button onClick={() => deleteTransaction(transaction.id)} className="delete-btn">x</button>
        </div>
      </div>
    </motion.li>
  );
};
