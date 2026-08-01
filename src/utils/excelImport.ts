import * as XLSX from 'xlsx';
import { MebleItem, WykonczenieItem, AGDItem, PozostaleItem, PaymentStatus } from '@/types';
import { generateId } from './id';

interface RawMebleRow {
  Pomieszczenie?: string;
  Kategoria?: string;
  Nazwa?: string;
  Cena?: number;
  Status?: string;
  'Uwzględnij'?: string;
  Uwagi?: string;
}

interface RawWykonczenieRow {
  Etap?: string;
  Opis?: string;
  Kwota?: number;
  Status?: string;
  'Uwzględnij'?: string;
  Uwagi?: string;
}

interface RawAGDRow {
  Nazwa?: string;
  Producent?: string;
  Model?: string;
  Cena?: number;
  Status?: string;
  'Uwzględnij'?: string;
  Uwagi?: string;
}

interface RawPozostaleRow {
  Nazwa?: string;
  Cena?: number;
  Status?: string;
  'Uwzględnij'?: string;
  Uwagi?: string;
}

function parseStatus(status: string | undefined): PaymentStatus {
  if (status === 'Opłacone') return 'Opłacone';
  return 'Do zapłaty';
}

function parseIncluded(value: string | undefined): boolean {
  if (!value) return true;
  return value.toUpperCase() === 'TAK';
}

export interface ImportResult {
  meble: MebleItem[];
  wykonczenie: WykonczenieItem[];
  agd: AGDItem[];
  pozostale: PozostaleItem[];
}

export async function importExcelFile(file: File): Promise<ImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const result: ImportResult = {
    meble: [],
    wykonczenie: [],
    agd: [],
    pozostale: [],
  };

  if (workbook.SheetNames.includes('MebleImport')) {
    const sheet = workbook.Sheets['MebleImport'];
    const rows = XLSX.utils.sheet_to_json<RawMebleRow>(sheet);
    result.meble = rows.map((row) => ({
      id: generateId(),
      included: parseIncluded(row['Uwzględnij']),
      pomieszczenie: row.Pomieszczenie || '',
      kategoria: row.Kategoria || '',
      nazwa: row.Nazwa || '',
      cena: Number(row.Cena) || 0,
      status: parseStatus(row.Status),
      uwagi: row.Uwagi || '',
      linki: [],
      alternatywy: [],
      wybranaAltId: null,
    }));
  }

  if (workbook.SheetNames.includes('WykończenieImport')) {
    const sheet = workbook.Sheets['WykończenieImport'];
    const rows = XLSX.utils.sheet_to_json<RawWykonczenieRow>(sheet);
    result.wykonczenie = rows.map((row) => ({
      id: generateId(),
      included: parseIncluded(row['Uwzględnij']),
      etap: row.Etap || '',
      opis: row.Opis || '',
      kwota: Number(row.Kwota) || 0,
      status: parseStatus(row.Status),
      uwagi: row.Uwagi || '',
      linki: [],
      alternatywy: [],
      wybranaAltId: null,
    }));
  }

  if (workbook.SheetNames.includes('AGDImport')) {
    const sheet = workbook.Sheets['AGDImport'];
    const rows = XLSX.utils.sheet_to_json<RawAGDRow>(sheet);
    result.agd = rows.map((row) => ({
      id: generateId(),
      included: parseIncluded(row['Uwzględnij']),
      nazwa: row.Nazwa || '',
      producent: row.Producent || '',
      model: row.Model || '',
      cena: Number(row.Cena) || 0,
      status: parseStatus(row.Status),
      uwagi: row.Uwagi || '',
      linki: [],
      alternatywy: [],
      wybranaAltId: null,
    }));
  }

  if (workbook.SheetNames.includes('PozostałeImport')) {
    const sheet = workbook.Sheets['PozostałeImport'];
    const rows = XLSX.utils.sheet_to_json<RawPozostaleRow>(sheet);
    result.pozostale = rows.map((row) => ({
      id: generateId(),
      included: parseIncluded(row['Uwzględnij']),
      grupa: 'Ogólne',
      nazwa: row.Nazwa || '',
      cena: Number(row.Cena) || 0,
      status: parseStatus(row.Status),
      uwagi: row.Uwagi || '',
      linki: [],
      alternatywy: [],
      wybranaAltId: null,
    }));
  }

  return result;
}
