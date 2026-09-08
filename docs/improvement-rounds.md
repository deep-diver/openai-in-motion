# Ten refinement rounds · 2026-09-08

The complete 44-scene, 3× MP4 was exported from c82bf5f before these refinements.
The fixed isometric camera, single stage, full history and two-panel annotation limit remain the baseline.

1. **Clickable cast.** Restored pointer events to the cast buttons inside the text column. Their existing dialogue-seek action now accepts pointer and touch input, alongside keyboard activation. Checked inherited CSS and button handlers.

2. **Reachable layout and readable controls.** Removed the fixed-height clipping that could hide the archive at intermediate desktop heights. Kept vertical document flow at every breakpoint, raised body/cast/control/track type sizes, and enlarged control targets. Reviewed desktop, short-window and mobile cascade rules; whitespace validation passed.

3. **Deliberate navigation.** Vertical touch and wheel gestures keep scrolling the document; only clearly horizontal swipes change scenes. Cancelled/multitouch gestures reset, and held Space/IME/modifier combinations do not repeatedly toggle playback. Three input regressions passed, including vertical, horizontal and cancelled gestures.

4. **Playback that explains itself.** Added 3× to the existing speed control, an overall progress/remaining-time readout, and a clear completion state that restarts the whole story. Composed the existing Base UI slider primitives at the call site so the actual input exposes a scene name and seconds, with 0.1-second arrows and 1-second page steps. The rendered input regression and TypeScript check passed.

5. **Readable, connected annotations.** Labels remeasure after font/layout changes and long dialogue moves above the stage boundary while its leader follows. The cast list highlights the current speaker and selected years expose their state. All six annotation regressions passed, including enlarged dialogue and the strict two-panel limit across 44 scenes.

6. **Reasoning that unfolds.** o1's worked example now reveals one equation at a time. In o3, separate search/code/image evidence cards appear at each visited tool and gather into one result. Added regressions for intermediate visibility, ordering and the completed evidence stack; they passed.

7. **Sora's street demonstration walks.** The character now faces the travel direction, alternates arms and legs, and moves with a small walking bounce before settling naturally. The opposing-limb and final-pose regression passed.

8. **A racing game with actual steering.** Replaced sideways right-angle translation with a sampled closed curve and continuous heading changes. Headlights make its direction visible. The regression checks the full lap for position/heading jumps, track bounds, completion and backward seeking.
