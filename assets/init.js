// document.addEventListener("DOMContentLoaded", () => {
const wWidth = window.innerWidth;
const wHeight = window.innerHeight;
const header = document.querySelector(".wraper-header");
const headerHeight = document.querySelector(".wraper-header").offsetHeight;
//console.log(headerHeight);

// if (typeof DrawSVGPlugin !== "undefined") {
//   gsap.registerPlugin(ScrollTrigger, SplitText, ScrollSmoother, DrawSVGPlugin);
// } else {
//   gsap.registerPlugin(ScrollTrigger, SplitText, ScrollSmoother);
// }
gsap.registerPlugin(ScrollTrigger, SplitText, ScrollSmoother);
ScrollTrigger.clearScrollMemory("manual");

let isOnlyTouchDevice =
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0 ||
  (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) ||
  /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);


function isMobileDevice() {
  const isSmallScreen = window.innerWidth < 1200;
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Detect actual mobile/tablet devices, not just touch screens
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUserAgent = /android|iphone|ipad|ipod|mobile/i.test(userAgent);

  return isSmallScreen && (hasTouch || isMobileUserAgent);
}

function initSmoother() {
  // Function to check if the device supports touch events

  // Only initialize smoother for non-touch devices on large screens (>= 1200px width)
  if (!isMobileDevice()) {

    let smoother;
    // -- for desktop --------
    if (!smoother) {
      smoother = ScrollSmoother.create({
        wrapper: "#main",
        content: "#content",
        effects: true,
        smooth: 1.2,
        normalizeScroll: {
          allowNestedScroll: true,
          lockAxis: true,
        },
        ignoreMobileResize: true,
        preventDefault: true,
        smoothTouch: false,
      });
    }
  }
}

// Initial call to initSmoother
initSmoother();

if (!isMobileDevice()) {
  initHomePlatformFeatures();
}


initHomeAudienceCards();
initHomeAiEngineAlertsMock();

// Advice intro: sticky via GSAP pin when ScrollSmoother is active (non-touch)
const scroller = document.querySelector("#main");


// Header background change on scroll
const siteHeader = document.getElementById("siteHeader");
ScrollTrigger.create({
  start: 40,
  end: 999999,
  toggleClass: { targets: siteHeader, className: "is-scrolled" },
});

const homeHeroSliderEl = document.querySelector(".homeHeroSwiper");
if (homeHeroSliderEl && typeof Swiper !== "undefined") {
  new Swiper(homeHeroSliderEl, {
    effect: "fade",
    speed: 1600,
    loop: true,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },
    fadeEffect: {
      crossFade: true,
    },
    parallax: true,
    allowTouchMove: false,
  });
}

// Reusable mouse-move parallax: .moving_mouse_area + .moving_elm (smooth lerp, optional tilt, smooth reset)
if (!isMobileDevice()) {
  const movingAreas = document.querySelectorAll(".moving_mouse_area");
  const DEFAULT_MOVE = 14;
  const LERP = 0.14; // 0–1: lower = smoother/slower follow
  const TILT_MAX = 4; // max degrees for 3D tilt

  const areaStates = [];

  movingAreas.forEach((area) => {
    const movingElms = area.querySelectorAll(".moving_elm");
    if (!movingElms.length) return;

    const elmData = [];
    movingElms.forEach((elm) => {
      elmData.push({
        elm,
        curX: 0,
        curY: 0,
        curRotX: 0,
        curRotY: 0,
        moveX: Number(elm.dataset.moveX) || DEFAULT_MOVE,
        moveY: Number(elm.dataset.moveY) || DEFAULT_MOVE,
        tilt: elm.hasAttribute("data-tilt") ? (Number(elm.dataset.tilt) || TILT_MAX) : 0,
      });
    });

    const state = {
      elmData,
      targetNormX: 0,
      targetNormY: 0,
      applyTransforms() {
        let anyDirty = false;
        const tx = this.targetNormX;
        const ty = this.targetNormY;
        this.elmData.forEach((d) => {
          d.curX += (tx * d.moveX - d.curX) * LERP;
          d.curY += (ty * d.moveY - d.curY) * LERP;
          if (d.tilt !== 0) {
            d.curRotY += (tx * d.tilt - d.curRotY) * LERP;
            d.curRotX += (-ty * d.tilt - d.curRotX) * LERP;
          }
          const rx = d.curRotX;
          const ry = d.curRotY;
          const tol = 0.015;
          if (Math.abs(d.curX) > tol || Math.abs(d.curY) > tol || Math.abs(rx) > tol || Math.abs(ry) > tol) anyDirty = true;
          const rot = d.tilt !== 0 ? `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) ` : "";
          d.elm.style.transform = `${rot}translate(${d.curX}px, ${d.curY}px)`.trim();
        });
        return anyDirty;
      },
    };

    areaStates.push(state);

    area.addEventListener("mousemove", (e) => {
      const rect = area.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      state.targetNormX = (x - 1) * 2;
      state.targetNormY = (y - 1) * 2;
    });

    area.addEventListener("mouseleave", () => {
      state.targetNormX = 0;
      state.targetNormY = 0;
    });
  });

  (function tick() {
    areaStates.forEach((state) => state.applyTransforms());
    requestAnimationFrame(tick);
  })();
}




function scrollToDocumentTarget(target, offset = 30) {
  if (!target) return;
  const smoother = typeof ScrollSmoother !== "undefined" && ScrollSmoother.get ? ScrollSmoother.get() : null;
  if (smoother) {
    smoother.scrollTo(target, true, `top ${offset}px`);
    return;
  }
  const targetTop = target.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
}

const sceScrollButtons = document.querySelectorAll(".goto_sec_btn");
sceScrollButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = button.getAttribute("data-target");
    const targetSection = document.getElementById(targetId);
    scrollToDocumentTarget(targetSection, 30);
  });
});

document.querySelectorAll(".js-scroll-top, .brand-logo a, .footer_logo_mark").forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href") || "";
    if (href === "#top" || href.endsWith("/#") || href === "#") {
      e.preventDefault();
      const smoother = typeof ScrollSmoother !== "undefined" && ScrollSmoother.get ? ScrollSmoother.get() : null;
      if (smoother) smoother.scrollTo(0, true);
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
});



// ============== ///// start common-gsap animation ////// =====================

