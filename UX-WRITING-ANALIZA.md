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

