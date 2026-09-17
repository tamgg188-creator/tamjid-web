
/* =========================================
   GLOBAL UTILITIES
========================================= */

'use strict';

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];


/* =========================================
   LOADER
========================================= */

window.addEventListener('load', () => {
  const loader = $('#loader');
  const progressBar = $('#lbar');
  const progressText = $('#lpct');

  let progress = 0;
  let animationFrame;

  const updateLoader = () => {
    progress += Math.random() * 25 + 10;
    progress = Math.min(progress, 100);

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (progressText) {
      progressText.textContent = `${Math.floor(progress)}%`;
    }

    if (progress >= 100) {
      cancelAnimationFrame(animationFrame);

      if (progressBar) {
        progressBar.style.width = '100%';
      }

      if (progressText) {
        progressText.textContent = '100%';
      }

      if (loader) {
        loader.classList.add('done');

        window.setTimeout(() => {
          loader.classList.add('out');

          if (typeof initHero === 'function') {
            initHero();
          }
        }, 600);
      } else {
        initHero();
      }

      return;
    }

    animationFrame = requestAnimationFrame(() => {
      window.setTimeout(updateLoader, 40);
    });
  };

  updateLoader();
});


/* =========================================
   HERO TYPING ANIMATION
========================================= */

function splitChars(element, text, baseDelay = 0) {
  if (!element) return;

  element.replaceChildren();

  let characterIndex = 0;

  text.split(' ').forEach((word, wordIndex, words) => {
    const wordWrapper = document.createElement('span');

    wordWrapper.className = 'hc-word';

    [...word].forEach((character) => {
      const characterElement = document.createElement('span');

      characterElement.className = 'hc';
      characterElement.textContent = character;

      characterElement.style.animationDelay =
        `${baseDelay + characterIndex * 0.04}s`;

      wordWrapper.appendChild(characterElement);
      characterIndex++;
    });

    element.appendChild(wordWrapper);

    if (wordIndex < words.length - 1) {
      element.appendChild(document.createTextNode(' '));
      characterIndex++;
    }
  });
}


let heroInitialized = false;

function initHero() {
  if (heroInitialized) return;

  heroInitialized = true;

  splitChars(
    $('#hr1'),
    'Tamjidul Islam',
    0.1
  );

  splitChars(
    $('#hr2'),
    'Ovi',
    0.5
  );

  startSlot();
}


/* =========================================
   HERO ROLE SLOT
========================================= */

let slotInterval = null;

function startSlot() {
  const slotInner = $('#slotInner');

  if (!slotInner || slotInterval) return;

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) return;

  let index = 0;

  slotInterval = window.setInterval(() => {
    index = (index + 1) % 3;

    slotInner.style.transform =
      `translateY(${-index * 1.4}em)`;
  }, 2800);
}


/* =========================================
   MOUSE LIGHT
========================================= */

const mouseLight = $('#mouse-light');

let mouseFramePending = false;
let mouseX = 0;
let mouseY = 0;

if (mouseLight) {
  document.addEventListener(
    'mousemove',
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (mouseFramePending) return;

      mouseFramePending = true;

      requestAnimationFrame(() => {
        mouseLight.style.transform =
          `translate3d(${mouseX}px, ${mouseY}px, 0)`;

        mouseFramePending = false;
      });
    },
    { passive: true }
  );
}


/* =========================================
   SCROLL HANDLING
========================================= */

const progressElement = $('#progress');
const navigationElement = $('#nav');
const floatingCta = $('.float-cta');

let scrollFramePending = false;

function updateScrollUI() {
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;

  const documentHeight =
    document.documentElement.scrollHeight;

  const maxScroll =
    Math.max(documentHeight - viewportHeight, 1);

  const progress =
    Math.min((scrollY / maxScroll) * 100, 100);

  if (progressElement) {
    progressElement.style.width = `${progress}%`;
  }

  if (navigationElement) {
    navigationElement.classList.toggle(
      'on',
      scrollY > 80
    );
  }

  if (floatingCta) {
    floatingCta.classList.toggle(
      'show',
      scrollY > viewportHeight * 0.6
    );
  }

  scrollFramePending = false;
}

window.addEventListener(
  'scroll',
  () => {
    if (scrollFramePending) return;

    scrollFramePending = true;
    requestAnimationFrame(updateScrollUI);
  },
  { passive: true }
);

window.addEventListener(
  'resize',
  updateScrollUI,
  { passive: true }
);