if (!isMobileDevice()) {
  if (document.querySelectorAll(".fade-in").length > 0) {
    // guards (optional): skip animations for reduced-motion users
    if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
      gsap.set(".fade-in", {
        y: 50,
        opacity: 0,
        willChange: "transform, opacity",
      });

      ScrollTrigger.batch(".fade-in", {
        start: "top 100%",
        once: false, // set true if you don't want it to replay on scroll up
        onEnter: (targets, triggers) => {
          gsap.to(targets, {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            stagger: { each: 0.08, from: "start" },
            overwrite: "auto",
          });
        },
        onLeaveBack: (targets) => {
          // match your toggleActions "reverse" behavior
          gsap.to(targets, {
            y: 50,
            opacity: 0,
            duration: 0.6,
            ease: "power3.inOut",
            overwrite: "auto",
          });
        },
      });

      // optional: refresh on images/fonts load to avoid misaligned triggers
      window.addEventListener("load", () => ScrollTrigger.refresh());
    }
  }

  // ------------- end fade-in ------------

  // ------------- img_ani_wrapper clip reveal ------------
  if (document.querySelectorAll(".img_ani_wrapper").length > 0) {
    // const prefersNoMotion = !window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

    document.querySelectorAll(".img_ani_wrapper").forEach((wrapper) => {
      const clipWrapper = wrapper.querySelector(".img_clip_wrapper") || wrapper;
      const img = wrapper.querySelector("img");

      // if (prefersNoMotion) {
      //   gsap.set(wrapper, { opacity: 1 });
      //   gsap.set(clipWrapper, { clipPath: "inset(0% 0% 0% 0%)" });
      //   if (img) gsap.set(img, { opacity: 1, y: 0, scale: 1 });
      //   return;
      // }

      // Initial state before the reveal
      gsap.set(wrapper, { opacity: 0 });
      gsap.set(clipWrapper, {
        overflow: "hidden",
        clipPath: "inset(0% 100% 100% 0%)", // hidden from bottom
        willChange: "clip-path",
      });

      if (img) {
        gsap.set(img, { opacity: 0, y: 18, scale: 1.55, willChange: "opacity, transform" });
      }

      const tl = gsap.timeline({ paused: true });
      tl.to(
        clipWrapper,
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1,
          ease: "power3.out",
          overwrite: "auto",
        },
        0
      ).to(
        wrapper,
        {
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          overwrite: "auto",
        },
        0
      );

      if (img) {
        tl.to(
          img,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power3.out",
            overwrite: "auto",
          },
          0
        );
      }

      ScrollTrigger.create({
        trigger: wrapper,
        start: "top 88%",
        end: "bottom top",
        invalidateOnRefresh: true,
        onEnter: () => tl.play(),
        onEnterBack: () => tl.play(),
        onLeaveBack: () => tl.reverse(),
        //markers:true,
      });
    });

    // refresh on images/fonts load to avoid misaligned triggers
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }


  // Function to create a timeline for sliding words from the right
  function createSlideFromRightAnimation(element) {
    // Split text into words using SplitText
    const split = new SplitText(element, { type: "words" });
    const words = split.words; // Get the split words

    // Timeline that we will manually control via ScrollTrigger
    const tl = gsap.timeline({ paused: true });

    tl.from(words, {
      opacity: 0,
      x: "1em",
      duration: 0.8,
      ease: "power2.out",
      stagger: { amount: 0.3 },
    });

    // `.for_sticky_animation` host: use it as trigger (stable with pin) and offset `start` by the
    // vertical gap from host top → heading so the word animation begins when the heading hits the
    // same viewport line as a normal `words_slide_from_right` ("top 97%").
    const stickyHost = element.closest(".for_sticky_animation");
    const scrollTriggerEl = stickyHost || element;
    const useGapStart = Boolean(stickyHost && stickyHost !== element);

    ScrollTrigger.create({
      trigger: scrollTriggerEl,
      start: useGapStart
        ? () => {
          const hostRect = scrollTriggerEl.getBoundingClientRect();
          const elRect = element.getBoundingClientRect();
          const gap = elRect.top - hostRect.top;
          return `top+=${gap} 97%`;
        }
        : "top 97%",
      end: "bottom top",
      invalidateOnRefresh: true,
      //markers:true,
      onEnter(self) {
        // When entering while scrolling down, play the animation.
        // When entering while scrolling up, just show the final state.
        if (self.direction === 1) {
          tl.restart();
        } else {
          tl.progress(1).pause();
        }
      },
      onEnterBack(self) {
        // Same logic when re-entering from below (scrolling up).
        if (self.direction === 1) {
          tl.restart();
        } else {
          tl.progress(1).pause();
        }
      },
      onLeave() {
        // Leaving downward: reset immediately (element is moving out below)
        tl.pause(0);
      },
      onLeaveBack() {
        // Leaving upward: smoothly reverse instead of snapping invisible
        tl.timeScale(1).reverse();
      },
      // Optional: clean up SplitText if this trigger is ever killed
      onKill() {
        split.revert();
      },
    });
  }

  // Example usage:
  // Find all elements with the class 'words_slide_from_right'
  document.querySelectorAll(".words_slide_from_right").forEach((element) => {
    createSlideFromRightAnimation(element);
  });



  // Function to create line-based slide-up animation for .text_ani_style2
  function createTextAniStyle2Animation(element) {
    // Split text into lines using GSAP SplitText
    const split = new SplitText(element, { type: "lines" });
    const lines = split.lines;

    const tl = gsap.timeline({ paused: true });

    tl.from(lines, {
      y: "100%",
      opacity: 0,
      duration: 0.5,
      ease: "sine.out",
      stagger: 0.1,
    });

    ScrollTrigger.create({
      trigger: element,
      start: "top 97%",
      end: "bottom top",
      onEnter(self) {
        if (self.direction === 1) {
          tl.restart();
        } else {
          tl.progress(1).pause();
        }
      },
      onEnterBack(self) {
        if (self.direction === 1) {
          tl.restart();
        } else {
          tl.progress(1).pause();
        }
      },
      onLeave() {
        // Leaving downward: reset immediately (element mostly out of view)
        tl.pause(0);
      },
      onLeaveBack() {
        // Leaving upward: smoothly reverse instead of snapping invisible
        tl.timeScale(1).reverse();
      },
      onKill() {
        split.revert();
      },
    });
  }

  document.querySelectorAll(".text_ani_style2").forEach((element) => {
    createTextAniStyle2Animation(element);
  });





  (function initZoomingAniGsap() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    // Function to create the animation timeline
    const createZoomingAnimation = (zoomingAniItems) => {
      const tl = gsap.timeline({ paused: true });

      tl.fromTo(
        zoomingAniItems,
        {
          opacity: 0,
          scale: 0.4,
          y: 40,
          rotationX: -30,
          transformOrigin: "50% 50%",
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotationX: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: { each: 0.1, from: "start" },
        }
      );

      return tl;
    };

    // Function to create a ScrollTrigger instance
    const createScrollTrigger = (section, tl) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 90%",
        end: "bottom top",
        onEnter: (self) => handleScrollEnter(self, tl),
        onEnterBack: (self) => handleScrollEnterBack(self, tl),
        onLeave: () => tl.pause(0),
        onLeaveBack: () => tl.timeScale(1).reverse(),
      });
    };

    // Handle animation on scroll enter (downward direction)
    const handleScrollEnter = (self, tl) => {
      if (self.direction === 1) {
        tl.restart();
      } else {
        tl.progress(1).pause();
      }
    };

    // Handle animation on scroll enter from the bottom (upward direction)
    const handleScrollEnterBack = (self, tl) => {
      if (self.direction === 1) {
        tl.restart();
      } else {
        tl.progress(1).pause();
      }
    };

    // Select all sections with the zooming animation trigger
    const sections = document.querySelectorAll(".zooming_ani_trigger");
    if (!sections.length) return;

    // Loop through each section and apply animations
    sections.forEach((section) => {
      const zoomingAniItems = section.querySelectorAll(".zooming_ani_item");
      if (!zoomingAniItems.length) return;

      const tl = createZoomingAnimation(zoomingAniItems);
      createScrollTrigger(section, tl);
    });
  })();



  (function initClipLeftAniGsap() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    // Function to create the animation timeline
    const createClipLeftAnimation = (clipLeftAniItems) => {
      const tl = gsap.timeline({ paused: true });

      tl.fromTo(
        clipLeftAniItems,
        {
          //opacity: 0,
          // x: 0,
          clipPath: "inset(0% 100% 0% 0%)",
        },
        {
          //opacity: 1,
          // x: 0,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.3,
          ease: "power3.out",
          stagger: { each: 0.1, from: "start" },
        }
      );

      return tl;
    };

    // Function to create a ScrollTrigger instance
    const createScrollTrigger = (section, tl) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 90%",
        end: "bottom top",

        onEnter: (self) => handleScrollEnter(self, tl),
        onEnterBack: (self) => handleScrollEnterBack(self, tl),
        onLeave: () => tl.pause(0),
        onLeaveBack: () => tl.timeScale(1).reverse(),
      });
    };

    // Handle animation on scroll enter (downward direction)
    const handleScrollEnter = (self, tl) => {
      if (self.direction === 1) {
        tl.restart();
      } else {
        tl.progress(1).pause();
      }
    };

    // Handle animation on scroll enter from the bottom (upward direction)
    const handleScrollEnterBack = (self, tl) => {
      if (self.direction === 1) {
        tl.restart();
      } else {
        tl.progress(1).pause();
      }
    };

    // Select all sections with the clip-left animation trigger
    const sections = document.querySelectorAll(".clipleft_ani_trigger");
    if (!sections.length) return;

    // Loop through each section and apply animations
    sections.forEach((section) => {
      const clipLeftAniItems = section.querySelectorAll(".clipleft_ani_item");
      if (!clipLeftAniItems.length) return;

      const tl = createClipLeftAnimation(clipLeftAniItems);
      createScrollTrigger(section, tl);
    });
  })();


  // ============== ////////// random show each char //////// =====================

  if (document.querySelectorAll('.random_show_each_char').length) {

    document.querySelectorAll('.random_show_each_char').forEach(function (element) {

      const split = new SplitText(element, { type: "chars" });
      const chars = split.chars;
      chars.forEach(char => char.classList.add('split_char'));


      gsap.from(element.querySelectorAll('.split_char'), {
        opacity: 0.1,
        repeat: -1,
        yoyo: true,
        duration: 0.6,
        ease: "power1.out",
        // stagger: 0.4
        stagger: { amount: 0.4, from: "random" }
      });
    });
  }

}




