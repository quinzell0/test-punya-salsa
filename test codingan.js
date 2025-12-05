let w = (c.width = window.innerWidth),
  h = (c.height = window.innerHeight),
  ctx = c.getContext("2d"),
  hw = w / 2;
(hh = h / 2),
  (opts = {
    // change the text in here //
    strings: ["HAPPY", "BIRTHDAY!", "ARDI"],
    charSize: 30,
    charSpacing: 35,
    lineHeight: 40,

    cx: w / 2,
    cy: h / 2,

    fireworkPrevPoints: 10,
    fireworkBaseLineWidth: 5,
    fireworkAddedLineWidth: 8,
    fireworkSpawnTime: 200,
    fireworkBaseReachTime: 30,
    fireworkAddedReachTime: 30,
    fireworkCircleBaseSize: 20,
    fireworkCircleAddedSize: 10,
    fireworkCircleBaseTime: 30,
    fireworkCircleAddedTime: 30,
    fireworkCircleFadeBaseTime: 10,
    fireworkCircleFadeAddedTime: 5,
    fireworkBaseShards: 5,
    fireworkAddedShards: 5,
    fireworkShardPrevPoints: 3,
    fireworkShardBaseVel: 4,
    fireworkShardAddedVel: 2,
    fireworkShardBaseSize: 3,
    fireworkShardAddedSize: 3,
    gravity: 0.1,
    upFlow: -0.1,
    letterContemplatingWaitTime: 360,
    balloonSpawnTime: 20,
    balloonBaseInflateTime: 10,
    balloonAddedInflateTime: 10,
    balloonBaseSize: 20,
    balloonAddedSize: 20,
    balloonBaseVel: 0.4,
    balloonAddedVel: 0.4,
    balloonBaseRadian: -(Math.PI / 2 - 0.5),
    balloonAddedRadian: -1,
  }),
  (calc = {
    totalWidth: opts.charSpacing * Math.max(...opts.strings.map((s) => s.length)),
  }),
  (Tau = Math.PI * 2),
  (TauQuarter = Tau / 4),
  (letters = []),
  (bursts = []),
  (timeTick = 0),
  (spaceDust = []),
  (camera = { z: 520, fov: 320 }),
  (pointer = { x: 0, y: 0, tx: 0, ty: 0 }),
  (drawing = false),
  (orbs = []),
  (confettis = []),
  (confettiRain = true);

const form = document.getElementById("messageForm");
const nameInput = document.getElementById("nameInput");
const line1Input = document.getElementById("line1Input");
const line2Input = document.getElementById("line2Input");
const replayBtn = document.getElementById("replayBtn");
const confettiStatus = document.getElementById("confettiStatus");

line1Input.value = opts.strings[0];
line2Input.value = opts.strings[1];
nameInput.value = opts.strings[2];

ctx.font = opts.charSize + "px Verdana";

function makeDust() {
  return {
    x: (Math.random() - 0.5) * 600,
    y: (Math.random() - 0.5) * 360,
    z: Math.random() * 1400 + 200,
    size: 1 + Math.random() * 2,
    hue: (Math.random() * 360) | 0,
    spin: Math.random() * Tau,
  };
}

function initDust() {
  spaceDust.length = 0;
  for (let i = 0; i < 140; i++) spaceDust.push(makeDust());
}

function makeOrb() {
  return {
    x: (Math.random() - 0.5) * w,
    y: (Math.random() - 0.5) * h,
    r: 40 + Math.random() * 70,
    hue: (Math.random() * 360) | 0,
    drift: Math.random() * Tau,
    speed: 0.004 + Math.random() * 0.008,
  };
}

function initOrbs() {
  orbs.length = 0;
  for (let i = 0; i < 10; i++) orbs.push(makeOrb());
}

