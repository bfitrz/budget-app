import { useState, useMemo, useEffect, useCallback } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Layout } from '@/components';
import { StorageSetup } from '@/components/StorageSetup';
import { DashboardView } from '@/features/dashboard';
import { MebleView } from '@/features/meble';
import { WykonczenieView } from '@/features/wykonczenie';
import { AGDView } from '@/features/agd';
import { PozostaleView } from '@/features/pozostale';
import { WyprowadzkaView } from '@/features/wyprowadzka';
import { SaldoView } from '@/features/saldo';
import { HarmonogramView } from '@/features/harmonogram';
import { ImportView } from '@/features/import';
import { GuideView } from '@/features/guide';
import { ChangelogView } from '@/features/changelog';
import { WykluconeView } from '@/features/wykluczone';
import { useBudgetStore } from '@/store';
import { getStorageConfig, saveStorageConfig, clearStorageConfig, DropboxProvider, GoogleDriveProvider, checkDropboxCallback, checkGoogleDriveCallback, StorageFile } from '@/storage';

export type ThemeVariant = 'dark' | 'light' | 'dim' | 'unicorn';

const THEME_LABELS: Record<ThemeVariant, string> = {
  dark: 'Ciemny',
  light: 'Jasny',
  dim: 'Stonowany',
  unicorn: 'Unicorn 🦄',
};

function getStoredTheme(): ThemeVariant {
  const stored = localStorage.getItem('budget-app-theme');
  if (stored === 'dark' || stored === 'light' || stored === 'dim' || stored === 'unicorn') return stored;
  return 'dark';
}

const THEME_ORDER: ThemeVariant[] = ['dark', 'dim', 'light', 'unicorn'];

const VALID_VIEWS = ['dashboard', 'meble', 'wykonczenie', 'agd', 'pozostale', 'wyprowadzka', 'wykluczone', 'saldo', 'harmonogram', 'import', 'guide', 'changelog'] as const;
type ViewId = typeof VALID_VIEWS[number];

function getViewFromHash(): ViewId | null {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  if (VALID_VIEWS.includes(hash as ViewId)) return hash as ViewId;
  return null;
}

