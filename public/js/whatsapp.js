/**
 * POLISH Floating WhatsApp Integration Widget
 * Direct Number: +213 662 41 77 61 -> 213662417761
 */

const POLISH_WHATSAPP_CONFIG = {
  number: '213662417761',
  en: {
    defaultMessage: "Hi POLISH Media team, I'm reaching out regarding scaling my cosmetics & beauty brand. Let's discuss a growth partnership.",
    title: "POLISH Growth Team",
    status: "● Online | Direct WhatsApp",
    headline: "Welcome to POLISH.",
    body: "Looking to scale your cosmetic line, overhaul creator UGC, or launch a breakthrough SKU? Connect directly with our lead growth strategist on WhatsApp.",
    btn: "Chat on WhatsApp"
  },
  fr: {
    defaultMessage: "Bonjour l'équipe POLISH, je vous contacte au sujet du développement de ma marque cosmétique. Échangeons sur un partenariat de croissance.",
    title: "Équipe de Croissance POLISH",
    status: "● En ligne | WhatsApp Direct",
    headline: "Bienvenue chez POLISH.",
    body: "Vous souhaitez développer votre marque cosmétique, structurer vos créateurs UGC ou lancer un nouveau soin ? Échangez directement avec notre direction sur WhatsApp.",
    btn: "Discuter sur WhatsApp"
  },
  ar: {
    defaultMessage: "مرحباً فريق POLISH، أتواصل معكم بخصوص تسريع ونمو علامتي التجارية في مجال التجميل والعناية. يسعدني مناقشة شراكة نمو معكم.",
    title: "فريق نمو POLISH",
    status: "● متصل الآن | واتساب مباشر",
    headline: "أهلاً بك في POLISH.",
    body: "هل تبحث عن مضاعفة مبيعات علامتك التجميلية، أو تطوير محتوى UGC من المبدعين، أو إطلاق مستحضر جديد؟ تواصل مباشرة مع إدارة الاستراتيجية لدينا عبر واتساب.",
    btn: "تحدث معنا عبر واتساب"
  }
};

function renderWhatsAppContent() {
  const currentLang = (window.polishI18n && window.polishI18n.currentLang) || 'en';
  const lang = POLISH_WHATSAPP_CONFIG[currentLang] ? currentLang : 'en';
  const c = POLISH_WHATSAPP_CONFIG[lang];
  const encodedMsg = encodeURIComponent(c.defaultMessage);
  const waUrl = `https://wa.me/${POLISH_WHATSAPP_CONFIG.number}?text=${encodedMsg}`;

  const drawer = document.getElementById('waChatDrawer');
  if (!drawer) return;

  drawer.innerHTML = `
    <div class="wa-header">
      <div style="display:flex; align-items:center; gap:8px;">
        <div class="wa-avatar">P</div>
        <div>
          <div class="wa-title">${c.title}</div>
          <div class="wa-status">${c.status}</div>
        </div>
      </div>
      <button class="wa-close-btn" id="waCloseBtn" title="Close" aria-label="Close Chat">×</button>
    </div>
    <div class="wa-message-bubble">
      <strong>${c.headline}</strong><br>
      ${c.body}
    </div>
    <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="wa-btn-send" id="waDirectChatLink">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
      </svg>
      ${c.btn}
    </a>
  `;

  const closeBtn = document.getElementById('waCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      drawer.classList.remove('open');
    });
  }
}

function initWhatsAppWidget() {
  if (document.getElementById('polishWhatsAppWidget')) return;

  const container = document.createElement('div');
  container.className = 'whatsapp-float-container';
  container.id = 'polishWhatsAppWidget';

  container.innerHTML = `
    <!-- Quick Chat Drawer -->
    <div class="whatsapp-chat-box" id="waChatDrawer"></div>

    <!-- Floating Trigger Bubble with Dual Concentric Sonar Pulse Waves -->
    <div class="whatsapp-trigger-wrap">
      <div class="whatsapp-radar-ring"></div>
      <div class="whatsapp-radar-ring-2"></div>
      <button class="whatsapp-trigger-btn" id="waTriggerBtn" aria-label="Chat with POLISH on WhatsApp (+213 662 41 77 61)">
        <span class="whatsapp-online-dot"></span>
        <svg viewBox="0 0 24 24">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z"/>
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(container);

  renderWhatsAppContent();

  const triggerBtn = document.getElementById('waTriggerBtn');
  const chatDrawer = document.getElementById('waChatDrawer');

  triggerBtn.addEventListener('click', () => {
    const currentLang = (window.polishI18n && window.polishI18n.currentLang) || 'en';
    const lang = POLISH_WHATSAPP_CONFIG[currentLang] ? currentLang : 'en';
    const c = POLISH_WHATSAPP_CONFIG[lang];
    const encodedMsg = encodeURIComponent(c.defaultMessage);
    const waUrl = `https://wa.me/${POLISH_WHATSAPP_CONFIG.number}?text=${encodedMsg}`;

    if (window.innerWidth <= 768) {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } else {
      chatDrawer.classList.toggle('open');
    }
  });

  window.addEventListener('polishLanguageChanged', () => {
    renderWhatsAppContent();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWhatsAppWidget);
} else {
  initWhatsAppWidget();
}
