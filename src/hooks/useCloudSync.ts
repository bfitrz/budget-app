// Auto-sync hook — saves to cloud provider after changes with debounce
// + polls for remote changes and notifies user

import { useEffect, useRef, useCallback, useState } from 'react';
import { useBudgetStore } from '@/store';
import { useNotesStore } from '@/store/notesStore';
import { getStorageConfig, saveStorageConfig } from '@/storage/types';
import { DropboxProvider } from '@/storage/dropboxProvider';
import { GoogleDriveProvider } from '@/storage/googleDriveProvider';
import { exportToExcelBuffer } from '@/utils/excelExport';
import { importExcelBuffer } from '@/utils/excelImport';
import { notify } from '@/store/notificationStore';

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let isSyncing = false;
let skipNextPoll = false;

export function useCloudSync() {
  const config = getStorageConfig();
  const isCloud = config?.provider === 'dropbox' || config?.provider === 'google-drive';
  const lastSyncRef = useRef<string | null>(config?.lastSync || null);
  const lastKnownModifiedRef = useRef<string | null>(null);
  const [remoteChanged, setRemoteChanged] = useState(false);
  const [lastEditor, setLastEditor] = useState<string | null>(null);

  const getProvider = useCallback(() => {
    if (!config) return null;
    if (config.provider === 'dropbox') return new DropboxProvider();
    if (config.provider === 'google-drive') return new GoogleDriveProvider();
    return null;
  }, [config?.provider]);

  // Save current state to cloud
  const syncToCloud = useCallback(async () => {
    if (!config || !isCloud || !config.filePath || isSyncing) return;
    const provider = getProvider();
    if (!provider || !provider.isAuthenticated()) {
      console.log('Sync skipped: not authenticated');
      return;
    }

    isSyncing = true;
    try {
      console.log('Syncing to cloud...');
      const state = useBudgetStore.getState();
      const notes = useNotesStore.getState().notes;
      const buffer = exportToExcelBuffer(state, notes);
      await provider.saveFile(config.filePath, buffer);

      const now = new Date().toISOString();
      lastSyncRef.current = now;
      // Don't set lastKnownModifiedRef here — let next poll pick up the real server time
      saveStorageConfig({ ...config, lastSync: now });
      skipNextPoll = true; // Don't trigger "changed by someone" for our own save
      console.log('Sync complete:', now);
    } catch (err) {
      console.error('Cloud sync failed:', err);
      notify.error('Synchronizacja nie powiodła się');
    } finally {
      isSyncing = false;
    }
  }, [config, isCloud, getProvider]);

  // Debounced sync — triggers after changes
  const scheduleSyncToCloud = useCallback(() => {
    if (!isCloud || !config?.autoSync) return;
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      syncToCloud();
    }, config.syncInterval || 5000);
  }, [isCloud, config?.autoSync, config?.syncInterval, syncToCloud]);

  // Load from cloud
  const loadFromCloud = useCallback(async (): Promise<boolean> => {
    if (!config || !isCloud || !config.filePath) return false;
    const provider = getProvider();
    if (!provider || !provider.isAuthenticated()) return false;

    try {
      const buffer = await provider.loadFile(config.filePath);
      const data = await importExcelBuffer(buffer);

      const store = useBudgetStore.getState();
      store.resetAndImport(data);

      const now = new Date().toISOString();
      lastSyncRef.current = now;
      lastKnownModifiedRef.current = now;
      saveStorageConfig({ ...config, lastSync: now });
      setRemoteChanged(false);
      notify.success('Wczytano zmiany z chmury');
      return true;
    } catch (err) {
      console.error('Cloud load failed:', err);
      notify.error('Nie udało się wczytać zmian');
      return false;
    }
  }, [config, isCloud, getProvider]);

  // Check if file was modified remotely
  const checkForRemoteChanges = useCallback(async () => {
    if (!config || !isCloud || !config.filePath) return;
    // Don't check while we're saving
    if (isSyncing) return;

    const token = localStorage.getItem('budget-app-gdrive-token');
    if (!token) return;

    try {
      if (config.provider === 'google-drive') {
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${config.filePath}?fields=modifiedTime,lastModifyingUser`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) {
          console.log('Poll failed:', response.status);
          return;
        }
        const data = await response.json();
        const remoteModified = data.modifiedTime;

        // Track last editor
        if (data.lastModifyingUser) {
          setLastEditor(data.lastModifyingUser.displayName || data.lastModifyingUser.emailAddress || null);
        }

        // First poll — just store the timestamp
        if (!lastKnownModifiedRef.current) {
          lastKnownModifiedRef.current = remoteModified;
          return;
        }

        // Compare — if remote is newer than what we know
        if (remoteModified > lastKnownModifiedRef.current) {
          // Update ref so we don't spam notifications
          lastKnownModifiedRef.current = remoteModified;
          
          if (skipNextPoll) {
            // This was our own save — ignore
            skipNextPoll = false;
          } else {
            setRemoteChanged(true);
            const editorName = data.lastModifyingUser?.displayName || 'inna osoba';
            notify.info(`Plik zmieniony przez: ${editorName}`);
          }
        }
      }
    } catch (err) {
      console.log('Poll error:', err);
    }
  }, [config, isCloud]);

  // Subscribe to store changes and trigger sync
  useEffect(() => {
    if (!isCloud || !config?.autoSync) return;

    const unsub = useBudgetStore.subscribe(() => {
      scheduleSyncToCloud();
    });

    return () => {
      unsub();
      if (syncTimeout) clearTimeout(syncTimeout);
    };
  }, [isCloud, config?.autoSync, scheduleSyncToCloud]);

  // Poll for remote changes
  useEffect(() => {
    if (!isCloud || !config?.filePath) return;

    const interval = config.pollInterval || 30000;
    
    // Initial delay then periodic check
    const initialTimeout = setTimeout(() => {
      checkForRemoteChanges();
    }, 5000); // 5s after mount

    const pollId = setInterval(() => {
      checkForRemoteChanges();
    }, interval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(pollId);
    };
  }, [isCloud, config?.filePath, config?.pollInterval]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isCloud,
    syncToCloud,
    loadFromCloud,
    lastSync: lastSyncRef.current,
    isSyncing,
    remoteChanged,
    lastEditor,
    dismissRemoteChanged: () => setRemoteChanged(false),
  };
}
