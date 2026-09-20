import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface ChakraMasterProps {
  onComplete: (stats: { score: number; accuracyPct: number; timeTakenSeconds: number }) => void;
  onExit: () => void;
}

export const ChakraMaster: React.FC<ChakraMasterProps> = ({ onComplete, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chakraGroupRef = useRef<THREE.Group | null>(null);
  const [currentAngle, setCurrentAngle] = useState<number>(140);
  const [targetAngle, setTargetAngle] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(35);
  const [isAligned, setIsAligned] = useState<boolean>(false);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [roundSuccess, setRoundSuccess] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startTimeRef = useRef<number>(Date.now());
  const alignmentsDoneRef = useRef<number>(0);

  // Initialize Three.js 3D Chakra scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambLight = new THREE.AmbientLight(0xFFE8D6, 1.4);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xF5C842, 1.8);
    dirLight.position.set(5, 5, 8);
    scene.add(dirLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Build Ashoka Chakra (24 spokes, bronze gold rims, hub boss)
    const chakraGroup = new THREE.Group();
    chakraGroupRef.current = chakraGroup;
    rootGroup.add(chakraGroup);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0x1E3A8A,
      metalness: 0.8,
      roughness: 0.25,
      emissive: 0x0A192F,
      emissiveIntensity: 0.2
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xE8B042,
      metalness: 0.85,
      roughness: 0.2
    });

    // Outer rim
    const outerRim = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.16, 16, 64), rimMat);
    chakraGroup.add(outerRim);

    // Inner rim
    const innerRim = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.08, 16, 64), goldMat);
    chakraGroup.add(innerRim);

    // Hub
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.28, 32), rimMat);
    hub.rotation.x = Math.PI / 2;
    chakraGroup.add(hub);

    // 24 Spokes
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI * 2) / 24;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 2.35, 8), rimMat);
      spoke.position.set(Math.cos(angle) * 1.35, Math.sin(angle) * 1.35, 0);
      spoke.rotation.z = angle - Math.PI / 2;
      chakraGroup.add(spoke);
    }

    // Alignment marker notch on chakra (top spike)
    const marker = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.45, 16),
      new THREE.MeshStandardMaterial({ color: 0xFF3300, emissive: 0xFF1100, emissiveIntensity: 0.8 })
    );
    marker.position.set(0, 3.25, 0);
    marker.rotation.z = Math.PI;
    chakraGroup.add(marker);

    // Background cosmic particle ring
    const partGeo = new THREE.BufferGeometry();
    const count = 120;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3.6 + Math.random() * 0.8;
      const th = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(th) * r;
      pos[i * 3 + 1] = Math.sin(th) * r;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const partMat = new THREE.PointsMaterial({ color: 0xF5C842, size: 0.07, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(partGeo, partMat);
    rootGroup.add(particles);

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      particles.rotation.z += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Chakra mesh rotation when currentAngle changes
  useEffect(() => {
    if (chakraGroupRef.current) {
      chakraGroupRef.current.rotation.z = (currentAngle * Math.PI) / 180;
    }
  }, [currentAngle]);

  // Check alignment
  useEffect(() => {
    const diff = Math.abs(((currentAngle - targetAngle + 180) % 360) - 180);
    const close = diff < 6;
    setIsAligned(close);

    let timer: ReturnType<typeof setInterval>;
    if (close && !roundSuccess) {
      timer = setInterval(() => {
        setHoldProgress((p) => {
          if (p >= 100) {
            clearInterval(timer);
            handleRoundSuccess();
            return 100;
          }
          return p + 25;
        });
      }, 120);
    } else {
      setHoldProgress(0);
    }

    return () => clearInterval(timer);
  }, [currentAngle, targetAngle, roundSuccess]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      finishGame();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleRoundSuccess = () => {
    setRoundSuccess(true);
    alignmentsDoneRef.current += 1;
    const earned = 1200 * combo + timeLeft * 20;
    setScore((s) => s + earned);
    setCombo((c) => c + 1);

    setTimeout(() => {
      if (round >= 3) {
        finishGame();
      } else {
        setRound((r) => r + 1);
        setRoundSuccess(false);
        setHoldProgress(0);
        // Set new random offset
        const newTarget = Math.floor(Math.random() * 8) * 45; // multiple of 45
        const newStart = (newTarget + 100 + Math.floor(Math.random() * 160)) % 360;
        setTargetAngle(newTarget);
        setCurrentAngle(newStart);
      }
    }, 1000);
  };

  const finishGame = useCallback(() => {
    const timeTaken = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const accuracy = Math.min(100, Math.round((alignmentsDoneRef.current / 3) * 100));
    const finalScore = score + (timeLeft > 0 ? timeLeft * 30 : 0);
    onComplete({
      score: Math.max(500, finalScore),
      accuracyPct: accuracy || 75,
      timeTakenSeconds: timeTaken
    });
  }, [score, timeLeft, onComplete]);

  // Mouse / Pointer drag handlers for rotation
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    // Delta rotation based on drag
    const delta = (dx - dy) * 0.75;
    setCurrentAngle((prev) => (prev + delta + 360) % 360);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const rotateBy = (deg: number) => {
    setCurrentAngle((prev) => (prev + deg + 360) % 360);
  };

  return (
    <div className="arcade-game-container chakra-master-game" id="game-chakra-master">
      <div className="game-hud-top">
        <button type="button" className="btn-hud-exit" onClick={onExit}>← BACK TO ARCADE</button>
        <div className="hud-metric">
          <span className="hud-metric-label">TIME</span>
          <span className={`hud-metric-val ${timeLeft <= 8 ? 'critical' : ''}`}>⏱️ {timeLeft}s</span>
        </div>
        <div className="hud-metric">
          <span className="hud-metric-label">ROUND</span>
          <span className="hud-metric-val gold">{round} / 3</span>
        </div>
        <div className="hud-metric">
          <span className="hud-metric-label">SCORE</span>
          <span className="hud-metric-val score" id="chakra-score">{score.toLocaleString()}</span>
        </div>
        <div className="hud-metric">
          <span className="hud-metric-label">COMBO</span>
          <span className="hud-metric-val combo">{combo}x</span>
        </div>
      </div>

      <div className="chakra-game-stage">
        {roundSuccess && (
          <div className="alignment-success-banner">
            ✨ CHAKRA RESTORED! +{1200 * (combo - 1)} PTS ✨
          </div>
        )}

        <div className="target-notch-indicator" title={`Target Meridian: ${targetAngle}°`}>
          <span className="target-notch-arrow">▼</span>
          <span className="target-notch-label">TARGET MERIDIAN</span>
        </div>

        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            id="chakra-master-canvas"
            className="chakra-master-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ width: '380px', height: '380px', cursor: 'grab' }}
          />
        </div>

        <div className="alignment-status-bar">
          <div className="status-label-row">
            <span>{isAligned ? '🎯 IN ALIGNMENT! HOLD STEADY' : '🔄 ROTATE TO MATCH THE TARGET MERIDIAN'}</span>
            <span>{Math.round(holdProgress)}%</span>
          </div>
          <div className="hold-progress-track">
            <div className="hold-progress-fill" style={{ width: `${holdProgress}%` }}></div>
          </div>
        </div>

        <div className="rotation-controls-row">
          <button type="button" className="btn-rotate-step" onClick={() => rotateBy(-15)}>↺ -15°</button>
          <button type="button" className="btn-rotate-step fine" onClick={() => rotateBy(-3)}>↶ -3°</button>
          <span className="current-deg-indicator">{Math.round(currentAngle)}°</span>
          <button type="button" className="btn-rotate-step fine" onClick={() => rotateBy(3)}>↷ +3°</button>
          <button type="button" className="btn-rotate-step" onClick={() => rotateBy(15)}>↻ +15°</button>
        </div>

        <p className="touch-hint">Drag canvas or tap buttons to rotate the Ashoka Chakra into celestial alignment.</p>
      </div>
    </div>
  );
};
