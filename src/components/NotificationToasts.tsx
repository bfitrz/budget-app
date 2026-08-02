import { useEffect, useState } from 'react';
import { Box, Typography, alpha, useTheme, IconButton, Button } from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  CloudOff as DisconnectedIcon,
  Sync as SyncIcon,
  SystemUpdateAlt as UpdateIcon,
} from '@mui/icons-material';
import { useNotificationStore, Notification, NotificationType } from '@/store/notificationStore';
import { getStorageConfig } from '@/storage/types';
import { GoogleDriveProvider } from '@/storage/googleDriveProvider';
import { useCloudSync } from '@/hooks/useCloudSync';

const CURRENT_VERSION = '2.7.0';

function getIcon(type: NotificationType) {
  switch (type) {
    case 'success': return <SuccessIcon sx={{ fontSize: 16 }} />;
    case 'info': return <InfoIcon sx={{ fontSize: 16 }} />;
    case 'warning': return <WarningIcon sx={{ fontSize: 16 }} />;
    case 'error': return <ErrorIcon sx={{ fontSize: 16 }} />;
  }
}

function ToastItem({ notification }: { notification: Notification }) {
  const theme = useTheme();
  const dismiss = useNotificationStore((s) => s.dismiss);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const colorMap: Record<NotificationType, string> = {
    success: theme.palette.success.main,
    info: theme.palette.info.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
  };

  const color = colorMap[notification.type];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderRadius: '12px',
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${alpha(color, 0.25)}`,
        boxShadow: `0 4px 20px ${alpha(color, 0.1)}, 0 2px 8px rgba(0,0,0,0.1)`,
        minWidth: 240,
        maxWidth: 320,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(20px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        pointerEvents: 'auto',
      }}
    >
      <Box sx={{ color, display: 'flex', flexShrink: 0 }}>
        {getIcon(notification.type)}
      </Box>
      <Typography variant="body2" sx={{ flex: 1, fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.4 }}>
        {notification.message}
      </Typography>
      <IconButton size="small" onClick={() => dismiss(notification.id)} sx={{ opacity: 0.4, flexShrink: 0, width: 22, height: 22, '&:hover': { opacity: 1 } }}>
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  );
}

function UpdateAvailable() {
  const theme = useTheme();
  const [newVersion, setNewVersion] = useState<string | null>(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`);
        if (!response.ok) return;
        const data = await response.json();
        if (data.version && data.version !== CURRENT_VERSION) {
          setNewVersion(data.version);
        }
      } catch { /* ignore */ }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!newVersion) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.info.main, 0.08)})`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.15)}`,
        minWidth: 240,
        maxWidth: 320,
        pointerEvents: 'auto',
        animation: 'slideIn 0.3s ease-out',
        '@keyframes slideIn': {
          from: { opacity: 0, transform: 'translateX(20px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
      }}
    >
      <UpdateIcon sx={{ fontSize: 18, color: theme.palette.primary.main, flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, color: theme.palette.primary.main }}>
          Nowa wersja {newVersion}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
          Kliknij Odśwież aby zaktualizować
        </Typography>
      </Box>
      <Button
        size="small"
        variant="contained"
        onClick={() => window.location.reload()}
        sx={{ fontSize: '0.65rem', textTransform: 'none', borderRadius: 2, px: 1.5, minWidth: 'auto', boxShadow: 'none' }}
      >
        Odśwież
      </Button>
    </Box>
  );
}

function ConnectionStatus() {
  const theme = useTheme();
  const config = getStorageConfig();
  const [disconnected, setDisconnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    if (!config || config.provider === 'local') return;
    const token = localStorage.getItem('budget-app-gdrive-token');
    if (!token && config.filePath) {
      setDisconnected(true);
    }
  }, []);

  // Listen for sync failures
  useEffect(() => {
    const check = () => {
      if (!config || config.provider === 'local') return;
      const token = localStorage.getItem('budget-app-gdrive-token');
      if (!token && config?.filePath) setDisconnected(true);
      else setDisconnected(false);
    };
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      const provider = new GoogleDriveProvider();
      await provider.authenticate();
      setDisconnected(false);
    } catch {
      // Still disconnected
    } finally {
      setReconnecting(false);
    }
  };

  if (!disconnected) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderRadius: '12px',
        backgroundColor: alpha(theme.palette.warning.main, 0.08),
        border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
        boxShadow: `0 4px 16px ${alpha(theme.palette.warning.main, 0.1)}`,
        minWidth: 240,
        maxWidth: 320,
        pointerEvents: 'auto',
        animation: 'pulse 2s infinite',
        '@keyframes pulse': {
          '0%, 100%': { boxShadow: `0 4px 16px ${alpha(theme.palette.warning.main, 0.1)}` },
          '50%': { boxShadow: `0 4px 24px ${alpha(theme.palette.warning.main, 0.25)}` },
        },
      }}
    >
      <DisconnectedIcon sx={{ fontSize: 18, color: theme.palette.warning.main, flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, color: theme.palette.warning.main }}>
          Brak połączenia
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
          Sesja Google wygasła
        </Typography>
      </Box>
      <Button
        size="small"
        variant="outlined"
        color="warning"
        startIcon={<SyncIcon sx={{ fontSize: 14 }} />}
        onClick={handleReconnect}
        disabled={reconnecting}
        sx={{ fontSize: '0.65rem', textTransform: 'none', borderRadius: 2, px: 1.5, minWidth: 'auto' }}
      >
        {reconnecting ? '...' : 'Połącz'}
      </Button>
    </Box>
  );
}

function RemoteChangedBanner() {
  const theme = useTheme();
  const { remoteChanged, loadFromCloud, dismissRemoteChanged, lastEditor } = useCloudSync();

  if (!remoteChanged) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.12)}, ${alpha(theme.palette.primary.main, 0.08)})`,
        border: `1px solid ${alpha(theme.palette.info.main, 0.25)}`,
        boxShadow: `0 4px 24px ${alpha(theme.palette.info.main, 0.15)}`,
        minWidth: 240,
        maxWidth: 340,
        pointerEvents: 'auto',
        animation: 'slideIn 0.3s ease-out',
        '@keyframes slideIn': {
          from: { opacity: 0, transform: 'translateX(20px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
      }}
    >
      <Typography sx={{ fontSize: 18, flexShrink: 0 }}>🔄</Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
          Nowa wersja{lastEditor ? ` od ${lastEditor}` : ''}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
          Plik zaktualizowany. Wczytaj zmiany.
        </Typography>
      </Box>
      <Button size="small" variant="contained" onClick={loadFromCloud} sx={{ fontSize: '0.65rem', textTransform: 'none', borderRadius: 2, px: 1.5, minWidth: 'auto', boxShadow: 'none' }}>
        Wczytaj
      </Button>
      <IconButton size="small" onClick={dismissRemoteChanged} sx={{ opacity: 0.5, width: 20, height: 20, '&:hover': { opacity: 1 } }}>
        <CloseIcon sx={{ fontSize: 12 }} />
      </IconButton>
    </Box>
  );
}

export function NotificationToasts() {
  const notifications = useNotificationStore((s) => s.notifications);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        pointerEvents: 'none',
      }}
    >
      {/* Persistent status blocks */}
      <UpdateAvailable />
      <RemoteChangedBanner />
      <ConnectionStatus />
      {/* Transient notifications */}
      {notifications.slice(0, 5).map((notification) => (
        <ToastItem key={notification.id} notification={notification} />
      ))}
    </Box>
  );
}
