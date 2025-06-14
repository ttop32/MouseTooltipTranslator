

# python -m pip install --pre googletrans
# pip install tqdm
# python ./doc/pages_translate.py

import asyncio
import os
import json
from googletrans import Translator
from tqdm import tqdm
import time


translator = Translator()


appName = "Mouse Tooltip Translator - PDF & Youtube dual subs"
appDesc = "Mouse Tooltip Translator translate mouseover text using google translate"

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
    input_file = "./doc/pages/intro.md"
    output_dir = "./doc/pages/"

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    with open(input_file, "r", encoding="utf-8") as f:
        lines = f.readlines()

    for lang in tqdm(localeList):
        translated_lines = []
        for line in lines:
            translated_lines.append(await translate(line.strip(), lang))
        output_file = os.path.join(output_dir, f"intro_{lang}.md")
        with open(output_file, "w", encoding="utf-8") as f:
            f.write("\n".join(translated_lines))


if __name__ == "__main__":
    asyncio.run(main())