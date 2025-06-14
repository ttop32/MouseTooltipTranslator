# Jak używać


- Podstawowe zastosowania: Wpadaj na lub wybierz (podświetl) tekst do przetłumaczenia.
  - Test najeżdżający z przykładowym tekstem:
```console

Proletarier aller Länder, vereinigt euch!

```

  - Jeśli tłumaczenie nie działa, sprawdź bieżący język docelowy
    - Sprawdź [Jak zmienić język] (https://github.com/ttop32/mousetooltiptranslator/blob/main/doc/intro.md#change-language)
    - Ten tłumacz pominie tekst, jeśli języki źródłowe i docelowe są identyczne.


![Alt Text](/doc/reagre.gif)



- Przytrzymaj klucz <kbd> lewy-ctrl </kbd>, aby usłyszeć wymowę TTS, gdy pojawia się podpowiedź. Naciśnij <kbd> ESC </kbd>, aby zatrzymać głos.
  - Spróbuj podwójnie naciśnij <kbd> lewy-ctrl </kbd>, aby wysłuchać przetłumaczonych tekstu wyników
![result](/doc/20.gif)



- Naciśnij klawisz <kbd> Right-Alt </kbd>, aby przetłumaczyć tekst, który piszesz (lub dowolny tekst podświetlony) w polu wejściowym. W razie potrzeby możesz cofnąć akcję, naciskając <kbd> ctrl </kbd> + <kbd> Z </kbd>.
  - Jeśli tłumaczenie nie działa, upewnij się, że Twój obecny język docelowy pasuje do twojego języka pisania.
  - Jeśli <kbd> prawy alt </kbd> jest używa się jako zamiana hangul,
Użyj innego klucza do pracy.


![result](/doc/11.gif)



- Przetłumacz tekst wyszukiwania adresu URL, wpisując <kbd>/</kbd>+<kbd> Space </kbd> przed zapytaniem.


![result](/doc/21.gif)



- Obsługuj online PDF, aby wyświetlić przetłumaczone podpowiedź za pomocą pdf.js (lokalny plik pdf komputera potrzebuje dodatkowego uprawnienia, patrz [wyjątek] (https://github.com/ttop32/MouseTiptranslator/blob/Main/doc/Intro.md#exception))


![result](/doc/12.gif)



- Obsługuj podwójne napisy dla YouTube i Netflix.


![result](/doc/16.gif)



- Przetwarzaj OCR podczas trzymania <kbd> SHIFT LEFT </kbd> Klucz + mysz na obraz (np. Manga)


![result](/doc/15.gif)



- Uruchom automatyczne czytnik przez naciśnij klawisz <kbd> F2 </kbd>
  - Zaczyna czytać myszę przez tekst do końca z TTS
  - Aby zatrzymać Auto Reader, naciśnij <kbd> ESC </kbd>
  - Wypróbuj podwójnie naciśnij <kbd> f2 </kbd>, aby wysłuchać przetłumaczonego tekstu Auto Reader


![result](/doc/30.gif)



- Aktywuj tłumacz rozpoznawania mowy, przytrzymując klawisz <kbd> prawy-ctrl </kbd>.
  - Domyślny język rozpoznawania mowy to angielski.
  - Jeśli język rozpoznawania mowy i język docelowy są takie same, pomija.
  - Wymagane jest pozwolenie na dźwięk
  - Kompatybilne tylko z przeglądarkami na bazie chromu, takimi jak Google Chrome, MS-Edge, Vivaldi, Opera, Brave, ARC i Yandex.
- Dostosuj klucz skrótu
  - Z Chrome: // rozszerzenia/skróty lub równoważna strona konfiguracji wewnętrznej przeglądarki, dostępna przez zastąpienie Chrome: // wewnętrznym adresem URL przeglądarki (np. Edge: //, przeglądarka: // lub odważny: // etc).
# Zmień język
- Zmień bieżący język na stronie ustawienia
  - Stronę ustawień można uzyskać, klikając przycisk Łamigłówka (rozszerzenie) znajdującego się w prawym górnym rogu przeglądarki.


![result](/doc/14.gif)





# Wyjątek


- Jeśli język tekstowy i język tłumaczenia są takie same, przeskakuje.
- Jeśli strona nie jest skupiona, wejście klucza nie jest wykryte.
Zrób stronę kliknięcia, aby Focus przed wejściem klawiatury.
- Aplikacja nie będzie działać, jeśli status sieci jest offline.
- Jeśli witryna to <https://chrome.google.com/EXTENSIONS>, nie działa, ponieważ chromowany rozum bezpieczeństwa.
- Jeśli nie udzieliłby lokalnego pliku, nie można obsłużyć lokalnego pliku PDF.
  - Jeśli plik się nie otwiera, spróbuj przeciągnąć i upuścić go na kartę.
  - Wyświetli ostrzeżenie o uprawnieniu i przekieruje na stronę uprawnienia.
  - Na stronie przekierowanej upewnij się, że wybierz „Zezwalaj na dostęp do plików URL” w celu uzyskania dostępu do plików.
  - Ponownie otwórz pdf, aby od razu wpłynąć
![result](/doc/10.gif)
