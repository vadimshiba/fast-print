const animatedItems = document.querySelectorAll("[data-animate]");
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const preloader = document.querySelector(".preloader");
const counters = document.querySelectorAll("[data-count]");
const navLinks = document.querySelectorAll(".nav a[href^='#']");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const tiltItems = document.querySelectorAll(".service-card, .tech-card, .work-item");

document.body.classList.add("is-loading");

const hidePreloader = () => {
  preloader?.classList.add("is-hidden");
  document.body.classList.remove("is-loading");
};

const reveal = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        entry.target.querySelectorAll("[data-count]").forEach(animateCounter);
        reveal.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

animatedItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 45, 220)}ms`;
  reveal.observe(item);
});

const syncHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

const syncScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
};

const animateCounter = (counter) => {
  if (counter.dataset.animated === "true") return;

  const target = Number(counter.dataset.count);
  const suffix = counter.dataset.suffix || "";
  const duration = 900;
  const startedAt = performance.now();

  counter.dataset.animated = "true";

  const tick = (now) => {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = `${Math.round(target * eased)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

syncHeader();
syncScrollProgress();
window.addEventListener("scroll", syncHeader, { passive: true });
window.addEventListener("scroll", syncScrollProgress, { passive: true });
window.addEventListener("resize", syncScrollProgress);

if (!motionQuery.matches) {
  tiltItems.forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      item.style.setProperty("--tilt-x", `${(x * 7).toFixed(2)}deg`);
      item.style.setProperty("--tilt-y", `${(-y * 7).toFixed(2)}deg`);
    });

    item.addEventListener("pointerleave", () => {
      item.style.setProperty("--tilt-x", "0deg");
      item.style.setProperty("--tilt-y", "0deg");
    });
  });
}

menuToggle?.addEventListener("click", () => {
  const isOpen = header?.classList.toggle("menu-open") || false;
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => {
    header?.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-42% 0px -48% 0px", threshold: 0.01 }
);

navLinks.forEach((link) => {
  const section = document.querySelector(link.getAttribute("href"));
  if (section) sectionObserver.observe(section);
});

document.querySelector(".quote-form button")?.addEventListener("click", () => {
  const form = document.querySelector(".quote-form");
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const message = form.message.value.trim();
  const text = encodeURIComponent(
    `Здравствуйте! Меня зовут ${name || "клиент"}. Телефон: ${phone || "не указан"}. Заказ: ${
      message || "нужно рассчитать печать"
    }`
  );

  window.open(`https://wa.me/77758831277?text=${text}`, "_blank", "noopener,noreferrer");
});

window.addEventListener("load", () => {
  window.setTimeout(hidePreloader, 650);
});

window.setTimeout(hidePreloader, 2400);

counters.forEach((counter) => {
  counter.textContent = `0${counter.dataset.suffix || ""}`;
});

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
