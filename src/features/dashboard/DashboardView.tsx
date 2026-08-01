import { Box, Card, CardContent, Grid, Typography, useTheme, alpha } from '@mui/material';
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
} from 'recharts';
import { useBudgetStore } from '@/store';
import { formatCurrency } from '@/utils';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'];

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

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h2" sx={{ mb: 0.5 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Przegląd budżetu wykończenia mieszkania
        </Typography>
      </Box>

      {/* Hero KPI row */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            label="Wpływy"
            value={summary.wplywy}
            variant="neutral"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            label="Aktualne środki"
            value={summary.aktualnieSrodki}
            variant={summary.aktualnieSrodki >= 0 ? 'positive' : 'negative'}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            label="Zapłacono"
            value={summary.zaplacono}
            variant="positive"
            subtitle={`${progress.toFixed(0)}% ukończono`}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            label="Pozostało"
            value={summary.pozostaloDoZaplaty}
            variant="warning"
          />
        </Grid>
      </Grid>

      {/* Bilans hero card */}
      <Card
        sx={{
          mb: 4,
          background: summary.bilans >= 0
            ? `linear-gradient(135deg, ${alpha('#10b981', 0.08)}, ${alpha('#6366f1', 0.04)})`
            : `linear-gradient(135deg, ${alpha('#ef4444', 0.08)}, ${alpha('#f59e0b', 0.04)})`,
          border: `1px solid ${summary.bilans >= 0
            ? alpha('#10b981', 0.15)
            : alpha('#ef4444', 0.15)}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Bilans
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  color: summary.bilans >= 0 ? theme.palette.success.main : theme.palette.error.main,
                  fontWeight: 700,
                }}
              >
                {formatCurrency(summary.bilans)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {summary.bilans >= 0
                  ? 'Masz wystarczające środki na pozostałe koszty'
                  : 'Brakuje środków na pokrycie wszystkich kosztów'}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">Łączny koszt</Typography>
              <Typography variant="h5">{formatCurrency(summary.lacznyKoszt)}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Charts row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Cost breakdown bar chart */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Koszty per kategoria</Typography>
              <Typography variant="caption" color="text.secondary">Zapłacone vs pozostałe</Typography>
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
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.palette.divider}
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                        stroke={theme.palette.text.secondary}
                        fontSize={10}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke={theme.palette.text.secondary}
                        fontSize={11}
                        width={80}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        formatter={(value: number, name: string) => [
                          formatCurrency(value),
                          name === 'zaplacono' ? 'Zapłacono' : 'Do zapłaty',
                        ]}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 12,
                          fontSize: '0.75rem',
                        }}
                      />
                      <Bar
                        dataKey="zaplacono"
                        name="zaplacono"
                        fill={theme.palette.success.main}
                        radius={[0, 4, 4, 0]}
                        stackId="a"
                      />
                      <Bar
                        dataKey="doZaplaty"
                        name="doZaplaty"
                        fill={alpha(theme.palette.warning.main, 0.5)}
                        radius={[0, 4, 4, 0]}
                        stackId="a"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.palette.success.main }} />
                      <Typography variant="caption" color="text.secondary">Zapłacone</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: alpha(theme.palette.warning.main, 0.5) }} />
                      <Typography variant="caption" color="text.secondary">Do zapłaty</Typography>
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
              <Typography variant="h6" sx={{ mb: 0.5 }}>Podział kosztów</Typography>
              <Typography variant="caption" color="text.secondary">Rozkład per kategoria</Typography>
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
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 12,
                          fontSize: '0.75rem',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
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

      {/* Progress section */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6">Postęp płatności</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatCurrency(summary.zaplacono)} z {formatCurrency(summary.lacznyKoszt)}
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              {progress.toFixed(0)}%
            </Typography>
          </Box>
          {/* Progress bar */}
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
}

function KPICard({ label, value, variant, subtitle }: KPICardProps) {
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
        <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          {label}
        </Typography>
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

function EmptyState() {
  return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        Brak danych. Zaimportuj plik Excel.
      </Typography>
    </Box>
  );
}
