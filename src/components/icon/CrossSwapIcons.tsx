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

export const TriAndAurora = () => {
  return (
    <svg
      width="30"
      height="29"
      viewBox="0 0 30 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect
        x="0.5"
        y="0.5"
        width="26.2631"
        height="26.2631"
        rx="8.5"
        fill="black"
        stroke="#00C6A2"
      />
      <rect
        x="4.65796"
        y="5.44727"
        width="17.1578"
        height="16.3684"
        fill="url(#pattern0_swap_pro_aurora_tri)"
        stroke="black"
      />
      <circle
        cx="22.2896"
        cy="21.1929"
        r="7.2105"
        fill="#8FD460"
        stroke="#25323C"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M20.8652 18.4254C21.4605 17.379 23.1184 17.379 23.7136 18.4254L25.6633 21.8528C26.21 22.8139 25.4365 23.9564 24.2391 23.9564H20.3397C19.1424 23.9564 18.3688 22.8139 18.9155 21.8528L20.8652 18.4254ZM22.7642 18.865C22.5658 18.5162 22.0131 18.5162 21.8147 18.865L19.865 22.2924C19.6828 22.6128 19.9406 22.9936 20.3397 22.9936H24.2391C24.6382 22.9936 24.8961 22.6127 24.7139 22.2924L22.7642 18.865Z"
        fill="white"
      />
      <defs>
        <pattern
          id="pattern0_swap_pro_aurora_tri"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image0_6018_27585"
            transform="matrix(0.00195312 0 0 0.0020419 0 -0.0227272)"
          />
        </pattern>
        <image
          id="image0_6018_27585"
          width="512"
          height="512"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
};

export const Inch1IconAndAurora = () => {
  const Inch1 = (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      className="relative "
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect
        x="0.5"
        y="0.5"
        width="26.2631"
        height="26.2631"
        rx="8.5"
        fill="black"
        stroke="#566069"
      />
      <rect
        opacity="0.2"
        x="0.708496"
        y="1"
        width="25.3333"
        height="25.3333"
        rx="8"
        fill="url(#pattern0_swap_pro_aurora_inch_1)"
      />
      <defs>
        <pattern
          id="pattern0_swap_pro_aurora_inch_1"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_6018_27592" transform="scale(0.0078125)" />
        </pattern>
        <image
          id="image0_6018_27592"
          width="128"
          height="128"
          xlinkHref="data:image/jpeg;base64,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"
        />
      </defs>
    </svg>
  );

  const aurora = (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="absolute -right-0.5 -bottom-0.5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="9.27067"
        cy="8.97917"
        r="7.72917"
        fill="#597D40"
        stroke="#25323C"
        stroke-width="2"
      />
      <path
        opacity="0.3"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7.84258 6.20397C8.43948 5.15467 10.102 5.15466 10.6989 6.20397L12.654 9.64088C13.2023 10.6046 12.4266 11.7503 11.2259 11.7503H7.31564C6.11494 11.7503 5.33925 10.6046 5.88747 9.64089L7.84258 6.20397ZM9.74681 6.64479C9.54784 6.29502 8.99366 6.29502 8.79469 6.64479L6.83959 10.0817C6.65685 10.4029 6.91541 10.7849 7.31564 10.7849H11.2259C11.6261 10.7849 11.8847 10.4029 11.7019 10.0817L9.74681 6.64479Z"
        fill="white"
      />
    </svg>
  );

  return (
    <div className="relative mr-1 frcc">
      {Inch1}
      {aurora}
    </div>
  );
};
