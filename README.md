# First Semester: An Arts Story

An independently developed educational narrative-game prototype exploring a new student's first semester on TU Dublin's BA Arts (TU980) programme, set in a developing 3D representation of the Grangegorman campus.

## Play the current development build

**[OPEN THE CURRENT GAME — GEOGRAPHIC BUILD](https://shaunferns.github.io/an_arts_story/geo/)**

The active game starts at **Broadstone–University Luas**. Walk to East Quad for the BA Arts welcome, speak with your adviser, and record your indicative Semester 1 preferences. Explore the five scavenger-hunt stops in any order, return for the debrief, and play the Friday timetable scene and Cian’s and Saoirse’s advising cases. Your browser saves your progress, choices and field notes.

Use **WASD** to walk, **Space + WASD** to look, **Shift** to run, **E** to interact, **M** for the phone and map, and **V** to switch perspective. Mouse dragging also controls the camera. For façade review, [start directly outside East Quad](https://shaunferns.github.io/an_arts_story/geo/?start=east-quad).

The [project homepage](https://shaunferns.github.io/an_arts_story/) points to the geographic game. The [earlier narrative prototype](https://shaunferns.github.io/an_arts_story/story/) remains available as the source for the dialogue and branches.

## Purpose

The prototype explores how a story-based campus visit might help new students navigate Grangegorman, articulate their interests and find the right person when a question arises. Advisers discuss interests and pathway options. Programme Operations assembles and publishes the initial timetable. The game’s timetable is illustrative and contains no live registration or module availability.

## Development decisions

- **Active build:** the `geo/` experience; the superseded `review/` walking prototype has been removed.
- **Perspective:** first-person by default. This avoids assigning the player a particular gender, clothing or appearance and helps foreground their own experience. Third-person remains a testable option, not the default.
- **Characters:** current NPCs have simple, coloured prototype clothing overlays on the existing Quaternius rig. These overlays are not finished skinned garments and need proportion, animation and appearance review. Use properly rigged outfits before a student-facing release.
- **Environment:** geographic plausibility, walkable routes, site boundaries, campus recognition, access and performance come before detailed façades. East Quad is documented as five floors and now uses a **provisional 24.5 m** game height; Central Quad uses **26 m** and Academic Hub **24 m** where their mapped names identify them. These are visual-scale estimates above local ground, not as-built measurements. Proposed West Quad and Broadstone Gate developments are not added as existing buildings. Confirm all heights, footprints and ground levels from as-built drawings before treating the scene as geographically accurate.
- **Integration:** the active game uses the archived induction and advising conversations at exterior campus points. Dialogue and progression are kept in separate modules under `geo/assets/induction/`.
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

### Scale and signs (November 2026)
The character rig is kept at a measured 1.74 m; temporary clothing is narrower. Third-person uses a bounded low chase camera rather than an elevated 16 m orbit. Two **approximate-position sign prototypes** represent the distinct dark-grey Grangegorman wayfinding and TU Dublin blue identity/sign family. Their placements and detailed lettering remain to be checked on site and are not exact reproductions. References: [Wayfinders Grangegorman](https://wayfindersgroup.com/work/dit-grangegorman) and [TU Dublin external programme](https://wayfindersgroup.com/work/tu-dublin-external-programme).

### East Quad exterior

The northern entrance keeps the mapped footprint and the exterior door / revolving door / door assembly. The bilingual lettering sits flush on the outward face of the existing dark brick return to the right of the entrance. The façade treatment uses the tall atrium, narrow window stacks and larger bronze-framed glazed bays shown in [Ste Murray’s East Quad photographs](https://www.ste.ie/east-quad-grangegorman-ahr-architects) and [AHR’s project photographs](https://www.ahr.co.uk/projects/east-quad-building). The [TU Dublin sign photograph](https://pxl01-tudublinie.terminalfour.net/prod01/tudublin-cdn-pxl/media/website/research/images/East-Quad.jpeg) was used to check the lettering and layout. The forecourt keeps the existing curved concrete and timber seating/planter.

Heights, façade and door dimensions, seating placement and encounter points remain approximate. In particular, the Lower House exterior point and the playing-fields approach to the Academic Hub & Library should be checked on site. The map uses projected bearings and the existing provisional Luas-to-East Quad terrain grade.
