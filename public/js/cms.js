// POLISH Dynamic CMS Content Hydration Engine
(function() {
  async function loadDynamicContent() {
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !data.content) return;
      
      const c = data.content;
      
      // Hero
      if (c.hero) {
        setElemText("[data-cms='hero-windowTag']", c.hero.windowTag);
        setElemText("[data-cms='hero-eyebrow']", c.hero.eyebrow);
        setElemText("[data-cms='hero-headlineLine1']", c.hero.headlineLine1);
        setElemText("[data-cms='hero-headlineLine2']", c.hero.headlineLine2);
        setElemText("[data-cms='hero-description']", c.hero.description);
        setElemText("[data-cms='hero-microTrust']", c.hero.microTrust);
        if (c.hero.ctaText) {
          document.querySelectorAll("[data-cms='hero-ctaText']").forEach(el => {
            // Keep child SVG icon intact if present
            const svg = el.querySelector("svg");
            el.childNodes[0].nodeValue = c.hero.ctaText + " ";
          });
        }
      }
      
      // Agitation
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
      
      // Pillars
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
      
      // Creators
      if (c.creators) {
        setElemText("[data-cms='creators-eyebrow']", c.creators.eyebrow);
        setElemText("[data-cms='creators-headline']", c.creators.headline);
        setElemText("[data-cms='creators-description']", c.creators.description);
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
