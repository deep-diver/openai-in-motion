# Korea scene refinement — 10 passes (2026-09-09)

Scope: the existing 53-scene Korea timeline. The original OpenAI routes remain unchanged.

1. **Cast audit.** Replaced the unconditional two-person cast with the documented speaker and an optional second participant. Seven scenes now have two named participants: launch, Bengio meeting, Amazon meeting, media dialogue, defense visit, computing seminar, anniversary. Every other scene has one foreground participant. New descriptions are editorial activity summaries, not invented quotations.
2. **Callout pairing.** The two-person scenes use two portrait cards; single-person scenes retain one portrait and one object card. Both slots have independent leader lines. The object explanation moves into the story column when two participants occupy the two-callout budget. Both photo credits are available in the evidence view.
3. **Leader placement.** Replaced fixed screen assumptions with named world anchors. Connections follow the active scene and character entrance transforms, and no longer attach to the outgoing scene. Endpoints include a small circular marker and off-stage lines hide during entrance.
4. **Stage light and silhouette.** Added a layered dark foundation, a narrow axis-colored rim, warm key light, cool fill, hemisphere light, and tuned shadow bias. The stage and orthographic camera remain fixed during playback.
5. **Scene composition.** Added explicit design metadata for all 24 set families: round discussion floors, gridded technical floors, and rectangular work surfaces. Added supported back signage and reduced the persistent year folio so it no longer crowds the front edge of the stage.
6. **Character craft.** Added portrait-linked nameplates, small individual plinths, shirt fronts, articulated arms and independent head movement. Single-person scenes no longer contain an unexplained decorative second actor.
7. **Prop and type detail.** Added server feet, ventilation, slot details, monitor backs and power lights, binder edges and spines. A committee-only high-resolution label renderer now handles actual line breaks in signs such as DEFENSE / DATA without changing OpenAI scenes.
8. **Story choreography.** Speaking gestures alternate between the two participants. Main mechanical actions ease into a stationary final tableau from 20 to 24 seconds; ambient globe/science motion remains separate. Corrected entrance stagger to count only entry groups, preserving the requested 0.05-second sequence.
9. **Reading rhythm.** Replaced discrete subtitle switching with smooth overlapping weights. Tightened the header, refined stage background and card borders, raised callout body text to 14px, and separated object context from live captions. End poses retain their full size.
10. **Responsive and performance finish.** Added room for two cards at narrow widths, horizontally scrolling mobile division choices and visible keyboard focus. Leader-card geometry is measured on resize rather than twice each animation frame. Reused projection vectors and removed a redundant full-tree matrix update. Reduced-motion navigation still shows completed scenes.

## Validation

- TypeScript: `npx tsc --noEmit`.
- Lint: committee components, data, and committee tests.
- 48 tests pass, including full cast/photo/evidence coverage, all 24 set profiles, subtitle opacity conservation, monotonic action timing, alternating gestures, and the existing playback/history checks.
- Local `/korea` returned HTTP 200 after the first coherent change.
- Production build required before publishing.
- No browser screenshot or visual-interaction test was performed in this pass. These are ten focused implementation refinements, not a claim of ten browser test runs.
