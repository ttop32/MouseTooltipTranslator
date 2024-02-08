# How to use

- Basic uses : Hover or select (highlight) on text to translate. 
  - Test hover with example text:  
```console
Proletarier aller Länder, vereinigt euch!
```
  - If not working, check current target language
    - Check [how to change language](https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/intro.md#change-language)
    - This translator will skip text if source text language and target language are same.

![Alt Text](/doc/result_0.gif)
- Hold <kbd>left ctrl</kbd> to listen tts pronunciation when tooltip is shown(Press <kbd>esc</kbd> to stop voice)
![result](/doc/20.gif)
- Use <kbd>right alt</kbd> to translate writing text (or highlighted text) in input box. (Do undo, press <kbd>ctrl</kbd> +<kbd>z</kbd>)
  - If not working, check current target language and writing language.
![result](/doc/11.gif)
- Translate url search box text by <kbd>/</kbd>+<kbd>space</kbd> before typing. 
![result](/doc/21.gif)
- Support online pdf to display translated tooltip using PDF.js (local computer pdf file need additional permission, see [exception](https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/intro.md#exception))
![result](/doc/12.gif)
- Support dual subtitles for youtube video. 
![result](/doc/16.gif)
- Process OCR when hold <kbd>left shift</kbd> + <kbd>mouse over</kbd> on image (ex manga)
![result](/doc/15.gif)

# Change Language
- Change current language in setting page
  -  Setting page can be found in browser top right puzzle button
![result](/doc/14.gif)


# Exception

- If source text language and translate language are same, it will skip. 
- If web status is offline, it will not work. 
- If site is <https://chrome.google.com/extensions>, it does not work because Chrome security reason. 
- If no local file permission given, local pdf cannot be handled. (If not working, darg and drop file on tab)
  - make sure to give "allow access to file urls" to open file    
![result](/doc/10.gif)
