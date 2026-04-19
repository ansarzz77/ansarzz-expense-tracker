import { Header } from './components/Header';
import { Balance } from './components/Balance';
import { IncomeExpenses } from './components/IncomeExpenses';
import { SpendDistribution } from './components/SpendDistribution';
import { FinancialWellness } from './components/FinancialWellness';
import { TransactionList } from './components/TransactionList';
import { PendingTransactions } from './components/PendingTransactions';
import { FutureProjections } from './components/FutureProjections';
import { ActivePlans } from './components/ActivePlans';
import { AddTransaction } from './components/AddTransaction';

import { GlobalProvider } from './context/GlobalState';
import { GlobalContext } from './context/GlobalContext';
import { useContext, useEffect } from 'react';
import type { Transaction } from './context/AppReducer';
import { motion, type Variants } from 'framer-motion';

import './App.css';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const AppContent = () => {
  const { loading, transactions, theme } = useContext(GlobalContext);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <Header />
      <motion.div 
        className="container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}><Balance /></motion.div>
        <motion.div variants={itemVariants}><IncomeExpenses /></motion.div>
        <motion.div variants={itemVariants}><FinancialWellness /></motion.div>
        <motion.div variants={itemVariants}><SpendDistribution /></motion.div>
        <motion.div variants={itemVariants}><PendingTransactions /></motion.div>
        <motion.div variants={itemVariants}><FutureProjections /></motion.div>
        <motion.div variants={itemVariants}><ActivePlans /></motion.div>
        <motion.div variants={itemVariants}><TransactionList /></motion.div>
        <motion.div variants={itemVariants}><AddTransaction /></motion.div>
      </motion.div>
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
