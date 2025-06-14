# Hur man använder


- Grundläggande användningar: Håll mot eller välj (markera) text för att översätta.
  - Testa svävar med exempel text:
```console

Proletarier aller Länder, vereinigt euch!

```

  - Om översättningen inte fungerar, kontrollera det nuvarande målspråket
    - Kontrollera [hur man ändrar språk] (https://github.com/ttop32/mousetooltiptranslator/blob/main/doc/intro.md#change-language)
    - Denna översättare kommer att utelämna text om käll- och målspråken är identiska.


![Alt Text](/doc/reagre.gif)



- Håll <kbd> vänster-ctrl </kbd> -nyckeln för att höra TTS-uttalet när ett verktygstips visas. Tryck på <kbd> ESC </kbd> för att stoppa rösten.
  - Prova dubbelpress <kbd> vänster-ctrl </kbd> för att lyssna översatt resultattext
![result](/doc/20.gif)



- Tryck på <kbd> höger-alt </kbd> -tangenten för att översätta texten du skriver (eller någon markerad text) i inmatningsrutan. Om det behövs kan du ångra åtgärden genom att trycka på <kbd> ctrl </kbd> + <kbd> z </kbd>.
  - Om översättningen inte fungerar, se till att ditt nuvarande målspråk matchar ditt skrivspråk.
  - Om <kbd> höger-alt </kbd> används som hangulbyte,
Använd annan nyckel för att arbeta med.


![result](/doc/11.gif)



- Översätt URL -sökrutetext genom att skriva <kbd>/</kbd>+<kbd> Space </kbd> innan din fråga.


![result](/doc/21.gif)



- Support Online PDF för att visa översatt verktygstip med pdf.js (lokal dator pdf -fil behöver extra tillstånd, se [undantag] (https://github.com/ttop32/mousetooltiptranslator/blob/main/doc/intro.md#exception)))))


![result](/doc/12.gif)



- Stöd med dubbla undertexter för YouTube och Netflix.


![result](/doc/16.gif)



- Process OCR När du håller <kbd> vänsterskift </kbd> nyckel + mus över på en bild (t.ex. manga)


![result](/doc/15.gif)



- Kör Auto Reader av Press <kbd> f2 </kbd> -nyckel
  - Det börjar läsa mus över text hela vägen med TTS
  - För att stoppa Auto Reader Press <kbd> ESC </kbd>
  - Prova dubbelpress <kbd> f2 </kbd> för att lyssna översatt resultat text auto läsare


![result](/doc/30.gif)



- Aktivera översättaren av taligenkänning genom att hålla ner <kbd> höger-ctrl </kbd> -tangenten.
  - Standard Taligenkänningsspråk är engelska.
  - Om taligenkänningsspråket och målspråket är detsamma, hoppar det över.
  - Ljudtillstånd krävs
  - Endast kompatibel med krombaserade webbläsare, såsom Google Chrome, MS-Edge, Vivaldi, Opera, Brave, Arc och Yandex.
- Anpassa genvägsnyckel
  - Från Chrome: // Extensions/genvägar eller motsvarande webbläsarens interna konfigurationssida, tillgänglig genom att ersätta Chrome: // med din webbläsares interna URL (t.ex. kant: //, webbläsare: //, eller modiga: // etc).
# Ändra språk
- Ändra aktuellt språk i inställningssidan
  - Inställningssidan kan nås genom att klicka på knappen pussel (förlängning) längst upp till höger i din webbläsare.


![result](/doc/14.gif)





# Undantag


- Om källtextspråket och översätter språket är detsamma, det kommer att hoppa över.
- Om sidan inte är fokuserad upptäcks inte nyckelingången.
Gör att klicka för att fokusera på sidan innan ingångstangentbordet.
- Applikationen fungerar inte om webbstatusen är offline.
- Om webbplatsen är <https://chrome.google.com/extensions>, fungerar det inte eftersom kromsäkerhetsskäl.
- Om ingen lokal filtillstånd ges kan lokal PDF inte hanteras.
  - Om filen inte öppnar, försök att dra och släppa den på fliken.
  - Den kommer att visa en tillståndsvarning och omdirigera till tillståndssidan.
  - På den omdirigerade sidan, se till att du väljer "Tillåt åtkomst till fil URL: er" för att få åtkomst till filer.
  - Öppna PDF igen för att påverka direkt
![result](/doc/10.gif)
