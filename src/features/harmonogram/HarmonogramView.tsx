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
import { ScheduleEntry } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import { CurrencyField, DateField } from '@/components';

interface ScheduleFormData {
  data: string;
  opis: string;
  kwota: number;
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
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const { control, handleSubmit, reset, setValue } = useForm<ScheduleFormData>({
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      opis: '',
      kwota: 0,
    },
  });

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
              Planuj przyszłe wpływy i sprawdź, kiedy pokryjesz wszystkie koszty
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
            sx={{ mt: 0.5 }}
          >
            Zaplanuj wpływ
          </Button>
        </Box>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                Aktualne środki
              </Typography>
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
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                Pozostało do zapłaty
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                {formatCurrency(summary.pozostaloDoZaplaty)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                Bilans po wpływach
              </Typography>
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
              Wykres pokazuje prognozę dostępnych środków w czasie, uwzględniając zaplanowane wpływy.
              Linia pomarańczowa = ile jeszcze musisz zapłacić.
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cashFlow} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
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
                  formatter={(value: number) => [formatCurrency(value), 'Dostępne środki']}
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
                {/* Reference line: Remaining costs */}
                <ReferenceLine
                  y={summary.pozostaloDoZaplaty}
                  stroke={theme.palette.warning.main}
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{
                    value: `Pozostało: ${(summary.pozostaloDoZaplaty / 1000).toFixed(0)}k`,
                    position: 'right',
                    fill: theme.palette.warning.main,
                    fontSize: 11,
                  }}
                />
                {/* Zero line */}
                <ReferenceLine
                  y={0}
                  stroke={theme.palette.error.main}
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
                <Area
                  type="stepAfter"
                  dataKey="saldo"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  fill="url(#saldoGradient)"
                  dot={{
                    r: 5,
                    fill: theme.palette.primary.main,
                    stroke: theme.palette.background.paper,
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Interpretation */}
            <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 16, height: 3, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
                <Typography variant="caption">Prognozowane środki</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 16, height: 3, backgroundColor: theme.palette.warning.main, borderRadius: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: theme.palette.warning.main, background: 'none' }} />
                <Typography variant="caption">Pozostało do zapłaty</Typography>
              </Box>
            </Box>

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
                  Nawet po zaplanowanych wpływach brakuje {formatCurrency(Math.abs(pokrycie))} na pokrycie wszystkich kosztów.
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
                  Po zaplanowanych wpływach wystarczy na pokrycie wszystkich kosztów (nadwyżka: {formatCurrency(pokrycie)}).
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
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
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
    </Box>
  );
}
