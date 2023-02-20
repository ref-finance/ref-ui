import React from 'react';

export const AuroraIcon = (props: { hover?: boolean }) => {
  const { hover } = props;

  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.98874 1.63025C5.10427 -0.543412 8.2113 -0.54342 9.32683 1.63025L12.9806 8.74989C14.0052 10.7463 12.5555 13.1196 10.3116 13.1196H3.00398C0.760041 13.1196 -0.689604 10.7463 0.33494 8.74989L3.98874 1.63025ZM7.54747 2.54341C7.17563 1.81886 6.13995 1.81886 5.7681 2.54342L2.1143 9.66306C1.77278 10.3285 2.256 11.1196 3.00398 11.1196H10.3116C11.0596 11.1196 11.5428 10.3285 11.2013 9.66306L7.54747 2.54341Z"
        fill={hover ? 'white' : '#70D44B'}
      />
    </svg>
  );
};

export const ConnectDot = () => {
  return (
    <div
      className="rounded-full bg-dotColor block mx-px z-20"
      style={{
        height: '3px',
        width: '3px',
      }}
    ></div>
  );
};

export const HasBalance = ({ hover }: { hover?: boolean }) => {
  return (
    <div
      className={`rounded-full ml-2 ${
        hover ? 'bg-white' : 'bg-auroraGreen'
      } w-2 h-2`}
    ></div>
  );
};

export const CopyIcon = ({
  hover,
  fillColor,
}: {
  hover?: boolean;
  fillColor?: string;
}) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.1785 12.1904C10.844 12.1904 10.5734 12.4613 10.5734 12.7955V13.2691C10.5734 13.5563 10.34 13.7899 10.0528 13.7899H2.75474C2.46756 13.7899 2.23358 13.5562 2.23358 13.2691V5.97096C2.23358 5.68378 2.46758 5.45039 2.75474 5.45039H3.17487C3.50932 5.45039 3.77995 5.17947 3.77995 4.84531C3.77995 4.51115 3.50932 4.24023 3.17487 4.24023H2.75474C1.79985 4.24023 1.02344 5.01667 1.02344 5.97095V13.2691C1.02344 14.2236 1.79987 15.0001 2.75474 15.0001H10.0528C11.0071 15.0001 11.7836 14.2236 11.7836 13.2691V12.7955C11.7836 12.4613 11.5129 12.1904 11.1785 12.1904Z"
        fill={fillColor || '#00C6A2'}
        opacity={hover ? '0.4' : '1'}
      />
      <path
        d="M13.1607 1H6.03104C5.03007 1 4.21582 1.81425 4.21582 2.81522V9.94463C4.21582 10.9456 5.03007 11.7598 6.03104 11.7598H13.1607C14.1617 11.7598 14.9759 10.9456 14.9759 9.94463V2.81522C14.9759 1.81425 14.1617 1 13.1607 1ZM13.7658 9.94463C13.7658 10.2782 13.4946 10.5497 13.1607 10.5497H6.03104C5.69718 10.5497 5.42596 10.2782 5.42596 9.94463V2.81522C5.42596 2.48165 5.69718 2.21014 6.03104 2.21014H13.1607C13.4946 2.21014 13.7658 2.48165 13.7658 2.81522V9.94463Z"
        fill={fillColor || '#00C6A2'}
        opacity={hover ? '0.4' : '1'}
      />
    </svg>
  );
};

