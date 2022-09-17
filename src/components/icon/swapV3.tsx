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
        stroke-width="1.1"
        stroke-linecap="round"
      />
      <path
        d="M14.4857 6.99227L10.8178 12.0747C9.79996 13.485 7.70004 13.485 6.68224 12.0747L3.01434 6.99228C1.79723 5.3058 3.00229 2.95 5.08209 2.95H12.4179C14.4977 2.95 15.7028 5.30579 14.4857 6.99227Z"
        stroke="#91A2AE"
        stroke-width="1.1"
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
        fill-rule="evenodd"
        clip-rule="evenodd"
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
          <stop stop-color="#00D6AF" />
          <stop offset="1" stop-color="#5B40FF" />
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
        stroke-width="4"
        stroke-linecap="round"
      />
      <g filter="url(#filter0_d_492_2)">
        <circle cx="33.5" cy="17.5" r="3.5" fill="#00FFD1" />
        <circle cx="33.5" cy="17.5" r="4" stroke="url(#paint1_linear_492_2)" />
      </g>
      <g filter="url(#filter1_d_492_2)">
        <path
          fillRule="evenodd"
          clip-rule="evenodd"
          d="M11.3684 11.6828V19.4025L15.3158 16.4531L15.7105 16.7993L12.4004 21.4617C11.1705 22.59 9 21.8266 9 20.2657V10.7343C9 9.11988 11.2976 8.38451 12.4834 9.61941L21.6316 19.1464V11.7434L18.0789 14.3761L17.6842 14.0299L20.4996 9.67775C21.6748 8.41998 24 9.14869 24 10.7747V20.0949C24 21.7093 21.7024 22.4447 20.5166 21.2098L11.3684 11.6828Z"
          fill="white"
        />
      </g>
      <path
        opacity="0.5"
        fillRule="evenodd"
        clip-rule="evenodd"
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
          <stop stop-color="#00D6AF" />
          <stop offset="1" stop-color="#5B40FF" />
        </radialGradient>
        <linearGradient
          id="paint1_linear_492_2"
          x1="33.5"
          y1="14"
          x2="33.5"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#00D6AF" />
          <stop offset="1" stop-color="#00705B" />
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
        stroke-width="4"
        stroke-linecap="round"
      />
      <path
        d="M33 18C34.7073 16 40.5122 12 47.3415 12C54.1707 12 59.065 16 61 18"
        stroke="#00FFD1"
        stroke-width="4"
        stroke-linecap="round"
      />
      <g filter="url(#filter0_d_492_3)">
        <circle cx="60.5" cy="17.5" r="3.5" fill="#00FFD1" />
        <circle cx="60.5" cy="17.5" r="4" stroke="url(#paint1_linear_492_3)" />
      </g>
      <g filter="url(#filter1_d_492_3)">
        <path
          fillRule="evenodd"
          clip-rule="evenodd"
          d="M11.3684 11.6828V19.4025L15.3158 16.4531L15.7105 16.7993L12.4004 21.4617C11.1705 22.59 9 21.8266 9 20.2657V10.7343C9 9.11988 11.2976 8.38451 12.4834 9.61941L21.6316 19.1464V11.7434L18.0789 14.3761L17.6842 14.0299L20.4996 9.67775C21.6748 8.41998 24 9.14869 24 10.7747V20.0949C24 21.7093 21.7024 22.4447 20.5166 21.2098L11.3684 11.6828Z"
          fill="white"
        />
      </g>
      <g filter="url(#filter2_d_492_3)">
        <path
          fillRule="evenodd"
          clip-rule="evenodd"
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
          <stop stop-color="#00D6AF" />
          <stop offset="1" stop-color="#5B40FF" />
        </radialGradient>
        <linearGradient
          id="paint1_linear_492_3"
          x1="60.5"
          y1="14"
          x2="60.5"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#00D6AF" />
          <stop offset="1" stop-color="#00705B" />
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
          stroke-width="16"
          stroke-linecap="round"
        />
        <path
          opacity="0.1"
          d="M-22 83.3478C-17.6273 92.0338 -2.32298 109.406 23.913 109.406C56.7081 109.406 69.8261 51 115.739 51C161.652 51 164.932 113 207.565 113C250.199 113 253.478 51 296.112 51C338.745 51 339.565 109.406 374 109.406"
          stroke="url(#paint2_linear_120_4097)"
          stroke-width="16"
          stroke-linecap="round"
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
          <stop stop-color="#26343E" />
          <stop offset="1" stop-color="#1D2932" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_120_4097"
          x1="377.902"
          y1="53.7297"
          x2="436.492"
          y2="53.7297"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#00FFD1" />
          <stop offset="1" stop-color="#5B40FF" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_120_4097"
          x1="384.664"
          y1="113"
          x2="100.995"
          y2="113"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#00FFD1" stop-opacity="0" />
          <stop offset="1" stop-color="#5B40FF" />
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
          stroke-width="16"
          stroke-linecap="round"
        />
        {/* <path
          opacity="0.1"
          d="M-9.99999 111.348C-5.61627 120.034 9.72672 137.406 36.029 137.406C68.9068 137.406 82.058 79 128.087 79C174.116 79 177.404 141 220.145 141C262.886 141 266.174 79 308.915 79C351.656 79 352.478 137.406 387 137.406"
          stroke="url(#paint2_linear_20_201)"
          stroke-width="16"
          stroke-linecap="round"
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
          <stop stop-color="#26343E" />
          <stop offset="1" stop-color="#1D2932" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_20_201"
          x1="756.885"
          y1="60.152"
          x2="824.676"
          y2="60.152"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#00FFD1" />
          <stop offset="1" stop-color="#5B40FF" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_20_201"
          x1="397.691"
          y1="141"
          x2="113.305"
          y2="141"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#00FFD1" stop-opacity="0" />
          <stop offset="1" stop-color="#5B40FF" />
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
        stroke-width="16"
        stroke-linecap="round"
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
          <stop stop-color="#00FFD1" stop-opacity="0" />
          <stop offset="1" stop-color="#5B40FF" />
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
        clip-rule="evenodd"
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21ZM11.5 23C17.8513 23 23 17.8513 23 11.5C23 5.14873 17.8513 0 11.5 0C5.14873 0 0 5.14873 0 11.5C0 17.8513 5.14873 23 11.5 23Z"
        fill="url(#paint1_linear_30_224)"
      />
      <path
        fillRule="evenodd"
        clip-rule="evenodd"
        d="M26.5 21C31.7467 21 36 16.7467 36 11.5C36 6.25329 31.7467 2 26.5 2C21.2533 2 17 6.25329 17 11.5C17 16.7467 21.2533 21 26.5 21ZM26.5 23C32.8513 23 38 17.8513 38 11.5C38 5.14873 32.8513 0 26.5 0C20.1487 0 15 5.14873 15 11.5C15 17.8513 20.1487 23 26.5 23Z"
        fill="url(#paint2_linear_30_224)"
      />
      <path
        fillRule="evenodd"
        clip-rule="evenodd"
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
          <stop stop-color="#26343E" />
          <stop offset="1" stop-color="#1D2932" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_30_224"
          x1="0.273809"
          y1="0.253304"
          x2="20.5648"
          y2="24.2203"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#00FFD1" />
          <stop offset="1" stop-color="#5B40FF" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_30_224"
          x1="15.2738"
          y1="0.253304"
          x2="35.5648"
          y2="24.2203"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#00FFD1" />
          <stop offset="1" stop-color="#5B40FF" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_30_224"
          x1="18.5"
          y1="3.5"
          x2="19.8753"
          y2="5.10674"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#28ACE6" />
          <stop offset="1" stop-color="#2F9DE9" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const MobileCancelledOrder = () => {
  return (
    <svg
      width="96"
      height="56"
      viewBox="0 0 96 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.15">
        <path
          d="M20.4573 40.7552C18.9119 41.1693 17.4753 40.98 16.1475 40.1873C14.8301 39.3918 13.9615 38.2111 13.5419 36.645L13.5336 36.6141C13.1168 35.0583 13.2837 33.6 14.0344 32.2394C14.7824 30.8684 15.9395 29.9731 17.5056 29.5535C18.4225 29.3078 19.2442 29.2422 19.9706 29.3568C20.697 29.4713 21.435 29.7319 22.1844 30.1384L21.59 31.2584C20.2843 30.5482 19.0185 30.3573 17.7924 30.6858C16.5972 31.0061 15.7124 31.7014 15.1379 32.7719C14.5737 33.8397 14.4586 34.9969 14.7926 36.2436L14.8009 36.2745C15.1377 37.5315 15.8239 38.485 16.8595 39.1352C17.8923 39.775 19.0011 39.9362 20.186 39.6187C20.8866 39.431 21.4703 39.1365 21.937 38.7354C22.4038 38.3342 22.8449 37.7964 23.2605 37.1219L24.2753 37.6947C23.8256 38.4889 23.3086 39.1354 22.7245 39.6342C22.1403 40.1331 21.3846 40.5067 20.4573 40.7552ZM29.0968 38.4237C28.2931 38.639 27.5332 38.6052 26.8169 38.3223C26.1109 38.0366 25.6544 37.5074 25.4473 36.7347L25.439 36.7038C25.2154 35.8692 25.3519 35.1424 25.8487 34.5235C26.3454 33.9045 27.1141 33.4556 28.1547 33.1767C28.9789 32.9559 29.8233 32.8511 30.6876 32.8624L30.6214 32.6152C30.4337 31.9145 30.084 31.434 29.5725 31.1735C29.061 30.913 28.4292 30.8835 27.677 31.0851C26.894 31.2949 26.1363 31.7022 25.4039 32.3071L24.7875 31.4287C25.6551 30.7103 26.5629 30.2241 27.5108 29.9701C28.6442 29.6664 29.5832 29.7296 30.3278 30.1595C31.0333 30.5668 31.5213 31.2753 31.7918 32.285L33.1004 37.1687L31.9258 37.4834L31.607 36.2934C31.139 37.3906 30.3023 38.1007 29.0968 38.4237ZM29.0719 37.4034C29.8137 37.2046 30.3884 36.8353 30.7958 36.2954C31.2033 35.7555 31.3229 35.1714 31.1545 34.5429L30.9557 33.801C30.1119 33.7842 29.3037 33.8793 28.5309 34.0863C27.7994 34.2824 27.2676 34.585 26.9355 34.9942C26.6007 35.3931 26.4982 35.8347 26.6279 36.319L26.6362 36.3499C26.766 36.8341 27.0601 37.1694 27.5186 37.3558C27.9874 37.5393 28.5052 37.5552 29.0719 37.4034ZM35.6211 36.4933L33.4802 28.5031L34.6702 28.1843L35.0429 29.5752C35.3925 28.3662 36.165 27.6015 37.3601 27.2813C38.308 27.0273 39.1337 27.1208 39.8371 27.5618C40.5378 27.9924 41.0179 28.692 41.2774 29.6605L42.6067 34.6215L41.4167 34.9404L40.166 30.273C39.9645 29.5209 39.6114 28.9861 39.1067 28.6685C38.6095 28.3379 38.0106 28.2665 37.31 28.4542C36.6197 28.6392 36.11 29.0243 35.7809 29.6094C35.4518 30.1945 35.3866 30.858 35.5854 31.5998L36.8111 36.1744L35.6211 36.4933ZM48.7952 33.1621C47.6412 33.4713 46.5585 33.3252 45.5471 32.7238C44.5459 32.1197 43.8935 31.2509 43.5899 30.1176L43.5816 30.0867C43.2751 28.943 43.4044 27.8593 43.9693 26.8355C44.5418 25.7987 45.405 25.1257 46.559 24.8165C47.7954 24.4852 48.9888 24.6734 50.1391 25.3811L49.5746 26.4269C48.5968 25.8275 47.6803 25.6424 46.8251 25.8715C46.0215 26.0869 45.4215 26.5679 45.0253 27.3145C44.6393 28.0584 44.5623 28.8631 44.7942 29.7286L44.8025 29.7595C45.0344 30.625 45.51 31.2871 46.2292 31.7459C46.956 32.1917 47.7367 32.3027 48.5713 32.0791C49.4574 31.8417 50.165 31.2269 50.6943 30.2348L51.642 30.7428C50.9908 32.0216 50.0419 32.828 48.7952 33.1621ZM53.5182 27.9376C53.8187 28.7295 54.2966 29.2972 54.9518 29.6406C55.6146 29.971 56.3117 30.0382 57.0432 29.8422C58.0014 29.5854 58.7404 28.9844 59.2601 28.039L60.18 28.5048C59.5514 29.7444 58.588 30.5381 57.2898 30.886C56.1667 31.1869 55.1153 31.0545 54.1355 30.4888C53.1633 29.9101 52.5129 29.0076 52.1843 27.7816C51.8724 26.6173 51.9745 25.5353 52.4907 24.5357C53.0041 23.5257 53.8069 22.8744 54.899 22.5818C56.0427 22.2753 57.0571 22.4342 57.9421 23.0584C58.8271 23.6826 59.4325 24.6026 59.7583 25.8184C59.7997 25.9729 59.8318 26.1134 59.8547 26.2398L53.5182 27.9376ZM53.2614 26.9795L58.4079 25.6005C58.1287 24.847 57.7 24.2773 57.1217 23.8911C56.5509 23.4919 55.8894 23.3931 55.1373 23.5946C54.4573 23.7768 53.9428 24.1852 53.5938 24.8198C53.2449 25.4545 53.1341 26.1743 53.2614 26.9795ZM63.0016 29.1567L59.9786 17.8747L61.1686 17.5558L64.1916 28.8378L63.0016 29.1567ZM66.7242 24.3991C67.0247 25.191 67.5026 25.7586 68.1578 26.1021C68.8206 26.4325 69.5177 26.4997 70.2493 26.3037C71.2075 26.0469 71.9464 25.4458 72.4661 24.5005L73.386 24.9662C72.7574 26.2058 71.794 26.9996 70.4958 27.3474C69.3728 27.6483 68.3213 27.5159 67.3415 26.9503C66.3693 26.3715 65.7189 25.4691 65.3904 24.243C65.0784 23.0788 65.1805 21.9968 65.6967 20.9971C66.2101 19.9872 67.0129 19.3359 68.1051 19.0432C69.2487 18.7368 70.2631 18.8957 71.1481 19.5199C72.0332 20.1441 72.6386 21.0641 72.9643 22.2798C73.0057 22.4344 73.0379 22.5749 73.0607 22.7013L66.7242 24.3991ZM66.4675 23.4409L71.6139 22.0619C71.3347 21.3085 70.906 20.7387 70.3277 20.3526C69.7569 19.9534 69.0955 19.8545 68.3433 20.0561C67.6633 20.2383 67.1488 20.6467 66.7998 21.2813C66.4509 21.9159 66.3401 22.6358 66.4675 23.4409ZM79.4987 24.9185C78.4787 25.1918 77.4867 25.0546 76.5227 24.5067C75.5587 23.9589 74.9083 23.0565 74.5715 21.7995L74.5632 21.7686C74.2292 20.5219 74.3412 19.4152 74.8994 18.4485C75.4575 17.4817 76.2466 16.8617 77.2666 16.5884C78.5236 16.2516 79.6955 16.5449 80.7822 17.4685L79.4902 12.6466L80.6802 12.3277L83.7032 23.6097L82.5132 23.9286L82.0825 22.3213C81.5963 23.7215 80.7351 24.5872 79.4987 24.9185ZM79.4293 23.7942C80.2021 23.5871 80.7996 23.1178 81.222 22.3862C81.6416 21.6443 81.7313 20.8252 81.4911 19.9288L81.4829 19.8979C81.2454 19.0118 80.7609 18.3576 80.0294 17.9352C79.295 17.5026 78.5415 17.3897 77.7687 17.5968C76.9651 17.8121 76.3699 18.2698 75.9832 18.9697C75.5965 19.6696 75.5288 20.4884 75.78 21.426L75.7883 21.4569C76.034 22.3739 76.5072 23.0477 77.2079 23.4784C77.9058 23.8987 78.6463 24.004 79.4293 23.7942Z"
          fill="#FFA24D"
        />
        <rect
          x="1.00458"
          y="24.5456"
          width="89"
          height="31"
          rx="11.5"
          transform="rotate(-15 1.00458 24.5456)"
          stroke="#FFA24D"
        />
      </g>
    </svg>
  );
};

export const MobileFinishOrder = () => {
  return (
    <svg
      width="96"
      height="56"
      viewBox="0 0 96 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.15">
        <path
          d="M19.5092 41.8457L16.6104 31.0273L24.3842 28.9443L24.6865 30.0725L18.1337 31.8284L19.1689 35.6921L25.0263 34.1226L25.3245 35.2353L19.4671 36.8048L20.7301 41.5185L19.5092 41.8457ZM26.8725 29.4371L26.5205 28.1235L27.8806 27.759L28.2326 29.0727L26.8725 29.4371ZM29.5587 39.1529L27.4177 31.1628L28.6078 30.8439L30.7487 38.8341L29.5587 39.1529ZM33.5104 38.0941L31.3695 30.1039L32.5595 29.7851L32.9322 31.176C33.2819 29.967 34.0543 29.2023 35.2494 28.8821C36.1973 28.6281 37.023 28.7216 37.7264 29.1626C38.4271 29.5932 38.9072 30.2928 39.1667 31.2613L40.496 36.2223L39.306 36.5412L38.0554 31.8738C37.8538 31.1217 37.5007 30.5868 36.996 30.2693C36.4988 29.9387 35.8999 29.8673 35.1993 30.055C34.509 30.24 33.9993 30.625 33.6702 31.2102C33.3411 31.7953 33.2759 32.4588 33.4747 33.2006L34.7004 37.7752L33.5104 38.0941ZM40.4559 25.7975L40.1039 24.4838L41.4639 24.1194L41.8159 25.4331L40.4559 25.7975ZM43.142 35.5133L41.0011 27.5232L42.1911 27.2043L44.3321 35.1944L43.142 35.5133ZM49.7779 33.9009C49.201 34.0555 48.5861 34.1098 47.9333 34.0638C47.288 34.0048 46.6955 33.8544 46.1559 33.6125L46.5309 32.601C47.6198 33.038 48.633 33.131 49.5706 32.8797C50.0548 32.75 50.4211 32.5303 50.6695 32.2209C50.9151 31.9011 50.9868 31.5506 50.8847 31.1693L50.8764 31.1384C50.7798 30.7778 50.5352 30.5452 50.1428 30.4405C49.7606 30.3331 49.215 30.275 48.5059 30.2662C48.0737 30.2606 47.7267 30.2431 47.4649 30.2139C47.203 30.1847 46.9007 30.1276 46.5577 30.0429C46.212 29.9478 45.9325 29.7908 45.7192 29.5718C45.5059 29.3529 45.3524 29.0683 45.2585 28.718L45.2502 28.6871C45.068 28.007 45.1728 27.3882 45.5644 26.8305C45.9664 26.27 46.564 25.8835 47.3574 25.6709C48.3877 25.3948 49.4246 25.4317 50.468 25.7816L50.1673 26.8229C49.2359 26.5203 48.3787 26.4739 47.5957 26.6838C47.132 26.808 46.7849 27.0169 46.5544 27.3106C46.3342 27.6015 46.2697 27.917 46.3608 28.257L46.369 28.2879C46.4077 28.4321 46.4848 28.555 46.6003 28.6566C46.7159 28.7581 46.8362 28.8363 46.9614 28.8911C47.0865 28.946 47.2696 28.9907 47.5109 29.0255C47.7624 29.0575 47.9606 29.0761 48.1056 29.0815C48.2506 29.0868 48.4798 29.0972 48.7931 29.1126C49.1167 29.1253 49.3861 29.1414 49.6012 29.1611C49.8266 29.178 50.0808 29.2203 50.364 29.288C50.6547 29.3426 50.8929 29.4279 51.0786 29.5438C51.2718 29.6466 51.4502 29.7975 51.614 29.9966C51.7778 30.1957 51.8969 30.4343 51.9715 30.7125L51.9798 30.7434C52.1785 31.4852 52.068 32.1443 51.6482 32.7206C51.2256 33.2866 50.6022 33.68 49.7779 33.9009ZM54.791 32.392L51.768 21.11L52.958 20.7911L54.2127 25.4739C54.5624 24.2649 55.3348 23.5002 56.53 23.18C57.4779 22.926 58.3036 23.0195 59.007 23.4605C59.7077 23.8911 60.1877 24.5907 60.4473 25.5592L61.7766 30.5202L60.5865 30.8391L59.3359 26.1717C59.1344 25.4196 58.7813 24.8847 58.2765 24.5672C57.7794 24.2366 57.1805 24.1652 56.4799 24.3529C55.7896 24.5379 55.2798 24.9229 54.9507 25.5081C54.6216 26.0932 54.5565 26.7567 54.7552 27.4985L55.981 32.0731L54.791 32.392ZM64.0853 26.1414C64.3858 26.9333 64.8637 27.501 65.5189 27.8444C66.1817 28.1748 66.8788 28.242 67.6103 28.046C68.5685 27.7892 69.3075 27.1882 69.8272 26.2428L70.7471 26.7086C70.1185 27.9482 69.1551 28.7419 67.8569 29.0897C66.7338 29.3907 65.6824 29.2583 64.7026 28.6926C63.7304 28.1138 63.08 27.2114 62.7514 25.9854C62.4395 24.8211 62.5416 23.7391 63.0578 22.7395C63.5712 21.7295 64.374 21.0782 65.4661 20.7856C66.6098 20.4791 67.6241 20.638 68.5092 21.2622C69.3942 21.8864 69.9996 22.8064 70.3254 24.0222C70.3668 24.1767 70.3989 24.3172 70.4218 24.4436L64.0853 26.1414ZM63.8285 25.1832L68.975 23.8043C68.6958 23.0508 68.2671 22.4811 67.6888 22.0949C67.118 21.6957 66.4565 21.5969 65.7044 21.7984C65.0244 21.9806 64.5099 22.389 64.1609 23.0236C63.8119 23.6582 63.7012 24.3781 63.8285 25.1832ZM76.8598 26.6609C75.8397 26.9342 74.8477 26.7969 73.8838 26.2491C72.9198 25.7012 72.2694 24.7988 71.9326 23.5418L71.9243 23.5109C71.5903 22.2642 71.7023 21.1575 72.2605 20.1908C72.8186 19.2241 73.6077 18.604 74.6277 18.3307C75.8847 17.9939 77.0566 18.2873 78.1433 19.2108L76.8513 14.3889L78.0413 14.07L81.0643 25.3521L79.8743 25.6709L79.4436 24.0636C78.9574 25.4638 78.0961 26.3296 76.8598 26.6609ZM76.7904 25.5365C77.5631 25.3295 78.1607 24.8601 78.5831 24.1286C79.0027 23.3867 79.0924 22.5675 78.8522 21.6712L78.8439 21.6403C78.6065 20.7542 78.122 20.0999 77.3904 19.6776C76.6561 19.2449 75.9025 19.1321 75.1298 19.3391C74.3262 19.5545 73.731 20.0121 73.3443 20.712C72.9576 21.412 72.8899 22.2307 73.1411 23.1683L73.1494 23.1992C73.3951 24.1162 73.8683 24.79 74.569 25.2207C75.2669 25.6411 76.0073 25.7463 76.7904 25.5365Z"
          fill="#1AA189"
        />
        <rect
          x="1.00458"
          y="24.5456"
          width="89"
          height="31"
          rx="11.5"
          transform="rotate(-15 1.00458 24.5456)"
          stroke="#1AA189"
        />
      </g>
    </svg>
  );
};

export const MobileHistoryOrderStamp = ({
  state,
}: {
  state: 'finish' | 'cancel';
}) => {
  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 ">
      {state === 'cancel' && <MobileCancelledOrder />}
      {state === 'finish' && <MobileFinishOrder />}
    </div>
  );
};
