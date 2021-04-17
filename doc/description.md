When mouse hover on text, it shows translated tooltip in any desired language.

# Features
- Visualize tooltip on any web page (except chrome web store site)
- Using google translate to translate in any language
- In the setting, google TTS (text to speech) is available to listen text
- Support pdf to display translated tooltip using Mozilla PDF.js
- Filter out when source language and target language are same
- (Experimental feature) show comic bubble translation
  when mouse over on comic bubble background   

# Source code
- https://github.com/ttop32/MouseTooltipTranslator

# Setup Guide
If pop-over translate tooltip is not came out properly after installation, user need to reload all your existing pages to run web page with this extension for using extension feature. And, make sure to setting target translate language properly from pop up configuration page. Pop up configuration page is provided by click extension icon top right corner and click this extension's blue mouse icon. If user want to use this extension on local file, user need to set “allow access to file URLs” from chrome://extensions/?id=hmigninkgibhdckiaphhmbgcghochdjc.    

#privacy policy
https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/privacy_policy.md

# Change log
- 0.1.19
  - remove vue jsx
  - fix popup page title name
  - add "about section" on popup page
- 0.1.18
  - Support multilingual manifest description again
  - Rollback "Setup Guide" description
- 0.1.17
  - Google reject by “Having excessive keywords in description” again
    - No detail guideline is provided. Make guess to remove some item.
    - Remove all "Detail Description"
    - Remove all "Setup Guide"
- 0.1.16
  - google reject by “Having excessive keywords in description”
    - Guideline is provided to fix some description item.
    - Remove “Supported Translation Languages with google translate”
    - Remove “Supported TTS languages with google TTS”
    - Avoid frequently mentioned “Mouse tooltip translator” in description
  - Remove multilingual manifest description
  - Rollback google translate respond to fix it
  - Rollback extension name to “Mouse tooltip translator”
- 0.1.15
  - Change name, “Mouse tooltip translator” to “Mouseover translator”
  - Support font size customization
  - Support Bing translator
  - Fix google translate response
- 0.1.14
  - Fix hide tooltip (show tooltip after mouse move)
  - Support multilingual manifest description using google translate
- 0.1.13
  - Filter out when only detect currency sign text
- 0.1.12
  - Fix base64 image OCR response
  - Use Vue JSX on popup page
- 0.1.11
  - Use Vue and Vuetify on popup page
  - Add options_ui
  - Add step to load base64 image on OCR
  - Add step to resize image on OCR
  - Add image preprocessing step on OCR
- 0.1.10
  - Fix URL text filter
  - Filter text that only include number and special character
  - Hide tooltip when leave tab
  - Fix hiding when ctrl+a or ctrl+f is pressed
- 0.1.9
  - Only load bootstrap tooltip library (not whole bootstrap)
  - Apply script lazy load on manga OCR library script
  - Use transform method for tooltip positioning
- 0.1.8
  - Fix TTS (text to speech) stop message sending
  - Fix OCR image load
  - Use zodiac3539's train data for tesseract jpn_vert OCR
- 0.1.7
  - Fix scrolled tooltip dictionary position
  - Hide tooltip when ctrl+a or ctrl+f is pressed
  - Change popup page container design as cool design
  - Stop played TTS (text to speech) when leave tab
  - Only activate tooltip when tab is focused
  - Support bubble translation using tesseract.js (OCR) and opencv.js
  - Update translated pdf viewer using PDF.js 2.5.207
  - Filter out text that has over 1000 length
- 0.1.6
  - Fix to save setting correctly
  - Change hold key to action immediately
  - Fix popup page capital letter
- 0.1.5
  - Fix subframe pdf to work correctly
  - Fix dropdown menu crash from site that use bootstrap
- 0.1.4
  - Fix pdf line break
- 0.1.3
  - Add fade animation
  - Fix TTS (text to speech) enabled case to recognize
- 0.1.2
  - Increase tooltip margin
  - Prevent translation on URL text
  - Support pdf tooltip translation using Mozilla PDF.js (pdf reader)
- 0.1.1
  - Support long sentence for TTS (text to speech)
  - Fix tooltip container arrow display error
  - Fix key hold error (issue on tab switching)
- 0.1.0   
  - First release

