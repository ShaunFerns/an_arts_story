# First Semester: An Arts Story

An independently developed educational narrative-game prototype exploring a new student's first semester on TU Dublin's BA Arts (TU980) programme, set in a developing 3D representation of the Grangegorman campus.

## Play the current development build

**[OPEN THE CURRENT GAME — GEOGRAPHIC BUILD](https://shaunferns.github.io/an_arts_story/geo/)**

This is the **active working version**. It uses a Rathdown-centred OpenStreetMap geographic snapshot, scaled campus footprints, boundaries, a mission map, NPC encounters, and **first-person movement by default**. Players **start at Broadstone–University Luas**, while Rathdown remains the geographic coordinate origin; the mission map opens at a closer campus scale. Press **V** to switch to third-person for testing; **M** opens the mission map. It is still incomplete and parts of the campus require location verification.

The [project homepage](https://shaunferns.github.io/an_arts_story/) directs visitors to this same active build. Keep this link and the homepage current whenever the active build changes. Do not describe an older build as the latest.

**Earlier narrative prototype:** [Open the archived playable story](https://shaunferns.github.io/an_arts_story/story/). This retains the induction, adviser discussion, timetable and student-choice story as material to integrate into the geographic build; it is not the active campus implementation.

## What the eventual game will do

A new BA Arts student arrives at Broadstone–University Luas, finds East Quad, encounters other students and university staff, and explores campus during induction. Conversations and choices gradually introduce indicative academic interests, programme options, academic advising, module allocation, timetable publication and the first weeks of study.

Our aim is to test whether story-based participation can help students navigate uncertainty and find useful support. Advisers help students explore and articulate preferences; Programme Operations assembles the initial timetable. An indicative preference is neither a guaranteed module place nor a formal Major confirmation.

## Development decisions

- **Active build:** the `geo/` experience; the superseded `review/` walking prototype has been removed.
- **Perspective:** first-person by default. This avoids assigning the player a particular gender, clothing or appearance and helps foreground their own experience. Third-person remains a testable option, not the default.
- **Characters:** current NPCs have simple, coloured prototype clothing overlays on the existing Quaternius rig. These overlays are not finished skinned garments and need proportion, animation and appearance review. Use properly rigged outfits before a student-facing release.
- **Environment:** geographic plausibility, walkable routes, site boundaries, campus recognition, access and performance come before detailed façades. East Quad is documented as five floors; its current 20 m overall height is provisional and should be checked against drawings.
- **Integration:** migrate the meaningful induction and advising narrative from the archived story into the active environment rather than operating two competing games.
- **Validation:** review screenshots and routes with people who know the campus, then test with students; automated browser checks alone do not establish geographic or educational quality.

## Repository layout

| Path | Purpose |
| --- | --- |
| `index.html` | Stable landing page pointing to the active game |
| `geo/` | Current first-person game, mission map, OSM source snapshot and character asset |
| `story/` | Earlier narrative build, preserved as a reference |
| `docs/` | Narrative, geographic and visual planning |
| `scripts/` | Geographic snapshot generation |
| `tests/` | Automated geographic and collision checks |
| `.github/workflows/pages.yml` | Build, verification and Pages deployment |

The [GitHub Actions workflow](https://github.com/ShaunFerns/an_arts_story/actions) builds and deploys the website when `main` changes. Pages may briefly lag behind the repository while a new deployment runs.

## Important limits

This is an experimental, independently developed educational project, **not an official TU Dublin advising or registration service**. It contains no live student timetables, module allocations or guarantees. Geography, building heights and landmark attribution require further verification. Use official university guidance and academic advisers for programme decisions.

---

*November 2026 · [Source repository](https://github.com/ShaunFerns/an_arts_story)*
