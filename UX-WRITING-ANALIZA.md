# UX Writing — Dokument referencyjny

> Aplikacja budżetowa do zarządzania kosztami wykończenia i wyposażenia mieszkania.
> Ton: premium, elegancki, nowoczesny. Język: polski.
> Ostatnia aktualizacja: 2026-08-02

---

## Słownik terminologiczny (decyzje)

| Koncept | Używamy | NIE używamy |
|---------|---------|-------------|
| Pieniądze dostępne | **Środki** | Saldo, Pieniądze |
| Pozycja kosztowa | **Wydatek** | Koszt (chyba że łączny) |
| Zapłacone | **Opłacone** | Zapłacone, Zapłacono |
| Usuwanie | **Usuń** | Skasuj, Skasować |
| Limit pieniędzy | **Budżet** | Limit |
| Milestone | **Termin kluczowy** | Milestone, Kamień milowy |
| Changelog | **Historia zmian** | Changelog, Log zmian |
| Pominięte/excluded | **Pominięte** | Wykluczone, Wyłączone |
| Wygaszona grupa | **Wyłączona grupa** | Wygaszona grupa |
| Included/excluded toggle | **Uwzględnij / Pomiń** | Wlicz/Wyklucz |
| Alternatywa cenowa | **Wariant** | Alternatywa |
| MAIN | **Główny** | MAIN |
| ALT | **Wariant** | ALT |
| Do zapłaty | **Do opłacenia** | Do zapłaty |
| Z pominięte | **Łącznie z pominiętymi** | Z pominięte |

---

## 1. Nawigacja (Layout sidebar)

### Sekcje nawigacji

| Sekcja | Label |
|--------|-------|
| Sekcja 1 | `Główne` |
| Sekcja 2 | `Wydatki` |
| Sekcja 3 | `Ustawienia` |

### Pozycje nawigacji

| ID | Label | Sekcja |
|----|-------|--------|
| dashboard | `Podsumowanie` | Główne |
| saldo | `Środki` | Główne |
| harmonogram | `Harmonogram` | Główne |
| meble | `Meblowanie` | Wydatki |
| wykonczenie | `Wykończenie` | Wydatki |
| agd | `AGD / RTV` | Wydatki |
| pozostale | `Inne` | Wydatki |
| wyprowadzka | `Wyprowadzka` | Wydatki |
| wykluczone | `Pominięte` | Wydatki |
| import | `Import / Eksport` | Ustawienia |
| guide | `Przewodnik` | Ustawienia |
| changelog | `Historia zmian` | Ustawienia |

### Sidebar footer

| Element | Tekst |
|---------|-------|
| Notes toggle label | `Notatki` |
| Theme popover title | `Motyw` |

---

## 2. Motywy kolorystyczne

| ID | Label | Opis |
|----|-------|------|
| dark | `Ciemny` | `Głęboka czerń` |
| dim | `Stonowany` | `Cieplejszy ciemny` |
| light | `Jasny` | `Neutralny, czysty` |
| unicorn | `Unicorn 🦄` | `Neonowy gradient` |

---

## 3. Pasek budżetu (BudgetTopBar)

### Markery (tooltips)

| Marker | Label | Placement |
|--------|-------|-----------|
| Min cost | `Koszt minimalny` | above |
| Max cost | `Koszt maksymalny` | above |
| Current plan | `Plan wydatków` | below |
| Budget | `Dostępny budżet` | below |

### Kafelek bilansu

| Element | Tekst |
|---------|-------|
| Label | `Bilans` |
| Positive subtitle | `nadwyżka` |
| Negative subtitle | `niedobór` |


---

## 4. Podsumowanie (Dashboard)

### Nagłówek strony

| Element | Tekst |
|---------|-------|
| Tytuł | `Podsumowanie` |
| Podtytuł | `Całościowy obraz budżetu na wykończenie i wyposażenie` |

### Karty KPI

| KPI | Label |
|-----|-------|
| Wpływy | `Wpływy łącznie` |
| Dostępne | `Dostępne środki` |
| Opłacone | `Opłacone` |
| Opłacone subtitle (bez pominiętych) | `{n}% całości` |
| Opłacone subtitle (z pominiętymi) | `{n}% aktywnych · {m}% łącznie z pominiętymi` |
| Do opłacenia | `Do opłacenia` |
| Do opłacenia subtitle | `Łącznie z pominiętymi: {kwota}` |

### Karta bilansu

| Element | Tekst |
|---------|-------|
| Label | `Bilans` |
| Positive message | `Środki pokrywają zaplanowane wydatki` |
| Negative message | `Brakuje środków na pokrycie zaplanowanych wydatków` |
| With excluded | `Bilans łącznie z pominiętymi: {kwota}` |
| Cost label | `Łączny koszt` |
| With excluded cost | `Łącznie z pominiętymi: {kwota}` |
| Savings | `Oszczędzasz: {kwota}` |

