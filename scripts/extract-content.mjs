// Run via: agent-browser eval "$(cat scripts/extract-content.mjs)" > docs/research/home/content.json
(() => {
  // Get the main scrollable container structure
  const extractSection = (el, depth = 0) => {
    if (depth > 6) return null;
    const tag = el.tagName.toLowerCase();
    const cls = el.className?.toString().split(" ").filter(Boolean).slice(0, 3).join(".");
    const role = el.getAttribute("role") || "";
    const ariaLabel = el.getAttribute("aria-label") || "";

    // Direct text (not from children)
    const directText = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .filter(Boolean)
      .join(" ");

    // Images & backgrounds
    const imgs = [...el.querySelectorAll(":scope > img, :scope > picture img")].map((i) => ({
      src: i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight,
    }));

    const bg = getComputedStyle(el).backgroundImage;
    const bgUrl = bg && bg !== "none" ? (bg.match(/url\(["']?(https?:[^)"']+)/)?.[1] || "") : "";

    const style = {
      display: getComputedStyle(el).display,
      position: getComputedStyle(el).position,
      padding: getComputedStyle(el).padding,
      margin: getComputedStyle(el).margin,
      borderRadius: getComputedStyle(el).borderRadius,
      bg: bgUrl ? bgUrl : undefined,
      bgColor: getComputedStyle(el).backgroundColor,
    };

    const children = [...el.children]
      .map((c) => extractSection(c, depth + 1))
      .filter(Boolean);

    return {
      tag,
      cls,
      role,
      ariaLabel,
      text: directText || undefined,
      imgs: imgs.length ? imgs : undefined,
      style: depth < 4 ? style : undefined,
      children: children.length ? children : undefined,
    };
  };

  // Try common root containers
  const root = document.querySelector("#root, #__next, body > div, main");
  const startEl = root || document.body;

  // Also extract header/nav separately
  const header = document.querySelector("header, [class*='header'], [class*='topbar'], [class*='top-bar'], [class*='navbar']");
  const aside = document.querySelector("aside, [class*='sidebar'], nav[class*='side']");

  // Collect all visible text content with hierarchy
  const walkText = (el, depth = 0, path = "") => {
    const out = [];
    const tag = el.tagName?.toLowerCase();
    if (!tag) return out;
    const cls = el.className?.toString?.()?.split(" ").filter(Boolean).slice(0, 2).join(".") || "";
    const id = `${tag}${cls ? "." + cls : ""}`;
    const curPath = `${path}/${id}`;

    const directText = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .filter(Boolean)
      .join(" ");

    if (directText && directText.length > 0) {
      out.push({ path: curPath, text: directText, depth });
    }

    // Inputs & buttons
    if (tag === "input" || tag === "textarea") {
      const placeholder = el.placeholder;
      const value = el.value;
      const type = el.type;
      if (placeholder) out.push({ path: curPath, text: `[input:${type}]${placeholder}`, depth });
    }
    if (tag === "button" || el.getAttribute("role") === "button") {
      const btnText = el.textContent?.trim();
      if (btnText) out.push({ path: curPath, text: `[button]${btnText}`, depth });
    }

    for (const child of el.children) {
      out.push(...walkText(child, depth + 1, curPath));
    }
    return out;
  };

  const textContent = walkText(startEl);

  return JSON.stringify({
    url: location.href,
    title: document.title,
    pageWidth: document.documentElement.scrollWidth,
    pageHeight: document.documentElement.scrollHeight,
    rootTag: startEl.tagName,
    rootClass: startEl.className?.toString?.()?.split(" ").slice(0, 5).join("."),
    hasHeader: !!header,
    headerTag: header?.tagName,
    headerClass: header?.className?.toString?.()?.split(" ").slice(0, 5).join("."),
    hasSidebar: !!aside,
    asideTag: aside?.tagName,
    asideClass: aside?.className?.toString?.()?.split(" ").slice(0, 5).join("."),
    textContent,
    bodyText: document.body.innerText.slice(0, 8000),
  }, null, 2);
})()
