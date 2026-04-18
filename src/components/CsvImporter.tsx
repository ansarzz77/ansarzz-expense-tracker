import { useState, useContext, useRef } from 'react';
import Papa from 'papaparse';
import { GlobalContext } from '../context/GlobalContext';
import { motion } from 'framer-motion';
import { autoCategorize } from '../utils/categorizer';

interface Mapping {
  text: string;
  debit: string;
  credit: string;
  date: string;
  category: string;
}

export const CsvImporter = ({ onCancel }: { onCancel: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Mapping>({ text: '', debit: '', credit: '', date: '', category: '' });
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { addTransaction, categories } = useContext(GlobalContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      Papa.parse(selectedFile, {
        header: true,
        preview: 5,
        complete: (results) => {
          if (results.meta.fields) {
            setHeaders(results.meta.fields);
            setPreviewRows(results.data);
            setStep(2);
            
            // Try to auto-guess mapping
            const guess: Mapping = { text: '', debit: '', credit: '', date: '', category: '' };
            results.meta.fields.forEach(h => {
              const lower = h.toLowerCase();
              if (lower.includes('desc') || lower.includes('particulars') || lower.includes('remark')) guess.text = h;
              if (lower.includes('debit') || lower.includes('withdrawal') || lower.includes('out')) guess.debit = h;
              if (lower.includes('credit') || lower.includes('deposit') || lower.includes('in')) guess.credit = h;
              if (lower.includes('date')) guess.date = h;
              if (lower.includes('cat')) guess.category = h;
            });
            setMapping(guess);
          }
        }
      });
    }
  };

  const handleImport = () => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        let count = 0;

        data.forEach(row => {
          let amount = 0;
          let type: 'income' | 'expense' = 'expense';

          const debitVal = row[mapping.debit];
          const creditVal = row[mapping.credit];

          if (debitVal && parseFloat(String(debitVal).replace(/[^0-9.-]/g, '')) > 0) {
            amount = parseFloat(String(debitVal).replace(/[^0-9.-]/g, ''));
            type = 'expense';
          } else if (creditVal && parseFloat(String(creditVal).replace(/[^0-9.-]/g, '')) > 0) {
            amount = parseFloat(String(creditVal).replace(/[^0-9.-]/g, ''));
            type = 'income';
          } else {
            return; // Skip if no amount in either column
          }

          if (isNaN(amount)) return;
          
          const dateStr = row[mapping.date] || new Date().toISOString().split('T')[0];
          // Try to normalize date to YYYY-MM-DD
          let normalizedDate = dateStr;
          try {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
              normalizedDate = d.toISOString().split('T')[0];
            }
          } catch(e) {}

          const description = row[mapping.text] || 'Imported Transaction';

          let finalCategory = autoCategorize(description);
          if (mapping.category && row[mapping.category]) {
            const csvCategory = String(row[mapping.category]).trim();
            // Check if it's a valid category
            if (categories.some(c => c.toLowerCase() === csvCategory.toLowerCase())) {
              finalCategory = categories.find(c => c.toLowerCase() === csvCategory.toLowerCase()) || csvCategory;
            }
          }

          addTransaction({
            id: Math.floor(Math.random() * 1000000000),
            text: description,
            amount: amount,
            category: finalCategory,
            type: type,
            dueDate: normalizedDate,
            status: 'completed',
            paidDate: normalizedDate,
            note: 'CSV Import'
          });
          count++;
        });

        alert(`Successfully imported ${count} transactions!`);
        onCancel();
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="importer-container"
    >
      <div className="importer-header">
        <h4>Bank Statement Importer</h4>
        <button className="close-btn" onClick={onCancel}>&times;</button>
      </div>

      <div className="importer-steps">
        <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
        <div className="step-line"></div>
        <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
        <div className="step-line"></div>
        <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
      </div>

      {step === 1 && (
        <div className="step-content">
          <p>Upload your bank statement (CSV format)</p>
          <div 
            className="upload-area" 
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">📄</div>
            <span>Click to select file</span>
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step-content">
          <p>Map your columns to our format:</p>
          <div className="mapping-grid">
            <div className="mapping-row">
              <label>Description</label>
              <select value={mapping.text} onChange={e => setMapping({...mapping, text: e.target.value})}>
                <option value="">Select Column...</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="mapping-row">
              <label>Category (Optional)</label>
              <select value={mapping.category} onChange={e => setMapping({...mapping, category: e.target.value})}>
                <option value="">Auto-categorize from description</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="mapping-row">
              <label>Debit (Expense)</label>
              <select value={mapping.debit} onChange={e => setMapping({...mapping, debit: e.target.value})}>
                <option value="">Select Column...</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="mapping-row">
              <label>Credit (Income)</label>
              <select value={mapping.credit} onChange={e => setMapping({...mapping, credit: e.target.value})}>
                <option value="">Select Column...</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="mapping-row">
              <label>Date</label>
              <select value={mapping.date} onChange={e => setMapping({...mapping, date: e.target.value})}>
                <option value="">Select Column...</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          
          <div className="preview-table-container">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>Preview</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.slice(0, 3).map((row, i) => (
                  <tr key={i}>
                    <td>
                      {mapping.text ? row[mapping.text] : '...'} | 
                      {row[mapping.debit] ? ` -₹${row[mapping.debit]}` : (row[mapping.credit] ? ` +₹${row[mapping.credit]}` : '...')} | 
                      {mapping.date ? ` ${row[mapping.date]}` : '...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="importer-actions">
            <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
            <button 
              className="btn" 
              disabled={!mapping.text || (!mapping.debit && !mapping.credit) || !mapping.date}
              onClick={() => setStep(3)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="step-content">
          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <p>Ready to import your transactions from <strong>{file?.name}</strong></p>
            <small>This will add all rows as completed transactions.</small>
          </div>
          <div className="importer-actions">
            <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
            <button className="btn" onClick={handleImport}>Import Now</button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