function App() {
  const isDataLoaded = useBudgetStore((s) => s.isDataLoaded);
  const [storageReady, setStorageReady] = useState(() => !!getStorageConfig());
  const [storageError, setStorageError] = useState<string | null>(null);
  const [storageLoading, setStorageLoading] = useState(false);
  const [cloudFiles, setCloudFiles] = useState<StorageFile[]>([]);
  const [connectedProvider, setConnectedProvider] = useState<'dropbox' | 'google-drive' | null>(null);

  // Handle OAuth callbacks on mount
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const dropboxCode = checkDropboxCallback();
      if (dropboxCode) {
        try {
          setStorageLoading(true);
          const provider = new DropboxProvider();
          await provider.handleCallback(dropboxCode);
          setConnectedProvider('dropbox');
          const files = await provider.listFiles();
          setCloudFiles(files);
        } catch (err) {
          setStorageError(err instanceof Error ? err.message : 'Błąd autoryzacji Dropbox');
        } finally {
          setStorageLoading(false);
        }
        return;
      }

      const googleCode = checkGoogleDriveCallback();
      if (googleCode) {
        try {
          setStorageLoading(true);
          const provider = new GoogleDriveProvider();
          await provider.handleCallback(googleCode);
          setConnectedProvider('google-drive');
          const files = await provider.listFiles();
          setCloudFiles(files);
        } catch (err) {
          setStorageError(err instanceof Error ? err.message : 'Błąd autoryzacji Google');
        } finally {
          setStorageLoading(false);
        }
        return;
      }
    };
    handleOAuthCallback();
  }, []);

  const handleSelectLocal = () => {
    saveStorageConfig({ provider: 'local', filePath: null, autoSync: false, syncInterval: 0, lastSync: null });
    setStorageReady(true);
  };

  const handleSelectDropbox = async () => {
    try {
      const provider = new DropboxProvider();
      await provider.authenticate(); // Redirects to Dropbox
    } catch (err) {
      setStorageError(err instanceof Error ? err.message : 'Błąd połączenia z Dropbox');
    }
  };

  const handleSelectGoogleDrive = async () => {
    try {
      const provider = new GoogleDriveProvider();
      await provider.authenticate(); // Redirects to Google
    } catch (err) {
      setStorageError(err instanceof Error ? err.message : 'Błąd połączenia z Google Drive');
    }
  };

  const handlePickFile = (path: string) => {
    const provider = connectedProvider || 'dropbox';
    saveStorageConfig({ provider, filePath: path, autoSync: true, syncInterval: 30000, lastSync: null });
    // TODO: load file content and import into store
    setStorageReady(true);
  };

  const handleCreateNewFile = () => {
    const provider = connectedProvider || 'dropbox';
    const path = provider === 'dropbox' ? '/Budget.xlsx' : 'new';
    saveStorageConfig({ provider, filePath: path, autoSync: true, syncInterval: 30000, lastSync: null });
    setStorageReady(true);
  };

  const [currentView, setCurrentView] = useState<string>(() => {
    const hashView = getViewFromHash();
    if (hashView) return hashView;
    return isDataLoaded ? 'dashboard' : 'import';
  });

  const navigateTo = useCallback((view: string) => {
    setCurrentView(view);
    window.location.hash = `#/${view}`;
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hashView = getViewFromHash();
      if (hashView) setCurrentView(hashView);
    };
    window.addEventListener('hashchange', handleHashChange);
    // Set initial hash if empty
    if (!window.location.hash) {
      window.location.hash = `#/${isDataLoaded ? 'dashboard' : 'import'}`;
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isDataLoaded]);

  // Undo/Redo keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useBudgetStore.getState().undoAction();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Z' && e.shiftKey) {
        e.preventDefault();
        useBudgetStore.getState().redoAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [themeVariant, setThemeVariant] = useState<ThemeVariant>(getStoredTheme);

  const setTheme = (variant: ThemeVariant) => {
    setThemeVariant(variant);
    localStorage.setItem('budget-app-theme', variant);
  };

  const cycleTheme = () => {
    setThemeVariant((prev) => {
      const idx = THEME_ORDER.indexOf(prev);
      const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
      localStorage.setItem('budget-app-theme', next);
      return next;
    });
  };

  const isDark = themeVariant === 'dark' || themeVariant === 'dim';

  const theme = useMemo(() => {
    const palettes = {
      dark: {
        mode: 'dark' as const,
        background: { default: '#09090b', paper: '#18181b' },
        primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
        secondary: { main: '#a78bfa' },
        text: { primary: '#fafafa', secondary: '#a1a1aa' },
        divider: 'rgba(255,255,255,0.06)',
        success: { main: '#10b981', light: '#34d399' },
        warning: { main: '#f59e0b', light: '#fbbf24' },
        error: { main: '#ef4444', light: '#f87171' },
        info: { main: '#6366f1' },
      },
      dim: {
        mode: 'dark' as const,
        background: { default: '#1c1c22', paper: '#26262e' },
        primary: { main: '#7c8aff', light: '#a5b0ff', dark: '#5b6ad4' },
        secondary: { main: '#b49aff' },
        text: { primary: '#e8e8ed', secondary: '#9090a0' },
        divider: 'rgba(255,255,255,0.07)',
        success: { main: '#34d399', light: '#6ee7b7' },
        warning: { main: '#fbbf24', light: '#fcd34d' },
        error: { main: '#fb7185', light: '#fda4af' },
        info: { main: '#7c8aff' },
      },
      light: {
        mode: 'light' as const,
        background: { default: '#e4e4e7', paper: '#efefef' },
        primary: { main: '#4f46e5', light: '#6366f1', dark: '#3730a3' },
        secondary: { main: '#7c3aed' },
        text: { primary: '#18181b', secondary: '#3f3f46' },
        divider: 'rgba(0,0,0,0.09)',
        success: { main: '#059669', light: '#10b981' },
        warning: { main: '#d97706', light: '#f59e0b' },
        error: { main: '#dc2626', light: '#ef4444' },
        info: { main: '#4f46e5' },
      },
      unicorn: {
        mode: 'dark' as const,
        background: { default: '#1f0a2e', paper: '#2a1240' },
        primary: { main: '#e879f9', light: '#f0abfc', dark: '#c026d3' },
        secondary: { main: '#67e8f9' },
        text: { primary: '#fae8ff', secondary: '#d8b4fe' },
        divider: 'rgba(232, 121, 249, 0.15)',
        success: { main: '#34d399', light: '#6ee7b7' },
        warning: { main: '#fde047', light: '#fef08a' },
        error: { main: '#fb7185', light: '#fda4af' },
        info: { main: '#67e8f9' },
      },
    };

    const palette = palettes[themeVariant];
    const isDarkMode = palette.mode === 'dark';
    const isUnicorn = themeVariant === 'unicorn';

    return createTheme({
      shape: { borderRadius: 16 },
      spacing: 8,
      palette,
      typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 },
        h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
        h3: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.3 },
        h4: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.4 },
        h5: { fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.01em' },
        h6: { fontSize: '0.95rem', fontWeight: 600, letterSpacing: '-0.005em' },
        subtitle1: { fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0' },
        subtitle2: { fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.01em' },
        body1: { fontSize: '0.875rem', lineHeight: 1.6 },
        body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
        caption: { fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.02em' },
        overline: { fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            '*': { transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease' },
            body: { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' },
            '::-webkit-scrollbar': { width: '6px', height: '6px' },
            '::-webkit-scrollbar-track': { background: 'transparent' },
            '::-webkit-scrollbar-thumb': { background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '3px' },
            '::-webkit-scrollbar-thumb:hover': { background: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
          },
        },
        MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              border: `1px solid ${palette.divider}`,
              boxShadow: isUnicorn
                ? '0 0 0 1px rgba(232, 121, 249, 0.06), 0 1px 3px rgba(232, 121, 249, 0.1)'
                : isDarkMode
                  ? '0 0 0 1px rgba(255,255,255,0.02), 0 1px 2px rgba(0,0,0,0.4)'
                  : '0 0 0 1px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.04)',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              '&:hover': {
                borderColor: isUnicorn ? 'rgba(232,121,249,0.25)' : isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                boxShadow: isUnicorn
                  ? '0 0 0 1px rgba(232, 121, 249, 0.1), 0 4px 20px rgba(232, 121, 249, 0.15)'
                  : isDarkMode
                    ? '0 0 0 1px rgba(255,255,255,0.04), 0 4px 12px rgba(0,0,0,0.5)'
                    : '0 0 0 1px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)',
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: { textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', borderRadius: 10, padding: '8px 16px', boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
            contained: {
              background: isUnicorn
                ? `linear-gradient(135deg, ${palette.primary.main}, ${palette.primary.dark})`
                : isDarkMode
                  ? `linear-gradient(135deg, ${palette.primary.main}, ${palette.primary.dark})`
                  : `linear-gradient(135deg, ${palette.primary.main}, ${palette.primary.dark})`,
              '&:hover': {
                background: isUnicorn
                  ? `linear-gradient(135deg, ${palette.primary.light}, ${palette.primary.main})`
                  : `linear-gradient(135deg, ${palette.primary.light}, ${palette.primary.main})`,
              },
            },
          },
        },
        MuiChip: { styleOverrides: { root: { fontWeight: 500, fontSize: '0.6875rem', borderRadius: 8 } } },
        MuiTableHead: {
          styleOverrides: {
            root: {
              '& .MuiTableCell-head': {
                fontWeight: 500, fontSize: '0.6875rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em',
                color: palette.text.secondary, borderBottom: `1px solid ${palette.divider}`, padding: '12px 16px',
              },
            },
          },
        },
        MuiTableCell: { styleOverrides: { root: { borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}`, padding: '12px 16px', fontSize: '0.8125rem' } } },
        MuiTableRow: { styleOverrides: { root: { transition: 'background-color 0.1s ease', '&:hover': { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)' } } } },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: 20,
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : palette.divider}`,
              boxShadow: isDarkMode ? '0 24px 48px rgba(0,0,0,0.6)' : '0 24px 48px rgba(0,0,0,0.12)',
              maxHeight: '85vh',
            },
          },
        },
        MuiDialogContent: {
          styleOverrides: {
            root: {
              overflowY: 'auto',
            },
          },
        },
        MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 10, fontSize: '0.875rem' } } } },
        MuiAccordion: {
          styleOverrides: {
            root: { '&:before': { display: 'none' }, border: isUnicorn ? '1px solid rgba(232, 121, 249, 0.2)' : `1px solid ${palette.divider}`, borderRadius: '16px !important', overflow: 'hidden' },
          },
        },
        MuiLinearProgress: {
          styleOverrides: {
            root: { borderRadius: 8, height: 6, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
            bar: { borderRadius: 8 },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              borderRadius: 10, margin: '1px 0', padding: '10px 12px', transition: 'all 0.1s ease',
              '&.Mui-selected': {
                backgroundColor: isUnicorn ? 'rgba(232, 121, 249, 0.12)' : isDarkMode ? 'rgba(99, 102, 241, 0.12)' : 'rgba(79, 70, 229, 0.06)',
                color: isUnicorn ? '#e879f9' : isDarkMode ? '#a5b4fc' : '#4f46e5',
                '& .MuiListItemIcon-root': { color: isUnicorn ? '#e879f9' : isDarkMode ? '#a5b4fc' : '#4f46e5' },
                '&:hover': { backgroundColor: isUnicorn ? 'rgba(232, 121, 249, 0.18)' : isDarkMode ? 'rgba(99, 102, 241, 0.16)' : 'rgba(79, 70, 229, 0.08)' },
              },
              '&:hover': { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' },
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: { border: 'none', backgroundColor: isUnicorn ? '#1a0828' : palette.background.default },
          },
        },
      },
    });
  }, [themeVariant]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'meble': return <MebleView />;
      case 'wykonczenie': return <WykonczenieView />;
      case 'agd': return <AGDView />;
      case 'pozostale': return <PozostaleView />;
      case 'wyprowadzka': return <WyprowadzkaView />;
      case 'wykluczone': return <WykluconeView />;
      case 'saldo': return <SaldoView />;
      case 'harmonogram': return <HarmonogramView />;
      case 'import': return <ImportView />;
      case 'guide': return <GuideView />;
      case 'changelog': return <ChangelogView />;
      default: return <DashboardView />;
    }
  };

  // Show storage setup if not configured
  if (!storageReady && !connectedProvider) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <StorageSetup
          onSelectLocal={handleSelectLocal}
          onSelectDropbox={handleSelectDropbox}
          onSelectGoogleDrive={handleSelectGoogleDrive}
          error={storageError}
        />
      </ThemeProvider>
    );
  }

  // Show file picker after OAuth callback
  if (!storageReady && connectedProvider) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <StorageSetup
          onSelectLocal={handleSelectLocal}
          onSelectDropbox={handleSelectDropbox}
          onSelectGoogleDrive={handleSelectGoogleDrive}
          isDropboxConnected={connectedProvider === 'dropbox'}
          isGoogleConnected={connectedProvider === 'google-drive'}
          dropboxFiles={connectedProvider === 'dropbox' ? cloudFiles : undefined}
          googleFiles={connectedProvider === 'google-drive' ? cloudFiles : undefined}
          onPickFile={handlePickFile}
          onCreateNewFile={handleCreateNewFile}
          isLoading={storageLoading}
          error={storageError}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout
        currentView={currentView}
        onViewChange={navigateTo}
        themeVariant={themeVariant}
        themeLabel={THEME_LABELS[themeVariant]}
        onCycleTheme={cycleTheme}
        onSetTheme={setTheme}
      >
        {renderView()}
      </Layout>
    </ThemeProvider>
  );
}

export default App;
