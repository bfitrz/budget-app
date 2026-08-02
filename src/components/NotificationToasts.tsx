import { useEffect, useState } from 'react';
import { Box, Typography, alpha, useTheme, IconButton } from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNotificationStore, Notification, NotificationType } from '@/store/notificationStore';

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
    // Trigger enter animation
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
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          fontSize: '0.8rem',
          fontWeight: 500,
          lineHeight: 1.4,
          color: theme.palette.text.primary,
        }}
      >
        {notification.message}
      </Typography>
      <IconButton
        size="small"
        onClick={() => dismiss(notification.id)}
        sx={{
          opacity: 0.4,
          flexShrink: 0,
          width: 22,
          height: 22,
          '&:hover': { opacity: 1 },
        }}
      >
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  );
}

export function NotificationToasts() {
  const notifications = useNotificationStore((s) => s.notifications);

  if (notifications.length === 0) return null;

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
      {notifications.slice(0, 5).map((notification) => (
        <ToastItem key={notification.id} notification={notification} />
      ))}
    </Box>
  );
}
