  const path = window.location.pathname;

  if (path.endsWith(".html")) {
    const clean = path
      .replace("index.html", "")
      .replace(".html", "");

    window.history.replaceState({}, "", clean);
  }



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
    isOpen = true;
    btn.classList.remove("is-closing");
    btn.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");

    swap.classList.remove("is-off");
    swap.classList.add("is-on");

    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");

    document.documentElement.classList.add("lenis-stopped");
    if (window.lenis) window.lenis.stop();

    syncNavUI();
  }

  function closeMenu() {
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

