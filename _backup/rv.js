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
      window.location.href = "contato.html";
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

  var form = document.querySelector(".rv-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = form.querySelector(".rv-note");
      if (note) note.hidden = false;
      form.reset();
    });
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
    var sections = document.querySelectorAll("section[id], footer[id]");
    if (titleInner && sections.length) {
      var labelObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var name = labelOf[en.target.id];
          if (name) titleInner.textContent = name;
        });
      }, { root: root, rootMargin: "-45% 0px -45% 0px", threshold: 0 });
      sections.forEach(function (el) { labelObs.observe(el); });
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
    function updateCollection() {
      if (!collection || !down || !up) return;
      if (reduce) {
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
