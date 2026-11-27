// no network - exercises Youtube.parseSubtitle and requestSubtitle fallback (#384)
global.window = {
  location: { href: "https://example.com" },
  addEventListener: () => {},
};

jest.mock("jquery", () => () => ({}));
jest.mock("/src/util", () => ({}));
jest.mock("webextension-polyfill", () => ({ runtime: { id: null } }), {
  virtual: true,
});

const Youtube = require("../src/subtitle/youtube.js").default;

describe("Youtube subtitle parsing and fallback (#384)", () => {
  test("overlapping multi-line cues without standalone newline events stay separate and non-overlapping", () => {
    const out = Youtube.parseSubtitle(
      {
        wireMagic: "pb3",
        pens: [{}],
        wsWinStyles: [{}, { mhModeHint: 0, juJustifCode: 0, sdScrollDir: 3 }],
        wpWinPositions: [
          {},
          {},
          { apPoint: 7, ahHorPos: 50, avVerPos: 100, rcRows: 2, ccCols: 40 },
        ],
        events: [
          { tStartMs: 0, id: 1, wpWinPosId: 2, wsWinStyleId: 1 },
          {
            tStartMs: 190,
            dDurationMs: 7194,
            wWinId: 1,
            segs: [{ utf8: "First cue line 1\nFirst cue line 2" }],
          },
          {
            tStartMs: 5340,
            dDurationMs: 6460,
            wWinId: 1,
            segs: [{ utf8: "Second cue line 1\nSecond cue line 2" }],
          },
          {
            tStartMs: 9483,
            dDurationMs: 5517,
            wWinId: 1,
            segs: [{ utf8: "Third cue line 1\nThird cue line 2" }],
          },
        ],
      },
      "en"
    );

    expect(out.events).toHaveLength(3);
    for (let i = 1; i < out.events.length; i++) {
      const prevEnd = out.events[i - 1].tStartMs + out.events[i - 1].dDurationMs;
      expect(prevEnd).toBeLessThanOrEqual(out.events[i].tStartMs);
    }
  });

  test("ASR cues separated by aAppend newline split cleanly without empty events or overlapping first cue", () => {
    const out = Youtube.parseSubtitle(
      {
        events: [
          {
            tStartMs: 479,
            dDurationMs: 4111,
            wWinId: 1,
            segs: [{ utf8: "The time has come." }],
          },
          {
            tStartMs: 2099,
            dDurationMs: 2491,
            wWinId: 1,
            aAppend: 1,
            segs: [{ utf8: "\n" }],
          },
          {
            tStartMs: 2109,
            dDurationMs: 5526,
            wWinId: 1,
            segs: [{ utf8: "Next line here." }],
          },
          {
            tStartMs: 4580,
            dDurationMs: 3055,
            wWinId: 1,
            aAppend: 1,
            segs: [{ utf8: "\n" }],
          },
          {
            tStartMs: 4590,
            dDurationMs: 3000,
            wWinId: 1,
            segs: [{ utf8: "Third line here." }],
          },
        ],
      },
      "en"
    );

    expect(out.events).toHaveLength(3);
    expect(out.events.map((e) => e.segs.map((s) => s.utf8).join(""))).toEqual([
      "The time has come.",
      "Next line here.",
      "Third line here.",
    ]);
    for (let i = 1; i < out.events.length; i++) {
      const prevEnd = out.events[i - 1].tStartMs + out.events[i - 1].dDurationMs;
      expect(prevEnd).toBeLessThanOrEqual(out.events[i].tStartMs);
    }
  });

  test("long chain of overlapping single-line cues without newline events never collapses into one giant cue", () => {
    const events = Array.from({ length: 100 }, (_, i) => ({
      tStartMs: i * 2500,
      dDurationMs: 4000,
      segs: [{ utf8: `Sentence number ${i}.` }],
    }));
    const out = Youtube.parseSubtitle({ events }, "en");
    expect(out.events.length).toBeGreaterThanOrEqual(50);
    for (const ev of out.events) {
      expect(ev.dDurationMs).toBeLessThanOrEqual(5000);
    }
  });

  test("rolling ASR updates within a single cue still deduplicate (#90)", () => {
    const out = Youtube.parseSubtitle(
      {
        events: [
          { tStartMs: 1000, dDurationMs: 3000, segs: [{ utf8: "Hello" }] },
          { tStartMs: 1400, dDurationMs: 3000, segs: [{ utf8: "Hello world" }] },
          { tStartMs: 1800, dDurationMs: 3000, segs: [{ utf8: "Hello world today" }] },
        ],
      },
      "en"
    );
    expect(out.events).toHaveLength(1);
    expect(out.events[0].segs.map((s) => s.utf8).join("")).toBe(
      "Hello world today"
    );
  });

  test("requestSubtitle always tries same-origin URL first without sticking fallback flag", async () => {
    const calls = [];
    const origRawFetch = Youtube.rawFetch;
    const origConsoleLog = console.log;
    console.log = jest.fn();
    Youtube.rawFetch = jest.fn(async (url) => {
      calls.push(url);
      if (calls.length === 1) {
        return {
          json: async () => {
            throw new SyntaxError("empty");
          },
        };
      }
      return {
        json: async () => ({
          events: [{ tStartMs: 0, dDurationMs: 1000, segs: [{ utf8: "ok" }] }],
        }),
      };
    });

    try {
      const r1 = await Youtube.requestSubtitle(
        "https://www.youtube.com/api/timedtext?v=abc"
      );
      expect(r1.events).toHaveLength(1);
      const r2 = await Youtube.requestSubtitle(
        "https://www.youtube.com/api/timedtext?v=def"
      );
      expect(r2.events).toHaveLength(1);
      expect(calls).toEqual([
        "https://www.youtube.com/api/timedtext?v=abc",
        "https://video.google.com/timedtext?v=abc",
        "https://www.youtube.com/api/timedtext?v=def",
      ]);
      expect(Youtube.isSubtitleRequestFailed).toBe(false);
    } finally {
      Youtube.rawFetch = origRawFetch;
      console.log = origConsoleLog;
    }
  });
});
