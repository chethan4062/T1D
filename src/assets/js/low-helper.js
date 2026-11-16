(() => {
  const KEY = "low-helper";
  const demo = new URLSearchParams(location.search).has("demo");   // ?demo runs a 20-second timer
  const WAIT = (demo ? 20 : 15 * 60) * 1000;
  const RING = 2 * Math.PI * 92;

  const screens = [...document.querySelectorAll(".screen")];
  const theme = document.querySelector('meta[name="theme-color"]');
  const THEME = { start: "#FFFFFF", sugar: "#F2A93B", timer: "#0E1633", check: "#2F5BEA", done: "#EEF3FF", emergency: "#1B2430" };
  const ringFill = document.getElementById("ringFill");
  const clock = document.getElementById("clock");
  ringFill.style.strokeDasharray = RING;

  let state = { screen: "start", endAt: 0, round: 1 };
  // Progress is kept for an hour, so a reload mid-way resumes but a later visit starts fresh
  const KEEP = 60 * 60 * 1000;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ ...state, at: Date.now() })); } catch (e) {} };
  const load = () => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      return s && s.at && Date.now() - s.at < KEEP ? s : null;
    } catch (e) { return null; }
  };

  /* ---------- Sound, vibration, keeping the screen on ---------- */
  let audio = null, lock = null;
  const primeAudio = () => {
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === "suspended") audio.resume(); } catch (e) {}
  };
  const chime = () => {
    try { navigator.vibrate && navigator.vibrate([400, 150, 400, 150, 400]); } catch (e) {}
    if (!audio) return;
    [0, 0.45, 0.9].forEach((at, i) => {
      const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime + at;
      o.type = "sine"; o.frequency.value = i === 2 ? 880 : 660;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.4, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
      o.connect(g).connect(audio.destination); o.start(t); o.stop(t + 0.4);
    });
  };
  const keepAwake = async on => {
    try {
      if (on && "wakeLock" in navigator && !lock) { lock = await navigator.wakeLock.request("screen"); lock.addEventListener("release", () => { lock = null; }); }
      if (!on && lock) { await lock.release(); lock = null; }
    } catch (e) { lock = null; }
  };

  /* ---------- Timer ---------- */
  const calm = [
    ["Stay with them", "Have them sit down. The sugar needs time to work."],
    ["This is normal", "It can take 10 to 15 minutes before they feel better."],
    ["Keep them still", "No walking it off. Resting helps the sugar do its job."],
    ["Keep talking", "Ask simple questions. If they stop making sense, tap “They're getting worse”."],
    ["Nearly there", "When the timer ends, they'll check their blood sugar again."]
  ];
  let tick = null, calmShown = -1;
  const calmTitle = document.getElementById("calmTitle"), calmText = document.getElementById("calmText");

  function drawTimer() {
    const left = Math.max(0, state.endAt - Date.now());
    const secs = Math.ceil(left / 1000);
    clock.textContent = Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0");
    ringFill.style.strokeDashoffset = RING * (left / WAIT);
    document.title = (left > 0 ? clock.textContent + " · " : "") + "Low helper";
    const i = Math.min(calm.length - 1, Math.floor((1 - left / WAIT) * calm.length));
    if (i !== calmShown) {
      calmShown = i;
      calmTitle.textContent = calm[i][0]; calmText.textContent = calm[i][1];
      calmTitle.parentElement.classList.remove("fade"); void calmTitle.offsetWidth; calmTitle.parentElement.classList.add("fade");
    }
    if (left <= 0) { chime(); go("check"); }
  }
  function startTimer(fresh) {
    if (fresh) state.endAt = Date.now() + WAIT;
    calmShown = -1;
    clearInterval(tick);
    drawTimer();
    if (state.screen === "timer") tick = setInterval(drawTimer, 250);
    keepAwake(true);
  }
  function stopTimer() { clearInterval(tick); tick = null; keepAwake(false); document.title = "Low helper · Type 1, explained"; }

  /* ---------- Moving between screens ---------- */
  function go(name, opts = {}) {
    if (name === "again") { state.round += 1; name = "sugar"; }
    if (name === "start") state.round = 1;
    const leavingTimer = state.screen === "timer" && name !== "timer";
    state.screen = name;
    if (leavingTimer) stopTimer();

    screens.forEach(s => { s.hidden = s.dataset.name !== name; });
    document.body.dataset.screen = name;
    theme.setAttribute("content", THEME[name]);

    if (name === "sugar") {
      const r = state.round;
      document.getElementById("sugarStep").textContent = r === 1 ? "Step 1 of 3" : "Round " + r;
      document.getElementById("sugarTitle").textContent = r === 1 ? "Give fast sugar now" : "Give the same again";
      document.getElementById("sugarLede").textContent = r >= 4
        ? "Three rounds have not worked. Call your local medical emergency number now."
        : r === 3 ? "A third try. If this one does not work either, call your local medical emergency number."
        : r === 2 ? "Another 15 grams. Any one of these, then wait again."
        : "Any one of these. About 15 grams of sugar.";
    }
    if (name === "timer") startTimer(!opts.resume);
    save();
    if (!opts.quiet) {
      window.scrollTo(0, 0);
      const h = document.querySelector('.screen[data-name="' + name + '"] h1, .screen[data-name="' + name + '"] .step');
      if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    }
  }

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-go]");
    if (!b) return;
    primeAudio();
    go(b.dataset.go);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && state.screen === "timer") { drawTimer(); keepAwake(true); }
  });

  /* ---------- Pick up where we left off ---------- */
  const saved = load();
  if (saved && saved.screen === "timer" && saved.endAt) {
    state = saved;
    if (saved.endAt > Date.now()) go("timer", { resume: true, quiet: true });
    else go("check", { quiet: true });
  } else if (saved && ["sugar", "check"].includes(saved.screen)) {
    state = saved; go(saved.screen, { quiet: true });
  }

  /* ---------- Work offline ---------- */
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => { navigator.serviceWorker.register(document.documentElement.dataset.root + "sw.js").catch(() => {}); });
  }
})();
