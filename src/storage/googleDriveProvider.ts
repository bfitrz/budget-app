// Google Drive storage provider using Google Identity Services (token client)
// No client_secret needed — works entirely from frontend
// Token expires after 1h, auto-prompts re-auth when needed

import { StorageProvider, StorageFile } from './types';

const TOKEN_KEY = 'budget-app-gdrive-token';
const FILE_PATH_KEY = 'budget-app-gdrive-fileid';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let resolveAuth: ((token: string) => void) | null = null;
let rejectAuth: ((err: Error) => void) | null = null;

function getClientId(): string {
  return localStorage.getItem('budget-app-gdrive-clientid') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '193515898789-crf6i7psgh579jsn9ih3ggsdf7r5seu7.apps.googleusercontent.com';
}

// Load the GIS script dynamically
function loadGisScript(): Promise<void> {
  if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Nie udało się załadować Google Identity Services'));
    document.head.appendChild(script);
  });
}

function initTokenClient(clientId: string): google.accounts.oauth2.TokenClient {
  return google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/drive',
    callback: (response) => {
      if (response.error) {
        if (rejectAuth) rejectAuth(new Error(response.error_description || response.error));
        rejectAuth = null;
        resolveAuth = null;
        return;
      }
      const token = response.access_token;
      localStorage.setItem(TOKEN_KEY, token);
      if (resolveAuth) resolveAuth(token);
      resolveAuth = null;
      rejectAuth = null;
    },
  });
}

export class GoogleDriveProvider implements StorageProvider {
  type: 'google-drive' = 'google-drive';
  private accessToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  async authenticate(): Promise<void> {
    const clientId = getClientId();
    if (!clientId) {
      throw new Error('Brak Client ID. Skonfiguruj w ustawieniach.');
    }

    await loadGisScript();

    if (!tokenClient) {
      tokenClient = initTokenClient(clientId);
    }

    return new Promise((resolve, reject) => {
      resolveAuth = (token) => {
        this.accessToken = token;
        resolve();
      };
      rejectAuth = reject;
      tokenClient!.requestAccessToken({ prompt: 'consent' });
    });
  }

  private async apiCall(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      headers: { ...options.headers as Record<string, string>, Authorization: `Bearer ${this.accessToken}` },
    });

    // If 401, token expired — re-authenticate
    if (response.status === 401) {
      try {
        await this.authenticate();
        return fetch(url, {
          ...options,
          headers: { ...options.headers as Record<string, string>, Authorization: `Bearer ${this.accessToken}` },
        });
      } catch {
        this.disconnect();
        throw new Error('Sesja Google wygasła. Zaloguj się ponownie.');
      }
    }

    return response;
  }

  disconnect(): void {
    this.accessToken = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(FILE_PATH_KEY);
  }

  async listFiles(): Promise<StorageFile[]> {
    // List own xlsx files + shared with me
    const query = "mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' and trashed=false";
    const response = await this.apiCall(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime,size,shared,owners)&orderBy=modifiedTime desc&includeItemsFromAllDrives=false&supportsAllDrives=false`
    );

    if (!response.ok) throw new Error('Nie udało się pobrać listy plików');

    const data = await response.json();
    return (data.files || []).map((file: { id: string; name: string; modifiedTime: string; size: string }) => ({
      name: file.name,
      path: file.id,
      modified: file.modifiedTime,
      size: Number(file.size) || 0,
    }));
  }

  async loadFile(fileId: string): Promise<ArrayBuffer> {
    const response = await this.apiCall(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
    );
    if (!response.ok) throw new Error('Nie udało się pobrać pliku');
    return response.arrayBuffer();
  }

  async saveFile(fileId: string, data: ArrayBuffer): Promise<void> {
    const response = await this.apiCall(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        body: data,
      }
    );
    if (!response.ok) throw new Error('Nie udało się zapisać pliku');
  }

  async createFile(name: string, data: ArrayBuffer): Promise<string> {
    const metadata = JSON.stringify({ name, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const boundary = 'budget_app_boundary';
    const prefix = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`;
    const suffix = `\r\n--${boundary}--`;

    const encoder = new TextEncoder();
    const prefixBytes = encoder.encode(prefix);
    const suffixBytes = encoder.encode(suffix);

    const combined = new Uint8Array(prefixBytes.length + data.byteLength + suffixBytes.length);
    combined.set(prefixBytes, 0);
    combined.set(new Uint8Array(data), prefixBytes.length);
    combined.set(suffixBytes, prefixBytes.length + data.byteLength);

    const response = await this.apiCall(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
        body: combined,
      }
    );

    if (!response.ok) throw new Error('Nie udało się utworzyć pliku');
    const result = await response.json();
    return result.id;
  }

  getSelectedFilePath(): string | null {
    return localStorage.getItem(FILE_PATH_KEY);
  }

  setSelectedFilePath(fileId: string): void {
    localStorage.setItem(FILE_PATH_KEY, fileId);
  }
}
