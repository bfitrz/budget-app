import { Box, Typography, alpha, useTheme, Tooltip } from '@mui/material';
import { useBudgetStore } from '@/store';
import { formatCurrency } from '@/utils/format';

type MarkerPlacement = 'above' | 'below';
type MarkerLean = 'left' | 'right' | 'center';

function Marker({ position, color, label, value, placement, lean = 'center' }: {
  position: number;
  color: string;
  label: string;
  value: string;
  placement: MarkerPlacement;
  lean?: MarkerLean;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const clampedPos = Math.min(Math.max(position, 2), 98);

  const svgH = 16;
  const svgW = 16;
  const cx = lean === 'left' ? 4 : lean === 'right' ? 12 : 8;
  const startX = 8;

  const svg = (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block', overflow: 'visible' }}>
      <line
        x1={startX} y1={placement === 'above' ? svgH : 0}
        x2={cx} y2={placement === 'above' ? 4 : svgH - 4}
        stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"
      />
      <circle
        cx={cx} cy={placement === 'above' ? 4 : svgH - 4}
        r="3" fill={color}
        stroke={isDark ? theme.palette.background.default : '#fff'} strokeWidth="1.5"
      />
    </svg>
  );

  return (
    <Tooltip
      title={
        <Box sx={{ textAlign: 'center', py: 0.25 }}>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 500, color: 'inherit', opacity: 0.7, lineHeight: 1.2 }}>{label}</Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'inherit', lineHeight: 1.3 }}>{value}</Typography>
        </Box>
      }
      arrow
      placement={placement === 'above' ? 'top' : 'bottom'}
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: isDark ? theme.palette.background.paper : '#fff',
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            px: 1.25,
            py: 0.5,
            boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.08)',
          },
        },
        arrow: {
          sx: {
            color: isDark ? theme.palette.background.paper : '#fff',
            '&::before': { border: `1px solid ${theme.palette.divider}` },
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: `${clampedPos}%`,
          transform: 'translateX(-50%)',
          cursor: 'pointer',
          zIndex: 2,
          ...(placement === 'above' ? { bottom: '100%' } : { top: '100%' }),
        }}
      >
        {svg}
      </Box>
    </Tooltip>
  );
}

