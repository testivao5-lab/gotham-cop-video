# Gotham Cop — QA gate (standing checklist)

Every batch preview and the final render must pass ALL items before it is shown to the client.
Automated items run in CI (`scripts/qa.py`, job *combine → Automated QA gate*, artifact `qa`).
Manual items are checked by the agent on the 0.5 s contact sheets + targeted stills.

## A. Automated (CI, hard fail)
| # | Check | Threshold |
|---|---|---|
| A1 | One-frame flashes | no frame whose mean luma spikes > 22/255 vs BOTH neighbours |
| A2 | Frozen picture | no run > 1.5 s (title cards excepted, must be listed) |
| A3 | Audio format | stereo, 48 kHz, AAC 320 k |
| A4 | Loudness | integrated −14 LUFS ± 1, true peak ≤ −1 dBTP |
| A5 | Dropouts | no stretch < −45 dB longer than 0.4 s (continuous rain/room/pad beds) |
| A6 | Resolution | 1920×1080 at scale 1; final CRF 17–18 |

## B. Manual (agent, every batch)
| # | Check | How |
|---|---|---|
| B1 | All on-screen text correct, un-mirrored, fully inside frame, no stray highlight boxes | contact sheets + title stills |
| B2 | Zero floating hands / detached limbs; every hand touching something is IK-driven (`reachNear/reachFar`) to a real anchor (`anchor()`) | stills at contact frames |
| B3 | No repeated action across adjacent scenes (e.g. two handshakes) | storyboard read-through |
| B4 | No pop-ins / teleports; props change hands only at contact frames | step through contact frames |
| B5 | Pose changes eased over ≥ 4 frames (`EZ` / `Easing.inOut`) | code review of every `ci()` on poses |
| B6 | Walks travel: centroid ≥ 15 % body height per second, feet driven by `walkDist` | code + stills |
| B7 | No rain indoors; droplets only on outer glass; interiors lit and readable | interior stills |
| B8 | Contact shadows under every grounded character/prop | stills |
| B9 | One locked Batman design (`BAT_EMBLEM`, grey/blue-black, white slit eyes) | stills |
| B10 | Joker reads unmistakably as BTAS Joker (fedora, green hair, chalk face, red grin, purple suit, card) | still |
| B11 | Signs/text never hidden behind characters | wide stills |
| B12 | Every shot keeps some motion (life, camera drift, rain); scene ends with a motivated transition (`EdgeFade` / cut) | contact sheets |
| B13 | Narrator-only: all mouths closed | stills |
| B14 | One unified grade per sequence (`Post`), BTAS dark-deco palette | contact sheets |
| B15 | Reference images searched and studied for every new element before drawing it | process |

## C. Delivery
- Preview: scale 1, CRF 18, 20 parallel GitHub jobs, `--concurrency=4`.
- Final: 1080p CRF 17–18, −14 LUFS stereo 48 kHz, separate SRT (not burned in).

## 12 Remotion anti-bug laws (zero tolerance; enforced by scripts/laws_lint.mjs in CI)
1. Local frames only inside Sequences (scene code uses `useCurrentFrame()` + local `cue()`).
2. `ci()`/`safeInterpolate()` only: strictly increasing input (auto-repaired), both extrapolations clamped.
3. No CSS transitions/keyframes/timers/Math.random — `rand()` wraps remotion `random('seed')`.
4. Joint hard clamps: elbow 0..140, knee 0..135, neck/head -35..35; limbs pivot at sockets.
5. One shared groundY per shot; feet locked; walk dx = stride (walkDist).
6. Life wave always on (breathing, head drift, blinks every 76-120 f) unless noLife.
7. World scale 100px = 1m relative proportions; close-ups via camera zoom; heads inside X 180..1740, Y 120..900.
8. Back -> character -> front occluder layering for vehicles/furniture.
9. Held props live in the hand grip socket (palm -> prop -> fingers), never free x/y.
10. Pupils clipped inside sclera (useId ids); narrator-only => mouths closed.
11. 5-stop material shading; contact shadow offset opposite the key light.
12. Narration volume 1.0; SafeSFX clamped 0.08-0.15; no feGaussianBlur; exact pinned versions.

## v8 PREVENTION RULES (after user QA of v7) — enforced automatically

Every fixed bug class now has a guard so it cannot come back:

| # | Bug class seen in v7 | Guard (where) |
|---|---|---|
| P1 | Old trapezoid lamp drawn inline in S6 (shared-component fix missed a duplicate) | `laws_lint.mjs` P1: no inline lamp shade outside `BrassDomeLamp`; every lamp comment must have `<BrassDomeLamp/>` within 12 lines |
| P2 | Father/child feet below the frame (y=1120, 1066), shin crops | lint P2: literal `y>1040` needs `crop=`; **runtime framing audit** (`Character` → `auditReport`, `AuditOverlay`, CI job `audit` + `scripts/frame_audit.py`) scans EVERY frame incl. camera zoom/pan; shin crop or undeclared crop fails CI |
| P3 | Street/ground ending at exactly 1080/1920 → gaps under Plane zoom/pan | lint P3: ground rects overscan (x −400..2320, bottom ≥1600); `Sky` overscans too |
| P4 | Skyline windows bleeding below building bases / under the street | `DecoSkyline` ends at `baseY` by default; `toBottom` opt-in only, lint P4 bans it in shots with a street/ground plane |
| P5 | Father 1.6 vs child 1.05 scale in one plane (L7) | lint P5: one scale per plane per shot (height difference comes from `BUILD`), `// scale-ok:` for deliberate depth |
| P6 | Window figure with ellipse "paws" (teddy-bear Nia) | lint P6: window figures use the 5-finger palm glyph; paired ellipse paws banned |
| P7 | Card balanced on a fingertip | lint P7: card centre must sit inside the finger span (gripped) |
| P8 | Audit hooks removed by accident | lint P8: audit hook + `AuditOverlay` as last root child required |

Manual review additions (gate passing ≠ good video):
- Look at the **bottom 15 %** and **edges** of every full-res still: feet, floor contact, gaps, skyline bleed.
- Zoom into every hand holding a prop: palm hidden behind the prop, fingers overlap the prop, thumb opposes.
- Small figures (in windows, far cars) must still read: silhouette test at 25 % size.
- Vehicles: wheels, rub rails/stripes, glass with interior detail — never a plain box or flat grey glass.
