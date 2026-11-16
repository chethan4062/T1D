// Old links to the sources list on this page now go to the sources page
if (location.hash === "#sources") location.replace(document.documentElement.dataset.root + "about/sources/");

(() => {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById("scene");
  const pLayer = document.getElementById("particles");
  const dLayer = document.getElementById("doors");
  const cell = { x: 580, y: 168, r: 112 };
  const core = document.getElementById("core");
  const caption = document.getElementById("caption");
  const levelEl = document.getElementById("level");
  const fill = document.getElementById("fill");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const captions = {
    healthy: "The pancreas makes insulin. Insulin unlocks your cells, sugar moves in, and you get energy.",
    t1d: "The immune system has destroyed the cells that make insulin. With no key, sugar piles up in the blood while the cells go hungry.",
    treated: "People with type 1 replace the missing key with insulin from injections or a pump, so sugar can reach the cells again."
  };

  let mode = "healthy";

  // Doors on the left side of the cell membrane
  const doorAngles = [140, 165, 195, 220].map(a => a * Math.PI / 180);
  const doors = doorAngles.map(a => {
    const x = cell.x + cell.r * Math.cos(a), y = cell.y + cell.r * Math.sin(a);
    const g = document.createElementNS(NS, "g");
    const deg = a * 180 / Math.PI + 180;
    g.setAttribute("transform", `translate(${x} ${y}) rotate(${deg})`);
    // gap in membrane
    const gap = document.createElementNS(NS, "rect");
    gap.setAttribute("x", -3); gap.setAttribute("y", -9);
    gap.setAttribute("width", 6); gap.setAttribute("height", 18);
    gap.setAttribute("fill", "#EEF3FF");
    g.appendChild(gap);
    // key (points outward)
    const key = document.createElementNS(NS, "g");
    key.innerHTML = '<circle cx="18" cy="0" r="6" fill="#F2A93B"/><rect x="0" y="-2.5" width="14" height="5" rx="2" fill="#F2A93B"/><rect x="3" y="2" width="3" height="4" fill="#F2A93B"/>';
    key.style.transition = "opacity .5s, transform .5s";
    g.appendChild(key);
    dLayer.appendChild(g);
    return { x, y, key, cool: 0 };
  });

  const hexPts = "7,0 3.5,6.06 -3.5,6.06 -7,0 -3.5,-6.06 3.5,-6.06";
  const parts = [];
  function spawn(x, y) {
    const el = document.createElementNS(NS, "polygon");
    el.setAttribute("points", hexPts);
    el.setAttribute("fill", "#FFFFFF");
    el.setAttribute("stroke", "#2F5BEA");
    el.setAttribute("stroke-width", "2");
    pLayer.appendChild(el);
    parts.push({
      el, x: x ?? -10, y: y ?? 24 + Math.random() * 270,
      vx: 0.5 + Math.random() * 0.6, vy: (Math.random() - 0.5) * 0.6,
      rot: Math.random() * 60, state: "free", t: 0, door: null, o: 1
    });
  }

  let energy = 0.5;
  function working() { return mode !== "t1d"; }

  function setMode(m) {
    mode = m;
    document.querySelectorAll(".controls button").forEach(b =>
      b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
    caption.textContent = captions[m];
    doors.forEach((d, i) => {
      if (m === "t1d") {
        d.key.style.opacity = 0;
        d.key.style.transform = "translateX(30px)";
      } else {
        d.key.style.transitionDelay = (m === "treated" ? i * 0.15 : 0) + "s";
        d.key.style.opacity = 1;
        d.key.style.transform = "translateX(0)";
      }
    });
    if (reduce) staticFrame();
  }
  document.querySelectorAll(".controls button").forEach(b =>
    b.addEventListener("click", () => setMode(b.dataset.mode)));

  function updateMeter() {
    const free = parts.filter(p => p.state === "free").length;
    const pct = Math.min(100, 12 + free * 1.6);
    fill.style.width = pct + "%";
    let label = "steady";
    if (pct > 75) label = "high";
    else if (pct > 45) label = "rising";
    levelEl.textContent = label;
    fill.style.background = pct > 75 ? "#D6455D" : "#2F5BEA";
  }

  let last = 0, spawnTimer = 0;
  function tick(now) {
    const dt = Math.min(48, now - (last || now)); last = now;
    spawnTimer += dt;
    if (spawnTimer > 650 && parts.length < 64) { spawn(); spawnTimer = 0; }

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      const k = dt / 16;
      if (p.state === "free") {
        p.vx += (Math.random() - 0.5) * 0.08 + 0.006;
        p.vy += (Math.random() - 0.5) * 0.08;
        p.vx = Math.max(-0.9, Math.min(1.1, p.vx));
        p.vy = Math.max(-0.8, Math.min(0.8, p.vy));
        p.x += p.vx * k; p.y += p.vy * k;
        p.rot += 0.4 * k;
        // walls
        if (p.y < 12) { p.y = 12; p.vy = Math.abs(p.vy); }
        if (p.y > 300) { p.y = 300; p.vy = -Math.abs(p.vy); }
        if (p.x > 788) { p.x = 788; p.vx = -Math.abs(p.vx); }
        if (p.x < -12) { p.x = -12; p.vx = Math.abs(p.vx); }
        // cell membrane
        const dx = p.x - cell.x, dy = p.y - cell.y, dist = Math.hypot(dx, dy);
        if (dist < cell.r + 10) {
          if (working()) {
            const d = doors.find(d => d.cool <= 0 && Math.hypot(p.x - d.x, p.y - d.y) < 40);
            if (d) { p.state = "entering"; p.door = d; p.t = 0; p.sx = p.x; p.sy = p.y; d.cool = 500; continue; }
          }
          const nx = dx / dist, ny = dy / dist;
          p.x = cell.x + nx * (cell.r + 10); p.y = cell.y + ny * (cell.r + 10);
          const dot = p.vx * nx + p.vy * ny;
          p.vx -= 2 * dot * nx; p.vy -= 2 * dot * ny;
        }
      } else if (p.state === "entering") {
        p.t += dt / 900;
        const d = p.door;
        const tx = cell.x + (d.x - cell.x) * 0.35, ty = cell.y + (d.y - cell.y) * 0.35;
        if (p.t < 0.4) {
          const u = p.t / 0.4;
          p.x = p.sx + (d.x - p.sx) * u; p.y = p.sy + (d.y - p.sy) * u;
        } else {
          const u = (p.t - 0.4) / 0.6;
          p.x = d.x + (tx - d.x) * u; p.y = d.y + (ty - d.y) * u;
          p.o = 1 - u;
        }
        if (p.t >= 1) { p.el.remove(); parts.splice(i, 1); energy = Math.min(1, energy + 0.12); continue; }
      }
      p.el.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(0)})`);
      p.el.setAttribute("opacity", p.o.toFixed(2));
    }
    doors.forEach(d => d.cool -= dt);
    energy = Math.max(0.08, energy - dt * 0.00012);
    core.setAttribute("opacity", (0.15 + energy * 0.7).toFixed(2));
    core.setAttribute("r", (26 + energy * 14).toFixed(1));
    updateMeter();
    requestAnimationFrame(tick);
  }

  function staticFrame() {
    parts.forEach(p => p.el.remove()); parts.length = 0;
    const n = mode === "t1d" ? 42 : 10;
    for (let i = 0; i < n; i++) {
      spawn(20 + Math.random() * 380, 25 + Math.random() * 270);
      const p = parts[parts.length - 1];
      p.el.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${p.rot})`);
    }
    energy = mode === "t1d" ? 0.1 : 0.9;
    core.setAttribute("opacity", (0.15 + energy * 0.7).toFixed(2));
    updateMeter();
  }

  if (reduce) { staticFrame(); }
  else {
    for (let i = 0; i < 14; i++) spawn(Math.random() * 400, 25 + Math.random() * 270);
    requestAnimationFrame(tick);
  }
})();

