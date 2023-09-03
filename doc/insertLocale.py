

# python -m pip install --pre googletrans
# pip install tqdm
# python ./doc/insertLocale.py

import os
import json
from googletrans import Translator
from tqdm import tqdm
import time


translator = Translator()


appName = "Mouse Tooltip Translator"
appDesc = "Mouse Tooltip Translator translate mouseover text using google translate"

localeList = ['ar', 'am', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en', 'en_GB', 'en_US', 'es', 'es_419', 'et', 'fa', 'fi', 'fil', 'fr', 'gu', 'he', 'hi', 'hr', 'hu', 'id', 'it',
              'ja', 'kn', 'ko', 'lt', 'lv', 'ml', 'mr', 'ms', 'nl', 'no', 'pl', 'pt_BR', 'pt_PT',  'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'sw', 'ta', 'te', 'th', 'tr', 'uk', 'vi', 'zh_CN', 'zh_TW']
translateLangCodeDict = {"zh_CN": "zh-CN", "zh_TW": "zh-TW"}
i18List = [

    "Main                                      ",
    "Mouse Tooltip Translator",
    "Show Tooltip When",
    "TTS When",
    "Translate When",
    "Translate From",
    "Translate Into",
    "Translator",
    "Text Detect Type",
    "Detect Type Swap Hold Key",
    "Translate Writing Hotkey",
    "Writing Language",
    "Reverse Translate Language",
    "Detect PDF",
    "Enable Youtube Subtitle",
    "OCR_When",
    "OCR Detection Language",
    "Exclude Language",
    "Exclude Website",

    "Visual                                      ",
    "Tooltip Font Size",
    "Tooltip Width",
    "Tooltip Distance",
    "Tooltip Position",
    "Tooltip Text Align",
    "Tooltip Background Blur",
    "Tooltip Font Color",
    "Tooltip Background Color",

    "Voice                                      ",
    "TTS Speed",
    "TTS Volume",
    "Voice for ",

    "About                                      ",
    "Review Page",
    "Comment on this extension",
    "Source code",
    "Check source code in github",
    "Privacy Policy",
    "User privacy policy",
    "PDF Viewer",
    "Translate local PDF file"
]


def openJson(filePath):
    jsonDict = dict({})
    try:
        with open(filePath, 'r', encoding='utf8') as file:
            jsonDict = json.load(file)
    except FileNotFoundError as e:
        print(e)
    return jsonDict


def writeJson(filePath, jsonDict):
    os.makedirs(os.path.dirname(filePath), exist_ok=True)

    with open(filePath, 'w', encoding='utf8') as file:
        json.dump(jsonDict, file, indent="\t", ensure_ascii=False)


def getI18Chrome(text):
    return 'chrome.i18n.getMessage("'+getI18Id(text)+'")'


def getI18Id(text):
    return text.replace(" ", "_")


def getTranslateLangCode(lang):
    if lang in translateLangCodeDict:
        return translateLangCodeDict[lang]
    else:
        return lang


def translate(text, lang):
    try:
        time.sleep(2)
        return translator.translate(text, src="auto", dest=getTranslateLangCode(lang)).text
    except Exception as e:
        print(lang)
        print(e)
        return text


def addBasicDescription(jsonDict, locale):
    if "appName" not in jsonDict:
        jsonDict["appName"] = {"message": translate(appName, locale)}

    if "appDesc" not in jsonDict:
        jsonDict["appDesc"] = {"message": translate(appDesc, locale)}


def getI18IdList():
    return [getI18Id(i18) for i18 in i18List]


def addI18Description(jsonDict,):
    idList = getI18IdList()
    for (i18, i18Id) in zip(i18List, idList):
        if i18Id not in jsonDict:
            jsonDict[i18Id] = {"message": i18}


def insertI18Json(locale):
    filePath = "./public/_locales/"+locale+"/messages.json"
    jsonData = openJson(filePath)
    addBasicDescription(jsonData, locale)
    addI18Description(jsonData)
    jsonData = recorderJson(jsonData)
    writeJson(filePath, jsonData)


def recorderJson(jsonData):
    orderedList = ["appName", "appDesc"] + getI18IdList()
    newDict = {}
    for name in orderedList:
        newDict[name] = jsonData[name]
    return newDict


for locale in tqdm(localeList):
    insertI18Json(locale)


# for item in itemList:
#     # print(getLocaleBracket(item))
#     print(getI18(item))
