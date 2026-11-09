// ===== Configuración: cambiá estos datos en un solo lugar =====
const CONFIG = {
  brand: "NEXA",
  brandFull: "NEXA Automations",
  whatsapp: "5491100000000", // número con código de país, sin + ni espacios
  whatsappText: "Hola! Quiero automatizar mi negocio 🚀",
};

document.querySelectorAll("[data-brand]").forEach((el) => (el.textContent = CONFIG.brand));
document.querySelectorAll("[data-brand-full]").forEach((el) => (el.textContent = CONFIG.brandFull));
const waUrl = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.whatsappText)}`;
document.querySelectorAll("[data-wa]").forEach((el) => (el.href = waUrl));
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Menú mobile =====
const nav = document.getElementById("nav");
const burger = document.getElementById("burger");
burger.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
document.querySelectorAll("#navLinks a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  })
);

// ===== Reveal on scroll + contadores =====
document.querySelectorAll(".bento, .steps, .why, .metrics__grid").forEach((group) => {
  [...group.children].forEach((el, i) => el.style.setProperty("--delay", `${i * 90}ms`));
});
document.querySelectorAll(".bars i").forEach((b, i) => (b.style.transitionDelay = `${i * 60}ms`));

const animateCount = (el) => {
  const to = +el.dataset.to;
  const dur = 1400;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      e.target.querySelectorAll(".count").forEach(animateCount);
      io.unobserve(e.target);
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ===== Testimonios =====
const track = document.getElementById("track");
const dotsWrap = document.getElementById("dots");
const slides = track.children.length;
let idx = 0;
let timer;
for (let i = 0; i < slides; i++) {
  const b = document.createElement("button");
  b.setAttribute("aria-label", `Testimonio ${i + 1}`);
  b.addEventListener("click", () => go(i, true));
  dotsWrap.appendChild(b);
}
function go(i, user) {
  idx = (i + slides) % slides;
  track.style.transform = `translateX(-${idx * 100}%)`;
  [...dotsWrap.children].forEach((d, j) => d.classList.toggle("on", j === idx));
  if (user) restart();
}
function restart() {
  clearInterval(timer);
  timer = setInterval(() => go(idx + 1), 6000);
}
go(0);
restart();

// ===== Formulario =====
const form = document.getElementById("form");
const toast = document.getElementById("toast");
const showToast = (msg) => {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
};
const messages = {
  name: "Contanos tu nombre",
  email: "Ingresá un email válido",
  whatsapp: "Ingresá tu WhatsApp",
  service: "Elegí un servicio",
  message: "Escribinos un mensaje",
};
form.addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll("input, select, textarea").forEach((f) => {
    const field = f.closest(".field");
    const valid = f.checkValidity() && f.value.trim() !== "";
    field.classList.toggle("err", !valid);
    field.querySelector("small").textContent = valid ? "" : messages[f.name];
    if (!valid) ok = false;
  });
  if (!ok) return;
  // Sin backend por ahora: acá se puede conectar Formspree, un webhook o enviar a WhatsApp.
  form.reset();
  showToast("¡Gracias! Te respondemos en menos de 24 hs ✨");
});
