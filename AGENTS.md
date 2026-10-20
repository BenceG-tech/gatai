<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Portfolio content lives in `src/content/projects.ts` and site copy in `src/content/site.ts` — a typed data file is the CMS until an admin is added.
- The home hero is one pinned scroll-scrubbed 2D canvas (`NeuralHero` + `neural-logo-engine`, a port of the approved neural.js) that renders the static vector logo on the server, for reduced motion and when motion is toggled off; three.js is used only by the lazy `NeuralSphereScene` behind ClientOnly — keeps three.js out of SSR. See `docs/neural-logo.md`.
- Home sections join the continuous neural thread with `data-formation="…"` (see `src/lib/neural-thread.ts`), never by reading scroll position — the section in the middle of the viewport picks the shape.
- Scroll reveals use CSS `animation-timeline: view()`, never JS class toggling — JS mutation before hydration causes mismatches.
- Home 3D story is driven by `data-chapter="0..4"` section anchors mapped through `src/lib/chapters.ts`, never by global scroll ratio — keeps 3D beats aligned with content at every viewport size.
- Lead requests are saved only through the `submitLead` server function (Zod-validated, honeypot, per-email rate limit) into an RLS-locked table with no anon/auth policies — the browser never gets write access.
