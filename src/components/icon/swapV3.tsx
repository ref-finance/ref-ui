import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import { useClientMobile } from '../../utils/device';

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
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
        <ProIconClick />
      ) : !hover || isMobile ? (
        <>
          <NewProIcon />
        </>
      ) : (
        <div
          className="flex items-center justify-center"
          data-class="reactTip"
          data-for={'swap_pro_tip'}
          data-place="top"
          data-html={true}
          data-tip={`
    
  <div class="text-xs min-w-32 text-farmText">

  ${intl.formatMessage({
    id: 'swap_with_aurora_liquidity',
    defaultMessage: 'SWAP with Aurora Liquidity',
  })}
</div>
  `}
        >
          <ProIconHover />
          {hover ? (
            <ReactTooltip
              id={'swap_pro_tip'}
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          ) : null}
        </div>
      )}
    </button>
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
      className={'opacity-20 text-center text-lg rounded-xl min-w-24 p-2'}
      style={{
        color,
        border: `1px solid ${color}`,
        transform: 'rotate(20deg)',
      }}
    >
      <FormattedMessage id={text} />
    </div>
  );
};

export const MobileHistoryOrderStamp = ({
  state,
}: {
  state: 'filled' | 'cancel' | 'partially_filled';
}) => {
  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 ">
      {state === 'cancel' && (
        <MobileHistoryOrderStampText text="canceled" color="#DEA550" />
      )}
      {state === 'filled' && (
        <MobileHistoryOrderStampText text="filled" color="#00c6a2" />
      )}
      {state === 'partially_filled' && (
        <MobileHistoryOrderStampText text="partially_filled" color="#00c6a2" />
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
