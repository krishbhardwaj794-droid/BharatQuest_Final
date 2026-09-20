import React, { useState, useRef } from 'react';

interface HeritageArtifactProps {
  onReset?: () => void;
}

export const HeritageArtifact: React.FC<HeritageArtifactProps> = ({ onReset }) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const nx = Math.max(-135, Math.min(135, e.clientX - dragStart.current.x));
    const ny = Math.max(-100, Math.min(100, e.clientY - dragStart.current.y));
    setTransform(prev => ({ ...prev, x: nx, y: ny }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.85, Math.min(1.45, prev.scale + zoomDelta))
    }));
  };

  const handleDoubleClick = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
    if (onReset) onReset();
  };

  return (
    <div className="artifact-showcase">
      <div className="artifact-glow-ring ring1" />
      <div className="artifact-glow-ring ring2" />
      <div className="artifact-glow-ring ring3" />

      <div
        className="artifact-vessel"
        id="artifact-vessel"
        title="Left-click & drag to move · Scroll to zoom · Double-click to reset"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      >
        <svg width="160" height="200" viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="80" cy="140" rx="55" ry="55" fill="url(#pg1)" />
          <rect x="55" y="75" width="50" height="28" rx="6" fill="url(#pg2)" />
          <ellipse cx="80" cy="75" rx="30" ry="9" fill="#C2855A" />
          <ellipse cx="80" cy="133" rx="55" ry="8" fill="none" stroke="#6B3410" strokeWidth="1.5" strokeDasharray="8 4" />
          <text x="56" y="125" fontSize="18" fill="#6B3410" fontFamily="serif" opacity="0.85">&#x12019;</text>
          <text x="80" y="148" fontSize="13" fill="#7B4420" fontFamily="serif" opacity="0.7">&#x2295;</text>
          <text x="58" y="162" fontSize="11" fill="#7B4420" opacity="0.6">&#x224B;&#x224B;&#x224B;</text>
          <ellipse cx="55" cy="108" rx="11" ry="18" fill="white" opacity="0.1" transform="rotate(-18 55 108)" />
          <defs>
            <radialGradient id="pg1" cx="38%" cy="38%">
              <stop offset="0%" stopColor="#D4956A" />
              <stop offset="100%" stopColor="#8B4513" />
            </radialGradient>
            <linearGradient id="pg2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#BC7A50" />
              <stop offset="100%" stopColor="#8B4513" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="artifact-inspect-hint">
        <span>🔍 Drag to Inspect &middot; Scroll to Zoom &middot; Double-click to Reset</span>
      </div>
      <div className="artifact-label">Harappan Terracotta Vessel &middot; Circa 2600 BCE</div>
      <div className="artifact-tags">
        <span className="a-tag">🏺 Indus Redware</span>
        <span className="a-tag">📍 Harappa / Mohenjo-daro</span>
        <span className="a-tag">📅 Bronze Age India</span>
      </div>
    </div>
  );
};