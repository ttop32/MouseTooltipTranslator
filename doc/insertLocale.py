

# python -m pip install --pre googletrans
#  pip install "httpx>=0.27.2,<1.0"
# pip install tqdm
# python ./doc/insertLocale.py

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
i18List = [

    "MAIN                                      ",
    "MAIN",
    "Mouse Tooltip Translator",
    "Translate When",
    "Translate From",
    "Translate Into",
    "Translator Engine",
    "Mouseover Text Type",
    "Writing Language",
    "Reverse Translate Language",
    "OCR Language",
    "Detect Subtitle",

    "KEYBOARD                                      ",
    "KEYBOARD",
    "Show Tooltip When",
    "Voice When",
    "Translate Writing When",
    "Auto Reader When",
    "OCR When",
    "Mouseover Text Type Swap Key",
    "Speech Recognition When",
    "Toggle Mouseover Text Type When",

    "GRAPHIC                                      ",
    "GRAPHIC",
    "Tooltip Font Size",
    "Tooltip Width",
    "Tooltip Distance",
    "Tooltip Animation",
    "Tooltip Position",
    "Tooltip Text Align",
    "Tooltip Background Blur",
    "Mouseover Highlight Text",
    "Tooltip Font Color",
    "Tooltip Background Color",
    "Tooltip Border Color",
    "Mouseover Text Highlight Color",

    "VOICE                                      ",
    "VOICE",
    "Voice Volume",
    "Voice Speed",
    "Voice Target",
    "Voice Repeat",
    "Voice for ",


    "EXCLUDE                                      ",
    "EXCLUDE",
    "Exclude Language",
    "Exclude Website",
    "Whitelist Website",
    "Block Current Site",
    "Allow Current Site",

    "ADVANCED                                      ",
    "ADVANCED",
    "Detect PDF",
    "Mouseover Pause Subtitle",
    "Tooltip Info Source Text",
    "Tooltip Info Source Language",
    "Tooltip Info Transliteration",
    "Tooltip Interval Time",
    "Tooltip Word Dictionary",
    "Voice Translated Speed",
    "Fallback Translator Engine",

    "SPEECH",
    "Speech Recognition Language",
    "Voice Panel Translate Language",
    "Voice Panel Text Target",
    "Voice Panel Padding",
    "Voice Panel Text Align",
    "Voice Panel Source Font Size",
    "Voice Panel Target Font Size",
    "Voice Panel Source Font Color",
    "Voice Panel Target Font Color",
    "Voice Panel Source Border Color",
    "Voice Panel Target Border Color",
    "Voice Panel Background Color",




    "BACKUP                                      ",
    "BACKUP",
    "Import Setting",
    "Export Setting",
    "Reset Setting",

    "About                                      ",
    "How to use",
    "Check how to use this extension",
    "PDF Viewer",
    "Translate local PDF file",
    "Ebook Reader",
    "Translate local ebook file",
    "Twitter",
    "Retweet twitter post",
    "Review Page",
    "Comment on this extension",
    "Source code",
    "Check source code in github",
    "Privacy Policy",
    "User privacy policy",
    "Voice Panel",
    "Translate Voice",

    "Review                                      ",
    "Review this",
    "Developer love criticism",

    "Coffee                                      ",
    "Support this extension",
    "Feed a coffee to the extension devs",

    "Title                                      ",
    
    
    "SELECT OPTION                              ",
    "On",
    "Off",
    "Auto",
    "None",
    "Select",
    "Mouseover",
    "Mouseover n Select",
    "Follow",
    "Fixed",
    "Fade",
    "Scale",
    "Shift away",
    "Shift toward",
    "Perspective",
    "Word",
    "Sentence",
    "Container",
    "Source",
    "Source Text",
    "Translated Text",
    "Source n Translated",
    "Translated n Source",
    "Dual Subtitle",
    "Target Single Subtitle",
    "Source Single Subtitle",
    "Always",
    "Center",
    "Left",
    "Right",
    "Justify",
    "Default",
    "Ctrl Left",
    "Ctrl Right",
    "Alt Left",
    "Alt Right",
    "Shift Left",
    "Shift Right",
    "Meta Left",
    "Meta Right",
    "Click Left",
    "Click Middle",
    "Click Right",
    "google",
    "bing",
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
    # jsonDict["appName"] = {"message": appName}

    # if "appDesc" not in jsonDict:
    #     jsonDict["appDesc"] = {"message": translate(appDesc, locale)}

    # if "appDesc" in jsonDict:
    #     jsonDict["appDesc"] = {"message": jsonDict["appDesc"]["message"][:130]}
    pass

def getI18IdList():
    return [getI18Id(i18) for i18 in i18List]


def addI18Description(jsonDict,):
    idList = getI18IdList()
    for (i18, i18Id) in zip(i18List, idList):
        if i18Id not in jsonDict or not jsonDict[i18Id]["message"]:
            jsonDict[i18Id] = {"message": i18}


def insertI18Json(locale):
    filePath = "./public/_locales/"+locale+"/messages.json"
    jsonData = openJson(filePath)
    addBasicDescription(jsonData, locale)
    addI18Description(jsonData)
    jsonData = recorderJson(jsonData)
    writeJson(filePath, jsonData)


def recorderJson(jsonData):
    orderedList = getI18IdList() + ["appName", "appDesc"]
    newDict = {}
    for name in orderedList:
        newDict[name] = jsonData[name]
    return newDict


for locale in tqdm(localeList):
    insertI18Json(locale)


# for item in itemList:
#     # print(getLocaleBracket(item))
#     print(getI18(item))
