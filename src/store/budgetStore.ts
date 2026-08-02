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
  MilestoneEntry,
  DashboardSummary,
  CategoryCost,
  CategoryBreakdown,
  CashFlowPoint,
} from '@/types';
import { saveToLocalStorage, loadFromLocalStorage } from '@/utils/storage';
import { generateId } from '@/utils/id';
import { ImportResult } from '@/utils/excelImport';
import { notify } from './notificationStore';
import { useUndoStore } from './undoStore';

// Generates a descriptive notification based on what was updated
function describeUpdate(updates: Record<string, unknown>): string {
  const keys = Object.keys(updates);
  if (keys.includes('status')) {
    if (updates.status === 'Opłacone') return 'Oznaczono jako opłacone';
    if (updates.status === 'Wykluczone') return 'Wykluczone z budżetu';
    if (updates.status === 'Do zapłaty') return 'Oznaczono jako do zapłaty';
  }
  if (keys.includes('included')) {
    return updates.included ? 'Przywrócono do budżetu' : 'Wykluczone z budżetu';
  }
  if (keys.includes('alternatywy') && keys.length === 1) {
    return 'Alternatywy zaktualizowane';
  }
  if (keys.includes('linki') && keys.length === 1) {
    return 'Linki zaktualizowane';
  }
  if (keys.includes('uwagi') && keys.length === 1) {
    return 'Uwagi zapisane';
  }
  if (keys.includes('uwagiMain')) {
    return 'Uwagi zapisane';
  }
  if (keys.includes('cena') || keys.includes('kwota')) {
    return 'Cena zaktualizowana';
  }
  if (keys.includes('wybranaAltId')) {
    return 'Opcja płatności zapisana';
  }
  return 'Pozycja zapisana';
}

interface BudgetActions {
  importData: (data: ImportResult) => void;
  resetAndImport: (data: ImportResult) => void;

  undoAction: () => void;
  redoAction: () => void;

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

  addMilestone: (entry: Omit<MilestoneEntry, 'id'>) => void;
  deleteMilestone: (id: string) => void;
  updateMilestone: (id: string, updates: Partial<MilestoneEntry>) => void;

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
  milestones: [],
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
    milestones: state.milestones,
    isDataLoaded: state.isDataLoaded,
  };
}

