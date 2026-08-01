import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  Tooltip,
  PaletteMode,
  Avatar,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Chair as ChairIcon,
  Build as BuildIcon,
  Kitchen as KitchenIcon,
  MoreHoriz as MoreIcon,
  AccountBalance as SaldoIcon,
  FileUpload as ImportIcon,
  Menu as MenuIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Home as HomeIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'meble', label: 'Meble', icon: <ChairIcon /> },
  { id: 'wykonczenie', label: 'Wykończenie', icon: <BuildIcon /> },
  { id: 'agd', label: 'AGD', icon: <KitchenIcon /> },
  { id: 'pozostale', label: 'Pozostałe', icon: <MoreIcon /> },
  { id: 'saldo', label: 'Saldo', icon: <SaldoIcon /> },
  { id: 'harmonogram', label: 'Harmonogram', icon: <ScheduleIcon /> },
  { id: 'import', label: 'Import danych', icon: <ImportIcon /> },
];

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  themeMode: PaletteMode;
  onToggleTheme: () => void;
}

export function Layout({ children, currentView, onViewChange, themeMode, onToggleTheme }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2.5, gap: 1.5 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }}
        >
          <HomeIcon sx={{ fontSize: 20 }} />
        </Avatar>
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, lineHeight: 1.2 }}
          >
            Budżet
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Wykończenie
          </Typography>
        </Box>
      </Toolbar>

      <Box sx={{ px: 1, py: 1, flex: 1 }}>
        <List disablePadding>
          {navigationItems.map((item) => (
            <ListItemButton
              key={item.id}
              selected={currentView === item.id}
              onClick={() => handleNavClick(item.id)}
              sx={{ py: 1.2, px: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: currentView === item.id ? 600 : 400,
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: themeMode === 'dark'
              ? 'rgba(88, 157, 246, 0.06)'
              : 'rgba(59, 130, 246, 0.04)',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Motyw
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={onToggleTheme}
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
              }}
            >
              {themeMode === 'dark' ? (
                <LightModeIcon sx={{ fontSize: 18 }} />
              ) : (
                <DarkModeIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
            <Typography variant="body2">
              {themeMode === 'dark' ? 'Ciemny' : 'Jasny'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        elevation={0}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: themeMode === 'dark'
                ? 'linear-gradient(90deg, #cdd3de, #589df6)'
                : 'linear-gradient(90deg, #1e293b, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Budżet Wykończenia Mieszkania
          </Typography>
          <Tooltip title={themeMode === 'dark' ? 'Tryb jasny' : 'Tryb ciemny'}>
            <IconButton
              onClick={onToggleTheme}
              aria-label="toggle theme"
              sx={{
                color: theme.palette.text.primary,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.15) },
              }}
            >
              {themeMode === 'dark' ? (
                <LightModeIcon sx={{ fontSize: 20 }} />
              ) : (
                <DarkModeIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          maxWidth: '1400px',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