export const CrossBrigdeOff = () => {
  return (
    <>
      <div
        className="absolute"
        style={{
          left: '-5px',
          top: '-1px',
          zIndex: '30',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d_2_1235)">
            <circle cx="10" cy="10" r="4" fill="#73818B" />
          </g>
          <defs>
            <filter
              id="filter0_d_2_1235"
              x="0"
              y="0"
              width="20"
              height="20"
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
                result="effect1_dropShadow_2_1235"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_2_1235"
                result="shape"
              />
            </filter>
          </defs>
        </svg>
      </div>
      <div className="absolute">
        <svg
          width="42"
          height="12"
          viewBox="0 0 42 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 10C4.31707 7.33333 12.1951 2 21.4634 2C30.7317 2 37.374 7.33333 40 10"
            stroke="#001320"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </>
  );
};

export const CrossBridgeOn = () => {
  return (
    <>
      <div className="absolute">
        <svg
          width="42"
          height="12"
          viewBox="0 0 42 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 10C4.31707 7.33333 12.1951 2 21.4634 2C30.7317 2 37.374 7.33333 40 10"
            stroke="#00C6A2"
            strokeOpacity="0.3"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div
        className="absolute"
        style={{
          left: '32px',
          top: '3px',
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d_5_1656)">
            <circle cx="6" cy="6" r="4" fill="#00FFD1" />
          </g>
          <defs>
            <filter
              id="filter0_d_5_1656"
              x="0"
              y="0"
              width="12"
              height="12"
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
                result="effect1_dropShadow_5_1656"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_5_1656"
                result="shape"
              />
            </filter>
          </defs>
        </svg>
      </div>
    </>
  );
};

export const ChainNear = ({ dark }: { dark?: boolean }) => {
  return (
    <svg
      width="17"
      height="15"
      viewBox="0 0 17 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.68421 3.09557V12.0029L7.15789 8.59976L7.60526 8.99919L3.85378 14.3788C2.4599 15.6808 0 14.7999 0 12.9988V2.00114C0 0.138323 2.60392 -0.710183 3.94783 0.714704L14.3158 11.7074V3.1655L10.2895 6.20317L9.8421 5.80374L13.0329 0.782014C14.3647 -0.669256 17 0.171565 17 2.04776V12.8018C17 14.6646 14.3961 15.5131 13.0522 14.0882L2.68421 3.09557Z"
        fill={dark ? '#001320' : '#00C6A2'}
      />
    </svg>
  );
};

export const ChainAurora = ({ dark }: { dark?: boolean }) => {
  return dark ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.79288 1.98816C6.13329 -0.662715 9.86671 -0.662725 11.2071 1.98816L15.5975 10.6709C16.8286 13.1056 15.0867 16 12.3904 16H3.60958C0.913266 16 -0.828629 13.1056 0.402464 10.6709L4.79288 1.98816ZM9.06904 3.10181C8.62224 2.21818 7.37776 2.21818 6.93096 3.10181L2.54055 11.7845C2.13018 12.5961 2.71081 13.5609 3.60958 13.5609H12.3904C13.2892 13.5609 13.8698 12.5961 13.4595 11.7845L9.06904 3.10181Z"
        fill="#001320"
      />
    </svg>
  ) : (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_5_1658)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.79288 3.98816C8.13329 1.33728 11.8667 1.33728 13.2071 3.98816L17.5975 12.6709C18.8286 15.1056 17.0867 18 14.3904 18H5.60958C2.91327 18 1.17137 15.1056 2.40246 12.6709L6.79288 3.98816ZM11.069 5.10181C10.6222 4.21818 9.37776 4.21818 8.93096 5.10181L4.54055 13.7845C4.13018 14.5961 4.71081 15.5609 5.60958 15.5609H14.3904C15.2892 15.5609 15.8698 14.5961 15.4595 13.7845L11.069 5.10181Z"
          fill="#00C6A2"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_5_1658"
          x="0"
          y="0"
          width="20"
          height="20"
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
            result="effect1_dropShadow_5_1658"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_5_1658"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

export const SwapCross = ({ ifCross }: { ifCross: boolean }) => {
  return (
    <div
      className="flex items-center justify-between w-28 rounded-xl bg-cardBg px-3"
      style={{
        height: '50px',
      }}
    >
      <div>{<ChainNear />}</div>
      <div className="relative right-5 bottom-2">
        {ifCross ? <CrossBridgeOn /> : <CrossBrigdeOff />}
      </div>

      <div>{<ChainAurora dark={!ifCross} />}</div>
    </div>
  );
};

export const SwapCrossLight = () => {
  return (
    <svg
      width="100"
      height="50"
      viewBox="0 0 100 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="50" rx="12" fill="#1D2932" />
      <g filter="url(#filter0_d_15633_4169)">
        <path
          d="M31.8133 37.168C30.4133 37.168 29.2419 36.6827 28.2993 35.712C27.3659 34.7413 26.8993 33.5467 26.8993 32.128V32.1C26.8993 30.6907 27.3706 29.496 28.3133 28.516C29.2559 27.5267 30.4366 27.032 31.8553 27.032C32.6859 27.032 33.3953 27.1627 33.9833 27.424C34.5713 27.6853 35.1359 28.0727 35.6773 28.586L34.9213 29.398C33.9786 28.502 32.9519 28.054 31.8413 28.054C30.7586 28.054 29.8533 28.4413 29.1253 29.216C28.4066 29.9907 28.0473 30.9427 28.0473 32.072V32.1C28.0473 33.2387 28.4113 34.2 29.1393 34.984C29.8673 35.7587 30.7679 36.146 31.8413 36.146C32.4759 36.146 33.0359 36.0293 33.5213 35.796C34.0066 35.5627 34.5013 35.208 35.0053 34.732L35.7333 35.446C35.1733 36.0153 34.5899 36.4447 33.9833 36.734C33.3766 37.0233 32.6533 37.168 31.8133 37.168ZM37.6692 37V27.2H41.8832C43.0872 27.2 44.0159 27.5267 44.6692 28.18C45.1732 28.684 45.4252 29.328 45.4252 30.112V30.14C45.4252 30.924 45.1825 31.5587 44.6972 32.044C44.2119 32.5293 43.5679 32.8467 42.7652 32.996L45.7752 37H44.4172L41.5752 33.192H41.5472H38.7752V37H37.6692ZM38.7752 32.198H41.7852C42.5319 32.198 43.1385 32.016 43.6052 31.652C44.0719 31.288 44.3052 30.798 44.3052 30.182V30.154C44.3052 29.5473 44.0812 29.076 43.6332 28.74C43.1945 28.3947 42.5832 28.222 41.7992 28.222H38.7752V32.198ZM55.9344 35.684C54.9917 36.6733 53.7924 37.168 52.3364 37.168C50.8804 37.168 49.6857 36.678 48.7524 35.698C47.8191 34.7087 47.3524 33.5187 47.3524 32.128V32.1C47.3524 30.7093 47.8237 29.5193 48.7664 28.53C49.7091 27.5313 50.9084 27.032 52.3644 27.032C53.8204 27.032 55.0151 27.5267 55.9484 28.516C56.8817 29.496 57.3484 30.6813 57.3484 32.072C57.3577 32.0813 57.3577 32.0907 57.3484 32.1C57.3484 33.4907 56.8771 34.6853 55.9344 35.684ZM49.5924 34.97C50.3297 35.754 51.2537 36.146 52.3644 36.146C53.4751 36.146 54.3897 35.7587 55.1084 34.984C55.8364 34.2093 56.2004 33.2573 56.2004 32.128V32.1C56.2004 30.9707 55.8317 30.014 55.0944 29.23C54.3664 28.446 53.4471 28.054 52.3364 28.054C51.2257 28.054 50.3064 28.4413 49.5784 29.216C48.8597 29.9907 48.5004 30.9427 48.5004 32.072V32.1C48.5004 33.2293 48.8644 34.186 49.5924 34.97ZM62.9726 37.14C61.4699 37.14 60.1352 36.6173 58.9686 35.572L59.6546 34.76C60.1772 35.236 60.6999 35.586 61.2226 35.81C61.7546 36.034 62.3519 36.146 63.0146 36.146C63.6679 36.146 64.1952 35.992 64.5966 35.684C64.9979 35.3667 65.1986 34.9653 65.1986 34.48V34.452C65.1986 33.976 65.0212 33.598 64.6666 33.318C64.3119 33.038 63.6399 32.7953 62.6506 32.59C61.4932 32.338 60.6532 32.002 60.1306 31.582C59.6172 31.1527 59.3606 30.546 59.3606 29.762V29.734C59.3606 28.9593 59.6639 28.32 60.2706 27.816C60.8772 27.312 61.6472 27.06 62.5806 27.06C63.8779 27.06 65.0259 27.4613 66.0246 28.264L65.3806 29.118C64.5126 28.4087 63.5699 28.054 62.5526 28.054C61.9272 28.054 61.4232 28.208 61.0406 28.516C60.6579 28.8147 60.4666 29.188 60.4666 29.636V29.664C60.4666 30.1493 60.6486 30.532 61.0126 30.812C61.3859 31.092 62.0906 31.344 63.1266 31.568C64.2372 31.8107 65.0446 32.1513 65.5486 32.59C66.0619 33.0193 66.3186 33.6027 66.3186 34.34V34.368C66.3186 35.1987 66.0059 35.8707 65.3806 36.384C64.7552 36.888 63.9526 37.14 62.9726 37.14ZM71.7909 37.14C70.2883 37.14 68.9536 36.6173 67.7869 35.572L68.4729 34.76C68.9956 35.236 69.5183 35.586 70.0409 35.81C70.5729 36.034 71.1703 36.146 71.8329 36.146C72.4863 36.146 73.0136 35.992 73.4149 35.684C73.8163 35.3667 74.0169 34.9653 74.0169 34.48V34.452C74.0169 33.976 73.8396 33.598 73.4849 33.318C73.1303 33.038 72.4583 32.7953 71.4689 32.59C70.3116 32.338 69.4716 32.002 68.9489 31.582C68.4356 31.1527 68.1789 30.546 68.1789 29.762V29.734C68.1789 28.9593 68.4823 28.32 69.0889 27.816C69.6956 27.312 70.4656 27.06 71.3989 27.06C72.6963 27.06 73.8443 27.4613 74.8429 28.264L74.1989 29.118C73.3309 28.4087 72.3883 28.054 71.3709 28.054C70.7456 28.054 70.2416 28.208 69.8589 28.516C69.4763 28.8147 69.2849 29.188 69.2849 29.636V29.664C69.2849 30.1493 69.4669 30.532 69.8309 30.812C70.2043 31.092 70.9089 31.344 71.9449 31.568C73.0556 31.8107 73.8629 32.1513 74.3669 32.59C74.8803 33.0193 75.1369 33.6027 75.1369 34.34V34.368C75.1369 35.1987 74.8243 35.8707 74.1989 36.384C73.5736 36.888 72.7709 37.14 71.7909 37.14Z"
          fill="#00C6A2"
        />
      </g>
      <path
        d="M14 22C18.2683 18.3333 32.7805 11 49.8537 11C66.9268 11 79.1626 18.3333 84 22"
        stroke="#00C6A2"
        strokeOpacity="0.3"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <g filter="url(#filter1_d_15633_4169)">
        <circle cx="84" cy="22" r="4" fill="#00FFD1" />
      </g>
      <defs>
        <filter
          id="filter0_d_15633_4169"
          x="24.8992"
          y="25.0312"
          width="52.2378"
          height="14.1367"
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
            result="effect1_dropShadow_15633_4169"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_15633_4169"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_d_15633_4169"
          x="78"
          y="16"
          width="12"
          height="12"
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
            result="effect1_dropShadow_15633_4169"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_15633_4169"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

export const RequestingSmile = () => {
  return (
    <svg
      width="77"
      height="46"
      viewBox="0 0 77 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M72 33C67.7317 36.6667 53.2195 44 36.1463 44C19.0732 44 6.8374 36.6667 2 33"
        stroke="#00C6A2"
        strokeOpacity="0.3"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <g filter="url(#filter0_d_15708_1546)">
        <ellipse
          cx="71"
          cy="34"
          rx="4"
          ry="4"
          transform="rotate(-180 71 34)"
          fill="#00FFD1"
        />
      </g>
      <g filter="url(#filter1_d_15708_1546)">
        <circle
          cx="12"
          cy="6"
          r="4"
          transform="rotate(-180 12 6)"
          fill="#00FFD1"
        />
      </g>
      <g filter="url(#filter2_d_15708_1546)">
        <circle
          cx="66"
          cy="6"
          r="4"
          transform="rotate(-180 66 6)"
          fill="#00FFD1"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_15708_1546"
          x="65"
          y="28"
          width="12"
          height="12"
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
            result="effect1_dropShadow_15708_1546"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_15708_1546"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_d_15708_1546"
          x="6"
          y="0"
          width="12"
          height="12"
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
            result="effect1_dropShadow_15708_1546"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_15708_1546"
            result="shape"
          />
        </filter>
        <filter
          id="filter2_d_15708_1546"
          x="60"
          y="0"
          width="12"
          height="12"
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
            result="effect1_dropShadow_15708_1546"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_15708_1546"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
export const AuroraIconWhite = (props: any) => {
  const { width, height, color } = props;
  return (
    <svg
      width={width || '22'}
      height={height || '22'}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.59021 2.73372C8.43328 -0.911234 13.5667 -0.911247 15.4098 2.73372L21.4466 14.6725C23.1394 18.0202 20.7443 22 17.0368 22H4.96318C1.25574 22 -1.13937 18.0202 0.553389 14.6725L6.59021 2.73372ZM12.4699 4.26499C11.8556 3.05 10.1444 3.05 9.53007 4.26499L3.49325 16.2037C2.929 17.3196 3.72737 18.6462 4.96318 18.6462H17.0368C18.2726 18.6462 19.071 17.3196 18.5068 16.2037L12.4699 4.26499Z"
        fill={color || 'white'}
      />
    </svg>
  );
};

export const RefSwapPro = () => {
  return (
    <svg
      width="55"
      height="25"
      viewBox="0 0 55 25"
      className="ml-1"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="55" height="25" rx="6" fill="black" fillOpacity="0.2" />
      <path
        d="M18 13.5C19.1585 12.1667 23.0976 9.50003 27.7317 9.50003C32.3659 9.50003 35.687 12.1667 37 13.5"
        stroke="#00C6A2"
        strokeOpacity="0.3"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <g filter="url(#filter0_d_91_326)">
        <circle cx="37" cy="13.5" r="2" fill="#00FFD1" />
      </g>
      <g filter="url(#filter1_d_91_326)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.84211 10.0478V14.5015L8.07895 12.7999L8.30263 12.9996L6.42689 15.6894C5.72995 16.3404 4.5 15.8999 4.5 14.9994V9.50057C4.5 8.56916 5.80196 8.14491 6.47391 8.85735L11.6579 14.3537V10.0828L9.64474 11.6016L9.42105 11.4019L11.0165 8.89101C11.6824 8.16537 13 8.58578 13 9.52388V14.9009C13 15.8323 11.698 16.2566 11.0261 15.5441L5.84211 10.0478Z"
          fill="#00C6A2"
        />
      </g>
      <g filter="url(#filter2_d_91_326)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M45.3963 9.49408C46.0665 8.16864 47.9332 8.16864 48.6034 9.49408L50.7986 13.8354C51.4142 15.0528 50.5432 16.5 49.1951 16.5H44.8047C43.4565 16.5 42.5856 15.0528 43.2011 13.8354L45.3963 9.49408ZM47.5344 10.0509C47.311 9.60909 46.6888 9.60909 46.4654 10.0509L44.2702 14.3923C44.065 14.7981 44.3553 15.2805 44.8047 15.2805H49.1951C49.6445 15.2805 49.9348 14.798 49.7296 14.3923L47.5344 10.0509Z"
          fill="#00C6A2"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_91_326"
          x="33"
          y="9.49997"
          width="8"
          height="8"
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
            result="effect1_dropShadow_91_326"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_91_326"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_d_91_326"
          x="2.5"
          y="6.5"
          width="12.5"
          height="11.5"
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
            result="effect1_dropShadow_91_326"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_91_326"
            result="shape"
          />
        </filter>
        <filter
          id="filter2_d_91_326"
          x="40.9999"
          y="6.5"
          width="12"
          height="12"
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
            result="effect1_dropShadow_91_326"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_91_326"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
