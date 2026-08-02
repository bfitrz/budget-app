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

### 8. Współdzielenie / sync (Dropbox)
- [ ] Dropbox PKCE OAuth (bez backendu)
- [ ] Użytkownik wskazuje folder na Dropbox
- [ ] Auto-save pliku .xlsx co 5 minut (lub po zmianach, z debounce)
- [ ] Wczytywanie z Dropbox przy starcie
- [ ] Partner otwiera ten sam folder — współdzielenie przez sync pliku
- [ ] Ustawienia: włącz/wyłącz auto-sync, interwał

### 9. Duplikowanie pozycji
- [ ] Menu ⋮ → "Duplikuj" — tworzy kopię pozycji w tej samej grupie
- [ ] Kopia ma nowe ID, status "Do zapłaty", bez alternatyw
- [ ] Przydatne gdy kupujesz te same rzeczy do kilku pokoi

### 10. Podsumowanie "ile zostało" na grupie
- [ ] Pod progress barem: "Zostało X zł do zapłaty"
- [ ] Wyróżnione kolorem (pomarańczowy)

### 11. Szybka notatka na dashboardzie
- [ ] Jedno pole tekstowe "Co dalej?" na górze dashboardu
- [ ] Zapisywane w localStorage
- [ ] Widoczne zawsze — jako przypomnienie co jest priorytetem

### 12. Podsumowanie miesięczne w harmonogramie
- [ ] Tabela/wykres: miesiąc po miesiącu
- [ ] Ile wpływów planowanych w danym miesiącu
- [ ] Ile wydatków z dataRealizacji w tym miesiącu
- [ ] Saldo na koniec każdego miesiąca

### 13. Eksport jednej kategorii
- [ ] Przycisk "Eksportuj" na stronie kategorii (np. Meble)
- [ ] Generuje plik .xlsx lub PDF tylko z tą kategorią
- [ ] Przydatne do wysłania ekipie/partnerowi

### 14. Zdjęcia / screenshoty produktów
- [ ] Mini-galeria przy pozycji (w rozwinięciu)
- [ ] Dodawanie URL do zdjęcia lub upload (base64 w localStorage)
- [ ] Podgląd thumbnailów
- [ ] Przydatne przy porównywaniu alternatyw wizualnie

### 15. Porównanie z budżetem początkowym
- [ ] Opcja "Zapisz snapshot budżetu" jako baseline
- [ ] Widok: ile planowałeś vs ile teraz (delta per kategoria)
- [ ] Wykres słupkowy: plan vs rzeczywistość

### 16. Powiadomienia push (PWA)
- [ ] PWA Notification API — prośba o pozwolenie
- [ ] Przypomnienie X dni przed dataRealizacji
- [ ] Podsumowanie tygodniowe: "3 pozycje zbliżają się do terminu"
- [ ] Ustawienia: włącz/wyłącz, ile dni przed terminem

---

## Uwagi
- Każda funkcja powinna mieć wpis w Changelogu po wdrożeniu
- Przewodnik aktualizowany razem z każdą zmianą
- Mobile-first: każda nowa funkcja testowana na małym ekranie
