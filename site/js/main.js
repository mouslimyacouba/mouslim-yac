const year = document.getElementById("y");
if (year) year.textContent = new Date().getFullYear();

const btn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
function setMenu(open) {
  menu.classList.toggle("open", open);
  btn.setAttribute("aria-expanded", String(open));
  btn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
}
if (btn && menu) {
  btn.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") setMenu(false);
  });
  window.addEventListener("resize", () => {
    if (!window.matchMedia("(max-width: 860px)").matches) setMenu(false);
  });
}

const timeline = document.querySelector("#parcours .timeline");
if (timeline) {
  const timelineItems = Array.from(timeline.querySelectorAll(".timeline__item"));
  const setTimelineItem = (item, open) => {
    item.classList.toggle("is-open", open);
    item.querySelector(".timeline__toggle").setAttribute("aria-expanded", String(open));
    item.querySelector(".timeline__details").setAttribute("aria-hidden", String(!open));
  };

  timelineItems.forEach(item => setTimelineItem(item, false));
  timeline.addEventListener("click", event => {
    const button = event.target.closest(".timeline__toggle");
    if (!button || !timeline.contains(button)) return;
    const selectedItem = button.closest(".timeline__item");
    const shouldOpen = button.getAttribute("aria-expanded") !== "true";
    timelineItems.forEach(item => setTimelineItem(item, item === selectedItem && shouldOpen));
  });
  document.documentElement.classList.add("timeline-ready");
}

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!motionPreference.matches && "IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll(
    ".hero .hello, .hero h1, .hero .lead, .hero .cta, " +
    "main > section:not(.hero) .wrap > h2, main > section:not(.hero) .wrap > .intro, " +
    ".about > div, .projects > .proj, .skills > .skill, #parcours ol > li, #contact .cta"
  );
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });
  const groupDelays = new Map();

  revealTargets.forEach(target => {
    target.classList.add("motion-reveal");
    const group = target.parentElement;
    const delay = groupDelays.get(group) || 0;
    target.style.setProperty("--motion-delay", `${Math.min(delay, 3) * 80}ms`);
    groupDelays.set(group, delay + 1);
    revealObserver.observe(target);
  });

  document.documentElement.classList.add("motion-ready");
}
