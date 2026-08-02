import { Box, Card, CardContent, Grid, Typography, useTheme, alpha, LinearProgress } from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as PaidIcon,
  Warning as WarningIcon,
  Balance as BalanceIcon,
  Receipt as CostIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Line,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useBudgetStore } from '@/store';
import { formatCurrency } from '@/utils';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

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

  // Dane do wykresu scenariuszy (min/main/max)
  const rangeData = categoryBreakdown.map((cat) => ({
    name: cat.name,
    min: cat.minKoszt,
    main: cat.zaplacono + cat.doZaplaty,
    max: cat.maxKoszt,
  }));

  // Scenariusze budżetowe globalne
  const totalMin = categoryBreakdown.reduce((s, c) => s + c.minKoszt, 0);
  const totalMain = categoryBreakdown.reduce((s, c) => s + c.zaplacono + c.doZaplaty, 0);
  const totalMax = categoryBreakdown.reduce((s, c) => s + c.maxKoszt, 0);

  // Progress per kategoria
  const categoryProgress = categoryBreakdown.map((cat) => {
    const total = cat.zaplacono + cat.doZaplaty;
    return {
      name: cat.name,
      zaplacono: cat.zaplacono,
      total,
      percent: total > 0 ? (cat.zaplacono / total) * 100 : 0,
    };
  });

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h2" sx={{ mb: 0.5 }}>
          Podsumowanie
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Całościowy obraz budżetu na wykończenie i wyposażenie
        </Typography>
      </Box>

      {/* Hero KPI row */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard label="Wpływy łącznie" value={summary.wplywy} variant="neutral" icon={<WalletIcon sx={{ fontSize: 16 }} />} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            label="Dostępne środki"
            value={summary.aktualnieSrodki}
            variant={summary.aktualnieSrodki >= 0 ? 'positive' : 'negative'}
            icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            label="Opłacono"
            value={summary.zaplacono}
            variant="positive"
            subtitle={`${progress.toFixed(0)}% całości`}
            icon={<PaidIcon sx={{ fontSize: 16 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard label="Do opłacenia" value={summary.pozostaloDoZaplaty} variant="warning" icon={<WarningIcon sx={{ fontSize: 16 }} />} />
        </Grid>
      </Grid>

      {/* Bilans hero card */}
      <Card
        sx={{
          mb: 4,
          background: summary.bilans >= 0
            ? `linear-gradient(135deg, ${alpha('#10b981', 0.08)}, ${alpha('#6366f1', 0.04)})`
            : `linear-gradient(135deg, ${alpha('#ef4444', 0.08)}, ${alpha('#f59e0b', 0.04)})`,
          border: `1px solid ${summary.bilans >= 0 ? alpha('#10b981', 0.15) : alpha('#ef4444', 0.15)}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <BalanceIcon sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.6 }} />
                <Typography variant="overline" color="text.secondary">Bilans</Typography>
              </Box>
              <Typography
                variant="h2"
                sx={{ color: summary.bilans >= 0 ? theme.palette.success.main : theme.palette.error.main, fontWeight: 700 }}
              >
                {formatCurrency(summary.bilans)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {summary.bilans >= 0
                  ? 'Środki pokrywają zaplanowane wydatki'
                  : 'Brakuje środków na pokrycie zaplanowanych kosztów'}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, justifyContent: 'flex-end' }}>
                <CostIcon sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.6 }} />
                <Typography variant="caption" color="text.secondary">Łączny koszt</Typography>
              </Box>
              <Typography variant="h5">{formatCurrency(summary.lacznyKoszt)}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Charts row 1: Existing charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Cost breakdown bar chart */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Wydatki wg kategorii</Typography>
              <Typography variant="caption" color="text.secondary">Opłacone vs do opłacenia</Typography>
              {categoryBreakdown.length > 0 ? (
                <Box sx={{ mt: 3 }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={categoryBreakdown}
                      layout="vertical"
                      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      barGap={2}
                      barSize={20}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                        stroke={theme.palette.text.secondary}
                        fontSize={10}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis type="category" dataKey="name" stroke={theme.palette.text.secondary} fontSize={11} width={80} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        formatter={(value: number, name: string) => [
                          formatCurrency(value),
                          name === 'zaplacono' ? 'Opłacone' : 'Do opłacenia',
                        ]}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          color: theme.palette.text.primary,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 12,
                          fontSize: '0.75rem',
                        }}
                        itemStyle={{ color: theme.palette.text.primary }}
                        labelStyle={{ color: theme.palette.text.primary }}
                      />
                      <Bar dataKey="zaplacono" name="zaplacono" fill={theme.palette.success.main} radius={[0, 4, 4, 0]} stackId="a" />
                      <Bar dataKey="doZaplaty" name="doZaplaty" fill={alpha(theme.palette.warning.main, 0.5)} radius={[0, 4, 4, 0]} stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                  <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.palette.success.main }} />
                      <Typography variant="caption" color="text.secondary">Opłacone</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: alpha(theme.palette.warning.main, 0.5) }} />
                      <Typography variant="caption" color="text.secondary">Do opłacenia</Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <EmptyState />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Donut chart */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Struktura kosztów</Typography>
              <Typography variant="caption" color="text.secondary">Procentowy podział wg kategorii</Typography>
              {categoryCosts.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryCosts}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryCosts.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          color: theme.palette.text.primary,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 12,
                          fontSize: '0.75rem',
                        }}
                        itemStyle={{ color: theme.palette.text.primary }}
                        labelStyle={{ color: theme.palette.text.primary }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                    {categoryCosts.map((cat, i) => (
                      <Box key={cat.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <Typography variant="body2">{cat.name}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {formatCurrency(cat.value)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <EmptyState />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* NEW: Charts row 2 - Range chart + Scenarios */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Range chart: min / main / max per category */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Rozpiętość kosztów</Typography>
              <Typography variant="caption" color="text.secondary">
                Wariant minimalny / obecny / maksymalny (uwzględniając alternatywy)
              </Typography>
              {rangeData.length > 0 ? (
                <Box sx={{ mt: 3 }}>
                  <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart
                      data={rangeData}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                        stroke={theme.palette.text.secondary}
                        fontSize={10}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis type="category" dataKey="name" stroke={theme.palette.text.secondary} fontSize={11} width={80} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        formatter={(value: number, name: string) => {
                          const labels: Record<string, string> = { min: 'Minimum', main: 'Aktualny', max: 'Maksimum' };
                          return [formatCurrency(value), labels[name] || name];
                        }}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          color: theme.palette.text.primary,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 12,
                          fontSize: '0.75rem',
                        }}
                        itemStyle={{ color: theme.palette.text.primary }}
                        labelStyle={{ color: theme.palette.text.primary }}
                      />
                      <Bar dataKey="min" fill={alpha(theme.palette.success.main, 0.3)} barSize={28} radius={[0, 4, 4, 0]} />
                      <Bar dataKey="max" fill={alpha(theme.palette.error.main, 0.2)} barSize={28} radius={[0, 4, 4, 0]} />
                      <Line type="monotone" dataKey="main" stroke={theme.palette.primary.main} strokeWidth={0} dot={{ r: 5, fill: theme.palette.primary.main, strokeWidth: 2, stroke: theme.palette.background.paper }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: alpha(theme.palette.success.main, 0.5) }} />
                      <Typography variant="caption" color="text.secondary">Wariant minimalny</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.palette.primary.main }} />
                      <Typography variant="caption" color="text.secondary">Obecny wybór</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: alpha(theme.palette.error.main, 0.4) }} />
                      <Typography variant="caption" color="text.secondary">Wariant maksymalny</Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <EmptyState />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Budget scenarios summary */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Scenariusze budżetowe</Typography>
              <Typography variant="caption" color="text.secondary">
                Czy środki wystarczą w każdym wariancie?
              </Typography>
              {totalMain > 0 ? (
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <ScenarioRow
                    label="Optymistyczny"
                    cost={totalMin}
                    available={summary.aktualnieSrodki}
                    color={theme.palette.success.main}
                  />
                  <ScenarioRow
                    label="Obecny plan"
                    cost={totalMain}
                    available={summary.aktualnieSrodki}
                    color={theme.palette.primary.main}
                  />
                  <ScenarioRow
                    label="Pesymistyczny"
                    cost={totalMax}
                    available={summary.aktualnieSrodki}
                    color={theme.palette.error.main}
                  />
                  <Box sx={{ mt: 1, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" color="text.secondary">
                      Rozpiętość: {formatCurrency(totalMax - totalMin)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Możliwa oszczędność: {formatCurrency(totalMain - totalMin)}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <EmptyState />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* NEW: Progress per category */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>Postęp płatności wg kategorii</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
            Procent opłaconych pozycji w każdej kategorii
          </Typography>
          {categoryProgress.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {categoryProgress.map((cat, i) => (
                <Box key={cat.name}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{cat.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(cat.zaplacono)} / {formatCurrency(cat.total)}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', minWidth: 40, textAlign: 'right' }}>
                        {cat.percent.toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(cat.percent, 100)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(CHART_COLORS[i % CHART_COLORS.length], 0.12),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>

      {/* Global progress section */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6">Postęp płatności</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatCurrency(summary.zaplacono)} z {formatCurrency(summary.lacznyKoszt)} opłacone
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              {progress.toFixed(0)}%
            </Typography>
          </Box>
          <Box
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${Math.min(progress, 100)}%`,
                borderRadius: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                transition: 'width 0.6s ease',
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

/* ─── Sub-components ─── */

interface KPICardProps {
  label: string;
  value: number;
  variant: 'positive' | 'negative' | 'warning' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
}

function KPICard({ label, value, variant, subtitle, icon }: KPICardProps) {
  const theme = useTheme();
  const accentColor = {
    positive: theme.palette.success.main,
    negative: theme.palette.error.main,
    warning: theme.palette.warning.main,
    neutral: theme.palette.text.primary,
  }[variant];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          {icon && <Box sx={{ color: 'text.secondary', display: 'flex', opacity: 0.6 }}>{icon}</Box>}
          <Typography variant="overline" color="text.secondary">
            {label}
          </Typography>
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: variant === 'neutral' ? 'text.primary' : accentColor,
            fontFamily: '"Inter", monospace',
            letterSpacing: '-0.02em',
          }}
        >
          {formatCurrency(value)}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

interface ScenarioRowProps {
  label: string;
  cost: number;
  available: number;
  color: string;
}

function ScenarioRow({ label, cost, available, color }: ScenarioRowProps) {
  const theme = useTheme();
  const diff = available - cost;
  const isPositive = diff >= 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{label}</Typography>
        </Box>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
          {formatCurrency(cost)}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 3 }}>
        <Typography variant="caption" color="text.secondary">
          {isPositive ? 'Nadwyżka' : 'Brakuje'}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontFamily: 'monospace',
            color: isPositive ? theme.palette.success.main : theme.palette.error.main,
          }}
        >
          {isPositive ? '+' : ''}{formatCurrency(diff)}
        </Typography>
      </Box>
    </Box>
  );
}

function EmptyState() {
  return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        Brak danych — zaimportuj arkusz Excel, aby rozpocząć.
      </Typography>
    </Box>
  );
}
