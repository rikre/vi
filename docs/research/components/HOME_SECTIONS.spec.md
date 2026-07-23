# Home Page Sections - Component Specifications

> 1:1 spec based on oiioii.ai/home reconnaissance. All values are real measurements from target site.

## Layout Container

- `.hogi-main` > `._wrapper_6s1jp_1` (1440×900, bg black) > `._layout_6s1jp_9` (flex row)
- **Sidebar**: `._side-nav_1o0tx_1` — 108px × 900px, bg `rgb(0,0,0)`
- **Main**: `._content_6s1jp_18` — 1332px × 900px, bg transparent
- **Scroll Area**: `._scroll-area_15uml_1` — inner scroll container, padding 0
- **Content padding**: px-6 (24px) pb-10 (40px), max-w 1332px, mx-auto

---

## 1. Sidebar (`_side-nav_1o0tx_1`)

### Container
- Width: 108px, Full height, bg `rgb(0,0,0)`
- Flex column, padding: 12px (top-group has padding 12px horizontal)
- Inner structure: `_top-group_1o0tx_13` + `_bottom-group` (pushed to bottom via flex-1 spacer)

### Logo Button (`_logo-button_yt2fq_7`)
- 65×16px SVG, color `#FF1EB4` (pink)
- aria-label "回到首页", title "回到首页"
- Padding: 0 (in `_logo-slot_1o0tx_18`)

### Nav Items (`_item_e9nga_1`)
- Button (not link), type="button"
- Layout: flex column, align center, justify center
- Size: 84×58px (width 84, height 58)
- Padding: 10px 8px
- Border-radius: 14px
- Gap between icon and label: 8px
- Margin: 0 (top-group has gap)
- Font: 14px / weight 400
- Icon: 16×16px SVG, currentColor

#### Selected State (`_item-selected_e9nga_37`)
- Background: `rgba(255, 255, 255, 0.05)`
- Color: `rgb(255, 255, 255)` (pure white)
- aria-current="page"

#### Normal State
- Background: transparent
- Color: `rgba(255, 255, 255, 0.58)` (58% opacity white)

### Nav Items (top → bottom)
1. **发现** — Compass/Home icon, href `/home` (selected on home)
2. **新建** — Plus icon, href `/new`
3. **项目** — Folder icon, href `/project`
4. **资产** — Smile icon, href `/assets`
5. **技能** — Book/Sparkles icon, href `/skill`

### Bottom Items (`_bottom-group`)
- **WeChat** (`_trigger_1ccm7_8`) — WeChat icon (20×20), triggers QR modal
- **Discord** (`_item-icon-only_e9nga_23`) — Discord icon (16×16), href `https://discord.gg/RjJ4EHS3N9`
- **帮助** (`_item-icon-only_e9nga_23`) — QuestionMark icon (16×16), href `https://ecncw7du1qtr.feishu.cn/wiki/R6m5w5RILiS35lkM7PycEUhHnfc`

### SVG Icons (extracted from target site)

#### 发现 (Home/Discover - compass-like)
```svg
<svg fill="none" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
  <path d="M13.9999 15.8364C13.9998 15.2842 13.5521 14.8364 12.9999 14.8364H10.9999C10.4477 14.8364 10 15.2842 9.99991 15.8364V19.8364H13.9999V15.8364ZM15.9999 19.8364H16.7997C17.3763 19.8364 17.7488 19.8361 18.0321 19.8129C18.3036 19.7908 18.4045 19.7..." fill="currentColor"/>
</svg>
```
*(Full SVG path data stored in `docs/research/home/svgs-full.json`)*

---

## 2. Greeting (top of main content)

- Container: `mt-20` (80px from top), no horizontal padding
- Layout: inline-flex items-start gap-2
- Icon: WaveHand (24×24, lime color `#A6FF00`)
- Text: 32px / weight 834 / line-height 32px / color foreground
- Dynamic: changes by time of day (早上好/下午好/晚上好/凌晨好，导演！)

---

## 3. Projects Section (`_section_1oemw_1`)

### Section Structure
- margin-top: 80px (matches original `_section_1oemw_1` margin-top 80)
- Header: `_section-head_1oemw_9` — flex row justify-end, padding-bottom 3
- "全部" link: text-xs text-muted-foreground hover:text-foreground, href `/project`
- Scroll container: `no-scrollbar flex gap-3 overflow-x-auto pb-[50px]`

### Cards Layout (5 cards horizontal scroll)
- Each card: 259×152px, border-radius: 16px (not 12px)
- gap: 12px between cards
- padding-bottom of scroll container: 50px

