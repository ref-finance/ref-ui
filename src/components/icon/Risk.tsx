import React from 'react';
import { isMobile } from 'src/utils/device';
const RiskLogo = (props: any) => {
  const { width, height, className, ...rest } = props;
  return (
    <svg
      width="176"
      height="187"
      viewBox="0 0 176 187"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_13025_462)">
        <path
          d="M51.9837 66.0751C51.9078 63.8138 53.422 61.8405 55.6071 61.2537L71.4746 56.9923L85.7924 51.8631C86.8979 51.467 88.1075 51.4728 89.2093 51.8792L103.068 56.9923L119.4 61.2767C121.586 61.8501 123.111 63.8115 123.048 66.0705C122.818 74.3749 121.672 94.2958 116.019 106.477C110.415 118.552 101.287 128.306 89.5932 134.658C88.2831 135.37 86.7086 135.403 85.3739 134.739C73.2428 128.701 64.5063 118.787 58.9882 106.477C53.4982 94.2294 52.2621 74.3668 51.9837 66.0751Z"
          fill="url(#paint0_linear_13025_462)"
        />
      </g>
      <g filter="url(#filter1_dd_13025_462)">
        <path
          d="M60.1306 74.5785C60.0054 71.8611 61.83 69.4863 64.4589 68.787L74.8746 66.0162L85.0203 62.416C86.3365 61.9489 87.7745 61.9557 89.0863 62.435L98.8857 66.0162L109.655 68.8145C112.284 69.4979 114.122 71.8577 114.011 74.5724C113.728 81.5423 112.67 94.8569 108.729 103.268C104.612 112.055 97.9936 119.208 89.5314 123.995C87.9874 124.868 86.1072 124.909 84.5356 124.086C75.7838 119.506 69.4405 112.231 65.3849 103.268C61.5586 94.8133 60.4511 81.5368 60.1306 74.5785Z"
          fill="url(#paint1_linear_13025_462)"
        />
      </g>
      <g filter="url(#filter2_bdd_13025_462)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M123.749 83.3053C122.769 91.2769 121.011 100.316 117.79 107.142C111.853 119.722 102.059 129.813 89.5059 136.202C88.2722 136.83 86.8124 136.861 85.5512 136.278C72.4024 130.206 63.0207 119.898 57.194 107.114C54.073 100.267 52.3284 91.2411 51.3355 83.2809C50.3367 75.2729 50.0744 68.1289 50.0052 64.9336C49.9594 62.816 51.3959 61.0144 53.3949 60.4863L70.9596 55.8469L85.9488 50.5656C86.9577 50.2102 88.0599 50.2153 89.0653 50.5801L103.582 55.8474L121.589 60.4935C123.588 61.0092 125.036 62.7983 125.003 64.9158C124.955 68.1164 124.734 75.2833 123.749 83.3053ZM102.896 58.0268L88.2761 52.7219C87.7734 52.5395 87.2222 52.5369 86.7178 52.7147L71.6408 58.0268L53.9861 62.6901C52.9793 62.956 52.2805 63.8511 52.3029 64.8846C52.4394 71.1905 53.3405 93.1252 59.288 106.175C64.9168 118.525 73.9308 128.396 86.5209 134.211C87.1372 134.495 87.8521 134.481 88.457 134.173C100.557 128.014 109.989 118.297 115.709 106.175C121.832 93.1983 122.61 71.1946 122.706 64.8815C122.721 63.8491 122.018 62.9604 121.011 62.7006L102.896 58.0268Z"
          fill="url(#paint2_linear_13025_462)"
          fillOpacity="0.6"
          shapeRendering="crispEdges"
        />
      </g>
      <g filter="url(#filter3_d_13025_462)">
        <path
          d="M85.9543 71C84.0596 71 81.9909 72.4009 81.4728 74.335L76.133 90.4768C75.6148 92.4109 76.6511 93.8118 78.5457 93.8118H84.5777L81.1287 108.378C80.6105 110.308 81.3027 110.483 82.5091 109.078L98.7026 89.7763C101.115 86.9706 100.079 84.5112 96.2898 84.5112H88.8813L93.1888 74.1599C93.877 72.4048 93.0186 71 91.1201 71H85.9543Z"
          fill="url(#paint3_linear_13025_462)"
        />
        <path
          d="M81.9475 74.492L81.952 74.4783L81.9558 74.4644C82.4093 72.7716 84.2615 71.5 85.9543 71.5H91.1201C91.9461 71.5 92.4525 71.8001 92.7036 72.1917C92.9586 72.5893 93.0269 73.2001 92.7251 73.9728L88.4197 84.3191L88.1317 85.0112H88.8813H96.2898C98.1116 85.0112 99.0555 85.6012 99.3655 86.2955C99.6778 86.9951 99.4832 88.1018 98.3235 89.4503L98.3235 89.4503L98.3196 89.455L82.1297 108.752C82.1291 108.753 82.1285 108.754 82.1279 108.754C81.8526 109.075 81.6253 109.285 81.455 109.402C81.4587 109.207 81.5025 108.914 81.6116 108.507L81.6135 108.5L81.6152 108.493L85.0643 93.927L85.2099 93.3118H84.5777H78.5457C77.7238 93.3118 77.1572 93.0125 76.8387 92.5752C76.5192 92.1365 76.3871 91.4727 76.6123 90.6197L81.9475 74.492Z"
          stroke="url(#paint4_linear_13025_462)"
        />
      </g>
      <g filter="url(#filter4_bf_13025_462)">
        <path
          d="M116.134 106.294C122.234 93.1972 123.01 70.9881 123.105 64.6161C123.121 63.5741 122.42 62.6771 121.416 62.4148L103.37 57.6975L88.8054 52.3431C88.5571 52.2518 88.2969 52.2051 88.0364 52.2031L87.9788 134.798C88.3246 134.798 88.6701 134.717 88.9857 134.554C101.04 128.338 110.436 118.53 116.134 106.294Z"
          fill="url(#paint5_linear_13025_462)"
        />
      </g>
      <g filter="url(#filter5_f_13025_462)">
        <path
          d="M59.7307 60C56.1301 61 51.6301 61.5 51.1301 63C50.6301 64.5 51.6301 79.5 53.1301 87"
          stroke="url(#paint6_linear_13025_462)"
        />
      </g>
      <g filter="url(#filter6_f_13025_462)">
        <path
          d="M93 54.5C109.5 60.5 122.101 62.5 122.601 64C123.101 65.5 122 92 116 106"
          stroke="url(#paint7_linear_13025_462)"
        />
      </g>
      <g filter="url(#filter7_f_13025_462)">
        <path
          d="M84 134.5C84.5 134.833 85.9 135.5 87.5 135.5C89.5 135.5 96.5 131.5 106 122.5C111 117.763 115 111 116 108.5"
          stroke="url(#paint8_radial_13025_462)"
        />
      </g>
      <g filter="url(#filter8_f_13025_462)">
        <path
          d="M55 91C56.1667 98 60.9 113.3 70.5 122.5C80.1 131.7 87.5 135 87.5 135"
          stroke="url(#paint9_radial_13025_462)"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_13025_462"
          x="25.981"
          y="26.5703"
          width="123.069"
          height="135.645"
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
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="13" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 1 0 0 0 0 0.94 0 0 0 0.6 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_13025_462"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_13025_462"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_dd_13025_462"
          x="56.1245"
          y="58.0703"
          width="61.8916"
          height="74.6074"
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
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_13025_462"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_13025_462"
            result="effect2_dropShadow_13025_462"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_13025_462"
            result="shape"
          />
        </filter>
        <filter
          id="filter2_bdd_13025_462"
          x="-29.9958"
          y="-29.6973"
          width="235"
          height="246.393"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImage" stdDeviation="40" />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_13025_462"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="25" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0.942408 0 0 0 0 1 0 0 0 0.2 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_backgroundBlur_13025_462"
            result="effect2_dropShadow_13025_462"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_dropShadow_13025_462"
            result="effect3_dropShadow_13025_462"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect3_dropShadow_13025_462"
            result="shape"
          />
        </filter>
        <filter
          id="filter3_d_13025_462"
          x="71"
          y="66"
          width="34"
          height="49"
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
          <feGaussianBlur stdDeviation="2.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_13025_462"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_13025_462"
            result="shape"
          />
        </filter>
        <filter
          id="filter4_bf_13025_462"
          x="85.9788"
          y="50.2031"
          width="39.1265"
          height="86.5957"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImage" stdDeviation="1" />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_13025_462"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_backgroundBlur_13025_462"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="1"
            result="effect2_foregroundBlur_13025_462"
          />
        </filter>
        <filter
          id="filter5_f_13025_462"
          x="49.5"
          y="58.5176"
          width="11.3645"
          height="29.5801"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="0.5"
            result="effect1_foregroundBlur_13025_462"
          />
        </filter>
        <filter
          id="filter6_f_13025_462"
          x="91.8291"
          y="53.0293"
          width="32.3784"
          height="54.168"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="0.5"
            result="effect1_foregroundBlur_13025_462"
          />
        </filter>
        <filter
          id="filter7_f_13025_462"
          x="82.7227"
          y="107.314"
          width="34.7417"
          height="29.6855"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="0.5"
            result="effect1_foregroundBlur_13025_462"
          />
        </filter>
        <filter
          id="filter8_f_13025_462"
          x="53.5068"
          y="89.918"
          width="35.197"
          height="46.5391"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="0.5"
            result="effect1_foregroundBlur_13025_462"
          />
        </filter>
        <linearGradient
          id="paint0_linear_13025_462"
          x1="87.504"
          y1="51.25"
          x2="87.504"
          y2="135.743"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#003D32" />
          <stop offset="1" stopColor="#007981" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_13025_462"
          x1="114.114"
          y1="92.073"
          x2="66.2442"
          y2="77.2915"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stopColor="#1AA289" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_13025_462"
          x1="125.004"
          y1="60.7457"
          x2="55.1742"
          y2="70.9468"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.0208333" stopColor="#80B3A9" />
          <stop offset="0.562413" stopColor="white" />
          <stop offset="0.953125" stopColor="#8F8DC9" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_13025_462"
          x1="88"
          y1="71"
          x2="88"
          y2="110"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFF0" />
          <stop offset="1" stopColor="#00D6AF" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_13025_462"
          x1="88.8571"
          y1="69.3043"
          x2="93.8915"
          y2="101.539"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#006452" />
          <stop offset="1" stopColor="#00FFF0" />
        </linearGradient>
        <linearGradient
          id="paint5_linear_13025_462"
          x1="87.5558"
          y1="93.9864"
          x2="121.184"
          y2="93.9864"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C4C4C4" />
          <stop offset="0.0001" stopColor="white" stopOpacity="0.35" />
          <stop offset="1" stopColor="#00EBC1" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient
          id="paint6_linear_13025_462"
          x1="51.1301"
          y1="62.5"
          x2="58.1301"
          y2="65"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint7_linear_13025_462"
          x1="122.601"
          y1="63.5"
          x2="107"
          y2="70.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#003E33" />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
        <radialGradient
          id="paint8_radial_13025_462"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(103 125) rotate(-128.29) scale(12.1037 14.3451)"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="paint9_radial_13025_462"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(64 115.5) rotate(42.2073) scale(29.0259 14.7163)"
        >
          <stop stopColor="#003E33" />
          <stop offset="1" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

const ExternalLinkIcon = (props: any) => {
  const { width, height, className, ...rest } = props;
  return (
    <svg
      className={className}
      {...rest}
      width={width || '12'}
      height={height || '12'}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.96806 12H3.03194C1.36082 12 0 10.6394 0 8.96857V3.03143C0 1.36059 1.36082 0 3.03194 0H5.6096C5.97262 0 6.26669 0.294018 6.26669 0.656979C6.26669 1.01994 5.97262 1.31396 5.6096 1.31396H3.03194C2.5736 1.31396 2.14163 1.4924 1.81714 1.81683C1.49265 2.14126 1.31418 2.57317 1.31418 3.03143V8.96654C1.31418 9.42481 1.49265 9.85671 1.81714 10.1811C2.14163 10.5056 2.5736 10.684 3.03194 10.684H8.96806C9.91516 10.684 10.6858 9.91348 10.6858 8.96654V6.19466C10.6858 5.96147 10.8116 5.74248 11.0144 5.62487C11.1137 5.5681 11.2273 5.53768 11.3429 5.53768C11.4585 5.53768 11.5721 5.5681 11.6715 5.62487C11.8743 5.74248 12 5.95945 12 6.19466V8.96654C12 10.6394 10.6412 12 8.96806 12ZM11.0284 4.17082C11.1238 4.22556 11.2333 4.25395 11.3428 4.25395C11.4523 4.25395 11.5618 4.22354 11.6592 4.16879C11.8539 4.05727 11.9735 3.84841 11.9735 3.62537V0.656833C11.9735 0.310098 11.6916 0.0282495 11.3448 0.0282495H8.37576C8.02897 0.0282495 7.74707 0.310098 7.74707 0.656833C7.74707 1.00357 8.02897 1.28542 8.37576 1.28542H9.82618L5.55483 5.55604L5.55077 5.56009C5.43977 5.67911 5.37941 5.83662 5.38243 5.99933C5.38546 6.16204 5.45164 6.3172 5.567 6.43201C5.68665 6.55164 5.84281 6.61653 6.01114 6.61653C6.17136 6.61653 6.32346 6.5557 6.43906 6.44823L6.44109 6.4462L10.7141 2.17392V3.6274C10.7141 3.85044 10.8358 4.05929 11.0284 4.17082Z"
        fill="currentColor"
      />
    </svg>
  );
};
// const ShapeTitleIcon = () => {
//   return (
//     <svg
//       width="295"
//       height="58"
//       viewBox="0 0 295 58"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path
//         d="M0 16C0 7.16345 7.16344 0 16 0H250.598C255.859 0 260.783 2.58578 263.77 6.91627L293.594 50.1613C295.882 53.4782 293.507 58 289.478 58H4.99999C2.23857 58 0 55.7614 0 53V16Z"
//         fill="url(#paint0_linear_13010_22)"
//       />
//       <defs>
//         <linearGradient
//           id="paint0_linear_13010_22"
//           x1="149.5"
//           y1="0"
//           x2="149.5"
//           y2="58"
//           gradientUnits="userSpaceOnUse"
//         >
//           <stop stopColor="#00C6A2" />
//           <stop offset="1" stopColor="#008B72" />
//         </linearGradient>
//       </defs>
//     </svg>
//   );
// };
const mobile = isMobile();
const ShapeTitleIcon = () => {
  return <div className={mobile ? 'riskBanner_m' : 'riskBanner_pc'}></div>;
};

export { RiskLogo, ExternalLinkIcon, ShapeTitleIcon };
