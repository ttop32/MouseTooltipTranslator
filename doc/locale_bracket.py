


def getLocaleBracket(text):
    name=text.replace(" ", "_")
    desc=text
    template="""
    \""""+name+"""\": {
        \"message\": \""""+desc+"""\"
    },"""
    return template
def getI18(text):
    name=text.replace(" ", "_")
    return 'chrome.i18n.getMessage("'+name+'")'

itemList=[
"Enable Tooltip",
"Enable TTS",
"Translate When",
"Translate From",
"Translate Into",
"Translator",
"Tooltip Activation Hold Key",
"TTS Activation Hold Key",
"Text Detect Type",
"Reverse Translate Language",
"Detect PDF",
"Enable OCR",
"OCR Detection Language",
"Exclude Language",

"Tooltip Font Size",
"Tooltip Width",
"Tooltip Text Align",
"Tooltip Background Blur",
"Tooltip Font Color",
"Tooltip Background Color",

"TTS Speed",
"TTS Volume",
"Voice for ",

"Review Page",
"Comment on this extension",
"Source code",
"Check source code in github",
"Privacy Policy",
"User privacy policy"
]
for item in itemList:
    # print(getLocaleBracket(item))
    print(getI18(item))
    