// Video: load the YouTube player only when someone presses play
(() => {
  const poster = document.getElementById("videoPoster");
  if (!poster) return;
  poster.addEventListener("click", e => {
    e.preventDefault();
    const frame = document.createElement("iframe");
    frame.src = "https://www.youtube-nocookie.com/embed/" + poster.dataset.id + "?autoplay=1&rel=0";
    frame.title = "What is type 1 diabetes? (video)";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    poster.replaceWith(frame);
    frame.focus();
  });
})();

// Myth cards: tap to flip
document.querySelectorAll(".myth").forEach(card => {
  card.addEventListener("click", () => {
    card.setAttribute("aria-pressed", card.getAttribute("aria-pressed") === "true" ? "false" : "true");
  });
});

// A day with type 1
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById("dayChart");
  const slider = document.getElementById("dayTime");
  const F = "Bricolage Grotesque, sans-serif";
  const X0 = 70, X1 = 1010, Y0 = 40, Y1 = 320, T0 = 7, T1 = 23, G0 = 40, G1 = 260;
  const x = t => X0 + (t - T0) / (T1 - T0) * (X1 - X0);
  const y = g => Y1 - (g - G0) / (G1 - G0) * (Y1 - Y0);
  const el = (name, attrs, text) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    svg.appendChild(e);
    return e;
  };

  // Target band, 70 to 180 mg/dL
  el("rect", { x: X0, y: y(180), width: X1 - X0, height: y(70) - y(180), fill: "#FFFFFF", rx: 10 });
  el("text", { class: "band", x: x(16.1), y: y(180) + 24, "font-family": F, "font-size": 13, "font-weight": 600, fill: "#5F6878" }, "Target range");
  [70, 180, 250].forEach(g =>
    el("text", { x: X0 - 12, y: y(g) + 5, "text-anchor": "end", "font-family": F, "font-size": 13, fill: "#5F6878" }, g));
  el("text", { class: "unit", x: X0 - 12, y: Y0 - 14, "text-anchor": "end", "font-family": F, "font-size": 12, fill: "#5F6878" }, "mg/dL");
  [[7, "7 am"], [10, "10 am"], [13, "1 pm"], [16, "4 pm"], [19, "7 pm"], [22, "10 pm"]].forEach(([t, label]) =>
    el("text", { x: x(t), y: Y1 + 28, "text-anchor": "middle", "font-family": F, "font-size": 13, fill: "#5F6878" }, label));

  // Example readings: [hour, mg/dL]
  const pts = [[7,110],[7.5,118],[8.2,165],[9,188],[9.8,150],[10.5,125],[11.2,98],[12,92],[12.5,105],[13.3,170],[14,160],[14.6,112],[15.15,62],[15.6,84],[16.2,118],[17,128],[18,120],[18.6,128],[19.5,176],[20.3,158],[21.2,132],[22,120],[23,114]];

  // Smooth curve through the readings, also sampled so the marker can follow it
  const P = pts.map(([t, g]) => [x(t), y(g)]);
  const samples = [];
  let d = `M${P[0][0]},${P[0][1]}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(i - 1, 0)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(i + 2, P.length - 1)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    for (let k = 0; k <= 24; k++) {
      const u = k / 24, v = 1 - u;
      samples.push([
        v*v*v*p1[0] + 3*v*v*u*c1[0] + 3*v*u*u*c2[0] + u*u*u*p2[0],
        v*v*v*p1[1] + 3*v*v*u*c1[1] + 3*v*u*u*c2[1] + u*u*u*p2[1]
      ]);
    }
  }
  el("path", { d, fill: "none", stroke: "#2F5BEA", "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round" });

  const curveY = px => {
    let i = 1;
    while (i < samples.length - 1 && samples[i][0] < px) i++;
    const [ax, ay] = samples[i - 1], [bx, by] = samples[i];
    return bx === ax ? by : ay + (by - ay) * (px - ax) / (bx - ax);
  };

  // The story of the day. "jump" entries get a button.
  const moments = [
    { t: 7,     title: "Wake up", text: "Maya checks the sensor on her arm before getting out of bed. She's in range, a good start to the day." },
    { t: 7.5,   jump: "Breakfast", title: "Breakfast", text: "She counts the carbs in her cereal and takes insulin to match. Sugar rises after eating, then comes back down as the insulin works." },
    { t: 11.2,  jump: "PE class", title: "PE class", text: "Exercise uses up sugar, so her level drifts down. She checks before class and keeps juice in her bag just in case." },
    { t: 12.5,  jump: "Lunch", title: "Lunch", text: "Carbs counted, insulin taken. Her sugar climbs after the meal and settles again over the next couple of hours." },
    { t: 14.6,  title: "Dropping fast", text: "The insulin from lunch is still working and PE used up more sugar than expected. Her level is falling quickly." },
    { t: 15.0,  jump: "Low", jumpTo: 15.15, title: "A low after PE", text: "Maya feels shaky and her sensor alarm goes off. She drinks a juice box and sits down for a few minutes." },
    { t: 15.6,  title: "Back in range", text: "Twenty minutes later the juice has done its job. She has a small snack to stay steady and carries on with her afternoon." },
    { t: 18.6,  jump: "Dinner", title: "Dinner", text: "Dinner with the family. Same routine as every meal: count the carbs, take the insulin, then eat." },
    { t: 22,    jump: "Bedtime", title: "Bedtime", text: "One last check. Overnight, her sensor keeps watch and will sound an alarm to wake her and her parents if she goes low." }
  ];

  // Dots on the curve for the main moments
  moments.filter(m => m.jump).forEach(m => {
    const t = m.jumpTo || m.t;
    el("circle", { cx: x(t), cy: curveY(x(t)), r: 5, fill: "#FFFFFF", stroke: "#2F5BEA", "stroke-width": 3 });
  });

  const guide = el("line", { y1: Y0 - 6, y2: Y1 + 8, stroke: "#1B2430", "stroke-width": 1.5, "stroke-dasharray": "4 5" });
  const marker = el("circle", { r: 10, fill: "#F2A93B", stroke: "#1B2430", "stroke-width": 3 });

  const jump = document.getElementById("dayJump");
  const buttons = moments.filter(m => m.jump).map(m => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = m.jump;
    b.addEventListener("click", () => { slider.value = m.jumpTo || m.t; render(); });
    jump.appendChild(b);
    return { b, m };
  });

  const clock = t => {
    let h = Math.floor(t + 1e-6), min = Math.round((t - h) * 60);
    if (min === 60) { h += 1; min = 0; }
    return `${((h + 11) % 12) + 1}:${String(min).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
  };

  function render() {
    const t = parseFloat(slider.value);
    const px = x(t), py = curveY(px);
    const g = Math.round(G0 + (Y1 - py) / (Y1 - Y0) * (G1 - G0));
    guide.setAttribute("x1", px); guide.setAttribute("x2", px);
    marker.setAttribute("cx", px); marker.setAttribute("cy", py);

    let now = moments[0];
    for (const m of moments) if (m.t <= t + 1e-6) now = m;
    document.getElementById("dayTitle").textContent = `${clock(t)} · ${now.title}`;
    document.getElementById("dayText").textContent = now.text;
    document.getElementById("dayValue").textContent = g;
    document.getElementById("dayStatus").textContent =
      (g < 70 ? "below target range" : g > 180 ? "above target range" : "in target range") +
      ` · ${(g / 18).toFixed(1)} mmol/L`;
    slider.setAttribute("aria-valuetext", `${clock(t)}, ${g} milligrams per decilitre`);
    buttons.forEach(({ b, m }) => b.setAttribute("aria-pressed", m === now ? "true" : "false"));
  }

  slider.addEventListener("input", render);
  render();
})();
