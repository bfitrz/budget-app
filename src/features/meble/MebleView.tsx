import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  alpha,
  useTheme,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Collapse,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Chair as ChairIcon,
  ExpandMore as ExpandMoreIcon,
  CreateNewFolder as NewGroupIcon,
  Edit as EditIcon,
  SwapHoriz as AltIcon,
  Link as LinkIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowRight as ArrowRightIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useBudgetStore } from '@/store';
import { MebleItem, AlternativeItem, PaymentStatus } from '@/types';
import { formatCurrency } from '@/utils';
import { generateId } from '@/utils';
import { LinksModal, LinksDisplay } from '@/components';
import { AlternativesModal } from '@/components';

interface MebleFormData {
  pomieszczenie: string;
  kategoria: string;
  nazwa: string;
  cena: number;
  status: PaymentStatus;
  uwagi: string;
}

interface GroupSummary {
  name: string;
  items: MebleItem[];
  totalCost: number;
  paidCost: number;
  itemCount: number;
  paidCount: number;
}

export function MebleView() {
  const theme = useTheme();
  const meble = useBudgetStore((s) => s.meble);
  const updateMebleItem = useBudgetStore((s) => s.updateMebleItem);
  const addMebleItem = useBudgetStore((s) => s.addMebleItem);
  const deleteMebleItem = useBudgetStore((s) => s.deleteMebleItem);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MebleItem | null>(null);
  const [presetGroupName, setPresetGroupName] = useState<string | null>(null);
  const [linksItem, setLinksItem] = useState<MebleItem | null>(null);
  const [linksAlt, setLinksAlt] = useState<{ itemId: string; alt: AlternativeItem } | null>(null);
  const [altItem, setAltItem] = useState<MebleItem | null>(null);
  const [payChoiceItem, setPayChoiceItem] = useState<MebleItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [customGroups, setCustomGroups] = useState<string[]>([]);

  const { control, handleSubmit, reset, setValue} = useForm<MebleFormData>({
    defaultValues: {
      pomieszczenie: '',
      kategoria: '',
      nazwa: '',
      cena: 0,
      status: 'Do zapłaty',
      uwagi: '',
    },
  });

  // Group items by pomieszczenie
  const groups: GroupSummary[] = useMemo(() => {
    const groupMap = new Map<string, MebleItem[]>();

    // Add custom empty groups
    for (const g of customGroups) {
      if (!groupMap.has(g)) groupMap.set(g, []);
    }

    for (const item of meble) {
      const key = item.pomieszczenie || 'Bez grupy';
      const existing = groupMap.get(key) || [];
      existing.push(item);
      groupMap.set(key, existing);
    }

    return Array.from(groupMap.entries()).map(([name, items]) => {
      const includedItems = items.filter((i) => i.included);
      return {
        name,
        items,
        totalCost: includedItems.reduce((s, i) => s + i.cena, 0),
        paidCost: includedItems.filter((i) => i.status === 'Opłacone').reduce((s, i) => s + i.cena, 0),
        itemCount: items.length,
        paidCount: includedItems.filter((i) => i.status === 'Opłacone').length,
      };
    });
  }, [meble, customGroups]);

  // All unique group names for autocomplete
  const allGroupNames = useMemo(() => {
    const names = new Set<string>();
    for (const item of meble) {
      if (item.pomieszczenie) names.add(item.pomieszczenie);
    }
    for (const g of customGroups) names.add(g);
    return Array.from(names).sort();
  }, [meble, customGroups]);

  const handleToggleIncluded = (item: MebleItem) => {
    updateMebleItem(item.id, { included: !item.included });
  };

  const handleUwagiChange = (item: MebleItem, value: string) => {
    updateMebleItem(item.id, { uwagi: value });
  };

  const onSubmit = (data: MebleFormData) => {
    if (editingItem) {
      updateMebleItem(editingItem.id, {
        pomieszczenie: data.pomieszczenie,
        kategoria: data.kategoria,
        nazwa: data.nazwa,
        cena: Number(data.cena),
        uwagi: data.uwagi,
      });
    } else {
      addMebleItem({
        ...data,
        included: true,
        cena: Number(data.cena),
        linki: [],
        alternatywy: [],
        wybranaAltId: null,
      });
    }
    reset();
    setEditingItem(null);
    setDialogOpen(false);
  };

  const openAddDialog = (presetGroup?: string) => {
    setEditingItem(null);
    setPresetGroupName(presetGroup || null);
    reset({ pomieszczenie: presetGroup || '', kategoria: '', nazwa: '', cena: 0, status: 'Do zapłaty', uwagi: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (item: MebleItem) => {
    setEditingItem(item);
    setPresetGroupName(null);
    setValue('pomieszczenie', item.pomieszczenie);
    setValue('kategoria', item.kategoria);
    setValue('nazwa', item.nazwa);
    setValue('cena', item.cena);
    setValue('status', item.status);
    setValue('uwagi', item.uwagi);
    setDialogOpen(true);
  };

  const handleAddGroup = () => {
    if (newGroupName.trim() && !allGroupNames.includes(newGroupName.trim())) {
      setCustomGroups((prev) => [...prev, newGroupName.trim()]);
    }
    setNewGroupName('');
    setGroupDialogOpen(false);
  };

  const totalIncluded = meble.filter((i) => i.included).reduce((sum, i) => sum + i.cena, 0);
  const paidCount = meble.filter((i) => i.included && i.status === 'Opłacone').length;
  const totalCount = meble.filter((i) => i.included).length;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h4">Meble</Typography>
            <Typography variant="body2" color="text.secondary">
              Zarządzaj kosztami mebli i wyposażenia — pogrupowane wg pomieszczenia
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<NewGroupIcon />}
              onClick={() => setGroupDialogOpen(true)}
              size="small"
            >
              Nowa grupa
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openAddDialog()}
            >
              Dodaj pozycję
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Global summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
              Suma uwzględnionych
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {formatCurrency(totalIncluded)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
              Opłacone / Wszystkie
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {paidCount} / {totalCount}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
              Liczba grup
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {groups.length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Grouped accordions */}
      {meble.length === 0 && groups.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <ChairIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4 }} />
              <Typography color="text.secondary">
                Brak pozycji. Kliknij "Dodaj pozycję" lub zaimportuj dane.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {groups.map((group) => (
            <Accordion
              key={group.name}
              defaultExpanded
              sx={{
                borderRadius: '12px !important',
                '&:before': { display: 'none' },
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.03),
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.06) },
                  minHeight: 56,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {group.name}
                    </Typography>
                    <Chip
                      label={`${group.itemCount} poz.`}
                      size="small"
                      sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={`${group.paidCount}/${group.items.filter((i) => i.included).length} opłacone`}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        height: 22,
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        fontWeight: 600,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, fontFamily: 'monospace', minWidth: 100, textAlign: 'right' }}
                    >
                      {formatCurrency(group.totalCost)}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 30 }}></TableCell>
                        <TableCell padding="checkbox" sx={{ width: 50 }}>Uwzgl.</TableCell>
                        <TableCell>Kategoria</TableCell>
                        <TableCell>Nazwa</TableCell>
                        <TableCell align="right">Cena</TableCell>
                        <TableCell sx={{ width: 120 }}>Status</TableCell>
                        <TableCell>Uwagi</TableCell>
                        <TableCell sx={{ width: 100 }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} sx={{ py: 3 }}>
                            <Typography variant="body2" color="text.secondary" align="center">
                              Brak pozycji w tej grupie. Dodaj pozycję z pomieszczeniem "{group.name}".
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        group.items.map((item) => {
                          const allPrices = [item.cena, ...(item.alternatywy || []).filter(a => a.included).map(a => a.cena)];
                          const minPrice = Math.min(...allPrices);
                          const maxPrice = Math.max(...allPrices);
                          const hasRange = minPrice !== maxPrice;

                          return (
                          <React.Fragment key={item.id}>
                          {/* Main record row */}
                          <TableRow sx={{ opacity: item.included ? 1 : 0.4 }}>
                            <TableCell sx={{ width: 30, p: 0.5 }}>
                              <IconButton size="small" onClick={() => {
                                setExpandedItems(prev => {
                                  const next = new Set(prev);
                                  if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
                                  return next;
                                });
                              }} sx={{ width: 22, height: 22 }}>
                                {expandedItems.has(item.id) ? <ArrowDownIcon sx={{ fontSize: 14 }} /> : <ArrowRightIcon sx={{ fontSize: 14 }} />}
                              </IconButton>
                            </TableCell>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={item.included}
                                onChange={() => handleToggleIncluded(item)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip label={item.kategoria} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.nazwa}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              {item.status === 'Opłacone' && item.wybranaAltId !== undefined ? (
                                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                                  {formatCurrency(
                                    item.wybranaAltId === null
                                      ? item.cena
                                      : (item.alternatywy || []).find(a => a.id === item.wybranaAltId)?.cena || item.cena
                                  )}
                                </Typography>
                              ) : hasRange ? (
                                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.7rem' }}>
                                  {formatCurrency(minPrice)} — {formatCurrency(maxPrice)}
                                </Typography>
                              ) : (
                                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                                  {formatCurrency(item.cena)}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.status}
                                size="small"
                                sx={{
                                  fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer',
                                  backgroundColor: item.status === 'Opłacone' ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.warning.main, 0.15),
                                  color: item.status === 'Opłacone' ? theme.palette.success.main : theme.palette.warning.main,
                                  border: 'none',
                                }}
                                onClick={() => {
                                  if (item.status === 'Opłacone') {
                                    // Going back to unpaid — keep current main as is
                                    updateMebleItem(item.id, { status: 'Do zapłaty' });
                                  } else if ((item.alternatywy || []).filter(a => a.included).length > 0) {
                                    // Has alternatives — ask which one was paid
                                    setPayChoiceItem(item);
                                  } else {
                                    // No alternatives — just mark paid
                                    updateMebleItem(item.id, { status: 'Opłacone', wybranaAltId: null });
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField size="small" value={item.uwagi} onChange={(e) => handleUwagiChange(item, e.target.value)} placeholder="..." variant="standard" sx={{ '& .MuiInput-root': { fontSize: '0.8rem' } }} />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="Edytuj"><IconButton size="small" onClick={() => openEditDialog(item)} sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.primary.main } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                <Tooltip title="Dodaj alternatywę"><IconButton size="small" onClick={() => setAltItem(item)} sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.info.main } }}><AltIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                <Tooltip title="Usuń"><IconButton size="small" onClick={() => deleteMebleItem(item.id)} sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.error.main } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>

                          {/* Collapsible MAIN + ALT section */}
                          <TableRow sx={{ opacity: item.included ? 1 : 0.35 }}>
                            <TableCell colSpan={8} sx={{ py: 0, px: 0, border: 'none' }}>
                              <Collapse in={expandedItems.has(item.id)} timeout="auto" unmountOnExit>
                                <Box sx={{ pl: 6, pr: 2, pb: 1.5, pt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                  {/* MAIN entry */}
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 0.75, borderRadius: 1.5, backgroundColor: alpha(theme.palette.success.main, 0.03), border: `1px solid ${alpha(theme.palette.success.main, 0.1)}` }}>
                                    <Chip label="MAIN" size="small" sx={{ fontSize: '0.5rem', height: 16, fontWeight: 700, backgroundColor: alpha(theme.palette.success.main, 0.12), color: theme.palette.success.main }} />
                                    <Typography variant="body2" sx={{ fontSize: '0.7rem', flex: 1 }}>Cena główna</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.75rem' }}>{formatCurrency(item.cena)}</Typography>
                                    {(item.linki || []).map((link, li) => (
                                      <Chip key={li} label={link.nazwa} size="small" onClick={() => window.open(link.url, '_blank')}
                                        sx={{ fontSize: '0.55rem', height: 18, cursor: 'pointer', backgroundColor: alpha(theme.palette.primary.main, 0.06), '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.12) } }} />
                                    ))}
                                    <Tooltip title="Zarządzaj linkami"><IconButton size="small" onClick={() => setLinksItem(item)} sx={{ opacity: 0.5, '&:hover': { opacity: 1 }, width: 20, height: 20 }}><LinkIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                                  </Box>
                                  {/* ALT entries */}
                                  {(item.alternatywy || []).map((alt) => (
                                    <Box key={alt.id} sx={{
                                      display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 0.75, borderRadius: 1.5,
                                      backgroundColor: alpha(theme.palette.info.main, 0.02), border: `1px solid ${alpha(theme.palette.info.main, 0.08)}`,
                                      opacity: alt.included ? 1 : 0.4,
                                    }}>
                                      <Checkbox checked={alt.included} onChange={() => {
                                        const newAlts = (item.alternatywy || []).map((a) => a.id === alt.id ? { ...a, included: !a.included } : a);
                                        updateMebleItem(item.id, { alternatywy: newAlts });
                                      }} size="small" sx={{ p: 0, '& .MuiSvgIcon-root': { fontSize: 15 } }} />
                                      <Chip label="ALT" size="small" sx={{ fontSize: '0.5rem', height: 16, fontWeight: 700, backgroundColor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }} />
                                      <Typography variant="body2" sx={{ fontSize: '0.7rem', fontStyle: 'italic', flex: 1 }}>{alt.nazwa}</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.75rem', color: alt.cena <= item.cena ? theme.palette.success.main : theme.palette.warning.main }}>
                                        {formatCurrency(alt.cena)}
                                      </Typography>
                                      {(alt.linki || []).map((link, li) => (
                                        <Chip key={li} label={link.nazwa} size="small" onClick={() => window.open(link.url, '_blank')}
                                          sx={{ fontSize: '0.55rem', height: 18, cursor: 'pointer', backgroundColor: alpha(theme.palette.primary.main, 0.06), '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.12) } }} />
                                      ))}
                                      <Tooltip title="Linki"><IconButton size="small" onClick={() => setLinksAlt({ itemId: item.id, alt })} sx={{ opacity: 0.5, '&:hover': { opacity: 1 }, width: 20, height: 20 }}><LinkIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                                      <Tooltip title="Ustaw jako MAIN"><IconButton size="small" onClick={() => {
                                        const oldMain: AlternativeItem = { id: generateId(), included: true, nazwa: 'Poprzednia opcja', cena: item.cena, linki: item.linki || [], uwagi: '' };
                                        const newAlts = [oldMain, ...(item.alternatywy || []).filter((a) => a.id !== alt.id)];
                                        updateMebleItem(item.id, { cena: alt.cena, linki: alt.linki || [], alternatywy: newAlts });
                                      }} sx={{ opacity: 0.4, '&:hover': { opacity: 1, color: theme.palette.success.main }, width: 20, height: 20 }}><AltIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                                      <Tooltip title="Usuń"><IconButton size="small" onClick={() => {
                                        const newAlts = (item.alternatywy || []).filter((a) => a.id !== alt.id);
                                        updateMebleItem(item.id, { alternatywy: newAlts });
                                      }} sx={{ opacity: 0.4, '&:hover': { opacity: 1, color: theme.palette.error.main }, width: 20, height: 20 }}><DeleteIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                                    </Box>
                                  ))}
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                          </React.Fragment>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* Group footer */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    py: 1.5,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                  }}
                >
                  <Button size="small" startIcon={<AddIcon />} onClick={() => openAddDialog(group.name)} sx={{ fontSize: '0.75rem', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Dodaj do "{group.name}"
                  </Button>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Opłacone: <strong>{formatCurrency(group.paidCost)}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      Razem: {formatCurrency(group.totalCost)}
                    </Typography>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Add item dialog */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingItem(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingItem ? 'Edytuj pozycję — Meble' : 'Dodaj pozycję — Meble'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {!presetGroupName && (
              <Controller
                name="pomieszczenie"
                control={control}
                rules={{ required: 'Wymagane' }}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    freeSolo
                    options={allGroupNames}
                    value={field.value}
                    onInputChange={(_, value) => field.onChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Grupa (pomieszczenie)"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message || 'Wybierz istniejącą lub wpisz nową'}
                      />
                    )}
                  />
                )}
              />
            )}
            <Controller
              name="kategoria"
              control={control}
              rules={{ required: 'Wymagane' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Kategoria"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="nazwa"
              control={control}
              rules={{ required: 'Wymagane' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Nazwa"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="cena"
              control={control}
              rules={{ required: 'Wymagane', min: { value: 0, message: 'Min 0' } }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Cena (PLN)"
                  type="number"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="uwagi"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Uwagi" fullWidth multiline rows={2} />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => { setDialogOpen(false); setEditingItem(null); }}>Anuluj</Button>
            <Button type="submit" variant="contained">
              {editingItem ? 'Zapisz' : 'Dodaj'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* New group dialog */}
      <Dialog open={groupDialogOpen} onClose={() => setGroupDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Nowa grupa</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Utwórz nową grupę (np. pomieszczenie). Pozycje dodajesz do niej przez pole "Grupa" przy dodawaniu.
          </Typography>
          <TextField
            label="Nazwa grupy"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="np. Sypialnia, Balkon..."
            fullWidth
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddGroup();
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setGroupDialogOpen(false)}>Anuluj</Button>
          <Button
            variant="contained"
            onClick={handleAddGroup}
            disabled={!newGroupName.trim()}
          >
            Utwórz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Links modal for main items */}
      <LinksModal
        open={!!linksItem}
        onClose={() => setLinksItem(null)}
        links={linksItem?.linki || []}
        onSave={(linki) => {
          if (linksItem) updateMebleItem(linksItem.id, { linki });
          setLinksItem(null);
        }}
        itemName={linksItem?.nazwa}
      />

      {/* Links modal for alternatives */}
      <LinksModal
        open={!!linksAlt}
        onClose={() => setLinksAlt(null)}
        links={linksAlt?.alt.linki || []}
        onSave={(linki) => {
          if (linksAlt) {
            const item = meble.find((m) => m.id === linksAlt.itemId);
            if (item) {
              const newAlts = (item.alternatywy || []).map((a) =>
                a.id === linksAlt.alt.id ? { ...a, linki } : a
              );
              updateMebleItem(linksAlt.itemId, { alternatywy: newAlts });
            }
          }
          setLinksAlt(null);
        }}
        itemName={linksAlt ? `${linksAlt.alt.nazwa} (alternatywa)` : ''}
      />

      {/* Alternatives modal */}
      <AlternativesModal
        open={!!altItem}
        onClose={() => setAltItem(null)}
        alternatives={altItem?.alternatywy || []}
        onSave={(alternatywy) => {
          if (altItem) updateMebleItem(altItem.id, { alternatywy });
          setAltItem(null);
        }}
        itemName={altItem?.nazwa}
        baseCena={altItem?.cena}
      />

      {/* Payment choice dialog */}
      <Dialog open={!!payChoiceItem} onClose={() => setPayChoiceItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Którą opcję opłaciłeś?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Wybierz cenę, która została zapłacona:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Main option */}
            <Box
              onClick={() => {
                if (payChoiceItem) {
                  updateMebleItem(payChoiceItem.id, { status: 'Opłacone', wybranaAltId: null });
                  setPayChoiceItem(null);
                }
              }}
              sx={{
                p: 1.5, borderRadius: 2, cursor: 'pointer',
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                '&:hover': { borderColor: theme.palette.success.main, backgroundColor: alpha(theme.palette.success.main, 0.04) },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="MAIN" size="small" sx={{ fontSize: '0.5rem', height: 16, fontWeight: 700, backgroundColor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }} />
                <Typography variant="body2">Cena główna</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                {formatCurrency(payChoiceItem?.cena || 0)}
              </Typography>
            </Box>
            {/* Alt options */}
            {(payChoiceItem?.alternatywy || []).filter(a => a.included).map((alt) => (
              <Box
                key={alt.id}
                onClick={() => {
                  if (payChoiceItem) {
                    // Swap: ALT becomes MAIN, old MAIN becomes ALT
                    const oldMain: AlternativeItem = {
                      id: payChoiceItem.id + '_old',
                      included: true,
                      nazwa: 'Poprzednia cena główna',
                      cena: payChoiceItem.cena,
                      linki: payChoiceItem.linki || [],
                      uwagi: '',
                    };
                    const newAlts = [
                      oldMain,
                      ...(payChoiceItem.alternatywy || []).filter(a => a.id !== alt.id),
                    ];
                    updateMebleItem(payChoiceItem.id, {
                      status: 'Opłacone',
                      cena: alt.cena,
                      linki: alt.linki || [],
                      alternatywy: newAlts,
                      wybranaAltId: null,
                    });
                    setPayChoiceItem(null);
                  }
                }}
                sx={{
                  p: 1.5, borderRadius: 2, cursor: 'pointer',
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  '&:hover': { borderColor: theme.palette.info.main, backgroundColor: alpha(theme.palette.info.main, 0.04) },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="ALT" size="small" sx={{ fontSize: '0.5rem', height: 16, fontWeight: 700, backgroundColor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }} />
                  <Typography variant="body2">{alt.nazwa}</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: alt.cena <= (payChoiceItem?.cena || 0) ? theme.palette.success.main : theme.palette.warning.main }}>
                  {formatCurrency(alt.cena)}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPayChoiceItem(null)}>Anuluj</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
