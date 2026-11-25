(function () {
  function setVh() {
    document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px");
  }
  setVh();
  window.addEventListener("resize", setVh);

  var app = document.querySelector(".app");
  var header = document.querySelector("header.header");
  var menu = document.querySelector(".menu");
  var scroller = document.querySelector(".scroll");
  if (!app || !header || !menu) return;

  var burger = header.querySelector(".burger");
  var closeBtn = header.querySelector(".close");
  var topBtn = header.querySelector(".arrow");
  var titleInner = header.querySelector(".title-inner");

  function openMenu(e) {
    if (e) e.preventDefault();
    app.classList.add("is-menu");
    header.classList.add("menu-open");
  }
  function closeMenu() {
    app.classList.remove("is-menu");
    header.classList.remove("menu-open");
  }
  if (burger) burger.addEventListener("click", openMenu);
  var title = header.querySelector(".title");
  if (title) title.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
  });
  if (topBtn) topBtn.addEventListener("click", function (e) {
    e.preventDefault();
    if (scroller) scroller.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  menu.querySelectorAll(".sub a").forEach(function (a) {
    if (!a.textContent.trim()) {
      var li = a.closest("li");
      if (li) li.style.display = "none";
    }
  });

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (a && menu.contains(a)) closeMenu();
    var btn = e.target.closest("button");
    if (!btn) return;
    var label = btn.textContent || "";
    if (btn.getAttribute("to") === "get-a-quote" || /orçamento|cotar|cota/i.test(label)) {
      var formulario = document.getElementById("formulario");
      if (formulario) {
        closeMenu();
        formulario.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.location.href = "contato.html#formulario";
      }
    }
  });

  document.querySelectorAll(".google-reviews .foot a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var card = a.closest(".card");
      if (!card) return;
      var open = card.classList.toggle("is-expanded");
      a.querySelectorAll(".line").forEach(function (line) {
        line.textContent = open ? "Ler menos" : "Ler mais";
      });
    });
  });

  var play = document.querySelector(".banner-showroom .icon");
  var video = document.querySelector(".banner-showroom video");
  if (play && video) {
    play.style.cursor = "pointer";
    play.addEventListener("click", function () {
      if (video.paused) {
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
        play.style.opacity = "0";
      } else {
        video.pause();
        play.style.opacity = "1";
      }
    });
  }

  var form = document.querySelector(".rv-quote");
  if (form) {
    var options = form.querySelectorAll(".button[aria-pressed]");
    options.forEach(function (opt) {
      opt.addEventListener("click", function () {
        var on = opt.getAttribute("aria-pressed") !== "true";
        opt.setAttribute("aria-pressed", on ? "true" : "false");
        opt.classList.toggle("is-active", on);
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.reportValidity && !form.reportValidity()) return;
      var note = form.querySelector(".success");
      if (note) note.hidden = false;
      form.reset();
      options.forEach(function (opt) {
        opt.setAttribute("aria-pressed", "false");
        opt.classList.remove("is-active");
      });
    });
  }

  // âncoras (#portas, #formulario...) rolam o contêiner .scroll, não a janela
  function scrollToHash(hash, smooth) {
    if (!hash || hash.length < 2) return false;
    var el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return false;
    var box = scroller || document.documentElement;
    var base = scroller ? scroller.getBoundingClientRect().top : 0;
    var top = el.getBoundingClientRect().top - base + box.scrollTop - 40;
    box.scrollTo({ top: Math.max(0, top), behavior: smooth ? "smooth" : "auto" });
    return true;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href*='#']");
    if (!a || a.target === "_blank") return;
    var url = new URL(a.getAttribute("href"), window.location.href);
    if (url.pathname !== window.location.pathname || !url.hash) return;
    if (scrollToHash(url.hash, true)) {
      e.preventDefault();
      history.replaceState(null, "", url.hash);
    }
  });
  if (window.location.hash) {
    window.addEventListener("load", function () { scrollToHash(window.location.hash, false); });
  }

  if ("IntersectionObserver" in window) {
    var root = scroller || null;
    var labelOf = {
      inicio: "Início",
      sobre: "Sobre",
      colecao: "Coleção",
      showroom: "Showroom",
      projetos: "Projetos",
      historias: "Histórias",
      metodo: "Método",
      contato: "Contato"
    };
    var sections = document.querySelectorAll("[data-rv-label], section[id], footer[id]");
    // rótulo da barra = seção que ocupa o meio da tela (calculado a cada rolagem)
    function updateLabel() {
      if (!titleInner || !sections.length) return;
      var mid = ((scroller && scroller.clientHeight) || window.innerHeight) / 2;
      var name = null;
      sections.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.height && r.top <= mid && r.bottom > mid) {
          name = el.getAttribute("data-rv-label") || labelOf[el.id] || name;
        }
      });
      if (name && titleInner.textContent !== name) titleInner.textContent = name;
    }
    var inicio = document.getElementById("inicio") || document.querySelector("main section");
    if (inicio) {
      var topObs = new IntersectionObserver(function (entries) {
        header.classList.toggle("is-scrolled", !entries[0].isIntersecting);
      }, { root: root, threshold: 0 });
      topObs.observe(inicio);
    }
    var masks = document.querySelectorAll(".line-mask");
    masks = [].filter.call(masks, function (mask) {
      return !mask.closest(".menu, .base-button, .label");
    });
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function clearFrozen(el) {
      el.style.removeProperty("transform");
      el.style.removeProperty("translate");
      el.style.removeProperty("rotate");
      el.style.removeProperty("scale");
    }
    masks.forEach(function (mask) {
      mask.querySelectorAll(".line").forEach(function (line, i) {
        clearFrozen(line);
        line.style.transitionDelay = reduce ? "0s" : (i * 0.12) + "s";
        if (reduce) line.classList.add("is-in");
      });
    });
    function revealLines() {
      if (reduce) return;
      var vh = (scroller && scroller.clientHeight) || window.innerHeight;
      masks.forEach(function (mask) {
        if (mask.dataset.shown) return;
        var rect = mask.getBoundingClientRect();
        if (rect.top < vh * 0.88 && rect.bottom > 0) {
          mask.dataset.shown = "1";
          mask.querySelectorAll(".line").forEach(function (line) {
            line.classList.add("is-in");
          });
        }
      });
    }

    var collection = document.querySelector(".product-collection");
    var shift = collection ? collection.querySelectorAll(".block") : [];
    var down = shift[1];
    var up = shift[2];
    var small = window.matchMedia("(max-width: 600px)");
    function updateCollection() {
      if (!collection || !down || !up) return;
      if (reduce || small.matches) {
        down.style.transform = "none";
        up.style.transform = "none";
        return;
      }
      var rect = collection.getBoundingClientRect();
      var vh = (scroller && scroller.clientHeight) || window.innerHeight;
      var progress = (vh - rect.top) / (vh + rect.height);
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;
      var rest = (1 - progress) * 50;
      down.style.transform = "translate3d(0," + rest + "%,0)";
      up.style.transform = "translate3d(0," + (-rest) + "%,0)";
    }
    function onMove() {
      updateCollection();
      revealLines();
      updateLabel();
    }
    onMove();
    if (scroller) scroller.addEventListener("scroll", onMove, { passive: true });
    document.addEventListener("scroll", onMove, { passive: true, capture: true });
    window.addEventListener("resize", onMove);
    var lastScroll = -1;
    function trackScroll() {
      var y = scroller ? scroller.scrollTop : window.scrollY;
      if (y !== lastScroll) {
        lastScroll = y;
        onMove();
      }
      requestAnimationFrame(trackScroll);
    }
    trackScroll();
  }
})();
