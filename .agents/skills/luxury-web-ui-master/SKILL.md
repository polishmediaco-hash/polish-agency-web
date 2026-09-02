---
name: luxury-web-ui-master
description: >-
  Expert guidelines and design architecture for ultra-high-end, luxury tech and B2B web applications.
  Use when designing or optimizing modern glassmorphism, 3D fluid chrome/caustic animations, 
  GPU-accelerated visual dynamics, typography hierarchy, and conversion-focused micro-interactions.
---

# Luxury Web UI Master Skill

This skill defines the technical, visual, and behavioral specifications for building world-class luxury web interfaces matching the aesthetic benchmark of Linear, Apple Pro, and award-winning 3D web experiences.

---

## 1. Core Visual Principles

### 1.1 Smoked Obsidian Canvas & Specular Bevels
* **Base Canvas**: Deep matte void (`#06080C` to `#080A10`) without pure flat black `#000000` clipping.
* **Frosted Translucency**:
  ```css
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(18, 22, 32, 0.45) 30%, rgba(8, 10, 16, 0.7) 100%);
  backdrop-filter: blur(40px) saturate(190%);
  -webkit-backdrop-filter: blur(40px) saturate(190%);
  ```
* **Specular Rim Highlights**:
  ```css
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.35), 
              inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.6), 
              0 30px 80px rgba(0, 0, 0, 0.8), 
              0 0 35px rgba(0, 229, 255, 0.12);
  ```

---

## 2. 3D Liquid Chrome & Caustic Background Engine

### 2.1 Physics & Movement Guidelines
* **Composited GPU Layers**: Always use `transform: translate3d(...) rotate3d(...)` with `will-change: transform`.
* **Zero Main-Thread Blocking**: All ambient rotations and undulations must execute on the CSS compositor thread.
* **Liquid Torus Gradients**:
  ```css
  background: linear-gradient(#08090D, #08090D) padding-box,
              linear-gradient(135deg, #FFFFFF 0%, #A0AAB8 20%, #1A202C 40%, #E2E8F0 60%, #00E5FF 80%, #0088FF 100%) border-box;
  ```
* **Interactive Mouse-Tracking Ambient Caustics**: Subtle, throttled spotlight orbs that track cursor movement smoothly across the dark void.

---

## 3. High-Ticket B2B Ergonomics

1. **Zero Emojis**: Use clean SVG line icons or typography tracking.
2. **Hovering Detached Navigation**: Island headers (`border-radius: 9999px`) with top clearance (`top: 18px`).
3. **Multi-Step Diagnostic Flow**: Progressive disclosure that stores state, validates seamlessly, and guides leads directly to high-conversion endpoints (e.g. WhatsApp / Calendly).
4. **Instant Perceived Speed**: Hardware-accelerated transitions, zero cumulative layout shift (CLS = 0), and preloaded critical assets.
