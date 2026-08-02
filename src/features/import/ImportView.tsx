import { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Button, Alert, Card, CardContent, CircularProgress,
  alpha, useTheme, Snackbar, Chip, Switch, FormControlLabel, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, Select, MenuItem,
  List, ListItemButton, ListItemText, Link, IconButton, Slider, Tooltip,
} from '@mui/material';
import {
  FileUpload as UploadIcon, CloudUpload as CloudIcon, FileDownload as DownloadIcon,
  Description as TemplateIcon, DeleteForever as DeleteIcon, CloudDone as SyncIcon,
  LinkOff as DisconnectIcon, CloudQueue as DropboxIcon, Google as GoogleIcon,
  Storage as LocalIcon, Folder as FolderIcon, Add as AddIcon, Refresh as RefreshIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useBudgetStore } from '@/store';
import { useNotesStore } from '@/store/notesStore';
import { useCloudSync } from '@/hooks/useCloudSync';
import { importExcelFile, exportToExcel, exportTemplate, clearLocalStorage } from '@/utils';
import { exportToExcelBuffer } from '@/utils/excelExport';
import { importExcelBuffer } from '@/utils/excelImport';
import { getStorageConfig, clearStorageConfig, saveStorageConfig, StorageFile } from '@/storage';
import { DropboxProvider } from '@/storage/dropboxProvider';
import { GoogleDriveProvider } from '@/storage/googleDriveProvider';

