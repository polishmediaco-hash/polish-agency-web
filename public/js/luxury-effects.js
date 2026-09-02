/**
 * POLISH Luxury Web UI Engine
 * GPU-Accelerated Mouse Caustic Lighting, 3D Perspective Tilt, and Ambient Physics
 */

(function () {
  'use strict';

  // 1. Mouse Caustic Spotlight Follower
  const mouseCaustic = document.createElement('div');
  mouseCaustic.className = 'mouse-caustic-light';
  document.body.appendChild(mouseCaustic);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('pointermove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function renderCaustic() {
    // Smooth Lerp physics
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;

    mouseCaustic.style.transform = `translate3d(${currentX - 350}px, ${currentY - 350}px, 0)`;
    requestAnimationFrame(renderCaustic);
  }
  requestAnimationFrame(renderCaustic);

  // 2. 3D Card Perspective Tilt
  const tiltCards = document.querySelectorAll('.hero-glass-card, .form-container-shell');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
    }, { passive: true });

    card.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // 3. Subtle Ambient Floating Particles (Zero CPU canvas)
  const canvas = document.createElement('canvas');
  canvas.className = 'ambient-particles-canvas';
  const bgContainer = document.querySelector('.bg-canvas-wrap');
  if (bgContainer) {
    bgContainer.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', function () {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }, { passive: true });

  const particles = Array.from({ length: 35 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.8 + 0.5,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: (Math.random() - 0.5) * 0.3,
    opacity: Math.random() * 0.5 + 0.15
  }));

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 255, ${p.opacity})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00E5FF';
      ctx.fill();
    });

    requestAnimationFrame(animateParticles);
  }
  requestAnimationFrame(animateParticles);
})();
