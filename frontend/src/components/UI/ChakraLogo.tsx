import React from 'react';

interface ChakraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const ChakraLogo: React.FC<ChakraLogoProps> = ({ size = 'md', animated = true }) => {
  const dimension = size === 'sm' ? 32 : size === 'lg' ? 56 : 42;

  return (
    <div className="relative flex items-center gap-2 group cursor-pointer">
      <div className="relative flex items-center justify-center">
        {/* Outer Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-saffron via-white to-indiagreen opacity-40 blur-md group-hover:opacity-75 transition-opacity" />

        {/* Ashoka-Chakra Geometry + Weather Radar SVG */}
        <svg
          width={dimension}
          height={dimension}
          viewBox="0 0 100 100"
          className={`relative z-10 ${animated ? 'animate-spin-slow' : ''}`}
        >
          {/* Outer Ring */}
          <circle cx="50" cy="50" r="46" fill="none" stroke="#FF9933" strokeWidth="3" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#000080" strokeWidth="1.5" strokeDasharray="3 3" />
          
          {/* 24 Spokes (Chakra Identity) */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            const rad = (angle * Math.PI) / 180;
            const x2 = 50 + 38 * Math.cos(rad);
            const y2 = 50 + 38 * Math.sin(rad);
            return (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={x2}
                y2={y2}
                stroke={i % 2 === 0 ? '#000080' : '#138808'}
                strokeWidth="1"
                opacity="0.75"
              />
            );
          })}

          {/* Center Cloud & Neural Radar Hub */}
          <circle cx="50" cy="50" r="14" fill="#0B0F19" stroke="#FF9933" strokeWidth="2" />
          <circle cx="50" cy="50" r="6" fill="#FF9933" className="animate-pulse" />

          {/* AI Neural Dots */}
          <circle cx="36" cy="50" r="2.5" fill="#138808" />
          <circle cx="64" cy="50" r="2.5" fill="#138808" />
          <circle cx="50" cy="36" r="2.5" fill="#000080" />
          <circle cx="50" cy="64" r="2.5" fill="#000080" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className="font-heading font-extrabold tracking-tight text-xl text-white flex items-center gap-1">
          WEATHER<span className="text-saffron">GPT</span>
        </span>
        <span className="text-[9px] font-semibold tracking-wider text-gray-400 uppercase -mt-1">
          AI Weather Intelligence
        </span>
      </div>
    </div>
  );
};