// ============== ////////// end common-gsap animation //////// =====================


// ========= for all vVideo =============

// (function () {
//   function resizeBgVideo() {
//     const iframe = document.getElementById("vVideo");
//     if (!iframe) return;

//     // Initialize the Vimeo Player
//     //   const player = new Vimeo.Player(iframe);
//     //   player.on('loaded', function() {
//     //     console.log('Vimeo video is loaded and ready to play.');
//     //   });

//     const container = iframe.parentElement;
//     const containerW = container.offsetWidth;
//     const containerH = container.offsetHeight;
//     const videoRatio = 16 / 8;
//     let newW, newH;

//     if (containerW / containerH < videoRatio) {
//       newH = containerH;
//       newW = newH * videoRatio;
//     } else {
//       newW = containerW;
//       newH = newW / videoRatio;
//     }

//     iframe.style.width = newW + "px";
//     iframe.style.height = newH + "px";

//     // Center the video within the container
//     iframe.style.position = "absolute";
//     iframe.style.top = "50%";
//     iframe.style.left = "50%";
//     iframe.style.transform = "translate(-50%, -50%)";
//   }

//   window.addEventListener("load", resizeBgVideo);
//   window.addEventListener("resize", resizeBgVideo);
//   window.addEventListener("orientationchange", resizeBgVideo);
// })();



// ========= end for all vVideo =============


(function () {
  function resizeBgVideo() {
    const iframe = document.getElementById("vVideo2");
    if (!iframe) return;

    // Initialize the Vimeo Player
    //   const player = new Vimeo.Player(iframe);
    //   player.on('loaded', function() {
    //     console.log('Vimeo video is loaded and ready to play.');
    //   });

    const container = iframe.parentElement;
    const containerW = container.offsetWidth;
    const containerH = container.offsetHeight;
    const videoRatio = 16 / 9;
    let newW, newH;

    if (containerW / containerH < videoRatio) {
      newH = containerH;
      newW = newH * videoRatio;
    } else {
      newW = containerW;
      newH = newW / videoRatio;
    }

    iframe.style.width = newW + "px";
    iframe.style.height = newH + "px";

    // Center the video within the container
    iframe.style.position = "absolute";
    iframe.style.top = "50%";
    iframe.style.left = "50%";
    iframe.style.transform = "translate(-50%, -50%)";
  }

  window.addEventListener("load", resizeBgVideo);
  window.addEventListener("resize", resizeBgVideo);
  window.addEventListener("orientationchange", resizeBgVideo);
})();

(function () {
  function resizeBgVideo() {
    const iframe = document.getElementById("vVideo3");
    if (!iframe) return;

    // Initialize the Vimeo Player
    //   const player = new Vimeo.Player(iframe);
    //   player.on('loaded', function() {
    //     console.log('Vimeo video is loaded and ready to play.');
    //   });

    const container = iframe.parentElement;
    const containerW = container.offsetWidth;
    const containerH = container.offsetHeight;
    const videoRatio = 16 / 9;
    let newW, newH;

    if (containerW / containerH < videoRatio) {
      newH = containerH;
      newW = newH * videoRatio;
    } else {
      newW = containerW;
      newH = newW / videoRatio;
    }

    iframe.style.width = newW + "px";
    iframe.style.height = newH + "px";

    // Center the video within the container
    iframe.style.position = "absolute";
    iframe.style.top = "50%";
    iframe.style.left = "50%";
    iframe.style.transform = "translate(-50%, -50%) rotateX(180deg)";
  }

  window.addEventListener("load", resizeBgVideo);
  window.addEventListener("resize", resizeBgVideo);
  window.addEventListener("orientationchange", resizeBgVideo);
})();




/**
 * Platform features: desktop = left nav + stacked visuals + ScrollTrigger pin/scrub.
 * Mobile/tablet (<1200px): same nav buttons + panels moved into a Bootstrap accordion built inside .home_platform_features_visual (no duplicate feature copy in HTML).
 */
