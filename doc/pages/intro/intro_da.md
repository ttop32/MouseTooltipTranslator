# Hvordan man bruger

- Grundlæggende anvendelser: Hold markøren over eller vælg (fremhæv) tekst for at oversætte.
  - Test svæver med eksempeltekst:
```console

Proletarer i alle lande, forenes!
```

  - Hvis oversættelsen ikke fungerer, skal du kontrollere det aktuelle målsprog
    - Kontroller [hvordan man ændrer sprog] (https://github.com/ttop32/mousetooltiptranslator/blob/main/doc/intro.md#change-miluage)
    - Denne oversætter udelader tekst, hvis kilden og målsprogene er identiske.

![Alt Text](/doc/reagre.gif)

- Hold <KBD> Venstrectrl </kbd> -tasten til at høre TTS-udtalen, når der vises en værktøjstip. Tryk på <kbd> esc </kbd> for at stoppe stemmen.
  - Prøv Double Press <KBD> Venstrectrl </kbd> for at lytte oversat resultattekst
! [Resultat] (/doc/20.gif)

- Tryk på <KBD> RETT-ELT </kbd> -tasten til at oversætte den tekst, du skriver (eller en hvilken som helst fremhævet tekst) i inputboksen. Hvis det er nødvendigt, kan du fortryde handlingen ved at trykke på <kbd> ctrl </kbd> + <kbd> z </kbd>.
  - Hvis oversættelsen ikke fungerer, skal du sikre dig, at dit nuværende målsprog matcher dit skriveprog.
  - Hvis <kbd> højre-Alt </kbd> er anvendelser som Hangul-swap,
Brug en anden nøgle til at arbejde med.

! [Resultat] (/doc/11.gif)

- Oversæt URL -søgefeltetekst ved at skrive <kbd>/</kbd>+<kbd> plads </kbd> før din forespørgsel.

! [Resultat] (/doc/21.gif)

- Support Online PDF til at vise oversat værktøjstip ved hjælp af pdf.js (lokal computer PDF -fil har brug for yderligere tilladelse, se [undtagelse] (https://github.com/ttop32/mousetooltiptranslator/blob/main/doc/intro.md#exception))

! [Resultat] (/doc/12.gif)

- Support dobbelt undertekster til YouTube -videoer.

! [Resultat] (/doc/16.gif)

- Proces OCR Når du holder <kbd> til venstre-skift </kbd> nøgle + mus over på et billede (f.eks. Manga)

! [Resultat] (/doc/15.gif)

- Kør autolæser af Press <KBD> f2 </kbd> nøgle
  - Det begynder at læse musen over tekst hele vejen med TTS
  - For at stoppe billæseren skal du trykke på <kbd> esc </kbd>
  - Prøv Double Press <kbd> f2 </kbd> for at lytte oversat resultattekst Auto Reader

! [Resultat] (/doc/30.gif)

- Aktivér oversætteren af ​​talegenkendelsen ved at holde den <kbd> højrektrl </kbd> -tast.
  - Standard Talegenkendelsessprog er engelsk.
  - Hvis talegenkendelsessprog og målsprog er det samme, springer det over.
  - Lydtilladelse er påkrævet
  - Kun kompatible med krombaserede browsere, såsom Google Chrome, MS-kant, Vivaldi, Opera, Brave, Arc og Yandex.
- Tilpas genvejstast
  - Fra Chrome: // Extensions/genveje eller den tilsvarende browser interne konfigurationsside, tilgængelig ved at udskifte krom: // med din browser's interne URL (f.eks. Kant: //, browser: // eller modig: // osv.).
# Skift sprog
- Skift det aktuelle sprog i indstillingssiden
  - Siden indstillinger kan fås ved at klikke på knappen Puslespil (udvidelse) placeret øverst til højre i din browser.

! [Resultat] (/doc/14.gif)


# Undtagelse

- Hvis kildesekstsprog og oversættelsessprog er det samme, springer det over.
- Hvis Page ikke er fokuseret, registreres nøgleindgang ikke.
Klik på Klik for at fokusere side inden input -tastaturet.
- Applikationen fungerer ikke, hvis webstatus er offline.
- Hvis webstedet er <https://chrome.google.com/extensions>, fungerer det ikke, fordi Chrome Security Reason.
- Hvis der ikke gives nogen lokal filtilladelse, kan lokal PDF ikke håndteres.
  - Hvis filen ikke åbner, kan du prøve at trække og slippe den på fanen.
  - Det viser en advarsel om tilladelse og omdirigering til tilladelsessiden.
  - På den omdirigerede side skal du sikre dig, at du vælger "Tillad adgang til fil -URL'er" til at få adgang til filer.
  - Genåbne PDF for at påvirke med det samme
! [Resultat] (/doc/10.gif)