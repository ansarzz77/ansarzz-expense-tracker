export interface Transaction {
  id: number;
  planId?: number; // Links to RecurringPlan if applicable
  text: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  dueDate: string; // The target date (YYYY-MM-DD)
  paidDate?: string; // The actual date of payment
  status: 'pending' | 'completed';
  note: string;
}

export interface RecurringPlan {
  id: number;
  text: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';
  startDate: string;
  note: string;
}

export type Action =
  | { type: 'DELETE_TRANSACTION'; payload: number }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'CLEAR_TRANSACTIONS' }
  | { type: 'ADD_RECURRING_PLAN'; payload: { plan: RecurringPlan; instances: Transaction[] } }
  | { type: 'SETTLE_TRANSACTION'; payload: { id: number; paidDate: string } }
  | { type: 'DELETE_PLAN'; payload: number }
  | { type: 'UPDATE_PLAN'; payload: { plan: RecurringPlan; updateInstances: boolean } }
  | { type: 'IMPORT_DATA'; payload: State };

export interface State {
  transactions: Transaction[];
  plans: RecurringPlan[];
}

const AppReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'IMPORT_DATA':
      return {
        ...state,
        transactions: action.payload.transactions || [],
        plans: action.payload.plans || [],
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(
          (transaction) => transaction.id !== action.payload
        ),
      };
    case 'DELETE_PLAN':
      return {
        ...state,
        plans: state.plans.filter((plan) => plan.id !== action.payload),
        transactions: state.transactions.filter(
          (t) => t.planId !== action.payload || t.status === 'completed'
        ),
      };
    case 'UPDATE_PLAN':
      return {
        ...state,
        plans: state.plans.map((plan) =>
          plan.id === action.payload.plan.id ? action.payload.plan : plan
        ),
        transactions: action.payload.updateInstances
          ? state.transactions.map((t) =>
              t.planId === action.payload.plan.id && t.status === 'pending'
                ? {
                    ...t,
                    text: action.payload.plan.text,
                    amount: action.payload.plan.amount,
                    category: action.payload.plan.category,
                    type: action.payload.plan.type,
                    note: action.payload.plan.note,
                  }
                : t
            )
          : state.transactions,
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction
        ),
      };
    case 'CLEAR_TRANSACTIONS':
      return {
        ...state,
        transactions: [],
        plans: [],
      };
    case 'ADD_RECURRING_PLAN':
      return {
        ...state,
        plans: [...state.plans, action.payload.plan],
        transactions: [...state.transactions, ...action.payload.instances],
      };
    case 'SETTLE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id
            ? { ...transaction, status: 'completed', paidDate: action.payload.paidDate }
            : transaction
        ),
      };
    default:
      return state;
  }
};

export default AppReducer;
