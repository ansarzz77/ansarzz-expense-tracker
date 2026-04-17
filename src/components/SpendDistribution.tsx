import { useContext, useState, useMemo } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import type { Transaction } from '../context/AppReducer';

const COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
  '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F15BB5'
];

interface CategorySummary {
  category: string;
  amount: number;
  color: string;
  percentage: number;
  startAngle: number;
  endAngle: number;
}

export const SpendDistribution = () => {
  const { transactions } = useContext(GlobalContext);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const expenseTransactions = useMemo(() => 
    transactions.filter((t: Transaction) => t.type === 'expense' && t.status === 'completed'),
    [transactions]
  );

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    let grandTotal = 0;

    expenseTransactions.forEach((t: Transaction) => {
      const amount = Math.abs(t.amount);
      totals[t.category] = (totals[t.category] || 0) + amount;
      grandTotal += amount;
    });

    const summaries: CategorySummary[] = [];
    let currentAngle = 0;

    Object.entries(totals)
      .sort((a, b) => b[1] - a[1]) // Sort by amount descending
      .forEach(([category, amount], index) => {
        const percentage = grandTotal > 0 ? (amount / grandTotal) : 0;
        const angleSize = percentage * 360;
        
        summaries.push({
          category,
          amount,
          color: COLORS[index % COLORS.length],
          percentage: percentage * 100,
          startAngle: currentAngle,
          endAngle: currentAngle + angleSize
        });
        
        currentAngle += angleSize;
      });

    return { summaries, grandTotal };
  }, [expenseTransactions]);

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

  const selectedTransactions = selectedCategory 
    ? expenseTransactions.filter((t: Transaction) => t.category === selectedCategory)
    : [];

  if (categoryData.grandTotal === 0) {
    return null;
  }

  return (
    <div className="spend-distribution-container card">
      <h3>Spend Distribution</h3>
      
      <div className="chart-layout">
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
                <title>{`${s.category}: $${s.amount.toFixed(2)} (${s.percentage.toFixed(1)}%)`}</title>
              </path>
            ))}
            {/* Inner circle for the donut effect */}
            <circle cx="50" cy="50" r="25" fill="var(--card-bg)" />
            <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="chart-center-text">
              Total
              <tspan x="50" dy="1.2em" fontWeight="bold">
                ${categoryData.grandTotal.toFixed(0)}
              </tspan>
            </text>
          </svg>
        </div>

        <div className="chart-legend">
          {categoryData.summaries.map(s => (
            <div 
              key={s.category} 
              className={`legend-item ${selectedCategory === s.category ? 'active' : ''}`}
              onClick={() => handleSliceClick(s.category)}
            >
              <span className="legend-color" style={{ backgroundColor: s.color }}></span>
              <span className="legend-label">{s.category}</span>
              <span className="legend-value">${s.amount.toFixed(0)}</span>
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
                  <small>{t.paidDate || t.dueDate}</small>
                </div>
                <span className="details-amount">-${Math.abs(t.amount).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
