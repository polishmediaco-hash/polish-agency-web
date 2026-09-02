---
name: clean-code-and-performance-optimizer
description: Professional Code Cleanup, Optimization, and Production Deployment Preparation Skill for Web Applications.
---

# Clean Code & Production Performance Optimization Skill

This skill provides a standardized, rigorous workflow for auditing web applications, eliminating dead/redundant code, optimizing client-side runtime performance (FPS, memory leaks, layout thrashing), minimizing bundle sizes, and preparing projects for ultra-fast production deployment.

## 1. Static Code Cleanup Protocol
- **Dead Code Elimination**: Identify and remove unused CSS selectors, obsolete JavaScript functions, orphaned HTML tags, and redundant wrapper elements.
- **Redundant Style Merging**: Consolidate repetitive margin, padding, color, and media query declarations into clean CSS custom properties (variables) or utility classes.
- **HTML DOM Density**: Ensure shallow DOM hierarchy (< 800 total DOM nodes per page) for instant paint times and low memory consumption on mobile devices.

## 2. Runtime & Rendering Performance Optimization
- **Animation & Paint Efficiency**:
  - Use `transform` and `opacity` exclusively for animations (compositor thread).
  - Avoid animating `top`, `left`, `margin`, `padding`, `width`, or `height` (which trigger CPU layout recalculations and browser reflows).
  - Apply `will-change: transform, opacity` prudently on animated elements, removing it when idle.
- **Event Listener Hygiene**:
  - Throttle or debounce `scroll`, `resize`, and `mousemove` events using `requestAnimationFrame` or timestamp pacing.
  - Use `{ passive: true }` on touch and wheel event listeners to guarantee 60fps/120fps scrolling.
- **Script Execution & Resource Hints**:
  - Mark non-critical JavaScript with `defer` or `type="module"`.
  - Add `rel="preconnect"` and `rel="dns-prefetch"` for critical third-party CDNs (e.g. Google Fonts).
  - Ensure high-priority assets (above-the-fold logo) use `fetchpriority="high"`.

## 3. Automated Performance Verification Checklist
Run automated audits across the following metrics:
1. **First Contentful Paint (FCP)**: Target < 1.0s
2. **Largest Contentful Paint (LCP)**: Target < 1.8s
3. **Cumulative Layout Shift (CLS)**: Target < 0.05
4. **Interaction to Next Paint (INP) / First Input Delay (FID)**: Target < 100ms
5. **Total Page Weight**: Target < 500KB (compressed)
6. **Scroll Frame Drops**: 0 dropped frames during continuous 60fps scrolling.

## 4. Production Deployment Verification
- Verify zero 404s, broken links, or unhandled console errors.
- Confirm all APIs are secured with proper authentication and error handling.
- Verify full internationalization consistency across all supported locales (LTR and RTL).
