/*
  Bascule thème sombre / clair.
  - Au premier passage : suit le réglage de l'appareil.
  - Le choix du visiteur est mémorisé (localStorage, clé "theme").
  - Le thème est déjà posé avant l'affichage par le petit script du <head>
    (voir theme-snippets.html), ce qui évite le flash du mauvais thème.
*/
(function () {
  "use strict";

  var CLE = "theme";
  var racine = document.documentElement;
  var requete = window.matchMedia("(prefers-color-scheme: light)");

  function lire() {
    try {
      return localStorage.getItem(CLE);
    } catch (e) {
      return null;
    }
  }

  function ecrire(valeur) {
    try {
      localStorage.setItem(CLE, valeur);
    } catch (e) {}
  }

  function themeActuel() {
    var t = racine.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return requete.matches ? "light" : "dark";
  }

  function majBoutons(theme) {
    var versClair = theme === "dark";
    [].forEach.call(document.querySelectorAll("[data-theme-toggle]"), function (b) {
      b.setAttribute("aria-label", versClair ? "Passer au thème clair" : "Passer au thème sombre");
      b.setAttribute("title", versClair ? "Thème clair" : "Thème sombre");
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f5f8ff" : "#1a3366");
  }

  function appliquer(theme, animer) {
    if (animer) {
      racine.classList.add("theme-anim");
      window.setTimeout(function () {
        racine.classList.remove("theme-anim");
      }, 350);
    }
    racine.setAttribute("data-theme", theme);
    majBoutons(theme);
  }

  function init() {
    appliquer(themeActuel(), false);

    [].forEach.call(document.querySelectorAll("[data-theme-toggle]"), function (b) {
      b.addEventListener("click", function () {
        var suivant = themeActuel() === "dark" ? "light" : "dark";
        appliquer(suivant, true);
        ecrire(suivant);
      });
    });

    var suivreAppareil = function () {
      if (!lire()) appliquer(requete.matches ? "light" : "dark", true);
    };
    if (requete.addEventListener) requete.addEventListener("change", suivreAppareil);
    else if (requete.addListener) requete.addListener(suivreAppareil);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
