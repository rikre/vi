// Run via: agent-browser eval "$(cat scripts/extract-svgs.mjs)" > docs/research/home/svgs.json
(() => {
  const svgs = [...document.querySelectorAll("svg")].map((svg, i) => {
    const parent = svg.parentElement;
    const parentTag = parent?.tagName?.toLowerCase();
    const parentCls = parent?.className?.toString?.()?.split(" ").filter(Boolean).slice(0, 3).join(".") || "";

    // Get viewBox, width, height
    const viewBox = svg.getAttribute("viewBox") || svg.getAttribute("viewbox") || "";
    const w = svg.getAttribute("width") || "";
    const h = svg.getAttribute("height") || "";
    const fill = svg.getAttribute("fill") || "";

    // Clone & inline computed styles for gradients
    const clone = svg.cloneNode(true);
    // Strip class names — keep attributes
    clone.removeAttribute("class");

    // Get gradient defs
    const defs = [...clone.querySelectorAll("defs linearGradient, defs radialGradient")].map((g) => {
      const id = g.getAttribute("id") || "";
      const stops = [...g.querySelectorAll("stop")].map((s) => ({
        offset: s.getAttribute("offset"),
        stopColor: s.getAttribute("stop-color") || s.getAttribute("stopColor"),
        stopOpacity: s.getAttribute("stop-opacity") || s.getAttribute("stopOpacity"),
      }));
      return { id, type: g.tagName, stops };
    });

    // Get path/shape elements with their fill (might reference gradient id)
    const paths = [...clone.querySelectorAll("path, circle, rect, polygon, ellipse, line")].map((p) => ({
      tag: p.tagName,
      d: p.getAttribute("d") || undefined,
      fill: p.getAttribute("fill") || undefined,
      stroke: p.getAttribute("stroke") || undefined,
      cx: p.getAttribute("cx") || undefined,
      cy: p.getAttribute("cy") || undefined,
      r: p.getAttribute("r") || undefined,
      x: p.getAttribute("x") || undefined,
      y: p.getAttribute("y") || undefined,
      width: p.getAttribute("width") || undefined,
      height: p.getAttribute("height") || undefined,
      points: p.getAttribute("points") || undefined,
    }));

    // OuterHTML of clone (cleaned)
    const html = clone.outerHTML.length > 2000 ? clone.outerHTML.slice(0, 2000) + "..." : clone.outerHTML;

    return {
      idx: i,
      viewBox,
      w,
      h,
      fill,
      parentTag,
      parentCls,
      defs,
      paths,
      html,
    };
  });

  return JSON.stringify({
    url: location.href,
    count: svgs.length,
    svgs,
  }, null, 2);
})()
