// Dropbox storage provider using PKCE OAuth (no backend needed)
// Requires VITE_DROPBOX_APP_KEY environment variable

import { StorageProvider, StorageFile } from './types';

const APP_KEY = localStorage.getItem('budget-app-dropbox-appkey') || import.meta.env.VITE_DROPBOX_APP_KEY || '';
const REDIRECT_URI = `${window.location.origin}${window.location.pathname}`;
const TOKEN_KEY = 'budget-app-dropbox-token';
const REFRESH_TOKEN_KEY = 'budget-app-dropbox-refresh';
const FILE_PATH_KEY = 'budget-app-dropbox-path';
const CODE_VERIFIER_KEY = 'budget-app-dropbox-verifier';

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

export class DropboxProvider implements StorageProvider {
  type: 'dropbox' = 'dropbox';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem(TOKEN_KEY);
    this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  async authenticate(): Promise<void> {
    if (!APP_KEY) {
      throw new Error('Brak VITE_DROPBOX_APP_KEY. Skonfiguruj zmienną środowiskową.');
    }

    const codeVerifier = generateCodeVerifier();
    localStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const authUrl = new URL('https://www.dropbox.com/oauth2/authorize');
    authUrl.searchParams.set('client_id', APP_KEY);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('token_access_type', 'offline'); // Get refresh token

    window.location.href = authUrl.toString();
  }

  async handleCallback(code: string): Promise<void> {
    const codeVerifier = localStorage.getItem(CODE_VERIFIER_KEY);
    if (!codeVerifier) throw new Error('Brak code verifier — spróbuj ponownie.');

    const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: APP_KEY,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Dropbox auth error: ${err}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token || null;

    localStorage.setItem(TOKEN_KEY, this.accessToken!);
    if (this.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, this.refreshToken);
    localStorage.removeItem(CODE_VERIFIER_KEY);
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken || !APP_KEY) return;

    const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: APP_KEY,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      this.accessToken = data.access_token;
      localStorage.setItem(TOKEN_KEY, this.accessToken!);
    } else {
      // Refresh failed — need to re-auth
      this.disconnect();
      throw new Error('Sesja Dropbox wygasła. Zaloguj się ponownie.');
    }
  }

  private async apiCall(url: string, options: RequestInit): Promise<Response> {
    let response = await fetch(url, {
      ...options,
      headers: { ...options.headers as Record<string, string>, Authorization: `Bearer ${this.accessToken}` },
    });

    // If 401, try refresh
    if (response.status === 401 && this.refreshToken) {
      await this.refreshAccessToken();
      response = await fetch(url, {
        ...options,
        headers: { ...options.headers as Record<string, string>, Authorization: `Bearer ${this.accessToken}` },
      });
    }

    return response;
  }

  disconnect(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(FILE_PATH_KEY);
    localStorage.removeItem(CODE_VERIFIER_KEY);
  }

  async listFiles(): Promise<StorageFile[]> {
    const response = await this.apiCall('https://api.dropboxapi.com/2/files/search_v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '.xlsx',
        options: { file_extensions: ['xlsx'] },
      }),
    });

    if (!response.ok) throw new Error('Nie udało się pobrać listy plików');

    const data = await response.json();
    return (data.matches || []).map((match: { metadata: { metadata: { name: string; path_lower: string; server_modified: string; size: number } } }) => ({
      name: match.metadata.metadata.name,
      path: match.metadata.metadata.path_lower,
      modified: match.metadata.metadata.server_modified,
      size: match.metadata.metadata.size,
    }));
  }

  async loadFile(path: string): Promise<ArrayBuffer> {
    const response = await this.apiCall('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: { 'Dropbox-API-Arg': JSON.stringify({ path }) },
    });

    if (!response.ok) throw new Error(`Nie udało się pobrać pliku: ${path}`);
    return response.arrayBuffer();
  }

  async saveFile(path: string, data: ArrayBuffer): Promise<void> {
    const response = await this.apiCall('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({ path, mode: 'overwrite', mute: true }),
      },
      body: data,
    });

    if (!response.ok) throw new Error('Nie udało się zapisać pliku');
  }

  getSelectedFilePath(): string | null {
    return localStorage.getItem(FILE_PATH_KEY);
  }

  setSelectedFilePath(path: string): void {
    localStorage.setItem(FILE_PATH_KEY, path);
  }
}

// Check if we're returning from OAuth callback
export function checkDropboxCallback(): string | null {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  // Only match if we have a Dropbox verifier (not Google's code)
  if (code && localStorage.getItem(CODE_VERIFIER_KEY)) {
    // Clean URL but preserve hash
    window.history.replaceState({}, '', window.location.pathname + (window.location.hash || ''));
    return code;
  }
  return null;
}