updateScrollUI();


/* =========================================
   MOBILE MENU
========================================= */

const hamburger = $('#ham');
const mobileMenu = $('#mobMenu');

function closeMob() {
  if (hamburger) {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  if (mobileMenu) {
    mobileMenu.classList.remove('open');
  }

  document.body.style.overflow = '';
}

function toggleMobileMenu() {
  if (!hamburger || !mobileMenu) return;

  const isOpen =
    hamburger.classList.toggle('open');

  mobileMenu.classList.toggle('open', isOpen);

  hamburger.setAttribute(
    'aria-expanded',
    String(isOpen)
  );

  document.body.style.overflow =
    isOpen ? 'hidden' : '';
}

if (hamburger) {
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-controls', 'mobMenu');

  hamburger.addEventListener(
    'click',
    toggleMobileMenu
  );
}

$$('#mobMenu a').forEach((link) => {
  link.addEventListener('click', closeMob);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMob();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMob();
  }
});


/* =========================================
   INTERSECTION ANIMATIONS
========================================= */

function animateCounter(element, target) {
  if (!element || element.dataset.animating === 'true') {
    return;
  }

  element.dataset.animating = 'true';

  const duration = 1500;
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easing =
      1 - Math.pow(1 - progress, 3);

    const currentValue =
      Math.round(easing * target);

    element.textContent = `${currentValue}+`;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = `${target}+`;
      element.dataset.completed = 'true';
    }
  }

  requestAnimationFrame(updateCounter);
}

const revealElements = $$('.rv, .rl, .rr, .sk-card, .ai-overview-block');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const element = entry.target;

        element.classList.add('in');

        $$('.line-reveal-inner', element).forEach(
          (line, index) => {
            window.setTimeout(() => {
              line.classList.add('in');
            }, index * 80);
          }
        );

        $$('[data-count]', element).forEach((counter) => {
          if (
            counter.dataset.counted === 'true' ||
            counter.dataset.completed === 'true'
          ) {
            return;
          }

          counter.dataset.counted = 'true';

          const target =
            Number(counter.dataset.count);

          if (Number.isFinite(target)) {
            window.setTimeout(() => {
              animateCounter(counter, target);
            }, 300);
          }
        });

        observer.unobserve(element);
      });
    },
    {
      threshold: 0.1
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add('in');
  });
}


/* =========================================
   CONTACT FORM
========================================= */

const contactForm = $('#contactForm');
const submitButton = $('#submitBtn');
const formStatus = $('#formStatus');

const scriptURL =
  'https://script.google.com/macros/s/AKfycbzkwGFAxH_5Y3g0dVdQLV5p_KtyF25xxTcsIizu6s0NqrLogG-TXXm1OMHCW02ML_Z_/exec';

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!submitButton) return;

    const buttonText = $('span', submitButton);
    const originalText = buttonText?.textContent || '';

    submitButton.disabled = true;

    if (buttonText) {
      buttonText.textContent = 'পাঠানো হচ্ছে...';
    }

    if (formStatus) {
      formStatus.textContent = '';
      formStatus.style.color = '';
    }

    try {
      const response = await fetch(scriptURL, {
        method: 'POST',
        body: new FormData(contactForm)
      });

      if (!response.ok) {
        throw new Error('Network response failed');
      }

      const data = await response.json();

      if (data.status === 'success') {
        if (formStatus) {
          formStatus.textContent =
            'সফলভাবে পাঠানো হয়েছে!';

          formStatus.style.color = 'var(--teal)';
        }

        contactForm.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);

      if (formStatus) {
        formStatus.textContent =
          'সমস্যা হয়েছে। আবার চেষ্টা করুন।';

        formStatus.style.color = 'var(--pink)';
      }
    } finally {
      submitButton.disabled = false;

      if (buttonText) {
        buttonText.textContent = originalText;
      }
    }
  });
}


/* =========================================
   FOOTER CLOCK
========================================= */

const clockElement = $('#ftTime');

function updateClock() {
  if (!clockElement) return;

  const now = new Date();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  clockElement.textContent =
    `${hours}:${minutes}:${seconds} BST`;
}

updateClock();

window.setInterval(updateClock, 1000);


/* =========================================
   GLOBAL CLEANUP
========================================= */

window.addEventListener('beforeunload', () => {
  if (slotInterval) {
    clearInterval(slotInterval);
  }
});
