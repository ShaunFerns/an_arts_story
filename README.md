# First Semester: An Arts Story

An independent, experimental narrative game about arriving at TU Dublin, finding one's way around Grangegorman, and navigating the first semester of the BA Arts (TU980) programme.

**Status: work in progress.** The original playable story and the newer campus prototypes are currently separate. There is not yet one integrated “latest game”.

## Open the builds

| Build | What it contains | Link | Status |
| --- | --- | --- | --- |
| **Narrative game (v0.9)** | Induction, dialogue, academic interests, advising encounters and timetable story | [Play the narrative game](https://shaunferns.github.io/an_arts_story/) | Earlier playable build |
| **First walk (location review 0.10)** | Third-person movement, Luas approach and an experimental Grangegorman walkthrough | [Open location review](https://shaunferns.github.io/an_arts_story/review/) | Separate visual and navigation prototype; geography approximate |
| **Geographic mission map** | Rathdown-centred 1 km OpenStreetMap snapshot, scaled footprints, walls, hedges, collision and mission-map interaction | [Open geographic prototype](https://shaunferns.github.io/an_arts_story/geo/) | Newer geographic development; incomplete campus verification |

**If you want to inspect the most recent geographic work, use the geographic prototype link, not the homepage.** “Most recent” does not mean “complete” or “geographically verified”.

## What we are building

The intended integrated game starts with arrival by Luas and a walk towards East Quad. The player meets students and staff, explores the campus, participates in induction, expresses indicative subject preferences, and later encounters the realities of timetable publication and module allocation. The experience is meant to let players explore uncertainty and practise asking useful questions rather than simply read induction information.

In the story, **academic advisers discuss interests and possible pathways; Programme Operations assembles and publishes the initial timetable.** An indicative preference is not formal Major confirmation or guaranteed module registration. Timetables and programme situations shown in the game are illustrative.

## Current development priorities

1. **Geographic and visual credibility.** Review the actual walking route, terrain, entrances, building relationships, boundaries and accessibility with a site-familiar reviewer. Footprints are sourced where available; elevations, labels and some interpretations remain provisional.
2. **Characters and interaction.** Maintain rigged idle/walk/run character animation and meaningful NPC encounters, with reliable controls and sensible performance.
3. **Narrative integration.** Bring the induction, adviser meeting, scavenger hunt, Friday timetable publication and subsequent student questions into the reviewed campus environment.
4. **Student testing.** Check whether playing helps students understand campus life and choices, and revise based on evidence. No educational effectiveness claim is made yet.

The project is deliberately iterative. More detail is not automatically better; if the 3D campus cannot become sufficiently recognisable and usable, an illustrated or isometric story remains an option.

## Where things live

| Path | Purpose |
| --- | --- |
| `index.html` | Original narrative game (currently the website root) |
| `review/` | Experimental third-person first walk |
| `geo/` | Geographic world and fixed OpenStreetMap data |
| `docs/induction-story-structure.md` | Intended narrative and educational sequence |
| `docs/geographic-and-visual-reset.md` | Geographic design requirements and review gate |
| `docs/architecture-reference-brief.md` | Visual/architectural references |
| `docs/third-person-and-npc-stack-review.md` | Character and movement considerations |
| `tests/` | Automated smoke and collision tests |
| `.github/workflows/pages.yml` | GitHub Pages build, checks and deployment |

### Deployment

Each push to `main` triggers **Publish the 3D game** in [GitHub Actions](https://github.com/ShaunFerns/an_arts_story/actions). The workflow prepares a `dist/` site with the narrative root, `review/`, `geo/`, and vendored Three.js, runs automated checks, then deploys to GitHub Pages. The site root does **not** automatically show whichever prototype was most recently edited.

Browser smoke tests check technical startup and interactions. They do not establish geographic fidelity, accessibility or educational value.

## Educational context and limits

BA Arts encourages exploration during Stage 1 while requiring choices to remain academically and operationally viable. The game is a complementary educational design exploration, **not an official TU Dublin advising or registration service**. It does not provide live timetables, module capacity, programme approvals or individual academic advice. Refer to current university guidance and academic advisers for real decisions.

Campus geography and characters are stylised or provisional and may differ from current conditions. Feedback and review will guide what becomes a public-facing integrated release.

---

**Project repository:** [ShaunFerns/an_arts_story](https://github.com/ShaunFerns/an_arts_story)  
**Development:** Independent prototype, November 2026.
