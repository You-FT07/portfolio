/* =========================================================
   main.js
   index.html の一番下（</body> の直前）で読み込む
   ========================================================= */
"use strict";
 
const root = document.documentElement;   // <html> タグ。色の設定（data-theme / data-team）はここに付ける
root.classList.add("js");   // 「JavaScriptが動いている」目印（CSSが見る）
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 
/* ---------------------------------------------------------
   1. 設定の保存と読み込み（次に開いたときも、同じ色で表示する）
   --------------------------------------------------------- */
function load(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* 保存できなくても、そのまま動く */ }
}
 
/* ---------------------------------------------------------
   2. デイ / ナイトの切り替え
   --------------------------------------------------------- */
function initTheme() {
  root.dataset.theme = load("theme", "light");
 
  const button = document.getElementById("theme-toggle");
  if (!button) return;
  button.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    save("theme", next);
  });
}
 
/* ---------------------------------------------------------
   3. 推しカラー（ベイスターズ / ホークス）の切り替え
   --------------------------------------------------------- */
function initTeam() {
  const buttons = document.querySelectorAll("button[data-team]");
 
  function setTeam(team) {
    root.dataset.team = team;
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.team === team)));
    save("team", team);
  }
 
  setTeam(load("team", "bay"));
  buttons.forEach((b) => {
    b.addEventListener("click", () => {
      setTeam(b.dataset.team);
      if (navigator.vibrate) navigator.vibrate(12);   // スマホでは、軽く振動する
    });
  });
}
 
/* ---------------------------------------------------------
   4. ドット絵（文字で絵を描いて、四角を並べて表示する）
   . は何も描かない / 他の文字は PALETTE の色になる
   --------------------------------------------------------- */
const PALETTE = {
  k: "#0A1F4D", w: "#FFFFFF", r: "#E8452F", y: "#FFD500", o: "#D9A05B",
  n: "var(--accent)", d: "var(--hi)", c: "#FFFFFF", i: "var(--ink)", f: "#F6CFA6", j: "var(--accent)",
  u: "var(--hi-ink)",
};
 
const SPRITES = {
  ball: [
    "....kkkk....", "..kkwwwwkk..", ".kwwwwwwwwk.", ".kwrwwwwrwk.", "kwwrwwwwrwwk", "kwwwrwwrwwwk",
    "kwwwrwwrwwwk", "kwwrwwwwrwwk", ".kwrwwwwrwk.", ".kwwwwwwwwk.", "..kkwwwwkk..", "....kkkk....",
  ],
  cap: [
    ".....nnnnnn.....", "...nnnnnnnnnn...", "..nnnnnnnnnnnn..", ".nnnnnnwwnnnnnn.",
    ".nnnnnnwwnnnnnn.", "nnnnnnnnnnnnnnnn", "dddddddddddddddd", "..dddddddddddd..",
  ],
  bat: [
    "..........oooooooooooo..", "kkoooooooooooooooooooooo", "..........oooooooooooo..",
  ],
  star: [
    "....y....", "...yyy...", "yyyyyyyyy", ".yyyyyyy.", "..yyyyy..", ".yyyyyyy.", ".yyy.yyy.", ".yy...yy.", "y.......y",
  ],
  cloud: [
    "....cccc........", "..cccccccccc....", ".cccccccccccccc.", "cccccccccccccccc", ".cccccccccccccc.",
  ],
  player: [
    "....nnnnnn....", "...nnnnnnnn...", "..nnnnnnnnnn..", "..dddddddddddd", "...ffffffff...", "...fkffffkf...",
    "...ffffffff...", "...fffrrfff...", "....ffffff....", "..jjjjjjjjjj..", ".jjjjjjjjjjjj.", ".jjjjjjjjjjjj.",
    ".jjjjjjjjjjjj.", ".jjjjjjjjjjjj.", "..jjjjjjjjjj..",
  ],
  runnerA: [
    "....uuuuu.....", "...uuuuuuu....", "...uuuuuuwww..", "....ffffff....", "....fffkff....", "....ffffff....",
    ".....ffff.....", "..uuuuuuuu....", ".uuuuuuuuuuff.", "ffuuuuuuuu....", "..uuuuuuuu....", "..wwwwwwww....",
    "..wwwwwwww....", ".wwww..wwwww..", ".www....wwwww.", "www......wwww.", "uu........uuu.", "u..........uu.",
  ],
  runnerB: [
    "....uuuuu.....", "...uuuuuuu....", "...uuuuuuwww..", "....ffffff....", "....fffkff....", "....ffffff....",
    ".....ffff.....", "..uuuuuuuu....", "ffuuuuuuuu....", ".uuuuuuuuuuff.", "..uuuuuuuu....", "..wwwwwwww....",
    "..wwwwwwww....", "...wwwwwww....", "....ww..ww....", "....ww..ww....", "....uu..uuu...", "..............",
  ],
  bird: [
    "ii..........ii", ".iii......iii.", "..iiiiiiiiii..", "....iiiiii....", "......ii......",
  ],
};
 
