export type PaymentStatus = 'Opłacone' | 'Do zapłaty' | 'Pominięte';

export interface ItemLink {
  nazwa: string;
  url: string;
}

export interface AlternativeItem {
  id: string;
  included: boolean;
  nazwa: string;
  cena: number;
  linki: ItemLink[];
  uwagi: string;
}

export interface MebleItem {
  id: string;
  included: boolean;
  pomieszczenie: string;
  kategoria: string;
  nazwa: string;
  cena: number;
  status: PaymentStatus;
  uwagi: string;
  uwagiMain: string;
  linki: ItemLink[];
  alternatywy: AlternativeItem[];
  dataRealizacji: string;
  wybranaAltId: string | null;
}

export interface WykonczenieItem {
  id: string;
  included: boolean;
  etap: string;
  opis: string;
  kwota: number;
  status: PaymentStatus;
  uwagi: string;
  uwagiMain: string;
  linki: ItemLink[];
  alternatywy: AlternativeItem[];
  dataRealizacji: string;
  wybranaAltId: string | null;
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
  uwagiMain: string;
  linki: ItemLink[];
  alternatywy: AlternativeItem[];
  dataRealizacji: string;
  wybranaAltId: string | null;
}

export interface PozostaleItem {
  id: string;
  included: boolean;
  grupa: string;
  nazwa: string;
  cena: number;
  status: PaymentStatus;
  uwagi: string;
  uwagiMain: string;
  linki: ItemLink[];
  alternatywy: AlternativeItem[];
  dataRealizacji: string;
  wybranaAltId: string | null;
}

export interface WyprowadzkaItem {
  id: string;
  included: boolean;
  grupa: string;
  nazwa: string;
  cena: number;
  status: PaymentStatus;
  uwagi: string;
  uwagiMain: string;
  linki: ItemLink[];
  alternatywy: AlternativeItem[];
  dataRealizacji: string;
  wybranaAltId: string | null;
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

export interface MilestoneEntry {
  id: string;
  data: string;
  opis: string;
}

export interface BudgetState {
  meble: MebleItem[];
  wykonczenie: WykonczenieItem[];
  agd: AGDItem[];
  pozostale: PozostaleItem[];
  wyprowadzka: WyprowadzkaItem[];
  saldo: SaldoEntry[];
  harmonogram: ScheduleEntry[];
  milestones: MilestoneEntry[];
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
  minKoszt: number;
  maxKoszt: number;
}

export interface CashFlowPoint {
  data: string;
  label: string;
  saldo: number;
  cel: number;
}
