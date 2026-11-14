<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend Craftsmanship Rules (AM Group Jammu)
- **Skill Reference**: `.agents/skills/frontend-craftsmanship/SKILL.md`
- **Banned**: Dark mode + gold templates, kickers above headings, card-in-card nesting, hover image scaling, hairline codex grids, decorative pulsing dots, `lucide-react` imports.
- **Mandated (since 2026-11-14, owner's instruction: "use the bluish colour, not with dark / black, glassmorphism on top")**: The token set in `DESIGN.md` §Blue and light / `app/globals.css` — light blue-tinted grounds (`#FFFFFF`, `#F3F7FA`, `#E4EEF5`), **no graphite or black ground anywhere**: the `deep` tokens are now the blue itself (`#146287`, `#0F4E6D`) and carry white text. Ink is a blue-black `#0D2433` (text only, never a ground). On a blue ground the loud control is white (`accent-bright` = `#FFFFFF`, label `#0F4E6D`). Minimum 11px font floor, minimum 14px body floor, WCAG 4.5:1 contrast on all text, and 0 TypeScript compilation errors.
- **Do not write `bg-ink`, `bg-black` or a dark scrim.** A coloured ground is `bg-deep` / `bg-deep-2` (blue).
- **Radius**: `0` for bands and dividers, `8px` controls, `14px` surfaces, `18px` overlays. Do not write a literal radius.
- **Glass is LIGHT.** `.glass` / `.glass-bar` / `.panel` are white frosted panels (80% white + blur) and re-point the `on-deep` / `accent-bright` tokens to their light-ground partners for everything inside them, so content written for a blue ground stays legible in a panel without edits. `.glass-blue` is the header (the logo is white artwork). `.photo-scrim` is a blue wash. Glass goes over a photograph under the blue wash or over `.sky-ground`; keep the `@supports` and `prefers-reduced-transparency` fallbacks; glass inside glass renders as a plain bordered surface.
- **Illustrations**: the site's own spot illustrations live in `components/system/illustrations.tsx` (flat blue shapes, 2.5px rounded ink outline, objects only, no characters, four CSS variables for colour). Add to that set in the same grammar; do not import an illustration or icon library, and do not copy another site's artwork.
- **Three palettes were rejected before this one; do not propose them again.** `#F8FAFC`/`#0F172A`/`#2563EB` (this file's original mandate), navy `#133A63` + scarlet `#C13A2A`, and off-white + forest `#1B3A32` + brass `#B08442`. The first two are exactly what a design catalogue returns for "automotive dealership" and "luxury brand", which is why they read as generic. The catalogue is not the authority on this project.

