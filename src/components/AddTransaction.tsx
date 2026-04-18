import { useState, useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CsvImporter } from './CsvImporter';

const QUICK_CATEGORIES = ['Food', 'Transportation', 'Shopping', 'Entertainment', 'General'];
const QUICK_AMOUNTS = [10, 50, 100, 500, 1000];

export const AddTransaction = () => {
  const [activeTab, setActiveTab] = useState<'quick' | 'planned' | 'import'>('quick');
  const [text, setText] = useState('');
  const [amount, setAmount] = useState<string>('0');
  const [category, setCategory] = useState('General');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [frequency, setFrequency] = useState<'one-time' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'>('one-time');
  const [note, setNote] = useState('');

  const { addRecurringPlan, addTransaction } = useContext(GlobalContext);

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

    if (activeTab === 'quick') {
      addTransaction({
        id: Math.floor(Math.random() * 100000000),
        text,
        amount: numericAmount,
        category,
        type,
        dueDate: date,
        status: 'completed',
        note,
        paidDate: date
      });
    } else {
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
    }

    setText('');
    setAmount('0');
    setNote('');
  };

  const handleQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  return (
    <div className="add-transaction-card">
      <div className="tab-header">
        <button 
          className={`tab-btn ${activeTab === 'quick' ? 'active' : ''}`}
          onClick={() => setActiveTab('quick')}
        >
          Quick Add
        </button>
        <button 
          className={`tab-btn ${activeTab === 'planned' ? 'active' : ''}`}
          onClick={() => setActiveTab('planned')}
        >
          Plan Future
        </button>
        <button 
          className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          Import CSV
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'import' ? (
          <CsvImporter key="importer" onCancel={() => setActiveTab('quick')} />
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={onSubmit}
          >
            <div className="type-toggle">
              <button 
                type="button"
                className={`type-btn expense ${type === 'expense' ? 'active' : ''}`}
                onClick={() => setType('expense')}
              >
                Expense
              </button>
              <button 
                type="button"
                className={`type-btn income ${type === 'income' ? 'active' : ''}`}
                onClick={() => setType('income')}
              >
                Income
              </button>
            </div>

            <div className="form-row">
              <div className="form-control flex-2">
                <label htmlFor="text">Description</label>
                <input 
                  type="text" 
                  value={text} 
                  onChange={(e) => setText(e.target.value)} 
                  placeholder={type === 'expense' ? "e.g. Lunch" : "e.g. Bonus"} 
                  required 
                />
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

            {activeTab === 'quick' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="quick-options"
              >
                <div className="quick-chips-label">Quick Amount:</div>
                <div className="quick-chips">
                  {QUICK_AMOUNTS.map(val => (
                    <button 
                      key={val} 
                      type="button" 
                      className="chip-btn amount"
                      onClick={() => handleQuickAmount(val)}
                    >
                      +₹{val}
                    </button>
                  ))}
                  <button type="button" className="chip-btn clear" onClick={() => setAmount('0')}>Clear</button>
                </div>
              </motion.div>
            )}

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
              
              <div className="quick-chips">
                {QUICK_CATEGORIES.map(cat => (
                  <button 
                    key={cat} 
                    type="button" 
                    className={`chip-btn ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {activeTab === 'planned' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="form-row">
                    <div className="form-control">
                      <label htmlFor="frequency">Frequency</label>
                      <select value={frequency} onChange={(e) => setFrequency(e.target.value as any)}>
                        <option value="one-time">One-time</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="half-yearly">Half-yearly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div className="form-control">
                      <label htmlFor="date">Start Date</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="form-control">
              <label htmlFor="note">Notes (Optional)</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Extra details..." rows={1} />
            </div>
            
            <button className={`btn ${type === 'income' ? 'income-btn' : ''}`}>
              {activeTab === 'quick' ? `Add ${type === 'expense' ? 'Expense' : 'Income'}` : 'Add to Planning'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
