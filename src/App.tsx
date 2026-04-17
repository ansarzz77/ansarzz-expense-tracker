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
import { useContext } from 'react';

import './App.css';

const AppContent = () => {
  const { loading } = useContext(GlobalContext);

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
