import { useContext, useState, useMemo } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { motion, AnimatePresence } from 'framer-motion';

export const FinancialWellness = () => {
  const { transactions, buckets, addBucket, updateBucket, deleteBucket } = useContext(GlobalContext);
  
  const [isAddingBucket, setIsAddingBucket] = useState(false);
  const [newBucket, setNewBucket] = useState({ name: '', target: '', saved: '' });

  // 1. Calculate No-Spend Streak
  const streak = useMemo(() => {
    const expenses = transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .map(t => t.paidDate || t.dueDate);
    
    if (expenses.length === 0) return 0;

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(today);
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasExpense = expenses.includes(dateStr);
      
      if (!hasExpense) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today has an expense, the streak is 0 unless it's the first check and we want to count yesterday?
        // Let's say if today has an expense, streak is 0. If yesterday had no expense, streak starts from yesterday.
        break;
      }
      
      if (currentStreak > 365) break; // Safety break
    }

    return currentStreak;
  }, [transactions]);

  // 2. Calculate Financial Health Score (0-100)
  const healthScore = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTransactions = transactions.filter(t => {
      const dateStr = t.paidDate || t.dueDate;
      const [y, m] = dateStr.split('-').map(Number);
      return (m - 1) === currentMonth && y === currentYear;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expense = monthTransactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((acc, t) => acc + t.amount, 0);

    // Savings Rate (40%)
    let savingsRateScore = 0;
    if (income > 0) {
      const rate = (income - expense) / income;
      savingsRateScore = Math.max(0, Math.min(1, rate)) * 40;
    }

    // Bucket Progress (30%)
    let bucketScore = 0;
    if (buckets.length > 0) {
      const avgProgress = buckets.reduce((acc, b) => acc + (b.saved / b.target), 0) / buckets.length;
      bucketScore = Math.min(1, avgProgress) * 30;
    }

    // Streak Bonus (20%) - 14 days for max bonus
    const streakScore = Math.min(1, streak / 14) * 20;

    // Planning Consistency (10%)
    const monthPlans = transactions.filter(t => {
      if (!t.planId) return false;
      const [y, m] = t.dueDate.split('-').map(Number);
      return (m - 1) === currentMonth && y === currentYear;
    });
    
    let planningScore = 0;
    if (monthPlans.length > 0) {
      const completedPlans = monthPlans.filter(t => t.status === 'completed').length;
      planningScore = (completedPlans / monthPlans.length) * 10;
    }

    return Math.round(savingsRateScore + bucketScore + streakScore + planningScore);
  }, [transactions, buckets, streak]);

  const handleAddBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBucket.name && newBucket.target) {
      addBucket({
        id: Math.floor(Math.random() * 100000000),
        name: newBucket.name,
        target: parseFloat(newBucket.target),
        saved: parseFloat(newBucket.saved) || 0,
        icon: '💰'
      });
      setNewBucket({ name: '', target: '', saved: '' });
      setIsAddingBucket(false);
    }
  };

  const updateSavedAmount = (id: number, amount: number) => {
    const bucket = buckets.find(b => b.id === id);
    if (bucket) {
      updateBucket({ ...bucket, saved: Math.max(0, bucket.saved + amount) });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--income-color)';
    if (score >= 50) return '#f59e0b';
    return 'var(--expense-color)';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="wellness-container">
      <div className="section-header">
        <h3>Financial Wellness</h3>
        <div className="streak-badge">
          <span className="streak-icon">🔥</span>
          <span className="streak-count">{streak} Day Streak</span>
        </div>
      </div>

      <div className="wellness-grid">
        <div className="health-score-card">
          <div className="score-circle-wrapper">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path className="circle"
                strokeDasharray={`${healthScore}, 100`}
                stroke={getScoreColor(healthScore)}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage" fill={getScoreColor(healthScore)}>{healthScore}</text>
            </svg>
          </div>
          <div className="score-info">
            <h4>Health Score</h4>
            <p className="score-status" style={{ color: getScoreColor(healthScore) }}>{getScoreText(healthScore)}</p>
          </div>
        </div>

        <div className="buckets-section">
          <div className="buckets-header">
            <h4>Savings Buckets</h4>
            <button className="btn-add-small" onClick={() => setIsAddingBucket(!isAddingBucket)}>
              {isAddingBucket ? 'Cancel' : '+ Add'}
            </button>
          </div>

          <AnimatePresence>
            {isAddingBucket && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddBucket}
                className="bucket-form"
              >
                <input 
                  type="text" 
                  placeholder="Goal Name" 
                  value={newBucket.name}
                  onChange={e => setNewBucket({...newBucket, name: e.target.value})}
                  required
                />
                <div className="form-row">
                  <input 
                    type="number" 
                    placeholder="Target ₹" 
                    value={newBucket.target}
                    onChange={e => setNewBucket({...newBucket, target: e.target.value})}
                    required
                  />
                  <input 
                    type="number" 
                    placeholder="Saved ₹" 
                    value={newBucket.saved}
                    onChange={e => setNewBucket({...newBucket, saved: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn-small">Create Bucket</button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="buckets-list">
            {buckets.length === 0 ? (
              <p className="empty-buckets">No savings goals yet. Start one today!</p>
            ) : (
              buckets.map(bucket => {
                const progress = Math.min(100, (bucket.saved / bucket.target) * 100);
                return (
                  <div key={bucket.id} className="bucket-item">
                    <div className="bucket-info">
                      <span className="bucket-name">{bucket.icon} {bucket.name}</span>
                      <span className="bucket-values">₹{bucket.saved.toLocaleString()} / ₹{bucket.target.toLocaleString()}</span>
                    </div>
                    <div className="bucket-progress-bar">
                      <motion.div 
                        className="bucket-progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        style={{ backgroundColor: progress >= 100 ? 'var(--income-color)' : 'var(--primary-color)' }}
                      />
                    </div>
                    <div className="bucket-actions">
                      <button onClick={() => updateSavedAmount(bucket.id, 100)}>+₹100</button>
                      <button onClick={() => updateSavedAmount(bucket.id, 500)}>+₹500</button>
                      <button className="delete-bucket" onClick={() => deleteBucket(bucket.id)}>×</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
