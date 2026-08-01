import { useState, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline, PaletteMode } from '@mui/material';
import { Layout } from '@/components';
import { DashboardView } from '@/features/dashboard';
import { MebleView } from '@/features/meble';
import { WykonczenieView } from '@/features/wykonczenie';
import { AGDView } from '@/features/agd';
import { PozostaleView } from '@/features/pozostale';
import { SaldoView } from '@/features/saldo';
import { HarmonogramView } from '@/features/harmonogram';
import { ImportView } from '@/features/import';
import { useBudgetStore } from '@/store';

function getStoredThemeMode(): PaletteMode {
  const stored = localStorage.getItem('budget-app-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return 'dark';
}

function App() {
  const isDataLoaded = useBudgetStore((s) => s.isDataLoaded);
  const [currentView, setCurrentView] = useState(() => {
    return isDataLoaded ? 'dashboard' : 'import';
  });
  const [themeMode, setThemeMode] = useState<PaletteMode>(getStoredThemeMode);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('budget-app-theme', next);
      return next;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        shape: {
          borderRadius: 12,
        },
        palette:
          themeMode === 'dark'
            ? {
                mode: 'dark',
                background: {
                  default: '#1e1e1e',
                  paper: '#2d2d2d',
                },
                primary: {
                  main: '#589df6',
                  light: '#7ab8f5',
                  dark: '#3574c4',
                },
                secondary: {
                  main: '#c77dba',
                },
                text: {
                  primary: '#cdd3de',
                  secondary: '#8b949e',
                },
                divider: 'rgba(255,255,255,0.08)',
                success: {
                  main: '#6a8759',
                  light: '#8fbf73',
                },
                warning: {
                  main: '#cc7832',
                  light: '#e8a860',
                },
                error: {
                  main: '#cf6679',
                  light: '#f5a0b0',
                },
                info: {
                  main: '#6897bb',
                },
              }
            : {
                mode: 'light',
                background: {
                  default: '#f5f7fa',
                  paper: '#ffffff',
                },
                primary: {
                  main: '#3b82f6',
                  light: '#60a5fa',
                  dark: '#1d4ed8',
                },
                secondary: {
                  main: '#8b5cf6',
                },
                text: {
                  primary: '#1e293b',
                  secondary: '#64748b',
                },
                divider: 'rgba(0,0,0,0.08)',
                success: {
                  main: '#10b981',
                },
                warning: {
                  main: '#f59e0b',
                },
                error: {
                  main: '#ef4444',
                },
              },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h4: { fontWeight: 700, letterSpacing: '-0.02em' },
          h5: { fontWeight: 700, letterSpacing: '-0.01em' },
          h6: { fontWeight: 600 },
          subtitle1: { fontWeight: 500 },
          body2: { lineHeight: 1.6 },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                transition: 'background-color 0.3s ease, color 0.3s ease',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                backdropFilter: 'blur(20px)',
                ...(themeMode === 'dark'
                  ? {
                      backgroundColor: 'rgba(30, 30, 30, 0.85)',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }
                  : {
                      backgroundColor: 'rgba(255, 255, 255, 0.85)',
                      borderBottom: '1px solid rgba(0,0,0,0.06)',
                      color: '#1e293b',
                    }),
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                ...(themeMode === 'dark'
                  ? {
                      backgroundColor: '#252526',
                      borderRight: '1px solid rgba(255,255,255,0.06)',
                    }
                  : {
                      backgroundColor: '#ffffff',
                      borderRight: '1px solid rgba(0,0,0,0.06)',
                    }),
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                ...(themeMode === 'dark'
                  ? {
                      backgroundColor: '#2d2d2d',
                      border: '1px solid rgba(255,255,255,0.06)',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                    }
                  : {
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(0,0,0,0.04)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
                    }),
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: themeMode === 'dark'
                    ? '0 8px 32px rgba(0,0,0,0.5)'
                    : '0 4px 24px rgba(0,0,0,0.1)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                ...(themeMode === 'dark'
                  ? { backgroundColor: '#252526' }
                  : { backgroundColor: '#f8fafc' }),
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              head: {
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                ...(themeMode === 'dark'
                  ? { color: '#8b949e' }
                  : { color: '#64748b' }),
              },
              root: {
                borderBottom: themeMode === 'dark'
                  ? '1px solid rgba(255,255,255,0.04)'
                  : '1px solid rgba(0,0,0,0.04)',
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  backgroundColor: themeMode === 'dark'
                    ? 'rgba(88, 157, 246, 0.04)'
                    : 'rgba(59, 130, 246, 0.03)',
                },
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 8,
                padding: '8px 20px',
                transition: 'all 0.2s ease',
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(88, 157, 246, 0.3)',
                  transform: 'translateY(-1px)',
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
                fontSize: '0.7rem',
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                margin: '2px 8px',
                transition: 'all 0.15s ease',
                '&.Mui-selected': {
                  ...(themeMode === 'dark'
                    ? {
                        backgroundColor: 'rgba(88, 157, 246, 0.12)',
                        color: '#589df6',
                        '& .MuiListItemIcon-root': { color: '#589df6' },
                      }
                    : {
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        color: '#3b82f6',
                        '& .MuiListItemIcon-root': { color: '#3b82f6' },
                      }),
                  '&:hover': {
                    ...(themeMode === 'dark'
                      ? { backgroundColor: 'rgba(88, 157, 246, 0.16)' }
                      : { backgroundColor: 'rgba(59, 130, 246, 0.12)' }),
                  },
                },
                '&:hover': {
                  ...(themeMode === 'dark'
                    ? { backgroundColor: 'rgba(255,255,255,0.04)' }
                    : { backgroundColor: 'rgba(0,0,0,0.03)' }),
                },
              },
            },
          },
          MuiLinearProgress: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                height: 10,
                ...(themeMode === 'dark'
                  ? { backgroundColor: 'rgba(255,255,255,0.06)' }
                  : { backgroundColor: 'rgba(0,0,0,0.06)' }),
              },
              bar: {
                borderRadius: 8,
                background: 'linear-gradient(90deg, #589df6, #c77dba)',
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 16,
                ...(themeMode === 'dark'
                  ? {
                      backgroundColor: '#2d2d2d',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }
                  : {}),
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 8,
                },
              },
            },
          },
        },
      }),
    [themeMode]
  );

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'meble':
        return <MebleView />;
      case 'wykonczenie':
        return <WykonczenieView />;
      case 'agd':
        return <AGDView />;
      case 'pozostale':
        return <PozostaleView />;
      case 'saldo':
        return <SaldoView />;
      case 'harmonogram':
        return <HarmonogramView />;
      case 'import':
        return <ImportView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout
        currentView={currentView}
        onViewChange={setCurrentView}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
      >
        {renderView()}
      </Layout>
    </ThemeProvider>
  );
}

export default App;