function initHomePlatformFeatures() {
  const section = document.querySelector(".home_platform_features");
  if (!section || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (!window.matchMedia("(min-width: 1200px)").matches) return;

  const pinInner = section.querySelector(".home_platform_features_pin_inner");
  const navEl = section.querySelector(".home_platform_features_nav");
  const visualEl = section.querySelector(".home_platform_features_visual");
  const visualInner = section.querySelector(".home_platform_features_visual_inner");

  if (!pinInner || !navEl || !visualEl || !visualInner) return;

  const pairs = [];
  for (let i = 0; i < 32; i++) {
    const btn = document.getElementById(`platform-tab-${i}`);
    const panel = document.getElementById(`platform-panel-${i}`);
    if (!btn || !panel) break;
    pairs.push({ btn, panel });
  }

  const stepCount = pairs.length;
  if (!stepCount) return;

  const ACCORDION_ID = "platformFeaturesAccordion";
  let platformST = null;
  let accordionRoot = null;
  let activeIndex = -1;
  let navMode = "desktop"; // "desktop" | "mobile"

  function getPairsSubset() {
    return pairs;
  }

  function stripAccordionClasses(btn) {
    btn.classList.remove("accordion-button", "collapsed");
    btn.removeAttribute("data-bs-toggle");
    btn.removeAttribute("data-bs-target");
    btn.removeAttribute("aria-expanded");
    btn.removeAttribute("aria-controls");
  }

  function mountDesktopUi() {
    navMode = "desktop";
    if (platformST) {
      platformST.kill();
      platformST = null;
    }
    if (accordionRoot) {
      accordionRoot.remove();
      accordionRoot = null;
    }

    visualInner.classList.remove("d-none");

    pairs.forEach(({ btn, panel }, i) => {
      stripAccordionClasses(btn);
      btn.classList.remove("is-active");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.setAttribute("aria-controls", panel.id || `platform-panel-${i}`);
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", btn.id || `platform-tab-${i}`);
      navEl.appendChild(btn);
      visualInner.appendChild(panel);
    });

    navEl.setAttribute("role", "tablist");
  }

  function mountMobileAccordionUi() {
    navMode = "mobile";
    if (platformST) {
      platformST.kill();
      platformST = null;
    }
    if (accordionRoot) {
      accordionRoot.remove();
      accordionRoot = null;
    }

    visualInner.classList.add("d-none");
    visualInner.replaceChildren();

    const acc = document.createElement("div");
    acc.className = "accordion home_platform_features_visual_accordion";
    acc.id = ACCORDION_ID;

    pairs.forEach(({ btn, panel }, i) => {
      stripAccordionClasses(btn);
      btn.classList.remove("is-active");
      btn.removeAttribute("role");
      btn.removeAttribute("aria-selected");
      btn.classList.add("accordion-button");
      if (i > 0) btn.classList.add("collapsed");
      else btn.classList.remove("collapsed");

      btn.setAttribute("type", "button");
      btn.setAttribute("data-bs-toggle", "collapse");
      btn.setAttribute("data-bs-target", `#pf-collapse-${i}`);
      btn.setAttribute("aria-expanded", i === 0 ? "true" : "false");
      btn.setAttribute("aria-controls", `pf-collapse-${i}`);

      const item = document.createElement("div");
      item.className = "accordion-item";

      const h2 = document.createElement("h2");
      h2.className = "accordion-header";
      h2.id = `pf-heading-${i}`;
      h2.appendChild(btn);

      const collapse = document.createElement("div");
      collapse.id = `pf-collapse-${i}`;
      collapse.className = "accordion-collapse collapse" + (i === 0 ? " show" : "");
      collapse.setAttribute("data-bs-parent", `#${ACCORDION_ID}`);

      const bodyEl = document.createElement("div");
      bodyEl.className = "accordion-body home_platform_features_accordion_body";
      panel.classList.remove("is-active");
      panel.removeAttribute("role");
      panel.hidden = false;
      bodyEl.appendChild(panel);

      collapse.appendChild(bodyEl);
      item.appendChild(h2);
      item.appendChild(collapse);
      acc.appendChild(item);
    });

    visualEl.appendChild(acc);
    accordionRoot = acc;

    if (typeof bootstrap !== "undefined" && bootstrap.Collapse) {
      pairs.forEach((_, i) => {
        const el = document.getElementById(`pf-collapse-${i}`);
        if (el) bootstrap.Collapse.getOrCreateInstance(el, { toggle: false });
      });
    }

    // Ensure only the expanded accordion header shows its description copy.
    // (Accordion CSS can otherwise force all descriptions visible.)
    requestAnimationFrame(syncNavDescVisibility);
  }

  function syncNavDescVisibility() {
    const list = getPairsSubset();
    list.forEach(({ btn }, i) => {
      const desc = btn.querySelector(".home_platform_features_nav_desc");
      if (!desc) return;

      if (navMode === "mobile") {
        // Bootstrap uses aria-expanded on the header button.
        const expanded = btn.getAttribute("aria-expanded") === "true" && !btn.classList.contains("collapsed");
        desc.hidden = !expanded;
      } else {
        const active = i === activeIndex && btn.classList.contains("is-active");
        desc.hidden = !active;
      }
    });
  }

  function setActive(idx, force) {
    const list = getPairsSubset();
    const i = Math.max(0, Math.min(stepCount - 1, idx));
    if (!force && i === activeIndex) return;
    activeIndex = i;

    list.forEach(({ btn, panel }, j) => {
      const on = j === i;
      btn.classList.toggle("is-active", on);
      if (btn.getAttribute("role") === "tab") {
        btn.setAttribute("aria-selected", on ? "true" : "false");
      }
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });

    syncNavDescVisibility();
  }

  function scrollDocToY(y, smooth) {
    const smoother = typeof ScrollSmoother !== "undefined" ? ScrollSmoother.get() : null;
    if (smoother && typeof smoother.scrollTo === "function") {
      smoother.scrollTo(y, smooth);
    } else {
      window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
    }
  }

  setActive(0, true);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (window.matchMedia("(min-width: 1200px)").matches) {
      mountDesktopUi();
      setActive(activeIndex < 0 ? 0 : activeIndex, true);
      pairs.forEach(({ btn }, idx) => {
        btn.addEventListener("click", () => setActive(idx, true));
      });
    } else {
      mountMobileAccordionUi();
    }
    return;
  }

  const mm = gsap.matchMedia();

  mm.add("(min-width: 1200px)", () => {
    mountDesktopUi();
    setActive(activeIndex < 0 ? 0 : activeIndex, true);

    const stepPixels = () => Math.round(Math.max(window.innerHeight * 0.52, 520));

    platformST = ScrollTrigger.create({
      trigger: pinInner,
      // start: () => {
      //   const hdrEl = document.querySelector(".wraper-header");
      //   const h = hdrEl ? hdrEl.offsetHeight : 0;
      //   return `top ${h}px`;
      // },
      start: "top 110px",
      end: () => "+=" + stepPixels() * stepCount,
      pin: pinInner,
      //pinSpacing: true,
      anticipatePin: 1,
      scrub: true,
      invalidateOnRefresh: true,
      //markers: true,
      onUpdate: (self) => {
        const idx = Math.min(stepCount - 1, Math.floor(self.progress * stepCount));
        setActive(idx);
      },
      onLeave: () => setActive(stepCount - 1),
      onLeaveBack: () => setActive(0, true),
    });

    function goToStep(idx) {
      if (!platformST) return;
      const maxIdx = Math.max(1, stepCount - 1);
      const prog = Math.min(1, Math.max(0, idx / maxIdx));
      const y = platformST.start + prog * (platformST.end - platformST.start);
      scrollDocToY(y, true);
    }

    const listeners = pairs.map(({ btn }, idx) => {
      const handler = () => goToStep(idx);
      btn.addEventListener("click", handler);
      return { btn, handler };
    });

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      listeners.forEach(({ btn, handler }) => btn.removeEventListener("click", handler));
      if (platformST) {
        platformST.kill();
        platformST = null;
      }
    };
  });

  mm.add("(max-width: 1199px)", () => {
    mountMobileAccordionUi();

    return () => {
      if (accordionRoot) {
        accordionRoot.remove();
        accordionRoot = null;
      }
      visualInner.classList.remove("d-none");
    };
  });
}

function initHomeAudienceCards() {
  const row = document.querySelector("[data-home-audience-cards]");
  if (!row || row.children.length < 2) return;

  const cards = Array.from(row.querySelectorAll("[data-home-audience-card]"));
  const mq = window.matchMedia("(min-width: 992px)");

  let lastExpandedIndex = cards.findIndex((c) => c.classList.contains("is-expanded"));
  if (lastExpandedIndex < 0) lastExpandedIndex = 0;

  function setExpanded(index) {
    const next = Math.max(0, Math.min(cards.length - 1, index));
    lastExpandedIndex = next;
    cards.forEach((card, i) => {
      const on = i === next;
      card.classList.toggle("is-expanded", on);
      card.classList.toggle("is-ghosted", !on);
      card.setAttribute("aria-expanded", on ? "true" : "false");
    });
  }

  function expandCard(card) {
    const raw = card.getAttribute("data-home-audience-card");
    const idx = raw == null ? NaN : Number(raw);
    if (!Number.isNaN(idx)) setExpanded(idx);
  }

  function onCardClick(e) {
    if (!mq.matches) return;
    const card = e.target.closest("[data-home-audience-card]");
    if (!card || !row.contains(card)) return;
    if (!card.classList.contains("is-expanded")) expandCard(card);
  }

  cards.forEach((card) => {
    card.addEventListener("focusin", () => {
      if (mq.matches) expandCard(card);
    });
    card.addEventListener("keydown", (event) => {
      if (!mq.matches) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        expandCard(card);
      }
    });
  });

  row.addEventListener("click", onCardClick);

  row.querySelectorAll(".home_audience_arrow_btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (!mq.matches) return;
      e.stopPropagation();
      const card = btn.closest("[data-home-audience-card]");
      if (card) expandCard(card);
    });
  });

  mq.addEventListener("change", () => {
    if (mq.matches) setExpanded(lastExpandedIndex);
  });

  setExpanded(lastExpandedIndex);
}

