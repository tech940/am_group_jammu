<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend Craftsmanship Rules (AM Group Jammu)
- **Skill Reference**: `.agents/skills/frontend-craftsmanship/SKILL.md`
- **Banned**: Dark mode + gold templates, kickers above headings, card-in-card nesting, hover image scaling, hairline codex grids, decorative pulsing dots, `lucide-react` imports.
- **Mandated**: The token set in `DESIGN.md` / `app/globals.css` — near-neutral light grounds (`#FFFFFF`, `#F6F7F8`, `#E9ECEF`) over cool graphite darks (`#14181E`, `#0C0E12`), ink `#12151A`, one ice-blue accent anchored at two ends (`#146287` on light grounds, `#8FC7E8` on dark). Minimum 11px font floor, minimum 14px body floor, WCAG 4.5:1 contrast on all text, and 0 TypeScript compilation errors.
- **Radius**: `0` for bands and dividers, `6px` controls, `10px` surfaces, `12px` overlays. The old hard-edged `0 / 2 / 4` scale is gone; do not write a literal radius.
- **Glass is allowed, conditionally.** `.glass` / `.glass-bar` / `.panel` / `.photo-scrim` in `app/globals.css`. Only over photography, only with the dark-tint + `@supports` fallback + `prefers-reduced-transparency` + area-budget rules in DESIGN.md §Glass. Blur on a flat ground is a bordered grey box, not glass.
- **Three palettes were rejected before this one; do not propose them again.** `#F8FAFC`/`#0F172A`/`#2563EB` (this file's original mandate), navy `#133A63` + scarlet `#C13A2A`, and off-white + forest `#1B3A32` + brass `#B08442`. The first two are exactly what a design catalogue returns for "automotive dealership" and "luxury brand", which is why they read as generic. The catalogue is not the authority on this project.

