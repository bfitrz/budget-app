import { create } from 'zustand';
import {
  BudgetState,
  MebleItem,
  WykonczenieItem,
  AGDItem,
  PozostaleItem,
  WyprowadzkaItem,
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

  updateWyprowadzkaItem: (id: string, updates: Partial<WyprowadzkaItem>) => void;
  addWyprowadzkaItem: (item: Omit<WyprowadzkaItem, 'id'>) => void;
  deleteWyprowadzkaItem: (id: string) => void;

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
  wyprowadzka: [],
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
    wyprowadzka: state.wyprowadzka,
    saldo: state.saldo,
    harmonogram: state.harmonogram,
    isDataLoaded: state.isDataLoaded,
  };
}

export const useBudgetStore = create<BudgetStore>((set, get) => {
  const loaded = loadFromLocalStorage();
  let init: BudgetState;
  if (loaded) {
    // Migrate old data: add missing fields, convert old string[] linki to ItemLink[]
    const migrateLinki = (linki: unknown): Array<{nazwa: string; url: string}> => {
      if (!Array.isArray(linki)) return [];
      return linki.map((l) => {
        if (typeof l === 'string') return { nazwa: l, url: l };
        if (l && typeof l === 'object' && 'url' in l) return l as {nazwa: string; url: string};
        return { nazwa: String(l), url: String(l) };
      });
    };
    const migrateItem = (item: Record<string, unknown>) => ({
      linki: migrateLinki(item.linki),
      alternatywy: Array.isArray(item.alternatywy) ? item.alternatywy : [],
      wybranaAltId: (item.wybranaAltId as string) || null,
    });
    const meble = (loaded.meble || []).map((item) => ({ ...item, ...migrateItem(item as unknown as Record<string, unknown>) }));
    const wykonczenie = (loaded.wykonczenie || []).map((item) => ({ ...item, ...migrateItem(item as unknown as Record<string, unknown>) }));
    const agd = (loaded.agd || []).map((item) => ({ ...item, ...migrateItem(item as unknown as Record<string, unknown>) }));
    const pozostale = (loaded.pozostale || []).map((item) => ({
      ...item,
      grupa: (item as unknown as Record<string, unknown>).grupa as string || 'Ogólne',
      ...migrateItem(item as unknown as Record<string, unknown>),
    }));
    const wyprowadzka = (((loaded as unknown as Record<string, unknown>).wyprowadzka as BudgetState['wyprowadzka']) || []).map((item) => ({ ...item, ...migrateItem(item as unknown as Record<string, unknown>) }));
    const harmonogram = loaded.harmonogram || [];
    init = { ...initialState, ...loaded, meble, wykonczenie, agd, pozostale, wyprowadzka, harmonogram };
  } else {
    init = initialState;
  }

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
          wyprowadzka: data.wyprowadzka.length > 0 ? data.wyprowadzka : state.wyprowadzka,
          saldo: data.saldo.length > 0 ? data.saldo : state.saldo,
          harmonogram: data.harmonogram.length > 0 ? data.harmonogram : state.harmonogram,
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
          wyprowadzka: data.wyprowadzka,
          saldo: data.saldo,
          harmonogram: data.harmonogram,
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

    // Wyprowadzka
    updateWyprowadzkaItem: (id, updates) => {
      set((state) => {
        const wyprowadzka = state.wyprowadzka.map((item) => item.id === id ? { ...item, ...updates } : item);
        const newState = { ...state, wyprowadzka };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { wyprowadzka };
      });
    },
    addWyprowadzkaItem: (item) => {
      set((state) => {
        const wyprowadzka = [...state.wyprowadzka, { ...item, id: generateId() }];
        const newState = { ...state, wyprowadzka };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { wyprowadzka };
      });
    },
    deleteWyprowadzkaItem: (id) => {
      set((state) => {
        const wyprowadzka = state.wyprowadzka.filter((item) => item.id !== id);
        const newState = { ...state, wyprowadzka };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { wyprowadzka };
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
      const wyprowadzkaKoszt = state.wyprowadzka.filter((i) => i.included).reduce((sum, i) => sum + i.cena, 0);
      const lacznyKoszt = mebleKoszt + wykonczenieKoszt + agdKoszt + pozostaleKoszt + wyprowadzkaKoszt;

      const mebleZaplacono = state.meble.filter((i) => i.included && i.status === 'Opłacone').reduce((sum, i) => sum + i.cena, 0);
      const wykonczenieZaplacono = state.wykonczenie.filter((i) => i.included && i.status === 'Opłacone').reduce((sum, i) => sum + i.kwota, 0);
      const agdZaplacono = state.agd.filter((i) => i.included && i.status === 'Opłacone').reduce((sum, i) => sum + i.cena, 0);
      const pozostaleZaplacono = state.pozostale.filter((i) => i.included && i.status === 'Opłacone').reduce((sum, i) => sum + i.cena, 0);
      const wyprowadzkaZaplacono = state.wyprowadzka.filter((i) => i.included && i.status === 'Opłacone').reduce((sum, i) => sum + i.cena, 0);
      const zaplacono = mebleZaplacono + wykonczenieZaplacono + agdZaplacono + pozostaleZaplacono + wyprowadzkaZaplacono;

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
        { name: 'Zakupy', value: state.meble.filter((i) => i.included).reduce((sum, i) => sum + i.cena, 0) },
        { name: 'Wykończenie', value: state.wykonczenie.filter((i) => i.included).reduce((sum, i) => sum + i.kwota, 0) },
        { name: 'AGD / RTV', value: state.agd.filter((i) => i.included).reduce((sum, i) => sum + i.cena, 0) },
        { name: 'Inne', value: state.pozostale.filter((i) => i.included).reduce((sum, i) => sum + i.cena, 0) },
        { name: 'Wyprowadzka', value: state.wyprowadzka.filter((i) => i.included).reduce((sum, i) => sum + i.cena, 0) },
      ];
      return categories.filter((c) => c.value > 0);
    },

    getCategoryBreakdown: (): CategoryBreakdown[] => {
      const state = get();

      // Helper: get min and max possible cost for items with alternatives
      const getRange = (items: Array<{ included: boolean; cena?: number; kwota?: number; alternatywy: Array<{ cena: number }> }>, field: 'cena' | 'kwota') => {
        let minTotal = 0;
        let maxTotal = 0;
        for (const item of items.filter((i) => i.included)) {
          const baseCost = field === 'cena' ? (item.cena || 0) : (item.kwota || 0);
          const allPrices = [baseCost, ...item.alternatywy.map((a) => a.cena)];
          minTotal += Math.min(...allPrices);
          maxTotal += Math.max(...allPrices);
        }
        return { minTotal, maxTotal };
      };

      const mebleRange = getRange(state.meble, 'cena');
      const praceRange = getRange(state.wykonczenie, 'kwota');
      const sprzetRange = getRange(state.agd, 'cena');
      const inneRange = getRange(state.pozostale, 'cena');
      const wypRange = getRange(state.wyprowadzka, 'cena');

      return [
        {
          name: 'Zakupy',
          zaplacono: state.meble.filter((i) => i.included && i.status === 'Opłacone').reduce((s, i) => s + i.cena, 0),
          doZaplaty: state.meble.filter((i) => i.included && i.status === 'Do zapłaty').reduce((s, i) => s + i.cena, 0),
          minKoszt: mebleRange.minTotal,
          maxKoszt: mebleRange.maxTotal,
        },
        {
          name: 'Wykończenie',
          zaplacono: state.wykonczenie.filter((i) => i.included && i.status === 'Opłacone').reduce((s, i) => s + i.kwota, 0),
          doZaplaty: state.wykonczenie.filter((i) => i.included && i.status === 'Do zapłaty').reduce((s, i) => s + i.kwota, 0),
          minKoszt: praceRange.minTotal,
          maxKoszt: praceRange.maxTotal,
        },
        {
          name: 'AGD / RTV',
          zaplacono: state.agd.filter((i) => i.included && i.status === 'Opłacone').reduce((s, i) => s + i.cena, 0),
          doZaplaty: state.agd.filter((i) => i.included && i.status === 'Do zapłaty').reduce((s, i) => s + i.cena, 0),
          minKoszt: sprzetRange.minTotal,
          maxKoszt: sprzetRange.maxTotal,
        },
        {
          name: 'Inne',
          zaplacono: state.pozostale.filter((i) => i.included && i.status === 'Opłacone').reduce((s, i) => s + i.cena, 0),
          doZaplaty: state.pozostale.filter((i) => i.included && i.status === 'Do zapłaty').reduce((s, i) => s + i.cena, 0),
          minKoszt: inneRange.minTotal,
          maxKoszt: inneRange.maxTotal,
        },
        {
          name: 'Wyprowadzka',
          zaplacono: state.wyprowadzka.filter((i) => i.included && i.status === 'Opłacone').reduce((s, i) => s + i.cena, 0),
          doZaplaty: state.wyprowadzka.filter((i) => i.included && i.status === 'Do zapłaty').reduce((s, i) => s + i.cena, 0),
          minKoszt: wypRange.minTotal,
          maxKoszt: wypRange.maxTotal,
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
