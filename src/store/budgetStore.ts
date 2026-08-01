import { create } from 'zustand';
import {
  BudgetState,
  MebleItem,
  WykonczenieItem,
  AGDItem,
  PozostaleItem,
  SaldoEntry,
  ScheduleEntry,
  DashboardSummary,
  CategoryCost,
  CategoryBreakdown,
  CashFlowPoint,
} from '@/types';
import { saveToLocalStorage, loadFromLocalStorage } from '@/utils/storage';
import { generateId } from '@/utils/id';
import { ImportResult } from '@/utils/excelImport';

interface BudgetActions {
  importData: (data: ImportResult) => void;
  resetAndImport: (data: ImportResult) => void;

  updateMebleItem: (id: string, updates: Partial<MebleItem>) => void;
  addMebleItem: (item: Omit<MebleItem, 'id'>) => void;
  deleteMebleItem: (id: string) => void;

  updateWykonczenieItem: (id: string, updates: Partial<WykonczenieItem>) => void;
  addWykonczenieItem: (item: Omit<WykonczenieItem, 'id'>) => void;
  deleteWykonczenieItem: (id: string) => void;

  updateAGDItem: (id: string, updates: Partial<AGDItem>) => void;
  addAGDItem: (item: Omit<AGDItem, 'id'>) => void;
  deleteAGDItem: (id: string) => void;

  updatePozostaleItem: (id: string, updates: Partial<PozostaleItem>) => void;
  addPozostaleItem: (item: Omit<PozostaleItem, 'id'>) => void;
  deletePozostaleItem: (id: string) => void;

  addSaldoEntry: (entry: Omit<SaldoEntry, 'id'>) => void;
  deleteSaldoEntry: (id: string) => void;
  updateSaldoEntry: (id: string, updates: Partial<SaldoEntry>) => void;

  addScheduleEntry: (entry: Omit<ScheduleEntry, 'id'>) => void;
  deleteScheduleEntry: (id: string) => void;
  updateScheduleEntry: (id: string, updates: Partial<ScheduleEntry>) => void;
  toggleScheduleRealized: (id: string) => void;

  getDashboardSummary: () => DashboardSummary;
  getCategoryCosts: () => CategoryCost[];
  getCategoryBreakdown: () => CategoryBreakdown[];
  getPaymentProgress: () => number;
  getCashFlowProjection: () => CashFlowPoint[];
}

type BudgetStore = BudgetState & BudgetActions;

const initialState: BudgetState = {
  meble: [],
  wykonczenie: [],
  agd: [],
  pozostale: [],
  saldo: [],
  harmonogram: [],
  isDataLoaded: false,
};

function persistState(state: BudgetState): void {
  saveToLocalStorage(state);
}

function getStateSnapshot(state: BudgetStore): BudgetState {
  return {
    meble: state.meble,
    wykonczenie: state.wykonczenie,
    agd: state.agd,
    pozostale: state.pozostale,
    saldo: state.saldo,
    harmonogram: state.harmonogram,
    isDataLoaded: state.isDataLoaded,
  };
}

