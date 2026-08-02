# TODO — Budget App

## Kolejność realizacji

### 1. Undo/Redo
- [ ] Stos historii zmian (max 20-30 kroków)
- [ ] Ctrl+Z / Cmd+Z → cofnij ostatnią akcję
- [ ] Ctrl+Shift+Z → przywróć cofniętą akcję
- [ ] Toast "Cofnięto" z opcją "Przywróć" (jak Gmail)
- [ ] Obsługuje: dodawanie, usuwanie, edycję pozycji/grup, zmianę statusu

### 2. Wyszukiwanie / filtrowanie
- [ ] Pole wyszukiwania w nagłówku stron wydatków
- [ ] Filtrowanie po nazwie, grupie, statusie
- [ ] Szybkie filtry: "Do zapłaty", "Opłacone", "Wykluczone"
- [ ] Podświetlanie wyników w tabeli
- [ ] Działa across all groups (rozwijanie accordionów z wynikami)

### 3. Sortowanie pozycji w grupie
- [ ] Dropdown/ikona sortowania przy nagłówku grupy
- [ ] Sortowanie po: cenie (rosnąco/malejąco), nazwie (A-Z), statusie
- [ ] Zapamiętywanie preferencji sortowania per kategoria

### 4. Mini progress bar na grupie
- [ ] Pasek postępu opłacone/total w AccordionSummary
- [ ] Liczba: "3/7 opłacone" (już jest częściowo — rozbudować wizualnie)
- [ ] Kwota zostało do zapłaty w grupie

### 5. Automatyczny backup
- [ ] Auto-eksport do pliku co X dni (localStorage reminder)
- [ ] Opcja "Wyślij backup na email" (mailto: link z załącznikiem?)
- [ ] Alternatywa: integracja z Google Drive API (OAuth)
- [ ] Wersjonowanie backupów (data w nazwie pliku)

### 6. Tryb porównawczy alternatyw
- [ ] Widok side-by-side dla 2-3 alternatyw
- [ ] Porównanie cen, linków, uwag obok siebie
- [ ] Podświetlenie najtańszej/najdroższej opcji
- [ ] Przycisk "Wybierz tę" → ustawia jako MAIN

### 7. Powiadomienia o terminach
- [ ] Push notifications (PWA Notification API)
- [ ] Przypomnienie X dni przed `dataRealizacji`
- [ ] Oznaczanie przeterminowanych pozycji (czerwony badge)
- [ ] Ustawienia: włącz/wyłącz, ile dni przed terminem

### 8. Współdzielenie (sync)
- [ ] Backend: Firebase/Supabase realtime DB
- [ ] Logowanie (email/Google)
- [ ] Link do współdzielenia budżetu z partnerem
- [ ] Sync w czasie rzeczywistym
- [ ] Conflict resolution (last-write-wins lub merge)
- [ ] Offline-first z sync po połączeniu

---

## Uwagi
- Każda funkcja powinna mieć wpis w Changelogu po wdrożeniu
- Przewodnik aktualizowany razem z każdą zmianą
- Mobile-first: każda nowa funkcja testowana na małym ekranie