function initHomeAiEngineAlertsMock() {
  const root = document.querySelector(".home_ai_engine_alerts_mock");
  if (!root || typeof gsap === "undefined") return;

  const svg = root.querySelector("svg");
  const bg = root.querySelector(".alerts-bg");
  const card = root.querySelector(".alerts-card");
  const label = root.querySelector(".alerts-label");
  const rows = root.querySelectorAll(".alerts-row");
  const bellBadge = root.querySelector(".alerts-bell-badge");
  const bellIcon = root.querySelector(".alerts-bell-icon");
  const bellTarget = bellIcon;

  if (!svg || !bg || !card || !rows.length || !bellBadge || !bellTarget) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set([bg, card, label, rows, bellBadge, bellIcon], { clearProps: "all" });
    return;
  }

  const setInitialState = () => {
    gsap.set(bg, { opacity: 1 });
    gsap.set(card, { opacity: 0, y: 8 });
    gsap.set(label, { opacity: 0, y: 2 });
    gsap.set(rows, { opacity: 0, scaleX: 0.04, transformOrigin: "left center", transformBox: "fill-box" });
    gsap.set(bellBadge, {
      opacity: 0,
      scale: 0.62,
      x: -22,
      y: 16,
      transformOrigin: "50% 50%",
      transformBox: "fill-box",
    });
    // Anchor slightly to the left-top so the bell swings naturally from one side.
    gsap.set(bellTarget, {
      // Keep pivot centered to avoid top-bottom pendulum motion.
      transformOrigin: "50% 50%",
      transformBox: "fill-box",
      rotation: 0,
      x: 0,
    });
  };

  setInitialState();

  const tl = gsap.timeline({
    repeat: -1,
    repeatDelay: 0.65,
    defaults: { ease: "power2.out" },
    paused: true,
  });

  tl.add(setInitialState)
    // Step 1: card container appears
    .to(card, { opacity: 1, y: 0, duration: 0.32 })
    // Step 2: "answers" label appears
    .to(label, { opacity: 1, y: 0, duration: 0.2 }, "+=0.02")
    // Step 3/4/5: rows reveal one-by-one
    .to(rows[0], { opacity: 1, scaleX: 1, duration: 0.24 }, "+=0.03")
    .to(rows[1], { opacity: 1, scaleX: 1, duration: 0.24 }, "+=0.08")
    .to(rows[2], { opacity: 1, scaleX: 1, duration: 0.24 }, "+=0.08")
    // Step 6: bell pops in
    .to(
      bellBadge,
      { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.32, ease: "back.out(2)" },
      "+=0.1"
    )
    // Step 7: pure horizontal left-right wiggle (no vertical swing)
    .set(bellTarget, { x: -2.8, rotation: 0 }, "+=0.02")
    .to(bellTarget, {
      x: 2.8,
      duration: 0.13,
      ease: "sine.inOut",
      repeat: 5,
      yoyo: true,
    })
    .to(bellTarget, { x: 0, rotation: 0, duration: 0.14, ease: "sine.out" })
    // Final state: fade back to blank card before next loop
    .to(
      [card, label, rows, bellBadge],
      { opacity: 0, y: 4, duration: 0.24, ease: "power2.inOut", stagger: 0.02 },
      "+=0.32"
    )
    .set([card, label, rows, bellBadge], { clearProps: "y" })
    .add(setInitialState, "+=0.02");

  const isDesktopPlatformFeatures = window.matchMedia("(min-width: 1200px)").matches;
  if (typeof ScrollTrigger === "undefined" || !isDesktopPlatformFeatures) {
    tl.play(0);
    return;
  }

  ScrollTrigger.create({
    trigger: root,
    start: "top 85%",
    once: false,
    onEnter: () => tl.play(0),
    onEnterBack: () => tl.play(0),
    onLeave: () => tl.pause(0),
    onLeaveBack: () => tl.pause(0),
  });

  // Play immediately if already in viewport (helps when refresh lands mid-page).
  const rect = root.getBoundingClientRect();
  const inView = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
  if (inView) tl.play(0);
}

// -------------- Replace <img> with fetched inline <svg> -----------------
document.querySelectorAll("img.svg_icon").forEach((img) => {
  const src = img.getAttribute("src");

  fetch(src)
    .then((res) => res.text())
    .then((svgText) => {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
      const svg = svgDoc.querySelector("svg");

      if (svg) {
        // Copy attributes/classes from <img> to <svg>
        if (img.id) svg.id = img.id;
        if (img.className) svg.classList.add(...img.classList);
        svg.setAttribute("role", "img");

        // Replace <img> with <svg>
        img.replaceWith(svg);

        // const expandedServiceItem = svg.closest(".aeon_service_item.is-expanded");
        // if (expandedServiceItem && typeof drawWhatWeDoDecor === "function") {
        //   requestAnimationFrame(() => drawWhatWeDoDecor(expandedServiceItem));
        // }
      }
    })
    .catch((err) => console.error("Error loading SVG:", err));
});
// -------------- Replace <img> with fetched inline <svg> -----------------


// ----- mobile menu js -----
const mobile_megaMenuItems = document.querySelectorAll(
  ".wraper-mobile-header"
);

if (mobile_megaMenuItems.length > 0) {
  mobile_megaMenuItems.forEach((menuItem) => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === "class" &&
          menuItem.classList.contains("open-mMenu")
        ) {
          const menuLists = menuItem.querySelectorAll(
            ".first_label_menuitem_forani"
          );

          if (menuLists.length > 0) {
            menuLists.forEach((item, index) => {
              //const colListItems = item.querySelectorAll(".col_item_forani");

              // item.forEach((li, index) => {
              // Reset previous animation state
              item.style.animation = "none";
              item.style.opacity = "0";
              item.style.transform = "translateX(10px)";

              // Use rAF to batch DOM updates and force reflow
              requestAnimationFrame(() => {
                item.style.animation = `itemFadeInLeft 0.5s ease-out forwards`;
                item.style.animationDelay = `${0.1 * (index + 1)}s`;
              });
              // });
            });
          }
          if (document.querySelectorAll(".nav_menu_bg-col").length > 0) {
            navMenuTl.timeScale(1).restart();
          }
        } else {
          if (document.querySelectorAll(".nav_menu_bg-col").length > 0) {
            navMenuTl.timeScale(1).reverse();
          }
        }
      });
    });

    observer.observe(menuItem, { attributes: true });
  });
}

// Insert span after the specified element
const menuItems = document.querySelectorAll(
  ".mobile-header-menu .menu li.menu-item-has-children > a"
);
menuItems.forEach(function (item) {
  // Avoid duplicating the opener if HTML already contains it
  const next = item.nextElementSibling;
  if (next && next.classList && next.classList.contains("clickD")) return;

  const span = document.createElement("span");
  span.classList.add("clickD");
  item.insertAdjacentElement("afterend", span);
});

// Mobile submenu toggling:
// - Click on the arrow span (.clickD) OR the parent link opens/closes the submenu
// - Clicking outside the menu closes all submenus
const mobileHeaderMenu = document.querySelector(".mobile-header-menu");

function closeAllMobileSubmenus(rootEl) {
  if (!rootEl) return;
  rootEl.querySelectorAll(".sub-menu.show").forEach(function (subMenu) {
    subMenu.classList.remove("show");
  });
  rootEl.querySelectorAll(".clickD.toggled").forEach(function (opener) {
    opener.classList.remove("toggled");
  });
}

function closeOtherMobileSubmenus(rootEl, keepLi) {
  if (!rootEl) return;

  // Keep ancestor branch open (do not close parent submenus)
  const keepChain = new Set();
  let cur = keepLi;
  while (cur && cur !== rootEl && cur.nodeType === 1) {
    if (cur.matches && cur.matches("li")) keepChain.add(cur);
    cur = cur.parentElement;
  }

  rootEl.querySelectorAll(".sub-menu.show").forEach(function (subMenu) {
    const ownerLi = subMenu.closest("li");
    // If this submenu belongs to an ancestor li (or the current li), keep it open
    if (ownerLi && keepChain.has(ownerLi)) return;
    // Also keep any submenu that contains the clicked li (ancestor submenu wrapper)
    if (keepLi && subMenu.contains(keepLi)) return;
    subMenu.classList.remove("show");
  });

  rootEl.querySelectorAll(".clickD.toggled").forEach(function (opener) {
    const ownerLi = opener.closest("li");
    if (ownerLi && keepChain.has(ownerLi)) return;
    if (keepLi) {
      const relatedSubMenu =
        opener.previousElementSibling &&
          opener.previousElementSibling.matches &&
          opener.previousElementSibling.matches("a")
          ? opener.nextElementSibling
          : opener.nextElementSibling;
      if (relatedSubMenu && relatedSubMenu.classList && relatedSubMenu.classList.contains("sub-menu") && relatedSubMenu.contains(keepLi)) {
        return;
      }
    }
    opener.classList.remove("toggled");
  });
}

function toggleMobileSubmenu(liEl) {
  if (!liEl || !mobileHeaderMenu) return;
  const opener = liEl.querySelector(":scope > .clickD");
  const subMenu = liEl.querySelector(":scope > .sub-menu");
  if (!opener || !subMenu) return;

  const isOpen = subMenu.classList.contains("show");
  // Close other branches, but keep parent submenus open
  closeOtherMobileSubmenus(mobileHeaderMenu, liEl);
  if (!isOpen) {
    subMenu.classList.add("show");
    opener.classList.add("toggled");
  } else {
    // Only close this submenu level (leave parent open)
    subMenu.classList.remove("show");
    opener.classList.remove("toggled");
  }
}

