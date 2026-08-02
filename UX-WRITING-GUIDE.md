# UX Writing — Przewodnik (pełny tekst do GuideView.tsx)

---

## Nagłówek

```
Tytuł:   "Przewodnik"
Podtytuł: "Jak działa aplikacja — opis funkcji i wskazówki"
```

---

## Sekcja: Do czego służy ta aplikacja?

**Tytuł:** "Do czego służy ta aplikacja?"

**Treść:**
"Planujesz wykończenie mieszkania? Ta aplikacja pomoże Ci zapanować nad budżetem — od pierwszego kosztorysu po ostatnią płatność. Importuj dane z Excela lub dodawaj ręcznie, porównuj warianty cenowe, śledź co opłacone, a co jeszcze przed Tobą."

"Dane przechowywane są lokalnie w przeglądarce — nie są nigdzie wysyłane. Rób eksporty jako backup."

---

## Sekcja: Podsumowanie

**Tytuł:** "Podsumowanie"

**Treść:**
"Strona główna — pełny obraz budżetu na jednym ekranie."

**Funkcje:**
- **Karty KPI** — "Łączne wpływy, dostępne środki, opłacone, do zapłaty, bilans."
- **Bilans** — "Zielony = środki wystarczają. Czerwony = brakuje pieniędzy."
- **Wykresy** — "Podział wydatków, struktura procentowa, zakres cenowy, postęp płatności."
- **Scenariusze** — "Najtaniej / obecny plan / najdrożej — na podstawie dodanych alternatyw."
- **Pominięte w diagramach** — "Każdy widget pokazuje wartość „razem z pominiętymi" — ile kosztowałoby wszystko gdybyś nic nie wyłączył."

---

## Sekcja: Środki

**Tytuł:** "Środki"

**Treść:**
"Rejestruj pieniądze wpływające do budżetu: wypłaty, oszczędności, zwroty podatku, przelewy od rodziny."

**Funkcje:**
- **Dodaj wpływ** — "Data, opis, kwota. Np. „Przelew z konta oszczędnościowego — 10 000 zł"."
- **Dostępne środki** — "Suma wpływów minus wszystko co już opłacone. Aktualizuje się automatycznie."
- **Ujemna kwota** — "Wpisz kwotę ujemną jako korektę (np. błędny przelew)."

**Tip:**
"Wpływy wpływają na bilans w podsumowaniu i pasek budżetu we wszystkich zakładkach wydatków."

---

## Sekcja: Prognoza

**Tytuł:** "Prognoza"

**Treść:**
"Zaplanuj przyszłe wpływy i sprawdź na wykresie, kiedy zgromadzisz wystarczająco pieniędzy na pokrycie wydatków."

**Funkcje:**
- **Nowy wpływ** — "Dodaj przyszłą wpłatę z datą — np. „Wypłata wrzesień — 8 000 zł"."
- **Wykres prognozowy** — "Niebieska linia = Twoje środki rosnące w czasie. Pomarańczowa = cel (ile musisz jeszcze zapłacić). Gdy niebieska przekroczy pomarańczową — budżet się domyka."
- **Zielony punkt** — "Pierwszy punkt = Twoje dostępne środki dziś."
- **Oznacz jako zrealizowany** — "Checkbox przy wpisie — zrealizowany wpływ przenosi się do środków."
- **📌 Ważne daty** — "Deadliny i terminy. Na wykresie pojawiają się jako pionowe linie z prognozą."
- **Tooltip ważnej daty** — "Najedź na chip pod wykresem — zobaczysz prognozowane środki i bilans na dany dzień."

**Tip:**
"Niezrealizowane wpływy nie wliczają się do dostępnych środków — pojawiają się tylko w prognozie."

---

## Sekcja: Zakładki wydatków

**Tytuł:** "Zakładki wydatków"

**Treść:**
"Pięć zakładek z wydatkami pogrupowanymi tematycznie:"

**Lista:**
- "Meble — meble, lampy, dekoracje, wyposażenie"
- "Wykończenie — prace remontowe, materiały"
- "AGD / RTV — sprzęt domowy i elektronika"
- "Inne — opłaty, ubezpieczenia, drobne zakupy"
- "Przeprowadzka — transport, naprawy, logistyka"

**Podtytuł:** "Co możesz zrobić z każdą pozycją:"

**Funkcje:**
- **Włącz / Wyłącz z budżetu** — "Ikona $ przy pozycji. Wyłączone nie wliczają się do wydatków."
- **Zmień status** — "Kliknij chip „Do zapłaty" / „Opłacone" aby przełączyć."
- **Menu ⋮** — "Edytuj, dodaj linki, alternatywy lub usuń pozycję."
- **Rozwiń szczegóły** — "Strzałka po lewej pokazuje cenę główną i alternatywy z linkami."
- **Uwagi** — "Ikona 💬 z tooltipem pokazuje notatki przypisane do pozycji."

---

## Sekcja: Grupy

**Tytuł:** "Grupy"

**Treść:**
"Pozycje w każdej zakładce są zorganizowane w grupy (np. pomieszczenia, etapy, producenci). Menu ⋮ przy grupie:"

**Funkcje:**
- **Wyłącz grupę** — "Wyłącza wszystkie pozycje z budżetu — bez usuwania. Przydatne do ukrywania opcjonalnych zakupów."
- **Zmień nazwę** — "Zmienia nazwę grupy na wszystkich pozycjach."
- **Usuń grupę** — "Usuwa grupę ze WSZYSTKIMI pozycjami. Nieodwracalne. Jeśli chcesz tylko wyłączyć — użyj „Wyłącz"."
- **Nowa grupa** — "Przycisk w nagłówku strony. Tworzy pustą grupę."

