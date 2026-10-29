const hero = document.querySelector(".hero video");
if (hero && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  hero.muted = true;
  hero.playsInline = true;
  const play = () => {
    if (!hero.paused) return;
    const pending = hero.play();
    if (pending) pending.catch(() => {});
  };
  play();
  hero.addEventListener("loadeddata", play);
  hero.addEventListener("ended", play);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") play();
  });
}

gsap.registerPlugin(ScrollTrigger, CustomEase);
ScrollTrigger.config({ ignoreMobileResize: true });
CustomEase.create("out", "0.16, 1, 0.3, 1");
CustomEase.create("inOut", "0.65, 0, 0.35, 1");
gsap.defaults({ ease: "out", duration: 0.7 });

const mm = gsap.matchMedia();
const fine = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

mm.add("(prefers-reduced-motion: no-preference)", () => {
  if (document.querySelector(".frame")) {
    gsap.timeline()
      .from(".bar-red", { scaleX: 0, transformOrigin: "left center", duration: 0.45 }, 0)
      .from(".tick", { scaleY: 0, transformOrigin: "center top", stagger: 0.05, duration: 0.4 }, 0.08)
      .from(".plate-title", { y: 28, duration: 0.7 }, 0.12);
  }

  gsap.from(".display", { y: 24, duration: 0.7 });

  gsap.utils.toArray(".band").forEach((band) => {
    const fromLeft = band.classList.contains("flip");
    const plays = band.querySelectorAll(".plays li");
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
      duration: 0.7,
      clearProps: "transform"
    }, 0);
    if (plays.length) {
      tl.from(plays, { y: 18, stagger: 0.06, duration: 0.45, clearProps: "transform" }, 0.12);
    }
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
});

mm.add(fine, () => {
  const lenis = new Lenis({
    autoRaf: false,
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });
  const onAnchor = (event) => {
    const link = event.target.closest("a[href*='#']");
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = document.querySelector(url.hash);
    if (!target) return;
    event.preventDefault();
    history.pushState(null, "", url.hash);
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    lenis.scrollTo(target, { offset: -margin });
  };
  document.addEventListener("click", onAnchor);
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const scrub = [0.45, 0.85, 1.15];
  gsap.utils.toArray(".band").forEach((band, i) => {
    const img = band.querySelector("img");
    const paper = img.classList.contains("paper");
    gsap.fromTo(img, {
      yPercent: paper ? 0 : 4,
      scale: paper ? 1.7 : 1,
      transformOrigin: paper ? "center top" : "center center"
    }, {
      yPercent: paper ? -3 : -6,
      scale: paper ? 1.7 : 1,
      ease: "none",
      scrollTrigger: {
        trigger: band,
        start: "top bottom",
        end: "bottom top",
        scrub: scrub[i]
      }
    });
  });

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

  return () => {
    if (ticks.length) window.removeEventListener("pointermove", onMove);
    document.removeEventListener("click", onAnchor);
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
});

mm.add("(prefers-reduced-motion: reduce)", () => {
  document.querySelectorAll("video[autoplay]").forEach((video) => {
    video.pause();
    video.removeAttribute("autoplay");
  });
});
