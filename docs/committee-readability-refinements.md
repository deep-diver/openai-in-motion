# Korea readability and evidence — ten refinement passes

2026-09-09. Scope: all 53 Korea scenes, keeping the two-callout limit and bundled local portraits.

1. Replaced the stretched 1024×512 canvas label textures with screen-facing DOM text attached to each 3D object. Text is no longer sampled from a tiny, tilted texture. Kept the fixed orthographic camera.
2. Converted descriptive English prop labels to concise Korean labels. Proper names and numeric milestones remain intact. The back sign now uses the scene's short Korean title; the story column retains the full title.
3. Made object-label visibility follow ancestor visibility and entrance scale. Outgoing labels disappear with their scene instead of remaining as floating text. Removed redundant tiny actor nameplates because each visible actor already has a named portrait callout.
4. Replaced overlapping paragraph crossfades with a short fade through empty space. At most one caption is painted at any instant, avoiding blurry double text. Main captions now use 16px type.
5. Improved reading hierarchy: 14px minimum prop text, 16–17px stage titles, larger object explanations and portrait descriptions, and solid high-contrast label backgrounds.
6. Rebuilt the three stage-floor families: layered circular discussion floors with a narrow perimeter ring, technical grids, and workshop surfaces with corner fittings. Removed competing global grid lines.
7. Refined the miniature architecture: meeting-chair backs, actor-plinth rims, small platform corner fittings, quieter stage backdrop, and a canvas pixel-ratio ceiling of 2 for high-density displays.
8. Added one timed evidence overlay in the story column, preserving the 3D stage and its two callouts. It shows the actual source publisher, publication date, title, source category, original link and access to the complete evidence list. It enters, holds, and exits with the scene clock.
9. Added reading controls: hovering or focusing a source card holds playback; dismissal releases it; each new scene can show its own card; automatic display can be disabled. Fast playback gets a longer normalized window, and reduced-motion mode suppresses automatic overlays while retaining manual evidence access.
10. Finished responsive card bounds, keyboard focus and dismissal targets, reused projection vectors, and removed canvas-texture allocations from labels. Added regression coverage for source timing, real source links, focus hold, dismissal and unmount cleanup, Korean labels, and non-overlapping captions.

Validation: 52 tests passed. TypeScript and targeted lint completed. Local route compiled and returned HTTP 200. Production build required before publication. No browser screenshot or interaction/visual QA was performed; these are ten implementation passes, not ten browser test runs.