export function BudgetTopBar() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const summary = useBudgetStore((s) => s.getDashboardSummary());
  const breakdown = useBudgetStore((s) => s.getCategoryBreakdown());

  const minKoszt = breakdown.reduce((sum, c) => sum + c.minKoszt, 0);
  const maxKoszt = breakdown.reduce((sum, c) => sum + c.maxKoszt, 0);
  const aktualnyKoszt = summary.lacznyKoszt;  // plan — na co celujemy
  const budzet = summary.wplywy;              // cały nasz budżet (ile mamy/będziemy mieć)

  const hasRange = minKoszt !== maxKoszt && maxKoszt > 0;
  const bilans = summary.bilans;
  const bilansColor = bilans >= 0 ? theme.palette.success.main : theme.palette.error.main;

  // Skala: od 0 do max ze wszystkich wartości
  const scaleMax = Math.max(maxKoszt, aktualnyKoszt, budzet, 1);
  const toPos = (v: number) => (v / scaleMax) * 100;

  const barHeight = 10;
  const barTrackBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        px: { xs: 2, sm: 3 },
        pt: 3.5,
        pb: 3.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: isDark
          ? alpha(theme.palette.background.default, 0.92)
          : alpha(theme.palette.background.default, 0.95),
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
      }}
    >
      {/* Single bar */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ position: 'relative', height: barHeight, borderRadius: barHeight / 2, backgroundColor: barTrackBg, overflow: 'visible' }}>

          {/* Fill: budżet (0 → budżet = zielony, to co mamy) */}
          {budzet > 0 && (
            <Box
              sx={{
                position: 'absolute', left: 0, top: 0, height: '100%',
                width: `${Math.min(toPos(budzet), 100)}%`,
                minWidth: 4,
                borderRadius: `${barHeight / 2}px 0 0 ${barHeight / 2}px`,
                backgroundColor: theme.palette.success.main,
                opacity: isDark ? 0.5 : 0.45,
                transition: 'width 0.3s ease',
              }}
            />
          )}

          {/* Fill: budżet → min (must have, ciemny czerwony) */}
          {minKoszt > budzet && (
            <Box
              sx={{
                position: 'absolute', top: 0, height: '100%',
                left: `${toPos(budzet)}%`,
                width: `${toPos(minKoszt) - toPos(budzet)}%`,
                backgroundColor: theme.palette.error.main,
                opacity: isDark ? 0.7 : 0.6,
                transition: 'all 0.3s ease',
              }}
            />
          )}

          {/* Fill: min → plan (to co chcemy, średni czerwony) */}
          {aktualnyKoszt > 0 && hasRange && (
            <Box
              sx={{
                position: 'absolute', top: 0, height: '100%',
                left: `${toPos(Math.max(minKoszt, budzet))}%`,
                width: `${Math.max(toPos(aktualnyKoszt) - toPos(Math.max(minKoszt, budzet)), 0)}%`,
                backgroundColor: theme.palette.error.main,
                opacity: isDark ? 0.4 : 0.35,
                transition: 'all 0.3s ease',
              }}
            />
          )}

          {/* Fill: plan → max (opcjonalny, lekko czerwony) */}
          {hasRange && maxKoszt > aktualnyKoszt && (
            <Box
              sx={{
                position: 'absolute', top: 0, height: '100%',
                left: `${toPos(aktualnyKoszt)}%`,
                width: `${toPos(maxKoszt) - toPos(aktualnyKoszt)}%`,
                borderRadius: `0 ${barHeight / 2}px ${barHeight / 2}px 0`,
                backgroundColor: theme.palette.error.main,
                opacity: isDark ? 0.2 : 0.15,
                transition: 'all 0.3s ease',
              }}
            />
          )}

          {/* === MARKERS ABOVE: limity kosztów === */}
          {hasRange && (
            <Marker position={toPos(minKoszt)} color={theme.palette.success.main} label="Koszt min." value={formatCurrency(minKoszt)} placement="above" lean="left" />
          )}
          {hasRange && (
            <Marker position={toPos(maxKoszt)} color={theme.palette.error.main} label="Koszt max." value={formatCurrency(maxKoszt)} placement="above" lean="right" />
          )}

          {/* === MARKERS BELOW: stan aktualny === */}
          {aktualnyKoszt > 0 && (
            <Marker position={toPos(aktualnyKoszt)} color={isDark ? theme.palette.primary.light : theme.palette.primary.main} label="Plan kosztów" value={formatCurrency(aktualnyKoszt)} placement="below" lean="left" />
          )}
          {budzet > 0 && (
            <Marker position={toPos(budzet)} color={theme.palette.success.main} label="Nasz budżet" value={formatCurrency(budzet)} placement="below" lean="right" />
          )}
        </Box>
      </Box>

      {/* Bilans */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 100,
          px: 2,
          py: 1.25,
          borderRadius: '12px',
          backgroundColor: alpha(bilansColor, isDark ? 0.08 : 0.05),
          border: `1px solid ${alpha(bilansColor, isDark ? 0.2 : 0.12)}`,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.5rem',
            fontWeight: 600,
            color: theme.palette.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            mb: 0.25,
          }}
        >
          Bilans
        </Typography>
        <Typography
          sx={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: bilansColor,
            lineHeight: 1.2,
            fontFamily: 'monospace',
          }}
        >
          {bilans >= 0 ? '+' : ''}{formatCurrency(bilans)}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.45rem',
            color: theme.palette.text.secondary,
            mt: 0.25,
            opacity: 0.8,
          }}
        >
          {bilans >= 0 ? 'nadwyżka' : 'niedobór'}
        </Typography>
      </Box>
    </Box>
  );
}
