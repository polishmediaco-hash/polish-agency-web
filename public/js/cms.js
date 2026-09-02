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
        const dict = window.POLISH_TRANSLATIONS.en;
        
        if (c.hero) {
          if (c.hero.windowTag) dict["hero.windowTag"] = c.hero.windowTag;
          if (c.hero.eyebrow) dict["hero.eyebrow"] = c.hero.eyebrow;
          if (c.hero.headlineLine1) dict["hero.headlineLine1"] = c.hero.headlineLine1;
          if (c.hero.headlineLine2) dict["hero.headlineLine2"] = c.hero.headlineLine2;
          if (c.hero.description) dict["hero.description"] = c.hero.description;
          if (c.hero.ctaText) { dict["hero.cta"] = c.hero.ctaText; dict["header.cta"] = c.hero.ctaText; }
          if (c.hero.microTrust) dict["hero.microTrust"] = c.hero.microTrust;
        }

        if (c.agitation) {
          if (c.agitation.eyebrow) dict["agit.eyebrow"] = c.agitation.eyebrow;
          if (c.agitation.headlineLine1) dict["agit.headlineLine1"] = c.agitation.headlineLine1;
          if (c.agitation.headlineLine2) dict["agit.headlineLine2"] = c.agitation.headlineLine2;
          if (c.agitation.description) dict["agit.description"] = c.agitation.description;
          if (c.agitation.cards) {
            c.agitation.cards.forEach((card, idx) => {
              if (card.tag) dict[`agit.card${idx}.tag`] = card.tag;
              if (card.title) dict[`agit.card${idx}.title`] = card.title;
              if (card.desc) dict[`agit.card${idx}.desc`] = card.desc;
            });
          }
        }

        if (c.pillars) {
          if (c.pillars.eyebrow) dict["pillars.eyebrow"] = c.pillars.eyebrow;
          if (c.pillars.headlineLine1) dict["pillars.headlineLine1"] = c.pillars.headlineLine1;
          if (c.pillars.headlineLine2) dict["pillars.headlineLine2"] = c.pillars.headlineLine2;
          if (c.pillars.items) {
            c.pillars.items.forEach((item, idx) => {
              if (item.title) dict[`pillars.item${idx}.title`] = item.title;
              if (item.desc) dict[`pillars.item${idx}.desc`] = item.desc;
            });
          }
        }

        if (c.creators) {
          if (c.creators.eyebrow) dict["creators.eyebrow"] = c.creators.eyebrow;
          if (c.creators.headline) dict["creators.h1"] = c.creators.headline;
          if (c.creators.description) dict["creators.p"] = c.creators.description;
        }

        // Apply whichever language is currently selected
        if (window.polishI18n) {
          window.polishI18n.applyLanguage(window.polishI18n.currentLang);
        }
      } else {
        // Fallback DOM setter
        if (c.hero) {
          setElemText("[data-cms='hero-windowTag']", c.hero.windowTag);
          setElemText("[data-cms='hero-eyebrow']", c.hero.eyebrow);
          setElemText("[data-cms='hero-headlineLine1']", c.hero.headlineLine1);
          setElemText("[data-cms='hero-headlineLine2']", c.hero.headlineLine2);
          setElemText("[data-cms='hero-description']", c.hero.description);
          setElemText("[data-cms='hero-microTrust']", c.hero.microTrust);
          if (c.hero.ctaText) setElemText("[data-cms='hero-ctaText']", c.hero.ctaText);
        }
        if (c.agitation) {
          setElemText("[data-cms='agitation-eyebrow']", c.agitation.eyebrow);
          setElemText("[data-cms='agitation-headlineLine1']", c.agitation.headlineLine1);
          setElemText("[data-cms='agitation-headlineLine2']", c.agitation.headlineLine2);
          setElemText("[data-cms='agitation-description']", c.agitation.description);
          if (c.agitation.cards) {
            c.agitation.cards.forEach((card, idx) => {
              setElemText(`[data-cms='agitation-card${idx}-tag']`, card.tag);
              setElemText(`[data-cms='agitation-card${idx}-title']`, card.title);
              setElemText(`[data-cms='agitation-card${idx}-desc']`, card.desc);
            });
          }
        }
        if (c.pillars) {
          setElemText("[data-cms='pillars-eyebrow']", c.pillars.eyebrow);
          setElemText("[data-cms='pillars-headlineLine1']", c.pillars.headlineLine1);
          setElemText("[data-cms='pillars-headlineLine2']", c.pillars.headlineLine2);
          if (c.pillars.items) {
            c.pillars.items.forEach((item, idx) => {
              setElemText(`[data-cms='pillars-item${idx}-title']`, item.title);
              setElemText(`[data-cms='pillars-item${idx}-desc']`, item.desc);
            });
          }
        }
        if (c.creators) {
          setElemText("[data-cms='creators-eyebrow']", c.creators.eyebrow);
          setElemText("[data-cms='creators-headline']", c.creators.headline);
          setElemText("[data-cms='creators-description']", c.creators.description);
        }
      }
    } catch(err) {
      console.debug("[POLISH CMS] Static markup preserved.", err);
    }
  }

  function setElemText(selector, text) {
    if (!text) return;
    document.querySelectorAll(selector).forEach(el => {
      el.textContent = text;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadDynamicContent);
  } else {
    loadDynamicContent();
  }
})();
