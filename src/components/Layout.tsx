import React, { useState } from 'react';
import {
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
  FileUpload as ImportIcon,
  Menu as MenuIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Palette as PaletteIcon,
  Check as CheckIcon,
  LocalShipping as ShippingIcon,
  StickyNote2 as NotesIcon,
} from '@mui/icons-material';
import { ThemeVariant } from '@/App';
import { StickyNotesPanel } from './StickyNotesPanel';
import { BudgetTopBar } from './BudgetTopBar';

const DRAWER_WIDTH = 240;
const NOTES_PANEL_WIDTH = 300;

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Podsumowanie', icon: <DashboardIcon />, section: 'Główne' },
  { id: 'saldo', label: 'Środki', icon: <SaldoIcon /> },
  { id: 'harmonogram', label: 'Planowanie', icon: <ScheduleIcon /> },
  { id: 'meble', label: 'Meble', icon: <ChairIcon />, section: 'Koszty' },
  { id: 'wykonczenie', label: 'Prace', icon: <BuildIcon /> },
  { id: 'agd', label: 'Sprzęt', icon: <KitchenIcon /> },
  { id: 'pozostale', label: 'Inne', icon: <MoreIcon /> },
  { id: 'wyprowadzka', label: 'Wyprowadzka', icon: <ShippingIcon /> },
  { id: 'import', label: 'Import danych', icon: <ImportIcon />, section: 'Ustawienia' },
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
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(!isMobile);
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
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>B</Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Budget
          </Typography>
        </Box>
        {isMobile && (
          <IconButton size="small" onClick={() => setMobileOpen(false)}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
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

      {/* Footer: theme selector + notes toggle */}
      <Box sx={{ pt: 2, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Notes toggle */}
        <Box
          onClick={() => setNotesOpen(!notesOpen)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 0.75,
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'background-color 0.1s ease',
            backgroundColor: notesOpen ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.06) },
          }}
        >
          <NotesIcon sx={{ fontSize: 16, color: notesOpen ? theme.palette.primary.main : 'text.secondary' }} />
          <Typography variant="caption" sx={{ fontWeight: 500, flex: 1 }}>
            Notatki
          </Typography>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: notesOpen ? theme.palette.success.main : theme.palette.text.secondary,
              opacity: 0.6,
            }}
          />
        </Box>

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
      {/* Mobile menu trigger */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{
              width: 36,
              height: 36,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <MenuIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      )}

      {/* Mobile notes trigger */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <IconButton
            onClick={() => setNotesOpen(!notesOpen)}
            sx={{
              width: 36,
              height: 36,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <NotesIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      )}

      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
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
        {showTopBar && <BudgetTopBar />}
        <Box sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 }, py: { xs: 3, sm: 4, md: 4 }, flex: 1 }}>
          {children}
        </Box>
      </Box>

      {/* Right panel - Sticky Notes */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          anchor="right"
          open={notesOpen}
          onClose={() => setNotesOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { width: NOTES_PANEL_WIDTH, boxSizing: 'border-box' },
          }}
        >
          <StickyNotesPanel />
        </Drawer>
      ) : (
        notesOpen && (
          <Box
            sx={{
              width: NOTES_PANEL_WIDTH,
              flexShrink: 0,
              borderLeft: `1px solid ${theme.palette.divider}`,
              height: '100vh',
              position: 'sticky',
              top: 0,
              overflowY: 'auto',
              backgroundColor: theme.palette.background.default,
            }}
          >
            <StickyNotesPanel />
          </Box>
        )
      )}
    </Box>
  );
}
