import React from 'react';

export function ArrowRightIcon(props: any) {
  return (
    <svg
      {...props}
      width="13"
      height="8"
      viewBox="0 0 13 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.3536 4.35355C12.5488 4.15829 12.5488 3.84171 12.3536 3.64645L9.17157 0.464466C8.97631 0.269204 8.65973 0.269204 8.46447 0.464466C8.2692 0.659728 8.2692 0.976311 8.46447 1.17157L11.2929 4L8.46447 6.82843C8.2692 7.02369 8.2692 7.34027 8.46447 7.53553C8.65973 7.7308 8.97631 7.7308 9.17157 7.53553L12.3536 4.35355ZM0 4.5H12V3.5H0V4.5Z"
        fill="white"
      />
    </svg>
  );
}
export function ModalCloseIcon(props: any) {
  return (
    <svg
      {...props}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.73284 5.99997L11.7359 1.99698C12.0368 1.69598 12.0882 1.25928 11.8507 1.02188L10.9779 0.149088C10.7404 -0.0884114 10.3043 -0.0363117 10.0028 0.264487L6.00013 4.26737L1.99719 0.264587C1.69619 -0.0367116 1.25948 -0.0884115 1.02198 0.149388L0.149174 1.02228C-0.0882276 1.25938 -0.0368271 1.69608 0.264576 1.99708L4.26761 5.99997L0.264576 10.0032C-0.0363271 10.304 -0.0884276 10.7404 0.149174 10.9779L1.02198 11.8507C1.25948 12.0882 1.69619 12.0367 1.99719 11.7358L6.00033 7.73266L10.0029 11.7352C10.3044 12.0368 10.7405 12.0882 10.978 11.8507L11.8508 10.9779C12.0882 10.7404 12.0368 10.304 11.736 10.0028L7.73284 5.99997Z"
        fill={props?.color || 'white'}
      />
    </svg>
  );
}

