/**
 * POLISH Board Studio — High-Performance Pub/Sub Event Bus
 * 
 * Decouples the 10 Board Studio engines (Canvas Pan/Zoom, Drawing Engine,
 * Marquee Selection, Minimap Radar, Elements Factory, Connector Engine,
 * Floating Inspector, Presentation Mode, Currency Engine, and Studio Core)
 * by replacing hardcoded cross-engine method invocations with a unified,
 * zero-dependency typed event pipeline.
 */

window.StudioEvents = (function () {
  'use strict';

  const listeners = new Map();

  const Events = Object.freeze({
    // Viewport & Canvas
    VIEWPORT_CHANGED: 'viewport:changed',       // { panX, panY, scale }
    MINIMAP_UPDATE: 'minimap:update',           // {}

    // Board Lifecycle
    BOARD_LOADED: 'board:loaded',               // { board }
    BOARD_SAVED: 'board:saved',                 // { board }

    // Elements
    ELEMENT_SELECTED: 'element:selected',       // { el, data }
    ELEMENT_DESELECTED: 'element:deselected',   // {}
    ELEMENT_MOVED: 'element:moved',             // { id, el, x, y, dx, dy }
    ELEMENT_RESIZED: 'element:resized',         // { id, el, width, height }
    ELEMENT_MUTATED: 'element:mutated',         // { id, data, property, value }
    ELEMENT_CREATED: 'element:created',         // { id, data }
    ELEMENT_DELETED: 'element:deleted',         // { id }
    SELECTION_CHANGED: 'selection:changed',     // { selectedIds }

    // Connectors
    CONNECTION_SELECTED: 'connection:selected', // { conn, labelPill }
    CONNECTION_UPDATED: 'connection:updated',   // {}
    CONNECTION_CREATED: 'connection:created',   // { conn }
    CONNECTION_DELETED: 'connection:deleted',   // { id }

    // Studio Environment & State
    THEME_CHANGED: 'theme:changed',             // { theme, isDark }
    CURRENCY_CHANGED: 'currency:changed',       // { currency, symbol }
    TOOL_CHANGED: 'tool:changed',               // { activeTool }
    HISTORY_PUSHED: 'history:pushed',           // { canUndo, canRedo }
    PRESENTATION_ENTER: 'presentation:enter',   // {}
    PRESENTATION_EXIT: 'presentation:exit'      // {}
  });

  function on(event, callback) {
    if (typeof callback !== 'function') return () => {};
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event).add(callback);
    return () => off(event, callback);
  }

  function off(event, callback) {
    if (!listeners.has(event)) return;
    listeners.get(event).delete(callback);
    if (listeners.get(event).size === 0) {
      listeners.delete(event);
    }
  }

  function once(event, callback) {
    if (typeof callback !== 'function') return () => {};
    const unbind = on(event, (data) => {
      unbind();
      callback(data);
    });
    return unbind;
  }

  function emit(event, data) {
    if (!listeners.has(event)) return;
    listeners.get(event).forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error(`[StudioEvents] Error executing handler for "${event}":`, err);
      }
    });
  }

  function clear(event) {
    if (event) {
      listeners.delete(event);
    } else {
      listeners.clear();
    }
  }

  function hasListeners(event) {
    return listeners.has(event) && listeners.get(event).size > 0;
  }

  return {
    on,
    off,
    once,
    emit,
    clear,
    hasListeners,
    Events
  };
})();
