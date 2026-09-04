// POLISH Dynamic CMS Content Hydration Engine (EN / FR / AR)
(function() {
  async function loadDynamicContent() {
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !data.content) return;
      
      const c = data.content;
      
      // 1. Update English Dictionary
      if (window.POLISH_TRANSLATIONS && window.POLISH_TRANSLATIONS.en) {
        const dictEN = window.POLISH_TRANSLATIONS.en;
        
        if (c.hero) {
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
          if (c.creators.headline) dictEN["creators.h1"] = c.creators.headline;
          if (c.creators.h1Line1) dictEN["creators.h1Line1"] = c.creators.h1Line1;
          if (c.creators.h1Line2) { dictEN["creators.h1Line2"] = c.creators.h1Line2; dictEN["creators.h1Accent"] = c.creators.h1Line2; }
          if (c.creators.ctaText) dictEN["creators.btnSubmit"] = c.creators.ctaText;
          if (c.creators.trustReview) dictEN["creators.trustReview"] = c.creators.trustReview;
        }

        if (c.apply) {
          if (c.apply.h1Line1) dictEN["apply.h1Line1"] = c.apply.h1Line1;
          if (c.apply.h1Line2) dictEN["apply.h1Line2"] = c.apply.h1Line2;
          if (c.apply.ctaText) dictEN["apply.btnSubmit"] = c.apply.ctaText;
        }
      }

      // 2. Update French Dictionary
      if (window.POLISH_TRANSLATIONS && window.POLISH_TRANSLATIONS.fr && c.fr) {
        const dictFR = window.POLISH_TRANSLATIONS.fr;
        const fr = c.fr;

        if (fr.hero) {
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
          if (fr.creators.headline) dictFR["creators.h1"] = fr.creators.headline;
          if (fr.creators.h1Line1) dictFR["creators.h1Line1"] = fr.creators.h1Line1;
          if (fr.creators.h1Line2) { dictFR["creators.h1Line2"] = fr.creators.h1Line2; dictFR["creators.h1Accent"] = fr.creators.h1Line2; }
          if (fr.creators.ctaText) dictFR["creators.btnSubmit"] = fr.creators.ctaText;
          if (fr.creators.trustReview) dictFR["creators.trustReview"] = fr.creators.trustReview;
        }

        if (fr.apply) {
          if (fr.apply.h1Line1) dictFR["apply.h1Line1"] = fr.apply.h1Line1;
          if (fr.apply.h1Line2) dictFR["apply.h1Line2"] = fr.apply.h1Line2;
          if (fr.apply.ctaText) dictFR["apply.btnSubmit"] = fr.apply.ctaText;
        }
      }

      // 3. Update Arabic Dictionary
      if (window.POLISH_TRANSLATIONS && window.POLISH_TRANSLATIONS.ar && c.ar) {
        const dictAR = window.POLISH_TRANSLATIONS.ar;
        const ar = c.ar;

        if (ar.hero) {
          if (ar.hero.headlineLine1) dictAR["hero.headlineLine1"] = ar.hero.headlineLine1;
          if (ar.hero.headlineLine2) dictAR["hero.headlineLine2"] = ar.hero.headlineLine2;
          if (ar.hero.description) dictAR["hero.description"] = ar.hero.description;
          if (ar.hero.ctaText) { dictAR["hero.cta"] = ar.hero.ctaText; dictAR["header.cta"] = ar.hero.ctaText; }
          if (ar.hero.microTrust) dictAR["hero.microTrust"] = ar.hero.microTrust;
        }

        if (ar.agitation) {
          if (ar.agitation.eyebrow) dictAR["agit.eyebrow"] = ar.agitation.eyebrow;
          if (ar.agitation.headlineLine1) dictAR["agit.headlineLine1"] = ar.agitation.headlineLine1;
          if (ar.agitation.headlineLine2) dictAR["agit.headlineLine2"] = ar.agitation.headlineLine2;
          if (ar.agitation.description) dictAR["agit.description"] = ar.agitation.description;
          if (ar.agitation.cards) {
            ar.agitation.cards.forEach((card, idx) => {
              if (card.tag) dictAR[`agit.card${idx}.tag`] = card.tag;
              if (card.title) dictAR[`agit.card${idx}.title`] = card.title;
              if (card.desc) dictAR[`agit.card${idx}.desc`] = card.desc;
            });
          }
        }

        if (ar.pillars) {
          if (ar.pillars.eyebrow) dictAR["pillars.eyebrow"] = ar.pillars.eyebrow;
          if (ar.pillars.headlineLine1) dictAR["pillars.headlineLine1"] = ar.pillars.headlineLine1;
          if (ar.pillars.headlineLine2) dictAR["pillars.headlineLine2"] = ar.pillars.headlineLine2;
          if (ar.pillars.items) {
            ar.pillars.items.forEach((item, idx) => {
              if (item.title) dictAR[`pillars.item${idx}.title`] = item.title;
              if (item.desc) dictAR[`pillars.item${idx}.desc`] = item.desc;
            });
          }
        }

        if (ar.creators) {
          if (ar.creators.headline) dictAR["creators.h1"] = ar.creators.headline;
          if (ar.creators.h1Line1) dictAR["creators.h1Line1"] = ar.creators.h1Line1;
          if (ar.creators.h1Line2) { dictAR["creators.h1Line2"] = ar.creators.h1Line2; dictAR["creators.h1Accent"] = ar.creators.h1Line2; }
          if (ar.creators.ctaText) dictAR["creators.btnSubmit"] = ar.creators.ctaText;
          if (ar.creators.trustReview) dictAR["creators.trustReview"] = ar.creators.trustReview;
        }

        if (ar.apply) {
          if (ar.apply.h1Line1) dictAR["apply.h1Line1"] = ar.apply.h1Line1;
          if (ar.apply.h1Line2) dictAR["apply.h1Line2"] = ar.apply.h1Line2;
          if (ar.apply.ctaText) dictAR["apply.btnSubmit"] = ar.apply.ctaText;
        }
      }

      // 4. Sync WhatsApp Configuration
      if (c.whatsapp && window.POLISH_WHATSAPP_CONFIG) {
        if (c.whatsapp.en_default) window.POLISH_WHATSAPP_CONFIG.en.defaultMessage = c.whatsapp.en_default;
        if (c.whatsapp.fr_default) window.POLISH_WHATSAPP_CONFIG.fr.defaultMessage = c.whatsapp.fr_default;
        if (c.whatsapp.ar_default && window.POLISH_WHATSAPP_CONFIG.ar) window.POLISH_WHATSAPP_CONFIG.ar.defaultMessage = c.whatsapp.ar_default;
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
