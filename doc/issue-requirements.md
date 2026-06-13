# MouseTooltipTranslator — 이슈 요구사항 정리 (오래된 순)

> 출처: <https://github.com/ttop32/MouseTooltipTranslator/issues> · PR 제외, 생성일 오래된 순
>
> 판단 근거: **실제 코드** (`src/util/setting_default.js`, `src/translator/*`, `src/subtitle/*`, `src/tts/*`, `src/util/index.js`, `src/contentScript.js`, `src/speech/index.js`).
>
> **상태 범례**
>
> | 태그 | 의미 |
> |---|---|
> | ✅ 적용 | 기능이 코드에 구현됨 |
> | ✅ 수정 / 해소 | 버그를 코드로 수정 / 다른 변경으로 해소 |
> | 🟡 부분 | 일부만 구현, 남은 부분 표기 |
> | 🔍 재현 | 코드상 원인 미확정, 실제 브라우저/사이트 재현 필요 |
> | ❌ 미구현 | 구체적 요청이나 아직 미구현 |
> | ⛔ 범위밖 | 데스크톱/안드로이드/오프라인 등 브라우저 확장 범위 밖 |
> | ℹ️ 질문 | 코드 버그가 아닌 질문/사용법/감사/품질 |

## 2021

| 이슈 | 날짜 | 제목 | 상태 | 설명 / 근거 |
|---|---|---|---|---|
| [#2](https://github.com/ttop32/MouseTooltipTranslator/issues/2) | 2021-06-14 | YouTube 자막(CC) 번역 동작 안 함 | ✅ 적용 | `src/subtitle/youtube.js`, detectSubtitle 옵션 |
| [#4](https://github.com/ttop32/MouseTooltipTranslator/issues/4) | 2021-08-15 | 드래그 선택 텍스트 번역 | ✅ 적용 | `src/event/selection.js`, translateWhen=select |
| [#6](https://github.com/ttop32/MouseTooltipTranslator/issues/6) | 2021-09-25 | RTL 언어 정렬 지원 | ✅ 적용 | 툴팁/자막 RTL 처리, tooltipTextAlign |
| [#7](https://github.com/ttop32/MouseTooltipTranslator/issues/7) | 2021-09-25 | 아이디어 모음 | 🟡 부분 | 단어 저장 ✅(#9) / 문장 모드서 hover 단어만 강조 ❌ / 다중 reverse-source 언어(csv) ❌ |
| [#8](https://github.com/ttop32/MouseTooltipTranslator/issues/8) | 2021-09-26 | YouTube 자막이 컨테이너로 오인식 | ✅ 적용 | 자막을 선택가능 DOM 텍스트로 렌더(`baseVideo.js`), word/sentence/container 규칙 적용 |
| [#9](https://github.com/ttop32/MouseTooltipTranslator/issues/9) | 2021-10-07 | 저장 단어 다른 색상 표시 | ✅ 적용 | 그룹 색상 하이라이트 `savedHighlight.js`, `saved.vue` wordGroups |
| [#11](https://github.com/ttop32/MouseTooltipTranslator/issues/11) | 2021-11-09 | PDF 링크 에러 수정 | ✅ 적용 | `getPDFUrl`의 `encodeURIComponent(url)` — file= URL `&` 잘림 방지 |

## 2022

| 이슈 | 날짜 | 제목 | 상태 | 설명 / 근거 |
|---|---|---|---|---|
| [#13](https://github.com/ttop32/MouseTooltipTranslator/issues/13) | 2022-01-25 | 같은 언어 번역 제외 필터 | ✅ 적용 | langExcludeList 옵션 |
| [#14](https://github.com/ttop32/MouseTooltipTranslator/issues/14) | 2022-01-28 | HTTP 404 / ERR_UNKNOWN_URL_SCHEME | ✅ 해소 | DevTools 소스맵 404 경고(기능버그 아님). 프로덕션 빌드는 `devtool:false`라 .map 미참조 → 경고 안 남 |
| [#15](https://github.com/ttop32/MouseTooltipTranslator/issues/15) | 2022-05-08 | DeepL 추가 | ✅ 적용 | `src/translator/deepl.js` |
| [#16](https://github.com/ttop32/MouseTooltipTranslator/issues/16) | 2022-05-12 | 툴팁 배경 블러 | ✅ 적용 | tooltipBackgroundBlur |
| [#17](https://github.com/ttop32/MouseTooltipTranslator/issues/17) | 2022-05-29 | OCR 언어 자동 감지 | ❌ 미구현 | 본문: tesseract는 자동 언어감지 미지원이 근본 한계. 스크립트 추정 같은 별도 구현 필요(미구현). 현재는 `ocrLang` 수동 지정 |
| [#18](https://github.com/ttop32/MouseTooltipTranslator/issues/18) | 2022-06-12 | Firefox 지원 | ✅ 적용 | webextension-polyfill, Firefox 빌드 |
| [#19](https://github.com/ttop32/MouseTooltipTranslator/issues/19) | 2022-06-28 | Chrome 자동번역이 툴팁 깜빡임 | ✅ 수정 | tippy 팝퍼가 body라 notranslate 밖→재번역 깜빡임. popper에 `notranslate`+`translate="no"` |
| [#20](https://github.com/ttop32/MouseTooltipTranslator/issues/20) | 2022-07-31 | Google 서버 번역 깨짐 | ✅ 해소 | gtx 엔드포인트 + googleGTX/V2/Web 대체 + `fallbackTranslatorEngine` 자동 스왑 |
| [#21](https://github.com/ttop32/MouseTooltipTranslator/issues/21) | 2022-10-14 | Firefox 애드온 요청 | ✅ 적용 | Firefox 빌드 |
| [#22](https://github.com/ttop32/MouseTooltipTranslator/issues/22) | 2022-10-25 | 양쪽 정렬(justify) | ✅ 적용 | tooltipTextAlign=justify |
| [#23](https://github.com/ttop32/MouseTooltipTranslator/issues/23) | 2022-11-14 | Firefox 확장 요청 | ✅ 적용 | Firefox 빌드 |

## 2023

| 이슈 | 날짜 | 제목 | 상태 | 설명 / 근거 |
|---|---|---|---|---|
| [#25](https://github.com/ttop32/MouseTooltipTranslator/issues/25) | 2023-01-06 | src 폴더 Chrome 로드 실패 | ℹ️ 설정 | 런타임 버그 아님 — "Load unpacked"는 빌드 산출물 `build/` 폴더를 로드해야 함 |
| [#28](https://github.com/ttop32/MouseTooltipTranslator/issues/28) | 2023-03-10 | 웹 PDF 원본 URL 복사 | 🟡 부분 | 원본 URL이 뷰어 URL `viewer.html?file=<encodeURIComponent(원본)>`에 보존(`getPDFUrl`) → 주소창 `file=` 값 디코드로 복원 가능. 전용 "원본 URL 복사" 원클릭 버튼만 없음 |
| [#29](https://github.com/ttop32/MouseTooltipTranslator/issues/29) | 2023-03-23 | 특정 사이트 제외 | ✅ 적용 | websiteExcludeList, `checkExcludeUrl` |
| [#30](https://github.com/ttop32/MouseTooltipTranslator/issues/30) | 2023-04-11 | 일본어 로마자 | ✅ 적용 | tooltipInfoTransliteration |
| [#31](https://github.com/ttop32/MouseTooltipTranslator/issues/31) | 2023-04-13 | 번역 결과 클립보드 복사 | ✅ 적용 | `copyTextToClipboard` |
| [#32](https://github.com/ttop32/MouseTooltipTranslator/issues/32) | 2023-04-25 | 그래픽 작업 도움 | ℹ️ 질문 | 디자인 도움 요청 — 코드 무관 |
| [#33](https://github.com/ttop32/MouseTooltipTranslator/issues/33) | 2023-04-25 | 번역문을 음성으로 | ✅ 적용 | voiceTarget=target |
| [#35](https://github.com/ttop32/MouseTooltipTranslator/issues/35) | 2023-05-10 | PDF 다크 모드 | ✅ 적용 | PDF.js 뷰어 다크 모드 |
| [#36](https://github.com/ttop32/MouseTooltipTranslator/issues/36) | 2023-06-10 | 정규식 / 클립보드 | ✅ 적용 | ① 정규식 제외 필터 신규(`translateExcludeRegex`, `isExcludedByRegex`) ② 동일언어 미표시=#279 ③ 클립보드 출력=복사. 클립보드→번역 입력만 범위 외 |
| [#37](https://github.com/ttop32/MouseTooltipTranslator/issues/37) | 2023-06-11 | Invalid manifest | 🔍 재현 | 구 설치/다운로드 오류, 상세 없음. 현재 manifest 정상 빌드/배포 → 구버전 일시 이슈 추정 |
| [#38](https://github.com/ttop32/MouseTooltipTranslator/issues/38) | 2023-06-15 | 툴팁 활성화 Hold 키 문제 | 🔍 재현 | 활성 키 지정 시 안 됨 보고. 현재 `keyDownList[showTooltipWhen]` 정상, 자가 비활성 경로 미발견. 구버전/키 충돌 재현 필요 |
| [#39](https://github.com/ttop32/MouseTooltipTranslator/issues/39) | 2023-06-16 | Google 백업 번역 엔진 | ✅ 적용 | fallbackTranslatorEngine |
| [#40](https://github.com/ttop32/MouseTooltipTranslator/issues/40) | 2023-06-19 | Firefox 확장 | ✅ 적용 | Firefox 빌드 |
| [#41](https://github.com/ttop32/MouseTooltipTranslator/issues/41) | 2023-06-20 | 동작 안 함 | 🔍 재현 | Bing/Bing챗에서 안 됨, 상세 없음 — 사이트별 재현 필요 |
| [#43](https://github.com/ttop32/MouseTooltipTranslator/issues/43) | 2023-07-29 | 번역을 우상단에만 표시 | ✅ 적용 | `tooltipPosition`에 "Top Right" 추가 — 커서 안 따라가고 우상단 고정(tippy `bottom-end`, `#mttContainer` 우상단 앵커) |
| [#45](https://github.com/ttop32/MouseTooltipTranslator/issues/45) | 2023-08-21 | PDF 열기 문제 | 🔍 재현 | PDF 열 때마다 권한 프롬프트 → 안 묻는 옵션 요청. `detectPDF` off로 회피. #174 동일 계열 |
| [#46](https://github.com/ttop32/MouseTooltipTranslator/issues/46) | 2023-08-28 | OCR 별도 확장 분리 | ✅ 해소 | 핵심은 "OCR이 키 없이 항상 동작". 현재 OCR은 `keyDownOcr`(Shift) 홀드+이미지 위에서만 → 분리 불필요 |
| [#47](https://github.com/ttop32/MouseTooltipTranslator/issues/47) | 2023-08-29 | 외형 커스터마이즈 | ✅ 적용 | graphic 탭 옵션군 |
| [#48](https://github.com/ttop32/MouseTooltipTranslator/issues/48) | 2023-08-30 | TTS 음성 끄는 법 | ℹ️ 사용법 | "Ctrl 누르면 읽어주는데 어떻게 끄냐" → TTSWhen을 None으로 바꾸거나 다른 키로 변경(#54) |
| [#49](https://github.com/ttop32/MouseTooltipTranslator/issues/49) | 2023-09-02 | OCR 사용법 문의 | ℹ️ 사용법 | "이미지 위 Shift 눌러도 안 됨, 결과 어디서 보냐" → `keyDownOcr`(Shift) 홀드+이미지 위 → 번역문이 이미지 위에 오버레이로 표시 |
| [#50](https://github.com/ttop32/MouseTooltipTranslator/issues/50) | 2023-09-07 | Bing 소스 에러 | ✅ 적용 | `bing.js` www→`cn.bing.com` 폴백(`useChina`) |
| [#54](https://github.com/ttop32/MouseTooltipTranslator/issues/54) | 2023-09-14 | TTS 끄는 방법 | ✅ 적용 | TTSWhen 키 제어 |
| [#56](https://github.com/ttop32/MouseTooltipTranslator/issues/56) | 2023-09-22 | 아랍어 번역 누락 | ✅ 해소 | 과거 분실 보고. 현재 `ar` 로케일 존재 + RTL(#6,#206) |
| [#59](https://github.com/ttop32/MouseTooltipTranslator/issues/59) | 2023-09-24 | 툴팁 애니메이션 | ✅ 적용 | tooltipAnimation |
| [#60](https://github.com/ttop32/MouseTooltipTranslator/issues/60) | 2023-10-09 | 번역문 음성(중복) | ✅ 적용 | voiceTarget=target |
| [#61](https://github.com/ttop32/MouseTooltipTranslator/issues/61) | 2023-10-21 | 페르시아어 이중 번역 무의미 | ℹ️ 품질 | 코드버그 아님 — 번역 품질 불만. 엔진/LLM 변경으로 개선 |
| [#66](https://github.com/ttop32/MouseTooltipTranslator/issues/66) | 2023-11-23 | 0.1.91 Bing 음역 깨짐 | ✅ 해소 | 현재 `bing.js wrapResponse`가 번역문+음역 둘 다 반환(테스트 통과). 회귀 해소 |
| [#68](https://github.com/ttop32/MouseTooltipTranslator/issues/68) | 2023-11-28 | Google Docs 사용 | ✅ 적용 | `util.isGoogleDoc`, `injectGoogleDocAnnotation` |
| [#69](https://github.com/ttop32/MouseTooltipTranslator/issues/69) | 2023-12-05 | 확장 동작 안 함 | 🔍 재현 | Edge의 Bing Chat AI 사이트, 상세 없음 |
| [#70](https://github.com/ttop32/MouseTooltipTranslator/issues/70) | 2023-12-08 | 추가 제안 5건 | 🟡 부분 | 풍부한 단어창 일부(dict+Wiktionary) / 자막 사이트 일부(netflix·svt) / 직접 입력 번역창 ❌(=#185) / 양방향 자동번역 일부 / PDF 하이라이트 ✅(PDF.js 내장 #145) |

## 2024

| 이슈 | 날짜 | 제목 | 상태 | 설명 / 근거 |
|---|---|---|---|---|
| [#73](https://github.com/ttop32/MouseTooltipTranslator/issues/73) | 2024-01-14 | 'Writing Language' 문의 | ✅ 적용 | writingLanguage 옵션 |
| [#74](https://github.com/ttop32/MouseTooltipTranslator/issues/74) | 2024-01-15 | DeepL 깨짐 | 🔍 재현 | DeepL 무료 EP rate-limit/지역 차단 간헐 실패(#222 동일). `fallbackTranslatorEngine` 완화 |
| [#75](https://github.com/ttop32/MouseTooltipTranslator/issues/75) | 2024-01-19 | 글쓰기 번역 단축키 느림 | ✅ 수정 | `translateWriting` 재진입 가드 없어 연타 시 레이스로 중복/누락 → `isTranslatingWriting` 가드 + `insertText` await |
| [#76](https://github.com/ttop32/MouseTooltipTranslator/issues/76) | 2024-01-24 | UI 언어 설정 | ✅ 적용 | 커스텀 i18n 레이어 `i18n.js` + `uiLanguage` 설정 |
| [#77](https://github.com/ttop32/MouseTooltipTranslator/issues/77) | 2024-01-24 | Highlight Mouseover Text 중단? | ✅ 적용 | mouseoverHighlightText, `highlightText` |
| [#79](https://github.com/ttop32/MouseTooltipTranslator/issues/79) | 2024-01-25 | 확장 없이 PDF 열기 | ✅ 적용 | detectPDF off |
| [#80](https://github.com/ttop32/MouseTooltipTranslator/issues/80) | 2024-01-31 | View Transitions 호환 | ✅ 수정 | tippy `appendTo`가 정적 body 참조 → 함수형 `() => document.body` |
| [#81](https://github.com/ttop32/MouseTooltipTranslator/issues/81) | 2024-02-03 | Detect Type Swap Hold Key 문의 | ✅ 적용 | keyHoldMouseoverTextType |
| [#82](https://github.com/ttop32/MouseTooltipTranslator/issues/82) | 2024-02-03 | Reverse Translate 문서화 | ✅ 적용 | translateReverseTarget |
| [#83](https://github.com/ttop32/MouseTooltipTranslator/issues/83) | 2024-02-03 | 옵션 창 마지막 탭 기억 | ✅ 적용 | `index.vue`에서 `currentTab` 변경 시 `lastSettingTab`(숨김 설정)에 저장, mounted 시 복원. 다음에 마지막 탭으로 열림 |
| [#84](https://github.com/ttop32/MouseTooltipTranslator/issues/84) | 2024-02-03 | 선호 언어만/희귀 언어 제외 | ✅ 적용 | langExcludeList + langPriority |
| [#86](https://github.com/ttop32/MouseTooltipTranslator/issues/86) | 2024-02-05 | 페르시아어 폰트 변경 | ✅ 적용 | 설정 `tooltipFontFamily`(graphic, 텍스트 입력) 추가 → 입력한 폰트를 툴팁·자막 font-family 기본 스택 앞에 prepend. 예: `"Vazirmatn", Tahoma`(폰트는 설치/사용 가능해야 함) |
| [#88](https://github.com/ttop32/MouseTooltipTranslator/issues/88) | 2024-02-08 | 브라질 포르투갈어 | ✅ 적용 | pt-BR 로케일 |
| [#90](https://github.com/ttop32/MouseTooltipTranslator/issues/90) | 2024-02-12 | YouTube 영상 번역 오류 | ✅ 수정 | 중복(AA BB) 원인: ASR(자동생성) 자막은 같은 줄을 rolling/누적 전송하는데 `parseSubtitle` else-branch가 무조건 append. `mergeCaptionText`(단어 단위 겹침 제거: 중복/누적/부분겹침 처리)로 교체. 겹침 경로(ASR)만 타므로 수동 자막 무영향. ">>undefined" 자동번역 트랙 라벨은 별개. 라이브 검증 권장 |
| [#98](https://github.com/ttop32/MouseTooltipTranslator/issues/98) | 2024-02-19 | 복사 문서화 | ✅ 적용 | `copyTextToClipboard` |
| [#100](https://github.com/ttop32/MouseTooltipTranslator/issues/100) | 2024-02-22 | 활성/비활성 토글 키 | ✅ 적용 | showTooltipWhen / translateWhen + 핫키 #126 |
| [#102](https://github.com/ttop32/MouseTooltipTranslator/issues/102) | 2024-02-29 | 에디터에 불필요 HTML 삽입 | ✅ 수정 | `#mttContainer`가 본문 직렬화에 포함됨 → `contenteditable="false"`+`data-mtt` + 작성박스 포커스 시 제거 |
| [#104](https://github.com/ttop32/MouseTooltipTranslator/issues/104) | 2024-03-05 | 콘솔 에러 Range expand null | ✅ 수정 | detached 노드에서 throw → `isConnected` 가드 + caretRange null 가드 |
| [#107](https://github.com/ttop32/MouseTooltipTranslator/issues/107) | 2024-03-09 | 문장↔단어 전환 핫키 | ✅ 적용 | `keyHoldMouseoverTextType`(F8) 홀드 + `swapKeyToggleMode`(#321) 토글 |
| [#108](https://github.com/ttop32/MouseTooltipTranslator/issues/108) | 2024-03-09 | IDE 전용 버전 | ⛔ 범위밖 | 본문 비어있음. IDE 전용판은 확장 범위 밖 |
| [#109](https://github.com/ttop32/MouseTooltipTranslator/issues/109) | 2024-03-09 | 이미지 마우스팁 번역 안 됨 | ✅ 적용 | 만화 이미지=OCR 영역. `keyDownOcr`(Shift) 홀드+이미지 위에서 이미지 전체 OCR→번역 오버레이(#250). 특정 사이트 안 되면 라이브 재현 |
| [#110](https://github.com/ttop32/MouseTooltipTranslator/issues/110) | 2024-03-15 | google 엔진 차이 문의 | ✅ 적용 | googleGTX/Web/V2 모두 존재 + 선택 |
| [#111](https://github.com/ttop32/MouseTooltipTranslator/issues/111) | 2024-03-15 | ChatGPT(Web) 추가 | 🟡 부분 | LLM OpenAI API(`localLlm.js`) / ChatGPT 웹(`chatgpt.js`)은 차단되어 비활성 |
| [#112](https://github.com/ttop32/MouseTooltipTranslator/issues/112) | 2024-03-18 | TTS Ctrl이 Ctrl+C 충돌 | ✅ 적용 | TTSWhen 키 변경 |
| [#114](https://github.com/ttop32/MouseTooltipTranslator/issues/114) | 2024-03-21 | 클릭 시 툴팁 숨김 + Edge 위치 | 🟡 부분 | ① 하이라이트 재클릭으로 툴팁 숨김 ❌ ② Edge 미니메뉴 겹침 → 위치 옵션: tooltipPosition·"Top Right"(#43)로 일부 회피 |
| [#115](https://github.com/ttop32/MouseTooltipTranslator/issues/115) | 2024-03-24 | DIVI/Elementor 불필요 코드 | ✅ 수정 | #102 동일 — 컨테이너 `contenteditable="false"`+포커스 시 제거 |
| [#116](https://github.com/ttop32/MouseTooltipTranslator/issues/116) | 2024-04-02 | cws | ℹ️ 내용없음 | 제목 "cws"(크롬 웹스토어 추정)만, 본문 없음 — 조치 불가 |
| [#117](https://github.com/ttop32/MouseTooltipTranslator/issues/117) | 2024-04-11 | Gemini/Kimi AI 사이트 안 됨 | 🔍 재현 | ChatGPT는 됨. 가상스크롤/Shadow DOM 등으로 `caretRangeFromPoint` 텍스트노드 못 잡는 케이스 추정. 사이트 DOM 라이브 확인 |
| [#118](https://github.com/ttop32/MouseTooltipTranslator/issues/118) | 2024-04-16 | Voice When Always/Select | ✅ 적용 | TTSWhen=keyListWithAlwaysSelect |
| [#120](https://github.com/ttop32/MouseTooltipTranslator/issues/120) | 2024-04-19 | ruby>rt 제외 | ✅ 수정 | `selection.js`가 rt 포함 텍스트 우선하던 것 수정 — ruby 있으면 필터 텍스트 사용 |
| [#122](https://github.com/ttop32/MouseTooltipTranslator/issues/122) | 2024-05-01 | 색상 잘못 표시 | 🔍 재현 | koreatimes.co.kr 사이트 CSS 충돌 가능. 색상은 graphic 탭 조절 가능. 라이브 확인 |
| [#124](https://github.com/ttop32/MouseTooltipTranslator/issues/124) | 2024-05-01 | 오디오 일시정지 후 이어듣기 | ✅ 적용 | `keyTTSPause` 핫키 — 일시정지/멈춘 지점부터 재개. chrome.tts·HTML audio(currentTime 보존)·speechSynthesis 3엔진. `isUserPaused` 가드로 큐 안 넘어감 |
| [#126](https://github.com/ttop32/MouseTooltipTranslator/issues/126) | 2024-05-02 | 확장 On/Off 핫키 | ✅ 적용 | `keyToggleEnable` — 툴팁+TTS 세션 토글(`extensionDisabled`) |
| [#134](https://github.com/ttop32/MouseTooltipTranslator/issues/134) | 2024-05-17 | 추가 요청 다수 | 🟡 부분 | 설정 동기화 ✅(`syncSetting`, storage.sync 미러, 히스토리/저장단어는 8KB 한도로 제외) / PDF 하이라이트 ✅(PDF.js 내장 #145), PDF 아이콘·줌 개선은 ❌ |
| [#135](https://github.com/ttop32/MouseTooltipTranslator/issues/135) | 2024-06-04 | OpenAI/Gemini/Claude + AI 음성 | 🟡 부분 | `localLlm.js` + llmProviderList / AI 음성 미지원 |
| [#136](https://github.com/ttop32/MouseTooltipTranslator/issues/136) | 2024-06-09 | 제외 언어가 이중 자막 미적용 | ✅ 수정 | dualsub 조건에 `!langExcludeList.includes(sourceLang)` 추가 — 제외 언어면 원문 자막만 |
| [#137](https://github.com/ttop32/MouseTooltipTranslator/issues/137) | 2024-06-09 | 다른 플랫폼 자막 미감지 | 🟡 부분 | netflix.js, svt.js 추가 |
| [#138](https://github.com/ttop32/MouseTooltipTranslator/issues/138) | 2024-06-09 | 번역 후 복사 | ✅ 적용 | `copyTextToClipboard` |
| [#139](https://github.com/ttop32/MouseTooltipTranslator/issues/139) | 2024-06-13 | IPA/가나/병음 표시 | ✅ 적용 | tooltipInfoTransliteration |
| [#140](https://github.com/ttop32/MouseTooltipTranslator/issues/140) | 2024-06-15 | 음성 첫 단어만 재생 | ✅ 수정 | offscreen에 `AUDIO_PLAYBACK` reason 추가(Chrome 자동종료 방지). 0.1.225 |
| [#141](https://github.com/ttop32/MouseTooltipTranslator/issues/141) | 2024-06-28 | 음성 인식 단축키 안 됨 | 🔍 재현 | 키보드는 안 되고 마우스 중클릭은 됨. 코드 경로 동일 — Web Speech API/포커스 차이 라이브 진단 |
| [#143](https://github.com/ttop32/MouseTooltipTranslator/issues/143) | 2024-07-21 | "mouse translast" | ℹ️ 내용없음 | 제목만, 본문 없음 — 조치 불가 |
| [#145](https://github.com/ttop32/MouseTooltipTranslator/issues/145) | 2024-07-22 | PDF 텍스트 하이라이트 도구 | ✅ 적용 | 번들 PDF.js v4.8.69에 **하이라이트 에디터 내장**(viewer 툴바 `editorHighlightButton`, 색상 선택 포함). 다운로드(저장) 시 PDF에 주석 임베드. 단 웹 PDF 재열람 시 자동복원은 안 됨(저장 파일로 유지) |
| [#146](https://github.com/ttop32/MouseTooltipTranslator/issues/146) | 2024-07-29 | Windows standalone 앱 가능? | ⛔ 범위밖 | "브라우저 말고 Windows 앱으로 실행 가능하냐" → 데스크톱 앱은 확장 범위 밖(#173/#252) |
| [#148](https://github.com/ttop32/MouseTooltipTranslator/issues/148) | 2024-08-03 | 글쓰기 번역 단축키 | ✅ 적용 | keyDownTranslateWriting |
| [#149](https://github.com/ttop32/MouseTooltipTranslator/issues/149) | 2024-08-03 | 위키낱말사전 소스 | ✅ 적용 | `wiktionary.js` + `tooltipWordDictionarySource`=wiktionary. 임의 커스텀 소스는 범위 외 |
| [#150](https://github.com/ttop32/MouseTooltipTranslator/issues/150) | 2024-08-07 | 원문 중복 숨기기 | ✅ 적용 | tooltipInfoSourceText off 기본 |
| [#151](https://github.com/ttop32/MouseTooltipTranslator/issues/151) | 2024-08-10 | YouTube 자막 안 됨 | 🔍 재현 | 본문 모호. YouTube 포맷/EP 변경 시 간헐 실패 가능(#90 동일 영역). 라이브 검증 |
| [#152](https://github.com/ttop32/MouseTooltipTranslator/issues/152) | 2024-08-11 | 새 키 추가 | ✅ 적용 | keyboard 탭 키 옵션군(#182) |
| [#153](https://github.com/ttop32/MouseTooltipTranslator/issues/153) | 2024-08-16 | PDF GUI 언어 변경 | ✅ 적용 | `pdfInject.js`가 PDF.js `localeProperties`를 `uiLanguage`로 설정 |
| [#155](https://github.com/ttop32/MouseTooltipTranslator/issues/155) | 2024-09-06 | Show Tooltip When 지연 | ✅ 적용 | 표시 지연 `mouseoverEventInterval`을 "Tooltip Show Delay"(advanced, 0~1000ms)로 노출(#235) — 낮추면 즉시 표시 |
| [#163](https://github.com/ttop32/MouseTooltipTranslator/issues/163) | 2024-09-12 | 무료 Gemini API | ✅ 적용 | llmProviderList gemini |
| [#165](https://github.com/ttop32/MouseTooltipTranslator/issues/165) | 2024-09-16 | 문단/PDF 통째로 읽기 | ✅ 적용 | `startAutoReader`, keyDownAutoReader=F2 |
| [#167](https://github.com/ttop32/MouseTooltipTranslator/issues/167) | 2024-09-28 | YouTube 리다이렉트 이상 | 🔍 재현 | 확장 켜면 Google 검색→YouTube 구독 페이지 리다이렉트. 환경 의존, 재현 필요 |
| [#171](https://github.com/ttop32/MouseTooltipTranslator/issues/171) | 2024-10-03 | Firefox 지원 | ✅ 적용 | Firefox 빌드 |
| [#172](https://github.com/ttop32/MouseTooltipTranslator/issues/172) | 2024-10-10 | 개선 제안 | 🟡 부분 | LLM 키 ✅, 다크모드 ✅(#238), 단축키 탭 ✅ / 직접 입력 번역 탭 ❌(=#185), 사이드바 ❌ |
| [#173](https://github.com/ttop32/MouseTooltipTranslator/issues/173) | 2024-10-13 | 완벽 앱 제안 | ⛔ 범위밖 | 게임·앱 위 마우스오버 번역 = Windows 데스크톱 앱 |
| [#174](https://github.com/ttop32/MouseTooltipTranslator/issues/174) | 2024-10-18 | Google PDF 열기 실패 | 🔍 재현 | 확장이 PDF 열기 막음, 끄면 정상(#45 동일 PDF 가로채기 계열). 라이브 확인 |
| [#177](https://github.com/ttop32/MouseTooltipTranslator/issues/177) | 2024-11-17 | 문서 전체 번역 | ✅ 적용(MVP) | `pageTranslate.js` — `keyDownTranslatePage` 토글로 페이지 텍스트 제자리 번역/복원 |
| [#180](https://github.com/ttop32/MouseTooltipTranslator/issues/180) | 2024-11-21 | 읽어주기 컨트롤 바 | 🟡 부분 | Auto Reader + 언어별 속도 ✅ + 읽는 문단 강조 ✅ + 방향키 컨트롤 ✅(←/→ 문단, ↑/↓ 속도) / 화면 플로팅 바 UI·탭 전환 TTS중지는 ❌ |
| [#181](https://github.com/ttop32/MouseTooltipTranslator/issues/181) | 2024-11-21 | 다른 플랫폼 이중 자막 | 🟡 부분 | netflix/svt |
| [#182](https://github.com/ttop32/MouseTooltipTranslator/issues/182) | 2024-11-21 | 모든 기능 단축키 지정 | ✅ 적용 | keyboard 탭 키 옵션군 |
| [#183](https://github.com/ttop32/MouseTooltipTranslator/issues/183) | 2024-11-21 | 번역 어휘 업데이트 | 🟡 부분 | 품사·정의 dict+Wiktionary(#196/#149) / 문맥 최적 단어·예문 ❌ |
| [#185](https://github.com/ttop32/MouseTooltipTranslator/issues/185) | 2024-11-23 | 읽어주기 버튼 + 입력 번역 팝업 | ❌ 미구현 | 팝업에 클릭형 읽어주기 버튼 + 키워드 직접 입력→번역. #70/#172 중복 |
| [#186](https://github.com/ttop32/MouseTooltipTranslator/issues/186) | 2024-11-26 | 입력 중 툴팁 비활성 | ✅ 적용 | 기본 Off — 입력창 포커스 중 툴팁 억제(Google Docs 예외). `mouseoverWhileWriting` |
| [#187](https://github.com/ttop32/MouseTooltipTranslator/issues/187) | 2024-11-27 | 이중 자막 배경 | ✅ 적용 | 자막 배경 스타일 (참고: #205는 이 배경 끄는 옵션 요청) |
| [#188](https://github.com/ttop32/MouseTooltipTranslator/issues/188) | 2024-11-28 | Firefox 지원 | ✅ 적용 | Firefox 빌드 |
| [#190](https://github.com/ttop32/MouseTooltipTranslator/issues/190) | 2024-11-30 | Yandex TTS/opensubtitles 등 | 🟡 부분 | Yandex 번역기 ✅ / Yandex TTS·OpenSubtitles·애니 자막사이트 ❌(외부 API·차단 리스크) |
| [#191](https://github.com/ttop32/MouseTooltipTranslator/issues/191) | 2024-12-03 | 일부 브라우저 DeepL 안 됨 | 🔍 재현 | DeepL 무료 EP 서버/지역 차단(#222 동일). fallback 완화 |
| [#192](https://github.com/ttop32/MouseTooltipTranslator/issues/192) | 2024-12-09 | 화이트리스트 | ✅ 적용 | websiteWhiteList |
| [#193](https://github.com/ttop32/MouseTooltipTranslator/issues/193) | 2024-12-16 | 주소창 텍스트 번역 | ✅ 적용 | 글쓰기 번역 / URL 검색창 |
| [#194](https://github.com/ttop32/MouseTooltipTranslator/issues/194) | 2024-12-30 | 만화 번역 안 됨 | 🔍 재현 | mangaread.org=이미지 OCR(#109/#250). 사이트 이미지 구조 라이브 확인 |

## 2025

| 이슈 | 날짜 | 제목 | 상태 | 설명 / 근거 |
|---|---|---|---|---|
| [#195](https://github.com/ttop32/MouseTooltipTranslator/issues/195) | 2025-01-02 | 언어별 읽기 속도 | ✅ 적용 | VOICE 탭 언어별 `ttsRate_<lang>` 드롭다운 — 전역보다 우선 |
| [#196](https://github.com/ttop32/MouseTooltipTranslator/issues/196) | 2025-01-12 | 단어 활용형 표시 | 🟡 부분 | google dict 품사별 다중 뜻 + Wiktionary / 활용형 자체는 미지원 |
| [#197](https://github.com/ttop32/MouseTooltipTranslator/issues/197) | 2025-01-20 | 사이트 제외 동작 안 함 | ✅ 수정 | `matchSite`로 맨도메인→서브도메인(`*.domain`) 매칭 |
| [#198](https://github.com/ttop32/MouseTooltipTranslator/issues/198) | 2025-02-04 | 현재 사이트 제외 버튼 | ✅ 적용 | websiteExcludeBtn |
| [#200](https://github.com/ttop32/MouseTooltipTranslator/issues/200) | 2025-02-11 | 안드로이드 버전 | ⛔ 범위밖 | 안드로이드 앱 |
| [#201](https://github.com/ttop32/MouseTooltipTranslator/issues/201) | 2025-02-13 | Ebook 테마 | ✅ 적용 | `ebookTheme`(Auto/Light/Dark) — reader.js가 storage에서 읽어 foliate `setStyles`로 강제 color-scheme. 책 배경 충돌 가독성 해결 |
| [#202](https://github.com/ttop32/MouseTooltipTranslator/issues/202) | 2025-02-13 | 5가지 제안 | 🟡 대부분 | 화이트리스트 ✅(#297), 키 추가 ✅, 언어별/교차 음성 ✅ / 우 Ctrl 마이크 무동작은 버그 |
| [#204](https://github.com/ttop32/MouseTooltipTranslator/issues/204) | 2025-02-21 | 단축키로 원문 복사 | ✅ 적용 | `copy-source-text`(Ctrl+Shift+7) 단축키. 복사 범위는 mouseoverTextType 따름. 우클릭 메뉴는 제거(단축키 전용, 0.1.230) |
| [#205](https://github.com/ttop32/MouseTooltipTranslator/issues/205) | 2025-02-28 | YouTube 자막 배경 끄기 | ✅ 적용 | 원인: `.ytp-caption-segment`에 확장이 하드코딩한 `backdrop-filter:blur(3px)`+`background:rgba(8,8,8,0.1)`(#187). 설정 `subtitleBackground`(graphic, 기본 On) 추가 → Off면 배경·블러 제거(text-shadow만 유지). 라이브 검증 권장 |
| [#206](https://github.com/ttop32/MouseTooltipTranslator/issues/206) | 2025-03-01 | RTL 자막 정렬 | ✅ 적용 | `parseSubtitle`에서 `isRtl(lang)`이면 `wsWinStyleId:2`(juJustifCode rtl) — 우측 정렬+bidi. LTR 무회귀 |
| [#207](https://github.com/ttop32/MouseTooltipTranslator/issues/207) | 2025-03-06 | Firefox 문장→단어 전환 불가 | 🔍 해소추정 | 전환은 브라우저 무관(드롭다운+F8 홀드), Firefox는 `expandRangeWithSeg`로 word/sentence 구현. #290로 해소 추정, 라이브 검증 |
| [#209](https://github.com/ttop32/MouseTooltipTranslator/issues/209) | 2025-03-31 | 버전 차이 문의 | ℹ️ 질문 | 릴리스 0.1.168 / GitHub 0.1.89 / CWS 0.1.166 왜 다르냐 → manifest 버전(0.1.89)이 repo에 stale, 배포 시 갱신 |
| [#210](https://github.com/ttop32/MouseTooltipTranslator/issues/210) | 2025-04-02 | 언어별 읽기 속도 개별 | ✅ 적용 | #195 동일 — `ttsRate_<lang>`(영어 1.0/중국어 1.5 등) |
| [#212](https://github.com/ttop32/MouseTooltipTranslator/issues/212) | 2025-04-16 | 도구 깨짐 | 🔍 재현 | 베트남어 번역 중 "Google was broken". 일시 장애 가능, fallback 완화. 재현으로 구분 |
| [#213](https://github.com/ttop32/MouseTooltipTranslator/issues/213) | 2025-04-21 | (제목 없음) | ℹ️ 빈내용 | 본문 "." 한 글자 — 조치 불가 |
| [#219](https://github.com/ttop32/MouseTooltipTranslator/issues/219) | 2025-05-07 | 크기 조절(Resize) | 🟡 부분 | 본문 `#translator{resize:both}`. 액션 팝업은 392×600 고정이라 드래그 리사이즈 불가. compact(#220)로 밀도 개선 |
| [#220](https://github.com/ttop32/MouseTooltipTranslator/issues/220) | 2025-05-07 | 패딩 조절 | ✅ 적용 | "설정 페이지 여백 큼" → `compactMode` 토글(graphic). On 시 행 margin 16→3px. 툴팁 아님 |
| [#221](https://github.com/ttop32/MouseTooltipTranslator/issues/221) | 2025-05-14 | Google TTS 음성 안 나옴 | ✅ 수정 | offscreen `AUDIO_PLAYBACK` reason. 0.1.225 |
| [#222](https://github.com/ttop32/MouseTooltipTranslator/issues/222) | 2025-05-16 | DeepL 먹통 | 🔍 코드무관 | 번역기 테스트 로컬 통과. DeepL 무료 EP rate-limit/지역 차단. fallback 완화 |
| [#223](https://github.com/ttop32/MouseTooltipTranslator/issues/223) | 2025-05-17 | Windows 시스템 음성 | ✅ 적용 | `enigine_browser_tts.js` 시스템 음성 |
| [#224](https://github.com/ttop32/MouseTooltipTranslator/issues/224) | 2025-05-18 | Bing TTS 안 나옴 | ✅ 수정 | offscreen `AUDIO_PLAYBACK` reason. 0.1.225 |
| [#225](https://github.com/ttop32/MouseTooltipTranslator/issues/225) | 2025-05-19 | TTS 전체 깨짐 | ✅ 수정 | offscreen `AUDIO_PLAYBACK` reason(2025-05 공통 원인). 0.1.225 |
| [#226](https://github.com/ttop32/MouseTooltipTranslator/issues/226) | 2025-05-24 | Firefox 일부 사이트 영어 번역 불가 | 🔍 재현 | Chrome은 됨, Firefox 특정 사이트 안 됨, 사이트 미명시. 라이브 재현 |
| [#234](https://github.com/ttop32/MouseTooltipTranslator/issues/234) | 2025-06-19 | 햄버거 메뉴 빈 화면 | 🔍 재현 | 라우트는 존재 → 라우트 누락 아님. 렌더/환경(Mac M1 Chrome) 에러, 콘솔 로그 없이 진단 불가 |
| [#235](https://github.com/ttop32/MouseTooltipTranslator/issues/235) | 2025-06-23 | 너무 느림(성능) | ✅ 적용 | 툴팁 표시 디바운스 `mouseoverEventInterval`(숨김)을 advanced 탭 "Tooltip Show Delay"(0~1000ms)로 노출. 0~50이면 거의 즉시 |
| [#238](https://github.com/ttop32/MouseTooltipTranslator/issues/238) | 2025-06-27 | 설정 다크 모드 | ✅ 적용 | 설정 페이지 dark 테마 |
| [#239](https://github.com/ttop32/MouseTooltipTranslator/issues/239) | 2025-07-01 | 개인 사전 + 단어 추적/하이라이트 | ✅ 적용 | 저장 단어 그룹(`wordGroups`) + in-page 하이라이트(`savedHighlight.js`) + 플래시카드(`flashcard/deck.js`) = 개인 사전+추적. #9/#251 |
| [#240](https://github.com/ttop32/MouseTooltipTranslator/issues/240) | 2025-07-21 | 툴팁 더 빨리 사라지게 | ✅ 적용 | `tooltipDisappearDuration`(0~500ms) — tippy hide 페이드 시간. 0=즉시 |
| [#242](https://github.com/ttop32/MouseTooltipTranslator/issues/242) | 2025-07-31 | Brave 동작 안 함 | 🔍 재현 | 상세 없음 — Brave 환경 재현 |
| [#250](https://github.com/ttop32/MouseTooltipTranslator/issues/250) | 2025-08-29 | 이미지 전체 번역 | ✅ 적용 | OCR이 이미 이미지 전체 번역 — `checkImage`가 전체 OCR→영역별 번역→이미지 위 오버레이(만화 번역기 방식). 신경망 재렌더만 범위 외 |
| [#251](https://github.com/ttop32/MouseTooltipTranslator/issues/251) | 2025-08-30 | 카테고리 커스텀 사전 + 핫키 | ✅ 적용 | 저장 단어 그룹(`wordGroups`=카테고리) + 그룹별 핫키 + 관리 UI(`saved.vue`) + CSV 내보내기 |
| [#252](https://github.com/ttop32/MouseTooltipTranslator/issues/252) | 2025-08-30 | 데스크톱 OCR + 오프라인 | ⛔ 범위밖 | 화면 캡처 OCR + 로컬 모델 오프라인 = 데스크톱 앱 |
| [#253](https://github.com/ttop32/MouseTooltipTranslator/issues/253) | 2025-08-31 | 확장이 hover 모달 막음 | 🔍 재현 | mobalytics.gg. highlight/컨테이너는 pointer-events:none이라 단순 오버레이 원인 아님. 라이브 재현 |
| [#254](https://github.com/ttop32/MouseTooltipTranslator/issues/254) | 2025-09-01 | X.com 컨테이너 인식 | ✅ 수정 | `getContainerRange`가 인라인 부모만 잡음 → `getBlockAncestor`로 블록 조상 선택. X.com 줄별 span 문제 해결 |
| [#256](https://github.com/ttop32/MouseTooltipTranslator/issues/256) | 2025-09-02 | 자막 비활성화 옵션 | ✅ 적용 | detectSubtitle=None |
| [#257](https://github.com/ttop32/MouseTooltipTranslator/issues/257) | 2025-09-03 | 브라질 포르투갈어 | ✅ 적용 | pt-BR 로케일 |
| [#260](https://github.com/ttop32/MouseTooltipTranslator/issues/260) | 2025-09-08 | 음성 번역 | ✅ 적용 | `src/speech/index.js` 음성 인식 번역 |
| [#261](https://github.com/ttop32/MouseTooltipTranslator/issues/261) | 2025-09-12 | bing is broken | 🔍 코드무관 | 테스트 로컬 통과. bing은 데이터센터 IP에 캡차 → 일부 지역 무음. cn 폴백·fallback 권장 |
| [#262](https://github.com/ttop32/MouseTooltipTranslator/issues/262) | 2025-09-18 | 사이트별 번역 대상 언어 | ❌ 미구현 | "사이트에 따라 번역 대상 언어를 유연하게 지정" → 전역 translateTarget만 있고 사이트별 대상 언어 매핑은 미구현 |
| [#263](https://github.com/ttop32/MouseTooltipTranslator/issues/263) | 2025-09-22 | 빠른 언어 코드 입력 | 🟡 부분 | "상단에 1~2글자로 언어 선택하는 필드" → MAIN의 Translate Into select에서 타이핑 검색은 되나, 전용 빠른 입력 필드는 ❌ |
| [#264](https://github.com/ttop32/MouseTooltipTranslator/issues/264) | 2025-09-26 | 설정 내보내기 버튼 안 됨 | ✅ 수정 | anchor를 body에 추가 후 click·remove + revoke 1초 지연 |
| [#270](https://github.com/ttop32/MouseTooltipTranslator/issues/270) | 2025-11-11 | 제안 | ⛔ 범위밖 | 모바일 단어복습 웹 버전 — 별도 영역 |
| [#272](https://github.com/ttop32/MouseTooltipTranslator/issues/272) | 2025-11-11 | 폰트 축소 | ✅ 적용 | tooltipFontSize 6~40 |
| [#273](https://github.com/ttop32/MouseTooltipTranslator/issues/273) | 2025-11-11 | 창 크기 조절 | 🟡 부분 | 여백 축소 ✅(#220) / 드래그 리사이즈는 #219 동일 미구현 |
| [#275](https://github.com/ttop32/MouseTooltipTranslator/issues/275) | 2025-11-24 | PDF 한 줄만 번역 | 🟡 부분 | mouseoverTextType sentence/container 있으나, PDF.js textLayer가 줄별 span이라 줄바꿈 넘는 문장은 한계 |
| [#276](https://github.com/ttop32/MouseTooltipTranslator/issues/276) | 2025-12-02 | 문장/단어 핫키 분리 | ✅ 적용 | mouseoverTextType2 + keyHoldMouseoverTextType |
| [#277](https://github.com/ttop32/MouseTooltipTranslator/issues/277) | 2025-12-03 | 문장 복사 옵션 | ✅ 적용 | 복사가 감지 단위 따름 → sentence 모드+복사=문장 복사 |
| [#278](https://github.com/ttop32/MouseTooltipTranslator/issues/278) | 2025-12-08 | 제외 섹션 사이트 제외 | ✅ 적용 | websiteExcludeList + 버튼 |
| [#279](https://github.com/ttop32/MouseTooltipTranslator/issues/279) | 2025-12-19 | 원문=대상 언어면 중단 | ✅ 적용 | `stageTooltipText`에서 `sourceLang==targetLang`이면 hideTooltip+return (툴팁·TTS 스킵) |
| [#280](https://github.com/ttop32/MouseTooltipTranslator/issues/280) | 2025-12-25 | LLM 기반 번역 | ✅ 적용 | `localLlm.js` |

## 2026

| 이슈 | 날짜 | 제목 | 상태 | 설명 / 근거 |
|---|---|---|---|---|
| [#283](https://github.com/ttop32/MouseTooltipTranslator/issues/283) | 2026-01-05 | 클릭으로 선택 해제 안 됨 | 🔍 재현 | 코드상 click에 preventDefault/선택복원 없음, `disableEdgeMiniMenu`는 데드코드. Wayland/KDE 환경 가능성 |
| [#286](https://github.com/ttop32/MouseTooltipTranslator/issues/286) | 2026-01-15 | Edge 몰입형 리더 모드 | 🔍 재현 | 리더 모드는 별도 렌더 컨텍스트 — 콘텐츠 스크립트 주입/접근 확인 필요 |
| [#287](https://github.com/ttop32/MouseTooltipTranslator/issues/287) | 2026-01-16 | Edge MSN.com 문제 | 🔍 재현 | MSN 홈은 안 되고 기사 페이지는 됨 — 홈 구조(가상스크롤/iframe) 라이브 확인 |
| [#289](https://github.com/ttop32/MouseTooltipTranslator/issues/289) | 2026-02-11 | Arc Google Doc 편집 실패 | 🔍 재현 | Arc+Google Docs 렌더 실패 — 브라우저+사이트 특정 |
| [#290](https://github.com/ttop32/MouseTooltipTranslator/issues/290) | 2026-02-22 | 핫키 분리가 Container 무시(리그레션) | ✅ 해소 | swap을 영구 설정변경 → 임시 hold로 변경. container 기본 유지, 키 누르는 동안만 word |
| [#293](https://github.com/ttop32/MouseTooltipTranslator/issues/293) | 2026-03-28 | 감사 인사 | ℹ️ 질문 | — |
| [#297](https://github.com/ttop32/MouseTooltipTranslator/issues/297) | 2026-04-15 | 화이트/블랙리스트 모드 선택 | ✅ 적용 | `websiteFilterMode`: Both/Blacklist/Whitelist |
| [#299](https://github.com/ttop32/MouseTooltipTranslator/issues/299) | 2026-04-22 | 키(단축키) 관련 | 🟡 부분 | F2/F8/F9 브라우저 점유 → 키 지정 가능(#182)·클릭/더블프레스 / 키 조합 빌더는 미구현 |
| [#301](https://github.com/ttop32/MouseTooltipTranslator/issues/301) | 2026-04-23 | 자막/읽기로 언어 학습 | 🟡 부분 | 이중 자막+Auto Reader ✅ / 단어별 인라인 번역·아랍어 diacritics ❌ |
| [#321](https://github.com/ttop32/MouseTooltipTranslator/issues/321) | 2026-05-20 | 예전 토글 버튼 복귀 | ✅ 적용 | `swapKeyToggleMode`(기본 Off=hold). On이면 swap·secondary 키가 누를 때마다 토글(유지). #290 영구저장 버그 없이 인메모리 토글 |
| [#329](https://github.com/ttop32/MouseTooltipTranslator/issues/329) | 2026-06-04 | 우클릭 번역문 복사 사라짐 | ✅ 해소 | 0.1.227(c71a0392)에서 "copy" 메뉴 항상 생성 복구 — Saved Words 토글은 그룹 메뉴만 제어 |
| [#330](https://github.com/ttop32/MouseTooltipTranslator/issues/330) | 2026-06-05 | Grok LLM 추가 | ✅ 적용 | LLM Provider에 "Grok (xAI)" 추가(`grok: https://api.x.ai/v1`, Groq와 별개). localLlm이 OpenAI 호환이라 동작. 실패 원인은 확장 차단 아님(`<all_urls>`)·엔드포인트 `/v1` 누락/모델 미지정/유료 키 문제 → 프리셋이 엔드포인트 자동설정, 모델(grok-2-latest 등)+충전 키 필요 |
| [#331](https://github.com/ttop32/MouseTooltipTranslator/issues/331) | 2026-06-06 | 단어 여러 번역 옵션(TransOver) | 🟡 부분 | #196/#183 중복. dict 다중 뜻+Wiktionary 일부 / TransOver식 다중 대체 번역 전체는 ❌ |
| [#334](https://github.com/ttop32/MouseTooltipTranslator/issues/334) | 2026-06-09 | 여러 개선·버그 | 🟡 부분 | ① Voice 목록 우선언어 정렬 ✅ — `addTtsVoiceTabOption`이 언어별 음성/속도 행을 `langPriority` 내림차순으로 추가(자주 쓰는 언어 위로) ② Ctrl 키 버그 🔍 — 코드는 `e.code`(ControlLeft/ControlRight 구분)를 일관 사용 → Ctrl+Right 바인딩이 Ctrl+Left에 발동할 경로 미발견(기본 TTS=Ctrl Left와 혼동 가능성). 라이브 재현 필요 |