export const useBudgetStore = create<BudgetStore>((set, get) => {
  const loaded = loadFromLocalStorage();
  const init: BudgetState = loaded
    ? { ...initialState, ...loaded, harmonogram: loaded.harmonogram || [] }
    : initialState;

  return {
    ...init,

    importData: (data: ImportResult) => {
      set((state) => {
        const newState = {
          ...state,
          meble: data.meble.length > 0 ? data.meble : state.meble,
          wykonczenie: data.wykonczenie.length > 0 ? data.wykonczenie : state.wykonczenie,
          agd: data.agd.length > 0 ? data.agd : state.agd,
          pozostale: data.pozostale.length > 0 ? data.pozostale : state.pozostale,
          isDataLoaded: true,
        };
        persistState(getStateSnapshot(newState as BudgetStore));
        return newState;
      });
    },

    resetAndImport: (data: ImportResult) => {
      set((state) => {
        const newState = {
          ...state,
          meble: data.meble,
          wykonczenie: data.wykonczenie,
          agd: data.agd,
          pozostale: data.pozostale,
          isDataLoaded: true,
        };
        persistState(getStateSnapshot(newState as BudgetStore));
        return newState;
      });
    },

    // Meble
    updateMebleItem: (id, updates) => {
      set((state) => {
        const meble = state.meble.map((item) => item.id === id ? { ...item, ...updates } : item);
        const newState = { ...state, meble };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { meble };
      });
    },
    addMebleItem: (item) => {
      set((state) => {
        const meble = [...state.meble, { ...item, id: generateId() }];
        const newState = { ...state, meble };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { meble };
      });
    },
    deleteMebleItem: (id) => {
      set((state) => {
        const meble = state.meble.filter((item) => item.id !== id);
        const newState = { ...state, meble };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { meble };
      });
    },

    // Wykończenie
    updateWykonczenieItem: (id, updates) => {
      set((state) => {
        const wykonczenie = state.wykonczenie.map((item) => item.id === id ? { ...item, ...updates } : item);
        const newState = { ...state, wykonczenie };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { wykonczenie };
      });
    },
    addWykonczenieItem: (item) => {
      set((state) => {
        const wykonczenie = [...state.wykonczenie, { ...item, id: generateId() }];
        const newState = { ...state, wykonczenie };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { wykonczenie };
      });
    },
    deleteWykonczenieItem: (id) => {
      set((state) => {
        const wykonczenie = state.wykonczenie.filter((item) => item.id !== id);
        const newState = { ...state, wykonczenie };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { wykonczenie };
      });
    },

    // AGD
    updateAGDItem: (id, updates) => {
      set((state) => {
        const agd = state.agd.map((item) => item.id === id ? { ...item, ...updates } : item);
        const newState = { ...state, agd };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { agd };
      });
    },
    addAGDItem: (item) => {
      set((state) => {
        const agd = [...state.agd, { ...item, id: generateId() }];
        const newState = { ...state, agd };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { agd };
      });
    },
    deleteAGDItem: (id) => {
      set((state) => {
        const agd = state.agd.filter((item) => item.id !== id);
        const newState = { ...state, agd };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { agd };
      });
    },

    // Pozostałe
    updatePozostaleItem: (id, updates) => {
      set((state) => {
        const pozostale = state.pozostale.map((item) => item.id === id ? { ...item, ...updates } : item);
        const newState = { ...state, pozostale };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { pozostale };
      });
    },
    addPozostaleItem: (item) => {
      set((state) => {
        const pozostale = [...state.pozostale, { ...item, id: generateId() }];
        const newState = { ...state, pozostale };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { pozostale };
      });
    },
    deletePozostaleItem: (id) => {
      set((state) => {
        const pozostale = state.pozostale.filter((item) => item.id !== id);
        const newState = { ...state, pozostale };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { pozostale };
      });
    },

    // Saldo
    addSaldoEntry: (entry) => {
      set((state) => {
        const saldo = [...state.saldo, { ...entry, id: generateId() }];
        const newState = { ...state, saldo };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { saldo };
      });
    },
    deleteSaldoEntry: (id) => {
      set((state) => {
        const saldo = state.saldo.filter((entry) => entry.id !== id);
        const newState = { ...state, saldo };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { saldo };
      });
    },
    updateSaldoEntry: (id, updates) => {
      set((state) => {
        const saldo = state.saldo.map((entry) => entry.id === id ? { ...entry, ...updates } : entry);
        const newState = { ...state, saldo };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { saldo };
      });
    },

    // Harmonogram
    addScheduleEntry: (entry) => {
      set((state) => {
        const harmonogram = [...state.harmonogram, { ...entry, id: generateId() }];
        const newState = { ...state, harmonogram };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { harmonogram };
      });
    },
    deleteScheduleEntry: (id) => {
      set((state) => {
        const harmonogram = state.harmonogram.filter((e) => e.id !== id);
        const newState = { ...state, harmonogram };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { harmonogram };
      });
    },
    updateScheduleEntry: (id, updates) => {
      set((state) => {
        const harmonogram = state.harmonogram.map((e) => e.id === id ? { ...e, ...updates } : e);
        const newState = { ...state, harmonogram };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { harmonogram };
      });
    },
    toggleScheduleRealized: (id) => {
      set((state) => {
        const harmonogram = state.harmonogram.map((e) =>
          e.id === id ? { ...e, zrealizowane: !e.zrealizowane } : e
        );
        const newState = { ...state, harmonogram };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { harmonogram };
      });
    },

    // Computed
    getDashboardSummary: (): DashboardSummary => {
      const state = get();
      
      // Wpływy = suma wszystkich wpisów w saldzie (pieniądze, które wpłynęły na budżet)
      const wplywy = state.saldo.reduce((sum, entry) => sum + entry.kwota, 0);

      const mebleKoszt = state.meble.filter((i) => i.included).reduce((sum, i) => sum + i.cena, 0);
      const wykonczenieKoszt = state.wykonczenie.filter((i) => i.included).reduce((sum, i) => sum + i.kwota, 0);
      const agdKoszt = state.agd.filter((i) => i.included).reduce((sum, i) => sum + i.cena, 0);
      const pozostaleKoszt = state.pozostale.filter((i) => i.included).reduce((sum, i) => sum + i.cena, 0);
      const lacznyKoszt = mebleKoszt + wykonczenieKoszt + agdKoszt + pozostaleKoszt;

      const mebleZaplacono = state.meble.filter((i) => i.included && i.status === 'Opłacone').reduce((sum, i) => sum + i.cena, 0);
      const wykonczenieZaplacono = state.wykonczenie.filter((i) => i.included && i.status === 'Opłacone').reduce((sum, i) => sum + i.kwota, 0);
      const agdZaplacono = state.agd.filter((i) => i.included && i.status === 'Opłacone').reduce((sum, i) => sum + i.cena, 0);
      const pozostaleZaplacono = state.pozostale.filter((i) => i.included && i.status === 'Opłacone').reduce((sum, i) => sum + i.cena, 0);
      const zaplacono = mebleZaplacono + wykonczenieZaplacono + agdZaplacono + pozostaleZaplacono;

      // Aktualne środki = wpływy - to co już zapłacono (pieniądze wyszły z konta)
      const aktualnieSrodki = wplywy - zaplacono;
      
      const pozostaloDoZaplaty = lacznyKoszt - zaplacono;
      
      // Bilans = aktualne środki - to co jeszcze trzeba zapłacić
      const bilans = aktualnieSrodki - pozostaloDoZaplaty;

      return { wplywy, aktualnieSrodki, lacznyKoszt, zaplacono, pozostaloDoZaplaty, bilans };
    },

    getCategoryCosts: (): CategoryCost[] => {
      const state = get();
      const categories: CategoryCost[] = [
        { name: 'Meble', value: state.meble.filter((i) => i.included).reduce((sum, i) => sum + i.cena, 0) },
        { name: 'Wykończenie', value: state.wykonczenie.filter((i) => i.included).reduce((sum, i) => sum + i.kwota, 0) },
        { name: 'AGD', value: state.agd.filter((i) => i.included).reduce((sum, i) => sum + i.cena, 0) },
        { name: 'Pozostałe', value: state.pozostale.filter((i) => i.included).reduce((sum, i) => sum + i.cena, 0) },
      ];
      return categories.filter((c) => c.value > 0);
    },

    getCategoryBreakdown: (): CategoryBreakdown[] => {
      const state = get();
      return [
        {
          name: 'Meble',
          zaplacono: state.meble.filter((i) => i.included && i.status === 'Opłacone').reduce((s, i) => s + i.cena, 0),
          doZaplaty: state.meble.filter((i) => i.included && i.status === 'Do zapłaty').reduce((s, i) => s + i.cena, 0),
        },
        {
          name: 'Wykończenie',
          zaplacono: state.wykonczenie.filter((i) => i.included && i.status === 'Opłacone').reduce((s, i) => s + i.kwota, 0),
          doZaplaty: state.wykonczenie.filter((i) => i.included && i.status === 'Do zapłaty').reduce((s, i) => s + i.kwota, 0),
        },
        {
          name: 'AGD',
          zaplacono: state.agd.filter((i) => i.included && i.status === 'Opłacone').reduce((s, i) => s + i.cena, 0),
          doZaplaty: state.agd.filter((i) => i.included && i.status === 'Do zapłaty').reduce((s, i) => s + i.cena, 0),
        },
        {
          name: 'Pozostałe',
          zaplacono: state.pozostale.filter((i) => i.included && i.status === 'Opłacone').reduce((s, i) => s + i.cena, 0),
          doZaplaty: state.pozostale.filter((i) => i.included && i.status === 'Do zapłaty').reduce((s, i) => s + i.cena, 0),
        },
      ].filter((c) => c.zaplacono > 0 || c.doZaplaty > 0);
    },

    getPaymentProgress: (): number => {
      const summary = get().getDashboardSummary();
      if (summary.lacznyKoszt === 0) return 0;
      return (summary.zaplacono / summary.lacznyKoszt) * 100;
    },

    getCashFlowProjection: (): CashFlowPoint[] => {
      const state = get();
      const summary = get().getDashboardSummary();
      const startingSaldo = summary.aktualnieSrodki;

      // Get future (unrealized) planned incomes sorted by date
      const futureEntries = [...state.harmonogram]
        .filter((e) => !e.zrealizowane)
        .sort((a, b) => a.data.localeCompare(b.data));

      const points: CashFlowPoint[] = [];

      // Start with current state (today): aktualne środki (wpływy - zapłacone)
      const today = new Date().toISOString().split('T')[0];
      points.push({
        data: today,
        label: 'Dziś (aktualne środki)',
        saldo: startingSaldo,
      });

      // Each planned income increases the saldo
      let runningSaldo = startingSaldo;
      for (const entry of futureEntries) {
        runningSaldo += entry.kwota;
        points.push({
          data: entry.data,
          label: entry.opis,
          saldo: runningSaldo,
        });
      }

      return points;
    },
  };
});
