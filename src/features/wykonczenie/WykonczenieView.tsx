import { useState, useMemo } from 'react';
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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Build as BuildIcon,
  Edit as EditIcon,
  SwapHoriz as AltIcon,
  ExpandMore as ExpandMoreIcon,
  CreateNewFolder as NewGroupIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useBudgetStore } from '@/store';
import { WykonczenieItem, PaymentStatus } from '@/types';
import { formatCurrency } from '@/utils';
import { LinksModal, LinksDisplay, AlternativesModal } from '@/components';

interface WykonczenieFormData {
  etap: string;
  opis: string;
  kwota: number;
  status: PaymentStatus;
  uwagi: string;
}

interface GroupSummary {
  name: string;
  items: WykonczenieItem[];
  totalCost: number;
  paidCost: number;
  itemCount: number;
  paidCount: number;
}

export function WykonczenieView() {
  const theme = useTheme();
  const wykonczenie = useBudgetStore((s) => s.wykonczenie);
  const updateWykonczenieItem = useBudgetStore((s) => s.updateWykonczenieItem);
  const addWykonczenieItem = useBudgetStore((s) => s.addWykonczenieItem);
  const deleteWykonczenieItem = useBudgetStore((s) => s.deleteWykonczenieItem);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [presetGroupName, setPresetGroupName] = useState<string | null>(null);
  const [linksItem, setLinksItem] = useState<any>(null);
  const [altItem, setAltItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<WykonczenieItem | null>(null);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [customGroups, setCustomGroups] = useState<string[]>([]);

  const { control, handleSubmit, reset, setValue} = useForm<WykonczenieFormData>({
    defaultValues: { etap: '', opis: '', kwota: 0, status: 'Do zapłaty', uwagi: '' },
  });

  const groups: GroupSummary[] = useMemo(() => {
    const groupMap = new Map<string, WykonczenieItem[]>();
    for (const g of customGroups) {
      if (!groupMap.has(g)) groupMap.set(g, []);
    }
    for (const item of wykonczenie) {
      const key = item.etap || 'Bez grupy';
      const existing = groupMap.get(key) || [];
      existing.push(item);
      groupMap.set(key, existing);
    }
    return Array.from(groupMap.entries()).map(([name, items]) => {
      const includedItems = items.filter((i) => i.included);
      return {
        name,
        items,
        totalCost: includedItems.reduce((s, i) => s + i.kwota, 0),
        paidCost: includedItems.filter((i) => i.status === 'Opłacone').reduce((s, i) => s + i.kwota, 0),
        itemCount: items.length,
        paidCount: includedItems.filter((i) => i.status === 'Opłacone').length,
      };
    });
  }, [wykonczenie, customGroups]);

  const allGroupNames = useMemo(() => {
    const names = new Set<string>();
    for (const item of wykonczenie) { if (item.etap) names.add(item.etap); }
    for (const g of customGroups) names.add(g);
    return Array.from(names).sort();
  }, [wykonczenie, customGroups]);

  const onSubmit = (data: WykonczenieFormData) => {
    if (editingItem) {
      updateWykonczenieItem(editingItem.id, { etap: data.etap, opis: data.opis, kwota: Number(data.kwota), uwagi: data.uwagi });
    } else {
      addWykonczenieItem({ ...data, included: true, kwota: Number(data.kwota), linki: [], alternatywy: [], wybranaAltId: null });
    }
    reset();
    setEditingItem(null);
    setDialogOpen(false);
  };

  const openAddDialog = (presetGroup?: string) => {
    setPresetGroupName(presetGroup || null);
    setEditingItem(null);
    reset({ etap: presetGroup || '', opis: '', kwota: 0, status: 'Do zapłaty', uwagi: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (item: WykonczenieItem) => {
    setEditingItem(item);
    setPresetGroupName(null);
    setValue('etap', item.etap);
    setValue('opis', item.opis);
    setValue('kwota', item.kwota);
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

  const totalIncluded = wykonczenie.filter((i) => i.included).reduce((sum, i) => sum + i.kwota, 0);
  const paidCount = wykonczenie.filter((i) => i.included && i.status === 'Opłacone').length;
  const totalCount = wykonczenie.filter((i) => i.included).length;

  return (
    <Box>
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h2">Prace</Typography>
            <Typography variant="body1" color="text.secondary">
              Etapy prac wykończeniowych i rozliczenia
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<NewGroupIcon />} onClick={() => setGroupDialogOpen(true)} size="small">
              Nowa grupa
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openAddDialog()}>
              Dodaj pozycję
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 180 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="overline" color="text.secondary">Suma</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatCurrency(totalIncluded)}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 180 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="overline" color="text.secondary">Opłacone</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{paidCount} / {totalCount}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 180 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="overline" color="text.secondary">Grupy</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{groups.length}</Typography>
          </CardContent>
        </Card>
      </Box>

      {wykonczenie.length === 0 && groups.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <BuildIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
            <Typography color="text.secondary">Brak pozycji. Dodaj lub zaimportuj dane.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {groups.map((group) => (
            <Accordion key={group.name} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 52, px: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Etap {group.name}</Typography>
                    <Chip label={`${group.itemCount} poz.`} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={`${group.paidCount}/${group.items.filter((i) => i.included).length} opłacone`}
                      size="small"
                      sx={{ fontSize: '0.65rem', height: 20, backgroundColor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, fontWeight: 600 }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', minWidth: 90, textAlign: 'right' }}>
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
                        <TableCell padding="checkbox" sx={{ width: 44 }}>Uwzgl.</TableCell>
                        <TableCell>Opis</TableCell>
                        <TableCell align="right">Kwota</TableCell>
                        <TableCell sx={{ width: 110 }}>Status</TableCell>
                        <TableCell>Uwagi</TableCell>
                        <TableCell sx={{ width: 100 }}>Linki</TableCell>
                        <TableCell sx={{ width: 80 }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ py: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">Brak pozycji w tej grupie.</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        group.items.map((item) => (
                          <TableRow key={item.id} sx={{ opacity: item.included ? 1 : 0.4 }}>
                            <TableCell padding="checkbox">
                              <Checkbox checked={item.included} onChange={() => updateWykonczenieItem(item.id, { included: !item.included })} size="small" />
                            </TableCell>
                            <TableCell><Typography variant="body2">{item.opis}</Typography></TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{formatCurrency(item.kwota)}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.status}
                                size="small"
                                sx={{
                                  fontWeight: 600, fontSize: '0.65rem', cursor: 'pointer',
                                  backgroundColor: item.status === 'Opłacone' ? alpha(theme.palette.success.main, 0.12) : alpha(theme.palette.warning.main, 0.12),
                                  color: item.status === 'Opłacone' ? theme.palette.success.main : theme.palette.warning.main,
                                  border: 'none',
                                }}
                                onClick={() => updateWykonczenieItem(item.id, { status: item.status === 'Opłacone' ? 'Do zapłaty' : 'Opłacone' })}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField size="small" value={item.uwagi} onChange={(e) => updateWykonczenieItem(item.id, { uwagi: e.target.value })} placeholder="..." variant="standard" sx={{ '& .MuiInput-root': { fontSize: '0.8rem' } }} />
                            </TableCell>
                            <TableCell>
                              <LinksDisplay links={item.linki || []} onManage={() => setLinksItem(item)} />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="Edytuj"><IconButton size="small" onClick={() => openEditDialog(item)} sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.primary.main } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                <Tooltip title="Alternatywy"><IconButton size="small" onClick={() => setAltItem(item)} sx={{ opacity: (item.alternatywy?.length || 0) > 0 ? 0.8 : 0.4, "&:hover": { opacity: 1, color: theme.palette.info.main }, color: (item.alternatywy?.length || 0) > 0 ? theme.palette.info.main : undefined }}><AltIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                <Tooltip title="Usuń"><IconButton size="small" onClick={() => deleteWykonczenieItem(item.id)} sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.error.main } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => openAddDialog(group.name)} sx={{ fontSize: '0.75rem', opacity: 0.7, '&:hover': { opacity: 1 } }}>
                    Dodaj do "{group.name}"
                  </Button>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Typography variant="caption" color="text.secondary">Opłacone: <strong>{formatCurrency(group.paidCost)}</strong></Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Razem: {formatCurrency(group.totalCost)}</Typography>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingItem(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{editingItem ? 'Edytuj pozycję — Prace' : 'Dodaj pozycję — Prace'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {!presetGroupName && (
              <Controller
                name="etap"
                control={control}
                rules={{ required: 'Wymagane' }}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    freeSolo
                    options={allGroupNames}
                    value={field.value}
                    onInputChange={(_, value) => field.onChange(value)}
                    renderInput={(params) => (
                      <TextField {...params} label="Grupa (etap)" error={!!fieldState.error} helperText={fieldState.error?.message || 'Wybierz istniejącą lub wpisz nową'} />
                    )}
                  />
                )}
              />
            )}
            <Controller name="opis" control={control} rules={{ required: 'Wymagane' }}
              render={({ field, fieldState }) => <TextField {...field} label="Opis" error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth />}
            />
            <Controller name="kwota" control={control} rules={{ required: 'Wymagane', min: { value: 0, message: 'Min 0' } }}
              render={({ field, fieldState }) => <TextField {...field} label="Kwota (PLN)" type="number" error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth />}
            />
            <Controller name="uwagi" control={control}
              render={({ field }) => <TextField {...field} label="Uwagi" fullWidth multiline rows={2} />}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => { setDialogOpen(false); setEditingItem(null); }}>Anuluj</Button>
            <Button type="submit" variant="contained">{editingItem ? 'Zapisz' : 'Dodaj'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* New group dialog */}
      <Dialog open={groupDialogOpen} onClose={() => setGroupDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Nowa grupa</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Utwórz nową grupę (np. etap prac).</Typography>
          <TextField label="Nazwa grupy" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="np. Instalacje, Malowanie..." fullWidth autoFocus onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGroup(); } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setGroupDialogOpen(false)}>Anuluj</Button>
          <Button variant="contained" onClick={handleAddGroup} disabled={!newGroupName.trim()}>Utwórz</Button>
        </DialogActions>
      </Dialog>


      {/* Alternatives modal */}
      <AlternativesModal
        open={!!altItem}
        onClose={() => setAltItem(null)}
        alternatives={altItem?.alternatywy || []}
        onSave={(alternatywy) => {
          if (altItem) updateWykonczenieItem(altItem.id, { alternatywy });
          setAltItem(null);
        }}
        itemName={altItem?.opis}
        baseCena={altItem?.kwota}
      />
      {/* Links modal */}
      <LinksModal
        open={!!linksItem}
        onClose={() => setLinksItem(null)}
        links={linksItem?.linki || []}
        onSave={(linki) => {
          if (linksItem) updateWykonczenieItem(linksItem.id, { linki });
          setLinksItem(null);
        }}
        itemName={linksItem?.opis}
      />
    </Box>
  );
}
