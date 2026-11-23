# Narrative audit

The canonical source is *First Semester: An Arts Story — Playable v1.3*, supplied as `First_Semester_An_Arts_Story_Playable_v1_3.html`. The SHA-256 in [the generated story module](../geo/assets/semester/source.mjs) identifies the input used to recover all 153 scenes. The 3D archive in [story/index.html](../story/index.html) contains a distinct 33-scene campus induction and two advising cases. The geographic build previously carried 30 of those 33 scenes, alongside changes to the Friday handoff and preferences form.

| Scope | Before | Integrated |
| --- | ---: | ---: |
| v1.3 canonical scenes | 15 partial counterparts and 138 absent | 156, including the two Paul welcome scenes and the Bradogue trail opening |
| Archived campus-orientation scenes | 30 of 33 | 33, including `huntTryAgain`, `induction2` and `defaultTalk` |
| Broken canonical choice destinations | 0 | 0 |
| Unreachable canonical scenes | 2 | 0 |
| Distinct reflection entry points | 2 defined, 1 reachable | 2 reachable |

The [machine-readable audit](narrative-audit.json) records IDs, speakers, original location IDs, text or text expressions, choice destinations and effects, entry conditions, dynamic state reads, migration status and phone handoffs. Here, *partial counterpart* means the previous geographic build covered a recognisable encounter or purpose using the archived version. It does not imply that the corresponding v1.3 choice graph was already in use.

## Reconciliation decisions

- The guided semester is the default. The first two scenes read as a recollection of the evening before induction at Broadstone–University. The source labels these scenes Central Quad even though the prose sets them before arrival. The default opening sends the player to Paul and then Julie at East Quad, with Form A at Julie’s meeting point. Róisín meets the player outside Central Quad and directs them to the Bradogue trail sign. The separate orientation route is available from **Phone → Campus** and uses the same characters and trail signs.
- Some source phone links name a different building from the linked scene. Destination names and street markers now come from the scene's physical location. Where the choice changes campus location, it creates a physical destination and resumes at an outdoor contact near that building. The same policy applies to referrals. The academic appointment message remains a fictional story event.
- The source has zero unresolved choice IDs. `hub`, `ending`, `practiceTimetable` and `practiceForm` are explicit UI transitions. Its phone's undefined `MISSION_START` lookup is replaced by the source's place list and friend leads. `week3` and `week3End` become available through the optional campus conversations in or after Week 4. After that reflection, the player can resume the guided story.
- Checking the Planner during Cian's missing-module case opens the app and then returns to the current conversation. The source jumps out to the timetable and drops the case. Visiting a referral clears the active destination, records the visit and keeps the message in the inbox. The phone only offers that message's map action while its destination is current.
- Three clear speaker/name carryovers were corrected in the import: Sam to Cian in `exploreMeeting` and `ch3a`, and Leah to Saoirse in the title of `prepTransfer`. Other dialogue and option copy were carried across. The illustrated source's menus and images are replaced by the existing 3D campus and shared dialogue/phone UI.
- The existing geographic save key still opens the campus-orientation progress. The semester has its own save with scene, route, decisions, messages, Form A, notes and pose. The game opens the full semester sequence by default. Players can leave and return at any point or run an optional campus conversation between chapters.

## Verification

- `node tests/semester.test.mjs` runs two guided profiles, checks contrasting Form A outcomes, walks the optional case graph using the live state reducer and exercises both reflections.
- `node tests/collision.test.mjs`, `node tests/geo-smoke.mjs` and `node tests/semester-browser.mjs` check collision boundaries and the geographic browser entry point. The browser walks use the same movement and collision step as WASD. They sample routes at a fixed timestep to keep the tests deterministic under software rendering.
- To re-import the original HTML, run `node scripts/import-semester.mjs /path/to/the/original.html`, followed by `node scripts/audit-semester.mjs` and the narrative test.