// 絵の名前と、1マスの大きさ(px)を渡すと、SVGの文字列を返す
function sprite(name, px) {
  const rows = SPRITES[name];
  const height = rows.length;
  const width = rows[0].length;
  let rects = "";
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== ".") rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${PALETTE[ch]}"/>`;
    });
  });
  return `<svg width="${width * px}" height="${height * px}" viewBox="0 0 ${width} ${height}">${rects}</svg>`;
}
 
function initStage() {
  const stage = document.querySelector(".stage");
  if (!stage) return;
  stage.innerHTML = `
    <span class="stage_cloud stage_cloud--1">${sprite("cloud", 6)}</span>
    <span class="stage_cloud stage_cloud--2">${sprite("cloud", 4)}</span>
    <span class="stage_bird">${sprite("bird", 3)}</span>
    <span class="stage_star stage_star--1">${sprite("star", 5)}</span>
    <span class="stage_star stage_star--2">${sprite("star", 3)}</span>
    <span class="stage_bat">${sprite("bat", 8)}</span>
    <span class="stage_ball">${sprite("ball", 7)}</span>
    <span class="stage_hit">HIT!</span>
    <span class="stage_cap">${sprite("cap", 8)}</span>`;
}
 
/* ---------------------------------------------------------
   5. 「いま勉強中」の言葉が入れ替わる
   --------------------------------------------------------- */
function initLearning() {
  const el = document.getElementById("learning-word");
  if (!el || prefersReduced) return;
 
  const words = ["Spring Boot", "Java", "JavaScript", "AWS"];   // ← 増やしたいときは、ここに足す
  let i = 0;
 
  setInterval(() => {
    i = (i + 1) % words.length;          // 0 → 1 → 2 → 0 …と繰り返す
    el.textContent = words[i];
    el.classList.remove("is-swap");
    void el.offsetWidth;                 // アニメーションをやり直すための、おまじない
    el.classList.add("is-swap");
  }, 2600);
}
 
/* ---------------------------------------------------------
   6. 制作物の詳細ウィンドウ（dialog）
   --------------------------------------------------------- */
