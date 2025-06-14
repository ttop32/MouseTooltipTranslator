# 사용 방법


- 기본 용도 : 번역 할 텍스트 (강조 표시)를 선택하십시오 (강조).
  - 예제 텍스트로 호버 테스트 :
```console

Proletarier aller Länder, vereinigt euch!

```

  - 번역이 작동하지 않으면 현재 대상 언어를 확인하십시오
    - [언어 변경 방법] (https://github.com/ttop32/mousetooltiptranslator/blob/main/doc/intro.md#change-language 확인)
    - 이 번역기는 소스와 대상 언어가 동일하면 텍스트를 생략합니다.


![Alt Text](/doc/reagre.gif)



- 툴팁이 나타날 때 <kbd> left-ctrl </kbd> 키를 누르면 TTS 발음을들을 수 있습니다. <kbd> esc </kbd>를 눌러 음성을 중지하십시오.
  - 번역 된 결과 텍스트를 들으려면 <kbd> 왼쪽 Ctrl </kbd>를 더블 누르십시오
![result](/doc/20.gif)



- <kbd> Right-Alt </kbd> 키를 눌러 입력 상자에있는 텍스트 (또는 강조 표시된 텍스트)를 번역하십시오. 필요한 경우 <kbd> ctrl </kbd> + <kbd> z </kbd>를 눌러 동작을 취소 할 수 있습니다.
  - 번역이 작동하지 않으면 현재 대상 언어가 작문 언어와 일치하는지 확인하십시오.
  - <kbd> right-alt </kbd>가 Hangul Swap으로 사용되는 경우
다른 키를 사용하여 작업하십시오.


![result](/doc/11.gif)



- 쿼리 전에 <kbd>/</kbd>+<kbd> space </kbd>를 입력하여 URL 검색 상자 텍스트를 번역하십시오.


![result](/doc/21.gif)



- pdf.js를 사용하여 번역 된 툴팁을 표시하기 위해 온라인 PDF 지원 (로컬 컴퓨터 PDF 파일 추가 권한이 필요합니다.


![result](/doc/12.gif)



- YouTube 및 Netflix의 듀얼 자막을 지원하십시오.


![result](/doc/16.gif)



- <kbd> 왼쪽 시프트 </kbd> 키 + 마우스를 이미지에서 보유 할 때 OCR (예 : 만화)


![result](/doc/15.gif)



- <kbd> f2 </kbd> 키를 누르면 Auto Reader를 실행하십시오
  - tts로 텍스트를 끝까지 읽기 시작합니다.
  - 자동 리더를 중지하려면 <kbd> esc </kbd>를 누릅니다
  - Double Press <kbd> f2 </kbd> 번역 된 결과 텍스트 자동 리더를 듣으려면 시도하십시오.


![result](/doc/30.gif)



- <kbd> right-ctrl </kbd> 키를 유지하여 음성 인식 번역기를 활성화하십시오.
  - 기본 음성 인식 언어는 영어입니다.
  - 음성 인식 언어와 대상 언어가 동일하면 건너 뜁니다.
  - 오디오 권한이 필요합니다
  - Google Chrome, MS-Edge, Vivaldi, Opera, Brave, Arc 및 Yandex와 같은 크롬 기반 브라우저와 호환됩니다.
- 바로 가기 키 사용자 정의
  - Chrome : // Extensions/Shortcuts 또는 동등한 브라우저 내부 구성 페이지에서 Chrome : //를 브라우저의 내부 URL로 교체하여 액세스 할 수 있습니다 (예 : Edge : //, 브라우저 : // 또는 Brave : // 등).
# 언어 변경
- 설정 페이지에서 현재 언어를 변경하십시오
  - 브라우저 오른쪽 상단에있는 퍼즐 (확장) 버튼을 클릭하면 설정 페이지에 액세스 할 수 있습니다.


![result](/doc/14.gif)





# 예외


- 소스 텍스트 언어와 번역 언어가 동일하면 건너 뜁니다.
- 페이지에 초점을 맞추지 않으면 키 입력이 감지되지 않습니다.
입력 키보드 전에 초점을 맞추기 위해 클릭하십시오.
- 웹 상태가 오프라인 상태 인 경우 응용 프로그램이 작동하지 않습니다.
- 사이트가 <https://chrome.google.com/extensions> 인 경우 Chrome 보안 이유 때문에 작동하지 않습니다.
- 로컬 파일 권한이 제공되지 않으면 로컬 PDF를 처리 할 수 ​​없습니다.
  - 파일이 열리지 않으면 탭에 드래그하여 떨어 뜨립니다.
  - 권한 경고를 표시하고 권한 페이지로 리디렉션됩니다.
  - 리디렉션 된 페이지에서 파일에 액세스하기 위해 "파일 URL에 대한 액세스 허용"을 선택해야합니다.
  - PDF를 다시 열어 즉시 영향을 미칩니다
![result](/doc/10.gif)
