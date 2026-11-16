(() => {
  const NS = "http://www.w3.org/2000/svg";
  const F = "Bricolage Grotesque, system-ui, sans-serif";
  const INK = "#1B2430", BLUE = "#2F5BEA", SOFT = "#EEF3FF", AMBER = "#F2A93B", MUTED = "#5F6878", NIGHT = "#3F5296", RED = "#C8372D";

  const el = (name, attrs, parent, text) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  const clamp = x => Math.max(0, Math.min(1, x));
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const span = (h, from, to) => clamp((h - from) / (to - from));
  // A drop that lands with two small bounces
  const bounce = x => {
    x = clamp(x);
    if (x < 0.55) return (x / 0.55) ** 2;
    if (x < 0.8) { const k = (x - 0.675) / 0.125; return 1 - 0.16 * (1 - k * k); }
    const k = (x - 0.9) / 0.1; return 1 - 0.05 * (1 - k * k);
  };
  const text = (g, x, y, str, o = {}) =>
    el("text", { x, y, "text-anchor": o.anchor || "middle", "font-family": F, "font-size": o.size || 18, "font-weight": o.weight || 600, fill: o.fill || INK }, g, str);
  const chip = (g, cx, cy, w, o = {}) => {
    const c = el("g", { transform: `translate(${cx},${cy})` }, g);
    el("rect", { x: -w / 2, y: -20, width: w, height: 40, rx: 20, fill: o.fill || "#FFFFFF" }, c);
    const t = text(c, 0, 6.5, "", { size: 18, fill: o.color || INK });
    return { g: c, set: s => { if (t.textContent !== s) t.textContent = s; } };
  };

  /* ---------- Scenes. Each returns update(h), h = 0..1 through the scene ---------- */

  // 1. Toilet: a hallway at night, the bathroom light going on again and again
  function toilet(g) {
    el("rect", { x: 0, y: 470, width: 600, height: 130, rx: 14, fill: "#1A2550" }, g);
    el("rect", { x: 46, y: 96, width: 150, height: 184, rx: 10, fill: "#1B2F78", stroke: NIGHT, "stroke-width": 4 }, g);
    el("line", { x1: 121, y1: 96, x2: 121, y2: 280, stroke: NIGHT, "stroke-width": 4 }, g);
    [[70, 120], [100, 232], [160, 250], [176, 140], [84, 180]].forEach(([x, y]) => el("circle", { cx: x, cy: y, r: 2.5, fill: "#fff", opacity: 0.8 }, g));
    const moon = el("circle", { r: 17, fill: "#FFE7B8" }, g);
    // clock
    el("circle", { cx: 300, cy: 130, r: 48, fill: "#080D22", stroke: NIGHT, "stroke-width": 4 }, g);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      el("line", { x1: 300 + Math.sin(a) * 38, y1: 130 - Math.cos(a) * 38, x2: 300 + Math.sin(a) * 43, y2: 130 - Math.cos(a) * 43, stroke: NIGHT, "stroke-width": 3, "stroke-linecap": "round" }, g);
    }
    const hourHand = el("line", { x1: 300, y1: 130, x2: 300, y2: 104, stroke: "#fff", "stroke-width": 5, "stroke-linecap": "round" }, g);
    const minHand = el("line", { x1: 300, y1: 130, x2: 300, y2: 94, stroke: AMBER, "stroke-width": 3.5, "stroke-linecap": "round" }, g);
    el("circle", { cx: 300, cy: 130, r: 5, fill: "#fff" }, g);
    const time = text(g, 300, 216, "", { size: 22, weight: 800, fill: AMBER });
    // light spilling out of the bathroom
    const spill = el("path", { d: "M392,470 L544,470 L640,600 L250,600 Z", fill: AMBER }, g);
    const halo = el("circle", { cx: 468, cy: 310, r: 190, fill: AMBER }, g);
    // door
    el("rect", { x: 392, y: 150, width: 152, height: 320, rx: 8, fill: "#141C3D", stroke: NIGHT, "stroke-width": 4 }, g);
    const glass = el("rect", { x: 418, y: 176, width: 100, height: 122, rx: 8, fill: "#1B2550" }, g);
    el("circle", { cx: 412, cy: 330, r: 7, fill: NIGHT }, g);
    const gap = el("rect", { x: 394, y: 462, width: 148, height: 8, fill: AMBER }, g);
    const count = chip(g, 128, 404, 190, { fill: "#1A2550", color: "#fff" });
    const visits = [[0.10, 0.22, 1420], [0.34, 0.46, 1515], [0.58, 0.70, 1650], [0.82, 0.93, 1745]];
    return h => {
      const m = lerp(1410, 1750, h);                         // 11:30 pm to 5:10 am, in minutes
      hourHand.setAttribute("transform", `rotate(${(m / 60 % 12) * 30} 300 130)`);
      minHand.setAttribute("transform", `rotate(${(m % 60) * 6} 300 130)`);
      const hh = Math.floor(m / 60) % 24, mm = Math.floor(m % 60);
      time.textContent = `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${hh < 12 ? "am" : "pm"}`;
      moon.setAttribute("cx", lerp(64, 180, h)); moon.setAttribute("cy", 190 - Math.sin(Math.PI * h) * 66);
      let on = 0, n = 0;
      visits.forEach(([a, b]) => { on = Math.max(on, Math.min(span(h, a, a + 0.015), 1 - span(h, b, b + 0.015))); if (h >= a) n++; });
      spill.setAttribute("opacity", 0.34 * on);
      halo.setAttribute("opacity", 0.1 * on);
      gap.setAttribute("opacity", on);
      glass.setAttribute("fill", on > 0.5 ? "#FFE7B8" : "#1B2550");
      count.g.setAttribute("opacity", n ? 1 : 0);
      count.set(n === 1 ? "Up once tonight" : `Up ${n} times tonight`);
    };
  }

  // 2. Thirsty: glasses and bottles piling up on a table
  function thirsty(g, uid) {
    const clip = el("clipPath", { id: "win-" + uid }, g);
    el("rect", { x: 56, y: 60, width: 190, height: 170, rx: 10 }, clip);
    el("rect", { x: 56, y: 60, width: 190, height: 170, rx: 10, fill: "#C4D3FF" }, g);
    const sun = el("circle", { r: 34, fill: AMBER, "clip-path": `url(#win-${uid})` }, g);
    el("rect", { x: 56, y: 60, width: 190, height: 170, rx: 10, fill: "none", stroke: INK, "stroke-width": 4 }, g);
    el("line", { x1: 151, y1: 60, x2: 151, y2: 230, stroke: INK, "stroke-width": 4 }, g);
    // table
    el("rect", { x: 70, y: 444, width: 16, height: 156, fill: INK }, g);
    el("rect", { x: 514, y: 444, width: 16, height: 156, fill: INK }, g);
    el("rect", { x: 30, y: 420, width: 540, height: 26, rx: 13, fill: INK }, g);
    const count = chip(g, 440, 120, 200);
    const kinds = ["glass", "glass", "bottle", "glass", "glass", "glass", "bottle", "glass", "glass"];
    const items = kinds.map((kind, i) => {
      const x = 74 + i * 56, tall = kind === "bottle";
      const n = el("g", {}, g);
      const water = el("path", { fill: "#9FB4FF" }, n);
      if (tall) {
        el("path", { d: "M-14,0 V-76 Q-14,-90 -7,-94 V-108 H7 V-94 Q14,-90 14,-76 V0 Z", fill: "none", stroke: INK, "stroke-width": 3, "stroke-linejoin": "round" }, n);
        el("rect", { x: -9, y: -116, width: 18, height: 9, rx: 3, fill: BLUE }, n);
      } else {
        el("path", { d: "M-19,-64 L19,-64 L15,0 L-15,0 Z", fill: "none", stroke: INK, "stroke-width": 3, "stroke-linejoin": "round" }, n);
      }
      return { n, water, x, tall, at: 0.05 + i * 0.092 };
    });
    return h => {
      sun.setAttribute("cx", lerp(84, 210, h)); sun.setAttribute("cy", lerp(232, 96, smooth(h)));
      let n = 0;
      items.forEach(it => {
        const drop = span(h, it.at, it.at + 0.085);
        if (drop > 0) n++;
        const y = lerp(-140, 420, bounce(drop));
        it.n.setAttribute("transform", `translate(${it.x},${y.toFixed(1)})`);
        it.n.setAttribute("opacity", drop > 0 ? 1 : 0);
        const level = 1 - smooth(span(h, it.at + 0.07, it.at + 0.15));   // drained soon after it lands
        const top = it.tall ? 76 : 54, half = it.tall ? 12.5 : lerp(13.5, 17, level * 54 / 64);
        const yy = -(top * level) - 2;
        it.water.setAttribute("d", level < 0.02 ? "" : `M${-half},${yy} L${half},${yy} L${it.tall ? 12.5 : 13.5},-2 L${it.tall ? -12.5 : -13.5},-2 Z`);
      });
      count.g.setAttribute("opacity", n ? 1 : 0);
      count.set(n === 1 ? "1 drink so far" : `${n} drinks so far`);
    };
  }

  // 3. Tired: bag dropped, football ignored, asleep on the sofa in the afternoon
  function tired(g, uid) {
    const clip = el("clipPath", { id: "win-" + uid }, g);
    el("rect", { x: 60, y: 70, width: 200, height: 170, rx: 10 }, clip);
    const sky = el("rect", { x: 60, y: 70, width: 200, height: 170, rx: 10, fill: "#C4D3FF" }, g);
    const sun = el("circle", { r: 30, fill: AMBER, "clip-path": `url(#win-${uid})` }, g);
    el("rect", { x: 60, y: 70, width: 200, height: 170, rx: 10, fill: "none", stroke: INK, "stroke-width": 4 }, g);
    el("line", { x1: 160, y1: 70, x2: 160, y2: 240, stroke: INK, "stroke-width": 4 }, g);
    // clock, mid-afternoon
    el("circle", { cx: 440, cy: 140, r: 44, fill: "#fff", stroke: INK, "stroke-width": 4 }, g);
    const hourHand = el("line", { x1: 440, y1: 140, x2: 440, y2: 116, stroke: INK, "stroke-width": 5, "stroke-linecap": "round" }, g);
    const minHand = el("line", { x1: 440, y1: 140, x2: 440, y2: 106, stroke: BLUE, "stroke-width": 3.5, "stroke-linecap": "round" }, g);
    el("circle", { cx: 440, cy: 140, r: 5, fill: INK }, g);
    const time = text(g, 440, 222, "", { size: 20, weight: 800 });
    // floor and sofa
    el("line", { x1: 0, y1: 500, x2: 600, y2: 500, stroke: INK, "stroke-width": 4, "stroke-linecap": "round" }, g);
    el("rect", { x: 214, y: 470, width: 14, height: 30, fill: INK }, g);
    el("rect", { x: 512, y: 470, width: 14, height: 30, fill: INK }, g);
    el("rect", { x: 196, y: 290, width: 348, height: 130, rx: 34, fill: "#2847B8" }, g);
    el("rect", { x: 232, y: 352, width: 80, height: 54, rx: 22, fill: "#fff", stroke: INK, "stroke-width": 3 }, g);
    const lump = el("ellipse", { cx: 386, cy: 384, rx: 120, fill: AMBER }, g);
    const blanket = el("rect", { x: 258, y: 372, height: 62, rx: 24, fill: AMBER }, g);
    el("rect", { x: 180, y: 392, width: 380, height: 82, rx: 26, fill: BLUE }, g);
    el("rect", { x: 170, y: 340, width: 52, height: 134, rx: 24, fill: BLUE }, g);
    el("rect", { x: 518, y: 340, width: 52, height: 134, rx: 24, fill: BLUE }, g);
    const drape = el("path", { fill: AMBER }, g);
    const zs = [0, 1, 2].map(() => text(g, 0, 0, "z", { size: 34, weight: 800, fill: INK }));
    // school bag and football by the door
    const bag = el("g", {}, g);
    el("path", { d: "M-22,-84 Q-22,-108 0,-108 Q22,-108 22,-84", fill: "none", stroke: INK, "stroke-width": 5, "stroke-linecap": "round" }, bag);
    el("rect", { x: -40, y: -90, width: 80, height: 90, rx: 18, fill: AMBER, stroke: INK, "stroke-width": 4 }, bag);
    el("rect", { x: -26, y: -46, width: 52, height: 32, rx: 9, fill: "none", stroke: INK, "stroke-width": 3 }, bag);
    const ball = el("g", {}, g);
    el("circle", { r: 27, fill: "#fff", stroke: INK, "stroke-width": 4 }, ball);
    el("polygon", { points: "0,-11 10.5,-3.4 6.5,9 -6.5,9 -10.5,-3.4", fill: INK }, ball);
    [[0, -11, 0, -27], [10.5, -3.4, 25.7, -8.3], [6.5, 9, 15.9, 21.8], [-6.5, 9, -15.9, 21.8], [-10.5, -3.4, -25.7, -8.3]]
      .forEach(([x1, y1, x2, y2]) => el("line", { x1, y1, x2, y2, stroke: INK, "stroke-width": 3 }, ball));
    return h => {
      const m = lerp(15 * 60 + 50, 16 * 60 + 30, h);
      hourHand.setAttribute("transform", `rotate(${(m / 60 % 12) * 30} 440 140)`);
      minHand.setAttribute("transform", `rotate(${(m % 60) * 6} 440 140)`);
      time.textContent = `${Math.floor(m / 60) - 12}:${String(Math.floor(m % 60)).padStart(2, "0")} pm`;
      sun.setAttribute("cx", lerp(96, 214, h)); sun.setAttribute("cy", lerp(112, 170, h));
      const bd = bounce(span(h, 0.04, 0.2));
      bag.setAttribute("transform", `translate(84,${lerp(-120, 498, bd).toFixed(1)}) rotate(${(-14 * smooth(span(h, 0.12, 0.22))).toFixed(1)})`);
      const roll = 1 - (1 - span(h, 0.2, 0.42)) ** 3, bx = lerp(700, 158, roll);
      ball.setAttribute("transform", `translate(${bx.toFixed(1)},471) rotate(${((bx - 700) / 27 * 57.3).toFixed(1)})`);
      const cover = smooth(span(h, 0.42, 0.62));
      blanket.setAttribute("width", Math.max(0, 258 * cover));
      blanket.setAttribute("opacity", cover > 0 ? 1 : 0);
      lump.setAttribute("ry", 34 * cover);
      const right = 258 + 258 * cover;
      drape.setAttribute("d", cover < 0.05 ? "" : `M258,392 H${right} V${392 + 40 * cover} Q${(258 + right) / 2},${392 + 62 * cover} 258,${392 + 44 * cover} Z`);
      zs.forEach((z, k) => {
        const p = (h * 3.2 + k / 3) % 1, show = span(h, 0.62, 0.7);
        z.setAttribute("x", 292 + k * 6 + p * 46); z.setAttribute("y", 336 - p * 96);
        z.setAttribute("font-size", 20 + p * 22);
        z.setAttribute("opacity", (Math.sin(Math.PI * p) * show).toFixed(3));
      });
    };
  }

  // 4. Thinner: the scale drops and the belt tightens, week by week
  function thinner(g, uid) {
    el("rect", { x: 130, y: 70, width: 340, height: 230, rx: 34, fill: "#fff", stroke: INK, "stroke-width": 4 }, g);
    el("path", { d: "M186,250 A114,114 0 0 1 414,250", fill: "none", stroke: "#E3E7EE", "stroke-width": 26, "stroke-linecap": "round" }, g);
    for (let i = 0; i <= 10; i++) {
      const a = (-90 + i * 18) * Math.PI / 180, r1 = i % 5 === 0 ? 92 : 100;
      el("line", { x1: 300 + Math.sin(a) * r1, y1: 250 - Math.cos(a) * r1, x2: 300 + Math.sin(a) * 126, y2: 250 - Math.cos(a) * 126, stroke: INK, "stroke-width": i % 5 === 0 ? 4 : 2.5, "stroke-linecap": "round" }, g);
    }
    const trail = el("path", { fill: "none", stroke: AMBER, "stroke-width": 10, "stroke-linecap": "round", opacity: 0.55 }, g);
    const needle = el("line", { x1: 300, y1: 250, x2: 300, y2: 140, stroke: BLUE, "stroke-width": 7, "stroke-linecap": "round" }, g);
    el("circle", { cx: 300, cy: 250, r: 13, fill: INK }, g);
    const when = chip(g, 300, 344, 220);
    // belt
    const clip = el("clipPath", { id: "belt-" + uid }, g);
    el("rect", { x: 14, y: 400, width: 572, height: 110, rx: 14 }, clip);
    const strap = el("g", {}, el("g", { "clip-path": `url(#belt-${uid})` }, g));
    el("rect", { x: -200, y: 426, width: 900, height: 58, rx: 12, fill: "#8A5A1F" }, strap);
    el("rect", { x: -200, y: 434, width: 900, height: 4, fill: "#A8742E" }, strap);
    el("rect", { x: -200, y: 472, width: 900, height: 4, fill: "#6E4514" }, strap);
    [0, 1, 2, 3, 4, 5].forEach(i => el("circle", { cx: 340 + i * 46, cy: 455, r: 7, fill: "#3E2708" }, strap));
    el("rect", { x: 262, y: 408, width: 76, height: 94, rx: 14, fill: "none", stroke: INK, "stroke-width": 9 }, g);
    el("line", { x1: 268, y1: 455, x2: 346, y2: 455, stroke: INK, "stroke-width": 7, "stroke-linecap": "round" }, g);
    el("rect", { x: 196, y: 420, width: 26, height: 70, rx: 6, fill: "none", stroke: "#6E4514", "stroke-width": 6 }, g);
    text(g, 300, 548, "The same belt, three notches tighter", { size: 18, fill: MUTED });
    const labels = ["Three weeks ago", "Two weeks ago", "Last week", "Today"];
    const START = 32, END = -30;
    return h => {
      // three steps down, each with a little overshoot
      let step = 0, pos = 0;
      [0.2, 0.45, 0.7].forEach((at, i) => {
        const p = span(h, at, at + 0.12);
        if (p > 0.5) step = i + 1;
        pos += p < 1 ? smooth(p) + Math.sin(p * Math.PI) * 0.12 : 1;
      });
      const a = lerp(START, END, pos / 3);
      needle.setAttribute("transform", `rotate(${a.toFixed(2)} 300 250)`);
      const pt = deg => { const r = deg * Math.PI / 180; return `${(300 + Math.sin(r) * 114).toFixed(1)},${(250 - Math.cos(r) * 114).toFixed(1)}`; };
      trail.setAttribute("d", a < START - 0.5 ? `M${pt(START)} A114,114 0 0 0 ${pt(a)}` : "");
      strap.setAttribute("transform", `translate(${(-46 * (pos)).toFixed(1)},0)`);
      when.set(labels[step]);
    };
  }

  // 5. Put together: four signs, four excuses, one answer
  function together(g) {
    const days = [];
    for (let i = 0; i < 21; i++) days.push(el("rect", { x: 197 + (i % 7) * 30, y: 16 + Math.floor(i / 7) * 30, width: 24, height: 24, rx: 6, fill: "#2A3442" }, g));
    const weeks = text(g, 300, 126, "", { size: 16, fill: "#C9D0DC" });
    const icons = [
      p => { el("rect", { x: -19, y: -30, width: 38, height: 60, rx: 5, fill: "none", stroke: "#fff", "stroke-width": 4 }, p); el("rect", { x: -11, y: -22, width: 22, height: 24, rx: 3, fill: AMBER }, p); el("circle", { cx: -10, cy: 12, r: 3.5, fill: "#fff" }, p); },
      p => { el("path", { d: "M-20,-30 L20,-30 L15,30 L-15,30 Z", fill: "none", stroke: "#fff", "stroke-width": 4, "stroke-linejoin": "round" }, p); el("path", { d: "M-17.4,2 L17.4,2 L15,27 L-15,27 Z", fill: "#9FB4FF" }, p); },
      p => { text(p, -14, 20, "z", { size: 46, weight: 800, fill: "#fff" }); text(p, 16, -6, "z", { size: 30, weight: 800, fill: AMBER }); },
      p => { el("rect", { x: -36, y: -11, width: 72, height: 22, rx: 5, fill: "#8A5A1F" }, p); el("rect", { x: -16, y: -21, width: 32, height: 42, rx: 7, fill: "none", stroke: "#fff", "stroke-width": 5 }, p); el("line", { x1: -12, y1: 0, x2: 18, y2: 0, stroke: "#fff", "stroke-width": 4, "stroke-linecap": "round" }, p); }
    ];
    const names = ["Toilet", "Thirsty", "Tired", "Thinner"];
    const excuses = ["“Drank a lot before bed”", "“It's been a hot week”", "“Probably a growth spurt”", "“Just a busy month”"];
    const spots = [[156, 196], [444, 196], [156, 466], [444, 466]];
    const lines = spots.map(([x, y]) => el("line", { x1: 300, y1: 350, x2: 300, y2: 350, stroke: BLUE, "stroke-width": 4, "stroke-linecap": "round" }, g));
    const tiles = spots.map(([x, y], i) => {
      const t = el("g", {}, g);
      el("circle", { r: 60, fill: "#2A3442" }, t);
      const ring = el("circle", { r: 60, fill: "none", stroke: BLUE, "stroke-width": 6, "stroke-dasharray": 377, transform: "rotate(-90)" }, t);
      icons[i](el("g", {}, t));
      text(t, 0, 94, names[i], { size: 26, weight: 800, fill: "#fff" });
      const ex = el("g", {}, t);
      const et = text(ex, 0, 124, excuses[i], { size: 16, weight: 400, fill: "#C9D0DC" });
      const half = excuses[i].length * 3.9;
      const strike = el("line", { x1: -half, y1: 119, y2: 119, stroke: AMBER, "stroke-width": 3, "stroke-linecap": "round" }, ex);
      return { t, ring, ex, strike, half, x, y };
    });
    const answer = el("g", {}, g);
    el("rect", { x: -124, y: -32, width: 248, height: 64, rx: 32, fill: AMBER }, answer);
    text(answer, 0, 11, "Test today", { size: 32, weight: 800 });
    return h => {
      const filled = Math.round(span(h, 0.02, 0.3) * 21);
      days.forEach((d, i) => d.setAttribute("fill", i < filled ? AMBER : "#2A3442"));
      weeks.textContent = filled >= 21 ? "Three weeks" : filled >= 14 ? "Two weeks" : filled >= 7 ? "One week" : "";
      tiles.forEach((tile, i) => {
        const inn = smooth(span(h, 0.08 + i * 0.08, 0.16 + i * 0.08));
        tile.t.setAttribute("transform", `translate(${tile.x},${tile.y}) scale(${(0.7 + 0.3 * inn).toFixed(3)})`);
        tile.t.setAttribute("opacity", inn);
        tile.ex.setAttribute("opacity", smooth(span(h, 0.2 + i * 0.08, 0.26 + i * 0.08)) * (1 - smooth(span(h, 0.68, 0.78))));
        tile.strike.setAttribute("x2", lerp(-tile.half, tile.half, smooth(span(h, 0.52 + i * 0.035, 0.6 + i * 0.035))));
        const link = smooth(span(h, 0.66 + i * 0.03, 0.78 + i * 0.03));
        tile.ring.setAttribute("stroke-dashoffset", 377 * (1 - link));
        const dx = tile.x - 300, dy = tile.y - 350, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
        lines[i].setAttribute("x1", tile.x - ux * 60); lines[i].setAttribute("y1", tile.y - uy * 60);
        lines[i].setAttribute("x2", tile.x - ux * lerp(60, len - 20, link)); lines[i].setAttribute("y2", tile.y - uy * lerp(60, len - 20, link));
        lines[i].setAttribute("opacity", link > 0 ? 1 : 0);
      });
      const pop = smooth(span(h, 0.82, 0.92));
      answer.setAttribute("transform", `translate(300,350) scale(${(0.6 + 0.4 * pop + Math.sin(pop * Math.PI) * 0.08).toFixed(3)})`);
      answer.setAttribute("opacity", pop);
    };
  }

  // 6. The test: one drop of blood, an answer in seconds
  function test(g) {
    el("circle", { cx: 300, cy: 330, r: 250, fill: SOFT }, g);
    const strip = el("g", {}, g);
    el("rect", { x: 278, y: 96, width: 44, height: 150, rx: 8, fill: "#fff", stroke: INK, "stroke-width": 4 }, strip);
    el("rect", { x: 286, y: 104, width: 28, height: 30, rx: 5, fill: "#FFE1A6" }, strip);
    const stain = el("rect", { x: 286, y: 104, width: 28, height: 30, rx: 5, fill: RED }, strip);
    el("rect", { x: 190, y: 226, width: 220, height: 310, rx: 36, fill: INK }, g);
    el("rect", { x: 214, y: 254, width: 172, height: 132, rx: 16, fill: "#fff" }, g);
    el("circle", { cx: 300, cy: 462, r: 30, fill: "#2A3442" }, g);
    el("circle", { cx: 300, cy: 462, r: 12, fill: AMBER }, g);
    const wait = el("circle", { cx: 300, cy: 320, r: 40, fill: "none", stroke: BLUE, "stroke-width": 9, "stroke-linecap": "round", "stroke-dasharray": 251.3, transform: "rotate(-90 300 320)" }, g);
    const num = text(g, 300, 336, "", { size: 46, weight: 800 });
    const done = el("g", {}, g);
    el("circle", { cx: 300, cy: 312, r: 34, fill: BLUE }, done);
    el("path", { d: "M284,313 l11,11 l21,-23", fill: "none", stroke: "#fff", "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round" }, done);
    text(done, 300, 374, "First result ready", { size: 17, weight: 800 });
    const drop = el("path", { d: "M0,-22 C12,-4 15,4 15,10 A15,15 0 0 1 -15,10 C-15,4 -12,-4 0,-22 Z", fill: RED }, g);
    const note = chip(g, 470, 150, 190);
    return h => {
      const fall = span(h, 0.08, 0.24);
      drop.setAttribute("transform", `translate(300,${lerp(-40, 100, fall * fall).toFixed(1)}) scale(${(1 - 0.5 * span(h, 0.24, 0.28)).toFixed(2)})`);
      drop.setAttribute("opacity", fall > 0 && h < 0.28 ? 1 : 0);
      stain.setAttribute("opacity", smooth(span(h, 0.24, 0.3)));
      const run = span(h, 0.32, 0.62);
      wait.setAttribute("stroke-dashoffset", 251.3 * (1 - run));
      wait.setAttribute("opacity", run > 0 && run < 1 ? 1 : 0);
      num.textContent = run > 0 && run < 1 ? String(5 - Math.floor(run * 5)) : "";
      const ok = smooth(span(h, 0.62, 0.7));
      done.setAttribute("opacity", ok);
      done.setAttribute("transform", `translate(300,320) scale(${(0.7 + 0.3 * ok).toFixed(3)}) translate(-300,-320)`);
      note.g.setAttribute("opacity", smooth(span(h, 0.02, 0.1)));
      note.set(run >= 1 ? "The first check" : "One drop of blood");
    };
  }

  const SCENES = [
    { build: toilet,   secs: 11, bg: "#0E1633", dark: true,  still: 0.64, name: "Toilet" },
    { build: thirsty,  secs: 11, bg: "#EAF0FF", dark: false, still: 1,    name: "Thirsty" },
    { build: tired,    secs: 11, bg: "#FFF1D6", dark: false, still: 0.86, name: "Tired" },
    { build: thinner,  secs: 11, bg: "#EAF0FF", dark: false, still: 1,    name: "Thinner" },
    { build: together, secs: 12, bg: "#1B2430", dark: true,  still: 1,    name: "Put together" },
    { build: test,     secs: 10, bg: "#FFFFFF", dark: false, still: 1,    name: "What to do" }
  ];
  let total = 0;
  SCENES.forEach(s => { s.start = total; total += s.secs; });
  const FADE = 0.8;   // seconds of crossfade between scenes

  const film = document.getElementById("film");
  const caps = [...document.querySelectorAll(".cap")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Still version ---------- */
  if (reduce) {
    film.classList.add("still");
    caps.forEach(cap => {
      const i = cap.dataset.cap === "intro" ? -1 : +cap.dataset.cap;
      const s = SCENES[Math.max(0, i)];
      cap.style.setProperty("--cap-bg", i < 0 ? "#FFFFFF" : s.bg);
      const dark = i >= 0 && s.dark;
      cap.style.setProperty("--cap-fg", dark ? "#FFFFFF" : INK);
      cap.style.setProperty("--cap-soft", dark ? "#B9C4E4" : MUTED);
      cap.style.setProperty("--cap-accent", dark ? AMBER : BLUE);
      if (i < 0) return;
      const frame = document.createElement("div");
      frame.className = "frame"; frame.setAttribute("aria-hidden", "true");
      const svg = el("svg", { viewBox: "0 0 600 600" }, frame);
      s.build(el("g", {}, svg), "s" + i)(s.still);
      cap.appendChild(frame);
    });
    document.getElementById("endRow").hidden = false;
    document.querySelector("[data-replay]").hidden = true;
    return;
  }

  /* ---------- Playing version ---------- */
  const svg = document.getElementById("scene");
  SCENES.forEach((s, i) => { s.g = el("g", {}, svg); s.update = s.build(s.g, "m" + i); s.shown = null; });

  const chapters = document.getElementById("chapters");
  const bars = SCENES.map((s, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.setAttribute("aria-label", `Chapter ${i + 1}: ${s.name}`);
    b.appendChild(document.createElement("i"));
    b.addEventListener("click", () => { seek(s.start); play(); });
    chapters.appendChild(b);
    return b;
  });
  const toggle = document.getElementById("toggle"), icon = document.getElementById("toggleIcon"), clock = document.getElementById("clock");
  const endRow = document.getElementById("endRow");
  const ICONS = {
    play: '<path d="M3 1v16l13-8Z" fill="currentColor"/>',
    pause: '<rect x="2" y="1" width="5" height="16" rx="1.5" fill="currentColor"/><rect x="11" y="1" width="5" height="16" rx="1.5" fill="currentColor"/>',
    replay: '<path d="M9 3a6.5 6.5 0 1 1-6.2 4.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M1 3.5l2.2 4.2 4-2.4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  let t = 0, playing = false, started = false, last = 0, shownCap = "intro";
  const mm = s => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
  const hex = c => [1, 3, 5].map(k => parseInt(c.slice(k, k + 2), 16));

  function render() {
    const ended = t >= total;
    let current = SCENES.length - 1;
    SCENES.forEach((s, i) => { if (t < s.start + s.secs && current > i) current = i; });
    for (let i = 0; i < SCENES.length; i++) if (t >= SCENES[i].start && t < SCENES[i].start + SCENES[i].secs) current = i;

    SCENES.forEach((s, i) => {
      const local = t - s.start;
      const fadeIn = i === 0 ? 1 : clamp((local + FADE) / FADE);
      const fadeOut = i === SCENES.length - 1 ? 0 : clamp((local - (s.secs - FADE)) / FADE);
      const visible = fadeIn > 0 && fadeOut < 1 && local < s.secs + 0.001;
      if (s.shown !== visible) { s.g.style.display = visible ? "" : "none"; s.shown = visible; }
      if (!visible) return;
      const a = smooth(fadeIn), b = smooth(fadeOut);
      const scale = 0.94 + 0.06 * a + 0.07 * b;
      s.g.setAttribute("transform", `translate(300,300) scale(${scale.toFixed(4)}) translate(-300,-300)`);
      s.g.setAttribute("opacity", (a * (1 - b)).toFixed(3));
      s.update(clamp(local / (s.secs - FADE)));
    });

    // background follows the scene, blending during each crossfade
    const s = SCENES[current], next = SCENES[current + 1];
    const mix = next ? smooth(clamp((t - s.start - (s.secs - FADE)) / FADE)) : 0;
    const c1 = hex(s.bg), c2 = hex((next || s).bg);
    film.style.setProperty("--bg", `rgb(${c1.map((v, k) => Math.round(lerp(v, c2[k], mix))).join(",")})`);
    const lead = mix > 0.5 && next ? current + 1 : current;
    film.classList.toggle("light", !SCENES[lead].dark);

    const want = started ? String(lead) : "intro";
    if (want !== shownCap) { caps.forEach(c => { c.hidden = c.dataset.cap !== want; }); shownCap = want; }
    endRow.hidden = !ended;

    bars.forEach((b, i) => b.style.setProperty("--p", clamp((t - SCENES[i].start) / SCENES[i].secs).toFixed(4)));
    clock.textContent = mm(Math.min(t, total)) + " / " + mm(total);
    const state = ended ? "replay" : playing ? "pause" : "play";
    if (toggle.dataset.state !== state) {
      toggle.dataset.state = state; icon.innerHTML = ICONS[state];
      toggle.setAttribute("aria-label", state === "replay" ? "Watch again" : state === "pause" ? "Pause" : "Play");
    }
  }

  function frame(now) {
    if (!playing) return;
    t += Math.min(0.1, (now - last) / 1000); last = now;
    if (t >= total) { t = total; playing = false; }
    render();
    if (playing) requestAnimationFrame(frame);
  }
  function play() {
    if (t >= total) t = 0;
    started = true;
    if (playing) { render(); return; }
    playing = true; last = performance.now();
    requestAnimationFrame(frame); render();
  }
  function pause() { playing = false; render(); }
  function seek(to) { t = Math.max(0, Math.min(total, to)); started = true; render(); }

  toggle.addEventListener("click", () => (playing ? pause() : play()));
  document.querySelector("[data-play]").addEventListener("click", () => { play(); toggle.focus({ preventScroll: true }); });
  document.querySelector("[data-replay]").addEventListener("click", () => { t = 0; play(); });
  document.querySelector(".stage").addEventListener("click", () => (playing ? pause() : play()));
  document.addEventListener("keydown", e => {
    if (e.target.closest("a, button, input, textarea") && e.key === " ") return;
    const now = SCENES.findIndex(s => t < s.start + s.secs);
    const i = now < 0 ? SCENES.length - 1 : now;
    if (e.key === " ") { e.preventDefault(); playing ? pause() : play(); }
    else if (e.key === "ArrowRight") { seek(i < SCENES.length - 1 ? SCENES[i + 1].start : total); }
    else if (e.key === "ArrowLeft") { seek(t - SCENES[i].start > 1.5 || i === 0 ? SCENES[i].start : SCENES[i - 1].start); }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden && playing) pause(); });

  // For previews and testing: ?t=30 opens paused at 30 seconds
  const at = parseFloat(new URLSearchParams(location.search).get("t"));
  if (!isNaN(at)) seek(at); else render();
})();
