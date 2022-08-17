When mouse hover on text, it shows translated tooltip in any language.  

# Features
- hover or select (highlight) on text to translate  
- Visualize tooltip on any web page (except chrome web store site)
- handle google translator and bing translator for translation
- In the setting, google TTS (text to speech) is available to listen text
- Support pdf to display translated tooltip using PDF.js
- Filter out when source language and target language are same
- (Experimental) translate youtube caption when mouse over subtitle block
- (Experimental) Use OCR to comic when hover on bubble background

# Source code  
- https://github.com/ttop32/MouseTooltipTranslator  
 
# Supported Translation Languages (using google translate)
English, Russian, Japanese, Chinese and so on

# Change Log   
- 0.1.55
  - fix mouse back button (request by SP ND)
- 0.1.54
  - fix container text detect (request by baroooooody9)
  - add context menu for saving translated text
- 0.1.53
  - add a list of excluded languages to be translated (request by kwisatz haderach)
  - fix visibility css on translator tooltip 
- 0.1.52
  - fix google translator not working (request by ATU8020)
- 0.1.51
  - Auto contents script injecting when install
  - Add tts stop when tab switching
- 0.1.50
  - Add local pdf permission warning
  - Use google translator sub2 as main translator option
  - Fix css conflict on tooltip radius
- 0.1.49
  - Fix conflict with google web translator (request by dotdioscorea)
  - Add blur on tooltip (request by neoOpus)
  - Fix css conflict on tooltip (request by min geon shin)
  - Add sub google translator option
- 0.1.48
  - google reject by "Irrelevant information about Mouse Tooltip Translator"
    - remove Translate API section, Language Detect section, TTS section and UI Design section
- 0.1.47
  - update tesseract ocr library
  - add sub google translator option
- 0.1.46
  - rollback google translate fix from 0.1.44
- 0.1.45
  - change mouse moved detection
- 0.1.44
  - fix google translate api handling (request by CONATUS)
  - change tooltip text to non transparency (request by Hakan Özlen)
- 0.1.43
  - google reject by tabs permission 
    - remove open setting page in new tab
- 0.1.42
  - fix chinese default language code (request by yc-forever) 
- 0.1.41
  - fix google translate api request
- 0.1.40
  - detect chrome pdf viewer instead of pdf url (request by Justin Brown) 
- 0.1.39
  - fix translator css crash from twitter youtube (request by PedoBearNomsLoli)
- 0.1.38
  - increase variety on tooltip font size
  - change description
- 0.1.37
  - google reject by “Having excessive keywords in description”  
    - Google said "Irrelevant information about Translate"   
    - remove "Translate" from title   
    - remove some description about "Translate"  
- 0.1.36  
  - alert local pdf file permission  
  - fix pdf request header detection    
  - add pdf detect option to allow pdf translate (request by Meow Meow)   
- 0.1.35
  - fix pdf viewer problem when open with new tab (request by M9VK)
  - fix pdf viewer url parameter crash (request by sensypo)
- 0.1.34
  - remove sendMessage (stop tts)
- 0.1.33
  - avoid to use sendMessage (stop tts) when leave tab
- 0.1.32
  - add "translate When" option to replace "translate on hover" (request by Alex)
  - load setting from storage instead of background service worker
  - fix tooltip position problem when crtl pressed
  - set initial "translate into" value correctly
- 0.1.31
  - remove multiple sendMessage call to reduce cpu usage (request by M9VK)
- 0.1.30
  - update to google chrome manifest v3  
  - remove opencv, use canvas to process crop for ocr translate
  - remove option "translate on hover" and "translate on select"
  - use vue loader for translator popup configuration page
  - use chrome tts instead of google tts rest api
  - update tooltip translator pdf viewer to use v2.8.335 pdfjs  
  - support command key as translator activation hold key  
  - support right to left alignment for translate to Persian   
  - move background ocr translate process to iframe  
  - fix translator tooltip position (problem when it is first shot)