if (mobileHeaderMenu) {
  // Event delegation so it works for all submenu levels
  mobileHeaderMenu.addEventListener("click", function (e) {
    const opener = e.target.closest(".clickD");
    if (opener && mobileHeaderMenu.contains(opener)) {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileSubmenu(opener.closest("li"));
      return;
    }

    const link = e.target.closest("li.menu-item-has-children > a");
    if (link && mobileHeaderMenu.contains(link)) {
      const li = link.closest("li");
      const subMenu = li ? li.querySelector(":scope > .sub-menu") : null;
      if (subMenu) {
        // Open submenu on first click (instead of navigating)
        e.preventDefault();
        e.stopPropagation();
        toggleMobileSubmenu(li);
      }
    }
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".mobile-header-menu")) {
      closeAllMobileSubmenus(mobileHeaderMenu);
    }
  });
}

// Toggle mobile menu
document
  .querySelectorAll(".toggle-mobile-menu")
  .forEach(function (toggleButton) {
    toggleButton.addEventListener("click", function () {
      const wrapper = document.querySelector(".wraper-mobile-header");
      const backdrop = document.querySelector(".mobile-header-backdrop");

      // Toggle menu visibility
      const isOpen = wrapper.classList.contains("open-mMenu");

      if (isOpen) {
        wrapper.classList.remove("open-mMenu");
        document.body.classList.remove("lockScroll");
        if (backdrop) backdrop.remove();
      } else {
        wrapper.classList.add("open-mMenu");
        document.body.classList.add("lockScroll");

        // Create and append backdrop if it doesn't exist
        if (!backdrop) {
          const newBackdrop = document.createElement("div");
          newBackdrop.classList.add("mobile-header-backdrop");
          document.body.appendChild(newBackdrop);

          // Add event listener for the backdrop to close the menu
          newBackdrop.addEventListener("click", function () {
            wrapper.classList.remove("open-mMenu");
            document.body.classList.remove("lockScroll");
            newBackdrop.remove();
          });
        }
      }
    });
  });

// Close mobile menu when clicking a section-scroll button inside the mobile header menu
(function () {
  function closeMobileMenuIfOpen() {
    const wrapper = document.querySelector(".wraper-mobile-header");
    if (!wrapper || !wrapper.classList.contains("open-mMenu")) return;
    wrapper.classList.remove("open-mMenu");
    document.body.classList.remove("lockScroll");
    const backdrop = document.querySelector(".mobile-header-backdrop");
    if (backdrop) backdrop.remove();
  }

  document.addEventListener("click", function (e) {
    const target = e.target;
    if (!(target instanceof Element)) return;

    // Only when the click is within the mobile header menu
    const inMobileMenu = target.closest(".wraper-mobile-header .mobile-header-menu");
    if (!inMobileMenu) return;

    // If a .goto_sec_btn is clicked inside the mobile menu, close the menu
    const gotoBtn = target.closest(".goto_sec_btn");
    if (!gotoBtn) return;

    closeMobileMenuIfOpen();
  });
})();

// -------------------- header js ---------------------









// ========= start fncStickyWidget  //// ===========


function fncStickyWidget(stickyWidget_el, contentSection_el, wSize, topOffset = 5, scrollerEndOffset = 50) {
  const stickyShareWidget = document.getElementById(stickyWidget_el);
  const contentSections = document.querySelectorAll(contentSection_el); // Use querySelectorAll for multiple sections
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  let shareWidgetTriggers = []; // Store multiple triggers

  function setupStickyShareWidget() {
    // Kill all existing triggers to avoid conflicts
    shareWidgetTriggers.forEach((trigger) => trigger.kill());
    shareWidgetTriggers = [];

    if (stickyShareWidget && contentSections.length > 0) {
      const parentDiv = stickyShareWidget.parentElement;
      if (!isMobileDevice()) {
        parentDiv.style.position = "relative";
        const stickyShareWidgetHeight = stickyShareWidget.clientHeight;

        contentSections.forEach((contentSection) => {
          const trigger = ScrollTrigger.create({
            trigger: contentSection,
            start: `top ${headerHeight + topOffset}px`,
            end: `bottom ${stickyShareWidgetHeight + headerHeight + scrollerEndOffset}px`,
            pin: stickyShareWidget,
            pinSpacing: true, // Avoid sudden layout jumps
            anticipatePin: 3,
            invalidateOnRefresh: true,
            scrub: 1,
            //markers:true,
          });

          // Store each trigger in the array
          shareWidgetTriggers.push(trigger);
        });
      } else if (isMobileDevice() && window.innerWidth >= wSize) {
        parentDiv.style.position = "sticky";
        parentDiv.style.top = "110px";
      } else {
        parentDiv.style.position = "relative";
        parentDiv.style.top = "auto";
      }
    }
    ScrollTrigger.refresh();
  }

  setTimeout(function () {
    setupStickyShareWidget();
    window.addEventListener("resize", setupStickyShareWidget);
  }, 2000);
}



// ========= end fncStickyWidget  //// ===========



// function initCareersListingChoices() {
//   const deptEl = document.getElementById("careersFilterDepartment");
//   const locEl = document.getElementById("careersFilterLocation");
//   if (!deptEl || !locEl || typeof Choices === "undefined") return;

//   const choicesConfig = {
//     searchEnabled: false,
//     allowHTML: false,
//     itemSelectText: "",
//     shouldSort: false,
//     position: "bottom",
//   };

//   new Choices(deptEl, choicesConfig);
//   new Choices(locEl, choicesConfig);
// }

// initCareersListingChoices();





const floatingSelects = document.querySelectorAll(".floating_select_input");
if (floatingSelects.length) {
  floatingSelects.forEach(floatingSelect => {
    const choices = new Choices(floatingSelect, {
      searchEnabled: false,
      itemSelectText: "",
      shouldSort: false,
      placeholder: true,
      placeholderValue: "",
      closeDropdownOnSelect: false, // keep it open temporarily
    });

    let isOptionSelected = false; // Track if an option was selected

    // Event listener when an option is selected
    choices.passedElement.element.addEventListener("choice", () => {
      isOptionSelected = true; // Mark that a valid option was selected
      setTimeout(() => {
        if (isOptionSelected) {
          choices.hideDropdown(); // Close the dropdown after a delay
        }
      }, 700); // Adjust the delay as needed
    });
  });

  // Function to add class when any option is selected
  function addClassOnSelect(event) {
    const selectElement = event.target;
    if (selectElement.selectedOptions.length > 0) {
      selectElement.closest('.choices').classList.add('option_selected');
      selectElement.closest('.wpcf7-form-control-wrap').classList.add('option_selected');

    } else {
      selectElement.closest('.choices').classList.remove('option_selected');
      selectElement.closest('.wpcf7-form-control-wrap').classList.remove('option_selected');
    }
  }

  // Function to add class when any option is selected
  // function addClassOnSelect(event) {
  //     const selectElement = event.target;

  //     const choicesWrapper = selectElement.closest('.choices');
  //     const formControlWrap = selectElement.closest('.wpcf7-form-control-wrap');

  //     const hasSelection = selectElement.selectedOptions.length > 0;

  //     if (choicesWrapper) {
  //         choicesWrapper.classList.toggle('option_selected', hasSelection);
  //     }

  //     if (formControlWrap) {
  //         formControlWrap.classList.toggle('option_selected', hasSelection);
  //     }
  // }


  // Add event listeners for each select element with the class "floating_select_input"
  floatingSelects.forEach((selectElement) => {
    selectElement.addEventListener('change', addClassOnSelect);
  });
}



// ------------ new 


const StaticSelects = document.querySelectorAll(".static_select_input");
if (StaticSelects.length) {
  StaticSelects.forEach(StaticSelect => {
    if (StaticSelect.closest(".choices") || StaticSelect.dataset.choice === "active") return;
    const choices = new Choices(StaticSelect, {
      searchEnabled: false,
      itemSelectText: "",
      shouldSort: false,
    });
  });

  // Function to add class when any option is selected
  function addClassOnSelect(event) {
    const selectElement = event.target;
    if (selectElement.selectedOptions.length > 0) {
      selectElement.closest('.choices').classList.add('option_selected');
      selectElement.closest('.wpcf7-form-control-wrap').classList.add('option_selected');

    } else {
      selectElement.closest('.choices').classList.remove('option_selected');
      selectElement.closest('.wpcf7-form-control-wrap').classList.remove('option_selected');
    }
  }



  // Add event listeners for each select element with the class "floating_select_input"
  StaticSelects.forEach((selectElement) => {
    selectElement.addEventListener('change', addClassOnSelect);
  });
}

