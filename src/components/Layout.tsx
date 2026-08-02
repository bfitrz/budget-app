import React, { useState } from 'react';
import {
  Typography,
  SwipeableDrawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  alpha,
  Divider,
  Popover,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Chair as ChairIcon,
  Build as BuildIcon,
  Kitchen as KitchenIcon,
  MoreHoriz as MoreIcon,
  AccountBalance as SaldoIcon,
  SyncAlt as DataIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Palette as PaletteIcon,
  Check as CheckIcon,
  LocalShipping as ShippingIcon,
  HelpOutline as HelpIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ThemeVariant } from '@/App';
import { NotificationToasts } from './NotificationToasts';
import { BudgetTopBar } from './BudgetTopBar';

const DRAWER_WIDTH = 240;

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Podsumowanie', icon: <DashboardIcon />, section: 'Główne' },
  { id: 'saldo', label: 'Środki', icon: <SaldoIcon /> },
  { id: 'harmonogram', label: 'Harmonogram', icon: <ScheduleIcon /> },
  { id: 'meble', label: 'Meblowanie', icon: <ChairIcon />, section: 'Koszty' },
  { id: 'wykonczenie', label: 'Wykończenie', icon: <BuildIcon /> },
  { id: 'agd', label: 'AGD / RTV', icon: <KitchenIcon /> },
  { id: 'pozostale', label: 'Inne', icon: <MoreIcon /> },
  { id: 'wyprowadzka', label: 'Wyprowadzka', icon: <ShippingIcon /> },
  { id: 'wykluczone', label: 'Wykluczone', icon: <MoreIcon /> },
  { id: 'import', label: 'Dane i sync', icon: <DataIcon />, section: 'Ustawienia' },
  { id: 'guide', label: 'Przewodnik', icon: <HelpIcon /> },
  { id: 'changelog', label: 'Changelog', icon: <HelpIcon /> },
];

interface ThemeOption {
  id: ThemeVariant;
  label: string;
  dot: string;
  description: string;
}

const themeOptions: ThemeOption[] = [
  { id: 'dark', label: 'Ciemny', dot: '#6366f1', description: 'Głęboka czerń' },
  { id: 'dim', label: 'Stonowany', dot: '#7c8aff', description: 'Ciemny, cieplejszy' },
  { id: 'light', label: 'Jasny', dot: '#4f46e5', description: 'Neutralny, stonowany' },
  { id: 'unicorn', label: 'Unicorn', dot: '#e879f9', description: 'Neon candy 🦄' },
];

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  themeVariant: ThemeVariant;
  themeLabel: string;
  onCycleTheme: () => void;
  onSetTheme: (variant: ThemeVariant) => void;
}

export function Layout({ children, currentView, onViewChange, themeVariant, themeLabel, onCycleTheme, onSetTheme }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeAnchor, setThemeAnchor] = useState<HTMLElement | null>(null);

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
    if (isMobile) setMobileOpen(false);
  };

  const handleSelectTheme = (variant: ThemeVariant) => {
    onSetTheme(variant);
    setThemeAnchor(null);
  };

  const costViews = ['meble', 'wykonczenie', 'agd', 'pozostale', 'wyprowadzka'];
  const showTopBar = costViews.includes(currentView);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', px: 1.5, py: 2 }}>
      {/* Brand */}
      <Box sx={{ px: 1.5, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box
          onClick={() => handleNavClick('dashboard')}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <img src={`${import.meta.env.BASE_URL}pwa-icon.png`} alt="Budget" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Budget
          </Typography>
        </Box>
        {isMobile && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={() => window.location.reload()} title="Odśwież">
              <RefreshIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton size="small" onClick={() => setMobileOpen(false)}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        )}
        {!isMobile && (
          <IconButton size="small" onClick={() => window.location.reload()} title="Odśwież" sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}>
            <RefreshIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List disablePadding>
          {navigationItems.map((item, index) => (
            <React.Fragment key={item.id}>
              {item.section && index > 0 && <Divider sx={{ my: 1.5, mx: 1 }} />}
              {item.section && (
                <Typography
                  variant="overline"
                  sx={{
                    px: 1.5,
                    pt: item.section && index > 0 ? 1 : 0,
                    pb: 0.5,
                    display: 'block',
                    color: 'text.secondary',
                    fontSize: '0.6rem',
                  }}
                >
                  {item.section}
                </Typography>
              )}
              <ListItemButton
                selected={currentView === item.id}
                onClick={() => handleNavClick(item.id)}
                sx={{ gap: 1.5 }}
              >
                <ListItemIcon sx={{ minWidth: 0, fontSize: 18 }}>
                  {React.cloneElement(item.icon as React.ReactElement, { sx: { fontSize: 18 } })}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.8125rem',
                    fontWeight: currentView === item.id ? 500 : 400,
                  }}
                />
              </ListItemButton>
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Footer: theme selector */}
      <Box sx={{ pt: 2, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Theme selector */}
        <Box
          onClick={(e) => setThemeAnchor(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 0.75,
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'background-color 0.1s ease',
            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.06) },
          }}
        >
          <PaletteIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 500, display: 'block', lineHeight: 1.3 }}>
              {themeLabel}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: themeOptions.find((t) => t.id === themeVariant)?.dot || theme.palette.primary.main,
              boxShadow: `0 0 0 2px ${alpha(themeOptions.find((t) => t.id === themeVariant)?.dot || theme.palette.primary.main, 0.3)}`,
            }}
          />
        </Box>
      </Box>

      {/* Theme popover */}
      <Popover
        open={Boolean(themeAnchor)}
        anchorEl={themeAnchor}
        onClose={() => setThemeAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '14px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
              p: 1,
              minWidth: 200,
              backgroundColor: theme.palette.background.paper,
            },
          },
        }}
      >
        <Typography variant="overline" sx={{ px: 1.5, pt: 0.5, pb: 1, display: 'block', color: 'text.secondary' }}>
          Motyw
        </Typography>
        {themeOptions.map((opt) => (
          <Box
            key={opt.id}
            onClick={() => handleSelectTheme(opt.id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.1s ease',
              backgroundColor: themeVariant === opt.id ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.06) },
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: opt.dot,
                boxShadow: `0 0 0 2px ${alpha(opt.dot, 0.2)}`,
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
                {opt.label}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                {opt.description}
              </Typography>
            </Box>
            {themeVariant === opt.id && (
              <CheckIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} />
            )}
          </Box>
        ))}
      </Popover>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      {isMobile ? (
        <SwipeableDrawer
          variant="temporary"
          open={mobileOpen}
          onOpen={() => setMobileOpen(true)}
          onClose={() => setMobileOpen(false)}
          swipeAreaWidth={20}
          minFlingVelocity={300}
          hysteresis={0.35}
          disableBackdropTransition
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </SwipeableDrawer>
      ) : (
        <Box
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            borderRight: `1px solid ${theme.palette.divider}`,
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflowY: 'auto',
          }}
        >
          {drawerContent}
        </Box>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '1200px',
        }}
      >
        {/* Version bar */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: { xs: 2, sm: 3, md: 4 }, pt: 1.5 }}>
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', opacity: 0.5 }}>
            v2.5.0
          </Typography>
        </Box>
        {showTopBar && <BudgetTopBar />}
        <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, py: { xs: 2, sm: 3, md: 4 }, flex: 1 }}>
          {children}
        </Box>
      </Box>

      {/* Notifications */}
      <NotificationToasts />
    </Box>
  );
}
