// Loader
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const lbar = document.getElementById('lbar');
  const lpct = document.getElementById('lpct');
  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 25 + 10;
    if (p >= 100) {
      p = 100; clearInterval(iv);
      if(lbar) lbar.style.width = '100%';
      if(lpct) lpct.textContent = '100%';
      if(loader) {
        loader.classList.add('done');
        setTimeout(() => { loader.classList.add('out'); initHero(); }, 600);
      }
    } else {
      if(lbar) lbar.style.width = p + '%';
      if(lpct) lpct.textContent = Math.floor(p) + '%';
    }
  }, 40);
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

const skRingIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const fill = e.target.querySelector('.sk-ring-fill');
    if (fill) {
      const pct = parseFloat(fill.closest('.sk-card')?.style.getPropertyValue('--sw') || 1) || 0.95;
      const circumference = 2 * Math.PI * 60;
      fill.style.strokeDashoffset = circumference * (1 - pct);
    }
    skRingIO.unobserve(e.target);
  });
}, { threshold: .3 });
document.querySelectorAll('.sk-card.sk-featured').forEach(c => skRingIO.observe(c));

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

// AI Chatbot Logic
function toggleChatWindow() {
  const chatWindow = document.getElementById('chat-window');
  const popup = document.getElementById('chat-welcome-popup');
  if(chatWindow) chatWindow.classList.toggle('chat-hidden');
  if (!chatWindow.classList.contains('chat-hidden')) {
    if(popup) popup.classList.remove('show');
    document.getElementById('user-msg-input').focus();
  }
}
function closePopup(e) { e.stopPropagation(); document.getElementById('chat-welcome-popup').classList.remove('show'); }
function handleEnter(e) { if (e.key === 'Enter') handleUserMessage(); }
function escapeHtml(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
function getPageContext() { return document.body.innerText.trim().slice(0, 12000); }

const CHAT_HISTORY = [];
async function getAIResponse(userMessage) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, history: CHAT_HISTORY, pageContent: getPageContext() })
    });
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data.reply || 'দুঃখিত, উত্তর দিতে পারছি না।';
  } catch (err) {
    return 'সার্ভার সমস্যা। দয়া করে ইমেইল করুন।';
  }
}

async function handleUserMessage() {
  const inputEl = document.getElementById('user-msg-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const msg = inputEl.value.trim();
  if (!msg) return;
  const chatMessages = document.getElementById('chat-messages');
  const quickRow = document.getElementById('chatQuickRow');
  if (quickRow) quickRow.style.display = 'none';

  chatMessages.innerHTML += `<div class="user-message">${escapeHtml(msg)}</div>`;
  inputEl.value = ''; inputEl.disabled = true; sendBtn.disabled = true;
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const loadingId = 'loading-' + Date.now();
  chatMessages.innerHTML += `<div class="bot-message" id="${loadingId}">টাইপ করছে...</div>`;
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const reply = await getAIResponse(msg);
  CHAT_HISTORY.push({ role: 'user', content: msg }, { role: 'assistant', content: reply });
  
  document.getElementById(loadingId).innerHTML = escapeHtml(reply);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  inputEl.disabled = false; sendBtn.disabled = false; inputEl.focus();
}

document.querySelectorAll('.chat-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('user-msg-input').value = btn.dataset.q;
    handleUserMessage();
  });
});

// Chat Eye Blink
(function initEyeBlink() {
  const lids = document.querySelectorAll('.eye-lid');
  if (!lids.length) return;
  function blinkOnce() {
    lids.forEach(l => l.classList.add('blink'));
    setTimeout(() => lids.forEach(l => l.classList.remove('blink')), 140);
    setTimeout(blinkOnce, 3000 + Math.random() * 4000);
  }
  setTimeout(blinkOnce, 2000 + Math.random() * 2000);
})();

// Chat Bubble Drag
(function initDraggableBubble() {
  const container = document.getElementById('ai-chat-container');
  const bubble = document.getElementById('chat-bubble');
  if (!container || !bubble) return;
  let dragging = false, moved = false, startX, startY, offsetX, offsetY;
  
  function getPoint(e) { return e.touches ? e.touches[0] : e; }
  
  function onDown(e) {
    dragging = true; moved = false;
    const rect = container.getBoundingClientRect();
    const p = getPoint(e);
    offsetX = p.clientX - rect.left;
    offsetY = p.clientY - rect.top;
    startX = p.clientX; startY = p.clientY;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  }
  function onMove(e) {
    if (!dragging) return;
    const p = getPoint(e);
    const dx = p.clientX - startX, dy = p.clientY - startY;
    if (!moved && Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    moved = true;
    if (e.touches) e.preventDefault();
    container.style.left = (p.clientX - offsetX) + 'px';
    container.style.top = (p.clientY - offsetY) + 'px';
    container.style.bottom = 'auto';
  }
  function onUp() {
    dragging = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);
    if (!moved) toggleChatWindow();
  }
  bubble.addEventListener('mousedown', onDown);
  bubble.addEventListener('touchstart', onDown, { passive: true });
})();
