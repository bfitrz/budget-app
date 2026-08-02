# UX Writing — Problemy UX i rekomendacje

---

## Krytyczne problemy

### 1. Błąd gramatyczny „z pominięte" — powtórzony ~15 razy

**Lokalizacja:** Dashboard, Harmonogram, CostCategoryView, Postęp płatności

**Problem:** „z pominięte" to błąd gramatyczny. Poprawnie: „razem z pominiętymi" (narzędnik).

**Wpływ:** Podważa profesjonalny wizerunek aplikacji premium.

**Rozwiązanie:** Globalny find & replace. Wszędzie używaj: `"razem z pominiętymi"` lub skróconej formy `"+ pominięte"` (bez przyimka).

---

### 2. Anglicyzmy w polskim interfejsie

**Lokalizacja:** Nawigacja, Changelog, Harmonogram, CostCategoryView

**Problem:**
- „Changelog" — termin programistyczny
- „Milestone" — anglicyzm w polskim UI
- „MAIN" / „ALT" — czysto techniczne etykiety
- „vs" w podtytule wykresu

**Rozwiązanie:**
- Changelog → "Co nowego"
- Milestone → "Ważna data"
- MAIN → "GŁÓWNA"
- ALT — zostaje (krótkie, intuicyjne jako skrót)
- "vs" → "i"

---

### 3. Niespójność terminologii

| Obecne warianty | Proponowany standard |
|---|---|
| „Aktualne środki" / „Dostępne środki" | **„Dostępne środki"** wszędzie |
| „Wpływy łącznie" / „Suma wpływów" | **„Łączne wpływy"** wszędzie |
| „Do opłacenia" / „Do zapłaty" / „Pozostało do zapłaty" | **„Do zapłaty"** wszędzie |
| „Opłacono" / „Opłacone" | **„Opłacone"** wszędzie |
| „Harmonogram" (nawigacja) / „Harmonogram wpływów" (tytuł) | **„Prognoza"** wszędzie |
| „Wygaszona" / „Wyłączona" / „Pominięta" | **„Wyłączona"** (stan grupy), **„Pominięta"** (stan pozycji) |
| „Bilans" / „Nadwyżka/Niedobór" | **„Bilans"** jako etykieta, **„nadwyżka"/"brakuje"** jako podpis |

---

### 4. Nazwa „Wyprowadzka" jest myląca

**Problem:** „Wyprowadzka" to potoczne określenie. Część użytkowników może nie kojarzyć tego z kosztami transportu i napraw.

**Rozwiązanie:** „Przeprowadzka" — bardziej formalne, jednoznaczne, obejmuje cały proces.

---

## Problemy UX (nie-tekstowe)

### 5. Ta sama ikona dla „Inne" i „Pominięte"

**Problem:** Obie używają `MoreHorizIcon`. Użytkownik nie odróżni ich wzrokiem w nawigacji.

**Rozwiązanie:**
- „Inne" → `Inventory2` lub `Category`
- „Pominięte" → `VisibilityOff` (już ma, ale warto potwierdzić)

---

### 6. „Pominięte" w sekcji „Koszty" jest mylące

**Problem:** „Pominięte" to nie kategoria kosztowa — to widok filtrowany. Umieszczenie go między kategoriami sugeruje, że to kolejna zakładka do wpisywania wydatków.

**Rozwiązanie:** Wizualnie oddzielić (separator lub mniejszy font) lub przenieść do sekcji „System".

---

### 7. Brak onboardingu dla nowych użytkowników

**Problem:** Użytkownik otwierający aplikację po raz pierwszy widzi pustą stronę importu bez żadnego kontekstu.

**Rozwiązanie:** Dodać krótki ekran powitalny (3 kroki):
1. "Zaimportuj dane z Excela lub zacznij od zera"
2. "Dodaj wpływy i wydatki"
3. "Śledź bilans i prognozuj przyszłość"

---

### 8. Nadmiar informacji na wykresie prognozy

**Problem:** Opis pod wykresem zawiera 5-6 elementów legendy + chipy ważnych dat + komunikat ostrzegawczy. Przeładowanie wizualne.

**Rozwiązanie:**
- Uprość legendę do 3 elementów (środki, cel, ważne daty)
- Przenieś „razem z pominiętymi" do tooltipa wykresu (nie legendy)
- Chipy ważnych dat przenieś do osobnej mini-sekcji pod legendą

