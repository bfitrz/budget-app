import * as XLSX from 'xlsx';
import {
  MebleItem,
  WykonczenieItem,
  AGDItem,
  PozostaleItem,
  WyprowadzkaItem,
  SaldoEntry,
  ScheduleEntry,
  MilestoneEntry,
  PaymentStatus,
  ItemLink,
  AlternativeItem,
} from '@/types';
import { StickyNote } from '@/store/notesStore';
import { generateId } from './id';
// --- Raw row interfaces ---
interface RawMebleRow {
  Pomieszczenie?: string;
  Kategoria?: string;
  Nazwa?: string;
  Cena?: number;
  Status?: string;
  Uwzględnij?: string;
  Uwagi?: string;
  UwagiMain?: string;
  DataRealizacji?: string;
  Linki?: string;
  Alternatywy?: string;
  WybranaAltId?: string;
}
interface RawWykonczenieRow {
  Etap?: string;
  Opis?: string;
  Kwota?: number;
  Status?: string;
  Uwzględnij?: string;
  Uwagi?: string;
  UwagiMain?: string;
  DataRealizacji?: string;
  Linki?: string;
  Alternatywy?: string;
  WybranaAltId?: string;
}
interface RawAGDRow {
  Nazwa?: string;
  Producent?: string;
  Model?: string;
  Cena?: number;
  Status?: string;
  Uwzględnij?: string;
  Uwagi?: string;
  UwagiMain?: string;
  DataRealizacji?: string;
  Linki?: string;
  Alternatywy?: string;
  WybranaAltId?: string;
}
interface RawPozostaleRow {
  Grupa?: string;
  Nazwa?: string;
  Cena?: number;
  Status?: string;
  Uwzględnij?: string;
  Uwagi?: string;
  UwagiMain?: string;
  DataRealizacji?: string;
  Linki?: string;
  Alternatywy?: string;
  WybranaAltId?: string;
}
interface RawWyprowadzkaRow {
  Grupa?: string;
  Nazwa?: string;
  Cena?: number;
  Status?: string;
  Uwzględnij?: string;
  Uwagi?: string;
  UwagiMain?: string;
  DataRealizacji?: string;
  Linki?: string;
  Alternatywy?: string;
  WybranaAltId?: string;
}
interface RawSaldoRow {
  Data?: string;
  Opis?: string;
  Kwota?: number;
}
interface RawHarmonogramRow {
  Data?: string;
  Opis?: string;
  Kwota?: number;
  Zrealizowane?: string;
}
interface RawNotatkaRow {
  Tekst?: string;
  Kolor?: string;
  Zrobione?: string;
  Data?: string;
}
// --- Parsers ---
function parseStatus(status: string | undefined): PaymentStatus {
  if (status === 'Opłacone') return 'Opłacone';
  if (status === 'Pominięte') return 'Pominięte';
  return 'Do zapłaty';
}
function parseIncluded(value: string | undefined): boolean {
  if (!value) return true;
  return value.toUpperCase() === 'TAK';
}
function parseStatusWithIncluded(statusValue: string | undefined, includedValue: string | undefined): { status: PaymentStatus; included: boolean } {
  const included = parseIncluded(includedValue);
  if (!included) return { status: 'Pominięte', included: false };
  return { status: parseStatus(statusValue), included: true };
}
function parseLinki(value: string | undefined): ItemLink[] {
  if (!value) return [];
  return value.split(';;').filter(Boolean).map((entry) => {
    const parts = entry.split('|');
    if (parts.length >= 2) {
      return { nazwa: parts[0], url: parts.slice(1).join('|') };
    }
    return { nazwa: entry, url: entry };
  });
}
function parseAlternatywy(value: string | undefined): AlternativeItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        id: item.id || generateId(),
        included: item.included !== false,
        nazwa: item.nazwa || '',
        cena: Number(item.cena) || 0,
        linki: Array.isArray(item.linki) ? item.linki : [],
        uwagi: item.uwagi || '',
      }));
    }
  } catch {
    // ignore parse errors
  }
  return [];
}
// --- Result interface ---
export interface ImportResult {
  meble: MebleItem[];
  wykonczenie: WykonczenieItem[];
  agd: AGDItem[];
  pozostale: PozostaleItem[];
  wyprowadzka: WyprowadzkaItem[];
  saldo: SaldoEntry[];
  harmonogram: ScheduleEntry[];
  milestones: MilestoneEntry[];
  notes: StickyNote[];
}
// --- Main import function ---
export async function importExcelFile(file: File): Promise<ImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const result: ImportResult = {
    meble: [],
    wykonczenie: [],
    agd: [],
    pozostale: [],
    wyprowadzka: [],
    saldo: [],
    harmonogram: [],
    milestones: [],
    notes: [],
  };
  // Meble (support both old "MebleImport" and new "Meble" sheet names)
  const mebleSheet = workbook.SheetNames.find((n) => n === 'Meble' || n === 'MebleImport');
  if (mebleSheet) {
    const sheet = workbook.Sheets[mebleSheet];
    const rows = XLSX.utils.sheet_to_json<RawMebleRow>(sheet);
    result.meble = rows.map((row) => ({
      id: generateId(),
      ...parseStatusWithIncluded(row.Status, row.Uwzględnij),
      pomieszczenie: row.Pomieszczenie || '',
      kategoria: row.Kategoria || '',
      nazwa: row.Nazwa || '',
      cena: Number(row.Cena) || 0,
      uwagi: row.Uwagi || '',
      uwagiMain: row.UwagiMain || '',
      dataRealizacji: row.DataRealizacji || '',
      linki: parseLinki(row.Linki),
      alternatywy: parseAlternatywy(row.Alternatywy),
      wybranaAltId: row.WybranaAltId || null,
    }));
  }
  // Wykończenie (support both old "WykończenieImport" and new "Wykończenie")
  const wykSheet = workbook.SheetNames.find((n) => n === 'Wykończenie' || n === 'WykończenieImport');
  if (wykSheet) {
    const sheet = workbook.Sheets[wykSheet];
    const rows = XLSX.utils.sheet_to_json<RawWykonczenieRow>(sheet);
    result.wykonczenie = rows.map((row) => ({
      id: generateId(),
      ...parseStatusWithIncluded(row.Status, row.Uwzględnij),
      etap: row.Etap || '',
      opis: row.Opis || '',
      kwota: Number(row.Kwota) || 0,
      uwagi: row.Uwagi || '',
      uwagiMain: row.UwagiMain || '',
      dataRealizacji: row.DataRealizacji || '',
      linki: parseLinki(row.Linki),
      alternatywy: parseAlternatywy(row.Alternatywy),
      wybranaAltId: row.WybranaAltId || null,
    }));
  }
  // AGD (support both old "AGDImport" and new "AGD")
  const agdSheet = workbook.SheetNames.find((n) => n === 'AGD' || n === 'AGDImport');
  if (agdSheet) {
    const sheet = workbook.Sheets[agdSheet];
    const rows = XLSX.utils.sheet_to_json<RawAGDRow>(sheet);
    result.agd = rows.map((row) => ({
      id: generateId(),
      ...parseStatusWithIncluded(row.Status, row.Uwzględnij),
      nazwa: row.Nazwa || '',
      producent: row.Producent || '',
      model: row.Model || '',
      cena: Number(row.Cena) || 0,
      uwagi: row.Uwagi || '',
      uwagiMain: row.UwagiMain || '',
      dataRealizacji: row.DataRealizacji || '',
      linki: parseLinki(row.Linki),
      alternatywy: parseAlternatywy(row.Alternatywy),
      wybranaAltId: row.WybranaAltId || null,
    }));
  }
  // Pozostałe (support both old "PozostałeImport" and new "Pozostałe")
  const pozSheet = workbook.SheetNames.find((n) => n === 'Pozostałe' || n === 'PozostałeImport');
  if (pozSheet) {
    const sheet = workbook.Sheets[pozSheet];
    const rows = XLSX.utils.sheet_to_json<RawPozostaleRow>(sheet);
    result.pozostale = rows.map((row) => ({
      id: generateId(),
      ...parseStatusWithIncluded(row.Status, row.Uwzględnij),
      grupa: row.Grupa || 'Ogólne',
      nazwa: row.Nazwa || '',
      cena: Number(row.Cena) || 0,
      uwagi: row.Uwagi || '',
      uwagiMain: row.UwagiMain || '',
      dataRealizacji: row.DataRealizacji || '',
      linki: parseLinki(row.Linki),
      alternatywy: parseAlternatywy(row.Alternatywy),
      wybranaAltId: row.WybranaAltId || null,
    }));
  }
  // Wyprowadzka
  if (workbook.SheetNames.includes('Wyprowadzka')) {
    const sheet = workbook.Sheets['Wyprowadzka'];
    const rows = XLSX.utils.sheet_to_json<RawWyprowadzkaRow>(sheet);
    result.wyprowadzka = rows.map((row) => ({
      id: generateId(),
      ...parseStatusWithIncluded(row.Status, row.Uwzględnij),
      grupa: row.Grupa || 'Ogólne',
      nazwa: row.Nazwa || '',
      cena: Number(row.Cena) || 0,
      uwagi: row.Uwagi || '',
      uwagiMain: row.UwagiMain || '',
      dataRealizacji: row.DataRealizacji || '',
      linki: parseLinki(row.Linki),
      alternatywy: parseAlternatywy(row.Alternatywy),
      wybranaAltId: row.WybranaAltId || null,
    }));
  }
  // Saldo
  if (workbook.SheetNames.includes('Saldo')) {
    const sheet = workbook.Sheets['Saldo'];
    const rows = XLSX.utils.sheet_to_json<RawSaldoRow>(sheet);
    result.saldo = rows.map((row) => ({
      id: generateId(),
      data: row.Data || '',
      opis: row.Opis || '',
      kwota: Number(row.Kwota) || 0,
    }));
  }
  // Harmonogram
  if (workbook.SheetNames.includes('Harmonogram')) {
    const sheet = workbook.Sheets['Harmonogram'];
    const rows = XLSX.utils.sheet_to_json<RawHarmonogramRow>(sheet);
    result.harmonogram = rows.map((row) => ({
      id: generateId(),
      data: row.Data || '',
      opis: row.Opis || '',
      kwota: Number(row.Kwota) || 0,
      zrealizowane: row.Zrealizowane?.toUpperCase() === 'TAK',
    }));
  }
  // Milestones
  if (workbook.SheetNames.includes('Milestones')) {
    const sheet = workbook.Sheets['Milestones'];
    const rows = XLSX.utils.sheet_to_json<{ Data?: string; Opis?: string }>(sheet);
    result.milestones = rows.map((row) => ({
      id: generateId(),
      data: row.Data || '',
      opis: row.Opis || '',
    }));
  }
  // Notatki
  if (workbook.SheetNames.includes('Notatki')) {
    const sheet = workbook.Sheets['Notatki'];
    const rows = XLSX.utils.sheet_to_json<RawNotatkaRow>(sheet);
    result.notes = rows.map((row) => ({
      id: generateId(),
      text: row.Tekst || '',
      color: row.Kolor || '#fef08a',
      done: row.Zrobione?.toUpperCase() === 'TAK',
      createdAt: row.Data || new Date().toISOString(),
    }));
  }
  return result;
}
