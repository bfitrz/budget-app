import * as XLSX from 'xlsx';
import { BudgetState, ItemLink, AlternativeItem } from '@/types';
import { StickyNote } from '@/store/notesStore';

function serializeLinki(linki: ItemLink[]): string {
  if (!linki || linki.length === 0) return '';
  return linki.map((l) => `${l.nazwa}|${l.url}`).join(';;');
}

function serializeAlternatywy(alternatywy: AlternativeItem[]): string {
  if (!alternatywy || alternatywy.length === 0) return '';
  return JSON.stringify(alternatywy);
}

export function exportToExcel(state: BudgetState, notes?: StickyNote[]): void {
  const workbook = XLSX.utils.book_new();

  // Meble
  if (state.meble.length > 0) {
    const mebleData = state.meble.map((item) => ({
      Pomieszczenie: item.pomieszczenie,
      Kategoria: item.kategoria,
      Nazwa: item.nazwa,
      Cena: item.cena,
      Status: item.status,
      Uwzględnij: item.status !== 'Pominięte' ? 'TAK' : 'NIE',
      Uwagi: item.uwagi || '',
      UwagiMain: item.uwagiMain || '',
      DataRealizacji: item.dataRealizacji || '',
      Linki: serializeLinki(item.linki),
      Alternatywy: serializeAlternatywy(item.alternatywy),
      WybranaAltId: item.wybranaAltId || '',
    }));
    const ws = XLSX.utils.json_to_sheet(mebleData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Meble');
  }

  // Wykończenie
  if (state.wykonczenie.length > 0) {
    const wykData = state.wykonczenie.map((item) => ({
      Etap: item.etap,
      Opis: item.opis,
      Kwota: item.kwota,
      Status: item.status,
      Uwzględnij: item.status !== 'Pominięte' ? 'TAK' : 'NIE',
      Uwagi: item.uwagi || '',
      UwagiMain: item.uwagiMain || '',
      DataRealizacji: item.dataRealizacji || '',
      Linki: serializeLinki(item.linki),
      Alternatywy: serializeAlternatywy(item.alternatywy),
      WybranaAltId: item.wybranaAltId || '',
    }));
    const ws = XLSX.utils.json_to_sheet(wykData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Wykończenie');
  }

  // AGD
  if (state.agd.length > 0) {
    const agdData = state.agd.map((item) => ({
      Nazwa: item.nazwa,
      Producent: item.producent,
      Model: item.model,
      Cena: item.cena,
      Status: item.status,
      Uwzględnij: item.status !== 'Pominięte' ? 'TAK' : 'NIE',
      Uwagi: item.uwagi || '',
      UwagiMain: item.uwagiMain || '',
      DataRealizacji: item.dataRealizacji || '',
      Linki: serializeLinki(item.linki),
      Alternatywy: serializeAlternatywy(item.alternatywy),
      WybranaAltId: item.wybranaAltId || '',
    }));
    const ws = XLSX.utils.json_to_sheet(agdData);
    XLSX.utils.book_append_sheet(workbook, ws, 'AGD');
  }

  // Pozostałe
  if (state.pozostale.length > 0) {
    const pozData = state.pozostale.map((item) => ({
      Grupa: item.grupa,
      Nazwa: item.nazwa,
      Cena: item.cena,
      Status: item.status,
      Uwzględnij: item.status !== 'Pominięte' ? 'TAK' : 'NIE',
      Uwagi: item.uwagi || '',
      UwagiMain: item.uwagiMain || '',
      DataRealizacji: item.dataRealizacji || '',
      Linki: serializeLinki(item.linki),
      Alternatywy: serializeAlternatywy(item.alternatywy),
      WybranaAltId: item.wybranaAltId || '',
    }));
    const ws = XLSX.utils.json_to_sheet(pozData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Pozostałe');
  }

  // Wyprowadzka
  if (state.wyprowadzka.length > 0) {
    const wypData = state.wyprowadzka.map((item) => ({
      Grupa: item.grupa,
      Nazwa: item.nazwa,
      Cena: item.cena,
      Status: item.status,
      Uwzględnij: item.status !== 'Pominięte' ? 'TAK' : 'NIE',
      Uwagi: item.uwagi || '',
      UwagiMain: item.uwagiMain || '',
      DataRealizacji: item.dataRealizacji || '',
      Linki: serializeLinki(item.linki),
      Alternatywy: serializeAlternatywy(item.alternatywy),
      WybranaAltId: item.wybranaAltId || '',
    }));
    const ws = XLSX.utils.json_to_sheet(wypData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Wyprowadzka');
  }

  // Saldo
  if (state.saldo.length > 0) {
    const saldoData = state.saldo.map((entry) => ({
      Data: entry.data,
      Opis: entry.opis,
      Kwota: entry.kwota,
    }));
    const ws = XLSX.utils.json_to_sheet(saldoData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Saldo');
  }

  // Harmonogram
  if (state.harmonogram.length > 0) {
    const harmData = state.harmonogram.map((entry) => ({
      Data: entry.data,
      Opis: entry.opis,
      Kwota: entry.kwota,
      Zrealizowane: entry.zrealizowane ? 'TAK' : 'NIE',
    }));
    const ws = XLSX.utils.json_to_sheet(harmData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Harmonogram');
  }

  // Milestones
  if (state.milestones && state.milestones.length > 0) {
    const msData = state.milestones.map((ms) => ({
      Data: ms.data,
      Opis: ms.opis,
    }));
    const ws = XLSX.utils.json_to_sheet(msData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Milestones');
  }

  // Notatki
  if (notes && notes.length > 0) {
    const notesData = notes.map((note) => ({
      Tekst: note.text,
      Kolor: note.color,
      Zrobione: note.done ? 'TAK' : 'NIE',
      Data: note.createdAt,
    }));
    const ws = XLSX.utils.json_to_sheet(notesData);
    XLSX.utils.book_append_sheet(workbook, ws, 'Notatki');
  }

  // Download
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Export_Budzet_Mieszkania_${date}.xlsx`);
}

export function exportTemplate(): void {
  const workbook = XLSX.utils.book_new();

  // Meble
  const mebleHeaders = [['Pomieszczenie', 'Kategoria', 'Nazwa', 'Cena', 'Status', 'Uwzględnij', 'Uwagi', 'Linki', 'Alternatywy', 'UwagiMain', 'DataRealizacji', 'WybranaAltId']];
  const wsMeble = XLSX.utils.aoa_to_sheet(mebleHeaders);
  XLSX.utils.book_append_sheet(workbook, wsMeble, 'Meble');

  // Wykończenie
  const wykHeaders = [['Etap', 'Opis', 'Kwota', 'Status', 'Uwzględnij', 'Uwagi', 'Linki', 'Alternatywy', 'UwagiMain', 'DataRealizacji', 'WybranaAltId']];
  const wsWyk = XLSX.utils.aoa_to_sheet(wykHeaders);
  XLSX.utils.book_append_sheet(workbook, wsWyk, 'Wykończenie');

  // AGD
  const agdHeaders = [['Nazwa', 'Producent', 'Model', 'Cena', 'Status', 'Uwzględnij', 'Uwagi', 'Linki', 'Alternatywy', 'UwagiMain', 'DataRealizacji', 'WybranaAltId']];
  const wsAgd = XLSX.utils.aoa_to_sheet(agdHeaders);
  XLSX.utils.book_append_sheet(workbook, wsAgd, 'AGD');

  // Pozostałe
  const pozHeaders = [['Grupa', 'Nazwa', 'Cena', 'Status', 'Uwzględnij', 'Uwagi', 'Linki', 'Alternatywy', 'UwagiMain', 'DataRealizacji', 'WybranaAltId']];
  const wsPoz = XLSX.utils.aoa_to_sheet(pozHeaders);
  XLSX.utils.book_append_sheet(workbook, wsPoz, 'Pozostałe');

  // Wyprowadzka
  const wypHeaders = [['Grupa', 'Nazwa', 'Cena', 'Status', 'Uwzględnij', 'Uwagi', 'Linki', 'Alternatywy', 'UwagiMain', 'DataRealizacji', 'WybranaAltId']];
  const wsWyp = XLSX.utils.aoa_to_sheet(wypHeaders);
  XLSX.utils.book_append_sheet(workbook, wsWyp, 'Wyprowadzka');

  // Saldo
  const saldoHeaders = [['Data', 'Opis', 'Kwota']];
  const wsSaldo = XLSX.utils.aoa_to_sheet(saldoHeaders);
  XLSX.utils.book_append_sheet(workbook, wsSaldo, 'Saldo');

  // Harmonogram
  const harmHeaders = [['Data', 'Opis', 'Kwota', 'Zrealizowane']];
  const wsHarm = XLSX.utils.aoa_to_sheet(harmHeaders);
  XLSX.utils.book_append_sheet(workbook, wsHarm, 'Harmonogram');

  // Milestones
  const msHeaders = [['Data', 'Opis']];
  const wsMs = XLSX.utils.aoa_to_sheet(msHeaders);
  XLSX.utils.book_append_sheet(workbook, wsMs, 'Milestones');

  // Notatki
  const notatkiHeaders = [['Tekst', 'Kolor', 'Zrobione', 'Data']];
  const wsNotatki = XLSX.utils.aoa_to_sheet(notatkiHeaders);
  XLSX.utils.book_append_sheet(workbook, wsNotatki, 'Notatki');

  XLSX.writeFile(workbook, 'Szablon_Budzet_Mieszkania.xlsx');
}
