# Provisional terrain and elevation model — Grangegorman (22 November 2026)

## Design decision

The current `geo/` world is flat (ground mesh, paths, roads, building bases, player eye position and NPCs are all based on local y≈0). A slope cannot be introduced by changing the camera or the Luas waypoint's y coordinate alone: **all geometry, collision, navigation and spawn logic must use the same terrain function**.

Retain:
- **Rathdown House** as horizontal coordinate origin `(x=0,z=0)`; this has no implication for the player's starting position or vertical datum.
- **Broadstone–University Luas**, not the distinct Grangegorman Luas stop, as the narrative arrival point.
- **1 world unit = 1 horizontal metre** and preserve OSM feature identifiers.
- **Existing/proposed separation**: only as-built campus facilities in the present-day game, not zoning maximums or proposed buildings.

## Source review and certainty

The [GDA Grangegorman Planning Scheme 2012, Chapter 2 — Site and Context](https://ggda.ie/media/2jsjolnw/04_gg-chapter02.pdf) describes a **general slope down towards the south-east** (§2.6, p. 14; §2.9, p. 17). It does **not** substantiate a surveyed Broadstone–University platform level or East Quad finished floor level in the ranges supplied below. The [GDA Broadstone Plaza description](https://ggda.ie/what-we-do/projects/broadstone-plaza/) confirms the link from Broadstone Gate to St Brendan's Way.

User-supplied provisional modelling scenario (not engineering fact):
- Broadstone–University: **20–22 m OD Malin**, choose **21 m OD** for illustrative vertical alignment.
- East Quad / St Brendan's Way approach: **24–26 m OD Malin**, choose **25 m OD** for illustrative vertical alignment.
- Apparent ascent from the Luas to EQ: **4 m**, locally smoothed along a sourced accessible footpath.
- The wider campus falls generally towards the **south-east**; don't extrapolate the two point anchors as a global north–south or planar slope.
- Existing/possible building-height **typologies** offered by the project owner: heritage 5–14 m, core academic 20–28 m, perimeter 14–28 m, proposed gateway 32–50 m. These are broad *modelling categories*, not verified built heights or necessarily named typologies in Chapter 2. Published SDZ zoning allowances are not a basis to add proposed buildings.
- Already-implemented approximate East Quad 24.5 m, Central Quad 26 m, Academic Hub 24 m are **above local ground**. Do not add those heights to a world y=0 independently of their terrain bases.

### Important distinctions

1. **OD Malin absolute elevation** vs. **game local y**: choose a documented vertical origin (e.g. reference model surface of 25 m OD for EQ implies game y=0 there). Local y at Broadstone would then be -4 m. Any offsets are provisional and must not imply measured levels.
2. **Building height above ground** vs. **roof elevation OD**: roof OD = footprint local ground OD + as-built building height, not roof height alone.
3. **2012 plans vs. present-day campus**: planned routes, buildings and height envelopes may differ from constructed conditions.
4. **RayonMaps DXF** (`docs/rayonmaps-dxf-assessment.md`) has no Z elevations and therefore cannot supply terrain levels.

## Recommended staged implementation

**Stage A — collect/check evidence:** locate a surveyed longitudinal section / site spot levels or publicly licensed terrain raster with known Irish CRS/vertical datum, ideally explicitly covering the pedestrian path from Broadstone–University to East Quad. If not available, retain and label a scenario grade.

**Stage B — provisional terrain function:** define a smooth piecewise `groundHeight(x,north)`, constrained to the **verified OSM pedestrian centreline** and the two **assumed** 21/25 m anchor tiers; incorporate the broader site gradient only once additional control points are established. Use the path's actual length to calculate a realistic grade, rather than guessing it. Provide a visible and keyboard-accessible toggle between *flat comparison* and *provisional graded terrain* for reviewer inspection.

**Stage C — integrate all scene systems together:** terrain mesh, path & road vertices, walls/fences, building footprint bases (including multiple entrances on different levels), NPC positions, player/camera eye height, spawn, minimap height/approach cues and collision volumes. Do not simply rotate flat buildings/road strips or float them above new ground.

**Stage D — quality gate:** automated tests for continuous walkable surfaces, collision still working, spawn on Luas footway, player eye about 1.6 m above local terrain, sensible maximum slopes/ramps, and correct relative height between Luas and EQ; manual ground-level screenshots and site-familiar walkthrough of ramp, underpass, East Quad approach, Serpentine Walk, Lower House and Rathdown crossing.

## Current implementation status

**Implementation added in November 2026:** the 4 m provisional rise now drives the ground mesh, subdivided sloping road/path/barrier strips, building and landscape base positions, NPC placement and the player's eye/feet, all through one continuous terrain function. Actual longitudinal path grade and building entrances still require site review. This is deliberately a localized, smoothly fading grade between OSM mapped horizontal endpoints, not surveyed digital terrain. Source evidence supports that level changes matter, but the supplied site-specific numerical elevations remain estimates. Do not silently present this as a surveyed reconstruction.
