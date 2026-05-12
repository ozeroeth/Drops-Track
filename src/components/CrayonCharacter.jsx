import React, { useEffect } from 'react';

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
      const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 300);
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
        zIndex: 0,
        pointerEvents: 'none',
      }}
      className="crayon-char-size"
    >
      <svg
        viewBox="0 0 400 420"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Ears */}
        <ellipse cx="108" cy="210" rx="20" ry="26" fill="#f5c5a3" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="292" cy="210" rx="20" ry="26" fill="#f5c5a3" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

        {/* Neck */}
        <rect x="178" y="305" width="44" height="40" fill="#f5c5a3" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" rx="3" />

        {/* Shirt */}
        <path d="M145 340 Q200 335 255 340 Q275 365 280 420 L120 420 Q125 365 145 340Z" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

        {/* Head */}
        <ellipse cx="200" cy="200" rx="88" ry="98" fill="#f5c5a3" stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />

        {/* Crayon texture on face */}
        <path d="M148 175 Q153 172 158 176" fill="none" stroke="#e8b090" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M232 255 Q242 252 248 258" fill="none" stroke="#e8b090" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <path d="M162 248 Q167 245 172 249" fill="none" stroke="#e8b090" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

        {/* Messy spiky hair */}
        <path d="M122 158 Q132 88 162 78 Q172 58 187 73 Q197 48 212 68 Q227 43 242 70 Q257 53 262 78 Q282 83 287 108 Q302 128 292 153 Q287 143 272 133 Q262 113 247 118 Q232 93 212 108 Q192 88 177 106 Q157 98 147 123 Q132 133 122 158Z" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Hair texture */}
        <path d="M157 93 Q162 83 167 88" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <path d="M222 78 Q227 68 232 76" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <path d="M252 98 Q257 90 262 96" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />

        {/* Left eyebrow */}
        <path d="M137 172 Q152 162 177 170" fill="none" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Right eyebrow */}
        <path d="M223 170 Q248 162 263 172" fill="none" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Left eye white */}
        <ellipse cx="160" cy="200" rx="21" ry="19" fill="#ffffff" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {/* Right eye white */}
        <ellipse cx="240" cy="200" rx="21" ry="19" fill="#ffffff" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

        {/* Left pupil */}
        <circle id="pupilLeft" cx="160" cy="200" r="11" fill="#1a1a1a" />
        {/* Left highlight */}
        <circle cx="155" cy="195" r="4" fill="#ffffff" opacity="0.8" />

        {/* Right pupil */}
        <circle id="pupilRight" cx="240" cy="200" r="11" fill="#1a1a1a" />
        {/* Right highlight */}
        <circle cx="235" cy="195" r="4" fill="#ffffff" opacity="0.8" />

        {/* Nose */}
        <path d="M195 228 Q200 242 205 228" fill="none" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

        {/* Smile */}
        <path d="M172 262 Q200 288 228 262" fill="none" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
