import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Card, CardContent, alpha, useTheme, Tooltip, Accordion, AccordionSummary, AccordionDetails,
  Autocomplete, Collapse,
} from '@mui/material';
import {
  Delete as DeleteIcon, Add as AddIcon, ExpandMore as ExpandMoreIcon,
  CreateNewFolder as NewGroupIcon, Edit as EditIcon, SwapHoriz as AltIcon,
  Link as LinkIcon, KeyboardArrowDown as ArrowDownIcon, KeyboardArrowRight as ArrowRightIcon,
  AttachMoney as IncludedIcon, MoneyOff as ExcludedIcon,
  TrendingDown as ArrowDownPriceIcon, TrendingUp as ArrowUpIcon, DragHandle as DragHandleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { AlternativeItem, ItemLink, PaymentStatus } from '@/types';
import { formatCurrency, formatCurrencyOrDash, generateId } from '@/utils';
import { LinksModal } from './LinksEditor';
import { AlternativesModal } from './AlternativesModal';

export interface CostItem {
  id: string;
  included: boolean;
  cena: number;
  status: PaymentStatus;
  uwagi: string;
  linki: ItemLink[];
  alternatywy: AlternativeItem[];
  wybranaAltId: string | null;
  [key: string]: unknown;
}

export interface ColumnDef {
  field: string;
  label: string;
  type?: 'text' | 'chip';
}

export interface CostCategoryConfig {
  title: string;
  subtitle: string;
  groupField: string;
  nameField: string;
  columns: ColumnDef[];
  addFields: { field: string; label: string; required?: boolean }[];
}

interface CostCategoryViewProps {
  config: CostCategoryConfig;
  items: CostItem[];
  updateItem: (id: string, updates: Partial<CostItem>) => void;
  addItem: (item: Omit<CostItem, 'id'>) => void;
  deleteItem: (id: string) => void;
}

export function CostCategoryView({ config, items, updateItem, addItem, deleteItem }: CostCategoryViewProps) {
  const theme = useTheme();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CostItem | null>(null);
  const [presetGroupName, setPresetGroupName] = useState<string | null>(null);
  const [linksItem, setLinksItem] = useState<CostItem | null>(null);
  const [linksAlt, setLinksAlt] = useState<{ itemId: string; alt: AlternativeItem } | null>(null);
  const [altItem, setAltItem] = useState<CostItem | null>(null);
  const [editingAlt, setEditingAlt] = useState<{ itemId: string; alt: AlternativeItem } | null>(null);
  const [editingMainPrice, setEditingMainPrice] = useState<CostItem | null>(null);
  const [payChoiceItem, setPayChoiceItem] = useState<CostItem | null>(null);
  const [deleteChoiceItem, setDeleteChoiceItem] = useState<CostItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [customGroups, setCustomGroups] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, string | number>>({});

  // Grouping
  const groups = useMemo(() => {
    const groupMap = new Map<string, CostItem[]>();
    for (const g of customGroups) { if (!groupMap.has(g)) groupMap.set(g, []); }
    for (const item of items) {
      const key = (item[config.groupField] as string) || 'Bez grupy';
      const existing = groupMap.get(key) || [];
      existing.push(item);
      groupMap.set(key, existing);
    }
    return Array.from(groupMap.entries()).map(([name, grpItems]) => {
      const included = grpItems.filter((i) => i.included);
      return {
        name, items: grpItems,
        totalCost: included.reduce((s, i) => s + i.cena, 0),
        paidCost: included.filter((i) => i.status === 'Opłacone').reduce((s, i) => s + i.cena, 0),
        paidCount: included.filter((i) => i.status === 'Opłacone').length,
        totalCount: included.length,
      };
    });
  }, [items, customGroups, config.groupField]);

  const allGroupNames = useMemo(() => {
    const names = new Set<string>();
    for (const item of items) { const v = item[config.groupField] as string; if (v) names.add(v); }
    for (const g of customGroups) names.add(g);
    return Array.from(names).sort();
  }, [items, customGroups, config.groupField]);

  const totalIncluded = items.filter((i) => i.included).reduce((s, i) => s + i.cena, 0);
  const paidCount = items.filter((i) => i.included && i.status === 'Opłacone').length;
  const totalCount = items.filter((i) => i.included).length;

  // Form helpers
  const openAddDialog = (presetGroup?: string) => {
    setEditingItem(null);
    setPresetGroupName(presetGroup || null);
    const defaults: Record<string, string | number> = {};
    defaults[config.groupField] = presetGroup || '';
    config.addFields.forEach(f => { defaults[f.field] = ''; });
    defaults.cena = 0;
    setFormData(defaults);
    setDialogOpen(true);
  };

  const openEditDialog = (item: CostItem) => {
    setEditingItem(item);
    setPresetGroupName(null);
    const data: Record<string, string | number> = {};
    data[config.groupField] = item[config.groupField] as string || '';
    config.addFields.forEach(f => { data[f.field] = item[f.field] as string || ''; });
    setFormData(data);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingItem) {
      const updates: Record<string, unknown> = {};
      updates[config.groupField] = formData[config.groupField];
      config.addFields.forEach(f => { updates[f.field] = formData[f.field]; });
      updates.uwagi = formData.uwagi || '';
      updateItem(editingItem.id, updates as Partial<CostItem>);
    } else {
      const newItem: Record<string, unknown> = { included: true, cena: Number(formData.cena) || 0, status: 'Do zapłaty', uwagi: formData.uwagi || '', linki: [], alternatywy: [], wybranaAltId: null };
      newItem[config.groupField] = formData[config.groupField];
      config.addFields.forEach(f => { newItem[f.field] = formData[f.field]; });
      addItem(newItem as Omit<CostItem, 'id'>);
    }
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleAddGroup = () => {
    if (newGroupName.trim() && !allGroupNames.includes(newGroupName.trim())) {
      setCustomGroups(prev => [...prev, newGroupName.trim()]);
    }
    setNewGroupName('');
    setGroupDialogOpen(false);
  };


  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h2">{config.title}</Typography>
            <Typography variant="body1" color="text.secondary">{config.subtitle}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<NewGroupIcon />} onClick={() => setGroupDialogOpen(true)} size="small">Nowa grupa</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openAddDialog()}>Dodaj pozycję</Button>
          </Box>
        </Box>
      </Box>

      {/* Summary cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 180 }}><CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}><Typography variant="overline" color="text.secondary">Suma</Typography><Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(totalIncluded)}</Typography></CardContent></Card>
        <Card sx={{ flex: 1, minWidth: 180 }}><CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}><Typography variant="overline" color="text.secondary">Opłacone</Typography><Typography variant="h5" sx={{ fontWeight: 700 }}>{paidCount} / {totalCount}</Typography></CardContent></Card>
        <Card sx={{ flex: 1, minWidth: 180 }}><CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}><Typography variant="overline" color="text.secondary">Grupy</Typography><Typography variant="h5" sx={{ fontWeight: 700 }}>{groups.length}</Typography></CardContent></Card>
      </Box>

      {/* Groups */}
      {items.length === 0 && groups.length === 0 ? (
        <Card><CardContent sx={{ py: 8, textAlign: 'center' }}><Typography color="text.secondary">Brak pozycji — dodaj nową lub zaimportuj dane z Excela.</Typography></CardContent></Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {groups.map((group) => (
            <Accordion key={group.name} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 52, px: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{group.name}</Typography>
                    <Chip label={`${group.items.length} poz.`} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip label={`${group.paidCount}/${group.totalCount} opłacone`} size="small" sx={{ fontSize: '0.65rem', height: 20, backgroundColor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, fontWeight: 600 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', minWidth: 90, textAlign: 'right' }}>{formatCurrencyOrDash(group.totalCost)}</Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 30 }}></TableCell>
                        <TableCell padding="checkbox" sx={{ width: 50 }}></TableCell>
                        {config.columns.map(col => <TableCell key={col.field}>{col.label}</TableCell>)}
                        <TableCell align="right">Cena</TableCell>
                        <TableCell sx={{ width: 120 }}>Status</TableCell>
                        <TableCell>Uwagi</TableCell>
                        <TableCell sx={{ width: 90 }}></TableCell>
                        <TableCell sx={{ width: 90 }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.items.map((item) => {
                        const allPrices = [item.cena, ...(item.alternatywy || []).filter(a => a.included).map(a => a.cena)];
                        const minPrice = Math.min(...allPrices);
                        const maxPrice = Math.max(...allPrices);
                        const hasRange = minPrice !== maxPrice;
                        return (
                          <React.Fragment key={item.id}>
                            <TableRow sx={{ opacity: item.included ? 1 : 0.4, '& > td': { borderBottom: (item.alternatywy || []).length > 0 || (item.linki || []).length > 0 ? 'none' : undefined } }}>
                              <TableCell sx={{ width: 30, p: 0.5 }}>
                                <IconButton size="small" onClick={() => setExpandedItems(prev => { const next = new Set(prev); if (next.has(item.id)) next.delete(item.id); else next.add(item.id); return next; })} sx={{ width: 22, height: 22 }}>
                                  {expandedItems.has(item.id) ? <ArrowDownIcon sx={{ fontSize: 14 }} /> : <ArrowRightIcon sx={{ fontSize: 14 }} />}
                                </IconButton>
                              </TableCell>
                              <TableCell padding="checkbox">
                                <Tooltip title={item.included ? 'Kliknij aby wykluczyć z budżetu' : 'Kliknij aby wliczyć do budżetu'}>
                                  <IconButton size="small" onClick={() => updateItem(item.id, { included: !item.included })} sx={{ width: 24, height: 24, color: item.included ? theme.palette.success.main : theme.palette.text.secondary, opacity: item.included ? 0.7 : 0.3, '&:hover': { opacity: 1 } }}>
                                    {item.included ? <IncludedIcon sx={{ fontSize: 15 }} /> : <ExcludedIcon sx={{ fontSize: 15 }} />}
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                              {config.columns.map(col => (
                                <TableCell key={col.field}>
                                  {col.type === 'chip' ? <Chip label={item[col.field] as string} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} /> : <Typography variant="body2" sx={{ fontWeight: 500 }}>{item[col.field] as string}</Typography>}
                                </TableCell>
                              ))}
                              <TableCell align="right">
                                {item.status === 'Opłacone' ? (
                                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{formatCurrencyOrDash(item.cena)}</Typography>
                                ) : hasRange ? (
                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{formatCurrencyOrDash(item.cena)}</Typography>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'text.secondary' }}>{formatCurrencyOrDash(minPrice)} — {formatCurrencyOrDash(maxPrice)}</Typography>
                                  </Box>
                                ) : (
                                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{formatCurrencyOrDash(item.cena)}</Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip label={item.status} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer', backgroundColor: item.status === 'Opłacone' ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.warning.main, 0.15), color: item.status === 'Opłacone' ? theme.palette.success.main : theme.palette.warning.main, border: 'none' }}
                                  onClick={() => {
                                    if (item.status === 'Opłacone') { updateItem(item.id, { status: 'Do zapłaty' }); }
                                    else if ((item.alternatywy || []).filter(a => a.included).length > 0) { setPayChoiceItem(item); }
                                    else { updateItem(item.id, { status: 'Opłacone', wybranaAltId: null }); }
                                  }} />
                              </TableCell>
                              <TableCell><TextField size="small" value={item.uwagi} onChange={(e) => updateItem(item.id, { uwagi: e.target.value })} placeholder="..." variant="standard" sx={{ '& .MuiInput-root': { fontSize: '0.8rem' } }} /></TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                  {(() => { const t = (item.linki || []).length + (item.alternatywy || []).reduce((s, a) => s + (a.linki || []).length, 0); return t > 0 ? <Chip label={`${t} 🔗`} size="small" sx={{ fontSize: '0.55rem', height: 20, backgroundColor: alpha(theme.palette.primary.main, 0.08) }} /> : null; })()}
                                  {(item.alternatywy || []).length > 0 && <Chip label={`${(item.alternatywy || []).length} alt`} size="small" sx={{ fontSize: '0.55rem', height: 20, backgroundColor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, fontWeight: 600 }} />}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Tooltip title="Edytuj"><IconButton size="small" onClick={() => openEditDialog(item)} sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.primary.main } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                  <Tooltip title="Dodaj alternatywę"><IconButton size="small" onClick={() => setAltItem(item)} sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.info.main } }}><AltIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                  <Tooltip title="Usuń"><IconButton size="small" onClick={() => { if (window.confirm(`Usunąć "${item[config.nameField]}" wraz ze wszystkimi alternatywami?`)) deleteItem(item.id); }} sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.error.main } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                            {/* Collapsible MAIN + ALT */}
                            <TableRow sx={{ opacity: item.included ? 1 : 0.35 }}>
                              <TableCell colSpan={9 + config.columns.length} sx={{ py: 0, px: 0, border: 'none' }}>
                                <Collapse in={expandedItems.has(item.id)} timeout="auto" unmountOnExit>
                                  <Box sx={{ pl: 2, pr: 2, pb: 1.5, pt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                    {/* MAIN */}
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '24px 50px 1fr 120px 80px 100px', alignItems: 'center', gap: 2, px: 1.5, py: 0.75, borderRadius: 1.5, backgroundColor: alpha(theme.palette.success.main, 0.03), border: `1px solid ${alpha(theme.palette.success.main, 0.1)}` }}>
                                      <Box></Box>
                                      <Chip label="MAIN" size="small" sx={{ fontSize: '0.5rem', height: 16, fontWeight: 700, backgroundColor: alpha(theme.palette.success.main, 0.12), color: theme.palette.success.main }} />
                                      <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>Cena główna</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.75rem', textAlign: 'right' }}>{formatCurrencyOrDash(item.cena)}</Typography>
                                      <Box>
                                        {(item.linki || []).length > 0 && (
                                          <Tooltip title={<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 0.5 }}>{item.linki.map((link, li) => (<Typography key={li} variant="caption" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => window.open(link.url, '_blank')}>🔗 {link.nazwa}</Typography>))}</Box>} arrow slotProps={{ tooltip: { sx: { backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, px: 1.5, py: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' } }, arrow: { sx: { color: theme.palette.background.paper } } }}>
                                            <Chip label={`${item.linki.length} link${item.linki.length > 1 ? 'i' : ''}`} size="small" sx={{ fontSize: '0.55rem', height: 18, cursor: 'default', backgroundColor: alpha(theme.palette.primary.main, 0.08) }} />
                                          </Tooltip>
                                        )}
                                      </Box>
                                      <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'flex-end' }}>
                                        <Tooltip title="Linki"><IconButton size="small" onClick={() => setLinksItem(item)} sx={{ opacity: 0.5, '&:hover': { opacity: 1 }, width: 20, height: 20 }}><LinkIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                                        <Tooltip title="Edytuj cenę"><IconButton size="small" onClick={() => setEditingMainPrice(item)} sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.primary.main }, width: 20, height: 20 }}><EditIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                                        {(item.alternatywy || []).length > 0 && (
                                          <Tooltip title="Usuń MAIN (wybierz nowy)"><IconButton size="small" onClick={() => setDeleteChoiceItem(item)} sx={{ opacity: 0.4, '&:hover': { opacity: 1, color: theme.palette.error.main }, width: 20, height: 20 }}><DeleteIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                                        )}
                                      </Box>
                                    </Box>
                                    {/* ALTs */}
                                    {(item.alternatywy || []).map((alt) => (
                                      <Box key={alt.id} sx={{ display: 'grid', gridTemplateColumns: '24px 50px 1fr 120px 80px 100px', alignItems: 'center', gap: 2, px: 1.5, py: 0.75, borderRadius: 1.5, backgroundColor: alpha(theme.palette.info.main, 0.02), border: `1px solid ${alpha(theme.palette.info.main, 0.08)}`, opacity: alt.included ? 1 : 0.4 }}>
                                        <Tooltip title={alt.included ? 'Kliknij aby wykluczyć z budżetu' : 'Kliknij aby wliczyć do budżetu'}>
                                          <IconButton size="small" onClick={() => { const newAlts = (item.alternatywy || []).map((a) => a.id === alt.id ? { ...a, included: !a.included } : a); updateItem(item.id, { alternatywy: newAlts }); }} sx={{ p: 0, width: 20, height: 20, color: alt.included ? theme.palette.success.main : theme.palette.text.secondary, opacity: alt.included ? 0.7 : 0.3, '&:hover': { opacity: 1 } }}>
                                            {alt.included ? <IncludedIcon sx={{ fontSize: 13 }} /> : <ExcludedIcon sx={{ fontSize: 13 }} />}
                                          </IconButton>
                                        </Tooltip>
                                        <Chip label="ALT" size="small" sx={{ fontSize: '0.5rem', height: 16, fontWeight: 700, backgroundColor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }} />
                                        <Typography variant="body2" sx={{ fontSize: '0.7rem', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alt.nazwa}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                          {alt.cena < item.cena && <ArrowDownPriceIcon sx={{ fontSize: 12, color: theme.palette.success.main }} />}
                                          {alt.cena > item.cena && <ArrowUpIcon sx={{ fontSize: 12, color: theme.palette.warning.main }} />}
                                          {alt.cena === item.cena && <DragHandleIcon sx={{ fontSize: 12, color: theme.palette.text.secondary, opacity: 0.5 }} />}
                                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.75rem', color: alt.cena < item.cena ? theme.palette.success.main : alt.cena > item.cena ? theme.palette.warning.main : theme.palette.text.primary }}>{formatCurrencyOrDash(alt.cena)}</Typography>
                                        </Box>
                                        <Box>
                                          {(alt.linki || []).length > 0 && (
                                            <Tooltip title={<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 0.5 }}>{alt.linki.map((link, li) => (<Typography key={li} variant="caption" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => window.open(link.url, '_blank')}>🔗 {link.nazwa}</Typography>))}</Box>} arrow slotProps={{ tooltip: { sx: { backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, px: 1.5, py: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' } }, arrow: { sx: { color: theme.palette.background.paper } } }}>
                                              <Chip label={`${alt.linki.length} link${alt.linki.length > 1 ? 'i' : ''}`} size="small" sx={{ fontSize: '0.55rem', height: 18, cursor: 'default', backgroundColor: alpha(theme.palette.primary.main, 0.08) }} />
                                            </Tooltip>
                                          )}
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'flex-end' }}>
                                          <Tooltip title="Ustaw jako MAIN"><IconButton size="small" onClick={() => { const oldMain: AlternativeItem = { id: generateId(), included: true, nazwa: 'Poprzednia opcja', cena: item.cena, linki: item.linki || [], uwagi: '' }; const newAlts = [oldMain, ...(item.alternatywy || []).filter((a) => a.id !== alt.id)]; updateItem(item.id, { cena: alt.cena, linki: alt.linki || [], alternatywy: newAlts }); }} sx={{ opacity: 0.4, '&:hover': { opacity: 1, color: theme.palette.success.main }, width: 20, height: 20 }}><AltIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                                          <Tooltip title="Linki"><IconButton size="small" onClick={() => setLinksAlt({ itemId: item.id, alt })} sx={{ opacity: 0.5, '&:hover': { opacity: 1 }, width: 20, height: 20 }}><LinkIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                                          <Tooltip title="Edytuj"><IconButton size="small" onClick={() => setEditingAlt({ itemId: item.id, alt })} sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.primary.main }, width: 20, height: 20 }}><EditIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                                          <Tooltip title="Usuń"><IconButton size="small" onClick={() => { const newAlts = (item.alternatywy || []).filter((a) => a.id !== alt.id); updateItem(item.id, { alternatywy: newAlts }); }} sx={{ opacity: 0.4, '&:hover': { opacity: 1, color: theme.palette.error.main }, width: 20, height: 20 }}><DeleteIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                                        </Box>
                                      </Box>
                                    ))}
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => openAddDialog(group.name)} sx={{ fontSize: '0.75rem', opacity: 0.7, '&:hover': { opacity: 1 } }}>Dodaj do "{group.name}"</Button>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Typography variant="caption" color="text.secondary">Opłacone: <strong>{formatCurrencyOrDash(group.paidCost)}</strong></Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Razem: {formatCurrencyOrDash(group.totalCost)}</Typography>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingItem(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingItem ? `Edytuj — ${config.title}` : `Dodaj — ${config.title}`}
          <IconButton size="small" onClick={() => { setDialogOpen(false); setEditingItem(null); }}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {!presetGroupName && (
            <Autocomplete freeSolo options={allGroupNames} value={formData[config.groupField] as string || ''} onInputChange={(_, v) => setFormData(p => ({ ...p, [config.groupField]: v }))}
              renderInput={(params) => <TextField {...params} label="Grupa" helperText="Wybierz lub wpisz nową" />} />
          )}
          {config.addFields.map(f => (
            <TextField key={f.field} label={f.label} value={formData[f.field] || ''} onChange={(e) => setFormData(p => ({ ...p, [f.field]: e.target.value }))} fullWidth required={f.required} />
          ))}
          {!editingItem && (
            <TextField label="Cena (PLN)" type="number" value={formData.cena || ''} onChange={(e) => setFormData(p => ({ ...p, cena: e.target.value }))} fullWidth />
          )}
          <TextField label="Uwagi" value={formData.uwagi || ''} onChange={(e) => setFormData(p => ({ ...p, uwagi: e.target.value }))} fullWidth multiline rows={2} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
          <Button onClick={() => { setDialogOpen(false); setEditingItem(null); }}>Zamknij</Button>
          <Button variant="contained" onClick={handleSubmit}>{editingItem ? 'Zapisz' : 'Dodaj'}</Button>
        </DialogActions>
      </Dialog>

      {/* New group dialog */}
      <Dialog open={groupDialogOpen} onClose={() => setGroupDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>Nowa grupa<IconButton size="small" onClick={() => setGroupDialogOpen(false)}><CloseIcon sx={{ fontSize: 16 }} /></IconButton></DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField label="Nazwa grupy" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} fullWidth autoFocus onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGroup(); } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
          <Button onClick={() => setGroupDialogOpen(false)}>Zamknij</Button>
          <Button variant="contained" onClick={handleAddGroup} disabled={!newGroupName.trim()}>Utwórz</Button>
        </DialogActions>
      </Dialog>

      {/* Links modals */}
      <LinksModal open={!!linksItem} onClose={() => setLinksItem(null)} links={linksItem?.linki || []} onSave={(linki) => { if (linksItem) updateItem(linksItem.id, { linki }); setLinksItem(null); }} itemName={linksItem?.[config.nameField] as string} />
      <LinksModal open={!!linksAlt} onClose={() => setLinksAlt(null)} links={linksAlt?.alt.linki || []} onSave={(linki) => { if (linksAlt) { const item = items.find(i => i.id === linksAlt.itemId); if (item) { const newAlts = (item.alternatywy || []).map(a => a.id === linksAlt.alt.id ? { ...a, linki } : a); updateItem(linksAlt.itemId, { alternatywy: newAlts }); } } setLinksAlt(null); }} itemName={linksAlt ? `${linksAlt.alt.nazwa} (alt)` : ''} />

      {/* Alternatives modal */}
      <AlternativesModal open={!!altItem} onClose={() => setAltItem(null)} alternatives={altItem?.alternatywy || []} onSave={(alternatywy) => { if (altItem) updateItem(altItem.id, { alternatywy }); setAltItem(null); }} itemName={altItem?.[config.nameField] as string} baseCena={altItem?.cena} />

      {/* Edit MAIN price */}
      <Dialog open={!!editingMainPrice} onClose={() => setEditingMainPrice(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Edytuj cenę główną</DialogTitle>
        <DialogContent sx={{ pt: 1 }}><TextField label="Cena (PLN)" type="number" defaultValue={editingMainPrice?.cena || 0} onChange={(e) => { if (editingMainPrice) setEditingMainPrice({ ...editingMainPrice, cena: Number(e.target.value) }); }} fullWidth size="small" /></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}><Button onClick={() => setEditingMainPrice(null)}>Zamknij</Button><Button variant="contained" onClick={() => { if (editingMainPrice) { updateItem(editingMainPrice.id, { cena: editingMainPrice.cena }); setEditingMainPrice(null); } }}>Zapisz</Button></DialogActions>
      </Dialog>

      {/* Edit ALT */}
      <Dialog open={!!editingAlt} onClose={() => setEditingAlt(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Edytuj alternatywę</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Nazwa" defaultValue={editingAlt?.alt.nazwa || ''} onChange={(e) => { if (editingAlt) setEditingAlt({ ...editingAlt, alt: { ...editingAlt.alt, nazwa: e.target.value } }); }} fullWidth size="small" />
          <TextField label="Cena (PLN)" type="number" defaultValue={editingAlt?.alt.cena || 0} onChange={(e) => { if (editingAlt) setEditingAlt({ ...editingAlt, alt: { ...editingAlt.alt, cena: Number(e.target.value) } }); }} fullWidth size="small" />
          <TextField label="Uwagi" defaultValue={editingAlt?.alt.uwagi || ''} onChange={(e) => { if (editingAlt) setEditingAlt({ ...editingAlt, alt: { ...editingAlt.alt, uwagi: e.target.value } }); }} fullWidth size="small" multiline rows={2} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}><Button onClick={() => setEditingAlt(null)}>Zamknij</Button><Button variant="contained" onClick={() => { if (editingAlt) { const item = items.find(i => i.id === editingAlt.itemId); if (item) { const newAlts = (item.alternatywy || []).map(a => a.id === editingAlt.alt.id ? { ...a, nazwa: editingAlt.alt.nazwa, cena: editingAlt.alt.cena, uwagi: editingAlt.alt.uwagi } : a); updateItem(editingAlt.itemId, { alternatywy: newAlts }); } setEditingAlt(null); } }}>Zapisz</Button></DialogActions>
      </Dialog>

      {/* Payment choice */}
      <Dialog open={!!payChoiceItem} onClose={() => setPayChoiceItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Którą opcję opłaciłeś?</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box onClick={() => { if (payChoiceItem) { updateItem(payChoiceItem.id, { status: 'Opłacone', wybranaAltId: null }); setPayChoiceItem(null); } }} sx={{ p: 1.5, borderRadius: 2, cursor: 'pointer', border: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:hover': { borderColor: theme.palette.success.main, backgroundColor: alpha(theme.palette.success.main, 0.04) } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Chip label="MAIN" size="small" sx={{ fontSize: '0.5rem', height: 16, fontWeight: 700, backgroundColor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }} /><Typography variant="body2">Cena główna</Typography></Box>
              <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{formatCurrency(payChoiceItem?.cena || 0)}</Typography>
            </Box>
            {(payChoiceItem?.alternatywy || []).filter(a => a.included).map((alt) => (
              <Box key={alt.id} onClick={() => { if (payChoiceItem) { const oldMain: AlternativeItem = { id: payChoiceItem.id + '_old', included: true, nazwa: 'Poprzednia cena', cena: payChoiceItem.cena, linki: payChoiceItem.linki || [], uwagi: '' }; const newAlts = [oldMain, ...(payChoiceItem.alternatywy || []).filter(a => a.id !== alt.id)]; updateItem(payChoiceItem.id, { status: 'Opłacone', cena: alt.cena, linki: alt.linki || [], alternatywy: newAlts, wybranaAltId: null }); setPayChoiceItem(null); } }} sx={{ p: 1.5, borderRadius: 2, cursor: 'pointer', border: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:hover': { borderColor: theme.palette.info.main, backgroundColor: alpha(theme.palette.info.main, 0.04) } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Chip label="ALT" size="small" sx={{ fontSize: '0.5rem', height: 16, fontWeight: 700, backgroundColor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }} /><Typography variant="body2">{alt.nazwa}</Typography></Box>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{formatCurrency(alt.cena)}</Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setPayChoiceItem(null)}>Anuluj</Button></DialogActions>
      </Dialog>

      {/* Delete MAIN choice */}
      <Dialog open={!!deleteChoiceItem} onClose={() => setDeleteChoiceItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Wybierz nowy MAIN</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, backgroundColor: alpha(theme.palette.error.main, 0.04), border: `1px solid ${alpha(theme.palette.error.main, 0.15)}` }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Aktualny MAIN (do usunięcia):</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Typography variant="body2" sx={{ fontWeight: 500 }}>Cena główna</Typography><Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', textDecoration: 'line-through', color: theme.palette.error.main }}>{formatCurrency(deleteChoiceItem?.cena || 0)}</Typography></Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Wybierz nową cenę główną:</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {(deleteChoiceItem?.alternatywy || []).map((alt) => (
              <Box key={alt.id} onClick={() => { if (deleteChoiceItem) { const newAlts = (deleteChoiceItem.alternatywy || []).filter(a => a.id !== alt.id); updateItem(deleteChoiceItem.id, { cena: alt.cena, linki: alt.linki || [], alternatywy: newAlts }); setDeleteChoiceItem(null); } }} sx={{ p: 1.5, borderRadius: 2, cursor: 'pointer', border: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:hover': { borderColor: theme.palette.success.main, backgroundColor: alpha(theme.palette.success.main, 0.04) } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Chip label="→ MAIN" size="small" sx={{ fontSize: '0.5rem', height: 16, fontWeight: 700, backgroundColor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }} /><Typography variant="body2">{alt.nazwa}</Typography></Box>
                <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{formatCurrency(alt.cena)}</Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setDeleteChoiceItem(null)}>Anuluj</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
