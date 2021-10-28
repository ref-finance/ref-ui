import React from 'react';

const CheckedBg = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="15" height="15" rx="4" fill="url(#paint0_linear_105:1138)" />
      <defs>
        <linearGradient
          id="paint0_linear_105:1138"
          x1="7.5"
          y1="0"
          x2="7.5"
          y2="15"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00C6A2" />
          <stop offset="1" stopColor="#008B72" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const Tick = () => {
  return (
    <svg
      width="10"
      height="8"
      viewBox="0 0 10 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 3.5L3.66667 6L9 1"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const CheckedTick = () => {
  return (
    <div className="relative">
      <CheckedBg />
      <div className="absolute top-1 left-0.5">
        <Tick />
      </div>
    </div>
  );
};

export const CheckedEmpty = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="15" height="15" rx="4" fill="#304452" />
    </svg>
  );
};
