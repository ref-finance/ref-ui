import React from 'react';

export function FooterLogo() {
  return (
    <div className="absolute left-0 top-0 -mt-5">
      <svg
        width="138"
        height="59"
        viewBox="0 0 138 59"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_bd_148:1048)">
          <rect
            x="11"
            y="11"
            width="116"
            height="37"
            rx="18.5"
            fill="url(#paint0_linear_148:1048)"
            shapeRendering="crispEdges"
          />
          <rect
            x="11"
            y="11"
            width="116"
            height="37"
            rx="18.5"
            stroke="url(#paint1_linear_148:1048)"
            shapeRendering="crispEdges"
          />
        </g>
        <circle cx="28.5" cy="29.5" r="18" stroke="#00D6AF" />
        <path d="M31.1001 37.4428H37.443L31.1001 31.1V37.4428Z" fill="white" />
        <path
          d="M37.4429 20L33.7429 20L37.4429 23.7L37.4429 20Z"
          fill="#00C6A2"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M31.3644 31.1C31.2757 31.1 31.1876 31.0977 31.1001 31.0932V27.1229L35.4176 23.1138C36.0263 23.9446 36.3858 24.9696 36.3858 26.0786C36.3858 28.8518 34.1376 31.1 31.3644 31.1ZM34.2899 21.9969L31.1001 24.9589V21.064C31.1876 21.0594 31.2757 21.0571 31.3644 21.0571C32.4559 21.0571 33.4662 21.4054 34.2899 21.9969Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M30.5714 21.0571H25.8142V25.7501L27.9489 27.8848L30.5714 25.4497V21.0571ZM30.5714 27.6136L27.9081 30.0866L25.8142 27.9927V37.4428H30.5714V27.6136Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M25.2857 21.0571H20V27.8644L23.9642 23.9002L25.2857 25.2216V21.0571ZM25.2857 27.4642L23.9642 26.1427L20 30.1069V37.4428H25.2857V27.4642Z"
          fill="white"
        />
        <defs>
          <filter
            id="filter0_bd_148:1048"
            x="-39.5"
            y="-39.5"
            width="217"
            height="138"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feGaussianBlur in="BackgroundImage" stdDeviation="25" />
            <feComposite
              in2="SourceAlpha"
              operator="in"
              result="effect1_backgroundBlur_148:1048"
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
              in2="effect1_backgroundBlur_148:1048"
              result="effect2_dropShadow_148:1048"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect2_dropShadow_148:1048"
              result="shape"
            />
          </filter>
          <linearGradient
            id="paint0_linear_148:1048"
            x1="125.449"
            y1="46.9825"
            x2="56.5031"
            y2="-29.8383"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.0641396" stopColor="white" stopOpacity="0.08" />
            <stop offset="1" stopColor="white" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_148:1048"
            x1="124.458"
            y1="11"
            x2="64.2678"
            y2="84.9892"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00C6A2" stopOpacity="0.83" />
            <stop offset="0.588542" stopColor="#73818B" stopOpacity="0.56" />
            <stop offset="1" stopColor="#00BA98" stopOpacity="0.28" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
