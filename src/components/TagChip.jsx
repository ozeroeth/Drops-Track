import React from 'react';

export default function TagChip({ children, style = {}, className = '', ...rest }) {
  return (
    <span
      className={`tag-chip inline-flex items-center font-medium leading-none whitespace-nowrap ${className}`.trim()}
      style={{
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