function Letter(char, x, y) {
  this.char = char;
  this.x = x;
  this.y = y;

  this.dx = -ctx.measureText(char).width / 2;
  this.dy = +opts.charSize / 2;

  this.fireworkDy = this.y - hh;

  var hue = (x / calc.totalWidth) * 360;

  this.color = "hsl(hue,80%,50%)".replace("hue", hue);
  this.lightAlphaColor = "hsla(hue,80%,light%,alp)".replace("hue", hue);
  this.lightColor = "hsl(hue,80%,light%)".replace("hue", hue);
  this.alphaColor = "hsla(hue,80%,50%,alp)".replace("hue", hue);

  this.reset();
}
Letter.prototype.reset = function () {
  this.phase = "firework";
  this.tick = 0;
  this.spawned = false;
  this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
  this.reachTime =
    (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) |
    0;
  this.lineWidth =
    opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
  this.prevPoints = [[0, hh, 0]];
};
Letter.prototype.step = function () {
  if (this.phase === "firework") {
    if (!this.spawned) {
      ++this.tick;
      if (this.tick >= this.spawningTime) {
        this.tick = 0;
        this.spawned = true;
      }
    } else {
      ++this.tick;

      var linearProportion = this.tick / this.reachTime,
        armonicProportion = Math.sin(linearProportion * TauQuarter),
        x = linearProportion * this.x,
        y = hh + armonicProportion * this.fireworkDy;

      if (this.prevPoints.length > opts.fireworkPrevPoints)
        this.prevPoints.shift();

      this.prevPoints.push([x, y, linearProportion * this.lineWidth]);

      var lineWidthProportion = 1 / (this.prevPoints.length - 1);

      for (var i = 1; i < this.prevPoints.length; ++i) {
        var point = this.prevPoints[i],
          point2 = this.prevPoints[i - 1];

        ctx.strokeStyle = this.alphaColor.replace(
          "alp",
          i / this.prevPoints.length
        );
        ctx.lineWidth = point[2] * lineWidthProportion * i;
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.stroke();
      }

      if (this.tick >= this.reachTime) {
        this.phase = "contemplate";

        this.circleFinalSize =
          opts.fireworkCircleBaseSize +
          opts.fireworkCircleAddedSize * Math.random();
        this.circleCompleteTime =
          (opts.fireworkCircleBaseTime +
            opts.fireworkCircleAddedTime * Math.random()) |
          0;
        this.circleCreating = true;
        this.circleFading = false;

        this.circleFadeTime =
          (opts.fireworkCircleFadeBaseTime +
            opts.fireworkCircleFadeAddedTime * Math.random()) |
          0;
        this.tick = 0;
        this.tick2 = 0;

        this.shards = [];

        var shardCount =
            (opts.fireworkBaseShards +
              opts.fireworkAddedShards * Math.random()) |
            0,
          angle = Tau / shardCount,
          cos = Math.cos(angle),
          sin = Math.sin(angle),
          x = 1,
          y = 0;

        for (var i = 0; i < shardCount; ++i) {
          var x1 = x;
          x = x * cos - y * sin;
          y = y * cos + x1 * sin;

          this.shards.push(new Shard(this.x, this.y, x, y, this.alphaColor));
        }
      }
    }
  } else if (this.phase === "contemplate") {
    ++this.tick;

    if (this.circleCreating) {
      ++this.tick2;
      var proportion = this.tick2 / this.circleCompleteTime,
        armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor
        .replace("light", 50 + 50 * proportion)
        .replace("alp", proportion);
      ctx.beginPath();
      ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
      ctx.fill();

      if (this.tick2 > this.circleCompleteTime) {
        this.tick2 = 0;
        this.circleCreating = false;
        this.circleFading = true;
      }
    } else if (this.circleFading) {
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      ++this.tick2;
      var proportion = this.tick2 / this.circleFadeTime,
        armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor
        .replace("light", 100)
        .replace("alp", 1 - armonic);
      ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
      ctx.fill();

      if (this.tick2 >= this.circleFadeTime) this.circleFading = false;
    } else {
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
    }

    for (var i = 0; i < this.shards.length; ++i) {
      this.shards[i].step();

      if (!this.shards[i].alive) {
        this.shards.splice(i, 1);
        --i;
      }
    }

    if (this.tick > opts.letterContemplatingWaitTime) {
      this.phase = "balloon";

      this.tick = 0;
      this.spawning = true;
      this.spawnTime = (opts.balloonSpawnTime * Math.random()) | 0;
      this.inflating = false;
      this.inflateTime =
        (opts.balloonBaseInflateTime +
          opts.balloonAddedInflateTime * Math.random()) |
        0;
      this.size =
        (opts.balloonBaseSize + opts.balloonAddedSize * Math.random()) | 0;

      var rad =
          opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random(),
        vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();

      this.vx = Math.cos(rad) * vel;
      this.vy = Math.sin(rad) * vel;
    }
  } else if (this.phase === "balloon") {
    ctx.strokeStyle = this.lightColor.replace("light", 80);

    if (this.spawning) {
      ++this.tick;
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      if (this.tick >= this.spawnTime) {
        this.tick = 0;
        this.spawning = false;
        this.inflating = true;
      }
    } else if (this.inflating) {
      ++this.tick;

      var proportion = this.tick / this.inflateTime,
        x = (this.cx = this.x),
        y = (this.cy = this.y - this.size * proportion);

      ctx.fillStyle = this.alphaColor.replace("alp", proportion);
      ctx.beginPath();
      generateBalloonPath(x, y, this.size * proportion);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, this.y);
      ctx.stroke();

      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      if (this.tick >= this.inflateTime) {
        this.tick = 0;
        this.inflating = false;
      }
    } else {
      this.cx += this.vx;
      this.cy += this.vy += opts.upFlow;

      ctx.fillStyle = this.color;
      ctx.beginPath();
      generateBalloonPath(this.cx, this.cy, this.size);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(this.cx, this.cy);
      ctx.lineTo(this.cx, this.cy + this.size);
      ctx.stroke();

      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size);

      if (this.cy + this.size < -hh || this.cx < -hw || this.cy > hw)
        this.phase = "done";
    }
  }
};
function Shard(x, y, vx, vy, color) {
  var vel =
    opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();

  this.vx = vx * vel;
  this.vy = vy * vel;

  this.x = x;
  this.y = y;

  this.prevPoints = [[x, y]];
  this.color = color;

  this.alive = true;

  this.size =
    opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
}
Shard.prototype.step = function () {
  this.x += this.vx;
  this.y += this.vy += opts.gravity;

  if (this.prevPoints.length > opts.fireworkShardPrevPoints)
    this.prevPoints.shift();

  this.prevPoints.push([this.x, this.y]);

  var lineWidthProportion = this.size / this.prevPoints.length;

  for (var k = 0; k < this.prevPoints.length - 1; ++k) {
    var point = this.prevPoints[k],
      point2 = this.prevPoints[k + 1];

    ctx.strokeStyle = this.color.replace("alp", k / this.prevPoints.length);
    ctx.lineWidth = k * lineWidthProportion;
    ctx.beginPath();
    ctx.moveTo(point[0], point[1]);
    ctx.lineTo(point2[0], point2[1]);
    ctx.stroke();
  }

  if (this.prevPoints[0][1] > hh) this.alive = false;
};
function generateBalloonPath(x, y, size) {
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(
    x - size / 2,
    y - size / 2,
    x - size / 4,
    y - size,
    x,
    y - size
  );
  ctx.bezierCurveTo(x + size / 4, y - size, x + size / 2, y - size / 2, x, y);
}

