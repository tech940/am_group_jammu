---
name: frontend-craftsmanship
description: >-
  Enforces bespoke frontend design standards, visual hierarchy, layout constraints,
  anti-AI-slop design rules, and visual craftsmanship across all UI components and pages.
---

# Frontend Craftsmanship & Bespoke Design Guidelines

This skill enforces high-end, human-crafted web design standards for **AM Group Jammu** and prevents generic AI design tropes.

---

## 🚫 1. BANNED DESIGN TROPES (ANTI-AI-SLOP)

1. **No Default Dark Mode + Gold/Yellow Gradients**:
   - Never default to dark charcoal + yellow/gold accent templates.
   - Use deliberate, brand-specific color palettes: Architectural White (`#FFFFFF`), Light Slate (`#F8FAFC`), Deep Charcoal (`#0F172A`), Electric Sapphire (`#2563EB`), Emerald (`#25D366`), and Crimson (`#E11D48`).

2. **No Generic Kickers Above Headings**:
   - Do NOT place tiny tracked uppercase labels directly above headings as separate blocks.
   - Let headings carry their own visual weight.

3. **No Card-Inside-Card Nesting**:
   - Avoid wrapping cards inside other cards. Flatten container hierarchies using spacing, typography, and crisp dividers (`border-slate-200`).

4. **No Decorative Pulsing Dots**:
   - Do NOT use `animate-pulse` on tiny rounded status dots unless tied to genuinely live WebSocket data.

5. **No Hover Image Scaling**:
   - Avoid `hover:scale-105` on images. Keep imagery grounded and use clean border/color transitions instead.

6. **No Hairline Codex Grid Overlays**:
   - Do NOT draw decorative radial grid dot patterns or hairline tiled background fields.

7. **No Lucide React Imports**:
   - Never import `lucide-react` icons in homepage or core corporate layout components. Use inline vector SVGs.

---

## 📐 2. TYPOGRAPHY & LEGIBILITY RULES

- **Minimum Text Floor**: Functional interactive text (buttons, links, labels, table cells) must be at least **11px**.
- **Body Copy Floor**: Body text must be at least **14px** with leading `1.6`.
- **Line Length**: Max-width of body copy containers must be bounded between `65ch` and `75ch`.
- **Heading Rhythm**: Rendered space *above* a heading must always exceed the space *below* it.
- **Contrast**: All text must satisfy WCAG AA contrast ratio of **4.5:1** for body text and **3:1** for large display text.

---

## 🎨 3. COMPONENT ARCHITECTURE & FINISH

- All interactive buttons must have explicit `:hover`, `:focus-visible`, and active states.
- Clean Next.js Server & Client Component separation with 0 script hydration errors.
- Always verify changes with `npx tsc --noEmit` and Playwright visual screenshots.
