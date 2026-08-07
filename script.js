// TnD Adventures Ltd — small progressive enhancement script
// Handles scroll-reveal animations only. No dependencies.

document.addEventListener("DOMContentLoaded", function () {
  var revealEls = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else if (revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Mobile nav: hamburger toggle, slides in from the left
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var navClose = document.querySelector(".nav-close");

  if (navToggle && nav) {
    var navBackdrop = document.createElement("div");
    navBackdrop.className = "nav-backdrop";
    // Appended inside <header> (nav's own stacking context), not <body> —
    // header is position:sticky with its own z-index, so a body-level
    // backdrop would sit above the nav panel and swallow every tap on
    // the menu links even though it visually looks like it's behind them.
    var headerEl = nav.closest("header") || document.body;
    headerEl.appendChild(navBackdrop);

    function openNav() {
      nav.classList.add("open");
      navToggle.classList.add("open");
      navBackdrop.classList.add("open");
      navToggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-locked");
    }

    function closeNav() {
      nav.classList.remove("open");
      navToggle.classList.remove("open");
      navBackdrop.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-locked");
    }

    navToggle.addEventListener("click", function () {
      if (nav.classList.contains("open")) {
        closeNav();
      } else {
        openNav();
      }
    });

    if (navClose) {
      navClose.addEventListener("click", closeNav);
    }

    navBackdrop.addEventListener("click", closeNav);

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        closeNav();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 820 && nav.classList.contains("open")) {
        closeNav();
      }
    });
  }

  // Background videos: play only while their section is on screen
  var bgVideos = document.querySelectorAll("video.bg-video");
  if (bgVideos.length && "IntersectionObserver" in window) {
    var videoObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target;
          if (entry.isIntersecting) {
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
              playPromise.catch(function () {
                /* Autoplay blocked (e.g. data saver) — poster image stays visible */
              });
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 }
    );
    bgVideos.forEach(function (video) {
      videoObserver.observe(video);
    });
  }

  // Lightbox: click any .lightbox-item to view it full-size, with next/prev
  var lightboxItems = Array.prototype.slice.call(
    document.querySelectorAll(".lightbox-item")
  );

  if (lightboxItems.length) {
    var overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Close">&times;</button>' +
      '<button type="button" class="lightbox-prev" aria-label="Previous">&#10094;</button>' +
      '<div class="lightbox-content"></div>' +
      '<button type="button" class="lightbox-next" aria-label="Next">&#10095;</button>' +
      '<div class="lightbox-caption"></div>';
    document.body.appendChild(overlay);

    var lbContent = overlay.querySelector(".lightbox-content");
    var lbCaption = overlay.querySelector(".lightbox-caption");
    var activeGroup = [];
    var activeIndex = 0;

    function groupOf(name) {
      return lightboxItems.filter(function (el) {
        return (el.getAttribute("data-group") || "default") === name;
      });
    }

    function renderSlide(index) {
      activeIndex = (index + activeGroup.length) % activeGroup.length;
      var el = activeGroup[activeIndex];
      var videoSrc = el.getAttribute("data-video");
      var img = el.querySelector("img");
      var caption =
        el.getAttribute("data-caption") || (img ? img.alt : "") || "";

      lbContent.innerHTML = "";

      if (videoSrc) {
        var video = document.createElement("video");
        video.src = videoSrc;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        lbContent.appendChild(video);
      } else if (img) {
        var fullImg = document.createElement("img");
        fullImg.src = img.getAttribute("data-full") || img.src;
        fullImg.alt = caption;
        lbContent.appendChild(fullImg);
      }

      lbCaption.textContent = caption;
    }

    function openLightbox(el) {
      var groupName = el.getAttribute("data-group") || "default";
      activeGroup = groupOf(groupName);
      var startIndex = activeGroup.indexOf(el);
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
      renderSlide(startIndex);
    }

    function closeLightbox() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
      lbContent.innerHTML = "";
    }

    lightboxItems.forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        openLightbox(el);
      });
    });

    overlay.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    overlay.querySelector(".lightbox-prev").addEventListener("click", function () {
      renderSlide(activeIndex - 1);
    });
    overlay.querySelector(".lightbox-next").addEventListener("click", function () {
      renderSlide(activeIndex + 1);
    });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (!overlay.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") renderSlide(activeIndex + 1);
      if (e.key === "ArrowLeft") renderSlide(activeIndex - 1);
    });
  }
});
