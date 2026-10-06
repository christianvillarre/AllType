document.addEventListener("DOMContentLoaded", async () => {
  const mount = document.getElementById("site-navbar");
  if (!mount) return;

  try {
    const res = await fetch("/navbar.fragment");
    if (!res.ok) throw new Error(`Failed to load navbar: ${res.status}`);
    mount.innerHTML = await res.text();
  } catch (err) {
    console.error("Navbar load failed:", err);
    return;
  }

  const btn = mount.querySelector(".menu-btn");
  const swap = mount.querySelector(".swap");
  const panel = mount.querySelector("#menuPanel");
  const navbar = mount.querySelector(".navbar");

  console.log("btn:", btn);
  console.log("swap:", swap);
  console.log("panel:", panel);
  console.log("navbar:", navbar);

  if (!btn || !swap || !panel || !navbar) {
    console.warn("Navbar elements missing after fragment load.");
    return;
  }

  let isOpen = false;
  const mainItems = mount.querySelectorAll(".menu-link");
  const detailItems = mount.querySelectorAll(
    ".menu-section-title, .menu-subitem, .menu-right > .office-block"
  );
  const menuItems = [...mount.querySelectorAll(".menu-panel-top"), ...mainItems, ...detailItems];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopMenu = window.matchMedia("(min-width: 992px)");
  let menuTimeline;

  // The navbar is shared by pages that do not otherwise use GSAP.
  if (!window.gsap) {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js";
    script.async = true;
    document.head.appendChild(script);
  }

  function resetMenuItems() {
    menuTimeline?.kill();
    if (window.gsap) gsap.set(menuItems, { clearProps: "opacity,transform,visibility" });
  }

  function syncNavUI() {
    const atTop = window.scrollY <= 10;
    if (atTop || isOpen) {
      navbar.classList.add("show-nav-ui");
    } else {
      navbar.classList.remove("show-nav-ui");
    }
  }

  function showHoverIn() {
    if (isOpen) return;
    swap.classList.remove("is-off");
    swap.classList.add("is-on");
  }

  function showHoverOut() {
    if (isOpen) return;
    swap.classList.add("is-off");
    swap.classList.remove("is-on");
    clearTimeout(showHoverOut._t);
    showHoverOut._t = setTimeout(() => {
      swap.classList.remove("is-off");
    }, 420);
  }

  function openMenu() {
    resetMenuItems();
    if (window.gsap && !reducedMotion.matches) {
      gsap.set(menuItems, { autoAlpha: 0, y: desktopMenu.matches ? 64 : 36 });
    }
    isOpen = true;
    btn.classList.remove("is-closing");
    btn.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");

    swap.classList.remove("is-off");
    swap.classList.add("is-on");

    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");

    if (window.gsap && !reducedMotion.matches) {
      menuTimeline = gsap.timeline({ delay: 0.44, onComplete: resetMenuItems });
      menuTimeline.to(mount.querySelector(".menu-panel-top"), {
        autoAlpha: 1,
        y: 0,
        duration: 0.35,
        ease: "power3.out"
      });
      menuTimeline.to(mainItems, {
        autoAlpha: 1,
        y: 0,
        duration: desktopMenu.matches ? 0.85 : 0.7,
        stagger: desktopMenu.matches ? 0.15 : 0.11,
        ease: "power3.out"
      }, 0.08);
      menuTimeline.to(detailItems, {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.045,
        ease: "power3.out"
      }, 0.24);
    }

    document.documentElement.classList.add("lenis-stopped");
    if (window.lenis) window.lenis.stop();

    syncNavUI();
  }

  function closeMenu() {
    resetMenuItems();
    isOpen = false;
    btn.classList.remove("is-open");
    btn.classList.add("is-closing");
    btn.setAttribute("aria-expanded", "false");

    swap.classList.add("is-off");
    swap.classList.remove("is-on");

    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");

    document.documentElement.classList.remove("lenis-stopped");
    if (window.lenis) window.lenis.start();

    clearTimeout(closeMenu._t1);
    clearTimeout(closeMenu._t2);

    closeMenu._t1 = setTimeout(() => {
      btn.classList.remove("is-closing");
    }, 320);

    closeMenu._t2 = setTimeout(() => {
      swap.classList.remove("is-off");
    }, 420);

    syncNavUI();
  }

  btn.addEventListener("mouseenter", showHoverIn, { passive: true });
  btn.addEventListener("mouseleave", showHoverOut, { passive: true });

  btn.addEventListener("click", () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  mount.querySelectorAll(".menu-link, .menu-subitem").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("scroll", syncNavUI, { passive: true });
  window.addEventListener("load", syncNavUI);

  syncNavUI();
});

