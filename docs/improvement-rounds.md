# Ten refinement rounds · 2026-09-08

The complete 44-scene, 3× MP4 was exported from c82bf5f before these refinements.
The fixed isometric camera, single stage, full history and two-panel annotation limit remain the baseline.

1. **Clickable cast.** Restored pointer events to the cast buttons inside the text column. Their existing dialogue-seek action now accepts pointer and touch input, alongside keyboard activation. Checked inherited CSS and button handlers.

2. **Reachable layout and readable controls.** Removed the fixed-height clipping that could hide the archive at intermediate desktop heights. Kept vertical document flow at every breakpoint, raised body/cast/control/track type sizes, and enlarged control targets. Reviewed desktop, short-window and mobile cascade rules; whitespace validation passed.

3. **Deliberate navigation.** Vertical touch and wheel gestures keep scrolling the document; only clearly horizontal swipes change scenes. Cancelled/multitouch gestures reset, and held Space/IME/modifier combinations do not repeatedly toggle playback. Three input regressions passed, including vertical, horizontal and cancelled gestures.
