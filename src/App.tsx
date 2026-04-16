import { Header } from './components/Header';
import { Balance } from './components/Balance';
import { IncomeExpenses } from './components/IncomeExpenses';
import { TransactionList } from './components/TransactionList';
import { PendingTransactions } from './components/PendingTransactions';
import { FutureProjections } from './components/FutureProjections';
import { ActivePlans } from './components/ActivePlans';
import { AddTransaction } from './components/AddTransaction';

import { GlobalProvider, GlobalContext } from './context/GlobalState';
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
