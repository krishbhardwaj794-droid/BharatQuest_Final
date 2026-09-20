import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HeritageArtifact3DProps {
  onReset?: () => void;
}

export const HeritageArtifact3D: React.FC<HeritageArtifact3DProps> = ({ onReset }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<'3d' | 'dossier'>('3d');
  const [dossierTab, setDossierTab] = useState<'overview' | 'material' | 'sites' | 'significance'>('overview');
  const [inspected, setInspected] = useState(false);

  useEffect(() => {
    if (activeTab !== 'dossier') {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      let animFrameId: number;
      let renderer: THREE.WebGLRenderer | null = null;
      let scene: THREE.Scene | null = null;
      let camera: THREE.PerspectiveCamera | null = null;
      let vesselGroup: THREE.Group | null = null;

      let isDragging = false;
      let prevPointer = { x: 0, y: 0 };
      let rotationVelocity = { x: 0, y: 0.003 };
      let targetZoom = 5.2;
      let currentZoom = 5.2;

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
        const width = container.clientWidth || 320;
        const height = container.clientHeight || 280;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        camera.position.set(0, 0, currentZoom);

        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Warm archaeological illumination
        const ambientLight = new THREE.AmbientLight(0xffeedd, 0.85);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffbe6b, 1.25);
        keyLight.position.set(3, 4, 5);
        scene.add(keyLight);

        const fillLight = new THREE.PointLight(0xd97736, 1.1, 15);
        fillLight.position.set(-3, -2, 4);
        scene.add(fillLight);

        vesselGroup = new THREE.Group();

        // Authentic Harappan Terracotta materials
        const terracottaMat = new THREE.MeshStandardMaterial({
          color: 0xba6838,
          roughness: 0.65,
          metalness: 0.12,
        });
        materialsToDispose.push(terracottaMat);

        const slipBandMat = new THREE.MeshStandardMaterial({
          color: 0x6e3614,
          roughness: 0.55,
          metalness: 0.18,
        });
        materialsToDispose.push(slipBandMat);

        const goldAccentMat = new THREE.MeshStandardMaterial({
          color: 0xd4af37,
          roughness: 0.35,
          metalness: 0.75,
        });
        materialsToDispose.push(goldAccentMat);

        // 1. Vessel Bulbous Belly
        const bellyGeo = new THREE.SphereGeometry(1.35, 32, 32);
        bellyGeo.scale(1, 1.12, 1);
        geometriesToDispose.push(bellyGeo);
        const bellyMesh = new THREE.Mesh(bellyGeo, terracottaMat);
        vesselGroup.add(bellyMesh);

        // 2. Decorative Slip Bands (Geometric wave motifs of Harappa)
        const band1Geo = new THREE.TorusGeometry(1.36, 0.035, 16, 64);
        band1Geo.rotateX(Math.PI / 2);
        geometriesToDispose.push(band1Geo);
        const band1 = new THREE.Mesh(band1Geo, slipBandMat);
        band1.position.y = 0.25;
        vesselGroup.add(band1);

        const band2Geo = new THREE.TorusGeometry(1.36, 0.035, 16, 64);
        band2Geo.rotateX(Math.PI / 2);
        geometriesToDispose.push(band2Geo);
        const band2 = new THREE.Mesh(band2Geo, slipBandMat);
        band2.position.y = -0.25;
        vesselGroup.add(band2);

        // 3. Vessel Neck
        const neckGeo = new THREE.CylinderGeometry(0.68, 0.88, 0.75, 32);
        geometriesToDispose.push(neckGeo);
        const neckMesh = new THREE.Mesh(neckGeo, terracottaMat);
        neckMesh.position.y = 1.45;
        vesselGroup.add(neckMesh);

        // 4. Out-turned Rim
        const rimGeo = new THREE.TorusGeometry(0.78, 0.08, 16, 64);
        rimGeo.rotateX(Math.PI / 2);
        geometriesToDispose.push(rimGeo);
        const rimMesh = new THREE.Mesh(rimGeo, goldAccentMat);
        rimMesh.position.y = 1.82;
        vesselGroup.add(rimMesh);

        // 5. Base Foot
        const baseGeo = new THREE.CylinderGeometry(0.55, 0.45, 0.22, 32);
        geometriesToDispose.push(baseGeo);
        const baseMesh = new THREE.Mesh(baseGeo, slipBandMat);
        baseMesh.position.y = -1.38;
        vesselGroup.add(baseMesh);

        vesselGroup.position.set(0, -0.15, 0);
        vesselGroup.rotation.set(0.12, 0, 0);
        scene.add(vesselGroup);

        const animate = () => {
          animFrameId = requestAnimationFrame(animate);

          if (!isDragging && vesselGroup) {
            vesselGroup.rotation.y += 0.0035;
            vesselGroup.rotation.x += rotationVelocity.x;
            vesselGroup.rotation.y += rotationVelocity.y;
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

        // Pointer Events
        const handlePointerDown = (e: PointerEvent) => {
          isDragging = true;
          setInspected(true);
          prevPointer = { x: e.clientX, y: e.clientY };
        };

        const handlePointerMove = (e: PointerEvent) => {
          if (!isDragging || !vesselGroup) return;
          const deltaX = e.clientX - prevPointer.x;
          const deltaY = e.clientY - prevPointer.y;
          prevPointer = { x: e.clientX, y: e.clientY };

          vesselGroup.rotation.y += deltaX * 0.008;
          vesselGroup.rotation.x += deltaY * 0.008;
          rotationVelocity = { x: deltaY * 0.0025, y: deltaX * 0.0025 };
        };

        const handlePointerUp = () => {
          isDragging = false;
        };

        const handleWheel = (e: WheelEvent) => {
          targetZoom += e.deltaY * 0.004;
          targetZoom = Math.max(3.8, Math.min(7.2, targetZoom));
        };

        const handleDblClick = () => {
          if (vesselGroup) {
            vesselGroup.rotation.set(0.12, 0, 0);
          }
          targetZoom = 5.2;
          if (onReset) onReset();
        };

        const handleResize = () => {
          const w = container.clientWidth || 320;
          const h = container.clientHeight || 280;
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
          if (renderer) renderer.dispose();
        };
      }
    }
  }, [activeTab, onReset]);

  return (
    <div className="artifact-showcase" id="artifact-showcase-3d">
      <div className="artifact-glow-ring ring1" />
      <div className="artifact-glow-ring ring2" />
      <div className="artifact-glow-ring ring3" />

      {/* Mode Switcher Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '10px',
        background: 'rgba(0,0,0,0.4)',
        padding: '4px',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        zIndex: 5
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('3d')}
          style={{
            flex: 1,
            padding: '6px 14px',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.05em',
            borderRadius: '16px',
            border: 'none',
            background: activeTab === '3d' ? 'linear-gradient(135deg,#FF6B35,#FF9933)' : 'transparent',
            color: activeTab === '3d' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: activeTab === '3d' ? 700 : 500
          }}
        >
          🏺 3D ARTIFACT
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('dossier'); setInspected(true); }}
          style={{
            flex: 1,
            padding: '6px 14px',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.05em',
            borderRadius: '16px',
            border: 'none',
            background: activeTab === 'dossier' ? 'linear-gradient(135deg,#FF6B35,#FF9933)' : 'transparent',
            color: activeTab === 'dossier' ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: activeTab === 'dossier' ? 700 : 500
          }}
        >
          📜 ARCHAEOLOGICAL DOSSIER
        </button>
      </div>

      {activeTab === '3d' ? (
        <>
          <div
            className="artifact-vessel"
            id="artifact-vessel"
            ref={containerRef}
            style={{
              width: '260px',
              height: '240px',
              position: 'relative',
              cursor: 'grab',
              touchAction: 'none'
            }}
            title="Left-click & drag to rotate in 3D · Scroll to zoom · Double-click to reset"
          >
            <canvas
              ref={canvasRef}
              id="heritage-artifact-canvas"
              className="artifact-3d-canvas"
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
          </div>

          <div className="artifact-inspect-hint" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', margin: '8px 0' }}>
            <span>🔍 Drag to rotate in 3D &middot; Scroll to zoom</span>
            <button
              type="button"
              className="btn-artifact-ctrl"
              id="btn-artifact-reset"
              onClick={onReset}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'var(--gold, #FFD700)',
                borderRadius: '12px',
                padding: '3px 10px',
                fontSize: '0.74rem',
                cursor: 'pointer'
              }}
            >
              ↻ Reset View
            </button>
          </div>
          <div className="artifact-label">Harappan Terracotta Vessel &middot; Circa 2600 BCE</div>
          <div className="artifact-tags">
            <span className="a-tag">🏺 Indus Redware</span>
            <span className="a-tag">📍 Harappa / Mohenjo-daro</span>
            <span className="a-tag">📅 Bronze Age India</span>
          </div>
        </>
      ) : (
        <div
          className="artifact-dossier"
          id="artifact-dossier"
          style={{
            padding: '16px',
            background: 'rgba(10,14,26,0.85)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            maxWidth: '320px',
            fontSize: '0.82rem',
            lineHeight: 1.55,
            color: 'var(--text-secondary)',
            textAlign: 'left',
            zIndex: 5
          }}
        >
          <div
            className="dossier-id"
            id="dossier-id"
            style={{
              color: 'var(--saffron, #FF9933)',
              fontWeight: 700,
              fontSize: '0.95rem',
              marginBottom: '8px',
              borderBottom: '1px solid rgba(255,153,51,0.25)',
              paddingBottom: '4px'
            }}
          >
            Archaeological Record: #INDUS-2600
          </div>

          <div className="dossier-tabs" style={{ display: 'flex', gap: '4px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`dossier-tab ${dossierTab === 'overview' ? 'active' : ''}`}
              onClick={() => setDossierTab('overview')}
              style={{
                padding: '4px 8px',
                fontSize: '0.72rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: dossierTab === 'overview' ? 'var(--gold, #FFD700)' : 'rgba(255,255,255,0.05)',
                color: dossierTab === 'overview' ? '#000' : 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              Overview
            </button>
            <button
              type="button"
              className={`dossier-tab ${dossierTab === 'material' ? 'active' : ''}`}
              onClick={() => setDossierTab('material')}
              style={{
                padding: '4px 8px',
                fontSize: '0.72rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: dossierTab === 'material' ? 'var(--gold, #FFD700)' : 'rgba(255,255,255,0.05)',
                color: dossierTab === 'material' ? '#000' : 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              Material &amp; Craft
            </button>
            <button
              type="button"
              className={`dossier-tab ${dossierTab === 'sites' ? 'active' : ''}`}
              onClick={() => setDossierTab('sites')}
              style={{
                padding: '4px 8px',
                fontSize: '0.72rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: dossierTab === 'sites' ? 'var(--gold, #FFD700)' : 'rgba(255,255,255,0.05)',
                color: dossierTab === 'sites' ? '#000' : 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              Find Sites
            </button>
            <button
              type="button"
              className={`dossier-tab ${dossierTab === 'significance' ? 'active' : ''}`}
              onClick={() => setDossierTab('significance')}
              style={{
                padding: '4px 8px',
                fontSize: '0.72rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: dossierTab === 'significance' ? 'var(--gold, #FFD700)' : 'rgba(255,255,255,0.05)',
                color: dossierTab === 'significance' ? '#000' : 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              Significance
            </button>
          </div>

          <div className="dossier-body">
            {dossierTab === 'overview' && (
              <>
                <div style={{ marginBottom: '6px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Civilization:</strong> Mature Indus Valley (Bronze Age)
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Period:</strong> Circa 2600–1900 BCE
                </div>
              </>
            )}

            {dossierTab === 'material' && (
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Material &amp; Craft:</strong> Wheel-turned micaceous Terracotta pottery fired in high-temperature updraft kilns with dark slip bands.
              </div>
            )}

            {dossierTab === 'sites' && (
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Excavation Sites:</strong> Harappa, Mohenjo-daro, Lothal, and Dholavira.
              </div>
            )}

            {dossierTab === 'significance' && (
              <div>
                <strong style={{ color: 'var(--gold, #FFD700)' }}>Significance:</strong> Essential for granary storage and maritime trade across ancient Persian Gulf routes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Guided Interaction Steps */}
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '12px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        <span style={{ color: 'var(--accent-success)' }}>1. Discover ✓</span> &rarr;{' '}
        <span style={{ color: inspected ? 'var(--accent-success)' : 'var(--saffron)' }}>
          {inspected ? '2. Inspected ✓' : '2. 3D Inspect'}
        </span> &rarr;{' '}
        <span style={{ color: activeTab === 'dossier' ? 'var(--accent-success)' : 'var(--text-muted)' }}>
          3. Read Info
        </span> &rarr;{' '}
        <span>4. Start Mission</span>
      </div>
    </div>
  );
};
