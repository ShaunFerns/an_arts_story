# Geographic and visual reset — Grangegorman (November 2026)

## Decision

**Do not treat the v0.9 scene coordinates, building orientations, distances, ramp or bridge as accurate.** These are provisional approximations derived from a compressed game map, not surveyed campus geometry. Increasing the spacing uniformly did not correct the underlying placement. New decorative modelling on these coordinates would compound the problem.

The 3D direction remains conditional on geographic recognition, architectural quality, and student testing. If those cannot be achieved within a maintainable browser budget, evaluate a more carefully authored top-down/isometric or illustrated interactive story without treating it as a failure.

## Observer's route (site-familiar reviewer, 22 November 2026)

Read as an *experience and facing direction*, not a coordinate survey:

1. Leaving the **Broadstone–University Luas**, the player travels a **longer gentle incline** (substantially longer than the current sequence).
2. The approach passes **under a road bridge**, with visible changes in ground level, paving and boundary walls.
3. On walking towards campus, **East Quad is on the player's left**. Do not assume the current 3D camera yaw, building orientation or west/east axis is correct.
4. From East Quad the route **descends towards Lower House** through/by a **parking area** and landscaped space. The **Serpentine Walk** is a major organising feature.
5. To reach **Rathdown House**, the player **crosses a road**. The historic site should have recognisable **stone walls, cobbles/stone setts, landscape and older buildings**.
6. East Quad's main entrance has outdoor seating, as does the southern Lower House entrance. Students should inhabit both.
7. **The sports pitches** are important to the apparent size and openness of campus. The Golden Bandstand is a distinct landmark in the Central Quad / Greenway Hub area.

Clarify 'parking lot': the GDA tour aerial depicts a parking area along the Serpentine route, whereas TU Dublin currently describes its main campus as pedestrianised and advises no visitor parking. This may represent older/operational parking or a changing configuration. Preserve the site reviewer's *spatial description* but confirm the present-day parking use before representing parked vehicles.

## Independent sources

