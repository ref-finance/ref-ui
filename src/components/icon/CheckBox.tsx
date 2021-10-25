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
          <stop stop-color="#00C6A2" />
          <stop offset="1" stop-color="#008B72" />
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
      <g filter="url(#filter0_bd_105:1137)">
        <rect width="15" height="15" rx="4" fill="#304452" />
      </g>
      <defs>
        <filter
          id="filter0_bd_105:1137"
          x="-40"
          y="-40"
          width="115"
          height="115"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImage" stdDeviation="25" />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_105:1137"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_backgroundBlur_105:1137"
            result="effect2_dropShadow_105:1137"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_105:1137"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
