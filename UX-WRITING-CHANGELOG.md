# UX Writing — Changelog (pełny tekst do ChangelogView.tsx)

---

## Nagłówek

```
Tytuł:   "Co nowego"
Podtytuł: "Historia zmian i nowych funkcji"
```

## Etykiety typów zmian

```
feat:     "Nowe"       (zielony)
fix:      "Poprawka"   (pomarańczowy)
style:    "Wygląd"     (niebieski)     ← zamiast "Styl"
refactor: "Zmiana"     (fioletowy)     ← zamiast "Refactor"
```

---

## Wpisy changelog (przepisane językiem użytkownika)

### v1.8.0 — 2 sierpnia 2026

- **Nowe** — Planowana data wydatku — opcjonalne pole daty na każdej pozycji
- **Nowe** — Wykres prognozy uwzględnia daty wydatków — linia celu rośnie schodkowo
- **Nowe** — Tooltip z wyjaśnieniem przy polu daty
- **Nowe** — Eksport i import obsługuje pole daty wydatku
- **Poprawka** — Wyłączone grupy zachowują stan po odświeżeniu strony

### v1.7.0 — 2 sierpnia 2026

- **Nowe** — Pominięte pozycje widoczne we wszystkich wykresach i kartach na podsumowaniu
- **Nowe** — Struktura wydatków (donut) — segment „Pominięte"
- **Nowe** — Scenariusze — kwoty „razem z pominiętymi" pod każdym wariantem
- **Nowe** — Postęp płatności wg kategorii — wartości „razem z pominiętymi"
- **Nowe** — Dodatkowy progress bar „razem z pominiętymi" w globalnym postępie
- **Nowe** — Wykres prognozy — dodatkowa linia celu z pominiętymi
- **Nowe** — Ulepszony tooltip wykresu prognozy
- **Nowe** — Eksport i import ważnych dat (Milestones)
- **Nowe** — Bilans na podsumowaniu — informacja o oszczędnościach z pominiętych
- **Nowe** — Ikony przy etykietach wszystkich kart
- **Nowe** — Nowa ikona aplikacji i favicon
- **Wygląd** — Wartości „razem z pominiętymi" zawsze mniejszym fontem

### v1.6.0 — 2 sierpnia 2026

- **Nowe** — Strona „Pominięte" — lista wyłączonych pozycji z przyciskiem przywracania
- **Nowe** — Przycisk „Przywróć do budżetu" na stronie Pominięte
- **Nowe** — Wyłączenie grupy faktycznie aktualizuje bilans
- **Nowe** — Strona „Co nowego" z historią wersji
- **Zmiana** — Kategoria „Zakupy" zmieniona na „Meble"
- **Poprawka** — Tooltip ważnej daty — pełna informacja o prognozie
- **Wygląd** — Kompaktowe przyciski w prognozie

### v1.5.0 — 2 sierpnia 2026

- **Nowe** — Ważne daty w prognozie — deadliny z pionową linią na wykresie i bilansem
- **Nowe** — Uwagi na 3 poziomach (pozycja, główna, alternatywa) z tooltipami
- **Nowe** — Edycja głównej ceny — pełny formularz (nazwa, cena, uwagi)
- **Nowe** — Zamiana ALT → GŁÓWNA aktualizuje nazwę w tabeli
- **Poprawka** — AGD/RTV poprawnie aktualizuje model przy zamianie
- **Poprawka** — Edycja poziomu 2 w AGD nie pokazuje pola model
- **Poprawka** — Ikony akcji przy głównej i alternatywach zamiast menu
- **Poprawka** — Uwagi — ikona 💬 z tooltipem zamiast chipu z tekstem

### v1.4.0 — 1 sierpnia 2026

- **Nowe** — Menu kontekstowe ⋮ dla grup i pozycji
- **Nowe** — Uproszczony dialog alternatyw — szybkie dodawanie
- **Nowe** — Edycja linków inline (ołówek → pola → Enter/Esc)
- **Nowe** — Dialog edycji pozwala modyfikować cenę
- **Nowe** — Rozbudowane karty podsumowania — postęp, zakres min/max, statystyki
- **Wygląd** — Karty z gradientami i progress barami
- **Poprawka** — Usunięty window.confirm — usuwanie przez dialog

### v1.3.0 — 1 sierpnia 2026

- **Nowe** — Aplikacja instalowalna (PWA) na Windows, Mac, Linux i telefon
- **Nowe** — Automatyczny deployment na GitHub Pages
- **Nowe** — Nowe logo aplikacji
- **Poprawka** — Pole daty — przycisk czyszczenia, widoczna ikona w ciemnym motywie
- **Poprawka** — Prawidłowy URL dla GitHub Pages

### v1.2.0 — 1 sierpnia 2026

- **Nowe** — Pełny eksport i import — wszystkie dane (przeprowadzka, środki, prognoza, notatki, linki, alternatywy)
- **Nowe** — Kompatybilność ze starszymi plikami Excel
- **Nowe** — Szablon — pusty plik .xlsx ze wszystkimi zakładkami
- **Nowe** — Powiadomienia przy imporcie i eksporcie
- **Nowe** — Wyłączanie grup z budżetu bez usuwania
- **Nowe** — Edycja i usuwanie grup z potwierdzeniem
- **Nowe** — Wykres prognozy — punkt aktualnych środków i linia celu
- **Nowe** — Tooltip z opisem przy nagłówkach stron wydatków
- **Nowe** — Przewodnik — dokumentacja wszystkich funkcji
- **Zmiana** — Nowe nazwy kategorii: Meble, Wykończenie, AGD/RTV, Inne, Przeprowadzka
- **Zmiana** — Menu: „Dane" zamiast „Import/Eksport", „Prognoza" zamiast „Planowanie"

### v1.1.0 — 1 sierpnia 2026

- **Nowe** — Panel notatek — widoczny na każdej stronie
- **Nowe** — Pasek budżetu — wizualne porównanie środków z wydatkami
- **Nowe** — Adresy URL przeżywają odświeżenie strony
- **Nowe** — Wspólny komponent dla wszystkich kategorii wydatków
- **Nowe** — System alternatyw cenowych z porównywaniem
- **Nowe** — Linki z nazwami zamiast surowych adresów
- **Nowe** — 4 motywy kolorystyczne (Ciemny, Stonowany, Jasny, Unicorn)
- **Wygląd** — Rozwijany panel główna/alternatywy

### v1.0.0 — 1 sierpnia 2026

- **Nowe** — Pierwsza wersja aplikacji
- **Nowe** — Import danych z pliku Excel
- **Nowe** — Podsumowanie z wykresami
- **Nowe** — Kategorie wydatków: Meble, Wykończenie, AGD, Inne
- **Nowe** — Środki — rejestrowanie wpływów
- **Nowe** — Prognoza — planowanie przyszłych wpływów
- **Nowe** — Automatyczny zapis danych w przeglądarce
