// Storage provider abstraction
// Each provider implements this interface to sync budget data

export interface StorageProvider {
  type: 'local' | 'dropbox' | 'google-drive';
  
  // Auth
  isAuthenticated(): boolean;
  authenticate(): Promise<void>; // Opens OAuth flow
  disconnect(): void;
  
  // File operations
  listFiles(): Promise<StorageFile[]>;
  loadFile(path: string): Promise<ArrayBuffer>;
  saveFile(path: string, data: ArrayBuffer): Promise<void>;
  
  // State
  getSelectedFilePath(): string | null;
  setSelectedFilePath(path: string): void;
}

export interface StorageFile {
  name: string;
  path: string;
  modified: string; // ISO date
  size: number;
}

export interface StorageConfig {
  provider: 'local' | 'dropbox' | 'google-drive';
  filePath: string | null;
  autoSync: boolean;
  syncInterval: number; // ms
  lastSync: string | null; // ISO date
}

const STORAGE_CONFIG_KEY = 'budget-app-storage-config';

export function getStorageConfig(): StorageConfig | null {
  const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveStorageConfig(config: StorageConfig): void {
  localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
}

export function clearStorageConfig(): void {
  localStorage.removeItem(STORAGE_CONFIG_KEY);
}
