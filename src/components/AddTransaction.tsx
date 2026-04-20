import { useState, useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CsvImporter } from './CsvImporter';
import { parseNaturalLanguageTransaction } from '../services/aiService';

const QUICK_AMOUNTS = [10, 50, 100, 500, 1000];

export const AddTransaction = () => {
  const { addRecurringPlan, addTransaction, categories, addCategory } = useContext(GlobalContext);
  
  const [activeTab, setActiveTab] = useState<'quick' | 'planned' | 'import' | 'magic'>('quick');
  const [text, setText] = useState('');
  const [amount, setAmount] = useState<string>('0');
  const [category, setCategory] = useState('General');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDate, setShowDate] = useState(false);
  const [frequency, setFrequency] = useState<'one-time' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'>('one-time');
  const [note, setNote] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Magic Tab State
  const [magicInput, setMagicInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition. Try Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMagicInput(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleMagicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicInput.trim()) return;

    setIsParsing(true);
    try {
      const parsed = await parseNaturalLanguageTransaction(magicInput, categories);
      setIsParsing(false);

      if (parsed) {
        addTransaction({
          id: Math.floor(Math.random() * 100000000),
          text: parsed.text,
          amount: parsed.amount,
          category: parsed.category,
          type: parsed.type,
          dueDate: parsed.date,
          status: 'completed',
          note: parsed.note || '',
          paidDate: parsed.date
        });
        setMagicInput('');
        setActiveTab('quick');
      }
    } catch (err: any) {
      setIsParsing(false);
      console.error("Magic Submit Error:", err);
      // Show the actual error message from the AI service
      alert(`AI ERROR: ${err.message}`);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const cats = newCategoryName.split(',').map(c => c.trim()).filter(c => c.length > 0);
      cats.forEach(cat => addCategory(cat));
      if (cats.length > 0) setCategory(cats[cats.length - 1]);
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!text.trim()) { alert('Please add a description'); return; }
    if (isNaN(numericAmount) || numericAmount <= 0) { alert('Please enter a valid amount greater than 0'); return; }

    if (activeTab === 'quick') {
      addTransaction({
        id: Math.floor(Math.random() * 100000000),
        text, amount: numericAmount, category, type, dueDate: date, status: 'completed', note, paidDate: date
      });
    } else {
      addRecurringPlan({
        id: Math.floor(Math.random() * 100000000),
        text, amount: numericAmount, category, type, frequency, startDate: date, note,
      });
    }
    setText(''); setAmount('0'); setNote(''); setShowDate(false);
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  return (
    <div className="add-transaction-card">
      <div className="tab-header">
        <button className={`tab-btn ${activeTab === 'magic' ? 'active' : ''}`} onClick={() => setActiveTab('magic')}>✨ Magic</button>
        <button className={`tab-btn ${activeTab === 'quick' ? 'active' : ''}`} onClick={() => setActiveTab('quick')}>Quick Add</button>
        <button className={`tab-btn ${activeTab === 'planned' ? 'active' : ''}`} onClick={() => setActiveTab('planned')}>Plan Future</button>
        <button className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`} onClick={() => setActiveTab('import')}>Import CSV</button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'import' ? (
          <CsvImporter key="importer" onCancel={() => setActiveTab('quick')} />
        ) : activeTab === 'magic' ? (
          <motion.form key="magic-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleMagicSubmit}>
            <div className="form-control">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="magic">AI Transaction Parser</label>
                <button type="button" className={`mic-btn ${isListening ? 'listening' : ''}`} onClick={startListening} title="Click to speak" style={{ background: isListening ? 'var(--expense-color)' : 'var(--interactive-bg)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', transition: 'all 0.3s ease', boxShadow: isListening ? '0 0 10px var(--expense-color)' : 'none' }}>
                  {isListening ? '🛑' : '🎤'}
                </button>
              </div>
              <textarea value={magicInput} onChange={(e) => setMagicInput(e.target.value)} placeholder={isListening ? "Listening..." : "e.g. Spent 500 on coffee today morning at Starbucks"} rows={3} required />
              <p className="hint">Try: "Received 50000 salary yesterday" or "Movie at PVR for 800 last Sunday"</p>
            </div>
            <button className="btn magic-btn" disabled={isParsing || isListening}>{isParsing ? 'AI is thinking...' : '✨ Add with AI'}</button>
          </motion.form>
        ) : (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={onSubmit}>
            <div className="type-toggle">
              <button type="button" className={`type-btn expense ${type === 'expense' ? 'active' : ''}`} onClick={() => setType('expense')}>Expense</button>
              <button type="button" className={`type-btn income ${type === 'income' ? 'active' : ''}`} onClick={() => setType('income')}>Income</button>
            </div>
            <div className="form-row">
              <div className="form-control flex-2">
                <label htmlFor="text">Description</label>
                <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={type === 'expense' ? "e.g. Lunch" : "e.g. Bonus"} required />
              </div>
              <div className="form-control flex-1">
                <label htmlFor="amount">Amount (₹)</label>
                <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required onFocus={(e) => e.target.value === '0' && setAmount('')} />
              </div>
            </div>
            {activeTab === 'quick' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="quick-options">
                <div className="quick-chips-label">Quick Amount:</div>
                <div className="quick-chips">
                  {QUICK_AMOUNTS.map(val => (
                    <button key={val} type="button" className="chip-btn amount" onClick={() => handleQuickAmount(val)}>+₹{val}</button>
                  ))}
                  <button type="button" className="chip-btn clear" onClick={() => setAmount('0')}>Clear</button>
                </div>
                <div className="quick-chips-label" style={{ marginTop: '10px' }}>Options:</div>
                <div className="quick-chips">
                  <button type="button" className={`chip-btn ${showDate ? 'active' : ''}`} onClick={() => { if (showDate) setDate(new Date().toISOString().split('T')[0]); setShowDate(!showDate); }}>
                    📅 {showDate ? 'Use Today' : 'Change Date'}
                  </button>
                </div>
              </motion.div>
            )}
            <div className="form-control">
              <label htmlFor="category">Category</label>
              {isAddingCategory ? (
                <div className="new-category-input">
                  <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category name (e.g. Travel, Food)" autoFocus />
                  <div className="new-cat-actions">
                    <button type="button" onClick={handleAddCategory} className="btn-small">Add</button>
                    <button type="button" onClick={() => setIsAddingCategory(false)} className="btn-small secondary">Cancel</button>
                  </div>
                </div>
              ) : (
                <select value={category} onChange={(e) => { if (e.target.value === 'NEW') { setIsAddingCategory(true); } else { setCategory(e.target.value); } }}>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="NEW">+ Add New Category...</option>
                </select>
              )}
              <div className="quick-chips">
                {categories.slice(0, 5).map(cat => (
                  <button key={cat} type="button" className={`chip-btn ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
                ))}
              </div>
            </div>
            <AnimatePresence>
              {(activeTab === 'planned' || (activeTab === 'quick' && showDate)) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div className="form-row">
                    {activeTab === 'planned' ? (
                      <>
                        <div className="form-control">
                          <label htmlFor="frequency">Frequency</label>
                          <select value={frequency} onChange={(e) => setFrequency(e.target.value as any)}>
                            <option value="one-time">One-time</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="half-yearly">Half-yearly</option><option value="yearly">Yearly</option>
                          </select>
                        </div>
                        <div className="form-control">
                          <label htmlFor="date">Start Date</label>
                          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                        </div>
                      </>
                    ) : (
                      <div className="form-control">
                        <label htmlFor="date">Transaction Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                      </div>
                    )}
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