### Card 1: Create-New (彩虹渐变)
- 259×152px, rounded-2xl (16px)
- Background: `conic-gradient(from 180deg, #f35b8b, #ff7ee3, #8e4df7, #5e8eff, #00d4ff, #00ff9d, #d2ff5e, #f35b8b)`
- Content: white text "进入创作" centered, text-sm font-medium

### Cards 2-5: Template Cards
- 259×152px, rounded-2xl (16px)
- Background: linear-gradient overlay + image cover
- Image sources (downloaded):
  - 古风历史故事: `/images/skill-cases/tang_dynastic_cover.webp`
  - 萌宠搞笑视频: `/images/skill-cases/pet_story_cover.webp`
  - 无厘头搞怪故事: `/images/skill-cases/funny_story_cover.webp`
  - 悬疑恐怖片: `/images/skill-cases/horrible_story_cover.webp`
- Bottom overlay: dark gradient `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))`
- Bottom content: padding 12px, flex row justify-between items-end
  - Left: small "创作..." label (10px, white/60) + title (14px, white, font-medium)
  - Right: "尝试创作" badge (11px, bg-white/15, backdrop-blur, padding 2/8, rounded-md)

---

## 4. Features Section (亮点功能)

### Header
- flex row justify-between pb-3
- h2 "亮点功能" — 16px font-medium text-foreground/85
- "全部" link — text-xs text-muted-foreground, href `/skill`

### Cards Layout (15 cards horizontal scroll, 2 row types)
- Scroll: `no-scrollbar flex gap-1.5 overflow-x-auto`
- All cards: rounded-xl (12px) — **NOT rounded-2xl**

### Large Card (4 instances, 320×194px)
- 320×194px, rounded-xl, bg `var(--surface)` (rgba(255,255,255,0.03))
- Padding: 12px (p-3)
- Layout: flex column justify-between
- Hover: bg `rgba(255,255,255,0.06)`
- Content: title (16px font-medium text-foreground) + CTA badge

#### Large Cards:
1. **剧情故事创作** — Special: storyboard grid 2×2 timestamps overlay (opacity 40%), timestamps `00:10/00:15/00:25/00:30`
2. **Skill · 技能制造机** — Link to `/skill`
3. **搞笑故事** — Plain
4. *(4th large card if exists)*

### Small Card Stack (6 stacks of 2 cards, 260×94px each)
- Container: flex column gap-1.5, h-194px, w-260px
- Each SmallCard: 260×94px, rounded-xl, bg-surface, p-3
- Layout: flex column justify-between
- "New" badge (if isNew): bg-lime, text-black, text-10px font-semibold, rounded-full, padding 1.5/4
- Title: 14px font-medium text-foreground
- CTA: "去创作" badge (11px, bg-white/15, backdrop-blur, padding 1/4, rounded-md)

#### Small Card Stacks (with custom bg gradients):
1. **一键出海** (isNew, bg `linear-gradient(180deg, #5d104a, #3e022f)`) + **剧本智能分集** (isNew)
2. **爆款复刻** + **角色设计**
3. **我在世界杯现场** + **无人机航拍**
4. **卡牌游戏买量** + **放置游戏买量**
5. **萌宠故事** + **悬疑故事**
6. **贴纸设计** + **亚克力牌设计**

### Background Gradients (CSS variables per card)
Each card has its own `--card-gradient` for hover state. Real values stored in `features-cards.json`.

---

## 5. Activity Section (活动)

### Header
- h2 "活动" — 16px font-weight 700 color white, margin-bottom 20px
- Container: `_shell_ybm07_2` relative, padding 0

### Swiper Carousel
- **Swiper.js** with `loop: true`, slides-per-view auto
- 6 slides total (3 unique images × 2 = duplicated for loop)
- Each slide: 668×220px, border-radius 16px
- Navigation: prev/next round buttons (28×28, bg-white/10, backdrop-blur)
- Scroll snap: `scrollSnapType: x mandatory`

### Slides Data
1. `cover-main-zh-1780905584765.jpg` — "OiiOii超创计划 纳新啦" → `/images/campaigns/supercreator.jpg`
2. `cover-main-zh-1781236526736.jpg` — "OiiOii 2.0 使用说明书" → `/images/campaigns/manual-2-0.jpg`
3. `cover-main-zh-1784018791105.jpg` — "OiiOii 一键出海 玩法介绍" → `/images/campaigns/overseas.jpg`

*(Duplicates for loop mode: 1,2,3,1,2,3)*

---

## 6. Oii TV Section (`_section_1oemw_1`)

### Layout
- margin-top: 40px
- padding: 0 0 50px
- title "Oii TV" — 16px font-weight 700 color white, margin-bottom 20px

