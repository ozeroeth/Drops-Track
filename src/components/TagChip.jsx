import React from 'react';

export default function TagChip({ children, style = {}, className = '', ...rest }) {
  return (
    <span
      className={`inline-flex items-center font-medium leading-none whitespace-nowrap ${className}`.trim()}
      style={{
        backgroundColor: 'rgba(139,92,246,0.15)',
        border: '1px solid rgba(139,92,246,0.3)',
        color: '#A78BFA',
        borderRadius: '100px',
        fontSize: '11px',
        padding: '2px 10px',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