function spawnBurst(x, y, strength = 1, hueBase) {
  const baseCount = (18 + Math.random() * 8) | 0;
  const count = Math.max(4, Math.round(baseCount * strength));
  const hue = hueBase !== undefined ? hueBase : (Math.random() * 360) | 0;

  const parts = Array.from({ length: count }, (_, i) => {
    const angle = (Tau / count) * i + Math.random() * 0.4;
    const speed = 2.5 + Math.random() * (3.5 + strength * 1.5);
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 40 + (Math.random() * 25) | 0,
      hue: hue + Math.random() * 40 - 20,
      size: 2 + Math.random() * 2,
    };
  });

  bursts.push(parts);
}

function stepBursts() {
  for (let i = 0; i < bursts.length; i++) {
    const parts = bursts[i];
    for (let j = 0; j < parts.length; j++) {
      const p = parts[j];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += opts.gravity * 0.3;
      p.life -= 1;

      const alpha = Math.max(p.life / 60, 0);
      ctx.fillStyle = `hsla(${p.hue},90%,70%,${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Tau);
      ctx.fill();
    }
    const alive = parts.filter((p) => p.life > 0);
    if (!alive.length) {
      bursts.splice(i, 1);
      i--;
    } else {
      bursts[i] = alive;
    }
  }
}

function sprayTrail(x, y) {
  spawnBurst(x, y, 0.35, (timeTick * 3) % 360);
}

function stepOrbs() {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < orbs.length; i++) {
    const o = orbs[i];
    o.drift += o.speed;
    const wobble = Math.sin(o.drift) * 12;
    const px = o.x + pointer.x * 90 + wobble;
    const py = o.y + pointer.y * 80 + Math.cos(o.drift * 0.8) * 10;
    const grad = ctx.createRadialGradient(px, py, 0, px, py, o.r * 1.4);
    grad.addColorStop(0, `hsla(${o.hue},80%,65%,0.35)`);
    grad.addColorStop(0.7, `hsla(${(o.hue + 30) % 360},90%,55%,0.08)`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, o.r * 1.4, 0, Tau);
    ctx.fill();
  }
  ctx.restore();
}

function makeConfettiPiece(x, y) {
  const size = 4 + Math.random() * 4;
  const hue = (Math.random() * 360) | 0;
  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 1.8,
    vy: 2 + Math.random() * 2.5,
    rot: Math.random() * Tau,
    vr: (Math.random() - 0.5) * 0.2,
    size,
    hue,
    life: 160 + (Math.random() * 80) | 0,
  };
}

function stepConfetti() {
  if (confettiRain && Math.random() < 0.8) {
    const spawnX = Math.random() * w;
    confettis.push(makeConfettiPiece(spawnX, -10));
  }

  for (let i = 0; i < confettis.length; i++) {
    const cPiece = confettis[i];
    cPiece.x += cPiece.vx + pointer.x * 0.6;
    cPiece.y += cPiece.vy;
    cPiece.vy += 0.02;
    cPiece.rot += cPiece.vr;
    cPiece.life -= 1;

    ctx.save();
    ctx.translate(cPiece.x, cPiece.y);
    ctx.rotate(cPiece.rot);
    ctx.fillStyle = `hsla(${cPiece.hue},90%,60%,0.9)`;
    ctx.fillRect(-cPiece.size / 2, -cPiece.size / 2, cPiece.size, cPiece.size);
    ctx.restore();

    if (cPiece.life <= 0 || cPiece.y > h + 30) {
      confettis.splice(i, 1);
      i--;
    }
  }
}

function project3D(point) {
  const yaw = pointer.x * 0.25;
  const pitch = pointer.y * 0.2;

  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);

  // rotate around Y (yaw)
  let rx = point.x * cosY - point.z * sinY;
  let rz = point.z * cosY + point.x * sinY;
  // rotate around X (pitch)
  let ry = point.y * cosP - rz * sinP;
  rz = rz * cosP + point.y * sinP;

  const scale = camera.fov / (camera.z + rz);
  return {
    x: rx * scale + hw + pointer.x * 40,
    y: ry * scale + hh + pointer.y * 40,
    scale,
  };
}

function stepDust() {
  for (let i = 0; i < spaceDust.length; i++) {
    const p = spaceDust[i];
    p.z -= 8;
    p.spin += 0.01;
    // subtle orbit
    p.x = Math.cos(p.spin * 0.8) * 260 + pointer.x * 180;
    p.y = Math.sin(p.spin * 1.1) * 190 + pointer.y * 140;

    if (p.z < -camera.z) {
      spaceDust[i] = makeDust();
      continue;
    }

    const { x, y, scale } = project3D(p);
    if (scale <= 0) continue;
    const size = p.size * (1.8 + scale * 12);
    const alpha = Math.min(0.3 + scale, 0.8);

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
    gradient.addColorStop(0, `hsla(${p.hue},90%,70%,${alpha})`);
    gradient.addColorStop(1, `hsla(${(p.hue + 40) % 360},80%,40%,0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Tau);
    ctx.fill();
  }

  // draw a faint grid plane for depth hint
  ctx.save();
  ctx.translate(hw, hh + 80);
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let i = -10; i <= 10; i++) {
    ctx.beginPath();
    ctx.moveTo(-gridSize * 12, i * gridSize);
    ctx.lineTo(gridSize * 12, i * gridSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(i * gridSize, -gridSize * 12);
    ctx.lineTo(i * gridSize, gridSize * 12);
    ctx.stroke();
  }
  ctx.restore();
}

function getMaxLine() {
  return Math.max(...opts.strings.map((s) => s.length), 1);
}

function buildLetters() {
  letters.length = 0;
  calc.totalWidth = opts.charSpacing * getMaxLine();

  for (let i = 0; i < opts.strings.length; ++i) {
    for (let j = 0; j < opts.strings[i].length; ++j) {
      letters.push(
        new Letter(
          opts.strings[i][j],
          j * opts.charSpacing +
            opts.charSpacing / 2 -
            (opts.strings[i].length * opts.charSpacing) / 2,
          i * opts.lineHeight +
            opts.lineHeight / 2 -
            (opts.strings.length * opts.lineHeight) / 2
        )
      );
    }
  }
}

function setStrings(lines) {
  opts.strings = lines.filter(Boolean);
  buildLetters();
}

function resetAll() {
  letters.forEach((l) => l.reset());
  timeTick = 0;
}

function anim() {
  window.requestAnimationFrame(anim);

  // smooth follow to avoid jitter
  pointer.x += (pointer.tx - pointer.x) * 0.08;
  pointer.y += (pointer.ty - pointer.y) * 0.08;

  timeTick += 0.6;
  const hueShift = timeTick % 360;
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, `hsl(${hueShift},70%,10%)`);
  bg.addColorStop(1, `hsl(${(hueShift + 180) % 360},75%,5%)`);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  stepOrbs();
  stepDust();
  stepBursts();
  stepConfetti();

  ctx.save();
  ctx.translate(hw, hh);

  var done = true;
  for (var l = 0; l < letters.length; ++l) {
    letters[l].step();
    if (letters[l].phase !== "done") done = false;
  }

  ctx.restore();

  if (done) for (var l = 0; l < letters.length; ++l) letters[l].reset();
}

