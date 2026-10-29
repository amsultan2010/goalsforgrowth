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

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  gsap.from(".display", { y: 24, duration: 0.7, ease: "power3.out" });

  if (document.querySelector(".band")) {
    ScrollTrigger.batch(".band", {
      start: "top 90%",
      once: true,
      onEnter: (batch) => {
        gsap.from(batch, {
          y: 36,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out"
        });
      }
    });
  }
});

mm.add("(prefers-reduced-motion: reduce)", () => {
  document.querySelectorAll("video[autoplay]").forEach((video) => {
    video.pause();
    video.removeAttribute("autoplay");
  });
});