export function ImportView() {
  const theme = useTheme();
  const isDataLoaded = useBudgetStore((s) => s.isDataLoaded);
  const importData = useBudgetStore((s) => s.importData);
  const resetAndImport = useBudgetStore((s) => s.resetAndImport);

  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; type: 'success' | 'error'; text: string }>({ open: false, type: 'success', text: '' });
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [backupReminder, setBackupReminder] = useState(false);
  const { lastEditor, lastModified } = useCloudSync();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cloud state
  const [connectDialog, setConnectDialog] = useState<'dropbox' | 'google' | null>(null);
  const [appKeyInput, setAppKeyInput] = useState('');
  const [cloudFiles, setCloudFiles] = useState<StorageFile[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const [saveAsDialog, setSaveAsDialog] = useState(false);
  const [saveAsName, setSaveAsName] = useState('Budget.xlsx');
  const [configVersion, setConfigVersion] = useState(0);

  const config = getStorageConfig();
  
  const updateConfig = (updates: Partial<typeof config>) => {
    if (!config) return;
    const newConfig = { ...config, ...updates };
    saveStorageConfig(newConfig);
    setConfigVersion(v => v + 1); // force re-render
  };

  // Auto-open file picker if connected but no file selected (skip if OAuth callback in progress)
  useEffect(() => {
    const hasOAuthCode = window.location.search.includes('code=');
    if (hasOAuthCode) return; // OAuth callback will handle this
    if (config && (config.provider === 'dropbox' || config.provider === 'google-drive') && !config.filePath) {
      handleBrowseFiles();
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const lastExport = localStorage.getItem('budget-app-last-export');
    if (lastExport) {
      const daysSince = (Date.now() - Number(lastExport)) / (1000 * 60 * 60 * 24);
      if (daysSince > 7 && isDataLoaded) setBackupReminder(true);
    } else if (isDataLoaded) {
      setBackupReminder(true);
    }
  }, [isDataLoaded]);

  const handleExport = () => {
    const state = useBudgetStore.getState();
    const notes = useNotesStore.getState().notes;
    exportToExcel(state, notes);
    localStorage.setItem('budget-app-last-export', String(Date.now()));
    setBackupReminder(false);
    setSnackbar({ open: true, type: 'success', text: 'Eksport zakończony — plik został pobrany' });
  };

  // Cloud provider helpers
  const getProvider = () => {
    if (config?.provider === 'dropbox') return new DropboxProvider();
    if (config?.provider === 'google-drive') return new GoogleDriveProvider();
    return null;
  };

  const handleConnect = async (provider: 'dropbox' | 'google') => {
    if (provider === 'google') {
      // Client ID is hardcoded — always ready
      try {
        setCloudLoading(true);
        const gProvider = new GoogleDriveProvider();
        await gProvider.authenticate();
        saveStorageConfig({ provider: 'google-drive', filePath: null, autoSync: true, syncInterval: 30000, autoPoll: true, pollInterval: 30000, lastSync: null });
        const files = await gProvider.listFiles();
        setCloudFiles(files);
        setFilePickerOpen(true);
        setSnackbar({ open: true, type: 'success', text: 'Połączono z Google Drive' });
      } catch (err) {
        setSnackbar({ open: true, type: 'error', text: err instanceof Error ? err.message : 'Błąd połączenia' });
      } finally {
        setCloudLoading(false);
      }
      return;
    }
    // Dropbox — needs key from user
    const key = localStorage.getItem('budget-app-dropbox-appkey') || import.meta.env.VITE_DROPBOX_APP_KEY;
    if (key) {
      new DropboxProvider().authenticate();
    } else {
      setConnectDialog('dropbox');
      setAppKeyInput('');
    }
  };

  const handleKeySubmit = async () => {
    if (!appKeyInput.trim() || !connectDialog) return;
    if (connectDialog === 'dropbox') {
      localStorage.setItem('budget-app-dropbox-appkey', appKeyInput.trim());
      setConnectDialog(null);
      new DropboxProvider().authenticate();
    } else {
      localStorage.setItem('budget-app-gdrive-clientid', appKeyInput.trim());
      setConnectDialog(null);
      // Use popup flow
      handleConnect('google');
    }
  };

  const handleBrowseFiles = async () => {
    const provider = getProvider();
    if (!provider || !provider.isAuthenticated()) return;
    setCloudLoading(true);
    try {
      const files = await provider.listFiles();
      setCloudFiles(files);
      setFilePickerOpen(true);
    } catch (err) {
      setSnackbar({ open: true, type: 'error', text: 'Nie udało się pobrać listy plików' });
    } finally {
      setCloudLoading(false);
    }
  };

  const handleLoadCloudFile = async (path: string) => {
    const provider = getProvider();
    if (!provider) return;
    setCloudLoading(true);
    try {
      const buffer = await provider.loadFile(path);
      const data = await importExcelBuffer(buffer);
      resetAndImport(data);
      if (config) {
        saveStorageConfig({ ...config, filePath: path, lastSync: new Date().toISOString() });
      }
      setFilePickerOpen(false);
      setSnackbar({ open: true, type: 'success', text: 'Plik załadowany z chmury' });
    } catch (err) {
      setSnackbar({ open: true, type: 'error', text: 'Błąd ładowania pliku' });
    } finally {
      setCloudLoading(false);
    }
  };

  const handleSaveToCloud = async (fileName?: string) => {
    const provider = getProvider();
    if (!provider || !provider.isAuthenticated()) return;
    setCloudLoading(true);
    try {
      const state = useBudgetStore.getState();
      const notes = useNotesStore.getState().notes;
      const buffer = exportToExcelBuffer(state, notes);

      let path = config?.filePath;
      if (fileName && config?.provider === 'google-drive') {
        // Create new file on Google Drive
        const gProvider = provider as GoogleDriveProvider;
        const fileId = await gProvider.createFile(fileName, buffer);
        path = fileId;
      } else if (fileName && config?.provider === 'dropbox') {
        path = `/${fileName}`;
        await provider.saveFile(path, buffer);
      } else if (path) {
        await provider.saveFile(path, buffer);
      }

      if (config && path) {
        saveStorageConfig({ ...config, filePath: path, lastSync: new Date().toISOString() });
      }
      localStorage.setItem('budget-app-last-export', String(Date.now()));
      setBackupReminder(false);
      setSaveAsDialog(false);
      setSnackbar({ open: true, type: 'success', text: `Zapisano do ${config?.provider === 'dropbox' ? 'Dropbox' : 'Google Drive'}` });
    } catch (err) {
      setSnackbar({ open: true, type: 'error', text: 'Nie udało się zapisać do chmury' });
    } finally {
      setCloudLoading(false);
    }
  };

  const handleDisconnect = () => {
    clearStorageConfig();
    if (config?.provider === 'dropbox') new DropboxProvider().disconnect();
    if (config?.provider === 'google-drive') new GoogleDriveProvider().disconnect();
    window.location.reload();
  };

  const handleSwitchProvider = (provider: 'dropbox' | 'google' | 'local') => {
    if (provider === 'local') {
      saveStorageConfig({ provider: 'local', filePath: null, autoSync: false, syncInterval: 0, autoPoll: true, pollInterval: 30000, lastSync: null });
      window.location.reload();
    } else {
      handleConnect(provider);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setMessage({ type: 'error', text: 'Wybierz plik Excel (.xlsx)' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const result = await importExcelFile(file);
      const totalItems = result.meble.length + result.wykonczenie.length + result.agd.length + result.pozostale.length + result.wyprowadzka.length + result.saldo.length + result.harmonogram.length + result.milestones.length;
      if (totalItems === 0) {
        setMessage({ type: 'error', text: 'Nie znaleziono danych w pliku.' });
      } else {
        if (isDataLoaded) resetAndImport(result);
        else importData(result);
        if (result.notes.length > 0) {
          const notesStore = useNotesStore.getState();
          for (const note of result.notes) { notesStore.addNote(); const added = notesStore.notes[notesStore.notes.length - 1]; notesStore.updateNote(added.id, { text: note.text, color: note.color, done: note.done }); }
        }
        setMessage({ type: 'success', text: `Zaimportowano ${totalItems + result.notes.length} pozycji` });
        setSnackbar({ open: true, type: 'success', text: 'Import zakończony' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Błąd: ${error instanceof Error ? error.message : 'Nieznany'}` });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isCloud = config?.provider === 'dropbox' || config?.provider === 'google-drive';
  const providerLabel = config?.provider === 'dropbox' ? 'Dropbox' : config?.provider === 'google-drive' ? 'Google Drive' : 'localStorage';

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">Dane i synchronizacja</Typography>
        <Typography variant="body2" color="text.secondary">
          Zarządzaj połączeniem z chmurą, importuj i eksportuj dane
        </Typography>
      </Box>

      {backupReminder && (
        <Alert severity="warning" sx={{ mb: 3, maxWidth: 700 }} action={<Button color="inherit" size="small" onClick={handleExport}>Eksportuj</Button>} onClose={() => setBackupReminder(false)}>
          Ponad 7 dni bez backupu. Wyeksportuj dane lub zapisz do chmury.
        </Alert>
      )}

      {/* === SYNCHRONIZATION SECTION === */}
      <Card sx={{ maxWidth: 700, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <SyncIcon sx={{ fontSize: 20, color: isCloud ? theme.palette.success.main : theme.palette.text.secondary }} />
            <Typography variant="h6" sx={{ flex: 1 }}>Synchronizacja</Typography>
            <Chip
              label={providerLabel}
              size="small"
              sx={{
                fontSize: '0.7rem', fontWeight: 600,
                backgroundColor: isCloud ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                color: isCloud ? theme.palette.success.main : theme.palette.warning.main,
              }}
            />
          </Box>

          {/* Active connection info */}
          {isCloud && config && (
            <Box sx={{ mb: 2.5, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.success.main, 0.04), border: `1px solid ${alpha(theme.palette.success.main, 0.12)}` }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                Plik: <strong>{config.filePath || '—'}</strong>
              </Typography>
              {config.lastSync && (
                <Typography variant="caption" color="text.secondary">
                  Ostatnia sync: {new Date(config.lastSync).toLocaleString('pl-PL')}
                  {lastModified && <> · Plik edytowany: {new Date(lastModified).toLocaleString('pl-PL')}</>}
                  {lastEditor && <> · Przez: <strong>{lastEditor}</strong></>}
                </Typography>
              )}
            </Box>
          )}

          {/* Auto-sync settings */}
          {isCloud && config && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2.5 }}>
              <FormControlLabel
                control={<Switch size="small" checked={config.autoSync} onChange={(e) => updateConfig({ autoSync: e.target.checked })} />}
                label={<Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Auto-zapis</Typography>}
              />
              {config.autoSync && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 150 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>Co:</Typography>
                  <Slider
                    value={config.syncInterval / 1000}
                    onChange={(_, val) => updateConfig({ syncInterval: (val as number) * 1000 })}
                    min={5} max={120} step={5}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${v}s`}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 30 }}>{config.syncInterval / 1000}s</Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Poll interval */}
          {isCloud && config && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2.5 }}>
              <FormControlLabel
                control={<Switch size="small" checked={config.autoPoll !== false} onChange={(e) => updateConfig({ autoPoll: e.target.checked })} />}
                label={<Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Sprawdzaj zmiany</Typography>}
              />
              {config.autoPoll !== false && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 150 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>Co:</Typography>
                  <Slider
                    value={(config.pollInterval || 30000) / 1000}
                    onChange={(_, val) => updateConfig({ pollInterval: (val as number) * 1000 })}
                    min={10} max={120} step={10}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${v}s`}
                    size="small"
                    sx={{ flex: 1, minWidth: 100 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 30 }}>{(config.pollInterval || 30000) / 1000}s</Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Cloud actions */}
          {isCloud && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Button size="small" variant="outlined" startIcon={<FolderIcon />} onClick={handleBrowseFiles} disabled={cloudLoading}>
                Wczytaj inny plik
              </Button>
              <Button size="small" variant="outlined" startIcon={<SaveIcon />} onClick={() => handleSaveToCloud()} disabled={cloudLoading || !config?.filePath}>
                Zapisz teraz
              </Button>
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => { setSaveAsName('Budget.xlsx'); setSaveAsDialog(true); }}>
                Zapisz jako...
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Switch provider */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Zmień połączenie
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Tooltip title="Wkrótce dostępne">
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DropboxIcon />}
                  disabled
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  Dropbox
                </Button>
              </span>
            </Tooltip>
            <Button
              size="small"
              variant={config?.provider === 'google-drive' ? 'contained' : 'outlined'}
              startIcon={<GoogleIcon />}
              onClick={() => handleSwitchProvider('google')}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              Google Drive
            </Button>
            <Button
              size="small"
              variant={config?.provider === 'local' ? 'contained' : 'outlined'}
              color="warning"
              startIcon={<LocalIcon />}
              onClick={() => handleSwitchProvider('local')}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              Tylko lokalnie
            </Button>
            {isCloud && (
              <Button size="small" color="error" startIcon={<DisconnectIcon />} onClick={handleDisconnect} sx={{ ml: 'auto', textTransform: 'none', fontSize: '0.75rem' }}>
                Odłącz
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* === LOCAL IMPORT SECTION === */}
      <Card sx={{ maxWidth: 700, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Import z pliku lokalnego</Typography>
          {isDataLoaded && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>Import zastąpi obecne dane.</Alert>
          )}
          <Box
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: `2px dashed ${isDragOver ? theme.palette.primary.main : theme.palette.divider}`,
              borderRadius: 2, p: 4, textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s',
              backgroundColor: isDragOver ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
              '&:hover': { borderColor: theme.palette.primary.main },
            }}
          >
            {loading ? <CircularProgress size={32} /> : (
              <>
                <CloudIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
                <Typography variant="body2" sx={{ mb: 0.5 }}>Przeciągnij plik .xlsx lub kliknij</Typography>
                <Typography variant="caption" color="text.secondary">Obsługuje: Meble, Wykończenie, AGD, Pozostałe, Wyprowadzka, Saldo, Harmonogram</Typography>
              </>
            )}
          </Box>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          {message && <Alert severity={message.type} sx={{ mt: 2 }}>{message.text}</Alert>}
        </CardContent>
      </Card>

      {/* === EXPORT SECTION === */}
      <Card sx={{ maxWidth: 700, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Eksport</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} disabled={!isDataLoaded}>
              Pobierz .xlsx
            </Button>
            <Button variant="outlined" startIcon={<TemplateIcon />} onClick={() => { exportTemplate(); setSnackbar({ open: true, type: 'success', text: 'Szablon pobrany' }); }}>
              Szablon pusty
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* === DANGER ZONE === */}
      <Card sx={{ maxWidth: 700, border: `1px solid ${alpha(theme.palette.error.main, 0.25)}` }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: theme.palette.error.main, mb: 1 }}>Wyczyść dane</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Usuwa wszystkie dane z przeglądarki i rozłącza synchronizację. Nieodwracalne.
          </Typography>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setClearDialogOpen(true)}>
            Wyczyść wszystko
          </Button>
        </CardContent>
      </Card>

      {/* === DIALOGS === */}

      {/* Clear confirmation */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: theme.palette.error.main }}>Wyczyścić dane?</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 1 }}>Usunięte zostaną: wydatki, środki, harmonogram, notatki, połączenia z chmurą.</Typography>
          <Typography variant="body2" sx={{ color: theme.palette.error.main, fontWeight: 600 }}>Operacja nieodwracalna.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setClearDialogOpen(false)}>Anuluj</Button>
          <Button variant="contained" color="error" onClick={() => { clearLocalStorage(); localStorage.removeItem('budget-app-notes'); setClearDialogOpen(false); setTimeout(() => window.location.reload(), 500); }}>Wyczyść</Button>
        </DialogActions>
      </Dialog>

      {/* App Key dialog */}
      <Dialog open={!!connectDialog} onClose={() => setConnectDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {connectDialog === 'dropbox' ? 'Połącz z Dropbox' : 'Połącz z Google Drive'}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {connectDialog === 'dropbox' ? (
              <>Stwórz app na <Link href="https://www.dropbox.com/developers/apps" target="_blank">dropbox.com/developers</Link> → skopiuj App Key. Uprawnienia: files.content.read + write.</>
            ) : (
              <>Stwórz OAuth Client na <Link href="https://console.cloud.google.com/apis/credentials" target="_blank">Google Cloud Console</Link>. Redirect URI: <strong>{window.location.origin}</strong></>
            )}
          </Typography>
          <TextField
            label={connectDialog === 'dropbox' ? 'App Key' : 'Client ID'}
            value={appKeyInput}
            onChange={(e) => setAppKeyInput(e.target.value)}
            fullWidth autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleKeySubmit(); }}
          />
          <Alert severity="info" sx={{ fontSize: '0.75rem' }}>To klucz publiczny — zapisze się bezpiecznie w przeglądarce.</Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConnectDialog(null)}>Anuluj</Button>
          <Button variant="contained" onClick={handleKeySubmit} disabled={!appKeyInput.trim()}>Połącz</Button>
        </DialogActions>
      </Dialog>

      {/* File picker */}
      <Dialog open={filePickerOpen} onClose={() => setFilePickerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Wybierz plik
          <IconButton size="small" onClick={handleBrowseFiles} disabled={cloudLoading}><RefreshIcon sx={{ fontSize: 18 }} /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {cloudLoading ? (
            <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={32} /></Box>
          ) : cloudFiles.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Brak plików .xlsx</Typography>
          ) : (
            <List>
              {cloudFiles.map((file) => (
                <ListItemButton key={file.path} onClick={() => handleLoadCloudFile(file.path)}>
                  <FolderIcon sx={{ fontSize: 18, mr: 1.5, color: theme.palette.primary.main }} />
                  <ListItemText
                    primary={file.name}
                    secondary={`${new Date(file.modified).toLocaleDateString('pl-PL')} · ${Math.round(file.size / 1024)} KB`}
                    primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: '0.7rem' }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setFilePickerOpen(false)}>Zamknij</Button>
        </DialogActions>
      </Dialog>

      {/* Save As dialog */}
      <Dialog open={saveAsDialog} onClose={() => setSaveAsDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Zapisz jako</DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          <TextField
            label="Nazwa pliku"
            value={saveAsName}
            onChange={(e) => setSaveAsName(e.target.value)}
            fullWidth autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveToCloud(saveAsName); } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setSaveAsDialog(false)}>Anuluj</Button>
          <Button variant="contained" onClick={() => handleSaveToCloud(saveAsName)} disabled={!saveAsName.trim() || cloudLoading}>Zapisz</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.type} variant="filled" sx={{ borderRadius: 2, fontWeight: 500 }}>
          {snackbar.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
