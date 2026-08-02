// Auto-sync hook — saves to cloud provider after changes with debounce

import { useEffect, useRef, useCallback } from 'react';
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
      saveStorageConfig({ ...config, lastSync: now });
      return true;
    } catch (err) {
      console.error('Cloud load failed:', err);
      return false;
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

  return {
    isCloud,
    syncToCloud,
    loadFromCloud,
    lastSync: lastSyncRef.current,
    isSyncing,
  };
}