- [Grangegorman Development Agency — self-guided tour](https://ggda.ie/what-we-do/events/tours/self-guided-grangegorman-site-tour/): starts at East Quad; proceeds to Lower House and Serpentine Walk; historic campus context. The tour map/aerial shows the corridor and parking/landscaping.
- [TU Dublin — September 2024 official access map](https://www.tudublin.ie/media/website/explore/our-campuses/city-centre-campuses/grangegorman/documents/00GC-DDS-GEM-ZZ-VS-GD-XX-0002-WayfindingMapCampus.pdf): numbered buildings and access, including East Quad 23, Lower House 24, Rathdown House 6, Central Quad 12 and Golden Bandstand 10.
- [Ste Murray — East Quad architectural photography](https://www.ste.ie/east-quad-grangegorman-ahr-architects): broad paving and elevation relationship with Luas cutting.
- [TU Dublin — getting to Grangegorman](https://www.tudublin.ie/explore/our-campuses/grangegorman/getting-here/): current pedestrian/campus access advice.
- [Garland — Lower House restoration](https://www.garlandconsultancy.com/our-projects/education/lower-house-grangegorman.html): historic form, proportions, materials and photographs.
- [TU Dublin campus maps / MazeMap](https://www.tudublin.ie/explore/our-campuses/campus-maps/): available route finder for verification.

Photographs and maps are **design references**, not approved game textures. Check permission before embedding material.

## Build gate: before another 'accurate Grangegorman' release

### A. Ground-truth spatial layout

- Derive one fixed coordinate system from a campus map/aerial **with known orientation**. Record the source, date, approximations and scale. Place **building footprints**, pedestrian routes, barriers, road crossings, ramp, retaining walls, pitch boundaries and entrances as separate labelled layers.
- Trace the complete 5-point walking sequence above, with a visible route ribbon and third-person camera facing the correct direction.
- Validate from a third-person ground-level screenshot at minimum these views: (i) exit Luas, (ii) ascending under bridge, (iii) first East Quad sightline, (iv) turn towards Lower House via Serpentine Walk, (v) road crossing towards Rathdown House.
- Do **not** add complex building façades until route screenshots are reviewed.

### B. Materials and architecture

- Model East Quad, Lower House and Rathdown from architectural photographs in plausible massing/size; include distinctive entrances.
- Specify original or licensed stone-sett/cobblestone, stone wall, weathered masonry, planting, path, grass and brick/glass materials with physically-based rendering and good light/shadow.
- Cobblestones must be used where site references show them, not indiscriminately applied across modern paved routes.
- Represent the broad campus voids, pitch sightlines and distance between destinations.

### C. People and animation

- Replace placeholder procedural humans with licensed **rigged** glTF/GLB student and staff assets of coherent visual style. Establish skeleton/clip compatibility, animation state transitions, seated/chatting/walking behaviour and file size. Document creator/licence/redistribution conditions.
- Avoid promising AAA photorealism from a free browser-based project. Establish a reproducible visual quality target using real in-game screenshots and user testing.

### D. Gameplay and release testing

- Preserve the induction-to-preferences-to-Friday-timetable narrative.
- Ensure missions, teleport locations, collision volumes, fog and NPC positions match the **new** geography.
- Browser automated startup checks **cannot** establish geographic fidelity, scale, or beauty. Add human walkthrough signoff with screenshots before calling it a location-accurate release.
- Keep the current site tagged as **experimental** until this review is passed. Give colleagues access to stable review releases.

## Decision point

Review a small, high-quality *vertical slice* from Broadstone → East Quad → Lower House → Rathdown crossing. If it is convincingly navigable, attractive and performant, extend it to the rest of the campus and story. If repeated visual reviews fail, scope a top-down/isometric version that still conveys route, places and choices, rather than increasing 3D complexity without educational return.


## Approved geographic production standard — 1 km Rathdown-centred world (22 November 2026)

The project owner has agreed that **plain, low-detail building blocks are acceptable at this stage**, provided their **footprints, heights, orientation and relationships to the walking routes are plausible and measured**. Prioritise terrain, streets, boundaries and accessibility over elaborate façades.

### Spatial foundation

- Use Rathdown House as origin `(0,0)` in the horizontal game coordinate system. Geographic coordinates/CRS and the exact anchor position must be recorded from an inspected map or geospatial dataset before generating any placements. **1 world unit = 1 metre**.
- Use **1 km radius** from the Rathdown origin for the geographic context; near-campus geometry may use richer detail, while the outer ring is inexpensive backdrop. A radius is not permission to invent boundary features at 1 km.
- Building data model: source, source date, provenance/licence, footprint polygon, ground elevation, measured height or a clearly marked height estimate, entrances and orientation. Only render a block if its footprint is grounded. If height is unknown, mark it estimated rather than claiming accuracy.
- At minimum align the Broadstone Luas cutting and pedestrian ramp, the overhead road underpass, East Quad (with north/south main openings relative to an approximately east–west path), Serpentine Walk, Lower House, road crossing, Rathdown House, and the open playing-field landscape. Calibrate elevations separately from plan positions.

### Boundaries and garden barriers are **required early features**

These determine legible walking routes and historically distinctive campus character; add them in the first georeferenced base scene, before façade detailing.

| Geometry type | Source and rendering treatment | Gameplay effect |
| --- | --- | --- |
| Historic **stone/brick boundary walls** | Footprint/alignment from campus plans, verified OSM walls and GDA conservation references; plausible measured height; coursed masonry texture | Solid barriers; wall openings only at documented gates |
| **Metal fences and railings** | OSM `barrier=fence` where available; current photographs / site drawings otherwise | Collision where applicable; visibility through rails |
| **Garden walls, hedges and planted edges** | OSM `barrier=hedge`, garden/landscape geometry and verified site observations | Low/soft barriers, visually distinct from historic perimeter walls |
| **Entrance gates and carriageway gates** | Building and estate reference drawings; preserve openings and distinctive pillars | Walkable connections on the verified pedestrian network |
| **Raised planters, seating and garden beds** | High-detail focal points at East Quad entrances and southern Lower House entrance | Social encounter locations; avoid obstructing accessible routes |
| **Retaining walls and underpass abutments** | Elevation/cross-section where available, supplemented by site-grounded photographic checking | Explain ramps and vertical changes; maintain walkable clearance |

OpenStreetMap tags alone are not enough to establish a feature's present-day existence: record `confidence: surveyed | authoritative_map | current_image | historic_reference | provisional` and avoid promoting historic proposals into the present-day campus. The 2012 GDA boundary-wall inventory and current GDA Green Fingers / Ivy Avenue materials are useful supplementary references, but are not substitutes for a modern site survey.

Keep boundary geometry separately editable as `walls`, `railings`, `hedges`, `gates`, `planters`, `retaining_walls` and `paths`. For sourced vector input, preserve feature IDs and tags. Respect accessible crossings, paths and gate gaps; do not close a usable pedestrian route with a decorative wall. Make boundary footprints both visible and collidable where required.

### Acceptance gate

1. A known 1.70–1.80 m human avatar stands at credible scale against building blocks, standard exterior doors, boundary walls and benches.
2. The entire walk from Broadstone–University through East Quad, Lower House and Rathdown crossing is connected by plausible traversable geometry; opening positions agree with reviewed evidence.
3. The original estate's historic boundaries and the main garden barriers are visible and in approximately correct locations, with their certainty noted.
4. A plan view and ground-level screenshots expose differences between observed facts and estimates; no claim of geographic accuracy until the site-familiar reviewer has signed off.

**Status:** explicit production requirements. The existing `/review/` geometry was made before georeferencing and does *not* satisfy this gate yet. Do not present it as the completed Rathdown-centred 1 km model.

### Reference additions

- [GDA conservation assessment: existing Grangegorman boundary walls and entrances](https://ggda.ie/media/a3vnvuc2/13_gg-appendix_2a.pdf)
- [GDA Green Finger, Playscape & Ivy Avenue](https://ggda.ie/what-we-do/projects/green-finger-playscape-ivy-avenue/)
- [OpenStreetMap: barrier=wall](https://wiki.openstreetmap.org/wiki/Wall) and [barrier=hedge](https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dhedge)


## November 2026 build consolidation

The separate /review/ prototype has been retired from the live repository. Its useful geographic and character work is developed in /geo/; the original narrative implementation is retained under /story/ for later integration. The current geographical build defaults to first-person with a third-person testing toggle. This perspective choice reduces the need for a fixed player identity, but visible NPC clothing and posing still require review. Geographic accuracy remains unverified until human review.
