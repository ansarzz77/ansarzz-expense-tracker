import type { Transaction } from '../context/AppReducer';

export const downloadCSV = (transactions: Transaction[]) => {
  // Sort transactions by date (chronological)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const headers = [
    'Date',
    'Description',
    'Category',
    'Type',
    'Status',
    'Credit (Income)',
    'Debit (Expense)',
    'Balance (Actual)',
    'Month',
    'Quarter',
    'Year',
    'Note'
  ];

  let runningBalance = 0;
  
  const rows = sortedTransactions.map(t => {
    // Ensure we use the correct date property
    const dateStr = t.dueDate;
    const date = new Date(dateStr);
    
    // Check if date is valid to avoid 'undefined' or 'Invalid Date'
    const month = !isNaN(date.getTime()) ? date.toLocaleString('default', { month: 'long' }) : 'Unknown';
    const year = !isNaN(date.getTime()) ? date.getFullYear() : 'Unknown';
    const quarter = !isNaN(date.getTime()) ? Math.floor((date.getMonth() + 3) / 3) : 'Unknown';
    
    const credit = t.type === 'income' ? t.amount : 0;
    const debit = t.type === 'expense' ? t.amount : 0;
    
    if (t.status === 'completed') {
      runningBalance += (credit - debit);
    }

    return [
      dateStr,
      t.text,
      t.category,
      t.type,
      t.status,
      credit > 0 ? credit.toFixed(2) : '',
      debit > 0 ? debit.toFixed(2) : '',
      t.status === 'completed' ? runningBalance.toFixed(2) : '-',
      month,
      quarter !== 'Unknown' ? `Q${quarter}` : 'Unknown',
      year,
      (t.note || '').replace(/,/g, ';') // Avoid CSV breaking on commas in notes
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `Expense_Report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
