# World locations

World coordinates are east and north in metres relative to the Rathdown House reference. Three.js uses east for X, height for Y and negative north for Z. The normal phone map is north-up. Its 1,000 × 1,000 drawing at the default zoom uses `mapX = 500 + 0.925 × (east − 112)` and `mapY = 500 + 0.925 × (−45 − north)`. Zoom and recentering use that same projection with a different scale and centre.

| Location | Building or stop centre (E, N) | Door → interaction point (E, N) | Phone map pin (px) | Story use |
| --- | ---: | ---: | ---: | --- |
| Broadstone–University | (381.8, -102.2) | (387.4, -103.8) | (750.1, 554.4) | Luas animation, then the two opening recollection scenes |
| Rathdown House | (0.0, 0.0) | (6.3, 2.5) → (5.3, 2.9) | (401.3, 455.7) | Student Hub, programme support and referrals |
| Lower House | (87.2, -284.7) | (85.0, -277.6) → (85.1, -276.5) | (475.1, 714.1) | Students’ Union, Cian and Saoirse, early-semester reflection |
| Central Quad | (-124.2, 132.0) | (-124.0, 130.8) → (-125.1, 131.0) | (280.7, 337.2) | BA Arts welcome, degree builder, Form A, advising and graduation reflection |
| Glassmanogue | (-32.4, -44.0) | (-34.4, -49.4) → (-34.8, -50.4) | (364.2, 505.0) | Gym and orientation observations |
| St Laurence’s | (-6.4, -51.5) | (-2.5, -54.4) → (-2.9, -55.4) | (393.7, 509.7) | Chapel and orientation observations |
| Academic Hub & Library | (-240.5, 139.0) | (-216.6, 115.9) → (-216.7, 114.8) | (195.9, 352.2) | Study time, assessment support and meeting preparation |
| East Quad · north | (88.4, -118.3) | (91.0, -104.7) → (91.2, -103.4) | (480.8, 554.0) | Module teaching, workshop checks and archived orientation |
| East Quad · south | (88.4, -118.3) | (75.3, -138.2) → (75.1, -139.5) | (480.8, 554.0) | Module teaching, workshop checks and archived orientation |

Broadstone’s interaction is the initial pedestrian spawn. East Quad’s main northern entrance is the single public map pin, and either door can start a local story scene. During archived orientation, the active waypoint can move to the relevant staff member or observation point.

## Entrance and route conventions

- Approaches use the original projected campus. Door interactions are placed on the pedestrian side of the mapped wall. Central Quad’s doorway uses the clearer section of the courtyard frontage. **E** enters the corresponding conversation or location panel. The displayed interior scene is a narrative transition. On exit, the player is placed on a collision-checked exterior point facing away from the wall.
- The existing east–west route, East Quad opening orientations, north entrance frontage and Rathdown origin remain in use. The access-road deck bridges the Broadstone cutting with a provisional 9 m clearance. The original four-metre terrain rise from the Luas stop towards East Quad is unchanged. Mapped stairs and paths follow the prototype’s graded walking surface.
- The library doorway is on the playing-fields side. The dated OSM construction fence still encloses that approach. The game adds a 5.6 m pedestrian gap and a short paved approach, with the original source snapshot retained. The gap and door position are provisional. [Academic Hub and Library opening](https://www.ggda.ie/what-we-do/news/academic-hub-library-officially-opened-on-september-11th-2026/)
- The Central Quad treatment uses brick, light precast framing and large glazed bays. The Academic Hub & Library uses a dark stone base, broad ground-level glazing and a narrower rhythm above. [Central Quad façade reference](https://concrete.ie/wp-content/uploads/2023/03/ICS-Awards-Booklet-FINAL.pdf) · [Library façade reference](https://www.mfsgroup.com/project/tu-dublin-academic-hub-grangegorman/)
- Glassmanogue uses a two-storey heritage frontage. St Laurence’s uses a single-storey chapel volume with tall pointed windows and a pitched roof. Heritage and contemporary materials differentiate Rathdown House, Lower House, the Clocktower, Bradogue, Orchard House, North House and Greenway Hub. Secondary façades use the available footprints and estimated heights. [TU Dublin campus buildings](https://www.tudublin.ie/explore/our-campuses/grangegorman/buildings-on-campus/) · [St Laurence’s historic inventory](https://www.buildingsofireland.ie/buildings-search/building/50070358/saint-laurences-chapel-saintbrendans-hospital-grangegorman-lower-dublin-7-dublin)
- The library and Lower House footprints are provisional attributions in the snapshot. The latter uses the feature labelled Sports and Student Facility. Entrances, façade dimensions, kerb detail, underpass alignment and elevations remain candidates for on-site review. [TU Dublin access map](https://www.tudublin.ie/media/website/explore/our-campuses/city-centre-campuses/grangegorman/documents/00GC-DDS-GEM-ZZ-VS-GD-XX-0002-WayfindingMapCampus.pdf)
