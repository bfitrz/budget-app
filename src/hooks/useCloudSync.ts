// Auto-sync hook — saves to cloud provider after changes with debounce
// + polls for remote changes and notifies user

import { useEffect, useRef, useCallback, useState } from 'react';
import { useBudgetStore } from '@/store';
import { useNotesStore } from '@/store/notesStore';
import { getStorageConfig, saveStorageConfig } from '@/storage/types';
import { GoogleDriveProvider } from '@/storage/googleDriveProvider';
import { exportToExcelBuffer } from '@/utils/excelExport';
import { importExcelBuffer } from '@/utils/excelImport';
import { notify } from '@/store/notificationStore';

let isSyncing = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function getCloudProvider() {
  const config = getStorageConfig();
  if (!config) return null;
  if (config.provider === 'google-drive') return new GoogleDriveProvider();
  return null;
}

async function doSaveToCloud() {
  const config = getStorageConfig();
  if (!config || config.provider === 'local' || !config.filePath) return;

  const provider = getCloudProvider();
  if (!provider) {
    console.log('Sync skipped: no provider');
    return;
  }

  if (!provider.isAuthenticated()) {
    // Try silent re-auth
    try {
      await provider.authenticate();
    } catch {
      console.log('Sync skipped: re-auth failed');
      return;
    }
  }

  if (isSyncing) return;
  isSyncing = true;

  try {
    console.log('Syncing to cloud...');
    const state = useBudgetStore.getState();
    const notes = useNotesStore.getState().notes;
    const buffer = exportToExcelBuffer(state, notes);
    await provider.saveFile(config.filePath, buffer);

    const now = new Date().toISOString();
    saveStorageConfig({ ...config, lastSync: now });
    console.log('Sync complete:', now);
    notify.success('Zapisano do chmury');
  } catch (err) {
    console.error('Cloud sync failed:', err);
    notify.error('Synchronizacja nie powiodła się');
  } finally {
    isSyncing = false;
  }
}

function scheduleSave() {
  const config = getStorageConfig();
  if (!config || config.provider === 'local' || !config.autoSync || !config.filePath) return;

  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    doSaveToCloud();
  }, config.syncInterval || 5000);
}

export function useCloudSync() {
  const [remoteChanged, setRemoteChanged] = useState(false);
  const [lastEditor, setLastEditor] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<string | null>(null);
  const lastKnownModifiedRef = useRef<string | null>(null);
  const subscribedRef = useRef(false);

  const config = getStorageConfig();
  const isCloud = config?.provider === 'google-drive';

  // Subscribe to store changes — trigger save
  useEffect(() => {
    if (!isCloud || !config?.autoSync || !config?.filePath) return;
    if (subscribedRef.current) return;
    subscribedRef.current = true;

    const unsub = useBudgetStore.subscribe(() => {
      scheduleSave();
    });

    return () => {
      unsub();
      subscribedRef.current = false;
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [isCloud, config?.autoSync, config?.filePath]);

  // Poll for remote changes
  useEffect(() => {
    if (!isCloud || !config?.filePath || config?.autoPoll === false) return;

    const token = localStorage.getItem('budget-app-gdrive-token');
    if (!token) return;

    const checkRemote = async () => {
      if (isSyncing) return;
      let currentToken = localStorage.getItem('budget-app-gdrive-token');
      if (!currentToken || !config?.filePath) return;

      try {
        let response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${config.filePath}?fields=modifiedTime,lastModifyingUser`,
          { headers: { Authorization: `Bearer ${currentToken}` } }
        );

        // Token expired — try silent refresh
        if (response.status === 401) {
          try {
            const provider = new GoogleDriveProvider();
            await provider.authenticate();
            currentToken = localStorage.getItem('budget-app-gdrive-token');
            if (!currentToken) return;
            response = await fetch(
              `https://www.googleapis.com/drive/v3/files/${config.filePath}?fields=modifiedTime,lastModifyingUser`,
              { headers: { Authorization: `Bearer ${currentToken}` } }
            );
          } catch {
            console.log('Poll: token refresh failed');
            return;
          }
        }

        if (!response.ok) {
          console.log('Poll failed:', response.status);
          return;
        }
        const data = await response.json();
        const remoteModified = data.modifiedTime;
        const isMe = data.lastModifyingUser?.me === true;

        setLastModified(remoteModified);

        if (data.lastModifyingUser && !isMe) {
          setLastEditor(data.lastModifyingUser.displayName || data.lastModifyingUser.emailAddress || null);
        }

        if (!lastKnownModifiedRef.current) {
          lastKnownModifiedRef.current = remoteModified;
          return;
        }

        if (remoteModified > lastKnownModifiedRef.current) {
          lastKnownModifiedRef.current = remoteModified;

          // Only notify if someone ELSE modified the file
          if (!isMe) {
            setRemoteChanged(true);
            const editorName = data.lastModifyingUser?.displayName || 'inna osoba';
            notify.info(`Plik zmieniony przez: ${editorName}`);
          }
        }
      } catch (err) {
        console.log('Poll error:', err);
      }
    };

    const initialTimeout = setTimeout(checkRemote, 3000);
    const pollInterval = setInterval(checkRemote, config.pollInterval || 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(pollInterval);
    };
  }, [isCloud, config?.filePath, config?.pollInterval]);

  // Load from cloud
  const loadFromCloud = useCallback(async (): Promise<boolean> => {
    const cfg = getStorageConfig();
    if (!cfg || cfg.provider === 'local' || !cfg.filePath) return false;
    const provider = getCloudProvider();
    if (!provider || !provider.isAuthenticated()) return false;

    try {
      const buffer = await provider.loadFile(cfg.filePath);
      const data = await importExcelBuffer(buffer);
      useBudgetStore.getState().resetAndImport(data);

      const now = new Date().toISOString();
      lastKnownModifiedRef.current = now;
      saveStorageConfig({ ...cfg, lastSync: now });
      setRemoteChanged(false);
      notify.success('Wczytano zmiany z chmury');
      return true;
    } catch (err) {
      console.error('Cloud load failed:', err);
      notify.error('Nie udało się wczytać zmian');
      return false;
    }
  }, []);

  const syncToCloud = useCallback(async () => {
    await doSaveToCloud();
  }, []);

  return {
    isCloud: !!isCloud,
    syncToCloud,
    loadFromCloud,
    lastSync: config?.lastSync || null,
    lastModified,
    isSyncing,
    remoteChanged,
    lastEditor,
    dismissRemoteChanged: () => setRemoteChanged(false),
  };
}