### Wykres — Wydatki wg kategorii

| Element | Tekst |
|---------|-------|
| Tytuł | `Wydatki wg kategorii` |
| Podtytuł | `Opłacone vs do opłacenia` |
| Legenda: opłacone | `Opłacone` |
| Legenda: do opłacenia | `Do opłacenia` |
| Tooltip: zaplacono | `Opłacone` |
| Tooltip: doZaplaty | `Do opłacenia` |

### Wykres — Struktura kosztów (donut)

| Element | Tekst |
|---------|-------|
| Tytuł | `Struktura kosztów` |
| Podtytuł (bez pominiętych) | `Procentowy podział wg kategorii` |
| Podtytuł (z pominiętymi) | `Procentowy podział wg kategorii (+ pominięte)` |

### Wykres — Rozpiętość kosztów

| Element | Tekst |
|---------|-------|
| Tytuł | `Rozpiętość kosztów` |
| Podtytuł | `Wariant minimalny, obecny i maksymalny (z uwzględnieniem wariantów)` |
| Legenda: min | `Wariant minimalny` |
| Legenda: current | `Obecny wybór` |
| Legenda: max | `Wariant maksymalny` |
| Tooltip: min | `Minimum` |
| Tooltip: main | `Aktualny` |
| Tooltip: max | `Maksimum` |

### Scenariusze budżetowe

| Element | Tekst |
|---------|-------|
| Tytuł | `Scenariusze budżetowe` |
| Podtytuł | `Czy środki wystarczą w każdym wariancie?` |
| Optimistic | `Optymistyczny` |
| Current | `Obecny plan` |
| Pessimistic | `Pesymistyczny` |
| Positive diff | `Nadwyżka` |
| Negative diff | `Brakuje` |
| Footer: range | `Rozpiętość: {kwota}` |
| Footer: savings | `Możliwa oszczędność: {kwota}` |
| With excluded | `Łącznie z pominiętymi: {kwota}` |

### Postęp płatności wg kategorii

| Element | Tekst |
|---------|-------|
| Tytuł | `Postęp płatności wg kategorii` |
| Podtytuł | `Procent opłaconych pozycji w każdej kategorii` |
| With excluded | `Łącznie z pominiętymi: {opłacone} / {total} ({n}%)` |

### Postęp płatności (globalny)

| Element | Tekst |
|---------|-------|
| Tytuł | `Postęp płatności` |
| Podtytuł | `{opłacone} z {total} opłacone` |
| With excluded | `Łącznie z pominiętymi: {opłacone} / {total}` |

### Pusty stan (empty state)

| Element | Tekst |
|---------|-------|
| Brak danych | `Brak danych — zaimportuj arkusz Excel, aby rozpocząć.` |


---

## 5. Środki (SaldoView)

### Nagłówek strony

| Element | Tekst |
|---------|-------|
| Tytuł | `Środki` |
| Podtytuł | `Rejestruj wpływy do budżetu — wypłaty, oszczędności, zwroty. Suma po odjęciu opłaconych pozycji = dostępne środki.` |

### Przycisk dodawania

| Element | Tekst |
|---------|-------|
| Button | `Dodaj wpływ` |

### Karty podsumowania

| KPI | Label | Opis pod wartością |
|-----|-------|--------------------|
| Aktualne środki | `Dostępne środki` | `wpływy minus opłacone pozycje` |
| Suma wpływów | `Suma wpływów` | — |
| Wydane | `Wydane` | — |

### Tabela

| Kolumna | Label |
|---------|-------|
| Col 1 | `Data` |
| Col 2 | `Opis` |
| Col 3 | `Kwota` |

### Pusty stan

| Element | Tekst |
|---------|-------|
| Ikona + tekst | `Brak wpisów. Dodaj wpływ, aby śledzić dostępne środki.` |

### Chip bez daty

| Element | Tekst |
|---------|-------|
| Chip | `Start` |

### Dialog dodawania/edycji

| Element | Tekst |
|---------|-------|
| Tytuł (add) | `Dodaj wpływ` |
| Tytuł (edit) | `Edytuj wpływ` |
| Pole: data | Label: `Data` · Helper: `Puste = saldo początkowe` |
| Pole: opis | Label: `Opis` |
| Pole: kwota | Label: `Kwota` · Helper: `Wartość ujemna = korekta w dół` |
| Btn cancel | `Anuluj` |
| Btn submit (add) | `Dodaj` |
| Btn submit (edit) | `Zapisz` |

### Tooltips (tabela)

| Akcja | Tooltip |
|-------|---------|
| Edit | `Edytuj` |
| Delete | `Usuń` |


---

## 6. Harmonogram (HarmonogramView)

### Nagłówek strony

