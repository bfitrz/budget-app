import { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Chip,
  Grid,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useForm, Controller } from 'react-hook-form';
import { useBudgetStore } from '@/store';
import { ScheduleEntry, MilestoneEntry } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import { CurrencyField, DateField } from '@/components';

interface ScheduleFormData {
  data: string;
  opis: string;
  kwota: number;
}

interface MilestoneFormData {
  data: string;
  opis: string;
}

export function HarmonogramView() {
  const theme = useTheme();
  const harmonogram = useBudgetStore((s) => s.harmonogram);
  const addScheduleEntry = useBudgetStore((s) => s.addScheduleEntry);
  const deleteScheduleEntry = useBudgetStore((s) => s.deleteScheduleEntry);
  const updateScheduleEntry = useBudgetStore((s) => s.updateScheduleEntry);
  const toggleScheduleRealized = useBudgetStore((s) => s.toggleScheduleRealized);
  const getCashFlowProjection = useBudgetStore((s) => s.getCashFlowProjection);
  const getDashboardSummary = useBudgetStore((s) => s.getDashboardSummary);
  const milestones = useBudgetStore((s) => s.milestones);
  const addMilestone = useBudgetStore((s) => s.addMilestone);
  const deleteMilestone = useBudgetStore((s) => s.deleteMilestone);

  const summary = getDashboardSummary();
  const cashFlow = getCashFlowProjection();
  const sortedEntries = [...harmonogram].sort((a, b) => a.data.localeCompare(b.data));

  // Suma planowanych wpływów (niezrealizowanych)
  const planowaneWplywy = harmonogram
    .filter((e) => !e.zrealizowane)
    .reduce((s, e) => s + e.kwota, 0);

  // Prognozowane saldo po wszystkich wpływach
  const prognozowaneSaldo = summary.aktualnieSrodki + planowaneWplywy;

  // Czy po wpływach wystarczy na pozostałe koszty?
  const pokrycie = prognozowaneSaldo - summary.pozostaloDoZaplaty;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const { control, handleSubmit, reset, setValue } = useForm<ScheduleFormData>({
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      opis: '',
      kwota: 0,
    },
  });
  const { control: msControl, handleSubmit: msHandleSubmit, reset: msReset } = useForm<MilestoneFormData>({
    defaultValues: { data: new Date().toISOString().split('T')[0], opis: '' },
  });

  const onMilestoneSubmit = (data: MilestoneFormData) => {
    addMilestone({ data: data.data, opis: data.opis });
    msReset();
    setMilestoneDialogOpen(false);
  };

  // Calculate saldo at a given date for milestones
  const getSaldoAtDate = (date: string): number => {
    let saldo = summary.aktualnieSrodki;
    const futureEntries = [...harmonogram]
      .filter((e) => !e.zrealizowane)
      .sort((a, b) => a.data.localeCompare(b.data));
    for (const entry of futureEntries) {
      if (entry.data <= date) saldo += entry.kwota;
      else break;
    }
    return saldo;
  };

  const onSubmit = (data: ScheduleFormData) => {
    if (editingEntry) {
      updateScheduleEntry(editingEntry.id, {
        data: data.data,
        opis: data.opis,
        kwota: Number(data.kwota),
      });
    } else {
      addScheduleEntry({
        data: data.data,
        opis: data.opis,
        kwota: Number(data.kwota),
        zrealizowane: false,
      });
    }
    reset();
    setEditingEntry(null);
    setDialogOpen(false);
  };

  const openAddDialog = () => {
    setEditingEntry(null);
    reset({ data: new Date().toISOString().split('T')[0], opis: '', kwota: 0 });
    setDialogOpen(true);
  };

  const openEditDialog = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setValue('data', entry.data);
    setValue('opis', entry.opis);
    setValue('kwota', entry.kwota);
    setDialogOpen(true);
  };

  const formatChartDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return `${d.getDate()}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4">Harmonogram wpływów</Typography>
            <Typography variant="body2" color="text.secondary">
              Zaplanuj przyszłe wpływy (wypłaty, przelewy, zwroty) i zobacz na wykresie kiedy zgromadzisz wystarczająco środków na pokrycie kosztów.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => { msReset({ data: new Date().toISOString().split('T')[0], opis: '' }); setMilestoneDialogOpen(true); }}
              sx={{ fontSize: '0.75rem', px: 1.5, py: 0.5 }}
            >
              Milestone
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={openAddDialog}
              sx={{ fontSize: '0.75rem', px: 1.5, py: 0.5 }}
            >
              + Wpływ
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WalletIcon sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.6 }} />
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                  Aktualne środki
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatCurrency(summary.aktualnieSrodki)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16 }} />
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                  Planowane wpływy
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                {formatCurrency(planowaneWplywy)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WarningIcon sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.6 }} />
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                  Pozostało do zapłaty
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                {formatCurrency(summary.pozostaloDoZaplaty)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckIcon sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.6 }} />
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                  Bilans po wpływach
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: pokrycie >= 0 ? theme.palette.success.main : theme.palette.error.main,
                }}
              >
                {formatCurrency(pokrycie)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cash flow chart */}
      {cashFlow.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Symulacja środków w czasie
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Wykres pokazuje prognozę dostępnych środków w czasie. Kiedy niebieska linia przekroczy pomarańczową — masz wystarczająco na pokrycie wszystkich kosztów.
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={(() => {
                // Merge cashFlow with milestone dates for ReferenceLine to work
                const baseData = cashFlow.map(p => ({ ...p, cel: summary.pozostaloDoZaplaty }));
                const existingDates = new Set(baseData.map(p => p.data));
                // Add milestone dates that don't exist in cashFlow
                for (const ms of milestones) {
                  if (!existingDates.has(ms.data)) {
                    const saldo = getSaldoAtDate(ms.data);
                    baseData.push({ data: ms.data, label: ms.opis, saldo, cel: summary.pozostaloDoZaplaty });
                  }
                }
                // Sort by date
                baseData.sort((a, b) => a.data.localeCompare(b.data));
                return baseData;
              })()} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <defs>
                  <linearGradient id="saldoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme.palette.divider}
                  vertical={false}
                />
                <XAxis
                  dataKey="data"
                  tickFormatter={formatChartDate}
                  stroke={theme.palette.text.secondary}
                  fontSize={12}
                />
                <YAxis
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                  stroke={theme.palette.text.secondary}
                  fontSize={12}
                />
                <RechartsTooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'saldo' ? 'Dostępne środki' : 'Cel (pozostało do zapłaty)',
                  ]}
                  labelFormatter={(label: string) => formatDate(label)}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8,
                  }}
                  itemStyle={{ color: theme.palette.text.primary }}
                  labelStyle={{ color: theme.palette.text.primary }}
                />
                {/* Zero line */}
                <ReferenceLine
                  y={0}
                  stroke={theme.palette.error.main}
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
                {/* Target line: remaining costs */}
                <Area
                  type="stepAfter"
                  dataKey="cel"
                  stroke={theme.palette.warning.main}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  fill="none"
                  dot={false}
                  activeDot={false}
                  name="cel"
                />
                {/* Actual/projected funds */}
                <Area
                  type="stepAfter"
                  dataKey="saldo"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2.5}
                  fill="url(#saldoGradient)"
                  dot={(props: { cx: number; cy: number; index: number; payload: { label: string } }) => {
                    const { cx, cy, index, payload } = props;
                    const isFirst = index === 0;
                    return (
                      <circle
                        key={index}
                        cx={cx}
                        cy={cy}
                        r={isFirst ? 7 : 5}
                        fill={isFirst ? theme.palette.success.main : theme.palette.primary.main}
                        stroke={theme.palette.background.paper}
                        strokeWidth={2}
                      />
                    );
                  }}
                  activeDot={{ r: 7 }}
                  name="saldo"
                />
                {/* Milestones */}
                {milestones.map((ms) => {
                  const saldoAtMs = getSaldoAtDate(ms.data);
                  const bilansAtMs = saldoAtMs - summary.pozostaloDoZaplaty;
                  return (
                    <ReferenceLine
                      key={ms.id}
                      x={ms.data}
                      stroke={theme.palette.error.main}
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      label={{
                        value: `📌 ${ms.opis} (${bilansAtMs >= 0 ? '+' : ''}${(bilansAtMs / 1000).toFixed(1)}k)`,
                        position: 'top',
                        fill: bilansAtMs >= 0 ? theme.palette.success.main : theme.palette.error.main,
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: theme.palette.success.main }} />
                <Typography variant="caption">Aktualne środki: <strong>{formatCurrency(summary.aktualnieSrodki)}</strong></Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 16, height: 3, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
                <Typography variant="caption">Prognozowane środki po wpływach</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 16, height: 0, borderTop: `2px dashed ${theme.palette.warning.main}` }} />
                <Typography variant="caption">Cel: <strong>{formatCurrency(summary.pozostaloDoZaplaty)}</strong> (tyle musisz zdobyć)</Typography>
              </Box>
              {milestones.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 16, height: 0, borderTop: `2px dashed ${theme.palette.error.main}` }} />
                  <Typography variant="caption">📌 Milestony ({milestones.length})</Typography>
                </Box>
              )}
            </Box>

            {/* Milestones info */}
            {milestones.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {milestones.map((ms) => {
                  const prognozowaneSrodkiNaDate = getSaldoAtDate(ms.data);
                  const wplywDoMomentu = prognozowaneSrodkiNaDate - summary.aktualnieSrodki;
                  const brakuje = summary.pozostaloDoZaplaty - prognozowaneSrodkiNaDate;
                  return (
                    <Tooltip key={ms.id} title={
                      <Box sx={{ p: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>📌 {ms.opis} — {formatDate(ms.data)}</Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>Aktualnie na stanie: {formatCurrency(summary.aktualnieSrodki)}</Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>Przewidywane wpływy do tej daty: +{formatCurrency(wplywDoMomentu)}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>Prognoza środków: {formatCurrency(prognozowaneSrodkiNaDate)}</Typography>
                        <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`, mt: 0.5, pt: 0.5 }}>
                          <Typography variant="caption" sx={{ display: 'block' }}>Łączny koszt do pokrycia: {formatCurrency(summary.pozostaloDoZaplaty)}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: brakuje <= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                            {brakuje <= 0 ? `Nadwyżka: +${formatCurrency(Math.abs(brakuje))}` : `Brakuje do celu: -${formatCurrency(brakuje)}`}
                          </Typography>
                        </Box>
                      </Box>
                    } arrow slotProps={{ tooltip: { sx: { backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 1.5, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: 320 } }, arrow: { sx: { color: theme.palette.background.paper } } }}>
                      <Chip
                        label={`📌 ${ms.opis} (${formatDate(ms.data)})`}
                        size="small"
                        onDelete={() => deleteMilestone(ms.id)}
                        sx={{ fontSize: '0.7rem', backgroundColor: alpha(theme.palette.error.main, 0.08), color: theme.palette.error.main, fontWeight: 500 }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            )}

            {pokrycie < 0 && cashFlow.length > 1 && (
              <Box sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.error.main, 0.08),
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
                <WarningIcon sx={{ color: theme.palette.error.main, fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
                  Nawet po zaplanowanych wpływach brakuje <strong>{formatCurrency(Math.abs(pokrycie))}</strong> na pokrycie wszystkich kosztów.
                </Typography>
              </Box>
            )}
            {pokrycie >= 0 && cashFlow.length > 1 && (
              <Box sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.success.main, 0.08),
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
                <CheckIcon sx={{ color: theme.palette.success.main, fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: theme.palette.success.main }}>
                  Po zaplanowanych wpływach wystarczy na pokrycie kosztów (nadwyżka: <strong>{formatCurrency(pokrycie)}</strong>).
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schedule table */}
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 50 }}>Zreal.</TableCell>
                <TableCell>Data wpływu</TableCell>
                <TableCell>Opis</TableCell>
                <TableCell align="right">Kwota</TableCell>
                <TableCell sx={{ width: 90 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4 }} />
                      <Typography color="text.secondary">
                        Brak zaplanowanych wpływów. Kliknij "Zaplanuj wpływ" aby dodać.
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Np. przewidywany przelew za miesiąc, zwrot podatku, pożyczka rodzinna...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                sortedEntries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    sx={{ opacity: entry.zrealizowane ? 0.5 : 1 }}
                  >
                    <TableCell>
                      <Tooltip title={entry.zrealizowane ? 'Oznacz jako niezrealizowane' : 'Oznacz jako zrealizowane'}>
                        <IconButton
                          size="small"
                          onClick={() => toggleScheduleRealized(entry.id)}
                          sx={{
                            color: entry.zrealizowane
                              ? theme.palette.success.main
                              : theme.palette.text.secondary,
                          }}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(entry.data)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          textDecoration: entry.zrealizowane ? 'line-through' : 'none',
                        }}
                      >
                        {entry.opis}
                      </Typography>
                      {entry.zrealizowane && (
                        <Chip label="Zrealizowane" size="small" color="success" variant="outlined" sx={{ ml: 1, fontSize: '0.65rem', height: 20 }} />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontFamily: 'monospace',
                          color: theme.palette.success.main,
                        }}
                      >
                        +{formatCurrency(entry.kwota)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edytuj">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(entry)}
                            sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.primary.main } }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Usuń">
                          <IconButton
                            size="small"
                            onClick={() => deleteScheduleEntry(entry.id)}
                            sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.error.main } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add dialog */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingEntry(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingEntry ? 'Edytuj planowany wpływ' : 'Zaplanuj wpływ'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1, maxHeight: '70vh' }}>
            <Typography variant="body2" color="text.secondary">
              Dodaj przewidywany wpływ — np. przelew z oszczędności, wypłata, zwrot podatku.
            </Typography>
            <Controller
              name="data"
              control={control}
              rules={{ required: 'Wymagane' }}
              render={({ field, fieldState }) => (
                <DateField
                  {...field}
                  label="Planowana data wpływu"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="opis"
              control={control}
              rules={{ required: 'Wymagane' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Opis wpływu"
                  placeholder="np. Przelew z konta oszczędnościowego"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="kwota"
              control={control}
              rules={{ required: 'Wymagane', min: { value: 1, message: 'Min 1 zł' } }}
              render={({ field, fieldState }) => (
                <CurrencyField
                  {...field}
                  label="Kwota wpływu"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => { setDialogOpen(false); setEditingEntry(null); }}>Anuluj</Button>
            <Button type="submit" variant="contained">
              {editingEntry ? 'Zapisz' : 'Zaplanuj'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Milestone dialog */}
      <Dialog open={milestoneDialogOpen} onClose={() => setMilestoneDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>📌 Dodaj milestone</DialogTitle>
        <form onSubmit={msHandleSubmit(onMilestoneSubmit)}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2, maxHeight: '70vh' }}>
            <Typography variant="body2" color="text.secondary">
              Milestone to deadline lub ważna data — pojawi się jako pionowa linia na wykresie z informacją o prognozowanym saldzie.
            </Typography>
            <Controller
              name="data"
              control={msControl}
              rules={{ required: 'Wymagane' }}
              render={({ field, fieldState }) => (
                <DateField
                  {...field}
                  label="Data milestone"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="opis"
              control={msControl}
              rules={{ required: 'Wymagane' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Opis"
                  placeholder="np. Termin oddania kluczy"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setMilestoneDialogOpen(false)}>Anuluj</Button>
            <Button type="submit" variant="contained">Dodaj</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
