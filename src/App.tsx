import { Header } from './components/Header';
import { Balance } from './components/Balance';
import { IncomeExpenses } from './components/IncomeExpenses';
import { SpendDistribution } from './components/SpendDistribution';
import { TransactionList } from './components/TransactionList';
import { PendingTransactions } from './components/PendingTransactions';
import { FutureProjections } from './components/FutureProjections';
import { ActivePlans } from './components/ActivePlans';
import { AddTransaction } from './components/AddTransaction';

import { GlobalProvider } from './context/GlobalState';
import { GlobalContext } from './context/GlobalContext';
import { useContext, useEffect } from 'react';
import type { Transaction } from './context/AppReducer';

import './App.css';

const AppContent = () => {
  const { loading, transactions } = useContext(GlobalContext);

  useEffect(() => {
    if (loading) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthCompleted = transactions.filter((t: Transaction) => {
      if (t.status !== 'completed') return false;
      const dateStr = t.paidDate || t.dueDate;
      const [y, m] = dateStr.split('-').map(Number);
      return (m - 1) === currentMonth && y === currentYear;
    });

    const income = currentMonthCompleted
      .filter((t: Transaction) => t.type === 'income')
      .reduce((acc: number, item: Transaction) => acc + item.amount, 0);

    const expense = currentMonthCompleted
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((acc: number, item: Transaction) => acc + item.amount, 0);

    let mood = 'surplus';
    if (income > 0) {
      if (expense > income) {
        mood = 'overspent';
      } else if (expense > (0.9 * income)) {
        mood = 'warning';
      }
    } else if (expense > 0) {
      // If no income but has expenses, it's overspent
      mood = 'overspent';
    }

    document.documentElement.setAttribute('data-mood', mood);
  }, [transactions, loading]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>Syncing your data...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container">
        <Balance />
        <IncomeExpenses />
        <SpendDistribution />
        <PendingTransactions />
        <FutureProjections />
        <ActivePlans />
        <TransactionList />
        <AddTransaction />
      </div>
    </>
  );
}

function App() {
  return (
    <GlobalProvider>
      <AppContent />
    </GlobalProvider>
  );
}

export default App;