| Element | Tekst |
|---------|-------|
| Tytuł | `Harmonogram wpływów` |
| Podtytuł | `Zaplanuj przyszłe wpływy i sprawdź na wykresie, kiedy zgromadzisz wystarczająco środków na pokrycie wydatków.` |

### Przyciski nagłówka

| Element | Tekst |
|---------|-------|
| Btn milestone | `Termin kluczowy` |
| Btn add | `+ Wpływ` |

### Karty podsumowania

| KPI | Label |
|-----|-------|
| Card 1 | `Dostępne środki` |
| Card 2 | `Planowane wpływy` |
| Card 3 | `Pozostało do opłacenia` |
| Card 4 | `Bilans po wpływach` |

### Wykres — Symulacja środków w czasie

| Element | Tekst |
|---------|-------|
| Tytuł | `Symulacja środków w czasie` |
| Podtytuł | `Prognoza dostępnych środków. Gdy niebieska linia przekroczy pomarańczową — masz wystarczająco na pokrycie wydatków.` |

### Legenda wykresu

| Element | Tekst |
|---------|-------|
| Green dot | `Dostępne środki: {kwota}` |
| Blue line | `Prognoza środków po wpływach` |
| Orange dashed | `Cel: {kwota} (tyle musisz zgromadzić)` |
| Red dashed | `Łącznie z pominiętymi: {kwota}` |
| Red milestone | `📌 Terminy kluczowe ({n})` |

### Tooltip wykresu

| Element | Tekst |
|---------|-------|
| Header | `{data}` |
| Row 1 | `Aktualnie na stanie: {kwota}` |
| Row 2 | `Wpływy do tej daty: +{kwota}` |
| Row 3 | `Prognoza środków: {kwota}` |
| Divider | — |
| Row 4 | `Cel (do opłacenia): {kwota}` |
| Positive | `Nadwyżka: +{kwota}` |
| Negative | `Brakuje: -{kwota}` |
| Excluded section | `Łącznie z pominiętymi: {kwota}` |

### Alert po wykresie

| Wariant | Tekst |
|---------|-------|
| Negatywny | `Nawet po zaplanowanych wpływach brakuje {kwota} na pokrycie wszystkich wydatków.` |
| Pozytywny | `Po zaplanowanych wpływach wystarczy na pokrycie wydatków (nadwyżka: {kwota}).` |

### Termin kluczowy — tooltip (chip)

| Element | Tekst |
|---------|-------|
| Header | `📌 {opis} — {data}` |
| Row 1 | `Aktualnie na stanie: {kwota}` |
| Row 2 | `Przewidywane wpływy do tej daty: +{kwota}` |
| Row 3 | `Prognoza środków: {kwota}` |
| Row 4 | `Łączny koszt do pokrycia: {kwota}` |
| Positive | `Nadwyżka: +{kwota}` |
| Negative | `Brakuje do celu: -{kwota}` |

### Tabela wpływów

| Kolumna | Label |
|---------|-------|
| Col 1 | `Status` |
| Col 2 | `Data wpływu` |
| Col 3 | `Opis` |
| Col 4 | `Kwota` |

### Chip statusu

| Stan | Tekst |
|------|-------|
| Zrealizowane | `Zrealizowane` |

### Pusty stan tabeli

| Element | Tekst |
|---------|-------|
| Główny | `Brak zaplanowanych wpływów.` |
| Podpowiedź | `Np. przelew z oszczędności, wypłata, zwrot podatku.` |

### Tooltips tabeli

| Akcja | Tooltip |
|-------|---------|
| Oznacz zrealizowane | `Oznacz jako zrealizowane` |
| Oznacz niezrealizowane | `Cofnij realizację` |
| Edit | `Edytuj` |
| Delete | `Usuń` |

### Dialog — Zaplanuj wpływ

| Element | Tekst |
|---------|-------|
| Tytuł (add) | `Zaplanuj wpływ` |
| Tytuł (edit) | `Edytuj planowany wpływ` |
| Opis | `Dodaj przewidywany wpływ — np. przelew z oszczędności, wypłata, zwrot podatku.` |
| Pole: data | Label: `Planowana data wpływu` |
| Pole: opis | Label: `Opis wpływu` · Placeholder: `np. Przelew z konta oszczędnościowego` |
| Pole: kwota | Label: `Kwota wpływu` |
| Btn cancel | `Anuluj` |
| Btn submit (add) | `Zaplanuj` |
| Btn submit (edit) | `Zapisz` |

### Dialog — Termin kluczowy

| Element | Tekst |
|---------|-------|
| Tytuł | `📌 Dodaj termin kluczowy` |
| Opis | `Ważna data lub deadline — pojawi się jako pionowa linia na wykresie z prognozą środków.` |
| Pole: data | Label: `Data` |
| Pole: opis | Label: `Opis` · Placeholder: `np. Termin oddania kluczy` |
| Btn cancel | `Anuluj` |
| Btn submit | `Dodaj` |

