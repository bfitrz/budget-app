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
  Paper,
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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Build as BuildIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useBudgetStore } from '@/store';
import { WykonczenieItem, PaymentStatus } from '@/types';
import { formatCurrency } from '@/utils';

interface WykonczenieFormData {
  etap: string;
  opis: string;
  kwota: number;
  status: PaymentStatus;
  uwagi: string;
}

export function WykonczenieView() {
  const theme = useTheme();
  const wykonczenie = useBudgetStore((s) => s.wykonczenie);
  const updateWykonczenieItem = useBudgetStore((s) => s.updateWykonczenieItem);
  const addWykonczenieItem = useBudgetStore((s) => s.addWykonczenieItem);
  const deleteWykonczenieItem = useBudgetStore((s) => s.deleteWykonczenieItem);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WykonczenieItem | null>(null);
  const { control, handleSubmit, reset, setValue } = useForm<WykonczenieFormData>({
    defaultValues: {
      etap: '',
      opis: '',
      kwota: 0,
      status: 'Do zapłaty',
      uwagi: '',
    },
  });

  const handleToggleIncluded = (item: WykonczenieItem) => {
    updateWykonczenieItem(item.id, { included: !item.included });
  };

  const handleUwagiChange = (item: WykonczenieItem, value: string) => {
    updateWykonczenieItem(item.id, { uwagi: value });
  };

  const onSubmit = (data: WykonczenieFormData) => {
    if (editingItem) {
      updateWykonczenieItem(editingItem.id, {
        etap: data.etap,
        opis: data.opis,
        kwota: Number(data.kwota),
        uwagi: data.uwagi,
      });
    } else {
      addWykonczenieItem({
        ...data,
        included: true,
        kwota: Number(data.kwota),
      });
    }
    reset();
    setEditingItem(null);
    setDialogOpen(false);
  };

  const openAddDialog = () => {
    setEditingItem(null);
    reset({ etap: '', opis: '', kwota: 0, status: 'Do zapłaty', uwagi: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (item: WykonczenieItem) => {
    setEditingItem(item);
    setValue('etap', item.etap);
    setValue('opis', item.opis);
    setValue('kwota', item.kwota);
    setValue('status', item.status);
    setValue('uwagi', item.uwagi);
    setDialogOpen(true);
  };

  const totalIncluded = wykonczenie.filter((i) => i.included).reduce((sum, i) => sum + i.kwota, 0);
  const paidCount = wykonczenie.filter((i) => i.included && i.status === 'Opłacone').length;
  const totalCount = wykonczenie.filter((i) => i.included).length;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h4">Wykończenie</Typography>
            <Typography variant="body2" color="text.secondary">
              Etapy prac wykończeniowych i rozliczenia
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
            sx={{ mt: 0.5 }}
          >
            Dodaj pozycję
          </Button>
        </Box>
      </Box>

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
              Opłacone etapy
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {paidCount} / {totalCount}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ width: 50 }}>Uwzgl.</TableCell>
                <TableCell>Etap</TableCell>
                <TableCell>Opis</TableCell>
                <TableCell align="right">Kwota</TableCell>
                <TableCell sx={{ width: 140 }}>Status</TableCell>
                <TableCell>Uwagi</TableCell>
                <TableCell sx={{ width: 90 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wykonczenie.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <BuildIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4 }} />
                      <Typography color="text.secondary">
                        Brak pozycji. Kliknij "Dodaj pozycję" lub zaimportuj dane.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                wykonczenie.map((item) => (
                  <TableRow
                    key={item.id}
                    sx={{ opacity: item.included ? 1 : 0.45 }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={item.included}
                        onChange={() => handleToggleIncluded(item)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`Etap ${item.etap}`}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.opis}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {formatCurrency(item.kwota)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          backgroundColor: item.status === 'Opłacone'
                            ? alpha(theme.palette.success.main, 0.15)
                            : alpha(theme.palette.warning.main, 0.15),
                          color: item.status === 'Opłacone'
                            ? theme.palette.success.main
                            : theme.palette.warning.main,
                          border: 'none',
                        }}
                        onClick={() => {
                          const newStatus: PaymentStatus = item.status === 'Opłacone' ? 'Do zapłaty' : 'Opłacone';
                          updateWykonczenieItem(item.id, { status: newStatus });
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={item.uwagi}
                        onChange={(e) => handleUwagiChange(item, e.target.value)}
                        placeholder="..."
                        variant="standard"
                        sx={{ '& .MuiInput-root': { fontSize: '0.8rem' } }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edytuj">
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(item)}
                            sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.primary.main } }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Usuń">
                          <IconButton
                            size="small"
                            onClick={() => deleteWykonczenieItem(item.id)}
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

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingItem(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>{editingItem ? 'Edytuj pozycję — Wykończenie' : 'Dodaj pozycję — Wykończenie'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Controller
              name="etap"
              control={control}
              rules={{ required: 'Wymagane' }}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Etap" error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth />
              )}
            />
            <Controller
              name="opis"
              control={control}
              rules={{ required: 'Wymagane' }}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Opis" error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth />
              )}
            />
            <Controller
              name="kwota"
              control={control}
              rules={{ required: 'Wymagane', min: { value: 0, message: 'Min 0' } }}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Kwota (PLN)" type="number" error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth />
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
            <Button type="submit" variant="contained">{editingItem ? 'Zapisz' : 'Dodaj'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
