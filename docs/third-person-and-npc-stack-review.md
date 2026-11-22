# Three.js character, collision and NPC resources — technical assessment

Recorded 22 November 2026 for An Arts Story.

## Decision

**Retain vanilla Three.js for the next implementation phase.** The current georeferenced 1km world and advising game need stable physics, animation and NPC systems; rebuilding everything in React Three Fiber is unnecessary.

| Resource | Assessment | Action |
| --- | --- | --- |
| [NafisRayan/3D-Game-Template-Ultimate](https://github.com/NafisRayan/3D-Game-Template-Ultimate) | Vanilla Three.js; capsule/Octree collisions, movement, camera, Mixamo animation blending. No top-level reuse LICENSE found during review. | Best architecture reference. Check licence before copying any code or bundled assets. |
| [pmndrs/BVHEcctrl](https://github.com/pmndrs/BVHEcctrl) | MIT; React Three Fiber; current package depends on recent Three.js, React, Zustand and BVH. | Reference for BVH controller behaviour, not a direct integration into our vanilla engine. |
| [ugonfor/ai-npc-world](https://github.com/ugonfor/ai-npc-world) | MIT; autonomous NPCs and conversational memory; LLM proxy and optionally Firebase. | Borrow environmental activity ideas. Keep programme advising conversations scripted and verified. |
| [ssethsara/react-three-npc](https://github.com/ssethsara/react-three-npc) | MIT; Yuka navigation with React and Rapier. | Study route-following; consider direct Yuka.js if necessary rather than a framework migration. |
| [AI-Driven-NPC-Interaction](https://github.com/akkieshwar/AI-Driven-NPC-Interaction-in-a-Story-Based-3D-Game-Using-Locally-Fine-Tuned-LLMs-in-GGUF-Format) | E-to-talk proximity design is relevant; licence needs checking. | Implement short-range E-to-talk with accessible UI and authored dialogue. |
| [Client City](https://discourse.threejs.org/t/client-city-a-walkable-3d-portfolio-city-built-with-three-js/95487) and community demos | Reference for atmosphere, city walkability and streaming. | Review performance and aesthetics; do not reuse assets without permission. |

## Practical build order

1. Continue to use the Rathdown House origin, real OSM coordinates and linked mission map. Record which locations and routes are verified, missing or provisional.
2. Replace hand-written XZ blockage tests with a capsule controller and documented contact/collision system. Use either Three.js Octree or licensed three-mesh-bvh; avoid inventing the physics engine.
3. Replace procedurally swung limbs with authored idle/walk/run clips blended through THREE.AnimationMixer, using the existing CC0 rig only where clips are skeleton-compatible.
4. Route background pedestrians along verified walkways and through open gates. Provide natural idle/seated interactions at East Quad and Lower House.
5. Add an E-to-talk trigger with keyboard/accessibility support while preserving the programme-verified induction and advising script.
6. Upgrade the mission map from a target bearing to real pedestrian network routing after crossing and paths connectivity are checked. A direct line must not be presented as a walkable route.
7. Use lower detail or distance-based loading across the outer one-kilometre radius to keep browser performance reasonable.

## Acceptance

Building footprints and boundaries must remain source-grounded. Avatar and doorway proportions must pass scale tests. NPCs cannot walk through solid walls. The mission marker and 3D player must share one coordinate frame. No external LLM is required for induction. Every third-party code or asset inclusion needs verified redistribution rights.

**Status:** technical selection only; these external controller and NPC projects have not been incorporated into the game.