import * as XLSX from 'xlsx';
import { BudgetState } from '@/types';

export function exportToExcel(state: BudgetState): void {
  const workbook = XLSX.utils.book_new();

  // MebleImport
  if (state.meble.length > 0) {
    const mebleData = state.meble.map((item) => ({
      Pomieszczenie: item.pomieszczenie,
      Kategoria: item.kategoria,
      Nazwa: item.nazwa,
      Cena: item.cena,
      Status: item.status,
      'Uwzględnij': item.included ? 'TAK' : 'NIE',
      Uwagi: item.uwagi || '',
    }));
    const ws = XLSX.utils.json_to_sheet(mebleData);
    XLSX.utils.book_append_sheet(workbook, ws, 'MebleImport');
  }

  // WykończenieImport
  if (state.wykonczenie.length > 0) {
    const wykData = state.wykonczenie.map((item) => ({
      Etap: item.etap,
      Opis: item.opis,
      Kwota: item.kwota,
      Status: item.status,
      'Uwzględnij': item.included ? 'TAK' : 'NIE',
      Uwagi: item.uwagi || '',
    }));
    const ws = XLSX.utils.json_to_sheet(wykData);
    XLSX.utils.book_append_sheet(workbook, ws, 'WykończenieImport');
  }

  // AGDImport
  if (state.agd.length > 0) {
    const agdData = state.agd.map((item) => ({
      Nazwa: item.nazwa,
      Producent: item.producent,
      Model: item.model,
      Cena: item.cena,
      Status: item.status,
      'Uwzględnij': item.included ? 'TAK' : 'NIE',
      Uwagi: item.uwagi || '',
    }));
    const ws = XLSX.utils.json_to_sheet(agdData);
    XLSX.utils.book_append_sheet(workbook, ws, 'AGDImport');
  }

  // PozostałeImport
  if (state.pozostale.length > 0) {
    const pozData = state.pozostale.map((item) => ({
      Nazwa: item.nazwa,
      Cena: item.cena,
      Status: item.status,
      'Uwzględnij': item.included ? 'TAK' : 'NIE',
      Uwagi: item.uwagi || '',
    }));
    const ws = XLSX.utils.json_to_sheet(pozData);
    XLSX.utils.book_append_sheet(workbook, ws, 'PozostałeImport');
  }

  // Download
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Export_Budzet_Mieszkania_${date}.xlsx`);
}
