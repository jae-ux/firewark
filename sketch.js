let fireworks = [];
let gravity;
let started = false;
let explosionSound, loveTrack;
let surpriseTriggered = false;

function preload() {
  explosionSound = loadSound('firework-explosion.mp3');
  loveTrack = loadSound('careless-whisper.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  gravity = createVector(0, 0.2);
  background(0);
}

function draw() {
  background(0, 0, 0, 25);

  if (random(1) < 0.03 && started) {
    fireworks.push(new Firework());
  }

  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }

  fill(255);
  textSize(32);
  textAlign(CENTER);
  text('Hi Sarah, I like you 💖', width / 2, height - 50);
}

function touchStarted() {
  if (!started) {
    started = true;
    userStartAudio();

    setTimeout(() => {
      const btn = document.getElementById('surpriseBtn');
      if (btn) {
        btn.style.display = 'block';
        setTimeout(() => {
          btn.style.opacity = 1;
        }, 50);
      }
    }, 10000);
  }
  return false;
}

class Firework {
  constructor() {
    this.hu = random(360);
    this.firework = new Particle(random(width), height, this.hu, true);
    this.exploded = false;
    this.particles = [];
  }

  done() {
    return this.exploded && this.particles.length === 0;
  }

  update() {
    if (!this.exploded) {
      this.firework.applyForce(gravity);
      this.firework.update();
      if (this.firework.vel.y >= 0) {
        this.exploded = true;
        this.explode();
        explosionSound.play();
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].applyForce(gravity);
      this.particles[i].update();
      if (this.particles[i].done()) {
        this.particles.splice(i, 1);
      }
    }
  }

  explode() {
    let num = int(random(80, 150));
    for (let i = 0; i < num; i++) {
      const angle = random(TWO_PI);
      const mag = random(1, 4); // smaller explosion
      const vel = p5.Vector.fromAngle(angle).mult(mag);
      this.particles.push(new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false, vel));
    }
  }

  show() {
    if (!this.exploded) this.firework.show();
    for (let p of this.particles) p.show();
  }
}

class Particle {
  constructor(x, y, hu, firework, vel = null) {
    this.pos = createVector(x, y);
    this.prevPos = this.pos.copy();
    this.hu = hu;
    this.firework = firework;
    this.lifespan = 255;
    this.acc = createVector(0, 0);

    if (firework) {
      this.vel = createVector(0, random(-20, -13)); // not too high
    } else {
      this.vel = vel || p5.Vector.random2D().mult(random(1, 4));
      this.drag = random(0.88, 0.95);
    }
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.prevPos = this.pos.copy();
    if (!this.firework) {
      this.vel.mult(this.drag);
      this.lifespan -= 2.5;
    }
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  done() {
    return this.lifespan < 0;
  }

  show() {
    colorMode(HSB);

    // glow trail for explosion particles
    if (!this.firework) {
      strokeWeight(1);
      stroke(this.hu, 255, 255, this.lifespan);
      line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);

      noStroke();
      fill(this.hu, 255, 255, this.lifespan / 4);
      ellipse(this.pos.x, this.pos.y, 4);
    } else {
      strokeWeight(2);
      stroke(this.hu, 255, 255);
      line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('surpriseBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      if (surpriseTriggered) return;
      surpriseTriggered = true;

      document.getElementById('message')?.classList.add('show');
      loveTrack.play();
      for (let i = 0; i < 5; i++) {
        fireworks.push(new Firework());
      }
    });
  }
});
