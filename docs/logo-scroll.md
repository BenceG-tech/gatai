# GátAi studio — identity-preserving scroll

The approved chrome artwork is the single source for the header, footer, static fallback and animated surface. `public/brand/gatai-approved.svg` embeds that WebP; it is not a native vector. `src/lib/approved-logo-texture.ts` contains the same WebP bytes as a direct texture URL because nested SVG images were blank when uploaded to WebGL on the tested browser.

The live scene subdivides that artwork into textured triangular faces. It does not replace the logo with the earlier hand-drawn geometry. This is a textured surface moving in 3D with reflective solid nodes and facets, not a fully extruded model of the letters.

The GÁT and acute accent open into a restrained network of chrome facets, local connecting lines and reflective nodes. A diagonal split through the negative space between the T arm and the blue A keeps the entire T moving while both AI letters and STUDIO stay legible. The fixed camera does not zoom or recenter AI. Every face returns to its exact opening position. No video, video player or generated-video asset is used.

Five chapter anchors drive `chapterProgress` over a 340svh pinned stage. `logoStory` is deterministic and reversible; wheel motion is damped briefly. Rendering runs on demand and stops after settling, offscreen or in a hidden document. Reduced-motion, the visitor's motion toggle and WebGL failures display the complete approved logo.

Validation on 2026-10-17: TypeScript, focused ESLint, production client/server build and all 16 Vitest tests passed. Browser inspection covers desktop and 390px opening, disassembly, return and backward scroll. The existing Three.js lazy chunk triggers a bundle-size advisory. No new Higgsfield generation or credits were used.
