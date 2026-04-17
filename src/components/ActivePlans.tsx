import { useContext, useState } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import type { RecurringPlan } from '../context/AppReducer';

export const ActivePlans = () => {
  const { plans, deletePlan, updatePlan } = useContext(GlobalContext);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editAmount, setEditAmount] = useState<string>('0');
  const [editCategory, setEditCategory] = useState('General');
  const [editType, setEditType] = useState<'income' | 'expense'>('expense');
  const [editNote, setEditNote] = useState('');
  const [editFrequency, setEditFrequency] = useState<'one-time' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'>('monthly');

  const startEdit = (plan: RecurringPlan) => {
    setEditingId(plan.id);
    setEditText(plan.text);
    setEditAmount(plan.amount.toString());
    setEditCategory(plan.category);
    setEditType(plan.type);
    setEditNote(plan.note || '');
    setEditFrequency(plan.frequency);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const plan = plans.find((p: RecurringPlan) => p.id === editingId);
    const numericAmount = parseFloat(editAmount);

    if (plan && !isNaN(numericAmount)) {
      updatePlan({
        ...plan,
        text: editText,
        amount: numericAmount,
        category: editCategory,
        type: editType,
        note: editNote,
        frequency: editFrequency
      }, true);
    }
    setEditingId(null);
  };

  return (
    <div className="plans-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, border: 0, padding: 0 }}>Active Recurring Plans</h3>
        <button 
          className="icon-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ fontSize: '0.8rem', padding: '2px 10px' }}
        >
          {isCollapsed ? 'Show Plans ▼' : 'Hide Plans ▲'}
        </button>
      </div>

      {!isCollapsed && (
        <ul className="list">
          {plans.length === 0 ? (
            <p className="empty-msg">No active plans yet.</p>
          ) : (
            plans.map(plan => (
              <li key={plan.id} className={plan.type === 'income' ? 'plus' : 'minus'} style={{ display: 'block' }}>
                {editingId === plan.id ? (
                  <form onSubmit={handleUpdate} className="edit-form">
                    <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} required />
                    <input 
                      type="number" 
                      step="0.01" 
                      value={editAmount} 
                      onChange={(e) => setEditAmount(e.target.value)} 
                      required 
                      onFocus={(e) => e.target.value === '0' && setEditAmount('')}
                    />
                    <select value={editType} onChange={(e) => setEditType(e.target.value as 'income' | 'expense')}>
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                    <select value={editFrequency} onChange={(e) => setEditFrequency(e.target.value as 'one-time' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly')}>
                      <option value="one-time">One-time (Stop future)</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="half-yearly">Half-yearly</option>
                      <option value="yearly">Yearly</option>
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
                    <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Note" style={{ width: '100%', marginTop: '5px' }} />
                    <div className="edit-buttons">
                      <button type="submit" className="save-btn">Save</button>
                      <button type="button" onClick={() => setEditingId(null)} className="cancel-btn">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <div className="transaction-info">
                        <span className="transaction-text">{plan.text}</span>
                        <div className="transaction-meta">
                          <span className="transaction-category">{plan.category}</span>
                          <span className="transaction-frequency" style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                            {plan.frequency}
                          </span>
                        </div>
                        {plan.note && <p className="transaction-note" style={{ margin: '5px 0 0', fontSize: '0.85em', color: '#666' }}>{plan.note}</p>}
                      </div>
                      <div className="transaction-amount-container">
                        <div className="transaction-amount">
                          <span>₹{plan.amount.toFixed(2)}</span>
                        </div>
                        <div className="action-btns">
                          <button onClick={() => startEdit(plan)} className="edit-btn-icon">✎</button>
                          <button onClick={() => deletePlan(plan.id)} className="delete-btn">x</button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </li>
            ))
          )}
        </ul>
      )}
      <div style={{ borderBottom: '1px solid #e1e8ed', margin: '20px 0' }}></div>
    </div>
  );
};
