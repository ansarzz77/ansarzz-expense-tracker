import { useContext, useState, useMemo } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import type { Transaction } from '../context/AppReducer';

const COLORS = [
  '#4da674', '#88c9a1', '#2d6a4f', '#74c69d', '#b7e4c7', 
  '#52b788', '#40916c', '#1b4332', '#95d5b2', '#d8f3dc'
];

interface CategorySummary {
  category: string;
  amount: number;
  color: string;
  percentage: number;
  startAngle: number;
  endAngle: number;
  rollingAverage: number;
}

export const SpendDistribution = () => {
  const { transactions } = useContext(GlobalContext);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [view, setView] = useState<'donut' | 'bar'>('bar');

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const relevantTransactions = useMemo(() => 
    transactions.filter((t: Transaction) => t.status === 'completed'),
    [transactions]
  );

  const categoryData = useMemo(() => {
    // 1. Calculate Current Month Totals
    const currentMonthNet: Record<string, number> = {};
    let grandTotalExpense = 0;

    const currentMonthTransactions = relevantTransactions.filter(t => {
      const dateStr = t.paidDate || t.dueDate;
      const [y, m] = dateStr.split('-').map(Number);
      return (m - 1) === currentMonth && y === currentYear;
    });

    currentMonthTransactions.forEach((t: Transaction) => {
      const amount = t.type === 'expense' ? t.amount : -t.amount;
      currentMonthNet[t.category] = (currentMonthNet[t.category] || 0) + amount;
    });

    // Only consider categories with net positive expense for the "Spend" distribution
    const spendCategories = Object.entries(currentMonthNet)
      .filter(([_, net]) => net > 0);
    
    grandTotalExpense = spendCategories.reduce((acc, [_, net]) => acc + net, 0);

    // 2. Calculate Rolling 3-Month Average
    const rollingNet: Record<string, number> = {};
    const prevMonths: { m: number; y: number }[] = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date(currentYear, currentMonth - i, 1);
      prevMonths.push({ m: d.getMonth(), y: d.getFullYear() });
    }

    const historicalTransactions = relevantTransactions.filter(t => {
      const dateStr = t.paidDate || t.dueDate;
      const [y, m] = dateStr.split('-').map(Number);
      return prevMonths.some(pm => pm.m === (m - 1) && pm.y === y);
    });

    historicalTransactions.forEach((t: Transaction) => {
      const amount = t.type === 'expense' ? t.amount : -t.amount;
      rollingNet[t.category] = (rollingNet[t.category] || 0) + amount;
    });

    const summaries: CategorySummary[] = [];
    let currentAngle = 0;

    // Grouping logic for "Others" if too many categories
    const sortedSpend = spendCategories.sort((a, b) => b[1] - a[1]);
    const threshold = grandTotalExpense * 0.03; // 3% threshold for "Others"
    
    const topCategories = sortedSpend.filter(([_, amt]) => amt >= threshold);
    const otherCategories = sortedSpend.filter(([_, amt]) => amt < threshold);

    const processedCategories = [...topCategories];
    if (otherCategories.length > 0) {
      const othersTotal = otherCategories.reduce((acc, [_, amt]) => acc + amt, 0);
      processedCategories.push(['Others', othersTotal]);
    }

    processedCategories.forEach(([category, amount], index) => {
        const percentage = grandTotalExpense > 0 ? (amount / grandTotalExpense) : 0;
        const angleSize = percentage * 360;
        
        let avg = 0;
        if (category === 'Others') {
          avg = otherCategories.reduce((acc, [name]) => acc + (rollingNet[name] || 0), 0) / 3;
        } else {
          avg = (rollingNet[category] || 0) / 3;
        }

        summaries.push({
          category,
          amount,
          color: COLORS[index % COLORS.length],
          percentage: percentage * 100,
          startAngle: currentAngle,
          endAngle: currentAngle + angleSize,
          rollingAverage: Math.max(0, avg)
        });
        
        currentAngle += angleSize;
      });

    return { 
      summaries, 
      grandTotal: grandTotalExpense, 
      currentMonthTransactions,
      otherCategoryNames: otherCategories.map(([name]) => name)
    };
  }, [relevantTransactions, currentMonth, currentYear]);

  // SVG Helper: Convert polar coordinates to Cartesian
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  // SVG Helper: Generate path for an arc
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    // If it's a full circle (or very close), the arc command might fail
    const diff = endAngle - startAngle;
    if (diff >= 359.99) {
      return [
        'M', x, y - radius,
        'A', radius, radius, 0, 1, 1, x, y + radius,
        'A', radius, radius, 0, 1, 1, x, y - radius,
        'Z'
      ].join(' ');
    }

    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = diff <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'L', x, y,
      'Z'
    ].join(' ');
  };

  const handleSliceClick = (category: string) => {
    setSelectedCategory(prev => prev === category ? null : category);
  };

  const selectedTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    if (selectedCategory === 'Others') {
      return categoryData.currentMonthTransactions.filter(
        (t: Transaction) => categoryData.otherCategoryNames.includes(t.category)
      );
    }
    return categoryData.currentMonthTransactions.filter(
      (t: Transaction) => t.category === selectedCategory
    );
  }, [selectedCategory, categoryData]);

  const renderBenchmark = (summary: CategorySummary) => {
    if (summary.rollingAverage === 0) return <span className="benchmark-label new">New</span>;
    
    const diff = ((summary.amount - summary.rollingAverage) / summary.rollingAverage) * 100;
    const isPositive = diff > 0;
    const isNeutral = Math.abs(diff) < 0.1;
    
    // For expense, positive (increase) is bad.
    const colorClass = isPositive ? 'trend-up-bad' : (isNeutral ? 'trend-neutral' : 'trend-down-good');
    const icon = isPositive ? '▲' : (isNeutral ? '•' : '▼');
    
    return (
      <span className={`benchmark-label ${colorClass}`} title={`Avg: ₹${summary.rollingAverage.toFixed(0)}`}>
        {icon} {Math.abs(diff).toFixed(0)}%
      </span>
    );
  };

  if (categoryData.grandTotal === 0) {
    return null;
  }

  return (
    <div className="spend-distribution-container card">
      <div className="section-header">
        <h3>Spend Distribution</h3>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${view === 'bar' ? 'active' : ''}`} 
            onClick={() => setView('bar')}
          >
            📊 Bar
          </button>
          <button 
            className={`toggle-btn ${view === 'donut' ? 'active' : ''}`} 
            onClick={() => setView('donut')}
          >
            ⭕ Donut
          </button>
        </div>
      </div>
      
      <div className={`chart-layout ${view}-view`}>
        {view === 'donut' ? (
          <div className="donut-chart-wrapper">
            <svg viewBox="0 0 100 100" className="donut-chart">
              {categoryData.summaries.map((s) => (
                <path
                  key={s.category}
                  d={describeArc(50, 50, 45, s.startAngle, s.endAngle)}
                  fill={s.color}
                  className={`chart-slice ${selectedCategory === s.category ? 'active' : ''}`}
                  onClick={() => handleSliceClick(s.category)}
                >
                  <title>{`${s.category}: ₹${s.amount.toFixed(2)} (${s.percentage.toFixed(1)}%)`}</title>
                </path>
              ))}
              {/* Inner circle for the donut effect */}
              <circle cx="50" cy="50" r="25" fill="var(--card-bg)" />
              <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="chart-center-text">
                Total
                <tspan x="50" dy="1.2em" fontWeight="bold">
                  ₹{categoryData.grandTotal.toFixed(0)}
                </tspan>
              </text>
            </svg>
          </div>
        ) : (
          <div className="bar-chart-wrapper">
            {categoryData.summaries.map((s) => (
              <div 
                key={s.category} 
                className={`bar-item ${selectedCategory === s.category ? 'active' : ''}`}
                onClick={() => handleSliceClick(s.category)}
              >
                <div className="bar-label-group">
                  <span className="bar-label">{s.category}</span>
                  <span className="bar-value">₹{s.amount.toFixed(0)} ({s.percentage.toFixed(0)}%)</span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${s.percentage}%`, backgroundColor: s.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="chart-legend">
          {categoryData.summaries.map(s => (
            <div 
              key={s.category} 
              className={`legend-item ${selectedCategory === s.category ? 'active' : ''}`}
              onClick={() => handleSliceClick(s.category)}
            >
              <div className="legend-header">
                <span className="legend-color" style={{ backgroundColor: s.color }}></span>
                <span className="legend-label">{s.category}</span>
              </div>
              <div className="legend-values">
                <span className="legend-value">₹{s.amount.toFixed(0)}</span>
                {renderBenchmark(s)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCategory && (
        <div className="category-details expandable-section">
          <h4>{selectedCategory} Transactions</h4>
          <ul className="details-list">
            {selectedTransactions.map(t => (
              <li key={t.id} className="details-item">
                <div className="details-text">
                  <span>{t.text}</span>
                  <small>{t.paidDate || t.dueDate} ({t.category})</small>
                </div>
                <span className={`details-amount ${t.type === 'income' ? 'plus' : ''}`}>
                  {t.type === 'income' ? '+' : '-'}₹{Math.abs(t.amount).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
