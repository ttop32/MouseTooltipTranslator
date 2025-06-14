# Hvordan bruke


- Grunnleggende bruksområder: Hold over eller velg (Highlight) tekst som skal oversettes.
  - Test Hover med eksempel tekst:
```console

Proletarier aller Länder, vereinigt euch!

```

  - Hvis oversettelsen ikke fungerer, kan du sjekke gjeldende målspråk
    - Sjekk [hvordan du endrer språk] (https://github.com/ttop32/mousetoooltiptranslator/blob/main/doc/intro.md#change-anguage)
    - Denne oversetteren vil utelate tekst hvis kilden og målspråkene er identiske.


![Alt Text](/doc/reagre.gif)



- Hold <kbd> venstre-ctrl </kbd> -tasten for å høre TTS-uttalen når en verktøytips vises. Trykk på <kbd> esc </kbd> for å stoppe stemmen.
  - Prøv dobbelt trykk <kbd> venstre-ctrl </kbd> for å lytte oversatt resultattekst
![result](/doc/20.gif)



- Trykk på <kbd> høyre-alt </kbd> -tasten for å oversette teksten du skriver (eller hvilken som helst uthevet tekst) i inngangsboksen. Om nødvendig kan du angre handlingen ved å trykke på <kbd> ctrl </kbd> + <kbd> z </kbd>.
  - Hvis oversettelsen ikke fungerer, må du forsikre deg om at ditt nåværende målspråk samsvarer med skrivespråket ditt.
  - Hvis <kbd> høyre-alt </kbd> brukes som Hangul Swap,
Bruk annen tast til å jobbe med.


![result](/doc/11.gif)



- Oversett URL -søkeboks ved å skrive <kbd>/</kbd>+<kbd> Space </kbd> før spørringen.


![result](/doc/21.gif)



- Støtt online pdf for å vise oversatt verktøytip ved hjelp av pdf.js (lokal datamaskin pdf -fil trenger ekstra tillatelse, se [unntak] (https://github.com/ttop32/mousetooltiptranslator/blob/main/doc/intro.md#xception)))


![result](/doc/12.gif)



- Støtt dobbelt undertekster for YouTube og Netflix.


![result](/doc/16.gif)



- Prosess OCR når du holder <kbd> venstre-shift </kbd> nøkkel + mus over på et bilde (f.eks. Manga)


![result](/doc/15.gif)



- Kjør Auto Reader av Press <kbd> f2 </kbd> nøkkel
  - Det begynner å lese musen over tekst hele veien med TTS
  - For å stoppe Auto Reader Press <kbd> esc </kbd>
  - Prøv Double Press <kbd> F2 </kbd> for å lytte til oversatt resultatetekst Auto Reader


![result](/doc/30.gif)



- Aktiver talegjenkjenningsoversetteren ved å holde nede <kbd> høyre-ctrl </kbd> -tasten.
  - Standard talegjenkjenningsspråk er engelsk.
  - Hvis talegjenkjenningsspråket og målspråket er det samme, hopper det over.
  - Lydtillatelse er påkrevd
  - Bare kompatibel med krombaserte nettlesere, som Google Chrome, MS-kant, Vivaldi, Opera, Brave, Arc og Yandex.
- Tilpass snarveisnøkkelen
  - Fra Chrome: // Extensions/Sharcuts eller Equivalent Browser Intern Configuration Page, tilgjengelig ved å erstatte Chrome: // med nettleserens interne URL (f.eks. Edge: //, nettleser: //, eller modig: // etc).
# Endre språk
- Endre gjeldende språk i innstillingssiden
  - Innstillingssiden kan nås ved å klikke på Puzzle (Extension) -knappen øverst til høyre i nettleseren.


![result](/doc/14.gif)





# Unntak


- Hvis tekstspråk og oversetter språk er det samme, vil det hoppe over.
- Hvis Page ikke er fokusert, blir nøkkelinngang ikke oppdaget.
Lag klikk for å fokusere siden før du legger inn tastaturet.
- Applikasjonen vil ikke fungere hvis nettstatusen er frakoblet.
- Hvis nettstedet er <https://chrome.google.com/Extensions>, fungerer det ikke fordi Chrome Security Reason.
- Hvis ingen lokal filtillatelse gitt, kan ikke lokal PDF håndteres.
  - Hvis filen ikke åpnes, kan du prøve å dra og slippe den på fanen.
  - Den vil vise en tillatelsesadvarsel og omdirigere til tillatelsessiden.
  - På den omdirigerte siden må du forsikre deg om at du velger "Tillat Access to File URL -er" for å få tilgang til filer.
  - Åpne PDF på nytt for å påvirke med en gang
![result](/doc/10.gif)
