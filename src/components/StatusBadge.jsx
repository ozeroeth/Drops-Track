import React from 'react';

const STATUS_STYLES = {
  Active: 'sketch-badge-green',
  Whitelisted: 'sketch-badge-green',
  Minted: 'sketch-badge-blue',
  Pending: 'sketch-badge-orange',
  Applied: 'sketch-badge-orange',
  Missed: 'sketch-badge-red',
  'Not Selected': 'sketch-badge-red',
  Claimed: 'sketch-badge-blue',
};

const FALLBACK_STYLE = 'sketch-badge-orange';

export default function StatusBadge({ status }) {
  const label = status || 'Unknown';
  const style = STATUS_STYLES[status] || FALLBACK_STYLE;
  return (
    <span className={'sketch-badge ' + style}>
      {label}
    </span>
  );
}
