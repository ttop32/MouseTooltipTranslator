

# python -m pip install --pre googletrans
# pip install tqdm
# python ./doc/pages_translate.py

import asyncio
import os
import json
from googletrans import Translator
from tqdm import tqdm
import time
import re


translator = Translator()


isCode= False
input_file = "./doc/pages/intro/intro.md"
output_dir = "./doc/pages/intro"


localeList = ['ar', 'am', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en', 'en_AU', 'en_GB', 'en_US', 'es', 'es_419', 'et', 'fa', 'fi', 'fil', 'fr', 'gu', 'he', 'hi', 'hr', 'hu', 'id', 'it',
              'ja', 'kn', 'ko', 'lt', 'lv', 'ml', 'mr', 'ms', 'nl', 'no', 'pl', 'pt_BR', 'pt_PT',  'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'sw', 'ta', 'te', 'th', 'tr', 'uk', 'vi', 'zh_CN', 'zh_TW']
translateLangCodeDict = {"zh_CN": "zh-CN", "zh_TW": "zh-TW"}

async def getTranslateLangCode(lang):
    if lang in translateLangCodeDict:
        return translateLangCodeDict[lang]
    else:
        return lang


async def translate(text, lang):
    try:
        await asyncio.sleep(2)
        result = await translator.translate(text, src="auto", dest=await getTranslateLangCode(lang))
        print(result)
        return result.text
    except Exception as e:
        print(lang)
        print(e)
        return text


async def main():
    global isCode

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    with open(input_file, "r", encoding="utf-8") as f:
        lines = f.readlines()

    for lang in tqdm(localeList):
        translated_lines = []
        for line in lines:
            text=""
            if not isCode or ("```" in line):
                isCode=True
                text=line
            elif isCode and ("```" in line):
                isCode=False
                text=line
            elif "!" in line:
                text=line
            elif ""== line.strip():
                text=line            
            elif len(text_split:=line.split("- ")) > 1:
                text1=await translate(text_split[1] , lang)
                text="- ".join([text_split[0], text1])
            else:
                text=await translate(line, lang)
    
            text = re.sub(r"<KBD>", "<kbd>", text, flags=re.IGNORECASE)
            text = re.sub(r"</KBD>", "</kbd>", text, flags=re.IGNORECASE)
            text = re.sub(r"< KBD>", "<kbd>", text, flags=re.IGNORECASE)
            text = re.sub(r"</ KBD>", "</kbd>", text, flags=re.IGNORECASE)
            
            translated_lines.append(text)
        output_file = os.path.join(output_dir, f"intro_{lang}.md")
        with open(output_file, "w", encoding="utf-8") as f:
            f.write("\n".join(translated_lines))


if __name__ == "__main__":
    asyncio.run(main())