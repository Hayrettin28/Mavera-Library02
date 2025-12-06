import React, { useEffect, useState } from 'react';

interface MascotProps {
  mode: 'login' | 'global'; 
  lookAt?: 'center' | 'email' | 'password';
  textLength?: number;
  passwordShown?: boolean;
  isWaving?: boolean;
  resetTrigger?: number;
}

const Mascot: React.FC<MascotProps> = ({ 
  mode, 
  lookAt = 'center', 
  textLength = 0, 
  passwordShown = false,
  isWaving = false,
  resetTrigger = 0
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [mood, setMood] = useState<'normal' | 'happy' | 'angry'>('normal');
  const [isGone, setIsGone] = useState(false);

  // Reset logic
  useEffect(() => {
    setClickCount(0);
    setMood('normal');
    setIsGone(false);
  }, [resetTrigger, mode]);

  // Mouse Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleClick = () => {
    if (isGone) return;
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount > 5) {
        setMood('angry');
        setTimeout(() => setIsGone(true), 1500);
    } else {
        setMood('happy');
        setTimeout(() => setMood('normal'), 600);
    }
  };

  if (isGone) return null;

  // Eye Tracking Calculation
  const getPupilPos = () => {
    if (mood === 'angry') return { x: 0, y: 0 };
    
    // If hiding eyes, look down slightly
    if (lookAt === 'password' && !passwordShown) return { x: 0, y: 15 }; 

    // Text tracking
    if (lookAt === 'email') {
      const limit = 8; 
      const x = Math.min(Math.max((textLength * 1.5) - 15, -limit), limit);
      return { x, y: 5 };
    }

    // Mouse tracking
    const x = Math.min(Math.max((mousePos.x - window.innerWidth / 2) / 35, -10), 10);
    const y = Math.min(Math.max((mousePos.y - window.innerHeight / 2) / 35, -10), 10);
    return { x, y };
  };

  const pupils = getPupilPos();
  
  // Logic for hiding eyes (Shy mode)
  // Strict check: Login mode + password field focus + password NOT shown
  const isShy = mode === 'login' && lookAt === 'password' && !passwordShown;

  // Animation CSS classes
  let animClass = "mascot-breathe";
  if (mood === 'happy') animClass = "mascot-giggle";
  if (mood === 'angry') animClass = "mascot-angry";
  if (isGone) animClass = "mascot-leave";

  // --- LAYOUT STRATEGY ---
  // Positioned at -top-40 to sit on the card properly
  // GLOBAL MODE: scale-75 on mobile, scale-100 on desktop
  const wrapperClass = mode === 'login'
    ? "absolute -top-40 left-0 w-full flex justify-center z-70 pointer-events-none"
    : "fixed bottom-2 right-4 md:bottom-2 md:right-6 z-50 cursor-pointer origin-bottom-right transform scale-75 md:scale-100";

  const contentClass = mode === 'login' 
    ? `w-72 h-72 ${animClass}`
    : `w-48 h-48 hover:scale-105 transition-transform duration-300 ${animClass}`;

  // Enable clicks
  const pointerEvents = mode === 'login' ? { pointerEvents: 'auto' as const } : {};

  return (
    <div className={wrapperClass}>
      <div className={contentClass} style={pointerEvents} onClick={handleClick}>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
            {/* 3D FUR FILTER */}
            <filter id="softFur" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
                <feGaussianBlur stdDeviation="0.5" />
                <feComposite operator="in" in2="SourceGraphic" />
            </filter>

            {/* LIGHTING GRADIENTS */}
            <radialGradient id="body3D" cx="40%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#cbd5e1" />
            </radialGradient>

            <radialGradient id="blackFur3D" cx="30%" cy="30%" r="80%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            <radialGradient id="angry3D" cx="40%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#fee2e2" />
                <stop offset="100%" stopColor="#ef4444" />
            </radialGradient>
            </defs>

            {/* --- MAIN GROUP --- */}
            <g>
                {/* 1. BACK EARS */}
                <circle cx="45" cy="55" r="24" fill="url(#blackFur3D)" filter="url(#softFur)" />
                <circle cx="155" cy="55" r="24" fill="url(#blackFur3D)" filter="url(#softFur)" />

                {/* 2. BODY */}
                <path d="M 50 160 C 20 140, 40 90, 100 90 C 160 90, 180 140, 150 160 C 130 175, 70 175, 50 160" 
                    fill={mood === 'angry' ? "url(#angry3D)" : "url(#body3D)"} 
                    filter="url(#softFur)" />

                {/* 3. FEET */}
                <g filter="url(#softFur)">
                    <ellipse cx="60" cy="165" rx="26" ry="20" fill="url(#blackFur3D)" />
                    <ellipse cx="140" cy="165" rx="26" ry="20" fill="url(#blackFur3D)" />
                    <g fill="#fda4af" opacity="0.8">
                        <circle cx="60" cy="170" r="8" />
                        <circle cx="50" cy="160" r="3" />
                        <circle cx="60" cy="155" r="3" />
                        <circle cx="70" cy="160" r="3" />
                        <circle cx="140" cy="170" r="8" />
                        <circle cx="130" cy="160" r="3" />
                        <circle cx="140" cy="155" r="3" />
                        <circle cx="150" cy="160" r="3" />
                    </g>
                </g>

                {/* 4. HEAD */}
                <ellipse cx="100" cy="85" rx="78" ry="64" 
                        fill={mood === 'angry' ? "url(#angry3D)" : "url(#body3D)"} 
                        filter="url(#softFur)" />

                {/* 5. FACE */}
                <g filter="blur(2px)">
                    <ellipse cx="62" cy="82" rx="26" ry="32" fill="#1e293b" transform="rotate(-15 62 82)" />
                    <ellipse cx="138" cy="82" rx="26" ry="32" fill="#1e293b" transform="rotate(15 138 82)" />
                </g>

                {/* EYES */}
                <g>
                    <ellipse cx="64" cy="82" rx="14" ry="16" fill="white" />
                    <ellipse cx="136" cy="82" rx="14" ry="16" fill="white" />
                    <g style={{ transform: `translate(${pupils.x}px, ${pupils.y}px)`, transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
                        <circle cx="64" cy="82" r={mood === 'angry' ? 4 : 9} fill="#0f172a" />
                        <circle cx="136" cy="82" r={mood === 'angry' ? 4 : 9} fill="#0f172a" />
                        {mood !== 'angry' && (
                            <>
                                <circle cx="68" cy="78" r="4" fill="white" opacity="0.9" />
                                <circle cx="140" cy="78" r="4" fill="white" opacity="0.9" />
                                <circle cx="62" cy="86" r="1.5" fill="white" opacity="0.6" />
                                <circle cx="134" cy="86" r="1.5" fill="white" opacity="0.6" />
                            </>
                        )}
                    </g>
                </g>

                {/* Nose & Mouth */}
                <g transform="translate(0, 5)">
                    <ellipse cx="100" cy="100" rx="14" ry="9" fill="#1e293b" />
                    <circle cx="103" cy="98" r="2.5" fill="white" opacity="0.4" />
                    {!isShy && mood !== 'angry' && (
                        <path d="M 92 115 Q 100 122 108 115" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
                    )}
                    {mood === 'angry' && (
                        <path d="M 92 118 Q 100 110 108 118" stroke="#1e293b" strokeWidth="3" fill="none" />
                    )}
                </g>

                {/* Blush */}
                {mood !== 'angry' && (
                    <g filter="blur(6px)" opacity="0.5">
                        <circle cx="45" cy="100" r="12" fill="#fda4af" />
                        <circle cx="155" cy="100" r="12" fill="#fda4af" />
                    </g>
                )}

                {/* 6. ARMS (Interactive Layer) */}
                
                {/* Left Arm - Covers Left Eye */}
                {/* Updated: Moves SIGNIFICANTLY UP (-65px) to cover eyes completely */}
                <g style={{ 
                    transformBox: 'view-box', 
                    transformOrigin: '50px 110px', 
                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
                    transform: isShy 
                        ? 'translate(5px, -65px) rotate(15deg)'  
                        : 'translate(0,0) rotate(0deg)'
                }}>
                    <ellipse cx="40" cy="120" rx="22" ry="34" fill="url(#blackFur3D)" filter="url(#softFur)" transform="rotate(20 40 120)" />
                </g>

                {/* Right Arm - Covers Right Eye */}
                {/* Updated: Moves SIGNIFICANTLY UP (-65px) to cover eyes completely */}
                <g style={{ 
                    transformBox: 'view-box', 
                    transformOrigin: '150px 110px', 
                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    transform: isShy 
                        ? 'translate(-5px, -65px) rotate(-15deg)' 
                        : isWaving 
                            ? 'translate(0, -10px) rotate(-25deg)' 
                            : 'translate(0,0) rotate(0deg)'
                }}>
                    <ellipse cx="160" cy="120" rx="22" ry="34" fill="url(#blackFur3D)" filter="url(#softFur)" transform="rotate(-20 160 120)" 
                            className={isWaving && !isShy ? "mascot-wave" : ""} />
                </g>

            </g>
        </svg>
      </div>
    </div>
  );
};

export default Mascot;