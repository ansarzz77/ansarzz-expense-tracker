import { createContext } from 'react';
import { type State, type Transaction, type RecurringPlan, type Bucket } from './AppReducer';
import { safeJsonParse } from '../utils/storage';

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
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  addBucket: (bucket: Bucket) => void;
  updateBucket: (bucket: Bucket) => void;
  deleteBucket: (id: number) => void;
  toggleTheme: () => void;
  importData: (data: State) => void;
}

const initialState: State = {
  transactions: safeJsonParse('transactions', []),
  plans: safeJsonParse('plans', []),
  categories: safeJsonParse('categories', []),
  buckets: safeJsonParse('buckets', []),
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 
         (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
};

export const GlobalContext = createContext<GlobalContextProps>({
  transactions: initialState.transactions,
  plans: initialState.plans,
  categories: initialState.categories,
  buckets: initialState.buckets,
  theme: initialState.theme,
  loading: true,
  deleteTransaction: () => {},
  addTransaction: () => {},
  updateTransaction: () => {},
  clearTransactions: () => {},
  addRecurringPlan: () => {},
  settleTransaction: () => {},
  deletePlan: () => {},
  updatePlan: () => {},
  addCategory: () => {},
  deleteCategory: () => {},
  addBucket: () => {},
  updateBucket: () => {},
  deleteBucket: () => {},
  toggleTheme: () => {},
  importData: () => {},
});
