(() => {
  const sessionKey = "portfolio-intro-seen";
  const root = document.documentElement;
  const loader = document.querySelector(".preloader");
  const bar = loader?.querySelector(".preloader__track");
  const fill = loader?.querySelector(".preloader__progress");
  const percentage = loader?.querySelector(".preloader__percentage");
  if (!loader || !bar || !fill || !percentage) return;

  let storage;
  try {
    storage = window.sessionStorage;
    if (storage.getItem(sessionKey)) return;
    storage.setItem(sessionKey, "1");
  } catch {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const minimumDuration = reduceMotion ? 0 : 1800;
  const completionDisplayDuration = reduceMotion ? 0 : 150;
  const startedAt = performance.now();
  let completed = false;
  let loadHandled = false;
  let completionAt;
  let currentProgress = 0;
  let progressFrame = 0;
  let safetyTimer;
  let completionTimer;

  function setProgress(value) {
    currentProgress = Math.max(currentProgress, Math.min(100, Math.round(value)));
    fill.style.width = `${currentProgress}%`;
    bar.setAttribute("aria-valuenow", String(currentProgress));
    percentage.textContent = `${currentProgress} %`;
  }

  function animateProgress() {
    if (completed || reduceMotion) return;
    const elapsed = performance.now() - startedAt;
    setProgress(Math.min(90, 90 * elapsed / minimumDuration));
    progressFrame = window.requestAnimationFrame(animateProgress);
  }

  function dismiss() {
    if (completed) return;
    completed = true;
    window.cancelAnimationFrame(progressFrame);
    window.clearTimeout(safetyTimer);
    window.clearTimeout(completionTimer);

    if (reduceMotion) {
      root.classList.remove("preloader-active");
      loader.remove();
      return;
    }

    loader.classList.add("is-leaving");
    window.setTimeout(() => {
      root.classList.remove("preloader-active");
      loader.remove();
    }, 300);
  }

  function finishWhenReady() {
    if (completed) return;
    const remaining = completionAt - performance.now();
    if (remaining > 0) {
      completionTimer = window.setTimeout(finishWhenReady, remaining);
      return;
    }
    setProgress(100);
    if (completionDisplayDuration > 0) {
      completionTimer = window.setTimeout(dismiss, completionDisplayDuration);
    } else {
      dismiss();
    }
  }

  function finishAfterLoad() {
    if (completed || loadHandled) return;
    loadHandled = true;
    setProgress(100);
    completionAt = Math.max(
      startedAt + minimumDuration,
      performance.now() + completionDisplayDuration
    );
    finishWhenReady();
  }

  safetyTimer = window.setTimeout(dismiss, 2400);
  window.addEventListener("load", finishAfterLoad, { once: true });
  window.addEventListener("error", event => {
    if (event.error) dismiss();
  });
  window.addEventListener("unhandledrejection", dismiss, { once: true });
  root.classList.add("preloader-active");
  if (!reduceMotion) progressFrame = window.requestAnimationFrame(animateProgress);

  if (document.readyState === "complete") finishAfterLoad();
})();
