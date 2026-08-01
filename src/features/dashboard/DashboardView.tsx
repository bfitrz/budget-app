import { Box, Card, CardContent, Grid, Typography, useTheme, alpha } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  AccountBalanceWallet as WalletIcon,
  Receipt as ReceiptIcon,
  CheckCircle as PaidIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useBudgetStore } from '@/store';
import { formatCurrency } from '@/utils';

const CHART_COLORS = ['#589df6', '#c77dba', '#6a8759', '#cc7832'];

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
}

function SummaryCard({ label, value, icon, gradient }: SummaryCardProps) {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.65rem',
              }}
            >
              {label}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mt: 0.5,
                fontSize: { xs: '1.1rem', sm: '1.3rem' },
              }}
            >
              {formatCurrency(value)}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: gradient,
              color: '#fff',
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function DashboardView() {
  const theme = useTheme();
  const getDashboardSummary = useBudgetStore((s) => s.getDashboardSummary);
  const getCategoryCosts = useBudgetStore((s) => s.getCategoryCosts);
  const getCategoryBreakdown = useBudgetStore((s) => s.getCategoryBreakdown);
  const getPaymentProgress = useBudgetStore((s) => s.getPaymentProgress);

  const summary = getDashboardSummary();
  const categoryCosts = getCategoryCosts();
  const categoryBreakdown = getCategoryBreakdown();
  const progress = getPaymentProgress();

  const cards: SummaryCardProps[] = [
    {
      label: 'Wpływy (budżet)',
      value: summary.wplywy,
      icon: <WalletIcon sx={{ fontSize: 22 }} />,
      gradient: 'linear-gradient(135deg, #589df6, #3574c4)',
    },
    {
      label: 'Aktualne środki',
      value: summary.aktualnieSrodki,
      icon: <TrendingUpIcon sx={{ fontSize: 22 }} />,
      gradient: summary.aktualnieSrodki >= 0
        ? 'linear-gradient(135deg, #6a8759, #4a6b3a)'
        : 'linear-gradient(135deg, #cf6679, #a84050)',
    },
    {
      label: 'Łączny koszt',
      value: summary.lacznyKoszt,
      icon: <ReceiptIcon sx={{ fontSize: 22 }} />,
      gradient: 'linear-gradient(135deg, #c77dba, #9c5490)',
    },
    {
      label: 'Zapłacono',
      value: summary.zaplacono,
      icon: <PaidIcon sx={{ fontSize: 22 }} />,
      gradient: 'linear-gradient(135deg, #6a8759, #4a6b3a)',
    },
    {
      label: 'Pozostało do zapłaty',
      value: summary.pozostaloDoZaplaty,
      icon: <PendingIcon sx={{ fontSize: 22 }} />,
      gradient: 'linear-gradient(135deg, #cc7832, #a55e22)',
    },
    {
      label: 'Bilans',
      value: summary.bilans,
      icon: <TrendingUpIcon sx={{ fontSize: 22 }} />,
      gradient: summary.bilans >= 0
        ? 'linear-gradient(135deg, #6a8759, #4a6b3a)'
        : 'linear-gradient(135deg, #cf6679, #a84050)',
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Przegląd budżetu wykończenia mieszkania
        </Typography>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg key={card.label}>
            <SummaryCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Pie chart */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Podział kosztów
              </Typography>
              {categoryCosts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryCosts}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryCosts.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      formatter={(value: string) => (
                        <span style={{ color: theme.palette.text.primary, fontSize: '0.8rem' }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    Brak danych. Zaimportuj dane z pliku Excel.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Progress circle + breakdown */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Zestawienie kosztów per kategoria
              </Typography>
              {categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={categoryBreakdown}
                    margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                    layout="vertical"
                    barGap={4}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.divider}
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                      stroke={theme.palette.text.secondary}
                      fontSize={11}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke={theme.palette.text.secondary}
                      fontSize={12}
                      width={90}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === 'zaplacono' ? 'Zapłacono' : 'Do zapłaty',
                      ]}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                    />
                    <Bar
                      dataKey="zaplacono"
                      name="zaplacono"
                      fill={theme.palette.success.main}
                      radius={[0, 4, 4, 0]}
                      stackId="stack"
                    />
                    <Bar
                      dataKey="doZaplaty"
                      name="doZaplaty"
                      fill={alpha(theme.palette.warning.main, 0.7)}
                      radius={[0, 4, 4, 0]}
                      stackId="stack"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Brak danych.</Typography>
                </Box>
              )}
              {/* Legend */}
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, backgroundColor: theme.palette.success.main }} />
                  <Typography variant="caption">Zapłacono</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, backgroundColor: alpha(theme.palette.warning.main, 0.7) }} />
                  <Typography variant="caption">Do zapłaty</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom row: progress + saldo vs costs */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Postęp płatności
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 150,
                      height: 150,
                      borderRadius: '50%',
                      background: `conic-gradient(${theme.palette.primary.main} ${progress * 3.6}deg, ${alpha(theme.palette.primary.main, 0.1)} 0deg)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.background.paper,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {progress.toFixed(0)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        opłacone
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, backgroundColor: alpha(theme.palette.success.main, 0.08) }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.palette.success.main }} />
                    <Typography variant="body2">Zapłacono</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(summary.zaplacono)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2, backgroundColor: alpha(theme.palette.warning.main, 0.08) }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.palette.warning.main }} />
                    <Typography variant="body2">Pozostało</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(summary.pozostaloDoZaplaty)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Saldo vs Koszty
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Visual bar comparison */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Aktualne środki</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(summary.aktualnieSrodki)}</Typography>
                  </Box>
                  <Box sx={{ height: 24, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1), overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: '100%',
                        width: summary.lacznyKoszt > 0
                          ? `${Math.min((summary.aktualnieSrodki / summary.lacznyKoszt) * 100, 100)}%`
                          : '0%',
                        borderRadius: 2,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Zapłacono</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(summary.zaplacono)}</Typography>
                  </Box>
                  <Box sx={{ height: 24, borderRadius: 2, backgroundColor: alpha(theme.palette.success.main, 0.1), overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: '100%',
                        width: summary.lacznyKoszt > 0
                          ? `${(summary.zaplacono / summary.lacznyKoszt) * 100}%`
                          : '0%',
                        borderRadius: 2,
                        background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light || theme.palette.success.main})`,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Pozostało do zapłaty</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(summary.pozostaloDoZaplaty)}</Typography>
                  </Box>
                  <Box sx={{ height: 24, borderRadius: 2, backgroundColor: alpha(theme.palette.warning.main, 0.1), overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: '100%',
                        width: summary.lacznyKoszt > 0
                          ? `${(summary.pozostaloDoZaplaty / summary.lacznyKoszt) * 100}%`
                          : '0%',
                        borderRadius: 2,
                        background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light || theme.palette.warning.main})`,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Łączny koszt (100%)</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(summary.lacznyKoszt)}</Typography>
                  </Box>
                  <Box sx={{ height: 24, borderRadius: 2, backgroundColor: alpha(theme.palette.text.secondary, 0.1), overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: '100%',
                        width: '100%',
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.text.secondary, 0.2),
                      }}
                    />
                  </Box>
                </Box>

                {/* Bilans highlight */}
                <Box sx={{
                  mt: 1,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: summary.bilans >= 0
                    ? alpha(theme.palette.success.main, 0.08)
                    : alpha(theme.palette.error.main, 0.08),
                  border: `1px solid ${summary.bilans >= 0
                    ? alpha(theme.palette.success.main, 0.2)
                    : alpha(theme.palette.error.main, 0.2)}`,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Bilans (środki − pozostało)
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: summary.bilans >= 0 ? theme.palette.success.main : theme.palette.error.main,
                      }}
                    >
                      {formatCurrency(summary.bilans)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {summary.bilans >= 0
                      ? 'Masz wystarczające środki na pokrycie pozostałych kosztów.'
                      : 'Brakuje środków. Rozważ dodatkowe wpływy lub ograniczenie wydatków.'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
