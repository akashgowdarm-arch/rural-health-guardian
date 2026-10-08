import React, { useState } from 'react';

interface BrandLogoProps {
  className?: string;
  variant?: 'header' | 'footer' | 'hero' | 'large';
  invertOnDark?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'header',
  invertOnDark = false,
}) => {
  // Attempt to load custom uploaded raster image if user places /logo.png
  const [rasterFailed, setRasterFailed] = useState(false);

  // Height configurations strictly preserving aspect ratio
  const heightClasses = {
    header: 'h-10 sm:h-12 w-auto',
    footer: 'h-12 sm:h-14 w-auto',
    hero: 'h-14 sm:h-16 w-auto',
    large: 'h-16 sm:h-20 w-auto',
  }[variant];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 
        Priority 1: Custom uploaded logo file at /logo.png or /assets/logo.png
        Priority 2: High-fidelity vector SVG brandmark (/logo.svg) 
      */}
      {!rasterFailed ? (
        <img
          src="/logo.png"
          alt="SOCIO SOLAR SYSTEMS Logo"
          className={`${heightClasses} object-contain transition-transform duration-300 hover:scale-[1.02]`}
          onError={() => setRasterFailed(true)}
        />
      ) : (
        <img
          src="/logo.svg"
          alt="SOCIO SOLAR SYSTEMS"
          className={`${heightClasses} object-contain transition-transform duration-300 hover:scale-[1.02] ${
            invertOnDark ? 'brightness-110 drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]' : ''
          }`}
        />
      )}
    </div>
  );
};