- 0.1.29   
  - fix bing translator communication crash(request by zx xu)  
  - support right to left alignment for translate to Arabic (request by mohamad-b)   
  - add translate text history section on popup page (request by TeraStrider)  
- 0.1.28  
  - support translate on selection (contributed by sanprojects)  
- 0.1.27  
  - support youtube subtitle caption to show translator tooltip (request by Veratyr)  
  - fix gmail pdf attachment crash with translator viewer (request by junkey)  
- 0.1.26  
  - increase tooltip z-index for particular site (request by WM)  
  - add customization feature on tooltip width (request by Bambang Sutrisno)  
  - change description  
- 0.1.25
  - google reject by “Having excessive keywords in description”
    - Google said "Irrelevant information about Mouseover Translate" again
    - remove all main description
- 0.1.24
  - google reject by “Having excessive keywords in description”
    - Google said "Irrelevant information about Mouseover Translate"
    - remove "Mouseover Translate" from title and package summarization
- 0.1.23
  - google reject by “Having excessive keywords in description”
    - Google said to remove "google translate"
    - remove “google translate” from package summarization
    - avoid to use continuously mentioned “google translate”
- 0.1.22
  - fix translator type "bing" to correctly handle bing translator api   
- 0.1.21
  - Support translator to translate word (request by Amir Rezaei)
  - Support reverse translate (request by Amir Rezaei)
  - When activation hold key is set, turn off permanent feature enable
- 0.1.20
  - Change promo tile name to Mouseover Translate
  - Change manifest description to Mouseover Translate
- 0.1.19
  - remove vue jsx from translator popup configuration page
  - fix translator popup page title name
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
    - Avoid frequently mentioned Mouse tooltip translator in description
  - Remove multilingual manifest description
  - Rollback google translate respond to fix it
  - Rollback extension name to Mouse tooltip translator
- 0.1.15
  - Change name, Mouse tooltip translator to Mouseover translator
  - Support font size customization (request by Ramy_Ahmed.87)
  - Support Bing translator (request by Ramy_Ahmed.87)
  - Fix google translate response
- 0.1.14
  - Fix hide tooltip (show tooltip after mouse move)
  - Support multilingual manifest description using google translate
- 0.1.13
  - Filter out when only detect currency sign text
- 0.1.12
  - Fix base64 image OCR response for translate ocr correctly
  - Use Vue JSX on translator popup page 
- 0.1.11
  - Use Vue and Vuetify on translator popup page
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
  - Fix image load for translate OCR image correctly
  - Use zodiac3539's train data for tesseract jpn_vert OCR
- 0.1.7
  - Fix scrolled tooltip dictionary position
  - Hide tooltip when ctrl+a or ctrl+f is pressed
  - Change translator popup page container design as cool design
  - Stop played TTS (text to speech) when leave tab
  - Only activate tooltip when tab is focused
  - Support bubble translate using tesseract.js (OCR) and opencv.js
  - Update translated pdf viewer using PDF.js 2.5.207
  - Filter out text that has over 1000 length
- 0.1.6
  - Fix to save translator setting correctly
  - Change hold key to action immediately
  - Fix translator popup page capital letter
- 0.1.5
  - Fix subframe pdf to translate correctly
  - Fix dropdown menu crash from site that use bootstrap
- 0.1.4
  - Fix translator pdf viewer line break
- 0.1.3
  - Add fade animation
  - Fix TTS (text to speech) enabled case to recognize
- 0.1.2
  - Increase tooltip margin
  - Prevent translate on URL text
  - Support pdf tooltip translate using PDF.js (pdf reader)
- 0.1.1
  - Support long sentence for TTS (text to speech)
  - Fix tooltip container arrow display error
  - Fix key hold error (issue on tab switching)
- 0.1.0   
  - First release of Mouse tooltip translator


