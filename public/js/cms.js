// POLISH Dynamic CMS Content Hydration Engine
(function() {
  async function loadDynamicContent() {
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !data.content) return;
      
      const c = data.content;
      
      // Update the English translation dictionary with CMS edits
      if (window.POLISH_TRANSLATIONS && window.POLISH_TRANSLATIONS.en) {
        const dictEN = window.POLISH_TRANSLATIONS.en;
        
        if (c.hero) {
          if (c.hero.windowTag) dictEN["hero.windowTag"] = c.hero.windowTag;
          if (c.hero.eyebrow) dictEN["hero.eyebrow"] = c.hero.eyebrow;
          if (c.hero.headlineLine1) dictEN["hero.headlineLine1"] = c.hero.headlineLine1;
          if (c.hero.headlineLine2) dictEN["hero.headlineLine2"] = c.hero.headlineLine2;
          if (c.hero.description) dictEN["hero.description"] = c.hero.description;
          if (c.hero.ctaText) { dictEN["hero.cta"] = c.hero.ctaText; dictEN["header.cta"] = c.hero.ctaText; }
          if (c.hero.microTrust) dictEN["hero.microTrust"] = c.hero.microTrust;
        }

        if (c.agitation) {
          if (c.agitation.eyebrow) dictEN["agit.eyebrow"] = c.agitation.eyebrow;
          if (c.agitation.headlineLine1) dictEN["agit.headlineLine1"] = c.agitation.headlineLine1;
          if (c.agitation.headlineLine2) dictEN["agit.headlineLine2"] = c.agitation.headlineLine2;
          if (c.agitation.description) dictEN["agit.description"] = c.agitation.description;
          if (c.agitation.cards) {
            c.agitation.cards.forEach((card, idx) => {
              if (card.tag) dictEN[`agit.card${idx}.tag`] = card.tag;
              if (card.title) dictEN[`agit.card${idx}.title`] = card.title;
              if (card.desc) dictEN[`agit.card${idx}.desc`] = card.desc;
            });
          }
        }

        if (c.pillars) {
          if (c.pillars.eyebrow) dictEN["pillars.eyebrow"] = c.pillars.eyebrow;
          if (c.pillars.headlineLine1) dictEN["pillars.headlineLine1"] = c.pillars.headlineLine1;
          if (c.pillars.headlineLine2) dictEN["pillars.headlineLine2"] = c.pillars.headlineLine2;
          if (c.pillars.items) {
            c.pillars.items.forEach((item, idx) => {
              if (item.title) dictEN[`pillars.item${idx}.title`] = item.title;
              if (item.desc) dictEN[`pillars.item${idx}.desc`] = item.desc;
            });
          }
        }

        if (c.creators) {
          if (c.creators.eyebrow) dictEN["creators.eyebrow"] = c.creators.eyebrow;
          if (c.creators.headline) dictEN["creators.h1"] = c.creators.headline;
          if (c.creators.description) dictEN["creators.p"] = c.creators.description;
        }
      }

      // Update the French translation dictionary with CMS edits
      if (window.POLISH_TRANSLATIONS && window.POLISH_TRANSLATIONS.fr && c.fr) {
        const dictFR = window.POLISH_TRANSLATIONS.fr;
        const fr = c.fr;

        if (fr.hero) {
          if (fr.hero.windowTag) dictFR["hero.windowTag"] = fr.hero.windowTag;
          if (fr.hero.eyebrow) dictFR["hero.eyebrow"] = fr.hero.eyebrow;
          if (fr.hero.headlineLine1) dictFR["hero.headlineLine1"] = fr.hero.headlineLine1;
          if (fr.hero.headlineLine2) dictFR["hero.headlineLine2"] = fr.hero.headlineLine2;
          if (fr.hero.description) dictFR["hero.description"] = fr.hero.description;
          if (fr.hero.ctaText) { dictFR["hero.cta"] = fr.hero.ctaText; dictFR["header.cta"] = fr.hero.ctaText; }
          if (fr.hero.microTrust) dictFR["hero.microTrust"] = fr.hero.microTrust;
        }

        if (fr.agitation) {
          if (fr.agitation.eyebrow) dictFR["agit.eyebrow"] = fr.agitation.eyebrow;
          if (fr.agitation.headlineLine1) dictFR["agit.headlineLine1"] = fr.agitation.headlineLine1;
          if (fr.agitation.headlineLine2) dictFR["agit.headlineLine2"] = fr.agitation.headlineLine2;
          if (fr.agitation.description) dictFR["agit.description"] = fr.agitation.description;
          if (fr.agitation.cards) {
            fr.agitation.cards.forEach((card, idx) => {
              if (card.tag) dictFR[`agit.card${idx}.tag`] = card.tag;
              if (card.title) dictFR[`agit.card${idx}.title`] = card.title;
              if (card.desc) dictFR[`agit.card${idx}.desc`] = card.desc;
            });
          }
        }

        if (fr.pillars) {
          if (fr.pillars.eyebrow) dictFR["pillars.eyebrow"] = fr.pillars.eyebrow;
          if (fr.pillars.headlineLine1) dictFR["pillars.headlineLine1"] = fr.pillars.headlineLine1;
          if (fr.pillars.headlineLine2) dictFR["pillars.headlineLine2"] = fr.pillars.headlineLine2;
          if (fr.pillars.items) {
            fr.pillars.items.forEach((item, idx) => {
              if (item.title) dictFR[`pillars.item${idx}.title`] = item.title;
              if (item.desc) dictFR[`pillars.item${idx}.desc`] = item.desc;
            });
          }
        }

        if (fr.creators) {
          if (fr.creators.eyebrow) dictFR["creators.eyebrow"] = fr.creators.eyebrow;
          if (fr.creators.headline) dictFR["creators.h1"] = fr.creators.headline;
          if (fr.creators.description) dictFR["creators.p"] = fr.creators.description;
        }
      }

      // Sync WhatsApp messages
      if (c.whatsapp && window.POLISH_WHATSAPP_CONFIG) {
        if (c.whatsapp.en_default) window.POLISH_WHATSAPP_CONFIG.en.defaultMessage = c.whatsapp.en_default;
        if (c.whatsapp.fr_default) window.POLISH_WHATSAPP_CONFIG.fr.defaultMessage = c.whatsapp.fr_default;
        if (typeof renderWhatsAppContent === "function") {
          renderWhatsAppContent();
        }
      }

      // Re-apply language
      if (window.polishI18n) {
        window.polishI18n.applyLanguage(window.polishI18n.currentLang);
      }
    } catch(err) {
      console.debug("[POLISH CMS] Static markup preserved.", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadDynamicContent);
  } else {
    loadDynamicContent();
  }
})();
