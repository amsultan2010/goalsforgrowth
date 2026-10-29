const hero = document.querySelector(".hero video");
const playHero = () => {
  if (!hero || hero.paused === false) return;
  const pending = hero.play();
  if (pending) pending.catch(() => {});
};
if (hero && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  hero.muted = true;
  hero.playsInline = true;
  playHero();
  hero.addEventListener("loadeddata", playHero);
  hero.addEventListener("ended", playHero);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") playHero();
  });
}

gsap.registerPlugin(
  ScrollTrigger, CustomEase, CustomBounce,
  DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin,
  Flip, Observer, Physics2DPlugin, PhysicsPropsPlugin,
  InertiaPlugin, ScrollToPlugin
);
ScrollTrigger.config({ ignoreMobileResize: true });
CustomEase.create("out", "0.16, 1, 0.3, 1");
CustomEase.create("inOut", "0.65, 0, 0.35, 1");
CustomBounce.create("land", { strength: 0.6, squash: 3 });
gsap.defaults({ ease: "out", duration: 0.7 });

const D = { fast: 0.35, base: 0.7, slow: 1.1, epic: 1.6 };
let lenis = null;
let kitSpin = null;
const refresh = () => {
  ScrollTrigger.refresh();
  if (lenis) lenis.resize();
};
const fine = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const touch = "(hover: none) and (prefers-reduced-motion: no-preference), (pointer: coarse) and (prefers-reduced-motion: no-preference)";

const samePageHash = (event) => {
  const link = event.target.closest("a[href*='#']");
  if (!link) return null;
  const url = new URL(link.href, location.href);
  if (url.pathname !== location.pathname || !url.hash) return null;
  const target = document.querySelector(url.hash);
  if (!target) return null;
  return { target, margin: parseFloat(getComputedStyle(target).scrollMarginTop) || 0, hash: url.hash };
};

const armPass = (scrub) => {
  const plot = document.querySelector(".plot");
  if (!plot) return;
  MorphSVGPlugin.convertToPath(".morph-target");
  const ride = { path: ".plot", align: ".plot", alignOrigin: [0.5, 0.5], autoRotate: true };
  if (!scrub) {
    const once = { start: "top 80%", once: true };
    gsap.fromTo(".plot", { drawSVG: "0% 0%" }, {
      drawSVG: "0% 100%", duration: D.slow, ease: "inOut",
      scrollTrigger: { trigger: ".plot-wrap", ...once }
    });
    gsap.to(".morph-target", {
      morphSVG: { shape: ".morph-end", type: "rotational" },
      duration: D.slow,
      ease: "inOut",
      scrollTrigger: { trigger: ".morph", ...once }
    });
    gsap.to(".rider", {
      motionPath: ride,
      duration: D.epic,
      ease: "inOut",
      scrollTrigger: { trigger: ".plot-wrap", ...once }
    });
    return;
  }
  const draw = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: ".plot-wrap", start: "top 75%", end: "bottom 30%", scrub: 0.6 }
  });
  draw.fromTo(".plot", { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", immediateRender: false }, 0);
  const morph = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: ".morph", start: "top 70%", end: "center center", scrub: 0.6 }
  });
  morph.to(".morph-target", { morphSVG: { shape: ".morph-end", type: "rotational" } }, 0);
  const path = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: ".plot-wrap", start: "top 75%", end: "bottom 30%", scrub: 0.8 }
  });
  path.to(".rider", { motionPath: ride }, 0);
};

const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: reduce)", () => {
  document.querySelectorAll("video[autoplay]").forEach((video) => {
    video.pause();
    video.removeAttribute("autoplay");
  });
  if (document.querySelector(".plot")) {
    MorphSVGPlugin.convertToPath(".morph-target");
    gsap.set(".plot", { drawSVG: "0% 100%" });
    gsap.set(".morph-target", { morphSVG: ".morph-end" });
    gsap.set(".rider", {
      motionPath: { path: ".plot", align: ".plot", alignOrigin: [0.5, 0.5], autoRotate: true, start: 1, end: 1 }
    });
  }
  const frames = gsap.utils.toArray(".swatch");
  if (frames.length) {
    gsap.set(frames, { autoAlpha: 0 });
    gsap.set(frames[frames.length - 1], { autoAlpha: 1 });
  }
});