---

### 9. Pola formularzy zbyt wiele mówią

**Problem w dialogach harmonogramu:**
- „Planowana data wpływu" — redundantne „wpływu" gdy dialog się nazywa „Zaplanuj wpływ"
- „Opis wpływu" — j.w.
- „Kwota wpływu" — j.w.
- Opis w dialog content powtarza to co już jest w tytule

**Rozwiązanie:** Usuń powtórzenia. W kontekście dialogu wystarczy: „Data", „Opis", „Kwota".

---

### 10. Tooltip na polu daty wydatku jest za długi

**Obecny:** "Kiedy faktycznie poniesiesz ten koszt? Jeśli nie wiesz lub potrzebujesz teraz — zostaw puste. Jeśli podasz datę, koszt pojawi się na wykresie harmonogramu dopiero od tego terminu (linia 'cel' podskoczy w górę w tym dniu)."

**Proponowany:** "Kiedy poniesiesz ten koszt? Jeśli podasz datę, wydatek pojawi się na wykresie prognozy dopiero od tego terminu. Puste = potrzebne od razu."

---

### 11. Chip „wygaszona" powinien brzmieć „wyłączona"

**Problem:** „Wygaszona" to termin z implementacji (disabled state). Użytkownik nie zna tego kontekstu.

**Rozwiązanie:** „wyłączona" — jasno komunikuje, że grupa jest wyłączona z obliczeń.

---

### 12. Nagłówek notatek „DO ZROBIENIA" jest za głośny

**Problem:** „📝 DO ZROBIENIA" w capslocku jest agresywne wizualnie i sugeruje, że panel służy TYLKO do zadań. Tymczasem to ogólne notatki.

**Rozwiązanie:** „📝 Notatki" — neutralne, ogólne, ciche.

---

### 13. Status „Zrealizowane" vs „Opłacone" — dwa systemy statusów

**Problem:** W tabeli harmonogramu chip mówi „Zrealizowane" (wpływ zrealizowany). W tabelach kosztów chip mówi „Opłacone". Użytkownik może mylić te konteksty.

**Rozwiązanie:** Spójne nazewnictwo:
- Wpływy: „Zrealizowany" (dokonany czas przeszły, męski bo wpływ)
- Wydatki: „Opłacone" (dokonany, nijaki bo wydatek)

---

### 14. Przycisk „Zamknij" vs „Anuluj" — niespójność

**Problem:** Niektóre dialogi mają „Zamknij" (edycja MAIN, nowa grupa), inne „Anuluj" (usuwanie, planowanie). Brak konsekwencji.

**Rozwiązanie:**
- Dialogi z akcją destrukcyjną/tworzącą: **„Anuluj"** (bo rezygnujesz z akcji)
- Dialogi przeglądowe/informacyjne: **„Zamknij"** (bo nie ma czego anulować)

---

### 15. Brak komunikatu sukcesu po dodaniu pozycji

**Problem:** Po dodaniu nowej pozycji, wpływu lub alternatywy nie ma żadnego feedbacku. Dialog się zamyka, ale użytkownik nie dostaje potwierdzenia.

**Rozwiązanie:** Dodać krótki Snackbar (jak przy imporcie): „Pozycja dodana" / „Wpływ dodany" / „Alternatywa dodana".

---

## Podsumowanie priorytetów

| Priorytet | Zmiana | Trudność |
|---|---|---|
| 🔴 Krytyczne | Fix „z pominięte" → „razem z pominiętymi" | 5 min (find & replace) |
| 🔴 Krytyczne | Changelog → „Co nowego", Milestone → „Ważna data" | 10 min |
| 🟡 Ważne | Ujednolicić terminologię (tabela powyżej) | 30 min |
| 🟡 Ważne | MAIN → GŁÓWNA | 15 min |
| 🟡 Ważne | Wygaszona → Wyłączona | 5 min |
| 🟡 Ważne | Przepisać changelog na język użytkownika | 20 min |
| 🟢 Ulepszenie | Skrócić opisy pól i tooltipów | 30 min |
| 🟢 Ulepszenie | Dodać snackbar przy dodawaniu pozycji | 15 min |
| 🟢 Ulepszenie | Onboarding dla nowych użytkowników | 2-3h |
| 🟢 Ulepszenie | Wizualnie oddzielić „Pominięte" w nawigacji | 10 min |
