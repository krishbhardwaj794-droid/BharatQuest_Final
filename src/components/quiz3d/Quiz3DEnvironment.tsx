import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { EnvironmentTheme, SceneBuildResult, ThemeConfig } from './types';
import { THEME_CONFIGS } from './questEnvironments';

interface Quiz3DEnvironmentProps {
  theme: EnvironmentTheme;
  missionId: string;
  questionIndex: number;
  onReset?: () => void;
}

export const Quiz3DEnvironment: React.FC<Quiz3DEnvironmentProps> = ({
  theme,
  questionIndex,
  onReset
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState<EnvironmentTheme>(theme);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number>(0);
  const currentSceneBuildRef = useRef<SceneBuildResult | null>(null);

  // Lighting refs for dynamic updates
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Spherical camera control coordinates
  const sphericalRef = useRef<{
    radius: number;
    theta: number; // Azimuthal angle (horizontal)
    phi: number;   // Polar angle (vertical)
    targetRadius: number;
    targetTheta: number;
    targetPhi: number;
  }>({
    radius: 8.5,
    theta: 0,
    phi: Math.PI / 2 - 0.1,
    targetRadius: 8.5,
    targetTheta: 0,
    targetPhi: Math.PI / 2 - 0.1
  });

  const pointerStateRef = useRef<{
    isDragging: boolean;
    prevX: number;
    prevY: number;
    initialDistance: number;
  }>({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    initialDistance: 0
  });

  const currentConfig: ThemeConfig = THEME_CONFIGS[activeThemeId] || THEME_CONFIGS.chakra;

  // Cleanup helper for geometries and materials
  const disposeSceneBuild = (build: SceneBuildResult | null) => {
    if (!build) return;
    if (sceneRef.current && build.rootGroup) {
      sceneRef.current.remove(build.rootGroup);
    }
    build.geometries.forEach(g => g.dispose());
    build.materials.forEach(m => m.dispose());
    if (build.textures) {
      build.textures.forEach(t => t.dispose());
    }
  };

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    const cfg = THEME_CONFIGS[theme];
    if (!cfg) return;

    const [cx, cy, cz] = cfg.initialCamera;
    const [tx, ty, tz] = cfg.cameraTarget;
    const dx = cx - tx;
    const dy = cy - ty;
    const dz = cz - tz;
    const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const theta = Math.atan2(dx, dz);
    const phi = Math.acos(Math.max(-1, Math.min(1, dy / r)));

    sphericalRef.current = {
      radius: r,
      theta,
      phi,
      targetRadius: r,
      targetTheta: theta,
      targetPhi: phi
    };

    if (onReset) onReset();
  }, [theme, onReset]);

  // Load a 3D theme scene into the Three.js world
  const loadSceneTheme = useCallback((themeKey: EnvironmentTheme) => {
    if (!sceneRef.current) return;
    const cfg = THEME_CONFIGS[themeKey] || THEME_CONFIGS.chakra;

    // Dispose previous scene meshes & materials
    if (currentSceneBuildRef.current) {
      disposeSceneBuild(currentSceneBuildRef.current);
      currentSceneBuildRef.current = null;
    }

    // Update scene fog
    sceneRef.current.fog = new THREE.Fog(cfg.fogColor, cfg.fogNear, cfg.fogFar);

    // Update lighting
    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(cfg.ambientColor);
      ambientLightRef.current.intensity = cfg.ambientIntensity;
    }
    if (dirLightRef.current) {
      dirLightRef.current.color.setHex(cfg.sunColor);
      dirLightRef.current.intensity = cfg.sunIntensity;
      dirLightRef.current.position.set(...cfg.sunPosition);
    }

    // Build new procedural 3D scene
    const newBuild = cfg.buildScene();
    currentSceneBuildRef.current = newBuild;
    sceneRef.current.add(newBuild.rootGroup);

    // Initialize camera position based on config
    const [cx, cy, cz] = cfg.initialCamera;
    const [tx, ty, tz] = cfg.cameraTarget;
    const dx = cx - tx;
    const dy = cy - ty;
    const dz = cz - tz;
    const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const theta = Math.atan2(dx, dz);
    const phi = Math.acos(Math.max(-1, Math.min(1, dy / r)));

    sphericalRef.current = {
      radius: r,
      theta,
      phi,
      targetRadius: r,
      targetTheta: theta,
      targetPhi: phi
    };
  }, []);

  // Handle Question / Theme Change with Smooth 500ms Transition
  useEffect(() => {
    if (theme === activeThemeId) return;

    // Start fade-out transition
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setActiveThemeId(theme);
      loadSceneTheme(theme);
      setIsTransitioning(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [theme, activeThemeId, loadSceneTheme]);

  // Three.js Mount & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Check WebGL availability
    const isWebGLAvailable = () => {
      try {
        const test = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (test.getContext('webgl') || test.getContext('experimental-webgl')));
      } catch {
        return false;
      }
    };

    if (!isWebGLAvailable()) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(currentConfig.ambientColor, currentConfig.ambientIntensity);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(currentConfig.sunColor, currentConfig.sunIntensity);
    dirLight.position.set(...currentConfig.sunPosition);
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Load initial scene theme
    loadSceneTheme(theme);

    let lastTime = performance.now();

    // Render loop
    const animate = (currentTime: number) => {
      animFrameRef.current = requestAnimationFrame(animate);

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const sph = sphericalRef.current;
      const cfg = THEME_CONFIGS[activeThemeId] || THEME_CONFIGS.chakra;

      // Smooth camera damping (Lerp)
      sph.radius += (sph.targetRadius - sph.radius) * 0.08;
      sph.theta += (sph.targetTheta - sph.theta) * 0.08;
      sph.phi += (sph.targetPhi - sph.phi) * 0.08;

      // Calculate camera cartesian coordinates
      const [tx, ty, tz] = cfg.cameraTarget;
      const sinPhi = Math.sin(sph.phi);
      const cosPhi = Math.cos(sph.phi);
      const sinTheta = Math.sin(sph.theta);
      const cosTheta = Math.cos(sph.theta);

      camera.position.x = tx + sph.radius * sinPhi * sinTheta;
      camera.position.y = ty + sph.radius * cosPhi;
      camera.position.z = tz + sph.radius * sinPhi * cosTheta;
      camera.lookAt(tx, ty, tz);

      // Update active 3D procedural scene animations
      if (currentSceneBuildRef.current && currentSceneBuildRef.current.update) {
        currentSceneBuildRef.current.update(currentTime / 1000, delta);
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);

      if (currentSceneBuildRef.current) {
        disposeSceneBuild(currentSceneBuildRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Pointer / Mouse / Touch Interactive Orbit Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStateRef.current.isDragging = true;
    pointerStateRef.current.prevX = e.clientX;
    pointerStateRef.current.prevY = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStateRef.current.isDragging) return;

    const deltaX = e.clientX - pointerStateRef.current.prevX;
    const deltaY = e.clientY - pointerStateRef.current.prevY;
    pointerStateRef.current.prevX = e.clientX;
    pointerStateRef.current.prevY = e.clientY;

    const cfg = THEME_CONFIGS[activeThemeId] || THEME_CONFIGS.chakra;
    const sph = sphericalRef.current;

    // Rotate horizontally (theta) & vertically (phi)
    sph.targetTheta -= deltaX * 0.0065;
    sph.targetPhi -= deltaY * 0.0055;

    // Apply strict polar & azimuth bounds
    sph.targetPhi = Math.max(cfg.polarLimits[0], Math.min(cfg.polarLimits[1], sph.targetPhi));
    sph.targetTheta = Math.max(cfg.azimuthLimits[0], Math.min(cfg.azimuthLimits[1], sph.targetTheta));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    pointerStateRef.current.isDragging = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  // Zoom Handler (Wheel)
  const handleWheel = (e: React.WheelEvent) => {
    const cfg = THEME_CONFIGS[activeThemeId] || THEME_CONFIGS.chakra;
    const sph = sphericalRef.current;
    sph.targetRadius += e.deltaY * 0.006;
    sph.targetRadius = Math.max(cfg.zoomLimits[0], Math.min(cfg.zoomLimits[1], sph.targetRadius));
  };

  // Touch handlers for mobile pinch zoom
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (pointerStateRef.current.initialDistance > 0) {
        const delta = pointerStateRef.current.initialDistance - dist;
        const cfg = THEME_CONFIGS[activeThemeId] || THEME_CONFIGS.chakra;
        sphericalRef.current.targetRadius += delta * 0.012;
        sphericalRef.current.targetRadius = Math.max(cfg.zoomLimits[0], Math.min(cfg.zoomLimits[1], sphericalRef.current.targetRadius));
      }
      pointerStateRef.current.initialDistance = dist;
    }
  };

  const handleTouchEnd = () => {
    pointerStateRef.current.initialDistance = 0;
  };

  // Theme-specific background gradient for the 3D world sky
  const skyGrad = `radial-gradient(ellipse 120% 85% at 50% 90%, #${currentConfig.skyBottomColor.toString(16).padStart(6, '0')} 0%, #${currentConfig.skyTopColor.toString(16).padStart(6, '0')} 80%)`;

  return (
    <div
      className="challenge-chakra-bg quiz-3d-world-container"
      id="challenge-chakra-bg"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onDoubleClick={handleResetCamera}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: skyGrad,
        cursor: 'grab',
        touchAction: 'none'
      }}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        id="chakra-canvas"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          opacity: isTransitioning ? 0.2 : 1.0,
          transition: 'opacity 0.45s ease-in-out'
        }}
      />

      {/* Subtle Readability & Vignette Overlay */}
      <div
        className="chakra-readability-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 60%, rgba(16, 32, 51, 0.35) 0%, rgba(5, 11, 24, 0.72) 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* Quest-Specific Environment Info & Controls Hint Banner */}
      <div
        className="chakra-controls-hint quiz-environment-banner"
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(16, 32, 51, 0.82)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(230, 168, 75, 0.4)',
          borderRadius: '20px',
          padding: '6px 20px',
          fontSize: '0.8rem',
          color: '#FFF4DC',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 5,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
        }}
      >
        <span id="quiz-env-title" className="quiz-env-title" style={{ color: '#E6A84B', fontWeight: 800 }}>
          {questionIndex === 0 ? '✦ Q1: ASHOKA CHAKRA SANCTUM' : `🏛️ Q${questionIndex + 1}: ${currentConfig.title.toUpperCase()}`}
        </span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span id="quiz-env-hint" className="quiz-env-hint" style={{ color: '#E8F0FE', opacity: 0.85 }}>
          Drag to inspect 3D world &middot; Scroll to zoom &middot; Double-click to reset
        </span>
      </div>
    </div>
  );
};
