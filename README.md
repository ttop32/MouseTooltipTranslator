# MouseTooltipTranslator   
Chrome extension for mouseover translation - Mouse over to translate using google translate        
When mouse hover on text, it shows translated tooltip in any desired language.    

There is technical issue on 0.1.13 version.    
Currently, I unpublish extension by my own decision for stop new installer to use not working extension.     
Newer version 0.1.15 version is under review on chrome web store for now.   
download from [chrome web store](https://chrome.google.com/webstore/detail/mouse-tooltip-translator/hmigninkgibhdckiaphhmbgcghochdjc?hl=en)   

# Result   
![result](doc/screenshot_1.png)    
![result](doc/screenshot_2.png)     
![result](doc/screenshot_3.png)    
![result](doc/screenshot_4.png)    

# Features   
- Visualise tooltip on any web page (except chrome web store site)  
- Using google translate to translate in any language   
- In the setting, google tts (text to speech) is available to listen text   
- Support pdf to display translated tooltip using Mozilla PDF.js   
- Filter out when source language and target language are same    
- (Experimental feature) show comic bubble translation when mouse over on comic bubble background      
  
# Required environment to run    
npm install -g chrome-extension-cli      
npm i jquery --save   
npm i popper.js --save     
npm i bootstrap --save    
npm i is-url --save    
npm i load-script-once --save          
npm i vue --save    
npm i vuetify --save    
npm i @mdi/js -D    
npm i sass sass-loader deepmerge -D    
npm i --save typeface-roboto     
npm i url-loader --save-dev     
npm i -D babel-loader @babel/core @babel/preset-env    
npm i @vue/babel-preset-jsx @vue/babel-helper-vue-jsx-merge-props    

# Run watch   
npm run watch       

# Run build    
npm run build         

# Privacy policy
- Mouse tooltip translator uses user data only for google translation(tts) purpose.   
- It does not share any user data with any other third parties.   

# Acknowledgement and References  
- [Chrome Extension CLI](https://www.npmjs.com/package/chrome-extension-cli)     
- [TransOver](https://github.com/artemave/translate_onhover)     
- [Cool Tooltip Dictionary 14](https://github.com/yakolla/HoveringDictionary)     
- [Google Dictionary (by Google)](https://chrome.google.com/webstore/detail/google-dictionary-by-goog/mgijmajocgfcbeboacabfgobmjgjcoja?hl=en)     
- [jquery](https://www.npmjs.com/package/jquery)    
- [bootstrap](https://www.npmjs.com/package/bootstrap)     
- [Isolate-Bootstrap](https://github.com/cryptoapi/Isolate-Bootstrap-4.1-CSS-Themes)    
- [pdf.js](https://mozilla.github.io/pdf.js/)    
- [Read Aloud]( https://github.com/ken107/read-aloud)     
- [PDF Reader](https://github.com/Emano-Waldeck/pdf-reader)
- [opencv.js](https://docs.opencv.org/4.5.1/df/df7/tutorial_js_table_of_contents_setup.html)
- [tesseract.js](https://github.com/naptha/tesseract.js)
- [jpn_vert](https://github.com/zodiac3539/jpn_vert)
- [bubble reader](https://m.blog.naver.com/PostView.nhn?blogId=waltherp38&logNo=221116037039&proxyReferer=https:%2F%2Fwww.google.com%2F)
- [mouse pointer](https://www.flaticon.com/free-icon/mouse-pointer_889858?term=mouse&page=1&position=34&related_item_id=889858)    
- [miricanvas](https://www.miricanvas.com/)
- [Vue.js](https://vuejs.org/)
- [vuetify](https://vuetifyjs.com/en/)
- [vue jsx](https://github.com/vuejs/jsx)







