import React, { useEffect, useRef, useState } from 'react';

interface HeritageEnvironmentProps {
  children?: React.ReactNode;
}

export const HeritageEnvironment: React.FC<HeritageEnvironmentProps> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Parallax tracking for desktop only
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const xPct = (e.clientX / window.innerWidth) - 0.5;
      const yPct = (e.clientY / window.innerHeight) - 0.5;
      setMouseOffset({ x: xPct, y: yPct });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Ambient floating golden dust & glowing fire embers canvas
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle pool: Archaeological golden dust + Rising Fire Embers
    const DUST_COUNT = 36;
    const EMBER_COUNT = 24;

    interface Particle {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      maxAlpha: number;
      color: string;
      isEmber: boolean;
      flickerSpeed: number;
    }

    const particles: Particle[] = [];

    // Golden dust particles
    for (let i = 0; i < DUST_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.6,
        vx: (Math.random() - 0.5) * 0.22,
        vy: -Math.random() * 0.24 - 0.08,
        alpha: Math.random() * 0.5 + 0.2,
        maxAlpha: 0.65,
        color: Math.random() > 0.4 ? 'rgba(242, 192, 120,' : 'rgba(212, 163, 95,',
        isEmber: false,
        flickerSpeed: 0.015
      });
    }

    // Glowing fire embers (rising faster, flickering, warm flame colors)
    for (let i = 0; i < EMBER_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: height - Math.random() * (height * 0.7),
        radius: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.42,
        vy: -Math.random() * 0.65 - 0.35,
        alpha: Math.random() * 0.7 + 0.3,
        maxAlpha: 0.95,
        color: Math.random() > 0.5 ? 'rgba(255, 179, 71,' : 'rgba(255, 107, 53,',
        isEmber: true,
        flickerSpeed: Math.random() * 0.04 + 0.02
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Flicker alpha
        p.alpha += Math.sin(Date.now() * p.flickerSpeed) * 0.014;
        if (p.alpha > p.maxAlpha) p.alpha = p.maxAlpha;
        if (p.alpha < 0.15) p.alpha = 0.15;

        // Wrap around borders
        if (p.y < -15) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -15) p.x = width + 15;
        if (p.x > width + 15) p.x = -15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.alpha})`;

        if (p.isEmber) {
          ctx.shadowBlur = p.radius * 5.5;
          ctx.shadowColor = 'rgba(255, 140, 40, 0.85)';
        } else {
          ctx.shadowBlur = p.radius * 3.0;
          ctx.shadowColor = 'rgba(242, 192, 120, 0.5)';
        }
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Parallax offsets
  const mountainFarTransform = isMobile
    ? 'none'
    : `translate(${mouseOffset.x * 5}px, ${mouseOffset.y * 3}px)`;

  const mountainMidTransform = isMobile
    ? 'none'
    : `translate(${mouseOffset.x * 9}px, ${mouseOffset.y * 5}px)`;

  const ruinsTransform = isMobile
    ? 'none'
    : `translate(${mouseOffset.x * 14}px, ${mouseOffset.y * 8}px)`;

  const fogTransform = isMobile
    ? 'none'
    : `translate(${mouseOffset.x * 20}px, ${mouseOffset.y * 11}px)`;

  const lightRaysTransform = isMobile
    ? 'none'
    : `translate(${mouseOffset.x * -8}px, ${mouseOffset.y * -4}px)`;

  return (
    <div className="heritage-environment-wrap" style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      {/* 1. SKY & SUNSET HORIZON (Obsidian #050B18 to warm Twilight Amber) */}
      <div
        className="heritage-bg-layer sky-gradient"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse 110% 75% at 50% 88%, rgba(255, 140, 50, 0.18) 0%, rgba(212, 163, 95, 0.09) 32%, rgba(14, 18, 36, 0.85) 68%, #050B18 100%)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      {/* 2. SLOW MOVING DRIFTING CLOUDS ACROSS SUNSET SKY */}
      <div
        className="heritage-bg-layer moving-clouds-layer"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          opacity: 0.35
        }}
      >
        <div className="cinematic-cloud cloud-1" />
        <div className="cinematic-cloud cloud-2" />
      </div>

      {/* 3. SHIFTING ATMOSPHERIC LIGHT RAYS / GOD RAYS */}
      <div
        className="heritage-bg-layer god-rays-layer"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          transform: lightRaysTransform,
          transition: 'transform 0.2s ease-out'
        }}
      >
        <div className="god-ray-beam beam-1" />
        <div className="god-ray-beam beam-2" />
        <div className="god-ray-beam beam-3" />
      </div>

      {/* 4. SUBTLE ANCIENT INDIAN JALI MESH (Archaeological Pattern) */}
      <div
        className="heritage-bg-layer jali-grid"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(212, 163, 95, 0.05) 1.2px, transparent 1.2px)`,
          backgroundSize: '44px 44px',
          opacity: 0.7,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      {/* 5. DISTANT MOUNTAINS & VALLEY LANDSCAPE (Far & Mid Ridges) */}
      <div
        className="heritage-bg-layer mountains-silhouette"
        style={{
          position: 'fixed',
          bottom: 0,
          left: '-50px',
          right: '-50px',
          height: '360px',
          zIndex: 0,
          pointerEvents: 'none',
          transform: mountainFarTransform,
          transition: 'transform 0.18s ease-out'
        }}
      >
        {/* Far Mountain Horizon */}
        <svg
          viewBox="0 0 1500 340"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: '270px',
            opacity: 0.28,
            fill: '#0B132B'
          }}
        >
          <path d="M0,340 L0,230 L110,165 L220,205 L370,135 L500,190 L640,115 L780,180 L920,125 L1060,185 L1210,140 L1350,195 L1500,155 L1500,340 Z" />
        </svg>

        {/* Mid-distance Mountain & Valley Plateau */}
        <svg
          viewBox="0 0 1500 340"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: '210px',
            opacity: 0.45,
            fill: '#080E20',
            transform: mountainMidTransform
          }}
        >
          {/* Valley landscape with river basin depression and stepped plateau */}
          <path d="M0,340 L0,250 L140,195 L290,235 L440,175 L590,225 L680,245 L740,248 L800,245 L910,215 L1070,178 L1230,228 L1390,188 L1500,212 L1500,340 Z" />
        </svg>
      </div>

      {/* 6. ANCIENT INDIAN TEMPLES & CARVED STONE RUINS */}
      <div
        className="heritage-bg-layer ruins-layer"
        style={{
          position: 'fixed',
          bottom: 0,
          left: '-40px',
          right: '-40px',
          height: '310px',
          zIndex: 0,
          pointerEvents: 'none',
          transform: ruinsTransform,
          transition: 'transform 0.18s ease-out'
        }}
      >
        <svg
          viewBox="0 0 1500 280"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: '240px',
            opacity: 0.62,
            fill: '#050A16'
          }}
        >
          {/* Left temple complex: Grand Dravidian Gopuram + Shikhara */}
          <path d="M0,280 L0,220 L25,220 L30,180 L42,180 L48,140 L58,110 L63,75 L68,40 L73,40 L78,75 L83,110 L93,140 L98,180 L110,180 L115,220 L175,220 L182,170 L200,170 L208,125 L216,80 L224,80 L232,125 L240,170 L255,170 L262,220 L320,220 L330,190 L345,190 L352,155 L360,155 L365,120 L370,90 L375,90 L380,120 L385,155 L395,155 L402,190 L415,190 L425,220 Z" />
          
          {/* Center-left stupa, torana archway & carved pillars */}
          <path d="M425,280 L425,220 L470,220 L475,175 L485,175 L490,220 L530,220 L535,165 L565,125 L595,125 L625,165 L630,220 L670,220 L675,175 L685,175 L690,220 Z" />
          
          {/* Center-right grand Nagara Shikhara & mandapa halls */}
          <path d="M770,280 L770,220 L800,220 L808,175 L820,175 L828,130 L838,85 L845,45 L852,45 L860,85 L868,130 L878,175 L890,175 L898,220 L950,220 L958,180 L975,180 L985,140 L992,100 L998,100 L1005,140 L1015,180 L1030,180 L1038,220 Z" />

          {/* Right ruin colonnade, watchtowers & fortress battlements */}
          <path d="M1038,280 L1038,220 L1100,220 L1108,170 L1120,170 L1128,120 L1138,75 L1145,75 L1155,120 L1165,170 L1178,170 L1185,220 L1250,220 L1258,180 L1275,180 L1285,135 L1292,95 L1298,95 L1305,135 L1315,180 L1330,180 L1338,220 L1410,220 L1418,165 L1435,165 L1445,110 L1455,65 L1465,65 L1475,110 L1485,165 L1500,165 L1500,280 Z" />
        </svg>

        {/* 7. 10 HISTORICAL INDIAN WAVING FLAGS (Continuous Fluid Cloth Animation) */}
        {/* Flag 1: Left Temple Spire */}
        <div className="heritage-flag-assembly flag-pos-1" style={{ position: 'absolute', left: '71px', bottom: '235px' }}>
          <div className="flag-pole" style={{ width: '2px', height: '36px', background: '#5C4A32' }} />
          <svg className="waving-dhwaja flag-anim-1" width="28" height="18" viewBox="0 0 28 18" style={{ position: 'absolute', top: 0, left: '2px', transformOrigin: 'left center' }}>
            <path d="M0,0 L26,7.5 L0,15 Z" fill="url(#saffronGoldGrad)" stroke="#D4A35F" strokeWidth="0.6" />
          </svg>
        </div>

        {/* Flag 2: Left Mandapa Turret */}
        <div className="heritage-flag-assembly flag-pos-2" style={{ position: 'absolute', left: '221px', bottom: '198px' }}>
          <div className="flag-pole" style={{ width: '2px', height: '30px', background: '#5C4A32' }} />
          <svg className="waving-dhwaja flag-anim-2" width="24" height="16" viewBox="0 0 24 16" style={{ position: 'absolute', top: 0, left: '2px', transformOrigin: 'left center' }}>
            <path d="M0,0 L22,6.5 L0,13 Z" fill="url(#saffronGoldGrad)" stroke="#D4A35F" strokeWidth="0.6" />
          </svg>
        </div>

        {/* Flag 3: Left Small Pillar */}
        <div className="heritage-flag-assembly flag-pos-3" style={{ position: 'absolute', left: '372px', bottom: '188px' }}>
          <div className="flag-pole" style={{ width: '2px', height: '26px', background: '#5C4A32' }} />
          <svg className="waving-dhwaja flag-anim-3" width="20" height="14" viewBox="0 0 20 14" style={{ position: 'absolute', top: 0, left: '2px', transformOrigin: 'left center' }}>
            <path d="M0,0 L18,5.5 L0,11 Z" fill="url(#saffronGoldGrad)" stroke="#D4A35F" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Flag 4: Stupa Finial */}
        <div className="heritage-flag-assembly flag-pos-4" style={{ position: 'absolute', left: '578px', bottom: '160px' }}>
          <div className="flag-pole" style={{ width: '2px', height: '24px', background: '#5C4A32' }} />
          <svg className="waving-dhwaja flag-anim-4" width="22" height="15" viewBox="0 0 22 15" style={{ position: 'absolute', top: 0, left: '2px', transformOrigin: 'left center' }}>
            <path d="M0,0 L20,6 L0,12 Z" fill="url(#saffronGoldGrad)" stroke="#D4A35F" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Flag 5: Central Grand Temple Shikhara Apex */}
        <div className="heritage-flag-assembly flag-pos-5" style={{ position: 'absolute', left: '849px', bottom: '232px' }}>
          <div className="flag-pole" style={{ width: '2px', height: '38px', background: '#5C4A32' }} />
          <svg className="waving-dhwaja flag-anim-1" width="30" height="19" viewBox="0 0 30 19" style={{ position: 'absolute', top: 0, left: '2px', transformOrigin: 'left center' }}>
            <path d="M0,0 L28,8 L0,16 Z" fill="url(#saffronGoldGrad)" stroke="#F2C078" strokeWidth="0.7" />
          </svg>
        </div>

        {/* Flag 6: Central Sub-Spire */}
        <div className="heritage-flag-assembly flag-pos-6" style={{ position: 'absolute', left: '995px', bottom: '178px' }}>
          <div className="flag-pole" style={{ width: '2px', height: '28px', background: '#5C4A32' }} />
          <svg className="waving-dhwaja flag-anim-2" width="22" height="15" viewBox="0 0 22 15" style={{ position: 'absolute', top: 0, left: '2px', transformOrigin: 'left center' }}>
            <path d="M0,0 L20,6 L0,12 Z" fill="url(#saffronGoldGrad)" stroke="#D4A35F" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Flag 7: East Watchtower Bastion */}
        <div className="heritage-flag-assembly flag-pos-7" style={{ position: 'absolute', left: '1142px', bottom: '202px' }}>
          <div className="flag-pole" style={{ width: '2px', height: '32px', background: '#5C4A32' }} />
          <svg className="waving-dhwaja flag-anim-3" width="26" height="17" viewBox="0 0 26 17" style={{ position: 'absolute', top: 0, left: '2px', transformOrigin: 'left center' }}>
            <path d="M0,0 L24,7 L0,14 Z" fill="url(#saffronGoldGrad)" stroke="#D4A35F" strokeWidth="0.6" />
          </svg>
        </div>

        {/* Flag 8: East Colonnade Arch */}
        <div className="heritage-flag-assembly flag-pos-8" style={{ position: 'absolute', left: '1295px', bottom: '182px' }}>
          <div className="flag-pole" style={{ width: '2px', height: '26px', background: '#5C4A32' }} />
          <svg className="waving-dhwaja flag-anim-4" width="22" height="15" viewBox="0 0 22 15" style={{ position: 'absolute', top: 0, left: '2px', transformOrigin: 'left center' }}>
            <path d="M0,0 L20,6 L0,12 Z" fill="url(#saffronGoldGrad)" stroke="#D4A35F" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Flag 9: Far East Fortress Tower */}
        <div className="heritage-flag-assembly flag-pos-9" style={{ position: 'absolute', left: '1461px', bottom: '212px' }}>
          <div className="flag-pole" style={{ width: '2px', height: '34px', background: '#5C4A32' }} />
          <svg className="waving-dhwaja flag-anim-1" width="28" height="18" viewBox="0 0 28 18" style={{ position: 'absolute', top: 0, left: '2px', transformOrigin: 'left center' }}>
            <path d="M0,0 L26,7.5 L0,15 Z" fill="url(#saffronGoldGrad)" stroke="#D4A35F" strokeWidth="0.6" />
          </svg>
        </div>

        {/* Flag 10: Torana Gateway Standard */}
        <div className="heritage-flag-assembly flag-pos-10" style={{ position: 'absolute', left: '480px', bottom: '198px' }}>
          <div className="flag-pole" style={{ width: '2px', height: '26px', background: '#5C4A32' }} />
          <svg className="waving-dhwaja flag-anim-2" width="20" height="14" viewBox="0 0 20 14" style={{ position: 'absolute', top: 0, left: '2px', transformOrigin: 'left center' }}>
            <path d="M0,0 L18,5.5 L0,11 Z" fill="url(#saffronGoldGrad)" stroke="#D4A35F" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Shared SVG Gradients */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id="saffronGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFB347" />
              <stop offset="50%" stopColor="#FF6B35" />
              <stop offset="100%" stopColor="#D4A35F" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 8. ATMOSPHERIC DRIFTING FOG & MIST LAYERS */}
      <div
        className="heritage-bg-layer drifting-fog-wrap"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          overflow: 'hidden',
          transform: fogTransform,
          transition: 'transform 0.18s ease-out'
        }}
      >
        <div className="drifting-fog-layer fog-stream-1" />
        <div className="drifting-fog-layer fog-stream-2" />
        <div className="drifting-fog-layer fog-stream-3" />
      </div>

      {/* 9. FLOATING GOLDEN DUST & GLOWING FIRE EMBERS CANVAS */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.9
        }}
      />

      {/* FOREGROUND APPLICATION INTERFACE */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
};