function initDialogs() {
  // 開く：中身に番号を付けて、上から順番に出るようにする
  function openDialog(dialog) {
    dialog.scrollTop = 0;
    const items = [];
    Array.from(dialog.children).forEach((child) => {
      if (child.classList.contains("work-dialog_close")) return;                 // ×ボタンは、そのまま
      if (child.classList.contains("work-dialog_shots")) items.push(...child.children);   // 写真は、1枚ずつ
      else items.push(child);
    });
    items.forEach((el, i) => {
      el.classList.add("dialog-item");
      el.style.setProperty("--i", String(i));    // 番号が大きいほど、遅れて出る
    });
    dialog.showModal();
  }
 
  // 閉じる：すぐ閉じずに、閉じるアニメーションが終わってから閉じる
  function closeDialog(dialog) {
    if (!dialog.open || dialog.classList.contains("is-closing")) return;
    if (prefersReduced) { dialog.close(); return; }
    dialog.classList.add("is-closing");
    dialog.addEventListener("animationend", function done(e) {
      if (e.target !== dialog || e.pseudoElement) return;
      dialog.removeEventListener("animationend", done);
      dialog.classList.remove("is-closing");
      dialog.close();
    });
  }
 
  // 「詳しく見る」ボタン → data-open と同じ id の dialog を開く
  document.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = document.getElementById(button.dataset.open);
      if (dialog && typeof dialog.showModal === "function") openDialog(dialog);
    });
  });
 
  document.querySelectorAll("dialog").forEach((dialog) => {
    const close = dialog.querySelector("[data-close]");
    if (close) close.addEventListener("click", () => closeDialog(dialog));   // ×ボタン
    dialog.addEventListener("click", (e) => {                               // 外側をクリック
      if (e.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener("cancel", (e) => {                              // Escキー
      e.preventDefault();
      closeDialog(dialog);
    });
  });
}
 
/* ---------------------------------------------------------
   7. ローディング画面（0%から100%まで数えて、幕が上がる）
   --------------------------------------------------------- */
function buildBoard() {
  const win = [0, 1, 0, 0, 2, 0, 1, 0, 3];    // 勝つ側の、1〜9回の得点
  const lose = [1, 0, 0, 2, 0, 0, 0, 1, 0];   // 負ける側
  const hawksWin = root.dataset.team === "hawks";
  const rows = [
    { name: "BAYSTARS", cls: "bay",   scores: hawksWin ? lose : win, h: hawksWin ? 7 : 11, e: hawksWin ? 1 : 0 },
    { name: "HAWKS",    cls: "hawks", scores: hawksWin ? win : lose, h: hawksWin ? 11 : 7, e: hawksWin ? 0 : 1 },
  ];
  const sum = (a) => a.reduce((x, y) => x + y, 0);
 
  let html = "<span></span>";
  for (let i = 0; i < 9; i++) html += `<span class="b_h" data-i="${i}">${i + 1}</span>`;
  html += `<span class="b_h b_t">R</span><span class="b_h b_t">H</span><span class="b_h b_t">E</span>`;
  rows.forEach((r) => {
    html += `<span class="b_n b_n--${r.cls}">${r.name}</span>`;
    r.scores.forEach((s, i) => { html += `<span class="b_c b_c--${r.cls}" data-i="${i}">${s}</span>`; });
    [sum(r.scores), r.h, r.e].forEach((v) => { html += `<span class="b_c b_c--${r.cls} b_t">${v}</span>`; });
  });
  return `<div class="loader_board" aria-hidden="true">${html}</div>`;
}
 
function runLoader() {
  const loader = document.getElementById("loader");
  if (!loader || prefersReduced) return;          // 「動きを減らす」設定のときは出さない
 
  const countEl = document.getElementById("loader-count");
  const messageEl = document.getElementById("loader-message");
  const innings = loader.querySelectorAll(".loader_innings li");
  if (!countEl || !messageEl) return;
 
  // 飾り：はずむボール（カードの中）／またたく星／進み具合に合わせて走るボール
  loader.querySelector(".loader_card").insertAdjacentHTML("afterbegin",
    `<div class="loader_ball" aria-hidden="true"><span class="loader_ball_sprite">${sprite("ball", 7)}</span><span class="loader_ball_shadow"></span></div>`);
  loader.insertAdjacentHTML("beforeend",
    `<span class="loader_star loader_star--1" aria-hidden="true">${sprite("star", 6)}</span>
     <span class="loader_star loader_star--2" aria-hidden="true">${sprite("star", 4)}</span>
     <span class="loader_star loader_star--3" aria-hidden="true">${sprite("star", 5)}</span>
     <span class="loader_star loader_star--4" aria-hidden="true">${sprite("star", 3)}</span>
     <div class="loader_runner" aria-hidden="true">
       <span class="loader_runner_player">
         <span class="runner_frame runner_frame--a">${sprite("runnerA", 4)}</span>
         <span class="runner_frame runner_frame--b">${sprite("runnerB", 4)}</span>
       </span>
       <span class="loader_safe">SAFE!</span>
     </div>`);
  loader.insertAdjacentHTML("afterbegin", buildBoard());                       // 背景のスコアボード
  const boardCells = loader.querySelectorAll(".loader_board [data-i]");        // 回ごとの列
  const boardTotals = loader.querySelectorAll(".loader_board .b_t");           // R / H / E
 
  document.body.classList.add("is-loading");      // CSSがこのクラスを見て、ローディングを表示する
  document.body.style.overflow = "hidden";        // 読み込み中は、スクロールさせない
 
  const DURATION = 1600;                          // 数える長さ(ミリ秒)
  const start = performance.now();
  let fontsReady = false;
  let closed = false;
 
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { fontsReady = true; });
  setTimeout(() => { fontsReady = true; }, 2500);   // フォントが遅くても、2.5秒で先に進める
 
  function close() {
    if (closed) return;
    closed = true;
    countEl.textContent = "100";
    loader.style.setProperty("--p", "1");
    boardCells.forEach((el) => el.classList.add("is-on"));
    boardTotals.forEach((el) => el.classList.add("is-on"));
    loader.classList.add("is-safe");
    messageEl.textContent = "PLAY BALL!";
    innings.forEach((li) => li.classList.add("is-on"));
 
    setTimeout(() => {
      loader.classList.add("is-open");            // 幕が上がる
      setTimeout(() => {
        document.body.classList.remove("is-loading");
        document.body.style.overflow = "";
        loader.classList.remove("is-open");
      }, 900);
    }, 450);
  }
 
  loader.addEventListener("click", close);        // 画面を押すと、スキップできる
 
  function step(now) {
    if (closed) return;
    const t = Math.min(1, (now - start) / DURATION);
    const progress = fontsReady ? t : Math.min(t, 0.9);   // フォントが来るまでは、90%で待つ
    const percent = Math.round(progress * 100);
 
    countEl.textContent = percent;
    loader.style.setProperty("--p", progress.toFixed(3));   // 走る選手の位置
    boardCells.forEach((el) => el.classList.toggle("is-on", percent >= (Number(el.dataset.i) + 1) * 11));
    innings.forEach((li, i) => li.classList.toggle("is-on", percent >= (i + 1) * 11));
 
    if (progress >= 1) close();
    else requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
 
/* ---------------------------------------------------------
   7.5 制作物のプレビュー（写真がなければ、ドット絵を入れる）
   --------------------------------------------------------- */
function initWorkThumbs() {
  document.querySelectorAll(".work_thumb").forEach((el) => {
    if (el.querySelector("img")) return;                 // 写真があれば、そのまま使う
    const icon = el.dataset.icon || "star";              // data-icon="star" / "bat" / "cap" / "ball"
    el.innerHTML = sprite(icon, icon === "bat" ? 5 : 7);
  });
}
 
/* ---------------------------------------------------------
   7.6 マウスに合わせて光る／ボールのカーソル
   --------------------------------------------------------- */
function initPointer() {
  const TILES = ".hero > *, .player-card, .bio, .school, .timeline, .lineup, .work, #contact";
 
  // (1) 箱の上でマウスを動かすと、光がついてくる
  document.addEventListener("pointermove", (e) => {
    const tile = e.target.closest && e.target.closest(TILES);
    if (!tile) return;
    const rect = tile.getBoundingClientRect();
    tile.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    tile.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, { passive: true });
 
  // (2) ボールのカーソル（マウスのあるパソコンだけ）
  if (prefersReduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
 
  const cursor = document.createElement("div");
  cursor.className = "cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = sprite("ball", 2);
  document.body.appendChild(cursor);
  document.body.classList.add("has-cursor");
 
  let targetX = 0, targetY = 0, x = 0, y = 0, running = false;
  function follow() {
    x += (targetX - x) * 0.2;            // 少しずつ近づくので、ふわっとついてくる
    y += (targetY - y) * 0.2;
    cursor.style.transform = `translate(${x}px, ${y}px)`;
    running = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.5;
    if (running) requestAnimationFrame(follow);
  }
  document.addEventListener("pointermove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    cursor.classList.add("is-on");
    cursor.classList.toggle("is-big", Boolean(e.target.closest && e.target.closest("a, button")));
    if (!running) { running = true; requestAnimationFrame(follow); }
  }, { passive: true });
}
 
/* ---------------------------------------------------------
   7.7 プロフィール写真（写真がなければ、ドット絵の似顔絵）
   --------------------------------------------------------- */
function initAvatar() {
  const box = document.querySelector(".player-card_avatar");
  if (!box) return;
  const img = box.querySelector("img");
  if (img && img.getAttribute("src")) return;        // 写真があれば、そのまま使う
  box.innerHTML = sprite("player", 12);
}
 
/* ---------------------------------------------------------
   7.8 飾り（シール・見出しの星）とマウスに合わせた視差
   --------------------------------------------------------- */
function initDecor() {
  const sticker = (name, px, style) =>
    `<span class="sticker" style="${style}" aria-hidden="true">${sprite(name, px)}</span>`;
 
  const hero = document.querySelector(".hero_main");
  if (hero) {
    hero.insertAdjacentHTML("afterbegin",
      sticker("star", 6, "--r:14deg;--k:16;right:28px;top:26px") +
      sticker("ball", 6, "--r:-10deg;--k:-12;right:60px;bottom:30px"));
  }
  const contact = document.getElementById("contact");
  if (contact) contact.insertAdjacentHTML("afterbegin", sticker("cap", 8, "--r:12deg;--k:14;right:30px;top:24px"));
 
  document.querySelectorAll("main > section > h2").forEach((h2) => {
    if (h2.closest("#contact")) return;
    h2.insertAdjacentHTML("afterbegin", `<span class="h2-icon" aria-hidden="true">${sprite("star", 4)}</span>`);
  });
 
  if (prefersReduced) return;
  document.addEventListener("pointermove", (e) => {
    root.style.setProperty("--px", ((e.clientX / innerWidth) * 2 - 1).toFixed(2));
    root.style.setProperty("--py", ((e.clientY / innerHeight) * 2 - 1).toFixed(2));
  }, { passive: true });
}
 
/* ---------------------------------------------------------
   7.9 画面の上のバーを、ボールが走る（スクロールの進み具合）
   --------------------------------------------------------- */
function initProgress() {
  const bar = document.createElement("div");
  bar.className = "progress";
  bar.setAttribute("aria-hidden", "true");
  bar.innerHTML = `<i class="progress_fill"></i><span class="progress_ball">${sprite("ball", 2)}</span>`;
  document.body.appendChild(bar);
 
  function update() {
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty("--p", max > 0 ? Math.min(1, scrollY / max).toFixed(3) : "0");
  }
  addEventListener("scroll", update, { passive: true });
  update();
}
 
/* ---------------------------------------------------------
   7.95 スクロールで見えたら、ふわっと出す
   --------------------------------------------------------- */
function initReveal() {
  if (prefersReduced || !("IntersectionObserver" in window)) return;
 
  const targets = document.querySelectorAll(
    "main > section > h2, main > section > h2 + p, .player-card, .bio, .lineup li, .bench, " +
    ".group-work > h3, .my-work > h3, .work, .school, .timeline, #contact"
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    });
  }, { threshold: 0.05 });
 
  targets.forEach((el) => {
    const index = Array.from(el.parentElement.children).indexOf(el);
    el.style.setProperty("--i", String(el.matches(".lineup li, .work") ? Math.min(index, 8) : 0));
    el.classList.add("rv");
    io.observe(el);
  });
}
 
/* ---------------------------------------------------------
   7.97 流れる文字（同じ文字をつなげて、画面いっぱいに、途切れず流す）
   --------------------------------------------------------- */
const MARQUEE_SPEED = [80, 60];   // 1秒に進むpx（1段目, 2段目）。大きいほど速い
 
function initMarquee() {
  const rows = document.querySelectorAll(".marquee p");
  if (!rows.length) return;
  rows.forEach((p) => { p.dataset.source = p.innerHTML.trim(); });   // もとの文字を覚えておく
 
  function build() {
    rows.forEach((p, i) => {
      const item = `<span class="marquee_item">${p.dataset.source}</span>`;
      p.style.animation = "none";
      p.innerHTML = item;
      const one = p.firstElementChild.getBoundingClientRect().width || 1;   // 1回分の幅
      const count = Math.ceil(window.innerWidth / one) + 1;                  // 画面より長くなる回数
      const group = item.repeat(count);
      p.innerHTML = group + group;                                           // 同じ並びを2つつなぐ → つなぎ目が見えない
      const groupWidth = one * count;
      p.style.setProperty("--shift", `${groupWidth}px`);
      p.style.setProperty("--dur", `${(groupWidth / MARQUEE_SPEED[i % MARQUEE_SPEED.length]).toFixed(2)}s`);
      void p.offsetWidth;
      p.style.animation = "";
    });
  }
 
  build();
  if (document.fonts) document.fonts.ready.then(build);   // フォントが読み込まれて幅が変わったら、作り直す
  let timer;
  window.addEventListener("resize", () => { clearTimeout(timer); timer = setTimeout(build, 200); });
}
 
/* ---------------------------------------------------------
   8. 実行（上から順に呼ぶ）
   --------------------------------------------------------- */
initTheme();
initTeam();
initStage();
initLearning();
initDialogs();
initWorkThumbs();
initAvatar();
initDecor();
initPointer();
initProgress();
initMarquee();
initReveal();
runLoader();