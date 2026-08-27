"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const COLORS = {
  wire: 0xc8ff72,
  point: 0xb8ef62,
  trailFace: "rgba(152, 199, 74,",
  trailLine: "rgba(200, 255, 114,",
  trailDot: "rgba(132, 178, 58,",
};

const DOT_SPACING = 12;
const DOT_SIZE = 2;
const DOT_ALPHA = 0.088;

const MODEL_SCALE = 3.675;

export function ParticleScene() {
  const dotGridRef = useRef<HTMLCanvasElement>(null);
  const modelCanvasRef = useRef<HTMLCanvasElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dotCanvas = dotGridRef.current;
    const modelCanvas = modelCanvasRef.current;
    const trailCanvas = trailCanvasRef.current;
    if (!dotCanvas || !modelCanvas || !trailCanvas) return;

    const dotCvs = dotCanvas;
    const modelCvs = modelCanvas;
    const trailCvs = trailCanvas;

    let destroyed = false;
    let rafId = 0;
    let W = window.innerWidth;
    let H = window.innerHeight;

    // ========== Dot Grid ==========
    const dotCtx = dotCvs.getContext("2d");
    function drawDotGrid() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      dotCvs.width = w * dpr;
      dotCvs.height = h * dpr;
      dotCvs.style.width = w + "px";
      dotCvs.style.height = h + "px";
      dotCtx!.scale(dpr, dpr);
      dotCtx!.clearRect(0, 0, w, h);
      dotCtx!.fillStyle = `rgba(200, 255, 114, ${DOT_ALPHA})`;
      for (let y = 0; y < h; y += DOT_SPACING) {
        for (let x = 0; x < w; x += DOT_SPACING) {
          dotCtx!.fillRect(x, y, DOT_SIZE, DOT_SIZE);
        }
      }
    }

    // ========== Trail Canvas Setup ==========
    const tCtx = trailCvs.getContext("2d");
    function resizeTrail() {
      W = window.innerWidth;
      H = window.innerHeight;
      trailCvs.width = W;
      trailCvs.height = H;
    }

    // ========== Three.js Setup ==========
    const renderer = new THREE.WebGLRenderer({
      canvas: modelCvs,
      alpha: true,
      antialias: true,
      stencil: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.set(0, 0.2, 6);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));

    // ========== Shaders ==========
    const lineVS = `
      uniform vec3 uLensPos; uniform float uHover; varying float vDepth; varying float vLensBoost;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0); vDepth = -mv.z;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vLensBoost = smoothstep(1.1, 0.0, length(wp.xyz - uLensPos)) * uHover;
        gl_Position = projectionMatrix * mv;
      }`;
    const lineFS = `
      uniform vec3 uColor; uniform float uOpacity; varying float vDepth; varying float vLensBoost;
      void main(){
        float a = mix(0.88, 0.08, smoothstep(2.7, 9.75, vDepth));
        vec3 col = mix(uColor, vec3(0.784, 1.0, 0.447), vLensBoost * 0.8);
        gl_FragColor = vec4(col, a * uOpacity * (1.0 + vLensBoost * 1.2));
      }`;
    const dotVS = `
      uniform float uTime; uniform vec3 uLensPos; uniform float uHover; varying float vAlpha; varying float vLensBoost;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0); float depth = -mv.z;
        float pulse = 0.85 + 0.15 * sin(uTime * 1.5 + position.x * 5.0 + position.y * 4.0);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        float lb = smoothstep(1.1, 0.0, length(wp.xyz - uLensPos)) * uHover; vLensBoost = lb;
        gl_PointSize = min(max((pulse + lb * 1.2) * 4.5 * (5.25 / max(depth, 0.1)), 1.0), 32.0);
        gl_Position = projectionMatrix * mv;
        vAlpha = pulse * mix(0.8, 0.1, smoothstep(2.7, 9.75, depth));
      }`;
    const dotFS = `
      uniform vec3 uColor; uniform float uOpacity; varying float vAlpha; varying float vLensBoost;
      void main(){
        float d = length(gl_PointCoord - vec2(0.5)); if(d > 0.5) discard;
        float core = smoothstep(0.5, 0.05, d); float glow = smoothstep(0.5, 0.0, d) * 0.25;
        float a = (core + glow) * (vAlpha + vLensBoost * 0.6) * uOpacity;
        vec3 col = mix(uColor, vec3(0.93, 1.0, 0.82), core * 0.5);
        col = mix(col, vec3(0.784, 1.0, 0.447), vLensBoost * 0.75);
        gl_FragColor = vec4(col, a);
      }`;
    const fillVS = `
      uniform vec3 uLensPos; varying vec3 vNormal; varying vec3 vViewPos; varying float vLensDist;
      void main(){
        vec3 n = normalize(normalMatrix * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = n; vViewPos = mv.xyz; vLensDist = length(wp.xyz - uLensPos) / 1.1;
        gl_Position = projectionMatrix * mv;
      }`;
    const fillFS = `
      uniform float uTime; uniform float uHover; uniform float uOpacity;
      varying vec3 vNormal; varying vec3 vViewPos; varying float vLensDist;
      void main(){
        vec3 viewDir = normalize(-vViewPos); float NdotV = abs(dot(normalize(vNormal), viewDir));
        float fresnel = pow(1.0 - NdotV, 2.2); float pulse = 0.5 + 0.5 * sin(uTime * 2.8);
        float lensGlow = smoothstep(1.0, 0.0, vLensDist) * uHover;
        float lensInner = smoothstep(0.55, 0.0, vLensDist) * uHover;
        float lensHot = smoothstep(0.22, 0.0, vLensDist) * uHover;
        vec3 baseColor = vec3(0.047, 0.075, 0.02);
        vec3 glowColor = vec3(0.784, 1.0, 0.447);
        vec3 lensColor = vec3(0.843, 1.0, 0.553);
        vec3 hotColor  = vec3(0.9, 1.0, 0.72);
        float fresnelAlpha = fresnel * (0.38 + 0.14 * pulse) * uHover;
        float lensAlpha = lensGlow * 0.20 + lensInner * 0.30 + lensHot * 0.35;
        vec3 col = mix(baseColor, glowColor, fresnel * uHover * (0.65 + 0.35 * pulse));
        col = mix(col, lensColor, lensGlow * 0.40); col = mix(col, lensColor, lensInner * 0.45);
        col = mix(col, hotColor, lensHot * 0.70);
        gl_FragColor = vec4(col, (0.10 + fresnelAlpha + lensAlpha) * uOpacity);
      }`;

    const wireColor = new THREE.Color(COLORS.wire);
    const dotColor = new THREE.Color(COLORS.point);

    function mkLineMat(op: number) {
      return new THREE.ShaderMaterial({
        vertexShader: lineVS,
        fragmentShader: lineFS,
        uniforms: {
          uColor: { value: wireColor.clone() },
          uOpacity: { value: op },
          uLensPos: { value: new THREE.Vector3(0, 9999, 0) },
          uHover: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
      });
    }
    function mkDotMat(op: number) {
      return new THREE.ShaderMaterial({
        vertexShader: dotVS,
        fragmentShader: dotFS,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: dotColor.clone() },
          uOpacity: { value: op },
          uLensPos: { value: new THREE.Vector3(0, 9999, 0) },
          uHover: { value: 0 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
    }
    function mkFillMat(op: number) {
      return new THREE.ShaderMaterial({
        vertexShader: fillVS,
        fragmentShader: fillFS,
        uniforms: {
          uTime: { value: 0 },
          uHover: { value: 0 },
          uOpacity: { value: op },
          uLensPos: { value: new THREE.Vector3(0, 9999, 0) },
        },
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: true,
        depthTest: true,
      });
    }

    function dedupePoints(posAttr: THREE.BufferAttribute, precision = 3) {
      const seen = new Set<string>();
      const out: number[] = [];
      for (let i = 0; i < posAttr.count; i++) {
        const k =
          posAttr.getX(i).toFixed(precision) +
          "," +
          posAttr.getY(i).toFixed(precision) +
          "," +
          posAttr.getZ(i).toFixed(precision);
        if (!seen.has(k)) {
          seen.add(k);
          out.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(out, 3));
      return g;
    }

    interface Form {
      lines: THREE.LineSegments;
      points: THREE.Points;
      fill: THREE.Mesh;
      lMat: THREE.ShaderMaterial;
      dMat: THREE.ShaderMaterial;
      fMat: THREE.ShaderMaterial;
      container: THREE.Group;
    }

    const forms: Form[] = [];
    const group = new THREE.Group();
    scene.add(group);

    function addForm(geo: THREE.BufferGeometry, visible: boolean) {
      const lMat = mkLineMat(visible ? 1 : 0);
      const dMat = mkDotMat(visible ? 1 : 0);
      const fMat = mkFillMat(visible ? 1 : 0);
      const edges = new THREE.EdgesGeometry(geo, 1);
      const lines = new THREE.LineSegments(edges, lMat);
      lines.renderOrder = 200;
      const ptGeo = dedupePoints(geo.attributes.position as THREE.BufferAttribute);
      const points = new THREE.Points(ptGeo, dMat);
      points.renderOrder = 300;
      if (!(geo.attributes as Record<string, unknown>).normal) geo.computeVertexNormals();
      const fill = new THREE.Mesh(geo, fMat);
      fill.renderOrder = 100;
      const container = new THREE.Group();
      container.add(lines);
      container.add(points);
      container.add(fill);
      container.visible = visible;
      group.add(container);
      forms.push({ lines, points, fill, lMat, dMat, fMat, container });
    }

    // Create multiple geometric forms for morphing
    const geometries = [
      new THREE.IcosahedronGeometry(MODEL_SCALE * 0.481, 4),
      new THREE.OctahedronGeometry(MODEL_SCALE * 0.55, 3),
      new THREE.TorusKnotGeometry(MODEL_SCALE * 0.28, MODEL_SCALE * 0.09, 128, 16),
      new THREE.DodecahedronGeometry(MODEL_SCALE * 0.5, 2),
      new THREE.IcosahedronGeometry(MODEL_SCALE * 0.52, 2),
    ];

    geometries.forEach((geo, i) => addForm(geo, i === 0));

    // ========== Floating background objects ==========
    const FLOAT_N = 18;
    const fGeos = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TetrahedronGeometry(1, 0),
    ];
    const fMatFar = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0x9cc247,
      transparent: true,
      opacity: 0.18,
    });
    const fMatMid = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0x9cc247,
      transparent: true,
      opacity: 0.12,
    });
    const floaters: THREE.Mesh[] = [];
    const DRIFT_RANGE_X = 12;

    for (let fi = 0; fi < FLOAT_N; fi++) {
      const layer = fi % 2;
      let zPos: number, yMin: number, yMax: number, xSpread: number, sc: number, mat: THREE.MeshBasicMaterial;
      if (layer === 0) {
        zPos = -4 + Math.random() * 3;
        yMin = -0.6;
        yMax = 2;
        xSpread = 8;
        sc = 0.04 + Math.random() * 0.06;
        mat = fMatFar;
      } else {
        zPos = 0.5 + Math.random() * 3;
        yMin = -0.8;
        yMax = 2.2;
        xSpread = 9;
        sc = 0.07 + Math.random() * 0.12;
        mat = fMatMid;
      }
      const side = Math.random() > 0.5 ? 1 : -1;
      const fp = {
        x: side * (2.5 + Math.random() * xSpread),
        y: yMin + Math.random() * (yMax - yMin),
        z: zPos,
        scale: sc,
      };
      const fm = new THREE.Mesh(fGeos[fi % fGeos.length], mat);
      fm.scale.set(fp.scale, fp.scale * (0.4 + Math.random() * 0.6), fp.scale);
      fm.position.set(fp.x, fp.y, fp.z);
      fm.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      );
      fm.userData = {
        baseY: fp.y,
        bobSpd: 0.15 + Math.random() * 0.35,
        bobAmp: 0.04 + Math.random() * 0.1,
        drift: (Math.random() > 0.5 ? 1 : -1) * (0.1 + Math.random() * 0.18),
        rotSpd: (Math.random() - 0.5) * 0.15,
        phase: Math.random() * Math.PI * 2,
      };
      fm.renderOrder = -1;
      scene.add(fm);
      floaters.push(fm);
    }

    // ========== 2D Trail Particles ==========
    interface TrailParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      id: number;
    }
    const trailParticles: TrailParticle[] = [];
    const maxTrailParticles = 28;
    const maxFaces = 5;
    let particleIdCounter = 0;

    function spawnTrailParticles(x: number, y: number, vx: number, vy: number) {
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed < 3) return;
      if (trailParticles.length >= maxTrailParticles) trailParticles.shift();
      const angle = Math.atan2(vy, vx) + (Math.random() - 0.5) * 1.0;
      trailParticles.push({
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 60,
        vx: -Math.cos(angle) * (1.5 + Math.random() * 3),
        vy: -Math.sin(angle) * (1.5 + Math.random() * 3),
        life: 0,
        maxLife: 20 + Math.random() * 20,
        size: 1.25 + Math.random() * 1.5,
        id: particleIdCounter++,
      });
    }

    function triMinAngle(ax: number, ay: number, bx: number, by: number, cx: number, cy: number) {
      const ab = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
      const bc = Math.sqrt((cx - bx) ** 2 + (cy - by) ** 2);
      const ca = Math.sqrt((ax - cx) ** 2 + (ay - cy) ** 2);
      if (ab < 1 || bc < 1 || ca < 1) return 0;
      return (
        Math.min(
          Math.acos(Math.max(-1, Math.min(1, (ab * ab + ca * ca - bc * bc) / (2 * ab * ca)))),
          Math.acos(Math.max(-1, Math.min(1, (ab * ab + bc * bc - ca * ca) / (2 * ab * bc)))),
          Math.acos(Math.max(-1, Math.min(1, (bc * bc + ca * ca - ab * ab) / (2 * bc * ca)))),
        ) * 180
      ) / Math.PI;
    }

    function smoothLife(p: TrailParticle) {
      const t = p.life / p.maxLife;
      if (t < 0.2) return t / 0.2;
      if (t > 0.7) return (1 - t) / 0.3;
      return 1.0;
    }

    function updateAndDrawTrail() {
      tCtx!.clearRect(0, 0, W, H);
      for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        if (p.life > p.maxLife) trailParticles.splice(i, 1);
      }

      const alive = trailParticles.filter((p) => p.life < p.maxLife);
      if (alive.length < 3) return;

      const slMap = new Map<number, number>();
      alive.forEach((p) => slMap.set(p.id, smoothLife(p)));

      const candidates: { a: TrailParticle; b: TrailParticle; c: TrailParticle; minSL: number; area: number; key: string }[] = [];
      const faceKeySet = new Set<string>();
      const connectDistSq = 120 * 120;

      for (let i = 0; i < alive.length; i++) {
        const a = alive[i];
        const slA = slMap.get(a.id)!;
        if (slA < 0.05) continue;

        const neighbors: { idx: number; distSq: number }[] = [];
        for (let j = 0; j < alive.length; j++) {
          if (j === i) continue;
          const pj = alive[j];
          const dx = a.x - pj.x;
          const dy = a.y - pj.y;
          const dSq = dx * dx + dy * dy;
          if (dSq < connectDistSq) neighbors.push({ idx: j, distSq: dSq });
        }
        if (neighbors.length < 2) continue;

        neighbors.sort((x, y) => x.distSq - y.distSq);
        const b = alive[neighbors[0].idx];
        const c = alive[neighbors[1].idx];

        const ids = [a.id, b.id, c.id].sort((x, y) => x - y);
        const key = ids.join(",");
        if (faceKeySet.has(key)) continue;
        faceKeySet.add(key);

        if (triMinAngle(a.x, a.y, b.x, b.y, c.x, c.y) < 30) continue;
        const maxEdge = Math.max(
          Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2),
          Math.sqrt((c.x - b.x) ** 2 + (c.y - b.y) ** 2),
          Math.sqrt((a.x - c.x) ** 2 + (a.y - c.y) ** 2),
        );
        if (maxEdge > 250) continue;

        const slB = slMap.get(b.id)!;
        const slC = slMap.get(c.id)!;
        const minSL = Math.min(slA, slB, slC);
        if (minSL < 0.05) continue;

        const area = Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) * 0.5;
        candidates.push({ a, b, c, minSL, area, key });
      }

      candidates.sort((x, y) => y.area - x.area);
      const finalCount = Math.min(candidates.length, maxFaces);

      for (let i = 0; i < finalCount; i++) {
        const f = candidates[i];
        const { a, b, c, minSL } = f;
        const ea = minSL * 0.4;
        const ageA = a.life / a.maxLife;
        const ageB = b.life / b.maxLife;
        const ageC = c.life / c.maxLife;
        const sf = 1 - ((ageA + ageB + ageC) / 3) * 0.85;
        const cx2 = (a.x + b.x + c.x) / 3;
        const cy2 = (a.y + b.y + c.y) / 3;
        const ax2 = cx2 + (a.x - cx2) * sf;
        const ay2 = cy2 + (a.y - cy2) * sf;
        const bx2 = cx2 + (b.x - cx2) * sf;
        const by2 = cy2 + (b.y - cy2) * sf;
        const cx3 = cx2 + (c.x - cx2) * sf;
        const cy3 = cy2 + (c.y - cy2) * sf;

        if (ea * 0.35 > 0.003) {
          tCtx!.beginPath();
          tCtx!.moveTo(ax2, ay2);
          tCtx!.lineTo(bx2, by2);
          tCtx!.lineTo(cx3, cy3);
          tCtx!.closePath();
          tCtx!.fillStyle = `${COLORS.trailFace}${ea * 0.35})`;
          tCtx!.fill();
        }
        if (ea * 0.55 > 0.01) {
          tCtx!.beginPath();
          tCtx!.moveTo(ax2, ay2);
          tCtx!.lineTo(bx2, by2);
          tCtx!.lineTo(cx3, cy3);
          tCtx!.closePath();
          tCtx!.strokeStyle = `${COLORS.trailLine}${ea * 0.55})`;
          tCtx!.lineWidth = 1.2;
          tCtx!.stroke();
        }
      }

      for (const p of alive) {
        const sl = slMap.get(p.id)!;
        const alpha = sl * 0.7;
        if (alpha < 0.01) continue;
        tCtx!.beginPath();
        tCtx!.arc(p.x, p.y, p.size * sl + 0.5, 0, Math.PI * 2);
        tCtx!.fillStyle = `${COLORS.trailDot}${alpha})`;
        tCtx!.fill();
      }
    }

    // ========== Mouse Interaction ==========
    let hoverAmount = 0;
    const lensPos = new THREE.Vector3(0, 9999, 0);
    const REF_H = 1080;
    const BASE_FOV = 45;

    let prevMX = -1;
    let prevMY = -1;
    let curMouseX = -1000;
    let curMouseY = -1000;
    let camTargetX = 0;
    let camTargetY = 0;
    let camCurrentX = 0;
    let camCurrentY = 0;
    const camSway = 0.15;
    let dragging = false;
    const dragPrev = { x: 0, y: 0 };
    let dragTargetX = 0;
    let dragTargetY = 0;
    let dragCurrentX = 0;
    let dragCurrentY = 0;

    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2(-9999, -9999);
    let mouseOnModel = false;

    function pxToWorld(px: number) {
      const fovRad = (camera.fov * Math.PI) / 180;
      const worldH = 2 * Math.tan(fovRad / 2) * camera.position.z;
      return (px / H) * worldH;
    }

    function resizeAll() {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio, 2);
      modelCvs.width = W * dpr;
      modelCvs.height = H * dpr;
      modelCvs.style.width = W + "px";
      modelCvs.style.height = H + "px";
      trailCvs.width = W;
      trailCvs.height = H;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.fov =
        2 *
        Math.atan(Math.tan((BASE_FOV * Math.PI) / 360) * (H / REF_H)) *
        (180 / Math.PI);
      camera.updateProjectionMatrix();
      const REF_W = 1920;
      const MIN_W = 1024;
      const wScale = W >= REF_W ? 1 : ((W - MIN_W) / (REF_W - MIN_W)) * 0.4 + 0.6;
      group.scale.setScalar(Math.max(0.6, Math.min(1, wScale)));
      drawDotGrid();
    }

    function onPointerDown(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, input, textarea, [data-no-drag]")) return;
      dragging = true;
      dragPrev.x = e.clientX;
      dragPrev.y = e.clientY;
    }

    function onPointerMove(e: MouseEvent) {
      if (destroyed) return;
      const dx = prevMX >= 0 ? e.clientX - prevMX : 0;
      const dy = prevMY >= 0 ? e.clientY - prevMY : 0;
      prevMX = e.clientX;
      prevMY = e.clientY;
      curMouseX = e.clientX;
      curMouseY = e.clientY;

      if (dragging) {
        dragTargetX += ((e.clientX - dragPrev.x) / W) * 2;
        dragTargetY += ((e.clientY - dragPrev.y) / H) * 2;
        dragTargetX = Math.max(-1, Math.min(1, dragTargetX));
        dragTargetY = Math.max(-0.5, Math.min(0.5, dragTargetY));
        dragPrev.x = e.clientX;
        dragPrev.y = e.clientY;
      }

      mouseNDC.set((e.clientX / W) * 2 - 1, -(e.clientY / H) * 2 + 1);
      raycaster.setFromCamera(mouseNDC, camera);

      const meshes = forms.filter((f) => f.container.visible).map((f) => f.fill);
      const intersections = raycaster.intersectObjects(meshes, false);
      mouseOnModel = intersections.length > 0;

      if (!mouseOnModel) {
        spawnTrailParticles(e.clientX, e.clientY, dx, dy);
      }

      camTargetX = (e.clientX / W - 0.5) * camSway;
      camTargetY = (e.clientY / H - 0.5) * camSway * 0.5;
    }

    function onPointerUp() {
      dragging = false;
    }

    function onPointerLeave() {
      curMouseX = -1000;
      curMouseY = -1000;
      mouseOnModel = false;
      dragging = false;
    }

    // ========== Auto morph between forms ==========
    let animTime = 0;
    let currentIdx = 0;
    const HOLD_DUR = 6.0;
    let holdTimer = 0;

    function cycleForm() {
      const nextIdx = (currentIdx + 1) % forms.length;
      const current = forms[currentIdx];
      const next = forms[nextIdx];

      current.container.visible = true;
      next.container.visible = true;

      const startOpacity = 1;
      const endOpacity = 0;
      const duration = 1500;
      const startTime = performance.now();

      function morphStep() {
        const elapsed = performance.now() - startTime;
        const t = Math.min(1, elapsed / duration);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        current.lMat.uniforms.uOpacity.value = startOpacity * (1 - ease);
        current.dMat.uniforms.uOpacity.value = startOpacity * (1 - ease);
        current.fMat.uniforms.uOpacity.value = startOpacity * (1 - ease);

        next.lMat.uniforms.uOpacity.value = endOpacity + ease;
        next.dMat.uniforms.uOpacity.value = endOpacity + ease;
        next.fMat.uniforms.uOpacity.value = endOpacity + ease;

        if (t < 1) {
          requestAnimationFrame(morphStep);
        } else {
          current.container.visible = false;
          current.lMat.uniforms.uOpacity.value = 0;
          current.dMat.uniforms.uOpacity.value = 0;
          current.fMat.uniforms.uOpacity.value = 0;
          next.lMat.uniforms.uOpacity.value = 1;
          next.dMat.uniforms.uOpacity.value = 1;
          next.fMat.uniforms.uOpacity.value = 1;
          currentIdx = nextIdx;
          holdTimer = 0;
        }
      }
      morphStep();
    }

    // ========== Animation Loop ==========
    const clock = new THREE.Clock();
    clock.start();

    function animate() {
      if (destroyed) return;
      rafId = requestAnimationFrame(animate);

      const dt = Math.min(clock.getDelta(), 0.05);
      animTime += dt;
      const elapsed = animTime;

      dragCurrentX += (dragTargetX - dragCurrentX) * 0.1;
      dragCurrentY += (dragTargetY - dragCurrentY) * 0.1;

      holdTimer += dt;
      if (holdTimer >= HOLD_DUR && forms.length > 1) {
        cycleForm();
      }

      // Hover raycast
      let targetHover = 0;
      if (!dragging && curMouseX >= 0 && forms[currentIdx]) {
        raycaster.setFromCamera(mouseNDC, camera);
        const hits = raycaster.intersectObject(forms[currentIdx].fill, false);
        if (hits.length > 0) {
          targetHover = 1;
          lensPos.copy(hits[0].point);
        }
      }
      if (curMouseX < 0) lensPos.set(0, 9999, 0);
      hoverAmount += (targetHover - hoverAmount) * (targetHover > hoverAmount ? 0.08 : 0.05);

      if (forms[currentIdx]) {
        const f = forms[currentIdx];
        f.fMat.uniforms.uHover.value = hoverAmount;
        f.fMat.uniforms.uTime.value = elapsed;
        f.fMat.uniforms.uLensPos.value.copy(lensPos);
        f.lMat.uniforms.uHover.value = hoverAmount;
        f.lMat.uniforms.uLensPos.value.copy(lensPos);
        f.dMat.uniforms.uHover.value = hoverAmount;
        f.dMat.uniforms.uLensPos.value.copy(lensPos);
        f.dMat.uniforms.uTime.value = elapsed;
        f.lMat.uniforms.uOpacity.value = Math.min(1.5, 1 + hoverAmount * 0.45);
        f.dMat.uniforms.uOpacity.value = Math.min(1.5, 1 + hoverAmount * 0.45);
      }

      group.position.y = pxToWorld(0) + Math.sin(elapsed * 0.3) * 0.03;
      group.rotation.y = elapsed * 0.05 + dragCurrentX * Math.PI;
      group.rotation.x = Math.sin(elapsed * 0.025) * 0.12 + dragCurrentY * (Math.PI / 3);

      for (const fl of floaters) {
        const ud = fl.userData as {
          baseY: number;
          bobSpd: number;
          bobAmp: number;
          drift: number;
          rotSpd: number;
          phase: number;
        };
        fl.position.y = ud.baseY + Math.sin(elapsed * ud.bobSpd + ud.phase) * ud.bobAmp;
        fl.position.x += ud.drift * 0.016;
        fl.rotation.y += ud.rotSpd * 0.016;
        fl.rotation.x += ud.rotSpd * 0.008;
        if (fl.position.x > DRIFT_RANGE_X) fl.position.x = -DRIFT_RANGE_X;
        if (fl.position.x < -DRIFT_RANGE_X) fl.position.x = DRIFT_RANGE_X;
      }

      camCurrentX += (camTargetX - camCurrentX) * 0.03;
      camCurrentY += (camTargetY - camCurrentY) * 0.03;
      camera.position.x = camCurrentX;
      camera.position.y = 0.2 - camCurrentY;
      camera.lookAt(camCurrentX * 0.3, -camCurrentY * 0.3, 0);

      renderer.render(scene, camera);
      if (!modelCvs.classList.contains("ready")) {
        modelCvs.classList.add("ready");
      }
      updateAndDrawTrail();
    }

    // ========== Init ==========
    resizeAll();
    drawDotGrid();
    renderer.compile(scene, camera);
    renderer.render(scene, camera);
    animate();

    window.addEventListener("resize", resizeAll);
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("mouseleave", onPointerLeave);

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeAll);
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("mouseleave", onPointerLeave);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.LineSegments) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            (obj.material as THREE.Material)?.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas
        ref={dotGridRef}
        id="cnDotGrid"
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      />
      <canvas
        ref={modelCanvasRef}
        id="cnModelCanvas"
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      />
      <canvas
        ref={trailCanvasRef}
        id="cnTrailCanvas"
        className="absolute inset-0 pointer-events-auto"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
