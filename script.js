// Initialize Hero Animation directly (Without Loader)
document.addEventListener('DOMContentLoaded', () => {
    initHero();
});

// Hero Typing Animation
function splitChars(el, text, base) {
    if (!el) return;
    el.innerHTML = '';
    text.split(' ').forEach((word, wi, arr) => {
        const wrap = document.createElement('span');
        wrap.className = 'hc-word';
        let ci = el.querySelectorAll('.hc').length;
        [...word].forEach((ch, j) => {
            const s = document.createElement('span');
            s.className = 'hc';
            s.textContent = ch === ' ' ? '\u00A0' : ch;
            s.style.animationDelay = (base + (ci + j) * .04) + 's';
            wrap.appendChild(s);
        });
        el.appendChild(wrap);
        if (wi < arr.length - 1) el.appendChild(document.createTextNode(' '));
    });
}

function initHero() {
    splitChars(document.getElementById('hr1'), 'Tamjidul Islam', .1);
    splitChars(document.getElementById('hr2'), 'Ovi', .5);
    startSlot();
}

function startSlot() {
    const inner = document.getElementById('slotInner');
    if (!inner) return;
    let idx = 0;
    setInterval(() => {
        idx = (idx + 1) % 3;
        inner.style.transform = `translateY(${-idx * 1.4}em)`;
    }, 2800);
}

// Scroll & Mouse Events
const mouseLight = document.getElementById('mouse-light');
let mouseUpdatePending = false;
document.addEventListener('mousemove', e => {
    if (!mouseUpdatePending && mouseLight) {
        mouseUpdatePending = true;
        requestAnimationFrame(() => {
            mouseLight.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            mouseUpdatePending = false;
        });
    }
}, { passive: true });

const progressEl = document.getElementById('progress');
const navEl = document.getElementById('nav');
const floatCta = document.querySelector('.float-cta');
window.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
        const y = window.scrollY;
        const maxY = document.documentElement.scrollHeight - innerHeight;
        if(progressEl) progressEl.style.width = (y / maxY * 100) + '%';
        if(navEl) navEl.classList.toggle('on', y > 80);
        if(floatCta) floatCta.classList.toggle('show', y > innerHeight * .6);
    });
}, { passive: true });

// Mobile Menu
const hamEl = document.getElementById('ham');
const mobMenuEl = document.getElementById('mobMenu');
function closeMob() {
    if(hamEl) hamEl.classList.remove('open');
    if(mobMenuEl) mobMenuEl.classList.remove('open');
    document.body.style.overflow = '';
}
if (hamEl) {
    hamEl.addEventListener('click', () => {
        const isOpen = hamEl.classList.toggle('open');
        if(mobMenuEl) mobMenuEl.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });
}

// Intersection Animations
function animCount(el, target) {
    let s = null;
    (function step(ts) {
        if (!s) s = ts;
        const prog = Math.min((ts - s) / 1500, 1);
        const ease = 1 - Math.pow(1 - prog, 3);
        el.textContent = Math.round(ease * target) + '+';
        if (prog < 1) requestAnimationFrame(step);
        else el.textContent = target + '+';
    })(performance.now());
}
const revIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add('in');
        el.querySelectorAll('.line-reveal-inner').forEach((li, i) => {
            setTimeout(() => li.classList.add('in'), i * 80);
        });
        el.querySelectorAll('[data-count]').forEach(c => {
            if (!c.dataset.counted) {
                c.dataset.counted = '1';
                setTimeout(() => animCount(c, +c.dataset.count), 300);
            }
        });
        revIO.unobserve(el);
    });
}, { threshold: .1 });
document.querySelectorAll('.rv,.rl,.rr,.sk-card,.ai-overview-block').forEach(el => revIO.observe(el));

// Form Submission
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');
const scriptURL = 'https://script.google.com/macros/s/AKfycbzkwGFAxH_5Y3g0dVdQLV5p_KtyF25xxTcsIizu6s0NqrLogG-TXXm1OMHCW02ML_Z_/exec';
if (contactForm) {
    contactForm.addEventListener('submit', e => {
        e.preventDefault();
        submitBtn.disabled = true;
        const btnText = submitBtn.querySelector('span');
        const origText = btnText.textContent;
        btnText.textContent = 'পাঠানো হচ্ছে...';
        formStatus.textContent = '';
        fetch(scriptURL, { method: 'POST', body: new FormData(contactForm) })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                formStatus.textContent = 'সফলভাবে পাঠানো হয়েছে!';
                formStatus.style.color = 'var(--teal)';
                contactForm.reset();
            } else {
                formStatus.textContent = 'সমস্যা হয়েছে!';
                formStatus.style.color = 'var(--pink)';
            }
        })
        .finally(() => {
            submitBtn.disabled = false;
            btnText.textContent = origText;
        });
    });
}

// Footer Clock
function updateClock() {
    const el = document.getElementById('ftTime');
    if (!el) return;
    const t = new Date();
    const h = String(t.getHours()).padStart(2,'0');
    const m = String(t.getMinutes()).padStart(2,'0');
    const s = String(t.getSeconds()).padStart(2,'0');
    el.textContent = `${h}:${m}:${s} BST`;
}
setInterval(updateClock, 1000); updateClock();

// Skills: copy description and tech stack together

document.querySelectorAll('.sk-copy').forEach(button => {
    button.addEventListener('click', async () => {
        const card = button.closest('.sk-card');
        if (!card) return;

        const title = card.querySelector('.sk-nm')?.textContent.trim() || '';
        const description = card.querySelector('.sk-desc')?.textContent.trim() || '';
        const techLabel = card.querySelector('.sk-tech-label')?.textContent.trim() || 'Technologies';
        const techStack = [...card.querySelectorAll('.stag')].map(tag => tag.textContent.trim()).join(', ');
        const copyText = `${title}\n\n${description}\n\n${techLabel}\n${techStack}`;

        try {
            await navigator.clipboard.writeText(copyText);
            const originalText = button.textContent;
            button.textContent = 'Copied Successfully';
            button.classList.add('copied');
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 1800);
        } catch (error) {
            button.textContent = 'Copy Failed — Try Again';
            setTimeout(() => {
                button.textContent = 'Copy Description + Tech Stack';
            }, 1800);
        }
    });
});
