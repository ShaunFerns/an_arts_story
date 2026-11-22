# Grangegorman environment — architectural reference brief

## Purpose

Build a recognisable, navigable **TU Dublin Grangegorman** using verified building forms and campus geography, not simply increasing the dimensions of the existing stylised blocks. Use the site as an educational setting for induction, academic advising, and student decision-making.

## Primary references

1. **TU Dublin/GGDA wayfinding campus plan (September 2024)** — building positions, entrances, pedestrian routes, open spaces, Luas connections: https://www.tudublin.ie/media/website/explore/our-campuses/city-centre-campuses/grangegorman/documents/00GC-DDS-GEM-ZZ-VS-GD-XX-0002-WayfindingMapCampus.pdf
2. **TU Dublin building directory** — location names, building histories, functions, visual reference: https://www.tudublin.ie/explore/our-campuses/grangegorman/buildings-on-campus/
3. **AHR — East Quad** — exterior architecture, dark brick/bronze palette, glazing, atrium and entrance plaza, building photography: https://www.ahr.co.uk/projects/east-quad-building
4. **Ste Murray — East Quad architecture photography** — visible relationships between East Quad, the Luas corridor and open pedestrian routes: https://www.ste.ie/east-quad-grangegorman-ahr-architects
5. **ArchDaily / Feilden Clegg Bradley Studios — Central Quad** — plan massing, courtyards, colonnade and landscaping: https://www.archdaily.com/978001/central-quad-grangegorman-campus-feilden-clegg-bradley-studios
6. **TU Dublin campus development images** — public campus photography and aerial perspectives: https://www.tudublin.ie/explore/our-campuses/campus-development/images/

## Environmental priorities

1. **Campus footprint first:** locate the Luas arrival, East Quad, Clock Tower, Lower House, Rathdown House, Central Quad, Academic Hub & Library, St Laurence and Glassmanogue using the official map; preserve routes and broad open distances. Avoid applying a blanket scale factor that makes buildings the wrong size relative to the player.
2. **East Quad as the visual anchor:** accurate silhouette, five-storey mass, dark brick and bronze frontage, glazing and entrance-plaza relationship. Use reference images, not copyrighted building images as in-game textures without permission.
3. **Distinct building identities:** Central Quad courtyard massing; genuine historic rooflines/windows for Rathdown/Lower House/St Laurence/Clock Tower; make distance, landscaping and sightlines between buildings perceptible.
4. **Ground-level atmosphere:** generous footpaths, landscaping, long views, gradual arrival from Broadstone–University, people at believable scale, realistic lighting, cast shadows and material roughness.
5. **Navigation and learning:** W forward in camera direction, S backwards, A/D strafe, draggable third-person orbit, scroll zoom and C camera reset. Ensure destination markers and map positions follow the revised layout; no impossible walking distances without quick-travel options.

## Asset strategy

- Start with original geometry and independently created textures based on visual reference; do not reproduce externally published architectural photographs as game textures or claim they are licensed game assets.
- AHR states architectural BIM models were used in student game projects. Investigate whether TU Dublin campus planning, relevant Schools or the architects can provide a **licensed simplified model** (e.g. glTF/GLB after suitable conversion) and permission for a public browser project. Treat this as a possibility, not an existing asset.
- Keep a credits/licence register for any acquired assets and check performance and accessibility before inclusion.

## Acceptance criteria for a revised campus prototype

- A person familiar with Grangegorman can recognise East Quad and at least two other buildings without on-screen labels.
- Walking from the Luas arrival conveys the scale of the open campus.
- Major destinations have plausible relative placement, proportions and pedestrian connectivity, verified against the 2024 campus map and an on-site reviewer.
- Smooth walking and camera orbit do not obscure the objectives; phone/map navigation remains accurate.
- GitHub Actions real-browser startup test passes; an additional manual visual walkthrough is required before sharing as an environment-focused review build.

**Status:** reference research and design brief; this document does not claim that the game has been remodelled yet.

## Corrected Broadstone–University arrival (November 2026)

The initial game placed the Luas and East Quad as though they shared an open, level plaza. **That is geographically misleading.** On-site reviewer feedback describes disembarking, ascending a gentle incline, passing beneath a road and then entering the wider campus.

- TU Dublin's sustainability/transport guide states that East Quad is between the Broadstone and Grangegorman stops and that visitors commonly alight at **Broadstone and walk up the ramp**: https://www.tudublin.ie/media/website/explore/about-the-university/sustainability/documents/Sustainability-events---EQ-Travel-and-Facilities.pdf
- Photographic/location context describes the **road bridge over the Broadstone tram tracks** for bus depot access; the track runs below road level: https://excellentstreetimages.com/PublicTransportWordPress/luas-tram-stop-at-broadstone-and-the-entrance-to-grangegorman-university-campus/
- East Quad reference photography shows the Luas corridor and pedestrian frontage: https://www.ste.ie/east-quad-grangegorman-ahr-architects

**Spatial sequence to model:** lower-level tram and platforms → pedestrian climb → pass beneath access road structure → open approach with East Quad ahead. Verify precise ramp alignment, abutment placement, surface materials and sightlines in a future site walk; the current procedural interpretation is not survey-accurate.

**Review criterion:** a student who has arrived by Luas should recognise the passage from the stop to East Quad without relying on a map label or narrated instruction.

## Character asset direction

The procedural v0.9 figures are placeholders, even after proportion, face, wardrobe and walk-cycle improvements. Do not describe them as realistic commercial-grade avatars. The target for the next significant visual release is licensed **rigged glTF/GLB humans with compatible skeletons and animations**: varied student-age clothing, natural walking/standing/seated motion, facial detail, plausible shadows and good browser performance. Record the model creators, redistribution rights, licence obligations and source URLs. Do not import commercial game assets or copyrighted character models without permission.

