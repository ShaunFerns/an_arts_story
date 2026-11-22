# RayonMaps Grangegorman DXF export — initial assessment (22 November 2026)

## Source and purpose

File supplied by the project owner: `site-export.dxf` from [RayonMaps site report](https://maps.rayon.design/site-report/oirqil), examined with ezdxf 1.4.4. This note records the observed CAD structure; the binary file has **not** been committed to this repository.

Goal: determine whether the export usefully complements the georeferenced 1 km Rathdown-centred OpenStreetMap snapshot in `geo/data.json`. No replacement or overlay has been made.

## Actual content

- DXF: ASCII; `$ACADVER = AC1021`; `$INSUNITS = 0` (units unspecified).
- Modelspace: **4,886 entities** in total: **2,729 LWPOLYLINE** outlines and **2,157 HATCH** entities. Do not count hatches as independent mapped features.
- Bounds of outline coordinates: X **-516.091 to +516.091** and Y **-372.812 to +372.812**, approximately 1,032.18 × 745.62 drawing units. All outline elevations are Z=0.
- CAD layers:

| Layer | LWPOLYLINE | HATCH | Notes |
|---|---:|---:|---|
| BUILDINGS | 1,280 | 1,276 | Outlines/fills; no height, feature IDs or names |
| ROADS | 567 | 0 | Lines rather than classified road/footpath attributes |
| NATURE | 181 | 181 | Area outlines/fills |
| TREES | 699 | 699 | Tree canopy/circle outlines/fills |
| WATER | 2 | 1 | Geometry only |
| RAILWAYS | 0 | 0 | Layer exists, no geometry |
| ROAD_SURFACES | 0 | 0 | Layer exists, no geometry |

**Limitations:** no georeferenced latitude/longitude, projection identifier or map-to-world control points found; no reliable CAD distance unit declared; no height or ground-elevation measurements; no building names or OSM feature identifiers; no separate stone-wall/hedge/rail layers. The data appears to be a two-dimensional local-plan export. Not suitable for direct insertion into the active game coordinate system without registration.

## Comparison with active model

The active `geo/data.json` is built by `scripts/build-geodata-osm.py`: an OSM-derived snapshot using the Rathdown House OSM way as anchor, converting lat/lon to local metre coordinates, preserving original way IDs and tags, including buildings, roads, barriers, rail and land-use features. The game deliberately uses **Rathdown as coordinate origin** but **Broadstone–University Luas as the player spawn**.

The DXF offers a compact CAD-style plan and detailed tree/landscape outlines that may assist visual modelling. It is **not independent ground truth**, since it too is OSM-derived. It would lose important tags, original IDs, potentially useful boundary definitions and campus-specific height estimates if used wholesale to replace the current source.

## Safe integration procedure

1. Identify at least two or preferably three corresponding recognisable footprint vertices between the DXF and the anchored OSM snapshot; compute and **record** scale, rotation, translation, residual errors and source date. Never assume that `DXF (0,0) = Rathdown`.
2. Confirm drawing units by measuring multiple known-length features. The approximately 1 km-wide extent suggests metre-like coordinates, but `$INSUNITS=0` is not authoritative.
3. Register the DXF into the existing game coordinate system with a reproducible script. Visual-check against East Quad, Rathdown House, the Luas corridor and the Serpentine Walk. Reject the registration if residuals are unacceptable.
4. Compare **features by category** after registration; preserve existing OSM IDs/tags, mapped barriers, pathways and collision unless a specific DXF geometry improves a checked feature.
5. Treat tree canopy outlines and landscaping as potential **decorative overlays**, with performance limits and provenance documentation. Check RayonMaps' redistribution/licensing terms and upstream OSM attribution before publishing transformed coordinates or assets.
6. Keep building **height** and **terrain elevation** separate from two-dimensional footprint data. This DXF provides neither. Do not introduce proposed buildings into the current campus from conceptual planning drawings.

**Decision:** retain the game's active OSM geographic source; do not ingest the DXF automatically. Use the DXF for coordinate-registered comparison and landscaping after suitable reference-point alignment. 
