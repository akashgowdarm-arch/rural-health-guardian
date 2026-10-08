import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const ThreeDHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a192f, 0.025);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.5);
    camera.lookAt(0, 0.5, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      container.appendChild(renderer.domElement);
    } catch {
      setWebGLSupported(false);
      return;
    }

    // Lighting: Sun & Atmosphere
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Warm Sun Directional Light in Solar Orange Tone
    const sunLight = new THREE.DirectionalLight(0xff9a3c, 2.8);
    sunLight.position.set(5, 8, 4);
    scene.add(sunLight);

    // Cool Sky Fill Light in SOCIO Blue Tone
    const blueFillLight = new THREE.DirectionalLight(0x0284c7, 1.4);
    blueFillLight.position.set(-6, 4, -2);
    scene.add(blueFillLight);

    // Create 3D Solar Panel Rows
    const panelGroup = new THREE.Group();

    // Procedural Photovoltaic Texture (Deep Navy-Blue Silicon with Cell Grids)
    const createPVTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Deep blue silicon base
        ctx.fillStyle = '#061a38';
        ctx.fillRect(0, 0, 512, 512);

        // Subtle gradient sheen
        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, 'rgba(2, 88, 166, 0.7)');
        grad.addColorStop(0.5, 'rgba(6, 26, 56, 0.9)');
        grad.addColorStop(1, 'rgba(10, 40, 80, 0.8)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Solar cell busbars & gridlines (silver/white)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.5;

        // 6 columns of cells
        for (let x = 0; x <= 512; x += 85.3) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 512);
          ctx.stroke();
        }

        // 10 rows of cells
        for (let y = 0; y <= 512; y += 51.2) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(512, y);
          ctx.stroke();
        }

        // Main primary busbar ribbons (Solar Orange & Silver accent)
        ctx.strokeStyle = '#f36f21';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(128, 0);
        ctx.lineTo(128, 512);
        ctx.moveTo(256, 0);
        ctx.lineTo(256, 512);
        ctx.moveTo(384, 0);
        ctx.lineTo(384, 512);
        ctx.stroke();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const pvTexture = createPVTexture();
    pvTexture.wrapS = THREE.RepeatWrapping;
    pvTexture.wrapT = THREE.RepeatWrapping;

    const panelMaterial = new THREE.MeshStandardMaterial({
      map: pvTexture,
      roughness: 0.25,
      metalness: 0.75,
    });

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xd8e3ee,
      roughness: 0.3,
      metalness: 0.85,
    });

    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.5,
      metalness: 0.6,
    });

    const panelWidth = 1.6;
    const panelHeight = 0.95;
    const panelThickness = 0.04;

    const panelGeometry = new THREE.BoxGeometry(panelWidth, panelThickness, panelHeight);
    const frameGeometry = new THREE.BoxGeometry(panelWidth + 0.04, panelThickness * 0.9, panelHeight + 0.04);
    const legGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.8, 8);

    // Build 3 Rows of Solar Panels
    const rows = 3;
    const cols = 4;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const singlePanel = new THREE.Group();

        // Frame
        const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
        singlePanel.add(frameMesh);

        // Silicon face
        const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial);
        panelMesh.position.y = 0.01;
        singlePanel.add(panelMesh);

        // Rear mounting legs
        const leg1 = new THREE.Mesh(legGeometry, legMaterial);
        leg1.position.set(-0.6, -0.4, -0.3);
        singlePanel.add(leg1);

        const leg2 = new THREE.Mesh(legGeometry, legMaterial);
        leg2.position.set(0.6, -0.4, -0.3);
        singlePanel.add(leg2);

        // Angled tilt towards the sun (28 degrees)
        singlePanel.rotation.x = THREE.MathUtils.degToRad(26);

        // Position in row/column array
        const xPos = (c - (cols - 1) / 2) * (panelWidth + 0.12);
        const zPos = (r - (rows - 1) / 2) * 1.5 - 0.5;
        const yPos = 0.3 - r * 0.25;

        singlePanel.position.set(xPos, yPos, zPos);
        panelGroup.add(singlePanel);
      }
    }

    scene.add(panelGroup);

    // Floating Golden Solar Particles (Sun Irradiance Photons)
    const particleCount = 75;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 10;
      particlePos[i + 1] = Math.random() * 5;
      particlePos[i + 2] = (Math.random() - 0.5) * 8;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffa439,
      size: 0.07,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Interaction Target Variables (Subtle Parallax)
    let targetRotationY = 0;
    let targetRotationX = 0;
    let targetCameraX = 0;
    let targetCameraY = 3.2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      // Mouse moves left -> background/scene shifts slightly right (Subtle inverse parallax)
      targetRotationY = -x * 0.25;
      targetRotationX = y * 0.15;
      targetCameraX = -x * 0.8;
      targetCameraY = 3.2 + y * 0.4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth damped camera and panel lerp
      panelGroup.rotation.y += (targetRotationY - panelGroup.rotation.y) * 0.05;
      panelGroup.rotation.x += (targetRotationX - panelGroup.rotation.x) * 0.05;

      camera.position.x += (targetCameraX - camera.position.x) * 0.04;
      camera.position.y += (targetCameraY - camera.position.y) * 0.04;
      camera.lookAt(0, 0.4, 0);

      // Subtle float oscillation of panels
      panelGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.04;

      // Gentle movement of energy particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += 0.004;
        if (positions[i] > 5) positions[i] = 0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[360px] sm:h-[440px] md:h-[500px] lg:h-[560px] rounded-3xl overflow-hidden shadow-2xl border border-slate-100/80 bg-gradient-to-br from-slate-900 via-[#0B1B3D] to-socio-900 flex items-center justify-center group"
      role="region"
      aria-label="Interactive 3D Solar Panel Array"
    >
      {/* 3D Scene rendered into container */}

      {/* Fallback layered photographic visual if WebGL is unavailable */}
      {!webGLSupported && (
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80"
            alt="Solar Panels Landscape at Sunrise"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-900/30 to-transparent" />
        </div>
      )}

      {/* Sun flare & atmospheric lighting overlay */}
      <div className="absolute top-4 right-8 w-40 h-40 bg-solar-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-6 left-6 w-52 h-52 bg-socio-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Floating 3D Interactive Badge */}
      <div className="absolute top-5 left-5 z-20 glass-panel-dark px-3.5 py-1.5 rounded-full border border-white/15 flex items-center gap-2 text-xs font-semibold text-white/90 shadow-lg pointer-events-none backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-solar-500 animate-ping" />
        <span>Subtle 3D Simulation</span>
      </div>

      {/* Micro-interaction hint */}
      <div
        className={`absolute bottom-4 right-4 z-20 text-[11px] font-medium text-white/70 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 transition-opacity duration-300 pointer-events-none ${
          isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-75'
        }`}
      >
        Hover to shift perspective
      </div>
    </div>
  );
};
