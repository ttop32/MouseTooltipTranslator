# How to use

- Basic uses : Hover or select (highlight) on text to translate
  - Test hover with example text
    - Toute nation a le gouvernement qu'elle mérite.
    - Proletarier aller Länder, vereinigt euch!
![Alt Text](/doc/result_0.gif)
- Use <kbd>left ctrl</kbd> to Listen pronunciation with google TTS (text to speech)
- Use <kbd>left alt</kbd> to translate writing text in input box (or highlighted text)
- Support pdf to display translated tooltip using PDF.js
![result](/doc/screenshot_3.png)
- Translate youtube caption when mouse over subtitle block
![result](/doc/screenshot_6.png)
- Process OCR when hold <kbd>left shift</kbd> + <kbd>mouse over</kbd> on image (ex manga)
![result](/doc/screenshot_5.png)
- Setting page is given for customizing to taste
![result](/doc/screenshot_4.png)

# Exception

- If source text language and translate language are same, it will skip
- If source text and result text are same, it will skip
- If web status is offline, it will not work
- If site is <https://chrome.google.com/extensions>, it does not work because Chrome security reason
- If no local file permission given, local pdf cannot be handled
