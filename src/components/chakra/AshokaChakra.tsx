import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AshokaChakraProps {
  onReset?: () => void;
}

export const AshokaChakra: React.FC<AshokaChakraProps> = ({ onReset }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animFrameId: number;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let meshGroup: THREE.Group | null = null;

    let isDragging = false;
    let prevPointer = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0.0028 };
    let targetZoom = 9.5;
    let currentZoom = 9.5;

    // Check for WebGL support
    const isWebGLAvailable = () => {
      try {
        const testCanvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
      } catch {
        return false;
      }
    };

    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    if (isWebGLAvailable()) {
      // 3D Three.js Initialization
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(0, 0, currentZoom);

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Lighting — warm bronze/gold illumination
      const ambientLight = new THREE.AmbientLight(0xffeedd, 0.78);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffbe53, 1.15);
      keyLight.position.set(3, 4, 6);
      scene.add(keyLight);

      const fillLight = new THREE.PointLight(0xd49b4b, 1.05, 25);
      fillLight.position.set(0, 0, 5);
      scene.add(fillLight);

      meshGroup = new THREE.Group();

      // Materials: antique bronze and warm gold
      const bronzeMat = new THREE.MeshStandardMaterial({
        color: 0x9e7344,
        roughness: 0.42,
        metalness: 0.85,
        transparent: true,
        opacity: 0.54
      });
      materialsToDispose.push(bronzeMat);

      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xc89b4e,
        roughness: 0.35,
        metalness: 0.90,
        transparent: true,
        opacity: 0.62
      });
      materialsToDispose.push(goldMat);

      const outerRadius = 3.9;
      const innerRimRadius = 3.65;
      const hubRadius = 0.60;

      // 1. Rims
      const mainRimGeo = new THREE.TorusGeometry(outerRadius, 0.075, 24, 128);
      geometriesToDispose.push(mainRimGeo);
      meshGroup.add(new THREE.Mesh(mainRimGeo, bronzeMat));

      const innerRimGeo = new THREE.TorusGeometry(innerRimRadius, 0.045, 20, 128);
      geometriesToDispose.push(innerRimGeo);
      meshGroup.add(new THREE.Mesh(innerRimGeo, goldMat));

      const trimRimGeo = new THREE.TorusGeometry(outerRadius + 0.12, 0.025, 16, 128);
      geometriesToDispose.push(trimRimGeo);
      meshGroup.add(new THREE.Mesh(trimRimGeo, goldMat));

      // 2. Central Hub
      const hubRingGeo = new THREE.TorusGeometry(hubRadius, 0.045, 20, 64);
      geometriesToDispose.push(hubRingGeo);
      meshGroup.add(new THREE.Mesh(hubRingGeo, goldMat));

      const hubDiscGeo = new THREE.CylinderGeometry(hubRadius, hubRadius, 0.05, 64);
      hubDiscGeo.rotateX(Math.PI / 2);
      geometriesToDispose.push(hubDiscGeo);
      meshGroup.add(new THREE.Mesh(hubDiscGeo, bronzeMat));

      const hubInnerRingGeo = new THREE.TorusGeometry(hubRadius * 0.55, 0.03, 16, 48);
      geometriesToDispose.push(hubInnerRingGeo);
      meshGroup.add(new THREE.Mesh(hubInnerRingGeo, goldMat));

      const bossGeo = new THREE.SphereGeometry(0.18, 24, 24);
      geometriesToDispose.push(bossGeo);
      const centerBoss = new THREE.Mesh(bossGeo, goldMat);
      centerBoss.scale.set(1, 1, 0.4);
      centerBoss.position.z = 0.04;
      meshGroup.add(centerBoss);

      // 3. Exactly 24 Evenly Spaced Spokes (15-degree intervals)
      const numSpokes = 24;
      const spokeLen = innerRimRadius - hubRadius;
      const rMid = hubRadius + spokeLen / 2;
      const spokeRadius = 0.022;

      const spokeGeo = new THREE.CylinderGeometry(spokeRadius, spokeRadius, spokeLen, 12);
      geometriesToDispose.push(spokeGeo);

      const joinGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.06, 10);
      geometriesToDispose.push(joinGeo);

      for (let i = 0; i < numSpokes; i++) {
        const angle = (i / numSpokes) * Math.PI * 2;

        const spoke = new THREE.Mesh(spokeGeo, bronzeMat);
        spoke.position.set(Math.cos(angle) * rMid, Math.sin(angle) * rMid, 0);
        spoke.rotation.z = angle - Math.PI / 2;
        meshGroup.add(spoke);

        const joinMesh = new THREE.Mesh(joinGeo, goldMat);
        joinMesh.position.set(
          Math.cos(angle) * (innerRimRadius + 0.02),
          Math.sin(angle) * (innerRimRadius + 0.02),
          0.01
        );
        joinMesh.rotation.z = angle - Math.PI / 2;
        meshGroup.add(joinMesh);
      }

      meshGroup.rotation.set(0, 0, 0);
      scene.add(meshGroup);

      // Animation Loop
      const animate = () => {
        animFrameId = requestAnimationFrame(animate);

        if (!isDragging && meshGroup) {
          meshGroup.rotation.z += 0.0026;
          meshGroup.rotation.x += rotationVelocity.x;
          meshGroup.rotation.y += rotationVelocity.y;
          rotationVelocity.x *= 0.94;
          rotationVelocity.y *= 0.94;
        }

        if (camera) {
          currentZoom += (targetZoom - currentZoom) * 0.1;
          camera.position.z = currentZoom;
        }

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };
      animate();

    } else {
      // 2D Canvas Fallback
      const ctx = canvas.getContext('2d');
      if (ctx) {
        let angle = 0;

        const resize2D = () => {
          canvas.width = container.clientWidth || window.innerWidth;
          canvas.height = container.clientHeight || window.innerHeight;
        };
        resize2D();

        const draw = () => {
          animFrameId = requestAnimationFrame(draw);
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          const radius = Math.min(canvas.width, canvas.height) * 0.40;
          const hubRadius = radius * 0.16;
          const innerRimRadius = radius * 0.92;

          if (!isDragging) {
            angle += 0.0026;
          }

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.globalAlpha = 0.52;

          // Outer Rim
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.lineWidth = radius * 0.035;
          ctx.strokeStyle = '#B0864E';
          ctx.stroke();

          // Central Hub
          ctx.beginPath();
          ctx.arc(0, 0, hubRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#7E5B30';
          ctx.fill();

          // 24 Spokes
          for (let i = 0; i < 24; i++) {
            const a = (i / 24) * Math.PI * 2;
            const cosA = Math.cos(a);
            const sinA = Math.sin(a);

            ctx.beginPath();
            ctx.moveTo(cosA * hubRadius, sinA * hubRadius);
            ctx.lineTo(cosA * innerRimRadius, sinA * innerRimRadius);
            ctx.lineWidth = Math.max(1.5, radius * 0.012);
            ctx.strokeStyle = '#B0864E';
            ctx.stroke();
          }

          ctx.restore();
        };
        draw();
      }
    }

    // Interaction Handlers
    const isInteractive = (target: HTMLElement | null) => {
      return !!target?.closest('button, .option-btn, .topnav, a, .modal-box, input, .nav-avatar');
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (isInteractive(e.target as HTMLElement)) return;
      isDragging = true;
      prevPointer = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !meshGroup) return;
      const deltaX = e.clientX - prevPointer.x;
      const deltaY = e.clientY - prevPointer.y;
      prevPointer = { x: e.clientX, y: e.clientY };

      meshGroup.rotation.y += deltaX * 0.007;
      meshGroup.rotation.x += deltaY * 0.007;
      rotationVelocity = { x: deltaY * 0.002, y: deltaX * 0.002 };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (isInteractive(e.target as HTMLElement)) return;
      targetZoom += e.deltaY * 0.006;
      targetZoom = Math.max(6.5, Math.min(14.0, targetZoom));
    };

    const handleDblClick = (e: MouseEvent) => {
      if (isInteractive(e.target as HTMLElement)) return;
      if (meshGroup) {
        meshGroup.rotation.x = 0;
        meshGroup.rotation.y = 0;
      }
      targetZoom = 9.5;
      if (onReset) onReset();
    };

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (camera && renderer) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('dblclick', handleDblClick);
    window.addEventListener('resize', handleResize);

    // Comprehensive Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animFrameId);

      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('dblclick', handleDblClick);
      window.removeEventListener('resize', handleResize);

      geometriesToDispose.forEach(g => g.dispose());
      materialsToDispose.forEach(m => m.dispose());

      if (renderer) {
        renderer.dispose();
      }
    };
  }, [onReset]);

  return (
    <div className="challenge-chakra-bg" id="challenge-chakra-bg" ref={containerRef}>
      <canvas ref={canvasRef} id="chakra-canvas" />
      <div className="chakra-readability-overlay" />
      <div className="chakra-controls-hint">
        <span>✦ Ancient Archaeological Chakra &middot; Left-click drag to inspect &middot; Scroll to zoom &middot; Double-click to reset</span>
      </div>
    </div>
  );
};