export function BannerCoreBtnIconBg(props) {
  return (
    <svg
      {...props}
      width="9"
      height="28"
      viewBox="0 0 9 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.12903 4.14815C8.12903 6.43935 6.30953 8.2963 4.06452 8.2963C2.9436 8.2963 1.92747 7.83287 1.19078 7.08102C0.454083 6.32917 0 5.29213 0 4.14815C0 3.00417 0.454083 1.96713 1.19078 1.21528C1.92747 0.463426 2.9436 0 4.06452 0C5.18543 0 6.20156 0.463426 6.93826 1.21528C7.67495 1.96713 8.12903 3.00417 8.12903 4.14815ZM8.12903 12.4444V25.9259C8.12903 27.0699 7.21769 28 6.09678 28H2.03226C0.911341 28 0 27.0699 0 25.9259V12.4444C0 11.2972 0.911341 10.3704 2.03226 10.3704H6.09678C7.21769 10.3704 8.12903 11.2972 8.12903 12.4444Z"
        fill="black"
      />
    </svg>
  );
}
export function TipIcon(props) {
  return (
    <svg
      {...props}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="6" cy="6" r="5.5" stroke="#00FFD1" />
      <path
        d="M6 6L6 9"
        stroke="#00FFD1"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="6" cy="3.75" r="0.75" fill="#00FFD1" />
    </svg>
  );
}
export function FireIcon(props) {
  return (
    <svg
      {...props}
      width="51"
      height="64"
      viewBox="0 0 51 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_786_572)">
        <g filter="url(#filter0_i_786_572)">
          <path
            d="M13.8305 30.5C13.8305 24.9 16.8305 17.8333 18.3305 15C21.3304 16 22.8306 14.5 23.8306 13C24.6306 11.8 24.1639 4.5 23.8306 1C27.3306 3 30.3306 5.5 36.8306 11.5C42.0306 16.3 41.9972 23.8333 41.3306 27C40.8306 28.6667 40.5306 32 43.3306 32C46.1306 32 46.4972 29 46.3306 27.5C47.8306 29 50.8306 36.5 50.3306 42.5C49.8306 48.5 45.3306 52.5 44.3306 53.5C43.3306 54.5 42.8306 55 42.8306 56C42.8306 56.8 44.8306 56.3333 45.8306 56C42.6639 59 33.6306 64.8 22.8306 64C12.0306 63.2 5.6639 57 3.83057 54C4.49723 54.6667 6.13057 56 7.33057 56C8.93057 55.6 8.33057 54.5 7.83057 54C6.33048 52.8333 2.93031 49 1.33031 43C-0.269686 37 4.33044 30.1667 6.83051 27.5C6.33051 33 7.83051 34.5 8.83051 35C9.83051 35.5 13.8305 37.5 13.8305 30.5Z"
            fill="#FF6344"
          />
        </g>
        <path
          d="M13.8305 30.5C13.8305 24.9 16.8305 17.8333 18.3305 15C21.3304 16 22.8306 14.5 23.8306 13C24.6306 11.8 24.1639 4.5 23.8306 1C27.3306 3 30.3306 5.5 36.8306 11.5C42.0306 16.3 41.9972 23.8333 41.3306 27C40.8306 28.6667 40.5306 32 43.3306 32C46.1306 32 46.4972 29 46.3306 27.5C47.8306 29 50.8306 36.5 50.3306 42.5C49.8306 48.5 45.3306 52.5 44.3306 53.5C43.3306 54.5 42.8306 55 42.8306 56C42.8306 56.8 44.8306 56.3333 45.8306 56C42.6639 59 33.6306 64.8 22.8306 64C12.0306 63.2 5.6639 57 3.83057 54C4.49723 54.6667 6.13057 56 7.33057 56C8.93057 55.6 8.33057 54.5 7.83057 54C6.33048 52.8333 2.93031 49 1.33031 43C-0.269686 37 4.33044 30.1667 6.83051 27.5C6.33051 33 7.83051 34.5 8.83051 35C9.83051 35.5 13.8305 37.5 13.8305 30.5Z"
          stroke="#FF1111"
          strokeWidth="0.5"
        />
        <path
          d="M26.8305 12C28.9972 13.3333 33.6305 17.7 34.8305 24.5C35.2305 28.5 34.6639 32.8333 34.3305 34.5C33.9972 36 34.3305 39.1 38.3305 39.5C40.3305 39.5 41.4972 38.1667 41.8305 37.5C42.1639 38.5 42.6305 41 41.8305 43C40.8305 45.5 40.3305 46.5 40.8305 48C41.3149 49.453 44.145 49.0294 44.3219 48.0925C44.3253 48.0609 44.3282 48.0301 44.3305 48C44.3305 48.0313 44.3276 48.0622 44.3219 48.0925C44.0754 50.3371 40.8751 56.3999 29.8305 63.5C28.5 64.5 23 64.5 21.3305 63.5C19.9972 62.3333 17.1305 59.9 16.3305 59.5C15.3305 59 8.83053 54 7.83053 48C7.03053 43.2 7.16387 40.3333 7.33053 39.5C7.99721 41.1667 10.1306 44.2 13.3306 43C17.3306 41.5 17.3306 38.5 17.3306 36.5C17.3306 34.5 16.8306 30.5 19.8306 26C22.2306 22.4 24.4972 19.8333 25.3306 19C26.1639 18.1667 27.6305 15.6 26.8305 12Z"
          fill="#FF9D44"
        />
        <g filter="url(#filter1_f_786_572)">
          <path
            d="M21.1628 36C22.6698 30.9091 28.0698 24.5455 30.5814 22C29.9535 24.9697 28.9488 31.9273 29.9535 36C30.9581 40.0727 35.3953 41.0909 37.4884 41.0909C36.986 45.1636 38.9535 46.6061 40 46.8182C40 47.6667 39.8744 49.7455 39.3721 51.2727C37.8651 54.3273 32.4651 60.6061 29.9535 63.3636L23.6744 64C20.1581 61.9636 15.093 51.697 13 46.8182H16.1395C18.6512 46.8182 19.2791 42.3636 21.1628 36Z"
            fill="#FFD34B"
          />
        </g>
        <path
          d="M21.3306 42C22.5306 38 26.8306 33 28.8306 31C28.3306 33.3333 27.5306 38.8 28.3306 42C29.1306 45.2 32.6639 46 34.3306 46C33.9306 49.2 35.4972 50.3333 36.3306 50.5C36.3306 51.1667 36.2306 52.8 35.8306 54C34.6306 56.4 30 61.8333 28 64H23.3306C20.5306 62.4 16.4972 54.3333 14.8306 50.5H17.3306C19.3306 50.5 19.8306 47 21.3306 42Z"
          fill="#FFE24B"
        />
        <g filter="url(#filter2_f_786_572)">
          <path
            d="M22.1395 46.6667C23.0884 43.5152 26.4884 39.5758 28.0698 38C27.6744 39.8384 27.0419 44.1455 27.6744 46.6667C28.307 49.1879 31.1008 49.8182 32.4186 49.8182C32.1023 52.3394 33.3411 53.2323 34 53.3636C34 53.8889 33.9209 55.1758 33.6047 56.1212C32.6558 58.0121 29.2558 61.899 27.6744 63.6061L23.7209 64C21.507 62.7394 18.3178 56.3838 17 53.3636H18.9767C20.5581 53.3636 20.9535 50.6061 22.1395 46.6667Z"
            fill="#FFFFE6"
          />
        </g>
        <path
          d="M5.3305 20C6.9305 18.4 7.99716 16 8.3305 15C8.49719 15.6667 8.73055 17.6 8.3305 20C7.93044 22.4 5.49714 25.3333 4.3305 26.5C3.99716 25 3.7305 21.6 5.3305 20Z"
          fill="#FF643F"
          stroke="#FF1111"
          strokeWidth="0.5"
        />
      </g>
      <defs>
        <filter
          id="filter0_i_786_572"
          x="0.75"
          y="-1.4563"
          width="49.8862"
          height="65.7815"
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
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-2" />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.913725 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_572"
          />
        </filter>
        <filter
          id="filter1_f_786_572"
          x="8"
          y="17"
          width="37"
          height="52"
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
            stdDeviation="2.5"
            result="effect1_foregroundBlur_786_572"
          />
        </filter>
        <filter
          id="filter2_f_786_572"
          x="14"
          y="35"
          width="23"
          height="32"
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
            stdDeviation="1.5"
            result="effect1_foregroundBlur_786_572"
          />
        </filter>
        <clipPath id="clip0_786_572">
          <rect width="51" height="64" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
export function MoneyIcon(props) {
  return (
    <svg
      {...props}
      width="45"
      height="59"
      viewBox="0 0 45 59"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_786_583)">
        <g filter="url(#filter0_ii_786_583)">
          <path
            d="M36.5 2L6 2.5C8 4.33333 12.2 8.7 13 11.5C13.8 14.3 15 16.3333 15.5 17H28L31 10C32.2 7.2 35.1667 3.5 36.5 2Z"
            fill="url(#paint0_linear_786_583)"
          />
        </g>
        <g filter="url(#filter1_iii_786_583)">
          <path
            d="M3 27C3.8 22.2 11.6667 18.3333 15.5 17H28C36 19 41 25.5 41 27C41 28.5 41.5 32 42 34C42.5 36 43 42 42.5 44.5C42.1 46.5 43 48.3333 43.5 49C44 49.6667 44.8 51.2 44 52C41 55 39.5 59 22 59C3 57.5 1 52.5 0 51C-1 49.5 0.5 49 0.5 48.5C0.5 48 1 43.5 1 40C1 36.5 2 33 2.5 31.5C3 30 2.5 28.5 3 27Z"
            fill="url(#paint1_linear_786_583)"
          />
        </g>
        <g filter="url(#filter2_f_786_583)">
          <path
            d="M13 28.5C14.2 22.9 16.5 18.5 17.5 17H19C17 19.8 14.1667 25.8333 13 28.5Z"
            fill="#A0752C"
          />
        </g>
        <g filter="url(#filter3_f_786_583)">
          <path
            d="M25 32.5C25 25 21.5 18.5 20.5 17H19C21 19.8 23.926 25 25 32.5Z"
            fill="#A0752C"
          />
        </g>
        <g filter="url(#filter4_f_786_583)">
          <path
            d="M25.0002 32.5C26.5 25.5 23.5002 18.5 22.5002 17H19.0002C21.0002 19.8 23.9261 25 25.0002 32.5Z"
            fill="#A0752C"
          />
        </g>
        <g filter="url(#filter5_i_786_583)">
          <path
            d="M11.0002 1.5H21.5002C21.5002 0.5 24.5 0 26.5 0C28.5 0 32 1 31.5 2C28.7 6.4 28 13.5 28 16.5H17.5C16 13.5 11.5002 3.5 11.0002 3C10.6002 2.6 10.8335 1.83333 11.0002 1.5Z"
            fill="url(#paint2_linear_786_583)"
          />
        </g>
        <g filter="url(#filter6_i_786_583)">
          <path
            d="M10 1.5H16.5C16.5 1.5 20.5 5 22 16.5H17.5C16 13.5 11.3165 3.6324 11.0002 3C10.5 2 10 1.5 10 1.5Z"
            fill="url(#paint3_linear_786_583)"
          />
        </g>
        <g filter="url(#filter7_f_786_583)">
          <path
            d="M17 2H22H23C23.1667 2.83333 23.4 5.2 23 8C21.5 17.5 21 16 21 15.5C20.6 7.9 18.1667 3.33333 17 2Z"
            fill="#9C7C36"
          />
        </g>
        <g filter="url(#filter8_i_786_583)">
          <path
            d="M22 5C22 2 21.5001 1.5 21.5001 1.5C21.5001 0.5 24.4999 0 26.4999 0C28.4999 0 31.9999 1 31.4999 2C28.6999 6.4 27.9999 13.5 27.9999 16.5H21C21 16.5 22 8 22 5Z"
            fill="url(#paint4_linear_786_583)"
          />
        </g>
        <g filter="url(#filter9_f_786_583)">
          <path
            d="M7.00983 39.8766C6.96063 28.0763 12.6099 19.8459 15.7554 17H16.7556C9.25487 24.8133 7.16689 33.9492 7.00983 39.8766C7.01537 41.2066 7.09331 42.5819 7.25538 44C7.07317 42.9431 6.96587 41.5355 7.00983 39.8766Z"
            fill="#946621"
          />
        </g>
        <g filter="url(#filter10_f_786_583)">
          <path
            d="M7.07431 41.9161C6.3123 29.0261 12.4315 20.0071 15.7551 17H17.7554C9.32891 25.7776 6.96325 36.2245 7.07431 41.9161C7.11474 42.5999 7.17454 43.2947 7.25514 44C7.15328 43.4092 7.08978 42.7087 7.07431 41.9161Z"
            fill="#946621"
          />
        </g>
        <g filter="url(#filter11_f_786_583)">
          <path
            d="M38.6811 43.9161C39.4431 31.0261 33.3239 22.0071 30.0002 19H28C36.4265 27.7776 38.7921 38.2245 38.6811 43.9161C38.6406 44.5999 38.5808 45.2947 38.5002 46C38.6021 45.4092 38.6656 44.7087 38.6811 43.9161Z"
            fill="#946621"
          />
        </g>
        <rect x="15" y="16" width="13" height="1" fill="#4C4244" />
        <path
          d="M21.8801 49.9659C20.3388 49.9659 18.9448 49.7732 17.6981 49.3879C16.4741 48.9799 15.3975 48.4359 14.4681 47.7559C13.5615 47.0759 12.8135 46.2939 12.2241 45.4099C11.6348 44.5259 11.5 43.5 11.5 43.5H15C15.476 44.2933 15.7148 44.4579 16.4401 45.0699C17.1655 45.6592 18.0041 46.1239 18.9561 46.4639C19.9081 46.8039 20.9508 46.9739 22.0841 46.9739C23.6255 46.9739 24.8381 46.7132 25.7221 46.1919C26.6288 45.6479 27.0821 44.8432 27.0821 43.7779C27.0821 43.1659 26.8555 42.6219 26.4021 42.1459C25.9488 41.6472 25.1328 41.2619 23.9541 40.9899L18.9901 39.8339C17.6755 39.5392 16.5875 39.1312 15.7261 38.6099C14.8875 38.0886 14.2641 37.4539 13.8561 36.7059C13.4481 35.9352 13.2441 35.0966 13.2441 34.1899C13.2441 32.9432 13.5728 31.8212 14.2301 30.8239C14.9101 29.8266 15.8848 29.0332 17.1541 28.4439C18.4235 27.8319 19.9535 27.5259 21.7441 27.5259C23.6708 27.5259 25.3595 27.8886 26.8101 28.6139C28.2608 29.3392 29.4621 30.4272 30.4141 31.8779C31.2273 33.1171 31.5 35 31.5 35H28.2423C28.2423 35 28.3134 34.4474 28.1021 34.1219C27.2635 32.8299 26.3115 31.9006 25.2461 31.3339C24.1808 30.7672 22.9115 30.4839 21.4381 30.4839C20.3501 30.4839 19.4548 30.6312 18.7521 30.9259C18.0721 31.1979 17.5621 31.5832 17.2221 32.0819C16.8821 32.5579 16.7121 33.0906 16.7121 33.6799C16.7121 34.1559 16.8028 34.5866 16.9841 34.9719C17.1881 35.3572 17.5508 35.6972 18.0721 35.9919C18.5935 36.2866 19.3301 36.5359 20.2821 36.7399L24.7021 37.7259C26.8101 38.2019 28.3061 38.9046 29.1901 39.8339C30.0741 40.7632 30.5161 41.9532 30.5161 43.4039C30.5161 44.7412 30.1535 45.9086 29.4281 46.9059C28.7028 47.8806 27.6941 48.6399 26.4021 49.1839C25.1101 49.7052 23.6028 49.9659 21.8801 49.9659ZM20.4521 52.2639V25.2959H23.1721V52.2639H20.4521Z"
          fill="#4C4244"
        />
      </g>
      <defs>
        <filter
          id="filter0_ii_786_583"
          x="6"
          y="2"
          width="30.5"
          height="15"
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
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.588235 0 0 0 0 0.462745 0 0 0 0 0.262745 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_583"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="0.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.529412 0 0 0 0 0.341176 0 0 0 0 0.141176 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_innerShadow_786_583"
            result="effect2_innerShadow_786_583"
          />
        </filter>
        <filter
          id="filter1_iii_786_583"
          x="-0.34375"
          y="13"
          width="44.6831"
          height="50"
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
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="10" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.560335 0 0 0 0 0.370033 0 0 0 0 0 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_583"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.282829 0 0 0 0 0.186667 0 0 0 0 0 0 0 0 0.4 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_innerShadow_786_583"
            result="effect2_innerShadow_786_583"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-4" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.384314 0 0 0 0 0.262745 0 0 0 0 0.113725 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_innerShadow_786_583"
            result="effect3_innerShadow_786_583"
          />
        </filter>
        <filter
          id="filter2_f_786_583"
          x="12"
          y="16"
          width="8"
          height="13.5"
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
            result="effect1_foregroundBlur_786_583"
          />
        </filter>
        <filter
          id="filter3_f_786_583"
          x="18"
          y="16"
          width="8"
          height="17.5"
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
            result="effect1_foregroundBlur_786_583"
          />
        </filter>
        <filter
          id="filter4_f_786_583"
          x="16"
          y="14"
          width="12.4126"
          height="21.5"
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
            stdDeviation="1.5"
            result="effect1_foregroundBlur_786_583"
          />
        </filter>
        <filter
          id="filter5_i_786_583"
          x="10.7793"
          y="0"
          width="20.769"
          height="16.5"
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
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.437012 0 0 0 0 0.262207 0 0 0 0 0 0 0 0 0.48 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_583"
          />
        </filter>
        <filter
          id="filter6_i_786_583"
          x="10"
          y="1.5"
          width="12"
          height="15"
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
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.437012 0 0 0 0 0.262207 0 0 0 0 0 0 0 0 0.48 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_583"
          />
        </filter>
        <filter
          id="filter7_f_786_583"
          x="15"
          y="0"
          width="10.2207"
          height="17.896"
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
            stdDeviation="1"
            result="effect1_foregroundBlur_786_583"
          />
        </filter>
        <filter
          id="filter8_i_786_583"
          x="21"
          y="0"
          width="10.5483"
          height="16.5"
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
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.437012 0 0 0 0 0.262207 0 0 0 0 0 0 0 0 0.48 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_583"
          />
        </filter>
        <filter
          id="filter9_f_786_583"
          x="6"
          y="16"
          width="11.7554"
          height="29"
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
            result="effect1_foregroundBlur_786_583"
          />
        </filter>
        <filter
          id="filter10_f_786_583"
          x="5.00928"
          y="15"
          width="14.7461"
          height="31"
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
            stdDeviation="1"
            result="effect1_foregroundBlur_786_583"
          />
        </filter>
        <filter
          id="filter11_f_786_583"
          x="26"
          y="17"
          width="14.7461"
          height="31"
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
            stdDeviation="1"
            result="effect1_foregroundBlur_786_583"
          />
        </filter>
        <linearGradient
          id="paint0_linear_786_583"
          x1="21.25"
          y1="2"
          x2="21.25"
          y2="17"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B9A382" />
          <stop offset="0.495" stopColor="#DDA529" />
          <stop offset="1" stopColor="#D6AD3C" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_786_583"
          x1="21.9978"
          y1="17"
          x2="21.9978"
          y2="59"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFDA57" />
          <stop offset="1" stopColor="#FFE68F" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_786_583"
          x1="21.1638"
          y1="0"
          x2="21.1638"
          y2="16.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D9CDAB" />
          <stop offset="0.485" stopColor="#D6B048" />
          <stop offset="1" stopColor="#8E5A23" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_786_583"
          x1="24"
          y1="9"
          x2="16"
          y2="17"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D9CDAB" />
          <stop offset="0.485" stopColor="#D6B048" />
          <stop offset="1" stopColor="#8E5A23" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_786_583"
          x1="18"
          y1="8"
          x2="33"
          y2="9"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A2833E" />
          <stop offset="0.485" stopColor="#D6B048" />
          <stop offset="1" stopColor="#8E5A23" />
        </linearGradient>
        <clipPath id="clip0_786_583">
          <rect width="45" height="59" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
export function DrumstickIcon(props) {
  return (
    <svg
      {...props}
      width="60"
      height="64"
      viewBox="0 0 60 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_786_581)">
        <g filter="url(#filter0_iii_786_581)">
          <path
            d="M8.47049 4.6312C9.28405 2.19052 10.8434 1.24137 11.5213 1.07188C14.0639 0.563404 16.0974 1.58035 17.1143 4.6312C18.1313 7.68205 17.1143 10.7329 17.1143 12.7668C17.1143 14.3939 18.1313 15.8176 18.6398 16.3261L27.2838 25.4787L21.1821 30.0549L16.6059 24.4617L12.5381 19.377C12.3686 19.2075 11.6228 18.8685 9.9957 18.8685C6.33468 19.682 3.72465 18.5295 2.87727 17.8515C1.52134 16.6651 -0.885444 13.5804 0.334895 10.7329C1.86032 7.17357 4.91117 8.19052 6.43659 7.68205C7.96201 7.17357 7.45354 7.68205 8.47049 4.6312Z"
            fill="url(#paint0_linear_786_581)"
          />
        </g>
        <g filter="url(#filter1_f_786_581)">
          <path
            d="M14.3023 15.1842L7.11865 8.59276C8.55538 8.59276 8.55538 6.7951 9.27375 4.99743C9.99211 3.19976 12.1472 0.802874 14.3023 2.60054C16.0264 4.03867 15.0207 11.5889 14.3023 15.1842Z"
            fill="url(#paint1_linear_786_581)"
          />
        </g>
        <g filter="url(#filter2_i_786_581)">
          <path
            d="M25.758 20.9024C26.9783 22.5295 30.3851 22.8168 33.3851 23.9532C35.5587 24.7766 34.9107 24.4618 38.9785 25.9872C43.0463 27.5126 53.2158 31.0719 57.7921 40.2245C62.3684 49.377 58.8091 57.5126 56.2667 59.5465C53.7243 61.5804 46.0972 66.1567 36.9446 63.1058C27.7921 60.055 24.2328 50.9024 22.7071 46.8347C21.1815 42.7669 19.148 33.1058 18.6396 31.5804C18.1311 30.055 17.1139 29.038 16.097 27.0041C15.2834 25.377 16.7749 24.2923 17.6224 23.9533C17.9614 23.9533 18.6393 23.8516 18.6393 23.4448C18.6393 22.4279 19.1478 21.4109 20.1648 21.4109C21.1817 21.4109 21.1817 21.4109 21.6902 20.9024C22.1987 20.394 21.6902 19.8854 22.7071 19.377C23.7241 18.8685 24.2326 18.8685 25.758 20.9024Z"
            fill="url(#paint2_radial_786_581)"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_iii_786_581"
          x="-1"
          y="0.947021"
          width="28.2837"
          height="31.1079"
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
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-1" dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.986328 0 0 0 0 0.951438 0 0 0 0 0.910732 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_581"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_innerShadow_786_581"
            result="effect2_innerShadow_786_581"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_innerShadow_786_581"
            result="effect3_innerShadow_786_581"
          />
        </filter>
        <filter
          id="filter1_f_786_581"
          x="6.11865"
          y="0.963867"
          width="10.1357"
          height="15.2205"
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
            result="effect1_foregroundBlur_786_581"
          />
        </filter>
        <filter
          id="filter2_i_786_581"
          x="15.8618"
          y="15.0945"
          width="44.1382"
          height="49.0305"
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
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-5" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.552631 0 0 0 0 0 0 0 0 0.3 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_581"
          />
        </filter>
        <linearGradient
          id="paint0_linear_786_581"
          x1="16.2712"
          y1="12.6419"
          x2="10.1695"
          y2="21.7945"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EDE3D5" />
          <stop offset="1" stopColor="#897C69" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_786_581"
          x1="11.1864"
          y1="9.59099"
          x2="16.2638"
          y2="9.01703"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B0A699" />
          <stop offset="1" stopColor="#AA9E90" stopOpacity="0" />
        </linearGradient>
        <radialGradient
          id="paint2_radial_786_581"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(50.3388 36.0318) rotate(125.311) scale(29.9094 29.3164)"
        >
          <stop stopColor="#EBC493" />
          <stop offset="0.245" stopColor="#E6AC64" />
          <stop offset="0.56" stopColor="#B8743B" />
          <stop offset="0.975" stopColor="#6F2B0F" />
        </radialGradient>
        <clipPath id="clip0_786_581">
          <rect width="60" height="64" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
export function BoneIcon(props) {
  return (
    <svg
      {...props}
      width="60"
      height="64"
      viewBox="0 0 60 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_786_585)">
        <g filter="url(#filter0_iii_786_585)">
          <path
            d="M45 1.00002C49 0.60002 50 4.16669 50 6.00002C50 9.00004 53 9 55.5 10.5C60 13.5 60 18 57 21.5C54 25 48.5 26 47 26C45.8 26 44.1667 27.3333 43.5 28L25.5 45C25.3333 45.1667 25 46 25 48C25 56 21 62 17 63.5C12.9999 65 9.99997 61.5 9.99997 59C9.99997 57 8.33332 55.8333 7.5 55.5C5.66666 55.3333 1.69997 54 0.49997 50C-1.00003 45 4.49997 39.5 9.99997 38.5C14.4 37.7 16.5 36.5 17 36C22.3333 31 33.2 20.8 34 20C35 19 35 19 35.5 12.5C36 6 40 1.50002 45 1.00002Z"
            fill="#CACCCE"
          />
        </g>
        <g filter="url(#filter1_f_786_585)">
          <ellipse
            cx="16.1879"
            cy="54.1477"
            rx="4.00953"
            ry="6.01282"
            transform="rotate(25.2005 16.1879 54.1477)"
            fill="#F6F6F6"
          />
        </g>
        <g filter="url(#filter2_f_786_585)">
          <ellipse
            cx="7.99994"
            cy="47.2995"
            rx="4.03745"
            ry="4.92086"
            transform="rotate(31.13 7.99994 47.2995)"
            fill="#F6F6F6"
          />
        </g>
        <g filter="url(#filter3_f_786_585)">
          <path
            d="M47.2842 7.51703C45.8244 9.01363 43.6346 11.5703 42.7223 12.6616C41.8099 13.7529 40.865 16.5 40.5001 16.5C40.0439 16.5 38.6165 12.1939 39.0727 9.38776C39.2977 8.00379 39.9851 4.71091 43.6346 3.30785C47.2842 1.90479 49.109 5.64629 47.2842 7.51703Z"
            fill="#F5F5F5"
          />
        </g>
        <g filter="url(#filter4_f_786_585)">
          <path
            d="M52 12.0194C47.6 11.6194 44.1667 17.5194 43 20.5194C45.1667 20.5194 50 20.2193 52 19.0193C54.5 17.5192 57.5 12.5194 52 12.0194Z"
            fill="#F6F6F6"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_iii_786_585"
          x="-1.75049"
          y="-1.03101"
          width="61.8413"
          height="64.8921"
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
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-2" />
          <feGaussianBlur stdDeviation="4.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.431373 0 0 0 0 0.431373 0 0 0 0 0.431373 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_786_585"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-2" dy="-2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_innerShadow_786_585"
            result="effect2_innerShadow_786_585"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="1" />
          <feGaussianBlur stdDeviation="2.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_innerShadow_786_585"
            result="effect3_innerShadow_786_585"
          />
        </filter>
        <filter
          id="filter1_f_786_585"
          x="7.74707"
          y="44.4441"
          width="16.8813"
          height="19.4072"
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
            stdDeviation="2"
            result="effect1_foregroundBlur_786_585"
          />
        </filter>
        <filter
          id="filter2_f_786_585"
          x="-0.291992"
          y="38.5974"
          width="16.5835"
          height="17.4043"
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
            stdDeviation="2"
            result="effect1_foregroundBlur_786_585"
          />
        </filter>
        <filter
          id="filter3_f_786_585"
          x="35.9839"
          y="0"
          width="15.0161"
          height="19.5"
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
            stdDeviation="1.5"
            result="effect1_foregroundBlur_786_585"
          />
        </filter>
        <filter
          id="filter4_f_786_585"
          x="40"
          y="9"
          width="18.0991"
          height="14.5193"
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
            stdDeviation="1.5"
            result="effect1_foregroundBlur_786_585"
          />
        </filter>
        <clipPath id="clip0_786_585">
          <rect width="60" height="64" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function ArrowRightTopIcon(props: any) {
  return (
    <svg
      {...props}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 9L9 1M9 1H3.66667M9 1V6.33333" stroke="#00FFD1" />
    </svg>
  );
}

export function ArrowTopIcon(props: any) {
  return (
    <svg
      {...props}
      width="13"
      height="8"
      viewBox="0 0 13 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 6.40039L6.5 2.00039L1 6.40039"
        stroke="white"
        strokeWidth="1.58"
      />
    </svg>
  );
}

export function SelectsDown(props: any) {
  return (
    <svg
      {...props}
      width="13"
      height="7"
      viewBox="0 0 13 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 1L6.5 5.4L1 1" stroke="white" strokeWidth="1.58" />
    </svg>
  );
}

export function UserStakeRankingSort(props: any) {
  return (
    <svg
      {...props}
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.38406 5.53907C5.18417 5.77894 4.81574 5.77894 4.61584 5.53907L0.683363 0.82009C0.411977 0.494427 0.643556 -8.17966e-07 1.06747 -7.80906e-07L8.93243 -9.33297e-08C9.35635 -5.62695e-08 9.58793 0.494429 9.31654 0.820092L5.38406 5.53907Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function UserStakeRankingTab1(props: any) {
  return (
    <svg
      {...props}
      width="28"
      height="32"
      viewBox="0 0 28 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.5747 0V7.37562L18.9884 7.5956L17.4294 8.18173L13.742 9.56697L10.8344 8.4746L10.055 8.18173L9.27509 7.88866L8.49561 7.5956L7.9093 7.37562V0H19.5747Z"
        fill="url(#paint0_linear_1484_6598)"
      />
      <path
        opacity="0.8"
        d="M10.8341 0V8.4746L10.0546 8.18173L9.27478 7.88866V0H10.8341Z"
        fill="url(#paint1_linear_1484_6598)"
      />
      <path
        opacity="0.8"
        d="M16.6493 0V8.4746L17.4288 8.18173L18.2086 7.88866V0H16.6493Z"
        fill="url(#paint2_linear_1484_6598)"
      />
      <path
        d="M9.63879 28.158L13.74 31.9967V18.2568L9.63879 28.158Z"
        fill="url(#paint3_linear_1484_6598)"
      />
      <path
        d="M17.8412 8.3553L13.7397 4.5166V18.2566L17.8412 8.3553Z"
        fill="url(#paint4_linear_1484_6598)"
      />
      <path
        d="M3.83838 22.358L4.0242 27.9724L13.7397 18.2568L3.83838 22.358Z"
        fill="url(#paint5_linear_1484_6598)"
      />
      <path
        d="M23.6411 14.1544L23.4553 8.54004L13.7397 18.2558L23.6411 14.1544Z"
        fill="url(#paint6_linear_1484_6598)"
      />
      <path
        d="M0 18.2557H13.7398L3.83848 14.1543L0 18.2557Z"
        fill="url(#paint7_linear_1484_6598)"
      />
      <path
        d="M13.7397 18.2568L23.6411 22.358L27.4798 18.2568H13.7397Z"
        fill="url(#paint8_linear_1484_6598)"
      />
      <path
        d="M9.63849 8.35449L4.02417 8.5401L13.7397 18.2558L9.63849 8.35449Z"
        fill="url(#paint9_linear_1484_6598)"
      />
      <path
        d="M4.02417 27.9724L9.63849 28.158L13.7397 18.2568L4.02417 27.9724Z"
        fill="url(#paint10_linear_1484_6598)"
      />
      <path
        d="M17.8412 8.35449L13.7397 18.2558L23.4553 8.5401L17.8412 8.35449Z"
        fill="url(#paint11_linear_1484_6598)"
      />
      <path
        d="M3.83848 22.358L13.7398 18.2568H0L3.83848 22.358Z"
        fill="url(#paint12_linear_1484_6598)"
      />
      <path
        d="M13.7397 18.2557H27.4798L23.6411 14.1543L13.7397 18.2557Z"
        fill="url(#paint13_linear_1484_6598)"
      />
      <path
        d="M3.83838 14.1544L13.7397 18.2558L4.0242 8.54004L3.83838 14.1544Z"
        fill="url(#paint14_linear_1484_6598)"
      />
      <path
        d="M13.7397 18.2568L23.4553 27.9724L23.6411 22.358L13.7397 18.2568Z"
        fill="url(#paint15_linear_1484_6598)"
      />
      <path
        d="M13.7397 18.2568L17.8412 28.158L23.4553 27.9724L13.7397 18.2568Z"
        fill="url(#paint16_linear_1484_6598)"
      />
      <path
        d="M13.74 4.5166L9.63879 8.3553L13.74 18.2566V4.5166Z"
        fill="url(#paint17_linear_1484_6598)"
      />
      <path
        d="M13.7397 18.2568V31.9967L17.8412 28.158L13.7397 18.2568Z"
        fill="url(#paint18_linear_1484_6598)"
      />
      <path
        d="M13.7396 28.4246C19.3563 28.4246 23.9094 23.8714 23.9094 18.2548C23.9094 12.6381 19.3563 8.08496 13.7396 8.08496C8.123 8.08496 3.56982 12.6381 3.56982 18.2548C3.56982 23.8714 8.123 28.4246 13.7396 28.4246Z"
        fill="url(#paint19_linear_1484_6598)"
      />
      <path
        d="M13.7397 26.8348C18.4783 26.8348 22.3197 22.9934 22.3197 18.2548C22.3197 13.5162 18.4783 9.6748 13.7397 9.6748C9.00107 9.6748 5.15967 13.5162 5.15967 18.2548C5.15967 22.9934 9.00107 26.8348 13.7397 26.8348Z"
        fill="url(#paint20_linear_1484_6598)"
      />
      <path
        d="M13.74 25.9862C18.0097 25.9862 21.4709 22.5249 21.4709 18.2553C21.4709 13.9856 18.0097 10.5244 13.74 10.5244C9.47039 10.5244 6.00916 13.9856 6.00916 18.2553C6.00916 22.5249 9.47039 25.9862 13.74 25.9862Z"
        fill="url(#paint21_linear_1484_6598)"
      />
      <path
        d="M13.7398 24.627C17.2596 24.627 20.1129 21.7737 20.1129 18.2539C20.1129 14.7342 17.2596 11.8809 13.7398 11.8809C10.22 11.8809 7.3667 14.7342 7.3667 18.2539C7.3667 21.7737 10.22 24.627 13.7398 24.627Z"
        fill="url(#paint22_linear_1484_6598)"
      />
      <path
        d="M10.336 13.97L13.15 13.13H14.62V23H12.492V15.314L10.784 15.734L10.336 13.97Z"
        fill="black"
        fillOpacity="0.5"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1484_6598"
          x1="13.742"
          y1="0.47528"
          x2="13.742"
          y2="9.28259"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4BE44B" />
          <stop offset="1" stopColor="#1EAA1E" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1484_6598"
          x1="10.0545"
          y1="9.012"
          x2="10.0545"
          y2="-0.0373881"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E8EBED" />
          <stop offset="1" stopColor="#F8F9FA" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_1484_6598"
          x1="17.429"
          y1="9.012"
          x2="17.429"
          y2="-0.0373881"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E8EBED" />
          <stop offset="1" stopColor="#F8F9FA" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_1484_6598"
          x1="9.77822"
          y1="25.1266"
          x2="13.4994"
          y2="25.1266"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC630" />
          <stop offset="1" stopColor="#FFEC4D" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_1484_6598"
          x1="13.7397"
          y1="11.3866"
          x2="17.8412"
          y2="11.3866"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC630" />
          <stop offset="1" stopColor="#FFEC4D" />
        </linearGradient>
        <linearGradient
          id="paint5_linear_1484_6598"
          x1="9.11044"
          y1="23.3968"
          x2="6.44038"
          y2="20.097"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC630" />
          <stop offset="1" stopColor="#FFEC4D" />
        </linearGradient>
        <linearGradient
          id="paint6_linear_1484_6598"
          x1="18.9179"
          y1="13.6453"
          x2="21.9479"
          y2="15.9852"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC630" />
          <stop offset="1" stopColor="#FFEC4D" />
        </linearGradient>
        <linearGradient
          id="paint7_linear_1484_6598"
          x1="7.69088"
          y1="15.3366"
          x2="6.61084"
          y2="19.1767"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC630" />
          <stop offset="1" stopColor="#FFEC4D" />
        </linearGradient>
        <linearGradient
          id="paint8_linear_1484_6598"
          x1="20.8827"
          y1="17.3246"
          x2="19.6528"
          y2="21.5246"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC630" />
          <stop offset="1" stopColor="#FFEC4D" />
        </linearGradient>
        <linearGradient
          id="paint9_linear_1484_6598"
          x1="7.95126"
          y1="13.9549"
          x2="11.7612"
          y2="11.675"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC630" />
          <stop offset="1" stopColor="#FFEC4D" />
        </linearGradient>
        <linearGradient
          id="paint10_linear_1484_6598"
          x1="8.49923"
          y1="22.8395"
          x2="11.7992"
          y2="25.2095"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFF96" />
          <stop offset="1" stopColor="#FFE871" />
        </linearGradient>
        <linearGradient
          id="paint11_linear_1484_6598"
          x1="16.2034"
          y1="11.5168"
          x2="18.7235"
          y2="13.4968"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFF96" />
          <stop offset="1" stopColor="#FFE871" />
        </linearGradient>
        <linearGradient
          id="paint12_linear_1484_6598"
          x1="6.61769"
          y1="17.1434"
          x2="7.63763"
          y2="21.6435"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFF96" />
          <stop offset="1" stopColor="#FFE871" />
        </linearGradient>
        <linearGradient
          id="paint13_linear_1484_6598"
          x1="20.0726"
          y1="15.4363"
          x2="20.6727"
          y2="18.5863"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFF96" />
          <stop offset="1" stopColor="#FFE871" />
        </linearGradient>
        <linearGradient
          id="paint14_linear_1484_6598"
          x1="9.4896"
          y1="12.377"
          x2="7.23981"
          y2="16.1569"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFF96" />
          <stop offset="1" stopColor="#FFE871" />
        </linearGradient>
        <linearGradient
          id="paint15_linear_1484_6598"
          x1="20.3161"
          y1="20.5365"
          x2="18.2762"
          y2="23.5965"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFF96" />
          <stop offset="1" stopColor="#FFE871" />
        </linearGradient>
        <linearGradient
          id="paint16_linear_1484_6598"
          x1="18.7606"
          y1="22.9942"
          x2="15.6707"
          y2="25.2742"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFC630" />
          <stop offset="1" stopColor="#FFEC4D" />
        </linearGradient>
        <linearGradient
          id="paint17_linear_1484_6598"
          x1="9.63879"
          y1="11.3866"
          x2="13.74"
          y2="11.3866"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFF96" />
          <stop offset="1" stopColor="#FFE871" />
        </linearGradient>
        <linearGradient
          id="paint18_linear_1484_6598"
          x1="13.8279"
          y1="25.1266"
          x2="17.7095"
          y2="25.1266"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDFF96" />
          <stop offset="1" stopColor="#FFE871" />
        </linearGradient>
        <linearGradient
          id="paint19_linear_1484_6598"
          x1="13.7396"
          y1="8.23919"
          x2="13.7396"
          y2="27.7237"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F0F3F5" />
          <stop offset="1" stopColor="#D0D6DB" />
        </linearGradient>
        <linearGradient
          id="paint20_linear_1484_6598"
          x1="13.7397"
          y1="9.97906"
          x2="13.7397"
          y2="29.689"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8C93A5" />
          <stop offset="1" stopColor="#CED7E1" />
        </linearGradient>
        <linearGradient
          id="paint21_linear_1484_6598"
          x1="10.3583"
          y1="11.7439"
          x2="17.1982"
          y2="24.9136"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFCB40" />
          <stop offset="1" stopColor="#F89C27" />
        </linearGradient>
        <linearGradient
          id="paint22_linear_1484_6598"
          x1="10.5993"
          y1="12.0238"
          x2="16.4677"
          y2="23.6652"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FA8C00" />
          <stop offset="1" stopColor="#FFC017" />
        </linearGradient>
      </defs>
    </svg>
  );
}
export function UserStakeRankingTab2(props: any) {
  return (
    <svg
      {...props}
      width="28"
      height="32"
      viewBox="0 0 28 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.5747 0V7.37566L18.9881 7.59564L17.4292 8.18177L13.7419 9.56702L10.8341 8.47464L10.0547 8.18177L9.27498 7.88871L8.49549 7.59564L7.90918 7.37566V0H19.5747Z"
        fill="url(#paint0_linear_1484_6625)"
      />
      <path
        opacity="0.8"
        d="M10.8341 0V8.47464L10.0546 8.18177L9.2749 7.8887V0H10.8341Z"
        fill="url(#paint1_linear_1484_6625)"
      />
      <path
        d="M9.63904 28.157L13.7402 31.9957V18.2559L9.63904 28.157Z"
        fill="url(#paint2_linear_1484_6625)"
      />
      <path
        d="M17.8412 8.35434L13.74 4.51562V18.2557L17.8412 8.35434Z"
        fill="url(#paint3_linear_1484_6625)"
      />
      <path
        d="M3.83838 22.3571L4.02421 27.9714L13.7397 18.2559L3.83838 22.3571Z"
        fill="url(#paint4_linear_1484_6625)"
      />
      <path
        d="M23.6414 14.1544L23.4555 8.54004L13.74 18.2558L23.6414 14.1544Z"
        fill="url(#paint5_linear_1484_6625)"
      />
      <path
        d="M0 18.2557H13.7399L3.83849 14.1543L0 18.2557Z"
        fill="url(#paint6_linear_1484_6625)"
      />
      <path
        d="M13.74 18.2559L23.6414 22.3571L27.4799 18.2559H13.74Z"
        fill="url(#paint7_linear_1484_6625)"
      />
      <path
        d="M9.6385 8.35352L4.02417 8.53912L13.7397 18.2549L9.6385 8.35352Z"
        fill="url(#paint8_linear_1484_6625)"
      />
      <path
        d="M4.02417 27.9714L9.6385 28.157L13.7397 18.2559L4.02417 27.9714Z"
        fill="url(#paint9_linear_1484_6625)"
      />
      <path
        d="M17.8412 8.35352L13.74 18.2549L23.4555 8.53912L17.8412 8.35352Z"
        fill="url(#paint10_linear_1484_6625)"
      />
      <path
        d="M3.83849 22.3571L13.7399 18.2559H0L3.83849 22.3571Z"
        fill="url(#paint11_linear_1484_6625)"
      />
      <path
        d="M13.74 18.2557H27.4799L23.6414 14.1543L13.74 18.2557Z"
        fill="url(#paint12_linear_1484_6625)"
      />
      <path
        d="M3.83838 14.1544L13.7397 18.2558L4.02421 8.54004L3.83838 14.1544Z"
        fill="url(#paint13_linear_1484_6625)"
      />
      <path
        d="M13.74 18.2559L23.4555 27.9714L23.6414 22.3571L13.74 18.2559Z"
        fill="url(#paint14_linear_1484_6625)"
      />
      <path
        d="M13.74 18.2559L17.8412 28.157L23.4555 27.9714L13.74 18.2559Z"
        fill="url(#paint15_linear_1484_6625)"
      />
      <path
        d="M13.7402 4.51562L9.63904 8.35434L13.7402 18.2557V4.51562Z"
        fill="url(#paint16_linear_1484_6625)"
      />
      <path
        d="M13.74 18.2559V31.9957L17.8412 28.157L13.74 18.2559Z"
        fill="url(#paint17_linear_1484_6625)"
      />
      <path
        d="M13.7397 28.4246C19.3563 28.4246 23.9095 23.8714 23.9095 18.2548C23.9095 12.6381 19.3563 8.08496 13.7397 8.08496C8.12301 8.08496 3.56982 12.6381 3.56982 18.2548C3.56982 23.8714 8.12301 28.4246 13.7397 28.4246Z"
        fill="url(#paint18_linear_1484_6625)"
      />
      <path
        d="M13.7399 26.8359C18.4786 26.8359 22.32 22.9944 22.32 18.2558C22.32 13.5172 18.4786 9.67578 13.7399 9.67578C9.00132 9.67578 5.15991 13.5172 5.15991 18.2558C5.15991 22.9944 9.00132 26.8359 13.7399 26.8359Z"
        fill="url(#paint19_linear_1484_6625)"
      />
      <path
        d="M13.7401 25.9872C18.0097 25.9872 21.4709 22.5259 21.4709 18.2563C21.4709 13.9866 18.0097 10.5254 13.7401 10.5254C9.4704 10.5254 6.00916 13.9866 6.00916 18.2563C6.00916 22.5259 9.4704 25.9872 13.7401 25.9872Z"
        fill="url(#paint20_linear_1484_6625)"
      />
      <path
        d="M13.7396 24.63C17.2593 24.63 20.1127 21.7767 20.1127 18.2569C20.1127 14.7371 17.2593 11.8838 13.7396 11.8838C10.2198 11.8838 7.36646 14.7371 7.36646 18.2569C7.36646 21.7767 10.2198 24.63 13.7396 24.63Z"
        fill="url(#paint21_linear_1484_6625)"
      />
      <path
        opacity="0.8"
        d="M16.6495 0V8.47464L17.429 8.18177L18.2087 7.8887V0H16.6495Z"
        fill="url(#paint22_linear_1484_6625)"
      />
      <path
        d="M13.326 14.992C12.57 14.992 12.052 15.412 11.324 16.308L9.812 15.09C10.778 13.774 11.716 13.06 13.466 13.06C15.552 13.06 16.84 14.264 16.84 16.098C16.84 17.736 16 18.562 14.264 19.906L12.668 21.138H16.938V23H9.686V21.292L12.948 18.618C14.166 17.61 14.642 17.078 14.642 16.266C14.642 15.44 14.096 14.992 13.326 14.992Z"
        fill="black"
        fillOpacity="0.5"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1484_6625"
          x1="13.4131"
          y1="1.22914"
          x2="13.4131"
          y2="1.22914"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4BE44B" />
          <stop offset="1" stopColor="#24B124" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1484_6625"
          x1="10.0546"
          y1="0"
          x2="10.0546"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E8EBED" />
          <stop offset="1" stopColor="#F8F9FA" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_1484_6625"
          x1="9.77846"
          y1="25.1257"
          x2="13.4994"
          y2="25.1257"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CED7E1" />
          <stop offset="1" stopColor="#8C93A5" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_1484_6625"
          x1="13.74"
          y1="11.3857"
          x2="17.8412"
          y2="11.3857"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CED7E1" />
          <stop offset="1" stopColor="#8C93A5" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_1484_6625"
          x1="9.11045"
          y1="23.3958"
          x2="6.44039"
          y2="20.096"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8C93A5" />
          <stop offset="1" stopColor="#CED7E1" />
        </linearGradient>
        <linearGradient
          id="paint5_linear_1484_6625"
          x1="18.9182"
          y1="13.6453"
          x2="21.9482"
          y2="15.9852"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8C93A5" />
          <stop offset="1" stopColor="#CED7E1" />
        </linearGradient>
        <linearGradient
          id="paint6_linear_1484_6625"
          x1="7.6909"
          y1="15.3366"
          x2="6.61086"
          y2="19.1767"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CED7E1" />
          <stop offset="1" stopColor="#8C93A5" />
        </linearGradient>
        <linearGradient
          id="paint7_linear_1484_6625"
          x1="20.8829"
          y1="17.3236"
          x2="19.6528"
          y2="21.5236"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8C93A5" />
          <stop offset="1" stopColor="#CED7E1" />
        </linearGradient>
        <linearGradient
          id="paint8_linear_1484_6625"
          x1="7.95104"
          y1="13.9539"
          x2="11.761"
          y2="11.6741"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8C93A5" />
          <stop offset="1" stopColor="#CED7E1" />
        </linearGradient>
        <linearGradient
          id="paint9_linear_1484_6625"
          x1="8.49902"
          y1="22.8385"
          x2="11.799"
          y2="25.2085"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D0D6DB" />
          <stop offset="1" stopColor="#F0F3F5" />
        </linearGradient>
        <linearGradient
          id="paint10_linear_1484_6625"
          x1="16.2037"
          y1="11.5159"
          x2="18.7235"
          y2="13.4959"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D0D6DB" />
          <stop offset="1" stopColor="#F0F3F5" />
        </linearGradient>
        <linearGradient
          id="paint11_linear_1484_6625"
          x1="6.61748"
          y1="17.1424"
          x2="7.63743"
          y2="21.6425"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D0D6DB" />
          <stop offset="1" stopColor="#F0F3F5" />
        </linearGradient>
        <linearGradient
          id="paint12_linear_1484_6625"
          x1="20.0729"
          y1="15.4363"
          x2="20.6728"
          y2="18.5863"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F0F3F5" />
          <stop offset="1" stopColor="#D0D6DB" />
        </linearGradient>
        <linearGradient
          id="paint13_linear_1484_6625"
          x1="9.48961"
          y1="12.377"
          x2="7.23959"
          y2="16.1569"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D0D6DB" />
          <stop offset="1" stopColor="#F0F3F5" />
        </linearGradient>
        <linearGradient
          id="paint14_linear_1484_6625"
          x1="20.3164"
          y1="20.5355"
          x2="18.2765"
          y2="23.5955"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D0D6DB" />
          <stop offset="1" stopColor="#F0F3F5" />
        </linearGradient>
        <linearGradient
          id="paint15_linear_1484_6625"
          x1="18.7608"
          y1="22.9932"
          x2="15.6709"
          y2="25.2733"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CED7E1" />
          <stop offset="1" stopColor="#8C93A5" />
        </linearGradient>
        <linearGradient
          id="paint16_linear_1484_6625"
          x1="9.63904"
          y1="11.3857"
          x2="13.7402"
          y2="11.3857"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D0D6DB" />
          <stop offset="1" stopColor="#F0F3F5" />
        </linearGradient>
        <linearGradient
          id="paint17_linear_1484_6625"
          x1="13.8282"
          y1="25.1257"
          x2="17.7097"
          y2="25.1257"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D0D6DB" />
          <stop offset="1" stopColor="#F0F3F5" />
        </linearGradient>
        <linearGradient
          id="paint18_linear_1484_6625"
          x1="13.7397"
          y1="8.23919"
          x2="13.7397"
          y2="27.7237"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F0F3F5" />
          <stop offset="1" stopColor="#D0D6DB" />
        </linearGradient>
        <linearGradient
          id="paint19_linear_1484_6625"
          x1="13.7399"
          y1="-3.10887"
          x2="13.7399"
          y2="-3.10887"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8C93A5" />
          <stop offset="1" stopColor="#CED7E1" />
        </linearGradient>
        <linearGradient
          id="paint20_linear_1484_6625"
          x1="10.3583"
          y1="11.7449"
          x2="17.1983"
          y2="24.9146"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CED7E1" />
          <stop offset="1" stopColor="#8C93A5" />
        </linearGradient>
        <linearGradient
          id="paint21_linear_1484_6625"
          x1="10.5991"
          y1="12.0267"
          x2="16.4673"
          y2="23.6682"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8C93A5" />
          <stop offset="1" stopColor="#CED7E1" />
        </linearGradient>
        <linearGradient
          id="paint22_linear_1484_6625"
          x1="17.429"
          y1="0"
          x2="17.429"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E8EBED" />
          <stop offset="1" stopColor="#F8F9FA" />
        </linearGradient>
      </defs>
    </svg>
  );
}
export function UserStakeRankingTab3(props: any) {
  return (
    <svg
      {...props}
      width="28"
      height="32"
      viewBox="0 0 28 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.5747 0V7.37571L18.9882 7.5957L17.4293 8.18183L13.742 9.56709L10.8342 8.4747L10.0547 8.18183L9.27499 7.88876L8.4955 7.5957L7.90918 7.37571V0H19.5747Z"
        fill="url(#paint0_linear_1484_6652)"
      />
      <path
        opacity="0.8"
        d="M10.8342 0V8.4747L10.0547 8.18183L9.27502 7.88876V0H10.8342Z"
        fill="url(#paint1_linear_1484_6652)"
      />
      <path
        opacity="0.8"
        d="M16.6497 0V8.4747L17.4292 8.18183L18.2088 7.88876V0H16.6497Z"
        fill="url(#paint2_linear_1484_6652)"
      />
      <path
        d="M9.63904 28.157L13.7403 31.9958V18.2559L9.63904 28.157Z"
        fill="url(#paint3_linear_1484_6652)"
      />
      <path
        d="M17.8414 8.35435L13.74 4.51562V18.2558L17.8414 8.35435Z"
        fill="url(#paint4_linear_1484_6652)"
      />
      <path
        d="M3.83862 22.3571L4.02423 27.9714L13.7398 18.2559L3.83862 22.3571Z"
        fill="url(#paint5_linear_1484_6652)"
      />
      <path
        d="M23.6414 14.1544L23.4558 8.54004L13.74 18.2558L23.6414 14.1544Z"
        fill="url(#paint6_linear_1484_6652)"
      />
      <path
        d="M0 18.2557H13.7399L3.83873 14.1543L0 18.2557Z"
        fill="url(#paint7_linear_1484_6652)"
      />
      <path
        d="M13.74 18.2559L23.6414 22.3571L27.4801 18.2559H13.74Z"
        fill="url(#paint8_linear_1484_6652)"
      />
      <path
        d="M9.63877 8.35352L4.02441 8.53912L13.74 18.2549L9.63877 8.35352Z"
        fill="url(#paint9_linear_1484_6652)"
      />
      <path
        d="M4.02441 27.9714L9.63877 28.157L13.74 18.2559L4.02441 27.9714Z"
        fill="url(#paint10_linear_1484_6652)"
      />
      <path
        d="M17.8414 8.35352L13.74 18.2549L23.4558 8.53912L17.8414 8.35352Z"
        fill="url(#paint11_linear_1484_6652)"
      />
      <path
        d="M3.83873 22.3571L13.7399 18.2559H0L3.83873 22.3571Z"
        fill="url(#paint12_linear_1484_6652)"
      />
      <path
        d="M13.74 18.2557H27.4801L23.6414 14.1543L13.74 18.2557Z"
        fill="url(#paint13_linear_1484_6652)"
      />
      <path
        d="M3.83862 14.1544L13.7398 18.2558L4.02423 8.54004L3.83862 14.1544Z"
        fill="url(#paint14_linear_1484_6652)"
      />
      <path
        d="M13.74 18.2559L23.4558 27.9714L23.6414 22.3571L13.74 18.2559Z"
        fill="url(#paint15_linear_1484_6652)"
      />
      <path
        d="M13.74 18.2559L17.8414 28.157L23.4558 27.9714L13.74 18.2559Z"
        fill="url(#paint16_linear_1484_6652)"
      />
      <path
        d="M13.7403 4.51562L9.63904 8.35435L13.7403 18.2558V4.51562Z"
        fill="url(#paint17_linear_1484_6652)"
      />
      <path
        d="M13.74 18.2559V31.9958L17.8414 28.157L13.74 18.2559Z"
        fill="url(#paint18_linear_1484_6652)"
      />
      <path
        d="M13.7399 28.4267C19.3566 28.4267 23.9098 23.8734 23.9098 18.2568C23.9098 12.6401 19.3566 8.08691 13.7399 8.08691C8.12327 8.08691 3.57007 12.6401 3.57007 18.2568C3.57007 23.8734 8.12327 28.4267 13.7399 28.4267Z"
        fill="url(#paint19_linear_1484_6652)"
      />
      <path
        d="M13.74 26.8349C18.4786 26.8349 22.32 22.9935 22.32 18.2549C22.32 13.5162 18.4786 9.6748 13.74 9.6748C9.00134 9.6748 5.15991 13.5162 5.15991 18.2549C5.15991 22.9935 9.00134 26.8349 13.74 26.8349Z"
        fill="url(#paint20_linear_1484_6652)"
      />
      <path
        d="M13.7401 25.9872C18.0098 25.9872 21.471 22.526 21.471 18.2563C21.471 13.9866 18.0098 10.5254 13.7401 10.5254C9.47041 10.5254 6.00916 13.9866 6.00916 18.2563C6.00916 22.526 9.47041 25.9872 13.7401 25.9872Z"
        fill="url(#paint21_linear_1484_6652)"
      />
      <path
        d="M13.7398 24.63C17.2596 24.63 20.113 21.7767 20.113 18.2569C20.113 14.7371 17.2596 11.8838 13.7398 11.8838C10.22 11.8838 7.3667 14.7371 7.3667 18.2569C7.3667 21.7767 10.22 24.63 13.7398 24.63Z"
        fill="url(#paint22_linear_1484_6652)"
      />
      <path
        d="M13.956 15.048H10.106V13.2H16.728V14.824L14.25 17.19C15.594 17.414 16.882 18.114 16.882 19.948C16.882 21.81 15.538 23.168 13.354 23.168C11.59 23.168 10.372 22.468 9.532 21.474L11.016 20.06C11.688 20.816 12.388 21.236 13.382 21.236C14.194 21.236 14.768 20.774 14.768 20.032C14.768 19.22 14.082 18.772 12.85 18.772H11.954L11.618 17.4L13.956 15.048Z"
        fill="black"
        fillOpacity="0.5"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1484_6652"
          x1="13.4131"
          y1="1.22915"
          x2="13.4131"
          y2="1.22915"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4BE44B" />
          <stop offset="1" stopColor="#24B124" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1484_6652"
          x1="10.0547"
          y1="0"
          x2="10.0547"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E8EBED" />
          <stop offset="1" stopColor="#F8F9FA" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_1484_6652"
          x1="17.4291"
          y1="0"
          x2="17.4291"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E8EBED" />
          <stop offset="1" stopColor="#F8F9FA" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_1484_6652"
          x1="9.77846"
          y1="25.1257"
          x2="13.4996"
          y2="25.1257"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BB6D2C" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_1484_6652"
          x1="13.74"
          y1="11.3857"
          x2="17.8414"
          y2="11.3857"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EDB481" />
          <stop offset="1" stopColor="#BB6D2C" />
        </linearGradient>
        <linearGradient
          id="paint5_linear_1484_6652"
          x1="9.11049"
          y1="23.3958"
          x2="6.44042"
          y2="20.096"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BB6D2C" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint6_linear_1484_6652"
          x1="18.9182"
          y1="13.6453"
          x2="21.9482"
          y2="15.9853"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BB6D2C" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint7_linear_1484_6652"
          x1="7.69093"
          y1="15.3366"
          x2="6.61088"
          y2="19.1767"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EDB481" />
          <stop offset="1" stopColor="#BB6D2C" />
        </linearGradient>
        <linearGradient
          id="paint8_linear_1484_6652"
          x1="20.8832"
          y1="17.3236"
          x2="19.6531"
          y2="21.5236"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BB6D2C" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint9_linear_1484_6652"
          x1="7.95152"
          y1="13.9539"
          x2="11.7615"
          y2="11.6741"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BB6D2C" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint10_linear_1484_6652"
          x1="8.4995"
          y1="22.8386"
          x2="11.7995"
          y2="25.2086"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D2B2" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint11_linear_1484_6652"
          x1="16.2037"
          y1="11.5159"
          x2="18.7237"
          y2="13.4959"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D2B2" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint12_linear_1484_6652"
          x1="6.61773"
          y1="17.1424"
          x2="7.63768"
          y2="21.6425"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D2B2" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint13_linear_1484_6652"
          x1="20.0731"
          y1="15.4363"
          x2="20.673"
          y2="18.5863"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D2B2" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint14_linear_1484_6652"
          x1="9.48966"
          y1="12.377"
          x2="7.23985"
          y2="16.1569"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D2B2" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint15_linear_1484_6652"
          x1="20.3166"
          y1="20.5355"
          x2="18.2765"
          y2="23.5956"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D2B2" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint16_linear_1484_6652"
          x1="18.7611"
          y1="22.9932"
          x2="15.671"
          y2="25.2733"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EDB481" />
          <stop offset="1" stopColor="#BB6D2C" />
        </linearGradient>
        <linearGradient
          id="paint17_linear_1484_6652"
          x1="9.63904"
          y1="11.3857"
          x2="13.7403"
          y2="11.3857"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D2B2" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint18_linear_1484_6652"
          x1="13.8282"
          y1="25.1257"
          x2="17.7097"
          y2="25.1257"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5D2B2" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
        <linearGradient
          id="paint19_linear_1484_6652"
          x1="13.7399"
          y1="8.24114"
          x2="13.7399"
          y2="27.7258"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F0F3F5" />
          <stop offset="1" stopColor="#D0D6DB" />
        </linearGradient>
        <linearGradient
          id="paint20_linear_1484_6652"
          x1="13.74"
          y1="9.97907"
          x2="13.74"
          y2="29.6891"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8C93A5" />
          <stop offset="1" stopColor="#CED7E1" />
        </linearGradient>
        <linearGradient
          id="paint21_linear_1484_6652"
          x1="10.3583"
          y1="11.7449"
          x2="17.1983"
          y2="24.9147"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EDB481" />
          <stop offset="1" stopColor="#BB6D2C" />
        </linearGradient>
        <linearGradient
          id="paint22_linear_1484_6652"
          x1="10.5993"
          y1="12.0267"
          x2="16.4678"
          y2="23.6682"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BB6D2C" />
          <stop offset="1" stopColor="#EDB481" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function UserStakeRankingPrevious({
  color,
  ...props
}: { color: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="12"
      height="10"
      viewBox="0 0 12 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.53032 8.46967C6.82322 8.76256 6.82322 9.23744 6.53032 9.53033C6.23743 9.82322 5.76256 9.82322 5.46966 9.53033L1.46966 5.53033L0.939331 5L1.46966 4.46967L5.46966 0.46967C5.76256 0.176777 6.23743 0.176777 6.53032 0.46967C6.82322 0.762563 6.82322 1.23744 6.53032 1.53033L3.06065 5L6.53032 8.46967ZM11.5303 8.46967C11.8232 8.76256 11.8232 9.23744 11.5303 9.53033C11.2374 9.82322 10.7626 9.82322 10.4697 9.53033L6.46966 5.53033L5.93933 5L6.46966 4.46967L10.4697 0.46967C10.7626 0.176777 11.2374 0.176777 11.5303 0.46967C11.8232 0.762563 11.8232 1.23744 11.5303 1.53033L8.06065 5L11.5303 8.46967Z"
        fill={color}
      />
    </svg>
  );
}
export function UserStakeRankingNext({
  color,
  ...props
}: { color: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="12"
      height="10"
      viewBox="0 0 12 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.46967 8.46967C0.176777 8.76256 0.176777 9.23744 0.46967 9.53033C0.762563 9.82322 1.23744 9.82322 1.53033 9.53033L5.53033 5.53033L6.06066 5L5.53033 4.46967L1.53033 0.46967C1.23744 0.176777 0.762563 0.176777 0.46967 0.46967C0.176777 0.762563 0.176777 1.23744 0.46967 1.53033L3.93934 5L0.46967 8.46967ZM5.46967 8.46967C5.17678 8.76256 5.17678 9.23744 5.46967 9.53033C5.76256 9.82322 6.23744 9.82322 6.53033 9.53033L10.5303 5.53033L11.0607 5L10.5303 4.46967L6.53033 0.46967C6.23744 0.176777 5.76256 0.176777 5.46967 0.46967C5.17678 0.762563 5.17678 1.23744 5.46967 1.53033L8.93934 5L5.46967 8.46967Z"
        fill={color}
      />
    </svg>
  );
}
