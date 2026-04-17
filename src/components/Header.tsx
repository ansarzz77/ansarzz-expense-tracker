import { useContext, useRef } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { downloadCSV } from '../utils/reportGenerator';

export const Header = () => {
  const { transactions, plans, importData } = useContext(GlobalContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    if (transactions.length === 0) return;
    downloadCSV(transactions);
  };

  const handleExportJSON = () => {
    const data = { transactions, plans };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_expense_tracker_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (window.confirm('Importing will overwrite your current data. Continue?')) {
          importData(data);
          alert('Data imported successfully!');
        }
      } catch {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="logo-container">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
          </svg>
        </div>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Ansarzz Expense Tracker</h2>
          <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', margin: 0 }}>
            Loaded: {transactions.length} items
          </p>
        </div>
      </div>
      <div className="header-actions">
        <button className="icon-btn" onClick={handleExportJSON} title="Backup Data">📤</button>
        <button className="icon-btn" onClick={() => fileInputRef.current?.click()} title="Restore Data">📥</button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".json" 
          onChange={handleImportJSON} 
        />
        <button className="download-btn" onClick={handleDownload}>Report</button>
      </div>
    </div>
  );
};
