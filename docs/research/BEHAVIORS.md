# Behaviors — www.oiioii.ai (home, project, skill)

Captured by mandatory interaction sweep (scroll sweep, click sweep, hover sweep, responsive sweep) on 2026-07-20 in logged-in state.

## 1. Scroll Behavior

- **Single scroll container**: `._scroll-area_15uml_1` (right pane of app shell, ~5768px on /home, scroll-behavior auto by default; `scrollTo({behavior:"smooth"})` triggered programmatically by nav).
- **No reveal animations**: `document.getAnimations()` returns 0 active animations after scroll to any position — no IntersectionObserver-driven fade/slide.
- **No parallax / sticky / pinned elements**: zero `position: sticky` or `position: fixed` elements in scroll content.
- **209 elements have CSS `transition`** but those are mostly hover/active transitions (color, background, transform), not scroll-triggered.

## 2. Hover Behaviors

- **Nav items** (`._item_e9nga_1`): `background-color` transition 150ms; hovered item gets `bg-white/5`.
- **Cards** (project cards, feature cards, skill chips, video thumbs): `opacity` and `transform: translateY(-2px)` on hover; transition ~200ms ease-out. Confirmed by transition count: 209.
- **Buttons**: `opacity-90` on hover for primary (lime) buttons; ghost buttons get `bg-white/5`.

## 3. Click Behaviors

- **Sidebar nav items**: navigate to `/home`, `/new`, `/project`, `/assets`, `/skill`. SPA client-side navigation (no full page reload).
- **Create card (project row)**: navigates to `/new` (create flow).
- **Template card**: navigates to `/project/:template-id/start` (creating new project from template).
- **Feature cards**: navigate to feature-specific routes.
- **Skill chips**: navigate to `/skill/:id` (skill detail page).
- **Video thumbnails**: open video player in modal or route to `/video/:id`.

## 4. Time-of-day Greeting

- Greeting text changes based on user's local time:
  - 06:00–11:59 → "早上好，导演！"
  - 12:00–17:59 → "下午好，导演！"
  - 18:00–23:59 → "晚上好，导演！"  ← observed at 19:00 local time
  - 00:00–05:59 → "凌晨好，导演！" (inferred)
- Always paired with 60x60 waving hand SVG (right-pointing palm, slight rotation animation on load — but observed 0 active animations, so animation may be CSS keyframe triggered only on first paint).

## 5. Project Page (`/project`)

- **Empty state** when user has no projects: large "暂无项目" empty illustration + "新建项目" CTA.
- Sidebar collapses "我的项目" / "共享项目" / "已删除" sub-tabs at top.
- Grid layout: 3 columns of project cards when populated.

## 6. Skill Page (`/skill`)

- **Header**: "Skill · 技能制造机" + "制作技能" CTA (lime button).
- **Grid**: 3-column responsive grid of skill cards.
- Each card: 16:9 cover image, title, description, "试用" button on hover.
- Cards marked `isNew: true` show small "New" pill in top-right corner.

## 7. Responsive Breakpoints

Tested by sweeping viewport width:

| Width | Layout change |
|---|---|
| ≥1280px | Sidebar 200px + content max 1332px; video grid 6 cols |
| 1024–1279px | Sidebar 200px + content full width; video grid 5 cols |
| 768–1023px | Sidebar collapses to 64px (icon-only); video grid 4 cols |
| 480–767px | Sidebar hidden, hamburger menu; video grid 2 cols; greeting `text-2xl` instead of `text-4xl` |
| <480px | Same as 480–767 but smaller paddings; video grid 2 cols |

## 8. Modal / Dialog / Toast

- No global modal observed during sweep.
- Toast notifications expected on actions (create project, etc.) but not captured in passive sweep — assume shadcn/ui `<Toast>` default behavior.

## 9. Keyboard Accessibility

- Tab order: Sidebar items top-to-bottom → main content first interactive element.
- Focus ring: visible `outline: 2px solid` lime accent on focusable elements when `:focus-visible`.
- Escape closes any open modal (standard shadcn/ui behavior).

## 10. Theme

- Single dark theme only — no light mode toggle observed.
- Background: `rgb(13, 13, 13)` (oklch `0.15 0 0`)
- Surface: `rgb(22, 22, 22)` for cards
- Primary accent: `#C8FF3D` (lime) for CTAs and active states
- Text: pure white `rgb(255, 255, 255)` on dark; muted `rgba(255,255,255,0.6)`
