// Run via: agent-browser eval "$(cat scripts/extract-assets.mjs)" > docs/research/home/key-assets.json
(() => {
  const imgs = [...document.querySelectorAll("img")]
    .map(i => ({ src: i.src, w: i.naturalWidth, h: i.naturalHeight, alt: i.alt }))
    .filter(i => i.src && i.src.startsWith("http"));

  const vids = [...document.querySelectorAll("video")]
    .map(v => ({ src: v.src || v.querySelector("source")?.src, poster: v.poster, autoplay: v.autoplay, loop: v.loop, muted: v.muted }))
    .filter(v => v.src || v.poster);

  const bgs = [];
  for (const el of document.querySelectorAll("*")) {
    const bg = getComputedStyle(el).backgroundImage;
    if (bg && bg !== "none" && bg.includes("http")) {
      const urls = bg.matchAll(/url\(["']?(https?:[^)"']+)/g);
      for (const m of urls) bgs.push({ url: m[1], tag: el.tagName, cls: el.className?.toString().split(" ").slice(0, 2).join(".") });
    }
    if (bgs.length > 50) break;
  }

  const fonts = [...new Set([...document.querySelectorAll("*")].slice(0, 500).map(el => getComputedStyle(el).fontFamily))];

  const favs = [...document.querySelectorAll("link[rel*='icon']")].map(l => ({ href: l.href, rel: l.rel, type: l.type, sizes: l.sizes?.toString() }));

  const metas = [...document.querySelectorAll("meta")]
    .filter(m => (m.name || m.property) && m.content)
    .slice(0, 30)
    .map(m => ({ k: m.name || m.property, v: m.content }));

  const css = [...document.styleSheets].map(s => s.href).filter(Boolean);

  // Color palette - sample computed colors from various elements
  const colorSet = new Set();
  for (const el of document.querySelectorAll("body, body *, h1, h2, h3, button, a, [class*='bg-'], [class*='text-']")) {
    const cs = getComputedStyle(el);
    ["color", "backgroundColor", "borderColor"].forEach(p => {
      const v = cs[p];
      if (v && v !== "rgb(0, 0, 0)" && v !== "rgba(0, 0, 0, 0)" && v !== "transparent") colorSet.add(`${p}:${v}`);
    });
    if (colorSet.size > 100) break;
  }

  // Body root font / background
  const bodyStyle = {
    fontFamily: getComputedStyle(document.body).fontFamily,
    fontSize: getComputedStyle(document.body).fontSize,
    color: getComputedStyle(document.body).color,
    backgroundColor: getComputedStyle(document.body).backgroundColor,
  };

  // CSS variables from :root
  const rootVars = {};
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules || []) {
        if (rule.selectorText === ":root" || rule.selectorText === "html") {
          for (let i = 0; i < rule.style.length; i++) {
            const prop = rule.style[i];
            rootVars[prop] = rule.style.getPropertyValue(prop);
          }
        }
      }
    } catch (e) { /* CORS */ }
  }

  return JSON.stringify({
    url: location.href,
    title: document.title,
    bodyStyle,
    fonts,
    favicons: favs,
    metas,
    cssLinks: css,
    images: imgs,
    videos: vids,
    bgImages: bgs,
    colorSamples: [...colorSet].slice(0, 50),
    rootVars,
    svgCount: document.querySelectorAll("svg").length,
  }, null, 2);
})()
