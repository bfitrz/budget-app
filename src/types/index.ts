export type PaymentStatus = 'Opłacone' | 'Do zapłaty';

export interface MebleItem {
  id: string;
  included: boolean;
  pomieszczenie: string;
  kategoria: string;
  nazwa: string;
  cena: number;
  status: PaymentStatus;
  uwagi: string;
}

export interface WykonczenieItem {
  id: string;
  included: boolean;
  etap: string;
  opis: string;
  kwota: number;
  status: PaymentStatus;
  uwagi: string;
}

export interface AGDItem {
  id: string;
  included: boolean;
  nazwa: string;
  producent: string;
  model: string;
  cena: number;
  status: PaymentStatus;
  uwagi: string;
}

export interface PozostaleItem {
  id: string;
  included: boolean;
  nazwa: string;
  cena: number;
  status: PaymentStatus;
  uwagi: string;
}

export interface SaldoEntry {
  id: string;
  data: string;
  opis: string;
  kwota: number;
}

export interface ScheduleEntry {
  id: string;
  data: string;
  opis: string;
  kwota: number;
  zrealizowane: boolean;
}

export interface BudgetState {
  meble: MebleItem[];
  wykonczenie: WykonczenieItem[];
  agd: AGDItem[];
  pozostale: PozostaleItem[];
  saldo: SaldoEntry[];
  harmonogram: ScheduleEntry[];
  isDataLoaded: boolean;
}

export interface DashboardSummary {
  wplywy: number;
  aktualnieSrodki: number;
  lacznyKoszt: number;
  zaplacono: number;
  pozostaloDoZaplaty: number;
  bilans: number;
}

export interface CategoryCost {
  name: string;
  value: number;
}

export interface CategoryBreakdown {
  name: string;
  zaplacono: number;
  doZaplaty: number;
}

export interface CashFlowPoint {
  data: string;
  label: string;
  saldo: number;
}
