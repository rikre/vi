# OiiOii.ai Design Tokens

Extracted from https://www.oiioii.ai/home (logged-in state)

## Brand

- **Name**: OiiOii.ai (为你而生的 AI 动画 Agent 团队)
- **Tagline**: 想象，正在上映
- **Description**: OiiOii.ai 是一个 AI 动画 agent 团队，帮你把灵感变成角色、场景、分镜和短片。
- **App Version**: 2.1.0 (build 5374e40-202607201713)
- **Theme**: Dark (color-scheme: dark light)
- **Theme color**: `#0a0a0b`

## Typography

- **Font stack (body)**: `MiSansVF, "Google Sans Flex", system-ui, sans-serif`
- **Font stack (alt)**: `"Google Sans Flex", MiSansVF, system-ui, sans-serif`
- **Base font size**: 14px
- **Body color**: `rgb(255, 255, 255)` (white)
- **Body background**: `rgb(13, 13, 13)` (near-black)

## Color Palette

### Backgrounds (dark theme)
| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `rgb(13, 13, 13)` / `#0d0d0d` | Page background |
| `--bg-elevated` | `rgb(26, 26, 26)` / `#1a1a1a` | Elevated surfaces |
| `--bg-card-5` | `rgba(255, 255, 255, 0.05)` | Card background (subtle) |
| `--bg-card-8` | `rgba(255, 255, 255, 0.08)` | Card background (default) |
| `--bg-card-12` | `rgba(255, 255, 255, 0.12)` | Card background (strong) |
| `--bg-card-20` | `rgba(255, 255, 255, 0.2)` | Card background (hover) |
| `--bg-white` | `rgb(255, 255, 255)` | Inverted surfaces |

### Text
| Token | Value | Usage |
|---|---|---|
| `--text-primary` | `rgb(255, 255, 255)` | Primary text |
| `--text-85` | `color(srgb 1 1 1 / 0.85)` | Strong emphasis |
| `--text-75` | `rgba(255, 255, 255, 0.75)` | Medium emphasis |
| `--text-58` | `rgba(255, 255, 255, 0.58)` | Muted text |
| `--text-40` | `color(srgb 1 1 1 / 0.4)` | Subtle text |
| `--text-34` | `rgba(255, 255, 255, 0.34)` | Hint text |
| `--text-20` | `rgba(255, 255, 255, 0.2)` | Disabled |
| `--text-black-90` | `rgba(0, 0, 0, 0.9)` | Text on light surfaces |

### Borders
| Token | Value | Usage |
|---|---|---|
| `--border-6` | `rgba(255, 255, 255, 0.06)` | Subtle border |
| `--border-10` | `rgba(255, 255, 255, 0.1)` | Default border |
| `--border-12` | `color(srgb 1 1 1 / 0.12)` | Strong border |
| `--border-20` | `rgba(255, 255, 255, 0.2)` | Heavy border |
| `--border-34` | `rgba(255, 255, 255, 0.34)` | Emphasized border |
| `--border-58` | `rgba(255, 255, 255, 0.58)` | Strongest border |
| `--border-85` | `color(srgb 1 1 1 / 0.85)` | Maximum border |
| `--border-white` | `rgb(255, 255, 255)` | Solid white |

### Accents
| Token | Value | Usage |
|---|---|---|
| `--accent-lime` | `rgb(210, 255, 94)` / `#d2ff5e` | Primary CTA / highlight |
| `--accent-pink` | `rgb(255, 30, 180)` / `#ff1eb4` | Secondary accent |
| `--accent-cyan` | `rgb(152, 237, 255)` / `#98edff` | Tertiary accent |

## CSS Variables (from :root)

```css
:root {
  --top-banner-height: 0px;
  --ad-banner-height: 0px;
  --swiper-theme-color: #007aff;
}
```

## Meta & Favicons

- **Favicon**: https://www.oiioii.ai/favicon.ico
- **OG image**: https://static-oiioii-sg.hogiai.cn/home/share.png
- **Twitter card**: summary_large_image
- **Viewport**: width=device-width, initial-scale=1, user-scalable=no
- **color-scheme**: dark light
- **apple-mobile-web-app-capable**: yes
- **apple-mobile-web-app-status-bar-style**: black-translucent

## External CSS (target site)

- https://www.oiioii.ai/assets/index-BjufIRUU.css (main)
- https://www.oiioii.ai/assets/home-top-bar-credit-pill-SVfcBUHm.css
- https://www.oiioii.ai/assets/recent-project-card-BFnDOFJI.css
- https://www.oiioii.ai/assets/useProjectCardActions-C8p8i3YG.css
- + several index-*.css chunks
- https://accounts.google.com/gsi/style (Google Identity)

## Asset CDN

Base URL: `https://static-oiioii-sg.hogiai.cn`

### Key paths
- `/home/home-v2/` — home page assets (story-anime.webp)
- `/skill_cases/` — skill case covers (tang_dynastic, pet_story, funny_story, horrible_story)
- `/campaigns/` — event/campaign covers
- `/home/share.png` — social share image

## SVG Icons

- 42 inline SVG elements detected on home page
- Most use gradient fills (chevron_forward_gradient, gradient_arrow_right, head_square_gradient, etc.)
- Common icon: chevron forward (15x15, white→white/0.6 gradient)
- Arrow icons use brand gradients (#581146→#8c2973 purple, #084568→#306a90 blue)
