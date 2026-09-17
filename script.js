/* ==========================================
   LOADER & INITIAL ANIMATION
========================================== */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const lbar = document.getElementById('lbar');
  const lpct = document.getElementById('lpct');
  let p = 0;
  
  const iv = setInterval(() => {
    p += Math.random() * 25 + 10;
    if (p >= 100) {
      p = 100;
      clearInterval(iv);
      if (lbar) lbar.style.width = '100%';
      if (lpct) lpct.textContent = '100%';
      if (loader) {
        loader.classList.add('done');
        setTimeout(() => { loader.classList.add('out'); }, 600);
      }
    } else {
      if (lbar) lbar.style.width = p + '%';
      if (lpct) lpct.textContent = Math.floor(p) + '%';
    }
  }, 40);
});

/* ==========================================
   SCROLL NAVIGATION & ACTIVE LINKS
========================================== */
const navEl = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (navEl) navEl.classList.toggle('on', window.scrollY > 80);
});

/* ==========================================
   MOBILE MENU TOGGLE
========================================== */
const hamEl = document.getElementById('ham');
const mobMenuEl = document.getElementById('mobMenu');

function closeMob() {
  if (hamEl) hamEl.classList.remove('open');
  if (mobMenuEl) mobMenuEl.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamEl) {
  hamEl.addEventListener('click', () => {
    const isOpen = hamEl.classList.toggle('open');
    if (mobMenuEl) mobMenuEl.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}

/* ==========================================
   INTERSECTION OBSERVER (Scroll Animations)
========================================== */
const observerOptions = { threshold: 0.1 };

const revIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0) translateX(0)';
      revIO.unobserve(e.target);
    }
  });
}, observerOptions);

// Set initial states for elements
document.querySelectorAll('.rv, .rl, .rr').forEach(el => {
  el.style.opacity = '0';
  el.style.transition = 'all 0.8s ease';
  
  if (el.classList.contains('rv')) el.style.transform = 'translateY(30px)';
  if (el.classList.contains('rl')) el.style.transform = 'translateX(-30px)';
  if (el.classList.contains('rr')) el.style.transform = 'translateX(30px)';
  
  revIO.observe(el);
});

/* ==========================================
   CONTACT FORM LOGIC
========================================== */
const contactForm = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const formStatus  = document.getElementById('formStatus');
const scriptURL   = 'https://script.google.com/macros/s/AKfycbzkwGFAxH_5Y3g0dVdQLV5p_KtyF25xxTcsIizu6s0NqrLogG-TXXm1OMHCW02ML_Z_/exec';

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    submitBtn.disabled = true;
    const origText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    formStatus.textContent = '';
    
    fetch(scriptURL, { method: 'POST', body: new FormData(contactForm) })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          formStatus.textContent = 'Message sent successfully! Thank you.';
          formStatus.style.color = 'var(--primary-blue)';
          contactForm.reset();
        } else {
          formStatus.textContent = 'Something went wrong! Please try again.';
          formStatus.style.color = '#ef4444';
        }
      })
      .catch(error => {
        formStatus.textContent = 'Network error! Please try again.';
        formStatus.style.color = '#ef4444';
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = origText;
      });
  });
}

/* ==========================================
   AI CHATBOT LOGIC
========================================== */
function toggleChatWindow() {
  const chatWindow = document.getElementById('chat-window');
  const welcomePopup = document.getElementById('chat-welcome-popup');
  
  if (chatWindow) {
    chatWindow.classList.toggle('chat-hidden');
    if (!chatWindow.classList.contains('chat-hidden')) {
      if (welcomePopup) welcomePopup.style.display = 'none';
      document.getElementById('user-msg-input').focus();
    }
  }
}

function closePopup(event) {
  event.stopPropagation();
  const popup = document.getElementById('chat-welcome-popup');
  if (popup) popup.style.display = 'none';
}

function handleEnter(e) {
  if (e.key === 'Enter') handleUserMessage();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getPageContext() {
  return document.body.innerText.trim().slice(0, 12000);
}

const CHAT_HISTORY = [];

async function getAIResponse(userMessage) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        history: CHAT_HISTORY,
        pageContent: getPageContext()
      })
    });
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data.reply || 'দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না। বিস্তারিত জানতে ইমেইল করুন: inbox@tamjidulislam.online';
  } catch (err) {
    return 'দুঃখিত, সার্ভারের সাথে সংযোগ করতে সমস্যা হচ্ছে। একটু পর আবার চেষ্টা করুন।';
  }
}

async function handleUserMessage() {
  const inputEl = document.getElementById('user-msg-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const messageText = inputEl.value.trim();
  
  if (!messageText) return;

  const chatMessages = document.getElementById('chat-messages');
  const quickRow = document.getElementById('chatQuickRow');
  if (quickRow) quickRow.style.display = 'none';

  chatMessages.innerHTML += `<div class="user-message">${escapeHtml(messageText)}</div>`;
  inputEl.value = '';
  inputEl.disabled = true;
  sendBtn.disabled = true;
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const loadingId = 'loading-' + Date.now();
  chatMessages.innerHTML += `<div class="bot-message" id="${loadingId}">টাইপ করছে...</div>`;
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const reply = await getAIResponse(messageText);

  CHAT_HISTORY.push({ role: 'user', content: messageText });
  CHAT_HISTORY.push({ role: 'assistant', content: reply });
  if (CHAT_HISTORY.length > 10) CHAT_HISTORY.splice(0, CHAT_HISTORY.length - 10);

  const loadingEl = document.getElementById(loadingId);
  if (loadingEl) loadingEl.innerHTML = escapeHtml(reply);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  inputEl.disabled = false;
  sendBtn.disabled = false;
  inputEl.focus();
}

// Quick Chips Setup
document.querySelectorAll('.chat-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    const inputEl = document.getElementById('user-msg-input');
    inputEl.value = btn.dataset.q;
    handleUserMessage();
  });
});

// Draggable AI Bubble
(function initDraggableBubble() {
  const container = document.getElementById('ai-chat-container');
  const bubble = document.getElementById('chat-bubble');
  if (!container || !bubble) return;

  let isDragging = false, initialX, initialY;
  
  bubble.addEventListener('mousedown', dragStart);
  bubble.addEventListener('touchstart', dragStart, { passive: true });

  function dragStart(e) {
    initialX = e.clientX || e.touches[0].clientX;
    initialY = e.clientY || e.touches[0].clientY;
    isDragging = false; 
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
  }

  function drag(e) {
    const currentX = e.clientX || e.touches[0].clientX;
    const currentY = e.clientY || e.touches[0].clientY;
    
    const dx = currentX - initialX;
    const dy = currentY - initialY;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      isDragging = true;
      if (e.cancelable) e.preventDefault();
      
      let newLeft = container.offsetLeft + dx;
      let newTop = container.offsetTop + dy;
      
      container.style.left = newLeft + 'px';
      container.style.top = newTop + 'px';
      container.style.bottom = 'auto';
      container.style.right = 'auto';
      
      initialX = currentX;
      initialY = currentY;
    }
  }

  function dragEnd() {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('touchend', dragEnd);
    
    if (!isDragging) {
      toggleChatWindow();
    }
  }
})();