buildLetters();
initDust();
initOrbs();

window.addEventListener("resize", function () {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;

  hw = w / 2;
  hh = h / 2;

  ctx.font = opts.charSize + "px Verdana";
  buildLetters();
  initDust();
  initOrbs();
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  setStrings([
    (line1Input.value || "HAPPY").toUpperCase(),
    (line2Input.value || "BIRTHDAY!").toUpperCase(),
    (nameInput.value || "ARDI").toUpperCase(),
  ]);
  resetAll();
});

replayBtn.addEventListener("click", resetAll);

window.addEventListener("click", function (e) {
  if (e.target.closest(".card")) return;
  spawnBurst(e.clientX, e.clientY);
});

window.addEventListener("pointerdown", function (e) {
  if (e.target.closest(".card")) return;
  drawing = true;
  spawnBurst(e.clientX, e.clientY, 1.1);
});

window.addEventListener("pointerup", function () {
  drawing = false;
});

window.addEventListener("pointermove", function (e) {
  pointer.tx = (e.clientX / w - 0.5) * 2;
  pointer.ty = (e.clientY / h - 0.5) * 2;

  if (drawing) {
    sprayTrail(e.clientX, e.clientY);
  }
});

window.addEventListener("dblclick", function (e) {
  if (e.target.closest(".card")) return;
  spawnBurst(e.clientX, e.clientY, 1.6);
});

window.addEventListener("keydown", function (e) {
  const isTyping = ["INPUT", "TEXTAREA"].includes(e.target.tagName);
  if (isTyping) return;
  if (e.code === "Space") {
    e.preventDefault();
    spawnBurst(hw, hh, 2);
  } else if (e.key.toLowerCase() === "p") {
    for (let i = 0; i < 5; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      spawnBurst(rx, ry, 1.2, (timeTick * 5 + i * 40) % 360);
    }
  } else if (e.key.toLowerCase() === "c") {
    confettiRain = !confettiRain;
    if (confettiStatus) {
      confettiStatus.textContent = `Confetti: ${confettiRain ? "ON" : "OFF"}`;
    }
  }
});

anim();
