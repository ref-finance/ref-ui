import React from 'react';

export function BgShapeTopRight() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: -50,
        pointerEvents: 'none',
      }}
    >
      <svg
        width="311"
        height="37"
        viewBox="0 0 311 37"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.21582 -42.4513C0.21582 -42.4513 26.7306 10.5962 49.0933 26.0339C74.9327 43.8685 113.271 35.0986 140.551 27.2419C181.125 15.5566 223.201 -2.84403 259.799 -25.116C339.908 -73.8542 317.288 -89.5336 249.436 -55.4349C199.359 -30.2619 96.048 -40.373 76.274 -40.3729C56.5 -40.3728 0.21582 -42.4513 0.21582 -42.4513Z"
          fill="#00C08B"
        />
      </svg>
    </div>
  );
}

export function BgShapeLeftBottom() {
  return (
    <div
      style={{
        position: 'absolute',
        left: 16,
        bottom: 12,
        pointerEvents: 'none',
      }}
    >
      <svg
        width="88"
        height="88"
        viewBox="0 0 88 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 0L88 88V0H0Z" fill="#00C08B" />
      </svg>
    </div>
  );
}
