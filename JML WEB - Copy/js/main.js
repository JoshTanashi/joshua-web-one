/* ============================================================
   main.js — JML Photography
   Site scripts: menu, smooth scroll, reveals, booking form,
   portfolio strips + lightbox, cinematic fades.
============================================================ */

(function () {
  /* --------------------------
     DOM helpers
  ---------------------------*/
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* --------------------------
     MENU TOGGLE (main + affiliate safe)
  ---------------------------*/
  function wireMenu(toggleId = "#menuToggle", navSel = ".nav") {
    const menuBtn = document.querySelector(toggleId);
    const nav = document.querySelector(navSel);
    if (!menuBtn || !nav) return;
    menuBtn.addEventListener("click", () => {
      const expanded = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("open");
    });
    // close on nav link click
    $$(navSel + " a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
  }
  wireMenu("#menuToggle", "#siteNav");
  wireMenu("#menuToggleAffiliate", "#siteNavAffiliate");

  /* --------------------------
     SMOOTH SCROLL FOR HASH LINKS
  ---------------------------*/
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* --------------------------
     LAZY LOADING (lozad if present)
  ---------------------------*/
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof lozad === "function") {
      const observer = lozad();
      observer.observe();
    }
  });

  /* --------------------------
     REVEAL / CINEMATIC OBSERVER
  ---------------------------*/
  const revealEls = document.querySelectorAll(".reveal, .section, .bubble, .panel, .hero-content");
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* --------------------------
     SMALL UI TOUCHES (buttons & hero)
  ---------------------------*/
  document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("mousedown", () => btn.style.transform = "scale(0.97)");
    btn.addEventListener("mouseup", () => btn.style.transform = "scale(1)");
    btn.addEventListener("mouseleave", () => btn.style.transform = "scale(1)");
  });
  window.addEventListener("DOMContentLoaded", () => {
    const hero = document.querySelector(".hero-content");
    if (hero) {
      hero.style.opacity = 0;
      hero.style.transform = "translateY(18px)";
      setTimeout(() => {
        hero.style.transition = "0.9s ease";
        hero.style.opacity = 1;
        hero.style.transform = "translateY(0)";
      }, 200);
    }
  });

  /* --------------------------
     BOOKING FORM (index) — AJAX submit to Netlify
     Expects form id="bookingForm" with hidden input form-name
     Shows #bookingSuccess when successful
  ---------------------------*/
  (function bookingHandler() {
    const form = $("#bookingForm");
    if (!form) return;
    const successBox = $("#bookingSuccess");
    const clearBtn = $("#bookingClear");

    // clear
    if (clearBtn) clearBtn.addEventListener("click", () => {
      form.reset();
      if (successBox) successBox.classList.add("hidden");
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // basic validation for required fields
      const requireds = form.querySelectorAll("[required]");
      for (let field of requireds) {
        if (!field.value.trim()) {
          field.focus();
          field.classList.add("error");
          setTimeout(() => field.classList.remove("error"), 900);
          return;
        }
      }
      const data = new FormData(form);
      fetch("/", { method: "POST", body: data })
        .then(() => {
          if (successBox) {
            successBox.classList.remove("hidden");
            successBox.style.opacity = "0";
            setTimeout(() => (successBox.style.opacity = "1"), 60);
          }
          form.reset();
        })
        .catch(err => {
          console.error("Booking form submit error:", err);
          alert("Something went wrong sending the booking. Please try again.");
        });
    });
  })();

  /* --------------------------
     PORTFOLIO STRIPS + PANEL EXPAND + LAZY LOAD
     + LIGHTBOX (category-scoped)
  ---------------------------*/
  (function portfolioStripsAndLightbox() {
    const strips = $$(".strip");
    if (!strips.length) return;

    // Helpers
    function loadPanelImages(panel) {
      $$(".panel-img", panel).forEach(img => {
        if (!img.src) {
          const src = img.getAttribute("data-src");
          if (src) {
            img.src = src;
            img.addEventListener("load", () => img.classList.add("loaded"));
            setTimeout(() => img.classList.add("loaded"), 900);
          }
        }
      });
    }

    function closeAllExcept(key) {
      strips.forEach(s => {
        if (s.dataset.key !== key && s.classList.contains("open")) {
          s.classList.remove("open");
          s.setAttribute("aria-expanded", "false");
          const panel = s.nextElementSibling;
          if (panel && panel.classList.contains("strip-panel")) panel.setAttribute("aria-hidden", "true");
        }
      });
    }

    // Lightbox elements (global)
    const LB = {
      container: $("#lightbox"),
      backdrop: $(".lb-backdrop"),
      image: $("#lbImage"),
      caption: $("#lbCaption"),
      counter: $("#lbCounter"),
      prev: $("#lbPrev"),
      next: $("#lbNext"),
      close: $("#lbClose"),
      state: { index: 0, list: [] }
    };

    function listImagesForKey(key) {
      const panel = document.querySelector(`.strip-panel[data-key="${key}"]`);
      if (!panel) return [];
      return $$(".panel-img", panel).map(img => ({ src: img.src || img.dataset.src, alt: img.alt || "" }));
    }

    function openLightbox(list, index) {
      if (!LB.container) return;
      LB.state.list = list.slice();
      LB.state.index = index || 0;
      const item = LB.state.list[LB.state.index];
      LB.image.src = item.src || "";
      LB.image.alt = item.alt || "";
      if (LB.caption) LB.caption.textContent = item.alt || "";
      if (LB.counter) LB.counter.textContent = `${LB.state.index + 1} / ${LB.state.list.length}`;
      LB.container.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function closeLightbox() {
      if (!LB.container) return;
      LB.container.setAttribute("aria-hidden", "true");
      LB.image.src = "";
      document.body.style.overflow = "";
      LB.state = { index: 0, list: [] };
    }
    function showNext() {
      if (!LB.state.list.length) return;
      LB.state.index = (LB.state.index + 1) % LB.state.list.length;
      const it = LB.state.list[LB.state.index];
      LB.image.src = it.src;
      if (LB.caption) LB.caption.textContent = it.alt || "";
      if (LB.counter) LB.counter.textContent = `${LB.state.index + 1} / ${LB.state.list.length}`;
    }
    function showPrev() {
      if (!LB.state.list.length) return;
      LB.state.index = (LB.state.index - 1 + LB.state.list.length) % LB.state.list.length;
      const it = LB.state.list[LB.state.index];
      LB.image.src = it.src;
      if (LB.caption) LB.caption.textContent = it.alt || "";
      if (LB.counter) LB.counter.textContent = `${LB.state.index + 1} / ${LB.state.list.length}`;
    }

    if (LB.next) LB.next.addEventListener("click", showNext);
    if (LB.prev) LB.prev.addEventListener("click", showPrev);
    if (LB.close) LB.close.addEventListener("click", closeLightbox);
    if (LB.backdrop) LB.backdrop.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", (e) => {
      if (LB.container && LB.container.getAttribute("aria-hidden") === "false") {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") showNext();
        if (e.key === "ArrowLeft") showPrev();
      }
    });

    // Simple swipe support
    (function swipe() {
      let startX = 0, startTime = 0;
      const wrap = LB.container && LB.container.querySelector(".lb-panel");
      if (!wrap) return;
      wrap.addEventListener("touchstart", e => {
        const t = e.changedTouches[0];
        startX = t.pageX; startTime = new Date().getTime();
      });
      wrap.addEventListener("touchend", e => {
        const t = e.changedTouches[0];
        const distX = t.pageX - startX;
        const elapsed = new Date().getTime() - startTime;
        if (elapsed < 600 && Math.abs(distX) > 40) {
          distX < 0 ? showNext() : showPrev();
        }
      });
    })();

    // Wire strips
    strips.forEach(strip => {
      const key = strip.dataset.key;
      const panel = strip.nextElementSibling;
      if (!panel) return;

      // click opens/closes panel; but ignore clicks on booking button inside strip
      strip.addEventListener("click", (e) => {
        if (e.target.closest(".btn-book")) return;
        if (strip.classList.contains("open")) closeStrip(strip, panel); else openStrip(strip, panel);
      });

      strip.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (strip.classList.contains("open")) closeStrip(strip, panel); else openStrip(strip, panel);
        }
        if (e.key === "Escape" && strip.classList.contains("open")) closeStrip(strip, panel);
      });

      function openStrip(s, p) {
        closeAllExcept(key);
        s.classList.add("open");
        s.setAttribute("aria-expanded", "true");
        p.setAttribute("aria-hidden", "false");
        loadPanelImages(p);
        setTimeout(() => {
          const top = s.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top, behavior: "smooth" });
        }, 140);
      }
      function closeStrip(s, p) {
        s.classList.remove("open");
        s.setAttribute("aria-expanded", "false");
        p.setAttribute("aria-hidden", "true");
      }

      // when a panel image clicked, open lightbox with that category's images
      panel.addEventListener("click", (ev) => {
        const img = ev.target.closest(".panel-img");
        if (!img) return;
        if (!img.src) {
          const src = img.dataset.src;
          if (src) img.src = src;
        }
        const list = listImagesForKey(key);
        const imgs = $$(".panel-img", panel);
        const idx = imgs.indexOf(img);
        openLightbox(list, Math.max(0, idx));
      });
    });
  })();

})(); // end main.js

