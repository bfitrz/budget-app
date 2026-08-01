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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useBudgetStore } from '@/store';
import { SaldoEntry } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import { CurrencyField, DateField } from '@/components';

interface SaldoFormData {
  data: string;
  opis: string;
  kwota: number;
}

export function SaldoView() {
  const theme = useTheme();
  const saldo = useBudgetStore((s) => s.saldo);
  const getDashboardSummary = useBudgetStore((s) => s.getDashboardSummary);
  const addSaldoEntry = useBudgetStore((s) => s.addSaldoEntry);
  const deleteSaldoEntry = useBudgetStore((s) => s.deleteSaldoEntry);
  const updateSaldoEntry = useBudgetStore((s) => s.updateSaldoEntry);

  const summary = getDashboardSummary();
  const sumaWplywow = saldo.reduce((sum, entry) => sum + entry.kwota, 0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SaldoEntry | null>(null);

  const { control, handleSubmit, reset, setValue } = useForm<SaldoFormData>({
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      opis: '',
      kwota: 0,
    },
  });

  const openAddDialog = () => {
    setEditingEntry(null);
    reset({ data: '', opis: '', kwota: 0 });
    setDialogOpen(true);
  };

  const openEditDialog = (entry: SaldoEntry) => {
    setEditingEntry(entry);
    setValue('data', entry.data);
    setValue('opis', entry.opis);
    setValue('kwota', entry.kwota);
    setDialogOpen(true);
  };

  const onSubmit = (data: SaldoFormData) => {
    if (editingEntry) {
      updateSaldoEntry(editingEntry.id, {
        data: data.data,
        opis: data.opis,
        kwota: Number(data.kwota),
      });
    } else {
      addSaldoEntry({
        data: data.data,
        opis: data.opis,
        kwota: Number(data.kwota),
      });
    }
    reset();
    setEditingEntry(null);
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h4">Saldo</Typography>
            <Typography variant="body2" color="text.secondary">
              Wpływy i dostępne środki na wykończenie
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
            sx={{ mt: 0.5 }}
          >
            Dodaj wpływ
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #589df6, #3574c4)',
                  color: '#fff',
                }}
              >
                <WalletIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                  Aktualne środki (wpływy minus wydatki)
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: summary.aktualnieSrodki >= 0 ? theme.palette.success.main : theme.palette.error.main,
                  }}
                >
                  {formatCurrency(summary.aktualnieSrodki)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 160 }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
              Suma wpływów
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
              {formatCurrency(sumaWplywow)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 160 }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
              Wydane (opłacone pozycje)
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
              {formatCurrency(summary.zaplacono)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Opis</TableCell>
                <TableCell align="right">Kwota</TableCell>
                <TableCell sx={{ width: 90 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {saldo.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4 }} />
                      <Typography color="text.secondary">
                        Brak wpisów. Dodaj wpływ, aby śledzić dostępne środki.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                saldo.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {entry.data ? formatDate(entry.data) : (
                          <Chip label="Start" size="small" sx={{ fontSize: '0.6rem', height: 18 }} variant="outlined" />
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {entry.opis}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={formatCurrency(entry.kwota)}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontFamily: 'monospace',
                          backgroundColor: entry.kwota >= 0
                            ? alpha(theme.palette.success.main, 0.12)
                            : alpha(theme.palette.error.main, 0.12),
                          color: entry.kwota >= 0
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                        }}
                      />
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
                            onClick={() => deleteSaldoEntry(entry.id)}
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

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingEntry(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingEntry ? 'Edytuj wpis' : 'Dodaj wpływ'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Controller
              name="data"
              control={control}
              render={({ field }) => (
                <DateField
                  {...field}
                  label="Data"
                  helperText="Opcjonalne — bez daty = saldo początkowe"
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
                  label="Opis"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="kwota"
              control={control}
              rules={{ required: 'Wymagane' }}
              render={({ field, fieldState }) => (
                <CurrencyField
                  {...field}
                  label="Kwota"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || 'Wartość ujemna = korekta w dół'}
                  fullWidth
                />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => { setDialogOpen(false); setEditingEntry(null); }}>Anuluj</Button>
            <Button type="submit" variant="contained">
              {editingEntry ? 'Zapisz' : 'Dodaj'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
