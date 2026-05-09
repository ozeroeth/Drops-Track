const STICKERS = [
  { emoji: '🎭', top: 5, left: 8, rotation: -12, size: 40, opacity: 0.05 },
  { emoji: '🖼️', top: 12, left: 85, rotation: 18, size: 36, opacity: 0.04 },
  { emoji: '⚡', top: 8, left: 42, rotation: -5, size: 48, opacity: 0.06 },
  { emoji: '🔮', top: 20, left: 15, rotation: 22, size: 32, opacity: 0.05 },
  { emoji: '💎', top: 18, left: 72, rotation: -28, size: 44, opacity: 0.07 },
  { emoji: '🌊', top: 30, left: 5, rotation: 10, size: 38, opacity: 0.04 },
  { emoji: '🎨', top: 28, left: 90, rotation: -15, size: 52, opacity: 0.05 },
  { emoji: '🦊', top: 35, left: 55, rotation: 25, size: 28, opacity: 0.06 },
  { emoji: '🐸', top: 42, left: 20, rotation: -8, size: 36, opacity: 0.05 },
  { emoji: '👾', top: 40, left: 78, rotation: 14, size: 44, opacity: 0.04 },
  { emoji: '🚀', top: 48, left: 35, rotation: -20, size: 56, opacity: 0.06 },
  { emoji: '🌙', top: 55, left: 92, rotation: 8, size: 32, opacity: 0.05 },
  { emoji: '⭐', top: 52, left: 62, rotation: -30, size: 24, opacity: 0.07 },
  { emoji: '🔥', top: 60, left: 10, rotation: 16, size: 48, opacity: 0.05 },
  { emoji: '💫', top: 58, left: 48, rotation: -22, size: 40, opacity: 0.04 },
  { emoji: '🎯', top: 65, left: 82, rotation: 12, size: 36, opacity: 0.06 },
  { emoji: '🎪', top: 70, left: 25, rotation: -18, size: 52, opacity: 0.05 },
  { emoji: '🦋', top: 72, left: 68, rotation: 28, size: 30, opacity: 0.04 },
  { emoji: '🌈', top: 78, left: 45, rotation: -10, size: 44, opacity: 0.07 },
  { emoji: '💠', top: 82, left: 8, rotation: 20, size: 36, opacity: 0.05 },
  { emoji: '🔷', top: 85, left: 58, rotation: -25, size: 28, opacity: 0.06 },
  { emoji: '🎲', top: 88, left: 88, rotation: 6, size: 64, opacity: 0.04 },
  { emoji: '⚡', top: 92, left: 30, rotation: -14, size: 38, opacity: 0.05 },
  { emoji: '🔮', top: 15, left: 50, rotation: 30, size: 26, opacity: 0.06 },
  { emoji: '💎', top: 75, left: 3, rotation: -6, size: 42, opacity: 0.05 },
];

export default function BackgroundDecoration() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Sticker emojis */}
      {STICKERS.map((sticker, index) => (
        <span
          key={index}
          className="absolute select-none"
          style={{
            top: `${sticker.top}%`,
            left: `${sticker.left}%`,
            transform: `rotate(${sticker.rotation}deg)`,
            fontSize: `${sticker.size}px`,
            opacity: sticker.opacity,
          }}
        >
          {sticker.emoji}
        </span>
      ))}

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(249,115,26,0.03) 0%, transparent 70%)',
        }}
      />

      {/* Animated gradient orb - bottom right */}
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full animate-orb-pulse"
        style={{
          background: '#9945FF',
          opacity: 0.06,
          filter: 'blur(120px)',
        }}
      />
    </div>
  );
}