/* ===================================
   HERO SLIDESHOW — CINEMATIC VERSION
   Fade + Zoom + Ghost Preview + Intro
=================================== */

document.addEventListener("DOMContentLoaded", () => {

  const slides = [
    "assets/wedding-01.jpg",
    "assets/wedding-02.jpg",
    "assets/wedding-03.jpg"
  ];

  const slideEls = document.querySelectorAll(".hero-slide");
  const ghost = document.querySelector(".hero-ghost");
  const hero = document.querySelector(".hero");
  const fill = document.querySelector(".hero-loading-fill");

  let current = 0;

  // Insert images
  slideEls.forEach((el, i) => {
    el.style.backgroundImage = `url('${slides[i]}')`;
  });

  // Intro effect
  setTimeout(() => hero.classList.add("loaded"), 100);

  slideEls[0].classList.add("active");

  function animateBar() {
    fill.style.transition = "none";
    fill.style.width = "0%";

    requestAnimationFrame(() => {
      setTimeout(() => {
        fill.style.transition = "width 6.5s linear";
        fill.style.width = "100%";
      }, 50);
    });
  }

  function nextSlide() {
    const prev = current;
    current = (current + 1) % slides.length;

    // Ghost preview (next slide)
    ghost.style.backgroundImage = `url('${slides[current]}')`;
    ghost.style.opacity = 0.15;  // subtle ghost
    setTimeout(() => (ghost.style.opacity = 0), 1100);

    // Swap slides
    slideEls[prev].classList.remove("active");
    slideEls[current].classList.add("active");
    
    animateBar();
  }

  animateBar();
  setInterval(nextSlide, 6500);
});