function captureForUndo(state: BudgetStore): void {
  useUndoStore.getState().pushSnapshot(getStateSnapshot(state));
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
      uwagiMain: (item.uwagiMain as string) || '',
      dataRealizacji: (item.dataRealizacji as string) || '',
      // Migrate: if included===false or old 'Pominięte' status, set to 'Wykluczone'
      ...( item.included === false && item.status !== 'Wykluczone' ? { status: 'Wykluczone' as const } : {}),
      ...( item.status === 'Pominięte' ? { status: 'Wykluczone' as const } : {}),
      included: item.included !== false,
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
    const milestones = ((loaded as unknown as Record<string, unknown>).milestones as BudgetState['milestones']) || [];
    init = { ...initialState, ...loaded, meble, wykonczenie, agd, pozostale, wyprowadzka, harmonogram, milestones };
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
          milestones: data.milestones.length > 0 ? data.milestones : state.milestones,
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
          milestones: data.milestones,
          isDataLoaded: true,
        };
        persistState(getStateSnapshot(newState as BudgetStore));
        return newState;
      });
    },

    undoAction: () => {
      const currentSnapshot = getStateSnapshot(get() as BudgetStore);
      const previous = useUndoStore.getState().undo(currentSnapshot);
      if (previous) {
        set(previous);
        persistState(previous);
      }
    },

    redoAction: () => {
      const currentSnapshot = getStateSnapshot(get() as BudgetStore);
      const next = useUndoStore.getState().redo(currentSnapshot);
      if (next) {
        set(next);
        persistState(next);
      }
    },

    // Meble
    updateMebleItem: (id, updates) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const meble = state.meble.map((item) => item.id === id ? { ...item, ...updates } : item);
        const newState = { ...state, meble };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { meble };
      });
      notify.success(describeUpdate(updates as Record<string, unknown>));
    },
    addMebleItem: (item) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const meble = [...state.meble, { ...item, id: generateId() }];
        const newState = { ...state, meble };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { meble };
      });
      notify.success('Pozycja dodana');
    },
    deleteMebleItem: (id) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const meble = state.meble.filter((item) => item.id !== id);
        const newState = { ...state, meble };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { meble };
      });
      notify.success('Pozycja usunięta');
    },

    // Wykończenie
    updateWykonczenieItem: (id, updates) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const wykonczenie = state.wykonczenie.map((item) => item.id === id ? { ...item, ...updates } : item);
        const newState = { ...state, wykonczenie };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { wykonczenie };
      });
      notify.success(describeUpdate(updates as Record<string, unknown>));
    },
    addWykonczenieItem: (item) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const wykonczenie = [...state.wykonczenie, { ...item, id: generateId() }];
        const newState = { ...state, wykonczenie };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { wykonczenie };
      });
      notify.success('Pozycja dodana');
    },
    deleteWykonczenieItem: (id) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const wykonczenie = state.wykonczenie.filter((item) => item.id !== id);
        const newState = { ...state, wykonczenie };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { wykonczenie };
      });
      notify.success('Pozycja usunięta');
    },

    // AGD
    updateAGDItem: (id, updates) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const agd = state.agd.map((item) => item.id === id ? { ...item, ...updates } : item);
        const newState = { ...state, agd };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { agd };
      });
      notify.success(describeUpdate(updates as Record<string, unknown>));
    },
    addAGDItem: (item) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const agd = [...state.agd, { ...item, id: generateId() }];
        const newState = { ...state, agd };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { agd };
      });
      notify.success('Pozycja dodana');
    },
    deleteAGDItem: (id) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const agd = state.agd.filter((item) => item.id !== id);
        const newState = { ...state, agd };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { agd };
      });
      notify.success('Pozycja usunięta');
    },

    // Pozostałe
    updatePozostaleItem: (id, updates) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const pozostale = state.pozostale.map((item) => item.id === id ? { ...item, ...updates } : item);
        const newState = { ...state, pozostale };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { pozostale };
      });
      notify.success(describeUpdate(updates as Record<string, unknown>));
    },
    addPozostaleItem: (item) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const pozostale = [...state.pozostale, { ...item, id: generateId() }];
        const newState = { ...state, pozostale };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { pozostale };
      });
      notify.success('Pozycja dodana');
    },
    deletePozostaleItem: (id) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const pozostale = state.pozostale.filter((item) => item.id !== id);
        const newState = { ...state, pozostale };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { pozostale };
      });
      notify.success('Pozycja usunięta');
    },

    // Wyprowadzka
    updateWyprowadzkaItem: (id, updates) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const wyprowadzka = state.wyprowadzka.map((item) => item.id === id ? { ...item, ...updates } : item);
        const newState = { ...state, wyprowadzka };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { wyprowadzka };
      });
      notify.success(describeUpdate(updates as Record<string, unknown>));
    },
    addWyprowadzkaItem: (item) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const wyprowadzka = [...state.wyprowadzka, { ...item, id: generateId() }];
        const newState = { ...state, wyprowadzka };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { wyprowadzka };
      });
      notify.success('Pozycja dodana');
    },
    deleteWyprowadzkaItem: (id) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const wyprowadzka = state.wyprowadzka.filter((item) => item.id !== id);
        const newState = { ...state, wyprowadzka };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { wyprowadzka };
      });
      notify.success('Pozycja usunięta');
    },

    // Saldo
    addSaldoEntry: (entry) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const saldo = [...state.saldo, { ...entry, id: generateId() }];
        const newState = { ...state, saldo };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { saldo };
      });
      notify.success('Wpływ dodany');
    },
    deleteSaldoEntry: (id) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const saldo = state.saldo.filter((entry) => entry.id !== id);
        const newState = { ...state, saldo };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { saldo };
      });
      notify.success('Wpływ usunięty');
    },
    updateSaldoEntry: (id, updates) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const saldo = state.saldo.map((entry) => entry.id === id ? { ...entry, ...updates } : entry);
        const newState = { ...state, saldo };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { saldo };
      });
      notify.success('Wpływ zapisany');
    },

    // Harmonogram
    addScheduleEntry: (entry) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const harmonogram = [...state.harmonogram, { ...entry, id: generateId() }];
        const newState = { ...state, harmonogram };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { harmonogram };
      });
      notify.success('Wpływ zaplanowany');
    },
    deleteScheduleEntry: (id) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const harmonogram = state.harmonogram.filter((e) => e.id !== id);
        const newState = { ...state, harmonogram };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { harmonogram };
      });
      notify.success('Wpływ usunięty');
    },
    updateScheduleEntry: (id, updates) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const harmonogram = state.harmonogram.map((e) => e.id === id ? { ...e, ...updates } : e);
        const newState = { ...state, harmonogram };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { harmonogram };
      });
      notify.success('Wpływ zapisany');
    },
    toggleScheduleRealized: (id) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const harmonogram = state.harmonogram.map((e) =>
          e.id === id ? { ...e, zrealizowane: !e.zrealizowane } : e
        );
        const newState = { ...state, harmonogram };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { harmonogram };
      });
      notify.info('Status wpływu zmieniony');
    },

    // Milestones
    addMilestone: (entry) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const milestones = [...state.milestones, { ...entry, id: generateId() }];
        const newState = { ...state, milestones };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { milestones };
      });
      notify.success('Ważna data dodana');
    },
    deleteMilestone: (id) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const milestones = state.milestones.filter((e) => e.id !== id);
        const newState = { ...state, milestones };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { milestones };
      });
      notify.success('Ważna data usunięta');
    },
    updateMilestone: (id, updates) => {
      captureForUndo(get() as BudgetStore);
      set((state) => {
        const milestones = state.milestones.map((e) => e.id === id ? { ...e, ...updates } : e);
        const newState = { ...state, milestones };
        persistState(getStateSnapshot(newState as BudgetStore));
        return { milestones };
      });
      notify.success('Ważna data zaktualizowana');
    },

    // Computed
    getDashboardSummary: (): DashboardSummary => {
      const state = get();
      
      // Wpływy = suma wszystkich wpisów w saldzie (pieniądze, które wpłynęły na budżet)
      const wplywy = state.saldo.reduce((sum, entry) => sum + entry.kwota, 0);

      const mebleKoszt = state.meble.filter((i) => i.status !== 'Wykluczone').reduce((sum, i) => sum + i.cena, 0);
      const wykonczenieKoszt = state.wykonczenie.filter((i) => i.status !== 'Wykluczone').reduce((sum, i) => sum + i.kwota, 0);
      const agdKoszt = state.agd.filter((i) => i.status !== 'Wykluczone').reduce((sum, i) => sum + i.cena, 0);
      const pozostaleKoszt = state.pozostale.filter((i) => i.status !== 'Wykluczone').reduce((sum, i) => sum + i.cena, 0);
      const wyprowadzkaKoszt = state.wyprowadzka.filter((i) => i.status !== 'Wykluczone').reduce((sum, i) => sum + i.cena, 0);
      const lacznyKoszt = mebleKoszt + wykonczenieKoszt + agdKoszt + pozostaleKoszt + wyprowadzkaKoszt;

      const mebleZaplacono = state.meble.filter((i) => i.status === 'Opłacone').reduce((sum, i) => sum + i.cena, 0);
      const wykonczenieZaplacono = state.wykonczenie.filter((i) => i.status === 'Opłacone').reduce((sum, i) => sum + i.kwota, 0);
      const agdZaplacono = state.agd.filter((i) => i.status === 'Opłacone').reduce((sum, i) => sum + i.cena, 0);
      const pozostaleZaplacono = state.pozostale.filter((i) => i.status === 'Opłacone').reduce((sum, i) => sum + i.cena, 0);
      const wyprowadzkaZaplacono = state.wyprowadzka.filter((i) => i.status === 'Opłacone').reduce((sum, i) => sum + i.cena, 0);
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
        { name: 'Meblowanie', value: state.meble.filter((i) => i.status !== 'Wykluczone').reduce((sum, i) => sum + i.cena, 0) },
        { name: 'Wykończenie', value: state.wykonczenie.filter((i) => i.status !== 'Wykluczone').reduce((sum, i) => sum + i.kwota, 0) },
        { name: 'AGD / RTV', value: state.agd.filter((i) => i.status !== 'Wykluczone').reduce((sum, i) => sum + i.cena, 0) },
        { name: 'Inne', value: state.pozostale.filter((i) => i.status !== 'Wykluczone').reduce((sum, i) => sum + i.cena, 0) },
        { name: 'Wyprowadzka', value: state.wyprowadzka.filter((i) => i.status !== 'Wykluczone').reduce((sum, i) => sum + i.cena, 0) },
      ];
      return categories.filter((c) => c.value > 0);
    },

    getCategoryBreakdown: (): CategoryBreakdown[] => {
      const state = get();

      // Helper: get min and max possible cost for items with alternatives
      const getRange = (items: Array<{ included: boolean; status: string; cena?: number; kwota?: number; alternatywy: Array<{ cena: number }> }>, field: 'cena' | 'kwota') => {
        let minTotal = 0;
        let maxTotal = 0;
        for (const item of items.filter((i) => i.status !== 'Wykluczone')) {
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
          name: 'Meblowanie',
          zaplacono: state.meble.filter((i) => i.status === 'Opłacone').reduce((s, i) => s + i.cena, 0),
          doZaplaty: state.meble.filter((i) => i.status === 'Do zapłaty').reduce((s, i) => s + i.cena, 0),
          minKoszt: mebleRange.minTotal,
          maxKoszt: mebleRange.maxTotal,
        },
        {
          name: 'Wykończenie',
          zaplacono: state.wykonczenie.filter((i) => i.status === 'Opłacone').reduce((s, i) => s + i.kwota, 0),
          doZaplaty: state.wykonczenie.filter((i) => i.status === 'Do zapłaty').reduce((s, i) => s + i.kwota, 0),
          minKoszt: praceRange.minTotal,
          maxKoszt: praceRange.maxTotal,
        },
        {
          name: 'AGD / RTV',
          zaplacono: state.agd.filter((i) => i.status === 'Opłacone').reduce((s, i) => s + i.cena, 0),
          doZaplaty: state.agd.filter((i) => i.status === 'Do zapłaty').reduce((s, i) => s + i.cena, 0),
          minKoszt: sprzetRange.minTotal,
          maxKoszt: sprzetRange.maxTotal,
        },
        {
          name: 'Inne',
          zaplacono: state.pozostale.filter((i) => i.status === 'Opłacone').reduce((s, i) => s + i.cena, 0),
          doZaplaty: state.pozostale.filter((i) => i.status === 'Do zapłaty').reduce((s, i) => s + i.cena, 0),
          minKoszt: inneRange.minTotal,
          maxKoszt: inneRange.maxTotal,
        },
        {
          name: 'Wyprowadzka',
          zaplacono: state.wyprowadzka.filter((i) => i.status === 'Opłacone').reduce((s, i) => s + i.cena, 0),
          doZaplaty: state.wyprowadzka.filter((i) => i.status === 'Do zapłaty').reduce((s, i) => s + i.cena, 0),
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

      // Collect all included items with their costs and optional dates
      const allItems: { kwota: number; dataRealizacji: string }[] = [
        ...state.meble.filter(i => i.status === 'Do zapłaty').map(i => ({ kwota: i.cena, dataRealizacji: i.dataRealizacji || '' })),
        ...state.wykonczenie.filter(i => i.status === 'Do zapłaty').map(i => ({ kwota: i.kwota, dataRealizacji: i.dataRealizacji || '' })),
        ...state.agd.filter(i => i.status === 'Do zapłaty').map(i => ({ kwota: i.cena, dataRealizacji: i.dataRealizacji || '' })),
        ...state.pozostale.filter(i => i.status === 'Do zapłaty').map(i => ({ kwota: i.cena, dataRealizacji: i.dataRealizacji || '' })),
        ...state.wyprowadzka.filter(i => i.status === 'Do zapłaty').map(i => ({ kwota: i.cena, dataRealizacji: i.dataRealizacji || '' })),
      ];

      // Items without date = needed now, items with date = needed from that date
      const immediateTotal = allItems.filter(i => !i.dataRealizacji).reduce((s, i) => s + i.kwota, 0);
      const datedItems = allItems.filter(i => !!i.dataRealizacji).sort((a, b) => a.dataRealizacji.localeCompare(b.dataRealizacji));

      // Function to calculate cel (target) at a given date
      const getCelAtDate = (date: string): number => {
        let cel = immediateTotal;
        for (const item of datedItems) {
          if (item.dataRealizacji <= date) {
            cel += item.kwota;
          }
        }
        return cel;
      };

      // Get future (unrealized) planned incomes sorted by date
      const futureEntries = [...state.harmonogram]
        .filter((e) => !e.zrealizowane)
        .sort((a, b) => a.data.localeCompare(b.data));

      // Collect all significant dates (today, income dates, cost dates)
      const today = new Date().toISOString().split('T')[0];
      const allDates = new Set<string>([today]);
      futureEntries.forEach(e => allDates.add(e.data));
      datedItems.forEach(i => allDates.add(i.dataRealizacji));

      const sortedDates = Array.from(allDates).sort();

      const points: CashFlowPoint[] = [];
      let runningSaldo = startingSaldo;

      for (const date of sortedDates) {
        // Add income for this date
        const income = futureEntries.filter(e => e.data === date).reduce((s, e) => s + e.kwota, 0);
        if (date !== today) runningSaldo += income;

        points.push({
          data: date,
          label: date === today ? 'Dziś' : futureEntries.find(e => e.data === date)?.opis || datedItems.find(i => i.dataRealizacji === date) ? 'Nowy koszt' : '',
          saldo: runningSaldo,
          cel: getCelAtDate(date),
        });
      }

      return points;
    },
  };
});
