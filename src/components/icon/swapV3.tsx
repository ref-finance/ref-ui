import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useClientMobile, isClientMobie } from '../../utils/device';

export const SwapMinReceiveCheck = () => {
  return (
    <svg
      width="18"
      height="14"
      viewBox="0 0 18 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.125 7L8.3125 9.1875L12.25 5.25"
        stroke="#91A2AE"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M14.4857 6.99227L10.8178 12.0747C9.79996 13.485 7.70004 13.485 6.68224 12.0747L3.01434 6.99228C1.79723 5.3058 3.00229 2.95 5.08209 2.95H12.4179C14.4977 2.95 15.7028 5.30579 14.4857 6.99227Z"
        stroke="#91A2AE"
        strokeWidth="1.1"
      />
    </svg>
  );
};

export const InputClear = () => {
  const [hover, setHover] = useState<boolean>(false);
  return (
    <div
      className={`relative flex items-center font-bold justify-center rounded-full ${
        hover
          ? 'text-warn border border-warn border-opacity-20'
          : 'text-v3SwapGray border border-transparent bg-primaryText bg-opacity-20'
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: '16px',
        width: '16px',
        fontSize: '9px',
      }}
    >
      ✕
    </div>
  );
};

export const NewProIcon = ({ colorLight }: { colorLight?: string }) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="32"
        height="32"
        rx="12"
        fill="url(#paint0_radial_1507_6301)"
      />
      <path
        opacity={!!colorLight ? '1' : '0.5'}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.7929 10.7396C14.1333 8.42012 17.8667 8.42012 19.2071 10.7396L23.5975 18.337C24.8286 20.4674 23.0867 23 20.3904 23H11.6096C8.91327 23 7.17137 20.4674 8.40246 18.337L12.7929 10.7396ZM17.069 11.7141C16.6222 10.9409 15.3778 10.9409 14.931 11.7141L10.5405 19.3115C10.1302 20.0216 10.7108 20.8658 11.6096 20.8658H20.3904C21.2892 20.8658 21.8698 20.0216 21.4595 19.3115L17.069 11.7141Z"
        fill={colorLight || '#001320'}
      />
      <defs>
        <radialGradient
          id="paint0_radial_1507_6301"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(2.90059e-07 7.5) rotate(41.6981) scale(36.8307 57.73)"
        >
          <stop stopColor="#00D6AF" />
          <stop offset="1" stopColor="#5B40FF" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export const NewProIconDefaultSwap = () => {
  return (
    <svg
      width="54"
      height="34"
      viewBox="0 0 54 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width="52"
        height="32"
        rx="12"
        fill="#374955"
        stroke="url(#paint0_linear_2432_2771)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.1393 15.0414C16.7908 16.2072 15.1541 17.5571 14.5212 18.2985C13.804 19.1386 12.5416 19.2383 11.7015 18.5211C10.8614 17.804 10.7618 16.5416 11.4789 15.7015C12.5533 14.4429 14.6727 12.7928 17.3608 11.4586C20.08 10.1088 23.5439 9 27.3415 9C34.953 9 40.3342 13.4354 42.4374 15.6094C43.2055 16.4032 43.1845 17.6694 42.3907 18.4374C41.5968 19.2054 40.3307 19.1845 39.5626 18.3906C37.796 16.5646 33.3885 13 27.3415 13C24.3098 13 21.4566 13.8912 19.1393 15.0414Z"
        fill="#202E38"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.1393 17.0414C16.7908 18.2072 15.1541 19.5571 14.5212 20.2985C13.804 21.1386 12.5416 21.2383 11.7015 20.5211C10.8614 19.804 10.7618 18.5416 11.4789 17.7015C12.5533 16.4429 14.6727 14.7928 17.3608 13.4586C20.08 12.1088 23.5439 11 27.3415 11C34.953 11 40.3342 15.4354 42.4374 17.6094C43.2055 18.4032 43.1845 19.6694 42.3907 20.4374C41.5968 21.2054 40.3307 21.1845 39.5626 20.3906C37.796 18.5646 33.3885 15 27.3415 15C24.3098 15 21.4566 15.8912 19.1393 17.0414Z"
        fill="#4A5B69"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.1393 16.0414C16.7908 17.2072 15.1541 18.5571 14.5212 19.2985C13.804 20.1386 12.5416 20.2383 11.7015 19.5211C10.8614 18.804 10.7618 17.5416 11.4789 16.7015C12.5533 15.4429 14.6727 13.7928 17.3608 12.4586C20.08 11.1088 23.5439 10 27.3415 10C34.953 10 40.3342 14.4354 42.4374 16.6094C43.2055 17.4032 43.1845 18.6694 42.3907 19.4374C41.5968 20.2054 40.3307 20.1845 39.5626 19.3906C37.796 17.5646 33.3885 14 27.3415 14C24.3098 14 21.4566 14.8912 19.1393 16.0414Z"
        fill="#293945"
      />
      <g filter="url(#filter0_d_2432_2771)">
        <circle cx="12" cy="19" r="4" fill="#506979" />
        <circle
          cx="12"
          cy="19"
          r="4.5"
          stroke="url(#paint1_linear_2432_2771)"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_2432_2771"
          x="1"
          y="8"
          width="22"
          height="22"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.65 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_2432_2771"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2432_2771"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_2432_2771"
          x1="27"
          y1="1"
          x2="27"
          y2="33"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4A5B69" />
          <stop offset="1" stopColor="#202E38" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2432_2771"
          x1="12"
          y1="15"
          x2="12"
          y2="23"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#81919E" />
          <stop offset="1" stopColor="#394E5B" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const ProIconHover = () => {
  return (
    <svg
      width="91"
      height="32"
      viewBox="0 0 91 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="91" height="32" rx="12" fill="url(#paint0_radial_492_2)" />
      <path
        opacity="0.5"
        d="M33 18C34.7073 16 40.5122 12 47.3415 12C54.1707 12 59.065 16 61 18"
        stroke="#001320"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <g filter="url(#filter0_d_492_2)">
        <circle cx="33.5" cy="17.5" r="3.5" fill="#00FFD1" />
        <circle cx="33.5" cy="17.5" r="4" stroke="url(#paint1_linear_492_2)" />
      </g>
      <g filter="url(#filter1_d_492_2)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.3684 11.6828V19.4025L15.3158 16.4531L15.7105 16.7993L12.4004 21.4617C11.1705 22.59 9 21.8266 9 20.2657V10.7343C9 9.11988 11.2976 8.38451 12.4834 9.61941L21.6316 19.1464V11.7434L18.0789 14.3761L17.6842 14.0299L20.4996 9.67775C21.6748 8.41998 24 9.14869 24 10.7747V20.0949C24 21.7093 21.7024 22.4447 20.5166 21.2098L11.3684 11.6828Z"
          fill="white"
        />
      </g>
      <path
        opacity="0.5"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M71.7929 10.7396C73.1333 8.42012 76.8667 8.42012 78.2071 10.7396L82.5975 18.337C83.8286 20.4674 82.0867 23 79.3904 23H70.6096C67.9133 23 66.1714 20.4674 67.4025 18.337L71.7929 10.7396ZM76.069 11.7141C75.6222 10.9409 74.3778 10.9409 73.931 11.7141L69.5405 19.3115C69.1302 20.0216 69.7108 20.8658 70.6096 20.8658H79.3904C80.2892 20.8658 80.8698 20.0216 80.4595 19.3115L76.069 11.7141Z"
        fill="#001320"
      />
      <defs>
        <filter
          id="filter0_d_492_2"
          x="23"
          y="7"
          width="21"
          height="21"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.65 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_492_2"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_492_2"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_d_492_2"
          x="7"
          y="7"
          width="19"
          height="17"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 1 0 0 0 0 0.82 0 0 0 0.6 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_492_2"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_492_2"
            result="shape"
          />
        </filter>
        <radialGradient
          id="paint0_radial_492_2"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(8.24856e-07 7.5) rotate(17.3951) scale(81.9511 73.7816)"
        >
          <stop stopColor="#00D6AF" />
          <stop offset="1" stopColor="#5B40FF" />
        </radialGradient>
        <linearGradient
          id="paint1_linear_492_2"
          x1="33.5"
          y1="14"
          x2="33.5"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00D6AF" />
          <stop offset="1" stopColor="#00705B" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const ProIconClick = () => {
  return (
    <svg
      width="91"
      height="32"
      viewBox="0 0 91 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="91" height="32" rx="12" fill="url(#paint0_radial_492_3)" />
      <path
        opacity="0.5"
        d="M33 18C34.7073 16 40.5122 12 47.3415 12C54.1707 12 59.065 16 61 18"
        stroke="#001320"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M33 18C34.7073 16 40.5122 12 47.3415 12C54.1707 12 59.065 16 61 18"
        stroke="#00FFD1"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <g filter="url(#filter0_d_492_3)">
        <circle cx="60.5" cy="17.5" r="3.5" fill="#00FFD1" />
        <circle cx="60.5" cy="17.5" r="4" stroke="url(#paint1_linear_492_3)" />
      </g>
      <g filter="url(#filter1_d_492_3)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.3684 11.6828V19.4025L15.3158 16.4531L15.7105 16.7993L12.4004 21.4617C11.1705 22.59 9 21.8266 9 20.2657V10.7343C9 9.11988 11.2976 8.38451 12.4834 9.61941L21.6316 19.1464V11.7434L18.0789 14.3761L17.6842 14.0299L20.4996 9.67775C21.6748 8.41998 24 9.14869 24 10.7747V20.0949C24 21.7093 21.7024 22.4447 20.5166 21.2098L11.3684 11.6828Z"
          fill="white"
        />
      </g>
      <g filter="url(#filter2_d_492_3)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M71.7929 10.7396C73.1333 8.42012 76.8667 8.42012 78.2071 10.7396L82.5975 18.337C83.8286 20.4674 82.0867 23 79.3904 23H70.6096C67.9133 23 66.1714 20.4674 67.4025 18.337L71.7929 10.7396ZM76.069 11.7141C75.6222 10.9409 74.3778 10.9409 73.931 11.7141L69.5405 19.3115C69.1302 20.0216 69.7108 20.8658 70.6096 20.8658H79.3904C80.2892 20.8658 80.8698 20.0216 80.4595 19.3115L76.069 11.7141Z"
          fill="white"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_492_3"
          x="50"
          y="7"
          width="21"
          height="21"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.65 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_492_3"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_492_3"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_d_492_3"
          x="7"
          y="7"
          width="19"
          height="17"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 1 0 0 0 0 0.82 0 0 0 0.6 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_492_3"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_492_3"
            result="shape"
          />
        </filter>
        <filter
          id="filter2_d_492_3"
          x="65"
          y="7"
          width="20"
          height="18"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 1 0 0 0 0 0.82 0 0 0 0.6 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_492_3"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_492_3"
            result="shape"
          />
        </filter>
        <radialGradient
          id="paint0_radial_492_3"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(8.24856e-07 7.5) rotate(17.3951) scale(81.9511 73.7816)"
        >
          <stop stopColor="#00D6AF" />
          <stop offset="1" stopColor="#5B40FF" />
        </radialGradient>
        <linearGradient
          id="paint1_linear_492_3"
          x1="60.5"
          y1="14"
          x2="60.5"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00D6AF" />
          <stop offset="1" stopColor="#00705B" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const ProIconClickSwap = () => {
  return (
    <svg
      width="53"
      height="32"
      viewBox="0 0 53 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="52"
        height="32"
        rx="12"
        fill="url(#paint0_linear_2432_2773)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.1393 14.0414C15.7908 15.2072 14.1541 16.5571 13.5212 17.2985C12.804 18.1386 11.5416 18.2383 10.7015 17.5211C9.86142 16.804 9.76175 15.5416 10.4789 14.7015C11.5533 13.4429 13.6727 11.7928 16.3608 10.4586C19.08 9.10882 22.5439 8 26.3415 8C33.953 8 39.3342 12.4354 41.4374 14.6094C42.2055 15.4032 42.1845 16.6694 41.3907 17.4374C40.5968 18.2054 39.3307 18.1845 38.5626 17.3906C36.796 15.5646 32.3885 12 26.3415 12C23.3098 12 20.4566 12.8912 18.1393 14.0414Z"
        fill="#157192"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.1393 16.0414C15.7908 17.2072 14.1541 18.5571 13.5212 19.2985C12.804 20.1386 11.5416 20.2383 10.7015 19.5211C9.86142 18.804 9.76175 17.5416 10.4789 16.7015C11.5533 15.4429 13.6727 13.7928 16.3608 12.4586C19.08 11.1088 22.5439 10 26.3415 10C33.953 10 39.3342 14.4354 41.4374 16.6094C42.2055 17.4032 42.1845 18.6694 41.3907 19.4374C40.5968 20.2054 39.3307 20.1845 38.5626 19.3906C36.796 17.5646 32.3885 14 26.3415 14C23.3098 14 20.4566 14.8912 18.1393 16.0414Z"
        fill="#6AAAF8"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.1393 15.0414C15.7908 16.2072 14.1541 17.5571 13.5212 18.2985C12.804 19.1386 11.5416 19.2383 10.7015 18.5211C9.86142 17.804 9.76175 16.5416 10.4789 15.7015C11.5533 14.4429 13.6727 12.7928 16.3608 11.4586C19.08 10.1088 22.5439 9 26.3415 9C33.953 9 39.3342 13.4354 41.4374 15.6094C42.2055 16.4032 42.1845 17.6694 41.3907 18.4374C40.5968 19.2054 39.3307 19.1845 38.5626 18.3906C36.796 16.5646 32.3885 13 26.3415 13C23.3098 13 20.4566 13.8912 18.1393 15.0414Z"
        fill="#00FFD1"
      />
      <g filter="url(#filter0_d_2432_2773)">
        <circle cx="42" cy="18" r="4" fill="#00FFD1" />
        <circle
          cx="42"
          cy="18"
          r="4.5"
          stroke="url(#paint1_linear_2432_2773)"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_2432_2773"
          x="31"
          y="7"
          width="22"
          height="22"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.65 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_2432_2773"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2432_2773"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_2432_2773"
          x1="26"
          y1="0"
          x2="26"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#09C7B8" />
          <stop offset="1" stopColor="#544CFA" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2432_2773"
          x1="42"
          y1="14"
          x2="42"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00D6AF" />
          <stop offset="1" stopColor="#00705B" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const CrossChainPop = () => {
  return (
    <svg
      width="156"
      height="40"
      viewBox="0 0 156 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative z-10 top-0"
      style={{
        left: '-14px',
      }}
    >
      <rect
        width="156"
        height="32"
        rx="8"
        fill="url(#paint0_radial_2223_878)"
      />
      <path
        d="M77.2 38.9333C77.6 39.4667 78.4 39.4667 78.8 38.9333L84 32H72L77.2 38.9333Z"
        fill="#4663ED"
      />
      <defs>
        <radialGradient
          id="paint0_radial_2223_878"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(1.41404e-06 7.5) rotate(10.3566) scale(136.283 76.058)"
        >
          <stop stopColor="#00D6AF" />
          <stop offset="1" stopColor="#5B40FF" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export const NewPro = ({
  ifCross,
  onClick,
}: {
  ifCross: boolean;
  onClick: (e?: any) => void;
}) => {
  const [hover, setHover] = useState<boolean>(false);

  const isMobile = useClientMobile();

  const intl = useIntl();

  return (
    <>
      <button
        className="relative h-8"
        style={{
          minWidth: '32px',
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={onClick}
      >
        {ifCross ? (
          <ProIconClickSwap />
        ) : !hover || isMobile ? (
          <>
            <NewProIconDefaultSwap />
          </>
        ) : (
          <NewProIconDefaultSwap />
        )}
        {hover && !isMobile && (
          <div
            className="absolute z-50"
            style={{
              bottom: '40px',
              right: isClientMobie() ? '-36px' : '-62px',
            }}
          >
            <span className="text-sm whitespace-nowrap text-white right-4 top-1.5 w-36 absolute z-40">
              <FormattedMessage
                id="cross_chain_swap"
                defaultMessage={'Cross-chain Swap'}
              />
            </span>
            <CrossChainPop />
          </div>
        )}
      </button>
    </>
  );
};

export const LimitOrderMask = () => {
  return (
    <svg
      width="448"
      height="265"
      viewBox="0 0 448 265"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute top-0 right-0"
    >
      <mask
        id="mask0_120_4097"
        style={{
          maskType: 'alpha',
        }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="448"
        height="265"
      >
        <rect width="448" height="265" rx="12" fill="black" />
      </mask>
      <g mask="url(#mask0_120_4097)">
        <circle
          opacity="0.1"
          cx="421"
          cy="12.8345"
          r="40.8952"
          transform="rotate(45 421 12.8345)"
          fill="url(#paint0_linear_120_4097)"
          stroke="url(#paint1_linear_120_4097)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          opacity="0.1"
          d="M-22 83.3478C-17.6273 92.0338 -2.32298 109.406 23.913 109.406C56.7081 109.406 69.8261 51 115.739 51C161.652 51 164.932 113 207.565 113C250.199 113 253.478 51 296.112 51C338.745 51 339.565 109.406 374 109.406"
          stroke="url(#paint2_linear_120_4097)"
          strokeWidth="16"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_120_4097"
          x1="421"
          y1="-28.0607"
          x2="421"
          y2="53.7297"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#26343E" />
          <stop offset="1" stopColor="#1D2932" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_120_4097"
          x1="377.902"
          y1="53.7297"
          x2="436.492"
          y2="53.7297"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" />
          <stop offset="1" stopColor="#5B40FF" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_120_4097"
          x1="384.664"
          y1="113"
          x2="100.995"
          y2="113"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0" />
          <stop offset="1" stopColor="#5B40FF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const MyOrderMask = () => {
  return (
    <svg
      width="840"
      height="184"
      viewBox="0 0 840 184"
      fill="rbg(28,37,45)"
      className="absolute top-0 right-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_20_201"
        style={{
          maskType: 'alpha',
        }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="840"
        height="184"
      >
        <rect width="840" height="184" rx="12" fill="black" />
      </mask>
      <g mask="url(#mask0_20_201)">
        <circle
          opacity="0.1"
          cx="806.751"
          cy="12.8345"
          r="47.3175"
          transform="rotate(45 806.751 12.8345)"
          fill="url(#paint0_linear_20_201)"
          stroke="url(#paint1_linear_20_201)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* <path
          opacity="0.1"
          d="M-9.99999 111.348C-5.61627 120.034 9.72672 137.406 36.029 137.406C68.9068 137.406 82.058 79 128.087 79C174.116 79 177.404 141 220.145 141C262.886 141 266.174 79 308.915 79C351.656 79 352.478 137.406 387 137.406"
          stroke="url(#paint2_linear_20_201)"
          strokeWidth="16"
          strokeLinecap="round"
        /> */}
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_20_201"
          x1="806.751"
          y1="-34.4829"
          x2="806.751"
          y2="60.152"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#26343E" />
          <stop offset="1" stopColor="#1D2932" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_20_201"
          x1="756.885"
          y1="60.152"
          x2="824.676"
          y2="60.152"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" />
          <stop offset="1" stopColor="#5B40FF" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_20_201"
          x1="397.691"
          y1="141"
          x2="113.305"
          y2="141"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0" />
          <stop offset="1" stopColor="#5B40FF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const MyOrderMask2 = () => {
  return (
    <svg
      width="395"
      height="78"
      viewBox="0 0 395 78"
      fill="none"
      className="absolute left-0 top-16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        opacity="0.1"
        d="M-9.99999 40.3478C-5.61627 49.0338 9.72672 66.4058 36.029 66.4058C68.9068 66.4058 82.058 8 128.087 8C174.116 8 177.404 70 220.145 70C262.886 70 266.174 8 308.915 8C351.656 8 352.478 66.4058 387 66.4058"
        stroke="url(#paint0_linear_20_204)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_20_204"
          x1="397.691"
          y1="70"
          x2="113.305"
          y2="70"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0" />
          <stop offset="1" stopColor="#5B40FF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const MyOrderCircle = () => {
  return (
    <svg
      width="38"
      height="23"
      viewBox="0 0 38 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* <path
        d="M23 11.5C23 17.8513 17.8513 23 11.5 23C5.14873 23 0 17.8513 0 11.5C0 5.14873 5.14873 0 11.5 0C17.8513 0 23 5.14873 23 11.5Z"
        fill="url(#paint0_linear_30_224)"
      /> */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21ZM11.5 23C17.8513 23 23 17.8513 23 11.5C23 5.14873 17.8513 0 11.5 0C5.14873 0 0 5.14873 0 11.5C0 17.8513 5.14873 23 11.5 23Z"
        fill="url(#paint1_linear_30_224)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26.5 21C31.7467 21 36 16.7467 36 11.5C36 6.25329 31.7467 2 26.5 2C21.2533 2 17 6.25329 17 11.5C17 16.7467 21.2533 21 26.5 21ZM26.5 23C32.8513 23 38 17.8513 38 11.5C38 5.14873 32.8513 0 26.5 0C20.1487 0 15 5.14873 15 11.5C15 17.8513 20.1487 23 26.5 23Z"
        fill="url(#paint2_linear_30_224)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.6001 18.7833C18.0244 19.3012 18.493 19.7814 19.0002 20.2181C19.5073 19.7814 19.976 19.3012 20.4003 18.7833C19.884 18.3504 19.4144 17.8637 19.0002 17.3317C18.5859 17.8637 18.1164 18.3504 17.6001 18.7833ZM19.0002 5.66837C18.5859 5.13639 18.1164 4.64965 17.6001 4.21678C18.0244 3.69887 18.493 3.21867 19.0002 2.78197C19.5073 3.21867 19.976 3.69887 20.4003 4.21678C19.884 4.64965 19.4144 5.13639 19.0002 5.66837Z"
        fill="url(#paint3_linear_30_224)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_30_224"
          x1="11.5"
          y1="0"
          x2="11.5"
          y2="23"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#26343E" />
          <stop offset="1" stopColor="#1D2932" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_30_224"
          x1="0.273809"
          y1="0.253304"
          x2="20.5648"
          y2="24.2203"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" />
          <stop offset="1" stopColor="#5B40FF" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_30_224"
          x1="15.2738"
          y1="0.253304"
          x2="35.5648"
          y2="24.2203"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" />
          <stop offset="1" stopColor="#5B40FF" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_30_224"
          x1="18.5"
          y1="3.5"
          x2="19.8753"
          y2="5.10674"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#28ACE6" />
          <stop offset="1" stopColor="#2F9DE9" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const MobileHistoryOrderStampText = ({
  text,
  color,
}: {
  text: string;
  color: string;
}) => {
  return (
    <div
      className={
        'opacity-20 text-center text-base rounded-xl min-w-24 px-2 py-1.5'
      }
      style={{
        color,
        border: `1px solid ${color}`,
        transform: 'rotate(-20deg)',
      }}
    >
      <FormattedMessage id={text} defaultMessage={text} />
    </div>
  );
};

export const MobileHistoryOrderStamp = ({
  state,
}: {
  state: 'filled' | 'cancel' | 'partially_filled' | 'swapped';
}) => {
  return (
    <div className="absolute top-32 left-1/2 transform -translate-x-1/2 ">
      {state === 'cancel' && (
        <MobileHistoryOrderStampText text="canceled" color="#DEA550" />
      )}
      {state === 'filled' && (
        <MobileHistoryOrderStampText text="filled" color="#00c6a2" />
      )}
      {state === 'partially_filled' && (
        <MobileHistoryOrderStampText text="partially_filled" color="#DEA550" />
      )}
      {state === 'swapped' && (
        <MobileHistoryOrderStampText
          text="swapped_history_order"
          color="#1AA189"
        />
      )}
    </div>
  );
};

export const MyOrderInstantSwapArrowRight = () => {
  return (
    <svg
      width="12"
      height="5"
      viewBox="0 0 12 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        opacity="0.65"
        d="M11.4313 4.36065C11.4371 4.36065 11.4422 4.36065 11.4473 4.35916L11.4655 4.35767L11.4779 4.35543L11.4969 4.35245C11.4998 4.35245 11.5034 4.35021 11.5071 4.35021C11.5132 4.34868 11.5193 4.34693 11.5253 4.34499L11.5355 4.34349L11.5544 4.33827C11.5581 4.33603 11.5617 4.33603 11.5646 4.33454L11.5821 4.32932C11.5857 4.3273 11.5897 4.32604 11.5937 4.32559L11.609 4.32036L11.6229 4.31514L11.6367 4.30992C11.6418 4.30843 11.6469 4.3047 11.6513 4.3032L11.6637 4.29798L11.679 4.28903L11.6892 4.28381L11.7066 4.27336L11.7154 4.26814L11.7321 4.25769L11.7409 4.25247C11.7461 4.249 11.751 4.245 11.7554 4.24053C11.7587 4.23852 11.7617 4.236 11.7642 4.23307C11.7698 4.23016 11.7747 4.22609 11.7788 4.22113C11.7817 4.2174 11.7868 4.21367 11.7904 4.21069C11.8094 4.19464 11.8271 4.17718 11.8436 4.15846C11.8465 4.15473 11.8501 4.151 11.8516 4.14727C11.8552 4.14429 11.8589 4.13907 11.8618 4.13534C11.8654 4.13011 11.8691 4.12489 11.8734 4.12116L11.8807 4.11221L11.8924 4.09729L11.8975 4.08833L11.9077 4.07043L11.9128 4.06222L11.923 4.04431L11.9281 4.03387L11.9368 4.0182L11.9419 4.00776L11.9492 3.99209L11.9543 3.97791L11.9594 3.96374L11.9645 3.94882C11.9663 3.94484 11.9673 3.94052 11.9674 3.93613L11.9725 3.91823C11.9747 3.91524 11.9747 3.91151 11.9762 3.90778L11.9812 3.88838L11.9827 3.87794C11.9846 3.87187 11.9858 3.86562 11.9863 3.85929C11.9863 3.85555 11.9885 3.85182 11.9885 3.84884C11.99 3.84138 11.99 3.83392 11.9914 3.82944L11.9936 3.81676L11.9951 3.79811C11.9951 3.79288 11.9951 3.78766 11.9965 3.78244C11.9965 3.77647 11.9965 3.77125 11.9987 3.76752C12.0004 3.74666 12.0004 3.7257 11.9987 3.70485C11.9987 3.69962 11.9987 3.6944 11.9965 3.69142C11.9965 3.68619 11.9965 3.68097 11.9951 3.67575L11.9936 3.65635L11.9914 3.64367L11.9885 3.62502C11.9885 3.62128 11.9863 3.61755 11.9863 3.61457C11.9849 3.60711 11.9827 3.59965 11.9827 3.59517L11.9812 3.58473L11.9762 3.56533C11.9747 3.5616 11.9747 3.55787 11.9725 3.55488L11.9674 3.53698C11.9657 3.53323 11.9647 3.52917 11.9645 3.52504L11.9594 3.50937L11.9543 3.4952L11.9492 3.48102L11.9419 3.4661L11.9368 3.45491C11.9339 3.44969 11.9317 3.44446 11.9281 3.43999L11.923 3.4288L11.9128 3.41164L11.9077 3.40268L11.8975 3.38478L11.8924 3.37657C11.889 3.37095 11.8851 3.3657 11.8807 3.3609C11.8788 3.35755 11.8763 3.35453 11.8734 3.35195C11.8705 3.34648 11.8666 3.34166 11.8618 3.33777C11.8582 3.33479 11.8545 3.32882 11.8516 3.32584L11.8414 3.31539L11.821 3.29301L8.79237 0.18483C8.73539 0.126247 8.66768 0.0797623 8.59312 0.0480446C8.51856 0.016327 8.43862 0 8.35788 0C8.27715 0 8.19721 0.016327 8.12265 0.0480446C8.04809 0.0797623 7.98038 0.126247 7.9234 0.18483C7.86621 0.243195 7.82083 0.312551 7.78986 0.388922C7.75889 0.465292 7.74295 0.547173 7.74295 0.629868C7.74295 0.712563 7.75889 0.794445 7.78986 0.870815C7.82083 0.947185 7.86621 1.01654 7.9234 1.07491L9.90389 3.10425H0.614759C0.451715 3.10425 0.295349 3.17059 0.180059 3.28868C0.0647692 3.40677 0 3.56694 0 3.73394C0 3.90095 0.0647692 4.06111 0.180059 4.1792C0.295349 4.29729 0.451715 4.36364 0.614759 4.36364L11.3876 4.36289H11.4182C11.4233 4.36289 11.4284 4.36065 11.4313 4.36065Z"
        fill="#7E8A93"
      />
    </svg>
  );
};

export const RefreshIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="10"
      height="8"
      viewBox="0 0 10 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.28537 7.33333V8L2.85339 6.66667L4.28537 5.33333V6H6.42799C6.87702 6.0001 7.31474 5.86851 7.67931 5.62382C8.04389 5.37914 8.31689 5.03372 8.45976 4.63636C8.60263 4.239 8.60815 3.80978 8.47554 3.40933C8.34293 3.00889 8.07888 2.65745 7.7207 2.40467L7.72856 2.39533L8.73559 1.45533C9.29415 1.89649 9.69406 2.48715 9.88121 3.1474C10.0684 3.80766 10.0337 4.50565 9.78196 5.14692C9.5302 5.7882 9.0735 6.34181 8.47362 6.73286C7.87375 7.12391 7.15967 7.33352 6.42799 7.33333L4.28466 7.334L4.28537 7.33333ZM5.71378 0.666667V0L7.17576 1.33333L5.71378 2.66667V2H3.57117C3.12207 2 2.68433 2.13171 2.31979 2.37654C1.95525 2.62136 1.68234 2.96692 1.53961 3.36438C1.39689 3.76185 1.39157 4.19112 1.5244 4.59157C1.65723 4.99201 1.92151 5.34337 2.27988 5.596L1.26357 6.544C0.705275 6.10279 0.305614 5.51218 0.118631 4.85204C-0.0683515 4.1919 -0.0336347 3.49409 0.218087 2.85296C0.469808 2.21184 0.926389 1.65835 1.52608 1.26733C2.12578 0.876314 2.83965 0.666641 3.57117 0.666667H5.71378Z"
        fill="#7E8A93"
      />
    </svg>
  );
};

export const LockIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="10"
      height="13"
      viewBox="0 0 10 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="6.5" width="9" height="6" rx="1.5" stroke="#7E8A93" />
      <path
        d="M8 3.69451C8 2.20637 6.65685 1 5 1C3.34314 1 2 2.20637 2 3.69451C2 4.16815 2.00001 6.08245 2.00001 6.08245"
        stroke="#7E8A93"
      />
    </svg>
  );
};
export const LockInIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="10"
      height="13"
      viewBox="0 0 10 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="6.5" width="9" height="6" rx="1.5" stroke="#00FFD1" />
      <path
        d="M2.00001 6.08245C2.00001 6.08245 2 4.16815 2 3.69451C2 2.20637 3.34314 1 5 1C6.65685 1 8 2.20637 8 3.69451C8 4.13484 8 6 8 6"
        stroke="#00FFD1"
      />
    </svg>
  );
};

export const ReduceIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="13"
      height="2"
      viewBox="0 0 13 2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0.907405C0 0.406259 0.408075 0 0.911461 0H11.3282C11.8315 0 12.2396 0.406259 12.2396 0.907405C12.2396 1.40855 11.8315 1.81481 11.3282 1.81481H0.911461C0.408075 1.81481 0 1.40855 0 0.907405Z"
        fill="#7E8A93"
      />
    </svg>
  );
};

export const PlusIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.03114 0.907405C7.03114 0.406259 6.62306 0 6.11968 0C5.61629 0 5.20821 0.406259 5.20821 0.907405V5.18506H0.911461C0.408075 5.18506 0 5.59132 0 6.09246C0 6.59361 0.408075 6.99987 0.911461 6.99987H5.20821V11.2777C5.20821 11.7789 5.61629 12.1852 6.11967 12.1852C6.62306 12.1852 7.03114 11.7789 7.03114 11.2777V6.99987H11.3282C11.8315 6.99987 12.2396 6.59361 12.2396 6.09246C12.2396 5.59132 11.8315 5.18506 11.3282 5.18506H7.03114V0.907405Z"
        fill="#7E8A93"
      />
    </svg>
  );
};

export const YellowTipIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 -1.37269e-07C10.8499 -1.37269e-07 14 3.15014 14 7C14 10.8499 10.8499 14 7 14C3.15014 14 -1.37269e-07 10.8499 -1.37269e-07 7C-1.37269e-07 3.15014 3.15014 -1.37269e-07 7 -1.37269e-07ZM7 12.6006C10.0805 12.6006 12.6006 10.0805 12.6006 7C12.6006 3.91954 10.0805 1.39943 7 1.39943C3.91954 1.39943 1.39943 3.91954 1.39943 7C1.39943 10.0805 3.91954 12.6006 7 12.6006V12.6006Z"
        fill="#FFA24D"
      />
      <path
        d="M7 2.75303C7.09235 2.75134 7.1841 2.76829 7.26975 2.80286C7.3554 2.83743 7.43321 2.88891 7.49852 2.95422C7.56384 3.01953 7.61531 3.09734 7.64988 3.18299C7.68445 3.26865 7.7014 3.36039 7.69971 3.45274V7.46774C7.70127 7.56001 7.68422 7.65165 7.6496 7.73719C7.61497 7.82273 7.56347 7.90043 7.49817 7.96564C7.43287 8.03085 7.35511 8.08224 7.26952 8.11675C7.18393 8.15126 7.09227 8.16818 7 8.1665C6.90765 8.16818 6.81591 8.15123 6.73025 8.11666C6.6446 8.0821 6.56679 8.03062 6.50148 7.96531C6.43617 7.89999 6.38469 7.82219 6.35012 7.73653C6.31555 7.65088 6.29861 7.55914 6.30029 7.46678V3.45274C6.29861 3.36039 6.31555 3.26865 6.35012 3.18299C6.38469 3.09734 6.43617 3.01953 6.50148 2.95422C6.56679 2.88891 6.6446 2.83743 6.73025 2.80286C6.81591 2.76829 6.90765 2.75134 7 2.75303ZM7 9.19364C7.09235 9.19195 7.1841 9.2089 7.26975 9.24347C7.3554 9.27804 7.43321 9.32952 7.49852 9.39483C7.56384 9.46014 7.61531 9.53795 7.64988 9.6236C7.68445 9.70926 7.7014 9.801 7.69971 9.89335V10.5472C7.7014 10.6396 7.68445 10.7313 7.64988 10.817C7.61531 10.9026 7.56384 10.9805 7.49852 11.0458C7.43321 11.1111 7.3554 11.1626 7.26975 11.1971C7.1841 11.2317 7.09235 11.2486 7 11.247C6.90765 11.2486 6.81591 11.2317 6.73025 11.1971C6.6446 11.1626 6.56679 11.1111 6.50148 11.0458C6.43617 10.9805 6.38469 10.9026 6.35012 10.817C6.31555 10.7313 6.29861 10.6396 6.30029 10.5472V9.89335C6.30079 9.70793 6.37467 9.53025 6.50579 9.39913C6.6369 9.26802 6.81458 9.19414 7 9.19364Z"
        fill="#FFA24D"
      />
    </svg>
  );
};

export const RedTipIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 0C10.8499 0 14 3.15014 14 7C14 10.8499 10.8499 14 7 14C3.15014 14 0 10.8499 0 7C0 3.15014 3.15014 0 7 0ZM7 12.6006C10.0805 12.6006 12.6006 10.0805 12.6006 7C12.6006 3.91954 10.0805 1.39943 7 1.39943C3.91954 1.39943 1.39943 3.91954 1.39943 7C1.39943 10.0805 3.91954 12.6006 7 12.6006Z"
        fill="#FF7575"
      />
      <path
        d="M7 2.75303C7.09235 2.75134 7.1841 2.76829 7.26975 2.80286C7.3554 2.83743 7.43321 2.88891 7.49852 2.95422C7.56384 3.01953 7.61531 3.09734 7.64988 3.18299C7.68445 3.26865 7.7014 3.36039 7.69971 3.45274V7.46774C7.70127 7.56001 7.68422 7.65165 7.6496 7.73719C7.61497 7.82273 7.56347 7.90043 7.49817 7.96564C7.43287 8.03085 7.35511 8.08224 7.26952 8.11675C7.18393 8.15126 7.09227 8.16818 7 8.1665C6.90765 8.16818 6.81591 8.15123 6.73025 8.11666C6.6446 8.0821 6.56679 8.03062 6.50148 7.96531C6.43617 7.89999 6.38469 7.82219 6.35012 7.73653C6.31555 7.65088 6.29861 7.55914 6.30029 7.46678V3.45274C6.29861 3.36039 6.31555 3.26865 6.35012 3.18299C6.38469 3.09734 6.43617 3.01953 6.50148 2.95422C6.56679 2.88891 6.6446 2.83743 6.73025 2.80286C6.81591 2.76829 6.90765 2.75134 7 2.75303ZM7 9.19364C7.09235 9.19195 7.1841 9.2089 7.26975 9.24347C7.3554 9.27804 7.43321 9.32952 7.49852 9.39483C7.56384 9.46014 7.61531 9.53795 7.64988 9.6236C7.68445 9.70926 7.7014 9.801 7.69971 9.89335V10.5472C7.7014 10.6396 7.68445 10.7313 7.64988 10.817C7.61531 10.9026 7.56384 10.9805 7.49852 11.0458C7.43321 11.1111 7.3554 11.1626 7.26975 11.1971C7.1841 11.2317 7.09235 11.2486 7 11.247C6.90765 11.2486 6.81591 11.2317 6.73025 11.1971C6.6446 11.1626 6.56679 11.1111 6.50148 11.0458C6.43617 10.9805 6.38469 10.9026 6.35012 10.817C6.31555 10.7313 6.29861 10.6396 6.30029 10.5472V9.89335C6.30079 9.70793 6.37467 9.53025 6.50579 9.39913C6.6369 9.26802 6.81458 9.19414 7 9.19364Z"
        fill="#FF7575"
      />
    </svg>
  );
};

export const SelectedIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="7" cy="7" r="7" fill="url(#paint0_linear_3173_354)" />
      <path
        d="M3.81738 6.72767L6.13143 8.90949L10.181 5.09131"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_3173_354"
          x1="7"
          y1="0"
          x2="7"
          y2="14"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00C6A2" />
          <stop offset="1" stopColor="#008B72" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const ArrowRight = (props: any) => {
  return (
    <svg
      {...props}
      width="16"
      height="5"
      viewBox="0 0 16 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        opacity="0.65"
        d="M15.2418 4.9694C15.2495 4.9694 15.2563 4.9694 15.2631 4.9677L15.2874 4.966L15.3039 4.96345L15.3292 4.96005C15.333 4.96005 15.3379 4.9575 15.3428 4.9575C15.3509 4.95576 15.359 4.95377 15.367 4.95155L15.3806 4.94985L15.4059 4.9439C15.4107 4.94134 15.4156 4.94135 15.4195 4.93964L15.4428 4.93369C15.4476 4.9314 15.4529 4.92995 15.4583 4.92944L15.4787 4.92349L15.4972 4.91754L15.5156 4.91159C15.5224 4.90989 15.5292 4.90564 15.5351 4.90393L15.5516 4.89798L15.572 4.88778L15.5856 4.88183L15.6089 4.86993L15.6205 4.86397L15.6429 4.85207L15.6545 4.84612C15.6615 4.84216 15.668 4.8376 15.6739 4.83252C15.6783 4.83022 15.6822 4.82735 15.6856 4.82401C15.6931 4.82069 15.6997 4.81606 15.705 4.81041C15.7089 4.80616 15.7157 4.80191 15.7206 4.79851C15.7458 4.78021 15.7695 4.76032 15.7914 4.73899C15.7953 4.73474 15.8002 4.73049 15.8021 4.72624C15.807 4.72283 15.8118 4.71688 15.8157 4.71263C15.8206 4.70668 15.8254 4.70073 15.8313 4.69648L15.841 4.68627L15.8565 4.66927L15.8633 4.65907L15.8769 4.63866L15.8837 4.62931L15.8973 4.6089L15.9041 4.597L15.9158 4.57915L15.9226 4.56724L15.9323 4.54939L15.9391 4.53323L15.9459 4.51708L15.9527 4.50007C15.9551 4.49554 15.9564 4.49062 15.9565 4.48562L15.9633 4.46521C15.9663 4.46181 15.9663 4.45756 15.9682 4.45331L15.975 4.4312L15.9769 4.4193C15.9794 4.41239 15.981 4.40526 15.9818 4.39804C15.9818 4.39379 15.9847 4.38954 15.9847 4.38614C15.9867 4.37764 15.9867 4.36914 15.9886 4.36404L15.9915 4.34958L15.9935 4.32833C15.9935 4.32237 15.9935 4.31642 15.9954 4.31047C15.9954 4.30367 15.9954 4.29772 15.9983 4.29347C16.0006 4.2697 16.0006 4.24581 15.9983 4.22205C15.9983 4.21609 15.9983 4.21014 15.9954 4.20674C15.9954 4.20079 15.9954 4.19484 15.9935 4.18889L15.9915 4.16678L15.9886 4.15233L15.9847 4.13107C15.9847 4.12682 15.9818 4.12257 15.9818 4.11917C15.9799 4.11066 15.9769 4.10216 15.9769 4.09706L15.975 4.08516L15.9682 4.06305C15.9663 4.0588 15.9663 4.05455 15.9633 4.05115L15.9565 4.03074C15.9543 4.02647 15.9529 4.02185 15.9527 4.01714L15.9459 3.99928L15.9391 3.98313L15.9323 3.96697L15.9226 3.94997L15.9158 3.93722C15.9119 3.93126 15.909 3.92531 15.9041 3.92021L15.8973 3.90746L15.8837 3.8879L15.8769 3.8777L15.8633 3.8573L15.8565 3.84794C15.852 3.84154 15.8468 3.83556 15.841 3.83009C15.8384 3.82627 15.8351 3.82283 15.8313 3.81988C15.8274 3.81365 15.8221 3.80816 15.8157 3.80373C15.8109 3.80033 15.806 3.79353 15.8021 3.79013L15.7885 3.77822L15.7613 3.75272L11.7232 0.210633C11.6472 0.143871 11.5569 0.0908972 11.4575 0.0547517C11.3581 0.0186063 11.2515 0 11.1438 0C11.0362 0 10.9296 0.0186063 10.8302 0.0547517C10.7308 0.0908972 10.6405 0.143871 10.5645 0.210633C10.4883 0.277145 10.4278 0.356184 10.3865 0.443216C10.3452 0.530248 10.3239 0.623559 10.3239 0.717798C10.3239 0.812037 10.3452 0.90535 10.3865 0.992381C10.4278 1.07941 10.4883 1.15845 10.5645 1.22496L13.2052 3.53761H0.819679C0.602287 3.53761 0.393798 3.61321 0.240079 3.74779C0.0863589 3.88236 0 4.06489 0 4.2552C0 4.44552 0.0863589 4.62805 0.240079 4.76262C0.393798 4.8972 0.602287 4.9728 0.819679 4.9728L15.1835 4.97195H15.2243C15.2311 4.97195 15.2379 4.9694 15.2418 4.9694Z"
        fill="#7E8A93"
      />
    </svg>
  );
};

export const ArrowDownV3 = (props: any) => {
  return (
    <svg
      {...props}
      width="11"
      height="7"
      viewBox="0 0 11 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L5.5 5L10 1"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  );
};

export const FilledEllipse = () => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 7C1 6.24503 1.13944 5.52263 1.39397 4.85714M7 1C10.3137 1 13 3.68629 13 7C13 10.3137 10.3137 13 7 13C4.48017 13 2.32315 11.4467 1.43424 9.2453M4.42857 1.5774C3.78605 1.88263 3.20639 2.29869 2.71429 2.80087"
        stroke="#647DFF"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};
