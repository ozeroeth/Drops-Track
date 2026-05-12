import { useEffect } from 'react';

export default function CrayonCharacter() {
  useEffect(() => {
    const pupilLeft = document.getElementById('pupilLeft');
    const pupilRight = document.getElementById('pupilRight');
    const charEl = document.getElementById('crayonChar');
    const leftCenter = { x: 160, y: 200 };
    const rightCenter = { x: 240, y: 200 };
    const maxMove = 8;

    function movePupils(clientX, clientY) {
      if (!charEl || !pupilLeft || !pupilRight) return;
      const rect = charEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(Math.sqrt(dx*dx+dy*dy), 300);
      const intensity = dist / 300;
      const mx = Math.cos(angle) * maxMove * intensity;
      const my = Math.sin(angle) * maxMove * intensity;
      pupilLeft.setAttribute('cx', leftCenter.x + mx);
      pupilLeft.setAttribute('cy', leftCenter.y + my);
      pupilRight.setAttribute('cx', rightCenter.x + mx);
      pupilRight.setAttribute('cy', rightCenter.y + my);
    }

    const onMove = (e) => movePupils(e.clientX, e.clientY);
    const onTouch = (e) => {
      movePupils(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, []);

  return (
    <div
      id="crayonChar"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'clamp(180px, 25vw, 280px)',
        height: 'clamp(180px, 25vw, 280px)',
        opacity: 0.15,
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'opacity 0.3s',
      }}
      className="dark:opacity-10"
    >
      <svg viewBox="0 0 400 420" fill="none"
        xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <style>
          {`#pupilLeft, #pupilRight { transition: cx 0.08s ease-out, cy 0.08s ease-out; }`}
        </style>
        <defs>
          <filter id="crayon-rough">
            <feTurbulence type="turbulence" baseFrequency="0.04"
              numOctaves="2" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise"
              scale="2" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
        <g filter="url(#crayon-rough)">
          <path d="M118 158 C98 118 93 75 112 48 C132 18 168 5 200 5 C232 5 268 18 288 48 C307 75 302 118 282 158" stroke="#1a1a1a" strokeWidth="8" strokeLinecap="round" fill="#1a1a1a"/>
          <path d="M148 25 C153 5 165 0 168 18" stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" fill="#1a1a1a"/>
          <path d="M183 12 C188 -6 204 -3 202 16" stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" fill="#1a1a1a"/>
          <path d="M217 18 C224 1 238 7 233 24" stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" fill="#1a1a1a"/>
          <path d="M106 142 C88 108 86 68 103 43 C83 58 76 98 93 143" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" fill="#1a1a1a"/>
          <path d="M294 142 C312 108 314 68 297 43 C317 58 324 98 307 143" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" fill="#1a1a1a"/>
          <ellipse cx="200" cy="212" rx="104" ry="114" fill="#f5c5a3" stroke="#1a1a1a" strokeWidth="7"/>
          <ellipse cx="96" cy="212" rx="27" ry="21" fill="#f5c5a3" stroke="#1a1a1a" strokeWidth="6"/>
          <ellipse cx="304" cy="212" rx="27" ry="21" fill="#f5c5a3" stroke="#1a1a1a" strokeWidth="6"/>
          <path d="M100 204 C98 212 100 220" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
          <path d="M300 204 C302 212 300 220" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
          <ellipse cx="160" cy="200" rx="26" ry="27" fill="white" stroke="#1a1a1a" strokeWidth="6"/>
          <circle id="pupilLeft" cx="160" cy="200" r="11" fill="#1a1a1a"/>
          <circle cx="166" cy="194" r="4" fill="white"/>
          <ellipse cx="240" cy="200" rx="26" ry="27" fill="white" stroke="#1a1a1a" strokeWidth="6"/>
          <circle id="pupilRight" cx="240" cy="200" r="11" fill="#1a1a1a"/>
          <circle cx="246" cy="194" r="4" fill="white"/>
          <path d="M136 172 C147 164 173 164 183 172" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" fill="none"/>
          <path d="M217 172 C227 164 253 164 264 172" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" fill="none"/>
          <path d="M195 228 C193 240 197 246 204 244" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <path d="M168 270 C180 282 220 282 232 270" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" fill="none"/>
          <rect x="174" y="316" width="52" height="48" rx="8" fill="#f5c5a3" stroke="#1a1a1a" strokeWidth="6"/>
          <path d="M118 368 C128 346 168 338 200 338 C232 338 272 346 282 368 L298 420 L102 420 Z" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="4"/>
        </g>
      </svg>
    </div>
  );
}
