import { create } from 'zustand';
import { BudgetState } from '@/types';
import { notify } from './notificationStore';

const MAX_HISTORY = 30;

interface UndoState {
  past: BudgetState[];
  future: BudgetState[];
  pushSnapshot: (snapshot: BudgetState) => void;
  undo: (currentState: BudgetState) => BudgetState | null;
  redo: (currentState: BudgetState) => BudgetState | null;
  canUndo: boolean;
  canRedo: boolean;
}

export const useUndoStore = create<UndoState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  pushSnapshot: (snapshot: BudgetState) => {
    set((state) => {
      const newPast = [...state.past, snapshot].slice(-MAX_HISTORY);
      return {
        past: newPast,
        future: [],
        canUndo: true,
        canRedo: false,
      };
    });
  },

  undo: (currentState: BudgetState) => {
    const { past } = get();
    if (past.length === 0) return null;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    set({
      past: newPast,
      future: [currentState, ...get().future],
      canUndo: newPast.length > 0,
      canRedo: true,
    });

    notify.info('Cofnięto');
    return previous;
  },

  redo: (currentState: BudgetState) => {
    const { future } = get();
    if (future.length === 0) return null;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...get().past, currentState],
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    });

    return next;
  },
}));
