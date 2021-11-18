#python -m pip install --pre googletrans


import os
import json
from googletrans import Translator
translator = Translator()




localeList=['ar', 'am', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en', 'en_GB', 'en_US', 'es', 'es_419', 'et', 'fa', 'fi', 'fil', 'fr', 'gu', 'he', 'hi', 'hr', 'hu', 'id', 'it', 'ja', 'kn', 'ko', 'lt', 'lv', 'ml', 'mr', 'ms', 'nl', 'no', 'pl', 'pt_BR', 'pt_PT',  'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'sw', 'ta', 'te', 'th', 'tr', 'uk', 'vi', 'zh_CN', 'zh_TW']


for locale in localeList:
    
    try:
        descOri="Mouse Tooltip Translator translate mouseover text using google translate"
        translate_text=translator.translate(descOri, src="auto", dest=locale).text
        print(translate_text)
    except:
        continue



    dst='./_locales/'+locale+'/messages.json'
    os.makedirs(os.path.dirname(dst), exist_ok=True)


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
    