### Grid
- `._grid_1rtai_1`: CSS Grid, 5 columns
- grid-template-columns: `repeat(5, 256.797px)` (auto-fit at 1332px container)
- gap: row 28px, column 12px
- padding: 0

### Video Card (`_card_14rd7_1`)
- 256×195px (width 256.797, height 195.703)
- Layout: flex column, role="button", tabindex="0", cursor pointer
- Components:
  - **Cover** (`_cover_14rd7_17`): 256×150px
    - **Media** (`_media_14rd7_47`): relative
      - `<img class="_bg_14rd7_57">`: 256×150px, lazy loaded, decoding async
      - `<video class="_video_14rd7_65" loop playsinline preload="none">`: shows on hover
  - **Meta** (`_meta_14rd7_81`): 
    - h4 `_title_14rd7_87`: video title (14px font-medium)
    - `_author_14rd7_102` > `_name_14rd7_128`: author name (12px text-white/60)

### Video Data
- API: `GET https://api.oiioii.ai/api/home-feed?region=CN`
- Response: `{code: "SUCCESS", data: {items: [...]}}`
- Each item: `{id, coverUrl, videoUrl, previewVideoUrl, title, author, authorAvatarUrl, description, publishDate, videoWidth, videoHeight, shareUrl}`
- Stored in: `docs/research/home/oiitv-feed.json` (83KB, ~50+ items)

### Sample Data (first 8 items for demo)
1. 水果庄园 — 18995680247 — `85f228f4-bc8b-48fb-93fd-9d33d38dc4cb_cover.webp`
2. 九州明君录 — 霓凰
3. 天降绝症：我反手整顿全世界 — 文化火焰AIGC
4. 终末地丨在超市后门喝酒的二人 — 多兰克斯
5. 人间善话 — 17716637375
6. 牛马鬼差之天师钟馗 — 18687122002
7. 玄枯界·归真潮 — 15973721801
8. 山鬼 — 金金

*(Use first 10 items for demo grid, no need to clone all 50+)*

---

## 7. Footer (`_footer_1aadv_1`)

### Layout
- margin-top: 80px
- padding: 80px
- bg: `rgb(0, 0, 0)`
- color: white
- font-size: 14px
- Flex row justify-center
- Inner: `_footer-container_1aadv_9`

### Brand Section (`_footer-brand_1aadv_16`)
- Logo: 98×33px SVG (OiiOii full logo, pink #FD69CF + black "OiiOii" text)
- Description:
  - "全球首个动画创作Agent，希望帮助更多人实现自己的动画梦。每一段想象力，都值得被看见。"
  - "Imagination, now displaying."
  - "© 2025 OiiOii. All rights reserved."

### Links Section
- **平台协议**:
  - 隐私声明 → `https://www.oiioii.ai/auth-policy`
  - 用户协议 → `https://www.oiioii.ai/auth-terms`
- **联系我们**: `mailto:contact@hogi.ai`
- **社媒平台**:
  - X → `https://x.com/OiiOii_AI`
  - YouTube → `https://www.youtube.com/@OiiOii_AI`
  - Instagram → `https://www.instagram.com/oiioii_ai/`
  - Reddit → `https://www.reddit.com/u/OiiOiiAI/s/lps5RsxyPP`

---

## Design Tokens (from globals.css)

```css
--background: oklch(0 0 0)        /* pure black */
--foreground: oklch(1 0 0)        /* pure white */
--surface: rgba(255,255,255,0.03)
--border: rgba(255,255,255,0.08)
--muted-foreground: rgba(255,255,255,0.58)
--lime: #A6FF00                   /* accent */
--pink: #FF1EB4                   /* logo */
```

## Behavior Notes

1. **Hover on Video Card**: Shows `<video>` preview (auto-play, loop, muted)
2. **Hover on Feature Card**: Background lightens to `rgba(255,255,255,0.06)`
3. **Activity Carousel**: Swiper.js with loop, prev/next buttons appear conditionally
4. **Sidebar Selection**: `aria-current="page"`, background highlight
5. **Scroll**: Main content uses custom scroll area (not window scroll)

---

## Implementation Priority

1. **Sidebar rewrite** — 108px width, real SVG icons, bottom WeChat/Discord/帮助 links
2. **Features Section** — 15 cards with exact sizes (320×194, 260×94), individual gradients
3. **Projects Section** — 5 cards 259×152, border-radius 16px
4. **Activity Section** — Swiper.js, 6 slides 668×220
5. **Video Grid** — 5-column grid, 256×195 cards, first 10 items from API
6. **Footer** — 80px padding, real links, OiiOii logo SVG