mm.add("(prefers-reduced-motion: no-preference)", () => {
  if (document.querySelector(".frame")) {
    gsap.timeline()
      .from(".bar-red", { scaleX: 0, transformOrigin: "left center", duration: 0.45 }, 0)
      .from(".tick", { scaleY: 0, transformOrigin: "center top", stagger: 0.05, duration: 0.4 }, 0.08);
  }

  if (document.querySelector(".plate-title")) {
    const land = gsap.timeline({
      scrollTrigger: { trigger: ".plate-title", start: "top 90%", once: true }
    });
    land.from(".plate-title", { y: -80, duration: D.slow, ease: "land" }, 0);
    land.to(".plate-title", {
      scaleX: 1.12,
      scaleY: 0.9,
      duration: D.slow,
      ease: "land-squash",
      transformOrigin: "center bottom"
    }, 0);
  }

  gsap.from(".display", { y: 24, duration: D.base });

  gsap.utils.toArray(".band").forEach((band) => {
    const fromLeft = band.classList.contains("flip");
    const tl = gsap.timeline({
      scrollTrigger: { trigger: band, start: "top 86%", once: true }
    });
    tl.from(band.querySelector("figure"), {
      clipPath: "inset(12% 0 0 0)",
      duration: 0.9,
      ease: "inOut",
      clearProps: "clipPath"
    }, 0);
    tl.from(band.querySelector(".copy"), {
      x: fromLeft ? -40 : 40,
      duration: D.base,
      clearProps: "transform"
    }, 0);
  });

  if (document.querySelector(".shots li")) {
    ScrollTrigger.batch(".shots li", {
      start: "top 92%",
      once: true,
      onEnter: (batch) => {
        gsap.from(batch, { y: 20, duration: 0.55, stagger: 0.04, clearProps: "transform" });
      }
    });
  }

  if (hero) {
    ScrollTrigger.create({
      trigger: hero,
      start: "top 90%",
      end: "bottom 10%",
      onToggle: (self) => (self.isActive ? playHero() : hero.pause())
    });
  }

  if (document.querySelector(".shards span")) {
    gsap.to(".shards span", {
      duration: D.epic,
      physics2D: {
        velocity: () => gsap.utils.random(180, 420),
        angle: () => gsap.utils.random(220, 320),
        gravity: 900
      },
      stagger: { each: 0.02, from: "center" },
      scrollTrigger: { trigger: ".hero", start: "top 80%", once: true }
    });
  }

  if (document.querySelector(".tick-gold")) {
    gsap.to(".tick-gold", {
      duration: D.slow,
      physicsProps: { rotation: { velocity: 220, acceleration: -80, friction: 0.18 } },
      scrollTrigger: { trigger: ".tick-gold", start: "top 80%", once: true }
    });
  }

  const marks = gsap.utils.toArray(".panel-mark");
  if (marks.length) {
    const state = Flip.getState(marks);
    marks.forEach((mark) => mark.classList.add("is-set"));
    Flip.from(state, { duration: D.base, ease: "inOut", stagger: 0.03, absolute: true });
  }

  const dial = document.querySelector(".tick-green");
  let observer = null;
  if (dial) {
    const angle = gsap.quickTo(dial, "rotation", { duration: D.fast, ease: "out" });
    let value = 0;
    observer = Observer.create({
      target: dial,
      type: "pointer,touch",
      lockAxis: true,
      tolerance: 8,
      preventDefault: false,
      onChangeX: (self) => {
        value = gsap.utils.clamp(-120, 120, value + self.deltaX * 0.4);
        angle(value);
      }
    });
  }

  const puck = document.querySelector(".puck");
  let onDown, onMove, onUp;
  if (puck) {
    InertiaPlugin.track(puck, "x,y");
    let dragging = false;
    onDown = (event) => {
      dragging = true;
      puck.setPointerCapture(event.pointerId);
    };
    onMove = (event) => {
      if (!dragging) return;
      gsap.set(puck, { x: `+=${event.movementX}`, y: `+=${event.movementY}` });
    };
    onUp = () => {
      if (!dragging) return;
      dragging = false;
      gsap.to(puck, { inertia: { x: "auto", y: "auto" } });
    };
    puck.addEventListener("pointerdown", onDown);
    puck.addEventListener("pointermove", onMove);
    puck.addEventListener("pointerup", onUp);
    puck.addEventListener("pointercancel", onUp);
  }

  let spin = null;
  if (document.querySelector(".morph")) {
    spin = gsap.to(".morph", { rotation: 360, duration: 8, repeat: -1, ease: "none", paused: true });
    kitSpin = spin;
    ScrollTrigger.create({
      trigger: ".morph",
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? spin.play() : spin.pause())
    });
  }

  return () => {
    if (observer) observer.kill();
    if (puck) {
      puck.removeEventListener("pointerdown", onDown);
      puck.removeEventListener("pointermove", onMove);
      puck.removeEventListener("pointerup", onUp);
      puck.removeEventListener("pointercancel", onUp);
    }
    if (spin) spin.kill();
    kitSpin = null;
  };
});

mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
  if (!document.querySelector(".plate")) return;
  const master = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: ".plate",
      start: "top top",
      end: "+=60%",
      pin: true,
      anticipatePin: 1,
      scrub: 0.6,
      snap: "labelsDirectional",
      invalidateOnRefresh: true
    }
  });
  master.addLabel("apart", 0);
  const child = gsap.timeline({ defaults: { ease: "none" } });
  child.to(".tick-red", { xPercent: -40 }, 0)
    .to(".tick-gold", { xPercent: -24 }, 0)
    .to(".tick-gold-right", { xPercent: 28 }, 0)
    .to(".tick-green", { xPercent: 18 }, 0);
  master.add(child, "apart");
  master.addLabel("settle", ">");
  master.to(".frame img", { yPercent: -6 }, "settle");
  master.addLabel("home");
  master.to(".tick", { xPercent: 0 }, "home");
  master.to(".frame img", { yPercent: 0 }, "home");
});

mm.add(fine, () => {
  lenis = new Lenis({
    autoRaf: false,
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });
  const onAnchor = (event) => {
    const hit = samePageHash(event);
    if (!hit) return;
    event.preventDefault();
    history.pushState(null, "", hit.hash);
    lenis.scrollTo(hit.target, { offset: -hit.margin });
  };
  document.addEventListener("click", onAnchor);
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const scrub = [0.45, 0.85, 1.15];
  gsap.utils.toArray(".band").forEach((band, i) => {
    const img = band.querySelector("img");
    if (!img) return;
    const paper = img.classList.contains("paper");
    const drift = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: band,
        start: "top bottom",
        end: "bottom top",
        scrub: scrub[i]
      }
    });
    drift.fromTo(img, {
      yPercent: paper ? 0 : 4,
      scale: paper ? 1.7 : 1,
      transformOrigin: paper ? "center top" : "center center"
    }, {
      yPercent: paper ? -3 : -6,
      scale: paper ? 1.7 : 1
    }, 0);
    if (!paper) {
      const turn = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: band, start: "top 85%", end: "top 40%", scrub: 0.6 }
      });
      turn.fromTo(img, { rotationY: -14, immediateRender: false }, { rotationY: 0 }, 0);
    }
  });

  if (document.querySelector(".plays li")) {
    const days = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: ".plays", start: "top bottom", end: "top 45%", scrub: 0.8 }
    });
    days.fromTo(".plays li", {
      y: gsap.utils.distribute({ base: -28, amount: 56, from: "center", ease: "none" })
    }, { y: 0 }, 0);
  }

  const track = document.querySelector(".track");
  if (track) {
    const scrollTween = gsap.to(track, {
      x: () => -(track.scrollWidth - innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: ".track-wrap",
        scrub: 0.6,
        invalidateOnRefresh: true,
        end: () => "+=" + (track.scrollWidth - innerWidth)
      }
    });
    gsap.utils.toArray(".panel").forEach((panel) => {
      const mark = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: panel,
          containerAnimation: scrollTween,
          start: "left 80%",
          end: "left 40%",
          scrub: true
        }
      });
      mark.fromTo(panel.querySelector(".panel-mark"), { yPercent: 40 }, { yPercent: 0, immediateRender: false }, 0);
    });
  }

  armPass(true);

  const frames = gsap.utils.toArray(".swatch");
  if (frames.length) {
    const pick = gsap.utils.pipe(
      gsap.utils.mapRange(0, 1, 0, frames.length - 1),
      gsap.utils.snap(1),
      gsap.utils.clamp(0, frames.length - 1)
    );
    let shown = 0;
    gsap.set(frames, { autoAlpha: 0 });
    gsap.set(frames[0], { autoAlpha: 1 });
    ScrollTrigger.create({
      trigger: ".frames",
      start: "top 70%",
      end: "bottom 30%",
      scrub: true,
      onUpdate: (self) => {
        const next = pick(self.progress);
        if (next === shown) return;
        gsap.set(frames[shown], { autoAlpha: 0 });
        gsap.set(frames[next], { autoAlpha: 1 });
        shown = next;
      }
    });
  }

  const photo = document.querySelector(".frame img");
  if (kitSpin) {
    const rate = gsap.quickTo(kitSpin, "timeScale", { duration: 0.6, ease: "out" });
      ScrollTrigger.create({
        trigger: ".morph",
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const speed = Math.abs(self.getVelocity());
          rate(speed < 40 ? 1 : gsap.utils.clamp(1, 2.4, 1 + speed / 1500));
        }
      });
  }

  const ticks = gsap.utils.toArray(".tick");
  const move = ticks.map((el) => ({
    x: gsap.quickTo(el, "x", { duration: 0.45, ease: "out" }),
    y: gsap.quickTo(el, "y", { duration: 0.45, ease: "out" })
  }));
  const onMove = (event) => {
    const dx = gsap.utils.clamp(-10, 10, (event.clientX - innerWidth / 2) / 70);
    const dy = gsap.utils.clamp(-8, 8, (event.clientY - innerHeight / 2) / 70);
    move.forEach((item, i) => {
      item.x(dx * (i % 2 ? 1 : -1));
      item.y(dy);
    });
  };
  if (ticks.length) window.addEventListener("pointermove", onMove);

  let onPlate;
  let tilt;
  if (photo) {
    tilt = gsap.quickTo(photo, "rotationY", { duration: 0.45, ease: "out" });
    onPlate = (event) => {
      const box = photo.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width - 0.5;
      tilt(gsap.utils.clamp(-8, 8, px * 16));
    };
    photo.parentElement.addEventListener("pointermove", onPlate);
    photo.parentElement.addEventListener("pointerleave", () => tilt(0));
  }

  const playHovers = [];
  gsap.utils.toArray(".plays li").forEach((li) => {
    const enter = gsap.timeline({ paused: true, defaults: { ease: "out", duration: D.fast } });
    enter.to(li, { scale: 1.03 }, 0);
    const over = () => enter.play();
    const out = () => enter.reverse();
    li.addEventListener("pointerenter", over);
    li.addEventListener("pointerleave", out);
    playHovers.push({ li, over, out, enter });
  });

  const shotScale = new Map();
  const shotIn = (event) => {
    const img = event.currentTarget;
    if (!shotScale.has(img)) shotScale.set(img, gsap.quickTo(img, "scale", { duration: D.fast, ease: "out" }));
    shotScale.get(img)(1.03);
  };
  const shotOut = (event) => shotScale.get(event.currentTarget)?.(1);
  document.querySelectorAll(".shots img").forEach((img) => {
    img.addEventListener("pointerenter", shotIn);
    img.addEventListener("pointerleave", shotOut);
  });

  return () => {
    document.removeEventListener("click", onAnchor);
    if (ticks.length) window.removeEventListener("pointermove", onMove);
    if (photo) photo.parentElement.removeEventListener("pointermove", onPlate);
    playHovers.forEach(({ li, over, out }) => {
      li.removeEventListener("pointerenter", over);
      li.removeEventListener("pointerleave", out);
    });
    document.querySelectorAll(".shots img").forEach((img) => {
      img.removeEventListener("pointerenter", shotIn);
      img.removeEventListener("pointerleave", shotOut);
    });
    gsap.ticker.remove(tick);
    lenis.destroy();
    lenis = null;
  };
});

