// Google Drive storage provider using OAuth 2.0 with PKCE
// Requires VITE_GOOGLE_CLIENT_ID environment variable
// Note: tokens expire after 1h, user may need to re-authorize periodically

import { StorageProvider, StorageFile } from './types';

const CLIENT_ID = localStorage.getItem('budget-app-gdrive-clientid') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const REDIRECT_URI = `${window.location.origin}${window.location.pathname}`;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const TOKEN_KEY = 'budget-app-gdrive-token';
const FILE_PATH_KEY = 'budget-app-gdrive-fileid';
const CODE_VERIFIER_KEY = 'budget-app-gdrive-verifier';

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(36).padStart(2, '0')).join('').slice(0, 64);
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  return crypto.subtle.digest('SHA-256', encoder.encode(plain));
}

function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const hash = await sha256(verifier);
  return base64URLEncode(hash);
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
    if (!CLIENT_ID) {
      throw new Error('Brak VITE_GOOGLE_CLIENT_ID. Skonfiguruj zmienną środowiskową.');
    }

    const codeVerifier = generateCodeVerifier();
    localStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    window.location.href = authUrl.toString();
  }

  async handleCallback(code: string): Promise<void> {
    const codeVerifier = localStorage.getItem(CODE_VERIFIER_KEY);
    if (!codeVerifier) throw new Error('Brak code verifier — spróbuj ponownie.');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Google auth error: ${err}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    localStorage.setItem(TOKEN_KEY, this.accessToken!);
    localStorage.removeItem(CODE_VERIFIER_KEY);
  }

  private async apiCall(url: string, options: RequestInit = {}): Promise<Response> {
    return fetch(url, {
      ...options,
      headers: { ...options.headers as Record<string, string>, Authorization: `Bearer ${this.accessToken}` },
    });
  }

  disconnect(): void {
    this.accessToken = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(FILE_PATH_KEY);
    localStorage.removeItem(CODE_VERIFIER_KEY);
  }

  async listFiles(): Promise<StorageFile[]> {
    const response = await this.apiCall(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent("mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'")}&fields=files(id,name,modifiedTime,size)&orderBy=modifiedTime desc`
    );

    if (!response.ok) {
      if (response.status === 401) {
        this.disconnect();
        throw new Error('Sesja Google wygasła. Zaloguj się ponownie.');
      }
      throw new Error('Nie udało się pobrać listy plików');
    }

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
    // Update existing file
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
    // Create new file with multipart upload
    const metadata = JSON.stringify({ name, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const boundary = 'budget_app_boundary';
    const body = `--${boundary}\r\nContent-Type: application/json\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`;
    
    const encoder = new TextEncoder();
    const prefix = encoder.encode(body);
    const suffix = encoder.encode(`\r\n--${boundary}--`);
    
    const combined = new Uint8Array(prefix.length + data.byteLength + suffix.length);
    combined.set(prefix, 0);
    combined.set(new Uint8Array(data), prefix.length);
    combined.set(suffix, prefix.length + data.byteLength);

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

export function checkGoogleDriveCallback(): string | null {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (code && localStorage.getItem(CODE_VERIFIER_KEY)) {
    window.history.replaceState({}, '', window.location.pathname);
    return code;
  }
  return null;
}
