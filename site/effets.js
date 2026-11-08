/*
  Effets interactifs du portfolio : barre de lecture, menu qui suit la section,
  filtres de projets, halo au survol, texte qui s'écrit.
  Sans dépendance. Aucun contenu existant n'est modifié : tout s'active par
  des attributs data-* ajoutés sur les éléments existants.
  Appel manuel possible (React, etc.) : window.initEffets()
*/
(function () {
  "use strict";

  var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function barreLecture() {
    if (document.querySelector(".fx-lecture")) return;
    var conteneur = document.createElement("div");
    conteneur.className = "fx-lecture";
    conteneur.setAttribute("aria-hidden", "true");
    var barre = document.createElement("div");
    barre.className = "fx-lecture-barre";
    conteneur.appendChild(barre);
    document.body.appendChild(conteneur);

    var enAttente = false;
    function maj() {
      var hauteur = document.documentElement.scrollHeight - window.innerHeight;
      var p = hauteur > 0 ? Math.min(1, Math.max(0, window.scrollY / hauteur)) : 0;
      barre.style.transform = "scaleX(" + p + ")";
      enAttente = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!enAttente) {
          enAttente = true;
          requestAnimationFrame(maj);
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", maj);
    maj();
  }

  function menuActif() {
    if (window.__fxMenu || !("IntersectionObserver" in window)) return;
    var liens = [].slice.call(document.querySelectorAll('nav a[href^="#"]')).filter(function (l) {
      return l.getAttribute("href").length > 1;
    });
    if (!liens.length) return;

    var parId = {};
    liens.forEach(function (l) {
      var id = l.getAttribute("href").slice(1);
      (parId[id] = parId[id] || []).push(l);
    });

    var observateur = new IntersectionObserver(
      function (entrees) {
        entrees.forEach(function (e) {
          if (!e.isIntersecting) return;
          liens.forEach(function (l) {
            l.classList.remove("fx-actif");
            l.removeAttribute("aria-current");
          });
          (parId[e.target.id] || []).forEach(function (l) {
            l.classList.add("fx-actif");
            l.setAttribute("aria-current", "true");
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    var trouve = false;
    Object.keys(parId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) {
        observateur.observe(section);
        trouve = true;
      }
    });
    window.__fxMenu = trouve;
  }

  function halo() {
    [].forEach.call(document.querySelectorAll("[data-halo]"), function (el) {
      if (el.classList.contains("fx-halo")) return;
      el.classList.add("fx-halo");
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--fx-x", e.clientX - r.left + "px");
        el.style.setProperty("--fx-y", e.clientY - r.top + "px");
      });
    });
  }

  function filtres() {
    [].forEach.call(document.querySelectorAll("[data-filtres]"), function (zone) {
      if (zone.classList.contains("fx-filtres")) return;
      var cible = document.querySelector(zone.getAttribute("data-filtres") || "[data-filtres-grille]");
      if (!cible) return;

      var items = [].slice.call(cible.querySelectorAll("[data-categorie]"));
      var categories = [];
      items.forEach(function (it) {
        it.getAttribute("data-categorie")
          .split(/\s+/)
          .filter(Boolean)
          .forEach(function (c) {
            if (categories.indexOf(c) < 0) categories.push(c);
          });
      });
      if (categories.length < 2) return;

      zone.classList.add("fx-filtres");
      zone.setAttribute("role", "group");
      zone.setAttribute("aria-label", "Filtrer les projets par catégorie");

      var boutons = [];
      function creer(libelle, valeur) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "fx-filtre";
        b.textContent = libelle;
        b.setAttribute("aria-pressed", valeur === null ? "true" : "false");
        b.addEventListener("click", function () {
          boutons.forEach(function (x) {
            x.setAttribute("aria-pressed", x === b ? "true" : "false");
          });
          appliquer(valeur);
        });
        boutons.push(b);
        zone.appendChild(b);
      }
      creer(zone.getAttribute("data-label-tous") || "Tous", null);
      categories.forEach(function (c) {
        creer(c.replace(/_/g, " "), c);
      });

      function appliquer(valeur) {
        items.forEach(function (it) {
          var jetons = it.getAttribute("data-categorie").split(/\s+/);
          var visible = valeur === null || jetons.indexOf(valeur) > -1;
          if (visible) {
            it.hidden = false;
            requestAnimationFrame(function () {
              it.classList.remove("fx-sortie");
            });
          } else {
            it.classList.add("fx-sortie");
            if (reduit) {
              it.hidden = true;
            } else {
              setTimeout(function () {
                if (it.classList.contains("fx-sortie")) it.hidden = true;
              }, 260);
            }
          }
        });
      }
    });
  }

  function frappe() {
    if (reduit) return;
    [].forEach.call(document.querySelectorAll("[data-typing]"), function (el) {
      if (el.classList.contains("fx-frappe")) return;
      var mots;
      try {
        mots = JSON.parse(el.getAttribute("data-typing"));
      } catch (e) {
        return;
      }
      if (!Array.isArray(mots) || !mots.length) return;

      var original = el.textContent;
      var lecteur = document.createElement("span");
      lecteur.className = "fx-sr";
      lecteur.textContent = original;
      el.parentNode.insertBefore(lecteur, el);
      el.setAttribute("aria-hidden", "true");
      el.classList.add("fx-frappe");
      el.textContent = "";

      var m = 0;
      var c = 0;
      var efface = false;
      function pas() {
        var mot = String(mots[m]);
        if (!efface) {
          c++;
          el.textContent = mot.slice(0, c);
          if (c >= mot.length) {
            efface = true;
            return setTimeout(pas, 1600);
          }
          setTimeout(pas, 70);
        } else {
          c--;
          el.textContent = mot.slice(0, c);
          if (c <= 0) {
            efface = false;
            m = (m + 1) % mots.length;
            return setTimeout(pas, 350);
          }
          setTimeout(pas, 35);
        }
      }
      pas();
    });
  }

  function init() {
    barreLecture();
    menuActif();
    halo();
    filtres();
    frappe();
  }

  window.initEffets = init;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
