/**
 * POLISH Media Co. — Interactive 3D Luxury Cosmetic Engine (WebGL / Three.js)
 * 
 * Features:
 *  - Procedural Luxury Cosmetic Pipette Bottle (Concept 1: Golden Ratio Pipette)
 *  - Specular Champagne Gold Cap & Pipette Collar (PBR Metallic Roughness + Clearcoat)
 *  - Translucent Frosted Obsidian Cosmetic Glass with Fresnel Rim Specularity
 *  - Inner Amber Elixir Serum with Suspension Meniscus
 *  - Optically Locked Suspended Faceted Diamond Droplet
 *  - Dynamic Cursor-Tracking Directional Light (Live Specular Glint)
 *  - Inertia-Damped Parallax Tilt & Drag-to-Rotate Interaction
 *  - Zero Performance Waste: Auto-pause when offscreen or tab hidden
 */

(function () {
  'use strict';

  // Check hardware and preference support
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768);

  function initThreeCosmetics() {
    const stageContainer = document.getElementById('hero3dStage');
    if (!stageContainer) return;

    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
      setTimeout(initThreeCosmetics, 100);
      return;
    }

    // Canvas & Stage Sizing
    const width = stageContainer.clientWidth || 420;
    const height = stageContainer.clientHeight || 520;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 7.6);

    // 2. RENDERER (High Performance, Transparent Alpha)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.className = 'three-cosmetics-canvas';
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D POLISH Cosmetic Flacon');
    stageContainer.appendChild(renderer.domElement);

    // 3. LIGHTING SETUP (Haute Atelier Champagne Gold & Noir Ambience)
    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0xF5E6D3, 0.75);
    scene.add(ambientLight);

    // Key Cursor-Reactive Specular Light (Champagne Gold)
    const keyLight = new THREE.DirectionalLight(0xFFF2DC, 2.4);
    keyLight.position.set(3, 5, 5);
    scene.add(keyLight);

    // Rim Silhouette Light (Warm Antique Bronze)
    const rimLight = new THREE.DirectionalLight(0xC5A880, 1.6);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    // Soft Under-Pedestal Point Light
    const bottomGlow = new THREE.PointLight(0xE2C799, 1.2, 8);
    bottomGlow.position.set(0, -2.5, 1);
    scene.add(bottomGlow);

    // 4. PROCEDURAL MATERIALS
    // A. Specular Champagne Gold (Cap, Collar, Rings)
    const goldCapMaterial = new THREE.MeshStandardMaterial({
      color: 0xE2C799,
      metalness: 0.94,
      roughness: 0.14
    });

    // B. Matte Noir Dropper Bulb
    const noirBulbMaterial = new THREE.MeshStandardMaterial({
      color: 0x12100E,
      metalness: 0.1,
      roughness: 0.88
    });

    // C. Translucent Frosted Cosmetic Glass Bottle
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x221D18,
      transparent: true,
      opacity: 0.42,
      roughness: 0.18,
      metalness: 0.08,
      transmission: 0.86,
      ior: 1.52,
      reflectivity: 0.9,
      clearcoat: 0.95,
      clearcoatRoughness: 0.1
    });

    // D. Inner Golden Elixir Serum
    const serumMaterial = new THREE.MeshStandardMaterial({
      color: 0xD4AA6A,
      transparent: true,
      opacity: 0.68,
      roughness: 0.22,
      metalness: 0.2
    });

    // E. Signature Concept 1 Faceted Diamond Droplet
    const dropletMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xFFF7EC,
      emissive: 0xE2C799,
      emissiveIntensity: 0.45,
      roughness: 0.08,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    });

    // 5. CONSTRUCT PROCEDURAL 3D FLACON
    const bottleGroup = new THREE.Group();

    // -- 5.1 Glass Outer Cylinder (Main Body) --
    const glassGeo = new THREE.CylinderGeometry(1.05, 1.05, 2.7, 48);
    const glassMesh = new THREE.Mesh(glassGeo, glassMaterial);
    glassMesh.position.y = -0.45;
    bottleGroup.add(glassMesh);

    // Glass Rounded Base
    const baseGeo = new THREE.SphereGeometry(1.05, 48, 16, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
    const baseMesh = new THREE.Mesh(baseGeo, glassMaterial);
    baseMesh.position.y = -1.8;
    baseMesh.rotation.x = Math.PI;
    bottleGroup.add(baseMesh);

    // Glass Curved Shoulder
    const shoulderGeo = new THREE.CylinderGeometry(0.55, 1.05, 0.45, 48);
    const shoulderMesh = new THREE.Mesh(shoulderGeo, glassMaterial);
    shoulderMesh.position.y = 1.12;
    bottleGroup.add(shoulderMesh);

    // -- 5.2 Inner Liquid Serum Core --
    const serumGeo = new THREE.CylinderGeometry(0.92, 0.92, 2.05, 32);
    const serumMesh = new THREE.Mesh(serumGeo, serumMaterial);
    serumMesh.position.y = -0.72;
    bottleGroup.add(serumMesh);

    // Serum Meniscus Surface
    const meniscusGeo = new THREE.CylinderGeometry(0.92, 0.92, 0.04, 32);
    const meniscusMesh = new THREE.Mesh(meniscusGeo, new THREE.MeshBasicMaterial({ color: 0xF5E6D3, transparent: true, opacity: 0.7 }));
    meniscusMesh.position.y = 0.31;
    bottleGroup.add(meniscusMesh);

    // -- 5.3 Champagne Gold Pipette Collar & Neck --
    // Main Gold Collar Cylinder
    const collarGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.75, 48);
    const collarMesh = new THREE.Mesh(collarGeo, goldCapMaterial);
    collarMesh.position.y = 1.65;
    bottleGroup.add(collarMesh);

    // Specular Gold Base Flange Ring
    const flangeGeo = new THREE.TorusGeometry(0.60, 0.06, 24, 48);
    const flangeMesh = new THREE.Mesh(flangeGeo, goldCapMaterial);
    flangeMesh.position.y = 1.32;
    flangeMesh.rotation.x = Math.PI / 2;
    bottleGroup.add(flangeMesh);

    // Specular Gold Upper Rim Ring
    const upperRimGeo = new THREE.TorusGeometry(0.59, 0.05, 24, 48);
    const upperRimMesh = new THREE.Mesh(upperRimGeo, goldCapMaterial);
    upperRimMesh.position.y = 1.98;
    upperRimMesh.rotation.x = Math.PI / 2;
    bottleGroup.add(upperRimMesh);

    // -- 5.4 Matte Noir Rubber Dropper Bulb --
    const bulbGeo = new THREE.SphereGeometry(0.50, 32, 24);
    bulbGeo.scale(1, 1.45, 1);
    const bulbMesh = new THREE.Mesh(bulbGeo, noirBulbMaterial);
    bulbMesh.position.y = 2.42;
    bottleGroup.add(bulbMesh);

    // -- 5.5 Internal Pipette Glass Tube --
    const tubeGeo = new THREE.CylinderGeometry(0.09, 0.09, 2.8, 16);
    const tubeMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMaterial);
    tubeMesh.position.y = 0.2;
    bottleGroup.add(tubeMesh);

    // -- 5.6 Signature Suspended Faceted Diamond Droplet (Concept 1 Mark) --
    const dropletGroup = new THREE.Group();
    const diamondGeo = new THREE.OctahedronGeometry(0.22, 0);
    diamondGeo.scale(1, 1.5, 1);
    const diamondMesh = new THREE.Mesh(diamondGeo, dropletMaterial);
    dropletGroup.add(diamondMesh);

    // Droplet Subtle Aura Glow Halo
    const auraGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xE2C799,
      transparent: true,
      opacity: 0.18
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    dropletGroup.add(auraMesh);

    dropletGroup.position.set(0, -1.98, 0);
    bottleGroup.add(dropletGroup);

    // -- 5.7 Golden Ambient Orbital Dust Particles --
    const particleCount = 28;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleSpeeds = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.6 + Math.random() * 1.4;
      const angle = Math.random() * Math.PI * 2;
      const py = (Math.random() - 0.5) * 4.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      particleSpeeds.push({
        radius,
        angle,
        y: py,
        speed: 0.002 + Math.random() * 0.005,
        floatSpeed: (Math.random() - 0.5) * 0.003
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xE2C799,
      size: 0.055,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMaterial);
    bottleGroup.add(particles);

    // Center & Scale the Bottle
    bottleGroup.position.set(0, -0.15, 0);
    bottleGroup.rotation.z = -0.06; // Elegant editorial couture tilt
    scene.add(bottleGroup);

    // 6. INTERACTION & PHYSICS STATE
    let targetRotX = 0;
    let targetRotY = 0.35;
    let currentRotX = 0;
    let currentRotY = 0.35;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartRotY = 0;
    let isVisible = true;
    let clock = new THREE.Clock();

    // Mouse Movement Parallax
    function onMouseMove(e) {
      const rect = stageContainer.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (!isDragging) {
        targetRotY = 0.35 + nx * 0.45;
        targetRotX = ny * 0.25;
      }

      // Move key specular light in sync with mouse to produce live metallic gleam
      keyLight.position.x = 3 + nx * 4;
      keyLight.position.y = 5 + ny * 3;
    }

    // Drag-to-Rotate Interaction (Desktop & Touch)
    function onMouseDown(e) {
      isDragging = true;
      dragStartX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      dragStartRotY = targetRotY;
      stageContainer.style.cursor = 'grabbing';
    }

    function onDragMove(e) {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const deltaX = clientX - dragStartX;
      targetRotY = dragStartRotY + (deltaX * 0.012);
    }

    function onDragEnd() {
      if (!isDragging) return;
      isDragging = false;
      stageContainer.style.cursor = 'grab';
    }

    stageContainer.style.cursor = 'grab';
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    stageContainer.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);

    // Touch events for mobile/tablet
    stageContainer.addEventListener('touchstart', onMouseDown, { passive: true });
    window.addEventListener('touchmove', onDragMove, { passive: true });
    window.addEventListener('touchend', onDragEnd);

    // 7. RESPONSIVE RESIZE
    function onWindowResize() {
      const newWidth = stageContainer.clientWidth || 420;
      const newHeight = stageContainer.clientHeight || 520;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    }
    window.addEventListener('resize', onWindowResize, { passive: true });

    // 8. VISIBILITY OBSERVER (Zero GPU waste when scrolled past)
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
        });
      }, { threshold: 0.05 });
      observer.observe(stageContainer);
    }

    document.addEventListener('visibilitychange', () => {
      isVisible = (document.visibilityState === 'visible');
    });

    // 9. ANIMATION LOOP (120FPS GPU-Accelerated)
    function animate() {
      requestAnimationFrame(animate);

      if (!isVisible || document.hidden) return;

      const elapsed = clock.getElapsedTime();

      // Organic Levitation Physics (Sinusoidal Floating)
      if (!prefersReducedMotion) {
        bottleGroup.position.y = -0.15 + Math.sin(elapsed * 1.2) * 0.08;
        
        // Gentle passive idle rotation if not being dragged
        if (!isDragging) {
          targetRotY += 0.0018;
        }

        // Suspended Diamond Droplet Pulse & Rotation
        dropletGroup.rotation.y = elapsed * 0.8;
        dropletGroup.position.y = -1.98 + Math.sin(elapsed * 2.4) * 0.04;

        // Animate Orbiting Gold Particles
        const posAttr = particleGeo.attributes.position;
        for (let i = 0; i < particleCount; i++) {
          const p = particleSpeeds[i];
          p.angle += p.speed;
          p.y += p.floatSpeed;
          if (p.y > 2.5) p.y = -2.5;
          if (p.y < -2.5) p.y = 2.5;

          posAttr.setXYZ(i, Math.cos(p.angle) * p.radius, p.y, Math.sin(p.angle) * p.radius);
        }
        posAttr.needsUpdate = true;
      }

      // Smooth Inertia Damping for Rotation
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;
      bottleGroup.rotation.x = currentRotX;
      bottleGroup.rotation.y = currentRotY;

      renderer.render(scene, camera);
    }

    animate();
    stageContainer.classList.add('is-ready');
  }

  // Initialize once DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreeCosmetics);
  } else {
    initThreeCosmetics();
  }
})();