mm.add(touch, () => {
  gsap.utils.toArray(".band img:not(.paper)").forEach((img) => {
    gsap.fromTo(img, { rotationY: -14 }, {
      rotationY: 0,
      duration: D.base,
      ease: "out",
      scrollTrigger: { trigger: img, start: "top 85%", once: true }
    });
  });
  if (document.querySelector(".plays li")) {
    gsap.from(".plays li", {
      y: 18,
      stagger: 0.06,
      duration: 0.45,
      clearProps: "transform",
      scrollTrigger: { trigger: ".plays", start: "top 88%", once: true }
    });
  }
  const frames = gsap.utils.toArray(".swatch");
  if (frames.length) {
    gsap.set(frames, { autoAlpha: 0 });
    gsap.set(frames[frames.length - 1], { autoAlpha: 1 });
  }
  armPass(false);
  const onAnchor = (event) => {
    const hit = samePageHash(event);
    if (!hit) return;
    event.preventDefault();
    history.pushState(null, "", hit.hash);
    gsap.to(window, { duration: D.base, ease: "inOut", scrollTo: { y: hit.target, offsetY: hit.margin } });
  };
  document.addEventListener("click", onAnchor);
  return () => document.removeEventListener("click", onAnchor);
});

document.fonts.ready.then(refresh);
addEventListener("load", refresh);