# Operation Guide        
Mouse tooltip translator is a google chrome extension that give convenient translate experience to user based on mouseover action. It uses text hovering event to decide which text is required to be translated for user. It automatically detects pointed area and it collect near words to group them as sentence for sentence translate. This translator extension translate mouse pointed text into user desired language text using google translate. For providing easy user experience on translate, it directly displays given translated text with clean pop-over tooltip. User does not require any other more action for translate text. This extension minimizes general user action process which open new tab for google translate.    
This extension uses google translate to interact data for translation feature. When text translation is required, this extension request translation for given text to google translate. Google translate communicates given text to provide its translated text to the extension. This extension handles given translated text to display in popover tooltip format. Its translation can be in any foreign text with google translate. Google translate provide multilingual translation service which support more than 100 language translate service. In this extension’s popup setting page, supported language list is provide to user. User can select any user desired language for google translate in this extension. Not only support google translate but also support Bing translator to give variety on user translation experience. Currently, other translator like naver translate service, papago translator is not planned yet to support.    
This extension handles language detection feature based on google translate language detection. It sends its mouse pointer text data to google translate and receive translated text with language detection at the same time. Google translate provide detected language type of given text and its translated text in one json format data. This extension use google translate's detected language data to decide display translated tooltip or not. This extension filters out text that has same language type of source language and target language. Main reason to filter out is to provide non disrupting translation experience to general user. If translation target language and detected language of mouseover text language are same, same type of language do not give much difference on translation. Non filter out situation may cause fatigue because of displaying user known language tooltip every time. For this reason, this extension detects language type of mouse over text to prevent translation on same type of language.    
This translator extension provides google translate’s auto language detection service on translation. It handles its auto language detection feature which provide ease on user to minimize user interaction on source language selection for translate. Most of web site text does not require to provide source language selection to determine language to translate. This extension uses google translate’s auto language detection feature to automatically understand its source language to translate correctly with google translate. User can use this feature by select “Language from auto” in this extension’s pop-up configuration page. If user want to use google translate in specified source language translation, it provides source language selection on pop up configuration page to select to use google translate in any user desired source language.    
This extension is individual developer’s created extension that is not officially made by google. It just handles google translate and google text to speech service to give ease translation experience to user. It does not own google translate and Bing translator. Google translate is owned by google. It handles Google’s provided google translate service to user without any profit. Main purpose of this extension is to remove language barrier on web site for society contribution. It gives free translate experience on any web site and it does not include any advertisement for clear translation experience. It provides simple and clear tooltip translation service on anywhere include news, social media, YouTube comment, pdf and any text web site.    
As a social contribution, this extension is open-source project in MIT license. Any developer can read its source code in the GitHub. In the GitHub, any user can check its main translation functionality and no harmful code injection. It does not track user translation history and it even does not inject google analytics code in this extension. This extension respect user privacy but user need to keep in mind that it sends hovering text to google translate for translation purpose. It uses any usage data only for google translation (text to speech) purpose. It does not share its usage data with any other third parties.    
This extension is intended to display translated tooltip simple as possible. It is not designed for any additional display feature like pronunciation and word type. This translator extension is intended to give ease translation to support user productivity on web page reading for any language with minimization on information overflow. This extension’s main design focus is to straight forward transmission on its translated sentence for clear user experience.    
This extension can be used to enhance user experience on language learning. Any language learner student can easily compare original text and its translated text without new page conversion. It provides its pair (translated sentence and its original text) comparison experience to user to memorize its pair in mind smoothly with tooltip translation. This can be used as language education model for user. With this extension, user can improve user’s language skill by understand translated tooltip from any user concerning contents like foreign novel and foreign news article.    
For supporting translate feature, this extension additionally support feature that spoke original text pronunciation using google TTS (text to speech). This extension supports TTS (text to speech) to speak pointed source text to user to listen its voice. To using this feature, user need to enable TTS (text to speech) feature from pop up configuration page. It uses google TTS (text to speech) to speak original text based on computer voice to give user to have an idea on how to pronounce its text. With this extension, any language learner student can enhance pronunciation knowledge skill on any language by listening this extension’s google TTS (text to speech) speech voice.   
This extension contains built-in PDF viewer which support pdf file to provide mouseover translation feature over pdf text. Its pdf supporting feature give a possibility to user to read foreign essay paper with translation. This extension does not use chrome pdf reader. Chrome pdf reader provide pdf as embed text format which has difficulty on text crawling process for translate with this extension. This translator extension intercept pdf URL and redirect to mouse tooltip pdf.js page to provide pdf reader with mouseover translator feature. Local pdf file is also supported when user give local URL permission to this extension.    
This extension currently has under development OCR feature to detect image text to process translate its text. When user mouse over on manga bubble background, this extension uses paint bucket brush method to mask out that positioned bubble to process OCR using tesseract.js to get its text for translate manga. If selected comic bubble background is not correctly separated from outside bubble with line, this extension's paint bucket brush method will mask out all page which lead to give fail OCR result.    
