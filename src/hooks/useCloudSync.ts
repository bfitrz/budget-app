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

export function useCloudSync() {
  const config = getStorageConfig();
  const isCloud = config?.provider === 'dropbox' || config?.provider === 'google-drive';
  const lastSyncRef = useRef<string | null>(config?.lastSync || null);
  const lastKnownModifiedRef = useRef<string | null>(null);
  const [remoteChanged, setRemoteChanged] = useState(false);

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
    if (!provider || !provider.isAuthenticated()) return;

    isSyncing = true;
    try {
      const state = useBudgetStore.getState();
      const notes = useNotesStore.getState().notes;
      const buffer = exportToExcelBuffer(state, notes);
      await provider.saveFile(config.filePath, buffer);

      const now = new Date().toISOString();
      lastSyncRef.current = now;
      lastKnownModifiedRef.current = now;
      saveStorageConfig({ ...config, lastSync: now });
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
    if (!config || !isCloud || !config.filePath || isSyncing) return;
    const provider = getProvider();
    if (!provider || !provider.isAuthenticated()) return;

    try {
      // Only Google Drive for now — check modifiedTime
      if (config.provider === 'google-drive') {
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${config.filePath}?fields=modifiedTime`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('budget-app-gdrive-token')}` } }
        );
        if (!response.ok) return;
        const data = await response.json();
        const remoteModified = data.modifiedTime;

        if (lastKnownModifiedRef.current && remoteModified > lastKnownModifiedRef.current) {
          setRemoteChanged(true);
          notify.info('Plik został zmieniony przez inną osobę');
        }
        if (!lastKnownModifiedRef.current) {
          lastKnownModifiedRef.current = remoteModified;
        }
      }
    } catch {
      // Silently ignore polling errors
    }
  }, [config, isCloud, getProvider]);

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

  // Poll for remote changes every 30s
  useEffect(() => {
    if (!isCloud || !config?.filePath) return;

    // Initial check
    checkForRemoteChanges();

    const pollInterval = setInterval(checkForRemoteChanges, 30000);
    return () => clearInterval(pollInterval);
  }, [isCloud, config?.filePath, checkForRemoteChanges]);

  return {
    isCloud,
    syncToCloud,
    loadFromCloud,
    lastSync: lastSyncRef.current,
    isSyncing,
    remoteChanged,
    dismissRemoteChanged: () => setRemoteChanged(false),
  };
}
