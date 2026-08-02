import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, alpha, useTheme,
  CircularProgress, List, ListItemButton, ListItemText, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, TextField, Link,
} from '@mui/material';
import {
  CloudQueue as DropboxIcon,
  Google as GoogleIcon,
  Storage as LocalIcon,
  Folder as FolderIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { StorageFile } from '@/storage/types';

interface StorageSetupProps {
  onSelectLocal: () => void;
  onSelectDropbox: () => void;
  onSelectGoogleDrive: () => void;
  // After auth callback — show file picker
  isDropboxConnected?: boolean;
  isGoogleConnected?: boolean;
  dropboxFiles?: StorageFile[];
  googleFiles?: StorageFile[];
  onPickFile?: (path: string) => void;
  onCreateNewFile?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function StorageSetup({
  onSelectLocal,
  onSelectDropbox,
  onSelectGoogleDrive,
  isDropboxConnected,
  isGoogleConnected,
  dropboxFiles,
  googleFiles,
  onPickFile,
  onCreateNewFile,
  isLoading,
  error,
}: StorageSetupProps) {
  const theme = useTheme();
  const [filePickerOpen, setFilePickerOpen] = useState(false);
  const [keyDialog, setKeyDialog] = useState<'dropbox' | 'google' | null>(null);
  const [appKeyInput, setAppKeyInput] = useState('');
  const files = dropboxFiles || googleFiles || [];
  const providerName = isDropboxConnected ? 'Dropbox' : 'Google Drive';

  const handleKeySubmit = () => {
    if (!appKeyInput.trim()) return;
    if (keyDialog === 'dropbox') {
      localStorage.setItem('budget-app-dropbox-appkey', appKeyInput.trim());
      setKeyDialog(null);
      setAppKeyInput('');
      onSelectDropbox();
    } else if (keyDialog === 'google') {
      localStorage.setItem('budget-app-gdrive-clientid', appKeyInput.trim());
      setKeyDialog(null);
      setAppKeyInput('');
      onSelectGoogleDrive();
    }
  };

  const handleDropboxClick = () => {
    const existingKey = localStorage.getItem('budget-app-dropbox-appkey') || import.meta.env.VITE_DROPBOX_APP_KEY;
    if (existingKey) { onSelectDropbox(); return; }
    setKeyDialog('dropbox');
    setAppKeyInput('');
  };

  const handleGoogleClick = () => {
    const existingKey = localStorage.getItem('budget-app-gdrive-clientid') || import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (existingKey) { onSelectGoogleDrive(); return; }
    setKeyDialog('google');
    setAppKeyInput('');
  };

  // If connected to a provider, show file picker
  if (isDropboxConnected || isGoogleConnected) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', p: 3 }}>
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Połączono z {providerName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Wybierz istniejący plik budżetu lub utwórz nowy:
            </Typography>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {files.length > 0 && (
                  <List sx={{ mb: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                    {files.slice(0, 10).map((file) => (
                      <ListItemButton key={file.path} onClick={() => onPickFile?.(file.path)}>
                        <FolderIcon sx={{ fontSize: 18, mr: 1.5, color: theme.palette.primary.main }} />
                        <ListItemText
                          primary={file.name}
                          secondary={`Modyfikacja: ${new Date(file.modified).toLocaleDateString('pl-PL')}`}
                          primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: '0.7rem' }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                )}

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onCreateNewFile}
                  fullWidth
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  Utwórz nowy plik budżetu
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Initial choice screen
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', p: 3 }}>
      <Box sx={{ maxWidth: 600, width: '100%' }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: '16px', overflow: 'hidden', mx: 'auto', mb: 2 }}>
            <img src={`${import.meta.env.BASE_URL}pwa-icon.png`} alt="Budget" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Budget
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gdzie chcesz przechowywać dane budżetu?
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Dropbox */}
          <Card
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              opacity: 0.5,
              pointerEvents: 'none',
            }}
          >
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: alpha('#0061FF', 0.1) }}>
                <DropboxIcon sx={{ fontSize: 24, color: '#0061FF' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Dropbox</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  Synchronizacja z plikiem .xlsx na Dropbox. Współdzielenie z partnerem przez folder.
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ px: 1.5, py: 0.5, borderRadius: 1, backgroundColor: alpha(theme.palette.text.secondary, 0.1), color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.6rem' }}>
                WKRÓTCE
              </Typography>
            </CardContent>
          </Card>

          {/* Google Drive */}
          <Card
            sx={{
              cursor: 'pointer',
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: theme.palette.primary.main, transform: 'translateY(-2px)', boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}` },
            }}
            onClick={handleGoogleClick}
          >
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: alpha('#4285F4', 0.1) }}>
                <GoogleIcon sx={{ fontSize: 24, color: '#4285F4' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Google Drive</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  Plik .xlsx na Google Drive. Sesja wygasa po godzinie — wymaga re-logowania.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* localStorage */}
          <Card
            sx={{
              cursor: 'pointer',
              border: `1px solid ${theme.palette.divider}`,
              opacity: 0.7,
              transition: 'all 0.15s ease',
              '&:hover': { opacity: 1, borderColor: theme.palette.warning.main },
            }}
            onClick={onSelectLocal}
          >
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
                <LocalIcon sx={{ fontSize: 24, color: theme.palette.warning.main }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Tylko w przeglądarce</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  Dane w localStorage. Brak synchronizacji — wyczyszczenie przeglądarki = utrata danych.
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ px: 1.5, py: 0.5, borderRadius: 1, backgroundColor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, fontWeight: 600, fontSize: '0.6rem' }}>
                NIEZALECANE
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* App Key dialog */}
        <Dialog open={!!keyDialog} onClose={() => setKeyDialog(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>
            {keyDialog === 'dropbox' ? 'Podaj Dropbox App Key' : 'Podaj Google Client ID'}
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {keyDialog === 'dropbox' ? (
                <>Stwórz aplikację na <Link href="https://www.dropbox.com/developers/apps" target="_blank" rel="noopener">dropbox.com/developers</Link> i skopiuj App Key. Wybierz "Scoped access" i dodaj uprawnienia: files.content.read, files.content.write.</>
              ) : (
                <>Stwórz OAuth Client ID na <Link href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener">Google Cloud Console</Link>. Typ: Web Application. Dodaj redirect URI: <strong>{window.location.origin}</strong></>
              )}
            </Typography>
            <TextField
              label={keyDialog === 'dropbox' ? 'App Key' : 'Client ID'}
              value={appKeyInput}
              onChange={(e) => setAppKeyInput(e.target.value)}
              fullWidth
              autoFocus
              placeholder={keyDialog === 'dropbox' ? 'np. abc123xyz456' : 'np. 123456-abcdef.apps.googleusercontent.com'}
              onKeyDown={(e) => { if (e.key === 'Enter') handleKeySubmit(); }}
            />
            <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
              Klucz jest publiczny (nie jest secret) i zapisze się w przeglądarce. Będzie używany wyłącznie do autoryzacji OAuth.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setKeyDialog(null)}>Anuluj</Button>
            <Button variant="contained" onClick={handleKeySubmit} disabled={!appKeyInput.trim()}>Połącz</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
