＃如何使用


- 基本用途：懸停或選擇（突出顯示）文本要翻譯。
  - 測試懸停在示例文本中：
```console

Proletarier aller Länder, vereinigt euch!

```

  - 如果翻譯不起作用，請檢查當前的目標語言
    - 檢查[如何更改語言]（https://github.com/ttop32/mousetooltiptranslator/blob/main/main/doc/intro.md#change-language）
    - 如果源語言和目標語言相同，則該翻譯人員將省略文本。


![Alt Text](/doc/reagre.gif)



- 按下<kbd>左ctrl </kbd>鍵在出現工具提示時聽到tts發音。按<kbd> esc </kbd>停止聲音。
  - 嘗試double Press <kbd>左ctrl </kbd>聆聽翻譯結果文本
![result](/doc/20.gif)



- 按<kbd>右alt </kbd>鍵，以在輸入框中翻譯您正在編寫的文本（或任何突出顯示的文本）。如果需要，您可以通過按<kbd> ctrl </kbd> + <kbd> z </kbd>來撤消操作。
  - 如果翻譯不起作用，請確保您當前的目標語言與您的寫作語言匹配。
  - 如果<kbd>右alt </kbd>用作hangul交換，則
使用其他鑰匙可以使用。


![result](/doc/11.gif)



- 通過鍵入<kbd>/</kbd>+<kbd> Space </kbd>在查詢之前翻譯URL搜索框文本。


![result](/doc/21.gif)



- 支持在線pdf使用pdf.js顯示翻譯工具提示（本地計算機PDF文件需要額外許可，請參見[excefe]（https://github.com/ttop32/mousetooltiptranslator/blob/blob/main/main/main/main/doc/doc/intro.md#exception））


![result](/doc/12.gif)



- 支持YouTube和Netflix的雙字幕。


![result](/doc/16.gif)



- 持有<kbd>左移</kbd>鍵 +鼠標的過程OCR（例如，漫畫）


![result](/doc/15.gif)



- 按下<kbd> f2 </kbd>鍵運行自動讀取器
  - 它開始用TTS一直在文本上讀取鼠標
  - 要停止自動閱讀器press <kbd> esc </kbd>
  - 嘗試double Press <kbd> f2 </kbd>聆聽翻譯結果文本自動讀取器


![result](/doc/30.gif)



- 通過按住<kbd>右鍵</kbd>鍵來激活語音識別轉換器。
  - 默認語音識別語言是英語。
  - 如果語音識別語言和目標語言相同，則跳過。
  - 需要音頻許可
  - 僅與基於鉻的瀏覽器兼容，例如Google Chrome，MS-Edge，Vivaldi，Opera，Brave，Arc和Yandex。
- 自定義快捷鍵
  - 從Chrome：//擴展/快捷方式或等效瀏覽器內部配置頁面，可以通過用瀏覽器的內部URL替換Chrome：//訪問Chrome：//（例如，Edge：//，browser：//，browser：// brave：// brave：// etct）。
＃更改語言
- 在設置頁面中更改當前語言
  - 可以通過單擊位於瀏覽器右上方的拼圖（擴展）按鈕來訪問設置頁面。


![result](/doc/14.gif)





＃ 例外


- 如果源文本語言和翻譯語言相同，它將跳過。
- 如果頁面未集中，則未檢測到密鑰輸入。
在輸入鍵盤之前，請單擊“聚焦”頁面。
- 如果Web狀態脫機，則應用程序將無法運行。
- 如果網站為<https://chrome.google.com/extensions>，則由於Chrome安全原因而行不通。
- 如果未給出本地文件，則無法處理本地PDF。
  - 如果文件未打開，請嘗試將其拖放到選項卡上。
  - 它將顯示一個權限警告，並將其重定向到“權限”頁面。
  - 在重定向頁面上，請確保您選擇“允許訪問文件URL”訪問文件。
  - 重新打開PDF立即影響
![result](/doc/10.gif)
