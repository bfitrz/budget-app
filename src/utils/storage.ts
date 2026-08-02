import { BudgetState } from '@/types';

const STORAGE_KEY = 'budget-app-data';

export function saveToLocalStorage(state: BudgetState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function loadFromLocalStorage(): BudgetState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return null;
    }
    return JSON.parse(serialized) as BudgetState;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}

export function clearLocalStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('budget-app-storage-config');
  localStorage.removeItem('budget-app-dropbox-token');
  localStorage.removeItem('budget-app-dropbox-refresh');
  localStorage.removeItem('budget-app-dropbox-path');
  localStorage.removeItem('budget-app-dropbox-appkey');
  localStorage.removeItem('budget-app-gdrive-token');
  localStorage.removeItem('budget-app-gdrive-fileid');
  localStorage.removeItem('budget-app-gdrive-clientid');
}
