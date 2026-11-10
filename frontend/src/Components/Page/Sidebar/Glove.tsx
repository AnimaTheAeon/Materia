import React from 'react';

interface GloveProps {
  className?: string;
}

// The white pointing-glove menu cursor.
function Glove({ className }: GloveProps) {
  return (
    <svg
      className={className}
      width="26"
      height="16"
      viewBox="0 0 30 18"
      aria-hidden="true"
    >
      <path d="M1 5h4v9H1z" fill="#c9cbd6" stroke="#1c1c2a" strokeWidth="1" />
      <path
        d="M5 4.5c2-1.5 4-2 6-1.6l3 .6h12.5a2 2 0 010 4H17v.8h1.6a1.6 1.6 0 010 3.2H17v.6h1.3a1.5 1.5 0 010 3H17v.2a1.5 1.5 0 01-1.5 1.5H8c-1.5 0-3-1-3-1z"
        fill="#ffffff"
        stroke="#1c1c2a"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M17 8.3h-3M17 11.9h-3M17 14.8h-3"
        stroke="#8c90a8"
        strokeWidth=".9"
      />
    </svg>
  );
}

export default Glove;