function initWhoWeAreExpertiseTabs() {
  const components = document.querySelectorAll(".expertise_tabs_component");
  if (!components.length) return;

  components.forEach((component) => {
    const navLinks = Array.from(component.querySelectorAll(".expertise_tabs_nav .nav-link[data-expertise-index]"));
    const panes = Array.from(component.querySelectorAll(".expertise_tabs_content [id^='expertiseAccordion_']"));
    const accordionRoot = component.querySelector(".expertise_tabs_content");
    if (!navLinks.length || !panes.length || !accordionRoot) return;

    let activeIndex = "1";
    const wrapperByIndex = new Map();
    let heightResetTimer = null;
    let isDesktopMode = false;
    let isTabAnimating = false;

    const setActiveLinks = (index) => {
      activeIndex = index;
      navLinks.forEach((link) => {
        const isActive = link.dataset.expertiseIndex === index;
        link.classList.toggle("active", isActive);
        link.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    };

    const setActiveAccordionButtons = (index) => {
      const accordionButtons = Array.from(component.querySelectorAll(".accordion-button[data-expertise-index]"));
      accordionButtons.forEach((btn) => {
        const isActive = btn.dataset.expertiseIndex === index;
        btn.classList.toggle("collapsed", !isActive);
        btn.setAttribute("aria-expanded", isActive ? "true" : "false");
      });
    };

    const syncDesktopContentHeight = () => {
      if (window.matchMedia("(max-width: 991px)").matches) return;
      const activePane = panes.find((pane) => pane.classList.contains("active") && pane.classList.contains("show"));
      if (!activePane) return;
      accordionRoot.style.minHeight = `${activePane.scrollHeight}px`;
      if (heightResetTimer) clearTimeout(heightResetTimer);
      heightResetTimer = setTimeout(() => {
        accordionRoot.style.minHeight = "";
      }, 500);
    };

    const createMobileWrappers = () => {
      panes.forEach((pane) => {
        const index = pane.dataset.expertiseIndex || pane.id.replace("expertiseAccordion_", "");
        if (!index) return;

        const wrapper = document.createElement("article");
        wrapper.className = "accordion-item expertise_tab_item";
        wrapper.dataset.expertiseIndex = index;

        const header = document.createElement("h2");
        header.className = "accordion-header";
        header.id = `expertiseHeader_${index}`;

        const button = document.createElement("button");
        button.className = "accordion-button collapsed";
        button.type = "button";
        button.dataset.expertiseIndex = index;
        button.dataset.bsToggle = "collapse";
        button.dataset.bsTarget = `#${pane.id}`;
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", pane.id);
        button.innerHTML = `<span>${pane.dataset.expertiseTitle || ""}</span>`;

        header.appendChild(button);
        wrapper.appendChild(header);
        wrapper.appendChild(pane);
        accordionRoot.appendChild(wrapper);
        wrapperByIndex.set(index, wrapper);
      });
    };

    const removeMobileWrappers = () => {
      panes.forEach((pane) => {
        accordionRoot.appendChild(pane);
      });
      wrapperByIndex.forEach((wrapper) => wrapper.remove());
      wrapperByIndex.clear();
    };

    const applyMobileAccordion = () => {
      isDesktopMode = false;
      component.classList.add("is-mobile-accordion");
      accordionRoot.style.minHeight = "";
      if (!wrapperByIndex.size) createMobileWrappers();

      panes.forEach((pane) => {
        const index = pane.dataset.expertiseIndex || pane.id.replace("expertiseAccordion_", "");
        const isActive = index === activeIndex;
        pane.classList.remove("tab-pane", "fade", "active");
        pane.classList.add("collapse", "expertise_accordion_pane");
        pane.setAttribute("data-bs-parent", "#expertiseTabsContent");
        pane.classList.toggle("show", isActive);
      });

      navLinks.forEach((link) => {
        link.setAttribute("data-bs-toggle", "tab");
      });

      setActiveLinks(activeIndex);
      setActiveAccordionButtons(activeIndex);
    };

    const applyDesktopTabs = () => {
      isDesktopMode = true;
      component.classList.remove("is-mobile-accordion");
      if (wrapperByIndex.size) removeMobileWrappers();

      panes.forEach((pane) => {
        const index = pane.dataset.expertiseIndex || pane.id.replace("expertiseAccordion_", "");
        const isActive = index === activeIndex;
        pane.classList.remove("collapse", "expertise_accordion_pane");
        pane.removeAttribute("data-bs-parent");
        pane.classList.add("tab-pane", "fade");
        pane.classList.remove("is-leaving");
        pane.classList.toggle("show", isActive);
        pane.classList.toggle("active", isActive);
      });

      navLinks.forEach((link) => {
        link.removeAttribute("data-bs-toggle");
      });

      setActiveLinks(activeIndex);
      syncDesktopContentHeight();
    };

    const switchDesktopTab = (index) => {
      if (!isDesktopMode || isTabAnimating || index === activeIndex) return;
      const currentPane = panes.find((pane) => (pane.dataset.expertiseIndex || pane.id.replace("expertiseAccordion_", "")) === activeIndex);
      const nextPane = panes.find((pane) => (pane.dataset.expertiseIndex || pane.id.replace("expertiseAccordion_", "")) === index);
      if (!nextPane) return;

      isTabAnimating = true;
      setActiveLinks(index);

      if (currentPane) currentPane.classList.add("is-leaving");
      nextPane.classList.add("show", "active");
      void nextPane.offsetWidth;

      requestAnimationFrame(() => {
        if (currentPane) currentPane.classList.remove("show", "active");
        nextPane.classList.add("show", "active");
        nextPane.classList.remove("is-leaving");
        activeIndex = index;
        syncDesktopContentHeight();

        setTimeout(() => {
          if (currentPane) currentPane.classList.remove("is-leaving");
          isTabAnimating = false;
        }, 430);
      });
    };

    const mql = window.matchMedia("(max-width: 991px)");
    const handleMode = () => {
      if (mql.matches) {
        applyMobileAccordion();
      } else {
        applyDesktopTabs();
      }
    };

    component.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest(".expertise_tabs_nav .nav-link[data-expertise-index]");
      if (!link) return;

      const index = link.getAttribute("data-expertise-index");
      if (!index) return;

      if (isDesktopMode) {
        event.preventDefault();
        switchDesktopTab(index);
      }
    });

    component.addEventListener("shown.bs.collapse", (event) => {
      const pane = event.target;
      if (!(pane instanceof HTMLElement)) return;
      const index = pane.dataset.expertiseIndex || pane.id.replace("expertiseAccordion_", "");
      if (!index) return;
      setActiveLinks(index);
      setActiveAccordionButtons(index);
    });

    mql.addEventListener("change", handleMode);
    handleMode();
  });
}

initWhoWeAreExpertiseTabs();

function initHomeExploreWatermarkParallax() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const section = document.querySelector(".home_explore_section");
  const watermark = section?.querySelector(".home_explore_watermark");
  if (!section || !watermark) return;

  gsap.fromTo(
    watermark,
    { xPercent: -1 },
    {
      xPercent: 6,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
      },
    }
  );
}
if (!isMobileDevice()) {
  initHomeExploreWatermarkParallax();
}

let homeExploreVimeoApiPromise = null;
const homeExploreVimeoPlayers = new WeakMap();

