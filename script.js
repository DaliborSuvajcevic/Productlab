const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Otvori meni');
    });
  });
}

/* Portfolio lightbox */
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const closeLightboxButton = document.querySelector('.lightbox-close');

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
};

if (lightbox && lightboxImage) {
  document.querySelectorAll('[data-lightbox]').forEach(button => {
    button.addEventListener('click', () => {
      lightboxImage.src = button.dataset.lightbox;
      lightboxImage.alt = button.querySelector('img')?.alt || 'Portfolio vizual';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });

  closeLightboxButton?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeLightbox();
  });
}

/* Reveal elements when they enter the viewport */
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
}

/* Package selection */
const packageInput = document.getElementById('selected-package');
document.querySelectorAll('.package-btn, .price-card a[href="#contact"]').forEach(button => {
  button.addEventListener('click', () => {
    if (packageInput && button.dataset.package) {
      packageInput.value = button.dataset.package;
    }
  });
});

/* Contact form opens the visitor's email application */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();

    const name = document.getElementById('name')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const message = document.getElementById('message')?.value.trim() || '';
    const packageName = packageInput?.value.trim() || 'Nije izabran';

    const subject = encodeURIComponent(`PRODUCT LAB — novi upit od ${name}`);
    const body = encodeURIComponent(
      `Ime / brend: ${name}\nEmail: ${email}\nIzabrani paket: ${packageName}\n\nŠta prodaje: ${message}`
    );

    window.location.href = `mailto:suvajcevicdaca@gmail.com?subject=${subject}&body=${body}`;
  });
}
