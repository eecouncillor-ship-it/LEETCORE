"use client";

import { useEffect } from "react";

export default function AnimatedLanding() {
  useEffect(() => {
    console.log("AnimatedLanding mounted");

    let ticking = false;

    function updateState(collapsed: boolean) {
      const title = document.getElementById("leetcore-title");
      const signin = document.getElementById("signin");
      const hero = document.getElementById("hero-illustration");

      if (title) {
        title.classList.toggle("leetcore-collapsed", collapsed);
      }

      if (signin) {
        signin.classList.toggle("signin-visible", collapsed);
      }
      if (hero) {
        // hero visible when not collapsed
        hero.classList.toggle("hero-visible", !collapsed);
      }
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY || window.pageYOffset;
          const collapsed = y > 120;
          updateState(collapsed);
          ticking = false;
        });
        ticking = true;
      }
    }

    function onWheel(e: WheelEvent) {
      if (e.deltaY > 0) {
        updateState(true);
      } else if (window.scrollY === 0) {
        updateState(false);
      }
    }

    function onTouchStart() {
      updateState(true);
    }

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a[href="#signin"]') as HTMLAnchorElement | null;
      if (anchor) {
        // reveal signin panel when header sign-in is clicked
        updateState(true);
        // ensure the panel is visible / scrolled into view
        const signinEl = document.getElementById('signin');
        if (signinEl) {
          // allow animation to start then scroll smoothly
          setTimeout(() => signinEl.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });

    // run once to set initial state
    onScroll();

    document.addEventListener('click', onClick, true);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  return null;
}
