# 저장 단어 / 개인 사전 기능 — 통합 구현 계획

> 작성일: 2026-05-31
> 목표: history / 단어 저장 / 그룹 / 페이지 하이라이트 관련 이슈를 하나의 기능으로 통합 구현.
> 본 문서는 **계획**이며, 실제 코드 변경 전 설계 확정용.

---

## 1. 통합 대상 이슈 (관련 git issue 전부)

| 이슈 | 제목 | 이 기능에서 다루는 부분 |
|---|---|---|
| [#7](https://github.com/ttop32/MouseTooltipTranslator/issues/7) | Bunch of ideas! | "단어 저장" 아이디어 (일부) |
| [#9](https://github.com/ttop32/MouseTooltipTranslator/issues/9) | Saved words have a different color | **핵심**: 저장 단어를 페이지에서 다른 색으로 강조 |
| [#149](https://github.com/ttop32/MouseTooltipTranslator/issues/149) | Wiktionary / 커스텀 사전 소스 | (후순위) 사전 소스 확장 |
| [#183](https://github.com/ttop32/MouseTooltipTranslator/issues/183) | 번역 어휘 정보 강화 (품사/정의/예문) | (후순위) 툴팁 정보 확장 |
| [#196](https://github.com/ttop32/MouseTooltipTranslator/issues/196) | 단어 활용형(품사별) 표시 | (후순위) 툴팁 정보 확장 |
| [#239](https://github.com/ttop32/MouseTooltipTranslator/issues/239) | Personal Dictionary with Word Tracking & Highlighting | **핵심**: 저장→목록 페이지→페이지 하이라이트 |
| [#251](https://github.com/ttop32/MouseTooltipTranslator/issues/251) | Custom Dictionary with Categories and Hotkey | **핵심**: 그룹(카테고리) + 저장 단축키 |

→ 핵심 4건(#9·#239·#251·부분 #7)을 1차 구현, 툴팁 정보 강화(#183·#196·#149)는 후속.

---

## 2. 사용자 확정 요구사항 (이번 결정)

1. **history를 팝업이 아닌 별도(풀) 페이지로 분리** → **신규 `/saved` 페이지**
2. 무한스크롤 ❌ → **번호 페이지네이션(게시판형) 리스트**
3. ~~체크박스~~ → **일단 제외**. 강조 대상 선택은 **그룹 지정 + 그룹 on/off**로 대체 (그룹 배정 자체가 저장/선택 행위)
4. **그룹(군)** 으로 저장 가능
5. **그룹별 색상(배경색) 지정** 가능
6. 그룹에 배정된 단어를 페이지에서 **그룹 배경색으로 하이라이트** (강조 on 그룹만)
7. 데이터는 **기존 `historyList` 확장** (별도 savedWords 목록 만들지 않음)

---

## 3. 현재 코드 현황 (변경 기준점)

- `src/pages/history.vue` — history 페이지. `popupWindow`로 래핑, `v-virtual-scroll`(무한스크롤) 사용. 삭제/CSV 다운로드 버튼 있음.
- `historyList` 설정 키 — `{date, sourceLang, targetLang, sourceText, targetText, dict, actionType, translator}` 배열. (`src/util/setting_default.js`)
- `historyRecordActions` — 기록 시점(select/mouseover) chip 설정.
- `src/stores/setting.js` — pinia 설정 스토어 (저장 데이터의 단일 출처).
- `src/pages/index.vue` — 라우트 정의 (`/deck`, `/history`, `/about`). `src/router/index.js`.
- `src/pages/deck/*`, `src/flashcard/deck.js` — flashcard. **tag 개념 존재** (`cardTagSelected`, `deckStatus`) → 그룹 모델 참고/재활용.
- `src/contentScript.js` `highlightText()` — `.mtt-highlight` 요소 생성, `mouseoverTextHighlightColor` 적용. (mouseover 강조)
- `src/components/popupWindow.vue` — 팝업 크기 제약 래퍼.

---

## 4. 데이터 모델 (확정)

**기존 `historyList`를 확장**하고, 그룹 정의용 `wordGroups` 키만 신설. (별도 savedWords 목록 ❌)

```js
// 그룹 정의 (신규 키)
wordGroups: [
  // id 0 = 기본 그룹. name: 표시명, color: 하이라이트 배경색, enabled: 강조 on/off
  { id: 0, name: "Default", color: "#21dc6d40", enabled: true }
]

// 기존 historyList 항목에 groupId 필드만 추가
historyList: [
  {
    date, sourceLang, targetLang,
    sourceText,        // 강조 매칭 기준 (원문 단어/구)
    targetText, dict, actionType, translator,
    groupId            // (신규) 소속 그룹 id. 없으면 0(기본 그룹)으로 간주
  }
]
```

설계 노트 (확정 반영):
- **historyList 확장 방식 채택** — 별도 저장 목록을 만들지 않음. history 항목에 `groupId`만 추가.
- **모든 항목 기본 그룹 0** — 신규 저장은 물론, **기존 저장 항목도 전부 그룹 0**으로 간주. `groupId`가 없는 항목은 로드 시 0으로 정규화(마이그레이션).
- **체크박스 제외** — 강조 대상 선택은 "**그룹별 enabled 토글**"로 결정. 그룹이 enabled면 그 그룹 소속 항목을 강조.
- 모든 항목이 그룹 0에 모이므로, **기본 그룹 0의 `enabled` 기본값은 off** 권장 (전체 history 일괄 강조로 인한 노이즈 방지). 사용자가 켜거나, 항목을 다른 그룹으로 옮겨 선택적으로 강조. → §8에서 확정.
- 색상은 `#RRGGBBAA`(알파 포함) — 기존 컬러피커(`optionType: colorPicker`)와 동일 포맷.

---

## 5. UI 설계

### 5.1 저장 단어 보드 페이지 (신규 `/saved` 풀 페이지)
- 기존 `history.vue`의 `popupWindow` 제약을 벗어나 **풀 탭 페이지**로 오픈 (예: `viewer`처럼 확장 페이지를 새 탭으로). 라우트 **`/saved` 신설**.
- **게시판형 테이블**: 번호 / 원문 / 번역 / 그룹 / 날짜 / 삭제. (~~체크박스~~ 제외)
- **페이지네이션**: Vuetify `v-pagination` + 페이지당 N행 (무한스크롤 대신).
- 행별 **그룹 지정 드롭다운**(그룹 배정이 곧 선택). 상단 툴바: 그룹 필터, 삭제, CSV 다운로드(기존 로직 재활용).

### 5.2 그룹 관리 UI
- 그룹 추가/이름변경/삭제. 그룹 0(Default)은 삭제 불가.
- 그룹별 **색상 컬러피커**(배경색) + 강조 on/off 토글.
- 그룹 삭제 시 소속 항목은 **그룹 0으로 되돌림**.

### 5.3 저장 진입점 (#239 버튼 / #251 단축키)
- 툴팁에 **"저장" 아이콘/버튼** 추가 (hover 번역 중 노출, 기존 dict/툴팁 영역 활용).
- **저장 단축키** 신설 (`setting_default.js` keyboard 탭에 `keySaveWord` 추가, 기본값 미지정). 우클릭 컨텍스트 메뉴 옵션도 검토.
- 저장 시 **기본 그룹** 또는 마지막 선택 그룹으로 편입(설정 `defaultWordGroupId`).

### 5.4 페이지 하이라이트 (#9 핵심)
- `contentScript.js`에 **저장 단어 하이라이터** 추가:
  - `enabled`인 그룹에 소속된 항목들의 단어 집합 + 그룹별 색상 구성.
  - 페이지 텍스트에서 매칭(대소문자/경계 옵션) → 해당 구간을 그룹 배경색으로 감싸는 마커 삽입.
  - 기존 `.mtt-highlight`와 **클래스 분리**(`.mtt-saved-highlight`)하여 mouseover 강조와 충돌 방지.
- **성능 가드**: 디바운스, 노드 수 상한, `MutationObserver`로 동적 페이지 대응(상한 내), 큰 페이지에서는 스킵 + 로그. on/off 설정 제공.

---

## 6. 단계별 구현 순서 (증분 + 검증 가능 단위)

> 각 단계는 독립적으로 빌드·검증 가능하도록 쪼갬. 단계마다 커밋.

- **Phase 0 — 설계 확정 (본 문서)**
- **Phase 1 — 보드 페이지화 (신규 `/saved`)**
  - 게시판형 페이지네이션 리스트 (무한스크롤 제거, 체크박스 없음).
  - 풀 탭으로 여는 진입 경로 + 라우트 정리. 기존 historyList 로드 시 `groupId` 없으면 0으로 정규화.
- **Phase 2 — 그룹 모델 + 그룹 관리 UI**
  - `wordGroups` 스토어 키 추가(그룹 0=Default 기본), 그룹 CRUD + 색상/enabled.
  - 보드에서 행별 그룹 지정/그룹 필터.
- **Phase 3 — 저장 진입점**
  - 툴팁 "저장" 버튼(#239) + 저장 단축키(#251). 기본 그룹 편입.
- **Phase 4 — 페이지 하이라이트 (#9)**
  - `.mtt-saved-highlight` 하이라이터 + 그룹 색상 적용 + on/off + 성능 가드.
- **Phase 5 (후순위) — 툴팁 정보 강화**
  - 품사/정의/예문(#183, #196), 커스텀 사전 소스(#149). 별도 계획으로 분리 가능.

---

## 7. 변경 예상 파일

- `src/util/setting_default.js` — `wordGroups`, `savedWords`, `keySaveWord`, `savedWordHighlight`(on/off), `defaultWordGroupId` 추가.
- `src/pages/history.vue` (또는 신규 `src/pages/saved.vue`) — 보드 UI.
- `src/pages/index.vue`, `src/router/index.js` — 라우트.
- 신규 그룹 관리 컴포넌트 (`src/components/wordGroup*.vue`).
- `src/contentScript.js` — 저장 단축키 처리, 툴팁 저장 버튼, 저장 단어 하이라이터.
- `src/stores/setting.js` — (필요 시) 저장 단어/그룹 헬퍼.
- `_locales/*` — 신규 i18n 키.

---

## 8. 확정 필요한 열린 질문

1. **savedWords 분리 vs historyList 확장** — 본 계획은 분리 권장. (확정 필요)
2. **보드 진입 위치** — 기존 `/history` 확장 vs 신규 `/saved` 페이지. 풀 탭 오픈 방식.
3. **하이라이트 매칭 규칙** — 대소문자 무시? 단어 경계만? 부분일치 허용? 언어별(공백 없는 CJK) 처리.
4. **저장 단축키 기본값** — 충돌 적은 키(예: 미지정/사용자 지정 강제).
5. **flashcard deck과의 관계** — 그룹=deck tag로 통합할지, 완전 별도로 둘지. (통합 시 복잡↑, 학습연계↑)
