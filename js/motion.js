gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {
  gsap.from(".display", { y: 24, duration: 0.7, ease: "power3.out" });

  if (document.querySelector(".days li")) {
    ScrollTrigger.batch(".days li", {
      start: "top 88%",
      once: true,
      onEnter: (batch) => {
        gsap.from(batch, {
          x: 28,
          duration: 0.7,
          stagger: 0.07,
          ease: "power3.out"
        });
      }
    });
  }

  if (document.querySelector(".record")) {
    ScrollTrigger.batch(".record", {
      start: "top 90%",
      once: true,
      onEnter: (batch) => {
        gsap.from(batch, {
          x: 40,
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