function loadHomeExploreVimeoPlayerAPI() {
  if (typeof Vimeo !== "undefined" && Vimeo.Player) {
    return Promise.resolve();
  }
  if (homeExploreVimeoApiPromise) return homeExploreVimeoApiPromise;
  homeExploreVimeoApiPromise = new Promise((resolve, reject) => {
    const onReady = () => {
      if (typeof Vimeo !== "undefined" && Vimeo.Player) resolve();
      else reject(new Error("Vimeo Player API unavailable"));
    };

    const existing = document.querySelector('script[data-home-explore-vimeo-api="1"]');
    if (existing) {
      if (typeof Vimeo !== "undefined" && Vimeo.Player) {
        onReady();
        return;
      }
      existing.addEventListener("load", onReady, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Vimeo Player API load error")),
        { once: true }
      );
      return;
    }

    const s = document.createElement("script");
    s.src = "https://player.vimeo.com/api/player.js";
    s.async = true;
    s.dataset.homeExploreVimeoApi = "1";
    s.onload = onReady;
    s.onerror = () => reject(new Error("Vimeo Player API load error"));
    document.head.appendChild(s);
  });
  return homeExploreVimeoApiPromise;
}

function initHomeExploreVimeoPlay() {
  const cards = document.querySelectorAll("[data-explore-vimeo-card]");
  if (!cards.length) return;

  /** Back to poster + play; keep embed + single Vimeo.Player (do not call player.destroy()). */
  const exitPlayingUI = (card) => {
    if (!card.classList.contains("is-playing")) return;
    const iframe = card.querySelector(".home_explore_video_iframe");
    const player = homeExploreVimeoPlayers.get(card);
    if (player) {
      Promise.resolve()
        .then(() => player.setCurrentTime(0))
        .then(() => player.pause())
        .catch(() => {});
    } else if (iframe?.getAttribute("src")) {
      iframe.removeAttribute("src");
    }
    card.classList.remove("is-playing");
  };

  cards.forEach((card) => {
    const playButton = card.querySelector("[data-explore-vimeo-play]");
    const iframe = card.querySelector(".home_explore_video_iframe");
    if (!playButton || !iframe) return;

    playButton.addEventListener("click", () => {
      if (card.classList.contains("is-playing")) return;
      const vimeoSrc = iframe.getAttribute("data-vimeo-src");
      if (!vimeoSrc) return;

      const existingPlayer = homeExploreVimeoPlayers.get(card);
      if (existingPlayer) {
        card.classList.add("is-playing");
        const kickPlay = () => {
          const p = existingPlayer.play();
          if (p !== undefined && p !== null && typeof p.then === "function") {
            p.catch(() => {});
          }
        };
        kickPlay();
        void existingPlayer.setCurrentTime(0).then(kickPlay).catch(kickPlay);
        return;
      }

      if (!iframe.getAttribute("src")) {
        iframe.setAttribute("src", vimeoSrc);
      }
      card.classList.add("is-playing");

      loadHomeExploreVimeoPlayerAPI()
        .then(() => {
          if (!card.classList.contains("is-playing")) return;
          const player = new Vimeo.Player(iframe);
          homeExploreVimeoPlayers.set(card, player);
          player.on("ended", () => {
            exitPlayingUI(card);
          });
        })
        .catch(() => {
          /* API failed — leave UI; user can scroll away to reset */
        });
    });

    ScrollTrigger.create({
      trigger: card,
      start: "top bottom",
      end: "bottom top",
      onLeave: () => exitPlayingUI(card),
      onLeaveBack: () => exitPlayingUI(card),
    });
  });
}

function initHomeExploreFlowReveal() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const flowColumns = document.querySelectorAll(".home_explore_flow_cols");
  if (!flowColumns.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  flowColumns.forEach((flowCol) => {
    const flowEls = flowCol.querySelectorAll(".home_explore_flow_item, .home_explore_flow_arrow");
    if (!flowEls.length) return;

    if (reduceMotion) {
      gsap.set(flowEls, { clearProps: "all" });
      return;
    }

    gsap.set(flowEls, { opacity: 0, y: 24 });

    const tl = gsap.timeline({ paused: true });
    tl.to(flowEls, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.20,
      overwrite: "auto",
    });

    ScrollTrigger.create({
      trigger: flowCol,
      start: "top 97%",
      onEnter: () => tl.restart(),
      onLeave: () => tl.pause(0),
      onEnterBack: () => tl.progress(1).pause(),
      onLeaveBack: () => tl.pause(0),
    });
  });
}

initHomeExploreVimeoPlay();
initHomeExploreFlowReveal();

function initHomeFloatingCtaVisibility() {
  const floatingCta = document.querySelector(".home_floating_cta");
  if (!floatingCta) return;

  const hideSelectors = [
    ".home_hero_section",
    ".home_contact_cta_sec",
    ".comn_footer_sec",
  ];

  const hideSections = hideSelectors
    .map((selector) => document.querySelector(selector))
    .filter(Boolean);

  if (!hideSections.length) return;

  const visibleStyle = {
    opacity: "",
    visibility: "",
    pointerEvents: "",
  };

  const hiddenStyle = {
    opacity: "0",
    visibility: "hidden",
    pointerEvents: "none",
  };

  const visibleSections = new Set();

  function applyCtaState() {
    const nextStyle = visibleSections.size > 0 ? hiddenStyle : visibleStyle;
    floatingCta.style.opacity = nextStyle.opacity;
    floatingCta.style.visibility = nextStyle.visibility;
    floatingCta.style.pointerEvents = nextStyle.pointerEvents;
  }

  function sectionInViewport(section) {
    const rect = section.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  function checkOnLoadAndResize() {
    visibleSections.clear();
    hideSections.forEach((section) => {
      if (sectionInViewport(section)) visibleSections.add(section);
    });
    applyCtaState();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.add(entry.target);
        } else {
          visibleSections.delete(entry.target);
        }
      });
      applyCtaState();
    },
    {
      threshold: 0.01,
    }
  );

  hideSections.forEach((section) => observer.observe(section));
  checkOnLoadAndResize();
  window.addEventListener("load", checkOnLoadAndResize);
  window.addEventListener("resize", checkOnLoadAndResize);
}

initHomeFloatingCtaVisibility();

function initTriggerWareMailtoForms() {
  const forms = document.querySelectorAll('form[data-recipient="info@triggerware.ai"]');
  if (!forms.length) return;

  const fieldLabel = (field) => {
    const raw = field.getAttribute("name") || field.getAttribute("placeholder") || "field";
    return raw.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const required = Array.from(form.querySelectorAll("[aria-required='true'], .wpcf7-validates-as-required"));
      const missing = required.filter((field) => {
        if (field.type === "checkbox") return !field.checked;
        return !(field.value || "").trim();
      });
      const output = form.querySelector(".wpcf7-response-output");

      form.querySelectorAll(".wpcf7-not-valid").forEach((field) => field.classList.remove("wpcf7-not-valid"));
      form.querySelectorAll(".wpcf7-not-valid-tip").forEach((tip) => tip.remove());

      if (missing.length) {
        missing.forEach((field) => {
          field.classList.add("wpcf7-not-valid");
          const wrap = field.closest(".wpcf7-form-control-wrap") || field.parentElement;
          if (wrap && !wrap.querySelector(".wpcf7-not-valid-tip")) {
            const tip = document.createElement("span");
            tip.className = "wpcf7-not-valid-tip";
            tip.textContent = `${fieldLabel(field)} is required.`;
            wrap.appendChild(tip);
          }
        });
        if (output) {
          output.textContent = "Please complete the required fields before submitting.";
          output.removeAttribute("aria-hidden");
          output.style.display = "block";
        }
        form.classList.add("invalid");
        return;
      }

      const data = new FormData(form);
      const lines = [];
      for (const [key, value] of data.entries()) {
        if (key.startsWith("_wpcf7") || key === "_wpcf7_posted_data_hash") continue;
        lines.push(`${key.replace(/-/g, " ")}: ${value}`);
      }
      const isDemo = form.getAttribute("aria-label")?.toLowerCase().includes("demo") || form.closest("#contactUsModalRequest");
      const subject = isDemo ? "TriggerWare.AI Demo Request" : "TriggerWare.AI Contact Us";
      window.location.href = `mailto:info@triggerware.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;

      form.classList.remove("invalid", "failed", "spam", "aborted");
      form.classList.add("sent");
      if (output) {
        output.textContent = "Thanks — your email client is opening a message to info@triggerware.ai.";
        output.removeAttribute("aria-hidden");
        output.style.display = "block";
      }
    }, true);
  });
}

// initTriggerWareMailtoForms();
