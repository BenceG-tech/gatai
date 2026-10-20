# GátAi studio — neural logo hero and motion system

Replaces the earlier `LiquidScene` / textured-WebGL logo story (`docs/logo-scroll.md`, removed).

## Brand source

- `public/brand/*.svg` are verbatim copies of the approved vectors (wordmark, monogram, lockup, icon; primary / two-colour / light / mono variants). Never edit their geometry or colours.
- `src/lib/brand.ts` holds the same paths as typed data. `BrandLogo`, `BrandMonogram`, `BrandLockup` and `BrandIcon` render them inline with `useId` gradient ids.
- Palette tokens live on `:root` in `src/styles.css`:

  | Token    | Value                 |
  | -------- | --------------------- |
  | Obsidian | `#08090D`             |
  | Graphite | `#12151B` / `#1A1D24` |
  | Line     | `#232832`             |
  | Silver   | `#DFE2E8`             |
  | Mute     | `#8D96A6`             |
  | Azure    | `#2F9BFF`             |
  | Ice      | `#F6F8FF`             |

- Fonts: Sora (display), Manrope (text), IBM Plex Mono (labels).
- `public/favicon.ico` and `public/apple-touch-icon.png` are rendered from `icon-primary.svg`.

## Hero (`src/components/hero/`)

`NeuralHero` is a pinned stage that is 300svh tall plus one viewport. It contains five `data-chapter="0..4"` anchors. `chapterProgress` (`src/lib/chapters.ts`) turns scroll into a chapter value, and `timelineFromChapter` maps that onto the 0..1 timeline. Scrolling therefore scrubs the animation in both directions.

`neural-logo-engine.ts` is a typed port of the approved `neural.js` v2.4 prototype. It is plain 2D canvas, so no three.js is involved. It uses a seeded PRNG, which makes every frame a pure function of `p`. Phases come from `src/lib/neural-timeline.ts`:

| p          | Phase                                                   |
| ---------- | ------------------------------------------------------- |
| 0 – .14    | Neurons fire in a brain-shaped network                  |
| .14 – .46  | The network settles into the letters                    |
| .46 – .52  | Matte GÁTAI                                             |
| .52 – .63  | Shake, then the explosion into the neural sphere        |
| .68 – .735 | Snap back                                               |
| .735 – .84 | Beam sweep that paints the chrome/azure logo and STUDIO |

Engine behaviour:

- The drawn value glides toward the scroll target (`approach`, τ = 110 ms).
- The rAF loop runs only while the hero is on screen and the tab is visible (IntersectionObserver plus `visibilitychange`).
- It honours DPR, capped at 2, and resizes with ResizeObserver.
- The cursor neuron is active only on fine pointers. Phones get fewer nodes.
- The canvas has `role="img"` and an aria-label. The HUD shows the phase and has a "Görgess" hint and a motion toggle.

Reduced motion, or the visitor turning motion off (`gatai:motion` in localStorage, `html[data-motion="off"]`), means the engine is never created. The complete static vector logo is shown instead. The OS reduced-motion setting wins, so no toggle is offered in that case. On the server the static logo renders, which keeps SSR safe.

## Continuous home flow

The home page reads as one uninterrupted scroll:

1. **Logo → thread.** `NeuralThread` (`src/components/effects/NeuralThread.tsx`) is one fixed 2D canvas behind the home content. While the pinned hero leaves the screen, its nodes ride on a wordmark-shaped band that moves with the logo. Meanwhile the hero canvas dissolves through a CSS view timeline (`--hero`, `exit 0% → 55%`). The logo visibly turns into the network.
2. **Thread → sections.** Sections opt in with `data-formation`. The section crossing the middle of the viewport picks the shape, and the same nodes spring into it:

   | Formation       | Section                    |
   | --------------- | -------------------------- |
   | `drift`         | intro, idea, founder       |
   | `flow`          | "Képzeld el", AI           |
   | `grid`          | services                   |
   | `sphere`        | halo around the R3F sphere |
   | `constellation` | work                       |
   | `line`          | process timeline           |
   | `converge`      | final CTA                  |

   Layouts are pure and seeded (`src/lib/neural-thread.ts`).

3. **"Képzeld el" (`ImagineDay`).** A pinned, horizontally scrubbed day in the life of a self-running business. It uses pure CSS: the `--imagine` view timeline drives the track, a parallax "24/7" layer and a progress beam. Without support, it falls back to a vertical list.
4. **"Ötlet → rendszer" (`IdeaToSystem`).** The visitor types or picks an idea. Deterministic keyword matching (`src/lib/idea-system.ts`) wires it into an SVG system map, with CSS dash pulses on active synapses. Suggested modules ("amire még nem gondoltál") breathe in azure. Nothing is sent or stored. The CTA leads to the existing contact flow.

The thread is not rendered with reduced motion or with motion toggled off. It uses fewer nodes on phones, adds cursor links only on fine pointers, and pauses in hidden tabs.

## Neural sphere (`src/components/three/NeuralSphereScene.tsx`)

The R3F scene is lazy-loaded behind `ClientOnly`, and only once the section is in view. It contains:

- Shader points.
- Additive synapse lines.
- Impulses that cascade along the adjacency.
- A core sprite.

Its rotation follows scroll plus time, and it leans toward the pointer. Its graph comes from `sphereGraph()` in `src/lib/neural-sphere.ts`, which is deterministic. The SSR/no-WebGL fallback is an SVG of the same graph.

## Motion layer

The motion layer covers these elements:

- `src/components/effects/`: CursorGlow, synapse dividers with pulses, marquee, CSS `@property` counters, word reveals, ink fills, node-line service icons and the `NeuralMesh` canvas in the final CTA.
- `src/hooks/use-pointer-effects.ts`: magnetic buttons, spotlight cards and project-cover parallax/constellations.

Rules:

- Reveals use CSS view timelines only, never JS class toggling.
- Pointer effects only write CSS custom properties from rAF.
- Everything is disabled on coarse pointers, under `prefers-reduced-motion`, and with the motion toggle off.
