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
  Kitchen as KitchenIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useBudgetStore } from '@/store';
import { AGDItem, PaymentStatus } from '@/types';
import { formatCurrency } from '@/utils';

interface AGDFormData {
  nazwa: string;
  producent: string;
  model: string;
  cena: number;
  status: PaymentStatus;
  uwagi: string;
}

export function AGDView() {
  const theme = useTheme();
  const agd = useBudgetStore((s) => s.agd);
  const updateAGDItem = useBudgetStore((s) => s.updateAGDItem);
  const addAGDItem = useBudgetStore((s) => s.addAGDItem);
  const deleteAGDItem = useBudgetStore((s) => s.deleteAGDItem);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AGDItem | null>(null);
  const { control, handleSubmit, reset, setValue } = useForm<AGDFormData>({
    defaultValues: {
      nazwa: '',
      producent: '',
      model: '',
      cena: 0,
      status: 'Do zapłaty',
      uwagi: '',
    },
  });

  const handleToggleIncluded = (item: AGDItem) => {
    updateAGDItem(item.id, { included: !item.included });
  };

  const handleUwagiChange = (item: AGDItem, value: string) => {
    updateAGDItem(item.id, { uwagi: value });
  };

  const onSubmit = (data: AGDFormData) => {
    if (editingItem) {
      updateAGDItem(editingItem.id, {
        nazwa: data.nazwa,
        producent: data.producent,
        model: data.model,
        cena: Number(data.cena),
        uwagi: data.uwagi,
      });
    } else {
      addAGDItem({
        ...data,
        included: true,
        cena: Number(data.cena),
      });
    }
    reset();
    setEditingItem(null);
    setDialogOpen(false);
  };

  const openAddDialog = () => {
    setEditingItem(null);
    reset({ nazwa: '', producent: '', model: '', cena: 0, status: 'Do zapłaty', uwagi: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (item: AGDItem) => {
    setEditingItem(item);
    setValue('nazwa', item.nazwa);
    setValue('producent', item.producent);
    setValue('model', item.model);
    setValue('cena', item.cena);
    setValue('status', item.status);
    setValue('uwagi', item.uwagi);
    setDialogOpen(true);
  };

  const totalIncluded = agd.filter((i) => i.included).reduce((sum, i) => sum + i.cena, 0);
  const paidCount = agd.filter((i) => i.included && i.status === 'Opłacone').length;
  const totalCount = agd.filter((i) => i.included).length;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h4">AGD</Typography>
            <Typography variant="body2" color="text.secondary">
              Sprzęt AGD — lodówki, pralki, zmywarki i więcej
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
              Opłacone / Wszystkie
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
                <TableCell>Nazwa</TableCell>
                <TableCell>Producent</TableCell>
                <TableCell>Model</TableCell>
                <TableCell align="right">Cena</TableCell>
                <TableCell sx={{ width: 140 }}>Status</TableCell>
                <TableCell>Uwagi</TableCell>
                <TableCell sx={{ width: 90 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agd.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <KitchenIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4 }} />
                      <Typography color="text.secondary">
                        Brak pozycji. Kliknij "Dodaj pozycję" lub zaimportuj dane.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                agd.map((item) => (
                  <TableRow
                    key={item.id}
                    sx={{ opacity: item.included ? 1 : 0.45 }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={item.included} onChange={() => handleToggleIncluded(item)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.nazwa}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{item.producent}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{item.model}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {formatCurrency(item.cena)}
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
                          updateAGDItem(item.id, { status: newStatus });
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
                            onClick={() => deleteAGDItem(item.id)}
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
        <DialogTitle sx={{ fontWeight: 600 }}>{editingItem ? 'Edytuj pozycję — AGD' : 'Dodaj pozycję — AGD'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Controller name="nazwa" control={control} rules={{ required: 'Wymagane' }}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Nazwa" error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth />
              )}
            />
            <Controller name="producent" control={control}
              render={({ field }) => <TextField {...field} label="Producent" fullWidth />}
            />
            <Controller name="model" control={control}
              render={({ field }) => <TextField {...field} label="Model" fullWidth />}
            />
            <Controller name="cena" control={control} rules={{ required: 'Wymagane', min: { value: 0, message: 'Min 0' } }}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Cena (PLN)" type="number" error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth />
              )}
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
    </Box>
  );
}
