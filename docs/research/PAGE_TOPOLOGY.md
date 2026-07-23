# Home Page Topology — www.oiioii.ai/home

## Overall Layout

- **Viewport**: 1440x900 (desktop), 390x844 (mobile)
- **App shell**: Fixed-height flex layout — 200px sidebar (`._sidebar_*`) on left + main content area on right
- **Scroll model**: Page itself does NOT scroll (`body overflow: visible`, `scrollHeight === clientHeight === 900`). A single inner div `._scroll-area_15uml_1` is the scroll container — 5768px tall, `overflow-y: auto`, native scroll (no Lenis/Locomotive).
- **Smooth scroll**: Native `scroll-behavior: smooth` supported but not globally set; smooth scroll only triggered when script calls `scrollTo({behavior: "smooth"})`.
- **No fixed/sticky elements**: Header does not transform on scroll; no scroll-driven nav changes.
- **Background**: `rgb(13, 13, 13)` near-black on body; sidebar slightly different surface color.
- **Max content width**: 1332px (centered within main content area; left/right padding inside `._scroll-area_15uml_1`).

## Section Order (top → bottom, inside `._scroll-area_15uml_1`)

| # | Class | Size (WxH) | Name | Interaction |
|---|---|---|---|---|
| 1 | `._greeting_15uml_24` → `._greeting_9dh32_1` | 292x62 (text only) | Greeting | Static — time-of-day based salutation "晚上好，导演！" + 60x60 waving hand SVG |
| 2 | `._projects_15uml_37` | 1332x186 | Projects carousel | Horizontal scroll-snap row of template cards + "进入创作" create card |
| 3 | `._features_15uml_48` | 1332x230 | Features section | Horizontal row: 1 large feature card + 4 compact cards stacked |
| 4 | `._section_1iuz1_1` | 1332x256 | Skill section ("Skill·技能制造机") | Horizontal scroll row of 9 skill chips |
| 5 | `._section_1oemw_1` | 1332x4411 | Activities + Video grid | Section header "活动" + 4 activity cards horizontal + ~24 video thumbnails in 6-col grid below. **Tall because video grid is large.** |

## Sidebar (`._sidebar_*`)

- Width: 200px, full height (900px)
- Sections: Logo (top, 56px tall) → 5 nav items (`button._item_e9nga_1`):
  - `发现` (Discover) → /home
  - `新建` (New) → /new
  - `项目` (Projects) → /project
  - `资产` (Assets) → /assets
  - `技能` (Skill) → /skill
- Active state: `bg-white/10 text-foreground`; inactive: `text-muted-foreground hover:bg-white/5`
- 9px gap between items, 36px height each

## Inter-section Dependencies

None — each section is independent and self-contained. No section references another via IntersectionObserver or scroll position.
