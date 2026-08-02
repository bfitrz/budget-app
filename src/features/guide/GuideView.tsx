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
          <Box sx={{ width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
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
    <Box sx={{ display: 'flex', gap: 1, p: 1.5, borderRadius: 2, backgroundColor: alpha(theme.palette.info.main, 0.06), border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`, mt: 1.5 }}>
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
      <Box sx={{ mb: 5 }}>
        <Typography variant="h2" sx={{ mb: 0.5 }}>Przewodnik</Typography>
        <Typography variant="body1" color="text.secondary">
          Wszystko co musisz wiedzieć, żeby w pełni korzystać z aplikacji
        </Typography>
      </Box>

      <Section title="Idea aplikacji" icon={<DashboardIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          Ta aplikacja powstała, żeby dać Ci pełną kontrolę nad budżetem wykończenia mieszkania. To nie jest prosty arkusz wydatków — to narzędzie, które pozwala Ci:
        </Typography>
        <Feature label="Planować budżet z góry" description="Wpisujesz wszystkie przewidywane wydatki zanim jeszcze je poniesiesz. Widzisz ile potrzebujesz i czy Ci wystarczy." />
        <Feature label="Śledzić co opłacone, a co jeszcze nie" description="Każda pozycja ma status 'Do zapłaty' lub 'Opłacone'. Na bieżąco widzisz postęp." />
        <Feature label="Porównywać ceny (alternatywy)" description="Ten sam mebel w trzech sklepach? Dodaj alternatywy cenowe i porównaj. Aplikacja obliczy wariant najtańszy i najdroższy." />
        <Feature label="Prognozować przyszłość" description="Wiesz, że za miesiąc dostaniesz wypłatę? Zaplanuj ją i zobacz na wykresie, kiedy budżet się domknie." />
        <Feature label="Analizować ryzyko" description="Scenariusze 'najtaniej / plan / najdrożej' pokazują czy masz zapas czy jest ciasno." />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, lineHeight: 1.8 }}>
          Dane przechowywane są wyłącznie w Twojej przeglądarce (localStorage). Nie wysyłamy ich nigdzie. Dlatego ważne jest regularne eksportowanie danych do pliku Excel — to Twój backup.
        </Typography>
      </Section>

      <Section title="Podsumowanie (strona główna)" icon={<DashboardIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          To Twój dashboard — jeden ekran z odpowiedzią na pytanie „ile mam, ile wydaję i czy mi się to spina?". Nie musisz tu nic wpisywać — wszystko oblicza się automatycznie na podstawie danych z innych zakładek.
        </Typography>
        <Feature label="Karty na górze (KPI)" description="Cztery liczby: łączne wpływy (ile pieniędzy wpłynęło do budżetu), dostępne środki (ile zostało po opłaceniu), opłacone (ile już wydałeś), do zapłaty (ile jeszcze musisz wydać)." />
        <Feature label="Bilans" description="Najważniejsza liczba. Zielona = masz więcej pieniędzy niż wydatków. Czerwona = brakuje Ci na pokrycie zaplanowanych kosztów. Bilans = wpływy minus łączne wydatki." />
        <Feature label="Wykres 'Wydatki wg kategorii'" description="Poziomy wykres słupkowy. Każda kategoria (Meble, Wykończenie, AGD, Inne, Wyprowadzka) ma słupek podzielony na część zieloną (opłacone) i pomarańczową (jeszcze do zapłaty)." />
        <Feature label="Wykres 'Struktura wydatków'" description="Donut (pierścień). Pokazuje procentowy udział każdej kategorii w całości budżetu. Szybko widzisz co zjada największą część." />
        <Feature label="Wykres 'Zakres cenowy'" description="Porównanie wariantów min/max w każdej kategorii. Widoczny tylko jeśli masz dodane alternatywy cenowe. Pokazuje ile zaoszczędzisz wybierając najtańsze opcje." />
        <Feature label="Scenariusze" description="Trzy warianty: 'Najtaniej' (gdybyś wszędzie wybrał najtańszą opcję), 'Obecny plan' (to co teraz masz wybrane), 'Najdrożej' (gdybyś wszędzie wybrał najdroższą). Przy każdym widzisz czy środki wystarczą." />
        <Feature label="Postęp płatności" description="Progress bar dla każdej kategorii i globalny. Pokazuje jaki procent zaplanowanych wydatków już opłaciłeś." />
        <Tip>Jeśli masz pozycje „wykluczone" (wykluczone z budżetu), każdy widget pokazuje też wariant „razem z wykluczonymi" — żebyś widział ile by kosztowało gdybyś nic nie wykluczał.</Tip>
      </Section>

      <Section title="Środki" icon={<SaldoIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          Tutaj rejestrujesz każdy grosz, który wpływa do Twojego budżetu remontowego. Może to być wypłata, przelew z konta oszczędnościowego, pożyczka od rodziny, zwrot podatku — cokolwiek zasila Twoje środki na wykończenie.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          <strong>Jak działają „Dostępne środki"?</strong> To prosta matematyka: suma wszystkich wpływów minus suma pozycji oznaczonych jako „Opłacone" w zakładkach wydatków. Jeśli wpłaciłeś 100 000 zł i opłaciłeś wydatki za 40 000 zł, dostępne środki = 60 000 zł.
        </Typography>
        <Feature label="Dodaj wpływ" description="Kliknij przycisk 'Dodaj wpływ'. Podaj datę, opis (np. 'Wypłata lipiec') i kwotę. Wpływ natychmiast pojawi się w tabeli i zaktualizuje bilans." />
        <Feature label="Wpływ bez daty = saldo początkowe" description="Jeśli zostawisz pole daty puste, wpływ traktowany jest jako pieniądze które miałeś na starcie. Przydatne gdy zaczynasz śledzić budżet w trakcie remontu." />
        <Feature label="Ujemna kwota" description="Wpisz kwotę ujemną (np. -500) żeby skorygować błąd lub odnotować nieoczekiwany wydatek spoza kategorii." />
        <Feature label="Edycja i usuwanie" description="Ikona ołówka = edytuj wpis. Ikona kosza = usuń. Każda zmiana natychmiast wpływa na bilans." />
        <Tip>Wpływy tutaj to pieniądze które MASZ. Przyszłe, planowane wpływy (których jeszcze nie otrzymałeś) wpisujesz w zakładce „Harmonogram" — tam służą do prognozowania.</Tip>
      </Section>

      <Section title="Harmonogram (prognoza)" icon={<ScheduleIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          Harmonogram odpowiada na pytanie: „kiedy będę miał wystarczająco pieniędzy na pokrycie wszystkich wydatków?". Wpisujesz tu przyszłe wpływy (pieniądze których jeszcze NIE masz, ale spodziewasz się je otrzymać) i widzisz na wykresie jak Twoje środki rosną w czasie.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          <strong>Różnica między „Środkami" a „Harmonogramem":</strong> W „Środkach" wpisujesz pieniądze które JUŻ masz (lub dostałeś). W „Harmonogramie" planujesz pieniądze które DOPIERO dostaniesz (np. przyszłomiesięczna wypłata).
        </Typography>
        <Feature label="Nowy wpływ" description="Kliknij '+ Wpływ'. Podaj datę (kiedy spodziewasz się pieniędzy), opis i kwotę. Pojawi się w tabeli i na wykresie." />
        <Feature label="Wykres prognozowy" description="Niebieska linia = Twoje środki rosnące w czasie (aktualnie + zaplanowane wpływy). Pomarańczowa przerywana = cel (ile musisz jeszcze zapłacić). Gdy niebieska przekroczy pomarańczową — masz na wszystko." />
        <Feature label="Zielony punkt na wykresie" description="Pierwszy punkt = Twoje dzisiejsze dostępne środki. Od niego linia rośnie z każdym zaplanowanym wpływem." />
        <Feature label="Oznacz jako zrealizowany" description="Gdy pieniądze faktycznie wpłyną na konto, kliknij checkbox. Zrealizowany wpływ znika z prognozy (bo jest już w 'Środkach')." />
        <Feature label="📌 Milestone (ważna data)" description="Przycisk 'Milestone' pozwala oznaczyć deadline (np. 'Termin oddania kluczy'). Na wykresie pojawia się pionowa linia — widzisz ile środków będziesz miał w tym dniu i czy wystarczy." />
        <Feature label="Komunikat pod wykresem" description="Zielony = zaplanowane wpływy wystarczą. Czerwony = nawet po wpływach brakuje pieniędzy — musisz znaleźć dodatkowe źródło." />
        <Tip>Zaplanowane wpływy NIE wliczają się do dostępnych środków na dashboardzie. Pojawiają się tylko w prognozie na wykresie. Dopiero po oznaczeniu jako „zrealizowane" wpływają na bilans.</Tip>
      </Section>

      <Section title="Zakładki wydatków (Meble, Wykończenie, AGD, Inne, Wyprowadzka)" icon={<ChairIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          Pięć zakładek, każda dla innego typu wydatków. Działają identycznie — różnią się tylko polami (meble mają „pomieszczenie" i „kategorię", wykończenie ma „etap", AGD ma „producenta" i „model"). Pozycje w każdej zakładce są pogrupowane:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip icon={<ChairIcon sx={{ fontSize: 14 }} />} label="Meble — pogrupowane wg pomieszczeń (salon, sypialnia...)" size="small" />
          <Chip icon={<BuildIcon sx={{ fontSize: 14 }} />} label="Wykończenie — wg etapów (łazienka, elektryka...)" size="small" />
          <Chip icon={<KitchenIcon sx={{ fontSize: 14 }} />} label="AGD / RTV — wg producenta (Bosch, Samsung...)" size="small" />
          <Chip icon={<MoreIcon sx={{ fontSize: 14 }} />} label="Inne — wg dowolnych grup" size="small" />
          <Chip icon={<ShippingIcon sx={{ fontSize: 14 }} />} label="Wyprowadzka — wg grup (transport, naprawy...)" size="small" />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>Anatomia jednej pozycji:</Typography>
        <Feature label="Strzałka ▶ (rozwiń)" description="Kliknij strzałkę po lewej aby zobaczyć szczegóły: cenę główną (GŁÓWNA), alternatywy (ALT), linki do sklepów i uwagi." />
        <Feature label="Status pozycji (dropdown)" description="Każda pozycja ma dropdown z trzema statusami: 'Do zapłaty' (w budżecie, czeka), 'Opłacone' (zapłacone — kwota odjęta od środków), 'Wykluczone' (tymczasowo poza budżetem). Zmiana statusu na 'Opłacone' przy pozycji z alternatywami pyta 'którą opcję opłaciłeś?'." />
        <Feature label="Cena i zakres" description="Jeśli masz alternatywy, pod ceną główną zobaczysz zakres min—max. Zakres wpływa na scenariusze na dashboardzie." />
        <Feature label="Menu ⋮ (trzy kropki)" description="Otwiera menu kontekstowe: Edytuj (zmień nazwę, cenę, grupę), Linki (dodaj URL do sklepu), Alternatywy (dodaj inną opcję cenową), Usuń." />
        <Feature label="Ikona 💬 (uwagi)" description="Jeśli pozycja ma uwagi, pojawia się ikona bąbelka. Najedź aby zobaczyć treść. Uwagi dodajesz przez menu Edytuj." />
        <Tip>Każda pozycja może mieć opcjonalne pole „Planowana data wydatku". Jeśli je podasz, na wykresie prognozowym koszt pojawi się dopiero od tej daty (linia celu podskoczy w tym dniu). Puste = potrzebne teraz.</Tip>
      </Section>

      <Section title="Grupy" icon={<MenuIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          W każdej zakładce wydatków pozycje są zorganizowane w rozwijane grupy (accordiony). Grupy to np. pomieszczenia (dla mebli), etapy prac (dla wykończenia) lub producenci (dla AGD). Każda grupa ma swoje podsumowanie kosztów i menu ⋮ z akcjami.
        </Typography>
        <Feature label="Wyklucz grupę" description="Menu ⋮ → 'Wyklucz grupę'. Wyklucza WSZYSTKIE pozycje w grupie z budżetu naraz. Grupa się przyciemnia i dostaje badge 'wykluczona'. Przydatne gdy chcesz tymczasowo wykluczyć cały pokój (np. 'zobaczymy czy starczy na gabinet')." />
        <Feature label="Przywróć grupę" description="Menu ⋮ → 'Przywróć grupę'. Przywraca wszystkie pozycje z powrotem do budżetu (status 'Do zapłaty')." />
        <Feature label="Zmień nazwę" description="Menu ⋮ → 'Zmień nazwę'. Zmienia nazwę grupy na wszystkich pozycjach w niej. Np. 'Pokój 1' → 'Sypialnia'." />
        <Feature label="Usuń grupę" description="Menu ⋮ → 'Usuń grupę'. UWAGA: usuwa grupę wraz ze WSZYSTKIMI pozycjami w środku. Nieodwracalne! Pojawi się dialog z potwierdzeniem i łączną wartością." />
        <Feature label="Nowa grupa" description="Przycisk 'Nowa grupa' w nagłówku strony. Tworzy pustą grupę, do której możesz dodawać pozycje." />
        <Feature label="Dodaj do grupy" description="Na dole każdej grupy jest przycisk 'Dodaj do {nazwa}'. Nowa pozycja automatycznie trafi do tej grupy." />
        <Tip>Wykluczenie grupy to NIE to samo co usuwanie. Wykluczenie jest odwracalne — pozycje nadal istnieją, tylko nie wliczają się do budżetu. Usuwanie jest trwałe.</Tip>
      </Section>

      <Section title="Alternatywy cenowe" icon={<AltIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          Kluczowa funkcja aplikacji. Pozwala Ci dodać wiele wariantów cenowych do jednej pozycji — np. ten sam stół w IKEA, Agata Meble i na Allegro. Albo trzy różne modele zmywarki. Aplikacja obliczy wariant najtańszy i najdroższy, co pozwoli Ci zobaczyć „rozpiętość" budżetu.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          <strong>Jak to działa:</strong> Każda pozycja ma jedną cenę „MAIN" (to Twój aktualny wybór) i dowolną liczbę alternatyw (ALT). Główna jest brana do obliczeń. Alternatywy służą do porównań i scenariuszy.
        </Typography>
        <Feature label="Dodaj alternatywę" description="W tabeli kliknij menu ⋮ przy pozycji → 'Alternatywy'. Podaj nazwę (np. 'IKEA Kallax'), cenę i opcjonalnie link." />
        <Feature label="Zamień na główną (Ustaw jako MAIN)" description="W menu ⋮ przy alternatywie → 'Ustaw jako MAIN'. Zamienia ją z ceną główną — stara główna staje się alternatywą. Przydatne gdy zdecydujesz się na inną opcję." />
        <Feature label="Porównanie cenowe" description="Strzałka ↓ (zielona) = tańsze niż główna. Strzałka ↑ (pomarańczowa) = droższe. Linia — = taka sama cena." />
        <Feature label="Wyłącz alternatywę" description="Ikona $ przy alternatywie. Wyłączona alternatywa nie wlicza się do zakresu min/max. Przydatne gdy odrzuciłeś opcję." />
        <Feature label="Wpływ na scenariusze" description="Dashboard bierze najtańszą i najdroższą alternatywę (ze wszystkich pozycji) i buduje scenariusze. Więcej alternatyw = lepszy obraz ryzyka." />
        <Feature label="Opłacanie pozycji z alternatywami" description="Gdy klikniesz 'Opłacone' na pozycji z alternatywami, pojawi się pytanie 'Którą opcję opłaciłeś?'. Wybierz — cena się zaktualizuje i pozycja zostanie zaksięgowana prawidłowo." />
        <Tip>Każda alternatywa może mieć własne linki i uwagi. Rozwiń pozycję i kliknij ikonę ołówka lub linku przy konkretnej alternatywie.</Tip>
      </Section>

      <Section title="Pasek budżetu (widoczny w zakładkach wydatków)" icon={<TrendingDownIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          Na stronach wydatków (Meble, Wykończenie, AGD, Inne, Wyprowadzka) na górze ekranu widzisz poziomy pasek z kolorowymi segmentami i markerami. To wizualne porównanie „ile mam" vs „ile wydaję":
        </Typography>
        <Feature label="Zielony segment" description="Twoje dostępne środki (budżet). Im dłuższy, tym więcej masz." />
        <Feature label="Czerwone segmenty" description="Wydatki wykraczające poza budżet. Ciemny czerwony = minimum (gdybyś wszędzie wybrał najtańsze). Średni = obecny plan. Jasny = maksimum (gdybyś wszędzie wybrał najdroższe)." />
        <Feature label="Markery (kropki nad/pod barem)" description="Najedź na kropkę aby zobaczyć kwotę. Nad barem: koszt minimalny i maksymalny. Pod barem: plan wydatków i Twój budżet." />
        <Feature label="Kafelek bilansu (po prawej)" description="Zielony z '+' = masz nadwyżkę (więcej niż potrzebujesz). Czerwony z '−' = brakuje Ci pieniędzy." />
      </Section>

      <Section title="Import i eksport danych" icon={<DataIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          Zakładka do zarządzania danymi. Możesz zasilić aplikację danymi z pliku Excel, wyeksportować aktualny stan jako backup, lub pobrać pusty szablon do wypełnienia.
        </Typography>
        <Feature label="Import (przeciągnij plik)" description="Przeciągnij plik .xlsx na strefę lub kliknij aby wybrać z dysku. Aplikacja przeczyta arkusze i załaduje dane. Obsługiwane arkusze: Meble, Wykończenie, AGD, Pozostałe, Wyprowadzka, Saldo, Harmonogram, Milestones, Notatki." />
        <Feature label="Ponowny import" description="UWAGA: ponowny import ZASTĘPUJE wszystkie obecne dane. Zrób najpierw eksport jako backup!" />
        <Feature label="Eksport" description="Pobiera plik .xlsx ze WSZYSTKIMI danymi (wydatki, wpływy, harmonogram, alternatywy, linki). Plik jest kompatybilny z importem — możesz go wczytać ponownie." />
        <Feature label="Szablon" description="Pobiera pusty plik .xlsx ze wszystkimi arkuszami i nagłówkami. Przydatny gdy chcesz zacząć od zera w Excelu i potem zaimportować." />
        <Feature label="Wyczyść dane" description="Czerwony przycisk na dole strony. Trwale usuwa WSZYSTKIE dane z przeglądarki. Nieodwracalne — pojawia się dialog z potwierdzeniem." />
        <Tip>Dane przechowywane są w pamięci przeglądarki (localStorage). Wyczyszczenie danych przeglądarki, zmiana profilu lub reinstalacja = utrata danych. Regularnie rób eksporty!</Tip>
      </Section>

      <Section title="Wykluczanie z budżetu" icon={<DisableIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          Nie wszystko co zaplanowałeś musisz kupić. Funkcja wykluczania pozwala Ci tymczasowo wykluczyć pozycje lub całe grupy bez ich usuwania. Wykluczone pozycje przestają wpływać na bilans, ale nadal istnieją w systemie.
        </Typography>
        <Feature label="Wyklucz pojedynczą pozycję" description="W dropdownie statusu wybierz 'Wykluczone'. Pozycja się przyciemnia i przestaje wpływać na bilans. Zmień status z powrotem na 'Do zapłaty' aby przywrócić." />
        <Feature label="Wyklucz całą grupę" description="Menu ⋮ przy grupie → 'Wyklucz grupę'. Wyklucza naraz wszystkie pozycje w grupie." />
        <Feature label="Strona 'Wykluczone'" description="W menu nawigacyjnym, pod kategoriami wydatków. Zbiera wszystkie wykluczone pozycje w jednym miejscu. Widzisz ile łącznie zaoszczędziłeś wykluczając te pozycje." />
        <Feature label="Przywróć do budżetu" description="Na stronie 'Wykluczone' przy każdej pozycji jest ikona przywrócenia (↺). Klik przywraca ją do budżetu." />
        <Feature label="Wpływ na dashboard" description="Dashboard pokazuje wersję 'razem z wykluczonymi' przy każdym widgecie — żebyś widział ile by kosztowało gdybyś nic nie wykluczał." />
        <Tip>Wykluczenie jest w 100% odwracalne. To nie jest usuwanie — dane pozostają. Używaj do tymczasowego ukrywania opcjonalnych zakupów, np. 'jeśli starczy budżetu to wrócimy do tego'.</Tip>
      </Section>

      <Section title="Wyszukiwanie, filtrowanie i sortowanie" icon={<MoneyIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          Na stronach wydatków pod nagłówkiem znajduje się pasek narzędzi: pole wyszukiwania, szybkie filtry statusu i sortowanie.
        </Typography>
        <Feature label="Wyszukiwanie" description="Wpisz fragment nazwy, grupy lub innego pola — lista filtruje się na żywo. Grupy bez wyników znikają, pozostałe rozwijają się automatycznie." />
        <Feature label="Filtry statusu" description="Toggle buttons: Wszystkie / Do zapłaty / Opłacone / Wykluczone. Kliknij aby zobaczyć tylko pozycje z danym statusem." />
        <Feature label="Sortowanie" description="Dropdown: Domyślnie / Cena ↑ / Cena ↓ / Nazwa A-Z / Status. Sortuje pozycje wewnątrz każdej grupy." />
        <Feature label="Licznik wyników" description="Przy aktywnym filtrze wyświetla 'X z Y pozycji' — żebyś wiedział ile zostało ukryte." />
        <Tip>Wyszukiwanie i filtry działają razem — możesz wpisać „IKEA" i wybrać filtr „Do zapłaty" żeby zobaczyć co z IKEA jeszcze nie opłacone.</Tip>
      </Section>

      <Section title="Undo / Redo" icon={<MoneyIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          Przypadkowo usunąłeś pozycję lub zmieniłeś status? Ctrl+Z cofnie ostatnią akcję.
        </Typography>
        <Feature label="Cofnij (Ctrl+Z / Cmd+Z)" description="Cofa ostatnią zmianę — dodanie, usunięcie, edycję, zmianę statusu. Działa na max 30 ostatnich kroków." />
        <Feature label="Przywróć (Ctrl+Shift+Z)" description="Przywraca cofniętą akcję. Działa do momentu aż wykonasz nową zmianę." />
        <Feature label="Toast 'Cofnięto'" description="Po cofnięciu w prawym górnym rogu pojawia się potwierdzenie." />
      </Section>

      <Section title="Przeterminowane pozycje i backup" icon={<MoneyIcon sx={{ fontSize: 18 }} />}>
        <Feature label="Czerwona data = przeterminowane" description="Jeśli pozycja ma datę realizacji w przeszłości i status 'Do zapłaty', chip z datą zmienia kolor na czerwony. Łatwo widać co jest po terminie." />
        <Feature label="Najtańsza alternatywa podświetlona" description="W rozwinięciu pozycji najtańsza ALT (tańsza niż MAIN) ma zielone obramowanie — szybko widzisz najlepszą cenę." />
        <Feature label="Reminder o backupie" description="Jeśli minęło >7 dni od ostatniego eksportu, na stronie Dane i sync pojawi się alert z przypomnieniem i przyciskiem 'Eksportuj teraz'." />
      </Section>

      <Section title="Synchronizacja z Google Drive" icon={<DataIcon sx={{ fontSize: 18 }} />}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          Aplikacja może zapisywać dane jako plik .xlsx na Twoim Google Drive. Dzięki temu masz backup w chmurze i możesz współdzielić budżet z innymi osobami (partnerem, współlokatorem).
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>Jak połączyć:</Typography>
        <Feature label="1. Kliknij 'Google Drive'" description="Na ekranie startowym (pierwszy raz) lub na stronie 'Dane i sync' w sekcji 'Zmień połączenie'." />
        <Feature label="2. Zaloguj się" description="Otworzy się popup Google — zaloguj się na swoje konto. Aplikacja prosi tylko o dostęp do plików które sama stworzyła (scope drive.file). Nie widzi Twoich maili, zdjęć ani innych plików." />
        <Feature label="3. Wybierz lub utwórz plik" description="Po zalogowaniu pojawi się lista Twoich plików .xlsx na Drive. Wybierz istniejący lub kliknij 'Zapisz jako...' żeby stworzyć nowy." />
        <Feature label="4. Gotowe — auto-sync" description="Od teraz aplikacja zapisuje zmiany do tego pliku automatycznie (co kilka sekund, konfigurowalne)." />
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>Współdzielenie z inną osobą:</Typography>
        <Feature label="1. Udostępnij plik na Drive" description="Wejdź na drive.google.com → znajdź plik budżetu → klik prawym → 'Udostępnij' → wpisz email drugiej osoby → ustaw uprawnienie 'Edytujący'." />
        <Feature label="2. Druga osoba otwiera apkę" description="Wysyłasz jej link do aplikacji. Klika 'Google Drive', loguje się na SWOJE konto Google." />
        <Feature label="3. Widzi udostępniony plik" description="Na liście plików pojawi się plik który jej udostępniłeś. Klika go — i pracuje na tych samych danych." />
        <Feature label="Jak to działa" description="Oboje zapisujecie do tego samego pliku na Drive. Kto ostatni zapisał — jego wersja jest aktualna. Nie jest to edycja w czasie rzeczywistym (jak Google Docs), ale przy budżecie domowym wystarczy." />
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>Ustawienia synchronizacji (strona 'Dane i sync'):</Typography>
        <Feature label="Auto-zapis" description="Switch włącza/wyłącza automatyczne zapisywanie. Suwak ustawia interwał (5–120 sekund). Domyślnie: co 30s po ostatniej zmianie." />
        <Feature label="Sprawdzaj zmiany" description="Switch włącza/wyłącza automatyczne sprawdzanie czy ktoś inny zmienił plik. Suwak (10–120s) ustawia jak często. Jeśli wykryje zmianę innej osoby, pokaże animowany banner na górze ekranu z imieniem osoby i przyciskiem 'Wczytaj'. Banner jest widoczny na każdej stronie i nie znika przy scrollowaniu. Własne zapisy są ignorowane." />
        <Feature label="Powiadomienia sync" description="Po każdym udanym autozapisie pojawia się toast 'Zapisano do chmury'. Po wczytaniu zmian: 'Wczytano zmiany z chmury'. Przy błędzie: 'Synchronizacja nie powiodła się'." />
        <Feature label="Status połączenia" description="Gdy sesja Google wygaśnie, w prawym górnym rogu pojawi się stały blok 'Brak połączenia' z przyciskiem 'Połącz'. Toasty pojawiają się pod nim. Blok znika po ponownym połączeniu." />
        <Feature label="Kto ostatnio edytował" description="Na stronie 'Dane i sync' widać imię osoby która ostatnio zapisała plik. W bannerze zmian też wyświetla się imię — wiesz kto co zmienił." />
        <Feature label="Zapisz teraz" description="Ręczny zapis natychmiast — niezależnie od auto-zapisu." />
        <Feature label="Zapisz jako..." description="Tworzy NOWY plik na Drive z podaną nazwą. Przydatne do tworzenia kopii lub nowego budżetu." />
        <Feature label="Wczytaj inny plik" description="Otwiera listę plików .xlsx z Drive — możesz przełączyć się na inny plik (np. stary backup)." />
        <Feature label="Zmień połączenie" description="Przełącz między Google Drive a localStorage. W przyszłości będzie też Dropbox." />
        <Feature label="Odłącz" description="Rozłącza synchronizację i usuwa token. Dane lokalne pozostają — nic nie jest kasowane." />
        <Tip>Token Google wygasa po 1 godzinie. Gdy wygaśnie, aplikacja automatycznie pokaże popup logowania ponownie — wystarczy kliknąć swoje konto. Dane nie są tracone.</Tip>
        <Tip>Twoje hasło do Google NIGDY nie przechodzi przez aplikację. Logowanie odbywa się bezpośrednio na stronie Google. Aplikacja dostaje tylko token z ograniczonym dostępem do plików które sama stworzyła.</Tip>
      </Section>

      <Section title="Skróty i wskazówki" icon={<MoneyIcon sx={{ fontSize: 18 }} />}>
        <Feature label="Nawigacja mobilna (swipe)" description="Na telefonie przesuń palcem z lewej do prawej aby otworzyć menu nawigacji. Przesuń z powrotem lub kliknij poza menu aby zamknąć." />
        <Feature label="Logo → Podsumowanie" description="Kliknij logo 'Budget' w pasku bocznym aby wrócić na stronę główną (dashboard)." />
        <Feature label="Przycisk Odśwież (↻)" description="Ikona obok logo (desktop) lub obok X (mobile). Przeładowuje aplikację — przydatne po aktualizacji lub gdy coś się zawiesi." />
        <Feature label="Motywy kolorystyczne" description="Paleta kolorów na dole paska bocznego. 4 motywy: Ciemny, Stonowany, Jasny, Unicorn 🦄. Wybór jest zapisywany między sesjami." />
        <Feature label="Status z dropdown" description="Zmiana statusu bezpośrednio w tabeli — dropdown 'Do zapłaty' / 'Opłacone' / 'Wykluczone'. Nie musisz otwierać modala edycji." />
        <Feature label="Ikona ? przy tytule" description="Na stronach wydatków przy podtytule jest ikona znaku zapytania. Najedź aby zobaczyć krótki opis do czego służy dana zakładka." />
        <Feature label="Notyfikacje" description="Po każdej akcji (dodanie, edycja, usunięcie) w prawym górnym rogu pojawia się krótki toast z potwierdzeniem. Znika po 5 sekundach." />
        <Feature label="Linki do sklepów" description="Każda pozycja i alternatywa może mieć linki URL (np. do produktu w sklepie). Dodaj przez menu ⋮ → Linki lub rozwiń pozycję i kliknij ikonę linku." />
        <Feature label="PWA (instalacja)" description="Aplikacja jest instalowalna jako PWA. W przeglądarce kliknij 'Zainstaluj' lub 'Dodaj do ekranu głównego'. Działa jak osobna apka." />
      </Section>
    </Box>
  );
}
