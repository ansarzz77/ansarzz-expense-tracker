import { useReducer, useEffect, useState, type ReactNode } from 'react';
import AppReducer, { type State, type Transaction, type RecurringPlan } from './AppReducer';
import { supabase } from '../supabaseClient';
import { GlobalContext } from './GlobalContext';

// Initial state
const initialState: State = {
  transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
  plans: JSON.parse(localStorage.getItem('plans') || '[]'),
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 
         (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
};

// Provider component
export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);
  const [loading, setLoading] = useState(true);

  // Load from Supabase on startup
  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('user_data')
          .select('payload')
          .eq('id', 'global_state')
          .single();

        if (data && !error) {
          dispatch({ type: 'IMPORT_DATA', payload: data.payload });
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync to Cloud (Supabase) and LocalStorage
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(state.transactions));
    localStorage.setItem('plans', JSON.stringify(state.plans));
    localStorage.setItem('theme', state.theme);

    const syncToCloud = async () => {
      if (!supabase) return;

      await supabase
        .from('user_data')
        .upsert({ 
          id: 'global_state', 
          payload: { 
            transactions: state.transactions, 
            plans: state.plans,
            theme: state.theme
          },
          updated_at: new Date()
        });
    };

    const timeoutId = setTimeout(syncToCloud, 2000); // Debounce sync by 2 seconds
    return () => clearTimeout(timeoutId);
  }, [state.transactions, state.plans, state.theme]);

  // Actions
  function toggleTheme() {
    dispatch({ type: 'TOGGLE_THEME' });
  }
  function deleteTransaction(id: number) {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  }

  function addTransaction(transaction: Transaction) {
    const newT = {
      ...transaction,
      status: transaction.status || 'completed',
      dueDate: transaction.dueDate || new Date().toISOString().split('T')[0]
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newT });
  }

  function updateTransaction(transaction: Transaction) {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
  }

  function clearTransactions() {
    dispatch({ type: 'CLEAR_TRANSACTIONS' });
  }

  function addRecurringPlan(plan: RecurringPlan) {
    const instances: Transaction[] = [];
    const [startYear, startMonth, startDay] = plan.startDate.split('-').map(Number);
    
    if (plan.frequency === 'one-time') {
      instances.push({
        id: Math.floor(Math.random() * 100000000),
        planId: plan.id,
        text: plan.text,
        amount: plan.amount,
        category: plan.category,
        type: plan.type,
        dueDate: plan.startDate,
        status: 'pending',
        note: plan.note
      });
    } else {
      const iterations = plan.frequency === 'monthly' ? 12 : plan.frequency === 'quarterly' ? 4 : plan.frequency === 'half-yearly' ? 2 : 1;

      for (let i = 0; i < iterations; i++) {
        const d = new Date(startYear, startMonth - 1, startDay);
        
        if (plan.frequency === 'monthly') {
          d.setMonth(startMonth - 1 + i);
        } else if (plan.frequency === 'quarterly') {
          d.setMonth(startMonth - 1 + (i * 3));
        } else if (plan.frequency === 'half-yearly') {
          d.setMonth(startMonth - 1 + (i * 6));
        } else if (plan.frequency === 'yearly') {
          d.setFullYear(startYear + i);
        }

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        instances.push({
          id: Math.floor(Math.random() * 100000000),
          planId: plan.id,
          text: `${plan.text} (${i + 1}/${iterations})`,
          amount: plan.amount,
          category: plan.category,
          type: plan.type,
          dueDate: dateString,
          status: 'pending',
          note: plan.note
        });
      }
    }

    dispatch({
      type: 'ADD_RECURRING_PLAN',
      payload: { plan, instances }
    });
  }

  function settleTransaction(id: number, paidDate: string) {
    dispatch({
      type: 'SETTLE_TRANSACTION',
      payload: { id, paidDate }
    });
  }

  function deletePlan(id: number) {
    dispatch({ type: 'DELETE_PLAN', payload: id });
  }

  function updatePlan(plan: RecurringPlan, updateInstances: boolean) {
    dispatch({
      type: 'UPDATE_PLAN',
      payload: { plan, updateInstances }
    });
  }

  function importData(data: State) {
    dispatch({ type: 'IMPORT_DATA', payload: data });
  }

  return (
    <GlobalContext.Provider
      value={{
        transactions: state.transactions,
        plans: state.plans,
        theme: state.theme,
        loading,
        deleteTransaction,
        addTransaction,
        updateTransaction,
        clearTransactions,
        addRecurringPlan,
        settleTransaction,
        deletePlan,
        updatePlan,
        toggleTheme,
        importData,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
