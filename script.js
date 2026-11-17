/* Language: English by default, Serbian through the EN / SR switch or ?lang=sr */
const LANG_KEY = 'productlab-lang';
let currentLang = 'en';
const t = key => (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

function getInitialLang() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (fromUrl === 'sr' || fromUrl === 'en') return fromUrl;
  } catch (e) {}
  try {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === 'sr' || saved === 'en') return saved;
  } catch (e) {}
  return 'en';
}

function applyLang(lang, persist) {
  currentLang = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(';').forEach(pair => {
      const [attr, key] = pair.split(':');
      if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
    });
  });

  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', t('meta_desc'));

  if (menuToggle && nav) {
    menuToggle.setAttribute('aria-label', nav.classList.contains('open') ? t('menu_close') : t('menu_open'));
  }

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
  });

  if (persist) {
    try { window.localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang, true));
});

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? t('menu_close') : t('menu_open'));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', t('menu_open'));
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
      lightboxImage.alt = button.querySelector('img')?.alt || t('portfolio_visual');
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

/* Contact form: sends through EmailJS when configured, otherwise opens the visitor's email app */
const form = document.getElementById('contactForm');
const formNote = form ? form.querySelector('.form-note') : null;

function emailJsReady() {
  const c = window.EMAILJS || {};
  return Boolean(c.publicKey && c.serviceId && c.notifyTemplateId);
}

async function emailJsSend(templateId, params) {
  const c = window.EMAILJS;
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service_id: c.serviceId, template_id: templateId, user_id: c.publicKey, template_params: params })
  });
  if (!res.ok) throw new Error('EmailJS ' + res.status);
}

if (formNote && emailJsReady()) formNote.setAttribute('data-i18n', window.EMAILJS.replyTemplateId ? 'f_note_js' : 'f_note_js1');

if (form) {
  form.addEventListener('submit', async event => {
    event.preventDefault();

    const name = document.getElementById('name')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';
    const message = document.getElementById('message')?.value.trim() || '';
    const packageName = packageInput?.value.trim() || t('mail_none');

    if (!emailJsReady()) {
      const subject = encodeURIComponent(`${t('mail_subject')}${name}`);
      const body = encodeURIComponent(
        `${t('mail_name')}: ${name}\n${t('mail_email')}: ${email}\n${t('mail_pkg')}: ${packageName}\n\n${t('mail_msg')}: ${message}`
      );
      window.location.href = `mailto:suvajcevicdaca@gmail.com?subject=${subject}&body=${body}`;
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const params = { name: name, email: email, title: name, from_name: name, from_email: email, package: packageName, message: message, lang: document.documentElement.lang || 'en' };
    submitBtn.disabled = true;
    if (formNote) formNote.textContent = t('f_sending');
    try {
      await emailJsSend(window.EMAILJS.notifyTemplateId, params);
      if (window.EMAILJS.replyTemplateId) {
        try { await emailJsSend(window.EMAILJS.replyTemplateId, params); } catch (e) { /* inquiry already delivered */ }
      }
      form.reset();
      if (packageInput) packageInput.value = '';
      if (formNote) formNote.textContent = t(window.EMAILJS.replyTemplateId ? 'f_ok' : 'f_ok1');
    } catch (e) {
      if (formNote) formNote.textContent = t('f_err');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

applyLang(getInitialLang(), false);
