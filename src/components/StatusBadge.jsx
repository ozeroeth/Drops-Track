import React from 'react';

const STATUS_STYLES = {
  Active: { bg: 'rgba(0,200,150,0.1)', border: 'rgba(0,200,150,0.3)', color: '#00C896' },
  Whitelisted: { bg: 'rgba(0,200,150,0.1)', border: 'rgba(0,200,150,0.3)', color: '#00C896' },
  Minted: { bg: 'rgba(0,200,150,0.1)', border: 'rgba(0,200,150,0.3)', color: '#00C896' },
  Pending: { bg: 'rgba(255,184,0,0.1)', border: 'rgba(255,184,0,0.3)', color: '#FFB800' },
  Applied: { bg: 'rgba(255,184,0,0.1)', border: 'rgba(255,184,0,0.3)', color: '#FFB800' },
  Missed: { bg: 'rgba(255,71,87,0.1)', border: 'rgba(255,71,87,0.3)', color: '#FF4757' },
  'Not Selected': { bg: 'rgba(255,71,87,0.1)', border: 'rgba(255,71,87,0.3)', color: '#FF4757' },
  Claimed: { bg: 'rgba(0,209,255,0.1)', border: 'rgba(0,209,255,0.3)', color: '#00D1FF' },
};

const FALLBACK_STYLE = { bg: 'rgba(136,146,164,0.1)', border: 'rgba(136,146,164,0.3)', color: '#8892A4' };

export default function StatusBadge({ status }) {
  const label = status || 'Unknown';
  const style = STATUS_STYLES[status] || FALLBACK_STYLE;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: style.color }}
      />
      {label}
    </span>
  );
}
