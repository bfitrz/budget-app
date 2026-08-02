import {
  Box,
  Typography,
  Card,
  CardContent,
  alpha,
  useTheme,
  Divider,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Chair as ChairIcon,
  Build as BuildIcon,
  Kitchen as KitchenIcon,
  MoreHoriz as MoreIcon,
  AccountBalance as SaldoIcon,
  Schedule as ScheduleIcon,
  SyncAlt as DataIcon,
  LocalShipping as ShippingIcon,
  StickyNote2 as NotesIcon,
  SwapHoriz as AltIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  MoreVert as MenuIcon,
  VisibilityOff as DisableIcon,
} from '@mui/icons-material';

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        p: 1.5,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.info.main, 0.06),
        border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
        mt: 1.5,
      }}
    >
      <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.5, color: theme.palette.text.secondary }}>
        💡 {children}
      </Typography>
    </Box>
  );
}

function Feature({ label, description }: { label: string; description: string }) {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', gap: 1.5, py: 0.75 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: theme.palette.primary.main, mt: 0.8, flexShrink: 0 }} />
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>{label}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{description}</Typography>
      </Box>
    </Box>
  );
}

export function GuideView() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h2" sx={{ mb: 0.5 }}>Przewodnik</Typography>
        <Typography variant="body1" color="text.secondary">
          Jak korzystać z aplikacji budżetowej — opis każdej sekcji, funkcji i wskazówki
        </Typography>
      </Box>

      {/* Ogólne */}
      <Section title="Do czego służy ta aplikacja?" icon={<DashboardIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          Planujesz wykończenie i wyposażenie mieszkania? Ta aplikacja pomoże Ci ogarnąć budżet — od pierwszego kosztorysu po ostatnią fakturę. Wrzuć dane z Excela lub dodaj ręcznie, porównuj warianty cenowe, śledź co już opłacone, a co jeszcze przed Tobą.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          Dane przechowywane są lokalnie w przeglądarce (localStorage) — nie są wysyłane nigdzie. Możesz je wyeksportować do Excela jako backup.
        </Typography>
      </Section>

      {/* Podsumowanie */}
      <Section title="Podsumowanie" icon={<DashboardIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          Strona główna — pełen obraz budżetu na jednym ekranie. Odpowiada na pytanie: &quot;ile mam, ile wydaję i czy mi się to spina?&quot;
        </Typography>
        <Feature label="Karty KPI" description="Wpływy, aktualne środki, łączny koszt, opłacone, do zapłaty, bilans." />
        <Feature label="Bilans" description="Zielony = nadwyżka (masz więcej niż potrzebujesz), czerwony = niedobór." />
        <Feature label="Wykresy" description="Podział kosztów (donut), breakdown wg kategorii, scenariusze min/max, postęp płatności." />
        <Feature label="Scenariusze" description="Optymistyczny (min) / obecny / pesymistyczny (max) — na podstawie dodanych alternatyw." />
        <Feature label="Pominięte w diagramach" description="Każdy widget i diagram pokazuje wersję 'z pominięte' mniejszym fontem — ile by kosztowało gdybyś nic nie wygasił." />
      </Section>

      {/* Środki */}
      <Section title="Środki" icon={<SaldoIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          Rejestruj wpływy pieniędzy do budżetu — wszystko co zasila Twoje konto na wykończenie: wypłaty, oszczędności, zwroty podatku, przelewy od rodziny.
        </Typography>
        <Feature label="Dodaj wpływ" description="Przycisk '+' → data, opis, kwota. Np. 'Przelew z konta oszczędnościowego — 10 000 zł'." />
        <Feature label="Aktualne środki" description="Automatycznie: suma wpływów minus wszystko co już opłacone." />
        <Feature label="Ujemna kwota" description="Wpisz kwotę ujemną jako korektę (np. błędny wpis, zwrot który nie doszedł)." />
        <Tip>Wpływy wpływają na bilans w dashboardzie i pasek budżetowy we wszystkich zakładkach kosztowych.</Tip>
      </Section>

      {/* Harmonogram */}
      <Section title="Harmonogram" icon={<ScheduleIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          Zaplanuj przyszłe wpływy i sprawdź na wykresie, kiedy zgromadzisz wystarczająco pieniędzy na pokrycie wszystkich kosztów. Odpowiada na pytanie: &quot;kiedy będę miał na wszystko?&quot;
        </Typography>
        <Feature label="Zaplanuj wpływ" description="Dodaj przyszłą wpłatę z datą — np. 'Wypłata wrzesień — 8 000 zł'." />
        <Feature label="Wykres prognozowy" description="Niebieska linia = Twoje środki rosnące w czasie. Pomarańczowa linia = cel (ile łącznie musisz jeszcze zapłacić). Gdy niebieska przekroczy pomarańczową — masz wystarczająco." />
        <Feature label="Zielony punkt" description="Pierwszy punkt na wykresie = Twoje aktualne środki dziś." />
        <Feature label="Oznacz jako zrealizowane" description="Checkbox przy wpisie — zrealizowany wpływ przenosi się do środków." />
        <Feature label="📌 Milestony" description="Deadline'y i ważne daty. Przycisk '📌 Milestone' → podaj datę i opis. Na wykresie pojawia się pionowa linia z bilansem." />
        <Feature label="Bilans na milestone" description="Najedź na chip milestone pod wykresem — zobaczysz prognozowane środki, ile zostaje do zapłaty i bilans na tę datę." />
        <Tip>Niezrealizowane wpływy nie wliczają się do aktualnego salda — tylko do prognozy na wykresie.</Tip>
      </Section>

      {/* Kategorie kosztów */}
      <Section title="Zakładki kosztowe" icon={<ChairIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          Pięć zakładek z wydatkami, każda z tabelą pozycji pogrupowanych tematycznie:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip icon={<ChairIcon sx={{ fontSize: 14 }} />} label="Zakupy — meble i wyposażenie" size="small" />
          <Chip icon={<BuildIcon sx={{ fontSize: 14 }} />} label="Wykończenie — prace ekip, materiały" size="small" />
          <Chip icon={<KitchenIcon sx={{ fontSize: 14 }} />} label="AGD / RTV — sprzęt domowy" size="small" />
          <Chip icon={<MoreIcon sx={{ fontSize: 14 }} />} label="Inne — pozostałe wydatki" size="small" />
          <Chip icon={<ShippingIcon sx={{ fontSize: 14 }} />} label="Wyprowadzka — naprawy, transport" size="small" />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>Co możesz zrobić z każdą pozycją:</Typography>
        <Feature label="Włącz / Wyłącz z budżetu" description="Ikona $ przy pozycji — wyłączone nie wliczają się do kosztów." />
        <Feature label="Zmień status" description="Kliknij chip 'Do zapłaty' / 'Opłacone' żeby przełączyć." />
        <Feature label="Menu ⋮ pozycji" description="Kliknij trzy kropki → edytuj, dodaj linki, alternatywy, usuń." />
        <Feature label="Rozwiń szczegóły" description="Strzałka ▶ po lewej — pokazuje MAIN cenę i alternatywy z linkami." />
        <Feature label="Uwagi" description="Pole tekstowe bezpośrednio w tabeli — wpisuj notatki na bieżąco." />
      </Section>

      {/* Grupy */}
      <Section title="Grupy" icon={<MenuIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          Każda zakładka kosztowa organizuje pozycje w grupy (np. pomieszczenia, etapy prac, producenci). Grupy mają własne menu ⋮ z akcjami:
        </Typography>
        <Feature label="Wygaś grupę" description="Wyklucza wszystkie pozycje z grupy z budżetu — bez ich usuwania. Przydatne do ukrywania opcjonalnych zakupów." />
        <Feature label="Zmień nazwę" description="Zmienia nazwę grupy na wszystkich pozycjach w niej." />
        <Feature label="Usuń grupę" description="Usuwa grupę wraz ze WSZYSTKIMI pozycjami — nieodwracalne. Jeśli chcesz tylko wyłączyć, użyj 'Wygaś'." />
        <Feature label="Nowa grupa" description="Przycisk w nagłówku strony — tworzy pustą grupę do której możesz dodawać pozycje." />
        <Tip>Wygaszona grupa jest przygaszona wizualnie i ma badge &quot;wygaszona&quot; — łatwo ją odróżnić.</Tip>
      </Section>

      {/* Alternatywy */}
      <Section title="Alternatywy cenowe" icon={<AltIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          Każda pozycja może mieć wiele wariantów cenowych (np. ten sam mebel w różnych sklepach, różne modele AGD). System automatycznie wylicza zakres min–max.
        </Typography>
        <Feature label="Dodaj alternatywę" description="Menu ⋮ → 'Alternatywy' lub rozwiń pozycję i kliknij '+' w sekcji ALT." />
        <Feature label="Ustaw jako MAIN" description="Rozwiń pozycję → kliknij ikonę ⇄ przy alternatywie → staje się nową ceną główną." />
        <Feature label="Porównuj ceny" description="Strzałki ↑↓ przy alternatywach pokazują czy są droższe/tańsze od MAIN." />
        <Feature label="Wpływ na scenariusze" description="Alternatywy tworzą rozpiętość min/max widoczną w dashboardzie i top barze." />
        <Tip>Przy opłacaniu pozycji z alternatywami pojawia się dialog &quot;którą opcję opłaciłeś?&quot; — żeby prawidłowo zaksięgować kwotę.</Tip>
      </Section>

      {/* Top Bar */}
      <Section title="Pasek budżetu (top bar)" icon={<TrendingDownIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          Widoczny na stronach kosztowych. Wizualizuje relację między dostępnymi środkami a kosztami:
        </Typography>
        <Feature label="Zielony segment" description="Od 0 do poziomu budżetu — to ile masz pieniędzy." />
        <Feature label="Czerwone segmenty" description="Koszty wykraczające poza budżet: ciemny = min, średni = plan, jasny = max." />
        <Feature label="Markery" description="Nad barem: koszt min. i max. Pod barem: plan kosztów i nasz budżet. Najedź żeby zobaczyć kwotę." />
        <Feature label="Kafelek bilansowy" description="Po prawej: nadwyżka (+) lub niedobór (−) — ile Ci brakuje lub zostaje." />
      </Section>

      {/* Import / Eksport */}
      <Section title="Import / Eksport" icon={<DataIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          Zarządzanie danymi — wczytywanie z pliku Excel, eksportowanie aktualnego stanu, generowanie szablonu.
        </Typography>
        <Feature label="Import" description="Przeciągnij plik .xlsx lub kliknij żeby wybrać. Dane z arkuszy zostają załadowane do aplikacji." />
        <Feature label="Eksport" description="Pobiera plik .xlsx z WSZYSTKIMI danymi (koszty, saldo, harmonogram, notatki) — kompatybilny z importem." />
        <Feature label="Szablon" description="Pobiera pusty plik .xlsx ze wszystkimi arkuszami i nagłówkami — gotowy do wypełnienia od zera." />
        <Feature label="Re-import" description="Ponowny import ZASTĘPUJE istniejące dane. Przed reimportem warto wyeksportować aktualny stan jako backup." />
        <Tip>Obsługiwane arkusze: Meble, Wykończenie, AGD, Pozostałe, Wyprowadzka, Saldo, Harmonogram, Notatki. Wystarczy jeden — reszta jest opcjonalna.</Tip>
      </Section>

      {/* Notatki */}
      <Section title="Notatki (Sticky Notes)" icon={<NotesIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          Panel po prawej stronie ekranu — Twoja lista TODO i szybkie notatki, widoczne na każdej stronie:
        </Typography>
        <Feature label="Dodawanie" description="Kliknij '+' w nagłówku panelu. Nowa notka pojawia się z autofocusem." />
        <Feature label="Edycja inline" description="Kliknij w tekst notki i zacznij pisać — bez modali." />
        <Feature label="Kolory" description="Najedź na notkę → ikona kółka → 6 kolorów do wyboru." />
        <Feature label="Oznacz jako zrobione" description="Checkbox po lewej — zrobione notatki idą na dół listy (przekreślone)." />
        <Feature label="Ukryj/Pokaż panel" description="Kliknij 'Notatki' na dole sidebara żeby schować/pokazać panel." />
        <Tip>Notatki są eksportowane wraz z danymi i przywracane przy imporcie.</Tip>
      </Section>

      {/* Wygaszanie */}
      <Section title="Wygaszanie (wyłączanie z budżetu)" icon={<DisableIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          Dwa poziomy wygaszania — możesz wyłączyć z budżetu pojedyncze pozycje lub całe grupy:
        </Typography>
        <Feature label="Pozycja → ikona $" description="Kliknij $ przy pozycji — staje się przygaszona i nie wlicza się do kosztów." />
        <Feature label="Grupa → menu ⋮ → Wygaś" description="Wygasza WSZYSTKIE pozycje w grupie naraz. Grupa jest wizualnie przygaszona." />
        <Feature label="Ponowne włączenie" description="Kliknij ponownie $ lub wybierz 'Włącz grupę' z menu ⋮." />
        <Tip>Wygaszanie jest odwracalne — nic nie jest usuwane. Przydatne do tymczasowego wykluczania opcjonalnych wydatków z analiz.</Tip>
      </Section>

      {/* Pominięte */}
      <Section title="Pominięte" icon={<DisableIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          Strona zbierająca wszystkie pozycje wykluczone z budżetu — w jednym miejscu widzisz co pominąłeś i ile zaoszczędziłeś.
        </Typography>
        <Feature label="Lista wyklucz. pozycji" description="Tabela pogrupowana wg kategorii (Meblowanie, Wykończenie, AGD...) z grupą, nazwą i kwotą." />
        <Feature label="Kafelek 'Zaoszczędzone'" description="Suma wszystkich pominiętych pozycji — ile nie wydasz." />
        <Feature label="Przywróć do budżetu" description="Ikonka ⊕ przy każdej pozycji — klik przywraca ją do budżetu (included = true)." />
        <Tip>Pominięte pozycje nie znikają z systemu — zawsze możesz je przywrócić jednym kliknięciem.</Tip>
      </Section>

      {/* Skróty */}
      <Section title="Skróty i wskazówki" icon={<MoneyIcon sx={{ fontSize: 18 }} />}>
        <Feature label="Logo → Podsumowanie" description="Kliknij 'Budget' w sidebarze żeby wrócić na stronę główną." />
        <Feature label="Motywy" description="Paleta kolorów na dole sidebara — 4 motywy: Ciemny, Stonowany, Jasny, Unicorn 🦄" />
        <Feature label="Status jednym kliknięciem" description="Kliknij chip statusu ('Do zapłaty' / 'Opłacone') żeby przełączyć." />
        <Feature label="Ikona ? przy tytule" description="Na stronach kosztowych — najedź żeby zobaczyć do czego służy dana zakładka." />
        <Feature label="Dane lokalne" description="Wszystko jest w localStorage przeglądarki. Wyczyszczenie danych przeglądarki = utrata danych. Rób eksport jako backup!" />
        <Feature label="Changelog" description="Strona w menu 'Ustawienia' — pełna historia zmian i nowych funkcji w każdej wersji." />
      </Section>
    </Box>
  );
}
