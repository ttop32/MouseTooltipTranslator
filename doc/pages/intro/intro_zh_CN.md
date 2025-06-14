＃如何使用


- 基本用途：悬停或选择（突出显示）文本要翻译。
  - 测试悬停在示例文本中：
```console

Proletarier aller Länder, vereinigt euch!

```

  - 如果翻译不起作用，请检查当前的目标语言
    - 检查[如何更改语言]（https://github.com/ttop32/mousetooltiptranslator/blob/main/main/doc/intro.md#change-language）
    - 如果源语言和目标语言相同，则该翻译人员将省略文本。


![Alt Text](/doc/reagre.gif)



- 按下<kbd>左ctrl </kbd>键在出现工具提示时听到tts发音。按<kbd> esc </kbd>停止声音。
  - 尝试double Press <kbd>左ctrl </kbd>聆听翻译结果文本
![result](/doc/20.gif)



- 按<kbd>右alt </kbd>键，以在输入框中翻译您正在编写的文本（或任何突出显示的文本）。如果需要，您可以通过按<kbd> ctrl </kbd> + <kbd> z </kbd>来撤消操作。
  - 如果翻译不起作用，请确保您当前的目标语言与您的写作语言匹配。
  - 如果<kbd>右alt </kbd>用作hangul交换，则
使用其他钥匙可以使用。


![result](/doc/11.gif)



- 通过键入<kbd>/</kbd>+<kbd> Space </kbd>在查询之前翻译URL搜索框文本。


![result](/doc/21.gif)



- 支持在线pdf使用pdf.js显示翻译工具提示（本地计算机PDF文件需要额外许可，请参见[excefe]（https://github.com/ttop32/mousetooltiptranslator/blob/blob/main/main/main/main/doc/doc/intro.md#exception））


![result](/doc/12.gif)



- 支持YouTube和Netflix的双字幕。


![result](/doc/16.gif)



- 持有<kbd>左移</kbd>键 +鼠标的过程OCR（例如，漫画）


![result](/doc/15.gif)



- 按下<kbd> f2 </kbd>键运行自动读取器
  - 它开始用TTS一直在文本上读取鼠标
  - 要停止自动阅读器press <kbd> esc </kbd>
  - 尝试double Press <kbd> f2 </kbd>聆听翻译结果文本自动读取器


![result](/doc/30.gif)



- 通过按住<kbd>右键</kbd>键来激活语音识别转换器。
  - 默认语音识别语言是英语。
  - 如果语音识别语言和目标语言相同，则跳过。
  - 需要音频许可
  - 仅与基于铬的浏览器兼容，例如Google Chrome，MS-Edge，Vivaldi，Opera，Brave，Arc和Yandex。
- 自定义快捷键
  - 从Chrome：//扩展/快捷方式或等效浏览器内部配置页面，可以通过用浏览器的内部URL替换Chrome：//访问Chrome：//（例如，Edge：//，browser：//，browser：// brave：// brave：// etct）。
＃更改语言
- 在设置页面中更改当前语言
  - 可以通过单击位于浏览器右上方的拼图（扩展）按钮来访问设置页面。


![result](/doc/14.gif)





＃ 例外


- 如果源文本语言和翻译语言相同，它将跳过。
- 如果页面未集中，则未检测到密钥输入。
在输入键盘之前，请单击“聚焦”页面。
- 如果Web状态脱机，则应用程序将无法运行。
- 如果网站为<https://chrome.google.com/extensions>，则由于Chrome安全原因而行不通。
- 如果未给出本地文件，则无法处理本地PDF。
  - 如果文件未打开，请尝试将其拖放到选项卡上。
  - 它将显示一个权限警告，并将其重定向到“权限”页面。
  - 在重定向页面上，请确保您选择“允许访问文件URL”访问文件。
  - 重新打开PDF立即影响
![result](/doc/10.gif)
