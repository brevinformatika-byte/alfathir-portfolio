const body = document.body;
const preloader = document.getElementById("preloader");
const header = document.getElementById("siteHeader");
const progress = document.getElementById("scrollProgress");
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const navAnchors = [...document.querySelectorAll(".nav-links a")];
const sections = [...document.querySelectorAll("main section[id]")];
const glow = document.querySelector(".cursor-glow");
const terminal = document.querySelector(".market-terminal");
const portraitShell = document.getElementById("portraitShell");

window.addEventListener("load", () => {
  setTimeout(() => preloader?.classList.add("hidden"), 650);
});

function closeMenu() {
  navLinks?.classList.remove("open");
  menuBtn?.classList.remove("open");
  body.classList.remove("menu-open");
}

menuBtn?.addEventListener("click", () => {
  const opened = navLinks.classList.toggle("open");
  menuBtn.classList.toggle("open", opened);
  body.classList.toggle("menu-open", opened);
});

navAnchors.forEach(a => a.addEventListener("click", closeMenu));

window.addEventListener("resize", () => {
  if (window.innerWidth > 920) closeMenu();
});

function updateScrollUI() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.min((y / max) * 100, 100) : 0;

  if (progress) progress.style.width = `${pct}%`;
  header?.classList.toggle("scrolled", y > 30);
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

const sectionObserver = new IntersectionObserver(entries => {
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a,b) => b.intersectionRatio - a.intersectionRatio);

  if (!visible.length) return;

  const id = visible[0].target.id;

  navAnchors.forEach(a => {
    a.classList.toggle("active", a.dataset.section === id);
  });
}, {
  rootMargin: "-35% 0px -50% 0px",
  threshold: [0.01, 0.2, 0.5]
});

sections.forEach(section => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 45}ms`;
  revealObserver.observe(el);
});

const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el = entry.target;
    const target = Number(el.dataset.counter || 0);
    const duration = 1000;
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(target * eased);

      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }

    requestAnimationFrame(tick);
    observer.unobserve(el);
  });
}, { threshold: 0.6 });

document.querySelectorAll("[data-counter]").forEach(el => counterObserver.observe(el));

if (terminal) {
  const chartObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("chart-active");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.35 });

  chartObserver.observe(terminal);
}

const finePointer = window.matchMedia("(pointer: fine)");

if (finePointer.matches && glow) {
  let tx = innerWidth / 2, ty = innerHeight / 2;
  let cx = tx, cy = ty;

  addEventListener("mousemove", e => {
    tx = e.clientX;
    ty = e.clientY;
  });

  function animateGlow() {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    glow.style.left = `${cx}px`;
    glow.style.top = `${cy}px`;
    requestAnimationFrame(animateGlow);
  }

  animateGlow();
} else if (glow) {
  glow.style.display = "none";
}

if (portraitShell && finePointer.matches) {
  portraitShell.addEventListener("mousemove", e => {
    const r = portraitShell.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    portraitShell.style.transform = `rotateY(${x * 2.5}deg) rotateX(${-y * 2.5}deg)`;
  });

  portraitShell.addEventListener("mouseleave", () => {
    portraitShell.style.transform = "rotateY(0deg) rotateX(0deg)";
  });
}

window.addEventListener("keydown", e => {
  if (e.key === "Escape") closeMenu();
});
