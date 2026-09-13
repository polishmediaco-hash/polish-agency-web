/**
 * POLISH Board Studio — Multi-Currency Engine (DZD, AED, USD, EUR)
 * Provides bidirectional calibrated conversion presets, currency symbols,
 * and element-level currency transformation for strategy blueprints.
 */

window.CurrencyEngine = (function () {
  'use strict';

  const SUPPORTED_CURRENCIES = ['DZD', 'AED', 'USD', 'EUR'];

  const CURRENCY_PRESETS = [
    { AED: 'AED 75,000', USD: '$ 20,000', EUR: '€ 18,500', DZD: '2,800,000 DZD' },
    { AED: 'AED 800', USD: '$ 250', EUR: '€ 220', DZD: '30,000 DZD' },
    { AED: 'AED 3,250', USD: '$ 900', EUR: '€ 820', DZD: '120,000 DZD' },
    { AED: 'AED 380', USD: '$ 100', EUR: '€ 95', DZD: '14,000 DZD' },
    { AED: 'AED 12,500', USD: '$ 3,400', EUR: '€ 3,100', DZD: '460,000 DZD' },
    { AED: 'AED 25,000', USD: '$ 6,800', EUR: '€ 6,200', DZD: '925,000 DZD' },
    { AED: 'AED 28,000', USD: '$ 7,600', EUR: '€ 7,000', DZD: '1,050,000 DZD' },
    { AED: 'AED 35,500', USD: '$ 9,600', EUR: '€ 8,800', DZD: '1,300,000 DZD' },
    { AED: 'AED 23,000', USD: '$ 6,200', EUR: '€ 5,700', DZD: '850,000 DZD' },
    { AED: 'AED 180,000', USD: '$ 49,000', EUR: '€ 45,000', DZD: '6,600,000 DZD' },
    { AED: 'AED 185,000', USD: '$ 50,000', EUR: '€ 46,000', DZD: '6,800,000 DZD' },
    { AED: 'AED 8,500', USD: '$ 2,300', EUR: '€ 2,100', DZD: '310,000 DZD' },
    { AED: 'AED 15,000', USD: '$ 4,000', EUR: '€ 3,700', DZD: '550,000 DZD' },
    { AED: 'AED 420', USD: '$ 115', EUR: '€ 105', DZD: '15,500 DZD' },
    { AED: 'AED 180', USD: '$ 50', EUR: '€ 45', DZD: '6,600 DZD' },
    { AED: 'AED 4,500', USD: '$ 1,200', EUR: '€ 1,100', DZD: '165,000 DZD' },
    { AED: '267.00', USD: '72.50', EUR: '66.75', DZD: '9,880' },
    { AED: '44.50', USD: '12.00', EUR: '11.10', DZD: '1,650' },
    { AED: '17.80', USD: '4.85', EUR: '4.45', DZD: '660' },
    { AED: '0.80', USD: '0.22', EUR: '0.20', DZD: '30' }
  ];

  const CURRENCY_SYMBOLS = {
    AED: 'AED',
    USD: '$',
    EUR: '€',
    DZD: 'DZD'
  };

  function formatConvertedText(text, targetCurrency) {
    if (!text || typeof text !== 'string') return text;
    let res = text;

    // 1. Calibrated Presets Check (bidirectional across all currencies)
    for (const set of CURRENCY_PRESETS) {
      for (const [cur, val] of Object.entries(set)) {
        if (res.includes(val)) {
          res = res.split(val).join(set[targetCurrency]);
        }
      }
    }

    // 2. Generic Currency Headers and Symbols
    const sym = CURRENCY_SYMBOLS[targetCurrency] || targetCurrency;
    res = res.replace(/\((?:AED|USD|\$|EUR|€|DZD|DA)\)/gi, `(${sym})`);
    return res;
  }

  function applyCurrencyToElements(elements, currency) {
    if (!Array.isArray(elements)) return;
    elements.forEach(el => {
      if (el.type === 'metric') {
        el.currency = currency;
        if (el.figure) el.figure = formatConvertedText(el.figure, currency);
        if (el.subtitle) el.subtitle = formatConvertedText(el.subtitle, currency);
      } else if (el.type === 'pricing') {
        el.currency = (currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency);
        if (el.figure) el.figure = formatConvertedText(el.figure, currency).replace(/[^0-9,.]/g, '');
        if (el.totalValue) el.totalValue = formatConvertedText(el.totalValue, currency);
        if (el.price) el.price = formatConvertedText(el.price, currency);
        if (el.savings) el.savings = formatConvertedText(el.savings, currency);
      } else if (el.type === 'table') {
        if (Array.isArray(el.headers)) {
          el.headers = el.headers.map(h => formatConvertedText(h, currency));
        }
        if (Array.isArray(el.rows)) {
          el.rows = el.rows.map(row => row.map(cell => formatConvertedText(cell, currency)));
        }
      } else if (el.type === 'prescription') {
        if (el.fee) el.fee = formatConvertedText(el.fee, currency);
        if (Array.isArray(el.stages)) {
          el.stages = el.stages.map(st => {
            if (st.desc) st.desc = formatConvertedText(st.desc, currency);
            return st;
          });
        }
      } else if (el.type === 'diagnostic-protocol') {
        if (Array.isArray(el.stages)) {
          el.stages = el.stages.map(st => {
            if (st.desc) st.desc = formatConvertedText(st.desc, currency);
            return st;
          });
        }
      }
    });
  }

  return {
    SUPPORTED_CURRENCIES,
    CURRENCY_PRESETS,
    CURRENCY_SYMBOLS,
    formatConvertedText,
    applyCurrencyToElements
  };
})();
