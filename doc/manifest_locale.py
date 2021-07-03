import shutil
import os
import json   
from google_trans_new import google_translator  
translator = google_translator()  



localeList=['ar', 'am', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en', 'en_GB', 'en_US', 'es', 'es_419', 'et', 'fa', 'fi', 'fil', 'fr', 'gu', 'he', 'hi', 'hr', 'hu', 'id', 'it', 'ja', 'kn', 'ko', 'lt', 'lv', 'ml', 'mr', 'ms', 'nl', 'no', 'pl', 'pt_BR', 'pt_PT',  'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'sw', 'ta', 'te', 'th', 'tr', 'uk', 'vi', 'zh_CN', 'zh_TW']
 
 
for locale in localeList:
    dst='./_locales/'+locale+'/messages.json'
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    
    descOri="Mouse Tooltip Translator translate mouseover text using google and bing translator"

    translate_text = translator.translate(descOri,lang_tgt=locale)  
    print(translate_text)

    
    
    manifestDict ={   
      "appName": {
        "message": "Mouse Tooltip Translator"
      },
      "appDesc": {
        "message": translate_text
      }
    }   
    with open(dst, 'w', encoding='utf8') as outfile:
        json.dump(manifestDict, outfile, indent = "\t", ensure_ascii=False)
 
 