(() => {
  const NS = "http://www.w3.org/2000/svg";
  const F = "Bricolage Grotesque, system-ui, sans-serif";
  const INK = "#1B2430", BLUE = "#2F5BEA", SOFT = "#EEF3FF", AMBER = "#F2A93B", MUTED = "#5F6878";
  const SKIN = "#B97F5A";
  // On small screens the drawing is shown smaller, so its text is drawn larger
  const compact = window.matchMedia("(max-width: 860px)").matches;

  const el = (name, attrs, parent, text) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  const clamp = x => Math.max(0, Math.min(1, x));
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const label = (g, x, y, str, o = {}) =>
    el("text", { x, y, "text-anchor": o.anchor || "middle", "font-family": F, "font-size": o.size || 15, "font-weight": o.weight || 600, fill: o.fill || INK }, g, str);
  const chip = (g, cx, cy, str, o = {}) => {
    const size = o.size || 15;
    const w = o.w || str.length * size * 0.54 + 30, h = o.h || size + 19;
    const c = el("g", { transform: `translate(${cx},${cy})` }, g);
    el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, fill: o.fill || "#FFFFFF", stroke: o.stroke || "none", "stroke-width": 2 }, c);
    label(c, 0, size / 3, str, { fill: o.color || INK, size });
    return c;
  };

  /* ---------- Scene drawings. Each returns update(h), h = 0..1 through the scene ---------- */

  function bust(g, x, y, s, o) {
    const p = el("g", { transform: `translate(${x},${y}) scale(${s})` }, g);
    if (o.long) el("path", { d: "M-40,-78 Q-44,-122 0,-122 Q44,-122 40,-78 L47,-8 Q0,8 -47,-8 Z", fill: o.hair }, p);
    el("path", { d: "M-78,70 Q-78,-14 -34,-24 L34,-24 Q78,-14 78,70 Z", fill: o.top }, p);
    el("rect", { x: -13, y: -46, width: 26, height: 30, fill: o.skin }, p);
    el("circle", { cx: 0, cy: -74, r: 34, fill: o.skin }, p);
    if (o.bun) el("circle", { cx: 0, cy: -116, r: 14, fill: o.hair }, p);
    el("path", { d: "M-35,-78 Q-37,-114 0,-112 Q37,-114 35,-78 Q20,-99 0,-97 Q-20,-99 -35,-78 Z", fill: o.hair }, p);
    el("circle", { cx: -12, cy: -74, r: 3, fill: INK }, p);
    el("circle", { cx: 12, cy: -74, r: 3, fill: INK }, p);
    el("path", { d: "M-11,-60 Q0,-50 11,-60", fill: "none", stroke: INK, "stroke-width": 2.5, "stroke-linecap": "round" }, p);
    return p;
  }

  function dinner(g, showSensor) {
    // lamp
    el("circle", { cx: 300, cy: 130, r: 170, fill: AMBER, opacity: 0.12 }, g);
    el("line", { x1: 300, y1: -40, x2: 300, y2: 62, stroke: INK, "stroke-width": 3 }, g);
    el("path", { d: "M238,112 Q238,60 300,60 Q362,60 362,112 Z", fill: AMBER, stroke: INK, "stroke-width": 3, "stroke-linejoin": "round" }, g);
    // pictures on the wall
    el("rect", { x: 46, y: 96, width: 70, height: 88, rx: 6, fill: "none", stroke: "#C9D0DC", "stroke-width": 3 }, g);
    el("rect", { x: 492, y: 110, width: 62, height: 62, rx: 6, fill: "none", stroke: "#C9D0DC", "stroke-width": 3 }, g);
    // people
    bust(g, 132, 336, 1.2, { skin: "#E4B690", hair: "#6A4327", top: "#C9D0DC" });
    bust(g, 468, 336, 1.2, { skin: "#7A4E36", hair: INK, top: "#FFE1A6", bun: true });
    bust(g, 300, 322, 1.4, { skin: SKIN, hair: INK, top: BLUE, long: true });
    if (showSensor) {
      el("circle", { cx: 207, cy: 372, r: 17, fill: "none", stroke: AMBER, "stroke-width": 3 }, g);
      el("circle", { cx: 207, cy: 372, r: 9, fill: "#FFFFFF", stroke: INK, "stroke-width": 2.5 }, g);
    }
    // table
    el("rect", { x: 70, y: 430, width: 14, height: 200, fill: INK }, g);
    el("rect", { x: 516, y: 430, width: 14, height: 200, fill: INK }, g);
    el("rect", { x: 14, y: 404, width: 572, height: 30, rx: 15, fill: INK }, g);
    [132, 300, 468].forEach((x, i) => {
      el("path", { d: `M${x - 26},400 Q${x},${372 - (i % 2) * 6} ${x + 26},400 Z`, fill: i === 1 ? AMBER : "#FFE1A6" }, g);
      el("ellipse", { cx: x, cy: 401, rx: 46, ry: 8, fill: "#FFFFFF", stroke: INK, "stroke-width": 2.5 }, g);
    });
    [216, 384].forEach(x => {
      el("path", { d: `M${x - 9},366 L${x + 9},366 L${x + 7},402 L${x - 7},402 Z`, fill: "#FFFFFF", stroke: INK, "stroke-width": 2.5, "stroke-linejoin": "round" }, g);
      el("path", { d: `M${x - 8},384 L${x + 8},384 L${x + 7},401 L${x - 7},401 Z`, fill: "#9FB4FF" }, g);
    });
    return () => {};
  }

  function sleeve(g) {
    // hair, head, neck
    el("path", { d: "M222,80 Q214,-8 300,-8 Q386,-8 378,80 L394,216 Q300,244 206,216 Z", fill: INK }, g);
    el("rect", { x: 280, y: 132, width: 40, height: 36, fill: SKIN }, g);
    el("circle", { cx: 300, cy: 78, r: 66, fill: SKIN }, g);
    el("path", { d: "M232,72 Q228,6 300,8 Q372,6 368,72 Q340,30 300,34 Q260,30 232,72 Z", fill: INK }, g);
    el("circle", { cx: 277, cy: 82, r: 4.5, fill: INK }, g);
    el("circle", { cx: 323, cy: 82, r: 4.5, fill: INK }, g);
    el("path", { d: "M281,106 Q300,121 319,106", fill: "none", stroke: INK, "stroke-width": 3, "stroke-linecap": "round" }, g);
    // arms
    el("rect", { x: 108, y: 180, width: 62, height: 330, rx: 31, fill: SKIN }, g);
    el("rect", { x: 430, y: 180, width: 62, height: 330, rx: 31, fill: SKIN }, g);
    // sensor on the upper arm
    el("circle", { cx: 139, cy: 262, r: 19, fill: "#FFFFFF", stroke: INK, "stroke-width": 3 }, g);
    el("circle", { cx: 139, cy: 262, r: 6, fill: BLUE }, g);
    const sleeveL = el("rect", { x: 104, y: 170, width: 70, height: 152, rx: 30, fill: BLUE }, g);
    const sleeveOutline = el("rect", { x: 104, y: 170, width: 70, height: 152, rx: 30, fill: "none", stroke: BLUE, "stroke-width": 2.5, "stroke-dasharray": "5 7" }, g);
    el("rect", { x: 426, y: 170, width: 70, height: 152, rx: 30, fill: BLUE }, g);
    // top and trousers
    el("path", { d: "M178,505 H422 V640 H178 Z", fill: INK }, g);
    el("path", { d: "M150,225 Q150,162 240,158 L360,158 Q450,162 450,225 L432,262 L422,520 L178,520 L168,262 Z", fill: BLUE }, g);
    // see-through patch for the infusion site
    const xray = el("g", {}, g);
    el("circle", { cx: 262, cy: 446, r: 46, fill: "#6E8DF5" }, xray);
    el("circle", { cx: 262, cy: 446, r: 46, fill: "none", stroke: "#FFFFFF", "stroke-width": 2, "stroke-dasharray": "5 7" }, xray);
    el("path", { d: "M229,490 C229,462 246,452 262,440", fill: "none", stroke: "#FFFFFF", "stroke-width": 3.5, "stroke-linecap": "round" }, xray);
    el("circle", { cx: 265, cy: 436, r: 11, fill: "#FFFFFF", stroke: INK, "stroke-width": 2.5 }, xray);
    // pump on the waistband
    el("rect", { x: 196, y: 490, width: 66, height: 46, rx: 10, fill: "#FFFFFF", stroke: INK, "stroke-width": 3 }, g);
    el("rect", { x: 204, y: 498, width: 34, height: 20, rx: 4, fill: SOFT, stroke: INK, "stroke-width": 1.5 }, g);
    el("circle", { cx: 249, cy: 513, r: 5, fill: AMBER }, g);
    // bag on a strap
    el("line", { x1: 224, y1: 162, x2: 452, y2: 420, stroke: "#9A6A1A", "stroke-width": 9, "stroke-linecap": "round" }, g);
    el("rect", { x: 400, y: 410, width: 128, height: 112, rx: 20, fill: AMBER, stroke: INK, "stroke-width": 3.5 }, g);
    el("path", { d: "M400,440 Q464,476 528,440", fill: "none", stroke: INK, "stroke-width": 3.5 }, g);
    el("circle", { cx: 464, cy: 462, r: 6, fill: INK }, g);
    // labels
    const notes = el("g", {}, g);
    el("path", { d: "M84,116 L128,246", fill: "none", stroke: INK, "stroke-width": 2 }, notes);
    chip(notes, compact ? 100 : 84, 100, "Glucose sensor", { stroke: INK, size: compact ? 20 : 15 });
    el("path", { d: "M92,556 L196,520", fill: "none", stroke: INK, "stroke-width": 2 }, notes);
    chip(notes, compact ? 92 : 78, 572, "Insulin pump", { stroke: INK, size: compact ? 20 : 15 });
    return h => {
      const a = smooth(h * 1.6), b = smooth(h * 1.6 - 0.4);
      sleeveL.setAttribute("opacity", 1 - 0.85 * a);
      sleeveOutline.setAttribute("opacity", a);
      xray.setAttribute("opacity", a);
      notes.setAttribute("opacity", b);
    };
  }

  function bag(g) {
    el("path", { d: "M150,402 Q150,336 300,336 Q450,336 450,402 Z", fill: "#D9952A", stroke: INK, "stroke-width": 4, "stroke-linejoin": "round" }, g);
    el("ellipse", { cx: 300, cy: 402, rx: 168, ry: 30, fill: "#8A5A1F", stroke: INK, "stroke-width": 4 }, g);
    const items = el("g", {}, g);
    el("path", { d: "M132,402 Q134,470 140,560 Q142,594 176,594 L424,594 Q458,594 460,560 Q466,470 468,402 Q300,448 132,402 Z", fill: AMBER, stroke: INK, "stroke-width": 4, "stroke-linejoin": "round" }, g);
    el("rect", { x: 236, y: 486, width: 128, height: 72, rx: 14, fill: "none", stroke: INK, "stroke-width": 3 }, g);
    el("circle", { cx: 300, cy: 486, r: 6, fill: INK }, g);

    const draw = [
      ["Insulin pen", p => {
        const r = el("g", { transform: "rotate(-32)" }, p);
        el("rect", { x: -44, y: -10, width: 88, height: 20, rx: 10, fill: "#FFFFFF", stroke: INK, "stroke-width": 3 }, r);
        el("rect", { x: -18, y: -10, width: 30, height: 20, fill: BLUE }, r);
        el("line", { x1: 44, y1: 0, x2: 58, y2: 0, stroke: INK, "stroke-width": 3, "stroke-linecap": "round" }, r);
      }],
      ["Meter and strips", p => {
        el("rect", { x: -26, y: -38, width: 52, height: 72, rx: 12, fill: "#FFFFFF", stroke: INK, "stroke-width": 3 }, p);
        el("rect", { x: -17, y: -28, width: 34, height: 26, rx: 4, fill: SOFT, stroke: INK, "stroke-width": 1.5 }, p);
        label(p, 0, -9, "104", { size: 14, weight: 800 });
        el("circle", { cx: 0, cy: 16, r: 7, fill: AMBER }, p);
        el("rect", { x: -5, y: 34, width: 10, height: 12, fill: "#FFFFFF", stroke: INK, "stroke-width": 2 }, p);
      }],
      ["Juice", p => {
        el("rect", { x: -22, y: -26, width: 44, height: 60, rx: 5, fill: "#FFFFFF", stroke: INK, "stroke-width": 3 }, p);
        el("rect", { x: -22, y: -4, width: 44, height: 18, fill: AMBER }, p);
        el("path", { d: "M6,-26 L14,-46 L24,-42", fill: "none", stroke: INK, "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round" }, p);
      }],
      ["Glucose tablets", p => {
        el("rect", { x: -30, y: -36, width: 30, height: 70, rx: 8, fill: AMBER, stroke: INK, "stroke-width": 3 }, p);
        el("rect", { x: -30, y: -36, width: 30, height: 16, rx: 6, fill: "#FFFFFF", stroke: INK, "stroke-width": 3 }, p);
        el("circle", { cx: 22, cy: 6, r: 11, fill: "#FFFFFF", stroke: INK, "stroke-width": 2.5 }, p);
        el("circle", { cx: 16, cy: 28, r: 11, fill: "#FFFFFF", stroke: INK, "stroke-width": 2.5 }, p);
      }],
      ["Spare supplies", p => {
        el("rect", { x: -38, y: -26, width: 76, height: 54, rx: 12, fill: SOFT, stroke: INK, "stroke-width": 3 }, p);
        el("line", { x1: -38, y1: -10, x2: 38, y2: -10, stroke: INK, "stroke-width": 2.5, "stroke-dasharray": "3 4" }, p);
        el("path", { d: "M0,0 V18 M-9,9 H9", stroke: BLUE, "stroke-width": 4, "stroke-linecap": "round", fill: "none" }, p);
      }],
      ["Phone", p => {
        el("rect", { x: -24, y: -42, width: 48, height: 82, rx: 10, fill: INK }, p);
        el("rect", { x: -19, y: -36, width: 38, height: 70, rx: 6, fill: BLUE }, p);
        el("path", { d: "M-14,-6 L-6,-12 L2,-2 L14,10", fill: "none", stroke: "#FFFFFF", "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round" }, p);
      }]
    ];
    const spots = [[112, 92], [300, 92], [488, 92], [112, 236], [300, 236], [488, 236]];
    const nodes = draw.map(([name, fn], i) => {
      const outer = el("g", {}, items);
      fn(el("g", {}, outer));
      label(outer, 0, compact ? 72 : 68, name, { size: compact ? 20 : 15 });
      return outer;
    });
    return h => nodes.forEach((n, i) => {
      const t = smooth((h - i * 0.11) / 0.42);
      const x = 300 + (spots[i][0] - 300) * t, y = 404 + (spots[i][1] - 404) * t, s = 0.35 + 0.65 * t;
      n.setAttribute("transform", `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(3)})`);
      n.setAttribute("opacity", clamp(t * 2.5));
    });
  }

  function phone(g, uid) {
    el("rect", { x: 160, y: 30, width: 280, height: 540, rx: 42, fill: INK }, g);
    el("rect", { x: 174, y: 46, width: 252, height: 508, rx: 30, fill: "#FFFFFF" }, g);
    label(g, 300, 76, "1:55 pm", { size: 13 });
    label(g, 196, 112, "Glucose", { size: 13, anchor: "start", fill: MUTED, weight: 400 });
    const value = label(g, 196, 164, "", { size: 52, weight: 800, anchor: "start" });
    value.setAttribute("letter-spacing", "-1.5");
    const trend = label(g, 404, 160, "", { size: 34, weight: 800, anchor: "end" });
    label(g, 404, 112, "mg/dL", { size: 13, anchor: "end", fill: MUTED, weight: 400 });
    // graph: 50 to 160 mg/dL across the box
    const gx = 194, gw = 212, gy = 200, gh = 120;
    const yOf = v => gy + gh - (v - 50) / 110 * gh;
    el("rect", { x: gx, y: gy, width: gw, height: gh, rx: 10, fill: SOFT }, g);
    el("rect", { x: gx, y: yOf(70), width: gw, height: gy + gh - yOf(70), fill: "#FFE1A6", opacity: 0.8 }, g);
    el("line", { x1: gx, y1: yOf(70), x2: gx + gw, y2: yOf(70), stroke: AMBER, "stroke-width": 1.5, "stroke-dasharray": "4 5" }, g);
    const vals = [120, 118, 121, 117, 111, 103, 94, 86, 78, 71, 68];
    const pts = vals.map((v, i) => [gx + 8 + i * (gw - 16) / (vals.length - 1), yOf(v)]);
    const clipId = "reveal-" + uid;
    const clip = el("clipPath", { id: clipId }, g);
    const clipRect = el("rect", { x: gx, y: gy, width: 0, height: gh }, clip);
    el("polyline", { points: pts.map(p => p.join(",")).join(" "), fill: "none", stroke: BLUE, "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round", "clip-path": `url(#${clipId})` }, g);
    const dot = el("circle", { r: 7, fill: AMBER, stroke: INK, "stroke-width": 2.5 }, g);

    const note = (y, title, sub, alert) => {
      const n = el("g", {}, g);
      el("rect", { x: 190, y, width: 220, height: 54, rx: 14, fill: alert ? AMBER : SOFT }, n);
      el("rect", { x: 200, y: y + 13, width: 28, height: 28, rx: 8, fill: alert ? INK : BLUE }, n);
      if (alert) label(n, 214, y + 33, "!", { size: 18, weight: 800, fill: AMBER });
      label(n, 238, y + 23, title, { size: 15, anchor: "start", weight: 800 });
      label(n, 238, y + 42, sub, { size: 13.5, anchor: "start", weight: 400, fill: alert ? INK : MUTED });
      return { n, y };
    };
    const notes = [
      [note(346, "Budget review", "Starts in 5 minutes"), 0.22],
      [note(410, "Team chat", "Dev: you're up first"), 0.45],
      [note(474, "Low glucose soon", "68 and falling", true), 0.68]
    ];
    return h => {
      const f = clamp(h / 0.8) * (vals.length - 1), i = Math.min(Math.floor(f), vals.length - 2), r = f - i;
      const v = vals[i] + (vals[i + 1] - vals[i]) * r;
      const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r;
      value.textContent = Math.round(v);
      value.setAttribute("fill", v < 75 ? "#B4690E" : INK);
      trend.textContent = f < 3 ? "→" : f < 7 ? "↘" : "↓";
      clipRect.setAttribute("width", Math.max(0, x - gx));
      dot.setAttribute("cx", x); dot.setAttribute("cy", y);
      notes.forEach(([o, at]) => {
        const t = smooth((h - at) / 0.14);
        o.n.setAttribute("opacity", t);
        o.n.setAttribute("transform", `translate(0,${((1 - t) * 18).toFixed(1)})`);
      });
    };
  }

  function head(g) {
    // plate of food
    el("line", { x1: 186, y1: 262, x2: 186, y2: 378, stroke: "#FFFFFF", "stroke-width": 5, "stroke-linecap": "round" }, g);
    el("path", { d: "M176,262 V292 Q176,304 186,304 Q196,304 196,292 V262", fill: "none", stroke: "#FFFFFF", "stroke-width": 4, "stroke-linecap": "round" }, g);
    el("path", { d: "M414,378 V262 Q428,276 426,318 L414,322", fill: "none", stroke: "#FFFFFF", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    el("circle", { cx: 300, cy: 320, r: 86, fill: "#FFFFFF", stroke: INK, "stroke-width": 4 }, g);
    el("circle", { cx: 300, cy: 320, r: 64, fill: "none", stroke: "#E3E7EE", "stroke-width": 2 }, g);
    el("ellipse", { cx: 284, cy: 312, rx: 40, ry: 28, fill: "#FFE1A6" }, g);
    el("circle", { cx: 326, cy: 338, r: 25, fill: AMBER }, g);
    [[270, 304], [288, 322], [300, 300], [318, 332], [334, 346]].forEach(([x, y]) => el("circle", { cx: x, cy: y, r: 3, fill: INK, opacity: 0.55 }, g));
    const thoughts = [
      ["How many carbs is this?", 150, 52, -2],
      ["When was my last dose?", 448, 58, 2],
      ["Is that insulin still working?", 158, 112, 1],
      ["Am I driving home?", 462, 118, -2],
      ["What's my number right now?", 150, 172, -1],
      ["Is it going up or down?", 454, 178, 2],
      ["Did I walk here?", 138, 466, 2],
      ["Is one glass of wine OK?", 434, 472, -2],
      ["What if dessert comes?", 300, 532, 1]
    ];
    const small = [
      ["How many carbs is this?", 210, 34, -1],
      ["When was my last dose?", 380, 88, 1],
      ["Is that insulin still working?", 232, 142, -1],
      ["Is it going up or down?", 372, 196, 1],
      ["Am I driving home?", 190, 444, 1],
      ["Is one glass of wine OK?", 372, 498, -1],
      ["What if dessert comes?", 224, 552, 1]
    ];
    const nodes = (compact ? small : thoughts).map(([str, x, y, rot]) => {
      const outer = el("g", {}, g);
      chip(outer, 0, 0, str, compact ? { size: 22, h: 46 } : { h: 38 });
      return { outer, x, y, rot };
    });
    return h => nodes.forEach((n, i) => {
      const t = smooth((h - i * (compact ? 0.11 : 0.085)) / 0.2);
      n.outer.setAttribute("opacity", t);
      n.outer.setAttribute("transform", `translate(${n.x},${n.y + (1 - t) * 14}) rotate(${n.rot}) scale(${(0.85 + 0.15 * t).toFixed(3)})`);
    });
  }

  function night(g) {
    // window with moon
    el("rect", { x: 56, y: 64, width: 176, height: 196, rx: 12, fill: "#1B2F78", stroke: "#3F5296", "stroke-width": 4 }, g);
    el("line", { x1: 144, y1: 64, x2: 144, y2: 260, stroke: "#3F5296", "stroke-width": 4 }, g);
    el("line", { x1: 56, y1: 162, x2: 232, y2: 162, stroke: "#3F5296", "stroke-width": 4 }, g);
    el("circle", { cx: 190, cy: 112, r: 22, fill: "#FFE7B8" }, g);
    [[86, 96], [112, 136], [92, 214], [200, 204], [172, 232]].forEach(([x, y]) => el("circle", { cx: x, cy: y, r: 2.5, fill: "#FFFFFF", opacity: 0.8 }, g));
    // clock
    el("rect", { x: 392, y: 84, width: 150, height: 64, rx: 12, fill: "#080D22", stroke: "#3F5296", "stroke-width": 3 }, g);
    const clock = label(g, 467, 129, "3:07", { size: 38, weight: 800, fill: AMBER });
    // Priya, half asleep, drinking juice
    el("path", { d: "M276,232 Q268,150 336,150 Q404,150 396,232 L412,330 Q336,352 260,330 Z", fill: INK, stroke: "#3F5296", "stroke-width": 2 }, g);
    el("path", { d: "M236,460 Q236,322 300,312 L372,312 Q436,322 436,460 Z", fill: "#C4D3FF" }, g);
    el("rect", { x: 320, y: 280, width: 32, height: 40, fill: SKIN }, g);
    el("circle", { cx: 336, cy: 238, r: 50, fill: SKIN }, g);
    el("path", { d: "M286,236 Q282,184 336,184 Q390,184 386,236 Q364,204 336,208 Q308,204 286,236 Z", fill: INK }, g);
    el("path", { d: "M312,244 q7,5 14,0", fill: "none", stroke: INK, "stroke-width": 3, "stroke-linecap": "round" }, g);
    el("path", { d: "M346,244 q7,5 14,0", fill: "none", stroke: INK, "stroke-width": 3, "stroke-linecap": "round" }, g);
    el("path", { d: "M412,438 Q452,380 404,296", fill: "none", stroke: SKIN, "stroke-width": 26, "stroke-linecap": "round" }, g);
    el("rect", { x: 380, y: 262, width: 40, height: 54, rx: 5, fill: "#FFFFFF", stroke: INK, "stroke-width": 3 }, g);
    el("rect", { x: 380, y: 282, width: 40, height: 16, fill: AMBER }, g);
    el("path", { d: "M392,262 L380,246 L356,262", fill: "none", stroke: "#FFFFFF", "stroke-width": 3.5, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    // counter
    el("rect", { x: 10, y: 440, width: 580, height: 150, rx: 16, fill: "#1A2550", stroke: "#3F5296", "stroke-width": 4 }, g);
    // phone alarm on the counter
    const glow = el("circle", { cx: 142, cy: 440, r: 96, fill: AMBER }, g);
    el("rect", { x: 96, y: 426, width: 92, height: 20, rx: 8, fill: "#080D22", stroke: "#3F5296", "stroke-width": 2.5 }, g);
    const low = chip(g, 142, 376, "58 ↓  Low", { fill: AMBER, w: 122, h: 40 });
    const ok = chip(g, 142, 376, "76 ↑  In range", { fill: "#C4D3FF", w: 150, h: 40 });
    return h => {
      const mins = 7 + Math.round(clamp(h / 0.9) * 15);
      clock.textContent = "3:" + String(mins).padStart(2, "0");
      const done = smooth((h - 0.62) / 0.12);
      low.setAttribute("opacity", 1 - done);
      ok.setAttribute("opacity", done);
      glow.setAttribute("opacity", 0.22 * (1 - done) + 0.06);
    };
  }

  const SCENES = [
    g => dinner(g, false),
    sleeve,
    bag,
    phone,
    head,
    night,
    g => dinner(g, true)
  ];
  // Where the camera pushes in as each scene hands over to the next
  const FOCUS = [[207, 372], [464, 466], [488, 236], [300, 470], [300, 320], [300, 300], [300, 300]];
  const WATER = [null, [234, 240, 255], [196, 211, 255], [40, 71, 184], [27, 47, 120], [14, 22, 51]];

  /* ---------- Still version ---------- */
  const dive = document.getElementById("dive");
  const steps = [...dive.querySelectorAll(".step")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) {
    steps.forEach((step, i) => {
      const box = document.createElement("div");
      box.className = "still";
      box.setAttribute("aria-hidden", "true");
      const svg = el("svg", { viewBox: "0 0 600 600" }, box);
      SCENES[i](el("g", {}, svg), "s" + i)(1);
      step.querySelector(".step-inner").appendChild(box);
    });
    return;
  }

  /* ---------- Scroll-driven version ---------- */
  dive.classList.add("scrolly");
  const backdrop = document.getElementById("backdrop");
  const water = document.getElementById("water");
  const gaugeDot = document.getElementById("gaugeDot");
  const svg = document.getElementById("scene");
  const scenes = SCENES.map((build, i) => {
    const g = el("g", {}, svg);
    return { g, update: build(g, "m" + i), shown: null };
  });
  const copies = steps.map(s => s.querySelector(".copy"));
  const last = SCENES.length - 1;

  // Progress of the handover from scene k to scene k + 1
  const handover = (u, k) => clamp((u - (k + 0.32)) / 0.4);

  function render() {
    const stepH = steps[0].offsetHeight;
    const u = Math.max(0, Math.min(last, -steps[0].getBoundingClientRect().top / stepH));

    scenes.forEach((sc, i) => {
      const tin = i === 0 ? 1 : handover(u, i - 1);
      const tout = i === last ? 0 : handover(u, i);
      const visible = tin > 0 && tout < 1;
      if (sc.shown !== visible) { sc.g.style.display = visible ? "" : "none"; sc.shown = visible; }
      if (!visible) return;

      let scale = 1, opacity = 1, fx = 300, fy = 300, ty = 0;
      if (tout > 0) {
        const e = smooth(tout);
        if (i === last - 1) { scale = 1 - 0.45 * e; ty = 240 * e; opacity = 1 - clamp(tout * 1.7); }   // sink away as we rise
        else { [fx, fy] = FOCUS[i]; scale = 1 + 2.4 * e * e; opacity = 1 - clamp((tout - 0.2) / 0.5); } // push in
      } else if (tin < 1) {
        const e = smooth(tin);
        if (i === last) { scale = 1.8 - 0.8 * e; opacity = clamp((tin - 0.3) / 0.6); }                 // pull back out
        else { scale = 0.5 + 0.5 * e; opacity = clamp((tin - 0.35) / 0.55); }
      }
      sc.g.setAttribute("transform", `translate(${fx},${fy + ty}) scale(${scale.toFixed(4)}) translate(${-fx},${-fy})`);
      sc.g.setAttribute("opacity", opacity.toFixed(3));
      sc.update(clamp((u - (i - 0.2)) / 0.36));
    });

    // Text fades in as it arrives and out before the next scene
    copies.forEach((c, i) => {
      const d = u - i;
      const o = d < 0 ? clamp((d + 0.38) / 0.25) : 1 - clamp((d - 0.29) / 0.13);
      c.style.opacity = i === last && d >= 0 ? 1 : o.toFixed(3);
      c.style.visibility = o < 0.01 && !(i === last && d >= 0) ? "hidden" : "visible";
    });

    // Water rises after the first scene and drains away before the last
    const level = smooth(handover(u, 0)) * (1 - smooth(handover(u, last - 1)));
    water.style.transform = `translateY(${((1 - level) * 110).toFixed(2)}%)`;
    const k = Math.max(1, Math.min(4, Math.floor(u - 0.32)));
    const mix = k >= 1 && k <= 4 ? smooth(handover(u, k)) : 0;
    const a = WATER[k], b = WATER[Math.min(5, k + 1)];
    const rgb = a.map((v, j) => Math.round(v + (b[j] - v) * mix));
    backdrop.style.setProperty("--water", `rgb(${rgb.join(",")})`);
    const dark = level > 0.5 && (rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11) < 150;
    backdrop.style.setProperty("--fg", dark ? "#FFFFFF" : INK);

    const depth = u <= last - 1 ? u / (last - 1) : last - u;
    gaugeDot.style.transform = `translateY(${(depth * 240).toFixed(1)}px)`;
  }

  let queued = false;
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; render(); }); } };
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  render();
})();
