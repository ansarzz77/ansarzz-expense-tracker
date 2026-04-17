import { createContext } from 'react';
import { type State, type Transaction, type RecurringPlan } from './AppReducer';

export interface GlobalContextProps extends State {
  loading: boolean;
  deleteTransaction: (id: number) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  clearTransactions: () => void;
  addRecurringPlan: (plan: RecurringPlan) => void;
  settleTransaction: (id: number, paidDate: string) => void;
  deletePlan: (id: number) => void;
  updatePlan: (plan: RecurringPlan, updateInstances: boolean) => void;
  importData: (data: State) => void;
}

const initialState: State = {
  transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
  plans: JSON.parse(localStorage.getItem('plans') || '[]'),
};

export const GlobalContext = createContext<GlobalContextProps>({
  transactions: initialState.transactions,
  plans: initialState.plans,
  loading: true,
  deleteTransaction: () => {},
  addTransaction: () => {},
  updateTransaction: () => {},
  clearTransactions: () => {},
  addRecurringPlan: () => {},
  settleTransaction: () => {},
  deletePlan: () => {},
  updatePlan: () => {},
  importData: () => {},
});
