import React from 'react';

export const ReturnIcon = function (props: any) {
  return (
    <svg
      {...props}
      width="6"
      height="12"
      viewBox="0 0 6 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.31201 1L1.00012 5.85088L5.31201 10.7018"
        stroke="white"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const AddIcon = function (props: any) {
  return (
    <svg
      {...props}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="11"
        cy="11"
        r="10"
        transform="rotate(-90 11 11)"
        stroke="#91A2AE"
        strokeOpacity="0.2"
        strokeWidth="1.2"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9749 6.77447C11.9749 6.34674 11.6282 6 11.2004 6C10.7727 6 10.426 6.34674 10.426 6.77447V10.4255H6.77447C6.34674 10.4255 6 10.7723 6 11.2C6 11.6277 6.34674 11.9745 6.77447 11.9745H10.426V15.6255C10.426 16.0533 10.7727 16.4 11.2004 16.4C11.6282 16.4 11.9749 16.0533 11.9749 15.6255V11.9745H15.6255C16.0533 11.9745 16.4 11.6277 16.4 11.2C16.4 10.7723 16.0533 10.4255 15.6255 10.4255H11.9749V6.77447Z"
        fill="#586F80"
      />
    </svg>
  );
};

export const SelectIcon = function (props: any) {
  return (
    <svg
      {...props}
      width="12"
      height="6"
      viewBox="0 0 12 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L5.85088 5.31189L10.7018 1"
        stroke="white"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const BgIcon = function (props: any) {
  return (
    <svg
      {...props}
      width="392"
      height="397"
      viewBox="0 0 392 397"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_124_4873"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="392"
        height="397"
      >
        <rect width="392" height="397" rx="12" fill="black" />
      </mask>
      <g mask="url(#mask0_124_4873)">
        <circle
          opacity="0.1"
          cx="375"
          cy="22.8345"
          r="40.8952"
          transform="rotate(45 375 22.8345)"
          fill="url(#paint0_linear_124_4873)"
          stroke="url(#paint1_linear_124_4873)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          opacity="0.1"
          d="M-28 216.348C-23.6273 225.034 -8.32298 242.406 17.913 242.406C50.7081 242.406 63.8261 184 109.739 184C155.652 184 158.932 246 201.565 246C244.199 246 247.478 184 290.112 184C332.745 184 333.565 242.406 368 242.406"
          stroke="url(#paint2_linear_124_4873)"
          strokeWidth="16"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_124_4873"
          x1="375"
          y1="-18.0607"
          x2="375"
          y2="63.7297"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#26343E" />
          <stop offset="1" stopColor="#1D2932" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_124_4873"
          x1="331.902"
          y1="63.7297"
          x2="390.492"
          y2="63.7297"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" />
          <stop offset="1" stopColor="#5B40FF" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_124_4873"
          x1="378.664"
          y1="246"
          x2="94.9946"
          y2="246"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0" />
          <stop offset="1" stopColor="#5B40FF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const SwitchButton = function (props: any) {
  return (
    <svg
      {...props}
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 4.11538H9.65385L6.53846 1"
        stroke="#00C6A2"
        strokeLinecap="round"
      />
      <path
        d="M10 6.88462L1.34615 6.88461L4.46154 10"
        stroke="#00C6A2"
        strokeLinecap="round"
      />
    </svg>
  );
};