**Tip:**
"Wyłączona grupa jest przyciemniona i oznaczona chipem „wyłączona" — łatwo ją odróżnić."

---

## Sekcja: Alternatywy cenowe

**Tytuł:** "Alternatywy cenowe"

**Treść:**
"Każda pozycja może mieć wiele wariantów cenowych — np. ten sam mebel w różnych sklepach lub różne modele AGD."

**Funkcje:**
- **Dodaj alternatywę** — "Menu ⋮ → „Alternatywy" lub rozwiń pozycję i kliknij + w sekcji ALT."
- **Ustaw jako główną** — "Ikona ⇄ przy alternatywie — zamienia ją z obecną ceną główną."
- **Porównuj ceny** — "Strzałki ↑↓ pokazują czy alternatywa jest droższa czy tańsza."
- **Wpływ na scenariusze** — "Alternatywy tworzą zakres min–max widoczny w podsumowaniu."

**Tip:**
"Przy oznaczaniu pozycji jako opłaconej pojawi się pytanie „Którą opcję opłaciłeś?" — żeby prawidłowo zaksięgować kwotę."

---

## Sekcja: Pasek budżetu

**Tytuł:** "Pasek budżetu"

**Treść:**
"Widoczny na stronach wydatków. Wizualizuje relację między Twoimi środkami a wydatkami:"

**Funkcje:**
- **Zielony segment** — "Twoje środki."
- **Czerwone segmenty** — "Wydatki wykraczające poza budżet: ciemny = minimum, średni = plan, jasny = maksimum."
- **Markery** — "Najedź aby zobaczyć kwoty: minimum, maksimum, plan wydatków, budżet."
- **Kafelek bilansu** — "Nadwyżka (+) lub brakująca kwota (−)."

---

## Sekcja: Dane

**Tytuł:** "Import i eksport"

**Treść:**
"Zarządzanie danymi — wczytywanie z Excela, pobieranie aktualnego stanu, generowanie szablonu."

**Funkcje:**
- **Import** — "Przeciągnij plik .xlsx lub kliknij aby wybrać. Dane zostają załadowane do aplikacji."
- **Eksport** — "Pobiera plik .xlsx ze wszystkimi danymi — kompatybilny z importem."
- **Szablon** — "Pusty plik .xlsx ze wszystkimi arkuszami i nagłówkami. Gotowy do wypełnienia."
- **Ponowny import** — "Zastępuje obecne dane. Przed reimportem warto wyeksportować backup."

**Tip:**
"Obsługiwane arkusze: Meble, Wykończenie, AGD, Pozostałe, Wyprowadzka, Saldo, Harmonogram, Milestones, Notatki. Wystarczy jeden — reszta opcjonalna."

---

## Sekcja: Notatki

**Tytuł:** "Notatki"

**Treść:**
"Panel po prawej stronie — lista zadań i szybkie notatki widoczne na każdej stronie."

**Funkcje:**
- **Dodawanie** — "Kliknij + w nagłówku panelu."
- **Edycja** — "Kliknij w tekst i zacznij pisać."
- **Kolory** — "Najedź na notatkę → ikona kółka → 6 kolorów."
- **Oznacz jako gotowe** — "Checkbox po lewej. Gotowe notatki przechodzą na dół listy."
- **Ukryj panel** — "Kliknij „Notatki" na dole paska bocznego."

**Tip:**
"Notatki są eksportowane i importowane razem z resztą danych."

---

## Sekcja: Wyłączanie z budżetu

**Tytuł:** "Wyłączanie z budżetu"

**Treść:**
"Dwa poziomy — możesz wyłączyć pojedynczą pozycję lub całą grupę:"

**Funkcje:**
- **Pozycja → ikona $** — "Pozycja się przyciemnia i nie wlicza do wydatków."
- **Grupa → menu ⋮ → Wyłącz** — "Wyłącza WSZYSTKIE pozycje w grupie naraz."
- **Przywracanie** — "Kliknij $ ponownie lub wybierz „Włącz grupę" z menu."

**Tip:**
"Wyłączanie jest odwracalne — nic nie jest usuwane. Przydatne do tymczasowego pomijania opcjonalnych wydatków."

---

## Sekcja: Pominięte

**Tytuł:** "Pominięte"

**Treść:**
"Strona zbierająca wszystkie pozycje wyłączone z budżetu — widzisz co pominąłeś i ile zaoszczędziłeś."

**Funkcje:**
- **Lista** — "Tabela pogrupowana wg kategorii z nazwą, grupą i kwotą."
- **Zaoszczędzone** — "Suma pominiętych pozycji."
- **Przywróć** — "Ikona ⊕ przy pozycji — klik przywraca ją do budżetu."

**Tip:**
"Pominięte pozycje nie znikają z systemu — zawsze możesz je przywrócić."

---

## Sekcja: Skróty

**Tytuł:** "Wskazówki"

**Funkcje:**
- **Logo → Podsumowanie** — "Kliknij logo w pasku bocznym aby wrócić na stronę główną."
- **Motywy** — "Paleta na dole paska bocznego — 4 motywy kolorystyczne."
- **Status jednym kliknięciem** — "Kliknij chip statusu aby przełączyć."
- **Ikona ? przy tytule** — "Na stronach wydatków — najedź aby zobaczyć opis zakładki."
- **Dane lokalne** — "Wszystko w pamięci przeglądarki. Wyczyszczenie danych = utrata. Rób eksporty!"
- **Co nowego** — "Historia zmian i nowych funkcji."
