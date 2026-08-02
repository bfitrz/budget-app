# TODO — Budget App

## Zrealizowane ✅

### 1. Undo/Redo ✅
- [x] Stos historii zmian (max 30 kroków)
- [x] Ctrl+Z / Cmd+Z → cofnij ostatnią akcję
- [x] Ctrl+Shift+Z → przywróć cofniętą akcję
- [x] Toast "Cofnięto" po undo

### 2. Wyszukiwanie / filtrowanie ✅
- [x] Pole wyszukiwania w nagłówku stron wydatków
- [x] Filtrowanie po nazwie, grupie, polach kolumn
- [x] Szybkie filtry: Wszystkie / Do zapłaty / Opłacone / Wykluczone
- [x] Licznik wyników
- [x] Grupy bez wyników ukryte, wszystkie rozwinięte przy filtrowaniu

### 3. Sortowanie pozycji w grupie ✅
- [x] Dropdown sortowania: Domyślnie / Cena ↑ / Cena ↓ / Nazwa A-Z / Status
- [x] Sortowanie wewnątrz każdej grupy

### 4. Mini progress bar na grupie ✅
- [x] Pasek postępu opłacone/total w AccordionSummary
- [x] Liczba X/Y obok kwoty

### 5. Reminder o backupie ✅
- [x] Auto-reminder na stronie Import jeśli >7 dni bez eksportu
- [x] Alert z przyciskiem 'Eksportuj teraz'
- [x] Data ostatniego eksportu w localStorage

### 6. Podświetlenie najtańszej alternatywy ✅
- [x] Najtańsza ALT (tańsza niż MAIN) podświetlona zielonym obramowaniem
- [x] Ułatwia wizualne porównanie opcji

### 7. Przeterminowane pozycje ✅
- [x] Chip z datą zmienia kolor na czerwony gdy pozycja jest po terminie
- [x] Dotyczy pozycji ze statusem 'Do zapłaty' i datą w przeszłości

## Do realizacji

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
