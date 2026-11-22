# First Semester: An Arts Story

**An interactive narrative about arriving at university, finding your way and beginning to shape an academic path.**

*First Semester: An Arts Story* is an independently developed educational game prototype set on a developing 3D representation of TU Dublin's Grangegorman campus. The player takes the perspective of a new student entering the BA Arts (TU980) programme and experiences some of the choices, conversations and uncertainties of the first semester.

Rather than presenting university induction as a collection of instructions, the game places information within a story. Finding a building, meeting someone, checking a message, exploring subjects or responding to a timetable difficulty becomes part of the player's experience.

**[Play the current development build](https://shaunferns.github.io/an_arts_story/geo/)**

> **Development status:** This is a playable research-and-design prototype, not an official TU Dublin product or a validated student-support intervention. Its depiction of the campus, programme processes, characters and timetable is illustrative. See [limitations](#development-status-and-limitations).

## The experience

You arrive at Broadstone–University Luas and make your way through Grangegorman. Across seven chapters, you encounter other students and university staff, visit campus buildings, consider possible subject interests and begin to understand how an Arts degree with multiple pathways works.

The game explores situations that a new student might recognise:

- Arriving on an unfamiliar campus and finding the right building or person.
- Making early subject choices while still uncertain about a future Major.
- Understanding the difference between expressing a preference and being registered for a module.
- Negotiating the practical realities of timetables, capacity and changing plans.
- Using academic advising to ask questions, consider options and make informed decisions.
- Becoming more confident in navigating both a physical campus and a university programme.

The in-game phone provides a campus map, messages and a **What's next** guide. Conversations and decisions connect to the wider narrative. Player progress is saved locally in the browser.

The game does not ask players to reproduce one ideal student journey. Its narrative design recognises that students arrive with different interests, levels of certainty and needs for support.

## Why this project?

The first weeks of university involve more than learning where classrooms are located. Students encounter unfamiliar language, institutional processes, new relationships and decisions whose implications may not yet be clear to them.

This is particularly relevant to the BA Arts programme. Its structure allows exploration across Majors, optional Minors, the shared curriculum, Subject Area Requirements (SARs) and Free Electives. The flexibility is meaningful, but understanding how possible choices connect to requirements, progression and later opportunities takes time.

A conventional guide can explain programme rules. A conversation with an adviser can help a student interpret them. A narrative game offers a different opportunity: to encounter some of these situations in context, explore plausible decisions and see how an apparently straightforward choice may involve other people, constraints and consequences.

The project is interested in whether a situated, interactive story might help students **recognise questions worth asking**, become more familiar with academic advising and approach their early decisions with a clearer sense of what remains open or uncertain.

Those are design intentions and questions for future evaluation, not established outcomes.

## Academic and educational rationale

### Narrative as a way of exploring transition

The design draws on the potential of interactive narrative to make complex or unfamiliar experiences more concrete. Dialogue, place, decisions and consequences are used to situate information within plausible first-semester encounters.

The player is not assessed on choosing the single correct Major or making a perfect timetable. Instead, the narrative makes room for uncertainty, exploration, revision and asking for advice. The educational interest lies partly in how players interpret the situations they encounter.

### Academic advising and student agency

Academic advising is represented as a continuing relationship and process. Students can articulate interests, consider the implications of a choice and seek clarification where the available information does not settle a decision.

The game deliberately distinguishes between **student preferences, advised choices, pathway decisions and actual module registration**. Its simulated decisions do not change any official university record.

The intention is to explore how students come to understand the scope of their own agency, including the institutional and practical conditions affecting particular choices.

### Place, belonging and orientation

Grangegorman is part of the narrative rather than a decorative backdrop. Buildings, routes, entrances and distances give the player a spatial context for conversations and activities. The emerging 3D environment and the in-game phone map are intended to support orientation while allowing the campus to be discovered through movement.

Whether a simulated campus supports real-world familiarity, confidence or belonging remains an empirical question. Geographic recognition and accessibility will require direct user testing as well as further site verification.

### Possible evaluation

The prototype provides a basis for exploring questions such as:

1. How do incoming students interpret the advising and module-choice situations represented in the game?
2. Does playing change the questions they are prepared to ask, or their understanding of where to seek advice?
3. How usable and recognisable is the virtual campus, particularly for students unfamiliar with Grangegorman?
4. Which aspects of the experience feel credible, confusing, helpful or unlike students' actual experiences?

Potential future approaches include student playtesting, observation, interviews and structured usability/experience feedback, subject to appropriate institutional permissions and research ethics arrangements where required.

**No findings or learning gains are claimed here.** The prototype and its design rationale should be distinguished from any subsequent research conducted with participants.

## Narrative development

The current geographic game integrates the larger *First Semester: An Arts Story — Playable v1.3* narrative.

The [narrative audit](docs/narrative-audit.md) records:

| Narrative source | Current integration |
| --- | --- |
| Original v1.3 story | 153 canonical scenes integrated |
| Archived campus induction and advising scenarios | 33 scenes integrated |
| Missing canonical choice destinations | None reported in the repository audit |
| Narrative alternatives | Guided semester plus optional orientation and advising encounters |

The migration also reconciles narrative locations with the 3D world and the in-game phone. The game includes an animated Luas arrival and a route through the semester, with optional campus encounters.

These are **implementation and automated-test results**, not evidence that the narrative has yet been validated with incoming students. The original narrative material and later 3D adaptations should continue to be reviewed for authenticity, clarity and consistency.

## How to play

**[Open the current geographic game](https://shaunferns.github.io/an_arts_story/geo/)**

Begin at Broadstone–University Luas. Follow the narrative and the destination shown under **Phone → What's next**. Approach characters or building entrances when an interaction prompt appears. **Phone → Campus** provides an orientation map and optional encounters.

| Control | Action |
| --- | --- |
| **W / S** or up/down arrows | Walk forwards / backwards |
| **A / D** or left/right arrows | Step left / right |
| **Space + WASD** or drag the view | Look around |
| **Shift** | Run |
| **E** | Talk or enter when prompted |
| **M** | Open / close the student phone |
| **Esc** | Close the active panel or skip the arrival |
| **V** | Switch between first- and third-person views |

On the phone map, use **+ / −** or the scroll wheel to zoom. Select a building on the map or in the location list. The gold line indicates the bearing towards the selected destination.

The [earlier 3D story build](https://shaunferns.github.io/an_arts_story/story/) remains available for comparison. The [East Quad start position](https://shaunferns.github.io/an_arts_story/geo/?start=east-quad) is useful for exterior review.

## Design and development approach

The prototype is being developed iteratively, using the existing browser-based Three.js game and a narrative state system.

Current design priorities include:

- **First-person perspective:** the default, allowing players to occupy the experience without assigning them a fixed visible identity. Third-person remains an experimental option.
- **Situated storytelling:** conversations, tasks, locations and phone messages are connected to narrative state rather than acting as unrelated features.
- **A recognisable campus:** geographic plausibility, navigable approaches, building identity and sensible entrances take priority over architectural photorealism.
- **Accessible interaction:** clear prompts, legible dialogue, straightforward controls and a phone interface that supports rather than overwhelms the story.
- **Traceability:** the original story graph, migrated scenes and world coordinates are documented to support auditing and future revision.

The current environment uses provisional building dimensions and simplified façades. For example, East Quad, Central Quad and Academic Hub heights are visual estimates rather than as-built measurements. The 3D scene must not be treated as an authoritative campus survey.

Characters use prototype clothing/rig treatments pending further visual and animation work. This is particularly relevant before wider student-facing use.

### Repository structure

| Path | Purpose |
| --- | --- |
| `index.html` | Project landing page |
| `geo/` | Active geographic game, narrative, map and assets |
| `story/` | Earlier 3D story version retained for reference |
| `docs/narrative-audit.md` | Narrative provenance, reconciliation and automated verification |
| `docs/world-locations.md` | Coordinates, entrances, map pins and location notes |
| `scripts/` | Geographic source and narrative processing |
| `tests/` | Narrative, geographic, collision and browser checks |
| `.github/workflows/pages.yml` | Verification and GitHub Pages deployment |

The [GitHub Actions page](https://github.com/ShaunFerns/an_arts_story/actions) shows repository workflows. A new public deployment may briefly lag behind the latest commit.

## Development status and limitations

This is an **independently developed educational prototype**. It is not an official TU Dublin game, academic advising service, student registration system or substitute for published university information.

The game uses fictionalised scenarios. Its timetable is illustrative and contains no live student registration, allocation or module-availability information. Students should consult current official guidance and academic advisers for decisions about their actual programme.

The environment is a work in progress. Building heights, footprints, entrance positions, routes and signage require further verification. Some spatial details have been inferred or approximated using mapped information and publicly available architectural references. The [world-locations document](docs/world-locations.md) records specific assumptions, source links and locations requiring on-site checks.

Automated narrative and browser tests support technical development but cannot establish educational value, authenticity, accessibility or suitability for student deployment. Future work should include review with people familiar with the campus and structured testing with students.

### Relationship to research

The project may inform academic discussion of interactive narrative, the transition into higher education and the communication of academic advising. It should be understood as a **design artefact and potential object of study** at this stage. No completed research evaluation is implied, and it is not presented as data from a separate research project.

Any subsequent academic publication should distinguish the design process, development evidence, user evaluation and claims about student learning or experience.

## Contributing and feedback

Feedback is especially valuable on narrative credibility, student language, the representation of advising, campus recognition, navigation and usability.

Issues can be raised through the repository's [GitHub Issues](https://github.com/ShaunFerns/an_arts_story/issues). Please do not post personal student data or identifiable advising cases in public issues.

---

*First Semester: An Arts Story · Development prototype · November 2026*

[Play the game](https://shaunferns.github.io/an_arts_story/geo/) · [View the source repository](https://github.com/ShaunFerns/an_arts_story) · [Narrative audit](docs/narrative-audit.md)
