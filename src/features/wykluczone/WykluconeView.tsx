import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import { AddCircle as RestoreIcon, Savings as SavingsIcon } from '@mui/icons-material';
import { useBudgetStore } from '@/store';
import { formatCurrency } from '@/utils';

interface ExcludedRow {
  id: string;
  kategoria: string;
  source: 'meble' | 'wykonczenie' | 'agd' | 'pozostale' | 'wyprowadzka';
  grupa: string;
  nazwa: string;
  kwota: number;
}

export function WykluconeView() {
  const theme = useTheme();
  const meble = useBudgetStore((s) => s.meble);
  const wykonczenie = useBudgetStore((s) => s.wykonczenie);
  const agd = useBudgetStore((s) => s.agd);
  const pozostale = useBudgetStore((s) => s.pozostale);
  const wyprowadzka = useBudgetStore((s) => s.wyprowadzka);
  const updateMebleItem = useBudgetStore((s) => s.updateMebleItem);
  const updateWykonczenieItem = useBudgetStore((s) => s.updateWykonczenieItem);
  const updateAGDItem = useBudgetStore((s) => s.updateAGDItem);
  const updatePozostaleItem = useBudgetStore((s) => s.updatePozostaleItem);
  const updateWyprowadzkaItem = useBudgetStore((s) => s.updateWyprowadzkaItem);

  const restoreItem = (row: ExcludedRow) => {
    switch (row.source) {
      case 'meble': updateMebleItem(row.id, { included: true }); break;
      case 'wykonczenie': updateWykonczenieItem(row.id, { included: true }); break;
      case 'agd': updateAGDItem(row.id, { included: true }); break;
      case 'pozostale': updatePozostaleItem(row.id, { included: true }); break;
      case 'wyprowadzka': updateWyprowadzkaItem(row.id, { included: true }); break;
    }
  };

  const excluded: ExcludedRow[] = [
    ...meble.filter(i => !i.included).map(i => ({ id: i.id, kategoria: 'Meblowanie', source: 'meble' as const, grupa: i.pomieszczenie, nazwa: i.nazwa, kwota: i.cena })),
    ...wykonczenie.filter(i => !i.included).map(i => ({ id: i.id, kategoria: 'Wykończenie', source: 'wykonczenie' as const, grupa: i.etap, nazwa: i.opis, kwota: i.kwota })),
    ...agd.filter(i => !i.included).map(i => ({ id: i.id, kategoria: 'AGD / RTV', source: 'agd' as const, grupa: i.producent, nazwa: `${i.nazwa} ${i.model}`.trim(), kwota: i.cena })),
    ...pozostale.filter(i => !i.included).map(i => ({ id: i.id, kategoria: 'Inne', source: 'pozostale' as const, grupa: i.grupa, nazwa: i.nazwa, kwota: i.cena })),
    ...wyprowadzka.filter(i => !i.included).map(i => ({ id: i.id, kategoria: 'Wyprowadzka', source: 'wyprowadzka' as const, grupa: i.grupa, nazwa: i.nazwa, kwota: i.cena })),
  ];

  const totalSaved = excluded.reduce((s, i) => s + i.kwota, 0);

  // Group by category
  const byCategory = new Map<string, ExcludedRow[]>();
  for (const item of excluded) {
    const list = byCategory.get(item.kategoria) || [];
    list.push(item);
    byCategory.set(item.kategoria, list);
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">Pominięte</Typography>
        <Typography variant="body2" color="text.secondary">
          Pozycje wykluczone z budżetu — nie wliczają się do kosztów, ale masz je tu na oku
        </Typography>
      </Box>

      {/* Summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 200, background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)}, ${alpha(theme.palette.error.main, 0.05)})`, border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}` }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><SavingsIcon sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.6 }} /><Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>Zaoszczędzone</Typography></Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>{formatCurrency(totalSaved)}</Typography>
            <Typography variant="caption" color="text.secondary">
              {excluded.length} pozycji pominiętych w budżecie
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {excluded.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">Brak pominiętych pozycji — wszystko jest uwzględnione w budżecie.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Kategoria</TableCell>
                  <TableCell>Grupa</TableCell>
                  <TableCell>Nazwa</TableCell>
                  <TableCell align="right">Kwota</TableCell>
                  <TableCell sx={{ width: 50 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from(byCategory.entries()).map(([cat, items]) => (
                  items.map((item, idx) => (
                    <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                      {idx === 0 ? (
                        <TableCell rowSpan={items.length} sx={{ verticalAlign: 'top', borderRight: `1px solid ${theme.palette.divider}` }}>
                          <Chip label={cat} size="small" variant="outlined" sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {formatCurrency(items.reduce((s, i) => s + i.kwota, 0))}
                          </Typography>
                        </TableCell>
                      ) : null}
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{item.grupa}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.nazwa}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatCurrency(item.kwota)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Przywróć do budżetu">
                          <IconButton size="small" onClick={() => restoreItem(item)} sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.success.main } }}>
                            <RestoreIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ))}
                {/* Total row */}
                <TableRow>
                  <TableCell colSpan={4} sx={{ fontWeight: 700, borderTop: `2px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Razem pominięte</Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderTop: `2px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: theme.palette.success.main }}>
                      {formatCurrency(totalSaved)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}
