# UX Writing — Budget App
## Kompletny dokument referencyjny

> Terminologia obowiązująca w całej aplikacji:
> - **Wydatek** (nie: koszt) — pojedynczy element do zapłacenia
> - **Opłacone** (nie: zapłacone, zrealizowane) — status wydatku
> - **Środki** (nie: saldo, pieniądze) — dostępne pieniądze
> - **Wpływ** (nie: wpis, transakcja) — pieniądze wpływające do budżetu
> - **Usuń** (nie: skasuj) — akcja kasowania
> - **Budżet** (nie: limit) — suma dostępnych środków
> - **Pominiętych** (nie: pominięte — w kontekście „razem z pominiętymi")
> - **Alternatywa** (nie: wariant cenowy) — inna opcja zakupowa

---

## 1. Nawigacja (Layout.tsx)

### Sekcje i elementy menu

```
Sekcja: "Przegląd"
  - dashboard  → "Podsumowanie"
  - saldo      → "Środki"
  - harmonogram → "Prognoza"

Sekcja: "Wydatki"
  - meble       → "Meble"
  - wykonczenie → "Wykończenie"
  - agd         → "AGD / RTV"
  - pozostale   → "Inne"
  - wyprowadzka → "Przeprowadzka"
  - wykluczone  → "Pominięte"

Sekcja: "System"
  - import    → "Dane"
  - guide     → "Przewodnik"
  - changelog → "Co nowego"
```

### Etykiety motywów (Layout.tsx → themeOptions)

```
dark:    label: "Ciemny"      description: "Głęboka czerń"
dim:     label: "Stonowany"   description: "Miękki, cieplejszy"
light:   label: "Jasny"       description: "Neutralna biel"
unicorn: label: "Unicorn"     description: "Neon & pastele 🦄"
```

Tytuł popovera motywów: **"Motyw"**

### Notatki (toggle w sidebarze)
Label: **"Notatki"**

---

## 2. Pasek budżetu (BudgetTopBar.tsx)

### Markery (Tooltip)

```
Marker min kosztów:  label: "Minimum"       value: kwota
Marker max kosztów:  label: "Maksimum"      value: kwota
Marker planu:        label: "Plan wydatków"  value: kwota
Marker budżetu:     label: "Budżet"        value: kwota
```

### Kafelek bilansu

```
Label:              "Bilans"
Pozytywny podpis:   "nadwyżka"
Negatywny podpis:   "brakuje"
```

---

## 3. Dashboard (DashboardView.tsx)

### Nagłówek

```
Tytuł:   "Podsumowanie"
Podtytuł: "Stan budżetu w jednym miejscu"
```

### Karty KPI

```
Karta 1: "Łączne wpływy"
Karta 2: "Dostępne środki"
Karta 3: "Opłacone"
  - subtitle (z pominiętymi): "{X}% budżetu · {Y}% razem z pominiętymi"
  - subtitle (bez):           "{X}% budżetu"
Karta 4: "Do zapłaty"
  - subtitle (z pominiętymi): "Razem z pominiętymi: {kwota}"
```

### Karta Bilans

```
Label:    "Bilans"
Wartość:  kwota (zielona/czerwona)
Pozytywny opis:  "Środki wystarczają na wszystkie zaplanowane wydatki"
Negatywny opis:  "Brakuje środków na pokrycie zaplanowanych wydatków"

Z pominiętymi:   "Razem z pominiętymi: {kwota}"
Oszczędność:     "Oszczędzasz na pominiętych: {kwota}"

Łączny koszt:    "Łączne wydatki"
Z pominiętymi:   "Razem z pominiętymi: {kwota}"
```

### Wykres: Wydatki wg kategorii

```
Tytuł:    "Wydatki wg kategorii"
Podtytuł: "Opłacone i pozostałe do zapłaty"
Legenda:  "Opłacone" / "Do zapłaty"
```

### Wykres: Struktura kosztów (donut)

```
Tytuł:    "Struktura wydatków"
Podtytuł: "Procentowy podział wg kategorii"
  (z pominiętymi): "Procentowy podział wg kategorii (+ pominięte)"
```

### Wykres: Zakres cenowy

```
Tytuł:    "Zakres cenowy"
Podtytuł: "Ile zapłacisz w zależności od wybranych wariantów"
Legenda:  "Najtaniej" / "Obecny wybór" / "Najdrożej"
Tooltip:  "Minimum" / "Aktualny" / "Maksimum"
```

### Scenariusze

```
Tytuł:    "Scenariusze"
Podtytuł: "Czy środki wystarczą w każdym wariancie?"

Scenariusz 1: "Najtaniej"
Scenariusz 2: "Obecny plan"
Scenariusz 3: "Najdrożej"

Pozytywny:  "Nadwyżka"
Negatywny:  "Brakuje"

Podsumowanie:
  "Różnica między wariantami: {kwota}"
  "Możesz zaoszczędzić: {kwota}"

Z pominiętymi: "Razem z pominiętymi: {kwota}"
```

### Postęp płatności wg kategorii

```
Tytuł:    "Postęp płatności"
Podtytuł: "Ile opłacono w każdej kategorii"
Z pominiętymi: "Razem z pominiętymi: {opłacone} / {total} ({X}%)"
```

### Postęp płatności (globalny)

```
Tytuł:    "Postęp płatności"
Podtytuł: "{opłacone} z {total} opłacone"
  (z pominiętymi): "{opłacone} z {total} opłacone (razem z pominiętymi: {totalFull})"
Z pominiętymi label: "Razem z pominiętymi: {opłacone} / {totalFull}"
```

### Empty State (wszystkie wykresy)

```
"Nie masz jeszcze danych. Zaimportuj plik Excel lub dodaj pozycje ręcznie."
```

---

## 4. Środki (SaldoView.tsx)

### Nagłówek

```
Tytuł:   "Środki"
Podtytuł: "Wpływy do budżetu — wypłaty, oszczędności, zwroty"
```

### Karty KPI

```
Karta 1: "Dostępne środki"
  podpis: "wpływy minus opłacone wydatki"

Karta 2: "Łączne wpływy"

Karta 3: "Wydane"
```

### Przycisk

```
"Dodaj wpływ"
```

### Tabela — nagłówki

```
"Data" | "Opis" | "Kwota" | (akcje)
```

### Tabela — empty state

```
Ikona: TrendingUp
Tekst: "Brak wpływów. Dodaj pierwszy — np. wypłatę lub przelew z oszczędności."
```

### Chip daty (brak daty)

```
"Start"  →  "Saldo początkowe"
```

### Dialog

```
Tytuł (dodawanie): "Nowy wpływ"
Tytuł (edycja):    "Edytuj wpływ"

Pole Data:
  label: "Data"
  helperText: "Zostaw puste dla salda początkowego"

Pole Opis:
  label: "Opis"
  (walidacja): "Pole wymagane"

Pole Kwota:
  label: "Kwota"
  helperText: "Ujemna kwota oznacza korektę"

Przyciski: "Anuluj" | "Dodaj" / "Zapisz"
```

---

## 5. Prognoza (HarmonogramView.tsx)

### Nagłówek

```
Tytuł:   "Prognoza"
Podtytuł: "Zaplanuj przyszłe wpływy i sprawdź, kiedy budżet pokryje wszystkie wydatki"
```

### Przyciski nagłówka

```
"Ważna data"  (zamiast "Milestone")
"Nowy wpływ"  (zamiast "+ Wpływ")
```

### Karty KPI

```
Karta 1: "Dostępne środki"
Karta 2: "Zaplanowane wpływy"
Karta 3: "Pozostaje do zapłaty"
Karta 4: "Prognozowany bilans"
```

### Wykres

```
Tytuł:    "Prognoza środków"
Podtytuł: "Niebieska linia to Twoje środki po kolejnych wpływach. Gdy przekroczy pomarańczową — budżet się domyka."
```

### Legenda wykresu

```
"Dostępne środki: {kwota}"
"Prognoza środków"
"Cel: {kwota} (do zapłaty)"
"Razem z pominiętymi: {kwota}"
"📌 Ważne daty ({count})"
```

### Tooltip wykresu

```
Data: {data}
"Dostępne teraz: {kwota}"
"Wpływy do tej daty: +{kwota}"
"Prognoza środków: {kwota}"
---
"Cel (do zapłaty): {kwota}"
Pozytywny: "Nadwyżka: +{kwota}"
Negatywny: "Brakuje: −{kwota}"
---
Z pominiętymi: "Razem z pominiętymi: {kwota}"
```

### Komunikat ostrzegawczy (czerwony)

```
"Po uwzględnieniu zaplanowanych wpływów wciąż brakuje {kwota} na pokrycie wszystkich wydatków."
```

### Komunikat pozytywny (zielony)

```
"Zaplanowane wpływy wystarczą na pokrycie wydatków. Nadwyżka: {kwota}."
```

### Tabela — nagłówki

```
"✓" | "Data" | "Opis" | "Kwota" | (akcje)
```

### Tabela — empty state

```
Ikona: Schedule
Tekst: "Brak zaplanowanych wpływów."
Podtekst: "Dodaj przyszłe wpływy — np. wypłatę, zwrot podatku lub przelew z oszczędności."
```

### Chip statusu w tabeli

```
"Zrealizowany"  (zamiast "Zrealizowane")
```

### Tooltip checkbox

```
Zaznaczony:    "Oznacz jako niezrealizowany"
Niezaznaczony: "Oznacz jako zrealizowany"
```

### Dialog — nowy wpływ

```
Tytuł (dodawanie): "Nowy planowany wpływ"
Tytuł (edycja):    "Edytuj planowany wpływ"
Opis: (usunąć — redundantny)

Pole Data:
  label: "Data"
  (walidacja): "Pole wymagane"

Pole Opis:
  label: "Opis"
  placeholder: "np. Wypłata wrzesień"
  (walidacja): "Pole wymagane"

Pole Kwota:
  label: "Kwota"
  (walidacja): "Pole wymagane" / "Minimalna kwota: 1 zł"

Przyciski: "Anuluj" | "Zaplanuj" / "Zapisz"
```

### Dialog — ważna data

```
Tytuł: "📌 Ważna data"
Opis:  "Oznacz termin lub deadline. Pojawi się na wykresie jako punkt kontrolny z prognozą środków."

Pole Data:
  label: "Data"
  (walidacja): "Pole wymagane"

Pole Opis:
  label: "Opis"
  placeholder: "np. Termin oddania kluczy"
  (walidacja): "Pole wymagane"

Przyciski: "Anuluj" | "Dodaj"
```

### Tooltip ważnej daty (chip pod wykresem)

```
"📌 {opis} — {data}"
"Dostępne teraz: {kwota}"
"Wpływy do tej daty: +{kwota}"
"Prognoza środków: {kwota}"
---
"Do zapłaty: {kwota}"
Pozytywny: "Nadwyżka: +{kwota}"
Negatywny: "Brakuje: −{kwota}"
```

---

## 6. Zakładki kosztowe (CostCategoryView.tsx + *View.tsx)

### Konfiguracje poszczególnych zakładek

#### Meble (MebleView.tsx)

```
title:    "Meble"
subtitle: "Meble i wyposażenie — pogrupowane wg pomieszczeń"
helpText: "Wszystko co kupujesz do mieszkania: meble, lampy, dekoracje, tekstylia.
           Porównuj ceny z różnych sklepów (alternatywy) i śledź statusy płatności."
```

#### Wykończenie (WykonczenieView.tsx)

```
title:    "Wykończenie"
subtitle: "Prace remontowe i materiały — pogrupowane wg etapów"
helpText: "Malowanie, płytki, podłogi, armatura, instalacje — rozliczenia z ekipami
           i koszty materiałów. Pogrupowane wg etapów lub pomieszczeń."
```

#### AGD / RTV (AGDView.tsx)

```
title:    "AGD / RTV"
subtitle: "Sprzęt domowy i elektronika — pogrupowane wg producenta"
helpText: "Pralka, lodówka, zmywarka, telewizor i reszta. Pogrupowane wg producenta
           — porównuj modele i ceny między sklepami."
```

#### Inne (PozostaleView.tsx)

```
title:    "Inne wydatki"
subtitle: "Opłaty, ubezpieczenia i inne koszty"
helpText: "Wszystko co nie pasuje do pozostałych kategorii: opłaty notarialne,
           ubezpieczenie, drobne zakupy, usługi."
```

#### Przeprowadzka (WyprowadzkaView.tsx)

```
title:    "Przeprowadzka"
subtitle: "Transport, naprawy i logistyka"
helpText: "Koszty opuszczenia obecnego mieszkania: naprawy (malowanie, łatanie ścian),
           transport mebli, utylizacja starych sprzętów."
```

### Przyciski nagłówka

```
"Nowa grupa"
"Dodaj pozycję"
```

### Karty podsumowania

```
Karta 1 — label: "Opłacone / Suma"
  - pod progress barem: "Do zapłaty: {kwota}"
  - procent: "{X}%"
  - pominięte: "+ {kwota} w pominiętych ({count} poz.)"

Karta 2 — label: "Zakres cenowy"
  - z alternatywami: "{min} — {max}" + "Aktualny plan: {kwota}" + "{count} alt."
  - bez alternatyw: "{kwota}" + "Brak alternatyw — stała kwota"

Karta 3 — label: "Statystyki"
  - "Pozycje":      "{opłacone} / {total}"
  - "Grupy":        "{count}"
  - "Pominięte":    "{count}"
  - "Alternatywy":  "{count}"
  - "Z uwagami":    "{count}"
```

### Empty state (brak pozycji)

```
"Brak pozycji — dodaj nową lub zaimportuj dane z pliku Excel."
```

### Accordion grupy

```
Chip licznik:  "{count} poz."
Chip wygaszona: "wyłączona"  (zamiast "wygaszona")
Chip opłacone:  "{X}/{Y} opł."

Przycisk na dole grupy: "Dodaj do „{nazwa}""
Footer: "Opłacone: {kwota}" | "Razem: {kwota}"
```

### Tabela — nagłówki

```
(expand) | ($) | {kolumny dynamiczne} | "Cena" | "Status" | (akcje)
```

### Status chip (w tabeli)

```
"Opłacone"   (zielony)
"Do zapłaty"  (pomarańczowy)
```

### Tooltip przy ikonie $ (included/excluded)

```
Włączone:  "Wyłącz z budżetu"
Wyłączone: "Włącz do budżetu"
```

### Rozwinięte szczegóły (MAIN / ALT)

```
Chip MAIN: "GŁÓWNA"  (zamiast "MAIN")
Chip ALT:  "ALT"     (zostawiamy — krótkie, rozpoznawalne)

Tooltip "Ustaw jako MAIN": "Ustaw jako główną"
Tooltip "Linki": "Linki"
Tooltip "Edytuj": "Edytuj"
Tooltip "Usuń": "Usuń"
Tooltip "Zastąp inną opcją": "Zastąp inną opcją"
```

### Menu kontekstowe grupy

```
"Wyłącz grupę"              (zamiast "Wygaś grupę (wyklucz z budżetu)")
"Włącz grupę"               (zamiast "Włącz grupę")
"Zmień nazwę"
"Usuń grupę"
```

### Menu kontekstowe pozycji

```
"Edytuj"
"Linki"
"Alternatywy"
"Usuń"
```

### Dialog — dodaj/edytuj pozycję

```
Tytuł (dodawanie): "Nowa pozycja — {kategoria}"  (zamiast "Dodaj — {kategoria}")
Tytuł (edycja):    "Edytuj — {kategoria}"

Pole Grupa:
  label: "Grupa"
  helperText: "Wybierz istniejącą lub wpisz nową"

Pole Cena:
  label: "Cena"  (lub "Kwota" dla wykończenia)

Pole Uwagi:
  label: "Uwagi"

Pole Data:
  label: "Planowana data wydatku"
  helperText: "Zostaw puste jeśli potrzebujesz teraz"
  
  Tooltip (ⓘ):
  "Kiedy poniesiesz ten koszt? Jeśli podasz datę, wydatek pojawi się na
   wykresie prognozy dopiero od tego terminu — linia celu podskoczy
   w tym dniu. Puste = potrzebne od razu."

Przyciski: "Zamknij" | "Dodaj" / "Zapisz"
```

### Dialog — nowa grupa

```
Tytuł: "Nowa grupa"
Pole:  label: "Nazwa grupy"
Przyciski: "Zamknij" | "Utwórz"
```

### Dialog — zmiana nazwy grupy

```
Tytuł: "Zmień nazwę grupy"
Pole:  label: "Nowa nazwa"
Przyciski: "Anuluj" | "Zmień"
```

### Dialog — usunięcie grupy

```
Tytuł: "Usuń grupę"  (czerwony)
Treść: "Czy na pewno chcesz usunąć grupę „{nazwa}" wraz ze wszystkimi pozycjami?"
Info:  "Pozycji: {count} · Łączna wartość: {kwota}"
Ostrzeżenie: "Ta operacja jest nieodwracalna. Aby tylko wyłączyć grupę z budżetu, użyj opcji „Wyłącz grupę"."
Przyciski: "Anuluj" | "Usuń grupę" (czerwony)
```

### Dialog — usunięcie pozycji

```
Tytuł: "Usunąć pozycję?"  (zamiast "Potwierdzenie usunięcia")
Treść: "Czy na pewno chcesz usunąć „{nazwa}"?"
  (z alternatywami): "Czy na pewno chcesz usunąć „{nazwa}" wraz z {count} alternatywami?"
Info:  "Wartość: {kwota}"
Przyciski: "Anuluj" | "Usuń" (czerwony)
```

### Dialog — którą opcję opłaciłeś?

```
Tytuł: "Którą opcję opłaciłeś?"
Opcja MAIN: chip "GŁÓWNA" + "Cena główna" + kwota
Opcja ALT:  chip "ALT" + nazwa + kwota
Przycisk: "Anuluj"
```

### Dialog — wybierz nową główną

```
Tytuł: "Wybierz nową główną cenę"  (zamiast "Wybierz nowy MAIN")
Info:  "Obecna główna (do usunięcia):" + kwota (przekreślona)
Opis:  "Wybierz, która opcja stanie się nową ceną główną:"
Chip:  "→ GŁÓWNA" + nazwa + kwota
Przycisk: "Anuluj"
```

### Dialog — edytuj MAIN

```
Tytuł: "Edytuj główną — {nazwa}"  (zamiast "Edytuj MAIN — {nazwa}")
Pola: Nazwa/Model, Cena, Uwagi
Przyciski: "Zamknij" | "Zapisz"
```

### Dialog — edytuj alternatywę

```
Tytuł: "Edytuj alternatywę"
Pola: "Nazwa", "Cena", "Uwagi"
Przyciski: "Zamknij" | "Zapisz"
```

---

## 7. Pominięte (WykluconeView.tsx)

### Nagłówek

```
Tytuł:   "Pominięte"
Podtytuł: "Pozycje wyłączone z budżetu — nie wliczają się do wydatków"
```

### Karta podsumowania

```
Label: "Zaoszczędzone"
Podpis: "{count} pozycji pominiętych w budżecie"
```

### Empty state

```
"Wszystko jest uwzględnione w budżecie. Nie masz pominiętych pozycji."
```

### Tabela — nagłówki

```
"Kategoria" | "Grupa" | "Nazwa" | "Kwota" | (akcje)
```

### Tooltip przycisku przywracania

```
"Przywróć do budżetu"
```

### Wiersz sumy

```
"Razem pominięte"
```

---

## 8. Dane / Import-Eksport (ImportView.tsx)

### Nagłówek

```
Tytuł:   "Dane"
Podtytuł: "Importuj z pliku Excel lub wyeksportuj aktualny stan budżetu"
```

### Alert (dane już załadowane)

```
"Dane są już załadowane. Ponowny import zastąpi obecne dane — zalecamy najpierw wyeksportować backup."
```

### Strefa drag & drop

```
Ikona: CloudUpload
Tytuł: "Przeciągnij plik tutaj"
Podtytuł: "lub kliknij, aby wybrać plik z dysku"
Przycisk: "Wybierz plik .xlsx"
```

### Komunikaty

```
Sukces:  "Zaimportowano: {lista kategorii z liczbami}"
Snackbar sukces: "Import zakończony — {count} pozycji załadowanych"
Snackbar błąd:   "Import nie powiódł się"

Błąd formatu: "Wybierz plik Excel (.xlsx)"
Błąd pustego pliku: "Plik nie zawiera danych. Sprawdź, czy arkusze mają właściwe nazwy: Meble, Wykończenie, AGD, Pozostałe, Wyprowadzka, Saldo, Harmonogram, Milestones, Notatki."
Błąd ogólny: "Błąd importu: {message}"
```

### Obsługiwane arkusze (info box)

```
Label: "Obsługiwane arkusze"
Lista: Meble, Wykończenie, AGD, Pozostałe, Wyprowadzka, Saldo, Harmonogram, Milestones, Notatki
```

### Sekcja — szablon

```
Tytuł:   "Szablon"
Opis:    "Pusty plik Excel ze wszystkimi arkuszami i nagłówkami — gotowy do wypełnienia."
Przycisk: "Pobierz szablon"
Snackbar: "Szablon pobrany"
```

### Sekcja — eksport

```
Tytuł:   "Eksport"
Opis:    "Pobierz plik Excel ze wszystkimi danymi. Format kompatybilny z importem."
Przycisk: "Pobierz plik .xlsx"
Snackbar: "Eksport zakończony — plik pobrany"
```

---

## 9. Notatki (StickyNotesPanel.tsx)

### Nagłówek panelu

```
"📝 DO ZROBIENIA"  →  "📝 Notatki"
```

### Empty state

```
"Brak notatek"
"Kliknij + aby dodać"
```

### Placeholder textarea

```
"Wpisz notatkę..."  →  "Nowa notatka..."
```

### Sekcja zrobionych

```
"Zrobione ({count})"  →  "Gotowe ({count})"
```

### Tooltipy

```
Dodaj: "Nowa notatka"  (zamiast "Dodaj notatkę")
Kolor: "Kolor"
Usuń:  "Usuń"
```

---

## 10. Alternatywy (AlternativesModal.tsx)

### Dialog

```
Tytuł: "Nowa alternatywa — {nazwa}"  →  "Dodaj alternatywę — {nazwa}"

Info box: "Obecna cena główna"  (zamiast "Aktualna cena MAIN")

Pole Nazwa:
  label: "Nazwa"
  placeholder: "np. IKEA Kallax, Allegro wariant"

Pole Cena:
  label: "Cena"

Pole Uwagi:
  label: "Uwagi"  (bez "(opcjonalnie)" — i tak widać że puste)

Sekcja linków: "Linki ({count})"

Przyciski: "Anuluj" | "Dodaj"
```

---

## 11. Linki (LinksEditor.tsx)

### Dialog

```
Tytuł: "Linki — {nazwa}"

Empty state:
  "Brak linków. Dodaj pierwszy poniżej."

Sekcja dodawania:
  Label: "Nowy link"  (zamiast "Dodaj link")
  Placeholder nazwa: "Nazwa (np. Sklep meblowy)"
  Placeholder URL:   "https://..."

Tooltip "Otwórz": "Otwórz"
Tooltip "Edytuj": "Edytuj"
Tooltip "Usuń":   "Usuń"
Tooltip "Zapisz (Enter)": "Zapisz"
Tooltip "Anuluj (Esc)":   "Anuluj"

Przyciski: "Zamknij" | "Zapisz ({count})"
```

---

## 12. Walidacja (globalne)

```
Pole wymagane:       "Pole wymagane"  (zamiast "Wymagane")
Minimalna kwota:     "Minimalna kwota: 1 zł"  (zamiast "Min 1 zł")
```

---
