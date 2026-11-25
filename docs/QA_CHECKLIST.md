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
