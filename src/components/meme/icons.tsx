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

export function SelectsSpecialDown(props: any) {
  return (
    <svg
      {...props}
      width="9"
      height="6"
      viewBox="0 0 9 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.22929 5.22267C4.83426 5.64372 4.16574 5.64372 3.77072 5.22267L0.45095 1.68421C-0.148156 1.04564 0.30462 0 1.18024 0H7.81976C8.69538 0 9.14815 1.04564 8.54905 1.68421L5.22929 5.22267Z"
        fill="white"
      />
    </svg>
  );
}

export function QuestionMarkFeedForMeme(props: any) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_2477_1255"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="26"
        height="26"
      >
        <circle cx="13" cy="13" r="13" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_2477_1255)">
        <rect
          x="-0.220703"
          y="-0.330078"
          width="26.5439"
          height="26.5439"
          fill="#2F3B4C"
        />
      </g>
      <circle cx="13" cy="13" r="12.5" stroke="#636B77" />
      <g opacity="0.3">
        <mask
          id="path-4-outside-1_2477_1255"
          maskUnits="userSpaceOnUse"
          x="8"
          y="6"
          width="12"
          height="15"
          fill="black"
        >
          <rect fill="white" x="8" y="6" width="12" height="15" />
          <path d="M11.046 16.076L11.316 12.944L11.55 12.746C13.53 12.548 14.484 12.134 14.484 11.432C14.484 11.036 14.196 10.766 13.584 10.766C12.936 10.766 12.216 10.982 11.28 11.648L9.91202 8.606C11.118 7.724 12.666 7.202 14.394 7.202C16.914 7.202 18.534 8.552 18.534 10.496C18.534 12.44 17.292 14.132 14.088 14.654L13.53 16.076H11.046ZM9.03002 20L9.91202 16.76H14.088L13.206 20H9.03002Z" />
        </mask>
        <path
          d="M11.046 16.076L11.316 12.944L11.55 12.746C13.53 12.548 14.484 12.134 14.484 11.432C14.484 11.036 14.196 10.766 13.584 10.766C12.936 10.766 12.216 10.982 11.28 11.648L9.91202 8.606C11.118 7.724 12.666 7.202 14.394 7.202C16.914 7.202 18.534 8.552 18.534 10.496C18.534 12.44 17.292 14.132 14.088 14.654L13.53 16.076H11.046ZM9.03002 20L9.91202 16.76H14.088L13.206 20H9.03002Z"
          fill="#3D3D4F"
        />
        <path
          d="M11.046 16.076L10.0497 15.9901C10.0256 16.2692 10.1198 16.5456 10.3092 16.7521C10.4986 16.9585 10.7659 17.076 11.046 17.076V16.076ZM11.316 12.944L10.6701 12.1806C10.4684 12.3513 10.3424 12.5949 10.3197 12.8581L11.316 12.944ZM11.55 12.746L11.4505 11.751C11.2491 11.7711 11.0586 11.8519 10.9041 11.9826L11.55 12.746ZM11.28 11.648L10.368 12.0581C10.4908 12.3311 10.7293 12.5348 11.0182 12.6131C11.3071 12.6915 11.6159 12.6363 11.8598 12.4628L11.28 11.648ZM9.91202 8.606L9.3217 7.79883C8.94041 8.07768 8.80625 8.58532 8.99999 9.01614L9.91202 8.606ZM14.088 14.654L13.9272 13.667C13.5788 13.7238 13.2861 13.9601 13.1571 14.2887L14.088 14.654ZM13.53 16.076V17.076C13.9413 17.076 14.3107 16.8242 14.4609 16.4413L13.53 16.076ZM9.03002 20L8.06513 19.7373C7.98328 20.038 8.04626 20.3596 8.23545 20.6072C8.42464 20.8548 8.71843 21 9.03002 21V20ZM9.91202 16.76V15.76C9.46089 15.76 9.06562 16.0621 8.94713 16.4973L9.91202 16.76ZM14.088 16.76L15.0529 17.0227C15.1347 16.722 15.0718 16.4004 14.8826 16.1528C14.6934 15.9052 14.3996 15.76 14.088 15.76V16.76ZM13.206 20V21C13.6571 21 14.0524 20.6979 14.1709 20.2627L13.206 20ZM12.0423 16.1619L12.3123 13.0299L10.3197 12.8581L10.0497 15.9901L12.0423 16.1619ZM11.962 13.7074L12.196 13.5094L10.9041 11.9826L10.6701 12.1806L11.962 13.7074ZM11.6495 13.741C12.666 13.6394 13.5295 13.4745 14.1657 13.1918C14.8026 12.9087 15.484 12.3658 15.484 11.432H13.484C13.484 11.2002 13.6884 11.2153 13.3534 11.3642C13.0175 11.5135 12.414 11.6546 11.4505 11.751L11.6495 13.741ZM15.484 11.432C15.484 10.9699 15.3029 10.4963 14.8824 10.165C14.495 9.85983 14.0194 9.766 13.584 9.766V11.766C13.7606 11.766 13.735 11.8072 13.6446 11.736C13.5953 11.6971 13.5489 11.6407 13.518 11.5723C13.4884 11.5068 13.484 11.4547 13.484 11.432H15.484ZM13.584 9.766C12.6769 9.766 11.7583 10.0804 10.7003 10.8332L11.8598 12.4628C12.6737 11.8836 13.1952 11.766 13.584 11.766V9.766ZM12.192 11.2379L10.824 8.19586L8.99999 9.01614L10.368 12.0581L12.192 11.2379ZM10.5023 9.41317C11.5297 8.66185 12.869 8.202 14.394 8.202V6.202C12.4631 6.202 10.7064 6.78615 9.3217 7.79883L10.5023 9.41317ZM14.394 8.202C15.4833 8.202 16.2794 8.49376 16.7814 8.89849C17.2658 9.28909 17.534 9.82634 17.534 10.496H19.534C19.534 9.22165 18.9922 8.11191 18.0367 7.34151C17.0987 6.58524 15.8247 6.202 14.394 6.202V8.202ZM17.534 10.496C17.534 11.2433 17.3017 11.8906 16.7956 12.4111C16.2768 12.9447 15.3873 13.4291 13.9272 13.667L14.2488 15.641C15.9927 15.3569 17.3262 14.7343 18.2295 13.8054C19.1454 12.8634 19.534 11.6927 19.534 10.496H17.534ZM13.1571 14.2887L12.5991 15.7107L14.4609 16.4413L15.0189 15.0193L13.1571 14.2887ZM13.53 15.076H11.046V17.076H13.53V15.076ZM9.9949 20.2627L10.8769 17.0227L8.94713 16.4973L8.06513 19.7373L9.9949 20.2627ZM9.91202 17.76H14.088V15.76H9.91202V17.76ZM13.1231 16.4973L12.2411 19.7373L14.1709 20.2627L15.0529 17.0227L13.1231 16.4973ZM13.206 19H9.03002V21H13.206V19Z"
          fill="#DBDBDB"
          mask="url(#path-4-outside-1_2477_1255)"
        />
      </g>
    </svg>
  );
}

export function FeedForMemeFinalist(props: any) {
  return (
    <svg
      {...props}
      width="18"
      height="7"
      viewBox="0 0 18 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.316451 1.89551C0.233685 1.68859 0.401019 1.46801 0.622581 1.49197L5.51168 2.02052C5.56974 2.02679 5.62836 2.01573 5.68013 1.98871L8.86234 0.328437C8.94798 0.28375 9.05007 0.28375 9.13572 0.328437L12.3179 1.98871C12.3697 2.01573 12.4283 2.02679 12.4864 2.02052L17.3755 1.49197C17.597 1.46801 17.7644 1.68859 17.6816 1.89551L16.1654 5.68594C16.1205 5.79813 16.0119 5.8717 15.8911 5.8717H2.10699C1.98616 5.8717 1.8775 5.79813 1.83262 5.68594L0.316451 1.89551Z"
        fill="url(#paint0_linear_2483_1416)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.9569 2.00584L16.4408 5.79627C16.351 6.02065 16.1337 6.16778 15.892 6.16778H2.10797C1.8663 6.16778 1.64898 6.02065 1.55923 5.79627L0.0430581 2.00584C-0.122473 1.59201 0.212193 1.15085 0.655318 1.19876L5.54442 1.72731L8.72662 0.0670293C8.89792 -0.0223431 9.10208 -0.0223431 9.27338 0.0670293L12.4556 1.72731L17.3447 1.19876C17.7878 1.15085 18.1225 1.59201 17.9569 2.00584ZM0.623557 1.49255C0.401994 1.4686 0.234661 1.68917 0.317427 1.89609L1.8336 5.68652C1.87848 5.79871 1.98714 5.87228 2.10797 5.87228H15.892C16.0129 5.87228 16.1215 5.79871 16.1664 5.68652L17.6826 1.89609C17.7653 1.68917 17.598 1.4686 17.3764 1.49255L12.4873 2.0211C12.4293 2.02738 12.3707 2.01631 12.3189 1.9893L9.13669 0.329019C9.05104 0.284333 8.94896 0.284333 8.86331 0.329019L5.68111 1.9893C5.62933 2.01631 5.57072 2.02738 5.51266 2.0211L0.623557 1.49255Z"
        fill="black"
      />
      <path
        d="M15.9325 3.47635C15.9325 3.48521 15.9259 3.49319 15.9126 3.50028C15.8993 3.50737 15.8838 3.51092 15.866 3.51092C15.8589 3.51092 15.8492 3.50959 15.8368 3.50693C15.8244 3.50427 15.8173 3.50117 15.8155 3.49762C15.7907 3.40011 15.7317 3.29239 15.6386 3.17449C15.5456 3.05658 15.4582 2.99763 15.3767 2.99763H15.3368C15.296 2.99763 15.2668 3.00605 15.249 3.02289C15.2313 3.03974 15.2224 3.06589 15.2224 3.10135V4.36197C15.2224 4.43289 15.2393 4.4852 15.273 4.51888C15.3067 4.55257 15.3749 4.57473 15.4777 4.58537C15.4831 4.58537 15.4879 4.59291 15.4924 4.60798C15.4968 4.62305 15.499 4.63502 15.499 4.64388C15.499 4.65452 15.4968 4.66693 15.4924 4.68112C15.4879 4.6953 15.4831 4.70239 15.4777 4.70239C15.3926 4.70239 15.3053 4.70018 15.2158 4.69574C15.1262 4.69131 15.0416 4.68909 14.9618 4.68909C14.8802 4.68909 14.7951 4.69131 14.7065 4.69574C14.6178 4.70018 14.5301 4.70239 14.4432 4.70239C14.4379 4.70239 14.433 4.6953 14.4286 4.68112C14.4241 4.66693 14.4219 4.65452 14.4219 4.64388C14.4219 4.63502 14.4241 4.62349 14.4286 4.60931C14.433 4.59512 14.4379 4.58715 14.4432 4.58537C14.5478 4.57296 14.6165 4.5508 14.6493 4.51888C14.6821 4.48697 14.6985 4.43467 14.6985 4.36197V3.10135C14.6985 3.06234 14.6905 3.03531 14.6746 3.02024C14.6586 3.00516 14.6285 2.99763 14.5841 2.99763H14.5629C14.4902 2.99763 14.4006 3.05215 14.2943 3.16119C14.1879 3.27023 14.1125 3.38238 14.0682 3.49762C14.0664 3.50294 14.0598 3.50649 14.0482 3.50826C14.0367 3.51003 14.0274 3.51092 14.0203 3.51092C14.0044 3.51092 13.9888 3.50737 13.9738 3.50028C13.9587 3.49319 13.9512 3.48521 13.9512 3.47635C13.9689 3.38769 13.988 3.2791 14.0084 3.15055C14.0287 3.02201 14.0434 2.91518 14.0522 2.83008C14.1143 2.84072 14.2109 2.84958 14.3421 2.85667C14.4733 2.86377 14.6799 2.86731 14.9618 2.86731C15.2029 2.86731 15.4037 2.86377 15.5642 2.85667C15.7246 2.84958 15.8306 2.84072 15.882 2.83008C15.8873 2.91518 15.8944 3.01625 15.9033 3.13327C15.9121 3.25028 15.9219 3.36465 15.9325 3.47635Z"
        fill="black"
      />
      <path
        d="M13.4131 3.5944C13.5177 3.65646 13.6161 3.73048 13.7083 3.81648C13.8005 3.90247 13.8466 4.01106 13.8466 4.14227C13.8466 4.33021 13.7788 4.47781 13.6431 4.58508C13.5075 4.69235 13.3369 4.74598 13.1312 4.74598C13.0053 4.74598 12.8976 4.7287 12.808 4.69412C12.7185 4.65955 12.6161 4.63162 12.5009 4.61035C12.4991 4.54652 12.4982 4.46141 12.4982 4.35503C12.4982 4.24865 12.4956 4.15468 12.4902 4.07312C12.4902 4.0678 12.4978 4.06293 12.5128 4.05849C12.5279 4.05406 12.5408 4.05184 12.5514 4.05184C12.5638 4.05184 12.5758 4.05362 12.5873 4.05716C12.5988 4.06071 12.6055 4.06603 12.6073 4.07312C12.6409 4.23092 12.7114 4.36124 12.8187 4.46407C12.926 4.56691 13.0301 4.61833 13.1312 4.61833C13.234 4.61833 13.308 4.59572 13.3533 4.55051C13.3985 4.50529 13.4211 4.44368 13.4211 4.36567C13.4211 4.26993 13.375 4.18925 13.2828 4.12365C13.1906 4.05805 13.0913 3.99422 12.9849 3.93216C12.8768 3.87011 12.7766 3.79653 12.6844 3.71142C12.5922 3.62632 12.5461 3.52171 12.5461 3.3976C12.5461 3.23271 12.6086 3.09397 12.7336 2.98138C12.8586 2.86879 13.0301 2.8125 13.2482 2.8125C13.3457 2.8125 13.4299 2.82447 13.5009 2.8484C13.5718 2.87234 13.648 2.89229 13.7296 2.90824C13.7314 2.97207 13.7345 3.05186 13.7389 3.1476C13.7433 3.24334 13.7491 3.32224 13.7562 3.3843C13.7562 3.38962 13.7486 3.3945 13.7336 3.39893C13.7185 3.40336 13.7065 3.40558 13.6977 3.40558C13.6853 3.40558 13.6728 3.4038 13.6604 3.40026C13.648 3.39671 13.64 3.39139 13.6365 3.3843C13.6028 3.246 13.5532 3.13741 13.4876 3.05851C13.422 2.97961 13.3413 2.94016 13.2455 2.94016C13.1622 2.94016 13.0966 2.96232 13.0487 3.00665C13.0009 3.05097 12.9769 3.10682 12.9769 3.1742C12.9769 3.26285 13.0217 3.33864 13.1112 3.40159C13.2008 3.46453 13.3014 3.5288 13.4131 3.5944Z"
        fill="black"
      />
      <path
        d="M12.2158 4.64534C12.2158 4.65775 12.2136 4.6706 12.2091 4.6839C12.2047 4.6972 12.1998 4.70385 12.1945 4.70385C12.1076 4.70385 12.0203 4.70163 11.9325 4.6972C11.8448 4.69277 11.7601 4.69055 11.6786 4.69055C11.597 4.69055 11.5119 4.69277 11.4232 4.6972C11.3346 4.70163 11.2468 4.70385 11.1599 4.70385C11.1546 4.70385 11.1498 4.69675 11.1453 4.68257C11.1409 4.66839 11.1387 4.65598 11.1387 4.64534C11.1387 4.63647 11.1409 4.62495 11.1453 4.61076C11.1498 4.59658 11.1546 4.5886 11.1599 4.58683C11.2646 4.57442 11.3333 4.55225 11.3661 4.52034C11.3989 4.48842 11.4153 4.43612 11.4153 4.36343V3.19589C11.4153 3.1232 11.3989 3.07089 11.3661 3.03898C11.3333 3.00706 11.2646 2.9849 11.1599 2.97249C11.1546 2.97072 11.1498 2.96274 11.1453 2.94855C11.1409 2.93437 11.1387 2.92284 11.1387 2.91398C11.1387 2.90334 11.1409 2.89093 11.1453 2.87675C11.1498 2.86256 11.1546 2.85547 11.1599 2.85547C11.2468 2.85547 11.3346 2.85769 11.4232 2.86212C11.5119 2.86655 11.597 2.86877 11.6786 2.86877C11.7601 2.86877 11.8448 2.86655 11.9325 2.86212C12.0203 2.85769 12.1076 2.85547 12.1945 2.85547C12.1998 2.85547 12.2047 2.86212 12.2091 2.87542C12.2136 2.88871 12.2158 2.90157 12.2158 2.91398C12.2158 2.92284 12.2136 2.93481 12.2091 2.94988C12.2047 2.96495 12.1998 2.97249 12.1945 2.97249C12.0934 2.98313 12.0261 3.00529 11.9924 3.03898C11.9587 3.07266 11.9419 3.12497 11.9419 3.19589V4.36343C11.9419 4.43435 11.9587 4.48665 11.9924 4.52034C12.0261 4.55403 12.0934 4.57619 12.1945 4.58683C12.1998 4.58683 12.2047 4.59436 12.2091 4.60943C12.2136 4.6245 12.2158 4.63647 12.2158 4.64534Z"
        fill="black"
      />
      <path
        d="M11.063 4.01769C11.0506 4.11698 11.0386 4.23843 11.0271 4.38204C11.0156 4.52566 11.0081 4.63293 11.0045 4.70385C10.8928 4.7003 10.7536 4.6972 10.587 4.69454C10.4203 4.69188 10.2847 4.69055 10.18 4.69055C10.0666 4.69055 9.9203 4.69232 9.74123 4.69587C9.56215 4.69941 9.42829 4.70207 9.33964 4.70385C9.33432 4.70385 9.32944 4.6972 9.32501 4.6839C9.32058 4.6706 9.31836 4.65775 9.31836 4.64534C9.31836 4.63647 9.32058 4.62495 9.32501 4.61076C9.32944 4.59658 9.33432 4.5886 9.33964 4.58683C9.44247 4.57442 9.51029 4.55225 9.54309 4.52034C9.57589 4.48842 9.59229 4.43612 9.59229 4.36343V3.19589C9.59229 3.1232 9.57589 3.07089 9.54309 3.03898C9.51029 3.00706 9.44247 2.9849 9.33964 2.97249C9.33432 2.97072 9.32944 2.96274 9.32501 2.94855C9.32058 2.93437 9.31836 2.92284 9.31836 2.91398C9.31836 2.90157 9.32058 2.88871 9.32501 2.87542C9.32944 2.86212 9.33432 2.85547 9.33964 2.85547C9.42474 2.85547 9.51206 2.85769 9.6016 2.86212C9.69114 2.86655 9.7758 2.86877 9.85559 2.86877C9.93715 2.86877 10.0223 2.86655 10.1109 2.86212C10.1996 2.85769 10.2873 2.85547 10.3742 2.85547C10.3795 2.85547 10.3844 2.86256 10.3888 2.87675C10.3933 2.89093 10.3955 2.90334 10.3955 2.91398C10.3955 2.92284 10.3933 2.93481 10.3888 2.94988C10.3844 2.96495 10.3795 2.97249 10.3742 2.97249C10.2714 2.98313 10.2031 3.00529 10.1694 3.03898C10.1357 3.07266 10.1189 3.12497 10.1189 3.19589V4.40332C10.1189 4.46715 10.1362 4.50926 10.1707 4.52965C10.2053 4.55004 10.2403 4.56023 10.2758 4.56023H10.4274C10.5515 4.56023 10.6619 4.50172 10.7585 4.3847C10.8551 4.26768 10.9167 4.13648 10.9433 3.99109C10.9433 3.98754 10.9464 3.98489 10.9526 3.98311C10.9589 3.98134 10.9682 3.98045 10.9806 3.98045C11.0001 3.98045 11.0191 3.984 11.0377 3.99109C11.0564 3.99818 11.0648 4.00705 11.063 4.01769Z"
        fill="black"
      />
      <path
        d="M9.29157 4.64492C9.29157 4.65556 9.28935 4.66797 9.28492 4.68215C9.28049 4.69634 9.27561 4.70343 9.27029 4.70343C9.18519 4.70343 9.09919 4.70121 9.01232 4.69678C8.92544 4.69235 8.84565 4.69013 8.77296 4.69013C8.6914 4.69013 8.60408 4.69235 8.51099 4.69678C8.41791 4.70121 8.32793 4.70343 8.24105 4.70343C8.23573 4.70343 8.23086 4.69678 8.22642 4.68348C8.22199 4.67019 8.21977 4.65733 8.21977 4.64492C8.21977 4.63606 8.2211 4.62453 8.22376 4.61035C8.22642 4.59616 8.23041 4.58818 8.23573 4.58641C8.32084 4.58109 8.37713 4.57001 8.40461 4.55317C8.43209 4.53632 8.44583 4.51017 8.44583 4.47471C8.44583 4.46053 8.44273 4.4428 8.43653 4.42152C8.43032 4.40024 8.42367 4.38074 8.41658 4.36301L8.34477 4.17684H7.78627L7.72244 4.3311C7.7118 4.35592 7.70338 4.37941 7.69718 4.40157C7.69097 4.42374 7.68787 4.4428 7.68787 4.45875C7.68787 4.49599 7.69806 4.52568 7.71845 4.54785C7.73884 4.57001 7.79514 4.58286 7.88733 4.58641C7.89265 4.58641 7.8962 4.59395 7.89797 4.60902C7.89974 4.62409 7.90063 4.63606 7.90063 4.64492C7.90063 4.65733 7.89841 4.67019 7.89398 4.68348C7.88955 4.69678 7.88467 4.70343 7.87935 4.70343C7.80311 4.70343 7.74372 4.70121 7.70116 4.69678C7.65861 4.69235 7.60188 4.69013 7.53095 4.69013C7.47244 4.69013 7.42103 4.69235 7.3767 4.69678C7.33238 4.70121 7.28007 4.70343 7.21979 4.70343C7.21447 4.70343 7.21004 4.6959 7.20649 4.68082C7.20294 4.66575 7.20117 4.65379 7.20117 4.64492C7.20117 4.63606 7.20516 4.62453 7.21314 4.61035C7.22112 4.59616 7.22777 4.58818 7.23309 4.58641C7.30933 4.57932 7.36872 4.55627 7.41128 4.51726C7.45383 4.47826 7.49727 4.41265 7.54159 4.32046L8.20116 2.83378C8.20293 2.82846 8.21268 2.82358 8.23041 2.81915C8.24814 2.81472 8.26499 2.8125 8.28094 2.8125C8.2969 2.8125 8.31374 2.81472 8.33148 2.81915C8.34921 2.82358 8.35896 2.82846 8.36073 2.83378L8.95115 4.32046C8.98306 4.40911 9.02118 4.47338 9.06551 4.51327C9.10983 4.55317 9.17632 4.57755 9.26497 4.58641C9.27029 4.58641 9.27605 4.59395 9.28226 4.60902C9.28846 4.62409 9.29157 4.63606 9.29157 4.64492ZM8.29424 4.04918L8.07084 3.46409L7.8368 4.04918H8.29424Z"
        fill="black"
      />
      <path
        d="M7.33395 2.91398C7.33395 2.92284 7.33174 2.93481 7.3273 2.94988C7.32287 2.96495 7.318 2.97249 7.31268 2.97249C7.21339 2.98313 7.1438 3.00485 7.1039 3.03765C7.06401 3.07045 7.04318 3.1232 7.0414 3.19589L7.01215 4.71448C7.01215 4.7198 7.00639 4.72557 6.99486 4.73177C6.98334 4.73798 6.96428 4.74108 6.93768 4.74108C6.91818 4.74108 6.90133 4.73975 6.88715 4.73709C6.87297 4.73443 6.86233 4.72867 6.85524 4.7198L5.5627 3.41397L5.54674 4.36343C5.5432 4.43257 5.56181 4.48443 5.60259 4.51901C5.64337 4.55358 5.71518 4.57619 5.81802 4.58683C5.82334 4.58683 5.82821 4.59348 5.83264 4.60677C5.83708 4.62007 5.83929 4.63293 5.83929 4.64534C5.83929 4.65597 5.83708 4.66839 5.83264 4.68257C5.82821 4.69675 5.82334 4.70385 5.81802 4.70385C5.75064 4.70385 5.68859 4.70163 5.63185 4.6972C5.57511 4.69277 5.51572 4.69055 5.45366 4.69055C5.38983 4.69055 5.33088 4.69277 5.2768 4.6972C5.22272 4.70163 5.16554 4.70385 5.10526 4.70385C5.09994 4.70385 5.09507 4.69675 5.09063 4.68257C5.0862 4.66839 5.08398 4.65597 5.08398 4.64534C5.08398 4.63293 5.08664 4.62051 5.09196 4.6081C5.09728 4.59569 5.1026 4.5886 5.10792 4.58683C5.20898 4.57619 5.27902 4.55403 5.31802 4.52034C5.35703 4.48665 5.37653 4.43435 5.37653 4.36343L5.41909 3.28099C5.42086 3.18525 5.40136 3.113 5.36058 3.06424C5.3198 3.01548 5.24267 2.9849 5.1292 2.97249C5.12388 2.97072 5.11944 2.96274 5.1159 2.94855C5.11235 2.93437 5.11058 2.92284 5.11058 2.91398C5.11058 2.90157 5.1128 2.88871 5.11723 2.87542C5.12166 2.86212 5.12654 2.85547 5.13186 2.85547C5.17441 2.85547 5.22494 2.85769 5.28345 2.86212C5.34196 2.86655 5.38983 2.86877 5.42706 2.86877C5.47494 2.86877 5.52015 2.86655 5.5627 2.86212C5.60525 2.85769 5.66022 2.85547 5.72759 2.85547L6.88183 4.05758V3.19589C6.88183 3.1232 6.86055 3.07089 6.818 3.03898C6.77545 3.00706 6.70276 2.9849 6.59992 2.97249C6.5946 2.97072 6.58973 2.96362 6.58529 2.95121C6.58086 2.9388 6.57864 2.92639 6.57864 2.91398C6.57864 2.90334 6.58086 2.89093 6.58529 2.87675C6.58973 2.86256 6.5946 2.85547 6.59992 2.85547C6.66907 2.85547 6.72802 2.85813 6.77678 2.86345C6.82554 2.86877 6.88094 2.87143 6.943 2.87143C7.00683 2.87143 7.06977 2.86877 7.13183 2.86345C7.19388 2.85813 7.25417 2.85547 7.31268 2.85547C7.318 2.85547 7.32287 2.86212 7.3273 2.87542C7.33174 2.88871 7.33395 2.90157 7.33395 2.91398Z"
        fill="black"
      />
      <path
        d="M4.9736 4.64534C4.9736 4.65775 4.97138 4.6706 4.96695 4.6839C4.96252 4.6972 4.95764 4.70385 4.95232 4.70385C4.86544 4.70385 4.77812 4.70163 4.69036 4.6972C4.60259 4.69277 4.51793 4.69055 4.43637 4.69055C4.35481 4.69055 4.26971 4.69277 4.18105 4.6972C4.0924 4.70163 4.00464 4.70385 3.91776 4.70385C3.91244 4.70385 3.90757 4.69675 3.90313 4.68257C3.8987 4.66839 3.89648 4.65598 3.89648 4.64534C3.89648 4.63647 3.8987 4.62495 3.90313 4.61076C3.90757 4.59658 3.91244 4.5886 3.91776 4.58683C4.02237 4.57442 4.09107 4.55225 4.12387 4.52034C4.15668 4.48842 4.17308 4.43612 4.17308 4.36343V3.19589C4.17308 3.1232 4.15668 3.07089 4.12387 3.03898C4.09107 3.00706 4.02237 2.9849 3.91776 2.97249C3.91244 2.97072 3.90757 2.96274 3.90313 2.94855C3.8987 2.93437 3.89648 2.92284 3.89648 2.91398C3.89648 2.90334 3.8987 2.89093 3.90313 2.87675C3.90757 2.86256 3.91244 2.85547 3.91776 2.85547C4.00464 2.85547 4.0924 2.85769 4.18105 2.86212C4.26971 2.86655 4.35481 2.86877 4.43637 2.86877C4.51793 2.86877 4.60259 2.86655 4.69036 2.86212C4.77812 2.85769 4.86544 2.85547 4.95232 2.85547C4.95764 2.85547 4.96252 2.86212 4.96695 2.87542C4.97138 2.88871 4.9736 2.90157 4.9736 2.91398C4.9736 2.92284 4.97138 2.93481 4.96695 2.94988C4.96252 2.96495 4.95764 2.97249 4.95232 2.97249C4.85126 2.98313 4.78388 3.00529 4.7502 3.03898C4.71651 3.07266 4.69966 3.12497 4.69966 3.19589V4.36343C4.69966 4.43435 4.71651 4.48665 4.7502 4.52034C4.78388 4.55403 4.85126 4.57619 4.95232 4.58683C4.95764 4.58683 4.96252 4.59436 4.96695 4.60943C4.97138 4.6245 4.9736 4.63647 4.9736 4.64534Z"
        fill="black"
      />
      <path
        d="M3.76668 3.46982C3.76668 3.47691 3.7587 3.48445 3.74274 3.49243C3.72679 3.50041 3.71083 3.5044 3.69487 3.5044C3.68778 3.5044 3.67847 3.50262 3.66695 3.49908C3.65542 3.49553 3.64966 3.49198 3.64966 3.48844C3.6337 3.36965 3.5845 3.25839 3.50206 3.15467C3.41961 3.05094 3.30038 2.99908 3.14435 2.99908H2.98478C2.94754 2.99908 2.91208 3.00795 2.8784 3.02568C2.84471 3.04341 2.82786 3.08685 2.82786 3.156V3.71716H2.96084C3.05127 3.71716 3.12307 3.69056 3.17626 3.63737C3.22945 3.58418 3.26137 3.51415 3.27201 3.42727C3.27201 3.42195 3.27866 3.41707 3.29195 3.41264C3.30525 3.40821 3.31811 3.40599 3.33052 3.40599C3.34293 3.40599 3.35578 3.40821 3.36908 3.41264C3.38238 3.41707 3.38903 3.42195 3.38903 3.42727C3.38903 3.49287 3.38637 3.55404 3.38105 3.61078C3.37573 3.66751 3.37307 3.72602 3.37307 3.78631C3.37307 3.84836 3.37573 3.90643 3.38105 3.96051C3.38637 4.01458 3.38903 4.07354 3.38903 4.13737C3.38903 4.14268 3.38238 4.14756 3.36908 4.15199C3.35578 4.15643 3.34293 4.15864 3.33052 4.15864C3.31811 4.15864 3.30525 4.15643 3.29195 4.15199C3.27866 4.14756 3.27201 4.14268 3.27201 4.13737C3.2596 4.04517 3.22901 3.9738 3.18025 3.92327C3.13149 3.87274 3.05836 3.84748 2.96084 3.84748H2.82786V4.36343C2.82786 4.43435 2.84825 4.48665 2.88903 4.52034C2.92981 4.55403 3.00162 4.57619 3.10446 4.58683C3.10978 4.58683 3.11465 4.59436 3.11908 4.60943C3.12352 4.6245 3.12573 4.63647 3.12573 4.64534C3.12573 4.65598 3.12352 4.66839 3.11908 4.68257C3.11465 4.69675 3.10978 4.70385 3.10446 4.70385C3.01758 4.70385 2.92627 4.70163 2.83052 4.6972C2.73478 4.69277 2.64613 4.69055 2.56457 4.69055C2.48301 4.69055 2.39835 4.69277 2.31058 4.6972C2.22282 4.70163 2.1355 4.70385 2.04862 4.70385C2.0433 4.70385 2.03843 4.6972 2.03399 4.6839C2.02956 4.6706 2.02734 4.65775 2.02734 4.64534C2.02734 4.63647 2.02956 4.62495 2.03399 4.61076C2.03843 4.59658 2.0433 4.5886 2.04862 4.58683C2.15146 4.57442 2.21927 4.55225 2.25207 4.52034C2.28488 4.48842 2.30128 4.43612 2.30128 4.36343V3.19589C2.30128 3.1232 2.28488 3.07089 2.25207 3.03898C2.21927 3.00706 2.15146 2.9849 2.04862 2.97249C2.0433 2.97072 2.03843 2.96274 2.03399 2.94855C2.02956 2.93437 2.02734 2.92284 2.02734 2.91398C2.02734 2.90157 2.02956 2.88871 2.03399 2.87542C2.03843 2.86212 2.0433 2.85547 2.04862 2.85547C2.14436 2.85724 2.28089 2.8599 2.45819 2.86345C2.63549 2.86699 2.78088 2.86877 2.89435 2.86877C2.99541 2.86877 3.1346 2.86744 3.3119 2.86478C3.4892 2.86212 3.63193 2.85901 3.74009 2.85547C3.74009 2.93171 3.74319 3.03233 3.74939 3.15733C3.7556 3.28232 3.76136 3.38649 3.76668 3.46982Z"
        fill="black"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2483_1416"
          x1="8.99902"
          y1="1.73464"
          x2="8.99902"
          y2="5.8717"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFEB33" />
          <stop offset="1" stopColor="#C6FC2D" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function CountdownRightBottomBg(props: any) {
  return (
    <img
      {...props}
      alt=""
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAEusAAASWCAYAAAA9YybTAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAYP/SURBVHgB7MCBAAAAAICg/akXqQIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgdu4gt3EYBqAomTptirn/Yes25siFFkknk2QlG+h7AEHrBoIAfwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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"
    />
  );
}
export function CountdownRightBottomMobileBg(props: any) {
  return (
    <img
      {...props}
      alt=""
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABYwAAAZoCAYAAAAxkoHSAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAALMpSURBVHgB7MCBAAAAAICg/akXqQIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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"
    />
  );
}

export function CountdownLeftBg(props: any) {
  return (
    <svg
      {...props}
      width="523"
      height="253"
      viewBox="0 0 523 253"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <path
        d="M267.96 54.9999V40.9999H270.24L277.74 50.6799V40.9999H280.16V54.9999H278.1L270.38 45.0399V54.9999H267.96ZM288.501 55.2399C285.281 55.2399 282.901 52.7799 282.901 49.7799V49.7399C282.901 46.7199 285.301 44.2199 288.541 44.2199C291.781 44.2199 294.161 46.6799 294.161 49.6999V49.7399C294.161 52.7399 291.761 55.2399 288.501 55.2399ZM288.541 53.1399C290.501 53.1399 291.741 51.5999 291.741 49.7799V49.7399C291.741 47.8799 290.401 46.3399 288.501 46.3399C286.561 46.3399 285.321 47.8599 285.321 49.6999V49.7399C285.321 51.5799 286.661 53.1399 288.541 53.1399ZM299.36 55.0799L295.02 44.4399H297.62L300.46 52.1999L303.32 44.4399H305.86L301.54 55.0799H299.36ZM306.06 54.9999V52.2599H308.72V54.9999H306.06ZM319.62 54.9999V43.3999L317.1 44.0999L316.58 42.0999L320.34 40.8999H322.06V54.9999H319.62ZM329.13 55.1999C327.63 55.1999 325.97 54.6599 324.65 53.6199L325.73 51.9799C326.87 52.8399 328.11 53.2799 329.19 53.2799C330.23 53.2799 330.83 52.8399 330.83 52.1399V52.0999C330.83 51.2799 329.71 50.9999 328.47 50.6199C326.91 50.1799 325.17 49.5399 325.17 47.5199V47.4799C325.17 45.4799 326.83 44.2599 328.93 44.2599C330.25 44.2599 331.69 44.7199 332.81 45.4599L331.85 47.1799C330.83 46.5599 329.75 46.1799 328.87 46.1799C327.93 46.1799 327.39 46.6199 327.39 47.2399V47.2799C327.39 48.0399 328.53 48.3599 329.77 48.7599C331.31 49.2399 333.05 49.9399 333.05 51.8399V51.8799C333.05 54.0999 331.33 55.1999 329.13 55.1999ZM338.86 55.1799C337.08 55.1799 335.82 54.3999 335.82 52.0799V46.5199H334.48V44.4399H335.82V41.5399H338.24V44.4399H341.08V46.5199H338.24V51.6999C338.24 52.6399 338.72 53.0199 339.54 53.0199C340.08 53.0199 340.56 52.8999 341.04 52.6599V54.6399C340.44 54.9799 339.76 55.1799 338.86 55.1799Z"
        fill="white"
      />
      <g clipPath="url(#clip0_36_83)">
        <path d="M370.5 71L370.5 135" stroke="url(#paint0_linear_36_83)" />
      </g>
      <g clipPath="url(#clip1_36_83)">
        <path d="M370.5 158L370.5 222" stroke="url(#paint1_linear_36_83)" />
      </g>
      <path
        d="M370 158.5C376.351 158.5 381.5 153.351 381.5 147C381.5 140.649 376.351 135.5 370 135.5C363.649 135.5 358.5 140.649 358.5 147C358.5 153.351 363.649 158.5 370 158.5Z"
        fill="#16453C"
        stroke="#00FFD1"
      />
      <path
        d="M370 70.5C376.351 70.5 381.5 65.3513 381.5 59C381.5 52.6487 376.351 47.5 370 47.5C363.649 47.5 358.5 52.6487 358.5 59C358.5 65.3513 363.649 70.5 370 70.5Z"
        fill="#16453C"
        stroke="#00FFD1"
      />
      <path d="M377.5 139H362.5V155H377.5V139Z" fill="url(#pattern0_36_83)" />
      <path
        d="M370 241.5C376.351 241.5 381.5 236.351 381.5 230C381.5 223.649 376.351 218.5 370 218.5C363.649 218.5 358.5 223.649 358.5 230C358.5 236.351 363.649 241.5 370 241.5Z"
        fill="#16453C"
        stroke="#00FFD1"
      />
      <path
        d="M375.11 225.319C375.01 225.043 374.52 224.435 373.38 224.213C372.24 223.991 371.23 224.624 370.87 224.968C370.78 224.902 370.64 224.823 370.47 224.749C369.79 224.235 368.23 223.149 367.41 222.909C366.37 222.608 366.95 223.09 367.11 223.992C367.25 224.713 367.19 224.938 367.14 224.961C367.01 225.028 366.89 225.103 366.76 225.186C366.24 225.068 365.03 224.835 364.33 224.847C363.45 224.862 363.56 224.945 363.76 225.245C363.93 225.485 364.54 226.588 364.83 227.11C364.78 227.179 364.73 227.25 364.69 227.322C364.5 227.278 363.88 227.264 362.91 227.559C361.71 227.928 361.58 228.049 361.76 228.213C361.9 228.344 362.93 229.174 363.43 229.573C363.03 229.696 362.12 230.01 361.7 230.284C361.17 230.625 361.13 230.634 361.29 230.75C361.43 230.843 362.71 231.357 363.33 231.602C363.06 231.914 362.55 232.53 362.17 233.091C361.67 233.807 361.68 233.916 362.12 233.933C362.48 233.946 363.65 233.792 364.19 233.713C364.61 234.195 365.13 234.548 365.62 234.81C367.3 235.715 372.79 235.355 375.23 234.259C376.69 233.6 377.44 232.589 377.74 232.19C378.09 232.013 378.65 231.504 378.14 230.891C378.4 230.696 378.64 230.486 378.51 230.235C378.39 229.983 378.2 229.981 378.12 229.964C378.16 229.907 378.42 229.476 377.98 229.204C377.43 228.865 376.56 228.681 376.49 228.301C376.47 228.214 376.47 228.136 376.46 228.065C376.46 228.027 376.46 227.993 376.45 227.965C376.43 227.79 376.37 227.684 376.07 227.642C376.17 227.379 376.18 227.082 376.05 226.715C375.89 226.273 375.59 226.08 375.43 225.995C375.58 226.017 375.92 226.081 376.1 226.167C376.16 225.893 376.05 225.341 375.11 225.319Z"
        fill="#009400"
      />
      <path
        d="M375.11 225.319C375.01 225.043 374.52 224.435 373.38 224.213C372.24 223.991 371.23 224.624 370.87 224.968M375.11 225.319C376.05 225.341 376.16 225.893 376.1 226.167C375.92 226.081 375.58 226.017 375.43 225.995M375.11 225.319C374.63 225.292 373.52 225.434 372.92 226.211C372.31 226.989 372.27 227.589 372.32 227.792M370.87 224.968C371.8 225.74 372.05 226.387 372.06 226.614M370.87 224.968C370.78 224.902 370.64 224.823 370.47 224.749M375.43 225.995C375.59 226.08 375.89 226.273 376.05 226.715C376.18 227.082 376.17 227.379 376.07 227.642M375.43 225.995C375.32 225.934 374.88 225.881 373.99 226.162C373.1 226.443 372.75 227.42 372.68 227.873C373.38 227.647 374.32 228.258 374.39 228.344C374.45 228.43 374.37 228.543 375.12 228.356C375.73 228.206 376.01 227.818 376.07 227.642M370.47 224.749C369.96 224.532 369.11 224.351 368.11 224.594C367.79 224.671 367.47 224.793 367.14 224.961M370.47 224.749C369.79 224.235 368.23 223.149 367.41 222.909C366.37 222.608 366.95 223.09 367.11 223.992C367.25 224.713 367.19 224.938 367.14 224.961M376.07 227.642C376.37 227.684 376.43 227.79 376.45 227.965M376.45 227.965C376.46 228.058 376.46 228.17 376.49 228.301C376.56 228.681 377.43 228.865 377.98 229.204C378.42 229.476 378.16 229.907 378.12 229.964C378.2 229.981 378.39 229.983 378.51 230.235C378.64 230.486 378.4 230.696 378.14 230.891C378.65 231.504 378.09 232.013 377.74 232.19C377.44 232.589 376.69 233.6 375.23 234.259C372.79 235.355 367.3 235.715 365.62 234.81C365.13 234.548 364.61 234.195 364.19 233.713M376.45 227.965C376.5 228.135 376.38 228.527 375.44 228.739M372.08 227.542C371.89 227.315 371.22 226.834 370.33 226.833C369.01 226.831 368.42 227.087 367.98 227.364C367.52 227.651 366.94 228.388 366.49 228.325C366.1 228.27 367.12 228.839 368.1 229.353C368.86 229.752 369.79 229.729 371.01 229.209C372.24 228.689 372.19 228.404 372.04 228.922C371.92 229.337 371.47 229.648 371.26 229.752M367.14 224.961C367.01 225.028 366.89 225.103 366.76 225.186M366.76 225.186C366.24 225.068 365.03 224.835 364.33 224.847C363.45 224.862 363.56 224.945 363.76 225.245C363.93 225.485 364.54 226.588 364.83 227.11M366.76 225.186C366.07 225.622 365.4 226.265 364.83 227.11M364.83 227.11C364.78 227.179 364.73 227.25 364.69 227.322M364.69 227.322C364.5 227.278 363.88 227.264 362.91 227.559C361.71 227.928 361.58 228.049 361.76 228.213C361.9 228.344 362.93 229.174 363.43 229.573M364.69 227.322C364.28 227.955 363.93 228.692 363.65 229.533M363.43 229.573L363.65 229.533M363.43 229.573C363.03 229.696 362.12 230.01 361.7 230.284C361.17 230.625 361.13 230.634 361.29 230.75C361.43 230.843 362.71 231.357 363.33 231.602M363.65 229.533C363.63 229.584 363.62 229.636 363.6 229.689C363.37 230.415 363.3 231.048 363.33 231.602M363.33 231.602C363.06 231.914 362.55 232.53 362.17 233.091C361.67 233.807 361.68 233.916 362.12 233.933C362.48 233.946 363.65 233.792 364.19 233.713M363.33 231.602C363.39 232.497 363.73 233.183 364.19 233.713"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M376.06 226.759C376.19 227.127 376.18 227.423 376.08 227.687C376.02 227.862 375.73 228.251 375.13 228.4C374.38 228.587 374.46 228.475 374.4 228.389C374.33 228.303 373.38 227.692 372.69 227.918C372.75 227.464 373.1 226.488 373.99 226.207C374.88 225.925 375.33 225.978 375.43 226.04C375.6 226.125 375.9 226.318 376.06 226.759Z"
        fill="white"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M377.74 232.19C378.09 232.012 378.65 231.504 378.14 230.891C378.4 230.696 378.64 230.486 378.51 230.234C378.39 229.982 378.2 229.98 378.12 229.963C377.66 230.293 376.01 231.027 373.12 231.323C369.51 231.692 368.15 231.5 367.19 231.334C366.94 231.29 366.78 231.3 366.7 231.339C366.47 231.45 366.81 231.798 367.19 231.873C367.49 232.441 369.13 233.38 372.4 233.27C375.01 233.182 377.05 232.513 377.74 232.19Z"
        fill="#AC5228"
      />
      <path
        d="M378.14 230.891C378.65 231.504 378.09 232.012 377.74 232.19C377.05 232.513 375.01 233.182 372.4 233.27C369.13 233.38 367.49 232.441 367.19 231.873M378.14 230.891C378.4 230.696 378.64 230.486 378.51 230.234C378.39 229.982 378.2 229.98 378.12 229.963C377.66 230.293 376.01 231.027 373.12 231.323C369.51 231.692 368.15 231.5 367.19 231.334C366.94 231.29 366.78 231.3 366.7 231.339M378.14 230.891C377.85 231.091 376.51 231.603 373.45 232.047C369.63 232.602 367.7 231.976 367.19 231.873M367.19 231.873C366.81 231.798 366.47 231.45 366.7 231.339M366.7 231.339C366.62 231.334 366.46 231.459 366.48 232.004"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M367.98 227.392C368.42 227.115 369.01 226.86 370.34 226.861C370.64 226.888 371.23 226.981 371.51 227.381C371.85 227.86 371.8 228.408 371.57 228.744C371.38 229.014 371.2 229.155 371.02 229.237C371.02 229.237 369.26 230.052 368.1 229.381C367.13 228.867 366.11 228.299 366.49 228.353C366.95 228.417 367.53 227.68 367.98 227.392Z"
        fill="white"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M368.52 227.115C369.23 226.985 369.86 227.457 370 228.217C370.1 228.757 369.89 229.278 369.51 229.58C368.7 229.682 368.38 229.544 367.55 229.059C367.51 228.957 367.46 228.802 367.44 228.688C367.3 227.928 367.81 227.245 368.52 227.115Z"
        fill="black"
      />
      <path
        d="M368.824 227.924C368.564 227.801 368.42 227.562 368.502 227.389C368.583 227.216 368.86 227.176 369.12 227.298C369.379 227.421 369.524 227.661 369.442 227.834C369.36 228.007 369.083 228.047 368.824 227.924Z"
        fill="white"
      />
      <path
        d="M368.519 229.054C368.445 228.992 368.431 228.89 368.485 228.825C368.54 228.76 368.644 228.758 368.717 228.82C368.791 228.882 368.806 228.985 368.751 229.049C368.696 229.114 368.592 229.117 368.519 229.054Z"
        fill="#038203"
      />
      <path
        d="M374.04 226.161C374.53 226.198 374.96 226.665 375.01 227.271C375.06 227.766 374.84 228.214 374.5 228.431C374.4 228.421 374.3 228.152 373.73 227.963C373.37 227.844 373.17 227.818 373.07 227.811C373.03 227.7 373.01 227.581 372.99 227.456C372.97 227.222 373.01 226.999 373.09 226.806C373.35 226.444 373.83 226.226 374.04 226.161Z"
        fill="black"
      />
      <path
        d="M373.949 226.948C373.725 226.842 373.601 226.635 373.672 226.486C373.742 226.337 373.981 226.302 374.205 226.408C374.428 226.514 374.553 226.721 374.482 226.87C374.412 227.019 374.173 227.054 373.949 226.948Z"
        fill="white"
      />
      <path
        d="M373.944 227.637C373.949 227.585 373.985 227.545 374.025 227.548C374.064 227.552 374.093 227.597 374.088 227.649C374.084 227.702 374.048 227.741 374.008 227.738C373.968 227.734 373.94 227.689 373.944 227.637Z"
        fill="#038203"
      />
      <path
        d="M367.83 230.825C367.45 230.715 366.57 230.595 366.1 230.996C365.62 231.398 365.7 231.854 365.8 232.032M370.86 229.728C370.58 229.976 369.79 230.455 368.88 230.387C367.96 230.32 367.72 230.208 367.71 230.161M366.9 229.23C367.06 229.381 367.53 229.723 368.15 229.884M371.87 226.943C371.73 226.79 371.34 226.462 370.94 226.38M370.7 226.423C370.38 226.302 369.49 226.145 368.46 226.492C367.42 226.839 366.9 227.433 366.76 227.686M374.24 225.429C373.9 225.493 373.07 225.743 372.53 226.234M375.29 229.012C374.99 228.871 374.25 228.566 373.72 228.467"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M374.218 230.073C374.058 230.084 373.923 230.006 373.916 229.9C373.908 229.794 374.032 229.699 374.191 229.688C374.351 229.677 374.486 229.754 374.493 229.86C374.5 229.967 374.377 230.062 374.218 230.073Z"
        fill="black"
      />
      <path
        d="M376.477 229.567C376.349 229.595 376.23 229.549 376.211 229.464C376.191 229.378 376.28 229.286 376.408 229.257C376.536 229.228 376.656 229.274 376.675 229.36C376.694 229.445 376.606 229.538 376.477 229.567Z"
        fill="black"
      />
      <path
        d="M365.5 223L366.3 226.089L369 227L366.3 227.911L365.5 231L364.7 227.911L362 227L364.7 226.089L365.5 223Z"
        fill="#00FFD1"
      />
      <path
        d="M259.679 141V127H261.959L269.459 136.68V127H271.879V141H269.819L262.099 131.04V141H259.679ZM280.22 141.24C277 141.24 274.62 138.78 274.62 135.78V135.74C274.62 132.72 277.02 130.22 280.26 130.22C283.5 130.22 285.88 132.68 285.88 135.7V135.74C285.88 138.74 283.48 141.24 280.22 141.24ZM280.26 139.14C282.22 139.14 283.46 137.6 283.46 135.78V135.74C283.46 133.88 282.12 132.34 280.22 132.34C278.28 132.34 277.04 133.86 277.04 135.7V135.74C277.04 137.58 278.38 139.14 280.26 139.14ZM291.079 141.08L286.739 130.44H289.339L292.179 138.2L295.039 130.44H297.579L293.259 141.08H291.079ZM297.774 141V138.26H300.434V141H297.774ZM316.02 141V137.86H308.96L308.5 136.1L316.28 126.9H318.38V135.84H320.38V137.86H318.38V141H316.02ZM311.42 135.84H316.02V130.3L311.42 135.84ZM326.45 141.18C324.67 141.18 323.41 140.4 323.41 138.08V132.52H322.07V130.44H323.41V127.54H325.83V130.44H328.67V132.52H325.83V137.7C325.83 138.64 326.31 139.02 327.13 139.02C327.67 139.02 328.15 138.9 328.63 138.66V140.64C328.03 140.98 327.35 141.18 326.45 141.18ZM331.12 141V126.4H333.54V132.08C334.22 131.08 335.2 130.22 336.84 130.22C339.22 130.22 340.6 131.82 340.6 134.28V141H338.18V135C338.18 133.36 337.36 132.42 335.92 132.42C334.52 132.42 333.54 133.4 333.54 135.04V141H331.12Z"
        fill="white"
      />
      <path
        d="M149.104 76.642L152.604 68.2H153.794L149.58 78.07H148.6L144.386 68.2H145.618L149.104 76.642ZM161.657 74.374C161.657 74.8873 161.559 75.3773 161.363 75.844C161.177 76.3013 160.915 76.7027 160.579 77.048C160.243 77.3933 159.842 77.6687 159.375 77.874C158.909 78.07 158.405 78.168 157.863 78.168C157.322 78.168 156.823 78.07 156.365 77.874C155.908 77.6687 155.511 77.398 155.175 77.062C154.839 76.7167 154.578 76.3153 154.391 75.858C154.205 75.4007 154.111 74.9153 154.111 74.402C154.111 73.8887 154.205 73.4033 154.391 72.946C154.578 72.4793 154.839 72.0733 155.175 71.728C155.511 71.3827 155.908 71.112 156.365 70.916C156.832 70.7107 157.341 70.608 157.891 70.608C158.433 70.608 158.932 70.7107 159.389 70.916C159.856 71.112 160.257 71.3827 160.593 71.728C160.929 72.064 161.191 72.4607 161.377 72.918C161.564 73.3753 161.657 73.8607 161.657 74.374ZM160.551 74.402C160.551 74.01 160.481 73.6413 160.341 73.296C160.211 72.9507 160.024 72.652 159.781 72.4C159.539 72.1387 159.254 71.9333 158.927 71.784C158.601 71.6347 158.246 71.56 157.863 71.56C157.471 71.56 157.112 71.6347 156.785 71.784C156.459 71.924 156.179 72.1247 155.945 72.386C155.721 72.638 155.544 72.9367 155.413 73.282C155.283 73.618 155.217 73.982 155.217 74.374C155.217 74.766 155.283 75.1347 155.413 75.48C155.553 75.8253 155.74 76.124 155.973 76.376C156.216 76.628 156.501 76.8287 156.827 76.978C157.154 77.1273 157.509 77.202 157.891 77.202C158.283 77.202 158.643 77.132 158.969 76.992C159.296 76.8427 159.576 76.642 159.809 76.39C160.043 76.138 160.225 75.844 160.355 75.508C160.486 75.1627 160.551 74.794 160.551 74.402ZM165.066 71.714V75.942C165.066 76.39 165.178 76.7027 165.402 76.88C165.626 77.0573 165.92 77.146 166.284 77.146C166.471 77.146 166.644 77.1273 166.802 77.09C166.97 77.0527 167.148 76.9873 167.334 76.894V77.818C167.148 77.9207 166.947 77.9953 166.732 78.042C166.527 78.098 166.294 78.126 166.032 78.126C165.743 78.126 165.472 78.0887 165.22 78.014C164.968 77.9393 164.749 77.8227 164.562 77.664C164.385 77.496 164.245 77.2813 164.142 77.02C164.04 76.7587 163.988 76.446 163.988 76.082V71.714H162.98V70.762H163.988V68.578H165.066V70.762H167.362V71.714H165.066ZM170.53 69.18H169.298V67.99H170.53V69.18ZM170.446 78H169.368V70.762H170.446V78ZM174.026 73.856V78H172.948V70.762H174.026V72.022C174.269 71.63 174.586 71.2987 174.978 71.028C175.37 70.748 175.879 70.608 176.504 70.608C176.943 70.608 177.33 70.678 177.666 70.818C178.011 70.958 178.301 71.1587 178.534 71.42C178.777 71.672 178.959 71.9753 179.08 72.33C179.211 72.6847 179.276 73.0767 179.276 73.506V78H178.198V73.772C178.198 73.1 178.025 72.568 177.68 72.176C177.335 71.784 176.84 71.588 176.196 71.588C175.888 71.588 175.599 71.644 175.328 71.756C175.067 71.8587 174.838 72.0127 174.642 72.218C174.446 72.414 174.292 72.652 174.18 72.932C174.077 73.212 174.026 73.52 174.026 73.856ZM188.463 76.74C188.463 77.328 188.374 77.8413 188.197 78.28C188.029 78.7187 187.782 79.0827 187.455 79.372C187.138 79.6707 186.75 79.8947 186.293 80.044C185.845 80.1933 185.341 80.268 184.781 80.268C184.174 80.268 183.596 80.184 183.045 80.016C182.494 79.848 181.976 79.596 181.491 79.26L181.981 78.42C182.401 78.7187 182.84 78.9473 183.297 79.106C183.754 79.2647 184.244 79.344 184.767 79.344C185.57 79.344 186.209 79.1247 186.685 78.686C187.161 78.2567 187.399 77.6173 187.399 76.768V75.914C187.082 76.334 186.694 76.6933 186.237 76.992C185.78 77.2907 185.22 77.44 184.557 77.44C184.118 77.44 183.694 77.3653 183.283 77.216C182.882 77.0573 182.522 76.8333 182.205 76.544C181.888 76.2453 181.631 75.886 181.435 75.466C181.248 75.046 181.155 74.57 181.155 74.038C181.155 73.506 181.248 73.03 181.435 72.61C181.631 72.1807 181.888 71.8213 182.205 71.532C182.522 71.2333 182.886 71.0047 183.297 70.846C183.708 70.6873 184.128 70.608 184.557 70.608C184.893 70.608 185.201 70.65 185.481 70.734C185.77 70.8087 186.027 70.9113 186.251 71.042C186.484 71.1727 186.694 71.3267 186.881 71.504C187.068 71.6813 187.236 71.868 187.385 72.064V70.762H188.463V76.74ZM187.427 74.024C187.427 73.6507 187.352 73.3147 187.203 73.016C187.054 72.708 186.853 72.4467 186.601 72.232C186.358 72.0173 186.078 71.854 185.761 71.742C185.444 71.6207 185.112 71.56 184.767 71.56C184.422 71.56 184.095 71.616 183.787 71.728C183.488 71.84 183.222 72.0033 182.989 72.218C182.765 72.4327 182.588 72.694 182.457 73.002C182.326 73.3007 182.261 73.6367 182.261 74.01C182.261 74.3833 182.326 74.724 182.457 75.032C182.597 75.3307 182.779 75.592 183.003 75.816C183.236 76.0307 183.502 76.1987 183.801 76.32C184.109 76.432 184.431 76.488 184.767 76.488C185.112 76.488 185.444 76.432 185.761 76.32C186.078 76.1987 186.358 76.0307 186.601 75.816C186.853 75.6013 187.054 75.3447 187.203 75.046C187.352 74.738 187.427 74.3973 187.427 74.024ZM202.377 74.374C202.377 74.9713 202.279 75.5033 202.083 75.97C201.887 76.4367 201.626 76.8333 201.299 77.16C200.982 77.4773 200.613 77.7247 200.193 77.902C199.783 78.07 199.358 78.154 198.919 78.154C198.583 78.154 198.275 78.112 197.995 78.028C197.715 77.944 197.463 77.832 197.239 77.692C197.015 77.552 196.81 77.3887 196.623 77.202C196.446 77.0153 196.287 76.8193 196.147 76.614V78H195.069V67.78H196.147V72.218C196.297 72.0033 196.46 71.798 196.637 71.602C196.824 71.406 197.029 71.238 197.253 71.098C197.477 70.9487 197.725 70.832 197.995 70.748C198.275 70.6547 198.583 70.608 198.919 70.608C199.349 70.608 199.769 70.692 200.179 70.86C200.599 71.028 200.973 71.2753 201.299 71.602C201.626 71.9193 201.887 72.3113 202.083 72.778C202.279 73.2447 202.377 73.7767 202.377 74.374ZM201.271 74.388C201.271 73.9587 201.201 73.5713 201.061 73.226C200.931 72.8807 200.749 72.5867 200.515 72.344C200.282 72.092 200.011 71.9007 199.703 71.77C199.395 71.6393 199.069 71.574 198.723 71.574C198.387 71.574 198.061 71.644 197.743 71.784C197.435 71.9147 197.155 72.1013 196.903 72.344C196.661 72.5867 196.465 72.8807 196.315 73.226C196.175 73.5713 196.105 73.954 196.105 74.374C196.105 74.794 196.175 75.1813 196.315 75.536C196.465 75.8813 196.661 76.1753 196.903 76.418C197.155 76.6607 197.435 76.852 197.743 76.992C198.061 77.1227 198.387 77.188 198.723 77.188C199.069 77.188 199.395 77.1273 199.703 77.006C200.021 76.8753 200.291 76.6933 200.515 76.46C200.749 76.2173 200.931 75.9233 201.061 75.578C201.201 75.2233 201.271 74.8267 201.271 74.388ZM205.01 74.78C205.047 75.172 205.141 75.522 205.29 75.83C205.439 76.1287 205.631 76.3853 205.864 76.6C206.097 76.8053 206.359 76.964 206.648 77.076C206.937 77.1787 207.241 77.23 207.558 77.23C208.062 77.23 208.491 77.1367 208.846 76.95C209.21 76.7633 209.541 76.516 209.84 76.208L210.512 76.81C210.148 77.2207 209.733 77.552 209.266 77.804C208.799 78.0467 208.221 78.168 207.53 78.168C207.035 78.168 206.569 78.0793 206.13 77.902C205.691 77.7153 205.309 77.4587 204.982 77.132C204.655 76.796 204.394 76.3947 204.198 75.928C204.011 75.4613 203.918 74.948 203.918 74.388C203.918 73.8653 204.002 73.3753 204.17 72.918C204.347 72.4513 204.59 72.05 204.898 71.714C205.206 71.3687 205.57 71.098 205.99 70.902C206.419 70.706 206.886 70.608 207.39 70.608C207.922 70.608 208.398 70.7107 208.818 70.916C209.238 71.112 209.593 71.3827 209.882 71.728C210.171 72.0733 210.391 72.4793 210.54 72.946C210.689 73.4127 210.764 73.912 210.764 74.444C210.764 74.4907 210.764 74.542 210.764 74.598C210.764 74.654 210.759 74.7147 210.75 74.78H205.01ZM205.01 73.982H209.672C209.644 73.6553 209.574 73.3427 209.462 73.044C209.359 72.7453 209.21 72.484 209.014 72.26C208.827 72.036 208.594 71.8587 208.314 71.728C208.043 71.588 207.726 71.518 207.362 71.518C207.045 71.518 206.751 71.5833 206.48 71.714C206.209 71.8353 205.971 72.008 205.766 72.232C205.561 72.4467 205.393 72.7033 205.262 73.002C205.131 73.3007 205.047 73.6273 205.01 73.982ZM219.539 76.74C219.539 77.328 219.451 77.8413 219.273 78.28C219.105 78.7187 218.858 79.0827 218.531 79.372C218.214 79.6707 217.827 79.8947 217.369 80.044C216.921 80.1933 216.417 80.268 215.857 80.268C215.251 80.268 214.672 80.184 214.121 80.016C213.571 79.848 213.053 79.596 212.567 79.26L213.057 78.42C213.477 78.7187 213.916 78.9473 214.373 79.106C214.831 79.2647 215.321 79.344 215.843 79.344C216.646 79.344 217.285 79.1247 217.761 78.686C218.237 78.2567 218.475 77.6173 218.475 76.768V75.914C218.158 76.334 217.771 76.6933 217.313 76.992C216.856 77.2907 216.296 77.44 215.633 77.44C215.195 77.44 214.77 77.3653 214.359 77.216C213.958 77.0573 213.599 76.8333 213.281 76.544C212.964 76.2453 212.707 75.886 212.511 75.466C212.325 75.046 212.231 74.57 212.231 74.038C212.231 73.506 212.325 73.03 212.511 72.61C212.707 72.1807 212.964 71.8213 213.281 71.532C213.599 71.2333 213.963 71.0047 214.373 70.846C214.784 70.6873 215.204 70.608 215.633 70.608C215.969 70.608 216.277 70.65 216.557 70.734C216.847 70.8087 217.103 70.9113 217.327 71.042C217.561 71.1727 217.771 71.3267 217.957 71.504C218.144 71.6813 218.312 71.868 218.461 72.064V70.762H219.539V76.74ZM218.503 74.024C218.503 73.6507 218.429 73.3147 218.279 73.016C218.13 72.708 217.929 72.4467 217.677 72.232C217.435 72.0173 217.155 71.854 216.837 71.742C216.52 71.6207 216.189 71.56 215.843 71.56C215.498 71.56 215.171 71.616 214.863 71.728C214.565 71.84 214.299 72.0033 214.065 72.218C213.841 72.4327 213.664 72.694 213.533 73.002C213.403 73.3007 213.337 73.6367 213.337 74.01C213.337 74.3833 213.403 74.724 213.533 75.032C213.673 75.3307 213.855 75.592 214.079 75.816C214.313 76.0307 214.579 76.1987 214.877 76.32C215.185 76.432 215.507 76.488 215.843 76.488C216.189 76.488 216.52 76.432 216.837 76.32C217.155 76.1987 217.435 76.0307 217.677 75.816C217.929 75.6013 218.13 75.3447 218.279 75.046C218.429 74.738 218.503 74.3973 218.503 74.024ZM223.208 69.18H221.976V67.99H223.208V69.18ZM223.124 78H222.046V70.762H223.124V78ZM226.704 73.856V78H225.626V70.762H226.704V72.022C226.947 71.63 227.264 71.2987 227.656 71.028C228.048 70.748 228.557 70.608 229.182 70.608C229.621 70.608 230.008 70.678 230.344 70.818C230.689 70.958 230.979 71.1587 231.212 71.42C231.455 71.672 231.637 71.9753 231.758 72.33C231.889 72.6847 231.954 73.0767 231.954 73.506V78H230.876V73.772C230.876 73.1 230.703 72.568 230.358 72.176C230.013 71.784 229.518 71.588 228.874 71.588C228.566 71.588 228.277 71.644 228.006 71.756C227.745 71.8587 227.516 72.0127 227.32 72.218C227.124 72.414 226.97 72.652 226.858 72.932C226.755 73.212 226.704 73.52 226.704 73.856ZM239.223 75.97C239.223 76.3153 239.153 76.6233 239.013 76.894C238.882 77.1553 238.7 77.3793 238.467 77.566C238.243 77.7527 237.972 77.8973 237.655 78C237.347 78.0933 237.011 78.14 236.647 78.14C236.124 78.14 235.597 78.0467 235.065 77.86C234.533 77.664 234.061 77.4027 233.651 77.076L234.197 76.306C234.589 76.6047 234.995 76.8333 235.415 76.992C235.844 77.1507 236.273 77.23 236.703 77.23C237.141 77.23 237.501 77.1273 237.781 76.922C238.061 76.7167 238.201 76.4367 238.201 76.082V76.054C238.201 75.8767 238.149 75.7227 238.047 75.592C237.953 75.4613 237.823 75.3493 237.655 75.256C237.487 75.1533 237.291 75.0647 237.067 74.99C236.852 74.9153 236.628 74.8453 236.395 74.78C236.115 74.696 235.83 74.6073 235.541 74.514C235.261 74.4113 235.004 74.2853 234.771 74.136C234.547 73.9867 234.36 73.8 234.211 73.576C234.071 73.352 234.001 73.072 234.001 72.736V72.708C234.001 72.4 234.061 72.12 234.183 71.868C234.304 71.6067 234.472 71.3873 234.687 71.21C234.911 71.0233 235.172 70.8833 235.471 70.79C235.779 70.6873 236.11 70.636 236.465 70.636C236.913 70.636 237.365 70.7107 237.823 70.86C238.28 71 238.695 71.1913 239.069 71.434L238.579 72.246C238.243 72.0313 237.888 71.8633 237.515 71.742C237.151 71.6113 236.791 71.546 236.437 71.546C236.007 71.546 235.667 71.6487 235.415 71.854C235.163 72.05 235.037 72.2973 235.037 72.596V72.624C235.037 72.792 235.088 72.9413 235.191 73.072C235.293 73.1933 235.429 73.3007 235.597 73.394C235.774 73.4873 235.975 73.5713 236.199 73.646C236.423 73.7207 236.656 73.7953 236.899 73.87C237.179 73.954 237.454 74.0473 237.725 74.15C238.005 74.2527 238.257 74.3833 238.481 74.542C238.705 74.7007 238.882 74.892 239.013 75.116C239.153 75.34 239.223 75.6153 239.223 75.942V75.97ZM252.521 74.374C252.521 74.8873 252.423 75.3773 252.227 75.844C252.04 76.3013 251.779 76.7027 251.443 77.048C251.107 77.3933 250.705 77.6687 250.239 77.874C249.772 78.07 249.268 78.168 248.727 78.168C248.185 78.168 247.686 78.07 247.229 77.874C246.771 77.6687 246.375 77.398 246.039 77.062C245.703 76.7167 245.441 76.3153 245.255 75.858C245.068 75.4007 244.975 74.9153 244.975 74.402C244.975 73.8887 245.068 73.4033 245.255 72.946C245.441 72.4793 245.703 72.0733 246.039 71.728C246.375 71.3827 246.771 71.112 247.229 70.916C247.695 70.7107 248.204 70.608 248.755 70.608C249.296 70.608 249.795 70.7107 250.253 70.916C250.719 71.112 251.121 71.3827 251.457 71.728C251.793 72.064 252.054 72.4607 252.241 72.918C252.427 73.3753 252.521 73.8607 252.521 74.374ZM251.415 74.402C251.415 74.01 251.345 73.6413 251.205 73.296C251.074 72.9507 250.887 72.652 250.645 72.4C250.402 72.1387 250.117 71.9333 249.791 71.784C249.464 71.6347 249.109 71.56 248.727 71.56C248.335 71.56 247.975 71.6347 247.649 71.784C247.322 71.924 247.042 72.1247 246.809 72.386C246.585 72.638 246.407 72.9367 246.277 73.282C246.146 73.618 246.081 73.982 246.081 74.374C246.081 74.766 246.146 75.1347 246.277 75.48C246.417 75.8253 246.603 76.124 246.837 76.376C247.079 76.628 247.364 76.8287 247.691 76.978C248.017 77.1273 248.372 77.202 248.755 77.202C249.147 77.202 249.506 77.132 249.833 76.992C250.159 76.8427 250.439 76.642 250.673 76.39C250.906 76.138 251.088 75.844 251.219 75.508C251.349 75.1627 251.415 74.794 251.415 74.402ZM255.552 73.856V78H254.474V70.762H255.552V72.022C255.794 71.63 256.112 71.2987 256.504 71.028C256.896 70.748 257.404 70.608 258.03 70.608C258.468 70.608 258.856 70.678 259.192 70.818C259.537 70.958 259.826 71.1587 260.06 71.42C260.302 71.672 260.484 71.9753 260.606 72.33C260.736 72.6847 260.802 73.0767 260.802 73.506V78H259.724V73.772C259.724 73.1 259.551 72.568 259.206 72.176C258.86 71.784 258.366 71.588 257.722 71.588C257.414 71.588 257.124 71.644 256.854 71.756C256.592 71.8587 256.364 72.0127 256.168 72.218C255.972 72.414 255.818 72.652 255.706 72.932C255.603 73.212 255.552 73.52 255.552 73.856ZM274.69 76.054V68.2H275.768V78H274.886L268.558 69.964V78H267.48V68.2H268.516L274.69 76.054ZM285.456 74.374C285.456 74.8873 285.358 75.3773 285.162 75.844C284.976 76.3013 284.714 76.7027 284.378 77.048C284.042 77.3933 283.641 77.6687 283.174 77.874C282.708 78.07 282.204 78.168 281.662 78.168C281.121 78.168 280.622 78.07 280.164 77.874C279.707 77.6687 279.31 77.398 278.974 77.062C278.638 76.7167 278.377 76.3153 278.19 75.858C278.004 75.4007 277.91 74.9153 277.91 74.402C277.91 73.8887 278.004 73.4033 278.19 72.946C278.377 72.4793 278.638 72.0733 278.974 71.728C279.31 71.3827 279.707 71.112 280.164 70.916C280.631 70.7107 281.14 70.608 281.69 70.608C282.232 70.608 282.731 70.7107 283.188 70.916C283.655 71.112 284.056 71.3827 284.392 71.728C284.728 72.064 284.99 72.4607 285.176 72.918C285.363 73.3753 285.456 73.8607 285.456 74.374ZM284.35 74.402C284.35 74.01 284.28 73.6413 284.14 73.296C284.01 72.9507 283.823 72.652 283.58 72.4C283.338 72.1387 283.053 71.9333 282.726 71.784C282.4 71.6347 282.045 71.56 281.662 71.56C281.27 71.56 280.911 71.6347 280.584 71.784C280.258 71.924 279.978 72.1247 279.744 72.386C279.52 72.638 279.343 72.9367 279.212 73.282C279.082 73.618 279.016 73.982 279.016 74.374C279.016 74.766 279.082 75.1347 279.212 75.48C279.352 75.8253 279.539 76.124 279.772 76.376C280.015 76.628 280.3 76.8287 280.626 76.978C280.953 77.1273 281.308 77.202 281.69 77.202C282.082 77.202 282.442 77.132 282.768 76.992C283.095 76.8427 283.375 76.642 283.608 76.39C283.842 76.138 284.024 75.844 284.154 75.508C284.285 75.1627 284.35 74.794 284.35 74.402ZM289.897 76.768L292.347 70.762H293.509L290.359 78.056H289.407L286.271 70.762H287.461L289.897 76.768ZM295.422 74.78C295.46 75.172 295.553 75.522 295.702 75.83C295.852 76.1287 296.043 76.3853 296.276 76.6C296.51 76.8053 296.771 76.964 297.06 77.076C297.35 77.1787 297.653 77.23 297.97 77.23C298.474 77.23 298.904 77.1367 299.258 76.95C299.622 76.7633 299.954 76.516 300.252 76.208L300.924 76.81C300.56 77.2207 300.145 77.552 299.678 77.804C299.212 78.0467 298.633 78.168 297.942 78.168C297.448 78.168 296.981 78.0793 296.542 77.902C296.104 77.7153 295.721 77.4587 295.394 77.132C295.068 76.796 294.806 76.3947 294.61 75.928C294.424 75.4613 294.33 74.948 294.33 74.388C294.33 73.8653 294.414 73.3753 294.582 72.918C294.76 72.4513 295.002 72.05 295.31 71.714C295.618 71.3687 295.982 71.098 296.402 70.902C296.832 70.706 297.298 70.608 297.802 70.608C298.334 70.608 298.81 70.7107 299.23 70.916C299.65 71.112 300.005 71.3827 300.294 71.728C300.584 72.0733 300.803 72.4793 300.952 72.946C301.102 73.4127 301.176 73.912 301.176 74.444C301.176 74.4907 301.176 74.542 301.176 74.598C301.176 74.654 301.172 74.7147 301.162 74.78H295.422ZM295.422 73.982H300.084C300.056 73.6553 299.986 73.3427 299.874 73.044C299.772 72.7453 299.622 72.484 299.426 72.26C299.24 72.036 299.006 71.8587 298.726 71.728C298.456 71.588 298.138 71.518 297.774 71.518C297.457 71.518 297.163 71.5833 296.892 71.714C296.622 71.8353 296.384 72.008 296.178 72.232C295.973 72.4467 295.805 72.7033 295.674 73.002C295.544 73.3007 295.46 73.6273 295.422 73.982ZM308.8 72.05C308.93 71.854 309.08 71.6673 309.24 71.49C309.41 71.3127 309.59 71.1587 309.8 71.028C310 70.8973 310.23 70.7947 310.48 70.72C310.74 70.6453 311.03 70.608 311.35 70.608C312.19 70.608 312.85 70.8693 313.33 71.392C313.8 71.9053 314.04 72.6147 314.04 73.52V78H312.96V73.772C312.96 73.072 312.79 72.5353 312.46 72.162C312.13 71.7793 311.67 71.588 311.09 71.588C310.81 71.588 310.56 71.6393 310.32 71.742C310.07 71.8353 309.86 71.98 309.67 72.176C309.49 72.3627 309.35 72.596 309.24 72.876C309.13 73.156 309.08 73.4733 309.08 73.828V78H308.02V73.744C308.02 73.0627 307.85 72.5353 307.52 72.162C307.19 71.7793 306.74 71.588 306.16 71.588C305.87 71.588 305.6 71.644 305.36 71.756C305.12 71.868 304.9 72.0267 304.72 72.232C304.54 72.4373 304.4 72.68 304.3 72.96C304.19 73.2307 304.14 73.534 304.14 73.87V78H303.063V70.762H304.14V71.98C304.26 71.8027 304.39 71.63 304.53 71.462C304.68 71.294 304.85 71.1493 305.04 71.028C305.22 70.8973 305.43 70.7947 305.67 70.72C305.9 70.6453 306.17 70.608 306.48 70.608C307.07 70.608 307.55 70.748 307.94 71.028C308.32 71.2987 308.61 71.6393 308.8 72.05ZM323.69 74.374C323.69 74.9713 323.59 75.5033 323.39 75.97C323.2 76.4367 322.94 76.8333 322.61 77.16C322.29 77.4773 321.92 77.7247 321.5 77.902C321.09 78.07 320.67 78.154 320.23 78.154C319.89 78.154 319.59 78.112 319.31 78.028C319.03 77.944 318.77 77.832 318.55 77.692C318.33 77.552 318.12 77.3887 317.93 77.202C317.76 77.0153 317.6 76.8193 317.46 76.614V78H316.38V67.78H317.46V72.218C317.61 72.0033 317.77 71.798 317.95 71.602C318.13 71.406 318.34 71.238 318.56 71.098C318.79 70.9487 319.04 70.832 319.31 70.748C319.59 70.6547 319.89 70.608 320.23 70.608C320.66 70.608 321.08 70.692 321.49 70.86C321.91 71.028 322.28 71.2753 322.61 71.602C322.94 71.9193 323.2 72.3113 323.39 72.778C323.59 73.2447 323.69 73.7767 323.69 74.374ZM322.58 74.388C322.58 73.9587 322.51 73.5713 322.37 73.226C322.24 72.8807 322.06 72.5867 321.83 72.344C321.59 72.092 321.32 71.9007 321.01 71.77C320.71 71.6393 320.38 71.574 320.03 71.574C319.7 71.574 319.37 71.644 319.05 71.784C318.75 71.9147 318.47 72.1013 318.21 72.344C317.97 72.5867 317.78 72.8807 317.63 73.226C317.49 73.5713 317.42 73.954 317.42 74.374C317.42 74.794 317.49 75.1813 317.63 75.536C317.78 75.8813 317.97 76.1753 318.21 76.418C318.47 76.6607 318.75 76.852 319.05 76.992C319.37 77.1227 319.7 77.188 320.03 77.188C320.38 77.188 320.71 77.1273 321.01 77.006C321.33 76.8753 321.6 76.6933 321.83 76.46C322.06 76.2173 322.24 75.9233 322.37 75.578C322.51 75.2233 322.58 74.8267 322.58 74.388ZM326.32 74.78C326.36 75.172 326.45 75.522 326.6 75.83C326.75 76.1287 326.94 76.3853 327.17 76.6C327.41 76.8053 327.67 76.964 327.96 77.076C328.25 77.1787 328.55 77.23 328.87 77.23C329.37 77.23 329.8 77.1367 330.16 76.95C330.52 76.7633 330.85 76.516 331.15 76.208L331.82 76.81C331.46 77.2207 331.04 77.552 330.58 77.804C330.11 78.0467 329.53 78.168 328.84 78.168C328.35 78.168 327.88 78.0793 327.44 77.902C327 77.7153 326.62 77.4587 326.29 77.132C325.97 76.796 325.7 76.3947 325.51 75.928C325.32 75.4613 325.23 74.948 325.23 74.388C325.23 73.8653 325.31 73.3753 325.48 72.918C325.66 72.4513 325.9 72.05 326.21 71.714C326.52 71.3687 326.88 71.098 327.3 70.902C327.73 70.706 328.2 70.608 328.7 70.608C329.23 70.608 329.71 70.7107 330.13 70.916C330.55 71.112 330.9 71.3827 331.19 71.728C331.48 72.0733 331.7 72.4793 331.85 72.946C332 73.4127 332.07 73.912 332.07 74.444C332.07 74.4907 332.07 74.542 332.07 74.598C332.07 74.654 332.07 74.7147 332.06 74.78H326.32ZM326.32 73.982H330.98C330.95 73.6553 330.88 73.3427 330.77 73.044C330.67 72.7453 330.52 72.484 330.32 72.26C330.14 72.036 329.9 71.8587 329.62 71.728C329.35 71.588 329.04 71.518 328.67 71.518C328.36 71.518 328.06 71.5833 327.79 71.714C327.52 71.8353 327.28 72.008 327.08 72.232C326.87 72.4467 326.7 72.7033 326.57 73.002C326.44 73.3007 326.36 73.6273 326.32 73.982ZM335.04 75.116V78H333.96V70.762H335.04V72.652C335.17 72.3533 335.33 72.078 335.53 71.826C335.73 71.574 335.95 71.3593 336.2 71.182C336.45 70.9953 336.73 70.8553 337.03 70.762C337.33 70.6687 337.65 70.6267 337.99 70.636V71.798H337.91C337.52 71.798 337.14 71.868 336.79 72.008C336.44 72.148 336.14 72.358 335.88 72.638C335.62 72.918 335.41 73.268 335.26 73.688C335.11 74.0987 335.04 74.5747 335.04 75.116ZM340.87 72.232H339.58V70.762H340.87V72.232ZM340.87 78H339.58V76.53H340.87V78Z"
        fill="#7E8A93"
      />
      <path
        d="M199.866 160.29L202.722 164H201.476L199.236 161.046L196.982 164H195.778L198.62 160.318L195.89 156.762H197.122L199.264 159.562L201.406 156.762H202.61L199.866 160.29ZM212.763 164H211.405L208.563 160.192H205.763V164H204.657V154.2H208.871C209.413 154.2 209.898 154.27 210.327 154.41C210.766 154.55 211.139 154.751 211.447 155.012C211.755 155.264 211.993 155.572 212.161 155.936C212.329 156.291 212.413 156.687 212.413 157.126C212.413 157.537 212.348 157.905 212.217 158.232C212.087 158.549 211.9 158.829 211.657 159.072C211.424 159.305 211.144 159.501 210.817 159.66C210.491 159.819 210.136 159.931 209.753 159.996L212.763 164ZM211.293 157.168C211.293 156.552 211.074 156.076 210.635 155.74C210.197 155.395 209.581 155.222 208.787 155.222H205.763V159.198H208.773C209.137 159.198 209.473 159.151 209.781 159.058C210.089 158.965 210.355 158.834 210.579 158.666C210.803 158.489 210.976 158.274 211.097 158.022C211.228 157.77 211.293 157.485 211.293 157.168ZM215.1 160.78C215.137 161.172 215.231 161.522 215.38 161.83C215.529 162.129 215.721 162.385 215.954 162.6C216.187 162.805 216.449 162.964 216.738 163.076C217.027 163.179 217.331 163.23 217.648 163.23C218.152 163.23 218.581 163.137 218.936 162.95C219.3 162.763 219.631 162.516 219.93 162.208L220.602 162.81C220.238 163.221 219.823 163.552 219.356 163.804C218.889 164.047 218.311 164.168 217.62 164.168C217.125 164.168 216.659 164.079 216.22 163.902C215.781 163.715 215.399 163.459 215.072 163.132C214.745 162.796 214.484 162.395 214.288 161.928C214.101 161.461 214.008 160.948 214.008 160.388C214.008 159.865 214.092 159.375 214.26 158.918C214.437 158.451 214.68 158.05 214.988 157.714C215.296 157.369 215.66 157.098 216.08 156.902C216.509 156.706 216.976 156.608 217.48 156.608C218.012 156.608 218.488 156.711 218.908 156.916C219.328 157.112 219.683 157.383 219.972 157.728C220.261 158.073 220.481 158.479 220.63 158.946C220.779 159.413 220.854 159.912 220.854 160.444C220.854 160.491 220.854 160.542 220.854 160.598C220.854 160.654 220.849 160.715 220.84 160.78H215.1ZM215.1 159.982H219.762C219.734 159.655 219.664 159.343 219.552 159.044C219.449 158.745 219.3 158.484 219.104 158.26C218.917 158.036 218.684 157.859 218.404 157.728C218.133 157.588 217.816 157.518 217.452 157.518C217.135 157.518 216.841 157.583 216.57 157.714C216.299 157.835 216.061 158.008 215.856 158.232C215.651 158.447 215.483 158.703 215.352 159.002C215.221 159.301 215.137 159.627 215.1 159.982ZM224.211 156.79H226.507V157.714H224.225V164H223.147V157.714H222.153V156.776H223.147V156.146C223.147 155.353 223.334 154.751 223.707 154.34C224.09 153.929 224.631 153.724 225.331 153.724C225.583 153.724 225.798 153.738 225.975 153.766C226.162 153.794 226.344 153.841 226.521 153.906V154.844C226.325 154.788 226.148 154.746 225.989 154.718C225.83 154.681 225.658 154.662 225.471 154.662C224.631 154.662 224.211 155.175 224.211 156.202V156.79ZM234.991 162.768L237.441 156.762H238.603L235.453 164.056H234.501L231.365 156.762H232.555L234.991 162.768ZM246.97 160.374C246.97 160.887 246.872 161.377 246.676 161.844C246.489 162.301 246.228 162.703 245.892 163.048C245.556 163.393 245.155 163.669 244.688 163.874C244.221 164.07 243.717 164.168 243.176 164.168C242.635 164.168 242.135 164.07 241.678 163.874C241.221 163.669 240.824 163.398 240.488 163.062C240.152 162.717 239.891 162.315 239.704 161.858C239.517 161.401 239.424 160.915 239.424 160.402C239.424 159.889 239.517 159.403 239.704 158.946C239.891 158.479 240.152 158.073 240.488 157.728C240.824 157.383 241.221 157.112 241.678 156.916C242.145 156.711 242.653 156.608 243.204 156.608C243.745 156.608 244.245 156.711 244.702 156.916C245.169 157.112 245.57 157.383 245.906 157.728C246.242 158.064 246.503 158.461 246.69 158.918C246.877 159.375 246.97 159.861 246.97 160.374ZM245.864 160.402C245.864 160.01 245.794 159.641 245.654 159.296C245.523 158.951 245.337 158.652 245.094 158.4C244.851 158.139 244.567 157.933 244.24 157.784C243.913 157.635 243.559 157.56 243.176 157.56C242.784 157.56 242.425 157.635 242.098 157.784C241.771 157.924 241.491 158.125 241.258 158.386C241.034 158.638 240.857 158.937 240.726 159.282C240.595 159.618 240.53 159.982 240.53 160.374C240.53 160.766 240.595 161.135 240.726 161.48C240.866 161.825 241.053 162.124 241.286 162.376C241.529 162.628 241.813 162.829 242.14 162.978C242.467 163.127 242.821 163.202 243.204 163.202C243.596 163.202 243.955 163.132 244.282 162.992C244.609 162.843 244.889 162.642 245.122 162.39C245.355 162.138 245.537 161.844 245.668 161.508C245.799 161.163 245.864 160.794 245.864 160.402ZM250.379 157.714V161.942C250.379 162.39 250.491 162.703 250.715 162.88C250.939 163.057 251.233 163.146 251.597 163.146C251.783 163.146 251.956 163.127 252.115 163.09C252.283 163.053 252.46 162.987 252.647 162.894V163.818C252.46 163.921 252.259 163.995 252.045 164.042C251.839 164.098 251.606 164.126 251.345 164.126C251.055 164.126 250.785 164.089 250.533 164.014C250.281 163.939 250.061 163.823 249.875 163.664C249.697 163.496 249.557 163.281 249.455 163.02C249.352 162.759 249.301 162.446 249.301 162.082V157.714H248.293V156.762H249.301V154.578H250.379V156.762H252.675V157.714H250.379ZM255.843 155.18H254.611V153.99H255.843V155.18ZM255.759 164H254.681V156.762H255.759V164ZM259.339 159.856V164H258.261V156.762H259.339V158.022C259.581 157.63 259.899 157.299 260.291 157.028C260.683 156.748 261.191 156.608 261.817 156.608C262.255 156.608 262.643 156.678 262.979 156.818C263.324 156.958 263.613 157.159 263.847 157.42C264.089 157.672 264.271 157.975 264.393 158.33C264.523 158.685 264.589 159.077 264.589 159.506V164H263.511V159.772C263.511 159.1 263.338 158.568 262.993 158.176C262.647 157.784 262.153 157.588 261.509 157.588C261.201 157.588 260.911 157.644 260.641 157.756C260.379 157.859 260.151 158.013 259.955 158.218C259.759 158.414 259.605 158.652 259.493 158.932C259.39 159.212 259.339 159.52 259.339 159.856ZM273.776 162.74C273.776 163.328 273.687 163.841 273.51 164.28C273.342 164.719 273.094 165.083 272.768 165.372C272.45 165.671 272.063 165.895 271.606 166.044C271.158 166.193 270.654 166.268 270.094 166.268C269.487 166.268 268.908 166.184 268.358 166.016C267.807 165.848 267.289 165.596 266.804 165.26L267.294 164.42C267.714 164.719 268.152 164.947 268.61 165.106C269.067 165.265 269.557 165.344 270.08 165.344C270.882 165.344 271.522 165.125 271.998 164.686C272.474 164.257 272.712 163.617 272.712 162.768V161.914C272.394 162.334 272.007 162.693 271.55 162.992C271.092 163.291 270.532 163.44 269.87 163.44C269.431 163.44 269.006 163.365 268.596 163.216C268.194 163.057 267.835 162.833 267.518 162.544C267.2 162.245 266.944 161.886 266.748 161.466C266.561 161.046 266.468 160.57 266.468 160.038C266.468 159.506 266.561 159.03 266.748 158.61C266.944 158.181 267.2 157.821 267.518 157.532C267.835 157.233 268.199 157.005 268.61 156.846C269.02 156.687 269.44 156.608 269.87 156.608C270.206 156.608 270.514 156.65 270.794 156.734C271.083 156.809 271.34 156.911 271.564 157.042C271.797 157.173 272.007 157.327 272.194 157.504C272.38 157.681 272.548 157.868 272.698 158.064V156.762H273.776V162.74ZM272.74 160.024C272.74 159.651 272.665 159.315 272.516 159.016C272.366 158.708 272.166 158.447 271.914 158.232C271.671 158.017 271.391 157.854 271.074 157.742C270.756 157.621 270.425 157.56 270.08 157.56C269.734 157.56 269.408 157.616 269.1 157.728C268.801 157.84 268.535 158.003 268.302 158.218C268.078 158.433 267.9 158.694 267.77 159.002C267.639 159.301 267.574 159.637 267.574 160.01C267.574 160.383 267.639 160.724 267.77 161.032C267.91 161.331 268.092 161.592 268.316 161.816C268.549 162.031 268.815 162.199 269.114 162.32C269.422 162.432 269.744 162.488 270.08 162.488C270.425 162.488 270.756 162.432 271.074 162.32C271.391 162.199 271.671 162.031 271.914 161.816C272.166 161.601 272.366 161.345 272.516 161.046C272.665 160.738 272.74 160.397 272.74 160.024ZM287.27 164H286.192V162.544C286.042 162.759 285.874 162.964 285.688 163.16C285.51 163.356 285.31 163.529 285.086 163.678C284.862 163.827 284.61 163.944 284.33 164.028C284.059 164.112 283.756 164.154 283.42 164.154C282.981 164.154 282.556 164.07 282.146 163.902C281.735 163.734 281.366 163.491 281.04 163.174C280.713 162.847 280.452 162.451 280.256 161.984C280.06 161.517 279.962 160.985 279.962 160.388C279.962 159.791 280.06 159.259 280.256 158.792C280.452 158.325 280.713 157.933 281.04 157.616C281.366 157.289 281.735 157.042 282.146 156.874C282.556 156.697 282.981 156.608 283.42 156.608C283.756 156.608 284.064 156.65 284.344 156.734C284.624 156.818 284.876 156.93 285.1 157.07C285.324 157.21 285.524 157.373 285.702 157.56C285.888 157.747 286.052 157.943 286.192 158.148V153.78H287.27V164ZM286.234 160.374C286.234 159.954 286.159 159.571 286.01 159.226C285.87 158.881 285.674 158.587 285.422 158.344C285.179 158.101 284.899 157.915 284.582 157.784C284.274 157.644 283.952 157.574 283.616 157.574C283.261 157.574 282.93 157.639 282.622 157.77C282.314 157.891 282.043 158.073 281.81 158.316C281.586 158.549 281.404 158.843 281.264 159.198C281.133 159.543 281.068 159.935 281.068 160.374C281.068 160.803 281.133 161.191 281.264 161.536C281.404 161.881 281.59 162.18 281.824 162.432C282.057 162.675 282.328 162.861 282.636 162.992C282.944 163.123 283.27 163.188 283.616 163.188C283.952 163.188 284.274 163.123 284.582 162.992C284.899 162.852 285.179 162.661 285.422 162.418C285.674 162.175 285.87 161.881 286.01 161.536C286.159 161.181 286.234 160.794 286.234 160.374ZM290.323 160.78C290.36 161.172 290.453 161.522 290.603 161.83C290.752 162.129 290.943 162.385 291.177 162.6C291.41 162.805 291.671 162.964 291.961 163.076C292.25 163.179 292.553 163.23 292.871 163.23C293.375 163.23 293.804 163.137 294.159 162.95C294.523 162.763 294.854 162.516 295.153 162.208L295.825 162.81C295.461 163.221 295.045 163.552 294.579 163.804C294.112 164.047 293.533 164.168 292.843 164.168C292.348 164.168 291.881 164.079 291.443 163.902C291.004 163.715 290.621 163.459 290.295 163.132C289.968 162.796 289.707 162.395 289.511 161.928C289.324 161.461 289.231 160.948 289.231 160.388C289.231 159.865 289.315 159.375 289.483 158.918C289.66 158.451 289.903 158.05 290.211 157.714C290.519 157.369 290.883 157.098 291.303 156.902C291.732 156.706 292.199 156.608 292.703 156.608C293.235 156.608 293.711 156.711 294.131 156.916C294.551 157.112 294.905 157.383 295.195 157.728C295.484 158.073 295.703 158.479 295.853 158.946C296.002 159.413 296.077 159.912 296.077 160.444C296.077 160.491 296.077 160.542 296.077 160.598C296.077 160.654 296.072 160.715 296.063 160.78H290.323ZM290.323 159.982H294.985C294.957 159.655 294.887 159.343 294.775 159.044C294.672 158.745 294.523 158.484 294.327 158.26C294.14 158.036 293.907 157.859 293.627 157.728C293.356 157.588 293.039 157.518 292.675 157.518C292.357 157.518 292.063 157.583 291.793 157.714C291.522 157.835 291.284 158.008 291.079 158.232C290.873 158.447 290.705 158.703 290.575 159.002C290.444 159.301 290.36 159.627 290.323 159.982ZM300.582 157.616C300.152 157.616 299.76 157.667 299.406 157.77C299.06 157.863 298.72 157.989 298.384 158.148L298.062 157.266C298.463 157.079 298.869 156.935 299.28 156.832C299.69 156.72 300.162 156.664 300.694 156.664C301.683 156.664 302.444 156.911 302.976 157.406C303.508 157.891 303.774 158.615 303.774 159.576V164H302.738V162.908C302.486 163.235 302.145 163.524 301.716 163.776C301.296 164.028 300.764 164.154 300.12 164.154C299.784 164.154 299.452 164.107 299.126 164.014C298.808 163.921 298.519 163.781 298.258 163.594C298.006 163.398 297.8 163.16 297.642 162.88C297.492 162.6 297.418 162.269 297.418 161.886C297.418 161.503 297.492 161.167 297.642 160.878C297.791 160.579 298.001 160.332 298.272 160.136C298.552 159.94 298.878 159.791 299.252 159.688C299.634 159.585 300.054 159.534 300.512 159.534C300.978 159.534 301.384 159.562 301.73 159.618C302.075 159.674 302.411 159.749 302.738 159.842V159.59C302.738 158.937 302.546 158.447 302.164 158.12C301.79 157.784 301.263 157.616 300.582 157.616ZM300.624 160.332C299.942 160.332 299.42 160.467 299.056 160.738C298.692 161.009 298.51 161.377 298.51 161.844C298.51 162.077 298.556 162.283 298.65 162.46C298.752 162.637 298.888 162.791 299.056 162.922C299.224 163.043 299.415 163.137 299.63 163.202C299.854 163.267 300.087 163.3 300.33 163.3C300.666 163.3 300.978 163.253 301.268 163.16C301.566 163.057 301.823 162.922 302.038 162.754C302.262 162.577 302.434 162.371 302.556 162.138C302.686 161.895 302.752 161.629 302.752 161.34V160.64C302.481 160.565 302.168 160.495 301.814 160.43C301.468 160.365 301.072 160.332 300.624 160.332ZM312.96 164H311.88V162.544C311.73 162.759 311.56 162.964 311.38 163.16C311.2 163.356 311 163.529 310.78 163.678C310.55 163.827 310.3 163.944 310.02 164.028C309.75 164.112 309.45 164.154 309.11 164.154C308.67 164.154 308.25 164.07 307.84 163.902C307.42 163.734 307.06 163.491 306.73 163.174C306.4 162.847 306.14 162.451 305.95 161.984C305.75 161.517 305.65 160.985 305.65 160.388C305.65 159.791 305.75 159.259 305.95 158.792C306.14 158.325 306.4 157.933 306.73 157.616C307.06 157.289 307.42 157.042 307.84 156.874C308.25 156.697 308.67 156.608 309.11 156.608C309.45 156.608 309.75 156.65 310.03 156.734C310.31 156.818 310.57 156.93 310.79 157.07C311.01 157.21 311.21 157.373 311.39 157.56C311.58 157.747 311.74 157.943 311.88 158.148V153.78H312.96V164ZM311.92 160.374C311.92 159.954 311.85 159.571 311.7 159.226C311.56 158.881 311.36 158.587 311.11 158.344C310.87 158.101 310.59 157.915 310.27 157.784C309.96 157.644 309.64 157.574 309.31 157.574C308.95 157.574 308.62 157.639 308.31 157.77C308 157.891 307.73 158.073 307.5 158.316C307.28 158.549 307.09 158.843 306.95 159.198C306.82 159.543 306.76 159.935 306.76 160.374C306.76 160.803 306.82 161.191 306.95 161.536C307.09 161.881 307.28 162.18 307.51 162.432C307.75 162.675 308.02 162.861 308.33 162.992C308.63 163.123 308.96 163.188 309.31 163.188C309.64 163.188 309.96 163.123 310.27 162.992C310.59 162.852 310.87 162.661 311.11 162.418C311.36 162.175 311.56 161.881 311.7 161.536C311.85 161.181 311.92 160.794 311.92 160.374ZM316.54 164H315.47V153.78H316.54V164ZM320.31 155.18H319.07V153.99H320.31V155.18ZM320.22 164H319.14V156.762H320.22V164ZM323.8 159.856V164H322.72V156.762H323.8V158.022C324.04 157.63 324.36 157.299 324.75 157.028C325.15 156.748 325.65 156.608 326.28 156.608C326.72 156.608 327.11 156.678 327.44 156.818C327.79 156.958 328.08 157.159 328.31 157.42C328.55 157.672 328.73 157.975 328.86 158.33C328.99 158.685 329.05 159.077 329.05 159.506V164H327.97V159.772C327.97 159.1 327.8 158.568 327.46 158.176C327.11 157.784 326.62 157.588 325.97 157.588C325.66 157.588 325.37 157.644 325.1 157.756C324.84 157.859 324.61 158.013 324.42 158.218C324.22 158.414 324.07 158.652 323.96 158.932C323.85 159.212 323.8 159.52 323.8 159.856ZM331.99 160.78C332.03 161.172 332.13 161.522 332.27 161.83C332.42 162.129 332.62 162.385 332.85 162.6C333.08 162.805 333.34 162.964 333.63 163.076C333.92 163.179 334.23 163.23 334.54 163.23C335.05 163.23 335.48 163.137 335.83 162.95C336.19 162.763 336.53 162.516 336.82 162.208L337.5 162.81C337.13 163.221 336.72 163.552 336.25 163.804C335.78 164.047 335.21 164.168 334.51 164.168C334.02 164.168 333.55 164.079 333.11 163.902C332.68 163.715 332.29 163.459 331.97 163.132C331.64 162.796 331.38 162.395 331.18 161.928C331 161.461 330.9 160.948 330.9 160.388C330.9 159.865 330.99 159.375 331.15 158.918C331.33 158.451 331.57 158.05 331.88 157.714C332.19 157.369 332.55 157.098 332.97 156.902C333.4 156.706 333.87 156.608 334.37 156.608C334.91 156.608 335.38 156.711 335.8 156.916C336.22 157.112 336.58 157.383 336.87 157.728C337.16 158.073 337.38 158.479 337.52 158.946C337.67 159.413 337.75 159.912 337.75 160.444C337.75 160.491 337.75 160.542 337.75 160.598C337.75 160.654 337.74 160.715 337.73 160.78H331.99ZM331.99 159.982H336.66C336.63 159.655 336.56 159.343 336.45 159.044C336.34 158.745 336.19 158.484 336 158.26C335.81 158.036 335.58 157.859 335.3 157.728C335.03 157.588 334.71 157.518 334.35 157.518C334.03 157.518 333.74 157.583 333.46 157.714C333.19 157.835 332.96 158.008 332.75 158.232C332.55 158.447 332.38 158.703 332.25 159.002C332.12 159.301 332.03 159.627 331.99 159.982ZM340.87 158.232H339.58V156.762H340.87V158.232ZM340.87 164H339.58V162.53H340.87V164Z"
        fill="#7E8A93"
      />
      <path
        d="M260.851 227V213H263.131L270.631 222.68V213H273.051V227H270.991L263.271 217.04V227H260.851ZM281.392 227.24C278.172 227.24 275.792 224.78 275.792 221.78V221.74C275.792 218.72 278.192 216.22 281.432 216.22C284.672 216.22 287.052 218.68 287.052 221.7V221.74C287.052 224.74 284.652 227.24 281.392 227.24ZM281.432 225.14C283.392 225.14 284.632 223.6 284.632 221.78V221.74C284.632 219.88 283.292 218.34 281.392 218.34C279.452 218.34 278.212 219.86 278.212 221.7V221.74C278.212 223.58 279.552 225.14 281.432 225.14ZM292.251 227.08L287.911 216.44H290.511L293.351 224.2L296.211 216.44H298.751L294.431 227.08H292.251ZM298.946 227V224.26H301.606V227H298.946ZM315.03 227.24C312.89 227.24 311.21 226.38 309.89 225.1L311.41 223.32C312.53 224.36 313.71 225 315.01 225C316.69 225 317.79 224.04 317.79 222.58V222.54C317.79 221.12 316.59 220.22 314.89 220.22C313.89 220.22 313.03 220.5 312.31 220.84L310.83 219.86L311.23 213H319.59V215.18H313.35L313.13 218.46C313.79 218.22 314.41 218.06 315.35 218.06C318.07 218.06 320.21 219.5 320.21 222.46V222.5C320.21 225.36 318.13 227.24 315.03 227.24ZM326.45 227.18C324.67 227.18 323.41 226.4 323.41 224.08V218.52H322.07V216.44H323.41V213.54H325.83V216.44H328.67V218.52H325.83V223.7C325.83 224.64 326.31 225.02 327.13 225.02C327.67 225.02 328.15 224.9 328.63 224.66V226.64C328.03 226.98 327.35 227.18 326.45 227.18ZM331.12 227V212.4H333.54V218.08C334.22 217.08 335.2 216.22 336.84 216.22C339.22 216.22 340.6 217.82 340.6 220.28V227H338.18V221C338.18 219.36 337.36 218.42 335.92 218.42C334.52 218.42 333.54 219.4 333.54 221.04V227H331.12Z"
        fill="white"
      />
      <path
        d="M156.986 242.062L153.416 247.312H153.36L149.79 242.076V250H148.712V240.2H149.832L153.402 245.548L156.972 240.2H158.092V250H156.986V242.062ZM161.328 246.78C161.366 247.172 161.459 247.522 161.608 247.83C161.758 248.129 161.949 248.385 162.182 248.6C162.416 248.805 162.677 248.964 162.966 249.076C163.256 249.179 163.559 249.23 163.876 249.23C164.38 249.23 164.81 249.137 165.164 248.95C165.528 248.763 165.86 248.516 166.158 248.208L166.83 248.81C166.466 249.221 166.051 249.552 165.584 249.804C165.118 250.047 164.539 250.168 163.848 250.168C163.354 250.168 162.887 250.079 162.448 249.902C162.01 249.715 161.627 249.459 161.3 249.132C160.974 248.796 160.712 248.395 160.516 247.928C160.33 247.461 160.236 246.948 160.236 246.388C160.236 245.865 160.32 245.375 160.488 244.918C160.666 244.451 160.908 244.05 161.216 243.714C161.524 243.369 161.888 243.098 162.308 242.902C162.738 242.706 163.204 242.608 163.708 242.608C164.24 242.608 164.716 242.711 165.136 242.916C165.556 243.112 165.911 243.383 166.2 243.728C166.49 244.073 166.709 244.479 166.858 244.946C167.008 245.413 167.082 245.912 167.082 246.444C167.082 246.491 167.082 246.542 167.082 246.598C167.082 246.654 167.078 246.715 167.068 246.78H161.328ZM161.328 245.982H165.99C165.962 245.655 165.892 245.343 165.78 245.044C165.678 244.745 165.528 244.484 165.332 244.26C165.146 244.036 164.912 243.859 164.632 243.728C164.362 243.588 164.044 243.518 163.68 243.518C163.363 243.518 163.069 243.583 162.798 243.714C162.528 243.835 162.29 244.008 162.084 244.232C161.879 244.447 161.711 244.703 161.58 245.002C161.45 245.301 161.366 245.627 161.328 245.982ZM174.71 244.05C174.84 243.854 174.985 243.667 175.144 243.49C175.312 243.313 175.498 243.159 175.704 243.028C175.909 242.897 176.138 242.795 176.39 242.72C176.651 242.645 176.94 242.608 177.258 242.608C178.098 242.608 178.756 242.869 179.232 243.392C179.708 243.905 179.946 244.615 179.946 245.52V250H178.868V245.772C178.868 245.072 178.7 244.535 178.364 244.162C178.037 243.779 177.58 243.588 176.992 243.588C176.721 243.588 176.464 243.639 176.222 243.742C175.979 243.835 175.764 243.98 175.578 244.176C175.4 244.363 175.256 244.596 175.144 244.876C175.041 245.156 174.99 245.473 174.99 245.828V250H173.926V245.744C173.926 245.063 173.758 244.535 173.422 244.162C173.095 243.779 172.642 243.588 172.064 243.588C171.774 243.588 171.508 243.644 171.266 243.756C171.023 243.868 170.808 244.027 170.622 244.232C170.444 244.437 170.304 244.68 170.202 244.96C170.099 245.231 170.048 245.534 170.048 245.87V250H168.97V242.762H170.048V243.98C170.169 243.803 170.3 243.63 170.44 243.462C170.589 243.294 170.757 243.149 170.944 243.028C171.13 242.897 171.34 242.795 171.574 242.72C171.807 242.645 172.078 242.608 172.386 242.608C172.974 242.608 173.459 242.748 173.842 243.028C174.224 243.299 174.514 243.639 174.71 244.05ZM182.93 246.78C182.967 247.172 183.061 247.522 183.21 247.83C183.359 248.129 183.551 248.385 183.784 248.6C184.017 248.805 184.279 248.964 184.568 249.076C184.857 249.179 185.161 249.23 185.478 249.23C185.982 249.23 186.411 249.137 186.766 248.95C187.13 248.763 187.461 248.516 187.76 248.208L188.432 248.81C188.068 249.221 187.653 249.552 187.186 249.804C186.719 250.047 186.141 250.168 185.45 250.168C184.955 250.168 184.489 250.079 184.05 249.902C183.611 249.715 183.229 249.459 182.902 249.132C182.575 248.796 182.314 248.395 182.118 247.928C181.931 247.461 181.838 246.948 181.838 246.388C181.838 245.865 181.922 245.375 182.09 244.918C182.267 244.451 182.51 244.05 182.818 243.714C183.126 243.369 183.49 243.098 183.91 242.902C184.339 242.706 184.806 242.608 185.31 242.608C185.842 242.608 186.318 242.711 186.738 242.916C187.158 243.112 187.513 243.383 187.802 243.728C188.091 244.073 188.311 244.479 188.46 244.946C188.609 245.413 188.684 245.912 188.684 246.444C188.684 246.491 188.684 246.542 188.684 246.598C188.684 246.654 188.679 246.715 188.67 246.78H182.93ZM182.93 245.982H187.592C187.564 245.655 187.494 245.343 187.382 245.044C187.279 244.745 187.13 244.484 186.934 244.26C186.747 244.036 186.514 243.859 186.234 243.728C185.963 243.588 185.646 243.518 185.282 243.518C184.965 243.518 184.671 243.583 184.4 243.714C184.129 243.835 183.891 244.008 183.686 244.232C183.481 244.447 183.313 244.703 183.182 245.002C183.051 245.301 182.967 245.627 182.93 245.982ZM194.463 241.222V250H193.343V241.222H190.053V240.2H197.753V241.222H194.463ZM204.97 246.374C204.97 246.887 204.872 247.377 204.676 247.844C204.489 248.301 204.228 248.703 203.892 249.048C203.556 249.393 203.155 249.669 202.688 249.874C202.221 250.07 201.717 250.168 201.176 250.168C200.635 250.168 200.135 250.07 199.678 249.874C199.221 249.669 198.824 249.398 198.488 249.062C198.152 248.717 197.891 248.315 197.704 247.858C197.517 247.401 197.424 246.915 197.424 246.402C197.424 245.889 197.517 245.403 197.704 244.946C197.891 244.479 198.152 244.073 198.488 243.728C198.824 243.383 199.221 243.112 199.678 242.916C200.145 242.711 200.653 242.608 201.204 242.608C201.745 242.608 202.245 242.711 202.702 242.916C203.169 243.112 203.57 243.383 203.906 243.728C204.242 244.064 204.503 244.461 204.69 244.918C204.877 245.375 204.97 245.861 204.97 246.374ZM203.864 246.402C203.864 246.01 203.794 245.641 203.654 245.296C203.523 244.951 203.337 244.652 203.094 244.4C202.851 244.139 202.567 243.933 202.24 243.784C201.913 243.635 201.559 243.56 201.176 243.56C200.784 243.56 200.425 243.635 200.098 243.784C199.771 243.924 199.491 244.125 199.258 244.386C199.034 244.638 198.857 244.937 198.726 245.282C198.595 245.618 198.53 245.982 198.53 246.374C198.53 246.766 198.595 247.135 198.726 247.48C198.866 247.825 199.053 248.124 199.286 248.376C199.529 248.628 199.813 248.829 200.14 248.978C200.467 249.127 200.821 249.202 201.204 249.202C201.596 249.202 201.955 249.132 202.282 248.992C202.609 248.843 202.889 248.642 203.122 248.39C203.355 248.138 203.537 247.844 203.668 247.508C203.799 247.163 203.864 246.794 203.864 246.402ZM210.213 245.87L213.349 250H212.061L209.471 246.626L208.001 248.11V250H206.923V239.78H208.001V246.836L211.907 242.762H213.251L210.213 245.87ZM215.182 246.78C215.219 247.172 215.313 247.522 215.462 247.83C215.611 248.129 215.803 248.385 216.036 248.6C216.269 248.805 216.531 248.964 216.82 249.076C217.109 249.179 217.413 249.23 217.73 249.23C218.234 249.23 218.663 249.137 219.018 248.95C219.382 248.763 219.713 248.516 220.012 248.208L220.684 248.81C220.32 249.221 219.905 249.552 219.438 249.804C218.971 250.047 218.393 250.168 217.702 250.168C217.207 250.168 216.741 250.079 216.302 249.902C215.863 249.715 215.481 249.459 215.154 249.132C214.827 248.796 214.566 248.395 214.37 247.928C214.183 247.461 214.09 246.948 214.09 246.388C214.09 245.865 214.174 245.375 214.342 244.918C214.519 244.451 214.762 244.05 215.07 243.714C215.378 243.369 215.742 243.098 216.162 242.902C216.591 242.706 217.058 242.608 217.562 242.608C218.094 242.608 218.57 242.711 218.99 242.916C219.41 243.112 219.765 243.383 220.054 243.728C220.343 244.073 220.563 244.479 220.712 244.946C220.861 245.413 220.936 245.912 220.936 246.444C220.936 246.491 220.936 246.542 220.936 246.598C220.936 246.654 220.931 246.715 220.922 246.78H215.182ZM215.182 245.982H219.844C219.816 245.655 219.746 245.343 219.634 245.044C219.531 244.745 219.382 244.484 219.186 244.26C218.999 244.036 218.766 243.859 218.486 243.728C218.215 243.588 217.898 243.518 217.534 243.518C217.217 243.518 216.923 243.583 216.652 243.714C216.381 243.835 216.143 244.008 215.938 244.232C215.733 244.447 215.565 244.703 215.434 245.002C215.303 245.301 215.219 245.627 215.182 245.982ZM223.901 245.856V250H222.823V242.762H223.901V244.022C224.144 243.63 224.461 243.299 224.853 243.028C225.245 242.748 225.754 242.608 226.379 242.608C226.818 242.608 227.205 242.678 227.541 242.818C227.886 242.958 228.176 243.159 228.409 243.42C228.652 243.672 228.834 243.975 228.955 244.33C229.086 244.685 229.151 245.077 229.151 245.506V250H228.073V245.772C228.073 245.1 227.9 244.568 227.555 244.176C227.21 243.784 226.715 243.588 226.071 243.588C225.763 243.588 225.474 243.644 225.203 243.756C224.942 243.859 224.713 244.013 224.517 244.218C224.321 244.414 224.167 244.652 224.055 244.932C223.952 245.212 223.901 245.52 223.901 245.856ZM238.559 248.768L241.009 242.762H242.171L239.021 250.056H238.069L234.933 242.762H236.123L238.559 248.768ZM250.538 246.374C250.538 246.887 250.44 247.377 250.244 247.844C250.058 248.301 249.796 248.703 249.46 249.048C249.124 249.393 248.723 249.669 248.256 249.874C247.79 250.07 247.286 250.168 246.744 250.168C246.203 250.168 245.704 250.07 245.246 249.874C244.789 249.669 244.392 249.398 244.056 249.062C243.72 248.717 243.459 248.315 243.272 247.858C243.086 247.401 242.992 246.915 242.992 246.402C242.992 245.889 243.086 245.403 243.272 244.946C243.459 244.479 243.72 244.073 244.056 243.728C244.392 243.383 244.789 243.112 245.246 242.916C245.713 242.711 246.222 242.608 246.772 242.608C247.314 242.608 247.813 242.711 248.27 242.916C248.737 243.112 249.138 243.383 249.474 243.728C249.81 244.064 250.072 244.461 250.258 244.918C250.445 245.375 250.538 245.861 250.538 246.374ZM249.432 246.402C249.432 246.01 249.362 245.641 249.222 245.296C249.092 244.951 248.905 244.652 248.662 244.4C248.42 244.139 248.135 243.933 247.808 243.784C247.482 243.635 247.127 243.56 246.744 243.56C246.352 243.56 245.993 243.635 245.666 243.784C245.34 243.924 245.06 244.125 244.826 244.386C244.602 244.638 244.425 244.937 244.294 245.282C244.164 245.618 244.098 245.982 244.098 246.374C244.098 246.766 244.164 247.135 244.294 247.48C244.434 247.825 244.621 248.124 244.854 248.376C245.097 248.628 245.382 248.829 245.708 248.978C246.035 249.127 246.39 249.202 246.772 249.202C247.164 249.202 247.524 249.132 247.85 248.992C248.177 248.843 248.457 248.642 248.69 248.39C248.924 248.138 249.106 247.844 249.236 247.508C249.367 247.163 249.432 246.794 249.432 246.402ZM253.947 243.714V247.942C253.947 248.39 254.059 248.703 254.283 248.88C254.507 249.057 254.801 249.146 255.165 249.146C255.352 249.146 255.524 249.127 255.683 249.09C255.851 249.053 256.028 248.987 256.215 248.894V249.818C256.028 249.921 255.828 249.995 255.613 250.042C255.408 250.098 255.174 250.126 254.913 250.126C254.624 250.126 254.353 250.089 254.101 250.014C253.849 249.939 253.63 249.823 253.443 249.664C253.266 249.496 253.126 249.281 253.023 249.02C252.92 248.759 252.869 248.446 252.869 248.082V243.714H251.861V242.762H252.869V240.578H253.947V242.762H256.243V243.714H253.947ZM259.411 241.18H258.179V239.99H259.411V241.18ZM259.327 250H258.249V242.762H259.327V250ZM262.907 245.856V250H261.829V242.762H262.907V244.022C263.15 243.63 263.467 243.299 263.859 243.028C264.251 242.748 264.76 242.608 265.385 242.608C265.824 242.608 266.211 242.678 266.547 242.818C266.892 242.958 267.182 243.159 267.415 243.42C267.658 243.672 267.84 243.975 267.961 244.33C268.092 244.685 268.157 245.077 268.157 245.506V250H267.079V245.772C267.079 245.1 266.906 244.568 266.561 244.176C266.216 243.784 265.721 243.588 265.077 243.588C264.769 243.588 264.48 243.644 264.209 243.756C263.948 243.859 263.719 244.013 263.523 244.218C263.327 244.414 263.173 244.652 263.061 244.932C262.958 245.212 262.907 245.52 262.907 245.856ZM277.344 248.74C277.344 249.328 277.255 249.841 277.078 250.28C276.91 250.719 276.663 251.083 276.336 251.372C276.019 251.671 275.631 251.895 275.174 252.044C274.726 252.193 274.222 252.268 273.662 252.268C273.055 252.268 272.477 252.184 271.926 252.016C271.375 251.848 270.857 251.596 270.372 251.26L270.862 250.42C271.282 250.719 271.721 250.947 272.178 251.106C272.635 251.265 273.125 251.344 273.648 251.344C274.451 251.344 275.09 251.125 275.566 250.686C276.042 250.257 276.28 249.617 276.28 248.768V247.914C275.963 248.334 275.575 248.693 275.118 248.992C274.661 249.291 274.101 249.44 273.438 249.44C272.999 249.44 272.575 249.365 272.164 249.216C271.763 249.057 271.403 248.833 271.086 248.544C270.769 248.245 270.512 247.886 270.316 247.466C270.129 247.046 270.036 246.57 270.036 246.038C270.036 245.506 270.129 245.03 270.316 244.61C270.512 244.181 270.769 243.821 271.086 243.532C271.403 243.233 271.767 243.005 272.178 242.846C272.589 242.687 273.009 242.608 273.438 242.608C273.774 242.608 274.082 242.65 274.362 242.734C274.651 242.809 274.908 242.911 275.132 243.042C275.365 243.173 275.575 243.327 275.762 243.504C275.949 243.681 276.117 243.868 276.266 244.064V242.762H277.344V248.74ZM276.308 246.024C276.308 245.651 276.233 245.315 276.084 245.016C275.935 244.708 275.734 244.447 275.482 244.232C275.239 244.017 274.959 243.854 274.642 243.742C274.325 243.621 273.993 243.56 273.648 243.56C273.303 243.56 272.976 243.616 272.668 243.728C272.369 243.84 272.103 244.003 271.87 244.218C271.646 244.433 271.469 244.694 271.338 245.002C271.207 245.301 271.142 245.637 271.142 246.01C271.142 246.383 271.207 246.724 271.338 247.032C271.478 247.331 271.66 247.592 271.884 247.816C272.117 248.031 272.383 248.199 272.682 248.32C272.99 248.432 273.312 248.488 273.648 248.488C273.993 248.488 274.325 248.432 274.642 248.32C274.959 248.199 275.239 248.031 275.482 247.816C275.734 247.601 275.935 247.345 276.084 247.046C276.233 246.738 276.308 246.397 276.308 246.024ZM290.838 250H289.76V248.544C289.611 248.759 289.443 248.964 289.256 249.16C289.079 249.356 288.878 249.529 288.654 249.678C288.43 249.827 288.178 249.944 287.898 250.028C287.627 250.112 287.324 250.154 286.988 250.154C286.549 250.154 286.125 250.07 285.714 249.902C285.303 249.734 284.935 249.491 284.608 249.174C284.281 248.847 284.02 248.451 283.824 247.984C283.628 247.517 283.53 246.985 283.53 246.388C283.53 245.791 283.628 245.259 283.824 244.792C284.02 244.325 284.281 243.933 284.608 243.616C284.935 243.289 285.303 243.042 285.714 242.874C286.125 242.697 286.549 242.608 286.988 242.608C287.324 242.608 287.632 242.65 287.912 242.734C288.192 242.818 288.444 242.93 288.668 243.07C288.892 243.21 289.093 243.373 289.27 243.56C289.457 243.747 289.62 243.943 289.76 244.148V239.78H290.838V250ZM289.802 246.374C289.802 245.954 289.727 245.571 289.578 245.226C289.438 244.881 289.242 244.587 288.99 244.344C288.747 244.101 288.467 243.915 288.15 243.784C287.842 243.644 287.52 243.574 287.184 243.574C286.829 243.574 286.498 243.639 286.19 243.77C285.882 243.891 285.611 244.073 285.378 244.316C285.154 244.549 284.972 244.843 284.832 245.198C284.701 245.543 284.636 245.935 284.636 246.374C284.636 246.803 284.701 247.191 284.832 247.536C284.972 247.881 285.159 248.18 285.392 248.432C285.625 248.675 285.896 248.861 286.204 248.992C286.512 249.123 286.839 249.188 287.184 249.188C287.52 249.188 287.842 249.123 288.15 248.992C288.467 248.852 288.747 248.661 288.99 248.418C289.242 248.175 289.438 247.881 289.578 247.536C289.727 247.181 289.802 246.794 289.802 246.374ZM293.891 246.78C293.928 247.172 294.022 247.522 294.171 247.83C294.32 248.129 294.512 248.385 294.745 248.6C294.978 248.805 295.24 248.964 295.529 249.076C295.818 249.179 296.122 249.23 296.439 249.23C296.943 249.23 297.372 249.137 297.727 248.95C298.091 248.763 298.422 248.516 298.721 248.208L299.393 248.81C299.029 249.221 298.614 249.552 298.147 249.804C297.68 250.047 297.102 250.168 296.411 250.168C295.916 250.168 295.45 250.079 295.011 249.902C294.572 249.715 294.19 249.459 293.863 249.132C293.536 248.796 293.275 248.395 293.079 247.928C292.892 247.461 292.799 246.948 292.799 246.388C292.799 245.865 292.883 245.375 293.051 244.918C293.228 244.451 293.471 244.05 293.779 243.714C294.087 243.369 294.451 243.098 294.871 242.902C295.3 242.706 295.767 242.608 296.271 242.608C296.803 242.608 297.279 242.711 297.699 242.916C298.119 243.112 298.474 243.383 298.763 243.728C299.052 244.073 299.272 244.479 299.421 244.946C299.57 245.413 299.645 245.912 299.645 246.444C299.645 246.491 299.645 246.542 299.645 246.598C299.645 246.654 299.64 246.715 299.631 246.78H293.891ZM293.891 245.982H298.553C298.525 245.655 298.455 245.343 298.343 245.044C298.24 244.745 298.091 244.484 297.895 244.26C297.708 244.036 297.475 243.859 297.195 243.728C296.924 243.588 296.607 243.518 296.243 243.518C295.926 243.518 295.632 243.583 295.361 243.714C295.09 243.835 294.852 244.008 294.647 244.232C294.442 244.447 294.274 244.703 294.143 245.002C294.012 245.301 293.928 245.627 293.891 245.982ZM304.15 243.616C303.721 243.616 303.329 243.667 302.974 243.77C302.629 243.863 302.288 243.989 301.952 244.148L301.63 243.266C302.031 243.079 302.437 242.935 302.848 242.832C303.259 242.72 303.73 242.664 304.26 242.664C305.25 242.664 306.01 242.911 306.54 243.406C307.08 243.891 307.34 244.615 307.34 245.576V250H306.31V248.908C306.05 249.235 305.71 249.524 305.28 249.776C304.86 250.028 304.33 250.154 303.688 250.154C303.352 250.154 303.021 250.107 302.694 250.014C302.377 249.921 302.087 249.781 301.826 249.594C301.574 249.398 301.369 249.16 301.21 248.88C301.061 248.6 300.986 248.269 300.986 247.886C300.986 247.503 301.061 247.167 301.21 246.878C301.359 246.579 301.569 246.332 301.84 246.136C302.12 245.94 302.447 245.791 302.82 245.688C303.203 245.585 303.623 245.534 304.08 245.534C304.55 245.534 304.95 245.562 305.3 245.618C305.64 245.674 305.98 245.749 306.31 245.842V245.59C306.31 244.937 306.11 244.447 305.73 244.12C305.36 243.784 304.83 243.616 304.15 243.616ZM304.19 246.332C303.511 246.332 302.988 246.467 302.624 246.738C302.26 247.009 302.078 247.377 302.078 247.844C302.078 248.077 302.125 248.283 302.218 248.46C302.321 248.637 302.456 248.791 302.624 248.922C302.792 249.043 302.983 249.137 303.198 249.202C303.422 249.267 303.655 249.3 303.898 249.3C304.23 249.3 304.55 249.253 304.84 249.16C305.13 249.057 305.39 248.922 305.61 248.754C305.83 248.577 306 248.371 306.12 248.138C306.25 247.895 306.32 247.629 306.32 247.34V246.64C306.05 246.565 305.74 246.495 305.38 246.43C305.04 246.365 304.64 246.332 304.19 246.332ZM316.53 250H315.45V248.544C315.3 248.759 315.13 248.964 314.95 249.16C314.77 249.356 314.57 249.529 314.34 249.678C314.12 249.827 313.87 249.944 313.59 250.028C313.32 250.112 313.01 250.154 312.68 250.154C312.24 250.154 311.81 250.07 311.4 249.902C310.99 249.734 310.62 249.491 310.3 249.174C309.97 248.847 309.71 248.451 309.51 247.984C309.32 247.517 309.22 246.985 309.22 246.388C309.22 245.791 309.32 245.259 309.51 244.792C309.71 244.325 309.97 243.933 310.3 243.616C310.62 243.289 310.99 243.042 311.4 242.874C311.81 242.697 312.24 242.608 312.68 242.608C313.01 242.608 313.32 242.65 313.6 242.734C313.88 242.818 314.13 242.93 314.36 243.07C314.58 243.21 314.78 243.373 314.96 243.56C315.15 243.747 315.31 243.943 315.45 244.148V239.78H316.53V250ZM315.49 246.374C315.49 245.954 315.42 245.571 315.27 245.226C315.13 244.881 314.93 244.587 314.68 244.344C314.44 244.101 314.16 243.915 313.84 243.784C313.53 243.644 313.21 243.574 312.87 243.574C312.52 243.574 312.19 243.639 311.88 243.77C311.57 243.891 311.3 244.073 311.07 244.316C310.84 244.549 310.66 244.843 310.52 245.198C310.39 245.543 310.33 245.935 310.33 246.374C310.33 246.803 310.39 247.191 310.52 247.536C310.66 247.881 310.85 248.18 311.08 248.432C311.31 248.675 311.59 248.861 311.89 248.992C312.2 249.123 312.53 249.188 312.87 249.188C313.21 249.188 313.53 249.123 313.84 248.992C314.16 248.852 314.44 248.661 314.68 248.418C314.93 248.175 315.13 247.881 315.27 247.536C315.42 247.181 315.49 246.794 315.49 246.374ZM320.11 250H319.03V239.78H320.11V250ZM323.87 241.18H322.64V239.99H323.87V241.18ZM323.79 250H322.71V242.762H323.79V250ZM327.37 245.856V250H326.29V242.762H327.37V244.022C327.61 243.63 327.93 243.299 328.32 243.028C328.71 242.748 329.22 242.608 329.85 242.608C330.29 242.608 330.67 242.678 331.01 242.818C331.36 242.958 331.64 243.159 331.88 243.42C332.12 243.672 332.3 243.975 332.42 244.33C332.55 244.685 332.62 245.077 332.62 245.506V250H331.54V245.772C331.54 245.1 331.37 244.568 331.02 244.176C330.68 243.784 330.18 243.588 329.54 243.588C329.23 243.588 328.94 243.644 328.67 243.756C328.41 243.859 328.18 244.013 327.99 244.218C327.79 244.414 327.64 244.652 327.52 244.932C327.42 245.212 327.37 245.52 327.37 245.856ZM335.56 246.78C335.6 247.172 335.69 247.522 335.84 247.83C335.99 248.129 336.18 248.385 336.42 248.6C336.65 248.805 336.91 248.964 337.2 249.076C337.49 249.179 337.79 249.23 338.11 249.23C338.61 249.23 339.04 249.137 339.4 248.95C339.76 248.763 340.09 248.516 340.39 248.208L341.06 248.81C340.7 249.221 340.29 249.552 339.82 249.804C339.35 250.047 338.77 250.168 338.08 250.168C337.59 250.168 337.12 250.079 336.68 249.902C336.24 249.715 335.86 249.459 335.53 249.132C335.21 248.796 334.95 248.395 334.75 247.928C334.56 247.461 334.47 246.948 334.47 246.388C334.47 245.865 334.55 245.375 334.72 244.918C334.9 244.451 335.14 244.05 335.45 243.714C335.76 243.369 336.12 243.098 336.54 242.902C336.97 242.706 337.44 242.608 337.94 242.608C338.47 242.608 338.95 242.711 339.37 242.916C339.79 243.112 340.15 243.383 340.43 243.728C340.72 244.073 340.94 244.479 341.09 244.946C341.24 245.413 341.32 245.912 341.32 246.444C341.32 246.491 341.32 246.542 341.32 246.598C341.32 246.654 341.31 246.715 341.3 246.78H335.56ZM335.56 245.982H340.22C340.2 245.655 340.13 245.343 340.01 245.044C339.91 244.745 339.76 244.484 339.57 244.26C339.38 244.036 339.15 243.859 338.87 243.728C338.6 243.588 338.28 243.518 337.91 243.518C337.6 243.518 337.3 243.583 337.03 243.714C336.76 243.835 336.52 244.008 336.32 244.232C336.11 244.447 335.95 244.703 335.81 245.002C335.68 245.301 335.6 245.627 335.56 245.982Z"
        fill="#7E8A93"
      />
      <path
        d="M374.97 58.2077C375.49 58.608 375.49 59.3922 374.97 59.7925L368.61 64.6889C367.95 65.1951 367 64.7264 367 63.8965V54.1037C367 53.2738 367.95 52.8051 368.61 53.3113L374.97 58.2077Z"
        fill="#00FFD1"
      />
      <path
        opacity="0.3"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.4561 105.358C42.2361 79.746 70.6191 60.5127 70.6191 60.5127V60.5267C56.6311 71.7908 39.5311 88.4474 40.5961 89.3908C41.5441 90.2304 45.7011 86.5193 55.9231 77.3937C57.1861 76.2663 58.5411 75.0562 59.9941 73.762C73.2251 61.9911 91.3761 49.0797 91.3761 49.0797C91.3761 49.0797 67.0861 68.0877 53.5471 80.8442C40.0081 93.6007 34.1212 100.725 35.2282 101.739C36.2312 102.657 38.9832 100.028 44.7022 94.5633C45.2962 93.996 45.9221 93.3977 46.5811 92.77C48.9131 90.5492 50.7111 88.7198 52.8101 86.5844C57.0191 82.3026 62.4361 76.7902 75.7901 64.4269C95.8051 45.8835 113.564 34 113.564 34C113.564 34 93.8011 49.2909 75.1741 66.9895C55.6911 85.4906 46.9031 95.6282 47.8571 96.5293C48.8101 97.4305 57.4432 89.2922 68.5302 78.6477C79.6172 68.0173 96.2681 52.7687 96.2681 52.7687C96.2681 52.7687 89.5401 59.3581 73.5761 75.1559C57.6261 90.9537 73.8561 79.1124 80.3881 73.2128C86.9191 67.3133 103.584 53.0221 103.584 53.0221C103.584 53.0221 53.2671 108.61 31.7941 123.408C10.3221 138.192 -7.32488 130.969 17.4561 105.358ZM60.0241 108.779C55.2581 113.397 36.1401 124.14 31.1791 126.322L31.1651 126.337C25.4041 128.871 48.2081 123.112 57.7811 117.382C67.3681 111.651 64.7891 104.161 60.0241 108.779ZM9.70612 106.538C11.1071 101.878 23.9041 75.6185 26.3711 79.8848C28.0941 82.855 23.8061 88.0788 20.0741 92.6237C18.4641 94.5851 16.9581 96.4202 16.0831 97.8931L15.8461 98.2921C12.9301 103.204 8.43712 110.773 9.70612 106.552V106.538ZM2.45911 102.797C-0.903885 103.979 -0.0778914 119.608 0.665109 122.086C1.22911 123.976 1.68011 121.545 2.29511 118.235C2.62811 116.44 3.0091 114.387 3.4831 112.624C4.8281 107.612 5.82311 101.614 2.45911 102.797ZM58.5091 104.723C60.5551 104.118 72.3011 98.0775 72.2171 95.6417C72.1321 93.2058 67.9841 96.2894 64.6901 99.148C63.5241 100.159 62.1111 101.241 60.8771 102.186C58.6241 103.911 56.9691 105.178 58.5091 104.723ZM94.6292 72.9173C94.7552 74.1845 82.3791 84.1531 82.1261 83.6181H82.1401C81.9241 83.1835 82.6251 82.5895 84.1851 81.2676C84.8491 80.705 85.6691 80.0107 86.6391 79.1406C87.4781 78.387 88.3691 77.54 89.2401 76.7117C91.9671 74.1202 94.5012 71.7116 94.6292 72.9173ZM87.5361 58.656C87.5081 58.318 71.7261 72.2009 71.3471 73.2147C70.9971 74.1648 74.3761 71.0113 78.0111 67.6204C79.1701 66.539 80.3551 65.4331 81.4531 64.4288C82.7001 63.2912 83.7401 62.3596 84.5881 61.6009C86.6461 59.7584 87.5661 58.9352 87.5361 58.656ZM71.5161 101.064C71.4741 102.12 66.3161 104.218 65.4331 104.387C64.7681 104.513 65.4931 104.048 66.4901 103.409C67.0481 103.052 67.6901 102.64 68.2221 102.247C69.7081 101.148 71.5581 100.008 71.5161 101.064Z"
        fill="url(#paint2_linear_36_83)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M460.3 48.3243V48.3255C456.4 51.211 451.81 54.6063 448.69 57.0966C445.03 60.0083 442.03 62.7179 442.11 64.0846C442.16 65.4631 444.17 64.7976 448.65 60.9828C450.09 59.7578 451.81 58.2439 453.81 56.4935C459.04 51.8926 466.14 45.657 474.81 38.7354C487.88 28.3024 492.3 25.0125 500.92 18.5958C503.16 16.9285 505.68 15.05 508.72 12.7802C527.35 -1.18377 526.33 -4.10729 513.66 6.00621C510.43 8.58647 508.81 9.8739 507.61 10.8257C504.8 13.0523 504.3 13.4423 491.03 24.2485C477.14 35.5623 469.42 41.5401 463.89 45.664L463.87 45.6758C462.8 46.4684 461.59 47.3684 460.3 48.3243ZM480.29 37.9734C486.96 33.5881 501.57 24.045 507.08 20.5511V20.5629C510.17 18.602 513.7 16.653 509.82 19.3032C508.71 20.0673 506.15 21.8743 502.89 24.1728C495.1 29.6681 483.33 37.9725 477.83 41.5505C470.47 46.3161 473.97 42.1329 480.29 37.9734ZM430.67 63.3452C430.29 63.9879 429.83 64.7248 429.35 65.5134C427.79 68.0501 425.91 71.1222 424.84 73.3161C423.52 76.0138 422.69 78.9374 423.6 79.5316C424.56 80.1614 426.64 80.1852 431.53 78.0104C438.11 75.0869 492.66 44.164 503.81 36.6056C518.21 26.8368 508.9 31.8401 503.12 35.8332C499.46 38.3616 478.07 50.1603 462.66 58.6572C456.35 62.1413 451.04 65.071 448.37 66.5777C443.96 69.0734 433.38 74.7898 430.59 76.0733C428.74 76.9289 425.44 77.5469 425.31 75.7999C425.18 74.0886 427.17 70.3688 429.96 66.1499C431.4 63.9653 432.7 61.9641 433.81 60.2413C435.36 57.85 436.56 55.9949 437.33 54.9312C438.78 52.9346 437.66 52.1027 436.59 53.6477C435.78 54.8203 433.59 58.4951 431.7 61.6706C431.35 62.2603 431 62.833 430.68 63.369L430.67 63.3452ZM421.99 76.3502C421.06 78.7865 421.27 80.1769 422.46 80.9257C423.86 81.7987 428.02 80.4819 429.46 80.0246C429.83 79.9094 430.02 79.8486 429.95 79.8917C426.86 81.7813 424.11 82.8152 421.72 82.9816C420.32 83.0767 419.06 82.8747 419 81.3535C418.91 78.6676 421.46 74.0209 423.54 70.3368C425.38 67.0567 427.23 63.9787 427.39 63.9787C427.59 63.9787 427.14 64.9189 426.58 66.118C426.2 66.9141 425.78 67.8242 425.44 68.6492C425.05 69.631 424.55 70.6708 424.02 71.7809C423.35 73.1835 422.62 74.6983 421.99 76.3502ZM438.15 67.9244C439.2 67.2459 440.13 66.6415 440.73 66.2807L440.74 66.2688C441.47 65.8291 441.59 66.2807 440.99 66.8036C440.39 67.3027 434.58 72.104 431.86 73.9579C429.44 75.6098 426.25 76.8339 426.48 74.9562C426.7 73.0666 433.45 66.1975 436.46 63.4641C437.79 62.26 439.15 61.0147 440.61 59.6802L440.62 59.6795C442.92 57.5766 445.47 55.2522 448.5 52.5187C454.39 47.1946 462.11 41.5733 461.56 42.8925C460.91 44.4612 457.61 47.2183 450.97 52.2216C447.23 55.0435 443.92 58.0482 440.89 60.8036C439.62 61.9589 438.39 63.0702 437.21 64.1059C433.91 66.9951 431.13 69.9059 430.49 71.1906C430.72 70.889 431.01 70.5824 431.35 70.3003C433.3 68.6959 437.63 65.2613 439.31 64.0967C440.26 63.4431 440.54 63.7996 439.48 64.8692C438.62 65.737 435.24 69.0923 432.79 71.2347C433.16 71.044 433.56 70.8232 433.96 70.5828C435.23 69.8223 436.79 68.8102 438.15 67.9244ZM443.81 50.4397C449.95 42.8695 465.52 25.3877 475.82 14.3116C479.9 9.9393 475.23 15.567 468.84 23.2661C467.57 24.7957 466.24 26.407 464.89 28.0379C464.06 29.0455 463.18 30.1169 462.27 31.2246C464.96 28.9597 469.52 25.113 470.51 24.1887C471.98 22.7983 475.17 19.9104 471.48 23.5113C469.78 25.1829 467.01 27.7975 464.32 30.3362C462.13 32.4 460 34.4146 458.53 35.8306C457.5 37.1066 456.47 38.3813 455.47 39.6173V39.6185V39.6197V39.6211V39.623L455.46 39.6285C454.4 40.9442 453.37 42.2161 452.41 43.3991C457.92 38.5312 461.24 36.3728 459.29 38.3912C458.4 39.3167 456.32 41.3844 454.02 43.6713C450.42 47.2547 446.27 51.3765 445.3 52.4834L442.82 54.8828C441.02 57.0073 439.23 59.1031 438.04 60.375C436 62.5736 435.09 62.5854 435.47 61.7298C435.85 60.8503 438.42 57.0593 443.81 50.4397ZM445.3 52.4834L445.31 52.4741L445.3 52.4859V52.4834ZM430.97 67.1731C430.84 66.8522 431.63 65.4499 433.5 62.6333C435.52 59.5909 436.38 58.4144 436.03 59.1393C435.69 59.8524 433.77 63.2156 432.92 64.7131C432.09 66.1629 431.15 67.6128 430.97 67.185V67.1731ZM433.5 52.3542C436.69 44.9265 438.08 41.3969 437.95 40.9572V40.9691C437.77 40.3867 436.16 44.1778 434.73 47.8263C433.24 51.5817 429.89 60.079 429.27 61.8022C428.64 63.5373 430.07 60.3642 433.5 52.3542ZM439.88 75.5782C439.88 75.5782 458.74 69.3509 463.28 67.9604C467.82 66.57 468.04 68.3288 461.21 70.3135C454.39 72.2982 434.83 77.2539 439.88 75.5901V75.5782ZM456.17 60.0099C462.61 56.0049 489.13 39.0223 489.13 39.0223C496.24 34.4825 468.01 50.752 458.29 56.6585C448.57 62.565 449.72 64.003 456.17 60.0099Z"
        fill="url(#paint3_linear_36_83)"
      />
      <defs>
        <pattern
          id="pattern0_36_83"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image0_36_83"
            transform="matrix(0.0178571 0 0 0.0167411 0 -0.0189732)"
          />
        </pattern>
        <linearGradient
          id="paint0_linear_36_83"
          x1="369.507"
          y1="71"
          x2="369.507"
          y2="135"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0" />
          <stop offset="0.5" stopColor="#00FFD1" />
          <stop offset="1" stopColor="#00FFD1" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_36_83"
          x1="369.507"
          y1="158"
          x2="369.507"
          y2="222"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0" />
          <stop offset="0.5" stopColor="#00FFD1" />
          <stop offset="1" stopColor="#00FFD1" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_36_83"
          x1="113.563"
          y1="41.0974"
          x2="45.1052"
          y2="154.33"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0.2" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_36_83"
          x1="522.39"
          y1="8.50473e-07"
          x2="421.38"
          y2="80.812"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <clipPath id="clip0_36_83">
          <rect
            width="1"
            height="64"
            fill="white"
            transform="translate(370 71)"
          />
        </clipPath>
        <clipPath id="clip1_36_83">
          <rect
            width="1"
            height="64"
            fill="white"
            transform="translate(370 158)"
          />
        </clipPath>
        <image
          id="image0_36_83"
          width="56"
          height="62"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
}

export function CountdownLeftMobileBg(props: any) {
  return (
    <svg
      width="321"
      height="178"
      viewBox="0 0 321 178"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <g clipPath="url(#clip0_36_159)">
        <path d="M12.5 25L12.5 68" stroke="url(#paint0_linear_36_159)" />
      </g>
      <g clipPath="url(#clip1_36_159)">
        <path d="M12.5 92L12.5 135" stroke="url(#paint1_linear_36_159)" />
      </g>
      <path d="M13 24.5V68.5" stroke="url(#paint2_linear_36_159)" />
      <path
        d="M12.5 92C18.8513 92 24 86.8513 24 80.5C24 74.1487 18.8513 69 12.5 69C6.14873 69 1 74.1487 1 80.5C1 86.8513 6.14873 92 12.5 92Z"
        fill="#16453C"
        stroke="#00FFD1"
      />
      <path d="M20 72.5H5V88.5H20V72.5Z" fill="url(#pattern0_36_159)" />
      <path
        d="M12.5 159C18.8513 159 24 153.851 24 147.5C24 141.149 18.8513 136 12.5 136C6.14873 136 1 141.149 1 147.5C1 153.851 6.14873 159 12.5 159Z"
        fill="#16453C"
        stroke="#00FFD1"
      />
      <path
        d="M17.6062 142.819C17.5064 142.543 17.0221 141.935 15.8827 141.713C14.7434 141.491 13.7351 142.124 13.3733 142.468C13.2816 142.402 13.1442 142.323 12.9679 142.249C12.2923 141.735 10.7339 140.649 9.9052 140.409C8.8692 140.108 9.4482 140.59 9.6139 141.492C9.7464 142.213 9.6897 142.438 9.6448 142.461C9.515 142.528 9.3853 142.603 9.2562 142.686C8.7403 142.568 7.5326 142.335 6.8285 142.347C5.9485 142.362 6.0619 142.445 6.2641 142.745C6.4259 142.985 7.0393 144.088 7.3257 144.61C7.2783 144.679 7.2314 144.75 7.1853 144.822C6.9974 144.778 6.3801 144.764 5.4143 145.059C4.207 145.428 4.0821 145.549 4.2593 145.713C4.4011 145.844 5.4332 146.674 5.9315 147.073C5.529 147.196 4.6191 147.51 4.1985 147.784C3.6728 148.125 3.6254 148.134 3.7939 148.25C3.9286 148.343 5.2082 148.857 5.8312 149.102C5.5558 149.414 5.0527 150.03 4.6654 150.591C4.1718 151.307 4.1795 151.416 4.6239 151.433C4.9794 151.446 6.151 151.292 6.6924 151.213C7.1126 151.695 7.6309 152.048 8.12 152.31C9.8038 153.215 15.2907 152.855 17.7288 151.759C19.1926 151.1 19.9395 150.089 20.2422 149.69C20.5855 149.513 21.146 149.004 20.6409 148.391C20.8994 148.196 21.1354 147.986 21.0107 147.735C20.886 147.483 20.7025 147.481 20.6176 147.464C20.6563 147.407 20.9204 146.976 20.4781 146.704C19.9253 146.365 19.0578 146.181 18.988 145.801C18.972 145.714 18.9653 145.636 18.9591 145.565C18.9624 145.527 18.958 145.493 18.9487 145.465C18.9254 145.29 18.8687 145.184 18.5726 145.142C18.6714 144.879 18.6823 144.582 18.5493 144.215C18.3897 143.773 18.0894 143.58 17.9267 143.495C18.0777 143.517 18.423 143.581 18.5957 143.667C18.6599 143.393 18.5519 142.841 17.6062 142.819Z"
        fill="#009400"
      />
      <path
        d="M17.6062 142.819C17.5064 142.543 17.0221 141.935 15.8827 141.713C14.7434 141.491 13.7351 142.124 13.3733 142.468M17.6062 142.819C18.5519 142.841 18.6599 143.393 18.5957 143.667C18.423 143.581 18.0777 143.517 17.9267 143.495M17.6062 142.819C17.1273 142.792 16.0188 142.934 15.4163 143.711C14.8138 144.489 14.7703 145.089 14.8239 145.292M13.3733 142.468C14.2997 143.24 14.5495 143.887 14.5585 144.114M13.3733 142.468C13.2816 142.402 13.1442 142.323 12.9679 142.249M17.9267 143.495C18.0894 143.58 18.3897 143.773 18.5493 144.215C18.6823 144.582 18.6714 144.879 18.5726 145.142M17.9267 143.495C17.8173 143.434 17.376 143.381 16.4861 143.662C15.5962 143.943 15.246 144.92 15.1821 145.373C15.8763 145.147 16.8222 145.758 16.8871 145.844C16.952 145.93 16.8745 146.043 17.6249 145.856C18.2251 145.706 18.5068 145.318 18.5726 145.142M12.9679 142.249C12.4553 142.032 11.6135 141.851 10.6072 142.094C10.2909 142.171 9.9675 142.293 9.6448 142.461M12.9679 142.249C12.2923 141.735 10.7339 140.649 9.9052 140.409C8.8692 140.108 9.4482 140.59 9.6139 141.492C9.7464 142.213 9.6897 142.438 9.6448 142.461M18.5726 145.142C18.8687 145.184 18.9254 145.29 18.9487 145.465M18.9487 145.465C18.961 145.558 18.9639 145.67 18.988 145.801C19.0578 146.181 19.9253 146.365 20.4781 146.704C20.9204 146.976 20.6563 147.407 20.6176 147.464C20.7025 147.481 20.886 147.483 21.0107 147.735C21.1354 147.986 20.8994 148.196 20.6409 148.391C21.146 149.004 20.5855 149.513 20.2422 149.69C19.9395 150.089 19.1926 151.1 17.7288 151.759C15.2907 152.855 9.8038 153.215 8.12 152.31C7.6309 152.048 7.1126 151.695 6.6924 151.213M18.9487 145.465C19.005 145.635 18.8823 146.027 17.9405 146.239M14.5818 145.042C14.393 144.815 13.7162 144.334 12.8333 144.333C11.5088 144.331 10.9183 144.587 10.4787 144.864C10.0225 145.151 9.441 145.888 8.9879 145.825C8.6028 145.77 9.6218 146.339 10.599 146.853C11.359 147.252 12.2865 147.229 13.5151 146.709C14.7436 146.189 14.6913 145.904 14.5413 146.422C14.4213 146.837 13.9718 147.148 13.762 147.252M9.6448 142.461C9.515 142.528 9.3853 142.603 9.2562 142.686M9.2562 142.686C8.7403 142.568 7.5326 142.335 6.8285 142.347C5.9485 142.362 6.0619 142.445 6.2641 142.745C6.4259 142.985 7.0393 144.088 7.3257 144.61M9.2562 142.686C8.5711 143.122 7.9029 143.765 7.3257 144.61M7.3257 144.61C7.2783 144.679 7.2314 144.75 7.1853 144.822M7.1853 144.822C6.9974 144.778 6.3801 144.764 5.4143 145.059C4.207 145.428 4.0821 145.549 4.2593 145.713C4.4011 145.844 5.4332 146.674 5.9315 147.073M7.1853 144.822C6.7806 145.455 6.4262 146.192 6.15 147.033M5.9315 147.073L6.15 147.033M5.9315 147.073C5.529 147.196 4.6191 147.51 4.1985 147.784C3.6728 148.125 3.6254 148.134 3.7939 148.25C3.9286 148.343 5.2082 148.857 5.8312 149.102M6.15 147.033C6.133 147.084 6.1163 147.136 6.0999 147.189C5.8733 147.915 5.797 148.548 5.8312 149.102M5.8312 149.102C5.5558 149.414 5.0527 150.03 4.6654 150.591C4.1718 151.307 4.1795 151.416 4.6239 151.433C4.9794 151.446 6.151 151.292 6.6924 151.213M5.8312 149.102C5.8863 149.997 6.23 150.683 6.6924 151.213"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M18.5576 144.259C18.6906 144.627 18.6796 144.923 18.5809 145.187C18.5151 145.362 18.2334 145.751 17.6331 145.9C16.8828 146.087 16.9602 145.975 16.8954 145.889C16.8305 145.803 15.8845 145.192 15.1904 145.418C15.2542 144.964 15.6044 143.988 16.4943 143.707C17.3843 143.425 17.8256 143.478 17.935 143.54C18.0976 143.625 18.398 143.818 18.5576 144.259Z"
        fill="white"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M20.2425 149.69C20.5859 149.512 21.1463 149.004 20.6413 148.391C20.8998 148.196 21.1358 147.986 21.0111 147.734C20.8863 147.482 20.7028 147.48 20.618 147.463C20.1555 147.793 18.5086 148.527 15.6204 148.823C12.0102 149.192 10.6508 149 9.68853 148.834C9.43603 148.79 9.28103 148.8 9.19903 148.839C8.96813 148.95 9.31383 149.298 9.68953 149.373C9.99003 149.941 11.6337 150.88 14.8993 150.77C17.5118 150.682 19.55 150.013 20.2425 149.69Z"
        fill="#AC5228"
      />
      <path
        d="M20.6412 148.391C21.1462 149.004 20.5858 149.512 20.2424 149.69C19.5499 150.013 17.5117 150.682 14.8992 150.77C11.6336 150.88 9.98993 149.941 9.68943 149.373M20.6412 148.391C20.8997 148.196 21.1357 147.986 21.011 147.734C20.8862 147.482 20.7027 147.48 20.6179 147.463C20.1554 147.793 18.5085 148.527 15.6203 148.823C12.0101 149.192 10.6507 149 9.68843 148.834C9.43593 148.79 9.28093 148.8 9.19893 148.839M20.6412 148.391C20.3511 148.591 19.0066 149.103 15.9496 149.547C12.1283 150.102 10.1986 149.476 9.68943 149.373M9.68943 149.373C9.31373 149.298 8.96803 148.95 9.19893 148.839M9.19893 148.839C9.11613 148.834 8.95613 148.959 8.97783 149.504"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M10.4835 144.892C10.923 144.615 11.5136 144.36 12.838 144.361C13.1372 144.388 13.7335 144.481 14.0125 144.881C14.3456 145.36 14.2991 145.908 14.0668 146.244C13.8809 146.514 13.7009 146.655 13.5198 146.737C13.5198 146.737 11.7569 147.552 10.6037 146.881C9.62649 146.367 8.60749 145.799 8.99259 145.853C9.44569 145.917 10.0273 145.18 10.4835 144.892Z"
        fill="white"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M11.0214 144.615C11.7288 144.485 12.3593 144.957 12.4989 145.717C12.5981 146.257 12.3942 146.778 12.0138 147.08C11.1988 147.182 10.8793 147.044 10.0543 146.559C10.0103 146.457 9.95821 146.302 9.93721 146.188C9.79751 145.428 10.314 144.745 11.0214 144.615Z"
        fill="black"
      />
      <path
        d="M11.3245 145.424C11.0649 145.301 10.9208 145.062 11.0026 144.889C11.0844 144.716 11.3612 144.676 11.6208 144.798C11.8804 144.921 12.0245 145.161 11.9427 145.334C11.8609 145.507 11.5841 145.547 11.3245 145.424Z"
        fill="white"
      />
      <path
        d="M11.0211 146.554C10.9479 146.492 10.933 146.39 10.9879 146.325C11.0428 146.26 11.1467 146.258 11.2199 146.32C11.2932 146.382 11.308 146.485 11.2531 146.549C11.1982 146.614 11.0944 146.617 11.0211 146.554Z"
        fill="#038203"
      />
      <path
        d="M16.5361 143.661C17.0337 143.698 17.4565 144.165 17.5119 144.771C17.5572 145.266 17.3445 145.714 17.0022 145.931C16.9024 145.921 16.8038 145.652 16.2297 145.463C15.8668 145.344 15.6698 145.318 15.5733 145.311C15.5331 145.2 15.506 145.081 15.4945 144.956C15.4732 144.722 15.5093 144.499 15.5893 144.306C15.8477 143.944 16.3282 143.726 16.5361 143.661Z"
        fill="black"
      />
      <path
        d="M16.4457 144.448C16.2219 144.342 16.0976 144.135 16.1682 143.986C16.2387 143.837 16.4773 143.802 16.7012 143.908C16.925 144.014 17.0493 144.221 16.9787 144.37C16.9082 144.519 16.6695 144.554 16.4457 144.448Z"
        fill="white"
      />
      <path
        d="M16.4424 145.137C16.447 145.085 16.4829 145.045 16.5226 145.048C16.5623 145.052 16.5908 145.097 16.5863 145.149C16.5818 145.202 16.5459 145.241 16.5062 145.238C16.4665 145.234 16.4379 145.189 16.4424 145.137Z"
        fill="#038203"
      />
      <path
        d="M10.3297 148.325C9.94979 148.215 9.07129 148.095 8.59569 148.496C8.12019 148.898 8.19759 149.354 8.29569 149.532M13.3648 147.228C13.0834 147.476 12.2919 147.955 11.3772 147.887C10.4625 147.82 10.2164 147.708 10.2076 147.661M9.39909 146.73C9.55759 146.881 10.0291 147.223 10.6472 147.384M14.3734 144.443C14.2307 144.29 13.8435 143.962 13.4361 143.88M13.1989 143.923C12.8823 143.802 11.9904 143.645 10.9557 143.992C9.92099 144.339 9.39569 144.933 9.26249 145.186M16.7433 142.929C16.3954 142.993 15.5653 143.243 15.0278 143.734M17.7941 146.512C17.4904 146.371 16.7509 146.066 16.2227 145.967"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M16.7209 147.573C16.5615 147.584 16.4263 147.506 16.4191 147.4C16.4118 147.294 16.5352 147.199 16.6947 147.188C16.8541 147.177 16.9893 147.254 16.9965 147.36C17.0038 147.467 16.8804 147.562 16.7209 147.573Z"
        fill="black"
      />
      <path
        d="M18.9789 147.067C18.8507 147.095 18.7313 147.049 18.7121 146.964C18.6929 146.878 18.7813 146.786 18.9095 146.757C19.0377 146.728 19.1571 146.774 19.1763 146.86C19.1955 146.945 19.1071 147.038 18.9789 147.067Z"
        fill="black"
      />
      <path
        d="M8 140.5L8.7969 143.589L11.5 144.5L8.7969 145.411L8 148.5L7.2031 145.411L4.5 144.5L7.2031 143.589L8 140.5Z"
        fill="#00FFD1"
      />
      <path
        d="M12.5 24C18.8513 24 24 18.8513 24 12.5C24 6.14873 18.8513 1 12.5 1C6.14873 1 1 6.14873 1 12.5C1 18.8513 6.14873 24 12.5 24Z"
        fill="#16453C"
        stroke="#00FFD1"
      />
      <path
        d="M17.4706 11.7081C17.9906 12.1081 17.9906 12.8921 17.4706 13.2921L11.11 18.1891C10.4524 18.6951 9.5 18.2261 9.5 17.3961V7.60407C9.5 6.77407 10.4524 6.30507 11.11 6.81107L17.4706 11.7081Z"
        fill="#00FFD1"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M248.565 69.91C267.113 50.74 288.356 36.344 288.356 36.344V36.355C277.887 44.786 265.088 57.253 265.885 57.959C266.595 58.587 269.706 55.81 277.357 48.979L277.363 48.974C278.307 48.131 279.319 47.228 280.404 46.261C290.308 37.451 303.893 27.787 303.893 27.787C303.893 27.787 285.713 42.014 275.579 51.562C265.445 61.11 261.039 66.442 261.867 67.201C262.618 67.889 264.678 65.921 268.958 61.83C269.403 61.406 269.871 60.958 270.365 60.488C272.11 58.826 273.456 57.456 275.027 55.858C278.177 52.653 282.232 48.528 292.227 39.274C307.208 25.395 320.5 16.5 320.5 16.5C320.5 16.5 305.708 27.945 291.766 41.192C277.184 55.04 270.606 62.627 271.319 63.302C272.033 63.976 278.495 57.885 286.793 49.918C295.091 41.961 307.554 30.548 307.554 30.548C307.554 30.548 302.519 35.48 290.57 47.304C278.631 59.129 290.78 50.266 295.668 45.85C300.557 41.434 313.03 30.738 313.03 30.738C313.03 30.738 275.369 72.344 259.297 83.42C243.225 94.486 230.018 89.079 248.565 69.91ZM280.427 72.471C276.86 75.928 262.55 83.968 258.837 85.602L258.826 85.613C254.515 87.509 271.583 83.199 278.748 78.91C285.924 74.621 283.993 69.014 280.427 72.471ZM242.765 70.793C243.814 67.305 253.392 47.651 255.238 50.844C256.528 53.067 253.318 56.977 250.525 60.379C249.32 61.847 248.193 63.22 247.538 64.323L247.361 64.621C245.178 68.298 241.815 73.963 242.765 70.804V70.793ZM237.341 67.994C234.823 68.879 235.442 80.577 235.998 82.431C236.42 83.846 236.758 82.026 237.218 79.549C237.467 78.205 237.752 76.669 238.107 75.349C239.114 71.598 239.859 67.108 237.341 67.994ZM279.293 69.435C280.824 68.982 289.615 64.461 289.552 62.638C289.489 60.814 286.384 63.122 283.919 65.262C283.046 66.019 281.989 66.829 281.065 67.536C279.379 68.827 278.14 69.775 279.293 69.435ZM306.327 45.629C306.422 46.577 297.158 54.039 296.97 53.638H296.98C296.818 53.313 297.343 52.868 298.511 51.879C299.008 51.458 299.621 50.938 300.348 50.287C300.975 49.723 301.642 49.089 302.294 48.469C304.335 46.529 306.232 44.727 306.327 45.629ZM301.019 34.955C300.998 34.702 289.185 45.093 288.902 45.852C288.64 46.563 291.169 44.203 293.889 41.665C294.757 40.856 295.644 40.027 296.466 39.276C297.399 38.424 298.178 37.727 298.812 37.159C300.353 35.78 301.041 35.164 301.019 34.955ZM289.028 66.696C288.997 67.487 285.136 69.057 284.475 69.183C283.977 69.278 284.52 68.93 285.266 68.451C285.683 68.184 286.164 67.876 286.563 67.581C287.675 66.759 289.059 65.906 289.028 66.696Z"
        fill="url(#paint3_linear_36_159)"
        fillOpacity="0.5"
      />
      <path
        d="M35.3 19.4999V5.49991H37.5801L45.0801 15.1799V5.49991H47.5V19.4999H45.44L37.7201 9.5399V19.4999H35.3ZM55.8408 19.7399C52.6208 19.7399 50.2408 17.2799 50.2408 14.2799V14.2399C50.2408 11.2199 52.6408 8.71991 55.8808 8.71991C59.1208 8.71991 61.5009 11.1799 61.5009 14.1999V14.2399C61.5009 17.2399 59.1008 19.7399 55.8408 19.7399ZM55.8808 17.6399C57.8408 17.6399 59.0809 16.0999 59.0809 14.2799V14.2399C59.0809 12.3799 57.7408 10.8399 55.8408 10.8399C53.9008 10.8399 52.6608 12.3599 52.6608 14.1999V14.2399C52.6608 16.0799 54.0008 17.6399 55.8808 17.6399ZM66.6998 19.5799L62.3599 8.93991H64.9599L67.7998 16.6999L70.6598 8.93991H73.1998L68.8798 19.5799H66.6998ZM73.3953 19.4999V16.7599H76.0552V19.4999H73.3953ZM86.962 19.4999V7.8999L84.4423 8.59991L83.9224 6.59991L87.682 5.3999H89.4021V19.4999H86.962ZM96.472 19.6999C94.972 19.6999 93.312 19.1599 91.992 18.1199L93.072 16.4799C94.212 17.3399 95.452 17.7799 96.532 17.7799C97.572 17.7799 98.172 17.3399 98.172 16.6399V16.5999C98.172 15.7799 97.052 15.4999 95.812 15.1199C94.252 14.6799 92.5121 14.0399 92.5121 12.0199V11.9799C92.5121 9.9799 94.1721 8.7599 96.2721 8.7599C97.5921 8.7599 99.0321 9.21992 100.152 9.95992L99.1921 11.6799C98.1721 11.0599 97.092 10.6799 96.212 10.6799C95.272 10.6799 94.7321 11.1199 94.7321 11.7399V11.7799C94.7321 12.5399 95.872 12.8599 97.112 13.2599C98.652 13.7399 100.392 14.4399 100.392 16.3399V16.3799C100.392 18.5999 98.672 19.6999 96.472 19.6999ZM106.197 19.6799C104.417 19.6799 103.157 18.8999 103.157 16.5799V11.0199H101.817V8.93991H103.157V6.0399H105.577V8.93991H108.417V11.0199H105.577V16.1999C105.577 17.1399 106.057 17.5199 106.877 17.5199C107.417 17.5199 107.897 17.3999 108.377 17.1599V19.1399C107.777 19.4799 107.097 19.6799 106.197 19.6799Z"
        fill="white"
      />
      <path
        d="M35.3 86.4999V72.4999H37.5801L45.0801 82.1799V72.4999H47.5V86.4999H45.44L37.7201 76.5399V86.4999H35.3ZM55.8408 86.7399C52.6208 86.7399 50.2408 84.2799 50.2408 81.2799V81.2399C50.2408 78.2199 52.6408 75.7199 55.8808 75.7199C59.1208 75.7199 61.5009 78.1799 61.5009 81.1999V81.2399C61.5009 84.2399 59.1008 86.7399 55.8408 86.7399ZM55.8808 84.6399C57.8408 84.6399 59.0809 83.0999 59.0809 81.2799V81.2399C59.0809 79.3799 57.7408 77.8399 55.8408 77.8399C53.9008 77.8399 52.6608 79.3599 52.6608 81.1999V81.2399C52.6608 83.0799 54.0008 84.6399 55.8808 84.6399ZM66.6998 86.5799L62.3599 75.9399H64.9599L67.7998 83.6999L70.6598 75.9399H73.1998L68.8798 86.5799H66.6998ZM73.3953 86.4999V83.7599H76.0552V86.4999H73.3953ZM91.642 86.4999V83.3599H84.5821L84.1223 81.5999L91.9021 72.3999H94.002V81.3399H96.002V83.3599H94.002V86.4999H91.642ZM87.042 81.3399H91.642V75.7999L87.042 81.3399ZM102.076 86.6799C100.296 86.6799 99.0361 85.8999 99.0361 83.5799V78.0199H97.696V75.9399H99.0361V73.0399H101.456V75.9399H104.296V78.0199H101.456V83.1999C101.456 84.1399 101.936 84.5199 102.756 84.5199C103.296 84.5199 103.776 84.3999 104.256 84.1599V86.1399C103.656 86.4799 102.976 86.6799 102.076 86.6799ZM106.739 86.4999V71.8999H109.159V77.5799C109.839 76.5799 110.819 75.7199 112.459 75.7199C114.839 75.7199 116.219 77.3199 116.219 79.7799V86.4999H113.799V80.4999C113.799 78.8599 112.979 77.9199 111.539 77.9199C110.139 77.9199 109.159 78.8999 109.159 80.5399V86.4999H106.739Z"
        fill="white"
      />
      <path
        d="M38.3881 39.239L41.6381 31.4H42.7431L38.8301 40.565H37.9201L34.0071 31.4H35.1511L38.3881 39.239ZM50.045 37.133C50.045 37.61 49.954 38.065 49.772 38.498C49.5987 38.923 49.356 39.295 49.044 39.616C48.732 39.937 48.3594 40.192 47.926 40.383C47.4927 40.565 47.0247 40.656 46.522 40.656C46.0194 40.656 45.5557 40.565 45.131 40.383C44.7064 40.192 44.338 39.941 44.026 39.629C43.714 39.308 43.4714 38.936 43.298 38.511C43.1247 38.086 43.038 37.636 43.038 37.159C43.038 36.682 43.1247 36.232 43.298 35.807C43.4714 35.374 43.714 34.997 44.026 34.676C44.338 34.355 44.7064 34.104 45.131 33.922C45.5644 33.731 46.0367 33.636 46.548 33.636C47.0507 33.636 47.5144 33.731 47.939 33.922C48.3724 34.104 48.745 34.355 49.057 34.676C49.369 34.988 49.6117 35.356 49.785 35.781C49.9584 36.206 50.045 36.656 50.045 37.133ZM49.018 37.159C49.018 36.795 48.953 36.453 48.823 36.132C48.7017 35.811 48.5284 35.534 48.303 35.3C48.0777 35.057 47.8134 34.867 47.51 34.728C47.2067 34.589 46.8774 34.52 46.522 34.52C46.158 34.52 45.8244 34.589 45.521 34.728C45.2177 34.858 44.9577 35.044 44.741 35.287C44.533 35.521 44.3684 35.798 44.247 36.119C44.1257 36.431 44.065 36.769 44.065 37.133C44.065 37.497 44.1257 37.839 44.247 38.16C44.377 38.481 44.5504 38.758 44.767 38.992C44.9924 39.226 45.2567 39.412 45.56 39.551C45.8634 39.69 46.1927 39.759 46.548 39.759C46.912 39.759 47.2457 39.694 47.549 39.564C47.8524 39.425 48.1124 39.239 48.329 39.005C48.5457 38.771 48.7147 38.498 48.836 38.186C48.9574 37.865 49.018 37.523 49.018 37.159ZM53.2103 34.663V38.589C53.2103 39.005 53.3143 39.295 53.5223 39.46C53.7303 39.625 54.0033 39.707 54.3413 39.707C54.5147 39.707 54.675 39.69 54.8223 39.655C54.9783 39.62 55.143 39.56 55.3163 39.473V40.331C55.143 40.426 54.9567 40.496 54.7573 40.539C54.5667 40.591 54.35 40.617 54.1073 40.617C53.8387 40.617 53.5873 40.582 53.3533 40.513C53.1193 40.444 52.9157 40.335 52.7423 40.188C52.5777 40.032 52.4477 39.833 52.3523 39.59C52.257 39.347 52.2093 39.057 52.2093 38.719V34.663H51.2733V33.779H52.2093V31.751H53.2103V33.779H55.3423V34.663H53.2103ZM58.2842 32.31H57.1402V31.205H58.2842V32.31ZM58.2062 40.5H57.2052V33.779H58.2062V40.5ZM61.5302 36.652V40.5H60.5292V33.779H61.5302V34.949C61.7556 34.585 62.0502 34.277 62.4142 34.026C62.7782 33.766 63.2506 33.636 63.8312 33.636C64.2386 33.636 64.5982 33.701 64.9102 33.831C65.2309 33.961 65.4996 34.147 65.7162 34.39C65.9416 34.624 66.1106 34.906 66.2232 35.235C66.3446 35.564 66.4052 35.928 66.4052 36.327V40.5H65.4042V36.574C65.4042 35.95 65.2439 35.456 64.9232 35.092C64.6026 34.728 64.1432 34.546 63.5452 34.546C63.2592 34.546 62.9906 34.598 62.7392 34.702C62.4966 34.797 62.2842 34.94 62.1022 35.131C61.9202 35.313 61.7772 35.534 61.6732 35.794C61.5779 36.054 61.5302 36.34 61.5302 36.652ZM74.936 39.33C74.936 39.876 74.8536 40.353 74.689 40.76C74.533 41.167 74.3033 41.505 74 41.774C73.7053 42.051 73.3456 42.259 72.921 42.398C72.505 42.537 72.037 42.606 71.517 42.606C70.9536 42.606 70.4163 42.528 69.905 42.372C69.3936 42.216 68.9126 41.982 68.462 41.67L68.917 40.89C69.307 41.167 69.7143 41.38 70.139 41.527C70.5636 41.674 71.0186 41.748 71.504 41.748C72.2493 41.748 72.843 41.544 73.285 41.137C73.727 40.738 73.948 40.145 73.948 39.356V38.563C73.6533 38.953 73.2936 39.287 72.869 39.564C72.4443 39.841 71.9243 39.98 71.309 39.98C70.9016 39.98 70.5073 39.911 70.126 39.772C69.7533 39.625 69.4196 39.417 69.125 39.148C68.8303 38.871 68.592 38.537 68.41 38.147C68.2366 37.757 68.15 37.315 68.15 36.821C68.15 36.327 68.2366 35.885 68.41 35.495C68.592 35.096 68.8303 34.763 69.125 34.494C69.4196 34.217 69.7576 34.004 70.139 33.857C70.5203 33.71 70.9103 33.636 71.309 33.636C71.621 33.636 71.907 33.675 72.167 33.753C72.4356 33.822 72.674 33.918 72.882 34.039C73.0986 34.16 73.2936 34.303 73.467 34.468C73.6403 34.633 73.7963 34.806 73.935 34.988V33.779H74.936V39.33ZM73.974 36.808C73.974 36.461 73.9046 36.149 73.766 35.872C73.6273 35.586 73.441 35.343 73.207 35.144C72.9816 34.945 72.7216 34.793 72.427 34.689C72.1323 34.576 71.8246 34.52 71.504 34.52C71.1833 34.52 70.88 34.572 70.594 34.676C70.3166 34.78 70.0696 34.932 69.853 35.131C69.645 35.33 69.4803 35.573 69.359 35.859C69.2376 36.136 69.177 36.448 69.177 36.795C69.177 37.142 69.2376 37.458 69.359 37.744C69.489 38.021 69.658 38.264 69.866 38.472C70.0826 38.671 70.3296 38.827 70.607 38.94C70.893 39.044 71.192 39.096 71.504 39.096C71.8246 39.096 72.1323 39.044 72.427 38.94C72.7216 38.827 72.9816 38.671 73.207 38.472C73.441 38.273 73.6273 38.034 73.766 37.757C73.9046 37.471 73.974 37.155 73.974 36.808ZM87.8561 37.133C87.8561 37.688 87.7651 38.182 87.5831 38.615C87.4011 39.048 87.1581 39.417 86.8551 39.72C86.5601 40.015 86.2181 40.244 85.8281 40.409C85.4471 40.565 85.0521 40.643 84.6451 40.643C84.3332 40.643 84.0472 40.604 83.7872 40.526C83.5272 40.448 83.2932 40.344 83.0852 40.214C82.8772 40.084 82.6866 39.932 82.5132 39.759C82.3486 39.586 82.2012 39.404 82.0712 39.213V40.5H81.0702V31.01H82.0712V35.131C82.2099 34.932 82.3616 34.741 82.5262 34.559C82.6996 34.377 82.8902 34.221 83.0982 34.091C83.3062 33.952 83.5359 33.844 83.7872 33.766C84.0472 33.679 84.3332 33.636 84.6451 33.636C85.0441 33.636 85.4341 33.714 85.8151 33.87C86.2051 34.026 86.5521 34.256 86.8551 34.559C87.1581 34.854 87.4011 35.218 87.5831 35.651C87.7651 36.084 87.8561 36.578 87.8561 37.133ZM86.8291 37.146C86.8291 36.747 86.7641 36.388 86.6341 36.067C86.5131 35.746 86.3441 35.473 86.1271 35.248C85.9101 35.014 85.6591 34.836 85.3731 34.715C85.0871 34.594 84.7841 34.533 84.4632 34.533C84.1512 34.533 83.8479 34.598 83.5532 34.728C83.2672 34.849 83.0072 35.023 82.7732 35.248C82.5479 35.473 82.3659 35.746 82.2272 36.067C82.0972 36.388 82.0322 36.743 82.0322 37.133C82.0322 37.523 82.0972 37.883 82.2272 38.212C82.3659 38.533 82.5479 38.806 82.7732 39.031C83.0072 39.256 83.2672 39.434 83.5532 39.564C83.8479 39.685 84.1512 39.746 84.4632 39.746C84.7841 39.746 85.0871 39.69 85.3731 39.577C85.6681 39.456 85.9191 39.287 86.1271 39.07C86.3441 38.845 86.5131 38.572 86.6341 38.251C86.7641 37.922 86.8291 37.553 86.8291 37.146ZM90.3011 37.51C90.3361 37.874 90.4221 38.199 90.5611 38.485C90.7001 38.762 90.8771 39.001 91.0941 39.2C91.3111 39.391 91.5531 39.538 91.8221 39.642C92.0911 39.737 92.3721 39.785 92.6671 39.785C93.1351 39.785 93.5341 39.698 93.8631 39.525C94.2011 39.352 94.5091 39.122 94.7861 38.836L95.4101 39.395C95.0721 39.776 94.6861 40.084 94.2531 40.318C93.8201 40.543 93.2821 40.656 92.6411 40.656C92.1821 40.656 91.7481 40.574 91.3411 40.409C90.9341 40.236 90.5781 39.997 90.2751 39.694C89.9721 39.382 89.7291 39.009 89.5471 38.576C89.3741 38.143 89.2871 37.666 89.2871 37.146C89.2871 36.661 89.3651 36.206 89.5211 35.781C89.6861 35.348 89.9111 34.975 90.1971 34.663C90.4831 34.342 90.8211 34.091 91.2111 33.909C91.6101 33.727 92.0431 33.636 92.5111 33.636C93.0051 33.636 93.4471 33.731 93.8371 33.922C94.2271 34.104 94.5561 34.355 94.8251 34.676C95.0941 34.997 95.2971 35.374 95.4361 35.807C95.5751 36.24 95.6441 36.704 95.6441 37.198C95.6441 37.241 95.6441 37.289 95.6441 37.341C95.6441 37.393 95.6401 37.449 95.6311 37.51H90.3011ZM90.3011 36.769H94.6301C94.6041 36.466 94.5391 36.175 94.4351 35.898C94.3401 35.621 94.2011 35.378 94.0191 35.17C93.8461 34.962 93.6291 34.797 93.3691 34.676C93.1181 34.546 92.8231 34.481 92.4851 34.481C92.1901 34.481 91.9171 34.542 91.6661 34.663C91.4151 34.776 91.1941 34.936 91.0031 35.144C90.8121 35.343 90.6561 35.582 90.5351 35.859C90.4141 36.136 90.3361 36.44 90.3011 36.769ZM103.792 39.33C103.792 39.876 103.71 40.353 103.545 40.76C103.389 41.167 103.16 41.505 102.856 41.774C102.562 42.051 102.202 42.259 101.777 42.398C101.361 42.537 100.893 42.606 100.373 42.606C99.8101 42.606 99.2731 42.528 98.7611 42.372C98.2501 42.216 97.7691 41.982 97.3181 41.67L97.7731 40.89C98.1631 41.167 98.5711 41.38 98.9951 41.527C99.4201 41.674 99.8751 41.748 100.36 41.748C101.106 41.748 101.699 41.544 102.141 41.137C102.583 40.738 102.804 40.145 102.804 39.356V38.563C102.51 38.953 102.15 39.287 101.725 39.564C101.301 39.841 100.781 39.98 100.165 39.98C99.7581 39.98 99.3641 39.911 98.9821 39.772C98.6101 39.625 98.2761 39.417 97.9811 39.148C97.6871 38.871 97.4481 38.537 97.2661 38.147C97.0931 37.757 97.0061 37.315 97.0061 36.821C97.0061 36.327 97.0931 35.885 97.2661 35.495C97.4481 35.096 97.6871 34.763 97.9811 34.494C98.2761 34.217 98.6141 34.004 98.9951 33.857C99.3771 33.71 99.7671 33.636 100.165 33.636C100.477 33.636 100.763 33.675 101.023 33.753C101.292 33.822 101.53 33.918 101.738 34.039C101.955 34.16 102.15 34.303 102.323 34.468C102.497 34.633 102.653 34.806 102.791 34.988V33.779H103.792V39.33ZM102.83 36.808C102.83 36.461 102.761 36.149 102.622 35.872C102.484 35.586 102.297 35.343 102.063 35.144C101.838 34.945 101.578 34.793 101.283 34.689C100.989 34.576 100.681 34.52 100.36 34.52C100.04 34.52 99.7361 34.572 99.4501 34.676C99.1731 34.78 98.9261 34.932 98.7091 35.131C98.5011 35.33 98.3371 35.573 98.2151 35.859C98.0941 36.136 98.0331 36.448 98.0331 36.795C98.0331 37.142 98.0941 37.458 98.2151 37.744C98.3451 38.021 98.5141 38.264 98.7221 38.472C98.9391 38.671 99.1861 38.827 99.4631 38.94C99.7491 39.044 100.048 39.096 100.36 39.096C100.681 39.096 100.989 39.044 101.283 38.94C101.578 38.827 101.838 38.671 102.063 38.472C102.297 38.273 102.484 38.034 102.622 37.757C102.761 37.471 102.83 37.155 102.83 36.808ZM107.199 32.31H106.055V31.205H107.199V32.31ZM107.121 40.5H106.12V33.779H107.121V40.5ZM110.445 36.652V40.5H109.444V33.779H110.445V34.949C110.671 34.585 110.965 34.277 111.329 34.026C111.693 33.766 112.166 33.636 112.746 33.636C113.154 33.636 113.513 33.701 113.825 33.831C114.146 33.961 114.415 34.147 114.631 34.39C114.857 34.624 115.026 34.906 115.138 35.235C115.26 35.564 115.32 35.928 115.32 36.327V40.5H114.319V36.574C114.319 35.95 114.159 35.456 113.838 35.092C113.518 34.728 113.058 34.546 112.46 34.546C112.174 34.546 111.906 34.598 111.654 34.702C111.412 34.797 111.199 34.94 111.017 35.131C110.835 35.313 110.692 35.534 110.588 35.794C110.493 36.054 110.445 36.34 110.445 36.652ZM122.07 38.615C122.07 38.936 122.005 39.222 121.875 39.473C121.754 39.716 121.585 39.924 121.368 40.097C121.16 40.27 120.909 40.405 120.614 40.5C120.328 40.587 120.016 40.63 119.678 40.63C119.193 40.63 118.703 40.543 118.209 40.37C117.715 40.188 117.277 39.945 116.896 39.642L117.403 38.927C117.767 39.204 118.144 39.417 118.534 39.564C118.933 39.711 119.331 39.785 119.73 39.785C120.137 39.785 120.471 39.69 120.731 39.499C120.991 39.308 121.121 39.048 121.121 38.719V38.693C121.121 38.528 121.073 38.385 120.978 38.264C120.891 38.143 120.77 38.039 120.614 37.952C120.458 37.857 120.276 37.774 120.068 37.705C119.869 37.636 119.661 37.571 119.444 37.51C119.184 37.432 118.92 37.35 118.651 37.263C118.391 37.168 118.153 37.051 117.936 36.912C117.728 36.773 117.555 36.6 117.416 36.392C117.286 36.184 117.221 35.924 117.221 35.612V35.586C117.221 35.3 117.277 35.04 117.39 34.806C117.503 34.563 117.659 34.36 117.858 34.195C118.066 34.022 118.309 33.892 118.586 33.805C118.872 33.71 119.18 33.662 119.509 33.662C119.925 33.662 120.345 33.731 120.77 33.87C121.195 34 121.58 34.178 121.927 34.403L121.472 35.157C121.16 34.958 120.831 34.802 120.484 34.689C120.146 34.568 119.812 34.507 119.483 34.507C119.084 34.507 118.768 34.602 118.534 34.793C118.3 34.975 118.183 35.205 118.183 35.482V35.508C118.183 35.664 118.231 35.803 118.326 35.924C118.421 36.037 118.547 36.136 118.703 36.223C118.868 36.31 119.054 36.388 119.262 36.457C119.47 36.526 119.687 36.596 119.912 36.665C120.172 36.743 120.428 36.83 120.679 36.925C120.939 37.02 121.173 37.142 121.381 37.289C121.589 37.436 121.754 37.614 121.875 37.822C122.005 38.03 122.07 38.286 122.07 38.589V38.615ZM134.418 37.133C134.418 37.61 134.327 38.065 134.145 38.498C133.972 38.923 133.729 39.295 133.417 39.616C133.105 39.937 132.732 40.192 132.299 40.383C131.866 40.565 131.398 40.656 130.895 40.656C130.392 40.656 129.929 40.565 129.504 40.383C129.079 40.192 128.711 39.941 128.399 39.629C128.087 39.308 127.844 38.936 127.671 38.511C127.498 38.086 127.411 37.636 127.411 37.159C127.411 36.682 127.498 36.232 127.671 35.807C127.844 35.374 128.087 34.997 128.399 34.676C128.711 34.355 129.079 34.104 129.504 33.922C129.937 33.731 130.41 33.636 130.921 33.636C131.424 33.636 131.887 33.731 132.312 33.922C132.745 34.104 133.118 34.355 133.43 34.676C133.742 34.988 133.985 35.356 134.158 35.781C134.331 36.206 134.418 36.656 134.418 37.133ZM133.391 37.159C133.391 36.795 133.326 36.453 133.196 36.132C133.075 35.811 132.901 35.534 132.676 35.3C132.451 35.057 132.186 34.867 131.883 34.728C131.58 34.589 131.25 34.52 130.895 34.52C130.531 34.52 130.197 34.589 129.894 34.728C129.591 34.858 129.331 35.044 129.114 35.287C128.906 35.521 128.741 35.798 128.62 36.119C128.499 36.431 128.438 36.769 128.438 37.133C128.438 37.497 128.499 37.839 128.62 38.16C128.75 38.481 128.923 38.758 129.14 38.992C129.365 39.226 129.63 39.412 129.933 39.551C130.236 39.69 130.566 39.759 130.921 39.759C131.285 39.759 131.619 39.694 131.922 39.564C132.225 39.425 132.485 39.239 132.702 39.005C132.919 38.771 133.088 38.498 133.209 38.186C133.33 37.865 133.391 37.523 133.391 37.159ZM137.232 36.652V40.5H136.231V33.779H137.232V34.949C137.458 34.585 137.752 34.277 138.116 34.026C138.48 33.766 138.953 33.636 139.533 33.636C139.941 33.636 140.3 33.701 140.612 33.831C140.933 33.961 141.202 34.147 141.418 34.39C141.644 34.624 141.813 34.906 141.925 35.235C142.047 35.564 142.107 35.928 142.107 36.327V40.5H141.106V36.574C141.106 35.95 140.946 35.456 140.625 35.092C140.305 34.728 139.845 34.546 139.247 34.546C138.961 34.546 138.693 34.598 138.441 34.702C138.199 34.797 137.986 34.94 137.804 35.131C137.622 35.313 137.479 35.534 137.375 35.794C137.28 36.054 137.232 36.34 137.232 36.652ZM155.003 38.693V31.4H156.004V40.5H155.185L149.309 33.038V40.5H148.308V31.4H149.27L155.003 38.693ZM165.001 37.133C165.001 37.61 164.91 38.065 164.728 38.498C164.555 38.923 164.312 39.295 164 39.616C163.688 39.937 163.315 40.192 162.882 40.383C162.449 40.565 161.981 40.656 161.478 40.656C160.975 40.656 160.512 40.565 160.087 40.383C159.662 40.192 159.294 39.941 158.982 39.629C158.67 39.308 158.427 38.936 158.254 38.511C158.081 38.086 157.994 37.636 157.994 37.159C157.994 36.682 158.081 36.232 158.254 35.807C158.427 35.374 158.67 34.997 158.982 34.676C159.294 34.355 159.662 34.104 160.087 33.922C160.52 33.731 160.993 33.636 161.504 33.636C162.007 33.636 162.47 33.731 162.895 33.922C163.328 34.104 163.701 34.355 164.013 34.676C164.325 34.988 164.568 35.356 164.741 35.781C164.914 36.206 165.001 36.656 165.001 37.133ZM163.974 37.159C163.974 36.795 163.909 36.453 163.779 36.132C163.658 35.811 163.484 35.534 163.259 35.3C163.034 35.057 162.769 34.867 162.466 34.728C162.163 34.589 161.833 34.52 161.478 34.52C161.114 34.52 160.78 34.589 160.477 34.728C160.174 34.858 159.914 35.044 159.697 35.287C159.489 35.521 159.324 35.798 159.203 36.119C159.082 36.431 159.021 36.769 159.021 37.133C159.021 37.497 159.082 37.839 159.203 38.16C159.333 38.481 159.506 38.758 159.723 38.992C159.948 39.226 160.213 39.412 160.516 39.551C160.819 39.69 161.149 39.759 161.504 39.759C161.868 39.759 162.202 39.694 162.505 39.564C162.808 39.425 163.068 39.239 163.285 39.005C163.502 38.771 163.671 38.498 163.792 38.186C163.913 37.865 163.974 37.523 163.974 37.159ZM169.125 39.356L171.4 33.779H172.479L169.554 40.552H168.67L165.758 33.779H166.863L169.125 39.356ZM174.255 37.51C174.29 37.874 174.376 38.199 174.515 38.485C174.654 38.762 174.831 39.001 175.048 39.2C175.265 39.391 175.507 39.538 175.776 39.642C176.045 39.737 176.326 39.785 176.621 39.785C177.089 39.785 177.488 39.698 177.817 39.525C178.155 39.352 178.463 39.122 178.74 38.836L179.364 39.395C179.026 39.776 178.64 40.084 178.207 40.318C177.774 40.543 177.236 40.656 176.595 40.656C176.136 40.656 175.702 40.574 175.295 40.409C174.888 40.236 174.532 39.997 174.229 39.694C173.926 39.382 173.683 39.009 173.501 38.576C173.328 38.143 173.241 37.666 173.241 37.146C173.241 36.661 173.319 36.206 173.475 35.781C173.64 35.348 173.865 34.975 174.151 34.663C174.437 34.342 174.775 34.091 175.165 33.909C175.564 33.727 175.997 33.636 176.465 33.636C176.959 33.636 177.401 33.731 177.791 33.922C178.181 34.104 178.51 34.355 178.779 34.676C179.048 34.997 179.251 35.374 179.39 35.807C179.529 36.24 179.598 36.704 179.598 37.198C179.598 37.241 179.598 37.289 179.598 37.341C179.598 37.393 179.594 37.449 179.585 37.51H174.255ZM174.255 36.769H178.584C178.558 36.466 178.493 36.175 178.389 35.898C178.294 35.621 178.155 35.378 177.973 35.17C177.8 34.962 177.583 34.797 177.323 34.676C177.072 34.546 176.777 34.481 176.439 34.481C176.144 34.481 175.871 34.542 175.62 34.663C175.369 34.776 175.148 34.936 174.957 35.144C174.766 35.343 174.61 35.582 174.489 35.859C174.368 36.136 174.29 36.44 174.255 36.769ZM186.68 34.975C186.802 34.793 186.936 34.62 187.083 34.455C187.239 34.29 187.413 34.147 187.603 34.026C187.794 33.905 188.006 33.809 188.24 33.74C188.483 33.671 188.752 33.636 189.046 33.636C189.826 33.636 190.437 33.879 190.879 34.364C191.321 34.841 191.542 35.499 191.542 36.34V40.5H190.541V36.574C190.541 35.924 190.385 35.426 190.073 35.079C189.77 34.724 189.345 34.546 188.799 34.546C188.548 34.546 188.31 34.594 188.084 34.689C187.859 34.776 187.66 34.91 187.486 35.092C187.322 35.265 187.187 35.482 187.083 35.742C186.988 36.002 186.94 36.297 186.94 36.626V40.5H185.952V36.548C185.952 35.915 185.796 35.426 185.484 35.079C185.181 34.724 184.761 34.546 184.223 34.546C183.955 34.546 183.708 34.598 183.482 34.702C183.257 34.806 183.058 34.953 182.884 35.144C182.72 35.335 182.59 35.56 182.494 35.82C182.399 36.071 182.351 36.353 182.351 36.665V40.5H181.35V33.779H182.351V34.91C182.464 34.745 182.585 34.585 182.715 34.429C182.854 34.273 183.01 34.139 183.183 34.026C183.357 33.905 183.552 33.809 183.768 33.74C183.985 33.671 184.236 33.636 184.522 33.636C185.068 33.636 185.519 33.766 185.874 34.026C186.23 34.277 186.498 34.594 186.68 34.975ZM200.502 37.133C200.502 37.688 200.411 38.182 200.229 38.615C200.047 39.048 199.804 39.417 199.501 39.72C199.206 40.015 198.864 40.244 198.474 40.409C198.092 40.565 197.698 40.643 197.291 40.643C196.979 40.643 196.693 40.604 196.433 40.526C196.173 40.448 195.939 40.344 195.731 40.214C195.523 40.084 195.332 39.932 195.159 39.759C194.994 39.586 194.847 39.404 194.717 39.213V40.5H193.716V31.01H194.717V35.131C194.855 34.932 195.007 34.741 195.172 34.559C195.345 34.377 195.536 34.221 195.744 34.091C195.952 33.952 196.181 33.844 196.433 33.766C196.693 33.679 196.979 33.636 197.291 33.636C197.689 33.636 198.079 33.714 198.461 33.87C198.851 34.026 199.197 34.256 199.501 34.559C199.804 34.854 200.047 35.218 200.229 35.651C200.411 36.084 200.502 36.578 200.502 37.133ZM199.475 37.146C199.475 36.747 199.41 36.388 199.28 36.067C199.158 35.746 198.989 35.473 198.773 35.248C198.556 35.014 198.305 34.836 198.019 34.715C197.733 34.594 197.429 34.533 197.109 34.533C196.797 34.533 196.493 34.598 196.199 34.728C195.913 34.849 195.653 35.023 195.419 35.248C195.193 35.473 195.011 35.746 194.873 36.067C194.743 36.388 194.678 36.743 194.678 37.133C194.678 37.523 194.743 37.883 194.873 38.212C195.011 38.533 195.193 38.806 195.419 39.031C195.653 39.256 195.913 39.434 196.199 39.564C196.493 39.685 196.797 39.746 197.109 39.746C197.429 39.746 197.733 39.69 198.019 39.577C198.313 39.456 198.565 39.287 198.773 39.07C198.989 38.845 199.158 38.572 199.28 38.251C199.41 37.922 199.475 37.553 199.475 37.146ZM202.946 37.51C202.981 37.874 203.068 38.199 203.206 38.485C203.345 38.762 203.523 39.001 203.739 39.2C203.956 39.391 204.199 39.538 204.467 39.642C204.736 39.737 205.018 39.785 205.312 39.785C205.78 39.785 206.179 39.698 206.508 39.525C206.846 39.352 207.154 39.122 207.431 38.836L208.055 39.395C207.717 39.776 207.332 40.084 206.898 40.318C206.465 40.543 205.928 40.656 205.286 40.656C204.827 40.656 204.394 40.574 203.986 40.409C203.579 40.236 203.224 39.997 202.92 39.694C202.617 39.382 202.374 39.009 202.192 38.576C202.019 38.143 201.932 37.666 201.932 37.146C201.932 36.661 202.01 36.206 202.166 35.781C202.331 35.348 202.556 34.975 202.842 34.663C203.128 34.342 203.466 34.091 203.856 33.909C204.255 33.727 204.688 33.636 205.156 33.636C205.65 33.636 206.092 33.731 206.482 33.922C206.872 34.104 207.202 34.355 207.47 34.676C207.739 34.997 207.943 35.374 208.081 35.807C208.22 36.24 208.289 36.704 208.289 37.198C208.289 37.241 208.289 37.289 208.289 37.341C208.289 37.393 208.285 37.449 208.276 37.51H202.946ZM202.946 36.769H207.275C207.249 36.466 207.184 36.175 207.08 35.898C206.985 35.621 206.846 35.378 206.664 35.17C206.491 34.962 206.274 34.797 206.014 34.676C205.763 34.546 205.468 34.481 205.13 34.481C204.836 34.481 204.563 34.542 204.311 34.663C204.06 34.776 203.839 34.936 203.648 35.144C203.458 35.343 203.302 35.582 203.18 35.859C203.059 36.136 202.981 36.44 202.946 36.769ZM211.043 37.822V40.5H210.042V33.779H211.043V35.534C211.164 35.257 211.316 35.001 211.498 34.767C211.68 34.533 211.888 34.334 212.122 34.169C212.356 33.996 212.611 33.866 212.889 33.779C213.166 33.692 213.465 33.653 213.786 33.662V34.741H213.708C213.344 34.741 212.997 34.806 212.668 34.936C212.347 35.066 212.065 35.261 211.823 35.521C211.58 35.781 211.389 36.106 211.251 36.496C211.112 36.877 211.043 37.319 211.043 37.822ZM216.454 35.144H215.258V33.779H216.454V35.144ZM216.454 40.5H215.258V39.135H216.454V40.5Z"
        fill="#94A3AE"
      />
      <path
        d="M37.8031 104.055L40.4551 107.5H39.2981L37.2181 104.757L35.1251 107.5H34.0071L36.6461 104.081L34.1111 100.779H35.2551L37.2441 103.379L39.2331 100.779H40.3511L37.8031 104.055ZM49.7789 107.5H48.5179L45.8789 103.964H43.2789V107.5H42.2519V98.4H46.1649C46.6676 98.4 47.1183 98.465 47.5169 98.595C47.9243 98.725 48.2709 98.911 48.5569 99.154C48.8429 99.388 49.0639 99.674 49.2199 100.012C49.3759 100.341 49.4539 100.71 49.4539 101.117C49.4539 101.498 49.3933 101.841 49.2719 102.144C49.1506 102.439 48.9773 102.699 48.7519 102.924C48.5353 103.141 48.2753 103.323 47.9719 103.47C47.6686 103.617 47.3393 103.721 46.9839 103.782L49.7789 107.5ZM48.4139 101.156C48.4139 100.584 48.2103 100.142 47.8029 99.83C47.3956 99.509 46.8236 99.349 46.0869 99.349H43.2789V103.041H46.0739C46.4119 103.041 46.7239 102.998 47.0099 102.911C47.2959 102.824 47.5429 102.703 47.7509 102.547C47.9589 102.382 48.1193 102.183 48.2319 101.949C48.3533 101.715 48.4139 101.451 48.4139 101.156ZM51.9485 104.51C51.9832 104.874 52.0699 105.199 52.2085 105.485C52.3472 105.762 52.5249 106.001 52.7415 106.2C52.9582 106.391 53.2009 106.538 53.4695 106.642C53.7382 106.737 54.0199 106.785 54.3145 106.785C54.7825 106.785 55.1812 106.698 55.5105 106.525C55.8485 106.352 56.1562 106.122 56.4335 105.836L57.0575 106.395C56.7195 106.776 56.3339 107.084 55.9005 107.318C55.4672 107.543 54.9299 107.656 54.2885 107.656C53.8292 107.656 53.3959 107.574 52.9885 107.409C52.5812 107.236 52.2259 106.997 51.9225 106.694C51.6192 106.382 51.3765 106.009 51.1945 105.576C51.0212 105.143 50.9345 104.666 50.9345 104.146C50.9345 103.661 51.0125 103.206 51.1685 102.781C51.3332 102.348 51.5585 101.975 51.8445 101.663C52.1305 101.342 52.4685 101.091 52.8585 100.909C53.2572 100.727 53.6905 100.636 54.1585 100.636C54.6525 100.636 55.0945 100.731 55.4845 100.922C55.8745 101.104 56.2039 101.355 56.4725 101.676C56.7412 101.997 56.9449 102.374 57.0835 102.807C57.2222 103.24 57.2915 103.704 57.2915 104.198C57.2915 104.241 57.2915 104.289 57.2915 104.341C57.2915 104.393 57.2872 104.449 57.2785 104.51H51.9485ZM51.9485 103.769H56.2775C56.2515 103.466 56.1865 103.175 56.0825 102.898C55.9872 102.621 55.8485 102.378 55.6665 102.17C55.4932 101.962 55.2765 101.797 55.0165 101.676C54.7652 101.546 54.4705 101.481 54.1325 101.481C53.8379 101.481 53.5649 101.542 53.3135 101.663C53.0622 101.776 52.8412 101.936 52.6505 102.144C52.4599 102.343 52.3039 102.582 52.1825 102.859C52.0612 103.136 51.9832 103.44 51.9485 103.769ZM60.4089 100.805H62.5409V101.663H60.4219V107.5H59.4209V101.663H58.4979V100.792H59.4209V100.207C59.4209 99.47 59.5942 98.911 59.9409 98.53C60.2962 98.149 60.7989 97.958 61.4489 97.958C61.6829 97.958 61.8822 97.971 62.0469 97.997C62.2202 98.023 62.3892 98.066 62.5539 98.127V98.998C62.3719 98.946 62.2072 98.907 62.0599 98.881C61.9125 98.846 61.7522 98.829 61.5789 98.829C60.7989 98.829 60.4089 99.306 60.4089 100.259V100.805ZM70.4188 106.356L72.6938 100.779H73.7728L70.8478 107.552H69.9638L67.0518 100.779H68.1568L70.4188 106.356ZM81.5421 104.133C81.5421 104.61 81.4511 105.065 81.2691 105.498C81.0958 105.923 80.8531 106.295 80.5411 106.616C80.2291 106.937 79.8564 107.192 79.4231 107.383C78.9898 107.565 78.5218 107.656 78.0191 107.656C77.5164 107.656 77.0528 107.565 76.6281 107.383C76.2034 107.192 75.8351 106.941 75.5231 106.629C75.2111 106.308 74.9684 105.936 74.7951 105.511C74.6218 105.086 74.5351 104.636 74.5351 104.159C74.5351 103.682 74.6218 103.232 74.7951 102.807C74.9684 102.374 75.2111 101.997 75.5231 101.676C75.8351 101.355 76.2034 101.104 76.6281 100.922C77.0614 100.731 77.5338 100.636 78.0451 100.636C78.5478 100.636 79.0114 100.731 79.4361 100.922C79.8694 101.104 80.2421 101.355 80.5541 101.676C80.8661 101.988 81.1088 102.356 81.2821 102.781C81.4554 103.206 81.5421 103.656 81.5421 104.133ZM80.5151 104.159C80.5151 103.795 80.4501 103.453 80.3201 103.132C80.1988 102.811 80.0254 102.534 79.8001 102.3C79.5748 102.057 79.3104 101.867 79.0071 101.728C78.7038 101.589 78.3744 101.52 78.0191 101.52C77.6551 101.52 77.3214 101.589 77.0181 101.728C76.7148 101.858 76.4548 102.044 76.2381 102.287C76.0301 102.521 75.8654 102.798 75.7441 103.119C75.6228 103.431 75.5621 103.769 75.5621 104.133C75.5621 104.497 75.6228 104.839 75.7441 105.16C75.8741 105.481 76.0474 105.758 76.2641 105.992C76.4894 106.226 76.7538 106.412 77.0571 106.551C77.3604 106.69 77.6898 106.759 78.0451 106.759C78.4091 106.759 78.7428 106.694 79.0461 106.564C79.3494 106.425 79.6094 106.239 79.8261 106.005C80.0428 105.771 80.2118 105.498 80.3331 105.186C80.4544 104.865 80.5151 104.523 80.5151 104.159ZM84.7071 101.663V105.589C84.7071 106.005 84.8111 106.295 85.0191 106.46C85.2271 106.625 85.5001 106.707 85.8381 106.707C86.0121 106.707 86.1721 106.69 86.3191 106.655C86.4751 106.62 86.6401 106.56 86.8131 106.473V107.331C86.6401 107.426 86.4541 107.496 86.2541 107.539C86.0641 107.591 85.8471 107.617 85.6041 107.617C85.3361 107.617 85.0841 107.582 84.8501 107.513C84.6161 107.444 84.4127 107.335 84.2394 107.188C84.0747 107.032 83.9447 106.833 83.8494 106.59C83.7541 106.347 83.7064 106.057 83.7064 105.719V101.663H82.7704V100.779H83.7064V98.751H84.7071V100.779H86.8391V101.663H84.7071ZM89.7811 99.31H88.6371V98.205H89.7811V99.31ZM89.7031 107.5H88.7021V100.779H89.7031V107.5ZM93.0271 103.652V107.5H92.0261V100.779H93.0271V101.949C93.2531 101.585 93.5471 101.277 93.9111 101.026C94.2751 100.766 94.7481 100.636 95.3281 100.636C95.7361 100.636 96.0951 100.701 96.4071 100.831C96.7281 100.961 96.9971 101.147 97.2131 101.39C97.4391 101.624 97.6081 101.906 97.7201 102.235C97.8421 102.564 97.9021 102.928 97.9021 103.327V107.5H96.9011V103.574C96.9011 102.95 96.7411 102.456 96.4201 102.092C96.1001 101.728 95.6401 101.546 95.0421 101.546C94.7561 101.546 94.4881 101.598 94.2361 101.702C93.9941 101.797 93.7811 101.94 93.5991 102.131C93.4171 102.313 93.2741 102.534 93.1701 102.794C93.0751 103.054 93.0271 103.34 93.0271 103.652ZM106.433 106.33C106.433 106.876 106.351 107.353 106.186 107.76C106.03 108.167 105.8 108.505 105.497 108.774C105.202 109.051 104.843 109.259 104.418 109.398C104.002 109.537 103.534 109.606 103.014 109.606C102.451 109.606 101.913 109.528 101.402 109.372C100.891 109.216 100.41 108.982 99.9591 108.67L100.414 107.89C100.804 108.167 101.211 108.38 101.636 108.527C102.061 108.674 102.516 108.748 103.001 108.748C103.746 108.748 104.34 108.544 104.782 108.137C105.224 107.738 105.445 107.145 105.445 106.356V105.563C105.15 105.953 104.791 106.287 104.366 106.564C103.941 106.841 103.421 106.98 102.806 106.98C102.399 106.98 102.004 106.911 101.623 106.772C101.25 106.625 100.917 106.417 100.622 106.148C100.327 105.871 100.089 105.537 99.9071 105.147C99.7341 104.757 99.6471 104.315 99.6471 103.821C99.6471 103.327 99.7341 102.885 99.9071 102.495C100.089 102.096 100.327 101.763 100.622 101.494C100.917 101.217 101.255 101.004 101.636 100.857C102.017 100.71 102.407 100.636 102.806 100.636C103.118 100.636 103.404 100.675 103.664 100.753C103.933 100.822 104.171 100.918 104.379 101.039C104.596 101.16 104.791 101.303 104.964 101.468C105.137 101.633 105.293 101.806 105.432 101.988V100.779H106.433V106.33ZM105.471 103.808C105.471 103.461 105.402 103.149 105.263 102.872C105.124 102.586 104.938 102.343 104.704 102.144C104.479 101.945 104.219 101.793 103.924 101.689C103.629 101.576 103.322 101.52 103.001 101.52C102.68 101.52 102.377 101.572 102.091 101.676C101.814 101.78 101.567 101.932 101.35 102.131C101.142 102.33 100.977 102.573 100.856 102.859C100.735 103.136 100.674 103.448 100.674 103.795C100.674 104.142 100.735 104.458 100.856 104.744C100.986 105.021 101.155 105.264 101.363 105.472C101.58 105.671 101.827 105.827 102.104 105.94C102.39 106.044 102.689 106.096 103.001 106.096C103.322 106.096 103.629 106.044 103.924 105.94C104.219 105.827 104.479 105.671 104.704 105.472C104.938 105.273 105.124 105.034 105.263 104.757C105.402 104.471 105.471 104.155 105.471 103.808ZM118.963 107.5H117.962V106.148C117.824 106.347 117.668 106.538 117.494 106.72C117.33 106.902 117.143 107.062 116.935 107.201C116.727 107.34 116.493 107.448 116.233 107.526C115.982 107.604 115.7 107.643 115.388 107.643C114.981 107.643 114.587 107.565 114.205 107.409C113.824 107.253 113.482 107.028 113.178 106.733C112.875 106.43 112.632 106.061 112.45 105.628C112.268 105.195 112.177 104.701 112.177 104.146C112.177 103.591 112.268 103.097 112.45 102.664C112.632 102.231 112.875 101.867 113.178 101.572C113.482 101.269 113.824 101.039 114.205 100.883C114.587 100.718 114.981 100.636 115.388 100.636C115.7 100.636 115.986 100.675 116.246 100.753C116.506 100.831 116.74 100.935 116.948 101.065C117.156 101.195 117.343 101.347 117.507 101.52C117.681 101.693 117.832 101.875 117.962 102.066V98.01H118.963V107.5ZM118.001 104.133C118.001 103.743 117.932 103.388 117.793 103.067C117.663 102.746 117.481 102.473 117.247 102.248C117.022 102.023 116.762 101.849 116.467 101.728C116.181 101.598 115.882 101.533 115.57 101.533C115.241 101.533 114.933 101.594 114.647 101.715C114.361 101.828 114.11 101.997 113.893 102.222C113.685 102.439 113.516 102.712 113.386 103.041C113.265 103.362 113.204 103.726 113.204 104.133C113.204 104.532 113.265 104.891 113.386 105.212C113.516 105.533 113.69 105.81 113.906 106.044C114.123 106.269 114.374 106.443 114.66 106.564C114.946 106.685 115.25 106.746 115.57 106.746C115.882 106.746 116.181 106.685 116.467 106.564C116.762 106.434 117.022 106.256 117.247 106.031C117.481 105.806 117.663 105.533 117.793 105.212C117.932 104.883 118.001 104.523 118.001 104.133ZM121.798 104.51C121.833 104.874 121.919 105.199 122.058 105.485C122.197 105.762 122.374 106.001 122.591 106.2C122.808 106.391 123.05 106.538 123.319 106.642C123.588 106.737 123.869 106.785 124.164 106.785C124.632 106.785 125.031 106.698 125.36 106.525C125.698 106.352 126.006 106.122 126.283 105.836L126.907 106.395C126.569 106.776 126.183 107.084 125.75 107.318C125.317 107.543 124.779 107.656 124.138 107.656C123.679 107.656 123.245 107.574 122.838 107.409C122.431 107.236 122.075 106.997 121.772 106.694C121.469 106.382 121.226 106.009 121.044 105.576C120.871 105.143 120.784 104.666 120.784 104.146C120.784 103.661 120.862 103.206 121.018 102.781C121.183 102.348 121.408 101.975 121.694 101.663C121.98 101.342 122.318 101.091 122.708 100.909C123.107 100.727 123.54 100.636 124.008 100.636C124.502 100.636 124.944 100.731 125.334 100.922C125.724 101.104 126.053 101.355 126.322 101.676C126.591 101.997 126.794 102.374 126.933 102.807C127.072 103.24 127.141 103.704 127.141 104.198C127.141 104.241 127.141 104.289 127.141 104.341C127.141 104.393 127.137 104.449 127.128 104.51H121.798ZM121.798 103.769H126.127C126.101 103.466 126.036 103.175 125.932 102.898C125.837 102.621 125.698 102.378 125.516 102.17C125.343 101.962 125.126 101.797 124.866 101.676C124.615 101.546 124.32 101.481 123.982 101.481C123.687 101.481 123.414 101.542 123.163 101.663C122.912 101.776 122.691 101.936 122.5 102.144C122.309 102.343 122.153 102.582 122.032 102.859C121.911 103.136 121.833 103.44 121.798 103.769ZM131.324 101.572C130.926 101.572 130.562 101.62 130.232 101.715C129.912 101.802 129.595 101.919 129.283 102.066L128.984 101.247C129.357 101.074 129.734 100.939 130.115 100.844C130.497 100.74 130.934 100.688 131.428 100.688C132.347 100.688 133.053 100.918 133.547 101.377C134.041 101.828 134.288 102.499 134.288 103.392V107.5H133.326V106.486C133.092 106.789 132.776 107.058 132.377 107.292C131.987 107.526 131.493 107.643 130.895 107.643C130.583 107.643 130.276 107.6 129.972 107.513C129.678 107.426 129.409 107.296 129.166 107.123C128.932 106.941 128.742 106.72 128.594 106.46C128.456 106.2 128.386 105.892 128.386 105.537C128.386 105.182 128.456 104.87 128.594 104.601C128.733 104.324 128.928 104.094 129.179 103.912C129.439 103.73 129.743 103.591 130.089 103.496C130.445 103.401 130.835 103.353 131.259 103.353C131.693 103.353 132.07 103.379 132.39 103.431C132.711 103.483 133.023 103.552 133.326 103.639V103.405C133.326 102.798 133.149 102.343 132.793 102.04C132.447 101.728 131.957 101.572 131.324 101.572ZM131.363 104.094C130.731 104.094 130.245 104.22 129.907 104.471C129.569 104.722 129.4 105.065 129.4 105.498C129.4 105.715 129.444 105.905 129.53 106.07C129.626 106.235 129.751 106.378 129.907 106.499C130.063 106.612 130.241 106.698 130.44 106.759C130.648 106.82 130.865 106.85 131.09 106.85C131.402 106.85 131.693 106.807 131.961 106.72C132.239 106.625 132.477 106.499 132.676 106.343C132.884 106.178 133.045 105.988 133.157 105.771C133.279 105.546 133.339 105.299 133.339 105.03V104.38C133.088 104.311 132.798 104.246 132.468 104.185C132.148 104.124 131.779 104.094 131.363 104.094ZM142.818 107.5H141.817V106.148C141.678 106.347 141.522 106.538 141.349 106.72C141.184 106.902 140.998 107.062 140.79 107.201C140.582 107.34 140.348 107.448 140.088 107.526C139.836 107.604 139.555 107.643 139.243 107.643C138.835 107.643 138.441 107.565 138.06 107.409C137.678 107.253 137.336 107.028 137.033 106.733C136.729 106.43 136.487 106.061 136.305 105.628C136.123 105.195 136.032 104.701 136.032 104.146C136.032 103.591 136.123 103.097 136.305 102.664C136.487 102.231 136.729 101.867 137.033 101.572C137.336 101.269 137.678 101.039 138.06 100.883C138.441 100.718 138.835 100.636 139.243 100.636C139.555 100.636 139.841 100.675 140.101 100.753C140.361 100.831 140.595 100.935 140.803 101.065C141.011 101.195 141.197 101.347 141.362 101.52C141.535 101.693 141.687 101.875 141.817 102.066V98.01H142.818V107.5ZM141.856 104.133C141.856 103.743 141.786 103.388 141.648 103.067C141.518 102.746 141.336 102.473 141.102 102.248C140.876 102.023 140.616 101.849 140.322 101.728C140.036 101.598 139.737 101.533 139.425 101.533C139.095 101.533 138.788 101.594 138.502 101.715C138.216 101.828 137.964 101.997 137.748 102.222C137.54 102.439 137.371 102.712 137.241 103.041C137.119 103.362 137.059 103.726 137.059 104.133C137.059 104.532 137.119 104.891 137.241 105.212C137.371 105.533 137.544 105.81 137.761 106.044C137.977 106.269 138.229 106.443 138.515 106.564C138.801 106.685 139.104 106.746 139.425 106.746C139.737 106.746 140.036 106.685 140.322 106.564C140.616 106.434 140.876 106.256 141.102 106.031C141.336 105.806 141.518 105.533 141.648 105.212C141.786 104.883 141.856 104.523 141.856 104.133ZM146.147 107.5H145.146V98.01H146.147V107.5ZM149.64 99.31H148.496V98.205H149.64V99.31ZM149.562 107.5H148.561V100.779H149.562V107.5ZM152.886 103.652V107.5H151.885V100.779H152.886V101.949C153.111 101.585 153.406 101.277 153.77 101.026C154.134 100.766 154.606 100.636 155.187 100.636C155.594 100.636 155.954 100.701 156.266 100.831C156.586 100.961 156.855 101.147 157.072 101.39C157.297 101.624 157.466 101.906 157.579 102.235C157.7 102.564 157.761 102.928 157.761 103.327V107.5H156.76V103.574C156.76 102.95 156.599 102.456 156.279 102.092C155.958 101.728 155.499 101.546 154.901 101.546C154.615 101.546 154.346 101.598 154.095 101.702C153.852 101.797 153.64 101.94 153.458 102.131C153.276 102.313 153.133 102.534 153.029 102.794C152.933 103.054 152.886 103.34 152.886 103.652ZM160.493 104.51C160.528 104.874 160.615 105.199 160.753 105.485C160.892 105.762 161.07 106.001 161.286 106.2C161.503 106.391 161.746 106.538 162.014 106.642C162.283 106.737 162.565 106.785 162.859 106.785C163.327 106.785 163.726 106.698 164.055 106.525C164.393 106.352 164.701 106.122 164.978 105.836L165.602 106.395C165.264 106.776 164.879 107.084 164.445 107.318C164.012 107.543 163.475 107.656 162.833 107.656C162.374 107.656 161.941 107.574 161.533 107.409C161.126 107.236 160.771 106.997 160.467 106.694C160.164 106.382 159.921 106.009 159.739 105.576C159.566 105.143 159.479 104.666 159.479 104.146C159.479 103.661 159.557 103.206 159.713 102.781C159.878 102.348 160.103 101.975 160.389 101.663C160.675 101.342 161.013 101.091 161.403 100.909C161.802 100.727 162.235 100.636 162.703 100.636C163.197 100.636 163.639 100.731 164.029 100.922C164.419 101.104 164.749 101.355 165.017 101.676C165.286 101.997 165.49 102.374 165.628 102.807C165.767 103.24 165.836 103.704 165.836 104.198C165.836 104.241 165.836 104.289 165.836 104.341C165.836 104.393 165.832 104.449 165.823 104.51H160.493ZM160.493 103.769H164.822C164.796 103.466 164.731 103.175 164.627 102.898C164.532 102.621 164.393 102.378 164.211 102.17C164.038 101.962 163.821 101.797 163.561 101.676C163.31 101.546 163.015 101.481 162.677 101.481C162.383 101.481 162.11 101.542 161.858 101.663C161.607 101.776 161.386 101.936 161.195 102.144C161.005 102.343 160.849 102.582 160.727 102.859C160.606 103.136 160.528 103.44 160.493 103.769ZM168.733 102.144H167.537V100.779H168.733V102.144ZM168.733 107.5H167.537V106.135H168.733V107.5Z"
        fill="#94A3AE"
      />
      <path
        d="M35.3 154.5V140.5H37.5801L45.0801 150.18V140.5H47.5V154.5H45.44L37.7201 144.54V154.5H35.3ZM55.8408 154.74C52.6208 154.74 50.2408 152.28 50.2408 149.28V149.24C50.2408 146.22 52.6408 143.72 55.8808 143.72C59.1208 143.72 61.5009 146.18 61.5009 149.2V149.24C61.5009 152.24 59.1008 154.74 55.8408 154.74ZM55.8808 152.64C57.8408 152.64 59.0809 151.1 59.0809 149.28V149.24C59.0809 147.38 57.7408 145.84 55.8408 145.84C53.9008 145.84 52.6608 147.36 52.6608 149.2V149.24C52.6608 151.08 54.0008 152.64 55.8808 152.64ZM66.6998 154.58L62.3599 143.94H64.9599L67.7998 151.7L70.6598 143.94H73.1998L68.8798 154.58H66.6998ZM73.3953 154.5V151.76H76.0552V154.5H73.3953ZM95.478 154.74C93.338 154.74 91.658 153.88 90.338 152.6L91.8581 150.82C92.9781 151.86 94.158 152.5 95.458 152.5C97.138 152.5 98.238 151.54 98.238 150.08V150.04C98.238 148.62 97.038 147.72 95.338 147.72C94.338 147.72 93.4781 148 92.7581 148.34L91.278 147.36L91.6781 140.5H100.038V142.68H93.798L93.5781 145.96C94.2381 145.72 94.858 145.56 95.798 145.56C98.518 145.56 100.658 147 100.658 149.96V150C100.658 152.86 98.578 154.74 95.478 154.74ZM106.9 154.68C105.12 154.68 103.86 153.9 103.86 151.58V146.02H102.52V143.94H103.86V141.04H106.28V143.94H109.12V146.02H106.28V151.2C106.28 152.14 106.76 152.52 107.58 152.52C108.12 152.52 108.6 152.4 109.08 152.16V154.14C108.48 154.48 107.8 154.68 106.9 154.68ZM111.563 154.5V139.9H113.983V145.58C114.663 144.58 115.643 143.72 117.283 143.72C119.663 143.72 121.043 145.32 121.043 147.78V154.5H118.623V148.5C118.623 146.86 117.803 145.92 116.363 145.92C114.963 145.92 113.983 146.9 113.983 148.54V154.5H111.563Z"
        fill="white"
      />
      <path
        d="M42.4701 168.129L39.1551 173.004H39.1031L35.7881 168.142V175.5H34.7871V166.4H35.8271L39.1421 171.366L42.4571 166.4H43.4971V175.5H42.4701V168.129ZM46.5022 172.51C46.5369 172.874 46.6236 173.199 46.7622 173.485C46.9009 173.762 47.0786 174.001 47.2952 174.2C47.5119 174.391 47.7546 174.538 48.0232 174.642C48.2919 174.737 48.5736 174.785 48.8682 174.785C49.3362 174.785 49.7349 174.698 50.0642 174.525C50.4022 174.352 50.7099 174.122 50.9872 173.836L51.6112 174.395C51.2732 174.776 50.8876 175.084 50.4542 175.318C50.0209 175.543 49.4836 175.656 48.8422 175.656C48.3829 175.656 47.9496 175.574 47.5422 175.409C47.1349 175.236 46.7796 174.997 46.4762 174.694C46.1729 174.382 45.9302 174.009 45.7482 173.576C45.5749 173.143 45.4882 172.666 45.4882 172.146C45.4882 171.661 45.5662 171.206 45.7222 170.781C45.8869 170.348 46.1122 169.975 46.3982 169.663C46.6842 169.342 47.0222 169.091 47.4122 168.909C47.8109 168.727 48.2442 168.636 48.7122 168.636C49.2062 168.636 49.6482 168.731 50.0382 168.922C50.4282 169.104 50.7576 169.355 51.0262 169.676C51.2949 169.997 51.4986 170.374 51.6372 170.807C51.7759 171.24 51.8452 171.704 51.8452 172.198C51.8452 172.241 51.8452 172.289 51.8452 172.341C51.8452 172.393 51.8409 172.449 51.8322 172.51H46.5022ZM46.5022 171.769H50.8312C50.8052 171.466 50.7402 171.175 50.6362 170.898C50.5409 170.621 50.4022 170.378 50.2202 170.17C50.0469 169.962 49.8302 169.797 49.5702 169.676C49.3189 169.546 49.0242 169.481 48.6862 169.481C48.3916 169.481 48.1186 169.542 47.8672 169.663C47.6159 169.776 47.3949 169.936 47.2042 170.144C47.0136 170.343 46.8576 170.582 46.7362 170.859C46.6149 171.136 46.5369 171.44 46.5022 171.769ZM58.9276 169.975C59.0489 169.793 59.1833 169.62 59.3306 169.455C59.4866 169.29 59.6599 169.147 59.8506 169.026C60.0413 168.905 60.2536 168.809 60.4876 168.74C60.7303 168.671 60.9989 168.636 61.2936 168.636C62.0736 168.636 62.6846 168.879 63.1266 169.364C63.5686 169.841 63.7896 170.499 63.7896 171.34V175.5H62.7886V171.574C62.7886 170.924 62.6326 170.426 62.3206 170.079C62.0173 169.724 61.5926 169.546 61.0466 169.546C60.7953 169.546 60.5569 169.594 60.3316 169.689C60.1063 169.776 59.9069 169.91 59.7336 170.092C59.5689 170.265 59.4346 170.482 59.3306 170.742C59.2353 171.002 59.1876 171.297 59.1876 171.626V175.5H58.1996V171.548C58.1996 170.915 58.0436 170.426 57.7316 170.079C57.4283 169.724 57.0079 169.546 56.4706 169.546C56.2019 169.546 55.9549 169.598 55.7296 169.702C55.5043 169.806 55.3049 169.953 55.1316 170.144C54.9669 170.335 54.8369 170.56 54.7416 170.82C54.6463 171.071 54.5986 171.353 54.5986 171.665V175.5H53.5976V168.779H54.5986V169.91C54.7113 169.745 54.8326 169.585 54.9626 169.429C55.1013 169.273 55.2573 169.139 55.4306 169.026C55.6039 168.905 55.7989 168.809 56.0156 168.74C56.2323 168.671 56.4836 168.636 56.7696 168.636C57.3156 168.636 57.7663 168.766 58.1216 169.026C58.4769 169.277 58.7456 169.594 58.9276 169.975ZM66.5608 172.51C66.5955 172.874 66.6822 173.199 66.8208 173.485C66.9595 173.762 67.1372 174.001 67.3538 174.2C67.5705 174.391 67.8132 174.538 68.0818 174.642C68.3505 174.737 68.6322 174.785 68.9268 174.785C69.3948 174.785 69.7935 174.698 70.1228 174.525C70.4608 174.352 70.7685 174.122 71.0458 173.836L71.6698 174.395C71.3318 174.776 70.9462 175.084 70.5128 175.318C70.0795 175.543 69.5422 175.656 68.9008 175.656C68.4415 175.656 68.0082 175.574 67.6008 175.409C67.1935 175.236 66.8382 174.997 66.5348 174.694C66.2315 174.382 65.9888 174.009 65.8068 173.576C65.6335 173.143 65.5468 172.666 65.5468 172.146C65.5468 171.661 65.6248 171.206 65.7808 170.781C65.9455 170.348 66.1708 169.975 66.4568 169.663C66.7428 169.342 67.0808 169.091 67.4708 168.909C67.8695 168.727 68.3028 168.636 68.7708 168.636C69.2648 168.636 69.7068 168.731 70.0968 168.922C70.4868 169.104 70.8162 169.355 71.0848 169.676C71.3535 169.997 71.5572 170.374 71.6958 170.807C71.8345 171.24 71.9038 171.704 71.9038 172.198C71.9038 172.241 71.9038 172.289 71.9038 172.341C71.9038 172.393 71.8995 172.449 71.8908 172.51H66.5608ZM66.5608 171.769H70.8898C70.8638 171.466 70.7988 171.175 70.6948 170.898C70.5995 170.621 70.4608 170.378 70.2788 170.17C70.1055 169.962 69.8888 169.797 69.6288 169.676C69.3775 169.546 69.0828 169.481 68.7448 169.481C68.4502 169.481 68.1772 169.542 67.9258 169.663C67.6745 169.776 67.4535 169.936 67.2628 170.144C67.0722 170.343 66.9162 170.582 66.7948 170.859C66.6735 171.136 66.5955 171.44 66.5608 171.769ZM77.2702 167.349V175.5H76.2302V167.349H73.1752V166.4H80.3252V167.349H77.2702ZM87.0261 172.133C87.0261 172.61 86.9351 173.065 86.7531 173.498C86.5801 173.923 86.3371 174.295 86.0251 174.616C85.7131 174.937 85.3411 175.192 84.9071 175.383C84.4741 175.565 84.0061 175.656 83.5035 175.656C83.0008 175.656 82.5371 175.565 82.1125 175.383C81.6878 175.192 81.3195 174.941 81.0075 174.629C80.6955 174.308 80.4528 173.936 80.2795 173.511C80.1061 173.086 80.0195 172.636 80.0195 172.159C80.0195 171.682 80.1061 171.232 80.2795 170.807C80.4528 170.374 80.6955 169.997 81.0075 169.676C81.3195 169.355 81.6878 169.104 82.1125 168.922C82.5458 168.731 83.0181 168.636 83.5295 168.636C84.0321 168.636 84.4958 168.731 84.9201 168.922C85.3541 169.104 85.7261 169.355 86.0381 169.676C86.3501 169.988 86.5931 170.356 86.7661 170.781C86.9401 171.206 87.0261 171.656 87.0261 172.133ZM85.9991 172.159C85.9991 171.795 85.9341 171.453 85.8041 171.132C85.6831 170.811 85.5101 170.534 85.2841 170.3C85.0591 170.057 84.7951 169.867 84.4915 169.728C84.1881 169.589 83.8588 169.52 83.5035 169.52C83.1395 169.52 82.8058 169.589 82.5025 169.728C82.1991 169.858 81.9391 170.044 81.7225 170.287C81.5145 170.521 81.3498 170.798 81.2285 171.119C81.1071 171.431 81.0465 171.769 81.0465 172.133C81.0465 172.497 81.1071 172.839 81.2285 173.16C81.3585 173.481 81.5318 173.758 81.7485 173.992C81.9738 174.226 82.2381 174.412 82.5415 174.551C82.8448 174.69 83.1741 174.759 83.5295 174.759C83.8935 174.759 84.2271 174.694 84.5301 174.564C84.8341 174.425 85.0941 174.239 85.3101 174.005C85.5271 173.771 85.6961 173.498 85.8171 173.186C85.9391 172.865 85.9991 172.523 85.9991 172.159ZM91.8951 171.665L94.8071 175.5H93.6111L91.2061 172.367L89.8411 173.745V175.5H88.8401V166.01H89.8411V172.562L93.4681 168.779H94.7161L91.8951 171.665ZM96.5091 172.51C96.5441 172.874 96.6301 173.199 96.7691 173.485C96.9081 173.762 97.0851 174.001 97.3021 174.2C97.5191 174.391 97.7611 174.538 98.0301 174.642C98.2991 174.737 98.5801 174.785 98.8751 174.785C99.3431 174.785 99.7421 174.698 100.071 174.525C100.409 174.352 100.717 174.122 100.994 173.836L101.618 174.395C101.28 174.776 100.894 175.084 100.461 175.318C100.028 175.543 99.4901 175.656 98.8491 175.656C98.3901 175.656 97.9561 175.574 97.5491 175.409C97.1421 175.236 96.7861 174.997 96.4831 174.694C96.1801 174.382 95.9371 174.009 95.7551 173.576C95.5821 173.143 95.4951 172.666 95.4951 172.146C95.4951 171.661 95.5731 171.206 95.7291 170.781C95.8941 170.348 96.1191 169.975 96.4051 169.663C96.6911 169.342 97.0291 169.091 97.4191 168.909C97.8181 168.727 98.2511 168.636 98.7191 168.636C99.2131 168.636 99.6551 168.731 100.045 168.922C100.435 169.104 100.764 169.355 101.033 169.676C101.302 169.997 101.505 170.374 101.644 170.807C101.783 171.24 101.852 171.704 101.852 172.198C101.852 172.241 101.852 172.289 101.852 172.341C101.852 172.393 101.848 172.449 101.839 172.51H96.5091ZM96.5091 171.769H100.838C100.812 171.466 100.747 171.175 100.643 170.898C100.548 170.621 100.409 170.378 100.227 170.17C100.054 169.962 99.8371 169.797 99.5771 169.676C99.3261 169.546 99.0311 169.481 98.6931 169.481C98.3981 169.481 98.1251 169.542 97.8741 169.663C97.6231 169.776 97.4021 169.936 97.2111 170.144C97.0201 170.343 96.8641 170.582 96.7431 170.859C96.6221 171.136 96.5441 171.44 96.5091 171.769ZM104.605 171.652V175.5H103.604V168.779H104.605V169.949C104.831 169.585 105.125 169.277 105.489 169.026C105.853 168.766 106.326 168.636 106.906 168.636C107.314 168.636 107.673 168.701 107.985 168.831C108.306 168.961 108.575 169.147 108.791 169.39C109.017 169.624 109.186 169.906 109.298 170.235C109.42 170.564 109.48 170.928 109.48 171.327V175.5H108.479V171.574C108.479 170.95 108.319 170.456 107.998 170.092C107.678 169.728 107.218 169.546 106.62 169.546C106.334 169.546 106.066 169.598 105.814 169.702C105.572 169.797 105.359 169.94 105.177 170.131C104.995 170.313 104.852 170.534 104.748 170.794C104.653 171.054 104.605 171.34 104.605 171.652ZM118.217 174.356L120.492 168.779H121.571L118.646 175.552H117.762L114.85 168.779H115.955L118.217 174.356ZM129.34 172.133C129.34 172.61 129.249 173.065 129.067 173.498C128.894 173.923 128.651 174.295 128.339 174.616C128.027 174.937 127.654 175.192 127.221 175.383C126.788 175.565 126.32 175.656 125.817 175.656C125.314 175.656 124.851 175.565 124.426 175.383C124.001 175.192 123.633 174.941 123.321 174.629C123.009 174.308 122.766 173.936 122.593 173.511C122.42 173.086 122.333 172.636 122.333 172.159C122.333 171.682 122.42 171.232 122.593 170.807C122.766 170.374 123.009 169.997 123.321 169.676C123.633 169.355 124.001 169.104 124.426 168.922C124.859 168.731 125.332 168.636 125.843 168.636C126.346 168.636 126.809 168.731 127.234 168.922C127.667 169.104 128.04 169.355 128.352 169.676C128.664 169.988 128.907 170.356 129.08 170.781C129.253 171.206 129.34 171.656 129.34 172.133ZM128.313 172.159C128.313 171.795 128.248 171.453 128.118 171.132C127.997 170.811 127.823 170.534 127.598 170.3C127.373 170.057 127.108 169.867 126.805 169.728C126.502 169.589 126.172 169.52 125.817 169.52C125.453 169.52 125.119 169.589 124.816 169.728C124.513 169.858 124.253 170.044 124.036 170.287C123.828 170.521 123.663 170.798 123.542 171.119C123.421 171.431 123.36 171.769 123.36 172.133C123.36 172.497 123.421 172.839 123.542 173.16C123.672 173.481 123.845 173.758 124.062 173.992C124.287 174.226 124.552 174.412 124.855 174.551C125.158 174.69 125.488 174.759 125.843 174.759C126.207 174.759 126.541 174.694 126.844 174.564C127.147 174.425 127.407 174.239 127.624 174.005C127.841 173.771 128.01 173.498 128.131 173.186C128.252 172.865 128.313 172.523 128.313 172.159ZM132.505 169.663V173.589C132.505 174.005 132.609 174.295 132.817 174.46C133.025 174.625 133.298 174.707 133.636 174.707C133.809 174.707 133.97 174.69 134.117 174.655C134.273 174.62 134.438 174.56 134.611 174.473V175.331C134.438 175.426 134.251 175.496 134.052 175.539C133.861 175.591 133.645 175.617 133.402 175.617C133.133 175.617 132.882 175.582 132.648 175.513C132.414 175.444 132.21 175.335 132.037 175.188C131.872 175.032 131.742 174.833 131.647 174.59C131.552 174.347 131.504 174.057 131.504 173.719V169.663H130.568V168.779H131.504V166.751H132.505V168.779H134.637V169.663H132.505ZM137.579 167.31H136.435V166.205H137.579V167.31ZM137.501 175.5H136.5V168.779H137.501V175.5ZM140.825 171.652V175.5H139.824V168.779H140.825V169.949C141.05 169.585 141.345 169.277 141.709 169.026C142.073 168.766 142.545 168.636 143.126 168.636C143.533 168.636 143.893 168.701 144.205 168.831C144.526 168.961 144.794 169.147 145.011 169.39C145.236 169.624 145.405 169.906 145.518 170.235C145.639 170.564 145.7 170.928 145.7 171.327V175.5H144.699V171.574C144.699 170.95 144.539 170.456 144.218 170.092C143.897 169.728 143.438 169.546 142.84 169.546C142.554 169.546 142.285 169.598 142.034 169.702C141.791 169.797 141.579 169.94 141.397 170.131C141.215 170.313 141.072 170.534 140.968 170.794C140.873 171.054 140.825 171.34 140.825 171.652ZM154.231 174.33C154.231 174.876 154.148 175.353 153.984 175.76C153.828 176.167 153.598 176.505 153.295 176.774C153 177.051 152.64 177.259 152.216 177.398C151.8 177.537 151.332 177.606 150.812 177.606C150.248 177.606 149.711 177.528 149.2 177.372C148.688 177.216 148.207 176.982 147.757 176.67L148.212 175.89C148.602 176.167 149.009 176.38 149.434 176.527C149.858 176.674 150.313 176.748 150.799 176.748C151.544 176.748 152.138 176.544 152.58 176.137C153.022 175.738 153.243 175.145 153.243 174.356V173.563C152.948 173.953 152.588 174.287 152.164 174.564C151.739 174.841 151.219 174.98 150.604 174.98C150.196 174.98 149.802 174.911 149.421 174.772C149.048 174.625 148.714 174.417 148.42 174.148C148.125 173.871 147.887 173.537 147.705 173.147C147.531 172.757 147.445 172.315 147.445 171.821C147.445 171.327 147.531 170.885 147.705 170.495C147.887 170.096 148.125 169.763 148.42 169.494C148.714 169.217 149.052 169.004 149.434 168.857C149.815 168.71 150.205 168.636 150.604 168.636C150.916 168.636 151.202 168.675 151.462 168.753C151.73 168.822 151.969 168.918 152.177 169.039C152.393 169.16 152.588 169.303 152.762 169.468C152.935 169.633 153.091 169.806 153.23 169.988V168.779H154.231V174.33ZM153.269 171.808C153.269 171.461 153.199 171.149 153.061 170.872C152.922 170.586 152.736 170.343 152.502 170.144C152.276 169.945 152.016 169.793 151.722 169.689C151.427 169.576 151.119 169.52 150.799 169.52C150.478 169.52 150.175 169.572 149.889 169.676C149.611 169.78 149.364 169.932 149.148 170.131C148.94 170.33 148.775 170.573 148.654 170.859C148.532 171.136 148.472 171.448 148.472 171.795C148.472 172.142 148.532 172.458 148.654 172.744C148.784 173.021 148.953 173.264 149.161 173.472C149.377 173.671 149.624 173.827 149.902 173.94C150.188 174.044 150.487 174.096 150.799 174.096C151.119 174.096 151.427 174.044 151.722 173.94C152.016 173.827 152.276 173.671 152.502 173.472C152.736 173.273 152.922 173.034 153.061 172.757C153.199 172.471 153.269 172.155 153.269 171.808ZM166.761 175.5H165.76V174.148C165.621 174.347 165.465 174.538 165.292 174.72C165.127 174.902 164.941 175.062 164.733 175.201C164.525 175.34 164.291 175.448 164.031 175.526C163.78 175.604 163.498 175.643 163.186 175.643C162.779 175.643 162.384 175.565 162.003 175.409C161.622 175.253 161.279 175.028 160.976 174.733C160.673 174.43 160.43 174.061 160.248 173.628C160.066 173.195 159.975 172.701 159.975 172.146C159.975 171.591 160.066 171.097 160.248 170.664C160.43 170.231 160.673 169.867 160.976 169.572C161.279 169.269 161.622 169.039 162.003 168.883C162.384 168.718 162.779 168.636 163.186 168.636C163.498 168.636 163.784 168.675 164.044 168.753C164.304 168.831 164.538 168.935 164.746 169.065C164.954 169.195 165.14 169.347 165.305 169.52C165.478 169.693 165.63 169.875 165.76 170.066V166.01H166.761V175.5ZM165.799 172.133C165.799 171.743 165.73 171.388 165.591 171.067C165.461 170.746 165.279 170.473 165.045 170.248C164.82 170.023 164.56 169.849 164.265 169.728C163.979 169.598 163.68 169.533 163.368 169.533C163.039 169.533 162.731 169.594 162.445 169.715C162.159 169.828 161.908 169.997 161.691 170.222C161.483 170.439 161.314 170.712 161.184 171.041C161.063 171.362 161.002 171.726 161.002 172.133C161.002 172.532 161.063 172.891 161.184 173.212C161.314 173.533 161.487 173.81 161.704 174.044C161.921 174.269 162.172 174.443 162.458 174.564C162.744 174.685 163.047 174.746 163.368 174.746C163.68 174.746 163.979 174.685 164.265 174.564C164.56 174.434 164.82 174.256 165.045 174.031C165.279 173.806 165.461 173.533 165.591 173.212C165.73 172.883 165.799 172.523 165.799 172.133ZM169.596 172.51C169.631 172.874 169.717 173.199 169.856 173.485C169.995 173.762 170.172 174.001 170.389 174.2C170.606 174.391 170.848 174.538 171.117 174.642C171.386 174.737 171.667 174.785 171.962 174.785C172.43 174.785 172.829 174.698 173.158 174.525C173.496 174.352 173.804 174.122 174.081 173.836L174.705 174.395C174.367 174.776 173.981 175.084 173.548 175.318C173.115 175.543 172.577 175.656 171.936 175.656C171.477 175.656 171.043 175.574 170.636 175.409C170.229 175.236 169.873 174.997 169.57 174.694C169.267 174.382 169.024 174.009 168.842 173.576C168.669 173.143 168.582 172.666 168.582 172.146C168.582 171.661 168.66 171.206 168.816 170.781C168.981 170.348 169.206 169.975 169.492 169.663C169.778 169.342 170.116 169.091 170.506 168.909C170.905 168.727 171.338 168.636 171.806 168.636C172.3 168.636 172.742 168.731 173.132 168.922C173.522 169.104 173.851 169.355 174.12 169.676C174.389 169.997 174.592 170.374 174.731 170.807C174.87 171.24 174.939 171.704 174.939 172.198C174.939 172.241 174.939 172.289 174.939 172.341C174.939 172.393 174.935 172.449 174.926 172.51H169.596ZM169.596 171.769H173.925C173.899 171.466 173.834 171.175 173.73 170.898C173.635 170.621 173.496 170.378 173.314 170.17C173.141 169.962 172.924 169.797 172.664 169.676C172.413 169.546 172.118 169.481 171.78 169.481C171.485 169.481 171.212 169.542 170.961 169.663C170.71 169.776 170.489 169.936 170.298 170.144C170.107 170.343 169.951 170.582 169.83 170.859C169.709 171.136 169.631 171.44 169.596 171.769ZM179.122 169.572C178.724 169.572 178.36 169.62 178.03 169.715C177.71 169.802 177.393 169.919 177.081 170.066L176.782 169.247C177.155 169.074 177.532 168.939 177.913 168.844C178.295 168.74 178.732 168.688 179.226 168.688C180.145 168.688 180.851 168.918 181.345 169.377C181.839 169.828 182.086 170.499 182.086 171.392V175.5H181.124V174.486C180.89 174.789 180.574 175.058 180.175 175.292C179.785 175.526 179.291 175.643 178.693 175.643C178.381 175.643 178.074 175.6 177.77 175.513C177.476 175.426 177.207 175.296 176.964 175.123C176.73 174.941 176.54 174.72 176.392 174.46C176.254 174.2 176.184 173.892 176.184 173.537C176.184 173.182 176.254 172.87 176.392 172.601C176.531 172.324 176.726 172.094 176.977 171.912C177.237 171.73 177.541 171.591 177.887 171.496C178.243 171.401 178.633 171.353 179.057 171.353C179.491 171.353 179.868 171.379 180.188 171.431C180.509 171.483 180.821 171.552 181.124 171.639V171.405C181.124 170.798 180.947 170.343 180.591 170.04C180.245 169.728 179.755 169.572 179.122 169.572ZM179.161 172.094C178.529 172.094 178.043 172.22 177.705 172.471C177.367 172.722 177.198 173.065 177.198 173.498C177.198 173.715 177.242 173.905 177.328 174.07C177.424 174.235 177.549 174.378 177.705 174.499C177.861 174.612 178.039 174.698 178.238 174.759C178.446 174.82 178.663 174.85 178.888 174.85C179.2 174.85 179.491 174.807 179.759 174.72C180.037 174.625 180.275 174.499 180.474 174.343C180.682 174.178 180.843 173.988 180.955 173.771C181.077 173.546 181.137 173.299 181.137 173.03V172.38C180.886 172.311 180.596 172.246 180.266 172.185C179.946 172.124 179.577 172.094 179.161 172.094ZM190.616 175.5H189.615V174.148C189.476 174.347 189.32 174.538 189.147 174.72C188.982 174.902 188.796 175.062 188.588 175.201C188.38 175.34 188.146 175.448 187.886 175.526C187.634 175.604 187.353 175.643 187.041 175.643C186.633 175.643 186.239 175.565 185.858 175.409C185.476 175.253 185.134 175.028 184.831 174.733C184.527 174.43 184.285 174.061 184.103 173.628C183.921 173.195 183.83 172.701 183.83 172.146C183.83 171.591 183.921 171.097 184.103 170.664C184.285 170.231 184.527 169.867 184.831 169.572C185.134 169.269 185.476 169.039 185.858 168.883C186.239 168.718 186.633 168.636 187.041 168.636C187.353 168.636 187.639 168.675 187.899 168.753C188.159 168.831 188.393 168.935 188.601 169.065C188.809 169.195 188.995 169.347 189.16 169.52C189.333 169.693 189.485 169.875 189.615 170.066V166.01H190.616V175.5ZM189.654 172.133C189.654 171.743 189.584 171.388 189.446 171.067C189.316 170.746 189.134 170.473 188.9 170.248C188.674 170.023 188.414 169.849 188.12 169.728C187.834 169.598 187.535 169.533 187.223 169.533C186.893 169.533 186.586 169.594 186.3 169.715C186.014 169.828 185.762 169.997 185.546 170.222C185.338 170.439 185.169 170.712 185.039 171.041C184.917 171.362 184.857 171.726 184.857 172.133C184.857 172.532 184.917 172.891 185.039 173.212C185.169 173.533 185.342 173.81 185.559 174.044C185.775 174.269 186.027 174.443 186.313 174.564C186.599 174.685 186.902 174.746 187.223 174.746C187.535 174.746 187.834 174.685 188.12 174.564C188.414 174.434 188.674 174.256 188.9 174.031C189.134 173.806 189.316 173.533 189.446 173.212C189.584 172.883 189.654 172.523 189.654 172.133ZM193.944 175.5H192.943V166.01H193.944V175.5ZM197.437 167.31H196.293V166.205H197.437V167.31ZM197.359 175.5H196.358V168.779H197.359V175.5ZM200.683 171.652V175.5H199.682V168.779H200.683V169.949C200.909 169.585 201.203 169.277 201.567 169.026C201.931 168.766 202.404 168.636 202.984 168.636C203.392 168.636 203.751 168.701 204.063 168.831C204.384 168.961 204.653 169.147 204.869 169.39C205.095 169.624 205.264 169.906 205.376 170.235C205.498 170.564 205.558 170.928 205.558 171.327V175.5H204.557V171.574C204.557 170.95 204.397 170.456 204.076 170.092C203.756 169.728 203.296 169.546 202.698 169.546C202.412 169.546 202.144 169.598 201.892 169.702C201.65 169.797 201.437 169.94 201.255 170.131C201.073 170.313 200.93 170.534 200.826 170.794C200.731 171.054 200.683 171.34 200.683 171.652ZM208.291 172.51C208.326 172.874 208.413 173.199 208.551 173.485C208.69 173.762 208.868 174.001 209.084 174.2C209.301 174.391 209.544 174.538 209.812 174.642C210.081 174.737 210.363 174.785 210.657 174.785C211.125 174.785 211.524 174.698 211.853 174.525C212.191 174.352 212.499 174.122 212.776 173.836L213.4 174.395C213.062 174.776 212.677 175.084 212.243 175.318C211.81 175.543 211.273 175.656 210.631 175.656C210.172 175.656 209.739 175.574 209.331 175.409C208.924 175.236 208.569 174.997 208.265 174.694C207.962 174.382 207.719 174.009 207.537 173.576C207.364 173.143 207.277 172.666 207.277 172.146C207.277 171.661 207.355 171.206 207.511 170.781C207.676 170.348 207.901 169.975 208.187 169.663C208.473 169.342 208.811 169.091 209.201 168.909C209.6 168.727 210.033 168.636 210.501 168.636C210.995 168.636 211.437 168.731 211.827 168.922C212.217 169.104 212.547 169.355 212.815 169.676C213.084 169.997 213.288 170.374 213.426 170.807C213.565 171.24 213.634 171.704 213.634 172.198C213.634 172.241 213.634 172.289 213.634 172.341C213.634 172.393 213.63 172.449 213.621 172.51H208.291ZM208.291 171.769H212.62C212.594 171.466 212.529 171.175 212.425 170.898C212.33 170.621 212.191 170.378 212.009 170.17C211.836 169.962 211.619 169.797 211.359 169.676C211.108 169.546 210.813 169.481 210.475 169.481C210.181 169.481 209.908 169.542 209.656 169.663C209.405 169.776 209.184 169.936 208.993 170.144C208.803 170.343 208.647 170.582 208.525 170.859C208.404 171.136 208.326 171.44 208.291 171.769Z"
        fill="#94A3AE"
      />
      <defs>
        <pattern
          id="pattern0_36_159"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image0_36_159"
            transform="matrix(0.0178571 0 0 0.0167411 0 -0.0189732)"
          />
        </pattern>
        <linearGradient
          id="paint0_linear_36_159"
          x1="11.5066"
          y1="25"
          x2="11.5066"
          y2="68"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0" />
          <stop offset="0.5" stopColor="#00FFD1" />
          <stop offset="1" stopColor="#00FFD1" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_36_159"
          x1="11.5066"
          y1="92"
          x2="11.5066"
          y2="135"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0" />
          <stop offset="0.5" stopColor="#00FFD1" />
          <stop offset="1" stopColor="#00FFD1" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_36_159"
          x1="nan"
          y1="nan"
          x2="nan"
          y2="nan"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0" />
          <stop offset="0.5" stopColor="#00FFD1" />
          <stop offset="1" stopColor="#00FFD1" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_36_159"
          x1="320.499"
          y1="21.812"
          x2="269.26"
          y2="106.564"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0.2" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <clipPath id="clip0_36_159">
          <rect
            width="1"
            height="43"
            fill="white"
            transform="translate(12 25)"
          />
        </clipPath>
        <clipPath id="clip1_36_159">
          <rect
            width="1"
            height="43"
            fill="white"
            transform="translate(12 92)"
          />
        </clipPath>
        <image
          id="image0_36_159"
          width="56"
          height="62"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
}

export function CountdownTitle(props: any) {
  return (
    <svg
      {...props}
      width="360"
      height="20"
      viewBox="0 0 360 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="path-1-outside-1_2142_6472"
        maskUnits="userSpaceOnUse"
        x="-2"
        y="-2"
        width="364"
        height="24"
        fill="black"
      >
        <rect fill="white" x="-2" y="-2" width="364" height="24" />
        <path d="M8.89652 19.39C3.80052 19.39 0.264523 16.296 0.264523 11.408C0.264523 6.442 4.08652 0.409999 11.9385 0.409999C15.8645 0.409999 18.6465 2.49 19.4005 5.714L13.9665 8.08C13.5765 6.598 12.5105 5.87 11.1325 5.87C8.40252 5.87 6.63452 8.366 6.63452 10.862C6.63452 12.864 7.88252 13.982 9.49452 13.982C10.8985 13.982 12.0425 13.306 13.0305 12.084L17.2425 15.412C15.4225 17.804 12.7705 19.39 8.89652 19.39ZM31.4072 19.364C26.0512 19.364 22.3592 15.776 22.3592 11.122C22.3592 5.48 26.9612 0.435999 33.0712 0.435999C38.4272 0.435999 42.1192 4.024 42.1192 8.678C42.1192 14.32 37.5172 19.364 31.4072 19.364ZM31.8232 14.008C34.3712 14.008 36.0092 11.512 36.0092 9.224C36.0092 7.3 34.8392 5.792 32.6552 5.792C30.1072 5.792 28.4692 8.288 28.4692 10.576C28.4692 12.5 29.6392 14.008 31.8232 14.008ZM54.2852 19.364C49.1632 19.364 46.4072 16.92 46.4072 12.812C46.4072 11.876 46.5372 10.862 46.7972 9.874L49.2412 0.799999H55.4292L52.8812 10.264C52.7512 10.784 52.6732 11.278 52.6732 11.694C52.6732 13.202 53.5572 13.982 55.1692 13.982C55.9232 13.982 56.6252 13.722 57.1192 13.228C57.6652 12.682 58.0292 11.98 58.4192 10.576L61.0452 0.799999H67.2332L64.3472 11.512C63.6972 13.93 62.7612 15.698 61.4872 16.972C59.7712 18.688 57.1712 19.364 54.2852 19.364ZM67.5416 19L72.4296 0.799999H78.1236L82.2576 9.484L84.5976 0.799999H90.6296L85.7416 19H80.3336L76.0176 9.952L73.5736 19H67.5416ZM95.7611 19L99.2711 5.948H93.9151L95.2931 0.799999H112.089L110.711 5.948H105.355L101.845 19H95.7611ZM111.905 19L116.793 0.799999H123.241C126.777 0.799999 128.987 1.762 130.365 3.14C131.717 4.492 132.341 6.26 132.341 8.47C132.341 11.2 131.301 13.696 129.351 15.646C127.167 17.83 124.021 19 119.809 19H111.905ZM119.419 13.696H120.485C122.331 13.696 123.917 13.15 124.853 12.214C125.607 11.46 126.153 10.238 126.153 9.12C126.153 8.132 125.867 7.482 125.399 7.014C124.827 6.442 123.917 6.104 122.461 6.104H121.447L119.419 13.696ZM145.63 19.364C140.274 19.364 136.582 15.776 136.582 11.122C136.582 5.48 141.184 0.435999 147.294 0.435999C152.65 0.435999 156.342 4.024 156.342 8.678C156.342 14.32 151.74 19.364 145.63 19.364ZM146.046 14.008C148.594 14.008 150.232 11.512 150.232 9.224C150.232 7.3 149.062 5.792 146.878 5.792C144.33 5.792 142.692 8.288 142.692 10.576C142.692 12.5 143.862 14.008 146.046 14.008ZM161.99 19.13L160.95 0.799999H167.19L167.424 9.536L172.702 0.747999H177.954L178.552 9.536L183.466 0.799999H189.862L178.994 19.13H173.69L172.91 10.082L167.294 19.13H161.99ZM189.178 19L194.066 0.799999H199.76L203.894 9.484L206.234 0.799999H212.266L207.378 19H201.97L197.654 9.952L195.21 19H189.178ZM227.379 19L230.889 5.948H225.533L226.911 0.799999H243.707L242.329 5.948H236.973L233.463 19H227.379ZM254.469 19.364C249.113 19.364 245.421 15.776 245.421 11.122C245.421 5.48 250.023 0.435999 256.133 0.435999C261.489 0.435999 265.181 4.024 265.181 8.678C265.181 14.32 260.579 19.364 254.469 19.364ZM254.885 14.008C257.433 14.008 259.071 11.512 259.071 9.224C259.071 7.3 257.901 5.792 255.717 5.792C253.169 5.792 251.531 8.288 251.531 10.576C251.531 12.5 252.701 14.008 254.885 14.008ZM277.552 19L282.44 0.799999H297.676L296.272 6H287.12L286.496 8.314H294.998L293.724 13.046H285.222L283.636 19H277.552ZM297.589 19L302.477 0.799999H317.999L316.647 5.792H307.105L306.611 7.638H315.503L314.333 12.032H305.441L304.895 14.008H314.567L313.241 19H297.589ZM318.463 19L323.351 0.799999H338.873L337.521 5.792H327.979L327.485 7.638H336.377L335.207 12.032H326.315L325.769 14.008H335.441L334.115 19H318.463ZM339.337 19L344.225 0.799999H350.673C354.209 0.799999 356.419 1.762 357.797 3.14C359.149 4.492 359.773 6.26 359.773 8.47C359.773 11.2 358.733 13.696 356.783 15.646C354.599 17.83 351.453 19 347.241 19H339.337ZM346.851 13.696H347.917C349.763 13.696 351.349 13.15 352.285 12.214C353.039 11.46 353.585 10.238 353.585 9.12C353.585 8.132 353.299 7.482 352.831 7.014C352.259 6.442 351.349 6.104 349.893 6.104H348.879L346.851 13.696Z" />
      </mask>
      <path
        d="M8.89652 19.39C3.80052 19.39 0.264523 16.296 0.264523 11.408C0.264523 6.442 4.08652 0.409999 11.9385 0.409999C15.8645 0.409999 18.6465 2.49 19.4005 5.714L13.9665 8.08C13.5765 6.598 12.5105 5.87 11.1325 5.87C8.40252 5.87 6.63452 8.366 6.63452 10.862C6.63452 12.864 7.88252 13.982 9.49452 13.982C10.8985 13.982 12.0425 13.306 13.0305 12.084L17.2425 15.412C15.4225 17.804 12.7705 19.39 8.89652 19.39ZM31.4072 19.364C26.0512 19.364 22.3592 15.776 22.3592 11.122C22.3592 5.48 26.9612 0.435999 33.0712 0.435999C38.4272 0.435999 42.1192 4.024 42.1192 8.678C42.1192 14.32 37.5172 19.364 31.4072 19.364ZM31.8232 14.008C34.3712 14.008 36.0092 11.512 36.0092 9.224C36.0092 7.3 34.8392 5.792 32.6552 5.792C30.1072 5.792 28.4692 8.288 28.4692 10.576C28.4692 12.5 29.6392 14.008 31.8232 14.008ZM54.2852 19.364C49.1632 19.364 46.4072 16.92 46.4072 12.812C46.4072 11.876 46.5372 10.862 46.7972 9.874L49.2412 0.799999H55.4292L52.8812 10.264C52.7512 10.784 52.6732 11.278 52.6732 11.694C52.6732 13.202 53.5572 13.982 55.1692 13.982C55.9232 13.982 56.6252 13.722 57.1192 13.228C57.6652 12.682 58.0292 11.98 58.4192 10.576L61.0452 0.799999H67.2332L64.3472 11.512C63.6972 13.93 62.7612 15.698 61.4872 16.972C59.7712 18.688 57.1712 19.364 54.2852 19.364ZM67.5416 19L72.4296 0.799999H78.1236L82.2576 9.484L84.5976 0.799999H90.6296L85.7416 19H80.3336L76.0176 9.952L73.5736 19H67.5416ZM95.7611 19L99.2711 5.948H93.9151L95.2931 0.799999H112.089L110.711 5.948H105.355L101.845 19H95.7611ZM111.905 19L116.793 0.799999H123.241C126.777 0.799999 128.987 1.762 130.365 3.14C131.717 4.492 132.341 6.26 132.341 8.47C132.341 11.2 131.301 13.696 129.351 15.646C127.167 17.83 124.021 19 119.809 19H111.905ZM119.419 13.696H120.485C122.331 13.696 123.917 13.15 124.853 12.214C125.607 11.46 126.153 10.238 126.153 9.12C126.153 8.132 125.867 7.482 125.399 7.014C124.827 6.442 123.917 6.104 122.461 6.104H121.447L119.419 13.696ZM145.63 19.364C140.274 19.364 136.582 15.776 136.582 11.122C136.582 5.48 141.184 0.435999 147.294 0.435999C152.65 0.435999 156.342 4.024 156.342 8.678C156.342 14.32 151.74 19.364 145.63 19.364ZM146.046 14.008C148.594 14.008 150.232 11.512 150.232 9.224C150.232 7.3 149.062 5.792 146.878 5.792C144.33 5.792 142.692 8.288 142.692 10.576C142.692 12.5 143.862 14.008 146.046 14.008ZM161.99 19.13L160.95 0.799999H167.19L167.424 9.536L172.702 0.747999H177.954L178.552 9.536L183.466 0.799999H189.862L178.994 19.13H173.69L172.91 10.082L167.294 19.13H161.99ZM189.178 19L194.066 0.799999H199.76L203.894 9.484L206.234 0.799999H212.266L207.378 19H201.97L197.654 9.952L195.21 19H189.178ZM227.379 19L230.889 5.948H225.533L226.911 0.799999H243.707L242.329 5.948H236.973L233.463 19H227.379ZM254.469 19.364C249.113 19.364 245.421 15.776 245.421 11.122C245.421 5.48 250.023 0.435999 256.133 0.435999C261.489 0.435999 265.181 4.024 265.181 8.678C265.181 14.32 260.579 19.364 254.469 19.364ZM254.885 14.008C257.433 14.008 259.071 11.512 259.071 9.224C259.071 7.3 257.901 5.792 255.717 5.792C253.169 5.792 251.531 8.288 251.531 10.576C251.531 12.5 252.701 14.008 254.885 14.008ZM277.552 19L282.44 0.799999H297.676L296.272 6H287.12L286.496 8.314H294.998L293.724 13.046H285.222L283.636 19H277.552ZM297.589 19L302.477 0.799999H317.999L316.647 5.792H307.105L306.611 7.638H315.503L314.333 12.032H305.441L304.895 14.008H314.567L313.241 19H297.589ZM318.463 19L323.351 0.799999H338.873L337.521 5.792H327.979L327.485 7.638H336.377L335.207 12.032H326.315L325.769 14.008H335.441L334.115 19H318.463ZM339.337 19L344.225 0.799999H350.673C354.209 0.799999 356.419 1.762 357.797 3.14C359.149 4.492 359.773 6.26 359.773 8.47C359.773 11.2 358.733 13.696 356.783 15.646C354.599 17.83 351.453 19 347.241 19H339.337ZM346.851 13.696H347.917C349.763 13.696 351.349 13.15 352.285 12.214C353.039 11.46 353.585 10.238 353.585 9.12C353.585 8.132 353.299 7.482 352.831 7.014C352.259 6.442 351.349 6.104 349.893 6.104H348.879L346.851 13.696Z"
        fill="white"
      />
      <path
        d="M19.4005 5.714L20.1989 7.54772C21.0844 7.16218 21.5679 6.19895 21.348 5.25855L19.4005 5.714ZM13.9665 8.08L12.0324 8.58899C12.1809 9.15354 12.5688 9.625 13.0941 9.87967C13.6194 10.1343 14.2297 10.1468 14.7649 9.91372L13.9665 8.08ZM13.0305 12.084L14.2704 10.5147C13.4106 9.83537 12.1642 9.97442 11.4753 10.8266L13.0305 12.084ZM17.2425 15.412L18.8342 16.623C19.4944 15.7553 19.3379 14.5187 18.4824 13.8427L17.2425 15.412ZM8.89652 17.39C6.74845 17.39 5.10196 16.7417 4.01581 15.753C2.94925 14.7821 2.26452 13.3426 2.26452 11.408H-1.73548C-1.73548 14.3614 -0.652205 16.9129 1.32323 18.711C3.27908 20.4913 5.9486 21.39 8.89652 21.39V17.39ZM2.26452 11.408C2.26452 7.36472 5.36457 2.41 11.9385 2.41V-1.59C2.80848 -1.59 -1.73548 5.51928 -1.73548 11.408H2.26452ZM11.9385 2.41C15.0964 2.41 16.9452 3.99803 17.4531 6.16945L21.348 5.25855C20.3478 0.981966 16.6327 -1.59 11.9385 -1.59V2.41ZM18.6021 3.88028L13.1681 6.24628L14.7649 9.91372L20.1989 7.54772L18.6021 3.88028ZM15.9007 7.57101C15.609 6.46273 15.0218 5.49858 14.1234 4.82181C13.2312 4.14964 12.1771 3.87 11.1325 3.87V7.87C11.466 7.87 11.6339 7.95436 11.7166 8.01669C11.7932 8.07442 11.934 8.21527 12.0324 8.58899L15.9007 7.57101ZM11.1325 3.87C6.979 3.87 4.63452 7.60997 4.63452 10.862H8.63452C8.63452 9.12202 9.82604 7.87 11.1325 7.87V3.87ZM4.63452 10.862C4.63452 12.2861 5.08675 13.5979 6.02396 14.5648C6.96011 15.5305 8.21707 15.982 9.49452 15.982V11.982C9.15998 11.982 8.98694 11.8745 8.89609 11.7807C8.80629 11.6881 8.63452 11.4399 8.63452 10.862H4.63452ZM9.49452 15.982C11.6618 15.982 13.3311 14.8933 14.5858 13.3414L11.4753 10.8266C10.754 11.7187 10.1352 11.982 9.49452 11.982V15.982ZM11.7906 13.6533L16.0026 16.9813L18.4824 13.8427L14.2704 10.5147L11.7906 13.6533ZM15.6509 14.201C14.1942 16.1154 12.1217 17.39 8.89652 17.39V21.39C13.4193 21.39 16.6508 19.4926 18.8342 16.623L15.6509 14.201ZM31.4072 17.364C27.0136 17.364 24.3592 14.5344 24.3592 11.122H20.3592C20.3592 17.0176 25.0888 21.364 31.4072 21.364V17.364ZM24.3592 11.122C24.3592 6.5337 28.116 2.436 33.0712 2.436V-1.564C25.8065 -1.564 20.3592 4.4263 20.3592 11.122H24.3592ZM33.0712 2.436C37.4648 2.436 40.1192 5.26556 40.1192 8.678H44.1192C44.1192 2.78243 39.3896 -1.564 33.0712 -1.564V2.436ZM40.1192 8.678C40.1192 13.2663 36.3625 17.364 31.4072 17.364V21.364C38.672 21.364 44.1192 15.3737 44.1192 8.678H40.1192ZM31.8232 16.008C33.81 16.008 35.3969 15.0191 36.4335 13.7234C37.4496 12.4532 38.0092 10.815 38.0092 9.224H34.0092C34.0092 9.921 33.7499 10.6748 33.31 11.2246C32.8906 11.7489 32.3845 12.008 31.8232 12.008V16.008ZM38.0092 9.224C38.0092 7.86611 37.5937 6.49226 36.6262 5.43575C35.6351 4.3535 34.235 3.792 32.6552 3.792V7.792C33.2595 7.792 33.5364 7.9845 33.6763 8.13725C33.8398 8.31574 34.0092 8.65789 34.0092 9.224H38.0092ZM32.6552 3.792C30.6685 3.792 29.0816 4.78087 28.045 6.07661C27.0289 7.34678 26.4692 8.985 26.4692 10.576H30.4692C30.4692 9.87899 30.7286 9.12522 31.1685 8.57539C31.5879 8.05113 32.094 7.792 32.6552 7.792V3.792ZM26.4692 10.576C26.4692 11.9339 26.8848 13.3077 27.8523 14.3642C28.8434 15.4465 30.2435 16.008 31.8232 16.008V12.008C31.219 12.008 30.9421 11.8155 30.8022 11.6628C30.6387 11.4843 30.4692 11.1421 30.4692 10.576H26.4692ZM46.7972 9.874L44.866 9.35385L44.8631 9.36501L46.7972 9.874ZM49.2412 0.799999V-1.2C48.337 -1.2 47.5452 -0.593277 47.31 0.279853L49.2412 0.799999ZM55.4292 0.799999L57.3604 1.31995C57.5222 0.71914 57.3951 0.0772748 57.0166 -0.416575C56.6382 -0.910426 56.0514 -1.2 55.4292 -1.2V0.799999ZM52.8812 10.264L50.95 9.74405C50.9469 9.75565 50.9438 9.76728 50.9409 9.77893L52.8812 10.264ZM57.1192 13.228L55.705 11.8138V11.8138L57.1192 13.228ZM58.4192 10.576L60.3462 11.1113C60.3478 11.1058 60.3493 11.1003 60.3507 11.0948L58.4192 10.576ZM61.0452 0.799999V-1.2C60.1405 -1.2 59.3484 -0.592617 59.1137 0.281157L61.0452 0.799999ZM67.2332 0.799999L69.1644 1.32028C69.3262 0.719445 69.1992 0.0774946 68.8208 -0.416438C68.4423 -0.910369 67.8555 -1.2 67.2332 -1.2V0.799999ZM64.3472 11.512L62.4161 10.9917L62.4158 10.9928L64.3472 11.512ZM61.4872 16.972L60.073 15.5578L61.4872 16.972ZM54.2852 17.364C52.0133 17.364 50.5662 16.8198 49.7172 16.1016C48.9172 15.4248 48.4072 14.3913 48.4072 12.812H44.4072C44.4072 15.3407 45.2752 17.5832 47.1337 19.1554C48.9432 20.6862 51.4351 21.364 54.2852 21.364V17.364ZM48.4072 12.812C48.4072 12.0536 48.5136 11.2105 48.7314 10.383L44.8631 9.36501C44.5608 10.5135 44.4072 11.6984 44.4072 12.812H48.4072ZM48.7284 10.3941L51.1724 1.32014L47.31 0.279853L44.866 9.35385L48.7284 10.3941ZM49.2412 2.8H55.4292V-1.2H49.2412V2.8ZM53.498 0.280052L50.95 9.74405L54.8124 10.7839L57.3604 1.31995L53.498 0.280052ZM50.9409 9.77893C50.7893 10.3855 50.6732 11.054 50.6732 11.694H54.6732C54.6732 11.502 54.7132 11.1824 54.8215 10.7491L50.9409 9.77893ZM50.6732 11.694C50.6732 12.8428 51.0216 14.0213 51.9725 14.8844C52.8903 15.7175 54.0702 15.982 55.1692 15.982V11.982C54.6563 11.982 54.5881 11.8565 54.6609 11.9226C54.6968 11.9552 54.7095 11.9861 54.7068 11.979C54.7006 11.9628 54.6732 11.879 54.6732 11.694H50.6732ZM55.1692 15.982C56.3717 15.982 57.6101 15.5655 58.5334 14.6422L55.705 11.8138C55.6403 11.8785 55.4748 11.982 55.1692 11.982V15.982ZM58.5334 14.6422C59.4381 13.7375 59.9202 12.6449 60.3462 11.1113L56.4922 10.0407C56.1382 11.3151 55.8923 11.6265 55.705 11.8138L58.5334 14.6422ZM60.3507 11.0948L62.9767 1.31884L59.1137 0.281157L56.4877 10.0572L60.3507 11.0948ZM61.0452 2.8H67.2332V-1.2H61.0452V2.8ZM65.3021 0.279716L62.4161 10.9917L66.2784 12.0323L69.1644 1.32028L65.3021 0.279716ZM62.4158 10.9928C61.8256 13.1881 61.0262 14.6046 60.073 15.5578L62.9014 18.3862C64.4962 16.7914 65.5688 14.6719 66.2786 12.0312L62.4158 10.9928ZM60.073 15.5578C58.8946 16.7362 56.9262 17.364 54.2852 17.364V21.364C57.4163 21.364 60.6479 20.6398 62.9014 18.3862L60.073 15.5578ZM67.5415 19L65.61 18.4812C65.4487 19.0819 65.576 19.7235 65.9545 20.2171C66.333 20.7106 66.9196 21 67.5415 21V19ZM72.4296 0.799999V-1.2C71.5248 -1.2 70.7327 -0.592575 70.498 0.28124L72.4296 0.799999ZM78.1236 0.799999L79.9294 -0.0596585C79.5978 -0.756255 78.8951 -1.2 78.1236 -1.2V0.799999ZM82.2576 9.484L80.4517 10.3437C80.8117 11.0997 81.6045 11.5515 82.4384 11.4758C83.2723 11.4001 83.9708 10.8129 84.1887 10.0044L82.2576 9.484ZM84.5976 0.799999V-1.2C83.6934 -1.2 82.9017 -0.593387 82.6664 0.279637L84.5976 0.799999ZM90.6296 0.799999L92.5611 1.31876C92.7224 0.718062 92.5951 0.076499 92.2166 -0.417064C91.8381 -0.910626 91.2515 -1.2 90.6296 -1.2V0.799999ZM85.7416 19V21C86.6463 21 87.4384 20.3926 87.6731 19.5188L85.7416 19ZM80.3336 19L78.5284 19.8611C78.8603 20.5569 79.5626 21 80.3336 21V19ZM76.0176 9.952L77.8227 9.09092C77.4624 8.33561 76.6699 7.88446 75.8365 7.96021C75.0031 8.03595 74.305 8.62257 74.0868 9.43046L76.0176 9.952ZM73.5736 19V21C74.4773 21 75.2687 20.394 75.5044 19.5215L73.5736 19ZM69.4731 19.5188L74.3611 1.31876L70.498 0.28124L65.61 18.4812L69.4731 19.5188ZM72.4296 2.8H78.1236V-1.2H72.4296V2.8ZM76.3177 1.65966L80.4517 10.3437L84.0634 8.62434L79.9294 -0.0596585L76.3177 1.65966ZM84.1887 10.0044L86.5287 1.32036L82.6664 0.279637L80.3264 8.96364L84.1887 10.0044ZM84.5976 2.8H90.6296V-1.2H84.5976V2.8ZM88.698 0.28124L83.81 18.4812L87.6731 19.5188L92.5611 1.31876L88.698 0.28124ZM85.7416 17H80.3336V21H85.7416V17ZM82.1387 18.1389L77.8227 9.09092L74.2124 10.8131L78.5284 19.8611L82.1387 18.1389ZM74.0868 9.43046L71.6428 18.4785L75.5044 19.5215L77.9484 10.4735L74.0868 9.43046ZM73.5736 17H67.5415V21H73.5736V17ZM95.7611 19L93.8297 18.4806C93.6682 19.0814 93.7954 19.7231 94.1738 20.2168C94.5523 20.7105 95.139 21 95.7611 21V19ZM99.2711 5.948L101.202 6.46739C101.364 5.86664 101.237 5.22491 100.858 4.7312C100.48 4.23748 99.8932 3.948 99.2711 3.948V5.948ZM93.9151 5.948L91.9831 5.43085C91.8224 6.0314 91.95 6.67255 92.3286 7.16572C92.7071 7.6589 93.2934 7.948 93.9151 7.948V5.948ZM95.2931 0.799999V-1.2C94.3877 -1.2 93.5952 -0.591757 93.3611 0.282852L95.2931 0.799999ZM112.089 0.799999L114.021 1.31715C114.182 0.716598 114.054 0.0754461 113.676 -0.417726C113.297 -0.910898 112.711 -1.2 112.089 -1.2V0.799999ZM110.711 5.948V7.948C111.617 7.948 112.409 7.33976 112.643 6.46515L110.711 5.948ZM105.355 5.948V3.948C104.451 3.948 103.659 4.5551 103.424 5.4286L105.355 5.948ZM101.845 19V21C102.75 21 103.542 20.3929 103.776 19.5194L101.845 19ZM97.6925 19.5194L101.202 6.46739L97.3397 5.4286L93.8297 18.4806L97.6925 19.5194ZM99.2711 3.948H93.9151V7.948H99.2711V3.948ZM95.8471 6.46515L97.2251 1.31715L93.3611 0.282852L91.9831 5.43085L95.8471 6.46515ZM95.2931 2.8H112.089V-1.2H95.2931V2.8ZM110.157 0.282852L108.779 5.43085L112.643 6.46515L114.021 1.31715L110.157 0.282852ZM110.711 3.948H105.355V7.948H110.711V3.948ZM103.424 5.4286L99.9137 18.4806L103.776 19.5194L107.286 6.46739L103.424 5.4286ZM101.845 17H95.7611V21H101.845V17ZM111.905 19L109.974 18.4812C109.812 19.0819 109.94 19.7235 110.318 20.2171C110.697 20.7106 111.283 21 111.905 21V19ZM116.793 0.799999V-1.2C115.888 -1.2 115.096 -0.592575 114.862 0.28124L116.793 0.799999ZM130.365 3.14L128.951 4.55421V4.55421L130.365 3.14ZM129.351 15.646L130.765 17.0602L129.351 15.646ZM119.419 13.696L117.487 13.1799C117.326 13.7803 117.454 14.4212 117.833 14.9141C118.211 15.4071 118.798 15.696 119.419 15.696V13.696ZM124.853 12.214L126.267 13.6282V13.6282L124.853 12.214ZM125.399 7.014L126.813 5.59979V5.59978L125.399 7.014ZM121.447 6.104V4.104C120.541 4.104 119.749 4.71275 119.515 5.58785L121.447 6.104ZM113.837 19.5188L118.725 1.31876L114.862 0.28124L109.974 18.4812L113.837 19.5188ZM116.793 2.8H123.241V-1.2H116.793V2.8ZM123.241 2.8C126.408 2.8 128.049 3.65192 128.951 4.55421L131.779 1.72579C129.926 -0.127918 127.146 -1.2 123.241 -1.2V2.8ZM128.951 4.55421C129.847 5.45057 130.341 6.66444 130.341 8.47H134.341C134.341 5.85556 133.587 3.53343 131.779 1.72579L128.951 4.55421ZM130.341 8.47C130.341 10.6635 129.516 12.6526 127.937 14.2318L130.765 17.0602C133.086 14.7394 134.341 11.7365 134.341 8.47H130.341ZM127.937 14.2318C126.224 15.9445 123.644 17 119.809 17V21C124.398 21 128.11 19.7155 130.765 17.0602L127.937 14.2318ZM119.809 17H111.905V21H119.809V17ZM119.419 15.696H120.485V11.696H119.419V15.696ZM120.485 15.696C122.661 15.696 124.835 15.0604 126.267 13.6282L123.439 10.7998C122.999 11.2396 122.001 11.696 120.485 11.696V15.696ZM126.267 13.6282C127.373 12.5229 128.153 10.8011 128.153 9.12H124.153C124.153 9.67493 123.842 10.3971 123.439 10.7998L126.267 13.6282ZM128.153 9.12C128.153 7.69706 127.719 6.50538 126.813 5.59979L123.985 8.42821C124.026 8.46962 124.055 8.51019 124.08 8.57811C124.11 8.65542 124.153 8.81846 124.153 9.12H128.153ZM126.813 5.59978C125.72 4.50688 124.198 4.104 122.461 4.104V8.104C123.636 8.104 123.934 8.37712 123.985 8.42821L126.813 5.59978ZM122.461 4.104H121.447V8.104H122.461V4.104ZM119.515 5.58785L117.487 13.1799L121.351 14.2121L123.379 6.62015L119.515 5.58785ZM145.63 17.364C141.236 17.364 138.582 14.5344 138.582 11.122H134.582C134.582 17.0176 139.311 21.364 145.63 21.364V17.364ZM138.582 11.122C138.582 6.5337 142.338 2.436 147.294 2.436V-1.564C140.029 -1.564 134.582 4.4263 134.582 11.122H138.582ZM147.294 2.436C151.687 2.436 154.342 5.26556 154.342 8.678H158.342C158.342 2.78243 153.612 -1.564 147.294 -1.564V2.436ZM154.342 8.678C154.342 13.2663 150.585 17.364 145.63 17.364V21.364C152.894 21.364 158.342 15.3737 158.342 8.678H154.342ZM146.046 16.008C148.032 16.008 149.619 15.0191 150.656 13.7234C151.672 12.4532 152.232 10.815 152.232 9.224H148.232C148.232 9.921 147.972 10.6748 147.532 11.2246C147.113 11.7489 146.607 12.008 146.046 12.008V16.008ZM152.232 9.224C152.232 7.86611 151.816 6.49226 150.848 5.43575C149.857 4.3535 148.457 3.792 146.878 3.792V7.792C147.482 7.792 147.759 7.9845 147.899 8.13725C148.062 8.31574 148.232 8.65789 148.232 9.224H152.232ZM146.878 3.792C144.891 3.792 143.304 4.78087 142.267 6.07661C141.251 7.34678 140.692 8.985 140.692 10.576H144.692C144.692 9.87899 144.951 9.12522 145.391 8.57539C145.81 8.05113 146.316 7.792 146.878 7.792V3.792ZM140.692 10.576C140.692 11.9339 141.107 13.3077 142.075 14.3642C143.066 15.4465 144.466 16.008 146.046 16.008V12.008C145.441 12.008 145.164 11.8155 145.024 11.6628C144.861 11.4843 144.692 11.1421 144.692 10.576H140.692ZM161.99 19.13L159.993 19.2433C160.053 20.3021 160.929 21.13 161.99 21.13V19.13ZM160.95 0.799999V-1.2C160.4 -1.2 159.874 -0.973421 159.496 -0.573576C159.118 -0.17373 158.922 0.364074 158.953 0.913292L160.95 0.799999ZM167.19 0.799999L169.189 0.746447C169.16 -0.336876 168.273 -1.2 167.19 -1.2V0.799999ZM167.424 9.536L165.424 9.58955C165.448 10.4781 166.055 11.2443 166.915 11.4703C167.775 11.6963 168.68 11.3277 169.138 10.5657L167.424 9.536ZM172.702 0.747999V-1.252C171.999 -1.252 171.349 -0.883726 170.987 -0.281738L172.702 0.747999ZM177.954 0.747999L179.949 0.612219C179.878 -0.437223 179.005 -1.252 177.954 -1.252V0.747999ZM178.552 9.536L176.556 9.67178C176.616 10.5539 177.248 11.2919 178.111 11.4868C178.973 11.6817 179.861 11.2871 180.295 10.5165L178.552 9.536ZM183.466 0.799999V-1.2C182.743 -1.2 182.077 -0.810277 181.722 -0.180524L183.466 0.799999ZM189.862 0.799999L191.582 1.82C191.948 1.20182 191.955 0.434514 191.599 -0.189948C191.244 -0.814409 190.58 -1.2 189.862 -1.2V0.799999ZM178.994 19.13V21.13C179.7 21.13 180.354 20.7575 180.714 20.15L178.994 19.13ZM173.69 19.13L171.697 19.3018C171.786 20.3359 172.652 21.13 173.69 21.13V19.13ZM172.91 10.082L174.902 9.91022C174.828 9.0518 174.213 8.33726 173.375 8.13685C172.537 7.93645 171.665 8.29522 171.21 9.02727L172.91 10.082ZM167.294 19.13V21.13C167.985 21.13 168.628 20.7725 168.993 20.1847L167.294 19.13ZM163.986 19.0167L162.946 0.686706L158.953 0.913292L159.993 19.2433L163.986 19.0167ZM160.95 2.8H167.19V-1.2H160.95V2.8ZM165.19 0.853551L165.424 9.58955L169.423 9.48245L169.189 0.746447L165.19 0.853551ZM169.138 10.5657L174.416 1.77774L170.987 -0.281738L165.709 8.50626L169.138 10.5657ZM172.702 2.748H177.954V-1.252H172.702V2.748ZM175.958 0.88378L176.556 9.67178L180.547 9.40022L179.949 0.612219L175.958 0.88378ZM180.295 10.5165L185.209 1.78052L181.722 -0.180524L176.808 8.55548L180.295 10.5165ZM183.466 2.8H189.862V-1.2H183.466V2.8ZM188.141 -0.220007L177.273 18.11L180.714 20.15L191.582 1.82L188.141 -0.220007ZM178.994 17.13H173.69V21.13H178.994V17.13ZM175.682 18.9582L174.902 9.91022L170.917 10.2538L171.697 19.3018L175.682 18.9582ZM171.21 9.02727L165.594 18.0753L168.993 20.1847L174.609 11.1367L171.21 9.02727ZM167.294 17.13H161.99V21.13H167.294V17.13ZM189.178 19L187.246 18.4812C187.085 19.0819 187.212 19.7235 187.591 20.2171C187.969 20.7106 188.556 21 189.178 21V19ZM194.066 0.799999V-1.2C193.161 -1.2 192.369 -0.592575 192.134 0.28124L194.066 0.799999ZM199.76 0.799999L201.566 -0.0596585C201.234 -0.756255 200.531 -1.2 199.76 -1.2V0.799999ZM203.894 9.484L202.088 10.3437C202.448 11.0997 203.241 11.5515 204.075 11.4758C204.909 11.4001 205.607 10.8129 205.825 10.0044L203.894 9.484ZM206.234 0.799999V-1.2C205.33 -1.2 204.538 -0.593387 204.303 0.279637L206.234 0.799999ZM212.266 0.799999L214.197 1.31876C214.359 0.718062 214.231 0.076499 213.853 -0.417064C213.474 -0.910626 212.888 -1.2 212.266 -1.2V0.799999ZM207.378 19V21C208.283 21 209.075 20.3926 209.309 19.5188L207.378 19ZM201.97 19L200.165 19.8611C200.497 20.5569 201.199 21 201.97 21V19ZM197.654 9.952L199.459 9.09092C199.099 8.33561 198.306 7.88446 197.473 7.96021C196.639 8.03595 195.941 8.62257 195.723 9.43046L197.654 9.952ZM195.21 19V21C196.114 21 196.905 20.394 197.141 19.5215L195.21 19ZM191.109 19.5188L195.997 1.31876L192.134 0.28124L187.246 18.4812L191.109 19.5188ZM194.066 2.8H199.76V-1.2H194.066V2.8ZM197.954 1.65966L202.088 10.3437L205.7 8.62434L201.566 -0.0596585L197.954 1.65966ZM205.825 10.0044L208.165 1.32036L204.303 0.279637L201.963 8.96364L205.825 10.0044ZM206.234 2.8H212.266V-1.2H206.234V2.8ZM210.334 0.28124L205.446 18.4812L209.309 19.5188L214.197 1.31876L210.334 0.28124ZM207.378 17H201.97V21H207.378V17ZM203.775 18.1389L199.459 9.09092L195.849 10.8131L200.165 19.8611L203.775 18.1389ZM195.723 9.43046L193.279 18.4785L197.141 19.5215L199.585 10.4735L195.723 9.43046ZM195.21 17H189.178V21H195.21V17ZM227.379 19L225.448 18.4806C225.286 19.0814 225.413 19.7231 225.792 20.2168C226.17 20.7105 226.757 21 227.379 21V19ZM230.889 5.948L232.82 6.46739C232.982 5.86664 232.855 5.22491 232.476 4.7312C232.098 4.23748 231.511 3.948 230.889 3.948V5.948ZM225.533 5.948L223.601 5.43085C223.44 6.0314 223.568 6.67255 223.946 7.16572C224.325 7.6589 224.911 7.948 225.533 7.948V5.948ZM226.911 0.799999V-1.2C226.006 -1.2 225.213 -0.591757 224.979 0.282852L226.911 0.799999ZM243.707 0.799999L245.639 1.31715C245.8 0.716598 245.672 0.0754461 245.294 -0.417726C244.915 -0.910898 244.329 -1.2 243.707 -1.2V0.799999ZM242.329 5.948V7.948C243.234 7.948 244.027 7.33976 244.261 6.46515L242.329 5.948ZM236.973 5.948V3.948C236.068 3.948 235.277 4.5551 235.042 5.4286L236.973 5.948ZM233.463 19V21C234.368 21 235.159 20.3929 235.394 19.5194L233.463 19ZM229.31 19.5194L232.82 6.46739L228.958 5.4286L225.448 18.4806L229.31 19.5194ZM230.889 3.948H225.533V7.948H230.889V3.948ZM227.465 6.46515L228.843 1.31715L224.979 0.282852L223.601 5.43085L227.465 6.46515ZM226.911 2.8H243.707V-1.2H226.911V2.8ZM241.775 0.282852L240.397 5.43085L244.261 6.46515L245.639 1.31715L241.775 0.282852ZM242.329 3.948H236.973V7.948H242.329V3.948ZM235.042 5.4286L231.532 18.4806L235.394 19.5194L238.904 6.46739L235.042 5.4286ZM233.463 17H227.379V21H233.463V17ZM254.469 17.364C250.075 17.364 247.421 14.5344 247.421 11.122H243.421C243.421 17.0176 248.151 21.364 254.469 21.364V17.364ZM247.421 11.122C247.421 6.5337 251.178 2.436 256.133 2.436V-1.564C248.868 -1.564 243.421 4.4263 243.421 11.122H247.421ZM256.133 2.436C260.527 2.436 263.181 5.26556 263.181 8.678H267.181C267.181 2.78243 262.451 -1.564 256.133 -1.564V2.436ZM263.181 8.678C263.181 13.2663 259.424 17.364 254.469 17.364V21.364C261.734 21.364 267.181 15.3737 267.181 8.678H263.181ZM254.885 16.008C256.872 16.008 258.459 15.0191 259.495 13.7234C260.511 12.4532 261.071 10.815 261.071 9.224H257.071C257.071 9.921 256.812 10.6748 256.372 11.2246C255.952 11.7489 255.446 12.008 254.885 12.008V16.008ZM261.071 9.224C261.071 7.86611 260.655 6.49226 259.688 5.43575C258.697 4.3535 257.297 3.792 255.717 3.792V7.792C256.321 7.792 256.598 7.9845 256.738 8.13725C256.901 8.31574 257.071 8.65789 257.071 9.224H261.071ZM255.717 3.792C253.73 3.792 252.143 4.78087 251.107 6.07661C250.091 7.34678 249.531 8.985 249.531 10.576H253.531C253.531 9.87899 253.79 9.12522 254.23 8.57539C254.65 8.05113 255.156 7.792 255.717 7.792V3.792ZM249.531 10.576C249.531 11.9339 249.946 13.3077 250.914 14.3642C251.905 15.4465 253.305 16.008 254.885 16.008V12.008C254.281 12.008 254.004 11.8155 253.864 11.6628C253.7 11.4843 253.531 11.1421 253.531 10.576H249.531ZM277.552 19L275.621 18.4812C275.46 19.0819 275.587 19.7235 275.965 20.2171C276.344 20.7106 276.931 21 277.552 21V19ZM282.44 0.799999V-1.2C281.536 -1.2 280.744 -0.592575 280.509 0.28124L282.44 0.799999ZM297.676 0.799999L299.607 1.32133C299.77 0.720397 299.643 0.0781794 299.264 -0.416007C298.886 -0.910192 298.299 -1.2 297.676 -1.2V0.799999ZM296.272 6V8C297.176 8 297.968 7.39388 298.203 6.52133L296.272 6ZM287.12 6V4C286.216 4 285.425 4.60643 285.189 5.47927L287.12 6ZM286.496 8.314L284.565 7.79327C284.403 8.39415 284.53 9.03621 284.909 9.53025C285.287 10.0243 285.874 10.314 286.496 10.314V8.314ZM294.999 8.314L296.93 8.83395C297.091 8.23314 296.964 7.59128 296.586 7.09743C296.207 6.60357 295.621 6.314 294.999 6.314V8.314ZM293.724 13.046V15.046C294.629 15.046 295.421 14.4392 295.656 13.5659L293.724 13.046ZM285.223 13.046V11.046C284.316 11.046 283.523 11.6554 283.29 12.5312L285.223 13.046ZM283.637 19V21C284.543 21 285.336 20.3906 285.569 19.5148L283.637 19ZM279.484 19.5188L284.372 1.31876L280.509 0.28124L275.621 18.4812L279.484 19.5188ZM282.44 2.8H297.676V-1.2H282.44V2.8ZM295.746 0.278667L294.342 5.47867L298.203 6.52133L299.607 1.32133L295.746 0.278667ZM296.272 4H287.12V8H296.272V4ZM285.189 5.47927L284.565 7.79327L288.428 8.83472L289.052 6.52073L285.189 5.47927ZM286.496 10.314H294.999V6.314H286.496V10.314ZM293.067 7.79405L291.793 12.5261L295.656 13.5659L296.93 8.83395L293.067 7.79405ZM293.724 11.046H285.223V15.046H293.724V11.046ZM283.29 12.5312L281.704 18.4852L285.569 19.5148L287.155 13.5608L283.29 12.5312ZM283.637 17H277.552V21H283.637V17ZM297.589 19L295.657 18.4812C295.496 19.0819 295.623 19.7235 296.002 20.2171C296.38 20.7106 296.967 21 297.589 21V19ZM302.477 0.799999V-1.2C301.572 -1.2 300.78 -0.592575 300.545 0.28124L302.477 0.799999ZM317.999 0.799999L319.929 1.32283C320.092 0.72176 319.966 0.0791602 319.587 -0.41539C319.209 -0.909939 318.621 -1.2 317.999 -1.2V0.799999ZM316.647 5.792V7.792C317.55 7.792 318.341 7.18664 318.577 6.31483L316.647 5.792ZM307.105 5.792V3.792C306.199 3.792 305.407 4.40031 305.173 5.27498L307.105 5.792ZM306.611 7.638L304.679 7.12098C304.518 7.72152 304.646 8.36264 305.024 8.85578C305.403 9.34892 305.989 9.638 306.611 9.638V7.638ZM315.503 7.638L317.435 8.15261C317.595 7.5523 317.467 6.91179 317.089 6.41924C316.71 5.92668 316.124 5.638 315.503 5.638V7.638ZM314.333 12.032V14.032C315.239 14.032 316.032 13.4225 316.265 12.5466L314.333 12.032ZM305.441 12.032V10.032C304.541 10.032 303.753 10.6324 303.513 11.4993L305.441 12.032ZM304.895 14.008L302.967 13.4753C302.801 14.0773 302.925 14.7224 303.303 15.2193C303.682 15.7163 304.27 16.008 304.895 16.008V14.008ZM314.567 14.008L316.5 14.5214C316.659 13.9212 316.531 13.281 316.152 12.7888C315.774 12.2965 315.188 12.008 314.567 12.008V14.008ZM313.241 19V21C314.148 21 314.941 20.3899 315.174 19.5134L313.241 19ZM299.52 19.5188L304.408 1.31876L300.545 0.28124L295.657 18.4812L299.52 19.5188ZM302.477 2.8H317.999V-1.2H302.477V2.8ZM316.068 0.277167L314.716 5.26917L318.577 6.31483L319.929 1.32283L316.068 0.277167ZM316.647 3.792H307.105V7.792H316.647V3.792ZM305.173 5.27498L304.679 7.12098L308.543 8.15502L309.037 6.30902L305.173 5.27498ZM306.611 9.638H315.503V5.638H306.611V9.638ZM313.57 7.12339L312.4 11.5174L316.265 12.5466L317.435 8.15261L313.57 7.12339ZM314.333 10.032H305.441V14.032H314.333V10.032ZM303.513 11.4993L302.967 13.4753L306.823 14.5407L307.368 12.5647L303.513 11.4993ZM304.895 16.008H314.567V12.008H304.895V16.008ZM312.634 13.4946L311.308 18.4866L315.174 19.5134L316.5 14.5214L312.634 13.4946ZM313.241 17H297.589V21H313.241V17ZM318.463 19L316.531 18.4812C316.37 19.0819 316.497 19.7235 316.876 20.2171C317.254 20.7106 317.841 21 318.463 21V19ZM323.351 0.799999V-1.2C322.446 -1.2 321.654 -0.592575 321.419 0.28124L323.351 0.799999ZM338.873 0.799999L340.803 1.32283C340.966 0.72176 340.84 0.0791602 340.461 -0.41539C340.083 -0.909939 339.496 -1.2 338.873 -1.2V0.799999ZM337.521 5.792V7.792C338.424 7.792 339.215 7.18664 339.451 6.31483L337.521 5.792ZM327.979 5.792V3.792C327.073 3.792 326.281 4.40031 326.047 5.27498L327.979 5.792ZM327.485 7.638L325.553 7.12098C325.392 7.72152 325.52 8.36264 325.898 8.85578C326.277 9.34892 326.863 9.638 327.485 9.638V7.638ZM336.377 7.638L338.31 8.15261C338.469 7.5523 338.341 6.91179 337.963 6.41924C337.584 5.92668 336.998 5.638 336.377 5.638V7.638ZM335.207 12.032V14.032C336.113 14.032 336.906 13.4225 337.14 12.5466L335.207 12.032ZM326.315 12.032V10.032C325.415 10.032 324.627 10.6324 324.387 11.4993L326.315 12.032ZM325.769 14.008L323.841 13.4753C323.675 14.0773 323.799 14.7224 324.177 15.2193C324.556 15.7163 325.144 16.008 325.769 16.008V14.008ZM335.441 14.008L337.374 14.5214C337.533 13.9212 337.405 13.281 337.026 12.7888C336.648 12.2965 336.062 12.008 335.441 12.008V14.008ZM334.115 19V21C335.022 21 335.815 20.3899 336.048 19.5134L334.115 19ZM320.394 19.5188L325.282 1.31876L321.419 0.28124L316.531 18.4812L320.394 19.5188ZM323.351 2.8H338.873V-1.2H323.351V2.8ZM336.942 0.277167L335.59 5.26917L339.451 6.31483L340.803 1.32283L336.942 0.277167ZM337.521 3.792H327.979V7.792H337.521V3.792ZM326.047 5.27498L325.553 7.12098L329.417 8.15502L329.911 6.30902L326.047 5.27498ZM327.485 9.638H336.377V5.638H327.485V9.638ZM334.444 7.12339L333.274 11.5174L337.14 12.5466L338.31 8.15261L334.444 7.12339ZM335.207 10.032H326.315V14.032H335.207V10.032ZM324.387 11.4993L323.841 13.4753L327.697 14.5407L328.243 12.5647L324.387 11.4993ZM325.769 16.008H335.441V12.008H325.769V16.008ZM333.508 13.4946L332.182 18.4866L336.048 19.5134L337.374 14.5214L333.508 13.4946ZM334.115 17H318.463V21H334.115V17ZM339.337 19L337.405 18.4812C337.244 19.0819 337.371 19.7235 337.75 20.2171C338.128 20.7106 338.715 21 339.337 21V19ZM344.225 0.799999V-1.2C343.32 -1.2 342.528 -0.592575 342.293 0.28124L344.225 0.799999ZM357.797 3.14L356.383 4.55421V4.55421L357.797 3.14ZM356.783 15.646L358.197 17.0602L356.783 15.646ZM346.851 13.696L344.919 13.1799C344.758 13.7803 344.886 14.4212 345.265 14.9141C345.643 15.4071 346.23 15.696 346.851 15.696V13.696ZM352.285 12.214L353.699 13.6282V13.6282L352.285 12.214ZM352.831 7.014L354.245 5.59979V5.59978L352.831 7.014ZM348.879 6.104V4.104C347.973 4.104 347.181 4.71275 346.947 5.58785L348.879 6.104ZM341.269 19.5188L346.157 1.31876L342.293 0.28124L337.405 18.4812L341.269 19.5188ZM344.225 2.8H350.673V-1.2H344.225V2.8ZM350.673 2.8C353.84 2.8 355.481 3.65192 356.383 4.55421L359.211 1.72579C357.358 -0.127918 354.578 -1.2 350.673 -1.2V2.8ZM356.383 4.55421C357.279 5.45057 357.773 6.66444 357.773 8.47H361.773C361.773 5.85556 361.019 3.53343 359.211 1.72579L356.383 4.55421ZM357.773 8.47C357.773 10.6635 356.948 12.6526 355.369 14.2318L358.197 17.0602C360.518 14.7394 361.773 11.7365 361.773 8.47H357.773ZM355.369 14.2318C353.656 15.9445 351.076 17 347.241 17V21C351.83 21 355.542 19.7155 358.197 17.0602L355.369 14.2318ZM347.241 17H339.337V21H347.241V17ZM346.851 15.696H347.917V11.696H346.851V15.696ZM347.917 15.696C350.093 15.696 352.267 15.0604 353.699 13.6282L350.871 10.7998C350.431 11.2396 349.433 11.696 347.917 11.696V15.696ZM353.699 13.6282C354.805 12.5229 355.585 10.8011 355.585 9.12H351.585C351.585 9.67493 351.273 10.3971 350.871 10.7998L353.699 13.6282ZM355.585 9.12C355.585 7.69706 355.151 6.50538 354.245 5.59979L351.417 8.42821C351.458 8.46962 351.487 8.51019 351.512 8.57811C351.542 8.65542 351.585 8.81846 351.585 9.12H355.585ZM354.245 5.59978C353.152 4.50688 351.63 4.104 349.893 4.104V8.104C351.068 8.104 351.366 8.37712 351.417 8.42821L354.245 5.59978ZM349.893 4.104H348.879V8.104H349.893V4.104ZM346.947 5.58785L344.919 13.1799L348.783 14.2121L350.811 6.62015L346.947 5.58785Z"
        fill="black"
        mask="url(#path-1-outside-1_2142_6472)"
      />
    </svg>
  );
}

export function CountdownMobileTitle(props: any) {
  return (
    <svg
      {...props}
      width="250"
      height="14"
      viewBox="0 0 250 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.88991 13.27C3.36191 13.27 0.913905 11.128 0.913905 7.744C0.913905 4.306 3.55991 0.129999 8.99591 0.129999C11.7139 0.129999 13.6399 1.57 14.1619 3.802L10.3999 5.44C10.1299 4.414 9.39191 3.91 8.43791 3.91C6.54791 3.91 5.32391 5.638 5.32391 7.366C5.32391 8.752 6.18791 9.526 7.30391 9.526C8.27591 9.526 9.06791 9.058 9.75191 8.212L12.6679 10.516C11.4079 12.172 9.57191 13.27 6.88991 13.27ZM22.4742 13.252C18.7662 13.252 16.2102 10.768 16.2102 7.546C16.2102 3.64 19.3962 0.147999 23.6262 0.147999C27.3342 0.147999 29.8902 2.632 29.8902 5.854C29.8902 9.76 26.7042 13.252 22.4742 13.252ZM22.7622 9.544C24.5262 9.544 25.6602 7.816 25.6602 6.232C25.6602 4.9 24.8502 3.856 23.3382 3.856C21.5742 3.856 20.4402 5.584 20.4402 7.168C20.4402 8.5 21.2502 9.544 22.7622 9.544ZM38.3128 13.252C34.7668 13.252 32.8588 11.56 32.8588 8.716C32.8588 8.068 32.9488 7.366 33.1288 6.682L34.8208 0.399999H39.1048L37.3408 6.952C37.2508 7.312 37.1968 7.654 37.1968 7.942C37.1968 8.986 37.8088 9.526 38.9248 9.526C39.4468 9.526 39.9328 9.346 40.2748 9.004C40.6528 8.626 40.9048 8.14 41.1748 7.168L42.9928 0.399999H47.2768L45.2788 7.816C44.8288 9.49 44.1808 10.714 43.2988 11.596C42.1108 12.784 40.3108 13.252 38.3128 13.252ZM47.4903 13L50.8743 0.399999H54.8163L57.6783 6.412L59.2983 0.399999H63.4743L60.0903 13H56.3463L53.3583 6.736L51.6663 13H47.4903ZM67.0269 13L69.4569 3.964H65.7489L66.7029 0.399999H78.3309L77.3769 3.964H73.6689L71.2389 13H67.0269ZM78.2035 13L81.5875 0.399999H86.0515C88.4995 0.399999 90.0295 1.066 90.9835 2.02C91.9195 2.956 92.3515 4.18 92.3515 5.71C92.3515 7.6 91.6315 9.328 90.2815 10.678C88.7695 12.19 86.5915 13 83.6755 13H78.2035ZM83.4055 9.328H84.1435C85.4215 9.328 86.5195 8.95 87.1675 8.302C87.6895 7.78 88.0675 6.934 88.0675 6.16C88.0675 5.476 87.8695 5.026 87.5455 4.702C87.1495 4.306 86.5195 4.072 85.5115 4.072H84.8095L83.4055 9.328ZM101.551 13.252C97.8432 13.252 95.2872 10.768 95.2872 7.546C95.2872 3.64 98.4732 0.147999 102.703 0.147999C106.411 0.147999 108.967 2.632 108.967 5.854C108.967 9.76 105.781 13.252 101.551 13.252ZM101.839 9.544C103.603 9.544 104.737 7.816 104.737 6.232C104.737 4.9 103.927 3.856 102.415 3.856C100.651 3.856 99.5172 5.584 99.5172 7.168C99.5172 8.5 100.327 9.544 101.839 9.544ZM112.877 13.09L112.157 0.399999H116.477L116.639 6.448L120.293 0.364H123.929L124.343 6.448L127.745 0.399999H132.173L124.649 13.09H120.977L120.437 6.826L116.549 13.09H112.877ZM131.7 13L135.084 0.399999H139.026L141.888 6.412L143.508 0.399999H147.684L144.3 13H140.556L137.568 6.736L135.876 13H131.7ZM158.147 13L160.577 3.964H156.869L157.823 0.399999H169.451L168.497 3.964H164.789L162.359 13H158.147ZM176.902 13.252C173.194 13.252 170.638 10.768 170.638 7.546C170.638 3.64 173.824 0.147999 178.054 0.147999C181.762 0.147999 184.318 2.632 184.318 5.854C184.318 9.76 181.132 13.252 176.902 13.252ZM177.19 9.544C178.954 9.544 180.088 7.816 180.088 6.232C180.088 4.9 179.278 3.856 177.766 3.856C176.002 3.856 174.868 5.584 174.868 7.168C174.868 8.5 175.678 9.544 177.19 9.544ZM192.882 13L196.266 0.399999H206.814L205.842 4H199.506L199.074 5.602H204.96L204.078 8.878H198.192L197.094 13H192.882ZM206.754 13L210.138 0.399999H220.884L219.948 3.856H213.342L213 5.134H219.156L218.346 8.176H212.19L211.812 9.544H218.508L217.59 13H206.754ZM221.205 13L224.589 0.399999H235.335L234.399 3.856H227.793L227.451 5.134H233.607L232.797 8.176H226.641L226.263 9.544H232.959L232.041 13H221.205ZM235.656 13L239.04 0.399999H243.504C245.952 0.399999 247.482 1.066 248.436 2.02C249.372 2.956 249.804 4.18 249.804 5.71C249.804 7.6 249.084 9.328 247.734 10.678C246.222 12.19 244.044 13 241.128 13H235.656ZM240.858 9.328H241.596C242.874 9.328 243.972 8.95 244.62 8.302C245.142 7.78 245.52 6.934 245.52 6.16C245.52 5.476 245.322 5.026 244.998 4.702C244.602 4.306 243.972 4.072 242.964 4.072H242.262L240.858 9.328Z"
        fill="white"
      />
    </svg>
  );
}

export function CountdownFinish(props: any) {
  return (
    <img
      {...props}
      src="https://img.ref.finance/images/memeVotePcNovUpdate.png"
    />
  );
}

export function CountdownFinishMobile(props: any) {
  return (
    <img
      {...props}
      src="https://img.ref.finance/images/memeVoteMobileNovUpdate.png"
    />
  );
}

export function CoinPc() {
  return (
    <svg
      width="30"
      height="25"
      viewBox="0 0 30 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.5279 22.2916C25.594 25.4708 20.3017 25.834 15.7123 23.1076C11.1181 20.3813 8.96251 15.5938 10.8964 12.4146C11.0002 12.2448 11.1134 12.0844 11.2313 11.9288L12.2077 10.3251L12.7501 10.6458C15.2642 9.23077 19.1933 9.50435 22.712 11.5939C26.2355 13.6929 28.325 16.9899 28.2354 19.8483L28.8109 20.1879L27.5326 22.2916H27.5279Z"
        fill="#3E3E49"
      />
      <path
        d="M11.2358 11.7611L11.4386 11.8838L11.4292 11.8979L11.4198 11.9073L11.2358 11.7611ZM12.2122 10.1574L12.0094 10.0348L12.132 9.83195L12.3348 9.95458L12.2122 10.1574ZM12.7546 10.4781L12.8725 10.681L12.7499 10.747L12.632 10.6763L12.7546 10.4734V10.4781ZM28.2352 19.6759L28.1126 19.8788L27.9946 19.808V19.6712L28.2352 19.6759ZM28.8106 20.0155L28.9333 19.8127L29.1361 19.9354L29.0135 20.1382L28.8106 20.0155ZM27.5324 22.1192L27.7352 22.2419L27.6126 22.4447L27.4098 22.3221L27.5324 22.1192ZM27.5324 22.1192L27.3296 21.9966L27.4522 21.7938L27.655 21.9164L27.5324 22.1192ZM15.8394 22.7371C18.0988 24.0814 20.5232 24.6522 22.608 24.5107C24.6929 24.3644 26.4145 23.506 27.3296 22.0013L27.7352 22.2419C26.7164 23.9163 24.8297 24.8267 22.6363 24.9776C20.443 25.1286 17.9242 24.5248 15.5941 23.1381L15.8394 22.7371ZM11.1037 12.3696C10.1887 13.8743 10.2264 15.7798 11.0754 17.6666C11.9245 19.5533 13.5753 21.3976 15.8347 22.7371L15.5894 23.1381C13.2546 21.7513 11.533 19.841 10.6415 17.8552C9.75001 15.8742 9.67926 13.7988 10.6934 12.1243L11.099 12.3649L11.1037 12.3696ZM11.4245 11.9073C11.3113 12.0536 11.2028 12.2045 11.1037 12.3696L10.6981 12.129C10.8066 11.9498 10.9245 11.78 11.0519 11.6196L11.4245 11.9073ZM12.415 10.28L11.4386 11.8838L11.033 11.6432L12.0094 10.0395L12.415 10.28ZM12.632 10.681L12.0896 10.3602L12.3348 9.9593L12.8773 10.28L12.632 10.681ZM22.5939 11.6291C19.1223 9.5678 15.2875 9.32253 12.8678 10.6857L12.6367 10.28C15.2498 8.8084 19.2733 9.11027 22.8392 11.2281L22.5939 11.6291ZM27.9994 19.6712C28.0843 16.926 26.0655 13.695 22.5939 11.6338L22.8392 11.2328C26.4051 13.346 28.5607 16.7138 28.471 19.6806L27.9994 19.6712ZM28.688 20.2184L28.1126 19.8788L28.3578 19.4778L28.9333 19.8174L28.688 20.2184ZM27.3296 22.0013L28.6078 19.8976L29.0135 20.1382L27.7352 22.2419L27.3296 22.0013Z"
        fill="black"
      />
      <path
        d="M17.0299 20.9119C19.3083 22.2609 21.7569 22.8458 23.8699 22.7043C25.9829 22.5628 28.0137 21.5412 28.9496 20.0035C29.8903 18.4658 29.5708 16.6762 28.7057 14.7706C27.8407 12.8651 26.172 11.0113 23.8936 9.65762C21.6104 8.30861 19.1618 7.72844 17.0535 7.86523C14.9405 8.00674 13.1773 8.87463 12.2413 10.4123C11.3006 11.95 11.3526 13.8933 12.2177 15.7989C13.0827 17.7045 14.7514 19.5582 17.0299 20.9119Z"
        fill="#A0A0BF"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M17.7263 19.8034C19.58 20.9025 21.5658 21.3789 23.2686 21.2609C24.9761 21.1477 26.3769 20.4449 27.1175 19.228C27.858 18.0063 27.8297 16.4592 27.1316 14.9168C26.4336 13.3744 25.0798 11.865 23.2261 10.766C21.3724 9.66701 19.3866 9.19062 17.6839 9.30854C15.9764 9.42174 14.5755 10.1245 13.8349 11.3415C13.0944 12.5631 13.1227 14.1103 13.8208 15.6526C14.5189 17.195 15.8726 18.7044 17.7263 19.8034Z"
        fill="black"
        stroke="black"
      />
      <path
        d="M17.6652 19.908C19.5377 21.0212 21.5329 21.5259 23.2404 21.4457C24.9479 21.3655 26.3235 20.8216 27.0499 19.6236C27.781 18.4255 27.745 16.7761 27.0092 15.2478C26.2781 13.7196 24.8913 12.2196 23.0187 11.1065C21.1462 9.9933 19.1509 9.4886 17.4435 9.56878C15.736 9.64425 14.3256 10.3046 13.5993 11.5027C12.8682 12.7007 12.9389 14.2384 13.6747 15.7667C14.4058 17.2949 15.7926 18.7949 17.6652 19.908Z"
        fill="#717194"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M21.1016 19.0768C20.8753 18.7268 20.9146 18.2679 21.1972 17.9615L21.4623 17.674C21.8669 17.2352 22.5767 17.296 22.9008 17.7972C23.1272 18.1472 23.0879 18.6061 22.8053 18.9125L22.5401 19.2C22.1355 19.6388 21.4258 19.578 21.1016 19.0768ZM19.6448 16.4736L19.6524 16.3046C20.3035 15.4362 20.4855 14.8974 20.1906 14.6288C20.0253 14.4759 19.8092 14.4915 19.5792 14.7377C19.4351 14.8937 19.3135 15.0917 19.2245 15.3617C19.1207 15.677 18.7965 15.8927 18.4824 15.7854C17.7997 15.5522 17.3394 14.8621 17.6331 14.2032C17.8127 13.8003 18.0655 13.4127 18.3929 13.0574C19.3258 12.0454 20.492 11.9079 21.2995 12.647C22.1098 13.3822 22.3538 14.5227 21.3875 16.004L21.5334 16.2903C21.6788 16.5757 21.6309 16.9214 21.4134 17.1564C21.1114 17.4828 20.5956 17.4834 20.2927 17.1578L19.6463 16.4626L19.6448 16.4736Z"
        fill="black"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.06182 17.1571C5.22522 20.7135 11.1456 21.1198 16.2797 18.0699C21.4191 15.0201 23.8305 9.66433 21.6671 6.1079C21.551 5.91795 21.4244 5.73854 21.2924 5.56441L20.2002 3.77037L19.5934 4.12918C16.781 2.5462 12.3856 2.85225 8.44922 5.18978C4.50761 7.53786 2.17008 11.2262 2.27033 14.4238L1.62659 14.8037L3.05654 17.1571H3.06182Z"
        fill="#00B796"
      />
      <path
        d="M21.2874 5.57062L21.0605 5.70781L21.0711 5.72364L21.0816 5.73419L21.2874 5.57062ZM20.1952 3.77658L20.4221 3.63939L20.2849 3.41249L20.058 3.54968L20.1952 3.77658ZM19.5884 4.13539L19.4565 4.36228L19.5936 4.43615L19.7256 4.357L19.5884 4.13011V4.13539ZM2.27059 14.4247L2.40778 14.6516L2.53969 14.5725V14.4195L2.27059 14.4247ZM1.62684 14.8047L1.48965 14.5778L1.26276 14.715L1.39995 14.9419L1.62684 14.8047ZM3.0568 17.158L2.8299 17.2952L2.9671 17.5221L3.19399 17.3849L3.0568 17.158ZM3.0568 17.158L3.28369 17.0208L3.1465 16.7939L2.91961 16.9311L3.0568 17.158ZM16.1375 17.8493C13.61 19.3531 10.8978 19.9916 8.56556 19.8333C6.23331 19.6697 4.30735 18.7093 3.28369 17.0261L2.8299 17.2952C3.96965 19.1684 6.08029 20.1868 8.5339 20.3556C10.9875 20.5245 13.8052 19.8491 16.4119 18.2978L16.1375 17.8493ZM21.4352 6.2513C22.4588 7.93453 22.4166 10.0663 21.4668 12.1769C20.517 14.2876 18.6702 16.3507 16.1428 17.8493L16.4171 18.2978C19.029 16.7464 20.955 14.6094 21.9523 12.388C22.9496 10.1718 23.0287 7.85011 21.8942 5.97692L21.4404 6.24602L21.4352 6.2513ZM21.0764 5.73419C21.203 5.89777 21.3244 6.06662 21.4352 6.2513L21.889 5.98219C21.7676 5.78168 21.6357 5.59173 21.4932 5.41232L21.0764 5.73419ZM19.9683 3.91377L21.0605 5.70781L21.5143 5.4387L20.4221 3.64466L19.9683 3.91377ZM19.7256 4.36228L20.3324 4.00347L20.058 3.55496L19.4512 3.91377L19.7256 4.36228ZM8.58139 5.42287C12.465 3.117 16.7548 2.84262 19.4617 4.36756L19.7203 3.91377C16.797 2.26747 12.2961 2.60517 8.30701 4.97436L8.58139 5.42287ZM2.53442 14.4195C2.43944 11.3485 4.69782 7.73402 8.58139 5.42815L8.30701 4.97964C4.3179 7.34355 1.9065 11.111 2.00676 14.43L2.53442 14.4195ZM1.76403 15.0316L2.40778 14.6516L2.13339 14.2031L1.48965 14.583L1.76403 15.0316ZM3.28369 17.0261L1.85373 14.6727L1.39995 14.9419L2.8299 17.2952L3.28369 17.0261Z"
        fill="black"
      />
      <path
        d="M14.7759 15.6169C12.2326 17.126 9.49932 17.7803 7.14068 17.622C4.78205 17.4637 2.81388 16.4928 1.76911 14.7727C0.719068 13.0525 0.777111 10.8785 1.74273 8.74678C2.70834 6.61504 4.57098 4.54134 7.1143 3.02695C9.66289 1.51785 12.3962 0.868825 14.7495 1.02185C17.1082 1.18014 19.0763 2.15104 20.1211 3.87121C21.1711 5.59138 21.1131 7.76534 20.1475 9.89708C19.1819 12.0288 17.3192 14.1025 14.7759 15.6169Z"
        fill="#00FFD1"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M14.0266 14.3772C11.9529 15.6067 9.73141 16.1396 7.82656 16.0077C5.91644 15.881 4.34929 15.0948 3.52086 13.7335C2.69244 12.3668 2.7241 10.6361 3.50503 8.91066C4.28597 7.18521 5.80035 5.4967 7.87405 4.26725C9.94775 3.03781 12.1692 2.50487 14.074 2.63679C15.9842 2.76343 17.5513 3.54964 18.3797 4.911C19.2082 6.27764 19.1765 8.00836 18.3956 9.7338C17.6146 11.4593 16.1003 13.1478 14.0266 14.3772Z"
        fill="black"
        stroke="black"
      />
      <path
        d="M14.0952 14.4915C12.0004 15.7368 9.7684 16.3014 7.85827 16.2117C5.94815 16.122 4.37045 15.3885 3.55785 14.0483C2.73998 12.708 2.81913 10.9879 3.64228 9.27825C4.46015 7.56863 6.01147 5.89068 8.10627 4.6454C10.2011 3.40012 12.4331 2.83553 14.3432 2.92523C16.2533 3.00966 17.831 3.74838 18.6436 5.08863C19.4615 6.42889 19.3824 8.14906 18.5592 9.85868C17.7413 11.5683 16.19 13.2462 14.0952 14.4915Z"
        fill="#00D9B2"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M7.87174 12.3347C8.04529 11.9019 8.48984 11.6414 8.95224 11.7017L9.38613 11.7583C10.0482 11.8446 10.451 12.5322 10.2025 13.1519C10.0289 13.5847 9.5844 13.8451 9.122 13.7848L8.68811 13.7283C8.02607 13.642 7.62325 12.9544 7.87174 12.3347ZM9.30898 9.32279L9.46826 9.2206C10.682 9.25466 11.2917 9.07299 11.3466 8.63018C11.3795 8.38038 11.2258 8.19304 10.8523 8.14194C10.6168 8.11109 10.3573 8.12785 10.0533 8.22096C9.6982 8.32968 9.29185 8.17282 9.187 7.81659C8.95915 7.04242 9.29227 6.17626 10.0838 6.01908C10.5679 5.92297 11.0852 5.90366 11.6212 5.97327C13.148 6.17197 14.0268 7.14844 13.873 8.36335C13.7247 9.57826 12.8405 10.5377 10.8633 10.6115L10.6959 10.9297C10.5292 11.2468 10.1825 11.4262 9.8273 11.3793C9.33413 11.3142 9.00046 10.8435 9.10238 10.3566L9.31997 9.31711L9.30898 9.32279Z"
        fill="black"
      />
    </svg>
  );
}

export function CoinMobile() {
  return (
    <svg
      width="38"
      height="31"
      viewBox="0 0 38 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M34.4523 27.4633C32.1518 31.2451 25.8562 31.6772 20.3966 28.434C14.9315 25.1908 12.3672 19.4956 14.6677 15.7137C14.7912 15.5117 14.9258 15.3209 15.0661 15.1358L16.2276 13.228L16.8729 13.6096C19.8636 11.9262 24.5376 12.2517 28.7234 14.7374C32.9149 17.2343 35.4006 21.1564 35.294 24.5567L35.9785 24.9607L34.4579 27.4633H34.4523Z"
        fill="#3E3E49"
      />
      <path
        d="M15.0703 14.9406L15.3116 15.0865L15.3004 15.1033L15.2891 15.1145L15.0703 14.9406ZM16.2318 13.0328L15.9905 12.8869L16.1364 12.6456L16.3777 12.7915L16.2318 13.0328ZM16.8771 13.4144L17.0173 13.6556L16.8715 13.7342L16.7312 13.65L16.8771 13.4087V13.4144ZM35.2925 24.3559L35.1467 24.5972L35.0064 24.513V24.3503L35.2925 24.3559ZM35.9771 24.7599L36.123 24.5186L36.3643 24.6645L36.2184 24.9058L35.9771 24.7599ZM34.4565 27.2624L34.6978 27.4083L34.5519 27.6496L34.3106 27.5037L34.4565 27.2624ZM34.4565 27.2624L34.2152 27.1165L34.3611 26.8753L34.6024 27.0212L34.4565 27.2624ZM20.5467 27.9975C23.2344 29.5966 26.1185 30.2756 28.5986 30.1072C31.0786 29.9333 33.1267 28.9121 34.2152 27.1222L34.6978 27.4083C33.4858 29.4002 31.2414 30.4832 28.6322 30.6627C26.0231 30.8423 23.0268 30.1241 20.2549 28.4744L20.5467 27.9975ZM14.9132 15.6644C13.8247 17.4543 13.8695 19.7212 14.8795 21.9656C15.8895 24.21 17.8534 26.4039 20.5411 27.9975L20.2493 28.4744C17.4718 26.8248 15.4238 24.5523 14.3633 22.19C13.3028 19.8334 13.2187 17.3645 14.425 15.3726L14.9076 15.6588L14.9132 15.6644ZM15.2947 15.1145C15.1601 15.2884 15.031 15.468 14.9132 15.6644L14.4306 15.3782C14.5597 15.165 14.7 14.963 14.8515 14.7722L15.2947 15.1145ZM16.4731 13.1787L15.3116 15.0865L14.829 14.8003L15.9905 12.8925L16.4731 13.1787ZM16.7312 13.6556L16.0859 13.2741L16.3777 12.7971L17.023 13.1787L16.7312 13.6556ZM28.5817 14.7835C24.452 12.3314 19.8902 12.0396 17.0117 13.6612L16.7368 13.1787C19.8453 11.428 24.6315 11.7872 28.8735 14.3065L28.5817 14.7835ZM35.012 24.3503C35.113 21.0847 32.7115 17.2411 28.5817 14.7891L28.8735 14.3121C33.1155 16.8259 35.6797 20.8322 35.5731 24.3615L35.012 24.3503ZM35.8312 25.0012L35.1467 24.5972L35.4384 24.1202L36.123 24.5242L35.8312 25.0012ZM34.2152 27.1222L35.7358 24.6196L36.2184 24.9058L34.6978 27.4083L34.2152 27.1222Z"
        fill="black"
      />
      <path
        d="M21.964 25.8256C24.6744 27.4304 27.5872 28.1262 30.1008 27.9578C32.6144 27.7895 35.0301 26.5742 36.1435 24.745C37.2626 22.9158 36.8825 20.7869 35.8534 18.52C34.8244 16.2532 32.8393 14.048 30.1289 12.4377C27.4129 10.8329 24.5 10.1427 21.9921 10.3055C19.4785 10.4738 17.381 11.5062 16.2676 13.3354C15.1486 15.1646 15.2104 17.4764 16.2395 19.7432C17.2685 22.0101 19.2535 24.2153 21.964 25.8256Z"
        fill="#A0A0BF"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M22.7925 24.5103C24.9976 25.8177 27.3599 26.3844 29.3854 26.2441C31.4166 26.1095 33.0831 25.2734 33.9641 23.8258C34.845 22.3725 34.8113 20.5321 33.9809 18.6973C33.1505 16.8625 31.5401 15.0669 29.3349 13.7595C27.1298 12.4522 24.7675 11.8854 22.742 12.0257C20.7108 12.1604 19.0443 12.9964 18.1633 14.4441C17.2824 15.8974 17.3161 17.7378 18.1465 19.5726C18.9769 21.4074 20.5873 23.2029 22.7925 24.5103Z"
        fill="black"
        stroke="black"
      />
      <path
        d="M22.721 24.6344C24.9486 25.9586 27.3221 26.559 29.3533 26.4636C31.3845 26.3682 33.0209 25.7212 33.885 24.296C34.7547 22.8708 34.7119 20.9087 33.8365 19.0907C32.9668 17.2727 31.3172 15.4884 29.0896 14.1642C26.862 12.84 24.4885 12.2396 22.4573 12.335C20.4261 12.4248 18.7484 13.2103 17.8843 14.6355C17.0146 16.0607 17.0988 17.8899 17.9741 19.7079C18.8438 21.5259 20.4934 23.3102 22.721 24.6344Z"
        fill="#717194"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M26.8083 23.6441C26.539 23.2278 26.5858 22.6819 26.9219 22.3174L27.2374 21.9753C27.7187 21.4534 28.563 21.5257 28.9486 22.1219C29.2179 22.5382 29.1711 23.0841 28.835 23.4486L28.5195 23.7907C28.0382 24.3126 27.1939 24.2403 26.8083 23.6441ZM25.0752 20.5473L25.0843 20.3463C25.8589 19.3133 26.0754 18.6724 25.7246 18.3529C25.5279 18.1709 25.2708 18.1895 24.9972 18.4824C24.8259 18.6679 24.6811 18.9035 24.5753 19.2247C24.4518 19.5998 24.0662 19.8563 23.6925 19.7287C22.8804 19.4513 22.3327 18.6304 22.6821 17.8466C22.8958 17.3673 23.1966 16.9062 23.5861 16.4835C24.6958 15.2797 26.0831 15.116 27.0437 15.9953C28.0076 16.8698 28.2979 18.2266 27.1483 19.9887L27.3219 20.3294C27.4949 20.6688 27.4379 21.08 27.1792 21.3596C26.8199 21.7479 26.2063 21.7487 25.8461 21.3613L25.077 20.5343L25.0752 20.5473Z"
        fill="black"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.49262 20.5311C6.10759 24.8299 13.2637 25.321 19.4694 21.6345C25.6816 17.9481 28.5963 11.4744 25.9813 7.17566C25.841 6.94606 25.688 6.72921 25.5285 6.51873L24.2083 4.35022L23.4748 4.78392C20.0753 2.87053 14.7625 3.24046 10.0045 6.0659C5.24018 8.90409 2.41474 13.3623 2.53593 17.2273L1.75781 17.6866L3.48624 20.5311H3.49262Z"
        fill="#00B796"
      />
      <path
        d="M25.5218 6.52413L25.2475 6.68996L25.2603 6.7091L25.273 6.72185L25.5218 6.52413ZM24.2015 4.35562L24.4758 4.1898L24.31 3.91554L24.0357 4.08137L24.2015 4.35562ZM23.4681 4.78933L23.3086 5.06358L23.4744 5.15287L23.6339 5.0572L23.4681 4.78295V4.78933ZM2.53558 17.2264L2.7014 17.5006L2.86085 17.405V17.22L2.53558 17.2264ZM1.75746 17.6856L1.59164 17.4113L1.31738 17.5772L1.48321 17.8514L1.75746 17.6856ZM3.48589 20.5302L3.21164 20.696L3.37747 20.9702L3.65172 20.8044L3.48589 20.5302ZM3.48589 20.5302L3.76015 20.3643L3.59432 20.0901L3.32007 20.2559L3.48589 20.5302ZM19.2969 21.3657C16.2418 23.1834 12.9636 23.9551 10.1445 23.7638C7.32543 23.5661 4.99747 22.4053 3.76015 20.3707L3.21164 20.696C4.58928 22.9602 7.14047 24.1911 10.1062 24.3952C13.072 24.5993 16.4778 23.7829 19.6285 21.9078L19.2969 21.3657ZM25.7004 7.34689C26.9377 9.38147 26.8867 11.9582 25.7386 14.5094C24.5906 17.0605 22.3583 19.5543 19.3033 21.3657L19.6349 21.9078C22.792 20.0327 25.12 17.4496 26.3254 14.7645C27.5308 12.0857 27.6265 9.27942 26.2552 7.01524L25.7067 7.34051L25.7004 7.34689ZM25.2667 6.72185C25.4197 6.91957 25.5664 7.12366 25.7004 7.34689L26.2489 7.02162C26.1022 6.77925 25.9427 6.54965 25.7705 6.3328L25.2667 6.72185ZM23.9273 4.52145L25.2475 6.68996L25.796 6.36469L24.4758 4.19618L23.9273 4.52145ZM23.6339 5.06358L24.3674 4.62988L24.0357 4.08775L23.3022 4.52145L23.6339 5.06358ZM10.1636 6.34555C14.8578 3.55838 20.0431 3.22672 23.315 5.06996L23.6275 4.52145C20.0941 2.53153 14.6537 2.93972 9.83197 5.80342L10.1636 6.34555ZM2.85447 17.22C2.73967 13.508 5.46944 9.1391 10.1636 6.35193L9.83197 5.8098C5.01023 8.66713 2.0955 13.221 2.21668 17.2327L2.85447 17.22ZM1.92329 17.9598L2.7014 17.5006L2.36975 16.9585L1.59164 17.4177L1.92329 17.9598ZM3.76015 20.3707L2.03172 17.5261L1.48321 17.8514L3.21164 20.696L3.76015 20.3707Z"
        fill="black"
      />
      <path
        d="M17.6513 18.6679C14.5772 20.492 11.2734 21.2828 8.42242 21.0915C5.57147 20.9002 3.19248 19.7266 1.92965 17.6474C0.660429 15.5682 0.730587 12.9405 1.89776 10.3638C3.06492 7.78705 5.31635 5.28051 8.39053 3.45003C11.4711 1.62594 14.7749 0.841445 17.6195 1.02641C20.4704 1.21774 22.8494 2.39129 24.1122 4.47051C25.3814 6.54973 25.3113 9.17745 24.1441 11.7542C22.9769 14.3309 20.7255 16.8374 17.6513 18.6679Z"
        fill="#00FFD1"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M16.7452 17.1707C14.2387 18.6568 11.5536 19.301 9.25111 19.1415C6.94228 18.9884 5.04802 18.0381 4.04668 16.3926C3.04534 14.7407 3.08361 12.6487 4.02755 10.5632C4.97149 8.47756 6.80197 6.4366 9.30851 4.95054C11.8151 3.46447 14.5002 2.8203 16.8026 2.97975C19.1114 3.13282 21.0057 4.08313 22.007 5.72865C23.0084 7.38054 22.9701 9.47252 22.0262 11.5581C21.0822 13.6437 19.2518 15.6847 16.7452 17.1707Z"
        fill="black"
        stroke="black"
      />
      <path
        d="M16.8279 17.31C14.2959 18.8152 11.598 19.4977 9.28918 19.3892C6.98036 19.2808 5.07334 18.3943 4.09114 16.7743C3.10255 15.1543 3.19822 13.075 4.19318 11.0086C5.18177 8.94211 7.05689 6.91392 9.58895 5.40872C12.121 3.90351 14.8189 3.22107 17.1277 3.3295C19.4365 3.43155 21.3435 4.32446 22.3258 5.94447C23.3143 7.56447 23.2187 9.64369 22.2237 11.7102C21.2351 13.7766 19.36 15.8048 16.8279 17.31Z"
        fill="#00D9B2"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M9.30676 14.6975C9.51654 14.1744 10.0539 13.8596 10.6128 13.9325L11.1373 14.0008C11.9375 14.1051 12.4244 14.9363 12.124 15.6853C11.9142 16.2084 11.3769 16.5232 10.818 16.4504L10.2935 16.382C9.4933 16.2777 9.00641 15.4466 9.30676 14.6975ZM11.044 11.057L11.2365 10.9335C12.7036 10.9746 13.4405 10.7551 13.5069 10.2198C13.5467 9.91787 13.3609 9.69142 12.9094 9.62966C12.6248 9.59237 12.3112 9.61262 11.9436 9.72517C11.5145 9.85659 11.0233 9.66698 10.8966 9.2364C10.6212 8.30064 11.0238 7.25369 11.9806 7.0637C12.5657 6.94752 13.191 6.92418 13.8388 7.00833C15.6844 7.2485 16.7465 8.42879 16.5606 9.89729C16.3814 11.3658 15.3126 12.5255 12.9227 12.6147L12.7096 13.0199C12.5146 13.3908 12.109 13.6007 11.6936 13.5459L11.6348 13.5381C11.058 13.4619 10.6677 12.9113 10.7869 12.3418L11.0573 11.0501L11.044 11.057Z"
        fill="black"
      />
    </svg>
  );
}

export function RuleTips() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="8.75" stroke="#FFBB54" strokeWidth="1.5" />
      <path
        d="M10 10L10 14"
        stroke="#FFBB54"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="10" cy="6.25" r="0.75" fill="#7E8A93" stroke="#FFBB54" />
    </svg>
  );
}

export function RuleIcon() {
  return (
    <svg
      width="11"
      height="12"
      viewBox="0 0 11 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 11.5H2C1.17157 11.5 0.5 10.8284 0.5 10V2C0.5 1.17157 1.17157 0.5 2 0.5H9C9.82843 0.5 10.5 1.17157 10.5 2V6.85714V10C10.5 10.8284 9.82843 11.5 9 11.5Z"
        stroke="white"
      />
      <line x1="2.5" y1="4.5" x2="7.5" y2="4.5" stroke="white" />
      <line x1="2.5" y1="7.5" x2="5.5" y2="7.5" stroke="white" />
    </svg>
  );
}

export function TriangleUp() {
  return (
    <svg
      width="9"
      height="6"
      viewBox="0 0 9 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.22929 0.777328C4.83426 0.356276 4.16574 0.356275 3.77072 0.777328L0.45095 4.31579C-0.148156 4.95436 0.30462 6 1.18024 6H7.81976C8.69538 6 9.14815 4.95436 8.54905 4.31579L5.22929 0.777328Z"
        fill="white"
      />
    </svg>
  );
}

export function TriangleDown() {
  return (
    <svg
      width="9"
      height="6"
      viewBox="0 0 9 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.22929 5.22267C4.83426 5.64372 4.16574 5.64372 3.77072 5.22267L0.45095 1.68421C-0.148156 1.04564 0.30462 0 1.18024 0H7.81976C8.69538 0 9.14815 1.04564 8.54905 1.68421L5.22929 5.22267Z"
        fill="#7E8A93"
      />
    </svg>
  );
}

export function UserRankingPC() {
  return (
    <svg
      width="55"
      height="42"
      viewBox="0 0 55 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.5845 14.5234L1.09424 19.0196L13.0841 20.5184L12.5845 14.5234Z"
        fill="#A55F00"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M44.0577 27.0128L43.5581 41.001L52.5505 32.5081L54.0492 19.0195L44.0577 27.0128Z"
        fill="#F89E28"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M54.0487 19.0177L39.0613 18.0186L29.5693 25.0126L44.0571 27.011L54.0487 19.0177Z"
        fill="#FFBC15"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M39.0613 18.0172L40.5601 2.53027L29.5693 7.02647V25.0113L39.0613 18.0172Z"
        fill="#FFBC15"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M23.5763 1.0332L11.5864 5.02983L29.0717 7.02814L40.562 2.53194L23.5763 1.0332Z"
        fill="#FFCF37"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M12.5845 20.0157L11.5854 5.02832L29.5702 7.02663V25.0114L44.058 27.0098L43.5584 40.9979L3.09255 35.003L1.09424 19.0165L12.5845 20.0157Z"
        fill="url(#paint0_linear_2016_900)"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M16.3755 13.5362V11.399C18.9402 11.8264 19.9376 10.1522 20.1157 9.26172H22.2529V21.0166H19.5814V14.0705L16.3755 13.5362Z"
        fill="black"
      />
      <path
        d="M7.33705 26.0104L5.16389 25.4466C6.25047 20.3756 12.2266 22.0669 12.7699 24.8842C13.4219 28.2652 9.87239 29.204 8.42362 29.9552L12.7699 30.518V32.7718L4.62061 31.6456C4.62061 30.5187 6.25047 28.8277 8.42362 27.7008C10.5968 26.5739 10.5968 24.8832 9.5102 24.3197C8.28089 23.6822 7.33705 24.8831 7.33705 26.0104Z"
        fill="black"
      />
      <path
        d="M33.5125 30.6412H31.0163C31.5511 28.4111 34.7297 27.0851 37.4341 28.968C39.2976 30.2655 38.6625 33.2044 37.3867 33.4289C39.2503 34.3799 39.2976 37.3188 36.3644 38.4476C32.0859 38.8937 31.0692 36.1433 30.4814 34.5442H32.8324C32.8324 36.1433 34.76 37.3188 35.8296 36.2171C36.9362 35.0774 35.4731 33.8007 34.76 33.429V32.3137C35.2948 32.3137 36.9411 32.2415 36.3589 30.8536C35.8296 29.5919 34.0079 29.6781 33.5125 30.6412Z"
        fill="black"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2016_900"
          x1="22.5761"
          y1="5.02832"
          x2="22.5761"
          y2="40.9979"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDF688" />
          <stop offset="1" stopColor="#FFCB34" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function UserRankingMobile() {
  return (
    <svg
      width="37"
      height="28"
      viewBox="0 0 37 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.47448 9.77344L1 12.6982L8.79946 13.6732L8.47448 9.77344Z"
        fill="#A55F00"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M28.95 17.8979L28.625 26.9972L34.4746 21.4726L35.4495 12.6982L28.95 17.8979Z"
        fill="#F89E28"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M35.4464 12.7017L25.697 12.0518L19.5225 16.6014L28.9468 17.9014L35.4464 12.7017Z"
        fill="#FFBC15"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M25.697 12.0518L26.672 1.97754L19.5225 4.90233V16.6015L25.697 12.0518Z"
        fill="#FFBC15"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M15.6227 1L7.82324 3.59982L19.1975 4.89973L26.6719 1.97493L15.6227 1Z"
        fill="#FFCF37"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M8.47448 13.3509L7.82453 3.60156L19.5237 4.90147V16.6007L28.9481 17.9006L28.6231 26.9999L2.29991 23.1002L1 12.7009L8.47448 13.3509Z"
        fill="url(#paint0_linear_2088_73)"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M10.9385 9.13117V7.74088C12.6068 8.01894 13.2556 6.92988 13.3715 6.35059H14.7618V13.9972H13.0239V9.47875L10.9385 9.13117Z"
        fill="black"
      />
      <path
        d="M5.06393 17.2493L3.65029 16.8825C4.35711 13.5838 8.24463 14.684 8.59804 16.5166C9.02218 18.716 6.71318 19.3267 5.77075 19.8154L8.59804 20.1815V21.6476L3.29688 20.915C3.29688 20.1819 4.35711 19.0819 5.77075 18.3488C7.1844 17.6158 7.1844 16.516 6.47757 16.1495C5.6779 15.7348 5.06393 16.516 5.06393 17.2493Z"
        fill="black"
      />
      <path
        d="M22.0889 20.2599H20.4651C20.813 18.8092 22.8807 17.9466 24.6399 19.1715C25.8522 20.0155 25.439 21.9273 24.6091 22.0733C25.8214 22.692 25.8522 24.6037 23.9441 25.338C21.1609 25.6282 20.4995 23.8391 20.1172 22.7989H21.6465C21.6465 23.8391 22.9004 24.6037 23.5962 23.8871C24.316 23.1457 23.3643 22.3152 22.9004 22.0734V21.3479C23.2483 21.3479 24.3192 21.3009 23.9405 20.3981C23.5962 19.5773 22.4112 19.6334 22.0889 20.2599Z"
        fill="black"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2088_73"
          x1="14.974"
          y1="3.60156"
          x2="14.974"
          y2="26.9999"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDF688" />
          <stop offset="1" stopColor="#FFCB34" />
        </linearGradient>
      </defs>
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

export function UserStakeRankingMobileTab1(props: any) {
  return (
    <img
      src="data:image/png;base64,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"
      alt=""
      style={{ width: '26px', height: '30px' }}
    />
  );
}
export function UserStakeRankingMobileTab2(props: any) {
  return (
    <img
      src="data:image/png;base64,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"
      alt=""
      style={{ width: '26px', height: '30px' }}
    />
  );
}
export function UserStakeRankingMobileTab3(props: any) {
  return (
    <img
      src="data:image/png;base64,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"
      alt=""
      style={{ width: '26px', height: '30px' }}
    />
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
export function UserStakeRankingFirst({
  color,
  ...props
}: { color: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="9"
      height="10"
      viewBox="0 0 9 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.81067 9C1.81067 9.41421 1.47488 9.75 1.06067 9.75C0.646455 9.75 0.310669 9.41421 0.310669 9V1C0.310669 0.585787 0.646456 0.25 1.06067 0.25C1.47488 0.25 1.81067 0.585787 1.81067 1L1.81067 9ZM5.12133 5L8.591 8.46967C8.88389 8.76256 8.88389 9.23744 8.591 9.53033C8.29811 9.82322 7.82323 9.82322 7.53034 9.53033L3.53034 5.53033L3.00001 5L3.53034 4.46967L7.53034 0.46967C7.82323 0.176777 8.29811 0.176777 8.591 0.46967C8.88389 0.762563 8.88389 1.23744 8.591 1.53033L5.12133 5Z"
        fill={color}
      />
    </svg>
  );
}
export function UserStakeRankingLast({
  color,
  ...props
}: { color: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="9"
      height="10"
      viewBox="0 0 9 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.31055 9C7.31055 9.41421 7.64633 9.75 8.06055 9.75C8.47476 9.75 8.81055 9.41421 8.81055 9V1C8.81055 0.585787 8.47476 0.25 8.06055 0.25C7.64633 0.25 7.31055 0.585787 7.31055 1L7.31055 9ZM3.99989 5L0.530217 8.46967C0.237324 8.76256 0.237324 9.23744 0.530217 9.53033C0.82311 9.82322 1.29798 9.82322 1.59088 9.53033L5.59088 5.53033L6.12121 5L5.59088 4.46967L1.59088 0.46967C1.29798 0.176777 0.82311 0.176777 0.530216 0.46967C0.237323 0.762563 0.237323 1.23744 0.530216 1.53033L3.99989 5Z"
        fill={color}
      />
    </svg>
  );
}
export function UserStakeRankingPopupDown({ ...props }) {
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

export function Goback() {
  return (
    <svg
      width="11"
      height="19"
      viewBox="0 0 11 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.1392 0.0429687L10.1392 2.95964L3.72495 9.28561L10.1392 15.6471L10.1392 18.5283L0.896517 9.28561L10.1392 0.0429687Z"
        fill="white"
      />
    </svg>
  );
}

export function MemeRightArrow() {
  return (
    <svg
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

export function MemeEllipsis() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_11_2)">
        <path
          d="M10 19.375C15.1777 19.375 19.375 15.1777 19.375 10C19.375 4.82233 15.1777 0.625 10 0.625C4.82233 0.625 0.625 4.82233 0.625 10C0.625 15.1777 4.82233 19.375 10 19.375Z"
          fill="#0C171F"
          stroke="#9EFE01"
        />
        <path
          d="M10 19.375C15.1777 19.375 19.375 15.1777 19.375 10C19.375 4.82233 15.1777 0.625 10 0.625C4.82233 0.625 0.625 4.82233 0.625 10C0.625 15.1777 4.82233 19.375 10 19.375Z"
          fill="#0F1A22"
          stroke="#26323C"
        />
        <path
          d="M5.55447 11.1114C6.16812 11.1114 6.66558 10.6139 6.66558 10.0003C6.66558 9.38662 6.16812 8.88916 5.55447 8.88916C4.94082 8.88916 4.44336 9.38662 4.44336 10.0003C4.44336 10.6139 4.94082 11.1114 5.55447 11.1114Z"
          fill="#91A2AE"
        />
        <path
          d="M9.99905 11.1114C10.6127 11.1114 11.1102 10.6139 11.1102 10.0003C11.1102 9.38662 10.6127 8.88916 9.99905 8.88916C9.3854 8.88916 8.88794 9.38662 8.88794 10.0003C8.88794 10.6139 9.3854 11.1114 9.99905 11.1114Z"
          fill="#91A2AE"
        />
        <path
          d="M14.4424 11.1114C15.0561 11.1114 15.5535 10.6139 15.5535 10.0003C15.5535 9.38662 15.0561 8.88916 14.4424 8.88916C13.8288 8.88916 13.3313 9.38662 13.3313 10.0003C13.3313 10.6139 13.8288 11.1114 14.4424 11.1114Z"
          fill="#91A2AE"
        />
      </g>
      <defs>
        <clipPath id="clip0_11_2">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function AcquireXREFIcon() {
  return (
    <svg
      width="12"
      height="11"
      viewBox="0 0 12 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 10L11 1M11 1H4.33333M11 1V7"
        stroke="#7E8A93"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function AirdropMobileArrowIcon() {
  return (
    <svg
      width="17"
      height="12"
      viewBox="0 0 17 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.928931 5.98513L15.0711 5.98513M15.0711 5.98513L10.357 1.27109M15.0711 5.98513L10.357 10.6992"
        stroke="#00FFD1"
        strokeWidth="2"
      />
    </svg>
  );
}

export function XREFStakingDetails() {
  return (
    <svg
      width="11"
      height="12"
      viewBox="0 0 11 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 11.5H2C1.17157 11.5 0.5 10.8284 0.5 10V2C0.5 1.17157 1.17157 0.5 2 0.5H9C9.82843 0.5 10.5 1.17157 10.5 2V6.85714V10C10.5 10.8284 9.82843 11.5 9 11.5Z"
        stroke="white"
      />
      <line x1="2.5" y1="4.5" x2="7.5" y2="4.5" stroke="white" />
      <line x1="2.5" y1="7.5" x2="5.5" y2="7.5" stroke="white" />
    </svg>
  );
}

export function MemeFinalistToken({ ...props }) {
  return (
    <img
      {...props}
      src="data:image/png;base64,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"
      alt=""
    />
  );
}
