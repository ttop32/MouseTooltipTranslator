# How to use

- Basic Uses: Hover over or select (highlight) text to translate. 
  - Test hover with example text:  
```console
Proletarier aller Länder, vereinigt euch!
```
  - If the translation isn't working, check current target language
    - Check [how to change language](https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/intro.md#change-language)
    - This translator will omit text if the source and target languages are identical.

![Alt Text](/doc/reagre.gif)

- Hold the <kbd>left-ctrl</kbd> key to hear the TTS pronunciation when a tooltip appears. Press <kbd>Esc</kbd> to stop the voice.
  - Try double press <kbd>left-ctrl</kbd> to listen translated result text
![result](/doc/20.gif)

- Press the <kbd>right-alt</kbd> key to translate the text you're writing (or any highlighted text) in the input box. If needed, you can undo the action by pressing <kbd>ctrl</kbd> + <kbd>z</kbd>.
  - If the translation isn't working, ensure that your current target language matches your writing language.
  - If <kbd>right-alt</kbd> is uses as hangul swap,
  use other key to work with. 

![result](/doc/11.gif)

- Translate URL search box text by typing <kbd>/</kbd>+<kbd>space</kbd> before your query.

![result](/doc/21.gif)

- Support online pdf to display translated tooltip using PDF.js (local computer pdf file need additional permission, see [exception](https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/intro.md#exception))

![result](/doc/12.gif)

- Support dual subtitles for YouTube and Netflix.

![result](/doc/16.gif)

- Process OCR when holding <kbd>left-shift</kbd> key + mouse over on an image (e.g., manga)

![result](/doc/ocr_result1.gif)

- Run auto reader by press <kbd>F2</kbd> key
  - It start read mouse over text all the way with tts
  - To stop the auto reader press <kbd>Esc</kbd> 
  - Try double press <kbd>F2</kbd> to listen translated result text auto reader

![result](/doc/30.gif)

- Activate the speech recognition translator by holding down the <kbd>right-ctrl</kbd> key.
  - Default speech recognition language is English.
  - If the speech recognition language and target language are the same, it skips.
  - Audio permission is required
  - Only compatible with Chromium-based browsers, such as Google Chrome, MS-Edge, Vivaldi, Opera, Brave, Arc, and Yandex.
- Customize shortcut key
  - From chrome://extensions/shortcuts or the equivalent browser internal configuration page, accessible by replacing chrome:// with your browser's internal URL (e.g., edge://, browser://, or brave:// etc).
# Change Language
- Change current language in setting page
  -  The Settings page can be accessed by clicking the puzzle (extension) button  located at the top right of your browser.

![result](/doc/14.gif)


# Exception

- If source text language and translate language are same, it will skip. 
  - Manual source language selection may bypass the same language omit logic.
- If page is not focused, key input is not detected. 
Make click to focus page before input keyboard.
- The application will not function if the web status is offline. 
- If site is <https://chrome.google.com/extensions>, it does not work because Chrome security reason. 
- If no local file permission given, local pdf cannot be handled.
  - If the file doesn't open, try dragging and dropping it onto the tab.
  - It will display a permission warning and redirect to the permission page.
  - On the redirected page, ensure that you select "allow access to file URLs" to access files.
  - Reopen PDF to affect right away
![result](/doc/10.gif)