# Intro  
Mouse tooltip translator is a google chrome extension that focus on providing convenient translate experience for user. To achieve convenient experience, this translator extension minimize current generally required step to translate word in website. In modern days, copying and pasting are getting generalized to obtain translated sentence from google translate site. This extension uses text hovering event to decide which text is required to be translated for user. It automatically detects pointed area and it collect near words to group them as sentence. This translator extension translate mouse pointed sentence text into user language text using any translator API like google translate and Bing translator. For providing direct translation, it displays given translated text with clean pop-over tooltip. User does not require any other more action for translate text. This extension process surely replaces general user translation action process which open new tab for using google translate to getting translated sentence.  

# TTS  
For supporting translate feature, this translator extension provides feature that spoke source text pronunciation using google TTS (text to speech). It handles google TTS to speak pointed text to user to listen its voice. To using this feature, user need to enable TTS (text to speech) feature from translator pop up configuration page. When TTS feature is on, this translator extension send mouseover text to google TTS to speak original text based on computer voice to give user to have an idea on how to pronounce its text. With this translator extension, any language learner student can enhance pronunciation skill by listening this translator extension’s google TTS speech voice.  

# PDF  
Built-in PDF viewer is contained in this translator extension. Mouse tooltip translator uses PDF.js as built-in PDF viewer to support pdf file to provide translate feature over pdf text. This translator extension’s pdf supporting feature give a possibility to user to read foreign essay paper with translate service. This translator extension does not use chrome pdf reader. Chrome pdf reader provide pdf as embed text format which has difficulty on text crawling process for translate with this translator extension. This translator extension intercept pdf URL and redirect to mouse tooltip pdf.js page to provide pdf reader with tooltip translate feature. Local pdf file is also supported when user give local URL permission to this translator extension.  

# OCR  
Currently, this translator extension has under development OCR feature to translate image text. Mouse tooltip translator’s OCR feature is turned off initially. To use OCR translate feature, user need to turn on “enable OCR”. When user mouse over on manga bubble background, this translator extension uses bucket brush method to mask out that positioned bubble to process OCR using tesseract.js to get its text for translate manga. If selected comic bubble background is not correctly separated from outside bubble with line, this translator extension's bucket brush method will mask out all page which give fail OCR result.  

# Language Detect  
In this translator extension, user does not require a process to select source translate language for translate correctly because this extension handle language detection feature based on google translate language detection. This translator extension sends its mouse pointed text data to google translate and receive translated text with language detection data at the same time. This translator extension handles its auto language detection feature to minimize user interaction on source language selection for translate. And, auto language detection is used to filter out user known language text to prevent tooltip translate for providing clear web site experience. This translator extension detect same source target language to decide display translated tooltip or not for minimize disturbing on web site experience by displaying tooltip every time.  

# Translate API
This extension is positioned between user and translator API for providing simple translate experience with google translate service. When text translate is required, this translator extension request translate service for given text to google translate. Translator vendor communicates given text to provide its translated text to the extension. Then, this translator extension handles given translated text to display in popover tooltip format. Its translated text can be in any foreign text with google translate. Additionally, Bing translator is also support to give variety on user translate experience in this translator extension. Currently, this translator extension does not have any plan to support other translator like naver translate service, papago translator and deepl. They are payment requirement service to use. This free serviced tooltip translator does not have any handling way to deal with payment on translate service for papago and deepl.  

# Ownership  
Mouse tooltip translator is individual developer’s created extension that is not officially made by google. It just handles google translate and google text to speech service to give ease translate experience to user. This translator extension does not own google translate and Bing translator. Google translate is owned by google and Bing translator is owned by Microsoft. This translator extension handles Google’s provided google translate service to user without any profit. Main purpose of this translator extension gives free translate experience on any web site without include any advertisement for show only translate result. This translator extension provides simple tooltip translate service on anywhere include YouTube, pdf and any text web site.  

# Open Source  
This translator extension is open-source project in MIT license. Any developer can read its main translate functionality in the GitHub. User can check that it does not inject google analytics code in this translator extension. This translator extension respect user privacy but user need to keep in mind that it sends hovering text to google translate for translate purpose. It uses any usage data only for google translate (and google TTS, text to speech) purpose. This translator extension does not share its usage data with any other third parties.  
