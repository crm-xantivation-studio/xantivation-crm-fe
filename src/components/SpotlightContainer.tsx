'use client';

import React, { useRef, useState } from 'react';

export default function SpotlightContainer({
  children,
  className = '',
  spotlightColor = 'rgba(66, 136, 201, 0.08)',
  spotlightRadius = 320,
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightRadius?: number;
  showGrid?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top } = containerRef.current.getBoundingClientRect();
    setCoords({ x: e.clientX - left, y: e.clientY - top });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Subtle Azure Spotlight overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(${spotlightRadius}px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 80%)`,
          zIndex: 1,
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

