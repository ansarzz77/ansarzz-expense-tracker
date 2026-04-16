import { useState, useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';

export const AddTransaction = () => {
  const [text, setText] = useState('');
  const [amount, setAmount] = useState<string>('0');
  const [category, setCategory] = useState('General');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [frequency, setFrequency] = useState<'one-time' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'>('one-time');
  const [note, setNote] = useState('');

  const { addRecurringPlan } = useContext(GlobalContext);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);

    if (!text.trim()) {
      alert('Please add a description');
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    addRecurringPlan({
      id: Math.floor(Math.random() * 100000000),
      text,
      amount: numericAmount,
      category,
      type,
      frequency,
      startDate: date,
      note,
    });

    setText('');
    setAmount('0');
    setNote('');
  };

  return (
    <div className="add-transaction-card">
      <h3>Plan New Entry</h3>
      <form onSubmit={onSubmit}>
        <div className="form-row">
          <div className="form-control flex-2">
            <label htmlFor="text">Description</label>
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Rent" required />
          </div>
          <div className="form-control flex-1">
            <label htmlFor="amount">Amount (₹)</label>
            <input 
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="0.00" 
              required 
              onFocus={(e) => e.target.value === '0' && setAmount('')}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-control">
            <label htmlFor="type">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as 'income' | 'expense')}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="form-control">
            <label htmlFor="frequency">Frequency</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value as 'one-time' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly')}>
              <option value="one-time">One-time</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half-yearly">Half-yearly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-control">
            <label htmlFor="category">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
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
          </div>
          <div className="form-control">
            <label htmlFor="date">Start Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>

        <div className="form-control">
          <label htmlFor="note">Notes (Optional)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Extra details..." rows={2} />
        </div>
        
        <button className="btn">Add Entry to Plan</button>
      </form>
    </div>
  );
};
