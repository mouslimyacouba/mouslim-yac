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

const journey = document.querySelector("#parcours .pc-journey");
if (journey) {
  const tabs = Array.from(journey.querySelectorAll('[role="tab"]'));
  const tablist = journey.querySelector('[role="tablist"]');
  const panel = journey.querySelector('[role="tabpanel"]');
  const panelYear = panel.querySelector(".pc-panel__year");
  const panelTitle = panel.querySelector(".pc-panel__title");
  const panelDescription = panel.querySelector(".pc-panel__description");
  const counter = journey.querySelector(".pc-navigation__counter");
  const previous = journey.querySelector("[data-pc-previous]");
  const next = journey.querySelector("[data-pc-next]");
  let activeIndex = tabs.findIndex(tab => tab.getAttribute("aria-selected") === "true");
  let touchStart = null;

  const setActiveStep = (index, focusTab = false) => {
    activeIndex = Math.max(0, Math.min(index, tabs.length - 1));
    const activeTab = tabs[activeIndex];
    const description = activeTab.dataset.pcDescription || "";

    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === activeIndex;
      tab.classList.toggle("pc-tab--active", isActive);
      tab.classList.toggle("pc-tab--past", tabIndex < activeIndex);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    panel.setAttribute("aria-labelledby", activeTab.id);
    panelYear.textContent = activeTab.dataset.pcYear;
    panelTitle.textContent = activeTab.dataset.pcTitle;
    panelDescription.textContent = description;
    panelDescription.hidden = !description;
    journey.style.setProperty("--pc-progress", `${(activeIndex / (tabs.length - 1)) * 100}%`);
    counter.textContent = `${activeIndex + 1} / ${tabs.length}`;
    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === tabs.length - 1;

    panel.classList.remove("pc-panel--enter");
    void panel.offsetWidth;
    panel.classList.add("pc-panel--enter");

    if (focusTab) activeTab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setActiveStep(index));
  });
  previous.addEventListener("click", () => setActiveStep(activeIndex - 1));
  next.addEventListener("click", () => setActiveStep(activeIndex + 1));

  tablist.addEventListener("keydown", event => {
    let targetIndex = activeIndex;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") targetIndex -= 1;
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") targetIndex += 1;
    else if (event.key === "Home") targetIndex = 0;
    else if (event.key === "End") targetIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    setActiveStep(targetIndex, true);
  });

  panel.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") setActiveStep(0, true);
    else if (event.key === "End") setActiveStep(tabs.length - 1, true);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") setActiveStep(activeIndex - 1, true);
    else setActiveStep(activeIndex + 1, true);
  });

  panel.addEventListener("touchstart", event => {
    const touch = event.changedTouches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  panel.addEventListener("touchend", event => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    setActiveStep(activeIndex + (deltaX < 0 ? 1 : -1));
  }, { passive: true });
  panel.addEventListener("touchcancel", () => {
    touchStart = null;
  }, { passive: true });

  setActiveStep(activeIndex);
}

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!motionPreference.matches && "IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll(
    ".hero .hello, .hero h1, .hero .lead, .hero .cta, " +
    "main > section:not(.hero) .wrap > h2, main > section:not(.hero) .wrap > .intro, " +
    ".about > div, .projects > .proj, .skills > .skill, #parcours .pc-tab, #contact .cta"
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
