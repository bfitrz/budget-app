import {
  Box,
  Typography,
  Card,
  CardContent,
  alpha,
  useTheme,
  Chip,
} from '@mui/material';

interface ChangeEntry {
  version: string;
  date: string;
  changes: { type: 'feat' | 'fix' | 'style' | 'refactor'; text: string }[];
}

const changelog: ChangeEntry[] = [
  {
    version: '1.5.0',
    date: '2026-08-02',
    changes: [
      { type: 'feat', text: 'Milestony w harmonogramie — deadline z pionową linią na wykresie i bilansem' },
      { type: 'feat', text: 'Niezależne uwagi na 3 poziomach (pozycja, MAIN, ALT) z tooltipami' },
      { type: 'feat', text: 'Edycja MAIN — pełny formularz (nazwa/model, cena, uwagi)' },
      { type: 'feat', text: 'Swap ALT→MAIN aktualizuje nazwę modelu w tabeli' },
      { type: 'feat', text: 'swapField — AGD/RTV poprawnie aktualizuje pole "model" przy zamianie' },
      { type: 'fix', text: 'Edycja poziomu 2 w AGD nie pokazuje pola model (to domena poziomu 3)' },
      { type: 'fix', text: 'Ikonki na poziomie 3 (MAIN + ALT) zamiast menu ⋮' },
      { type: 'fix', text: 'Uwagi — sama ikonka 💬 z tooltipem zamiast chip z tekstem' },
    ],
  },
  {
    version: '1.4.0',
    date: '2026-08-01',
    changes: [
      { type: 'feat', text: 'Menu kontekstowe ⋮ dla grup i pozycji (poziom 1 i 2)' },
      { type: 'feat', text: 'Uproszczony modal alternatyw — tylko dodawanie, bez listy' },
      { type: 'feat', text: 'Edycja linków inline (ołówek → pola → Enter/Esc)' },
      { type: 'feat', text: 'Modal edycji pozwala modyfikować cenę/kwotę' },
      { type: 'feat', text: 'Rozbudowane karty summary — Opłacone/Suma + progress bar + rozpiętość min/max + statystyki' },
      { type: 'style', text: 'Fancy kafelki z gradientami i progress barami' },
      { type: 'fix', text: 'Usunięty window.confirm — wszystkie usunięcia przez dialog MUI' },
    ],
  },
  {
    version: '1.3.0',
    date: '2026-08-01',
    changes: [
      { type: 'feat', text: 'PWA — aplikacja instalowalna na Windows/Mac/Linux/telefon' },
      { type: 'feat', text: 'GitHub Pages deployment z automatycznym workflow' },
      { type: 'feat', text: 'Premium logo z koroną (SVG)' },
      { type: 'fix', text: 'DateField — przycisk X do czyszczenia, widoczna ikona w dark mode' },
      { type: 'fix', text: 'Base URL dla GitHub Pages' },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-08-01',
    changes: [
      { type: 'feat', text: 'Pełny export/import — wszystkie dane (wyprowadzka, saldo, harmonogram, notatki, linki, alternatywy)' },
      { type: 'feat', text: 'Kompatybilność wsteczna ze starymi nazwami arkuszy Excel' },
      { type: 'feat', text: 'Szablon — generowanie pustego .xlsx ze wszystkimi zakładkami' },
      { type: 'feat', text: 'Snackbar notyfikacje przy imporcie/eksporcie' },
      { type: 'feat', text: 'Wygaszanie grup (wyłączanie z budżetu bez usuwania)' },
      { type: 'feat', text: 'Edycja i usuwanie grup z dialogiem potwierdzenia' },
      { type: 'feat', text: 'Wykres harmonogramu — punkt aktualnych środków, linia celu' },
      { type: 'feat', text: 'costField — naprawione pole kwota w Wykończeniu' },
      { type: 'feat', text: 'helpText tooltip (?) przy nagłówkach stron kosztowych' },
      { type: 'feat', text: 'DialogContent dividers + scroll na wszystkich modalach' },
      { type: 'refactor', text: 'Nazwy kategorii: Zakupy, Wykończenie, AGD/RTV, Inne, Wyprowadzka' },
      { type: 'refactor', text: 'Menu: Import/Eksport, Harmonogram (zamiast Planowanie)' },
      { type: 'feat', text: 'Przewodnik — pełna dokumentacja funkcji aplikacji' },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-08-01',
    changes: [
      { type: 'feat', text: 'Sticky notes panel — notatki widoczne na każdej stronie' },
      { type: 'feat', text: 'Budget top bar — pasek porównujący budżet z kosztami' },
      { type: 'feat', text: 'Hash-based routing — URL przeżywa odświeżenie strony' },
      { type: 'feat', text: 'CostCategoryView — wspólny komponent dla wszystkich kategorii kosztów' },
      { type: 'feat', text: 'System alternatyw cenowych z porównywaniem MAIN/ALT' },
      { type: 'feat', text: 'Linki z nazwami (ItemLink) zamiast surowych URL' },
      { type: 'feat', text: '4 motywy kolorystyczne (Ciemny, Stonowany, Jasny, Unicorn)' },
      { type: 'style', text: 'Collapsible MAIN/ALT panel z CSS grid' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-08-01',
    changes: [
      { type: 'feat', text: 'Początkowa wersja aplikacji budżetowej' },
      { type: 'feat', text: 'Import danych z Excel (.xlsx)' },
      { type: 'feat', text: 'Dashboard z wykresami (pie, bar, composed)' },
      { type: 'feat', text: 'Kategorie kosztów: Meble, Wykończenie, AGD, Pozostałe' },
      { type: 'feat', text: 'Saldo — rejestrowanie wpływów' },
      { type: 'feat', text: 'Harmonogram — planowanie przyszłych wpływów' },
      { type: 'feat', text: 'LocalStorage persistence' },
    ],
  },
];

const typeColors: Record<string, { bg: string; color: string; label: string }> = {
  feat: { bg: 'success', color: 'success', label: 'Nowe' },
  fix: { bg: 'warning', color: 'warning', label: 'Poprawka' },
  style: { bg: 'info', color: 'info', label: 'Styl' },
  refactor: { bg: 'secondary', color: 'secondary', label: 'Refactor' },
};

export function ChangelogView() {
  const theme = useTheme();

  return (
    <Box>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h2" sx={{ mb: 0.5 }}>Changelog</Typography>
        <Typography variant="body1" color="text.secondary">
          Historia zmian i nowych funkcjonalności aplikacji
        </Typography>
      </Box>

      {changelog.map((entry) => (
        <Card key={entry.version} sx={{ mb: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Chip label={`v${entry.version}`} size="small" sx={{ fontWeight: 700, fontSize: '0.75rem', backgroundColor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }} />
              <Typography variant="caption" color="text.secondary">{entry.date}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {entry.changes.map((change, i) => {
                const tc = typeColors[change.type] || typeColors.feat;
                return (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Chip
                      label={tc.label}
                      size="small"
                      sx={{
                        fontSize: '0.55rem',
                        height: 18,
                        minWidth: 60,
                        fontWeight: 600,
                        backgroundColor: alpha((theme.palette as unknown as Record<string, { main: string }>)[tc.bg]?.main || theme.palette.primary.main, 0.1),
                        color: (theme.palette as unknown as Record<string, { main: string }>)[tc.color]?.main || theme.palette.primary.main,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.6 }}>{change.text}</Typography>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
