# CLAUDE.md — MouseTooltipTranslator 개발 가이드

브라우저 확장(Manifest V3, Chrome/Edge/Firefox). 마우스오버/드래그 번역 툴팁, 이중 자막, PDF/EPUB 뷰어, OCR, TTS, 음성 인식 번역을 제공한다. 팝업/설정 UI는 **Vue 3 + Vuetify 3**, 번들러는 **webpack**.

이 문서는 "이 저장소에서 코드를 어떻게 작성해야 하는가"를 정리한다. 아래 관례는 대부분 코드로 강제되지 않으니(런타임/빌드에 드러나지 않고 조용히 깨질 수 있음) 반드시 지킬 것.

## 빌드 · 실행

```bash
npm run build           # 프로덕션 빌드 → build/  (devtool:false)
npm run watch           # 개발 watch 빌드
npm run build-firefox   # Firefox 빌드(config/webpack.firefox.config.js)
```

- 확장 로드는 **항상 `build/` 폴더**를 "Load unpacked"로. `src/`를 직접 로드하면 안 됨(#25).
- **코드 변경 후 `npm run build`가 통과하는지 반드시 확인**한다. 소스는 ESM+webpack이라 `node`로 직접 실행 불가.
- 테스트는 `__tests__/translator.test.js`(번역기 네트워크 테스트)뿐. 대부분의 기능은 단위 테스트가 없으므로, 로직 변경은 빌드 통과 + 필요 시 합성 데이터/실제 브라우저로 검증한다.
- 버전(`manifest`)은 **배포 시점에 갱신**되며 repo 값은 stale하다(#209). 버전 파일을 직접 올리지 말 것.

## 저장소 구조

- `src/contentScript.js` — 페이지 주입 메인. 마우스오버/선택 감지, 툴팁 표시, 주입 CSS, 이벤트 처리.
- `src/background.js` — 서비스워커. 번역/TTS/저장 등 메시지 핸들러(`translate`/`tts`/`stopTTS`/…). 콘텐츠·팝업 양쪽에서 옴.
- `src/translator/*` — 번역 엔진(google/bing/deepl/localLlm 등). `baseTranslator.js` 상속.
- `src/tts/*` — TTS 엔진(browser/bing/google/mdn).
- `src/subtitle/*` — 이중 자막(youtube/netflix/svt/youtube-nocookie). `baseVideo.js` 상속, `subtitle.js`가 페이지에 주입되는 엔트리.
- `src/ocr/*` — 이미지 OCR(tesseract) + 오버레이.
- `src/pdf/pdfInject.js` — 번들 PDF.js 뷰어 커스터마이즈(콘텐츠 스크립트 주입).
- `src/pages/*.vue` — 팝업/설정 페이지. **파일=라우트**(auto-routing, `unplugin-vue-router`). `index.vue`가 설정 화면.
- `src/components/*.vue` — 공용 컴포넌트(`popupWindow`, `backHeader`, `chipOption` …). 자동 등록(`unplugin-vue-components`)되지만 새 파일에선 명시적 import를 권장.
- `src/util/*` — 설정(`setting*.js`), i18n(`i18n.js`), 언어(`lang.js`), 텍스트(`text_util.js`), 공용(`index.js`).
- `public/_locales/<locale>/messages.json` — 로케일. **직접 편집 금지**(아래 참고).
- `doc/` — `description.md`(스토어 설명 + Change Log), `issue-requirements.md`(이슈별 상태 추적), `insertLocale.py`(로케일 생성 스크립트).

## 관례

### 1. 설정 추가
- `src/util/setting_default.js`의 `defaultData`에 항목 추가. `optionType`이 UI 렌더링을 결정한다(없으면 select). 지원: `multipleSelect`, `comboBox`, `fontSelect`, `colorPicker`, `textField`, `llmModelSelect`, `button`. `settingTab`로 탭 지정(main/keyboard/graphic/voice/exclude/advanced/speech…).
- 설정 화면(`index.vue`)은 이 스키마를 **자동 렌더**한다 — 대개 UI 코드를 따로 짤 필요 없음.
- `i18nKey`는 라벨 키. **반드시 아래 로케일 절차로 등록**할 것(라벨이 빈 칸이 되지 않도록).
- 런타임에서 `setting`은 `Setting` 인스턴스(`src/util/setting.js`)로, **평범한 객체**다. `setting["key"]`로 읽고, `setting.save()`는 전체를 `storage.local`에 저장한다(그리고 `syncSetting`이면 작은 키만 `storage.sync` 미러).
- **페이지 한정 런타임 오버라이드**가 필요하면(예: 사이트별 번역 대상 #262) `setting.setLocalOverride(key, value, globalValue)`를 쓴다 — 읽기는 override 값, `save()`는 globalValue를 저장(오버라이드가 전역 설정에 새지 않음).

### 2. UI 텍스트 / 로케일 키 (중요 — 직접 편집 금지)
`public/_locales/*/messages.json`을 **손으로 고치지 말 것.** 정식 절차:

1. `doc/insertLocale.py`의 `i18List`에 **영문 문자열**을 추가한다(적절한 섹션 위치에). 키는 이 문자열의 공백을 `_`로 바꾼 것 = `getI18Id`. 예: `"Website Target Language"` → 키 `Website_Target_Language`.
2. `python ./doc/insertLocale.py` 실행. 그러면:
   - 모든 로케일(≈55개)에 누락 키를 **영문 placeholder로** 채우고,
   - `i18List` 순서로 재정렬하며,
   - **`i18List`에 없는 키는 제거(prune)한다** ← 그래서 직접 넣은 키는 다음 실행 때 사라진다.
   - 기존에 값이 있는 키는 덮어쓰지 않음(영어의 커스텀 문구는 en에서 직접 다듬어도 됨).
   - `translate()`(googletrans) 경로는 주석 처리 상태라 **네트워크 없이 오프라인**으로 돈다.
3. 실제 번역은 **Crowdin**이 채운다("New Crowdin updates" 커밋). 우리는 en 원문만 관리.

코드에서 읽을 때: `i18n.getMessage(key)`. 단, 설정 화면 라벨(`value.description`)은 **키 폴백이 없어** 로케일에 키가 없으면 빈 칸이 된다 → 그래서 위 절차로 전 로케일에 넣는 게 필수. 폴백이 필요한 곳은 `i18n.getMessage(key) || "English"` 형태로 방어한다.

### 3. 새 페이지 추가
- `src/pages/foo.vue` 생성 → 라우트 `/foo` 자동 생성. `<popupWindow>` + `<BackHeader :title>` 스캐폴드 사용(`about.vue`/`history.vue` 참고).
- 팝업에서 번역/TTS 호출 가능: `util.requestTranslate(text, source, target, reverse)`(→ `{targetText, sourceLang, targetLang}`), `util.requestTTSSingle(text, lang)`, `util.requestStopTTS(ts, force)`. 이들은 `browser.runtime.sendMessage`로 background에 요청하며 팝업 컨텍스트에서 동작한다.
- 진입점은 `index.vue`의 `toolbarIcons`(툴바) 또는 `about.vue`의 `aboutPageList`(메뉴 허브)에 추가.

### 4. 콘텐츠 스크립트 주입 CSS 스코프
`contentScript.js`가 페이지에 넣는 `<style>`은 **반드시 확장 전용 셀렉터로 스코프**한다. 우리 툴팁은 tippy `data-theme~="custom"|"ocr"|"transparent"`를 쓴다. `[data-tippy-root]`, `.tippy-content *` 같은 **맨 전역 셀렉터 금지** — Tippy.js를 쓰는 사이트(zulip 등)의 자체 메뉴를 깨뜨린다(#345). 예: `[data-tippy-root]:has(> .tippy-box[data-theme~="custom"])`처럼 한정.

### 5. 이중 자막(자막 인터셉트)
- `baseVideo.js`가 `BatchInterceptor`(XHR + fetch 둘 다)로 자막 요청을 가로챈다. 최신 YouTube는 `fetch`를 쓰므로 XHR 전용이면 못 잡는다.
- **인터셉트 핸들러 안에서 같은 패턴 URL을 다시 요청할 때는 `this.rawFetch`(=인터셉트 적용 전 캡처한 native fetch)를 써라.** 일반 `fetch`를 쓰면 자기 요청이 재인터셉트되어 무한 재귀한다.
- 원문/번역 줄 짝짓기는 공용 `BaseVideo.findMostOverlappingLine(start,end,candidates,getStart,getEnd)` — 실제 시간 겹침 최대(겹침 없으면 최근접) 기준. youtube/netflix 공용.
- 병합 시 대상 자막 seg를 **in-place 변형/참조 공유하지 말 것**(매 매칭마다 새 객체 생성). 안 그러면 번역이 `\n`으로 뭉치고 중복된다.
- 주의: YouTube timedtext는 **브라우저 세션(pot 토큰) 밖 요청을 anti-bot으로 차단**(빈 200/429). 서버·curl로는 재현 불가하고, 반복 요청은 IP rate-limit을 유발한다.

### 6. 문서 갱신
- 이슈를 처리하면 `doc/issue-requirements.md`의 해당 행 상태/근거를 갱신하고, `doc/description.md`의 `# Change Log` 맨 위에 사용자용 항목을 추가한다(다음 패치 버전으로).

## Gotchas
- **자동 커밋 금지**: 사용자가 명시적으로 요청할 때만 커밋/푸시.
- 크래시/회귀 위험이 큰 핵심 경로(설정 저장 `setting.js`, 자막 인터셉트, 마우스/클릭 이벤트, 툴팁 lifecycle)는 변경 시 특히 신중히. 가능한 한 additive하게.
- 시각 검증이 필요한 UI/브라우저 동작(툴팁, 이중 자막, PDF 뷰어 버튼 등)은 헤드리스로 확인 불가 → 실제 브라우저 확인을 권한다.
- Windows 셸: 임시 파일은 스크래치패드 사용. heredoc이 백슬래시를 뭉갤 수 있으니 정규식 등은 파일로 작성 후 실행.
