const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const closeLightbox = () => { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden','true'); };
document.querySelectorAll('[data-lightbox]').forEach(button => {
  button.addEventListener('click', () => {
    lightboxImage.src = button.dataset.lightbox;
    lightboxImage.alt = button.querySelector('img')?.alt || 'Portfolio vizual';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
  });
});
document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* Package selection */
const packageInput = document.getElementById('selected-package');
document.querySelectorAll('.package-btn, .price-card a[href="#contact"]').forEach(button => {
  button.addEventListener('click', () => {
    if (packageInput && button.dataset.package) {
      packageInput.value = button.dataset.package;
    }
  });
});

const form = document.getElementById('contactForm');
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const packageName = document.getElementById('selected-package')?.value.trim() || 'Nije izabran';
  const subject = encodeURIComponent(`PRODUCT LAB — novi upit od ${name}`);
  const body = encodeURIComponent(`Ime / brend: ${name}\nEmail: ${email}\nIzabrani paket: ${packageName}\n\nŠta prodaje: ${message}`);
  window.location.href = `mailto:suvajcevicdaca@gmail.com?subject=${subject}&body=${body}`;
});
