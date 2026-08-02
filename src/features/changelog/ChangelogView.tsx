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
    version: '2.7.0',
    date: '2026-08-02',
    changes: [
      { type: 'feat', text: 'Powiadomienie o nowej wersji aplikacji — blok „Nowa wersja" z przyciskiem Odśwież' },
      { type: 'feat', text: 'Data ostatniej edycji pliku (z Google Drive) widoczna na stronie Dane i sync' },
      { type: 'feat', text: 'Stały blok „Brak połączenia" z przyciskiem Połącz gdy sesja wygaśnie' },
      { type: 'feat', text: 'Auto-refresh tokena Google — silent re-auth bez popupu' },
      { type: 'fix', text: 'Import dat z Excela — obsługa serial numbers (kolumna DataRealizacji, Saldo, Harmonogram, Milestones)' },
    ],
  },
  {
    version: '2.6.0',
    date: '2026-08-02',
    changes: [
      { type: 'feat', text: 'Stały blok „Brak połączenia" w prawym górnym rogu gdy sesja Google wygasła + przycisk Połącz' },
      { type: 'feat', text: 'Toasty notyfikacji wyświetlają się pod blokiem statusu połączenia' },
      { type: 'feat', text: 'Animacja pulse na bloku rozłączenia — przyciąga uwagę' },
      { type: 'fix', text: 'Import daty z Excela — obsługa serial number (Excel konwertuje daty na liczby)' },
      { type: 'fix', text: 'Auto-refresh tokena Google w tle (silent re-auth przy wygaśnięciu)' },
    ],
  },
  {
    version: '2.5.0',
    date: '2026-08-02',
    changes: [
      { type: 'feat', text: 'Nowy design bannera „Nowa wersja" — gradient, animacja wjazdu, blur, emoji 🔄' },
      { type: 'feat', text: 'Banner sticky na górze — widoczny na każdej stronie, nie znika przy scrollu' },
      { type: 'feat', text: 'Przycisk „Wczytaj" + zamknięcie ✕ zamiast zwykłego Alert' },
    ],
  },
  {
    version: '2.4.0',
    date: '2026-08-02',
    changes: [
      { type: 'feat', text: 'Toggle „Sprawdzaj zmiany" — polling włączalny/wyłączalny niezależnie od autozapisu' },
      { type: 'feat', text: 'Notyfikacja „Zapisano do chmury" po każdym udanym autozapisie' },
      { type: 'feat', text: 'Notyfikacja „Wczytano zmiany z chmury" po wczytaniu zmian kolegi' },
      { type: 'feat', text: 'Konfigurowalny interwał pollingu (10–120s)' },
      { type: 'feat', text: 'Wyświetlanie kto ostatnio edytował plik (imię z Google)' },
      { type: 'feat', text: 'Banner zmian pokazuje imię osoby: „Plik zmieniony przez Jana"' },
      { type: 'feat', text: 'Przycisk Odśwież (↻) w sidebarze — reload strony bez F5' },
      { type: 'fix', text: 'Własne zapisy nie triggerują bannera „plik zmieniony" (lastModifyingUser.me)' },
      { type: 'fix', text: 'Auto-sync faktycznie zapisuje do Google Drive (przepisany hook)' },
      { type: 'fix', text: 'Udostępnione pliki widoczne na liście (zmiana scope na drive)' },
      { type: 'fix', text: 'Auto-zapis switch i suwak reagują na zmianę' },
    ],
  },
  {
    version: '2.3.0',
    date: '2026-08-02',
    changes: [
      { type: 'feat', text: 'Synchronizacja z Google Drive — plik .xlsx zapisywany automatycznie na Twoim Drive' },
      { type: 'feat', text: 'Współdzielenie budżetu — udostępnij plik na Drive i pracujcie razem' },
      { type: 'feat', text: 'Auto-zapis z konfigurowalnym interwałem (5–120s)' },
      { type: 'feat', text: 'Strona „Dane i sync" — pełne zarządzanie połączeniem z chmurą' },
      { type: 'feat', text: 'Zapisz jako... — tworzenie nowego pliku na Drive z dowolną nazwą' },
      { type: 'feat', text: 'Wczytaj inny plik — przełączanie między plikami na Drive' },
      { type: 'feat', text: 'Ekran startowy — wybór storage (Google Drive / localStorage) przy pierwszym uruchomieniu' },
      { type: 'feat', text: 'Zero konfiguracji — klik Google Drive → popup → gotowe (hardcoded Client ID)' },
      { type: 'fix', text: 'Google OAuth przez popup (GIS) zamiast redirect — nie wymaga client_secret' },
      { type: 'style', text: 'Dropbox oznaczony jako „Wkrótce" (jeszcze niedostępny)' },
    ],
  },
  {
    version: '2.2.0',
    date: '2026-08-02',
    changes: [
      { type: 'feat', text: 'Wyszukiwanie pozycji — pole szukania filtruje po nazwie, grupie i kolumnach' },
      { type: 'feat', text: 'Szybkie filtry statusu — toggle buttons: Wszystkie / Do zapłaty / Opłacone / Wykluczone' },
      { type: 'feat', text: 'Sortowanie pozycji w grupach — cena ↑↓, nazwa A-Z, status' },
      { type: 'feat', text: 'Mini progress bar na nagłówku grupy — wizualny postęp opłaconych' },
      { type: 'feat', text: 'Reminder o backupie — alert jeśli >7 dni bez eksportu' },
      { type: 'feat', text: 'Najtańsza alternatywa podświetlona zielonym obramowaniem' },
      { type: 'feat', text: 'Przeterminowane pozycje — chip daty zmienia kolor na czerwony' },
      { type: 'feat', text: 'Undo/Redo — Ctrl+Z cofa ostatnią akcję, Ctrl+Shift+Z przywraca' },
    ],
  },
  {
    version: '2.1.0',
    date: '2026-08-02',
    changes: [
      { type: 'feat', text: 'Dropdown statusu zamiast oddzielnej ikony $ i chipu — jeden kontroler: Do zapłaty / Opłacone / Wykluczone' },
      { type: 'feat', text: 'Nawigacja mobilna przez swipe (przesunięcie palcem z lewej do prawej otwiera menu)' },
      { type: 'feat', text: 'Dialogi fullscreen na mobile — przyciski zawsze widoczne nawet z klawiaturą' },
      { type: 'fix', text: 'Naprawiono race condition w menu kontekstowym grup (rename/delete nie działało)' },
      { type: 'fix', text: 'Naprawiono operacje na grupie „Bez grupy" (rename/delete/wyklucz)' },
      { type: 'refactor', text: 'Ujednolicona terminologia → „Wykluczone" wszędzie (zamiast mieszanki wygaszone/pominięte/wyłączone)' },
      { type: 'style', text: 'Usunięty hamburger button na mobile (zakrywał tytuł) — zastąpiony gestem swipe' },
    ],
  },
  {
    version: '2.0.0',
    date: '2026-08-02',
    changes: [
      { type: 'feat', text: 'System notyfikacji — każda akcja potwierdzona komunikatem w prawym górnym rogu' },
      { type: 'feat', text: 'Notyfikacje opisują co się zmieniło: „Wyłączono z budżetu", „Oznaczono jako opłacone", „Cena zaktualizowana" itp.' },
      { type: 'feat', text: 'Przycisk „Wyczyść dane" na stronie Import/Eksport z potwierdzeniem' },
      { type: 'feat', text: 'Rozbudowany przewodnik — dokładne wyjaśnienia każdej funkcji dla nowych użytkowników' },
      { type: 'refactor', text: 'Usunięto panel notatek (Sticky Notes) — zastąpiony systemem notyfikacji' },
    ],
  },
  {
    version: '1.9.0',
    date: '2026-08-02',
    changes: [
      { type: 'feat', text: 'Kompletna analiza UX Writing — dokument referencyjny ze wszystkimi tekstami UI' },
      { type: 'feat', text: 'Przepisany przewodnik w stylu dokumentacji SaaS' },
      { type: 'feat', text: 'Przepisany changelog językiem użytkownika (styl Linear/Notion)' },
      { type: 'feat', text: 'Lista 15 problemów UX z priorytetami i rekomendacjami napraw' },
      { type: 'style', text: 'Ujednolicona terminologia: „Dostępne środki", „Do zapłaty", „Opłacone"' },
      { type: 'fix', text: 'Poprawka gramatyczna „z pominięte" → „razem z pominiętymi" (dokumentacja)' },
    ],
  },
  {
    version: '1.8.0',
    date: '2026-08-02',
    changes: [
      { type: 'feat', text: 'Planowana data wydatku — opcjonalne pole daty na każdej pozycji kosztowej' },
      { type: 'feat', text: 'Wykres harmonogramu — linia "cel" rośnie schodkowo wg dat realizacji kosztów' },
      { type: 'feat', text: 'Tooltip z ? przy polu daty wyjaśniający mechanizm' },
      { type: 'feat', text: 'Export/import pola DataRealizacji (wszystkie arkusze + szablon)' },
      { type: 'fix', text: 'Wygaszone grupy zachowują stan po odświeżeniu strony (obliczane z danych)' },
    ],
  },
  {
    version: '1.7.0',
    date: '2026-08-02',
    changes: [
      { type: 'feat', text: 'Pominięte kwoty widoczne we WSZYSTKICH widgetach i diagramach na dashboardzie' },
      { type: 'feat', text: 'Donut (Struktura kosztów) — dodatkowy segment "Pominięte"' },
      { type: 'feat', text: 'Scenariusze budżetowe — kwota i diff "z pominięte" mniejszym fontem pod każdym scenariuszem' },
      { type: 'feat', text: 'Postęp płatności wg kategorii — "z pominięte: opłacone/total (%)" pod każdą kategorią' },
      { type: 'feat', text: 'Postęp globalny — dodatkowy progress bar "z pominięte"' },
      { type: 'feat', text: 'Wykres harmonogramu — czerwona linia "cel z pominięte" + nadwyżka/brakuje w tooltip' },
      { type: 'feat', text: 'Tooltip wykresu harmonogramu — ujednolicony styl, pominięte mniejszym fontem' },
      { type: 'feat', text: 'Export/import milestones (arkusz Milestones) + szablon' },
      { type: 'feat', text: 'Dashboard bilans — "bilans z pominięte" + "oszczędzasz"' },
      { type: 'feat', text: 'Ikony przy labelkach WSZYSTKICH widgetów (dashboard, saldo, harmonogram, koszty, pominięte)' },
      { type: 'feat', text: 'Nowa ikona PWA (dom + wykres + monety) + favicon' },
      { type: 'style', text: 'Zasada: wartości "z pominięte" zawsze mniejszym fontem (0.55-0.6rem)' },
    ],
  },
  {
    version: '1.6.0',
    date: '2026-08-02',
    changes: [
      { type: 'feat', text: 'Strona "Pominięte" — lista wyklucz. pozycji z kwotami i przyciskiem przywracania' },
      { type: 'feat', text: 'Przycisk "Przywróć do budżetu" na stronie Pominięte' },
      { type: 'feat', text: 'Wygaszenie grupy faktycznie aktualizuje bilans (included na itemach)' },
      { type: 'feat', text: 'Strona Changelog z historią wersji' },
      { type: 'refactor', text: 'Zakupy → Meblowanie (wykończenie mieszkania meblami)' },
      { type: 'fix', text: 'Milestone tooltip — pełne info: stan, wpływy, prognoza, cel, brakuje/nadwyżka' },
      { type: 'style', text: 'Kompaktowe przyciski w harmonogramie' },
    ],
  },
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
