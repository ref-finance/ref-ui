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
      width="523"
      height="253"
      viewBox="0 0 523 253"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <path
        d="M269.26 55L275.42 40.9H277.7L283.86 55H281.26L279.84 51.62H273.22L271.78 55H269.26ZM274.12 49.44H278.94L276.52 43.84L274.12 49.44ZM289.426 55.22C287.046 55.22 285.666 53.62 285.666 51.16V44.44H288.086V50.44C288.086 52.08 288.906 53.02 290.346 53.02C291.746 53.02 292.726 52.04 292.726 50.4V44.44H295.146V55H292.726V53.36C292.046 54.36 291.066 55.22 289.426 55.22ZM302.888 58.24C301.148 58.24 299.528 57.8 298.168 56.98L299.068 55.16C300.188 55.86 301.388 56.28 302.828 56.28C304.988 56.28 306.168 55.16 306.168 53.04V52.22C305.288 53.36 304.188 54.16 302.448 54.16C299.968 54.16 297.648 52.32 297.648 49.22V49.18C297.648 46.06 299.988 44.22 302.448 44.22C304.228 44.22 305.328 45.04 306.148 46.02V44.44H308.568V52.84C308.568 54.62 308.108 55.94 307.228 56.82C306.268 57.78 304.788 58.24 302.888 58.24ZM303.088 52.12C304.768 52.12 306.188 50.92 306.188 49.22V49.18C306.188 47.44 304.768 46.26 303.088 46.26C301.408 46.26 300.088 47.42 300.088 49.16V49.2C300.088 50.94 301.428 52.12 303.088 52.12ZM319.623 55V43.4L317.103 44.1L316.583 42.1L320.343 40.9H322.063V55H319.623ZM329.132 55.2C327.632 55.2 325.972 54.66 324.652 53.62L325.732 51.98C326.872 52.84 328.112 53.28 329.192 53.28C330.232 53.28 330.832 52.84 330.832 52.14V52.1C330.832 51.28 329.712 51 328.472 50.62C326.912 50.18 325.172 49.54 325.172 47.52V47.48C325.172 45.48 326.832 44.26 328.932 44.26C330.252 44.26 331.692 44.72 332.812 45.46L331.852 47.18C330.832 46.56 329.752 46.18 328.872 46.18C327.932 46.18 327.392 46.62 327.392 47.24V47.28C327.392 48.04 328.532 48.36 329.772 48.76C331.312 49.24 333.052 49.94 333.052 51.84V51.88C333.052 54.1 331.332 55.2 329.132 55.2ZM338.857 55.18C337.077 55.18 335.817 54.4 335.817 52.08V46.52H334.477V44.44H335.817V41.54H338.237V44.44H341.077V46.52H338.237V51.7C338.237 52.64 338.717 53.02 339.537 53.02C340.077 53.02 340.557 52.9 341.037 52.66V54.64C340.437 54.98 339.757 55.18 338.857 55.18Z"
        fill="white"
      />
      <line
        x1="370.5"
        y1="71"
        x2="370.5"
        y2="135"
        stroke="url(#paint0_linear_0_1)"
      />
      <line
        x1="370.5"
        y1="159"
        x2="370.5"
        y2="218"
        stroke="url(#paint1_linear_0_1)"
      />
      <circle cx="370" cy="147" r="11.5" fill="#16453C" stroke="#00FFD1" />
      <circle cx="370" cy="59" r="11.5" fill="#16453C" stroke="#00FFD1" />
      <rect
        x="362.5"
        y="139"
        width="15"
        height="16"
        fill="url(#pattern0_0_1)"
      />
      <circle cx="370" cy="230" r="11.5" fill="#16453C" stroke="#00FFD1" />
      <path
        d="M375.106 225.319C375.006 225.043 374.522 224.435 373.383 224.213C372.243 223.991 371.235 224.624 370.873 224.968C370.781 224.902 370.644 224.823 370.468 224.749C369.792 224.235 368.234 223.149 367.405 222.909C366.369 222.608 366.948 223.09 367.114 223.992C367.246 224.713 367.19 224.938 367.145 224.961C367.015 225.028 366.885 225.103 366.756 225.186C366.24 225.068 365.032 224.835 364.328 224.847C363.448 224.862 363.562 224.945 363.764 225.245C363.926 225.485 364.539 226.588 364.826 227.11C364.778 227.179 364.731 227.25 364.685 227.322C364.497 227.278 363.88 227.264 362.914 227.559C361.707 227.928 361.582 228.049 361.759 228.213C361.901 228.344 362.933 229.174 363.431 229.573C363.029 229.696 362.119 230.01 361.698 230.284C361.173 230.625 361.125 230.634 361.294 230.75C361.429 230.843 362.708 231.357 363.331 231.602C363.056 231.914 362.553 232.53 362.165 233.091C361.672 233.807 361.679 233.916 362.124 233.933C362.479 233.946 363.651 233.792 364.192 233.713C364.612 234.195 365.131 234.548 365.62 234.81C367.304 235.715 372.791 235.355 375.229 234.259C376.693 233.6 377.439 232.589 377.742 232.19C378.085 232.013 378.646 231.504 378.141 230.891C378.399 230.696 378.635 230.486 378.511 230.235C378.386 229.983 378.202 229.981 378.118 229.964C378.156 229.907 378.42 229.476 377.978 229.204C377.425 228.865 376.558 228.681 376.488 228.301C376.472 228.214 376.465 228.136 376.459 228.065C376.462 228.027 376.458 227.993 376.449 227.965C376.425 227.79 376.369 227.684 376.073 227.642C376.171 227.379 376.182 227.082 376.049 226.715C375.89 226.273 375.589 226.08 375.427 225.995C375.578 226.017 375.923 226.081 376.096 226.167C376.16 225.893 376.052 225.341 375.106 225.319Z"
        fill="#009400"
      />
      <path
        d="M375.106 225.319C375.006 225.043 374.522 224.435 373.383 224.213C372.243 223.991 371.235 224.624 370.873 224.968M375.106 225.319C376.052 225.341 376.16 225.893 376.096 226.167C375.923 226.081 375.578 226.017 375.427 225.995M375.106 225.319C374.627 225.292 373.519 225.434 372.916 226.211C372.314 226.989 372.27 227.589 372.324 227.792M370.873 224.968C371.8 225.74 372.049 226.387 372.058 226.614M370.873 224.968C370.781 224.902 370.644 224.823 370.468 224.749M376.073 227.642C376.171 227.379 376.182 227.082 376.049 226.715C375.89 226.273 375.589 226.08 375.427 225.995M376.073 227.642C376.007 227.818 375.725 228.206 375.125 228.356C374.374 228.543 374.452 228.43 374.387 228.344C374.322 228.258 373.376 227.647 372.682 227.873C372.746 227.42 373.096 226.443 373.986 226.162C374.876 225.881 375.317 225.934 375.427 225.995M376.073 227.642C376.369 227.684 376.425 227.79 376.449 227.965M372.082 227.542C371.893 227.315 371.216 226.834 370.333 226.833C369.009 226.831 368.418 227.087 367.979 227.364C367.522 227.651 366.941 228.388 366.488 228.325C366.103 228.27 367.122 228.839 368.099 229.353C368.859 229.752 369.786 229.729 371.015 229.209C372.244 228.689 372.191 228.404 372.041 228.922C371.921 229.337 371.472 229.648 371.262 229.752M370.468 224.749C369.955 224.532 369.113 224.351 368.107 224.594C367.791 224.671 367.467 224.793 367.145 224.961M370.468 224.749C369.792 224.235 368.234 223.149 367.405 222.909C366.369 222.608 366.948 223.09 367.114 223.992C367.246 224.713 367.19 224.938 367.145 224.961M367.145 224.961C367.015 225.028 366.885 225.103 366.756 225.186M366.756 225.186C366.24 225.068 365.032 224.835 364.328 224.847C363.448 224.862 363.562 224.945 363.764 225.245C363.926 225.485 364.539 226.588 364.826 227.11M366.756 225.186C366.071 225.622 365.403 226.265 364.826 227.11M364.826 227.11C364.778 227.179 364.731 227.25 364.685 227.322M364.685 227.322C364.497 227.278 363.88 227.264 362.914 227.559C361.707 227.928 361.582 228.049 361.759 228.213C361.901 228.344 362.933 229.174 363.431 229.573M364.685 227.322C364.28 227.955 363.926 228.692 363.65 229.533M363.431 229.573L363.65 229.533M363.431 229.573C363.029 229.696 362.119 230.01 361.698 230.284C361.173 230.625 361.125 230.634 361.294 230.75C361.429 230.843 362.708 231.357 363.331 231.602M363.65 229.533C363.633 229.584 363.616 229.636 363.6 229.689C363.373 230.415 363.297 231.048 363.331 231.602M363.331 231.602C363.056 231.914 362.553 232.53 362.165 233.091C361.672 233.807 361.679 233.916 362.124 233.933C362.479 233.946 363.651 233.792 364.192 233.713M363.331 231.602C363.386 232.497 363.73 233.183 364.192 233.713M364.192 233.713C364.612 234.195 365.131 234.548 365.62 234.81C367.304 235.715 372.791 235.355 375.229 234.259C376.693 233.6 377.439 232.589 377.742 232.19C378.085 232.013 378.646 231.504 378.141 230.891C378.399 230.696 378.635 230.486 378.511 230.235C378.386 229.983 378.202 229.981 378.118 229.964C378.156 229.907 378.42 229.476 377.978 229.204C377.425 228.865 376.558 228.681 376.488 228.301C376.464 228.17 376.461 228.058 376.449 227.965M376.449 227.965C376.505 228.135 376.382 228.527 375.44 228.739"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M376.058 226.759C376.191 227.127 376.18 227.423 376.081 227.687C376.015 227.862 375.733 228.251 375.133 228.4C374.383 228.587 374.46 228.475 374.395 228.389C374.33 228.303 373.385 227.692 372.69 227.918C372.754 227.464 373.104 226.488 373.994 226.207C374.884 225.925 375.326 225.978 375.435 226.04C375.598 226.125 375.898 226.318 376.058 226.759Z"
        fill="white"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M377.743 232.19C378.086 232.012 378.646 231.504 378.141 230.891C378.4 230.696 378.636 230.486 378.511 230.234C378.386 229.982 378.203 229.98 378.118 229.963C377.656 230.293 376.009 231.027 373.12 231.323C369.51 231.692 368.151 231.5 367.188 231.334C366.936 231.29 366.781 231.3 366.699 231.339C366.468 231.45 366.814 231.798 367.189 231.873C367.49 232.441 369.134 233.38 372.399 233.27C375.012 233.182 377.05 232.513 377.743 232.19Z"
        fill="#AC5228"
      />
      <path
        d="M378.141 230.891C378.646 231.504 378.086 232.012 377.743 232.19C377.05 232.513 375.012 233.182 372.399 233.27C369.134 233.38 367.49 232.441 367.189 231.873M378.141 230.891C378.4 230.696 378.636 230.486 378.511 230.234C378.386 229.982 378.203 229.98 378.118 229.963C377.656 230.293 376.009 231.027 373.12 231.323C369.51 231.692 368.151 231.5 367.188 231.334C366.936 231.29 366.781 231.3 366.699 231.339M378.141 230.891C377.851 231.091 376.507 231.603 373.45 232.047C369.628 232.602 367.699 231.976 367.189 231.873M367.189 231.873C366.814 231.798 366.468 231.45 366.699 231.339M366.699 231.339C366.616 231.334 366.456 231.459 366.478 232.004"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M367.983 227.392C368.423 227.115 369.013 226.86 370.338 226.861C370.637 226.888 371.233 226.981 371.512 227.381C371.845 227.86 371.799 228.408 371.567 228.744C371.381 229.014 371.201 229.155 371.02 229.237C371.02 229.237 369.257 230.052 368.104 229.381C367.126 228.867 366.107 228.299 366.493 228.353C366.946 228.417 367.527 227.68 367.983 227.392Z"
        fill="white"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M368.521 227.115C369.229 226.985 369.859 227.457 369.999 228.217C370.098 228.757 369.894 229.278 369.514 229.58C368.699 229.682 368.379 229.544 367.554 229.059C367.51 228.957 367.458 228.802 367.437 228.688C367.298 227.928 367.814 227.245 368.521 227.115Z"
        fill="black"
      />
      <ellipse
        cx="0.520081"
        cy="0.346176"
        rx="0.520081"
        ry="0.346176"
        transform="matrix(-0.903803 -0.427948 -0.427948 0.903803 369.591 227.521)"
        fill="white"
      />
      <ellipse
        cx="0.173796"
        cy="0.153785"
        rx="0.173796"
        ry="0.153785"
        transform="matrix(-0.76304 -0.646351 -0.646351 0.76304 368.853 228.932)"
        fill="#038203"
      />
      <path
        d="M374.036 226.161C374.534 226.198 374.957 226.665 375.012 227.271C375.057 227.766 374.845 228.214 374.502 228.431C374.402 228.421 374.304 228.152 373.73 227.963C373.367 227.844 373.17 227.818 373.073 227.811C373.033 227.7 373.006 227.581 372.995 227.456C372.973 227.222 373.009 226.999 373.089 226.806C373.348 226.444 373.828 226.226 374.036 226.161Z"
        fill="black"
      />
      <ellipse
        cx="0.448418"
        cy="0.298476"
        rx="0.448418"
        ry="0.298476"
        transform="matrix(-0.903803 -0.427948 -0.427948 0.903803 374.606 226.6)"
        fill="white"
      />
      <ellipse
        cx="0.0949481"
        cy="0.0722057"
        rx="0.0949481"
        ry="0.0722057"
        transform="matrix(0.086326 -0.996267 -0.996267 -0.086326 374.078 227.744)"
        fill="#038203"
      />
      <path
        d="M367.83 230.825C367.45 230.715 366.571 230.595 366.096 230.996C365.62 231.398 365.697 231.854 365.796 232.032M370.865 229.728C370.583 229.976 369.792 230.455 368.877 230.387C367.962 230.32 367.716 230.208 367.708 230.161M366.899 229.23C367.058 229.381 367.529 229.723 368.147 229.884M371.873 226.943C371.731 226.79 371.343 226.462 370.936 226.38M370.699 226.423C370.382 226.302 369.49 226.145 368.456 226.492C367.421 226.839 366.896 227.433 366.762 227.686M374.243 225.429C373.895 225.493 373.065 225.743 372.528 226.234M375.294 229.012C374.99 228.871 374.251 228.566 373.723 228.467"
        stroke="black"
        strokeWidth="0.3"
      />
      <ellipse
        cx="0.289402"
        cy="0.192935"
        rx="0.289402"
        ry="0.192935"
        transform="matrix(-0.997682 0.0680477 0.0680477 0.997682 374.483 229.668)"
        fill="black"
      />
      <ellipse
        cx="0.237865"
        cy="0.158577"
        rx="0.237865"
        ry="0.158577"
        transform="matrix(-0.975768 0.218807 0.218807 0.975768 376.642 229.205)"
        fill="black"
      />
      <path
        d="M365.5 223L366.297 226.089L369 227L366.297 227.911L365.5 231L364.703 227.911L362 227L364.703 226.089L365.5 223Z"
        fill="#00FFD1"
      />
      <path
        d="M260.979 141L267.139 126.9H269.419L275.579 141H272.979L271.559 137.62H264.939L263.499 141H260.979ZM265.839 135.44H270.659L268.239 129.84L265.839 135.44ZM281.144 141.22C278.764 141.22 277.384 139.62 277.384 137.16V130.44H279.804V136.44C279.804 138.08 280.624 139.02 282.064 139.02C283.464 139.02 284.444 138.04 284.444 136.4V130.44H286.864V141H284.444V139.36C283.764 140.36 282.784 141.22 281.144 141.22ZM294.607 144.24C292.867 144.24 291.247 143.8 289.887 142.98L290.787 141.16C291.907 141.86 293.107 142.28 294.547 142.28C296.707 142.28 297.887 141.16 297.887 139.04V138.22C297.007 139.36 295.907 140.16 294.167 140.16C291.687 140.16 289.367 138.32 289.367 135.22V135.18C289.367 132.06 291.707 130.22 294.167 130.22C295.947 130.22 297.047 131.04 297.867 132.02V130.44H300.287V138.84C300.287 140.62 299.827 141.94 298.947 142.82C297.987 143.78 296.507 144.24 294.607 144.24ZM294.807 138.12C296.487 138.12 297.907 136.92 297.907 135.22V135.18C297.907 133.44 296.487 132.26 294.807 132.26C293.127 132.26 291.807 133.42 291.807 135.16V135.2C291.807 136.94 293.147 138.12 294.807 138.12ZM316.021 141V137.86H308.961L308.501 136.1L316.281 126.9H318.381V135.84H320.381V137.86H318.381V141H316.021ZM311.421 135.84H316.021V130.3L311.421 135.84ZM326.455 141.18C324.675 141.18 323.415 140.4 323.415 138.08V132.52H322.075V130.44H323.415V127.54H325.835V130.44H328.675V132.52H325.835V137.7C325.835 138.64 326.315 139.02 327.135 139.02C327.675 139.02 328.155 138.9 328.635 138.66V140.64C328.035 140.98 327.355 141.18 326.455 141.18ZM331.118 141V126.4H333.538V132.08C334.218 131.08 335.198 130.22 336.838 130.22C339.218 130.22 340.598 131.82 340.598 134.28V141H338.178V135C338.178 133.36 337.358 132.42 335.918 132.42C334.518 132.42 333.538 133.4 333.538 135.04V141H331.118Z"
        fill="white"
      />
      <path
        d="M192.594 76.642L196.094 68.2H197.284L193.07 78.07H192.09L187.876 68.2H189.108L192.594 76.642ZM205.148 74.374C205.148 74.8873 205.05 75.3773 204.854 75.844C204.667 76.3013 204.406 76.7027 204.07 77.048C203.734 77.3933 203.332 77.6687 202.866 77.874C202.399 78.07 201.895 78.168 201.354 78.168C200.812 78.168 200.313 78.07 199.856 77.874C199.398 77.6687 199.002 77.398 198.666 77.062C198.33 76.7167 198.068 76.3153 197.882 75.858C197.695 75.4007 197.602 74.9153 197.602 74.402C197.602 73.8887 197.695 73.4033 197.882 72.946C198.068 72.4793 198.33 72.0733 198.666 71.728C199.002 71.3827 199.398 71.112 199.856 70.916C200.322 70.7107 200.831 70.608 201.382 70.608C201.923 70.608 202.422 70.7107 202.88 70.916C203.346 71.112 203.748 71.3827 204.084 71.728C204.42 72.064 204.681 72.4607 204.868 72.918C205.054 73.3753 205.148 73.8607 205.148 74.374ZM204.042 74.402C204.042 74.01 203.972 73.6413 203.832 73.296C203.701 72.9507 203.514 72.652 203.272 72.4C203.029 72.1387 202.744 71.9333 202.418 71.784C202.091 71.6347 201.736 71.56 201.354 71.56C200.962 71.56 200.602 71.6347 200.276 71.784C199.949 71.924 199.669 72.1247 199.436 72.386C199.212 72.638 199.034 72.9367 198.904 73.282C198.773 73.618 198.708 73.982 198.708 74.374C198.708 74.766 198.773 75.1347 198.904 75.48C199.044 75.8253 199.23 76.124 199.464 76.376C199.706 76.628 199.991 76.8287 200.318 76.978C200.644 77.1273 200.999 77.202 201.382 77.202C201.774 77.202 202.133 77.132 202.46 76.992C202.786 76.8427 203.066 76.642 203.3 76.39C203.533 76.138 203.715 75.844 203.846 75.508C203.976 75.1627 204.042 74.794 204.042 74.402ZM208.556 71.714V75.942C208.556 76.39 208.668 76.7027 208.892 76.88C209.116 77.0573 209.41 77.146 209.774 77.146C209.961 77.146 210.134 77.1273 210.292 77.09C210.46 77.0527 210.638 76.9873 210.824 76.894V77.818C210.638 77.9207 210.437 77.9953 210.222 78.042C210.017 78.098 209.784 78.126 209.522 78.126C209.233 78.126 208.962 78.0887 208.71 78.014C208.458 77.9393 208.239 77.8227 208.052 77.664C207.875 77.496 207.735 77.2813 207.632 77.02C207.53 76.7587 207.478 76.446 207.478 76.082V71.714H206.47V70.762H207.478V68.578H208.556V70.762H210.852V71.714H208.556ZM214.021 69.18H212.789V67.99H214.021V69.18ZM213.937 78H212.859V70.762H213.937V78ZM217.516 73.856V78H216.438V70.762H217.516V72.022C217.759 71.63 218.076 71.2987 218.468 71.028C218.86 70.748 219.369 70.608 219.994 70.608C220.433 70.608 220.82 70.678 221.156 70.818C221.502 70.958 221.791 71.1587 222.024 71.42C222.267 71.672 222.449 71.9753 222.57 72.33C222.701 72.6847 222.766 73.0767 222.766 73.506V78H221.688V73.772C221.688 73.1 221.516 72.568 221.17 72.176C220.825 71.784 220.33 71.588 219.686 71.588C219.378 71.588 219.089 71.644 218.818 71.756C218.557 71.8587 218.328 72.0127 218.132 72.218C217.936 72.414 217.782 72.652 217.67 72.932C217.568 73.212 217.516 73.52 217.516 73.856ZM231.953 76.74C231.953 77.328 231.865 77.8413 231.687 78.28C231.519 78.7187 231.272 79.0827 230.945 79.372C230.628 79.6707 230.241 79.8947 229.783 80.044C229.335 80.1933 228.831 80.268 228.271 80.268C227.665 80.268 227.086 80.184 226.535 80.016C225.985 79.848 225.467 79.596 224.981 79.26L225.471 78.42C225.891 78.7187 226.33 78.9473 226.787 79.106C227.245 79.2647 227.735 79.344 228.257 79.344C229.06 79.344 229.699 79.1247 230.175 78.686C230.651 78.2567 230.889 77.6173 230.889 76.768V75.914C230.572 76.334 230.185 76.6933 229.727 76.992C229.27 77.2907 228.71 77.44 228.047 77.44C227.609 77.44 227.184 77.3653 226.773 77.216C226.372 77.0573 226.013 76.8333 225.695 76.544C225.378 76.2453 225.121 75.886 224.925 75.466C224.739 75.046 224.645 74.57 224.645 74.038C224.645 73.506 224.739 73.03 224.925 72.61C225.121 72.1807 225.378 71.8213 225.695 71.532C226.013 71.2333 226.377 71.0047 226.787 70.846C227.198 70.6873 227.618 70.608 228.047 70.608C228.383 70.608 228.691 70.65 228.971 70.734C229.261 70.8087 229.517 70.9113 229.741 71.042C229.975 71.1727 230.185 71.3267 230.371 71.504C230.558 71.6813 230.726 71.868 230.875 72.064V70.762H231.953V76.74ZM230.917 74.024C230.917 73.6507 230.843 73.3147 230.693 73.016C230.544 72.708 230.343 72.4467 230.091 72.232C229.849 72.0173 229.569 71.854 229.251 71.742C228.934 71.6207 228.603 71.56 228.257 71.56C227.912 71.56 227.585 71.616 227.277 71.728C226.979 71.84 226.713 72.0033 226.479 72.218C226.255 72.4327 226.078 72.694 225.947 73.002C225.817 73.3007 225.751 73.6367 225.751 74.01C225.751 74.3833 225.817 74.724 225.947 75.032C226.087 75.3307 226.269 75.592 226.493 75.816C226.727 76.0307 226.993 76.1987 227.291 76.32C227.599 76.432 227.921 76.488 228.257 76.488C228.603 76.488 228.934 76.432 229.251 76.32C229.569 76.1987 229.849 76.0307 230.091 75.816C230.343 75.6013 230.544 75.3447 230.693 75.046C230.843 74.738 230.917 74.3973 230.917 74.024ZM245.867 74.374C245.867 74.9713 245.769 75.5033 245.573 75.97C245.377 76.4367 245.116 76.8333 244.789 77.16C244.472 77.4773 244.103 77.7247 243.683 77.902C243.273 78.07 242.848 78.154 242.409 78.154C242.073 78.154 241.765 78.112 241.485 78.028C241.205 77.944 240.953 77.832 240.729 77.692C240.505 77.552 240.3 77.3887 240.113 77.202C239.936 77.0153 239.777 76.8193 239.637 76.614V78H238.559V67.78H239.637V72.218C239.787 72.0033 239.95 71.798 240.127 71.602C240.314 71.406 240.519 71.238 240.743 71.098C240.967 70.9487 241.215 70.832 241.485 70.748C241.765 70.6547 242.073 70.608 242.409 70.608C242.839 70.608 243.259 70.692 243.669 70.86C244.089 71.028 244.463 71.2753 244.789 71.602C245.116 71.9193 245.377 72.3113 245.573 72.778C245.769 73.2447 245.867 73.7767 245.867 74.374ZM244.761 74.388C244.761 73.9587 244.691 73.5713 244.551 73.226C244.421 72.8807 244.239 72.5867 244.005 72.344C243.772 72.092 243.501 71.9007 243.193 71.77C242.885 71.6393 242.559 71.574 242.213 71.574C241.877 71.574 241.551 71.644 241.233 71.784C240.925 71.9147 240.645 72.1013 240.393 72.344C240.151 72.5867 239.955 72.8807 239.805 73.226C239.665 73.5713 239.595 73.954 239.595 74.374C239.595 74.794 239.665 75.1813 239.805 75.536C239.955 75.8813 240.151 76.1753 240.393 76.418C240.645 76.6607 240.925 76.852 241.233 76.992C241.551 77.1227 241.877 77.188 242.213 77.188C242.559 77.188 242.885 77.1273 243.193 77.006C243.511 76.8753 243.781 76.6933 244.005 76.46C244.239 76.2173 244.421 75.9233 244.551 75.578C244.691 75.2233 244.761 74.8267 244.761 74.388ZM248.5 74.78C248.538 75.172 248.631 75.522 248.78 75.83C248.93 76.1287 249.121 76.3853 249.354 76.6C249.588 76.8053 249.849 76.964 250.138 77.076C250.428 77.1787 250.731 77.23 251.048 77.23C251.552 77.23 251.982 77.1367 252.336 76.95C252.7 76.7633 253.032 76.516 253.33 76.208L254.002 76.81C253.638 77.2207 253.223 77.552 252.756 77.804C252.29 78.0467 251.711 78.168 251.02 78.168C250.526 78.168 250.059 78.0793 249.62 77.902C249.182 77.7153 248.799 77.4587 248.472 77.132C248.146 76.796 247.884 76.3947 247.688 75.928C247.502 75.4613 247.408 74.948 247.408 74.388C247.408 73.8653 247.492 73.3753 247.66 72.918C247.838 72.4513 248.08 72.05 248.388 71.714C248.696 71.3687 249.06 71.098 249.48 70.902C249.91 70.706 250.376 70.608 250.88 70.608C251.412 70.608 251.888 70.7107 252.308 70.916C252.728 71.112 253.083 71.3827 253.372 71.728C253.662 72.0733 253.881 72.4793 254.03 72.946C254.18 73.4127 254.254 73.912 254.254 74.444C254.254 74.4907 254.254 74.542 254.254 74.598C254.254 74.654 254.25 74.7147 254.24 74.78H248.5ZM248.5 73.982H253.162C253.134 73.6553 253.064 73.3427 252.952 73.044C252.85 72.7453 252.7 72.484 252.504 72.26C252.318 72.036 252.084 71.8587 251.804 71.728C251.534 71.588 251.216 71.518 250.852 71.518C250.535 71.518 250.241 71.5833 249.97 71.714C249.7 71.8353 249.462 72.008 249.256 72.232C249.051 72.4467 248.883 72.7033 248.752 73.002C248.622 73.3007 248.538 73.6273 248.5 73.982ZM263.03 76.74C263.03 77.328 262.941 77.8413 262.764 78.28C262.596 78.7187 262.348 79.0827 262.022 79.372C261.704 79.6707 261.317 79.8947 260.86 80.044C260.412 80.1933 259.908 80.268 259.348 80.268C258.741 80.268 258.162 80.184 257.612 80.016C257.061 79.848 256.543 79.596 256.058 79.26L256.548 78.42C256.968 78.7187 257.406 78.9473 257.864 79.106C258.321 79.2647 258.811 79.344 259.334 79.344C260.136 79.344 260.776 79.1247 261.252 78.686C261.728 78.2567 261.966 77.6173 261.966 76.768V75.914C261.648 76.334 261.261 76.6933 260.804 76.992C260.346 77.2907 259.786 77.44 259.124 77.44C258.685 77.44 258.26 77.3653 257.85 77.216C257.448 77.0573 257.089 76.8333 256.772 76.544C256.454 76.2453 256.198 75.886 256.002 75.466C255.815 75.046 255.722 74.57 255.722 74.038C255.722 73.506 255.815 73.03 256.002 72.61C256.198 72.1807 256.454 71.8213 256.772 71.532C257.089 71.2333 257.453 71.0047 257.864 70.846C258.274 70.6873 258.694 70.608 259.124 70.608C259.46 70.608 259.768 70.65 260.048 70.734C260.337 70.8087 260.594 70.9113 260.818 71.042C261.051 71.1727 261.261 71.3267 261.448 71.504C261.634 71.6813 261.802 71.868 261.952 72.064V70.762H263.03V76.74ZM261.994 74.024C261.994 73.6507 261.919 73.3147 261.77 73.016C261.62 72.708 261.42 72.4467 261.168 72.232C260.925 72.0173 260.645 71.854 260.328 71.742C260.01 71.6207 259.679 71.56 259.334 71.56C258.988 71.56 258.662 71.616 258.354 71.728C258.055 71.84 257.789 72.0033 257.556 72.218C257.332 72.4327 257.154 72.694 257.024 73.002C256.893 73.3007 256.828 73.6367 256.828 74.01C256.828 74.3833 256.893 74.724 257.024 75.032C257.164 75.3307 257.346 75.592 257.57 75.816C257.803 76.0307 258.069 76.1987 258.368 76.32C258.676 76.432 258.998 76.488 259.334 76.488C259.679 76.488 260.01 76.432 260.328 76.32C260.645 76.1987 260.925 76.0307 261.168 75.816C261.42 75.6013 261.62 75.3447 261.77 75.046C261.919 74.738 261.994 74.3973 261.994 74.024ZM266.698 69.18H265.466V67.99H266.698V69.18ZM266.614 78H265.536V70.762H266.614V78ZM270.194 73.856V78H269.116V70.762H270.194V72.022C270.437 71.63 270.754 71.2987 271.146 71.028C271.538 70.748 272.047 70.608 272.672 70.608C273.111 70.608 273.498 70.678 273.834 70.818C274.179 70.958 274.469 71.1587 274.702 71.42C274.945 71.672 275.127 71.9753 275.248 72.33C275.379 72.6847 275.444 73.0767 275.444 73.506V78H274.366V73.772C274.366 73.1 274.193 72.568 273.848 72.176C273.503 71.784 273.008 71.588 272.364 71.588C272.056 71.588 271.767 71.644 271.496 71.756C271.235 71.8587 271.006 72.0127 270.81 72.218C270.614 72.414 270.46 72.652 270.348 72.932C270.245 73.212 270.194 73.52 270.194 73.856ZM282.713 75.97C282.713 76.3153 282.643 76.6233 282.503 76.894C282.372 77.1553 282.19 77.3793 281.957 77.566C281.733 77.7527 281.462 77.8973 281.145 78C280.837 78.0933 280.501 78.14 280.137 78.14C279.614 78.14 279.087 78.0467 278.555 77.86C278.023 77.664 277.552 77.4027 277.141 77.076L277.687 76.306C278.079 76.6047 278.485 76.8333 278.905 76.992C279.334 77.1507 279.764 77.23 280.193 77.23C280.632 77.23 280.991 77.1273 281.271 76.922C281.551 76.7167 281.691 76.4367 281.691 76.082V76.054C281.691 75.8767 281.64 75.7227 281.537 75.592C281.444 75.4613 281.313 75.3493 281.145 75.256C280.977 75.1533 280.781 75.0647 280.557 74.99C280.342 74.9153 280.118 74.8453 279.885 74.78C279.605 74.696 279.32 74.6073 279.031 74.514C278.751 74.4113 278.494 74.2853 278.261 74.136C278.037 73.9867 277.85 73.8 277.701 73.576C277.561 73.352 277.491 73.072 277.491 72.736V72.708C277.491 72.4 277.552 72.12 277.673 71.868C277.794 71.6067 277.962 71.3873 278.177 71.21C278.401 71.0233 278.662 70.8833 278.961 70.79C279.269 70.6873 279.6 70.636 279.955 70.636C280.403 70.636 280.856 70.7107 281.313 70.86C281.77 71 282.186 71.1913 282.559 71.434L282.069 72.246C281.733 72.0313 281.378 71.8633 281.005 71.742C280.641 71.6113 280.282 71.546 279.927 71.546C279.498 71.546 279.157 71.6487 278.905 71.854C278.653 72.05 278.527 72.2973 278.527 72.596V72.624C278.527 72.792 278.578 72.9413 278.681 73.072C278.784 73.1933 278.919 73.3007 279.087 73.394C279.264 73.4873 279.465 73.5713 279.689 73.646C279.913 73.7207 280.146 73.7953 280.389 73.87C280.669 73.954 280.944 74.0473 281.215 74.15C281.495 74.2527 281.747 74.3833 281.971 74.542C282.195 74.7007 282.372 74.892 282.503 75.116C282.643 75.34 282.713 75.6153 282.713 75.942V75.97ZM296.011 74.374C296.011 74.8873 295.913 75.3773 295.717 75.844C295.53 76.3013 295.269 76.7027 294.933 77.048C294.597 77.3933 294.196 77.6687 293.729 77.874C293.262 78.07 292.758 78.168 292.217 78.168C291.676 78.168 291.176 78.07 290.719 77.874C290.262 77.6687 289.865 77.398 289.529 77.062C289.193 76.7167 288.932 76.3153 288.745 75.858C288.558 75.4007 288.465 74.9153 288.465 74.402C288.465 73.8887 288.558 73.4033 288.745 72.946C288.932 72.4793 289.193 72.0733 289.529 71.728C289.865 71.3827 290.262 71.112 290.719 70.916C291.186 70.7107 291.694 70.608 292.245 70.608C292.786 70.608 293.286 70.7107 293.743 70.916C294.21 71.112 294.611 71.3827 294.947 71.728C295.283 72.064 295.544 72.4607 295.731 72.918C295.918 73.3753 296.011 73.8607 296.011 74.374ZM294.905 74.402C294.905 74.01 294.835 73.6413 294.695 73.296C294.564 72.9507 294.378 72.652 294.135 72.4C293.892 72.1387 293.608 71.9333 293.281 71.784C292.954 71.6347 292.6 71.56 292.217 71.56C291.825 71.56 291.466 71.6347 291.139 71.784C290.812 71.924 290.532 72.1247 290.299 72.386C290.075 72.638 289.898 72.9367 289.767 73.282C289.636 73.618 289.571 73.982 289.571 74.374C289.571 74.766 289.636 75.1347 289.767 75.48C289.907 75.8253 290.094 76.124 290.327 76.376C290.57 76.628 290.854 76.8287 291.181 76.978C291.508 77.1273 291.862 77.202 292.245 77.202C292.637 77.202 292.996 77.132 293.323 76.992C293.65 76.8427 293.93 76.642 294.163 76.39C294.396 76.138 294.578 75.844 294.709 75.508C294.84 75.1627 294.905 74.794 294.905 74.402ZM299.042 73.856V78H297.964V70.762H299.042V72.022C299.284 71.63 299.602 71.2987 299.994 71.028C300.386 70.748 300.894 70.608 301.52 70.608C301.958 70.608 302.346 70.678 302.682 70.818C303.027 70.958 303.316 71.1587 303.55 71.42C303.792 71.672 303.974 71.9753 304.096 72.33C304.226 72.6847 304.292 73.0767 304.292 73.506V78H303.214V73.772C303.214 73.1 303.041 72.568 302.696 72.176C302.35 71.784 301.856 71.588 301.212 71.588C300.904 71.588 300.614 71.644 300.344 71.756C300.082 71.8587 299.854 72.0127 299.658 72.218C299.462 72.414 299.308 72.652 299.196 72.932C299.093 73.212 299.042 73.52 299.042 73.856ZM315.632 68.13L320.098 78H318.908L317.76 75.41H312.426L311.264 78H310.13L314.596 68.13H315.632ZM317.326 74.416L315.1 69.418L312.86 74.416H317.326ZM326.85 74.906V70.762H327.914V78H326.85V76.74C326.607 77.132 326.29 77.468 325.898 77.748C325.506 78.0187 324.997 78.154 324.372 78.154C323.933 78.154 323.541 78.084 323.196 77.944C322.86 77.804 322.57 77.608 322.328 77.356C322.094 77.0947 321.912 76.7867 321.782 76.432C321.66 76.0773 321.6 75.6853 321.6 75.256V70.762H322.678V74.99C322.678 75.662 322.85 76.194 323.196 76.586C323.541 76.978 324.036 77.174 324.68 77.174C324.988 77.174 325.272 77.1227 325.534 77.02C325.804 76.908 326.033 76.754 326.22 76.558C326.416 76.3527 326.57 76.11 326.682 75.83C326.794 75.55 326.85 75.242 326.85 74.906ZM337.227 76.74C337.227 77.328 337.138 77.8413 336.961 78.28C336.793 78.7187 336.545 79.0827 336.219 79.372C335.901 79.6707 335.514 79.8947 335.057 80.044C334.609 80.1933 334.105 80.268 333.545 80.268C332.938 80.268 332.359 80.184 331.809 80.016C331.258 79.848 330.74 79.596 330.255 79.26L330.745 78.42C331.165 78.7187 331.603 78.9473 332.061 79.106C332.518 79.2647 333.008 79.344 333.531 79.344C334.333 79.344 334.973 79.1247 335.449 78.686C335.925 78.2567 336.163 77.6173 336.163 76.768V75.914C335.845 76.334 335.458 76.6933 335.001 76.992C334.543 77.2907 333.983 77.44 333.321 77.44C332.882 77.44 332.457 77.3653 332.047 77.216C331.645 77.0573 331.286 76.8333 330.969 76.544C330.651 76.2453 330.395 75.886 330.199 75.466C330.012 75.046 329.919 74.57 329.919 74.038C329.919 73.506 330.012 73.03 330.199 72.61C330.395 72.1807 330.651 71.8213 330.969 71.532C331.286 71.2333 331.65 71.0047 332.061 70.846C332.471 70.6873 332.891 70.608 333.321 70.608C333.657 70.608 333.965 70.65 334.245 70.734C334.534 70.8087 334.791 70.9113 335.015 71.042C335.248 71.1727 335.458 71.3267 335.645 71.504C335.831 71.6813 335.999 71.868 336.149 72.064V70.762H337.227V76.74ZM336.191 74.024C336.191 73.6507 336.116 73.3147 335.967 73.016C335.817 72.708 335.617 72.4467 335.365 72.232C335.122 72.0173 334.842 71.854 334.525 71.742C334.207 71.6207 333.876 71.56 333.531 71.56C333.185 71.56 332.859 71.616 332.551 71.728C332.252 71.84 331.986 72.0033 331.753 72.218C331.529 72.4327 331.351 72.694 331.221 73.002C331.09 73.3007 331.025 73.6367 331.025 74.01C331.025 74.3833 331.09 74.724 331.221 75.032C331.361 75.3307 331.543 75.592 331.767 75.816C332 76.0307 332.266 76.1987 332.565 76.32C332.873 76.432 333.195 76.488 333.531 76.488C333.876 76.488 334.207 76.432 334.525 76.32C334.842 76.1987 335.122 76.0307 335.365 75.816C335.617 75.6013 335.817 75.3447 335.967 75.046C336.116 74.738 336.191 74.3973 336.191 74.024ZM340.868 72.232H339.58V70.762H340.868V72.232ZM340.868 78H339.58V76.53H340.868V78Z"
        fill="#7E8A93"
      />
      <path
        d="M199.866 160.29L202.722 164H201.476L199.236 161.046L196.982 164H195.778L198.62 160.318L195.89 156.762H197.122L199.264 159.562L201.406 156.762H202.61L199.866 160.29ZM212.763 164H211.405L208.563 160.192H205.763V164H204.657V154.2H208.871C209.413 154.2 209.898 154.27 210.327 154.41C210.766 154.55 211.139 154.751 211.447 155.012C211.755 155.264 211.993 155.572 212.161 155.936C212.329 156.291 212.413 156.687 212.413 157.126C212.413 157.537 212.348 157.905 212.217 158.232C212.087 158.549 211.9 158.829 211.657 159.072C211.424 159.305 211.144 159.501 210.817 159.66C210.491 159.819 210.136 159.931 209.753 159.996L212.763 164ZM211.293 157.168C211.293 156.552 211.074 156.076 210.635 155.74C210.197 155.395 209.581 155.222 208.787 155.222H205.763V159.198H208.773C209.137 159.198 209.473 159.151 209.781 159.058C210.089 158.965 210.355 158.834 210.579 158.666C210.803 158.489 210.976 158.274 211.097 158.022C211.228 157.77 211.293 157.485 211.293 157.168ZM215.1 160.78C215.137 161.172 215.231 161.522 215.38 161.83C215.529 162.129 215.721 162.385 215.954 162.6C216.187 162.805 216.449 162.964 216.738 163.076C217.027 163.179 217.331 163.23 217.648 163.23C218.152 163.23 218.581 163.137 218.936 162.95C219.3 162.763 219.631 162.516 219.93 162.208L220.602 162.81C220.238 163.221 219.823 163.552 219.356 163.804C218.889 164.047 218.311 164.168 217.62 164.168C217.125 164.168 216.659 164.079 216.22 163.902C215.781 163.715 215.399 163.459 215.072 163.132C214.745 162.796 214.484 162.395 214.288 161.928C214.101 161.461 214.008 160.948 214.008 160.388C214.008 159.865 214.092 159.375 214.26 158.918C214.437 158.451 214.68 158.05 214.988 157.714C215.296 157.369 215.66 157.098 216.08 156.902C216.509 156.706 216.976 156.608 217.48 156.608C218.012 156.608 218.488 156.711 218.908 156.916C219.328 157.112 219.683 157.383 219.972 157.728C220.261 158.073 220.481 158.479 220.63 158.946C220.779 159.413 220.854 159.912 220.854 160.444C220.854 160.491 220.854 160.542 220.854 160.598C220.854 160.654 220.849 160.715 220.84 160.78H215.1ZM215.1 159.982H219.762C219.734 159.655 219.664 159.343 219.552 159.044C219.449 158.745 219.3 158.484 219.104 158.26C218.917 158.036 218.684 157.859 218.404 157.728C218.133 157.588 217.816 157.518 217.452 157.518C217.135 157.518 216.841 157.583 216.57 157.714C216.299 157.835 216.061 158.008 215.856 158.232C215.651 158.447 215.483 158.703 215.352 159.002C215.221 159.301 215.137 159.627 215.1 159.982ZM224.211 156.79H226.507V157.714H224.225V164H223.147V157.714H222.153V156.776H223.147V156.146C223.147 155.353 223.334 154.751 223.707 154.34C224.09 153.929 224.631 153.724 225.331 153.724C225.583 153.724 225.798 153.738 225.975 153.766C226.162 153.794 226.344 153.841 226.521 153.906V154.844C226.325 154.788 226.148 154.746 225.989 154.718C225.83 154.681 225.658 154.662 225.471 154.662C224.631 154.662 224.211 155.175 224.211 156.202V156.79ZM234.991 162.768L237.441 156.762H238.603L235.453 164.056H234.501L231.365 156.762H232.555L234.991 162.768ZM246.97 160.374C246.97 160.887 246.872 161.377 246.676 161.844C246.489 162.301 246.228 162.703 245.892 163.048C245.556 163.393 245.155 163.669 244.688 163.874C244.221 164.07 243.717 164.168 243.176 164.168C242.635 164.168 242.135 164.07 241.678 163.874C241.221 163.669 240.824 163.398 240.488 163.062C240.152 162.717 239.891 162.315 239.704 161.858C239.517 161.401 239.424 160.915 239.424 160.402C239.424 159.889 239.517 159.403 239.704 158.946C239.891 158.479 240.152 158.073 240.488 157.728C240.824 157.383 241.221 157.112 241.678 156.916C242.145 156.711 242.653 156.608 243.204 156.608C243.745 156.608 244.245 156.711 244.702 156.916C245.169 157.112 245.57 157.383 245.906 157.728C246.242 158.064 246.503 158.461 246.69 158.918C246.877 159.375 246.97 159.861 246.97 160.374ZM245.864 160.402C245.864 160.01 245.794 159.641 245.654 159.296C245.523 158.951 245.337 158.652 245.094 158.4C244.851 158.139 244.567 157.933 244.24 157.784C243.913 157.635 243.559 157.56 243.176 157.56C242.784 157.56 242.425 157.635 242.098 157.784C241.771 157.924 241.491 158.125 241.258 158.386C241.034 158.638 240.857 158.937 240.726 159.282C240.595 159.618 240.53 159.982 240.53 160.374C240.53 160.766 240.595 161.135 240.726 161.48C240.866 161.825 241.053 162.124 241.286 162.376C241.529 162.628 241.813 162.829 242.14 162.978C242.467 163.127 242.821 163.202 243.204 163.202C243.596 163.202 243.955 163.132 244.282 162.992C244.609 162.843 244.889 162.642 245.122 162.39C245.355 162.138 245.537 161.844 245.668 161.508C245.799 161.163 245.864 160.794 245.864 160.402ZM250.379 157.714V161.942C250.379 162.39 250.491 162.703 250.715 162.88C250.939 163.057 251.233 163.146 251.597 163.146C251.783 163.146 251.956 163.127 252.115 163.09C252.283 163.053 252.46 162.987 252.647 162.894V163.818C252.46 163.921 252.259 163.995 252.045 164.042C251.839 164.098 251.606 164.126 251.345 164.126C251.055 164.126 250.785 164.089 250.533 164.014C250.281 163.939 250.061 163.823 249.875 163.664C249.697 163.496 249.557 163.281 249.455 163.02C249.352 162.759 249.301 162.446 249.301 162.082V157.714H248.293V156.762H249.301V154.578H250.379V156.762H252.675V157.714H250.379ZM255.843 155.18H254.611V153.99H255.843V155.18ZM255.759 164H254.681V156.762H255.759V164ZM259.339 159.856V164H258.261V156.762H259.339V158.022C259.581 157.63 259.899 157.299 260.291 157.028C260.683 156.748 261.191 156.608 261.817 156.608C262.255 156.608 262.643 156.678 262.979 156.818C263.324 156.958 263.613 157.159 263.847 157.42C264.089 157.672 264.271 157.975 264.393 158.33C264.523 158.685 264.589 159.077 264.589 159.506V164H263.511V159.772C263.511 159.1 263.338 158.568 262.993 158.176C262.647 157.784 262.153 157.588 261.509 157.588C261.201 157.588 260.911 157.644 260.641 157.756C260.379 157.859 260.151 158.013 259.955 158.218C259.759 158.414 259.605 158.652 259.493 158.932C259.39 159.212 259.339 159.52 259.339 159.856ZM273.776 162.74C273.776 163.328 273.687 163.841 273.51 164.28C273.342 164.719 273.094 165.083 272.768 165.372C272.45 165.671 272.063 165.895 271.606 166.044C271.158 166.193 270.654 166.268 270.094 166.268C269.487 166.268 268.908 166.184 268.358 166.016C267.807 165.848 267.289 165.596 266.804 165.26L267.294 164.42C267.714 164.719 268.152 164.947 268.61 165.106C269.067 165.265 269.557 165.344 270.08 165.344C270.882 165.344 271.522 165.125 271.998 164.686C272.474 164.257 272.712 163.617 272.712 162.768V161.914C272.394 162.334 272.007 162.693 271.55 162.992C271.092 163.291 270.532 163.44 269.87 163.44C269.431 163.44 269.006 163.365 268.596 163.216C268.194 163.057 267.835 162.833 267.518 162.544C267.2 162.245 266.944 161.886 266.748 161.466C266.561 161.046 266.468 160.57 266.468 160.038C266.468 159.506 266.561 159.03 266.748 158.61C266.944 158.181 267.2 157.821 267.518 157.532C267.835 157.233 268.199 157.005 268.61 156.846C269.02 156.687 269.44 156.608 269.87 156.608C270.206 156.608 270.514 156.65 270.794 156.734C271.083 156.809 271.34 156.911 271.564 157.042C271.797 157.173 272.007 157.327 272.194 157.504C272.38 157.681 272.548 157.868 272.698 158.064V156.762H273.776V162.74ZM272.74 160.024C272.74 159.651 272.665 159.315 272.516 159.016C272.366 158.708 272.166 158.447 271.914 158.232C271.671 158.017 271.391 157.854 271.074 157.742C270.756 157.621 270.425 157.56 270.08 157.56C269.734 157.56 269.408 157.616 269.1 157.728C268.801 157.84 268.535 158.003 268.302 158.218C268.078 158.433 267.9 158.694 267.77 159.002C267.639 159.301 267.574 159.637 267.574 160.01C267.574 160.383 267.639 160.724 267.77 161.032C267.91 161.331 268.092 161.592 268.316 161.816C268.549 162.031 268.815 162.199 269.114 162.32C269.422 162.432 269.744 162.488 270.08 162.488C270.425 162.488 270.756 162.432 271.074 162.32C271.391 162.199 271.671 162.031 271.914 161.816C272.166 161.601 272.366 161.345 272.516 161.046C272.665 160.738 272.74 160.397 272.74 160.024ZM287.27 164H286.192V162.544C286.042 162.759 285.874 162.964 285.688 163.16C285.51 163.356 285.31 163.529 285.086 163.678C284.862 163.827 284.61 163.944 284.33 164.028C284.059 164.112 283.756 164.154 283.42 164.154C282.981 164.154 282.556 164.07 282.146 163.902C281.735 163.734 281.366 163.491 281.04 163.174C280.713 162.847 280.452 162.451 280.256 161.984C280.06 161.517 279.962 160.985 279.962 160.388C279.962 159.791 280.06 159.259 280.256 158.792C280.452 158.325 280.713 157.933 281.04 157.616C281.366 157.289 281.735 157.042 282.146 156.874C282.556 156.697 282.981 156.608 283.42 156.608C283.756 156.608 284.064 156.65 284.344 156.734C284.624 156.818 284.876 156.93 285.1 157.07C285.324 157.21 285.524 157.373 285.702 157.56C285.888 157.747 286.052 157.943 286.192 158.148V153.78H287.27V164ZM286.234 160.374C286.234 159.954 286.159 159.571 286.01 159.226C285.87 158.881 285.674 158.587 285.422 158.344C285.179 158.101 284.899 157.915 284.582 157.784C284.274 157.644 283.952 157.574 283.616 157.574C283.261 157.574 282.93 157.639 282.622 157.77C282.314 157.891 282.043 158.073 281.81 158.316C281.586 158.549 281.404 158.843 281.264 159.198C281.133 159.543 281.068 159.935 281.068 160.374C281.068 160.803 281.133 161.191 281.264 161.536C281.404 161.881 281.59 162.18 281.824 162.432C282.057 162.675 282.328 162.861 282.636 162.992C282.944 163.123 283.27 163.188 283.616 163.188C283.952 163.188 284.274 163.123 284.582 162.992C284.899 162.852 285.179 162.661 285.422 162.418C285.674 162.175 285.87 161.881 286.01 161.536C286.159 161.181 286.234 160.794 286.234 160.374ZM290.323 160.78C290.36 161.172 290.453 161.522 290.603 161.83C290.752 162.129 290.943 162.385 291.177 162.6C291.41 162.805 291.671 162.964 291.961 163.076C292.25 163.179 292.553 163.23 292.871 163.23C293.375 163.23 293.804 163.137 294.159 162.95C294.523 162.763 294.854 162.516 295.153 162.208L295.825 162.81C295.461 163.221 295.045 163.552 294.579 163.804C294.112 164.047 293.533 164.168 292.843 164.168C292.348 164.168 291.881 164.079 291.443 163.902C291.004 163.715 290.621 163.459 290.295 163.132C289.968 162.796 289.707 162.395 289.511 161.928C289.324 161.461 289.231 160.948 289.231 160.388C289.231 159.865 289.315 159.375 289.483 158.918C289.66 158.451 289.903 158.05 290.211 157.714C290.519 157.369 290.883 157.098 291.303 156.902C291.732 156.706 292.199 156.608 292.703 156.608C293.235 156.608 293.711 156.711 294.131 156.916C294.551 157.112 294.905 157.383 295.195 157.728C295.484 158.073 295.703 158.479 295.853 158.946C296.002 159.413 296.077 159.912 296.077 160.444C296.077 160.491 296.077 160.542 296.077 160.598C296.077 160.654 296.072 160.715 296.063 160.78H290.323ZM290.323 159.982H294.985C294.957 159.655 294.887 159.343 294.775 159.044C294.672 158.745 294.523 158.484 294.327 158.26C294.14 158.036 293.907 157.859 293.627 157.728C293.356 157.588 293.039 157.518 292.675 157.518C292.357 157.518 292.063 157.583 291.793 157.714C291.522 157.835 291.284 158.008 291.079 158.232C290.873 158.447 290.705 158.703 290.575 159.002C290.444 159.301 290.36 159.627 290.323 159.982ZM300.582 157.616C300.152 157.616 299.76 157.667 299.406 157.77C299.06 157.863 298.72 157.989 298.384 158.148L298.062 157.266C298.463 157.079 298.869 156.935 299.28 156.832C299.69 156.72 300.162 156.664 300.694 156.664C301.683 156.664 302.444 156.911 302.976 157.406C303.508 157.891 303.774 158.615 303.774 159.576V164H302.738V162.908C302.486 163.235 302.145 163.524 301.716 163.776C301.296 164.028 300.764 164.154 300.12 164.154C299.784 164.154 299.452 164.107 299.126 164.014C298.808 163.921 298.519 163.781 298.258 163.594C298.006 163.398 297.8 163.16 297.642 162.88C297.492 162.6 297.418 162.269 297.418 161.886C297.418 161.503 297.492 161.167 297.642 160.878C297.791 160.579 298.001 160.332 298.272 160.136C298.552 159.94 298.878 159.791 299.252 159.688C299.634 159.585 300.054 159.534 300.512 159.534C300.978 159.534 301.384 159.562 301.73 159.618C302.075 159.674 302.411 159.749 302.738 159.842V159.59C302.738 158.937 302.546 158.447 302.164 158.12C301.79 157.784 301.263 157.616 300.582 157.616ZM300.624 160.332C299.942 160.332 299.42 160.467 299.056 160.738C298.692 161.009 298.51 161.377 298.51 161.844C298.51 162.077 298.556 162.283 298.65 162.46C298.752 162.637 298.888 162.791 299.056 162.922C299.224 163.043 299.415 163.137 299.63 163.202C299.854 163.267 300.087 163.3 300.33 163.3C300.666 163.3 300.978 163.253 301.268 163.16C301.566 163.057 301.823 162.922 302.038 162.754C302.262 162.577 302.434 162.371 302.556 162.138C302.686 161.895 302.752 161.629 302.752 161.34V160.64C302.481 160.565 302.168 160.495 301.814 160.43C301.468 160.365 301.072 160.332 300.624 160.332ZM312.959 164H311.881V162.544C311.732 162.759 311.564 162.964 311.377 163.16C311.2 163.356 310.999 163.529 310.775 163.678C310.551 163.827 310.299 163.944 310.019 164.028C309.749 164.112 309.445 164.154 309.109 164.154C308.671 164.154 308.246 164.07 307.835 163.902C307.425 163.734 307.056 163.491 306.729 163.174C306.403 162.847 306.141 162.451 305.945 161.984C305.749 161.517 305.651 160.985 305.651 160.388C305.651 159.791 305.749 159.259 305.945 158.792C306.141 158.325 306.403 157.933 306.729 157.616C307.056 157.289 307.425 157.042 307.835 156.874C308.246 156.697 308.671 156.608 309.109 156.608C309.445 156.608 309.753 156.65 310.033 156.734C310.313 156.818 310.565 156.93 310.789 157.07C311.013 157.21 311.214 157.373 311.391 157.56C311.578 157.747 311.741 157.943 311.881 158.148V153.78H312.959V164ZM311.923 160.374C311.923 159.954 311.849 159.571 311.699 159.226C311.559 158.881 311.363 158.587 311.111 158.344C310.869 158.101 310.589 157.915 310.271 157.784C309.963 157.644 309.641 157.574 309.305 157.574C308.951 157.574 308.619 157.639 308.311 157.77C308.003 157.891 307.733 158.073 307.499 158.316C307.275 158.549 307.093 158.843 306.953 159.198C306.823 159.543 306.757 159.935 306.757 160.374C306.757 160.803 306.823 161.191 306.953 161.536C307.093 161.881 307.28 162.18 307.513 162.432C307.747 162.675 308.017 162.861 308.325 162.992C308.633 163.123 308.96 163.188 309.305 163.188C309.641 163.188 309.963 163.123 310.271 162.992C310.589 162.852 310.869 162.661 311.111 162.418C311.363 162.175 311.559 161.881 311.699 161.536C311.849 161.181 311.923 160.794 311.923 160.374ZM316.544 164H315.466V153.78H316.544V164ZM320.306 155.18H319.074V153.99H320.306V155.18ZM320.222 164H319.144V156.762H320.222V164ZM323.802 159.856V164H322.724V156.762H323.802V158.022C324.044 157.63 324.362 157.299 324.754 157.028C325.146 156.748 325.654 156.608 326.28 156.608C326.718 156.608 327.106 156.678 327.442 156.818C327.787 156.958 328.076 157.159 328.31 157.42C328.552 157.672 328.734 157.975 328.856 158.33C328.986 158.685 329.052 159.077 329.052 159.506V164H327.974V159.772C327.974 159.1 327.801 158.568 327.456 158.176C327.11 157.784 326.616 157.588 325.972 157.588C325.664 157.588 325.374 157.644 325.104 157.756C324.842 157.859 324.614 158.013 324.418 158.218C324.222 158.414 324.068 158.652 323.956 158.932C323.853 159.212 323.802 159.52 323.802 159.856ZM331.994 160.78C332.032 161.172 332.125 161.522 332.274 161.83C332.424 162.129 332.615 162.385 332.848 162.6C333.082 162.805 333.343 162.964 333.632 163.076C333.922 163.179 334.225 163.23 334.542 163.23C335.046 163.23 335.476 163.137 335.83 162.95C336.194 162.763 336.526 162.516 336.824 162.208L337.496 162.81C337.132 163.221 336.717 163.552 336.25 163.804C335.784 164.047 335.205 164.168 334.514 164.168C334.02 164.168 333.553 164.079 333.114 163.902C332.676 163.715 332.293 163.459 331.966 163.132C331.64 162.796 331.378 162.395 331.182 161.928C330.996 161.461 330.902 160.948 330.902 160.388C330.902 159.865 330.986 159.375 331.154 158.918C331.332 158.451 331.574 158.05 331.882 157.714C332.19 157.369 332.554 157.098 332.974 156.902C333.404 156.706 333.87 156.608 334.374 156.608C334.906 156.608 335.382 156.711 335.802 156.916C336.222 157.112 336.577 157.383 336.866 157.728C337.156 158.073 337.375 158.479 337.524 158.946C337.674 159.413 337.748 159.912 337.748 160.444C337.748 160.491 337.748 160.542 337.748 160.598C337.748 160.654 337.744 160.715 337.734 160.78H331.994ZM331.994 159.982H336.656C336.628 159.655 336.558 159.343 336.446 159.044C336.344 158.745 336.194 158.484 335.998 158.26C335.812 158.036 335.578 157.859 335.298 157.728C335.028 157.588 334.71 157.518 334.346 157.518C334.029 157.518 333.735 157.583 333.464 157.714C333.194 157.835 332.956 158.008 332.75 158.232C332.545 158.447 332.377 158.703 332.246 159.002C332.116 159.301 332.032 159.627 331.994 159.982ZM340.868 158.232H339.58V156.762H340.868V158.232ZM340.868 164H339.58V162.53H340.868V164Z"
        fill="#7E8A93"
      />
      <path
        d="M262.151 227L268.311 212.9H270.591L276.751 227H274.151L272.731 223.62H266.111L264.671 227H262.151ZM267.011 221.44H271.831L269.411 215.84L267.011 221.44ZM282.316 227.22C279.936 227.22 278.556 225.62 278.556 223.16V216.44H280.976V222.44C280.976 224.08 281.796 225.02 283.236 225.02C284.636 225.02 285.616 224.04 285.616 222.4V216.44H288.036V227H285.616V225.36C284.936 226.36 283.956 227.22 282.316 227.22ZM295.779 230.24C294.039 230.24 292.419 229.8 291.059 228.98L291.959 227.16C293.079 227.86 294.279 228.28 295.719 228.28C297.879 228.28 299.059 227.16 299.059 225.04V224.22C298.179 225.36 297.079 226.16 295.339 226.16C292.859 226.16 290.539 224.32 290.539 221.22V221.18C290.539 218.06 292.879 216.22 295.339 216.22C297.119 216.22 298.219 217.04 299.039 218.02V216.44H301.459V224.84C301.459 226.62 300.999 227.94 300.119 228.82C299.159 229.78 297.679 230.24 295.779 230.24ZM295.979 224.12C297.659 224.12 299.079 222.92 299.079 221.22V221.18C299.079 219.44 297.659 218.26 295.979 218.26C294.299 218.26 292.979 219.42 292.979 221.16V221.2C292.979 222.94 294.319 224.12 295.979 224.12ZM315.033 227.24C312.893 227.24 311.213 226.38 309.893 225.1L311.413 223.32C312.533 224.36 313.713 225 315.013 225C316.693 225 317.793 224.04 317.793 222.58V222.54C317.793 221.12 316.593 220.22 314.893 220.22C313.893 220.22 313.033 220.5 312.313 220.84L310.833 219.86L311.233 213H319.593V215.18H313.353L313.133 218.46C313.793 218.22 314.413 218.06 315.353 218.06C318.073 218.06 320.213 219.5 320.213 222.46V222.5C320.213 225.36 318.133 227.24 315.033 227.24ZM326.455 227.18C324.675 227.18 323.415 226.4 323.415 224.08V218.52H322.075V216.44H323.415V213.54H325.835V216.44H328.675V218.52H325.835V223.7C325.835 224.64 326.315 225.02 327.135 225.02C327.675 225.02 328.155 224.9 328.635 224.66V226.64C328.035 226.98 327.355 227.18 326.455 227.18ZM331.118 227V212.4H333.538V218.08C334.218 217.08 335.198 216.22 336.838 216.22C339.218 216.22 340.598 217.82 340.598 220.28V227H338.178V221C338.178 219.36 337.358 218.42 335.918 218.42C334.518 218.42 333.538 219.4 333.538 221.04V227H331.118Z"
        fill="white"
      />
      <path
        d="M156.986 242.062L153.416 247.312H153.36L149.79 242.076V250H148.712V240.2H149.832L153.402 245.548L156.972 240.2H158.092V250H156.986V242.062ZM161.328 246.78C161.366 247.172 161.459 247.522 161.608 247.83C161.758 248.129 161.949 248.385 162.182 248.6C162.416 248.805 162.677 248.964 162.966 249.076C163.256 249.179 163.559 249.23 163.876 249.23C164.38 249.23 164.81 249.137 165.164 248.95C165.528 248.763 165.86 248.516 166.158 248.208L166.83 248.81C166.466 249.221 166.051 249.552 165.584 249.804C165.118 250.047 164.539 250.168 163.848 250.168C163.354 250.168 162.887 250.079 162.448 249.902C162.01 249.715 161.627 249.459 161.3 249.132C160.974 248.796 160.712 248.395 160.516 247.928C160.33 247.461 160.236 246.948 160.236 246.388C160.236 245.865 160.32 245.375 160.488 244.918C160.666 244.451 160.908 244.05 161.216 243.714C161.524 243.369 161.888 243.098 162.308 242.902C162.738 242.706 163.204 242.608 163.708 242.608C164.24 242.608 164.716 242.711 165.136 242.916C165.556 243.112 165.911 243.383 166.2 243.728C166.49 244.073 166.709 244.479 166.858 244.946C167.008 245.413 167.082 245.912 167.082 246.444C167.082 246.491 167.082 246.542 167.082 246.598C167.082 246.654 167.078 246.715 167.068 246.78H161.328ZM161.328 245.982H165.99C165.962 245.655 165.892 245.343 165.78 245.044C165.678 244.745 165.528 244.484 165.332 244.26C165.146 244.036 164.912 243.859 164.632 243.728C164.362 243.588 164.044 243.518 163.68 243.518C163.363 243.518 163.069 243.583 162.798 243.714C162.528 243.835 162.29 244.008 162.084 244.232C161.879 244.447 161.711 244.703 161.58 245.002C161.45 245.301 161.366 245.627 161.328 245.982ZM174.71 244.05C174.84 243.854 174.985 243.667 175.144 243.49C175.312 243.313 175.498 243.159 175.704 243.028C175.909 242.897 176.138 242.795 176.39 242.72C176.651 242.645 176.94 242.608 177.258 242.608C178.098 242.608 178.756 242.869 179.232 243.392C179.708 243.905 179.946 244.615 179.946 245.52V250H178.868V245.772C178.868 245.072 178.7 244.535 178.364 244.162C178.037 243.779 177.58 243.588 176.992 243.588C176.721 243.588 176.464 243.639 176.222 243.742C175.979 243.835 175.764 243.98 175.578 244.176C175.4 244.363 175.256 244.596 175.144 244.876C175.041 245.156 174.99 245.473 174.99 245.828V250H173.926V245.744C173.926 245.063 173.758 244.535 173.422 244.162C173.095 243.779 172.642 243.588 172.064 243.588C171.774 243.588 171.508 243.644 171.266 243.756C171.023 243.868 170.808 244.027 170.622 244.232C170.444 244.437 170.304 244.68 170.202 244.96C170.099 245.231 170.048 245.534 170.048 245.87V250H168.97V242.762H170.048V243.98C170.169 243.803 170.3 243.63 170.44 243.462C170.589 243.294 170.757 243.149 170.944 243.028C171.13 242.897 171.34 242.795 171.574 242.72C171.807 242.645 172.078 242.608 172.386 242.608C172.974 242.608 173.459 242.748 173.842 243.028C174.224 243.299 174.514 243.639 174.71 244.05ZM182.93 246.78C182.967 247.172 183.061 247.522 183.21 247.83C183.359 248.129 183.551 248.385 183.784 248.6C184.017 248.805 184.279 248.964 184.568 249.076C184.857 249.179 185.161 249.23 185.478 249.23C185.982 249.23 186.411 249.137 186.766 248.95C187.13 248.763 187.461 248.516 187.76 248.208L188.432 248.81C188.068 249.221 187.653 249.552 187.186 249.804C186.719 250.047 186.141 250.168 185.45 250.168C184.955 250.168 184.489 250.079 184.05 249.902C183.611 249.715 183.229 249.459 182.902 249.132C182.575 248.796 182.314 248.395 182.118 247.928C181.931 247.461 181.838 246.948 181.838 246.388C181.838 245.865 181.922 245.375 182.09 244.918C182.267 244.451 182.51 244.05 182.818 243.714C183.126 243.369 183.49 243.098 183.91 242.902C184.339 242.706 184.806 242.608 185.31 242.608C185.842 242.608 186.318 242.711 186.738 242.916C187.158 243.112 187.513 243.383 187.802 243.728C188.091 244.073 188.311 244.479 188.46 244.946C188.609 245.413 188.684 245.912 188.684 246.444C188.684 246.491 188.684 246.542 188.684 246.598C188.684 246.654 188.679 246.715 188.67 246.78H182.93ZM182.93 245.982H187.592C187.564 245.655 187.494 245.343 187.382 245.044C187.279 244.745 187.13 244.484 186.934 244.26C186.747 244.036 186.514 243.859 186.234 243.728C185.963 243.588 185.646 243.518 185.282 243.518C184.965 243.518 184.671 243.583 184.4 243.714C184.129 243.835 183.891 244.008 183.686 244.232C183.481 244.447 183.313 244.703 183.182 245.002C183.051 245.301 182.967 245.627 182.93 245.982ZM194.463 241.222V250H193.343V241.222H190.053V240.2H197.753V241.222H194.463ZM204.97 246.374C204.97 246.887 204.872 247.377 204.676 247.844C204.489 248.301 204.228 248.703 203.892 249.048C203.556 249.393 203.155 249.669 202.688 249.874C202.221 250.07 201.717 250.168 201.176 250.168C200.635 250.168 200.135 250.07 199.678 249.874C199.221 249.669 198.824 249.398 198.488 249.062C198.152 248.717 197.891 248.315 197.704 247.858C197.517 247.401 197.424 246.915 197.424 246.402C197.424 245.889 197.517 245.403 197.704 244.946C197.891 244.479 198.152 244.073 198.488 243.728C198.824 243.383 199.221 243.112 199.678 242.916C200.145 242.711 200.653 242.608 201.204 242.608C201.745 242.608 202.245 242.711 202.702 242.916C203.169 243.112 203.57 243.383 203.906 243.728C204.242 244.064 204.503 244.461 204.69 244.918C204.877 245.375 204.97 245.861 204.97 246.374ZM203.864 246.402C203.864 246.01 203.794 245.641 203.654 245.296C203.523 244.951 203.337 244.652 203.094 244.4C202.851 244.139 202.567 243.933 202.24 243.784C201.913 243.635 201.559 243.56 201.176 243.56C200.784 243.56 200.425 243.635 200.098 243.784C199.771 243.924 199.491 244.125 199.258 244.386C199.034 244.638 198.857 244.937 198.726 245.282C198.595 245.618 198.53 245.982 198.53 246.374C198.53 246.766 198.595 247.135 198.726 247.48C198.866 247.825 199.053 248.124 199.286 248.376C199.529 248.628 199.813 248.829 200.14 248.978C200.467 249.127 200.821 249.202 201.204 249.202C201.596 249.202 201.955 249.132 202.282 248.992C202.609 248.843 202.889 248.642 203.122 248.39C203.355 248.138 203.537 247.844 203.668 247.508C203.799 247.163 203.864 246.794 203.864 246.402ZM210.213 245.87L213.349 250H212.061L209.471 246.626L208.001 248.11V250H206.923V239.78H208.001V246.836L211.907 242.762H213.251L210.213 245.87ZM215.182 246.78C215.219 247.172 215.313 247.522 215.462 247.83C215.611 248.129 215.803 248.385 216.036 248.6C216.269 248.805 216.531 248.964 216.82 249.076C217.109 249.179 217.413 249.23 217.73 249.23C218.234 249.23 218.663 249.137 219.018 248.95C219.382 248.763 219.713 248.516 220.012 248.208L220.684 248.81C220.32 249.221 219.905 249.552 219.438 249.804C218.971 250.047 218.393 250.168 217.702 250.168C217.207 250.168 216.741 250.079 216.302 249.902C215.863 249.715 215.481 249.459 215.154 249.132C214.827 248.796 214.566 248.395 214.37 247.928C214.183 247.461 214.09 246.948 214.09 246.388C214.09 245.865 214.174 245.375 214.342 244.918C214.519 244.451 214.762 244.05 215.07 243.714C215.378 243.369 215.742 243.098 216.162 242.902C216.591 242.706 217.058 242.608 217.562 242.608C218.094 242.608 218.57 242.711 218.99 242.916C219.41 243.112 219.765 243.383 220.054 243.728C220.343 244.073 220.563 244.479 220.712 244.946C220.861 245.413 220.936 245.912 220.936 246.444C220.936 246.491 220.936 246.542 220.936 246.598C220.936 246.654 220.931 246.715 220.922 246.78H215.182ZM215.182 245.982H219.844C219.816 245.655 219.746 245.343 219.634 245.044C219.531 244.745 219.382 244.484 219.186 244.26C218.999 244.036 218.766 243.859 218.486 243.728C218.215 243.588 217.898 243.518 217.534 243.518C217.217 243.518 216.923 243.583 216.652 243.714C216.381 243.835 216.143 244.008 215.938 244.232C215.733 244.447 215.565 244.703 215.434 245.002C215.303 245.301 215.219 245.627 215.182 245.982ZM223.901 245.856V250H222.823V242.762H223.901V244.022C224.144 243.63 224.461 243.299 224.853 243.028C225.245 242.748 225.754 242.608 226.379 242.608C226.818 242.608 227.205 242.678 227.541 242.818C227.886 242.958 228.176 243.159 228.409 243.42C228.652 243.672 228.834 243.975 228.955 244.33C229.086 244.685 229.151 245.077 229.151 245.506V250H228.073V245.772C228.073 245.1 227.9 244.568 227.555 244.176C227.21 243.784 226.715 243.588 226.071 243.588C225.763 243.588 225.474 243.644 225.203 243.756C224.942 243.859 224.713 244.013 224.517 244.218C224.321 244.414 224.167 244.652 224.055 244.932C223.952 245.212 223.901 245.52 223.901 245.856ZM238.559 248.768L241.009 242.762H242.171L239.021 250.056H238.069L234.933 242.762H236.123L238.559 248.768ZM250.538 246.374C250.538 246.887 250.44 247.377 250.244 247.844C250.058 248.301 249.796 248.703 249.46 249.048C249.124 249.393 248.723 249.669 248.256 249.874C247.79 250.07 247.286 250.168 246.744 250.168C246.203 250.168 245.704 250.07 245.246 249.874C244.789 249.669 244.392 249.398 244.056 249.062C243.72 248.717 243.459 248.315 243.272 247.858C243.086 247.401 242.992 246.915 242.992 246.402C242.992 245.889 243.086 245.403 243.272 244.946C243.459 244.479 243.72 244.073 244.056 243.728C244.392 243.383 244.789 243.112 245.246 242.916C245.713 242.711 246.222 242.608 246.772 242.608C247.314 242.608 247.813 242.711 248.27 242.916C248.737 243.112 249.138 243.383 249.474 243.728C249.81 244.064 250.072 244.461 250.258 244.918C250.445 245.375 250.538 245.861 250.538 246.374ZM249.432 246.402C249.432 246.01 249.362 245.641 249.222 245.296C249.092 244.951 248.905 244.652 248.662 244.4C248.42 244.139 248.135 243.933 247.808 243.784C247.482 243.635 247.127 243.56 246.744 243.56C246.352 243.56 245.993 243.635 245.666 243.784C245.34 243.924 245.06 244.125 244.826 244.386C244.602 244.638 244.425 244.937 244.294 245.282C244.164 245.618 244.098 245.982 244.098 246.374C244.098 246.766 244.164 247.135 244.294 247.48C244.434 247.825 244.621 248.124 244.854 248.376C245.097 248.628 245.382 248.829 245.708 248.978C246.035 249.127 246.39 249.202 246.772 249.202C247.164 249.202 247.524 249.132 247.85 248.992C248.177 248.843 248.457 248.642 248.69 248.39C248.924 248.138 249.106 247.844 249.236 247.508C249.367 247.163 249.432 246.794 249.432 246.402ZM253.947 243.714V247.942C253.947 248.39 254.059 248.703 254.283 248.88C254.507 249.057 254.801 249.146 255.165 249.146C255.352 249.146 255.524 249.127 255.683 249.09C255.851 249.053 256.028 248.987 256.215 248.894V249.818C256.028 249.921 255.828 249.995 255.613 250.042C255.408 250.098 255.174 250.126 254.913 250.126C254.624 250.126 254.353 250.089 254.101 250.014C253.849 249.939 253.63 249.823 253.443 249.664C253.266 249.496 253.126 249.281 253.023 249.02C252.92 248.759 252.869 248.446 252.869 248.082V243.714H251.861V242.762H252.869V240.578H253.947V242.762H256.243V243.714H253.947ZM259.411 241.18H258.179V239.99H259.411V241.18ZM259.327 250H258.249V242.762H259.327V250ZM262.907 245.856V250H261.829V242.762H262.907V244.022C263.15 243.63 263.467 243.299 263.859 243.028C264.251 242.748 264.76 242.608 265.385 242.608C265.824 242.608 266.211 242.678 266.547 242.818C266.892 242.958 267.182 243.159 267.415 243.42C267.658 243.672 267.84 243.975 267.961 244.33C268.092 244.685 268.157 245.077 268.157 245.506V250H267.079V245.772C267.079 245.1 266.906 244.568 266.561 244.176C266.216 243.784 265.721 243.588 265.077 243.588C264.769 243.588 264.48 243.644 264.209 243.756C263.948 243.859 263.719 244.013 263.523 244.218C263.327 244.414 263.173 244.652 263.061 244.932C262.958 245.212 262.907 245.52 262.907 245.856ZM277.344 248.74C277.344 249.328 277.255 249.841 277.078 250.28C276.91 250.719 276.663 251.083 276.336 251.372C276.019 251.671 275.631 251.895 275.174 252.044C274.726 252.193 274.222 252.268 273.662 252.268C273.055 252.268 272.477 252.184 271.926 252.016C271.375 251.848 270.857 251.596 270.372 251.26L270.862 250.42C271.282 250.719 271.721 250.947 272.178 251.106C272.635 251.265 273.125 251.344 273.648 251.344C274.451 251.344 275.09 251.125 275.566 250.686C276.042 250.257 276.28 249.617 276.28 248.768V247.914C275.963 248.334 275.575 248.693 275.118 248.992C274.661 249.291 274.101 249.44 273.438 249.44C272.999 249.44 272.575 249.365 272.164 249.216C271.763 249.057 271.403 248.833 271.086 248.544C270.769 248.245 270.512 247.886 270.316 247.466C270.129 247.046 270.036 246.57 270.036 246.038C270.036 245.506 270.129 245.03 270.316 244.61C270.512 244.181 270.769 243.821 271.086 243.532C271.403 243.233 271.767 243.005 272.178 242.846C272.589 242.687 273.009 242.608 273.438 242.608C273.774 242.608 274.082 242.65 274.362 242.734C274.651 242.809 274.908 242.911 275.132 243.042C275.365 243.173 275.575 243.327 275.762 243.504C275.949 243.681 276.117 243.868 276.266 244.064V242.762H277.344V248.74ZM276.308 246.024C276.308 245.651 276.233 245.315 276.084 245.016C275.935 244.708 275.734 244.447 275.482 244.232C275.239 244.017 274.959 243.854 274.642 243.742C274.325 243.621 273.993 243.56 273.648 243.56C273.303 243.56 272.976 243.616 272.668 243.728C272.369 243.84 272.103 244.003 271.87 244.218C271.646 244.433 271.469 244.694 271.338 245.002C271.207 245.301 271.142 245.637 271.142 246.01C271.142 246.383 271.207 246.724 271.338 247.032C271.478 247.331 271.66 247.592 271.884 247.816C272.117 248.031 272.383 248.199 272.682 248.32C272.99 248.432 273.312 248.488 273.648 248.488C273.993 248.488 274.325 248.432 274.642 248.32C274.959 248.199 275.239 248.031 275.482 247.816C275.734 247.601 275.935 247.345 276.084 247.046C276.233 246.738 276.308 246.397 276.308 246.024ZM290.838 250H289.76V248.544C289.611 248.759 289.443 248.964 289.256 249.16C289.079 249.356 288.878 249.529 288.654 249.678C288.43 249.827 288.178 249.944 287.898 250.028C287.627 250.112 287.324 250.154 286.988 250.154C286.549 250.154 286.125 250.07 285.714 249.902C285.303 249.734 284.935 249.491 284.608 249.174C284.281 248.847 284.02 248.451 283.824 247.984C283.628 247.517 283.53 246.985 283.53 246.388C283.53 245.791 283.628 245.259 283.824 244.792C284.02 244.325 284.281 243.933 284.608 243.616C284.935 243.289 285.303 243.042 285.714 242.874C286.125 242.697 286.549 242.608 286.988 242.608C287.324 242.608 287.632 242.65 287.912 242.734C288.192 242.818 288.444 242.93 288.668 243.07C288.892 243.21 289.093 243.373 289.27 243.56C289.457 243.747 289.62 243.943 289.76 244.148V239.78H290.838V250ZM289.802 246.374C289.802 245.954 289.727 245.571 289.578 245.226C289.438 244.881 289.242 244.587 288.99 244.344C288.747 244.101 288.467 243.915 288.15 243.784C287.842 243.644 287.52 243.574 287.184 243.574C286.829 243.574 286.498 243.639 286.19 243.77C285.882 243.891 285.611 244.073 285.378 244.316C285.154 244.549 284.972 244.843 284.832 245.198C284.701 245.543 284.636 245.935 284.636 246.374C284.636 246.803 284.701 247.191 284.832 247.536C284.972 247.881 285.159 248.18 285.392 248.432C285.625 248.675 285.896 248.861 286.204 248.992C286.512 249.123 286.839 249.188 287.184 249.188C287.52 249.188 287.842 249.123 288.15 248.992C288.467 248.852 288.747 248.661 288.99 248.418C289.242 248.175 289.438 247.881 289.578 247.536C289.727 247.181 289.802 246.794 289.802 246.374ZM293.891 246.78C293.928 247.172 294.022 247.522 294.171 247.83C294.32 248.129 294.512 248.385 294.745 248.6C294.978 248.805 295.24 248.964 295.529 249.076C295.818 249.179 296.122 249.23 296.439 249.23C296.943 249.23 297.372 249.137 297.727 248.95C298.091 248.763 298.422 248.516 298.721 248.208L299.393 248.81C299.029 249.221 298.614 249.552 298.147 249.804C297.68 250.047 297.102 250.168 296.411 250.168C295.916 250.168 295.45 250.079 295.011 249.902C294.572 249.715 294.19 249.459 293.863 249.132C293.536 248.796 293.275 248.395 293.079 247.928C292.892 247.461 292.799 246.948 292.799 246.388C292.799 245.865 292.883 245.375 293.051 244.918C293.228 244.451 293.471 244.05 293.779 243.714C294.087 243.369 294.451 243.098 294.871 242.902C295.3 242.706 295.767 242.608 296.271 242.608C296.803 242.608 297.279 242.711 297.699 242.916C298.119 243.112 298.474 243.383 298.763 243.728C299.052 244.073 299.272 244.479 299.421 244.946C299.57 245.413 299.645 245.912 299.645 246.444C299.645 246.491 299.645 246.542 299.645 246.598C299.645 246.654 299.64 246.715 299.631 246.78H293.891ZM293.891 245.982H298.553C298.525 245.655 298.455 245.343 298.343 245.044C298.24 244.745 298.091 244.484 297.895 244.26C297.708 244.036 297.475 243.859 297.195 243.728C296.924 243.588 296.607 243.518 296.243 243.518C295.926 243.518 295.632 243.583 295.361 243.714C295.09 243.835 294.852 244.008 294.647 244.232C294.442 244.447 294.274 244.703 294.143 245.002C294.012 245.301 293.928 245.627 293.891 245.982ZM304.15 243.616C303.721 243.616 303.329 243.667 302.974 243.77C302.629 243.863 302.288 243.989 301.952 244.148L301.63 243.266C302.031 243.079 302.437 242.935 302.848 242.832C303.259 242.72 303.73 242.664 304.262 242.664C305.251 242.664 306.012 242.911 306.544 243.406C307.076 243.891 307.342 244.615 307.342 245.576V250H306.306V248.908C306.054 249.235 305.713 249.524 305.284 249.776C304.864 250.028 304.332 250.154 303.688 250.154C303.352 250.154 303.021 250.107 302.694 250.014C302.377 249.921 302.087 249.781 301.826 249.594C301.574 249.398 301.369 249.16 301.21 248.88C301.061 248.6 300.986 248.269 300.986 247.886C300.986 247.503 301.061 247.167 301.21 246.878C301.359 246.579 301.569 246.332 301.84 246.136C302.12 245.94 302.447 245.791 302.82 245.688C303.203 245.585 303.623 245.534 304.08 245.534C304.547 245.534 304.953 245.562 305.298 245.618C305.643 245.674 305.979 245.749 306.306 245.842V245.59C306.306 244.937 306.115 244.447 305.732 244.12C305.359 243.784 304.831 243.616 304.15 243.616ZM304.192 246.332C303.511 246.332 302.988 246.467 302.624 246.738C302.26 247.009 302.078 247.377 302.078 247.844C302.078 248.077 302.125 248.283 302.218 248.46C302.321 248.637 302.456 248.791 302.624 248.922C302.792 249.043 302.983 249.137 303.198 249.202C303.422 249.267 303.655 249.3 303.898 249.3C304.234 249.3 304.547 249.253 304.836 249.16C305.135 249.057 305.391 248.922 305.606 248.754C305.83 248.577 306.003 248.371 306.124 248.138C306.255 247.895 306.32 247.629 306.32 247.34V246.64C306.049 246.565 305.737 246.495 305.382 246.43C305.037 246.365 304.64 246.332 304.192 246.332ZM316.528 250H315.45V248.544C315.3 248.759 315.132 248.964 314.946 249.16C314.768 249.356 314.568 249.529 314.344 249.678C314.12 249.827 313.868 249.944 313.588 250.028C313.317 250.112 313.014 250.154 312.678 250.154C312.239 250.154 311.814 250.07 311.404 249.902C310.993 249.734 310.624 249.491 310.298 249.174C309.971 248.847 309.71 248.451 309.514 247.984C309.318 247.517 309.22 246.985 309.22 246.388C309.22 245.791 309.318 245.259 309.514 244.792C309.71 244.325 309.971 243.933 310.298 243.616C310.624 243.289 310.993 243.042 311.404 242.874C311.814 242.697 312.239 242.608 312.678 242.608C313.014 242.608 313.322 242.65 313.602 242.734C313.882 242.818 314.134 242.93 314.358 243.07C314.582 243.21 314.782 243.373 314.96 243.56C315.146 243.747 315.31 243.943 315.45 244.148V239.78H316.528V250ZM315.492 246.374C315.492 245.954 315.417 245.571 315.268 245.226C315.128 244.881 314.932 244.587 314.68 244.344C314.437 244.101 314.157 243.915 313.84 243.784C313.532 243.644 313.21 243.574 312.874 243.574C312.519 243.574 312.188 243.639 311.88 243.77C311.572 243.891 311.301 244.073 311.068 244.316C310.844 244.549 310.662 244.843 310.522 245.198C310.391 245.543 310.326 245.935 310.326 246.374C310.326 246.803 310.391 247.191 310.522 247.536C310.662 247.881 310.848 248.18 311.082 248.432C311.315 248.675 311.586 248.861 311.894 248.992C312.202 249.123 312.528 249.188 312.874 249.188C313.21 249.188 313.532 249.123 313.84 248.992C314.157 248.852 314.437 248.661 314.68 248.418C314.932 248.175 315.128 247.881 315.268 247.536C315.417 247.181 315.492 246.794 315.492 246.374ZM320.112 250H319.034V239.78H320.112V250ZM323.874 241.18H322.642V239.99H323.874V241.18ZM323.79 250H322.712V242.762H323.79V250ZM327.37 245.856V250H326.292V242.762H327.37V244.022C327.613 243.63 327.93 243.299 328.322 243.028C328.714 242.748 329.223 242.608 329.848 242.608C330.287 242.608 330.674 242.678 331.01 242.818C331.355 242.958 331.645 243.159 331.878 243.42C332.121 243.672 332.303 243.975 332.424 244.33C332.555 244.685 332.62 245.077 332.62 245.506V250H331.542V245.772C331.542 245.1 331.369 244.568 331.024 244.176C330.679 243.784 330.184 243.588 329.54 243.588C329.232 243.588 328.943 243.644 328.672 243.756C328.411 243.859 328.182 244.013 327.986 244.218C327.79 244.414 327.636 244.652 327.524 244.932C327.421 245.212 327.37 245.52 327.37 245.856ZM335.563 246.78C335.6 247.172 335.694 247.522 335.843 247.83C335.992 248.129 336.184 248.385 336.417 248.6C336.65 248.805 336.912 248.964 337.201 249.076C337.49 249.179 337.794 249.23 338.111 249.23C338.615 249.23 339.044 249.137 339.399 248.95C339.763 248.763 340.094 248.516 340.393 248.208L341.065 248.81C340.701 249.221 340.286 249.552 339.819 249.804C339.352 250.047 338.774 250.168 338.083 250.168C337.588 250.168 337.122 250.079 336.683 249.902C336.244 249.715 335.862 249.459 335.535 249.132C335.208 248.796 334.947 248.395 334.751 247.928C334.564 247.461 334.471 246.948 334.471 246.388C334.471 245.865 334.555 245.375 334.723 244.918C334.9 244.451 335.143 244.05 335.451 243.714C335.759 243.369 336.123 243.098 336.543 242.902C336.972 242.706 337.439 242.608 337.943 242.608C338.475 242.608 338.951 242.711 339.371 242.916C339.791 243.112 340.146 243.383 340.435 243.728C340.724 244.073 340.944 244.479 341.093 244.946C341.242 245.413 341.317 245.912 341.317 246.444C341.317 246.491 341.317 246.542 341.317 246.598C341.317 246.654 341.312 246.715 341.303 246.78H335.563ZM335.563 245.982H340.225C340.197 245.655 340.127 245.343 340.015 245.044C339.912 244.745 339.763 244.484 339.567 244.26C339.38 244.036 339.147 243.859 338.867 243.728C338.596 243.588 338.279 243.518 337.915 243.518C337.598 243.518 337.304 243.583 337.033 243.714C336.762 243.835 336.524 244.008 336.319 244.232C336.114 244.447 335.946 244.703 335.815 245.002C335.684 245.301 335.6 245.627 335.563 245.982Z"
        fill="#7E8A93"
      />
      <path
        d="M374.971 58.2076C375.491 58.6079 375.491 59.3921 374.971 59.7924L368.61 64.6888C367.952 65.195 367 64.7263 367 63.8964L367 54.1036C367 53.2737 367.952 52.805 368.61 53.3112L374.971 58.2076Z"
        fill="#00FFD1"
      />
      <path
        opacity="0.3"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.4558 105.358C42.2361 79.746 70.6185 60.5127 70.6185 60.5127V60.5267C56.6305 71.7908 39.531 88.4474 40.5962 89.3908C41.5443 90.2304 45.7012 86.5193 55.9229 77.3937L55.923 77.3936C57.1858 76.2662 58.5411 75.0562 59.9944 73.762C73.2255 61.9911 91.3762 49.0797 91.3762 49.0797C91.3762 49.0797 67.0865 68.0877 53.547 80.8442C40.0075 93.6007 34.1208 100.725 35.2281 101.739C36.2312 102.657 38.9828 100.028 44.7021 94.5633L44.7024 94.5629C45.2962 93.9956 45.9219 93.3977 46.581 92.77C48.913 90.5492 50.711 88.7198 52.8097 86.5844L52.8099 86.5843L52.8101 86.5841L52.8101 86.584C57.0185 82.3022 62.4359 76.7902 75.7904 64.4269C95.8053 45.8835 113.564 34 113.564 34C113.564 34 93.801 49.2909 75.1737 66.9895C55.6915 85.4906 46.9034 95.6282 47.8565 96.5293C48.8096 97.4305 57.4435 89.2922 68.5301 78.6477C79.6168 68.0173 96.2678 52.7687 96.2678 52.7687C96.2678 52.7687 89.5401 59.3581 73.5759 75.1559C57.6257 90.9537 73.8562 79.1124 80.3877 73.2128C86.9191 67.3133 103.584 53.0221 103.584 53.0221C103.584 53.0221 53.2667 108.61 31.7942 123.408C10.3216 138.192 -7.32453 130.969 17.4558 105.358ZM60.0236 108.779C55.2582 113.397 36.1403 124.14 31.1787 126.322L31.1647 126.337C25.4041 128.871 48.2081 123.112 57.7811 117.382C67.368 111.651 64.7891 104.161 60.0236 108.779ZM9.70575 106.538C11.1074 101.878 23.904 75.6185 26.3708 79.8848C28.0939 82.855 23.8055 88.0788 20.0744 92.6237L20.0744 92.6238C18.4641 94.5852 16.9577 96.4202 16.083 97.8931L15.8462 98.2921C12.9302 103.204 8.43715 110.773 9.70575 106.552V106.538ZM2.45935 102.797C-0.904493 103.979 -0.0775486 119.608 0.6653 122.086C1.22874 123.976 1.68022 121.545 2.29483 118.235C2.62813 116.44 3.0094 114.387 3.48252 112.624C4.82805 107.612 5.82319 101.614 2.45935 102.797ZM58.5089 104.723C60.5552 104.118 72.3007 98.0775 72.2166 95.6417C72.1325 93.2058 67.9837 96.2894 64.69 99.1476C63.5242 100.159 62.1109 101.241 60.877 102.186C58.6244 103.911 56.9695 105.178 58.5089 104.723ZM94.6285 72.9173C94.7547 74.1845 82.3785 84.1531 82.1262 83.6181H82.1403C81.9239 83.1835 82.625 82.5895 84.1852 81.2676C84.8492 80.705 85.6687 80.0107 86.6394 79.1406C87.4779 78.387 88.369 77.54 89.2404 76.7117C91.967 74.1202 94.5011 71.7116 94.6285 72.9173ZM87.5358 58.656C87.5078 58.318 71.7258 72.2009 71.3473 73.2147C70.9966 74.1648 74.3764 71.0113 78.0106 67.6204L78.0109 67.6201C79.1699 66.5387 80.3548 65.4331 81.4529 64.4288C82.6997 63.2912 83.7403 62.3596 84.5879 61.6009C86.646 59.7584 87.5656 58.9352 87.5358 58.656ZM71.5162 101.064C71.4741 102.12 66.3162 104.218 65.4332 104.387C64.7678 104.513 65.4928 104.048 66.4903 103.409C67.0476 103.052 67.6899 102.64 68.2224 102.247C69.7081 101.148 71.5582 100.008 71.5162 101.064Z"
        fill="url(#paint2_linear_0_1)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M460.297 48.3243L460.296 48.3249L460.296 48.3251L460.296 48.3255C456.399 51.211 451.813 54.6063 448.689 57.0966C445.029 60.0083 442.034 62.7179 442.105 64.0846C442.165 65.4631 444.173 64.7976 448.653 60.9828C450.091 59.7578 451.814 58.2439 453.807 56.4935C459.044 51.8926 466.141 45.657 474.811 38.7354C487.885 28.3024 492.304 25.0125 500.922 18.5958L500.922 18.5957C503.161 16.9284 505.684 15.05 508.716 12.7802C527.351 -1.18377 526.329 -4.10729 513.66 6.00621C510.432 8.58647 508.807 9.87391 507.606 10.8257C504.795 13.0523 504.303 13.4423 491.033 24.2485C477.14 35.5623 469.415 41.5401 463.889 45.664L463.865 45.6758C462.804 46.4684 461.588 47.3684 460.297 48.3243ZM480.289 37.9734C486.956 33.5881 501.574 24.045 507.076 20.5511V20.5629C510.166 18.602 513.696 16.653 509.822 19.3032C508.707 20.0673 506.146 21.8743 502.889 24.1728C495.102 29.6681 483.335 37.9725 477.829 41.5505C470.473 46.3161 473.967 42.1329 480.289 37.9734ZM430.673 63.3452C430.287 63.9879 429.834 64.7248 429.35 65.5134C427.793 68.0501 425.908 71.1222 424.838 73.3161C423.519 76.0138 422.687 78.9374 423.602 79.5316C424.564 80.1614 426.644 80.1852 431.529 78.0104C438.112 75.0869 492.661 44.164 503.809 36.6056C518.212 26.8368 508.895 31.8401 503.119 35.8332C499.462 38.3616 478.07 50.1603 462.665 58.6572L462.664 58.6575L462.664 58.6578L462.663 58.6581C456.347 62.1422 451.037 65.071 448.369 66.5777C443.96 69.0734 433.383 74.7898 430.59 76.0733C428.736 76.9289 425.444 77.5469 425.313 75.7999C425.182 74.0886 427.167 70.3688 429.96 66.1499C431.403 63.9653 432.698 61.9641 433.813 60.2413L433.813 60.241C435.361 57.8497 436.561 55.9949 437.328 54.9312C438.778 52.9346 437.661 52.1027 436.591 53.6477C435.779 54.8203 433.59 58.4951 431.698 61.6706L431.697 61.6708C431.346 62.2605 431.005 62.833 430.685 63.369L430.673 63.3452ZM421.986 76.3502C421.059 78.7865 421.272 80.1769 422.461 80.9257C423.856 81.7987 428.017 80.4819 429.461 80.0246L429.462 80.0246L429.462 80.0245L429.462 80.0244C429.826 79.9092 430.017 79.8486 429.948 79.8917C426.858 81.7813 424.113 82.8152 421.724 82.9816C420.322 83.0767 419.062 82.8747 419.003 81.3535C418.908 78.6676 421.463 74.0209 423.542 70.3368C425.384 67.0567 427.226 63.9787 427.393 63.9787C427.586 63.9787 427.143 64.9189 426.579 66.118C426.204 66.9141 425.776 67.8242 425.444 68.6492C425.05 69.631 424.552 70.6708 424.02 71.7809C423.348 73.1835 422.622 74.6983 421.986 76.3502ZM438.152 67.9244C439.197 67.2459 440.128 66.6415 440.726 66.2807L440.738 66.2688C441.475 65.8291 441.593 66.2807 440.987 66.8036C440.393 67.3027 434.582 72.104 431.86 73.9579C429.436 75.6098 426.251 76.8339 426.477 74.9562C426.702 73.0666 433.453 66.1975 436.459 63.4641C437.788 62.26 439.153 61.0147 440.615 59.6802L440.616 59.6795C442.92 57.5766 445.467 55.2522 448.498 52.5187C454.393 47.1946 462.106 41.5733 461.559 42.8925C460.905 44.4612 457.613 47.2183 450.97 52.2216C447.227 55.0435 443.921 58.0482 440.889 60.8036L440.889 60.8036C439.618 61.9589 438.395 63.0702 437.208 64.1059C433.911 66.9951 431.132 69.9059 430.489 71.1906C430.718 70.889 431.007 70.5824 431.351 70.3003C433.3 68.6959 437.626 65.2613 439.313 64.0967C440.264 63.4431 440.537 63.7996 439.48 64.8692C438.622 65.737 435.244 69.0923 432.788 71.2347C433.164 71.044 433.562 70.8232 433.964 70.5828C435.229 69.8223 436.788 68.8102 438.152 67.9244ZM443.805 50.4397C449.95 42.8695 465.518 25.3877 475.822 14.3116C479.897 9.93928 475.229 15.567 468.843 23.2661C467.574 24.7957 466.237 26.407 464.888 28.0379C464.055 29.0455 463.176 30.1169 462.272 31.2246C464.963 28.9597 469.518 25.113 470.508 24.1887C471.982 22.7983 475.167 19.9104 471.483 23.5113C469.775 25.1829 467.006 27.7975 464.317 30.3362L464.316 30.3372C462.13 32.401 459.997 34.4146 458.531 35.8306C457.499 37.1066 456.469 38.3813 455.471 39.6173L455.47 39.6185L455.47 39.6187L455.469 39.6197L455.468 39.6211L455.467 39.623L455.462 39.6285C454.4 40.9442 453.373 42.2161 452.415 43.3991C457.925 38.5312 461.242 36.3728 459.289 38.3912C458.396 39.3167 456.318 41.3844 454.019 43.6713L454.019 43.6714L454.018 43.6721C450.416 47.2555 446.273 51.3765 445.304 52.4834L442.821 54.8828C441.019 57.0073 439.225 59.1031 438.042 60.375C435.997 62.5736 435.094 62.5854 435.475 61.7298C435.855 60.8503 438.422 57.0593 443.805 50.4397ZM445.304 52.4834L445.314 52.4741L445.302 52.4859L445.304 52.4834ZM430.969 67.1731C430.839 66.8522 431.635 65.4499 433.501 62.6333C435.521 59.5909 436.377 58.4144 436.032 59.1393C435.687 59.8524 433.774 63.2156 432.918 64.7131C432.086 66.1629 431.148 67.6128 430.969 67.185V67.1731ZM433.502 52.3542C436.687 44.9265 438.077 41.3969 437.946 40.9572V40.9691C437.768 40.3867 436.164 44.1778 434.726 47.8263C433.24 51.5817 429.889 60.079 429.271 61.8022C428.641 63.5373 430.067 60.3642 433.502 52.3542ZM439.882 75.5782C439.882 75.5782 458.742 69.3509 463.282 67.9604C467.822 66.57 468.036 68.3288 461.214 70.3135C454.393 72.2982 434.831 77.2539 439.882 75.5901V75.5782ZM456.165 60.0099C462.606 56.0049 489.132 39.0223 489.132 39.0223C496.239 34.4825 468.014 50.752 458.292 56.6585C448.571 62.565 449.724 64.003 456.165 60.0099Z"
        fill="url(#paint3_linear_0_1)"
      />
      <defs>
        <pattern
          id="pattern0_0_1"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image0_0_1"
            transform="matrix(0.0178571 0 0 0.0167411 0 -0.0189732)"
          />
        </pattern>
        <linearGradient
          id="paint0_linear_0_1"
          x1="369.5"
          y1="71"
          x2="369.5"
          y2="135"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0" />
          <stop offset="0.5" stopColor="#00FFD1" />
          <stop offset="1" stopColor="#00FFD1" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_0_1"
          x1="369.5"
          y1="159"
          x2="369.5"
          y2="218"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0" />
          <stop offset="0.5" stopColor="#00FFD1" />
          <stop offset="1" stopColor="#00FFD1" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_0_1"
          x1="113.563"
          y1="41.0974"
          x2="45.1053"
          y2="154.33"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0.2" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_0_1"
          x1="522.392"
          y1="-3.50896e-06"
          x2="421.375"
          y2="80.812"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <image
          id="image0_0_1"
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
      width="320"
      height="178"
      viewBox="0 0 320 178"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <line
        x1="12.5"
        y1="24"
        x2="12.5"
        y2="68"
        stroke="url(#paint0_linear_0_1)"
      />
      <line
        x1="12.5"
        y1="95"
        x2="12.5"
        y2="135"
        stroke="url(#paint1_linear_0_1)"
      />
      <circle cx="12" cy="80" r="11.5" fill="#16453C" stroke="#00FFD1" />
      <rect x="4.5" y="72" width="15" height="16" fill="url(#pattern0_0_2)" />
      <circle cx="12" cy="147" r="11.5" fill="#16453C" stroke="#00FFD1" />
      <path
        d="M17.1061 142.319C17.0063 142.043 16.522 141.435 15.3826 141.213C14.2433 140.991 13.235 141.624 12.8732 141.968C12.7815 141.902 12.6441 141.823 12.4678 141.749C11.7922 141.235 10.2338 140.149 9.40507 139.909C8.36911 139.608 8.94808 140.09 9.11375 140.992C9.24629 141.713 9.18961 141.938 9.1447 141.961C9.01489 142.028 8.88518 142.103 8.75607 142.186C8.2402 142.068 7.03247 141.835 6.32842 141.847C5.44836 141.862 5.56177 141.945 5.76402 142.245C5.92582 142.485 6.53916 143.588 6.8256 144.11C6.77816 144.179 6.73134 144.25 6.68517 144.322C6.49727 144.278 5.88 144.264 4.91419 144.559C3.70692 144.928 3.58203 145.049 3.75922 145.213C3.90098 145.344 4.93305 146.174 5.43137 146.573C5.02895 146.696 4.11897 147.01 3.69842 147.284C3.17274 147.625 3.1253 147.634 3.29377 147.75C3.42855 147.843 4.70812 148.357 5.33106 148.602C5.05575 148.914 4.55255 149.53 4.16534 150.091C3.67173 150.807 3.6794 150.916 4.12379 150.933C4.4793 150.946 5.65092 150.792 6.1923 150.713C6.6125 151.195 7.13079 151.548 7.61991 151.81C9.30373 152.715 14.7906 152.355 17.2287 151.259C18.6925 150.6 19.4394 149.589 19.7421 149.19C20.0854 149.013 20.6459 148.504 20.1408 147.891C20.3993 147.696 20.6353 147.486 20.5106 147.235C20.3859 146.983 20.2024 146.981 20.1175 146.964C20.1562 146.907 20.4203 146.476 19.978 146.204C19.4252 145.865 18.5577 145.681 18.4879 145.301C18.4719 145.214 18.4652 145.136 18.459 145.065C18.4623 145.027 18.4579 144.993 18.4486 144.965C18.4253 144.79 18.3686 144.684 18.0725 144.642C18.1713 144.379 18.1822 144.082 18.0492 143.715C17.8896 143.273 17.5893 143.08 17.4266 142.995C17.5776 143.017 17.9229 143.081 18.0956 143.167C18.1598 142.893 18.0518 142.341 17.1061 142.319Z"
        fill="#009400"
      />
      <path
        d="M17.1061 142.319C17.0063 142.043 16.522 141.435 15.3826 141.213C14.2433 140.991 13.235 141.624 12.8732 141.968M17.1061 142.319C18.0518 142.341 18.1598 142.893 18.0956 143.167C17.9229 143.081 17.5776 143.017 17.4266 142.995M17.1061 142.319C16.6272 142.292 15.5187 142.434 14.9162 143.211C14.3137 143.989 14.2702 144.589 14.3238 144.792M12.8732 141.968C13.7996 142.74 14.0494 143.387 14.0584 143.614M12.8732 141.968C12.7815 141.902 12.6441 141.823 12.4678 141.749M18.0725 144.642C18.1713 144.379 18.1822 144.082 18.0492 143.715C17.8896 143.273 17.5893 143.08 17.4266 142.995M18.0725 144.642C18.0067 144.818 17.725 145.206 17.1248 145.356C16.3744 145.543 16.4519 145.43 16.387 145.344C16.3221 145.258 15.3762 144.647 14.682 144.873C14.7459 144.42 15.0961 143.443 15.986 143.162C16.8759 142.881 17.3172 142.934 17.4266 142.995M18.0725 144.642C18.3686 144.684 18.4253 144.79 18.4486 144.965M14.0817 144.542C13.8929 144.315 13.2161 143.834 12.3332 143.833C11.0087 143.831 10.4182 144.087 9.97864 144.364C9.52239 144.651 8.94086 145.388 8.48775 145.325C8.10269 145.27 9.12167 145.839 10.0989 146.353C10.8589 146.752 11.7864 146.729 13.015 146.209C14.2435 145.689 14.1912 145.404 14.0412 145.922C13.9212 146.337 13.4717 146.648 13.2619 146.752M12.4678 141.749C11.9552 141.532 11.1134 141.351 10.1071 141.594C9.7908 141.671 9.46744 141.793 9.1447 141.961M12.4678 141.749C11.7922 141.235 10.2338 140.149 9.40507 139.909C8.36911 139.608 8.94808 140.09 9.11375 140.992C9.24629 141.713 9.18961 141.938 9.1447 141.961M9.1447 141.961C9.01489 142.028 8.88518 142.103 8.75607 142.186M8.75607 142.186C8.2402 142.068 7.03247 141.835 6.32842 141.847C5.44836 141.862 5.56177 141.945 5.76402 142.245C5.92582 142.485 6.53916 143.588 6.8256 144.11M8.75607 142.186C8.07105 142.622 7.40283 143.265 6.8256 144.11M6.8256 144.11C6.77816 144.179 6.73134 144.25 6.68517 144.322M6.68517 144.322C6.49727 144.278 5.88 144.264 4.91418 144.559C3.70692 144.928 3.58203 145.049 3.75922 145.213C3.90098 145.344 4.93305 146.174 5.43137 146.573M6.68517 144.322C6.28047 144.955 5.92614 145.692 5.64994 146.533M5.43137 146.573L5.64994 146.533M5.43137 146.573C5.02895 146.696 4.11897 147.01 3.69842 147.284C3.17274 147.625 3.1253 147.634 3.29377 147.75C3.42855 147.843 4.70812 148.357 5.33106 148.602M5.64994 146.533C5.63294 146.584 5.61624 146.636 5.59984 146.689C5.37315 147.415 5.29694 148.048 5.33106 148.602M5.33106 148.602C5.05575 148.914 4.55255 149.53 4.16534 150.091C3.67174 150.807 3.6794 150.916 4.12379 150.933C4.4793 150.946 5.65092 150.792 6.1923 150.713M5.33106 148.602C5.38624 149.497 5.72987 150.183 6.1923 150.713M6.1923 150.713C6.6125 151.195 7.13079 151.548 7.61991 151.81C9.30373 152.715 14.7906 152.355 17.2287 151.259C18.6925 150.6 19.4394 149.589 19.7421 149.19C20.0854 149.013 20.6459 148.504 20.1408 147.891C20.3993 147.696 20.6353 147.486 20.5106 147.235C20.3859 146.983 20.2024 146.981 20.1175 146.964C20.1562 146.907 20.4203 146.476 19.978 146.204C19.4252 145.865 18.5577 145.681 18.4879 145.301C18.4638 145.17 18.4609 145.058 18.4486 144.965M18.4486 144.965C18.5049 145.135 18.3822 145.527 17.4404 145.739"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M18.0576 143.759C18.1906 144.127 18.1796 144.423 18.0809 144.687C18.0151 144.862 17.7334 145.251 17.1331 145.4C16.3828 145.587 16.4602 145.475 16.3954 145.389C16.3305 145.303 15.3845 144.692 14.6904 144.918C14.7542 144.464 15.1044 143.488 15.9943 143.207C16.8843 142.925 17.3256 142.978 17.435 143.04C17.5976 143.125 17.898 143.318 18.0576 143.759Z"
        fill="white"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M19.7425 149.19C20.0859 149.012 20.6463 148.504 20.1413 147.891C20.3998 147.696 20.6358 147.486 20.5111 147.234C20.3863 146.982 20.2028 146.98 20.118 146.963C19.6555 147.293 18.0086 148.027 15.1204 148.323C11.5102 148.692 10.1508 148.5 9.18846 148.334C8.93602 148.29 8.78104 148.3 8.69896 148.339C8.46813 148.45 8.81381 148.798 9.18948 148.873C9.49004 149.441 11.1337 150.38 14.3993 150.27C17.0118 150.182 19.05 149.513 19.7425 149.19Z"
        fill="#AC5228"
      />
      <path
        d="M20.1413 147.891C20.6463 148.504 20.0859 149.012 19.7425 149.19C19.05 149.513 17.0118 150.182 14.3993 150.27C11.1337 150.38 9.49004 149.441 9.18948 148.873M20.1413 147.891C20.3998 147.696 20.6358 147.486 20.5111 147.234C20.3863 146.982 20.2028 146.98 20.118 146.963C19.6555 147.293 18.0086 148.027 15.1204 148.323C11.5102 148.692 10.1508 148.5 9.18846 148.334C8.93602 148.29 8.78104 148.3 8.69896 148.339M20.1413 147.891C19.8512 148.091 18.5067 148.603 15.4497 149.047C11.6284 149.602 9.69875 148.976 9.18948 148.873M9.18948 148.873C8.81381 148.798 8.46813 148.45 8.69896 148.339M8.69896 148.339C8.61621 148.334 8.45616 148.459 8.47789 149.004"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M9.9834 144.392C10.4229 144.115 11.0135 143.86 12.3379 143.861C12.6371 143.888 13.2334 143.981 13.5124 144.381C13.8455 144.86 13.799 145.408 13.5667 145.744C13.3808 146.014 13.2008 146.155 13.0197 146.237C13.0197 146.237 11.2568 147.052 10.1036 146.381C9.12644 145.867 8.10745 145.299 8.49252 145.353C8.94562 145.417 9.52715 144.68 9.9834 144.392Z"
        fill="white"
        stroke="black"
        strokeWidth="0.3"
      />
      <path
        d="M10.5215 144.115C11.2289 143.985 11.8594 144.457 11.999 145.217C12.0982 145.757 11.8943 146.278 11.5139 146.58C10.6989 146.682 10.3794 146.544 9.55444 146.059C9.51036 145.957 9.4583 145.802 9.43726 145.688C9.29763 144.928 9.81406 144.245 10.5215 144.115Z"
        fill="black"
      />
      <ellipse
        cx="0.520081"
        cy="0.346176"
        rx="0.520081"
        ry="0.346176"
        transform="matrix(-0.903803 -0.427948 -0.427948 0.903803 11.5908 144.521)"
        fill="white"
      />
      <ellipse
        cx="0.173796"
        cy="0.153785"
        rx="0.173796"
        ry="0.153785"
        transform="matrix(-0.76304 -0.646351 -0.646351 0.76304 10.8525 145.932)"
        fill="#038203"
      />
      <path
        d="M16.0362 143.161C16.5338 143.198 16.9566 143.665 17.012 144.271C17.0573 144.766 16.8446 145.214 16.5023 145.431C16.4025 145.421 16.3039 145.152 15.7298 144.963C15.3669 144.844 15.1699 144.818 15.0734 144.811C15.0332 144.7 15.0061 144.581 14.9946 144.456C14.9733 144.222 15.0094 143.999 15.0894 143.806C15.3478 143.444 15.8283 143.226 16.0362 143.161Z"
        fill="black"
      />
      <ellipse
        cx="0.448418"
        cy="0.298476"
        rx="0.448418"
        ry="0.298476"
        transform="matrix(-0.903803 -0.427948 -0.427948 0.903803 16.6064 143.6)"
        fill="white"
      />
      <ellipse
        cx="0.0949481"
        cy="0.0722057"
        rx="0.0949481"
        ry="0.0722057"
        transform="matrix(0.086326 -0.996267 -0.996267 -0.086326 16.0781 144.744)"
        fill="#038203"
      />
      <path
        d="M9.82959 147.825C9.44974 147.715 8.57115 147.595 8.09562 147.996C7.6201 148.398 7.69747 148.854 7.79559 149.032M12.8647 146.728C12.5833 146.976 11.7918 147.455 10.8771 147.387C9.96238 147.32 9.71626 147.208 9.70754 147.161M8.89904 146.23C9.05751 146.381 9.52897 146.723 10.1471 146.884M13.8733 143.943C13.7306 143.79 13.3434 143.462 12.936 143.38M12.6988 143.423C12.3822 143.302 11.4903 143.145 10.4556 143.492C9.42085 143.839 8.89564 144.433 8.76238 144.686M16.2432 142.429C15.8953 142.493 15.0652 142.743 14.5277 143.234M17.294 146.012C16.9903 145.871 16.2508 145.566 15.7226 145.467"
        stroke="black"
        strokeWidth="0.3"
      />
      <ellipse
        cx="0.289402"
        cy="0.192935"
        rx="0.289402"
        ry="0.192935"
        transform="matrix(-0.997682 0.0680477 0.0680477 0.997682 16.4834 146.668)"
        fill="black"
      />
      <ellipse
        cx="0.237865"
        cy="0.158577"
        rx="0.237865"
        ry="0.158577"
        transform="matrix(-0.975768 0.218807 0.218807 0.975768 18.6416 146.205)"
        fill="black"
      />
      <path
        d="M7.5 140L8.29691 143.089L11 144L8.29691 144.911L7.5 148L6.70309 144.911L4 144L6.70309 143.089L7.5 140Z"
        fill="#00FFD1"
      />
      <circle cx="12" cy="12" r="11.5" fill="#16453C" stroke="#00FFD1" />
      <path
        d="M16.9706 11.2076C17.4906 11.6079 17.4906 12.3921 16.9706 12.7924L10.61 17.6888C9.95243 18.195 9 17.7263 9 16.8964L9 7.10358C9 6.27374 9.95243 5.80497 10.61 6.31117L16.9706 11.2076Z"
        fill="#00FFD1"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M248.065 69.4096C266.613 50.2399 287.856 35.8442 287.856 35.8442V35.8547C277.387 44.2856 264.588 56.7528 265.385 57.4589C266.095 58.0873 269.206 55.3096 276.857 48.4792L276.863 48.4736C277.807 47.6314 278.819 46.7276 279.904 45.761C289.808 36.9507 303.393 27.2868 303.393 27.2868C303.393 27.2868 285.213 41.514 275.079 51.0619C264.945 60.6099 260.539 65.9424 261.367 66.7012C262.118 67.3886 264.178 65.4207 268.458 61.3304C268.903 60.9057 269.371 60.458 269.865 59.9881C271.61 58.3258 272.956 56.9565 274.527 55.3581C277.677 52.1532 281.732 48.0276 291.727 38.7739C306.708 24.8946 320 16 320 16C320 16 305.208 27.4449 291.266 40.6919C276.684 54.5397 270.106 62.1275 270.819 62.8019C271.533 63.4764 277.995 57.3851 286.293 49.4179C294.591 41.4613 307.054 30.048 307.054 30.048C307.054 30.048 302.019 34.98 290.07 46.8043C278.131 58.6287 290.28 49.7657 295.168 45.35C300.057 40.9343 312.53 30.2377 312.53 30.2377C312.53 30.2377 274.869 71.8441 258.797 82.9201C242.725 93.9857 229.518 88.5794 248.065 69.4096ZM279.927 71.9709C276.36 75.4275 262.05 83.4685 258.337 85.102L258.326 85.1125C254.015 87.0095 271.083 82.6992 278.248 78.41C285.424 74.1208 283.493 68.5142 279.927 71.9709ZM242.265 70.2934C243.314 66.8051 252.892 47.1506 254.738 50.3438C256.028 52.567 252.818 56.4769 250.025 59.8786C248.82 61.3468 247.693 62.7202 247.038 63.8227L246.861 64.1213C244.678 67.7979 241.315 73.4629 242.265 70.3039V70.2934ZM236.841 67.4935C234.323 68.3788 234.942 80.0766 235.498 81.9314C235.92 83.3458 236.258 81.5261 236.718 79.0488C236.967 77.7054 237.252 76.1686 237.607 74.8495C238.614 71.0977 239.359 66.6083 236.841 67.4935ZM278.793 68.935C280.324 68.4818 289.115 63.9608 289.052 62.1376C288.989 60.3144 285.884 62.6224 283.419 64.7617C282.546 65.5188 281.489 66.3288 280.565 67.036L280.565 67.036C278.879 68.327 277.64 69.2754 278.793 68.935ZM305.827 45.1289C305.922 46.0774 296.658 53.5388 296.47 53.1383H296.48C296.318 52.813 296.843 52.3685 298.011 51.379L298.011 51.379L298.011 51.379C298.508 50.9579 299.121 50.4382 299.848 49.787C300.475 49.223 301.142 48.5892 301.794 47.9694L301.794 47.9691C303.835 46.0293 305.732 44.2265 305.827 45.1289ZM300.519 34.4549C300.498 34.2019 288.685 44.593 288.402 45.3518C288.14 46.0629 290.669 43.7026 293.389 41.1646L293.389 41.1645C294.257 40.355 295.144 39.5274 295.966 38.7757C296.899 37.9244 297.678 37.2273 298.312 36.6595L298.312 36.6591C299.853 35.28 300.541 34.6639 300.519 34.4549ZM288.528 66.1961C288.497 66.9865 284.636 68.5568 283.975 68.6832C283.477 68.7779 284.02 68.4301 284.766 67.9515C285.183 67.6841 285.664 67.376 286.063 67.0814C287.175 66.2593 288.559 65.4057 288.528 66.1961Z"
        fill="url(#paint2_linear_0_2)"
        fillOpacity="0.5"
      />
      <path
        d="M33.6 19L39.76 4.9H42.04L48.2 19H45.6L44.18 15.62H37.56L36.12 19H33.6ZM38.46 13.44H43.28L40.86 7.84L38.46 13.44ZM53.7655 19.22C51.3855 19.22 50.0055 17.62 50.0055 15.16V8.44H52.4255V14.44C52.4255 16.08 53.2455 17.02 54.6855 17.02C56.0855 17.02 57.0655 16.04 57.0655 14.4V8.44H59.4855V19H57.0655V17.36C56.3855 18.36 55.4055 19.22 53.7655 19.22ZM67.2278 22.24C65.4878 22.24 63.8678 21.8 62.5078 20.98L63.4078 19.16C64.5278 19.86 65.7278 20.28 67.1678 20.28C69.3278 20.28 70.5078 19.16 70.5078 17.04V16.22C69.6278 17.36 68.5278 18.16 66.7878 18.16C64.3078 18.16 61.9878 16.32 61.9878 13.22V13.18C61.9878 10.06 64.3278 8.22 66.7878 8.22C68.5678 8.22 69.6678 9.04 70.4878 10.02V8.44H72.9078V16.84C72.9078 18.62 72.4478 19.94 71.5678 20.82C70.6078 21.78 69.1278 22.24 67.2278 22.24ZM67.4278 16.12C69.1078 16.12 70.5278 14.92 70.5278 13.22V13.18C70.5278 11.44 69.1078 10.26 67.4278 10.26C65.7478 10.26 64.4278 11.42 64.4278 13.16V13.2C64.4278 14.94 65.7678 16.12 67.4278 16.12ZM83.9623 19V7.4L81.4423 8.1L80.9223 6.1L84.6823 4.9H86.4023V19H83.9623ZM93.472 19.2C91.972 19.2 90.312 18.66 88.992 17.62L90.072 15.98C91.212 16.84 92.452 17.28 93.532 17.28C94.572 17.28 95.172 16.84 95.172 16.14V16.1C95.172 15.28 94.052 15 92.812 14.62C91.252 14.18 89.512 13.54 89.512 11.52V11.48C89.512 9.48 91.172 8.26 93.272 8.26C94.592 8.26 96.032 8.72 97.152 9.46L96.192 11.18C95.172 10.56 94.092 10.18 93.212 10.18C92.272 10.18 91.732 10.62 91.732 11.24V11.28C91.732 12.04 92.872 12.36 94.112 12.76C95.652 13.24 97.392 13.94 97.392 15.84V15.88C97.392 18.1 95.672 19.2 93.472 19.2ZM103.197 19.18C101.417 19.18 100.157 18.4 100.157 16.08V10.52H98.8167V8.44H100.157V5.54H102.577V8.44H105.417V10.52H102.577V15.7C102.577 16.64 103.057 17.02 103.877 17.02C104.417 17.02 104.897 16.9 105.377 16.66V18.64C104.777 18.98 104.097 19.18 103.197 19.18Z"
        fill="white"
      />
      <path
        d="M33.6 86L39.76 71.9H42.04L48.2 86H45.6L44.18 82.62H37.56L36.12 86H33.6ZM38.46 80.44H43.28L40.86 74.84L38.46 80.44ZM53.7655 86.22C51.3855 86.22 50.0055 84.62 50.0055 82.16V75.44H52.4255V81.44C52.4255 83.08 53.2455 84.02 54.6855 84.02C56.0855 84.02 57.0655 83.04 57.0655 81.4V75.44H59.4855V86H57.0655V84.36C56.3855 85.36 55.4055 86.22 53.7655 86.22ZM67.2278 89.24C65.4878 89.24 63.8678 88.8 62.5078 87.98L63.4078 86.16C64.5278 86.86 65.7278 87.28 67.1678 87.28C69.3278 87.28 70.5078 86.16 70.5078 84.04V83.22C69.6278 84.36 68.5278 85.16 66.7878 85.16C64.3078 85.16 61.9878 83.32 61.9878 80.22V80.18C61.9878 77.06 64.3278 75.22 66.7878 75.22C68.5678 75.22 69.6678 76.04 70.4878 77.02V75.44H72.9078V83.84C72.9078 85.62 72.4478 86.94 71.5678 87.82C70.6078 88.78 69.1278 89.24 67.2278 89.24ZM67.4278 83.12C69.1078 83.12 70.5278 81.92 70.5278 80.22V80.18C70.5278 78.44 69.1078 77.26 67.4278 77.26C65.7478 77.26 64.4278 78.42 64.4278 80.16V80.2C64.4278 81.94 65.7678 83.12 67.4278 83.12ZM88.6423 86V82.86H81.5823L81.1223 81.1L88.9023 71.9H91.0023V80.84H93.0023V82.86H91.0023V86H88.6423ZM84.0423 80.84H88.6423V75.3L84.0423 80.84ZM99.0756 86.18C97.2956 86.18 96.0356 85.4 96.0356 83.08V77.52H94.6956V75.44H96.0356V72.54H98.4556V75.44H101.296V77.52H98.4556V82.7C98.4556 83.64 98.9356 84.02 99.7556 84.02C100.296 84.02 100.776 83.9 101.256 83.66V85.64C100.656 85.98 99.9756 86.18 99.0756 86.18ZM103.739 86V71.4H106.159V77.08C106.839 76.08 107.819 75.22 109.459 75.22C111.839 75.22 113.219 76.82 113.219 79.28V86H110.799V80C110.799 78.36 109.979 77.42 108.539 77.42C107.139 77.42 106.159 78.4 106.159 80.04V86H103.739Z"
        fill="white"
      />
      <path
        d="M37.888 38.739L41.138 30.9H42.243L38.33 40.065H37.42L33.507 30.9H34.651L37.888 38.739ZM49.5449 36.633C49.5449 37.1097 49.4539 37.5647 49.2719 37.998C49.0986 38.4227 48.8559 38.7953 48.5439 39.116C48.2319 39.4367 47.8593 39.6923 47.4259 39.883C46.9926 40.065 46.5246 40.156 46.0219 40.156C45.5193 40.156 45.0556 40.065 44.6309 39.883C44.2063 39.6923 43.8379 39.441 43.5259 39.129C43.2139 38.8083 42.9713 38.4357 42.7979 38.011C42.6246 37.5863 42.5379 37.1357 42.5379 36.659C42.5379 36.1823 42.6246 35.7317 42.7979 35.307C42.9713 34.8737 43.2139 34.4967 43.5259 34.176C43.8379 33.8553 44.2063 33.604 44.6309 33.422C45.0643 33.2313 45.5366 33.136 46.0479 33.136C46.5506 33.136 47.0143 33.2313 47.4389 33.422C47.8723 33.604 48.2449 33.8553 48.5569 34.176C48.8689 34.488 49.1116 34.8563 49.2849 35.281C49.4583 35.7057 49.5449 36.1563 49.5449 36.633ZM48.5179 36.659C48.5179 36.295 48.4529 35.9527 48.3229 35.632C48.2016 35.3113 48.0283 35.034 47.8029 34.8C47.5776 34.5573 47.3133 34.3667 47.0099 34.228C46.7066 34.0893 46.3773 34.02 46.0219 34.02C45.6579 34.02 45.3243 34.0893 45.0209 34.228C44.7176 34.358 44.4576 34.5443 44.2409 34.787C44.0329 35.021 43.8683 35.2983 43.7469 35.619C43.6256 35.931 43.5649 36.269 43.5649 36.633C43.5649 36.997 43.6256 37.3393 43.7469 37.66C43.8769 37.9807 44.0503 38.258 44.2669 38.492C44.4923 38.726 44.7566 38.9123 45.0599 39.051C45.3633 39.1897 45.6926 39.259 46.0479 39.259C46.4119 39.259 46.7456 39.194 47.0489 39.064C47.3523 38.9253 47.6123 38.739 47.8289 38.505C48.0456 38.271 48.2146 37.998 48.3359 37.686C48.4573 37.3653 48.5179 37.023 48.5179 36.659ZM52.7102 34.163V38.089C52.7102 38.505 52.8142 38.7953 53.0222 38.96C53.2302 39.1247 53.5032 39.207 53.8412 39.207C54.0146 39.207 54.1749 39.1897 54.3222 39.155C54.4782 39.1203 54.6429 39.0597 54.8162 38.973V39.831C54.6429 39.9263 54.4566 39.9957 54.2572 40.039C54.0666 40.091 53.8499 40.117 53.6072 40.117C53.3386 40.117 53.0872 40.0823 52.8532 40.013C52.6192 39.9437 52.4156 39.8353 52.2422 39.688C52.0776 39.532 51.9476 39.3327 51.8522 39.09C51.7569 38.8473 51.7092 38.557 51.7092 38.219V34.163H50.7732V33.279H51.7092V31.251H52.7102V33.279H54.8422V34.163H52.7102ZM57.7841 31.81H56.6401V30.705H57.7841V31.81ZM57.7061 40H56.7051V33.279H57.7061V40ZM61.0301 36.152V40H60.0291V33.279H61.0301V34.449C61.2555 34.085 61.5501 33.7773 61.9141 33.526C62.2781 33.266 62.7505 33.136 63.3311 33.136C63.7385 33.136 64.0981 33.201 64.4101 33.331C64.7308 33.461 64.9995 33.6473 65.2161 33.89C65.4415 34.124 65.6105 34.4057 65.7231 34.735C65.8445 35.0643 65.9051 35.4283 65.9051 35.827V40H64.9041V36.074C64.9041 35.45 64.7438 34.956 64.4231 34.592C64.1025 34.228 63.6431 34.046 63.0451 34.046C62.7591 34.046 62.4905 34.098 62.2391 34.202C61.9965 34.2973 61.7841 34.4403 61.6021 34.631C61.4201 34.813 61.2771 35.034 61.1731 35.294C61.0778 35.554 61.0301 35.84 61.0301 36.152ZM74.4359 38.83C74.4359 39.376 74.3535 39.8527 74.1889 40.26C74.0329 40.6673 73.8032 41.0053 73.4999 41.274C73.2052 41.5513 72.8455 41.7593 72.4209 41.898C72.0049 42.0367 71.5369 42.106 71.0169 42.106C70.4535 42.106 69.9162 42.028 69.4049 41.872C68.8935 41.716 68.4125 41.482 67.9619 41.17L68.4169 40.39C68.8069 40.6673 69.2142 40.8797 69.6389 41.027C70.0635 41.1743 70.5185 41.248 71.0039 41.248C71.7492 41.248 72.3429 41.0443 72.7849 40.637C73.2269 40.2383 73.4479 39.6447 73.4479 38.856V38.063C73.1532 38.453 72.7935 38.7867 72.3689 39.064C71.9442 39.3413 71.4242 39.48 70.8089 39.48C70.4015 39.48 70.0072 39.4107 69.6259 39.272C69.2532 39.1247 68.9195 38.9167 68.6249 38.648C68.3302 38.3707 68.0919 38.037 67.9099 37.647C67.7365 37.257 67.6499 36.815 67.6499 36.321C67.6499 35.827 67.7365 35.385 67.9099 34.995C68.0919 34.5963 68.3302 34.2627 68.6249 33.994C68.9195 33.7167 69.2575 33.5043 69.6389 33.357C70.0202 33.2097 70.4102 33.136 70.8089 33.136C71.1209 33.136 71.4069 33.175 71.6669 33.253C71.9355 33.3223 72.1739 33.4177 72.3819 33.539C72.5985 33.6603 72.7935 33.8033 72.9669 33.968C73.1402 34.1327 73.2962 34.306 73.4349 34.488V33.279H74.4359V38.83ZM73.4739 36.308C73.4739 35.9613 73.4045 35.6493 73.2659 35.372C73.1272 35.086 72.9409 34.8433 72.7069 34.644C72.4815 34.4447 72.2215 34.293 71.9269 34.189C71.6322 34.0763 71.3245 34.02 71.0039 34.02C70.6832 34.02 70.3799 34.072 70.0939 34.176C69.8165 34.28 69.5695 34.4317 69.3529 34.631C69.1449 34.8303 68.9802 35.073 68.8589 35.359C68.7375 35.6363 68.6769 35.9483 68.6769 36.295C68.6769 36.6417 68.7375 36.958 68.8589 37.244C68.9889 37.5213 69.1579 37.764 69.3659 37.972C69.5825 38.1713 69.8295 38.3273 70.1069 38.44C70.3929 38.544 70.6919 38.596 71.0039 38.596C71.3245 38.596 71.6322 38.544 71.9269 38.44C72.2215 38.3273 72.4815 38.1713 72.7069 37.972C72.9409 37.7727 73.1272 37.5343 73.2659 37.257C73.4045 36.971 73.4739 36.6547 73.4739 36.308ZM87.3561 36.633C87.3561 37.1877 87.2651 37.6817 87.0831 38.115C86.9011 38.5483 86.6585 38.9167 86.3551 39.22C86.0605 39.5147 85.7181 39.7443 85.3281 39.909C84.9468 40.065 84.5525 40.143 84.1451 40.143C83.8331 40.143 83.5471 40.104 83.2871 40.026C83.0271 39.948 82.7931 39.844 82.5851 39.714C82.3771 39.584 82.1865 39.4323 82.0131 39.259C81.8485 39.0857 81.7011 38.9037 81.5711 38.713V40H80.5701V30.51H81.5711V34.631C81.7098 34.4317 81.8615 34.241 82.0261 34.059C82.1995 33.877 82.3901 33.721 82.5981 33.591C82.8061 33.4523 83.0358 33.344 83.2871 33.266C83.5471 33.1793 83.8331 33.136 84.1451 33.136C84.5438 33.136 84.9338 33.214 85.3151 33.37C85.7051 33.526 86.0518 33.7557 86.3551 34.059C86.6585 34.3537 86.9011 34.7177 87.0831 35.151C87.2651 35.5843 87.3561 36.0783 87.3561 36.633ZM86.3291 36.646C86.3291 36.2473 86.2641 35.8877 86.1341 35.567C86.0128 35.2463 85.8438 34.9733 85.6271 34.748C85.4105 34.514 85.1591 34.3363 84.8731 34.215C84.5871 34.0937 84.2838 34.033 83.9631 34.033C83.6511 34.033 83.3478 34.098 83.0531 34.228C82.7671 34.3493 82.5071 34.5227 82.2731 34.748C82.0478 34.9733 81.8658 35.2463 81.7271 35.567C81.5971 35.8877 81.5321 36.243 81.5321 36.633C81.5321 37.023 81.5971 37.3827 81.7271 37.712C81.8658 38.0327 82.0478 38.3057 82.2731 38.531C82.5071 38.7563 82.7671 38.934 83.0531 39.064C83.3478 39.1853 83.6511 39.246 83.9631 39.246C84.2838 39.246 84.5871 39.1897 84.8731 39.077C85.1678 38.9557 85.4191 38.7867 85.6271 38.57C85.8438 38.3447 86.0128 38.0717 86.1341 37.751C86.2641 37.4217 86.3291 37.0533 86.3291 36.646ZM89.801 37.01C89.8356 37.374 89.9223 37.699 90.061 37.985C90.1996 38.2623 90.3773 38.5007 90.594 38.7C90.8106 38.8907 91.0533 39.038 91.322 39.142C91.5906 39.2373 91.8723 39.285 92.167 39.285C92.635 39.285 93.0336 39.1983 93.363 39.025C93.701 38.8517 94.0086 38.622 94.286 38.336L94.91 38.895C94.572 39.2763 94.1863 39.584 93.753 39.818C93.3196 40.0433 92.7823 40.156 92.141 40.156C91.6816 40.156 91.2483 40.0737 90.841 39.909C90.4336 39.7357 90.0783 39.4973 89.775 39.194C89.4716 38.882 89.229 38.5093 89.047 38.076C88.8736 37.6427 88.787 37.166 88.787 36.646C88.787 36.1607 88.865 35.7057 89.021 35.281C89.1856 34.8477 89.411 34.475 89.697 34.163C89.983 33.8423 90.321 33.591 90.711 33.409C91.1096 33.227 91.543 33.136 92.011 33.136C92.505 33.136 92.947 33.2313 93.337 33.422C93.727 33.604 94.0563 33.8553 94.325 34.176C94.5936 34.4967 94.7973 34.8737 94.936 35.307C95.0746 35.7403 95.144 36.204 95.144 36.698C95.144 36.7413 95.144 36.789 95.144 36.841C95.144 36.893 95.1396 36.9493 95.131 37.01H89.801ZM89.801 36.269H94.13C94.104 35.9657 94.039 35.6753 93.935 35.398C93.8396 35.1207 93.701 34.878 93.519 34.67C93.3456 34.462 93.129 34.2973 92.869 34.176C92.6176 34.046 92.323 33.981 91.985 33.981C91.6903 33.981 91.4173 34.0417 91.166 34.163C90.9146 34.2757 90.6936 34.436 90.503 34.644C90.3123 34.8433 90.1563 35.0817 90.035 35.359C89.9136 35.6363 89.8356 35.9397 89.801 36.269ZM103.292 38.83C103.292 39.376 103.21 39.8527 103.045 40.26C102.889 40.6673 102.66 41.0053 102.356 41.274C102.062 41.5513 101.702 41.7593 101.277 41.898C100.861 42.0367 100.393 42.106 99.8733 42.106C99.31 42.106 98.7727 42.028 98.2613 41.872C97.75 41.716 97.269 41.482 96.8183 41.17L97.2733 40.39C97.6633 40.6673 98.0707 40.8797 98.4953 41.027C98.92 41.1743 99.375 41.248 99.8603 41.248C100.606 41.248 101.199 41.0443 101.641 40.637C102.083 40.2383 102.304 39.6447 102.304 38.856V38.063C102.01 38.453 101.65 38.7867 101.225 39.064C100.801 39.3413 100.281 39.48 99.6653 39.48C99.258 39.48 98.8637 39.4107 98.4823 39.272C98.1097 39.1247 97.776 38.9167 97.4813 38.648C97.1867 38.3707 96.9483 38.037 96.7663 37.647C96.593 37.257 96.5063 36.815 96.5063 36.321C96.5063 35.827 96.593 35.385 96.7663 34.995C96.9483 34.5963 97.1867 34.2627 97.4813 33.994C97.776 33.7167 98.114 33.5043 98.4953 33.357C98.8767 33.2097 99.2667 33.136 99.6653 33.136C99.9773 33.136 100.263 33.175 100.523 33.253C100.792 33.3223 101.03 33.4177 101.238 33.539C101.455 33.6603 101.65 33.8033 101.823 33.968C101.997 34.1327 102.153 34.306 102.291 34.488V33.279H103.292V38.83ZM102.33 36.308C102.33 35.9613 102.261 35.6493 102.122 35.372C101.984 35.086 101.797 34.8433 101.563 34.644C101.338 34.4447 101.078 34.293 100.783 34.189C100.489 34.0763 100.181 34.02 99.8603 34.02C99.5397 34.02 99.2363 34.072 98.9503 34.176C98.673 34.28 98.426 34.4317 98.2093 34.631C98.0013 34.8303 97.8367 35.073 97.7153 35.359C97.594 35.6363 97.5333 35.9483 97.5333 36.295C97.5333 36.6417 97.594 36.958 97.7153 37.244C97.8453 37.5213 98.0143 37.764 98.2223 37.972C98.439 38.1713 98.686 38.3273 98.9633 38.44C99.2493 38.544 99.5483 38.596 99.8603 38.596C100.181 38.596 100.489 38.544 100.783 38.44C101.078 38.3273 101.338 38.1713 101.563 37.972C101.797 37.7727 101.984 37.5343 102.122 37.257C102.261 36.971 102.33 36.6547 102.33 36.308ZM106.699 31.81H105.555V30.705H106.699V31.81ZM106.621 40H105.62V33.279H106.621V40ZM109.945 36.152V40H108.944V33.279H109.945V34.449C110.171 34.085 110.465 33.7773 110.829 33.526C111.193 33.266 111.666 33.136 112.246 33.136C112.654 33.136 113.013 33.201 113.325 33.331C113.646 33.461 113.915 33.6473 114.131 33.89C114.357 34.124 114.526 34.4057 114.638 34.735C114.76 35.0643 114.82 35.4283 114.82 35.827V40H113.819V36.074C113.819 35.45 113.659 34.956 113.338 34.592C113.018 34.228 112.558 34.046 111.96 34.046C111.674 34.046 111.406 34.098 111.154 34.202C110.912 34.2973 110.699 34.4403 110.517 34.631C110.335 34.813 110.192 35.034 110.088 35.294C109.993 35.554 109.945 35.84 109.945 36.152ZM121.57 38.115C121.57 38.4357 121.505 38.7217 121.375 38.973C121.254 39.2157 121.085 39.4237 120.868 39.597C120.66 39.7703 120.409 39.9047 120.114 40C119.828 40.0867 119.516 40.13 119.178 40.13C118.693 40.13 118.203 40.0433 117.709 39.87C117.215 39.688 116.777 39.4453 116.396 39.142L116.903 38.427C117.267 38.7043 117.644 38.9167 118.034 39.064C118.433 39.2113 118.831 39.285 119.23 39.285C119.637 39.285 119.971 39.1897 120.231 38.999C120.491 38.8083 120.621 38.5483 120.621 38.219V38.193C120.621 38.0283 120.573 37.8853 120.478 37.764C120.391 37.6427 120.27 37.5387 120.114 37.452C119.958 37.3567 119.776 37.2743 119.568 37.205C119.369 37.1357 119.161 37.0707 118.944 37.01C118.684 36.932 118.42 36.8497 118.151 36.763C117.891 36.6677 117.653 36.5507 117.436 36.412C117.228 36.2733 117.055 36.1 116.916 35.892C116.786 35.684 116.721 35.424 116.721 35.112V35.086C116.721 34.8 116.777 34.54 116.89 34.306C117.003 34.0633 117.159 33.8597 117.358 33.695C117.566 33.5217 117.809 33.3917 118.086 33.305C118.372 33.2097 118.68 33.162 119.009 33.162C119.425 33.162 119.845 33.2313 120.27 33.37C120.695 33.5 121.08 33.6777 121.427 33.903L120.972 34.657C120.66 34.4577 120.331 34.3017 119.984 34.189C119.646 34.0677 119.312 34.007 118.983 34.007C118.584 34.007 118.268 34.1023 118.034 34.293C117.8 34.475 117.683 34.7047 117.683 34.982V35.008C117.683 35.164 117.731 35.3027 117.826 35.424C117.921 35.5367 118.047 35.6363 118.203 35.723C118.368 35.8097 118.554 35.8877 118.762 35.957C118.97 36.0263 119.187 36.0957 119.412 36.165C119.672 36.243 119.928 36.3297 120.179 36.425C120.439 36.5203 120.673 36.6417 120.881 36.789C121.089 36.9363 121.254 37.114 121.375 37.322C121.505 37.53 121.57 37.7857 121.57 38.089V38.115ZM133.918 36.633C133.918 37.1097 133.827 37.5647 133.645 37.998C133.472 38.4227 133.229 38.7953 132.917 39.116C132.605 39.4367 132.232 39.6923 131.799 39.883C131.366 40.065 130.898 40.156 130.395 40.156C129.892 40.156 129.429 40.065 129.004 39.883C128.579 39.6923 128.211 39.441 127.899 39.129C127.587 38.8083 127.344 38.4357 127.171 38.011C126.998 37.5863 126.911 37.1357 126.911 36.659C126.911 36.1823 126.998 35.7317 127.171 35.307C127.344 34.8737 127.587 34.4967 127.899 34.176C128.211 33.8553 128.579 33.604 129.004 33.422C129.437 33.2313 129.91 33.136 130.421 33.136C130.924 33.136 131.387 33.2313 131.812 33.422C132.245 33.604 132.618 33.8553 132.93 34.176C133.242 34.488 133.485 34.8563 133.658 35.281C133.831 35.7057 133.918 36.1563 133.918 36.633ZM132.891 36.659C132.891 36.295 132.826 35.9527 132.696 35.632C132.575 35.3113 132.401 35.034 132.176 34.8C131.951 34.5573 131.686 34.3667 131.383 34.228C131.08 34.0893 130.75 34.02 130.395 34.02C130.031 34.02 129.697 34.0893 129.394 34.228C129.091 34.358 128.831 34.5443 128.614 34.787C128.406 35.021 128.241 35.2983 128.12 35.619C127.999 35.931 127.938 36.269 127.938 36.633C127.938 36.997 127.999 37.3393 128.12 37.66C128.25 37.9807 128.423 38.258 128.64 38.492C128.865 38.726 129.13 38.9123 129.433 39.051C129.736 39.1897 130.066 39.259 130.421 39.259C130.785 39.259 131.119 39.194 131.422 39.064C131.725 38.9253 131.985 38.739 132.202 38.505C132.419 38.271 132.588 37.998 132.709 37.686C132.83 37.3653 132.891 37.023 132.891 36.659ZM136.732 36.152V40H135.731V33.279H136.732V34.449C136.958 34.085 137.252 33.7773 137.616 33.526C137.98 33.266 138.453 33.136 139.033 33.136C139.441 33.136 139.8 33.201 140.112 33.331C140.433 33.461 140.702 33.6473 140.918 33.89C141.144 34.124 141.313 34.4057 141.425 34.735C141.547 35.0643 141.607 35.4283 141.607 35.827V40H140.606V36.074C140.606 35.45 140.446 34.956 140.125 34.592C139.805 34.228 139.345 34.046 138.747 34.046C138.461 34.046 138.193 34.098 137.941 34.202C137.699 34.2973 137.486 34.4403 137.304 34.631C137.122 34.813 136.979 35.034 136.875 35.294C136.78 35.554 136.732 35.84 136.732 36.152ZM152.137 30.835L156.284 40H155.179L154.113 37.595H149.16L148.081 40H147.028L151.175 30.835H152.137ZM153.71 36.672L151.643 32.031L149.563 36.672H153.71ZM162.554 37.127V33.279H163.542V40H162.554V38.83C162.329 39.194 162.034 39.506 161.67 39.766C161.306 40.0173 160.834 40.143 160.253 40.143C159.846 40.143 159.482 40.078 159.161 39.948C158.849 39.818 158.58 39.636 158.355 39.402C158.138 39.1593 157.969 38.8733 157.848 38.544C157.735 38.2147 157.679 37.8507 157.679 37.452V33.279H158.68V37.205C158.68 37.829 158.84 38.323 159.161 38.687C159.482 39.051 159.941 39.233 160.539 39.233C160.825 39.233 161.089 39.1853 161.332 39.09C161.583 38.986 161.796 38.843 161.969 38.661C162.151 38.4703 162.294 38.245 162.398 37.985C162.502 37.725 162.554 37.439 162.554 37.127ZM172.19 38.83C172.19 39.376 172.107 39.8527 171.943 40.26C171.787 40.6673 171.557 41.0053 171.254 41.274C170.959 41.5513 170.599 41.7593 170.175 41.898C169.759 42.0367 169.291 42.106 168.771 42.106C168.207 42.106 167.67 42.028 167.159 41.872C166.647 41.716 166.166 41.482 165.716 41.17L166.171 40.39C166.561 40.6673 166.968 40.8797 167.393 41.027C167.817 41.1743 168.272 41.248 168.758 41.248C169.503 41.248 170.097 41.0443 170.539 40.637C170.981 40.2383 171.202 39.6447 171.202 38.856V38.063C170.907 38.453 170.547 38.7867 170.123 39.064C169.698 39.3413 169.178 39.48 168.563 39.48C168.155 39.48 167.761 39.4107 167.38 39.272C167.007 39.1247 166.673 38.9167 166.379 38.648C166.084 38.3707 165.846 38.037 165.664 37.647C165.49 37.257 165.404 36.815 165.404 36.321C165.404 35.827 165.49 35.385 165.664 34.995C165.846 34.5963 166.084 34.2627 166.379 33.994C166.673 33.7167 167.011 33.5043 167.393 33.357C167.774 33.2097 168.164 33.136 168.563 33.136C168.875 33.136 169.161 33.175 169.421 33.253C169.689 33.3223 169.928 33.4177 170.136 33.539C170.352 33.6603 170.547 33.8033 170.721 33.968C170.894 34.1327 171.05 34.306 171.189 34.488V33.279H172.19V38.83ZM171.228 36.308C171.228 35.9613 171.158 35.6493 171.02 35.372C170.881 35.086 170.695 34.8433 170.461 34.644C170.235 34.4447 169.975 34.293 169.681 34.189C169.386 34.0763 169.078 34.02 168.758 34.02C168.437 34.02 168.134 34.072 167.848 34.176C167.57 34.28 167.323 34.4317 167.107 34.631C166.899 34.8303 166.734 35.073 166.613 35.359C166.491 35.6363 166.431 35.9483 166.431 36.295C166.431 36.6417 166.491 36.958 166.613 37.244C166.743 37.5213 166.912 37.764 167.12 37.972C167.336 38.1713 167.583 38.3273 167.861 38.44C168.147 38.544 168.446 38.596 168.758 38.596C169.078 38.596 169.386 38.544 169.681 38.44C169.975 38.3273 170.235 38.1713 170.461 37.972C170.695 37.7727 170.881 37.5343 171.02 37.257C171.158 36.971 171.228 36.6547 171.228 36.308ZM175.571 34.644H174.375V33.279H175.571V34.644ZM175.571 40H174.375V38.635H175.571V40Z"
        fill="#94A3AE"
      />
      <path
        d="M37.303 103.555L39.955 107H38.798L36.718 104.257L34.625 107H33.507L36.146 103.581L33.611 100.279H34.755L36.744 102.879L38.733 100.279H39.851L37.303 103.555ZM49.2788 107H48.0178L45.3788 103.464H42.7788V107H41.7518V97.9H45.6648C46.1675 97.9 46.6182 97.965 47.0168 98.095C47.4242 98.225 47.7708 98.4113 48.0568 98.654C48.3428 98.888 48.5638 99.174 48.7198 99.512C48.8758 99.8413 48.9538 100.21 48.9538 100.617C48.9538 100.998 48.8932 101.341 48.7718 101.644C48.6505 101.939 48.4772 102.199 48.2518 102.424C48.0352 102.641 47.7752 102.823 47.4718 102.97C47.1685 103.117 46.8392 103.221 46.4838 103.282L49.2788 107ZM47.9138 100.656C47.9138 100.084 47.7102 99.642 47.3028 99.33C46.8955 99.0093 46.3235 98.849 45.5868 98.849H42.7788V102.541H45.5738C45.9118 102.541 46.2238 102.498 46.5098 102.411C46.7958 102.324 47.0428 102.203 47.2508 102.047C47.4588 101.882 47.6192 101.683 47.7318 101.449C47.8532 101.215 47.9138 100.951 47.9138 100.656ZM51.4484 104.01C51.4831 104.374 51.5698 104.699 51.7084 104.985C51.8471 105.262 52.0248 105.501 52.2414 105.7C52.4581 105.891 52.7008 106.038 52.9694 106.142C53.2381 106.237 53.5198 106.285 53.8144 106.285C54.2824 106.285 54.6811 106.198 55.0104 106.025C55.3484 105.852 55.6561 105.622 55.9334 105.336L56.5574 105.895C56.2194 106.276 55.8338 106.584 55.4004 106.818C54.9671 107.043 54.4298 107.156 53.7884 107.156C53.3291 107.156 52.8958 107.074 52.4884 106.909C52.0811 106.736 51.7258 106.497 51.4224 106.194C51.1191 105.882 50.8764 105.509 50.6944 105.076C50.5211 104.643 50.4344 104.166 50.4344 103.646C50.4344 103.161 50.5124 102.706 50.6684 102.281C50.8331 101.848 51.0584 101.475 51.3444 101.163C51.6304 100.842 51.9684 100.591 52.3584 100.409C52.7571 100.227 53.1904 100.136 53.6584 100.136C54.1524 100.136 54.5944 100.231 54.9844 100.422C55.3744 100.604 55.7038 100.855 55.9724 101.176C56.2411 101.497 56.4448 101.874 56.5834 102.307C56.7221 102.74 56.7914 103.204 56.7914 103.698C56.7914 103.741 56.7914 103.789 56.7914 103.841C56.7914 103.893 56.7871 103.949 56.7784 104.01H51.4484ZM51.4484 103.269H55.7774C55.7514 102.966 55.6864 102.675 55.5824 102.398C55.4871 102.121 55.3484 101.878 55.1664 101.67C54.9931 101.462 54.7764 101.297 54.5164 101.176C54.2651 101.046 53.9704 100.981 53.6324 100.981C53.3378 100.981 53.0648 101.042 52.8134 101.163C52.5621 101.276 52.3411 101.436 52.1504 101.644C51.9598 101.843 51.8038 102.082 51.6824 102.359C51.5611 102.636 51.4831 102.94 51.4484 103.269ZM59.9088 100.305H62.0408V101.163H59.9218V107H58.9208V101.163H57.9978V100.292H58.9208V99.707C58.9208 98.9703 59.0941 98.4113 59.4408 98.03C59.7961 97.6487 60.2988 97.458 60.9488 97.458C61.1828 97.458 61.3821 97.471 61.5468 97.497C61.7201 97.523 61.8891 97.5663 62.0538 97.627V98.498C61.8718 98.446 61.7071 98.407 61.5598 98.381C61.4124 98.3463 61.2521 98.329 61.0788 98.329C60.2988 98.329 59.9088 98.8057 59.9088 99.759V100.305ZM69.9187 105.856L72.1937 100.279H73.2727L70.3477 107.052H69.4637L66.5517 100.279H67.6567L69.9187 105.856ZM81.042 103.633C81.042 104.11 80.951 104.565 80.769 104.998C80.5957 105.423 80.353 105.795 80.041 106.116C79.729 106.437 79.3563 106.692 78.923 106.883C78.4897 107.065 78.0217 107.156 77.519 107.156C77.0163 107.156 76.5527 107.065 76.128 106.883C75.7033 106.692 75.335 106.441 75.023 106.129C74.711 105.808 74.4683 105.436 74.295 105.011C74.1217 104.586 74.035 104.136 74.035 103.659C74.035 103.182 74.1217 102.732 74.295 102.307C74.4683 101.874 74.711 101.497 75.023 101.176C75.335 100.855 75.7033 100.604 76.128 100.422C76.5613 100.231 77.0337 100.136 77.545 100.136C78.0477 100.136 78.5113 100.231 78.936 100.422C79.3693 100.604 79.742 100.855 80.054 101.176C80.366 101.488 80.6087 101.856 80.782 102.281C80.9553 102.706 81.042 103.156 81.042 103.633ZM80.015 103.659C80.015 103.295 79.95 102.953 79.82 102.632C79.6987 102.311 79.5253 102.034 79.3 101.8C79.0747 101.557 78.8103 101.367 78.507 101.228C78.2037 101.089 77.8743 101.02 77.519 101.02C77.155 101.02 76.8213 101.089 76.518 101.228C76.2147 101.358 75.9547 101.544 75.738 101.787C75.53 102.021 75.3653 102.298 75.244 102.619C75.1227 102.931 75.062 103.269 75.062 103.633C75.062 103.997 75.1227 104.339 75.244 104.66C75.374 104.981 75.5473 105.258 75.764 105.492C75.9893 105.726 76.2537 105.912 76.557 106.051C76.8603 106.19 77.1897 106.259 77.545 106.259C77.909 106.259 78.2427 106.194 78.546 106.064C78.8493 105.925 79.1093 105.739 79.326 105.505C79.5427 105.271 79.7117 104.998 79.833 104.686C79.9543 104.365 80.015 104.023 80.015 103.659ZM84.2073 101.163V105.089C84.2073 105.505 84.3113 105.795 84.5193 105.96C84.7273 106.125 85.0003 106.207 85.3383 106.207C85.5116 106.207 85.672 106.19 85.8193 106.155C85.9753 106.12 86.14 106.06 86.3133 105.973V106.831C86.14 106.926 85.9536 106.996 85.7543 107.039C85.5636 107.091 85.347 107.117 85.1043 107.117C84.8356 107.117 84.5843 107.082 84.3503 107.013C84.1163 106.944 83.9126 106.835 83.7393 106.688C83.5746 106.532 83.4446 106.333 83.3493 106.09C83.254 105.847 83.2063 105.557 83.2063 105.219V101.163H82.2703V100.279H83.2063V98.251H84.2073V100.279H86.3393V101.163H84.2073ZM89.2812 98.81H88.1372V97.705H89.2812V98.81ZM89.2032 107H88.2022V100.279H89.2032V107ZM92.5272 103.152V107H91.5262V100.279H92.5272V101.449C92.7525 101.085 93.0472 100.777 93.4112 100.526C93.7752 100.266 94.2475 100.136 94.8282 100.136C95.2355 100.136 95.5952 100.201 95.9072 100.331C96.2279 100.461 96.4965 100.647 96.7132 100.89C96.9385 101.124 97.1075 101.406 97.2202 101.735C97.3415 102.064 97.4022 102.428 97.4022 102.827V107H96.4012V103.074C96.4012 102.45 96.2409 101.956 95.9202 101.592C95.5995 101.228 95.1402 101.046 94.5422 101.046C94.2562 101.046 93.9875 101.098 93.7362 101.202C93.4935 101.297 93.2812 101.44 93.0992 101.631C92.9172 101.813 92.7742 102.034 92.6702 102.294C92.5749 102.554 92.5272 102.84 92.5272 103.152ZM105.933 105.83C105.933 106.376 105.851 106.853 105.686 107.26C105.53 107.667 105.3 108.005 104.997 108.274C104.702 108.551 104.343 108.759 103.918 108.898C103.502 109.037 103.034 109.106 102.514 109.106C101.951 109.106 101.413 109.028 100.902 108.872C100.391 108.716 99.9096 108.482 99.4589 108.17L99.9139 107.39C100.304 107.667 100.711 107.88 101.136 108.027C101.561 108.174 102.016 108.248 102.501 108.248C103.246 108.248 103.84 108.044 104.282 107.637C104.724 107.238 104.945 106.645 104.945 105.856V105.063C104.65 105.453 104.291 105.787 103.866 106.064C103.441 106.341 102.921 106.48 102.306 106.48C101.899 106.48 101.504 106.411 101.123 106.272C100.75 106.125 100.417 105.917 100.122 105.648C99.8273 105.371 99.5889 105.037 99.4069 104.647C99.2336 104.257 99.1469 103.815 99.1469 103.321C99.1469 102.827 99.2336 102.385 99.4069 101.995C99.5889 101.596 99.8273 101.263 100.122 100.994C100.417 100.717 100.755 100.504 101.136 100.357C101.517 100.21 101.907 100.136 102.306 100.136C102.618 100.136 102.904 100.175 103.164 100.253C103.433 100.322 103.671 100.418 103.879 100.539C104.096 100.66 104.291 100.803 104.464 100.968C104.637 101.133 104.793 101.306 104.932 101.488V100.279H105.933V105.83ZM104.971 103.308C104.971 102.961 104.902 102.649 104.763 102.372C104.624 102.086 104.438 101.843 104.204 101.644C103.979 101.445 103.719 101.293 103.424 101.189C103.129 101.076 102.822 101.02 102.501 101.02C102.18 101.02 101.877 101.072 101.591 101.176C101.314 101.28 101.067 101.432 100.85 101.631C100.642 101.83 100.477 102.073 100.356 102.359C100.235 102.636 100.174 102.948 100.174 103.295C100.174 103.642 100.235 103.958 100.356 104.244C100.486 104.521 100.655 104.764 100.863 104.972C101.08 105.171 101.327 105.327 101.604 105.44C101.89 105.544 102.189 105.596 102.501 105.596C102.822 105.596 103.129 105.544 103.424 105.44C103.719 105.327 103.979 105.171 104.204 104.972C104.438 104.773 104.624 104.534 104.763 104.257C104.902 103.971 104.971 103.655 104.971 103.308ZM118.463 107H117.462V105.648C117.324 105.847 117.168 106.038 116.994 106.22C116.83 106.402 116.643 106.562 116.435 106.701C116.227 106.84 115.993 106.948 115.733 107.026C115.482 107.104 115.2 107.143 114.888 107.143C114.481 107.143 114.087 107.065 113.705 106.909C113.324 106.753 112.982 106.528 112.678 106.233C112.375 105.93 112.132 105.561 111.95 105.128C111.768 104.695 111.677 104.201 111.677 103.646C111.677 103.091 111.768 102.597 111.95 102.164C112.132 101.731 112.375 101.367 112.678 101.072C112.982 100.769 113.324 100.539 113.705 100.383C114.087 100.218 114.481 100.136 114.888 100.136C115.2 100.136 115.486 100.175 115.746 100.253C116.006 100.331 116.24 100.435 116.448 100.565C116.656 100.695 116.843 100.847 117.007 101.02C117.181 101.193 117.332 101.375 117.462 101.566V97.51H118.463V107ZM117.501 103.633C117.501 103.243 117.432 102.888 117.293 102.567C117.163 102.246 116.981 101.973 116.747 101.748C116.522 101.523 116.262 101.349 115.967 101.228C115.681 101.098 115.382 101.033 115.07 101.033C114.741 101.033 114.433 101.094 114.147 101.215C113.861 101.328 113.61 101.497 113.393 101.722C113.185 101.939 113.016 102.212 112.886 102.541C112.765 102.862 112.704 103.226 112.704 103.633C112.704 104.032 112.765 104.391 112.886 104.712C113.016 105.033 113.19 105.31 113.406 105.544C113.623 105.769 113.874 105.943 114.16 106.064C114.446 106.185 114.75 106.246 115.07 106.246C115.382 106.246 115.681 106.185 115.967 106.064C116.262 105.934 116.522 105.756 116.747 105.531C116.981 105.306 117.163 105.033 117.293 104.712C117.432 104.383 117.501 104.023 117.501 103.633ZM121.298 104.01C121.333 104.374 121.419 104.699 121.558 104.985C121.697 105.262 121.874 105.501 122.091 105.7C122.308 105.891 122.55 106.038 122.819 106.142C123.088 106.237 123.369 106.285 123.664 106.285C124.132 106.285 124.531 106.198 124.86 106.025C125.198 105.852 125.506 105.622 125.783 105.336L126.407 105.895C126.069 106.276 125.683 106.584 125.25 106.818C124.817 107.043 124.279 107.156 123.638 107.156C123.179 107.156 122.745 107.074 122.338 106.909C121.931 106.736 121.575 106.497 121.272 106.194C120.969 105.882 120.726 105.509 120.544 105.076C120.371 104.643 120.284 104.166 120.284 103.646C120.284 103.161 120.362 102.706 120.518 102.281C120.683 101.848 120.908 101.475 121.194 101.163C121.48 100.842 121.818 100.591 122.208 100.409C122.607 100.227 123.04 100.136 123.508 100.136C124.002 100.136 124.444 100.231 124.834 100.422C125.224 100.604 125.553 100.855 125.822 101.176C126.091 101.497 126.294 101.874 126.433 102.307C126.572 102.74 126.641 103.204 126.641 103.698C126.641 103.741 126.641 103.789 126.641 103.841C126.641 103.893 126.637 103.949 126.628 104.01H121.298ZM121.298 103.269H125.627C125.601 102.966 125.536 102.675 125.432 102.398C125.337 102.121 125.198 101.878 125.016 101.67C124.843 101.462 124.626 101.297 124.366 101.176C124.115 101.046 123.82 100.981 123.482 100.981C123.187 100.981 122.914 101.042 122.663 101.163C122.412 101.276 122.191 101.436 122 101.644C121.809 101.843 121.653 102.082 121.532 102.359C121.411 102.636 121.333 102.94 121.298 103.269ZM130.824 101.072C130.426 101.072 130.062 101.12 129.732 101.215C129.412 101.302 129.095 101.419 128.783 101.566L128.484 100.747C128.857 100.574 129.234 100.439 129.615 100.344C129.997 100.24 130.434 100.188 130.928 100.188C131.847 100.188 132.553 100.418 133.047 100.877C133.541 101.328 133.788 101.999 133.788 102.892V107H132.826V105.986C132.592 106.289 132.276 106.558 131.877 106.792C131.487 107.026 130.993 107.143 130.395 107.143C130.083 107.143 129.776 107.1 129.472 107.013C129.178 106.926 128.909 106.796 128.666 106.623C128.432 106.441 128.242 106.22 128.094 105.96C127.956 105.7 127.886 105.392 127.886 105.037C127.886 104.682 127.956 104.37 128.094 104.101C128.233 103.824 128.428 103.594 128.679 103.412C128.939 103.23 129.243 103.091 129.589 102.996C129.945 102.901 130.335 102.853 130.759 102.853C131.193 102.853 131.57 102.879 131.89 102.931C132.211 102.983 132.523 103.052 132.826 103.139V102.905C132.826 102.298 132.649 101.843 132.293 101.54C131.947 101.228 131.457 101.072 130.824 101.072ZM130.863 103.594C130.231 103.594 129.745 103.72 129.407 103.971C129.069 104.222 128.9 104.565 128.9 104.998C128.9 105.215 128.944 105.405 129.03 105.57C129.126 105.735 129.251 105.878 129.407 105.999C129.563 106.112 129.741 106.198 129.94 106.259C130.148 106.32 130.365 106.35 130.59 106.35C130.902 106.35 131.193 106.307 131.461 106.22C131.739 106.125 131.977 105.999 132.176 105.843C132.384 105.678 132.545 105.488 132.657 105.271C132.779 105.046 132.839 104.799 132.839 104.53V103.88C132.588 103.811 132.298 103.746 131.968 103.685C131.648 103.624 131.279 103.594 130.863 103.594ZM142.318 107H141.317V105.648C141.178 105.847 141.022 106.038 140.849 106.22C140.684 106.402 140.498 106.562 140.29 106.701C140.082 106.84 139.848 106.948 139.588 107.026C139.336 107.104 139.055 107.143 138.743 107.143C138.335 107.143 137.941 107.065 137.56 106.909C137.178 106.753 136.836 106.528 136.533 106.233C136.229 105.93 135.987 105.561 135.805 105.128C135.623 104.695 135.532 104.201 135.532 103.646C135.532 103.091 135.623 102.597 135.805 102.164C135.987 101.731 136.229 101.367 136.533 101.072C136.836 100.769 137.178 100.539 137.56 100.383C137.941 100.218 138.335 100.136 138.743 100.136C139.055 100.136 139.341 100.175 139.601 100.253C139.861 100.331 140.095 100.435 140.303 100.565C140.511 100.695 140.697 100.847 140.862 101.02C141.035 101.193 141.187 101.375 141.317 101.566V97.51H142.318V107ZM141.356 103.633C141.356 103.243 141.286 102.888 141.148 102.567C141.018 102.246 140.836 101.973 140.602 101.748C140.376 101.523 140.116 101.349 139.822 101.228C139.536 101.098 139.237 101.033 138.925 101.033C138.595 101.033 138.288 101.094 138.002 101.215C137.716 101.328 137.464 101.497 137.248 101.722C137.04 101.939 136.871 102.212 136.741 102.541C136.619 102.862 136.559 103.226 136.559 103.633C136.559 104.032 136.619 104.391 136.741 104.712C136.871 105.033 137.044 105.31 137.261 105.544C137.477 105.769 137.729 105.943 138.015 106.064C138.301 106.185 138.604 106.246 138.925 106.246C139.237 106.246 139.536 106.185 139.822 106.064C140.116 105.934 140.376 105.756 140.602 105.531C140.836 105.306 141.018 105.033 141.148 104.712C141.286 104.383 141.356 104.023 141.356 103.633ZM145.647 107H144.646V97.51H145.647V107ZM149.14 98.81H147.996V97.705H149.14V98.81ZM149.062 107H148.061V100.279H149.062V107ZM152.386 103.152V107H151.385V100.279H152.386V101.449C152.611 101.085 152.906 100.777 153.27 100.526C153.634 100.266 154.106 100.136 154.687 100.136C155.094 100.136 155.454 100.201 155.766 100.331C156.086 100.461 156.355 100.647 156.572 100.89C156.797 101.124 156.966 101.406 157.079 101.735C157.2 102.064 157.261 102.428 157.261 102.827V107H156.26V103.074C156.26 102.45 156.099 101.956 155.779 101.592C155.458 101.228 154.999 101.046 154.401 101.046C154.115 101.046 153.846 101.098 153.595 101.202C153.352 101.297 153.14 101.44 152.958 101.631C152.776 101.813 152.633 102.034 152.529 102.294C152.433 102.554 152.386 102.84 152.386 103.152ZM159.993 104.01C160.028 104.374 160.115 104.699 160.253 104.985C160.392 105.262 160.57 105.501 160.786 105.7C161.003 105.891 161.246 106.038 161.514 106.142C161.783 106.237 162.065 106.285 162.359 106.285C162.827 106.285 163.226 106.198 163.555 106.025C163.893 105.852 164.201 105.622 164.478 105.336L165.102 105.895C164.764 106.276 164.379 106.584 163.945 106.818C163.512 107.043 162.975 107.156 162.333 107.156C161.874 107.156 161.441 107.074 161.033 106.909C160.626 106.736 160.271 106.497 159.967 106.194C159.664 105.882 159.421 105.509 159.239 105.076C159.066 104.643 158.979 104.166 158.979 103.646C158.979 103.161 159.057 102.706 159.213 102.281C159.378 101.848 159.603 101.475 159.889 101.163C160.175 100.842 160.513 100.591 160.903 100.409C161.302 100.227 161.735 100.136 162.203 100.136C162.697 100.136 163.139 100.231 163.529 100.422C163.919 100.604 164.249 100.855 164.517 101.176C164.786 101.497 164.99 101.874 165.128 102.307C165.267 102.74 165.336 103.204 165.336 103.698C165.336 103.741 165.336 103.789 165.336 103.841C165.336 103.893 165.332 103.949 165.323 104.01H159.993ZM159.993 103.269H164.322C164.296 102.966 164.231 102.675 164.127 102.398C164.032 102.121 163.893 101.878 163.711 101.67C163.538 101.462 163.321 101.297 163.061 101.176C162.81 101.046 162.515 100.981 162.177 100.981C161.883 100.981 161.61 101.042 161.358 101.163C161.107 101.276 160.886 101.436 160.695 101.644C160.505 101.843 160.349 102.082 160.227 102.359C160.106 102.636 160.028 102.94 159.993 103.269ZM168.233 101.644H167.037V100.279H168.233V101.644ZM168.233 107H167.037V105.635H168.233V107Z"
        fill="#94A3AE"
      />
      <path
        d="M33.6 154L39.76 139.9H42.04L48.2 154H45.6L44.18 150.62H37.56L36.12 154H33.6ZM38.46 148.44H43.28L40.86 142.84L38.46 148.44ZM53.7655 154.22C51.3855 154.22 50.0055 152.62 50.0055 150.16V143.44H52.4255V149.44C52.4255 151.08 53.2455 152.02 54.6855 152.02C56.0855 152.02 57.0655 151.04 57.0655 149.4V143.44H59.4855V154H57.0655V152.36C56.3855 153.36 55.4055 154.22 53.7655 154.22ZM67.2278 157.24C65.4878 157.24 63.8678 156.8 62.5078 155.98L63.4078 154.16C64.5278 154.86 65.7278 155.28 67.1678 155.28C69.3278 155.28 70.5078 154.16 70.5078 152.04V151.22C69.6278 152.36 68.5278 153.16 66.7878 153.16C64.3078 153.16 61.9878 151.32 61.9878 148.22V148.18C61.9878 145.06 64.3278 143.22 66.7878 143.22C68.5678 143.22 69.6678 144.04 70.4878 145.02V143.44H72.9078V151.84C72.9078 153.62 72.4478 154.94 71.5678 155.82C70.6078 156.78 69.1278 157.24 67.2278 157.24ZM67.4278 151.12C69.1078 151.12 70.5278 149.92 70.5278 148.22V148.18C70.5278 146.44 69.1078 145.26 67.4278 145.26C65.7478 145.26 64.4278 146.42 64.4278 148.16V148.2C64.4278 149.94 65.7678 151.12 67.4278 151.12ZM86.4823 154.24C84.3423 154.24 82.6623 153.38 81.3423 152.1L82.8623 150.32C83.9823 151.36 85.1623 152 86.4623 152C88.1423 152 89.2423 151.04 89.2423 149.58V149.54C89.2423 148.12 88.0423 147.22 86.3423 147.22C85.3423 147.22 84.4823 147.5 83.7623 147.84L82.2823 146.86L82.6823 140H91.0423V142.18H84.8023L84.5823 145.46C85.2423 145.22 85.8623 145.06 86.8023 145.06C89.5223 145.06 91.6623 146.5 91.6623 149.46V149.5C91.6623 152.36 89.5823 154.24 86.4823 154.24ZM97.9038 154.18C96.1238 154.18 94.8638 153.4 94.8638 151.08V145.52H93.5238V143.44H94.8638V140.54H97.2838V143.44H100.124V145.52H97.2838V150.7C97.2838 151.64 97.7638 152.02 98.5838 152.02C99.1238 152.02 99.6038 151.9 100.084 151.66V153.64C99.4838 153.98 98.8038 154.18 97.9038 154.18ZM102.567 154V139.4H104.987V145.08C105.667 144.08 106.647 143.22 108.287 143.22C110.667 143.22 112.047 144.82 112.047 147.28V154H109.627V148C109.627 146.36 108.807 145.42 107.367 145.42C105.967 145.42 104.987 146.4 104.987 148.04V154H102.567Z"
        fill="white"
      />
      <path
        d="M41.97 167.629L38.655 172.504H38.603L35.288 167.642V175H34.287V165.9H35.327L38.642 170.866L41.957 165.9H42.997V175H41.97V167.629ZM46.0021 172.01C46.0368 172.374 46.1235 172.699 46.2621 172.985C46.4008 173.262 46.5785 173.501 46.7951 173.7C47.0118 173.891 47.2545 174.038 47.5231 174.142C47.7918 174.237 48.0735 174.285 48.3681 174.285C48.8361 174.285 49.2348 174.198 49.5641 174.025C49.9021 173.852 50.2098 173.622 50.4871 173.336L51.1111 173.895C50.7731 174.276 50.3875 174.584 49.9541 174.818C49.5208 175.043 48.9835 175.156 48.3421 175.156C47.8828 175.156 47.4495 175.074 47.0421 174.909C46.6348 174.736 46.2795 174.497 45.9761 174.194C45.6728 173.882 45.4301 173.509 45.2481 173.076C45.0748 172.643 44.9881 172.166 44.9881 171.646C44.9881 171.161 45.0661 170.706 45.2221 170.281C45.3868 169.848 45.6121 169.475 45.8981 169.163C46.1841 168.842 46.5221 168.591 46.9121 168.409C47.3108 168.227 47.7441 168.136 48.2121 168.136C48.7061 168.136 49.1481 168.231 49.5381 168.422C49.9281 168.604 50.2575 168.855 50.5261 169.176C50.7948 169.497 50.9985 169.874 51.1371 170.307C51.2758 170.74 51.3451 171.204 51.3451 171.698C51.3451 171.741 51.3451 171.789 51.3451 171.841C51.3451 171.893 51.3408 171.949 51.3321 172.01H46.0021ZM46.0021 171.269H50.3311C50.3051 170.966 50.2401 170.675 50.1361 170.398C50.0408 170.121 49.9021 169.878 49.7201 169.67C49.5468 169.462 49.3301 169.297 49.0701 169.176C48.8188 169.046 48.5241 168.981 48.1861 168.981C47.8915 168.981 47.6185 169.042 47.3671 169.163C47.1158 169.276 46.8948 169.436 46.7041 169.644C46.5135 169.843 46.3575 170.082 46.2361 170.359C46.1148 170.636 46.0368 170.94 46.0021 171.269ZM58.4275 169.475C58.5488 169.293 58.6832 169.12 58.8305 168.955C58.9865 168.79 59.1598 168.647 59.3505 168.526C59.5412 168.405 59.7535 168.309 59.9875 168.24C60.2302 168.171 60.4988 168.136 60.7935 168.136C61.5735 168.136 62.1845 168.379 62.6265 168.864C63.0685 169.341 63.2895 169.999 63.2895 170.84V175H62.2885V171.074C62.2885 170.424 62.1325 169.926 61.8205 169.579C61.5172 169.224 61.0925 169.046 60.5465 169.046C60.2952 169.046 60.0568 169.094 59.8315 169.189C59.6062 169.276 59.4068 169.41 59.2335 169.592C59.0688 169.765 58.9345 169.982 58.8305 170.242C58.7352 170.502 58.6875 170.797 58.6875 171.126V175H57.6995V171.048C57.6995 170.415 57.5435 169.926 57.2315 169.579C56.9282 169.224 56.5078 169.046 55.9705 169.046C55.7018 169.046 55.4548 169.098 55.2295 169.202C55.0042 169.306 54.8048 169.453 54.6315 169.644C54.4668 169.835 54.3368 170.06 54.2415 170.32C54.1462 170.571 54.0985 170.853 54.0985 171.165V175H53.0975V168.279H54.0985V169.41C54.2112 169.245 54.3325 169.085 54.4625 168.929C54.6012 168.773 54.7572 168.639 54.9305 168.526C55.1038 168.405 55.2988 168.309 55.5155 168.24C55.7322 168.171 55.9835 168.136 56.2695 168.136C56.8155 168.136 57.2662 168.266 57.6215 168.526C57.9768 168.777 58.2455 169.094 58.4275 169.475ZM66.0607 172.01C66.0954 172.374 66.1821 172.699 66.3207 172.985C66.4594 173.262 66.6371 173.501 66.8537 173.7C67.0704 173.891 67.3131 174.038 67.5817 174.142C67.8504 174.237 68.1321 174.285 68.4267 174.285C68.8947 174.285 69.2934 174.198 69.6227 174.025C69.9607 173.852 70.2684 173.622 70.5457 173.336L71.1697 173.895C70.8317 174.276 70.4461 174.584 70.0127 174.818C69.5794 175.043 69.0421 175.156 68.4007 175.156C67.9414 175.156 67.5081 175.074 67.1007 174.909C66.6934 174.736 66.3381 174.497 66.0347 174.194C65.7314 173.882 65.4887 173.509 65.3067 173.076C65.1334 172.643 65.0467 172.166 65.0467 171.646C65.0467 171.161 65.1247 170.706 65.2807 170.281C65.4454 169.848 65.6707 169.475 65.9567 169.163C66.2427 168.842 66.5807 168.591 66.9707 168.409C67.3694 168.227 67.8027 168.136 68.2707 168.136C68.7647 168.136 69.2067 168.231 69.5967 168.422C69.9867 168.604 70.3161 168.855 70.5847 169.176C70.8534 169.497 71.0571 169.874 71.1957 170.307C71.3344 170.74 71.4037 171.204 71.4037 171.698C71.4037 171.741 71.4037 171.789 71.4037 171.841C71.4037 171.893 71.3994 171.949 71.3907 172.01H66.0607ZM66.0607 171.269H70.3897C70.3637 170.966 70.2987 170.675 70.1947 170.398C70.0994 170.121 69.9607 169.878 69.7787 169.67C69.6054 169.462 69.3887 169.297 69.1287 169.176C68.8774 169.046 68.5827 168.981 68.2447 168.981C67.9501 168.981 67.6771 169.042 67.4257 169.163C67.1744 169.276 66.9534 169.436 66.7627 169.644C66.5721 169.843 66.4161 170.082 66.2947 170.359C66.1734 170.636 66.0954 170.94 66.0607 171.269ZM76.7701 166.849V175H75.7301V166.849H72.6751V165.9H79.8251V166.849H76.7701ZM86.5264 171.633C86.5264 172.11 86.4354 172.565 86.2534 172.998C86.08 173.423 85.8374 173.795 85.5254 174.116C85.2134 174.437 84.8407 174.692 84.4074 174.883C83.974 175.065 83.506 175.156 83.0034 175.156C82.5007 175.156 82.037 175.065 81.6124 174.883C81.1877 174.692 80.8194 174.441 80.5074 174.129C80.1954 173.808 79.9527 173.436 79.7794 173.011C79.606 172.586 79.5194 172.136 79.5194 171.659C79.5194 171.182 79.606 170.732 79.7794 170.307C79.9527 169.874 80.1954 169.497 80.5074 169.176C80.8194 168.855 81.1877 168.604 81.6124 168.422C82.0457 168.231 82.518 168.136 83.0294 168.136C83.532 168.136 83.9957 168.231 84.4204 168.422C84.8537 168.604 85.2264 168.855 85.5384 169.176C85.8504 169.488 86.093 169.856 86.2664 170.281C86.4397 170.706 86.5264 171.156 86.5264 171.633ZM85.4994 171.659C85.4994 171.295 85.4344 170.953 85.3044 170.632C85.183 170.311 85.0097 170.034 84.7844 169.8C84.559 169.557 84.2947 169.367 83.9914 169.228C83.688 169.089 83.3587 169.02 83.0034 169.02C82.6394 169.02 82.3057 169.089 82.0024 169.228C81.699 169.358 81.439 169.544 81.2224 169.787C81.0144 170.021 80.8497 170.298 80.7284 170.619C80.607 170.931 80.5464 171.269 80.5464 171.633C80.5464 171.997 80.607 172.339 80.7284 172.66C80.8584 172.981 81.0317 173.258 81.2484 173.492C81.4737 173.726 81.738 173.912 82.0414 174.051C82.3447 174.19 82.674 174.259 83.0294 174.259C83.3934 174.259 83.727 174.194 84.0304 174.064C84.3337 173.925 84.5937 173.739 84.8104 173.505C85.027 173.271 85.196 172.998 85.3174 172.686C85.4387 172.365 85.4994 172.023 85.4994 171.659ZM91.3947 171.165L94.3067 175H93.1107L90.7057 171.867L89.3407 173.245V175H88.3397V165.51H89.3407V172.062L92.9677 168.279H94.2157L91.3947 171.165ZM96.009 172.01C96.0436 172.374 96.1303 172.699 96.269 172.985C96.4076 173.262 96.5853 173.501 96.802 173.7C97.0186 173.891 97.2613 174.038 97.53 174.142C97.7986 174.237 98.0803 174.285 98.375 174.285C98.843 174.285 99.2416 174.198 99.571 174.025C99.909 173.852 100.217 173.622 100.494 173.336L101.118 173.895C100.78 174.276 100.394 174.584 99.961 174.818C99.5276 175.043 98.9903 175.156 98.349 175.156C97.8896 175.156 97.4563 175.074 97.049 174.909C96.6416 174.736 96.2863 174.497 95.983 174.194C95.6796 173.882 95.437 173.509 95.255 173.076C95.0816 172.643 94.995 172.166 94.995 171.646C94.995 171.161 95.073 170.706 95.229 170.281C95.3936 169.848 95.619 169.475 95.905 169.163C96.191 168.842 96.529 168.591 96.919 168.409C97.3176 168.227 97.751 168.136 98.219 168.136C98.713 168.136 99.155 168.231 99.545 168.422C99.935 168.604 100.264 168.855 100.533 169.176C100.802 169.497 101.005 169.874 101.144 170.307C101.283 170.74 101.352 171.204 101.352 171.698C101.352 171.741 101.352 171.789 101.352 171.841C101.352 171.893 101.348 171.949 101.339 172.01H96.009ZM96.009 171.269H100.338C100.312 170.966 100.247 170.675 100.143 170.398C100.048 170.121 99.909 169.878 99.727 169.67C99.5536 169.462 99.337 169.297 99.077 169.176C98.8256 169.046 98.531 168.981 98.193 168.981C97.8983 168.981 97.6253 169.042 97.374 169.163C97.1226 169.276 96.9016 169.436 96.711 169.644C96.5203 169.843 96.3643 170.082 96.243 170.359C96.1216 170.636 96.0436 170.94 96.009 171.269ZM104.105 171.152V175H103.104V168.279H104.105V169.449C104.331 169.085 104.625 168.777 104.989 168.526C105.353 168.266 105.826 168.136 106.406 168.136C106.814 168.136 107.173 168.201 107.485 168.331C107.806 168.461 108.075 168.647 108.291 168.89C108.517 169.124 108.686 169.406 108.798 169.735C108.92 170.064 108.98 170.428 108.98 170.827V175H107.979V171.074C107.979 170.45 107.819 169.956 107.498 169.592C107.178 169.228 106.718 169.046 106.12 169.046C105.834 169.046 105.566 169.098 105.314 169.202C105.072 169.297 104.859 169.44 104.677 169.631C104.495 169.813 104.352 170.034 104.248 170.294C104.153 170.554 104.105 170.84 104.105 171.152ZM117.717 173.856L119.992 168.279H121.071L118.146 175.052H117.262L114.35 168.279H115.455L117.717 173.856ZM128.84 171.633C128.84 172.11 128.749 172.565 128.567 172.998C128.394 173.423 128.151 173.795 127.839 174.116C127.527 174.437 127.154 174.692 126.721 174.883C126.288 175.065 125.82 175.156 125.317 175.156C124.814 175.156 124.351 175.065 123.926 174.883C123.501 174.692 123.133 174.441 122.821 174.129C122.509 173.808 122.266 173.436 122.093 173.011C121.92 172.586 121.833 172.136 121.833 171.659C121.833 171.182 121.92 170.732 122.093 170.307C122.266 169.874 122.509 169.497 122.821 169.176C123.133 168.855 123.501 168.604 123.926 168.422C124.359 168.231 124.832 168.136 125.343 168.136C125.846 168.136 126.309 168.231 126.734 168.422C127.167 168.604 127.54 168.855 127.852 169.176C128.164 169.488 128.407 169.856 128.58 170.281C128.753 170.706 128.84 171.156 128.84 171.633ZM127.813 171.659C127.813 171.295 127.748 170.953 127.618 170.632C127.497 170.311 127.323 170.034 127.098 169.8C126.873 169.557 126.608 169.367 126.305 169.228C126.002 169.089 125.672 169.02 125.317 169.02C124.953 169.02 124.619 169.089 124.316 169.228C124.013 169.358 123.753 169.544 123.536 169.787C123.328 170.021 123.163 170.298 123.042 170.619C122.921 170.931 122.86 171.269 122.86 171.633C122.86 171.997 122.921 172.339 123.042 172.66C123.172 172.981 123.345 173.258 123.562 173.492C123.787 173.726 124.052 173.912 124.355 174.051C124.658 174.19 124.988 174.259 125.343 174.259C125.707 174.259 126.041 174.194 126.344 174.064C126.647 173.925 126.907 173.739 127.124 173.505C127.341 173.271 127.51 172.998 127.631 172.686C127.752 172.365 127.813 172.023 127.813 171.659ZM132.005 169.163V173.089C132.005 173.505 132.109 173.795 132.317 173.96C132.525 174.125 132.798 174.207 133.136 174.207C133.309 174.207 133.47 174.19 133.617 174.155C133.773 174.12 133.938 174.06 134.111 173.973V174.831C133.938 174.926 133.751 174.996 133.552 175.039C133.361 175.091 133.145 175.117 132.902 175.117C132.633 175.117 132.382 175.082 132.148 175.013C131.914 174.944 131.71 174.835 131.537 174.688C131.372 174.532 131.242 174.333 131.147 174.09C131.052 173.847 131.004 173.557 131.004 173.219V169.163H130.068V168.279H131.004V166.251H132.005V168.279H134.137V169.163H132.005ZM137.079 166.81H135.935V165.705H137.079V166.81ZM137.001 175H136V168.279H137.001V175ZM140.325 171.152V175H139.324V168.279H140.325V169.449C140.55 169.085 140.845 168.777 141.209 168.526C141.573 168.266 142.045 168.136 142.626 168.136C143.033 168.136 143.393 168.201 143.705 168.331C144.026 168.461 144.294 168.647 144.511 168.89C144.736 169.124 144.905 169.406 145.018 169.735C145.139 170.064 145.2 170.428 145.2 170.827V175H144.199V171.074C144.199 170.45 144.039 169.956 143.718 169.592C143.397 169.228 142.938 169.046 142.34 169.046C142.054 169.046 141.785 169.098 141.534 169.202C141.291 169.297 141.079 169.44 140.897 169.631C140.715 169.813 140.572 170.034 140.468 170.294C140.373 170.554 140.325 170.84 140.325 171.152ZM153.731 173.83C153.731 174.376 153.648 174.853 153.484 175.26C153.328 175.667 153.098 176.005 152.795 176.274C152.5 176.551 152.14 176.759 151.716 176.898C151.3 177.037 150.832 177.106 150.312 177.106C149.748 177.106 149.211 177.028 148.7 176.872C148.188 176.716 147.707 176.482 147.257 176.17L147.712 175.39C148.102 175.667 148.509 175.88 148.934 176.027C149.358 176.174 149.813 176.248 150.299 176.248C151.044 176.248 151.638 176.044 152.08 175.637C152.522 175.238 152.743 174.645 152.743 173.856V173.063C152.448 173.453 152.088 173.787 151.664 174.064C151.239 174.341 150.719 174.48 150.104 174.48C149.696 174.48 149.302 174.411 148.921 174.272C148.548 174.125 148.214 173.917 147.92 173.648C147.625 173.371 147.387 173.037 147.205 172.647C147.031 172.257 146.945 171.815 146.945 171.321C146.945 170.827 147.031 170.385 147.205 169.995C147.387 169.596 147.625 169.263 147.92 168.994C148.214 168.717 148.552 168.504 148.934 168.357C149.315 168.21 149.705 168.136 150.104 168.136C150.416 168.136 150.702 168.175 150.962 168.253C151.23 168.322 151.469 168.418 151.677 168.539C151.893 168.66 152.088 168.803 152.262 168.968C152.435 169.133 152.591 169.306 152.73 169.488V168.279H153.731V173.83ZM152.769 171.308C152.769 170.961 152.699 170.649 152.561 170.372C152.422 170.086 152.236 169.843 152.002 169.644C151.776 169.445 151.516 169.293 151.222 169.189C150.927 169.076 150.619 169.02 150.299 169.02C149.978 169.02 149.675 169.072 149.389 169.176C149.111 169.28 148.864 169.432 148.648 169.631C148.44 169.83 148.275 170.073 148.154 170.359C148.032 170.636 147.972 170.948 147.972 171.295C147.972 171.642 148.032 171.958 148.154 172.244C148.284 172.521 148.453 172.764 148.661 172.972C148.877 173.171 149.124 173.327 149.402 173.44C149.688 173.544 149.987 173.596 150.299 173.596C150.619 173.596 150.927 173.544 151.222 173.44C151.516 173.327 151.776 173.171 152.002 172.972C152.236 172.773 152.422 172.534 152.561 172.257C152.699 171.971 152.769 171.655 152.769 171.308ZM166.261 175H165.26V173.648C165.121 173.847 164.965 174.038 164.792 174.22C164.627 174.402 164.441 174.562 164.233 174.701C164.025 174.84 163.791 174.948 163.531 175.026C163.28 175.104 162.998 175.143 162.686 175.143C162.279 175.143 161.884 175.065 161.503 174.909C161.122 174.753 160.779 174.528 160.476 174.233C160.173 173.93 159.93 173.561 159.748 173.128C159.566 172.695 159.475 172.201 159.475 171.646C159.475 171.091 159.566 170.597 159.748 170.164C159.93 169.731 160.173 169.367 160.476 169.072C160.779 168.769 161.122 168.539 161.503 168.383C161.884 168.218 162.279 168.136 162.686 168.136C162.998 168.136 163.284 168.175 163.544 168.253C163.804 168.331 164.038 168.435 164.246 168.565C164.454 168.695 164.64 168.847 164.805 169.02C164.978 169.193 165.13 169.375 165.26 169.566V165.51H166.261V175ZM165.299 171.633C165.299 171.243 165.23 170.888 165.091 170.567C164.961 170.246 164.779 169.973 164.545 169.748C164.32 169.523 164.06 169.349 163.765 169.228C163.479 169.098 163.18 169.033 162.868 169.033C162.539 169.033 162.231 169.094 161.945 169.215C161.659 169.328 161.408 169.497 161.191 169.722C160.983 169.939 160.814 170.212 160.684 170.541C160.563 170.862 160.502 171.226 160.502 171.633C160.502 172.032 160.563 172.391 160.684 172.712C160.814 173.033 160.987 173.31 161.204 173.544C161.421 173.769 161.672 173.943 161.958 174.064C162.244 174.185 162.547 174.246 162.868 174.246C163.18 174.246 163.479 174.185 163.765 174.064C164.06 173.934 164.32 173.756 164.545 173.531C164.779 173.306 164.961 173.033 165.091 172.712C165.23 172.383 165.299 172.023 165.299 171.633ZM169.096 172.01C169.131 172.374 169.217 172.699 169.356 172.985C169.495 173.262 169.672 173.501 169.889 173.7C170.106 173.891 170.348 174.038 170.617 174.142C170.886 174.237 171.167 174.285 171.462 174.285C171.93 174.285 172.329 174.198 172.658 174.025C172.996 173.852 173.304 173.622 173.581 173.336L174.205 173.895C173.867 174.276 173.481 174.584 173.048 174.818C172.615 175.043 172.077 175.156 171.436 175.156C170.977 175.156 170.543 175.074 170.136 174.909C169.729 174.736 169.373 174.497 169.07 174.194C168.767 173.882 168.524 173.509 168.342 173.076C168.169 172.643 168.082 172.166 168.082 171.646C168.082 171.161 168.16 170.706 168.316 170.281C168.481 169.848 168.706 169.475 168.992 169.163C169.278 168.842 169.616 168.591 170.006 168.409C170.405 168.227 170.838 168.136 171.306 168.136C171.8 168.136 172.242 168.231 172.632 168.422C173.022 168.604 173.351 168.855 173.62 169.176C173.889 169.497 174.092 169.874 174.231 170.307C174.37 170.74 174.439 171.204 174.439 171.698C174.439 171.741 174.439 171.789 174.439 171.841C174.439 171.893 174.435 171.949 174.426 172.01H169.096ZM169.096 171.269H173.425C173.399 170.966 173.334 170.675 173.23 170.398C173.135 170.121 172.996 169.878 172.814 169.67C172.641 169.462 172.424 169.297 172.164 169.176C171.913 169.046 171.618 168.981 171.28 168.981C170.985 168.981 170.712 169.042 170.461 169.163C170.21 169.276 169.989 169.436 169.798 169.644C169.607 169.843 169.451 170.082 169.33 170.359C169.209 170.636 169.131 170.94 169.096 171.269ZM178.622 169.072C178.224 169.072 177.86 169.12 177.53 169.215C177.21 169.302 176.893 169.419 176.581 169.566L176.282 168.747C176.655 168.574 177.032 168.439 177.413 168.344C177.795 168.24 178.232 168.188 178.726 168.188C179.645 168.188 180.351 168.418 180.845 168.877C181.339 169.328 181.586 169.999 181.586 170.892V175H180.624V173.986C180.39 174.289 180.074 174.558 179.675 174.792C179.285 175.026 178.791 175.143 178.193 175.143C177.881 175.143 177.574 175.1 177.27 175.013C176.976 174.926 176.707 174.796 176.464 174.623C176.23 174.441 176.04 174.22 175.892 173.96C175.754 173.7 175.684 173.392 175.684 173.037C175.684 172.682 175.754 172.37 175.892 172.101C176.031 171.824 176.226 171.594 176.477 171.412C176.737 171.23 177.041 171.091 177.387 170.996C177.743 170.901 178.133 170.853 178.557 170.853C178.991 170.853 179.368 170.879 179.688 170.931C180.009 170.983 180.321 171.052 180.624 171.139V170.905C180.624 170.298 180.447 169.843 180.091 169.54C179.745 169.228 179.255 169.072 178.622 169.072ZM178.661 171.594C178.029 171.594 177.543 171.72 177.205 171.971C176.867 172.222 176.698 172.565 176.698 172.998C176.698 173.215 176.742 173.405 176.828 173.57C176.924 173.735 177.049 173.878 177.205 173.999C177.361 174.112 177.539 174.198 177.738 174.259C177.946 174.32 178.163 174.35 178.388 174.35C178.7 174.35 178.991 174.307 179.259 174.22C179.537 174.125 179.775 173.999 179.974 173.843C180.182 173.678 180.343 173.488 180.455 173.271C180.577 173.046 180.637 172.799 180.637 172.53V171.88C180.386 171.811 180.096 171.746 179.766 171.685C179.446 171.624 179.077 171.594 178.661 171.594ZM190.116 175H189.115V173.648C188.976 173.847 188.82 174.038 188.647 174.22C188.482 174.402 188.296 174.562 188.088 174.701C187.88 174.84 187.646 174.948 187.386 175.026C187.134 175.104 186.853 175.143 186.541 175.143C186.133 175.143 185.739 175.065 185.358 174.909C184.976 174.753 184.634 174.528 184.331 174.233C184.027 173.93 183.785 173.561 183.603 173.128C183.421 172.695 183.33 172.201 183.33 171.646C183.33 171.091 183.421 170.597 183.603 170.164C183.785 169.731 184.027 169.367 184.331 169.072C184.634 168.769 184.976 168.539 185.358 168.383C185.739 168.218 186.133 168.136 186.541 168.136C186.853 168.136 187.139 168.175 187.399 168.253C187.659 168.331 187.893 168.435 188.101 168.565C188.309 168.695 188.495 168.847 188.66 169.02C188.833 169.193 188.985 169.375 189.115 169.566V165.51H190.116V175ZM189.154 171.633C189.154 171.243 189.084 170.888 188.946 170.567C188.816 170.246 188.634 169.973 188.4 169.748C188.174 169.523 187.914 169.349 187.62 169.228C187.334 169.098 187.035 169.033 186.723 169.033C186.393 169.033 186.086 169.094 185.8 169.215C185.514 169.328 185.262 169.497 185.046 169.722C184.838 169.939 184.669 170.212 184.539 170.541C184.417 170.862 184.357 171.226 184.357 171.633C184.357 172.032 184.417 172.391 184.539 172.712C184.669 173.033 184.842 173.31 185.059 173.544C185.275 173.769 185.527 173.943 185.813 174.064C186.099 174.185 186.402 174.246 186.723 174.246C187.035 174.246 187.334 174.185 187.62 174.064C187.914 173.934 188.174 173.756 188.4 173.531C188.634 173.306 188.816 173.033 188.946 172.712C189.084 172.383 189.154 172.023 189.154 171.633ZM193.444 175H192.443V165.51H193.444V175ZM196.937 166.81H195.793V165.705H196.937V166.81ZM196.859 175H195.858V168.279H196.859V175ZM200.183 171.152V175H199.182V168.279H200.183V169.449C200.409 169.085 200.703 168.777 201.067 168.526C201.431 168.266 201.904 168.136 202.484 168.136C202.892 168.136 203.251 168.201 203.563 168.331C203.884 168.461 204.153 168.647 204.369 168.89C204.595 169.124 204.764 169.406 204.876 169.735C204.998 170.064 205.058 170.428 205.058 170.827V175H204.057V171.074C204.057 170.45 203.897 169.956 203.576 169.592C203.256 169.228 202.796 169.046 202.198 169.046C201.912 169.046 201.644 169.098 201.392 169.202C201.15 169.297 200.937 169.44 200.755 169.631C200.573 169.813 200.43 170.034 200.326 170.294C200.231 170.554 200.183 170.84 200.183 171.152ZM207.791 172.01C207.826 172.374 207.913 172.699 208.051 172.985C208.19 173.262 208.368 173.501 208.584 173.7C208.801 173.891 209.044 174.038 209.312 174.142C209.581 174.237 209.863 174.285 210.157 174.285C210.625 174.285 211.024 174.198 211.353 174.025C211.691 173.852 211.999 173.622 212.276 173.336L212.9 173.895C212.562 174.276 212.177 174.584 211.743 174.818C211.31 175.043 210.773 175.156 210.131 175.156C209.672 175.156 209.239 175.074 208.831 174.909C208.424 174.736 208.069 174.497 207.765 174.194C207.462 173.882 207.219 173.509 207.037 173.076C206.864 172.643 206.777 172.166 206.777 171.646C206.777 171.161 206.855 170.706 207.011 170.281C207.176 169.848 207.401 169.475 207.687 169.163C207.973 168.842 208.311 168.591 208.701 168.409C209.1 168.227 209.533 168.136 210.001 168.136C210.495 168.136 210.937 168.231 211.327 168.422C211.717 168.604 212.047 168.855 212.315 169.176C212.584 169.497 212.788 169.874 212.926 170.307C213.065 170.74 213.134 171.204 213.134 171.698C213.134 171.741 213.134 171.789 213.134 171.841C213.134 171.893 213.13 171.949 213.121 172.01H207.791ZM207.791 171.269H212.12C212.094 170.966 212.029 170.675 211.925 170.398C211.83 170.121 211.691 169.878 211.509 169.67C211.336 169.462 211.119 169.297 210.859 169.176C210.608 169.046 210.313 168.981 209.975 168.981C209.681 168.981 209.408 169.042 209.156 169.163C208.905 169.276 208.684 169.436 208.493 169.644C208.303 169.843 208.147 170.082 208.025 170.359C207.904 170.636 207.826 170.94 207.791 171.269Z"
        fill="#94A3AE"
      />
      <defs>
        <pattern
          id="pattern0_0_2"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image0_0_1"
            transform="matrix(0.0178571 0 0 0.0167411 0 -0.0189732)"
          />
        </pattern>
        <linearGradient
          id="paint0_linear_0_1"
          x1="11.5"
          y1="24"
          x2="11.5"
          y2="68"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0" />
          <stop offset="0.5" stopColor="#00FFD1" />
          <stop offset="1" stopColor="#00FFD1" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_0_1"
          x1="11.5"
          y1="95"
          x2="11.5"
          y2="135"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0" />
          <stop offset="0.5" stopColor="#00FFD1" />
          <stop offset="1" stopColor="#00FFD1" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_0_2"
          x1="319.999"
          y1="21.3122"
          x2="268.76"
          y2="106.064"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0.2" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <image
          id="image0_0_1"
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
    <svg
      {...props}
      width="1212"
      height="295"
      viewBox="0 0 1212 295"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width="1210"
        height="293"
        rx="16"
        fill="url(#paint0_linear_2142_7234)"
        stroke="#979797"
        strokeOpacity="0.2"
      />
      <mask
        id="mask0_2142_7234"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="1212"
        height="295"
      >
        <rect
          x="1"
          y="1"
          width="1210"
          height="293"
          rx="16"
          fill="url(#paint1_linear_2142_7234)"
          stroke="#979797"
          strokeOpacity="0.2"
        />
      </mask>
      <g mask="url(#mask0_2142_7234)">
        <g opacity="0.06">
          <path
            d="M164.017 343.41C164.017 343.41 192.968 278.641 285.517 262.497C365.423 248.563 417.343 292.095 417.343 292.095C417.343 292.095 392.155 201.956 479.202 160.827C566.25 119.794 601.86 191.674 601.86 191.674C601.86 191.674 637.374 144.875 703.866 163.134C770.358 181.392 770.358 220.215 770.358 220.215C770.358 220.215 813.882 187.158 865.512 219.062C917.046 250.965 898.71 289.788 898.71 289.788C898.71 289.788 935.382 260.095 1001.87 285.272C1068.37 310.353 1076.38 343.506 1076.38 343.506C1076.38 343.506 1095.87 308.143 1055.72 254.521C1015.58 200.899 957.192 195.23 957.192 195.23C957.192 195.23 958.736 156.118 898.131 126.809C837.526 97.4998 800.468 120.947 800.468 120.947C800.468 120.947 785.316 87.4097 732.239 77.3196C679.161 67.2295 642.971 82.3167 642.971 82.3167C642.971 82.3167 541.159 11.8781 426.607 66.3646C312.152 120.851 302.887 198.785 302.887 198.785C302.887 198.785 180.229 245.104 164.113 343.506L164.017 343.41Z"
            fill="white"
          />
          <path
            d="M270.072 155.528C270.072 155.528 298.445 59.7204 385.685 26.375C257.43 45.4981 192.578 91.5282 136.605 194.447C176.848 161.486 270.072 155.528 270.072 155.528Z"
            fill="white"
          />
          <path
            d="M675.007 12.2615C675.007 12.2615 771.222 6.30354 818.124 68.67C882.203 61.2706 948.599 85.7751 974.752 144.394C941.94 49.3547 852.48 -40.4953 675.007 12.2615Z"
            fill="white"
          />
          <path
            d="M111.708 310.743C116.919 296.617 124.35 283.452 132.843 270.959C141.335 258.467 151.468 247.031 162.277 236.461C173.375 226.082 185.727 217.049 199.045 209.746C212.266 202.154 226.935 197.638 241.604 194.467C234.752 197.638 227.514 199.464 220.952 203.308L210.915 208.209L201.458 213.974C189.009 221.95 177.042 230.599 166.523 241.073C155.618 250.971 145.871 262.215 136.703 273.842C127.631 285.566 119.235 297.866 111.708 310.839V310.743Z"
            fill="white"
          />
          <path
            d="M281.941 287.387C294.487 280.276 309.349 277.873 323.728 278.546C330.966 279.026 338.204 280.083 345.056 282.39C352.004 284.408 358.47 287.771 364.453 291.615C350.557 288.155 337.142 285.369 323.439 284.792C309.735 284.023 296.031 284.984 281.941 287.291V287.387Z"
            fill="white"
          />
          <path
            d="M457.774 232.421C459.801 221.947 465.302 211.953 473.119 204.169C480.839 196.289 491.069 190.812 501.684 187.929C512.396 184.758 523.591 185.142 534.303 186.007C539.611 186.872 545.015 187.929 550.226 189.178C555.341 190.908 560.456 192.541 565.474 194.463C560.07 193.887 554.859 192.926 549.647 192.253L533.917 190.908C523.494 191.004 513.072 190.908 503.325 193.983C483.638 198.98 466.556 212.914 457.774 232.421Z"
            fill="white"
          />
          <path
            d="M618.553 218.771C635.538 205.702 658.216 199.36 680.123 202.05C691.028 203.492 701.837 206.471 711.198 212.14C716.119 214.447 720.269 218.098 724.708 221.173C728.858 224.633 732.525 228.573 736.289 232.417C727.41 226.363 718.629 220.597 709.075 216.465C699.714 211.948 689.58 209.45 679.447 208.201C669.218 206.855 658.892 207.432 648.662 209.258C638.433 211.18 628.3 214.255 618.649 218.771H618.553Z"
            fill="white"
          />
          <path
            d="M830.961 237.418C842.542 237.706 853.736 243.088 862.325 251.064C866.571 255.1 870.335 259.808 872.844 265.094C875.643 270.187 876.994 275.953 877.669 281.622C871.879 271.724 865.992 262.883 858.079 255.676C850.359 248.277 841.287 242.511 831.057 237.418H830.961Z"
            fill="white"
          />
          <path
            d="M1133.89 295.259C1129.35 283.151 1124.72 271.523 1119.03 260.472C1113.53 249.229 1106.77 238.851 1099.44 228.088C1110.24 235.391 1118.83 245.962 1124.62 257.589C1130.41 269.313 1134.18 282.19 1133.89 295.259Z"
            fill="white"
          />
          <path
            d="M136.605 100.861C147.028 80.2003 163.048 62.4226 181.673 48.2964C191.034 41.2814 201.071 35.1312 211.879 30.5186C222.495 25.5216 233.979 22.7348 245.27 20.7168C234.462 25.0411 223.943 29.2694 214.003 34.8429C203.966 40.2243 194.412 46.2784 185.437 53.1973C176.366 59.924 167.777 67.4195 159.67 75.2994C151.564 83.2754 143.747 91.6358 136.605 100.669V100.861Z"
            fill="white"
          />
          <path
            d="M992.507 168.805C1008.82 155.447 1025.51 142.57 1042.21 129.886C1058.9 117.105 1075.98 104.804 1092.87 92.312C1110.05 80.2038 1127.13 67.8075 1144.41 55.8915C1161.78 43.9756 1179.15 32.1558 1197 20.8164C1180.69 34.1738 1164 47.0507 1147.3 59.7354C1130.51 72.4201 1113.52 84.8165 1096.54 97.309C1079.36 109.417 1062.28 121.814 1045.01 133.729C1027.63 145.645 1010.26 157.465 992.41 168.805H992.507Z"
            fill="white"
          />
          <path
            d="M583.325 16.585C580.816 2.26665 580.237 -11.9556 580.141 -26.2739C580.141 -40.5922 580.816 -54.9106 583.325 -69.1328C585.834 -54.8145 586.413 -40.4961 586.51 -26.2739C586.413 -11.9556 585.834 2.26665 583.325 16.585Z"
            fill="white"
          />
          <path
            d="M482.192 16.5874C477.27 3.03787 473.024 -10.7039 468.875 -24.4456C464.725 -38.1874 461.154 -52.1213 457.197 -65.8631C453.82 -79.797 450.153 -93.6349 446.968 -107.665C443.783 -121.695 440.792 -135.725 438.379 -149.947C443.301 -136.398 447.547 -122.656 451.697 -108.914C455.846 -95.1724 459.417 -81.2385 463.374 -67.4967C466.751 -53.5628 470.419 -39.7249 473.603 -25.6949C476.788 -11.6648 479.78 2.3652 482.192 16.5874Z"
            fill="white"
          />
          <path
            d="M446.968 26.3935C438.475 3.42648 430.658 -19.7327 422.938 -42.8919C415.218 -66.0511 407.98 -89.4024 400.549 -112.658C393.504 -136.105 386.266 -159.36 379.511 -182.904C372.755 -206.352 366.097 -229.895 360.113 -253.631C368.606 -230.664 376.423 -207.505 384.143 -184.345C391.863 -161.186 399.101 -137.835 406.532 -114.58C413.481 -91.1322 420.815 -67.8769 427.57 -44.3333C434.326 -20.8859 440.985 2.65771 446.968 26.3935Z"
            fill="white"
          />
          <path
            d="M413.288 10.8164C405.76 -3.98237 400.067 -19.4538 394.855 -35.0214C389.837 -50.6851 385.205 -66.4449 382.406 -82.7812C389.934 -67.9824 395.627 -52.5109 400.839 -36.9434C405.857 -21.2797 410.489 -5.51991 413.288 10.8164Z"
            fill="white"
          />
          <path
            d="M116.823 237.413C97.7148 233.665 79.2823 228.092 60.9463 222.134C42.7069 215.984 24.5639 209.353 7 200.896C26.108 204.644 44.5405 210.122 62.8764 216.176C81.1159 222.326 99.2589 228.957 116.823 237.413Z"
            fill="white"
          />
          <path
            d="M982.376 58.7739C991.64 48.7799 1002.06 40.4195 1012.78 32.3474C1023.58 24.4675 1034.68 16.8759 1046.94 10.918C1037.67 20.912 1027.25 29.2724 1016.54 37.3444C1005.73 45.2243 994.632 52.8159 982.376 58.7739Z"
            fill="white"
          />
          <path
            d="M1063.54 194.451C1082.84 183.88 1102.82 174.943 1122.99 166.583C1143.25 158.318 1163.71 150.535 1184.85 144.48C1165.54 155.147 1145.57 163.988 1125.4 172.348C1105.13 180.613 1084.67 188.396 1063.54 194.451Z"
            fill="white"
          />
          <path
            d="M503.135 -203.571L520.602 10.8199L523.304 -44.1472L531.218 -7.82278L529.384 -66.7298L535.367 -33.1922L538.649 -77.0121L550.229 26.3875L546.948 -205.493L543.377 -149.949L538.359 -221.541L535.753 -191.367L527.647 -278.43V-166.382L525.234 -189.829V-120.736L517.707 -189.445L516.163 -131.883L503.135 -203.571Z"
            fill="white"
          />
          <path
            d="M1001.77 97.4052L1110.34 -11.2796L1094.8 19.1829L1145.47 -30.4028L1120.57 7.45914L1186.87 -44.1445L1135.72 4.86454C1135.72 4.86454 1178.38 -17.5259 1177.12 -17.0454C1175.87 -16.5649 1017.89 117.585 1017.89 117.585L1063.63 70.4982L1034.01 90.5823L1078.78 45.4171L1001.87 97.3091L1001.77 97.4052Z"
            fill="white"
          />
        </g>
        <path
          opacity="0.5"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M134.026 195.059C137.461 196.682 140.199 199.372 142.056 202.502L142.033 202.479C140.64 201.32 139.201 200.23 137.785 199.187C136.37 198.166 134.884 197.239 133.329 196.543C131.798 195.848 130.15 195.338 128.502 195.384C126.854 195.453 125.23 196.056 123.652 197.007C124.789 195.593 126.413 194.41 128.386 194.109C130.359 193.761 132.308 194.294 134.026 195.059ZM120.821 204.612C121.279 204.644 121.734 204.682 122.185 204.726C123.914 201.603 126.688 199.675 129.754 199.904C133.686 200.18 139.932 206.037 142.259 211.872C146.166 213.247 149.049 217.007 149.405 221.399L149.436 221.401C157.953 222.166 165.078 234.317 163.152 238.722C160.669 244.403 150.48 243.545 146.256 241.992C142.017 240.44 140.368 236.747 140.231 232.564C139.832 232.586 139.426 232.583 139.015 232.554C138.179 232.495 137.369 232.33 136.598 232.072C135.05 233.754 132.284 234.756 129.175 234.527C126.157 234.319 123.529 232.998 122.061 231.185C121.317 231.241 120.552 231.243 119.774 231.187C114.125 230.782 109.431 227.428 107.828 223.121C107.242 223.141 106.694 223.131 106.2 223.095C101.488 222.747 97.8213 217.53 98.007 211.455C98.1926 205.38 102.184 200.719 106.896 201.067C108.808 201.208 111.478 202.568 113.963 204.541C116.123 204.419 118.429 204.436 120.821 204.612ZM294.396 293.838C294.396 293.838 282.42 292.887 275.504 289.664C266.619 285.515 254.354 275.059 241.31 263.939C217.318 243.485 190.691 220.784 177.611 230.953C159.624 244.935 194.808 264.552 194.808 264.552C194.808 264.552 181.069 258.894 184.457 270.998C176.311 266.755 165.125 265.34 162.015 271.323C159.231 276.657 160.873 280.226 162.43 283.61L162.431 283.611C162.613 284.007 162.794 284.401 162.966 284.794C164.104 287.438 162.525 290.823 158.812 291.403C156.004 291.843 149.343 293.513 149.343 293.513L294.396 293.861V293.838ZM127.945 250.756C127.853 254.002 129.222 256.97 132.517 257.573C135.627 258.13 141.337 257.782 141.963 253.052C142.451 249.388 136.068 245.446 133.237 245.237C130.406 245.029 128.038 247.51 127.945 250.756ZM243.778 254.953C237.976 249.272 231.826 243.985 225.56 238.838C219.27 233.713 212.772 228.821 206.111 224.16C199.357 219.639 192.58 215.163 185.363 211.384C178.168 207.604 170.741 204.173 162.92 201.993C170.533 204.845 177.727 208.509 184.759 212.497C191.791 216.485 198.545 220.914 205.183 225.528C211.89 230.05 218.342 234.942 224.77 239.835C231.199 244.751 237.535 249.805 243.778 254.976V254.953ZM120.448 237.912C117.756 237.471 115.296 236.822 113.022 235.686C110.724 234.596 108.774 232.996 106.732 231.164C107.243 232.439 107.916 233.668 108.914 234.665C109.842 235.709 111.026 236.52 112.279 237.17C114.809 238.399 117.802 238.793 120.425 237.912H120.448ZM130.983 261.025C132.979 261.837 135.137 262.231 137.505 262.602C135.277 263.506 132.677 263.46 130.357 262.555C129.196 262.092 128.152 261.327 127.316 260.399C126.434 259.495 125.993 258.289 125.738 257.13C125.843 257.241 125.947 257.351 126.05 257.46L126.054 257.465C126.766 258.221 127.429 258.925 128.198 259.472C129.08 260.098 129.962 260.654 130.983 261.025ZM179.654 257.994C177.704 256.139 175.499 254.748 173.225 253.426C170.927 252.174 168.583 251.014 165.984 250.296C167.933 252.151 170.138 253.565 172.412 254.864C174.71 256.116 177.054 257.275 179.654 257.994ZM148.37 278.375C151.619 279.813 154.845 281.366 157.862 283.384C154.311 282.549 150.993 281.273 147.697 279.882C144.448 278.445 141.222 276.891 138.205 274.874C141.756 275.708 145.074 276.984 148.37 278.375Z"
          fill="white"
        />
        <path
          d="M315.568 264.845C316.672 266.146 314.406 265.345 313.476 266.779C308.886 266.979 304.587 267.646 300.81 269.247C299.59 269.747 299.241 270.381 299.474 271.181C299.764 272.015 300.229 272.849 300.229 273.716C300.229 275.083 298.37 276.017 295.988 275.917C291.049 275.717 286.459 274.283 281.986 273.249C279.371 272.648 276.698 272.082 274.026 271.548C272.05 271.148 268.797 270.214 266.705 270.448C264.09 270.714 265.427 273.049 266.066 274.016C267.693 276.35 270.423 278.284 273.561 280.018C278.848 282.986 284.716 285.521 291.224 287.522C295.233 288.722 299.416 289.789 303.483 290.857C305.458 291.357 307.434 291.824 309.351 292.291C307.608 294.291 309.874 295.459 313.244 296.559C322.83 299.761 334.393 299.594 345.025 300.661C349.208 301.094 343.05 301.795 350.08 302.695C359.899 303.962 388.426 304.363 398.478 304.496C403.997 304.563 409.459 304.529 414.979 304.629C421.079 304.729 429.678 303.862 435.779 303.996C447.573 304.296 459.6 304.696 471.22 305.163C480.691 305.563 490.161 305.763 499.69 305.797C500.503 305.797 501.665 305.63 501.607 305.163C478.483 304.162 452.686 303.429 429.62 302.062C409.517 300.894 397.374 300.194 377.387 298.493C365.709 297.493 348.918 295.425 337.53 293.691C327.537 292.157 314.696 290.456 307.957 285.588C299.648 279.552 308.712 272.348 318.008 268.813C318.357 268.68 318.88 268.513 319.228 268.313C320.1 268.847 321.494 269.781 322.424 270.414C334.915 278.785 350.022 285.054 367.859 289.122C373.901 290.49 380.176 291.457 386.683 291.924C393.249 292.357 399.698 292.19 405.741 290.59C407.89 290.023 409.866 290.056 412.015 290.39C415.966 291.023 420.556 292.824 426.308 294.058C441.473 297.293 447.573 296.926 463.958 297.026C468.896 297.059 478.018 296.592 483.015 296.626C485.804 296.626 488.651 296.626 491.439 296.726C501.375 296.959 512.181 298.293 522 299.36C529.263 300.127 539.14 300.327 546.461 300.561C552.91 300.761 559.417 300.794 565.925 300.828C568.656 300.828 577.661 300.661 581.38 300.594C588.468 299.594 560.405 299.927 536.7 295.259C514.564 290.89 503.35 286.255 494.867 281.586C489.173 278.451 487.372 273.816 490.452 269.247C492.601 266.079 496.785 267.046 498.005 266.979C501.607 266.779 504.744 265.979 506.836 264.245C508.753 262.644 508.928 260.777 508.812 258.909C508.812 258.309 508.579 257.675 508.463 256.975C509.393 256.375 510.555 255.808 511.426 255.141C517.701 250.239 512.472 243.269 504.396 240.134C489.58 234.398 475.171 238.233 461.808 243.235C459.135 244.236 456.288 245.236 453.151 245.637C447.05 246.37 441.589 246.17 435.314 242.135C430.898 239.3 428.4 234.798 431.305 234.031C441.473 231.397 452.337 228.095 455.649 221.593C459.484 214.023 448.735 205.452 448.27 205.619C454.487 203.484 484.7 198.516 487.256 198.082C490.742 197.482 493.241 197.148 492.95 196.848C492.253 195.481 485.397 197.882 478.483 196.381C475.578 195.748 472.557 195.981 469.593 196.615C468.896 196.748 468.199 196.882 467.502 196.982C463.551 197.615 459.484 197.649 455.533 197.048C451.408 196.415 447.806 195.047 443.564 194.514C441.066 194.214 439.323 194.014 435.953 194.514C435.488 194.581 433.513 194.981 433.513 194.981C433.513 194.981 430.84 191.679 419.278 190.279C418.697 190.212 413.236 189.745 412.771 189.478C410.156 188.111 413.7 186.077 413.352 182.442C412.655 175.739 408.123 170.703 403.242 167.669C374.192 149.827 301.914 146.092 279.952 173.271C278.441 175.172 276.466 180.474 272.457 180.941C251.308 183.409 251.541 203.851 254.329 213.022C258.048 225.194 268.506 236.766 281.056 246.537C283.845 248.738 287.215 250.739 290.643 252.64C295.174 255.174 300.345 257.208 306.678 258.075C308.712 258.342 310.106 259.042 311.094 260.11C312.605 261.777 314.173 263.378 315.568 264.878V264.845Z"
          fill="#FDFEFD"
        />
        <path
          d="M780.257 121.318C779.385 122.052 778.223 122.652 776.829 122.919C771.89 123.919 767.3 121.185 763.524 119.751C755.68 116.783 746.558 115.049 737.146 116.116C731.278 116.783 725.584 117.95 720.006 119.217C714.893 120.384 709.664 122.085 704.145 122.485C695.836 123.052 689.097 118.45 688.341 114.048C687.47 109.046 695.139 104.977 702.983 103.744C712.802 102.176 722.214 103.143 730.871 106.111C737.727 108.479 743.886 107.845 751.09 106.478C757.772 105.211 765.499 105.678 771.6 107.645C774.621 108.612 777.236 109.98 778.979 111.714C779.792 112.514 780.606 113.415 780.78 114.348C780.954 115.249 780.083 116.349 780.896 117.183C782.232 118.483 781.709 120.151 780.257 121.418V121.318Z"
          fill="#FDFEFD"
          fillOpacity="0.5"
        />
        <path
          opacity="0.5"
          d="M911.626 218.56C913.194 218.993 915.576 217.926 916.797 217.359C918.772 216.459 919.934 218.426 920.05 219.193C921.154 226.33 915.867 232.866 907.617 238.035C904.014 240.303 900.296 242.571 896.461 244.738C893.672 246.272 890.825 247.773 887.979 249.24C886.003 250.274 883.272 251.775 880.716 252.308C881.006 251.775 881.646 251.374 882.401 251.008C890.651 246.839 896.403 241.603 901.167 236.034C909.534 226.263 902.736 215.058 890.07 207.522C888.618 206.655 886.991 205.821 884.957 205.587C884.376 205.788 883.911 205.854 883.679 206.021C880.716 208.155 877.811 210.29 874.964 212.457C873.57 213.524 879.205 212.224 885.073 216.259C893.382 221.995 887.281 231.132 880.077 235.101C872.466 239.269 865.493 240.436 858.638 243.371C854.454 245.172 852.014 247.773 853.641 250.741C855.907 254.976 853.757 258.844 849.69 262.413C847.25 264.547 843.357 266.048 839.116 266.715C834.526 267.448 831.214 267.315 828.135 269.716C823.603 273.251 820.059 276.519 812.447 277.986C805.882 279.22 798.736 278.987 791.938 278.72C783.106 278.353 776.192 279.454 768.639 282.021C762.248 284.956 753.301 285.49 754.986 284.156C767.245 279.787 775.088 275.452 778.633 273.051C783.745 269.582 788.51 265.981 792.809 262.213C803.616 252.708 806.812 240.303 802.628 229.231C798.387 217.993 785.779 208.756 769.743 202.686C752.08 195.983 726.574 191.548 706.006 188.947C678.002 185.412 634.194 183.711 594.278 185.412C558.721 186.912 525.661 191.548 519.967 192.448C516.423 193.015 512.24 193.649 508.754 194.316C505.791 194.883 514.506 192.582 515.958 191.481C519.328 188.98 518.05 187.98 522.988 187.146C526.823 186.512 531.762 187.146 534.202 185.345C537.978 182.677 537.746 180.21 536.352 176.308C534.609 171.272 535.945 164.669 545.067 161.501C551.109 159.4 558.721 159.267 565.286 160.167C566.506 160.334 557.384 152.664 569.004 143.66C578.01 136.69 593.116 133.522 608.745 135.023C625.478 136.624 638.086 143.06 654.703 143.693C660.165 143.893 666.498 143.793 671.378 145.561C676.724 147.528 679.745 151.73 679.396 155.298C679.106 158.366 677.944 162.135 680.268 165.103C682.476 167.904 688.169 168.371 692.527 166.87C698.744 164.769 702.23 159.534 704.263 155.799C710.887 143.627 726.226 131.288 750.163 129.921C771.254 128.72 791.705 135.623 802.338 145.894C803.209 146.728 803.674 147.762 805.766 148.229C807.334 148.562 812.273 147.328 814.132 147.061C817.793 146.528 821.337 145.994 825.055 145.694C844.403 144.093 862.763 146.761 876.591 154.932C895.59 166.137 899.076 180.843 891.813 195.45C891.348 196.417 889.141 198.851 889.663 199.785C891.871 203.587 906.745 200.852 910.231 199.351C911.858 198.651 914.24 199.285 914.763 200.519C916.274 204.22 914.589 207.788 912.846 211.357C912.207 212.724 908.604 217.659 911.858 218.56H911.626Z"
          fill="#FDFEFD"
        />
        <path
          d="M459.132 186.545C456.401 186.678 453.729 185.844 451.695 184.51C450.301 183.61 449.371 182.543 448.093 181.642C446.524 180.575 444.142 179.008 442.109 178.341C438.158 177.04 433.161 178.274 431.476 175.64C430.024 173.439 431.244 170.938 433.974 169.27C437.693 167.003 445.246 166.035 449.778 168.003C450.94 168.503 452.683 168.437 454.019 168.67C455.646 168.97 457.157 169.537 458.551 170.104C467.383 173.772 474.064 181.576 462.734 185.844C461.572 186.278 460.41 186.511 459.248 186.545H459.132Z"
          fill="#FDFEFD"
        />
        <path
          d="M588.524 296.959C586.606 296.292 585.212 295.292 584.341 294.124C583.701 293.291 583.76 292.457 584.224 291.557C585.27 289.622 587.943 288.689 591.545 288.789C592.358 287.355 595.089 286.254 598.343 286.421C600.26 286.521 602.003 287.421 603.979 287.421C607.232 287.388 609.963 288.022 612.345 289.222C613.972 290.023 614.96 291.423 617.574 291.923C622.803 290.389 628.207 291.69 632.913 293.524C635.992 294.725 638.607 296.359 642.151 296.959C645.928 297.559 647.38 296.759 650.111 297.192C654.817 297.859 642.848 298.226 639.827 298.326C632.39 298.593 598.924 300.527 588.582 296.959H588.524Z"
          fill="#FDFEFD"
        />
        <path
          d="M724.249 291.796C722.622 292.196 720.995 292.596 719.31 292.93C701.532 296.331 688.691 296.798 673.294 296.665C671.551 296.665 667.833 296.731 665.509 296.531C664.579 296.131 668.646 295.831 671.784 294.03C675.444 291.929 677.826 292.93 679.163 292.296C683.23 290.395 683.288 288.361 688.168 286.994C698.104 284.259 708.678 289.161 718.497 286.727C721.344 286.027 724.423 286.093 727.445 286.594C729.769 286.96 732.151 287.427 734.533 287.527C736.276 287.594 737.961 287.294 740.052 287.161C742.958 286.96 742.841 287.928 734.184 289.261C731.744 289.628 729.536 290.395 727.27 291.029C726.283 291.296 725.295 291.563 724.249 291.829V291.796Z"
          fill="#FDFEFD"
        />
        <path
          d="M662.836 118.753C654.528 120.454 650.693 126.156 659.234 128.924C667.775 131.692 672.133 127.223 670.157 124.922C668.182 122.621 671.261 117.052 662.836 118.786V118.753Z"
          fill="#FDFEFD"
        />
        <path
          d="M324.285 139.931C335.963 143.866 350.023 133.528 372.16 139.264C394.296 145 398.131 148.969 405.916 145.467C413.702 141.966 401.152 122.89 386.453 124.124C371.753 125.358 369.545 130.327 360.482 122.624C351.36 114.92 331.489 121.123 335.382 127.826C335.382 127.826 324.808 126.692 320.566 131.594C316.441 136.363 321.438 138.931 324.343 139.931H324.285Z"
          fill="#FDFEFD"
          fillOpacity="0.5"
        />
        <path
          d="M438.044 147.168C440.716 145.368 439.264 139.165 429.561 139.698C419.858 140.232 431.827 151.304 438.044 147.168Z"
          fill="#FDFEFD"
        />
        <path
          d="M280.825 143.662C273.737 147.563 272.575 157.501 275.015 158.868C277.281 160.169 276.061 153.066 285.938 150.831C295.873 148.631 297.733 145.396 295.292 142.795C293.666 141.06 288.088 139.627 280.825 143.628V143.662Z"
          fill="#FDFEFD"
        />
        <path
          d="M777.35 293.564C750.566 306.803 673.873 314.84 643.312 313.806C643.312 313.806 702.458 316.674 714.718 313.706C726.977 310.738 724.943 305.235 750.566 306.803C776.188 308.37 796.233 284.193 777.35 293.564Z"
          fill="#FDFEFD"
        />
        <path
          opacity="0.9"
          d="M992.573 269.379C999.71 268.576 1006.45 266.368 1013.18 264.093C1014.25 263.736 1015.32 263.357 1016.37 262.956C1032.25 256.934 1050.67 246.027 1055.29 228.452C1056.61 223.478 1056.72 218.504 1055.18 213.553C1051.17 200.661 1039.86 191.427 1027.19 188.037C1024.02 187.19 1020.81 186.788 1017.55 186.721C1011.11 186.61 1003.19 188.55 998.907 193.769C996.766 196.379 995.673 199.368 995.673 202.735C995.673 204.297 996.476 206.549 995.45 207.91C993.398 210.676 990.12 211.032 986.975 210.029C981.287 208.2 975.154 205.39 970.961 211.367C968.083 215.449 966.5 222.251 971.518 225.396C972.968 226.311 974.284 226.779 975.511 228.05C976.603 229.188 977.496 230.481 978.901 231.262C982.871 233.426 987.399 231.976 991.458 231.24C995.138 230.571 999.086 233.359 998.216 237.351C998.216 237.44 998.082 237.485 998.037 237.552C992.863 237.106 988.737 239.024 986.506 243.998C985.592 246.049 985.703 248.213 987.131 250.02C988.491 251.737 990.7 253.276 991.48 255.372C992.015 256.822 991.436 258.227 990.12 258.963C988.625 259.811 986.774 258.428 985.235 259.253C983.741 260.056 982.871 262.108 982.023 263.491C979.391 267.194 976.336 267.35 971.786 267.617C967.013 267.885 963.177 267.015 959.407 266.078C958.582 265.878 957.668 265.521 956.775 265.342C956.218 265.231 957.957 266.123 958.671 266.457C960.723 267.394 963.556 268.286 965.652 268.799C966.366 268.978 967.102 269.134 967.838 269.268C975.912 270.829 984.521 270.294 992.595 269.402L992.573 269.379Z"
          fill="#FDFEFD"
        />
        <path
          opacity="0.5"
          d="M945.266 206.193C945.244 205.858 945.199 205.524 945.177 205.189C944.954 201.888 943.638 199.502 942.099 196.691C940.292 193.435 939.534 189.353 940.292 185.696C941.028 182.172 944.463 181.77 945.556 178.759C949.013 169.191 963.064 168.388 968.261 176.819C969.309 178.514 970.202 178.246 971.874 178.112C976.179 177.733 977.383 185.339 973.614 186.878C967.57 189.331 958.381 187.904 955.392 195.197C953.652 199.457 955.905 202.379 957.399 206.148C958.314 208.445 958.782 210.899 956.73 212.772C954.232 215.047 950.44 213.821 948.032 212.081C946.002 210.609 945.489 208.49 945.266 206.215V206.193Z"
          fill="#FDFEFD"
        />
        <path
          opacity="0.5"
          d="M1062.88 211.724C1062.54 210.832 1062.18 209.895 1062.05 208.958C1061.72 206.393 1063.08 204.988 1065.8 204.877C1066.51 204.854 1067.29 205.055 1067.98 205.345C1072.6 207.263 1074.32 211.657 1073.87 216.363C1073.69 218.348 1073.07 220.177 1071.75 221.671C1065.73 228.474 1068.88 229.099 1068.14 231.82C1067.69 233.448 1066.56 235.121 1064.95 235.857C1063.52 236.526 1061.67 236.37 1061.05 234.719C1060.38 232.957 1061.4 231.24 1062.1 229.679C1062.92 227.76 1063.75 225.82 1064.39 223.835C1065.8 219.62 1064.33 215.672 1062.85 211.724H1062.88Z"
          fill="#FDFEFD"
        />
        <path
          d="M1000.56 275.289C994.425 275.311 988.292 274.709 982.225 273.772C981.578 273.66 980.954 273.504 980.307 273.37C979.727 273.058 982.783 273.549 983.987 273.66C989.719 274.107 994.381 274.486 1000.11 274.196C1007.38 273.817 1014.63 271.988 1021.59 269.289C1023.24 268.664 1025.74 268.553 1027.48 268.308C1028.93 268.107 1031.63 266.01 1033.01 265.52C1034.39 265.007 1037.54 263.936 1038.03 265.988C1038.81 269.267 1031.03 271.653 1029.71 271.988C1019.87 274.419 1008.81 274.976 1004.22 275.199C1002.99 275.266 1001.76 275.289 1000.56 275.289Z"
          fill="#FDFEFD"
        />
        <path
          opacity="0.5"
          d="M986.127 203.585C985.636 204.544 984.231 204.723 983.161 203.63C981.399 201.846 979.614 200.307 976.916 200.82C975.957 200.998 974.953 201.266 973.972 201.132C971.897 200.864 971.139 198.723 972.656 197.296C974.083 195.935 976.313 196.091 977.83 194.842C979.548 193.437 982.514 194.374 983.25 197.206C984.053 200.262 985.659 200.15 986.216 202.046C986.395 202.671 986.35 203.184 986.149 203.585H986.127Z"
          fill="#FDFEFD"
        />
        <path
          d="M955.058 225.351C954.568 224.37 954.189 222.92 954.769 221.894C956.107 219.575 958.962 220.578 959.675 222.786C960.077 224.013 960.322 225.218 961.058 226.31C961.772 227.381 962.709 228.318 963.311 229.455C963.623 230.013 963.601 230.883 963.11 231.351C962.575 231.886 961.861 231.73 961.259 231.463C958.672 230.37 956.308 227.849 955.058 225.374V225.351Z"
          fill="#FDFEFD"
        />
        <path
          d="M1056 199.122C1055.71 199.055 1055.42 198.966 1055.18 198.876C1054.4 198.609 1053.64 198.252 1052.95 197.806C1051.61 196.936 1050.5 195.642 1050.09 194.059C1049.89 193.211 1050.63 192.698 1051.45 192.966C1052.3 193.233 1053.1 193.813 1054 194.036C1054.98 194.304 1055.87 193.969 1057.08 193.858C1057.99 193.769 1059.26 194.081 1059.84 195.218C1060.18 195.865 1060.26 196.713 1059.91 197.36C1059.28 198.453 1058.3 198.363 1057.83 198.676C1057.12 199.166 1056.58 199.233 1056 199.122Z"
          fill="#FDFEFD"
        />
        <path
          d="M983.137 182.775C982.557 181.905 982.423 180.879 983.65 180.478C985.322 179.92 987.33 181.125 987.687 182.82C987.91 183.846 986.884 184.715 985.902 184.559C984.854 184.403 983.873 183.801 983.226 182.931C983.181 182.887 983.159 182.82 983.114 182.775H983.137Z"
          fill="#FDFEFD"
        />
        <path
          d="M973.057 259.544C973.503 259.41 973.927 259.811 973.86 260.28C973.86 260.414 973.77 260.547 973.704 260.681C972.967 262.019 971.473 262.978 970.09 263.514C969.02 263.938 967.86 264.138 966.7 264.116C966.321 264.116 965.206 264.049 965.54 264.004C966.053 263.915 966.544 263.848 967.012 263.714C967.905 263.469 968.73 263.112 969.51 262.577C970.135 262.131 970.849 261.06 971.518 260.414C971.986 259.967 972.388 259.744 973.012 259.588L973.057 259.544Z"
          fill="#FDFEFD"
        />
        <path
          d="M970.495 235.721C969.402 235.721 968.264 234.628 969.134 233.58C969.893 232.665 971.142 233.223 971.677 234.071C972.324 235.119 971.432 235.721 970.495 235.721Z"
          fill="#FDFEFD"
        />
        <path
          d="M1044.41 188.753C1044.81 190.381 1041.11 189.489 1042.2 187.928C1042.85 186.991 1044.21 187.928 1044.41 188.753Z"
          fill="#FDFEFD"
        />
        <mask
          id="path-46-outside-1_2142_7234"
          maskUnits="userSpaceOnUse"
          x="206"
          y="97"
          width="784"
          height="74"
          fill="black"
        >
          <rect fill="white" x="206" y="97" width="784" height="74" />
          <path d="M240.976 163.12C229.856 163.12 220.176 159.12 213.376 152.96L224.096 140.16C230.496 145.52 237.056 148.08 242.976 148.08C245.376 148.08 247.056 147.2 247.056 145.6C247.056 143.84 246.016 143.28 237.856 140.24C227.456 136.4 222.576 132.72 222.576 124.48C222.576 113.68 232.496 104.88 247.776 104.88C257.776 104.88 266.656 108.08 272.736 113.28L262.016 126.08C257.776 122.64 251.776 119.84 245.856 119.84C243.456 119.84 241.776 120.48 241.776 122.08C241.776 123.76 242.976 124.08 250.736 126.96C260.256 130.48 266.336 134.48 266.336 143.04C266.336 154.32 257.056 163.12 240.976 163.12ZM288.411 162L299.211 121.84H282.731L286.971 106H338.651L334.411 121.84H317.931L307.131 162H288.411ZM327.278 162L365.998 105.6H384.558L393.038 162H373.118L372.158 154.48H352.558L347.678 162H327.278ZM360.878 141.2H371.118L369.598 127.6L360.878 141.2ZM404.813 162L419.853 106H441.693C452.013 106 458.573 108.24 462.333 112C465.453 115.12 466.733 119.28 466.733 123.68C466.733 132.4 462.173 139.92 451.133 143.36L458.893 162H438.733L432.493 146H427.853L423.533 162H404.813ZM431.373 132.64H438.173C444.413 132.64 447.693 129.76 447.693 126.24C447.693 125.12 447.293 124.08 446.493 123.28C445.453 122.24 443.613 121.68 440.973 121.68H434.333L431.373 132.64ZM485.392 162L496.192 121.84H479.712L483.952 106H535.632L531.392 121.84H514.912L504.112 162H485.392ZM583.698 162.4L576.098 106H596.658L599.058 137.44L618.418 106H639.458L601.618 162.4H583.698ZM669.389 163.12C652.909 163.12 641.549 152.08 641.549 137.76C641.549 120.4 655.709 104.88 674.509 104.88C690.989 104.88 702.349 115.92 702.349 130.24C702.349 147.6 688.189 163.12 669.389 163.12ZM670.669 146.64C678.509 146.64 683.549 138.96 683.549 131.92C683.549 126 679.949 121.36 673.229 121.36C665.389 121.36 660.349 129.04 660.349 136.08C660.349 142 663.949 146.64 670.669 146.64ZM719.648 162L730.448 121.84H713.968L718.208 106H769.888L765.648 121.84H749.168L738.368 162H719.648ZM769.482 162L784.522 106H803.242L788.202 162H769.482ZM804.878 162L819.918 106H837.438L850.158 132.72L857.358 106H875.918L860.878 162H844.238L830.958 134.16L823.438 162H804.878ZM910.588 163.2C896.668 163.2 882.908 155.84 882.908 138.24C882.908 119.92 897.308 104.8 919.868 104.8C930.428 104.8 939.468 109.36 943.308 114.08L931.628 126.08C928.428 123.12 923.628 121.04 918.668 121.04C908.028 121.04 901.708 128.32 901.708 137.36C901.708 144.32 906.748 147.76 912.588 147.76C914.588 147.76 916.188 147.44 917.468 146.88L919.308 140.88H910.108L913.148 128.88H940.108L932.108 157.44C926.588 160.72 918.668 163.2 910.588 163.2ZM957.159 144.56L958.679 118L961.959 106H982.279L978.999 118L966.279 144.56H957.159ZM947.799 162L951.639 147.6H970.199L966.359 162H947.799Z" />
        </mask>
        <path
          d="M240.976 163.12C229.856 163.12 220.176 159.12 213.376 152.96L224.096 140.16C230.496 145.52 237.056 148.08 242.976 148.08C245.376 148.08 247.056 147.2 247.056 145.6C247.056 143.84 246.016 143.28 237.856 140.24C227.456 136.4 222.576 132.72 222.576 124.48C222.576 113.68 232.496 104.88 247.776 104.88C257.776 104.88 266.656 108.08 272.736 113.28L262.016 126.08C257.776 122.64 251.776 119.84 245.856 119.84C243.456 119.84 241.776 120.48 241.776 122.08C241.776 123.76 242.976 124.08 250.736 126.96C260.256 130.48 266.336 134.48 266.336 143.04C266.336 154.32 257.056 163.12 240.976 163.12ZM288.411 162L299.211 121.84H282.731L286.971 106H338.651L334.411 121.84H317.931L307.131 162H288.411ZM327.278 162L365.998 105.6H384.558L393.038 162H373.118L372.158 154.48H352.558L347.678 162H327.278ZM360.878 141.2H371.118L369.598 127.6L360.878 141.2ZM404.813 162L419.853 106H441.693C452.013 106 458.573 108.24 462.333 112C465.453 115.12 466.733 119.28 466.733 123.68C466.733 132.4 462.173 139.92 451.133 143.36L458.893 162H438.733L432.493 146H427.853L423.533 162H404.813ZM431.373 132.64H438.173C444.413 132.64 447.693 129.76 447.693 126.24C447.693 125.12 447.293 124.08 446.493 123.28C445.453 122.24 443.613 121.68 440.973 121.68H434.333L431.373 132.64ZM485.392 162L496.192 121.84H479.712L483.952 106H535.632L531.392 121.84H514.912L504.112 162H485.392ZM583.698 162.4L576.098 106H596.658L599.058 137.44L618.418 106H639.458L601.618 162.4H583.698ZM669.389 163.12C652.909 163.12 641.549 152.08 641.549 137.76C641.549 120.4 655.709 104.88 674.509 104.88C690.989 104.88 702.349 115.92 702.349 130.24C702.349 147.6 688.189 163.12 669.389 163.12ZM670.669 146.64C678.509 146.64 683.549 138.96 683.549 131.92C683.549 126 679.949 121.36 673.229 121.36C665.389 121.36 660.349 129.04 660.349 136.08C660.349 142 663.949 146.64 670.669 146.64ZM719.648 162L730.448 121.84H713.968L718.208 106H769.888L765.648 121.84H749.168L738.368 162H719.648ZM769.482 162L784.522 106H803.242L788.202 162H769.482ZM804.878 162L819.918 106H837.438L850.158 132.72L857.358 106H875.918L860.878 162H844.238L830.958 134.16L823.438 162H804.878ZM910.588 163.2C896.668 163.2 882.908 155.84 882.908 138.24C882.908 119.92 897.308 104.8 919.868 104.8C930.428 104.8 939.468 109.36 943.308 114.08L931.628 126.08C928.428 123.12 923.628 121.04 918.668 121.04C908.028 121.04 901.708 128.32 901.708 137.36C901.708 144.32 906.748 147.76 912.588 147.76C914.588 147.76 916.188 147.44 917.468 146.88L919.308 140.88H910.108L913.148 128.88H940.108L932.108 157.44C926.588 160.72 918.668 163.2 910.588 163.2ZM957.159 144.56L958.679 118L961.959 106H982.279L978.999 118L966.279 144.56H957.159ZM947.799 162L951.639 147.6H970.199L966.359 162H947.799Z"
          fill="url(#paint2_linear_2142_7234)"
        />
        <path
          d="M213.376 152.96L208.01 148.466C205.595 151.348 205.89 155.623 208.677 158.148L213.376 152.96ZM224.096 140.16L228.591 134.793C225.627 132.311 221.212 132.702 218.73 135.666L224.096 140.16ZM237.856 140.24L240.3 133.68C240.294 133.678 240.287 133.676 240.281 133.673L237.856 140.24ZM272.736 113.28L278.103 117.774C280.567 114.832 280.203 110.455 277.286 107.96L272.736 113.28ZM262.016 126.08L257.606 131.516C260.575 133.925 264.928 133.506 267.383 130.574L262.016 126.08ZM250.736 126.96L248.301 133.523L248.309 133.526L250.736 126.96ZM240.976 156.12C231.543 156.12 223.551 152.732 218.076 147.772L208.677 158.148C216.801 165.508 228.17 170.12 240.976 170.12V156.12ZM218.743 157.454L229.463 144.654L218.73 135.666L208.01 148.466L218.743 157.454ZM219.602 145.527C226.922 151.657 235.018 155.08 242.976 155.08V141.08C239.094 141.08 234.07 139.383 228.591 134.793L219.602 145.527ZM242.976 155.08C244.886 155.08 247.273 154.753 249.443 153.486C251.891 152.058 254.056 149.343 254.056 145.6H240.056C240.056 144.714 240.307 143.762 240.845 142.914C241.357 142.106 241.972 141.637 242.389 141.394C243.12 140.967 243.467 141.08 242.976 141.08V155.08ZM254.056 145.6C254.056 144.424 253.875 142.547 252.642 140.643C251.542 138.943 250.057 137.939 249.02 137.34C247.106 136.234 244.13 135.107 240.3 133.68L235.412 146.8C237.454 147.56 238.958 148.132 240.094 148.595C241.274 149.076 241.804 149.34 242.013 149.46C242.256 149.601 241.541 149.257 240.89 148.252C240.107 147.043 240.056 145.896 240.056 145.6H254.056ZM240.281 133.673C235.203 131.798 232.577 130.323 231.175 128.971C230.196 128.027 229.576 126.953 229.576 124.48H215.576C215.576 130.247 217.397 135.133 221.457 139.049C225.095 142.557 230.109 144.842 235.432 146.807L240.281 133.673ZM229.576 124.48C229.576 118.861 234.9 111.88 247.776 111.88V97.88C230.092 97.88 215.576 108.499 215.576 124.48H229.576ZM247.776 111.88C256.349 111.88 263.547 114.631 268.186 118.6L277.286 107.96C269.766 101.529 259.203 97.88 247.776 97.88V111.88ZM267.37 108.786L256.65 121.586L267.383 130.574L278.103 117.774L267.37 108.786ZM266.427 120.644C261.321 116.501 253.813 112.84 245.856 112.84V126.84C249.74 126.84 254.232 128.779 257.606 131.516L266.427 120.644ZM245.856 112.84C244.239 112.84 241.938 113.023 239.786 114.099C238.626 114.679 237.315 115.617 236.299 117.102C235.245 118.643 234.776 120.385 234.776 122.08H248.776C248.776 122.975 248.518 124.037 247.853 125.008C247.227 125.923 246.486 126.401 246.047 126.621C245.335 126.977 245.074 126.84 245.856 126.84V112.84ZM234.776 122.08C234.776 123.433 235.047 125.431 236.488 127.35C237.692 128.953 239.237 129.83 240.157 130.301C241.909 131.198 244.76 132.208 248.301 133.523L253.172 120.397C251.183 119.659 249.725 119.126 248.567 118.682C247.373 118.224 246.805 117.977 246.535 117.839C246.185 117.66 246.946 117.962 247.682 118.943C248.104 119.504 248.413 120.144 248.594 120.805C248.762 121.416 248.776 121.89 248.776 122.08H234.776ZM248.309 133.526C252.898 135.223 255.701 136.719 257.35 138.246C258.649 139.449 259.336 140.736 259.336 143.04H273.336C273.336 136.784 270.984 131.791 266.863 127.974C263.092 124.481 258.094 122.217 253.164 120.394L248.309 133.526ZM259.336 143.04C259.336 146.631 257.918 149.671 255.204 151.933C252.406 154.266 247.775 156.12 240.976 156.12V170.12C250.257 170.12 258.306 167.574 264.169 162.687C270.115 157.729 273.336 150.729 273.336 143.04H259.336ZM288.411 162L281.651 160.182C281.085 162.285 281.531 164.531 282.855 166.259C284.18 167.987 286.233 169 288.411 169V162ZM299.211 121.84L305.97 123.658C306.536 121.555 306.091 119.309 304.766 117.581C303.441 115.853 301.388 114.84 299.211 114.84V121.84ZM282.731 121.84L275.969 120.03C275.406 122.132 275.853 124.376 277.178 126.102C278.503 127.828 280.555 128.84 282.731 128.84V121.84ZM286.971 106V99C283.802 99 281.028 101.129 280.209 104.19L286.971 106ZM338.651 106L345.413 107.81C345.975 105.708 345.528 103.464 344.204 101.738C342.879 100.012 340.827 99 338.651 99V106ZM334.411 121.84V128.84C337.58 128.84 340.353 126.711 341.173 123.65L334.411 121.84ZM317.931 121.84V114.84C314.765 114.84 311.993 116.965 311.171 120.022L317.931 121.84ZM307.131 162V169C310.297 169 313.068 166.875 313.89 163.818L307.131 162ZM295.17 163.818L305.97 123.658L292.451 120.022L281.651 160.182L295.17 163.818ZM299.211 114.84H282.731V128.84H299.211V114.84ZM289.493 123.65L293.733 107.81L280.209 104.19L275.969 120.03L289.493 123.65ZM286.971 113H338.651V99H286.971V113ZM331.889 104.19L327.649 120.03L341.173 123.65L345.413 107.81L331.889 104.19ZM334.411 114.84H317.931V128.84H334.411V114.84ZM311.171 120.022L300.371 160.182L313.89 163.818L324.69 123.658L311.171 120.022ZM307.131 155H288.411V169H307.131V155ZM327.278 162L321.507 158.038C320.036 160.181 319.873 162.961 321.084 165.261C322.295 167.56 324.679 169 327.278 169V162ZM365.998 105.6V98.6C363.691 98.6 361.533 99.7364 360.227 101.638L365.998 105.6ZM384.558 105.6L391.48 104.559C390.965 101.134 388.022 98.6 384.558 98.6V105.6ZM393.038 162V169C395.076 169 397.013 168.112 398.343 166.567C399.673 165.022 400.263 162.975 399.96 160.959L393.038 162ZM373.118 162L366.174 162.886C366.621 166.381 369.595 169 373.118 169V162ZM372.158 154.48L379.102 153.594C378.656 150.099 375.681 147.48 372.158 147.48V154.48ZM352.558 154.48V147.48C350.187 147.48 347.977 148.68 346.686 150.669L352.558 154.48ZM347.678 162V169C350.049 169 352.259 167.8 353.55 165.811L347.678 162ZM360.878 141.2L354.985 137.422C353.604 139.576 353.508 142.312 354.736 144.558C355.964 146.803 358.319 148.2 360.878 148.2V141.2ZM371.118 141.2V148.2C373.11 148.2 375.008 147.351 376.336 145.867C377.663 144.382 378.296 142.402 378.075 140.422L371.118 141.2ZM369.598 127.6L376.555 126.822C376.226 123.877 374.077 121.458 371.19 120.783C368.304 120.109 365.305 121.326 363.705 123.822L369.598 127.6ZM333.049 165.962L371.769 109.562L360.227 101.638L321.507 158.038L333.049 165.962ZM365.998 112.6H384.558V98.6H365.998V112.6ZM377.636 106.641L386.116 163.041L399.96 160.959L391.48 104.559L377.636 106.641ZM393.038 155H373.118V169H393.038V155ZM380.062 161.114L379.102 153.594L365.214 155.366L366.174 162.886L380.062 161.114ZM372.158 147.48H352.558V161.48H372.158V147.48ZM346.686 150.669L341.806 158.189L353.55 165.811L358.43 158.291L346.686 150.669ZM347.678 155H327.278V169H347.678V155ZM360.878 148.2H371.118V134.2H360.878V148.2ZM378.075 140.422L376.555 126.822L362.641 128.378L364.161 141.978L378.075 140.422ZM363.705 123.822L354.985 137.422L366.771 144.978L375.491 131.378L363.705 123.822ZM404.812 162L398.052 160.184C397.487 162.287 397.933 164.532 399.258 166.26C400.583 167.987 402.636 169 404.812 169V162ZM419.853 106V99C416.686 99 413.913 101.126 413.092 104.184L419.853 106ZM462.333 112L457.383 116.95L457.383 116.95L462.333 112ZM451.133 143.36L449.05 136.677C447.17 137.263 445.624 138.613 444.791 140.397C443.957 142.18 443.913 144.233 444.67 146.05L451.133 143.36ZM458.893 162V169C461.233 169 463.418 167.831 464.716 165.884C466.015 163.937 466.254 161.47 465.355 159.31L458.893 162ZM438.732 162L432.211 164.543C433.259 167.231 435.848 169 438.732 169V162ZM432.493 146L439.014 143.457C437.966 140.769 435.377 139 432.493 139V146ZM427.853 146V139C424.689 139 421.919 141.121 421.094 144.175L427.853 146ZM423.533 162V169C426.696 169 429.466 166.879 430.291 163.825L423.533 162ZM431.372 132.64L424.615 130.815C424.047 132.918 424.49 135.166 425.815 136.896C427.139 138.626 429.194 139.64 431.372 139.64V132.64ZM446.493 123.28L451.442 118.33V118.33L446.493 123.28ZM434.333 121.68V114.68C431.169 114.68 428.399 116.801 427.575 119.855L434.333 121.68ZM411.573 163.816L426.613 107.816L413.092 104.184L398.052 160.184L411.573 163.816ZM419.853 113H441.693V99H419.853V113ZM441.693 113C451.268 113 455.555 115.122 457.383 116.95L467.282 107.05C461.59 101.358 452.757 99 441.693 99V113ZM457.383 116.95C458.865 118.432 459.732 120.619 459.732 123.68H473.733C473.733 117.941 472.04 111.808 467.282 107.05L457.383 116.95ZM459.732 123.68C459.732 126.798 458.932 129.33 457.449 131.332C455.968 133.33 453.424 135.314 449.05 136.677L453.215 150.043C459.881 147.966 465.137 144.47 468.696 139.668C472.253 134.87 473.733 129.282 473.733 123.68H459.732ZM444.67 146.05L452.43 164.69L465.355 159.31L457.595 140.67L444.67 146.05ZM458.893 155H438.732V169H458.893V155ZM445.254 159.457L439.014 143.457L425.971 148.543L432.211 164.543L445.254 159.457ZM432.493 139H427.853V153H432.493V139ZM421.094 144.175L416.775 160.175L430.291 163.825L434.611 147.825L421.094 144.175ZM423.533 155H404.812V169H423.533V155ZM431.372 139.64H438.173V125.64H431.372V139.64ZM438.173 139.64C442.285 139.64 446.247 138.699 449.381 136.427C452.667 134.045 454.693 130.4 454.693 126.24H440.693C440.693 126.008 440.753 125.72 440.896 125.45C441.035 125.187 441.176 125.084 441.164 125.093C441.098 125.141 440.3 125.64 438.173 125.64V139.64ZM454.693 126.24C454.693 123.388 453.641 120.529 451.442 118.33L441.543 128.23C441.272 127.959 441.045 127.62 440.893 127.24C440.743 126.865 440.693 126.518 440.693 126.24H454.693ZM451.442 118.33C448.424 115.312 444.248 114.68 440.973 114.68V128.68C441.389 128.68 441.711 128.702 441.95 128.732C442.19 128.761 442.32 128.794 442.361 128.807C442.46 128.836 442.05 128.737 441.543 128.23L451.442 118.33ZM440.973 114.68H434.333V128.68H440.973V114.68ZM427.575 119.855L424.615 130.815L438.13 134.465L441.09 123.505L427.575 119.855ZM485.392 162L478.632 160.182C478.067 162.285 478.512 164.531 479.836 166.259C481.161 167.987 483.215 169 485.392 169V162ZM496.192 121.84L502.952 123.658C503.517 121.555 503.072 119.309 501.747 117.581C500.423 115.853 498.369 114.84 496.192 114.84V121.84ZM479.712 121.84L472.95 120.03C472.387 122.132 472.834 124.376 474.159 126.102C475.484 127.828 477.536 128.84 479.712 128.84V121.84ZM483.952 106V99C480.783 99 478.009 101.129 477.19 104.19L483.952 106ZM535.632 106L542.394 107.81C542.956 105.708 542.51 103.464 541.185 101.738C539.86 100.012 537.808 99 535.632 99V106ZM531.392 121.84V128.84C534.561 128.84 537.334 126.711 538.154 123.65L531.392 121.84ZM514.912 121.84V114.84C511.746 114.84 508.974 116.965 508.152 120.022L514.912 121.84ZM504.112 162V169C507.278 169 510.05 166.875 510.872 163.818L504.112 162ZM492.152 163.818L502.952 123.658L489.432 120.022L478.632 160.182L492.152 163.818ZM496.192 114.84H479.712V128.84H496.192V114.84ZM486.474 123.65L490.714 107.81L477.19 104.19L472.95 120.03L486.474 123.65ZM483.952 113H535.632V99H483.952V113ZM528.87 104.19L524.63 120.03L538.154 123.65L542.394 107.81L528.87 104.19ZM531.392 114.84H514.912V128.84H531.392V114.84ZM508.152 120.022L497.352 160.182L510.872 163.818L521.672 123.658L508.152 120.022ZM504.112 155H485.392V169H504.112V155ZM583.698 162.4L576.761 163.335C577.229 166.808 580.193 169.4 583.698 169.4V162.4ZM576.098 106V99C574.079 99 572.157 99.8722 570.828 101.393C569.499 102.913 568.891 104.933 569.161 106.935L576.098 106ZM596.658 106L603.638 105.467C603.359 101.818 600.317 99 596.658 99V106ZM599.058 137.44L592.078 137.973C592.309 140.997 594.461 143.528 597.409 144.243C600.356 144.958 603.428 143.693 605.019 141.11L599.058 137.44ZM618.418 106V99C615.988 99 613.732 100.26 612.458 102.33L618.418 106ZM639.458 106L645.271 109.9C646.711 107.753 646.851 104.987 645.635 102.706C644.418 100.425 642.043 99 639.458 99V106ZM601.618 162.4V169.4C603.951 169.4 606.131 168.238 607.431 166.3L601.618 162.4ZM590.635 161.465L583.035 105.065L569.161 106.935L576.761 163.335L590.635 161.465ZM576.098 113H596.658V99H576.098V113ZM589.678 106.533L592.078 137.973L606.038 136.907L603.638 105.467L589.678 106.533ZM605.019 141.11L624.379 109.67L612.458 102.33L593.098 133.77L605.019 141.11ZM618.418 113H639.458V99H618.418V113ZM633.645 102.1L595.805 158.5L607.431 166.3L645.271 109.9L633.645 102.1ZM601.618 155.4H583.698V169.4H601.618V155.4ZM669.389 156.12C656.278 156.12 648.549 147.735 648.549 137.76H634.549C634.549 156.425 649.541 170.12 669.389 170.12V156.12ZM648.549 137.76C648.549 124.088 659.751 111.88 674.509 111.88V97.88C651.668 97.88 634.549 116.712 634.549 137.76H648.549ZM674.509 111.88C687.621 111.88 695.349 120.265 695.349 130.24H709.349C709.349 111.575 694.358 97.88 674.509 97.88V111.88ZM695.349 130.24C695.349 143.912 684.148 156.12 669.389 156.12V170.12C692.231 170.12 709.349 151.288 709.349 130.24H695.349ZM670.669 153.64C677.084 153.64 682.195 150.443 685.515 146.293C688.764 142.232 690.549 137.004 690.549 131.92H676.549C676.549 133.876 675.815 136.008 674.583 137.547C673.423 138.997 672.095 139.64 670.669 139.64V153.64ZM690.549 131.92C690.549 127.574 689.219 123.129 686.072 119.692C682.842 116.166 678.296 114.36 673.229 114.36V128.36C674.882 128.36 675.497 128.874 675.747 129.148C676.08 129.511 676.549 130.346 676.549 131.92H690.549ZM673.229 114.36C666.815 114.36 661.703 117.557 658.383 121.707C655.135 125.768 653.349 130.996 653.349 136.08H667.349C667.349 134.124 668.084 131.992 669.315 130.453C670.475 129.003 671.804 128.36 673.229 128.36V114.36ZM653.349 136.08C653.349 140.426 654.68 144.871 657.827 148.308C661.057 151.834 665.602 153.64 670.669 153.64V139.64C669.016 139.64 668.402 139.126 668.152 138.852C667.819 138.489 667.349 137.654 667.349 136.08H653.349ZM719.648 162L712.888 160.182C712.323 162.285 712.768 164.531 714.093 166.259C715.417 167.987 717.471 169 719.648 169V162ZM730.448 121.84L737.208 123.658C737.773 121.555 737.328 119.309 736.004 117.581C734.679 115.853 732.625 114.84 730.448 114.84V121.84ZM713.968 121.84L707.206 120.03C706.644 122.132 707.09 124.376 708.415 126.102C709.74 127.828 711.792 128.84 713.968 128.84V121.84ZM718.208 106V99C715.039 99 712.266 101.129 711.446 104.19L718.208 106ZM769.888 106L776.65 107.81C777.213 105.708 776.766 103.464 775.441 101.738C774.116 100.012 772.064 99 769.888 99V106ZM765.648 121.84V128.84C768.817 128.84 771.591 126.711 772.41 123.65L765.648 121.84ZM749.168 121.84V114.84C746.002 114.84 743.23 116.965 742.408 120.022L749.168 121.84ZM738.368 162V169C741.534 169 744.306 166.875 745.128 163.818L738.368 162ZM726.408 163.818L737.208 123.658L723.688 120.022L712.888 160.182L726.408 163.818ZM730.448 114.84H713.968V128.84H730.448V114.84ZM720.73 123.65L724.97 107.81L711.446 104.19L707.206 120.03L720.73 123.65ZM718.208 113H769.888V99H718.208V113ZM763.126 104.19L758.886 120.03L772.41 123.65L776.65 107.81L763.126 104.19ZM765.648 114.84H749.168V128.84H765.648V114.84ZM742.408 120.022L731.608 160.182L745.128 163.818L755.928 123.658L742.408 120.022ZM738.368 155H719.648V169H738.368V155ZM769.482 162L762.721 160.184C762.157 162.287 762.602 164.532 763.927 166.26C765.252 167.987 767.305 169 769.482 169V162ZM784.522 106V99C781.355 99 778.583 101.126 777.761 104.184L784.522 106ZM803.242 106L810.002 107.816C810.567 105.713 810.121 103.468 808.797 101.74C807.472 100.013 805.419 99 803.242 99V106ZM788.202 162V169C791.369 169 794.141 166.874 794.962 163.816L788.202 162ZM776.242 163.816L791.282 107.816L777.761 104.184L762.721 160.184L776.242 163.816ZM784.522 113H803.242V99H784.522V113ZM796.481 104.184L781.441 160.184L794.962 163.816L810.002 107.816L796.481 104.184ZM788.202 155H769.482V169H788.202V155ZM804.878 162L798.118 160.184C797.553 162.287 797.999 164.532 799.323 166.26C800.648 167.987 802.701 169 804.878 169V162ZM819.918 106V99C816.751 99 813.979 101.126 813.158 104.184L819.918 106ZM837.438 106L843.758 102.991C842.598 100.553 840.138 99 837.438 99V106ZM850.158 132.72L843.838 135.729C845.097 138.375 847.872 139.956 850.791 139.691C853.71 139.426 856.154 137.371 856.917 134.541L850.158 132.72ZM857.358 106V99C854.194 99 851.423 101.123 850.599 104.179L857.358 106ZM875.918 106L882.679 107.816C883.243 105.713 882.798 103.468 881.473 101.74C880.148 100.013 878.095 99 875.918 99V106ZM860.878 162V169C864.045 169 866.817 166.874 867.639 163.816L860.878 162ZM844.238 162L837.92 165.014C839.082 167.449 841.54 169 844.238 169V162ZM830.958 134.16L837.276 131.146C836.015 128.503 833.241 126.924 830.325 127.189C827.408 127.454 824.964 129.507 824.2 132.335L830.958 134.16ZM823.438 162V169C826.601 169 829.371 166.879 830.196 163.825L823.438 162ZM811.639 163.816L826.679 107.816L813.158 104.184L798.118 160.184L811.639 163.816ZM819.918 113H837.438V99H819.918V113ZM831.118 109.009L843.838 135.729L856.478 129.711L843.758 102.991L831.118 109.009ZM856.917 134.541L864.117 107.821L850.599 104.179L843.399 130.899L856.917 134.541ZM857.358 113H875.918V99H857.358V113ZM869.158 104.184L854.118 160.184L867.639 163.816L882.679 107.816L869.158 104.184ZM860.878 155H844.238V169H860.878V155ZM850.556 158.986L837.276 131.146L824.64 137.174L837.92 165.014L850.556 158.986ZM824.2 132.335L816.68 160.175L830.196 163.825L837.716 135.985L824.2 132.335ZM823.438 155H804.878V169H823.438V155ZM943.307 114.08L948.324 118.962C950.802 116.417 950.98 112.418 948.737 109.662L943.307 114.08ZM931.628 126.08L926.874 131.219C929.661 133.797 933.996 133.683 936.644 130.962L931.628 126.08ZM917.468 146.88L920.273 153.293C922.142 152.475 923.562 150.883 924.16 148.932L917.468 146.88ZM919.307 140.88L926 142.932C926.651 140.81 926.256 138.504 924.936 136.719C923.616 134.933 921.528 133.88 919.307 133.88V140.88ZM910.107 140.88L903.322 139.161C902.792 141.254 903.257 143.475 904.583 145.179C905.91 146.883 907.948 147.88 910.107 147.88V140.88ZM913.148 128.88V121.88C909.944 121.88 907.149 124.055 906.362 127.161L913.148 128.88ZM940.107 128.88L946.848 130.768C947.439 128.659 947.008 126.395 945.685 124.65C944.362 122.905 942.298 121.88 940.107 121.88V128.88ZM932.107 157.44L935.683 163.458C937.23 162.539 938.363 161.06 938.848 159.328L932.107 157.44ZM910.588 156.2C904.744 156.2 899.473 154.64 895.832 151.8C892.432 149.148 889.907 144.985 889.907 138.24H875.907C875.907 149.095 880.263 157.412 887.223 162.84C893.942 168.08 902.511 170.2 910.588 170.2V156.2ZM889.907 138.24C889.907 124.151 900.799 111.8 919.867 111.8V97.8C893.816 97.8 875.907 115.689 875.907 138.24H889.907ZM919.867 111.8C928.764 111.8 935.623 115.727 937.878 118.498L948.737 109.662C943.312 102.993 932.091 97.8 919.867 97.8V111.8ZM938.291 109.198L926.611 121.198L936.644 130.962L948.324 118.962L938.291 109.198ZM936.381 120.941C931.947 116.84 925.47 114.04 918.667 114.04V128.04C921.785 128.04 924.908 129.4 926.874 131.219L936.381 120.941ZM918.667 114.04C911.687 114.04 905.581 116.467 901.214 120.894C896.881 125.286 894.708 131.195 894.708 137.36H908.708C908.708 134.485 909.694 132.234 911.181 130.726C912.634 129.253 915.008 128.04 918.667 128.04V114.04ZM894.708 137.36C894.708 142.67 896.703 147.27 900.365 150.453C903.887 153.514 908.356 154.76 912.588 154.76V140.76C910.979 140.76 910.008 140.286 909.55 139.887C909.232 139.61 908.708 139.01 908.708 137.36H894.708ZM912.588 154.76C915.321 154.76 917.918 154.324 920.273 153.293L914.662 140.467C914.457 140.556 913.854 140.76 912.588 140.76V154.76ZM924.16 148.932L926 142.932L912.615 138.828L910.775 144.828L924.16 148.932ZM919.307 133.88H910.107V147.88H919.307V133.88ZM916.893 142.599L919.933 130.599L906.362 127.161L903.322 139.161L916.893 142.599ZM913.148 135.88H940.107V121.88H913.148V135.88ZM933.367 126.992L925.367 155.552L938.848 159.328L946.848 130.768L933.367 126.992ZM928.532 151.422C924.053 154.083 917.363 156.2 910.588 156.2V170.2C919.972 170.2 929.122 167.357 935.683 163.458L928.532 151.422ZM957.159 144.56L950.17 144.16C950.06 146.083 950.747 147.966 952.07 149.366C953.392 150.766 955.233 151.56 957.159 151.56V144.56ZM958.679 118L951.926 116.154C951.797 116.627 951.718 117.111 951.69 117.6L958.679 118ZM961.959 106V99C958.804 99 956.038 101.111 955.206 104.154L961.959 106ZM982.279 106L989.031 107.846C989.607 105.74 989.167 103.487 987.843 101.753C986.519 100.018 984.461 99 982.279 99V106ZM978.999 118L985.312 121.024C985.493 120.645 985.64 120.251 985.751 119.846L978.999 118ZM966.279 144.56V151.56C968.973 151.56 971.428 150.014 972.592 147.584L966.279 144.56ZM947.799 162L941.035 160.196C940.475 162.298 940.923 164.54 942.248 166.265C943.573 167.989 945.624 169 947.799 169V162ZM951.639 147.6V140.6C948.467 140.6 945.692 142.732 944.875 145.796L951.639 147.6ZM970.199 147.6L976.962 149.404C977.523 147.302 977.075 145.06 975.75 143.335C974.425 141.611 972.374 140.6 970.199 140.6V147.6ZM966.359 162V169C969.53 169 972.305 166.868 973.122 163.804L966.359 162ZM964.147 144.96L965.667 118.4L951.69 117.6L950.17 144.16L964.147 144.96ZM965.431 119.846L968.711 107.846L955.206 104.154L951.926 116.154L965.431 119.846ZM961.959 113H982.279V99H961.959V113ZM975.526 104.154L972.246 116.154L985.751 119.846L989.031 107.846L975.526 104.154ZM972.685 114.976L959.965 141.536L972.592 147.584L985.312 121.024L972.685 114.976ZM966.279 137.56H957.159V151.56H966.279V137.56ZM954.562 163.804L958.402 149.404L944.875 145.796L941.035 160.196L954.562 163.804ZM951.639 154.6H970.199V140.6H951.639V154.6ZM963.435 145.796L959.595 160.196L973.122 163.804L976.962 149.404L963.435 145.796ZM966.359 155H947.799V169H966.359V155Z"
          fill="black"
          mask="url(#path-46-outside-1_2142_7234)"
        />
        <path
          d="M294.396 294.393C294.396 294.393 282.42 293.443 275.504 290.219C250.276 278.44 197.802 215.811 177.611 231.509C159.624 245.491 194.808 265.108 194.808 265.108C194.808 265.108 181.069 259.45 184.457 271.554C176.311 267.31 165.125 265.896 162.015 271.878C158.905 277.837 161.319 281.594 162.966 285.35C164.104 287.993 162.525 291.379 158.812 291.959C156.004 292.399 149.343 294.069 149.343 294.069L294.396 294.416V294.393Z"
          fill="white"
        />
      </g>
      <g filter="url(#filter0_b_2142_7234)">
        <path
          d="M270.087 194.855C271.894 191.843 275.149 190 278.662 190H951.338C959.111 190 963.912 198.48 959.913 205.145L941.913 235.145C940.106 238.157 936.851 240 933.338 240H260.662C252.889 240 248.088 231.52 252.087 224.855L270.087 194.855Z"
          fill="#11202B"
          fillOpacity="0.9"
        />
        <path
          d="M270.516 195.112C272.233 192.251 275.325 190.5 278.662 190.5H951.338C958.722 190.5 963.283 198.556 959.484 204.888L941.484 234.888C939.767 237.749 936.675 239.5 933.338 239.5H260.662C253.278 239.5 248.717 231.444 252.516 225.112L270.516 195.112Z"
          stroke="#00FFD1"
        />
      </g>
      <path
        d="M398.113 222.524L399.625 225.506L402.677 222.524H403.881L400.017 226.206L402.019 230H400.983L399.387 226.822L396.111 230H394.907L398.981 226.122L397.063 222.524H398.113ZM411.283 230L409.197 225.926H408.861H406.257L405.165 230H404.185L406.915 219.808H410.583C411.843 219.808 412.781 220.116 413.397 220.732C413.831 221.166 414.055 221.768 414.055 222.44C414.055 223.322 413.719 224.05 413.145 224.61C412.417 225.338 411.311 225.674 410.247 225.828L412.417 230H411.283ZM406.481 225.044H409.379C410.821 225.044 411.815 224.666 412.417 224.064C412.851 223.63 413.061 223.112 413.061 222.51C413.061 222.034 412.921 221.656 412.627 221.362C412.193 220.928 411.549 220.704 410.541 220.704H407.657L406.481 225.044ZM421.977 226.584H415.985C415.971 226.71 415.971 226.85 415.971 226.976C415.971 228.376 416.867 229.356 418.267 229.356C419.289 229.356 420.031 228.978 420.745 228.418L421.249 229.048C420.465 229.706 419.555 230.168 418.211 230.168C416.307 230.168 415.005 228.866 415.005 227.004C415.005 225.758 415.537 224.512 416.433 223.616C417.217 222.832 418.211 222.342 419.345 222.342C421.235 222.342 422.215 223.658 422.215 225.212C422.215 225.702 422.131 226.164 421.977 226.584ZM417.133 224.106C416.643 224.596 416.335 225.17 416.125 225.828H421.221C421.263 225.702 421.277 225.506 421.277 225.24C421.277 224.12 420.661 223.168 419.303 223.168C418.449 223.168 417.693 223.546 417.133 224.106ZM423.728 230L425.52 223.364H424.456L424.694 222.524H425.744L425.996 221.558C426.178 220.844 426.43 220.382 426.822 220.004C427.242 219.57 427.802 219.36 428.488 219.36C429.062 219.36 429.58 219.472 429.986 219.682L429.762 220.508C429.3 220.284 428.936 220.186 428.488 220.186C427.718 220.186 427.172 220.648 426.892 221.712L426.668 222.524H429.23L429.006 223.364H426.458L424.666 230H423.728ZM436.745 230.07L435.093 219.808H436.129L437.459 228.838L443.647 219.808H444.753L437.613 230.07H436.745ZM448.263 222.342C450.279 222.342 451.637 223.756 451.637 225.688C451.637 226.878 451.119 228.012 450.279 228.852C449.481 229.65 448.389 230.168 447.213 230.168C445.197 230.168 443.839 228.768 443.839 226.836C443.839 225.646 444.343 224.512 445.183 223.672C446.009 222.874 447.087 222.342 448.263 222.342ZM447.283 229.328C448.137 229.328 448.935 228.922 449.537 228.32C450.223 227.648 450.657 226.71 450.657 225.716C450.657 224.106 449.649 223.196 448.179 223.196C447.339 223.196 446.527 223.588 445.925 224.19C445.239 224.876 444.819 225.814 444.819 226.808C444.819 228.418 445.827 229.328 447.283 229.328ZM455.472 230.126C454.422 230.126 453.666 229.664 453.666 228.656C453.666 228.39 453.708 228.11 453.764 227.9L454.982 223.364H453.918L454.142 222.524H455.206L455.822 220.2H456.774L456.144 222.524H458.594L458.37 223.364H455.92L454.716 227.872C454.674 228.054 454.632 228.292 454.632 228.46C454.632 229.02 455.066 229.286 455.752 229.286C456.046 229.286 456.41 229.202 456.844 229.048L456.606 229.916C456.2 230.07 455.878 230.126 455.472 230.126ZM458.885 230L460.887 222.524H461.825L459.823 230H458.885ZM461.293 220.746L461.587 219.612H462.693L462.399 220.746H461.293ZM462.696 230L464.698 222.524H465.636L465.3 223.812C466.014 222.986 466.812 222.342 468.002 222.342C469.444 222.342 470.41 223.28 470.41 224.694C470.41 225.03 470.34 225.422 470.242 225.8L469.136 230H468.198L469.332 225.744C469.402 225.478 469.444 225.128 469.444 224.862C469.444 223.812 468.786 223.196 467.666 223.196C466.448 223.196 465.188 224.26 464.768 225.772L463.648 230H462.696ZM474.966 232.352C473.608 232.352 472.264 231.862 471.354 231.022L471.984 230.35C472.768 231.064 473.79 231.526 474.966 231.526C475.974 231.526 476.674 231.218 477.164 230.728C477.626 230.238 477.906 229.664 478.13 228.866L478.368 228.026C477.598 228.81 476.688 229.44 475.4 229.44C473.832 229.44 472.334 228.376 472.334 226.57C472.334 225.352 472.824 224.358 473.566 223.616C474.364 222.818 475.442 222.342 476.548 222.342C478.214 222.342 478.942 223.28 479.362 224.232L479.824 222.524H480.762L479.04 228.992C478.718 230.112 478.382 230.77 477.836 231.288C477.122 232.002 476.24 232.352 474.966 232.352ZM475.638 228.6C476.548 228.6 477.416 228.208 478.046 227.55C478.648 226.976 479.012 226.22 479.012 225.436C479.012 224.302 478.088 223.21 476.562 223.21C475.722 223.21 474.896 223.546 474.294 224.162C473.72 224.736 473.328 225.52 473.328 226.472C473.328 227.872 474.462 228.6 475.638 228.6ZM492.068 230L492.432 228.642C491.704 229.496 490.752 230.182 489.478 230.182C487.756 230.182 486.496 228.88 486.496 227.018C486.496 225.618 487.056 224.414 487.896 223.56C488.68 222.79 489.646 222.342 490.71 222.342C492.32 222.342 493.188 223.308 493.594 224.316L494.91 219.374H495.848L493.006 230H492.068ZM489.702 229.328C490.542 229.328 491.396 228.922 492.054 228.264C492.74 227.578 493.202 226.654 493.202 225.646C493.202 224.288 492.222 223.196 490.78 223.196C489.926 223.196 489.17 223.56 488.61 224.106C487.896 224.82 487.49 225.842 487.49 226.92C487.49 228.39 488.4 229.328 489.702 229.328ZM503.161 226.584H497.169C497.155 226.71 497.155 226.85 497.155 226.976C497.155 228.376 498.051 229.356 499.451 229.356C500.473 229.356 501.215 228.978 501.929 228.418L502.433 229.048C501.649 229.706 500.739 230.168 499.395 230.168C497.491 230.168 496.189 228.866 496.189 227.004C496.189 225.758 496.721 224.512 497.617 223.616C498.401 222.832 499.395 222.342 500.529 222.342C502.419 222.342 503.399 223.658 503.399 225.212C503.399 225.702 503.315 226.164 503.161 226.584ZM498.317 224.106C497.827 224.596 497.519 225.17 497.309 225.828H502.405C502.447 225.702 502.461 225.506 502.461 225.24C502.461 224.12 501.845 223.168 500.487 223.168C499.633 223.168 498.877 223.546 498.317 224.106ZM506.886 230.168C505.654 230.168 504.478 229.44 504.478 228.082C504.478 227.368 504.744 226.766 505.206 226.304C505.808 225.702 506.718 225.38 507.838 225.38C508.86 225.38 509.854 225.576 510.596 225.786L510.638 225.604C510.694 225.38 510.75 225.086 510.75 224.876C510.75 223.826 510.022 223.252 508.622 223.252C507.796 223.252 507.166 223.392 506.48 223.658L506.312 222.846C507.054 222.58 507.782 222.412 508.734 222.412C510.596 222.412 511.66 223.28 511.66 224.736C511.66 225.044 511.604 225.38 511.506 225.744L510.372 230H509.462L509.784 228.782C509.07 229.608 508.132 230.168 506.886 230.168ZM507.138 229.384C508.468 229.384 509.896 228.446 510.26 227.046L510.414 226.458C509.7 226.276 508.818 226.122 507.81 226.122C507.012 226.122 506.382 226.374 505.948 226.78C505.626 227.102 505.458 227.508 505.458 227.97C505.458 228.824 506.116 229.384 507.138 229.384ZM519.029 230L519.393 228.642C518.665 229.496 517.713 230.182 516.439 230.182C514.717 230.182 513.457 228.88 513.457 227.018C513.457 225.618 514.017 224.414 514.857 223.56C515.641 222.79 516.607 222.342 517.671 222.342C519.281 222.342 520.149 223.308 520.555 224.316L521.871 219.374H522.809L519.967 230H519.029ZM516.663 229.328C517.503 229.328 518.357 228.922 519.015 228.264C519.701 227.578 520.163 226.654 520.163 225.646C520.163 224.288 519.183 223.196 517.741 223.196C516.887 223.196 516.131 223.56 515.571 224.106C514.857 224.82 514.451 225.842 514.451 226.92C514.451 228.39 515.361 229.328 516.663 229.328ZM522.842 230L525.698 219.374H526.636L523.78 230H522.842ZM526.765 230L528.767 222.524H529.705L527.703 230H526.765ZM529.173 220.746L529.467 219.612H530.573L530.279 220.746H529.173ZM530.577 230L532.579 222.524H533.517L533.181 223.812C533.895 222.986 534.693 222.342 535.883 222.342C537.325 222.342 538.291 223.28 538.291 224.694C538.291 225.03 538.221 225.422 538.123 225.8L537.017 230H536.079L537.213 225.744C537.283 225.478 537.325 225.128 537.325 224.862C537.325 223.812 536.667 223.196 535.547 223.196C534.329 223.196 533.069 224.26 532.649 225.772L531.529 230H530.577ZM547.061 226.584H541.069C541.055 226.71 541.055 226.85 541.055 226.976C541.055 228.376 541.951 229.356 543.351 229.356C544.373 229.356 545.115 228.978 545.829 228.418L546.333 229.048C545.549 229.706 544.639 230.168 543.295 230.168C541.391 230.168 540.089 228.866 540.089 227.004C540.089 225.758 540.621 224.512 541.517 223.616C542.301 222.832 543.295 222.342 544.429 222.342C546.319 222.342 547.299 223.658 547.299 225.212C547.299 225.702 547.215 226.164 547.061 226.584ZM542.217 224.106C541.727 224.596 541.419 225.17 541.209 225.828H546.305C546.347 225.702 546.361 225.506 546.361 225.24C546.361 224.12 545.745 223.168 544.387 223.168C543.533 223.168 542.777 223.546 542.217 224.106Z"
        fill="#95A4AF"
      />
      <path
        d="M363.567 211L364.111 208.984L369.775 205.08C370.863 204.328 371.407 203.72 371.407 203C371.407 202.264 370.863 201.848 369.999 201.848C369.023 201.848 368.207 202.392 367.327 203.24L365.823 201.672C366.911 200.44 368.335 199.64 370.111 199.64C372.431 199.64 373.935 200.92 373.935 202.728C373.935 204.104 373.295 205.112 371.295 206.504L367.839 208.872H372.543L371.967 211H363.567ZM379.235 211.192C376.611 211.192 374.867 209.352 374.867 206.536C374.867 203.272 377.075 199.608 380.867 199.608C383.491 199.608 385.235 201.448 385.235 204.264C385.235 207.528 383.027 211.192 379.235 211.192ZM379.427 208.968C381.427 208.968 382.707 206.328 382.707 204.248C382.707 202.664 381.907 201.832 380.675 201.832C378.675 201.832 377.395 204.472 377.395 206.552C377.395 208.136 378.195 208.968 379.427 208.968ZM384.926 211L385.47 208.984L391.134 205.08C392.222 204.328 392.766 203.72 392.766 203C392.766 202.264 392.222 201.848 391.358 201.848C390.382 201.848 389.566 202.392 388.686 203.24L387.182 201.672C388.27 200.44 389.694 199.64 391.47 199.64C393.79 199.64 395.294 200.92 395.294 202.728C395.294 204.104 394.654 205.112 392.654 206.504L389.198 208.872H393.902L393.326 211H384.926ZM400.04 211L400.68 208.584H395.496L395.256 206.76L402.984 199.72H405.384L403.544 206.584H405.048L404.504 208.584H403L402.36 211H400.04ZM398.376 206.584H401.224L402.184 203L398.376 206.584ZM403.074 213.048L413.97 198.232H416.258L405.362 213.048H403.074ZM418.516 211.192C415.892 211.192 414.148 209.352 414.148 206.536C414.148 203.272 416.356 199.608 420.148 199.608C422.772 199.608 424.516 201.448 424.516 204.264C424.516 207.528 422.308 211.192 418.516 211.192ZM418.708 208.968C420.708 208.968 421.988 206.328 421.988 204.248C421.988 202.664 421.188 201.832 419.956 201.832C417.956 201.832 416.676 204.472 416.676 206.552C416.676 208.136 417.476 208.968 418.708 208.968ZM429.644 211.16C427.34 211.16 425.356 209.912 425.356 207.992C425.356 206.28 426.588 205.336 428.22 204.936C427.34 204.488 426.86 203.656 426.86 202.776C426.86 201.32 428.268 199.64 431.068 199.64C433.404 199.64 435.036 200.904 435.036 202.648C435.036 204.056 434.108 205.08 432.588 205.448C433.596 205.832 434.3 206.648 434.3 207.832C434.3 209.528 432.572 211.16 429.644 211.16ZM430.892 204.344C431.932 204.344 432.716 203.736 432.732 202.952C432.748 202.248 432.124 201.656 430.956 201.656C429.948 201.656 429.148 202.248 429.132 203.032C429.116 203.768 429.804 204.344 430.892 204.344ZM429.772 209.176C430.972 209.176 431.884 208.6 431.9 207.704C431.916 206.904 431.1 206.328 429.868 206.328C428.636 206.328 427.772 206.952 427.756 207.784C427.74 208.584 428.556 209.176 429.772 209.176ZM433.277 213.048L444.174 198.232H446.462L435.566 213.048H433.277ZM447.446 211L448.086 208.584H442.902L442.662 206.76L450.39 199.72H452.79L450.95 206.584H452.454L451.91 208.584H450.406L449.766 211H447.446ZM445.782 206.584H448.63L449.59 203L445.782 206.584ZM463.238 211.176C460.646 211.176 459.046 209.784 459.046 207.4C459.046 206.84 459.142 206.232 459.318 205.608L460.87 199.8H463.334L461.718 205.832C461.606 206.216 461.542 206.584 461.542 207.048C461.542 208.152 462.23 208.904 463.494 208.904C464.23 208.904 464.838 208.664 465.318 208.2C465.798 207.72 466.166 207.032 466.406 206.12L468.102 199.8H470.566L468.774 206.472C468.39 207.912 467.83 209.016 467.046 209.8C466.134 210.712 464.902 211.176 463.238 211.176ZM472.513 211L474.913 202.072H471.505L472.113 199.8H481.393L480.785 202.072H477.377L474.977 211H472.513ZM486.086 211.192C483.03 211.192 480.806 209.304 480.806 206.312C480.806 202.744 483.846 199.608 487.622 199.608C489.766 199.608 491.206 200.52 492.102 201.992L490.07 203.416C489.414 202.488 488.662 201.88 487.318 201.88C485.27 201.88 483.366 203.832 483.366 206.216C483.366 207.832 484.502 208.92 486.102 208.92C487.19 208.92 487.894 208.488 488.726 207.816L490.326 209.48C489.254 210.472 487.958 211.192 486.086 211.192ZM501.501 211.192C498.877 211.192 497.133 209.352 497.133 206.536C497.133 203.272 499.341 199.608 503.133 199.608C505.757 199.608 507.501 201.448 507.501 204.264C507.501 207.528 505.293 211.192 501.501 211.192ZM501.693 208.968C503.693 208.968 504.973 206.328 504.973 204.248C504.973 202.664 504.173 201.832 502.941 201.832C500.941 201.832 499.661 204.472 499.661 206.552C499.661 208.136 500.461 208.968 501.693 208.968ZM513.188 211.192C510.564 211.192 508.82 209.352 508.82 206.536C508.82 203.272 511.028 199.608 514.82 199.608C517.444 199.608 519.188 201.448 519.188 204.264C519.188 207.528 516.98 211.192 513.188 211.192ZM513.38 208.968C515.38 208.968 516.66 206.328 516.66 204.248C516.66 202.664 515.86 201.832 514.628 201.832C512.628 201.832 511.348 204.472 511.348 206.552C511.348 208.136 512.148 208.968 513.38 208.968ZM521.244 204.984L521.932 202.424H524.524L523.836 204.984H521.244ZM519.628 211L520.316 208.44H522.908L522.22 211H519.628ZM529.985 211.192C527.361 211.192 525.617 209.352 525.617 206.536C525.617 203.272 527.825 199.608 531.617 199.608C534.241 199.608 535.985 201.448 535.985 204.264C535.985 207.528 533.777 211.192 529.985 211.192ZM530.177 208.968C532.177 208.968 533.457 206.328 533.457 204.248C533.457 202.664 532.657 201.832 531.425 201.832C529.425 201.832 528.145 204.472 528.145 206.552C528.145 208.136 528.945 208.968 530.177 208.968ZM541.673 211.192C539.049 211.192 537.305 209.352 537.305 206.536C537.305 203.272 539.513 199.608 543.305 199.608C545.929 199.608 547.673 201.448 547.673 204.264C547.673 207.528 545.465 211.192 541.673 211.192ZM541.865 208.968C543.865 208.968 545.145 206.328 545.145 204.248C545.145 202.664 544.345 201.832 543.113 201.832C541.113 201.832 539.833 204.472 539.833 206.552C539.833 208.136 540.633 208.968 541.865 208.968Z"
        fill="#00FFD1"
      />
      <path
        d="M649.785 230L652.515 219.808H653.397L655.721 225.576L661.139 219.808H662.203L659.459 230H658.493L660.775 221.474L655.413 227.116H655.343L653.019 221.488L650.723 230H649.785ZM669.805 226.584H663.813C663.799 226.71 663.799 226.85 663.799 226.976C663.799 228.376 664.695 229.356 666.095 229.356C667.117 229.356 667.859 228.978 668.573 228.418L669.077 229.048C668.293 229.706 667.383 230.168 666.039 230.168C664.135 230.168 662.833 228.866 662.833 227.004C662.833 225.758 663.365 224.512 664.261 223.616C665.045 222.832 666.039 222.342 667.173 222.342C669.063 222.342 670.043 223.658 670.043 225.212C670.043 225.702 669.959 226.164 669.805 226.584ZM664.961 224.106C664.471 224.596 664.163 225.17 663.953 225.828H669.049C669.091 225.702 669.105 225.506 669.105 225.24C669.105 224.12 668.489 223.168 667.131 223.168C666.277 223.168 665.521 223.546 664.961 224.106ZM671.122 230L673.124 222.524H674.062L673.726 223.812C674.44 222.986 675.14 222.342 676.302 222.342C677.576 222.342 678.262 223.224 678.444 224.106C679.116 223.042 680.138 222.342 681.524 222.342C682.868 222.342 683.82 223.308 683.82 224.694C683.82 225.03 683.722 225.422 683.624 225.8L682.518 230H681.58L682.714 225.744C682.784 225.478 682.826 225.128 682.826 224.862C682.826 223.84 682.196 223.196 681.174 223.196C680.04 223.196 678.78 224.288 678.416 225.772L677.296 230H676.358L677.492 225.744C677.562 225.478 677.604 225.128 677.604 224.862C677.604 223.84 676.974 223.196 675.952 223.196C674.832 223.196 673.558 224.288 673.194 225.772L672.074 230H671.122ZM692.528 226.584H686.536C686.522 226.71 686.522 226.85 686.522 226.976C686.522 228.376 687.418 229.356 688.818 229.356C689.84 229.356 690.582 228.978 691.296 228.418L691.8 229.048C691.016 229.706 690.106 230.168 688.762 230.168C686.858 230.168 685.556 228.866 685.556 227.004C685.556 225.758 686.088 224.512 686.984 223.616C687.768 222.832 688.762 222.342 689.896 222.342C691.786 222.342 692.766 223.658 692.766 225.212C692.766 225.702 692.682 226.164 692.528 226.584ZM687.684 224.106C687.194 224.596 686.886 225.17 686.676 225.828H691.772C691.814 225.702 691.828 225.506 691.828 225.24C691.828 224.12 691.212 223.168 689.854 223.168C689 223.168 688.244 223.546 687.684 224.106ZM701.745 230.07L700.093 219.808H701.129L702.459 228.838L708.647 219.808H709.753L702.613 230.07H701.745ZM713.263 222.342C715.279 222.342 716.637 223.756 716.637 225.688C716.637 226.878 716.119 228.012 715.279 228.852C714.481 229.65 713.389 230.168 712.213 230.168C710.197 230.168 708.839 228.768 708.839 226.836C708.839 225.646 709.343 224.512 710.183 223.672C711.009 222.874 712.087 222.342 713.263 222.342ZM712.283 229.328C713.137 229.328 713.935 228.922 714.537 228.32C715.223 227.648 715.657 226.71 715.657 225.716C715.657 224.106 714.649 223.196 713.179 223.196C712.339 223.196 711.527 223.588 710.925 224.19C710.239 224.876 709.819 225.814 709.819 226.808C709.819 228.418 710.827 229.328 712.283 229.328ZM720.472 230.126C719.422 230.126 718.666 229.664 718.666 228.656C718.666 228.39 718.708 228.11 718.764 227.9L719.982 223.364H718.918L719.142 222.524H720.206L720.822 220.2H721.774L721.144 222.524H723.594L723.37 223.364H720.92L719.716 227.872C719.674 228.054 719.632 228.292 719.632 228.46C719.632 229.02 720.066 229.286 720.752 229.286C721.046 229.286 721.41 229.202 721.844 229.048L721.606 229.916C721.2 230.07 720.878 230.126 720.472 230.126ZM723.885 230L725.887 222.524H726.825L724.823 230H723.885ZM726.293 220.746L726.587 219.612H727.693L727.399 220.746H726.293ZM727.696 230L729.698 222.524H730.636L730.3 223.812C731.014 222.986 731.812 222.342 733.002 222.342C734.444 222.342 735.41 223.28 735.41 224.694C735.41 225.03 735.34 225.422 735.242 225.8L734.136 230H733.198L734.332 225.744C734.402 225.478 734.444 225.128 734.444 224.862C734.444 223.812 733.786 223.196 732.666 223.196C731.448 223.196 730.188 224.26 729.768 225.772L728.648 230H727.696ZM739.966 232.352C738.608 232.352 737.264 231.862 736.354 231.022L736.984 230.35C737.768 231.064 738.79 231.526 739.966 231.526C740.974 231.526 741.674 231.218 742.164 230.728C742.626 230.238 742.906 229.664 743.13 228.866L743.368 228.026C742.598 228.81 741.688 229.44 740.4 229.44C738.832 229.44 737.334 228.376 737.334 226.57C737.334 225.352 737.824 224.358 738.566 223.616C739.364 222.818 740.442 222.342 741.548 222.342C743.214 222.342 743.942 223.28 744.362 224.232L744.824 222.524H745.762L744.04 228.992C743.718 230.112 743.382 230.77 742.836 231.288C742.122 232.002 741.24 232.352 739.966 232.352ZM740.638 228.6C741.548 228.6 742.416 228.208 743.046 227.55C743.648 226.976 744.012 226.22 744.012 225.436C744.012 224.302 743.088 223.21 741.562 223.21C740.722 223.21 739.896 223.546 739.294 224.162C738.72 224.736 738.328 225.52 738.328 226.472C738.328 227.872 739.462 228.6 740.638 228.6ZM757.068 230L757.432 228.642C756.704 229.496 755.752 230.182 754.478 230.182C752.756 230.182 751.496 228.88 751.496 227.018C751.496 225.618 752.056 224.414 752.896 223.56C753.68 222.79 754.646 222.342 755.71 222.342C757.32 222.342 758.188 223.308 758.594 224.316L759.91 219.374H760.848L758.006 230H757.068ZM754.702 229.328C755.542 229.328 756.396 228.922 757.054 228.264C757.74 227.578 758.202 226.654 758.202 225.646C758.202 224.288 757.222 223.196 755.78 223.196C754.926 223.196 754.17 223.56 753.61 224.106C752.896 224.82 752.49 225.842 752.49 226.92C752.49 228.39 753.4 229.328 754.702 229.328ZM768.161 226.584H762.169C762.155 226.71 762.155 226.85 762.155 226.976C762.155 228.376 763.051 229.356 764.451 229.356C765.473 229.356 766.215 228.978 766.929 228.418L767.433 229.048C766.649 229.706 765.739 230.168 764.395 230.168C762.491 230.168 761.189 228.866 761.189 227.004C761.189 225.758 761.721 224.512 762.617 223.616C763.401 222.832 764.395 222.342 765.529 222.342C767.419 222.342 768.399 223.658 768.399 225.212C768.399 225.702 768.315 226.164 768.161 226.584ZM763.317 224.106C762.827 224.596 762.519 225.17 762.309 225.828H767.405C767.447 225.702 767.461 225.506 767.461 225.24C767.461 224.12 766.845 223.168 765.487 223.168C764.633 223.168 763.877 223.546 763.317 224.106ZM771.886 230.168C770.654 230.168 769.478 229.44 769.478 228.082C769.478 227.368 769.744 226.766 770.206 226.304C770.808 225.702 771.718 225.38 772.838 225.38C773.86 225.38 774.854 225.576 775.596 225.786L775.638 225.604C775.694 225.38 775.75 225.086 775.75 224.876C775.75 223.826 775.022 223.252 773.622 223.252C772.796 223.252 772.166 223.392 771.48 223.658L771.312 222.846C772.054 222.58 772.782 222.412 773.734 222.412C775.596 222.412 776.66 223.28 776.66 224.736C776.66 225.044 776.604 225.38 776.506 225.744L775.372 230H774.462L774.784 228.782C774.07 229.608 773.132 230.168 771.886 230.168ZM772.138 229.384C773.468 229.384 774.896 228.446 775.26 227.046L775.414 226.458C774.7 226.276 773.818 226.122 772.81 226.122C772.012 226.122 771.382 226.374 770.948 226.78C770.626 227.102 770.458 227.508 770.458 227.97C770.458 228.824 771.116 229.384 772.138 229.384ZM784.029 230L784.393 228.642C783.665 229.496 782.713 230.182 781.439 230.182C779.717 230.182 778.457 228.88 778.457 227.018C778.457 225.618 779.017 224.414 779.857 223.56C780.641 222.79 781.607 222.342 782.671 222.342C784.281 222.342 785.149 223.308 785.555 224.316L786.871 219.374H787.809L784.967 230H784.029ZM781.663 229.328C782.503 229.328 783.357 228.922 784.015 228.264C784.701 227.578 785.163 226.654 785.163 225.646C785.163 224.288 784.183 223.196 782.741 223.196C781.887 223.196 781.131 223.56 780.571 224.106C779.857 224.82 779.451 225.842 779.451 226.92C779.451 228.39 780.361 229.328 781.663 229.328ZM787.842 230L790.698 219.374H791.636L788.78 230H787.842ZM791.765 230L793.767 222.524H794.705L792.703 230H791.765ZM794.173 220.746L794.467 219.612H795.573L795.279 220.746H794.173ZM795.577 230L797.579 222.524H798.517L798.181 223.812C798.895 222.986 799.693 222.342 800.883 222.342C802.325 222.342 803.291 223.28 803.291 224.694C803.291 225.03 803.221 225.422 803.123 225.8L802.017 230H801.079L802.213 225.744C802.283 225.478 802.325 225.128 802.325 224.862C802.325 223.812 801.667 223.196 800.547 223.196C799.329 223.196 798.069 224.26 797.649 225.772L796.529 230H795.577ZM812.061 226.584H806.069C806.055 226.71 806.055 226.85 806.055 226.976C806.055 228.376 806.951 229.356 808.351 229.356C809.373 229.356 810.115 228.978 810.829 228.418L811.333 229.048C810.549 229.706 809.639 230.168 808.295 230.168C806.391 230.168 805.089 228.866 805.089 227.004C805.089 225.758 805.621 224.512 806.517 223.616C807.301 222.832 808.295 222.342 809.429 222.342C811.319 222.342 812.299 223.658 812.299 225.212C812.299 225.702 812.215 226.164 812.061 226.584ZM807.217 224.106C806.727 224.596 806.419 225.17 806.209 225.828H811.305C811.347 225.702 811.361 225.506 811.361 225.24C811.361 224.12 810.745 223.168 809.387 223.168C808.533 223.168 807.777 223.546 807.217 224.106Z"
        fill="#95A4AF"
      />
      <path
        d="M645.145 211L645.689 208.984L651.353 205.08C652.441 204.328 652.985 203.72 652.985 203C652.985 202.264 652.441 201.848 651.577 201.848C650.601 201.848 649.785 202.392 648.905 203.24L647.401 201.672C648.489 200.44 649.913 199.64 651.689 199.64C654.009 199.64 655.513 200.92 655.513 202.728C655.513 204.104 654.873 205.112 652.873 206.504L649.417 208.872H654.121L653.545 211H645.145ZM660.813 211.192C658.189 211.192 656.445 209.352 656.445 206.536C656.445 203.272 658.653 199.608 662.445 199.608C665.069 199.608 666.813 201.448 666.813 204.264C666.813 207.528 664.605 211.192 660.813 211.192ZM661.005 208.968C663.005 208.968 664.285 206.328 664.285 204.248C664.285 202.664 663.485 201.832 662.253 201.832C660.253 201.832 658.973 204.472 658.973 206.552C658.973 208.136 659.773 208.968 661.005 208.968ZM666.504 211L667.048 208.984L672.712 205.08C673.8 204.328 674.344 203.72 674.344 203C674.344 202.264 673.8 201.848 672.936 201.848C671.96 201.848 671.144 202.392 670.264 203.24L668.76 201.672C669.848 200.44 671.272 199.64 673.048 199.64C675.368 199.64 676.872 200.92 676.872 202.728C676.872 204.104 676.232 205.112 674.232 206.504L670.776 208.872H675.48L674.904 211H666.504ZM681.618 211L682.258 208.584H677.074L676.834 206.76L684.562 199.72H686.962L685.122 206.584H686.626L686.082 208.584H684.578L683.938 211H681.618ZM679.954 206.584H682.802L683.762 203L679.954 206.584ZM684.652 213.048L695.549 198.232H697.837L686.941 213.048H684.652ZM700.094 211.192C697.47 211.192 695.726 209.352 695.726 206.536C695.726 203.272 697.934 199.608 701.726 199.608C704.35 199.608 706.094 201.448 706.094 204.264C706.094 207.528 703.886 211.192 700.094 211.192ZM700.286 208.968C702.286 208.968 703.566 206.328 703.566 204.248C703.566 202.664 702.766 201.832 701.534 201.832C699.534 201.832 698.254 204.472 698.254 206.552C698.254 208.136 699.054 208.968 700.286 208.968ZM711.222 211.16C708.918 211.16 706.934 209.912 706.934 207.992C706.934 206.28 708.166 205.336 709.798 204.936C708.918 204.488 708.438 203.656 708.438 202.776C708.438 201.32 709.846 199.64 712.646 199.64C714.982 199.64 716.614 200.904 716.614 202.648C716.614 204.056 715.686 205.08 714.166 205.448C715.174 205.832 715.878 206.648 715.878 207.832C715.878 209.528 714.15 211.16 711.222 211.16ZM712.47 204.344C713.51 204.344 714.294 203.736 714.31 202.952C714.326 202.248 713.702 201.656 712.534 201.656C711.526 201.656 710.726 202.248 710.71 203.032C710.694 203.768 711.382 204.344 712.47 204.344ZM711.35 209.176C712.55 209.176 713.462 208.6 713.478 207.704C713.494 206.904 712.678 206.328 711.446 206.328C710.214 206.328 709.35 206.952 709.334 207.784C709.318 208.584 710.134 209.176 711.35 209.176ZM714.856 213.048L725.752 198.232H728.04L717.144 213.048H714.856ZM729.188 211.176C727.572 211.176 725.812 210.312 725.043 209.176L726.772 207.72C727.524 208.536 728.356 208.952 729.396 208.952C730.724 208.952 731.668 208.152 731.668 207.208C731.668 206.408 731.012 205.768 729.588 205.768C729.108 205.768 728.5 205.944 728.084 206.12L726.836 205.112L728.58 199.8H735.364L734.772 201.96H730.212L729.572 203.864C729.94 203.784 730.324 203.736 730.708 203.736C732.756 203.736 734.196 204.984 734.196 206.936C734.196 209.16 732.244 211.176 729.188 211.176ZM745.238 211.176C742.646 211.176 741.046 209.784 741.046 207.4C741.046 206.84 741.142 206.232 741.318 205.608L742.87 199.8H745.334L743.718 205.832C743.606 206.216 743.542 206.584 743.542 207.048C743.542 208.152 744.23 208.904 745.494 208.904C746.23 208.904 746.838 208.664 747.318 208.2C747.798 207.72 748.166 207.032 748.406 206.12L750.102 199.8H752.566L750.774 206.472C750.39 207.912 749.83 209.016 749.046 209.8C748.134 210.712 746.902 211.176 745.238 211.176ZM754.513 211L756.913 202.072H753.505L754.113 199.8H763.393L762.785 202.072H759.377L756.977 211H754.513ZM768.086 211.192C765.03 211.192 762.806 209.304 762.806 206.312C762.806 202.744 765.846 199.608 769.622 199.608C771.766 199.608 773.206 200.52 774.102 201.992L772.07 203.416C771.414 202.488 770.662 201.88 769.318 201.88C767.27 201.88 765.366 203.832 765.366 206.216C765.366 207.832 766.502 208.92 768.102 208.92C769.19 208.92 769.894 208.488 770.726 207.816L772.326 209.48C771.254 210.472 769.958 211.192 768.086 211.192ZM783.501 211.192C780.877 211.192 779.133 209.352 779.133 206.536C779.133 203.272 781.341 199.608 785.133 199.608C787.757 199.608 789.501 201.448 789.501 204.264C789.501 207.528 787.293 211.192 783.501 211.192ZM783.693 208.968C785.693 208.968 786.973 206.328 786.973 204.248C786.973 202.664 786.173 201.832 784.941 201.832C782.941 201.832 781.661 204.472 781.661 206.552C781.661 208.136 782.461 208.968 783.693 208.968ZM795.188 211.192C792.564 211.192 790.82 209.352 790.82 206.536C790.82 203.272 793.028 199.608 796.82 199.608C799.444 199.608 801.188 201.448 801.188 204.264C801.188 207.528 798.98 211.192 795.188 211.192ZM795.38 208.968C797.38 208.968 798.66 206.328 798.66 204.248C798.66 202.664 797.86 201.832 796.628 201.832C794.628 201.832 793.348 204.472 793.348 206.552C793.348 208.136 794.148 208.968 795.38 208.968ZM803.244 204.984L803.932 202.424H806.524L805.836 204.984H803.244ZM801.628 211L802.316 208.44H804.908L804.22 211H801.628ZM811.985 211.192C809.361 211.192 807.617 209.352 807.617 206.536C807.617 203.272 809.825 199.608 813.617 199.608C816.241 199.608 817.985 201.448 817.985 204.264C817.985 207.528 815.777 211.192 811.985 211.192ZM812.177 208.968C814.177 208.968 815.457 206.328 815.457 204.248C815.457 202.664 814.657 201.832 813.425 201.832C811.425 201.832 810.145 204.472 810.145 206.552C810.145 208.136 810.945 208.968 812.177 208.968ZM823.673 211.192C821.049 211.192 819.305 209.352 819.305 206.536C819.305 203.272 821.513 199.608 825.305 199.608C827.929 199.608 829.673 201.448 829.673 204.264C829.673 207.528 827.465 211.192 823.673 211.192ZM823.865 208.968C825.865 208.968 827.145 206.328 827.145 204.248C827.145 202.664 826.345 201.832 825.113 201.832C823.113 201.832 821.833 204.472 821.833 206.552C821.833 208.136 822.633 208.968 823.865 208.968Z"
        fill="#00FFD1"
      />
      <circle cx="599" cy="215.65" r="25.5" fill="#00A285" stroke="black" />
      <mask id="path-56-inside-2_2142_7234" fill="white">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M603.702 200.928C610.369 202.432 616.762 199.275 617.98 193.876C619.199 188.476 614.782 182.88 608.115 181.375C601.448 179.87 595.055 183.028 593.837 188.427C592.618 193.826 597.035 199.423 603.702 200.928ZM604.177 195.945C607.83 196.769 611.302 195.177 611.931 192.389C612.56 189.601 610.109 186.672 606.456 185.848C602.802 185.023 599.331 186.615 598.702 189.404C598.072 192.192 600.524 195.121 604.177 195.945Z"
        />
      </mask>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M603.702 200.928C610.369 202.432 616.762 199.275 617.98 193.876C619.199 188.476 614.782 182.88 608.115 181.375C601.448 179.87 595.055 183.028 593.837 188.427C592.618 193.826 597.035 199.423 603.702 200.928ZM604.177 195.945C607.83 196.769 611.302 195.177 611.931 192.389C612.56 189.601 610.109 186.672 606.456 185.848C602.802 185.023 599.331 186.615 598.702 189.404C598.072 192.192 600.524 195.121 604.177 195.945Z"
        fill="#00FFD1"
      />
      <path
        d="M617.98 193.876L617.005 193.656L617.98 193.876ZM603.702 200.928L603.923 199.952L603.702 200.928ZM608.115 181.375L607.895 182.351L608.115 181.375ZM611.931 192.389L610.955 192.169L611.931 192.389ZM598.702 189.404L597.726 189.183L598.702 189.404ZM617.005 193.656C615.949 198.334 610.253 201.381 603.923 199.952L603.482 201.903C610.486 203.484 617.575 200.216 618.956 194.096L617.005 193.656ZM607.895 182.351C614.225 183.779 618.061 188.977 617.005 193.656L618.956 194.096C620.337 187.976 615.339 181.98 608.335 180.4L607.895 182.351ZM594.812 188.647C595.868 183.969 601.564 180.922 607.895 182.351L608.335 180.4C601.331 178.819 594.243 182.087 592.861 188.207L594.812 188.647ZM603.923 199.952C597.592 198.524 593.757 193.326 594.812 188.647L592.861 188.207C591.48 194.327 596.479 200.323 603.482 201.903L603.923 199.952ZM610.955 192.169C610.724 193.194 609.957 194.069 608.771 194.613C607.584 195.157 606.029 195.338 604.397 194.969L603.957 196.92C605.978 197.377 607.985 197.173 609.605 196.431C611.225 195.688 612.509 194.372 612.906 192.609L610.955 192.169ZM606.235 186.823C607.867 187.191 609.194 188.023 610.032 189.024C610.87 190.024 611.187 191.143 610.955 192.169L612.906 192.609C613.304 190.846 612.71 189.107 611.566 187.74C610.422 186.374 608.697 185.328 606.676 184.872L606.235 186.823ZM599.677 189.624C599.908 188.598 600.676 187.724 601.861 187.18C603.048 186.636 604.604 186.455 606.235 186.823L606.676 184.872C604.654 184.416 602.647 184.619 601.028 185.362C599.407 186.105 598.124 187.421 597.726 189.183L599.677 189.624ZM604.397 194.969C602.765 194.601 601.438 193.77 600.6 192.769C599.763 191.769 599.446 190.649 599.677 189.624L597.726 189.183C597.328 190.946 597.922 192.685 599.067 194.053C600.21 195.419 601.935 196.464 603.957 196.92L604.397 194.969Z"
        fill="black"
        mask="url(#path-56-inside-2_2142_7234)"
      />
      <rect
        x="602.829"
        y="187.282"
        width="7"
        height="7"
        rx="2.5"
        transform="rotate(18.2975 602.829 187.282)"
        fill="#00A285"
        stroke="black"
      />
      <circle cx="597.5" cy="214.15" r="24" fill="#00FFD1" stroke="black" />
      <g filter="url(#filter1_i_2142_7234)">
        <circle cx="597.5" cy="214.15" r="19.5" fill="#EBF6F9" />
      </g>
      <circle cx="597.5" cy="214.15" r="19" stroke="black" />
      <path
        d="M601.345 204.417L596 213.35L600.667 215.15L602.451 204.827C602.564 204.172 601.686 203.846 601.345 204.417Z"
        fill="#704449"
        stroke="black"
      />
      <path
        d="M585.031 218.66L595.5 214.65L598.5 217.65L585.609 220.569C584.399 220.843 583.872 219.104 585.031 218.66Z"
        fill="#704449"
        stroke="black"
      />
      <circle cx="598" cy="215.15" r="3.5" fill="#00FFD1" stroke="black" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M601.878 198.175C601.477 198.072 601.068 198.313 600.965 198.714L600.589 200.166C600.486 200.567 600.727 200.976 601.128 201.08C601.529 201.184 601.938 200.943 602.042 200.542L602.417 199.089C602.521 198.688 602.279 198.279 601.878 198.175ZM594.372 227.221C593.971 227.118 593.562 227.359 593.458 227.76L593.083 229.212C592.979 229.613 593.22 230.022 593.621 230.126C594.022 230.229 594.431 229.988 594.535 229.587L594.91 228.135C595.014 227.734 594.773 227.325 594.372 227.221ZM613.187 217.365C613.588 217.469 613.829 217.878 613.725 218.279C613.621 218.68 613.212 218.921 612.811 218.818L611.359 218.442C610.958 218.339 610.717 217.93 610.82 217.529C610.924 217.127 611.333 216.886 611.734 216.99L613.187 217.365ZM584.679 210.773C584.783 210.372 584.542 209.962 584.141 209.859L582.689 209.484C582.288 209.38 581.878 209.621 581.775 210.022C581.671 210.423 581.912 210.832 582.313 210.936L583.766 211.311C584.167 211.415 584.576 211.174 584.679 210.773Z"
        fill="#9E756C"
      />
      <defs>
        <filter
          id="filter0_b_2142_7234"
          x="232.646"
          y="172"
          width="746.707"
          height="86"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation="9" />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_2142_7234"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_backgroundBlur_2142_7234"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_i_2142_7234"
          x="578"
          y="194.65"
          width="39"
          height="39"
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
          <feOffset dx="2" dy="4" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.683626 0 0 0 0 0.451193 0 0 0 0 0 0 0 0 0.41 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_2142_7234"
          />
        </filter>
        <linearGradient
          id="paint0_linear_2142_7234"
          x1="606"
          y1="1"
          x2="606"
          y2="294"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#213441" />
          <stop offset="1" stopColor="#15242F" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2142_7234"
          x1="606"
          y1="1"
          x2="606"
          y2="294"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#213441" />
          <stop offset="1" stopColor="#15242F" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_2142_7234"
          x1="596"
          y1="87"
          x2="596"
          y2="176"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.295" stopColor="white" />
          <stop offset="1" stopColor="#00FFD1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function CountdownFinishMobile(props: any) {
  return (
    <svg
      {...props}
      width="357"
      height="262"
      viewBox="0 0 357 262"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width="355"
        height="260"
        rx="16"
        fill="url(#paint0_linear_2198_7735)"
        stroke="#979797"
        strokeOpacity="0.2"
      />
      <mask
        id="mask0_2198_7735"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="357"
        height="262"
      >
        <rect
          x="1"
          y="1"
          width="355"
          height="260"
          rx="16"
          fill="url(#paint1_linear_2198_7735)"
          stroke="#979797"
          strokeOpacity="0.2"
        />
      </mask>
      <g mask="url(#mask0_2198_7735)">
        <g opacity="0.06">
          <path
            d="M-14.457 268.758C-14.457 268.758 -2.92509 242.959 33.9387 236.528C65.7668 230.978 86.4475 248.318 86.4475 248.318C86.4475 248.318 76.4147 212.414 111.087 196.031C145.76 179.687 159.944 208.318 159.944 208.318C159.944 208.318 174.09 189.678 200.575 196.95C227.06 204.223 227.06 219.687 227.06 219.687C227.06 219.687 244.397 206.519 264.962 219.227C285.489 231.935 278.185 247.399 278.185 247.399C278.185 247.399 292.792 235.572 319.277 245.6C345.762 255.59 348.953 268.796 348.953 268.796C348.953 268.796 356.718 254.71 340.727 233.351C324.736 211.993 301.48 209.735 301.48 209.735C301.48 209.735 302.095 194.156 277.955 182.481C253.814 170.807 239.053 180.147 239.053 180.147C239.053 180.147 233.018 166.788 211.877 162.769C190.735 158.75 176.32 164.759 176.32 164.759C176.32 164.759 135.766 136.702 90.1377 158.405C44.5481 180.108 40.8578 211.151 40.8578 211.151C40.8578 211.151 -7.99914 229.6 -14.4186 268.796L-14.457 268.758Z"
            fill="white"
          />
          <path
            d="M27.7872 193.919C27.7872 193.919 39.0885 155.757 73.8381 142.475C22.7516 150.092 -3.07992 168.426 -25.375 209.421C-9.3456 196.292 27.7872 193.919 27.7872 193.919Z"
            fill="white"
          />
          <path
            d="M189.08 136.855C189.08 136.855 227.405 134.482 246.086 159.323C271.61 156.376 298.057 166.137 308.474 189.486C295.405 151.63 259.771 115.841 189.08 136.855Z"
            fill="white"
          />
          <path
            d="M-35.293 255.745C-33.2172 250.118 -30.2574 244.874 -26.8747 239.898C-23.492 234.922 -19.4558 230.367 -15.1505 226.157C-10.7299 222.023 -5.80964 218.425 -0.504951 215.516C4.7613 212.492 10.6041 210.693 16.447 209.43C13.7178 210.693 10.8348 211.42 8.22089 212.951L4.22314 214.903L0.456043 217.2C-4.50269 220.377 -9.26922 223.822 -13.4592 227.994C-17.8029 231.937 -21.6853 236.415 -25.3371 241.046C-28.9504 245.716 -32.2947 250.616 -35.293 255.783V255.745Z"
            fill="white"
          />
          <path
            d="M32.5137 246.444C37.5108 243.611 43.4306 242.654 49.1581 242.922C52.0411 243.113 54.9241 243.534 57.6533 244.453C60.421 245.257 62.9964 246.597 65.3797 248.128C59.8444 246.75 54.5012 245.64 49.0428 245.41C43.5843 245.104 38.1259 245.487 32.5137 246.405V246.444Z"
            fill="white"
          />
          <path
            d="M102.552 224.549C103.359 220.377 105.55 216.396 108.664 213.296C111.739 210.157 115.813 207.975 120.042 206.827C124.309 205.564 128.768 205.717 133.035 206.062C135.149 206.406 137.301 206.827 139.377 207.325C141.414 208.014 143.452 208.664 145.451 209.43C143.298 209.2 141.222 208.817 139.146 208.55L132.881 208.014C128.729 208.052 124.578 208.014 120.695 209.239C112.854 211.229 106.05 216.779 102.552 224.549Z"
            fill="white"
          />
          <path
            d="M166.593 219.112C173.358 213.906 182.392 211.38 191.117 212.452C195.461 213.026 199.766 214.212 203.495 216.471C205.455 217.389 207.108 218.844 208.877 220.069C210.529 221.447 211.99 223.016 213.489 224.547C209.953 222.136 206.455 219.839 202.649 218.193C198.921 216.394 194.884 215.399 190.848 214.901C186.774 214.365 182.661 214.595 178.586 215.322C174.511 216.088 170.475 217.313 166.631 219.112H166.593Z"
            fill="white"
          />
          <path
            d="M251.199 226.539C255.812 226.654 260.271 228.797 263.692 231.974C265.384 233.582 266.883 235.458 267.882 237.563C268.997 239.591 269.535 241.888 269.804 244.146C267.498 240.204 265.153 236.682 262.001 233.812C258.926 230.864 255.312 228.568 251.238 226.539H251.199Z"
            fill="white"
          />
          <path
            d="M-25.375 172.146C-21.2235 163.916 -14.8425 156.835 -7.42361 151.208C-3.69495 148.414 0.302782 145.964 4.60804 144.127C8.83642 142.136 13.4108 141.026 17.9082 140.223C13.603 141.945 9.41302 143.629 5.45372 145.849C1.45598 147.993 -2.34956 150.404 -5.92446 153.16C-9.53781 155.84 -12.9589 158.825 -16.1879 161.964C-19.4168 165.141 -22.5305 168.471 -25.375 172.069V172.146Z"
            fill="white"
          />
          <path
            d="M238.321 102.138C244.933 100.76 251.775 100.339 258.579 100.645C265.383 100.952 272.148 102.253 278.722 104.205C285.256 106.272 291.484 109.334 297.057 113.239C302.785 116.99 307.398 122.157 311.511 127.478C308.935 125.258 306.821 122.655 304.092 120.703L300.209 117.564L296.019 114.846C290.369 111.363 284.372 108.416 277.991 106.578C271.687 104.473 265.114 103.248 258.464 102.559C251.814 101.87 245.087 101.755 238.36 102.138H238.321Z"
            fill="white"
          />
          <path
            d="M315.546 199.21C322.043 193.89 328.693 188.761 335.343 183.708C341.993 178.617 348.797 173.718 355.524 168.742C362.366 163.919 369.17 158.981 376.05 154.235C382.97 149.488 389.889 144.78 397 140.264C390.504 145.584 383.854 150.713 377.204 155.766C370.515 160.818 363.75 165.756 356.984 170.732C350.142 175.555 343.338 180.493 336.457 185.239C329.538 189.985 322.619 194.693 315.508 199.21H315.546Z"
            fill="white"
          />
          <path
            d="M152.561 138.577C151.562 132.873 151.331 127.208 151.293 121.505C151.293 115.802 151.562 110.099 152.561 104.434C153.561 110.137 153.792 115.84 153.83 121.505C153.792 127.208 153.561 132.873 152.561 138.577Z"
            fill="white"
          />
          <path
            d="M112.278 138.576C110.317 133.179 108.626 127.705 106.973 122.232C105.32 116.758 103.898 111.208 102.322 105.735C100.977 100.184 99.5158 94.6725 98.2473 89.084C96.9788 83.4956 95.7872 77.9072 94.8262 72.2422C96.7866 77.6392 98.478 83.1128 100.131 88.5864C101.784 94.06 103.206 99.6102 104.782 105.084C106.127 110.634 107.588 116.146 108.857 121.734C110.125 127.323 111.317 132.911 112.278 138.576Z"
            fill="white"
          />
          <path
            d="M98.2472 142.484C94.8645 133.336 91.7509 124.111 88.6757 114.887C85.6005 105.662 82.7175 96.3606 79.7576 87.0976C76.9515 77.758 74.0685 68.495 71.3778 59.1171C68.687 49.7776 66.0346 40.3997 63.6514 30.9453C67.0341 40.0935 70.1477 49.3182 73.2229 58.543C76.2981 67.7677 79.1811 77.069 82.1409 86.332C84.9086 95.6716 87.83 104.935 90.5208 114.312C93.2116 123.652 95.8639 133.03 98.2472 142.484Z"
            fill="white"
          />
          <path
            d="M84.832 136.28C81.8337 130.385 79.5657 124.223 77.49 118.022C75.4911 111.783 73.646 105.505 72.5312 98.998C75.5296 104.893 77.7975 111.055 79.8733 117.256C81.8721 123.495 83.7172 129.773 84.832 136.28Z"
            fill="white"
          />
          <path
            d="M266.651 125.18C270.265 116.109 274.109 107.152 277.991 98.2333C281.874 89.3147 285.987 80.4728 289.946 71.5542C294.097 62.7505 298.172 53.9086 302.439 45.1431C306.706 36.3777 310.972 27.6123 315.547 19C311.933 28.0716 308.089 37.0284 304.207 45.947C300.325 54.8655 296.25 63.7075 292.252 72.626C288.101 81.4297 284.026 90.2717 279.759 99.0371C275.493 107.802 271.226 116.568 266.651 125.18Z"
            fill="white"
          />
          <path
            d="M289.215 127.478C291.56 122.081 294.174 116.837 296.787 111.593C299.401 106.349 302.246 101.22 304.975 96.0146C307.858 90.9237 310.664 85.7563 313.663 80.7038C316.661 75.6512 319.659 70.6369 322.927 65.6992C320.582 71.0963 317.968 76.3402 315.354 81.5841C312.702 86.8281 309.895 91.9572 307.166 97.1629C304.245 102.254 301.477 107.421 298.479 112.474C295.481 117.526 292.482 122.54 289.215 127.478Z"
            fill="white"
          />
          <path
            d="M257.196 110.671C258.695 102.671 260.886 94.9388 263.308 87.2451C265.768 79.5514 268.421 71.9343 271.803 64.5469C270.304 72.5468 268.113 80.2787 265.691 87.9724C263.231 95.6277 260.579 103.283 257.196 110.671Z"
            fill="white"
          />
          <path
            d="M311.511 155.38C315.201 151.399 319.352 148.069 323.619 144.854C327.925 141.715 332.345 138.692 337.227 136.318C333.537 140.299 329.385 143.629 325.118 146.845C320.813 149.983 316.393 153.007 311.511 155.38Z"
            fill="white"
          />
          <path
            d="M343.839 209.425C351.527 205.215 359.484 201.655 367.518 198.325C375.59 195.033 383.739 191.933 392.158 189.521C384.47 193.77 376.513 197.292 368.479 200.622C360.406 203.914 352.257 207.014 343.839 209.425Z"
            fill="white"
          />
          <path
            d="M174.59 123.765C174.167 114.731 174.513 105.736 175.051 96.7794C175.666 87.8226 176.474 78.8658 178.011 69.9473C178.434 78.9806 178.088 87.9757 177.55 96.9325C176.935 105.889 176.128 114.846 174.59 123.765Z"
            fill="white"
          />
          <path
            d="M42.6244 130.654L20.4831 87.6693L25.2496 92.2625L5.10717 44.3398L10.4887 51.8421L2.80078 33.7754L17.2541 59.0382L16.0241 51.5359L45.8533 108.033L38.0116 97.4682L45.8533 119.21L35.3977 102.98L40.1643 115.994L30.1699 100.377L42.6244 130.654Z"
            fill="white"
          />
          <path
            d="M120.619 50.8861L127.577 136.282L128.653 114.388L131.805 128.856L131.075 105.392L133.458 118.751L134.765 101.297L139.378 142.483L138.071 50.1206L136.649 72.2446L134.65 43.7283L133.612 55.7473L130.383 21.0684V65.6993L129.422 56.3597V83.8808L126.424 56.5128L125.809 79.4407L120.619 50.8861Z"
            fill="white"
          />
          <path
            d="M319.238 170.769L362.483 127.477L356.294 139.611L376.475 119.86L366.558 134.941L392.966 114.387L372.593 133.908C372.593 133.908 389.583 124.989 389.083 125.181C388.584 125.372 325.658 178.807 325.658 178.807L343.878 160.051L332.077 168.051L349.913 150.061L319.277 170.73L319.238 170.769Z"
            fill="white"
          />
        </g>
        <path
          d="M47.0404 141.293C47.588 141.938 46.4639 141.541 46.0027 142.253C43.7256 142.352 41.5926 142.683 39.719 143.477C39.1137 143.725 38.9407 144.039 39.056 144.436C39.2002 144.85 39.4307 145.264 39.4307 145.694C39.4307 146.372 38.5084 146.835 37.3266 146.786C34.8765 146.687 32.5994 145.975 30.3799 145.462C29.0828 145.164 27.7569 144.883 26.431 144.618C25.451 144.42 23.8368 143.957 22.7991 144.073C21.502 144.205 22.165 145.363 22.4821 145.843C23.2891 147.001 24.6439 147.96 26.2004 148.821C28.8234 150.293 31.7347 151.551 34.963 152.543C36.9519 153.139 39.0272 153.668 41.0449 154.198C42.0249 154.446 43.005 154.677 43.9562 154.909C43.0914 155.902 44.2156 156.481 45.8874 157.027C50.6434 158.615 56.3794 158.532 61.6543 159.062C63.7296 159.277 60.6742 159.624 64.162 160.071C69.0333 160.699 83.186 160.898 88.1726 160.964C90.9109 160.997 93.6204 160.981 96.3587 161.03C99.3853 161.08 103.651 160.65 106.678 160.716C112.529 160.865 118.496 161.063 124.261 161.295C128.959 161.494 133.657 161.593 138.385 161.609C138.788 161.609 139.365 161.527 139.336 161.295C127.864 160.799 115.066 160.435 103.622 159.756C93.6492 159.177 87.625 158.83 77.7094 157.986C71.9157 157.49 63.5855 156.464 57.9359 155.604C52.9782 154.843 46.608 153.999 43.2644 151.584C39.1425 148.589 43.6391 145.016 48.251 143.262C48.4239 143.196 48.6833 143.113 48.8563 143.014C49.2887 143.278 49.9804 143.742 50.4416 144.056C56.6388 148.209 64.1332 151.319 72.9822 153.337C75.9799 154.016 79.093 154.495 82.3213 154.727C85.5784 154.942 88.7779 154.859 91.7757 154.065C92.8422 153.784 93.8222 153.801 94.8887 153.966C96.8487 154.28 99.1258 155.174 101.979 155.786C109.503 157.391 112.529 157.209 120.658 157.258C123.108 157.275 127.633 157.043 130.112 157.06C131.496 157.06 132.908 157.06 134.291 157.109C139.22 157.225 144.582 157.887 149.453 158.416C153.056 158.797 157.956 158.896 161.588 159.012C164.788 159.111 168.016 159.128 171.244 159.144C172.599 159.144 177.067 159.062 178.911 159.029C182.428 158.532 168.506 158.698 156.746 156.381C145.764 154.214 140.2 151.914 135.992 149.598C133.167 148.043 132.274 145.743 133.801 143.477C134.868 141.905 136.943 142.385 137.549 142.352C139.336 142.253 140.892 141.856 141.93 140.995C142.881 140.201 142.968 139.275 142.91 138.348C142.91 138.05 142.795 137.736 142.737 137.389C143.198 137.091 143.775 136.81 144.207 136.479C147.32 134.047 144.726 130.589 140.719 129.034C133.369 126.188 126.221 128.091 119.591 130.572C118.265 131.069 116.853 131.565 115.296 131.764C112.27 132.128 109.56 132.028 106.447 130.026C104.257 128.62 103.017 126.387 104.458 126.006C109.503 124.699 114.893 123.061 116.536 119.835C118.438 116.08 113.106 111.828 112.875 111.911C115.959 110.852 130.948 108.387 132.216 108.172C133.946 107.874 135.185 107.708 135.041 107.559C134.695 106.881 131.294 108.072 127.864 107.328C126.422 107.013 124.924 107.129 123.454 107.444C123.108 107.51 122.762 107.576 122.416 107.626C120.456 107.94 118.438 107.956 116.478 107.659C114.432 107.344 112.644 106.666 110.54 106.401C109.301 106.252 108.436 106.153 106.764 106.401C106.534 106.434 105.554 106.633 105.554 106.633C105.554 106.633 104.228 104.995 98.4917 104.3C98.2035 104.267 95.494 104.035 95.2634 103.903C93.9663 103.225 95.7246 102.216 95.5516 100.412C95.2057 97.0869 92.9575 94.5887 90.5362 93.0832C76.1241 84.232 40.2666 82.379 29.3711 95.8626C28.6216 96.8056 27.6416 99.4362 25.6527 99.6678C15.1607 100.892 15.276 111.034 16.6596 115.583C18.5043 121.622 23.6927 127.363 29.9187 132.21C31.3023 133.302 32.9741 134.295 34.6747 135.238C36.923 136.495 39.4884 137.504 42.6302 137.935C43.6391 138.067 44.3309 138.414 44.8209 138.944C45.5703 139.771 46.3486 140.565 47.0404 141.31V141.293Z"
          fill="#FDFEFD"
        />
        <path
          d="M277.576 70.0877C277.144 70.4517 276.567 70.7495 275.875 70.8818C273.425 71.3782 271.148 70.0215 269.275 69.3101C265.383 67.8377 260.858 66.9774 256.188 67.5068C253.277 67.8377 250.452 68.4167 247.685 69.0454C245.149 69.6245 242.555 70.4682 239.816 70.6668C235.694 70.948 232.351 68.6649 231.976 66.4811C231.544 63.9994 235.348 61.981 239.24 61.3689C244.111 60.5913 248.781 61.0711 253.075 62.5435C256.477 63.7182 259.532 63.4038 263.106 62.7255C266.421 62.0968 270.255 62.3285 273.281 63.3046C274.78 63.7843 276.077 64.4627 276.942 65.323C277.345 65.72 277.749 66.1667 277.835 66.63C277.922 67.0767 277.49 67.6226 277.893 68.0362C278.556 68.6814 278.297 69.5087 277.576 70.1373V70.0877Z"
          fill="#FDFEFD"
          fillOpacity="0.5"
        />
        <path
          opacity="0.5"
          d="M342.748 118.331C343.527 118.546 344.708 118.016 345.314 117.735C346.294 117.289 346.87 118.265 346.928 118.645C347.476 122.186 344.853 125.428 340.76 127.993C338.972 129.118 337.128 130.243 335.225 131.318C333.842 132.079 332.429 132.824 331.017 133.552C330.037 134.064 328.682 134.809 327.414 135.074C327.558 134.809 327.875 134.61 328.25 134.428C332.343 132.36 335.196 129.763 337.56 127C341.711 122.153 338.338 116.594 332.055 112.855C331.334 112.425 330.527 112.011 329.518 111.895C329.23 111.994 328.999 112.027 328.884 112.11C327.414 113.169 325.973 114.228 324.56 115.303C323.869 115.833 326.664 115.187 329.576 117.189C333.698 120.035 330.671 124.568 327.097 126.537C323.321 128.605 319.862 129.184 316.461 130.64C314.385 131.533 313.175 132.824 313.982 134.296C315.106 136.397 314.039 138.316 312.022 140.086C310.811 141.145 308.88 141.89 306.776 142.221C304.499 142.585 302.856 142.518 301.328 143.71C299.08 145.463 297.321 147.085 293.545 147.813C290.288 148.425 286.743 148.309 283.37 148.177C278.989 147.995 275.559 148.541 271.812 149.814C268.641 151.27 264.202 151.535 265.038 150.873C271.12 148.706 275.011 146.555 276.77 145.364C279.306 143.643 281.67 141.857 283.803 139.987C289.164 135.272 290.749 129.118 288.674 123.625C286.57 118.05 280.315 113.467 272.36 110.456C263.597 107.13 250.943 104.93 240.739 103.64C226.846 101.886 205.112 101.042 185.31 101.886C167.67 102.63 151.269 104.93 148.444 105.377C146.686 105.658 144.61 105.972 142.881 106.303C141.411 106.584 145.734 105.443 146.455 104.897C148.127 103.656 147.493 103.16 149.943 102.746C151.845 102.432 154.295 102.746 155.506 101.853C157.379 100.529 157.264 99.3049 156.572 97.3693C155.708 94.8711 156.371 91.5953 160.896 90.0236C163.894 88.9813 167.67 88.9152 170.927 89.3618C171.532 89.4446 167.007 85.6394 172.772 81.1725C177.239 77.7147 184.734 76.143 192.487 76.8875C200.789 77.6816 207.044 80.8747 215.287 81.189C217.997 81.2883 221.139 81.2386 223.56 82.1155C226.212 83.0916 227.711 85.1762 227.538 86.9464C227.394 88.4685 226.817 90.338 227.97 91.8104C229.065 93.2001 231.89 93.4317 234.052 92.6872C237.136 91.645 238.866 89.0475 239.875 87.1946C243.161 81.1559 250.77 75.0345 262.646 74.3562C273.109 73.7606 283.255 77.1853 288.53 82.2809C288.962 82.6945 289.193 83.2074 290.231 83.439C291.009 83.6045 293.459 82.9923 294.381 82.86C296.197 82.5953 297.955 82.3305 299.8 82.1817C309.399 81.3875 318.507 82.7111 325.367 86.7644C334.793 92.3233 336.522 99.6193 332.919 106.866C332.689 107.345 331.593 108.553 331.853 109.016C332.948 110.902 340.327 109.546 342.057 108.801C342.864 108.454 344.046 108.768 344.305 109.38C345.054 111.217 344.218 112.987 343.354 114.757C343.037 115.436 341.25 117.884 342.864 118.331H342.748Z"
          fill="#FDFEFD"
        />
        <path
          d="M118.263 192.448C116.908 192.514 115.582 192.1 114.574 191.439C113.882 190.992 113.421 190.463 112.787 190.016C112.008 189.487 110.826 188.709 109.818 188.378C107.858 187.733 105.379 188.345 104.543 187.038C103.822 185.946 104.427 184.705 105.782 183.878C107.627 182.753 111.374 182.273 113.622 183.249C114.199 183.497 115.064 183.464 115.727 183.58C116.534 183.729 117.283 184.01 117.975 184.292C122.356 186.111 125.671 189.983 120.05 192.1C119.474 192.316 118.897 192.431 118.321 192.448H118.263Z"
          fill="#FDFEFD"
        />
        <path
          d="M182.456 157.223C181.505 156.892 180.813 156.395 180.381 155.816C180.064 155.403 180.093 154.989 180.323 154.542C180.842 153.583 182.168 153.12 183.955 153.169C184.359 152.458 185.713 151.912 187.327 151.995C188.279 152.044 189.143 152.491 190.123 152.491C191.738 152.474 193.092 152.789 194.274 153.384C195.081 153.781 195.571 154.476 196.868 154.724C199.463 153.963 202.143 154.609 204.478 155.519C206.006 156.114 207.303 156.925 209.061 157.223C210.935 157.52 211.655 157.123 213.01 157.338C215.345 157.669 209.407 157.851 207.908 157.901C204.219 158.033 187.616 158.993 182.485 157.223H182.456Z"
          fill="#FDFEFD"
        />
        <path
          d="M249.789 154.665C248.982 154.864 248.175 155.062 247.339 155.228C238.519 156.915 232.149 157.147 224.51 157.08C223.646 157.08 221.801 157.114 220.648 157.014C220.187 156.816 222.205 156.667 223.761 155.773C225.577 154.731 226.759 155.228 227.422 154.913C229.439 153.97 229.468 152.961 231.889 152.283C236.818 150.926 242.064 153.358 246.936 152.15C248.348 151.803 249.876 151.836 251.375 152.084C252.528 152.266 253.709 152.498 254.891 152.547C255.756 152.58 256.592 152.432 257.63 152.365C259.071 152.266 259.013 152.746 254.718 153.408C253.508 153.59 252.412 153.97 251.288 154.284C250.798 154.417 250.308 154.549 249.789 154.682V154.665Z"
          fill="#FDFEFD"
        />
        <path
          d="M219.321 158.815C215.2 159.659 213.297 162.488 217.534 163.861C221.772 165.234 223.933 163.017 222.953 161.875C221.973 160.734 223.501 157.971 219.321 158.831V158.815Z"
          fill="#FDFEFD"
        />
        <path
          d="M51.3644 79.3219C57.1581 81.2741 64.1336 76.1454 75.1157 78.991C86.0977 81.8366 88.0001 83.8054 91.8626 82.0682C95.725 80.3311 89.499 70.8678 82.2064 71.4799C74.9139 72.0921 73.8186 74.5572 69.322 70.7354C64.7966 66.9137 54.9386 69.9909 56.8699 73.3163C56.8699 73.3163 51.6239 72.7538 49.5197 75.1858C47.4732 77.5517 49.952 78.8256 51.3933 79.3219H51.3644Z"
          fill="#FDFEFD"
          fillOpacity="0.5"
        />
        <path
          d="M107.802 172.913C109.128 172.02 108.407 168.943 103.594 169.207C98.7802 169.472 104.718 174.965 107.802 172.913Z"
          fill="#FDFEFD"
        />
        <path
          d="M29.8045 81.1722C26.2879 83.1079 25.7114 88.0381 26.922 88.7164C28.0462 89.3616 27.4409 85.8377 32.341 84.7292C37.27 83.6373 38.1923 82.0325 36.9817 80.7421C36.1746 79.8818 33.4075 79.1704 29.8045 81.1557V81.1722Z"
          fill="#FDFEFD"
        />
        <path
          d="M119.133 165.849C126.512 166.577 141.501 167.752 157.469 165.849C173.438 163.946 151.272 167.222 149.629 168.48C147.986 169.737 142.193 171.358 138.215 170.299C134.208 169.257 131.556 167.785 126.627 168.182C121.727 168.579 110.284 166.478 110.457 165.617C110.63 164.774 113.628 165.27 119.133 165.832V165.849Z"
          fill="#FDFEFD"
        />
        <path
          d="M276.135 155.537C262.847 162.105 224.799 166.092 209.638 165.579C209.638 165.579 238.981 167.002 245.063 165.53C251.145 164.057 250.136 161.327 262.847 162.105C275.559 162.883 285.503 150.888 276.135 155.537Z"
          fill="#FDFEFD"
        />
      </g>
      <mask
        id="path-39-outside-1_2198_7735"
        maskUnits="userSpaceOnUse"
        x="59"
        y="33"
        width="244"
        height="98"
        fill="black"
      >
        <rect fill="white" x="59" y="33" width="244" height="98" />
        <path d="M103.377 73.63C97.1224 73.63 91.6774 71.38 87.8524 67.915L93.8824 60.715C97.4824 63.73 101.172 65.17 104.502 65.17C105.852 65.17 106.797 64.675 106.797 63.775C106.797 62.785 106.212 62.47 101.622 60.76C95.7724 58.6 93.0274 56.53 93.0274 51.895C93.0274 45.82 98.6074 40.87 107.202 40.87C112.827 40.87 117.822 42.67 121.242 45.595L115.212 52.795C112.827 50.86 109.452 49.285 106.122 49.285C104.772 49.285 103.827 49.645 103.827 50.545C103.827 51.49 104.502 51.67 108.867 53.29C114.222 55.27 117.642 57.52 117.642 62.335C117.642 68.68 112.422 73.63 103.377 73.63ZM130.059 73L136.134 50.41H126.864L129.249 41.5H158.319L155.934 50.41H146.664L140.589 73H130.059ZM151.922 73L173.702 41.275H184.142L188.912 73H177.707L177.167 68.77H166.142L163.397 73H151.922ZM170.822 61.3H176.582L175.727 53.65L170.822 61.3ZM195.535 73L203.995 41.5H216.28C222.085 41.5 225.775 42.76 227.89 44.875C229.645 46.63 230.365 48.97 230.365 51.445C230.365 56.35 227.8 60.58 221.59 62.515L225.955 73H214.615L211.105 64H208.495L206.065 73H195.535ZM210.475 56.485H214.3C217.81 56.485 219.655 54.865 219.655 52.885C219.655 52.255 219.43 51.67 218.98 51.22C218.395 50.635 217.36 50.32 215.875 50.32H212.14L210.475 56.485ZM240.861 73L246.936 50.41H237.666L240.051 41.5H269.121L266.736 50.41H257.466L251.391 73H240.861ZM70.9897 123.225L66.7147 91.5H78.2797L79.6297 109.185L90.5197 91.5H102.355L81.0697 123.225H70.9897ZM119.191 123.63C109.921 123.63 103.531 117.42 103.531 109.365C103.531 99.6 111.496 90.87 122.071 90.87C131.341 90.87 137.731 97.08 137.731 105.135C137.731 114.9 129.766 123.63 119.191 123.63ZM119.911 114.36C124.321 114.36 127.156 110.04 127.156 106.08C127.156 102.75 125.131 100.14 121.351 100.14C116.941 100.14 114.106 104.46 114.106 108.42C114.106 111.75 116.131 114.36 119.911 114.36ZM147.462 123L153.537 100.41H144.267L146.652 91.5H175.722L173.337 100.41H164.067L157.992 123H147.462ZM175.493 123L183.953 91.5H194.483L186.023 123H175.493ZM195.403 123L203.863 91.5H213.718L220.873 106.53L224.923 91.5H235.363L226.903 123H217.543L210.073 107.34L205.843 123H195.403ZM254.865 123.675C247.035 123.675 239.295 119.535 239.295 109.635C239.295 99.33 247.395 90.825 260.085 90.825C266.025 90.825 271.11 93.39 273.27 96.045L266.7 102.795C264.9 101.13 262.2 99.96 259.41 99.96C253.425 99.96 249.87 104.055 249.87 109.14C249.87 113.055 252.705 114.99 255.99 114.99C257.115 114.99 258.015 114.81 258.735 114.495L259.77 111.12H254.595L256.305 104.37H271.47L266.97 120.435C263.865 122.28 259.41 123.675 254.865 123.675ZM281.061 113.19L281.916 98.25L283.761 91.5H295.191L293.346 98.25L286.191 113.19H281.061ZM275.796 123L277.956 114.9H288.396L286.236 123H275.796Z" />
      </mask>
      <path
        d="M103.377 73.63C97.1224 73.63 91.6774 71.38 87.8524 67.915L93.8824 60.715C97.4824 63.73 101.172 65.17 104.502 65.17C105.852 65.17 106.797 64.675 106.797 63.775C106.797 62.785 106.212 62.47 101.622 60.76C95.7724 58.6 93.0274 56.53 93.0274 51.895C93.0274 45.82 98.6074 40.87 107.202 40.87C112.827 40.87 117.822 42.67 121.242 45.595L115.212 52.795C112.827 50.86 109.452 49.285 106.122 49.285C104.772 49.285 103.827 49.645 103.827 50.545C103.827 51.49 104.502 51.67 108.867 53.29C114.222 55.27 117.642 57.52 117.642 62.335C117.642 68.68 112.422 73.63 103.377 73.63ZM130.059 73L136.134 50.41H126.864L129.249 41.5H158.319L155.934 50.41H146.664L140.589 73H130.059ZM151.922 73L173.702 41.275H184.142L188.912 73H177.707L177.167 68.77H166.142L163.397 73H151.922ZM170.822 61.3H176.582L175.727 53.65L170.822 61.3ZM195.535 73L203.995 41.5H216.28C222.085 41.5 225.775 42.76 227.89 44.875C229.645 46.63 230.365 48.97 230.365 51.445C230.365 56.35 227.8 60.58 221.59 62.515L225.955 73H214.615L211.105 64H208.495L206.065 73H195.535ZM210.475 56.485H214.3C217.81 56.485 219.655 54.865 219.655 52.885C219.655 52.255 219.43 51.67 218.98 51.22C218.395 50.635 217.36 50.32 215.875 50.32H212.14L210.475 56.485ZM240.861 73L246.936 50.41H237.666L240.051 41.5H269.121L266.736 50.41H257.466L251.391 73H240.861ZM70.9897 123.225L66.7147 91.5H78.2797L79.6297 109.185L90.5197 91.5H102.355L81.0697 123.225H70.9897ZM119.191 123.63C109.921 123.63 103.531 117.42 103.531 109.365C103.531 99.6 111.496 90.87 122.071 90.87C131.341 90.87 137.731 97.08 137.731 105.135C137.731 114.9 129.766 123.63 119.191 123.63ZM119.911 114.36C124.321 114.36 127.156 110.04 127.156 106.08C127.156 102.75 125.131 100.14 121.351 100.14C116.941 100.14 114.106 104.46 114.106 108.42C114.106 111.75 116.131 114.36 119.911 114.36ZM147.462 123L153.537 100.41H144.267L146.652 91.5H175.722L173.337 100.41H164.067L157.992 123H147.462ZM175.493 123L183.953 91.5H194.483L186.023 123H175.493ZM195.403 123L203.863 91.5H213.718L220.873 106.53L224.923 91.5H235.363L226.903 123H217.543L210.073 107.34L205.843 123H195.403ZM254.865 123.675C247.035 123.675 239.295 119.535 239.295 109.635C239.295 99.33 247.395 90.825 260.085 90.825C266.025 90.825 271.11 93.39 273.27 96.045L266.7 102.795C264.9 101.13 262.2 99.96 259.41 99.96C253.425 99.96 249.87 104.055 249.87 109.14C249.87 113.055 252.705 114.99 255.99 114.99C257.115 114.99 258.015 114.81 258.735 114.495L259.77 111.12H254.595L256.305 104.37H271.47L266.97 120.435C263.865 122.28 259.41 123.675 254.865 123.675ZM281.061 113.19L281.916 98.25L283.761 91.5H295.191L293.346 98.25L286.191 113.19H281.061ZM275.796 123L277.956 114.9H288.396L286.236 123H275.796Z"
        fill="url(#paint2_linear_2198_7735)"
      />
      <path
        d="M87.8524 67.915L82.4858 63.4205C80.0715 66.3033 80.366 70.5784 83.1528 73.1029L87.8524 67.915ZM93.8824 60.715L98.3768 55.3485C95.413 52.8662 90.9981 53.2567 88.5158 56.2205L93.8824 60.715ZM101.622 60.76L104.066 54.2004C104.06 54.198 104.053 54.1957 104.047 54.1933L101.622 60.76ZM121.242 45.595L126.609 50.0895C129.073 47.1473 128.709 42.7697 125.792 40.2753L121.242 45.595ZM115.212 52.795L110.802 58.2309C113.771 60.6399 118.124 60.2207 120.579 57.2895L115.212 52.795ZM108.867 53.29L106.432 59.8526L106.44 59.8556L108.867 53.29ZM103.377 66.63C98.8088 66.63 95.0525 64.9923 92.552 62.7271L83.1528 73.1029C88.3022 77.7677 95.4359 80.63 103.377 80.63V66.63ZM93.2189 72.4095L99.2489 65.2095L88.5158 56.2205L82.4858 63.4205L93.2189 72.4095ZM89.3879 66.0815C93.9083 69.8674 99.1346 72.17 104.502 72.17V58.17C103.21 58.17 101.056 57.5926 98.3768 55.3485L89.3879 66.0815ZM104.502 72.17C105.887 72.17 107.828 71.9389 109.683 70.8565C111.816 69.6122 113.797 67.1679 113.797 63.775H99.7974C99.7974 62.7143 100.094 61.6068 100.717 60.6239C101.315 59.6816 102.054 59.0988 102.629 58.7635C103.675 58.1536 104.468 58.17 104.502 58.17V72.17ZM113.797 63.775C113.797 62.7912 113.645 61.0747 112.51 59.3222C111.508 57.7747 110.191 56.9149 109.435 56.4774C108.081 55.6948 106.111 54.9623 104.066 54.2004L99.1786 67.3196C100.327 67.7475 101.134 68.0546 101.725 68.2954C102.361 68.5545 102.499 68.6391 102.428 68.5976C102.391 68.5764 101.507 68.0878 100.758 66.9312C100.358 66.3125 100.095 65.6573 99.9473 65.0259C99.8099 64.4388 99.7974 63.978 99.7974 63.775H113.797ZM104.047 54.1933C102.732 53.708 101.78 53.2951 101.08 52.9253C100.381 52.5563 100.086 52.3093 99.9901 52.2167C99.9346 52.1633 100.004 52.2231 100.055 52.3518C100.095 52.4523 100.027 52.3591 100.027 51.895H86.0274C86.0274 55.8595 87.3141 59.4421 90.2722 62.2945C92.8076 64.7394 96.1506 66.2016 99.1977 67.3267L104.047 54.1933ZM100.027 51.895C100.027 51.1456 100.327 50.329 101.293 49.5474C102.311 48.724 104.221 47.87 107.202 47.87V33.87C96.2033 33.87 86.0274 40.6386 86.0274 51.895H100.027ZM107.202 47.87C111.401 47.87 114.713 49.2214 116.693 50.9147L125.792 40.2753C120.932 36.1186 114.254 33.87 107.202 33.87V47.87ZM115.876 41.1005L109.846 48.3005L120.579 57.2895L126.609 50.0895L115.876 41.1005ZM119.623 47.3591C116.372 44.7215 111.489 42.285 106.122 42.285V56.285C107.416 56.285 109.283 56.9985 110.802 58.2309L119.623 47.3591ZM106.122 42.285C105.03 42.285 103.175 42.3979 101.338 43.3165C100.336 43.8175 99.1497 44.6554 98.219 46.0156C97.2499 47.432 96.8274 49.0247 96.8274 50.545H110.827C110.827 51.6153 110.523 52.8255 109.773 53.9212C109.062 54.9609 108.196 55.54 107.599 55.8385C106.572 56.3521 105.865 56.285 106.122 56.285V42.285ZM96.8274 50.545C96.8274 51.7146 97.0649 53.5657 98.4037 55.3484C99.5055 56.8155 100.879 57.5671 101.521 57.8956C102.717 58.5077 104.588 59.1685 106.432 59.8526L111.303 46.7274C110.163 46.3042 109.374 46.0158 108.743 45.774C108.075 45.5181 107.892 45.429 107.9 45.4331C107.924 45.4457 108.127 45.5492 108.407 45.7544C108.698 45.9671 109.153 46.3481 109.598 46.9412C110.071 47.5708 110.414 48.2814 110.616 49.0189C110.805 49.7067 110.827 50.2632 110.827 50.545H96.8274ZM106.44 59.8556C108.947 60.7825 110.043 61.4561 110.506 61.885C110.663 62.0302 110.649 62.0599 110.617 61.9877C110.585 61.9153 110.642 61.9826 110.642 62.335H124.642C124.642 57.9514 122.955 54.3323 120.02 51.6137C117.434 49.2189 114.143 47.7775 111.295 46.7244L106.44 59.8556ZM110.642 62.335C110.642 63.458 110.239 64.3021 109.419 64.9853C108.516 65.7382 106.659 66.63 103.377 66.63V80.63C109.141 80.63 114.416 79.0468 118.384 75.7384C122.436 72.3604 124.642 67.557 124.642 62.335H110.642ZM130.059 73L123.299 71.1821C122.734 73.2848 123.179 75.5308 124.504 77.2588C125.828 78.9868 127.882 80 130.059 80V73ZM136.134 50.41L142.894 52.2279C143.459 50.1252 143.014 47.8792 141.69 46.1512C140.365 44.4232 138.312 43.41 136.134 43.41V50.41ZM126.864 50.41L120.102 48.6C119.54 50.7019 119.986 52.9459 121.311 54.672C122.636 56.3981 124.688 57.41 126.864 57.41V50.41ZM129.249 41.5V34.5C126.08 34.5 123.307 36.6289 122.487 39.69L129.249 41.5ZM158.319 41.5L165.081 43.31C165.644 41.2081 165.197 38.9641 163.872 37.238C162.547 35.5119 160.495 34.5 158.319 34.5V41.5ZM155.934 50.41V57.41C159.103 57.41 161.877 55.2811 162.696 52.22L155.934 50.41ZM146.664 50.41V43.41C143.498 43.41 140.727 45.5349 139.904 48.5921L146.664 50.41ZM140.589 73V80C143.755 80 146.527 77.8751 147.349 74.8179L140.589 73ZM136.819 74.8179L142.894 52.2279L129.374 48.5921L123.299 71.1821L136.819 74.8179ZM136.134 43.41H126.864V57.41H136.134V43.41ZM133.626 52.22L136.011 43.31L122.487 39.69L120.102 48.6L133.626 52.22ZM129.249 48.5H158.319V34.5H129.249V48.5ZM151.557 39.69L149.172 48.6L162.696 52.22L165.081 43.31L151.557 39.69ZM155.934 43.41H146.664V57.41H155.934V43.41ZM139.904 48.5921L133.829 71.1821L147.349 74.8179L153.424 52.2279L139.904 48.5921ZM140.589 66H130.059V80H140.589V66ZM151.922 73L146.151 69.0381C144.68 71.1805 144.518 73.9614 145.728 76.2609C146.939 78.5604 149.323 80 151.922 80V73ZM173.702 41.275V34.275C171.395 34.275 169.237 35.4114 167.931 37.3131L173.702 41.275ZM184.142 41.275L191.064 40.2342C190.549 36.8087 187.606 34.275 184.142 34.275V41.275ZM188.912 73V80C190.95 80 192.887 79.1116 194.217 77.567C195.547 76.0223 196.137 73.9748 195.834 71.9592L188.912 73ZM177.707 73L170.764 73.8864C171.21 77.3813 174.184 80 177.707 80V73ZM177.167 68.77L184.111 67.8836C183.665 64.3887 180.69 61.77 177.167 61.77V68.77ZM166.142 68.77V61.77C163.771 61.77 161.561 62.9704 160.27 64.9595L166.142 68.77ZM163.397 73V80C165.768 80 167.978 78.7996 169.269 76.8105L163.397 73ZM170.822 61.3L164.929 57.5217C163.548 59.6761 163.453 62.4125 164.68 64.658C165.908 66.9034 168.263 68.3 170.822 68.3V61.3ZM176.582 61.3V68.3C178.574 68.3 180.472 67.4514 181.8 65.9668C183.128 64.4821 183.76 62.5021 183.539 60.5225L176.582 61.3ZM175.727 53.65L182.684 52.8725C182.355 49.9266 180.206 47.5075 177.319 46.8334C174.433 46.1593 171.434 47.3764 169.834 49.8717L175.727 53.65ZM157.693 76.9619L179.473 45.2369L167.931 37.3131L146.151 69.0381L157.693 76.9619ZM173.702 48.275H184.142V34.275H173.702V48.275ZM177.22 42.3158L181.99 74.0408L195.834 71.9592L191.064 40.2342L177.22 42.3158ZM188.912 66H177.707V80H188.912V66ZM184.651 72.1136L184.111 67.8836L170.224 69.6564L170.764 73.8864L184.651 72.1136ZM177.167 61.77H166.142V75.77H177.167V61.77ZM160.27 64.9595L157.525 69.1895L169.269 76.8105L172.014 72.5805L160.27 64.9595ZM163.397 66H151.922V80H163.397V66ZM170.822 68.3H176.582V54.3H170.822V68.3ZM183.539 60.5225L182.684 52.8725L168.77 54.4275L169.625 62.0775L183.539 60.5225ZM169.834 49.8717L164.929 57.5217L176.715 65.0783L181.62 57.4283L169.834 49.8717ZM195.535 73L188.775 71.1843C188.21 73.2868 188.656 75.5322 189.981 77.2597C191.305 78.9872 193.358 80 195.535 80V73ZM203.995 41.5V34.5C200.829 34.5 198.056 36.626 197.235 39.6843L203.995 41.5ZM227.89 44.875L222.941 49.8247L222.941 49.8248L227.89 44.875ZM221.59 62.515L219.508 55.8319C217.628 56.4176 216.082 57.7679 215.248 59.5516C214.415 61.3354 214.371 63.3877 215.128 65.2053L221.59 62.515ZM225.955 73V80C228.295 80 230.481 78.8307 231.779 76.8838C233.077 74.9369 233.317 72.47 232.418 70.3097L225.955 73ZM214.615 73L208.094 75.5434C209.142 78.2307 211.731 80 214.615 80V73ZM211.105 64L217.627 61.4566C216.579 58.7693 213.99 57 211.105 57V64ZM208.495 64V57C205.332 57 202.562 59.1214 201.737 62.1753L208.495 64ZM206.065 73V80C209.229 80 211.999 77.8786 212.823 74.8247L206.065 73ZM210.475 56.485L203.717 54.6599C203.149 56.7632 203.593 59.0111 204.918 60.7408C206.242 62.4706 208.297 63.485 210.475 63.485V56.485ZM218.98 51.22L223.93 46.2703V46.2702L218.98 51.22ZM212.14 50.32V43.32C208.977 43.32 206.207 45.4412 205.382 48.4949L212.14 50.32ZM202.296 74.8157L210.756 43.3157L197.235 39.6843L188.775 71.1843L202.296 74.8157ZM203.995 48.5H216.28V34.5H203.995V48.5ZM216.28 48.5C221.341 48.5 222.757 49.6416 222.941 49.8247L232.84 39.9253C228.793 35.8783 222.83 34.5 216.28 34.5V48.5ZM222.941 49.8248C223.034 49.9183 223.12 50.0384 223.197 50.2528C223.282 50.4893 223.365 50.8758 223.365 51.445H237.365C237.365 47.6308 236.233 43.3184 232.84 39.9252L222.941 49.8248ZM223.365 51.445C223.365 52.6555 223.064 53.4117 222.683 53.9256C222.305 54.4358 221.467 55.2215 219.508 55.8319L223.673 69.1981C227.924 67.8735 231.473 65.5767 233.93 62.2619C236.384 58.9508 237.365 55.1395 237.365 51.445H223.365ZM215.128 65.2053L219.493 75.6903L232.418 70.3097L228.053 59.8247L215.128 65.2053ZM225.955 66H214.615V80H225.955V66ZM221.137 70.4566L217.627 61.4566L204.584 66.5434L208.094 75.5434L221.137 70.4566ZM211.105 57H208.495V71H211.105V57ZM201.737 62.1753L199.307 71.1753L212.823 74.8247L215.253 65.8247L201.737 62.1753ZM206.065 66H195.535V80H206.065V66ZM210.475 63.485H214.3V49.485H210.475V63.485ZM214.3 63.485C217.048 63.485 219.969 62.8595 222.403 61.0948C224.988 59.2202 226.655 56.2747 226.655 52.885H212.655C212.655 52.268 212.805 51.6123 213.126 51.0076C213.442 50.4096 213.848 50.0048 214.185 49.7602C214.819 49.3005 215.062 49.485 214.3 49.485V63.485ZM226.655 52.885C226.655 50.5235 225.779 48.1188 223.93 46.2703L214.031 56.1697C213.082 55.2212 212.655 53.9865 212.655 52.885H226.655ZM223.93 46.2702C221.367 43.707 217.995 43.32 215.875 43.32V57.32C216.158 57.32 216.09 57.3541 215.794 57.2673C215.49 57.1782 214.765 56.9047 214.031 56.1698L223.93 46.2702ZM215.875 43.32H212.14V57.32H215.875V43.32ZM205.382 48.4949L203.717 54.6599L217.233 58.3101L218.898 52.1451L205.382 48.4949ZM240.861 73L234.101 71.1821C233.536 73.2848 233.981 75.5308 235.306 77.2588C236.63 78.9868 238.684 80 240.861 80V73ZM246.936 50.41L253.696 52.2279C254.261 50.1252 253.816 47.8792 252.492 46.1512C251.167 44.4232 249.113 43.41 246.936 43.41V50.41ZM237.666 50.41L230.904 48.6C230.342 50.7019 230.788 52.9459 232.113 54.672C233.438 56.3981 235.49 57.41 237.666 57.41V50.41ZM240.051 41.5V34.5C236.882 34.5 234.109 36.6289 233.289 39.69L240.051 41.5ZM269.121 41.5L275.883 43.31C276.446 41.2081 275.999 38.9641 274.674 37.238C273.349 35.5119 271.297 34.5 269.121 34.5V41.5ZM266.736 50.41V57.41C269.905 57.41 272.679 55.2811 273.498 52.22L266.736 50.41ZM257.466 50.41V43.41C254.3 43.41 251.528 45.5349 250.706 48.5921L257.466 50.41ZM251.391 73V80C254.557 80 257.329 77.8751 258.151 74.8179L251.391 73ZM247.621 74.8179L253.696 52.2279L240.176 48.5921L234.101 71.1821L247.621 74.8179ZM246.936 43.41H237.666V57.41H246.936V43.41ZM244.428 52.22L246.813 43.31L233.289 39.69L230.904 48.6L244.428 52.22ZM240.051 48.5H269.121V34.5H240.051V48.5ZM262.359 39.69L259.974 48.6L273.498 52.22L275.883 43.31L262.359 39.69ZM266.736 43.41H257.466V57.41H266.736V43.41ZM250.706 48.5921L244.631 71.1821L258.151 74.8179L264.226 52.2279L250.706 48.5921ZM251.391 66H240.861V80H251.391V66ZM70.9897 123.225L64.0524 124.16C64.5204 127.633 67.485 130.225 70.9897 130.225V123.225ZM66.7147 91.5V84.5C64.6951 84.5 62.774 85.3722 61.4448 86.8926C60.1155 88.413 59.5077 90.4334 59.7774 92.4348L66.7147 91.5ZM78.2797 91.5L85.2594 90.9672C84.9808 87.3185 81.939 84.5 78.2797 84.5V91.5ZM79.6297 109.185L72.65 109.718C72.8808 112.742 75.0328 115.273 77.9802 115.988C80.9276 116.703 84 115.438 85.5902 112.855L79.6297 109.185ZM90.5197 91.5V84.5C88.0895 84.5 85.8333 85.7604 84.5591 87.8296L90.5197 91.5ZM102.355 91.5L108.168 95.4C109.608 93.2532 109.748 90.4872 108.531 88.2061C107.315 85.9249 104.94 84.5 102.355 84.5V91.5ZM81.0697 123.225V130.225C83.4028 130.225 85.5827 129.063 86.8826 127.125L81.0697 123.225ZM77.927 122.29L73.652 90.5652L59.7774 92.4348L64.0524 124.16L77.927 122.29ZM66.7147 98.5H78.2797V84.5H66.7147V98.5ZM71.3 92.0328L72.65 109.718L86.6094 108.652L85.2594 90.9672L71.3 92.0328ZM85.5902 112.855L96.4802 95.1704L84.5591 87.8296L73.6691 105.515L85.5902 112.855ZM90.5197 98.5H102.355V84.5H90.5197V98.5ZM96.5418 87.6L75.2568 119.325L86.8826 127.125L108.168 95.4L96.5418 87.6ZM81.0697 116.225H70.9897V130.225H81.0697V116.225ZM119.191 116.63C113.289 116.63 110.531 113.075 110.531 109.365H96.531C96.531 121.765 106.553 130.63 119.191 130.63V116.63ZM110.531 109.365C110.531 103.288 115.538 97.87 122.071 97.87V83.87C107.454 83.87 96.531 95.912 96.531 109.365H110.531ZM122.071 97.87C127.973 97.87 130.731 101.425 130.731 105.135H144.731C144.731 92.7345 134.709 83.87 122.071 83.87V97.87ZM130.731 105.135C130.731 111.212 125.724 116.63 119.191 116.63V130.63C133.808 130.63 144.731 118.588 144.731 105.135H130.731ZM119.911 121.36C124.611 121.36 128.313 119.003 130.653 116.078C132.922 113.242 134.156 109.624 134.156 106.08H120.156C120.156 106.248 120.123 106.484 120.033 106.744C119.943 107.003 119.824 107.204 119.721 107.332C119.621 107.457 119.579 107.463 119.64 107.43C119.723 107.387 119.835 107.36 119.911 107.36V121.36ZM134.156 106.08C134.156 103.029 133.219 99.7389 130.833 97.1336C128.365 94.4383 124.948 93.14 121.351 93.14V107.14C121.486 107.14 121.404 107.162 121.19 107.074C120.967 106.982 120.719 106.819 120.509 106.589C120.08 106.121 120.156 105.801 120.156 106.08H134.156ZM121.351 93.14C116.651 93.14 112.949 95.497 110.609 98.4221C108.34 101.258 107.106 104.876 107.106 108.42H121.106C121.106 108.252 121.139 108.016 121.229 107.756C121.319 107.497 121.438 107.296 121.541 107.168C121.641 107.043 121.683 107.037 121.622 107.07C121.539 107.113 121.427 107.14 121.351 107.14V93.14ZM107.106 108.42C107.106 111.471 108.043 114.761 110.429 117.366C112.897 120.062 116.314 121.36 119.911 121.36V107.36C119.776 107.36 119.858 107.338 120.072 107.426C120.295 107.518 120.543 107.681 120.753 107.911C121.182 108.379 121.106 108.699 121.106 108.42H107.106ZM147.462 123L140.702 121.182C140.136 123.285 140.581 125.531 141.906 127.259C143.231 128.987 145.284 130 147.462 130V123ZM153.537 100.41L160.296 102.228C160.862 100.125 160.417 97.8792 159.092 96.1512C157.767 94.4232 155.714 93.41 153.537 93.41V100.41ZM144.267 100.41L137.505 98.6C136.942 100.702 137.389 102.946 138.714 104.672C140.038 106.398 142.091 107.41 144.267 107.41V100.41ZM146.652 91.5V84.5C143.483 84.5 140.709 86.6289 139.89 89.69L146.652 91.5ZM175.722 91.5L182.483 93.31C183.046 91.2081 182.599 88.9641 181.274 87.238C179.95 85.5119 177.897 84.5 175.722 84.5V91.5ZM173.337 100.41V107.41C176.505 107.41 179.279 105.281 180.098 102.22L173.337 100.41ZM164.067 100.41V93.41C160.901 93.41 158.129 95.5349 157.307 98.5921L164.067 100.41ZM157.992 123V130C161.157 130 163.929 127.875 164.751 124.818L157.992 123ZM154.221 124.818L160.296 102.228L146.777 98.5921L140.702 121.182L154.221 124.818ZM153.537 93.41H144.267V107.41H153.537V93.41ZM151.028 102.22L153.413 93.31L139.89 89.69L137.505 98.6L151.028 102.22ZM146.652 98.5H175.722V84.5H146.652V98.5ZM168.96 89.69L166.575 98.6L180.098 102.22L182.483 93.31L168.96 89.69ZM173.337 93.41H164.067V107.41H173.337V93.41ZM157.307 98.5921L151.232 121.182L164.751 124.818L170.826 102.228L157.307 98.5921ZM157.992 116H147.462V130H157.992V116ZM175.493 123L168.733 121.184C168.168 123.287 168.614 125.532 169.938 127.26C171.263 128.987 173.316 130 175.493 130V123ZM183.953 91.5V84.5C180.786 84.5 178.014 86.626 177.193 89.6843L183.953 91.5ZM194.483 91.5L201.243 93.3157C201.808 91.2132 201.362 88.9678 200.038 87.2403C198.713 85.5128 196.66 84.5 194.483 84.5V91.5ZM186.023 123V130C189.19 130 191.962 127.874 192.783 124.816L186.023 123ZM182.253 124.816L190.713 93.3157L177.193 89.6843L168.733 121.184L182.253 124.816ZM183.953 98.5H194.483V84.5H183.953V98.5ZM187.723 89.6843L179.263 121.184L192.783 124.816L201.243 93.3157L187.723 89.6843ZM186.023 116H175.493V130H186.023V116ZM195.403 123L188.643 121.184C188.078 123.287 188.524 125.532 189.849 127.26C191.173 128.987 193.226 130 195.403 130V123ZM203.863 91.5V84.5C200.697 84.5 197.924 86.626 197.103 89.6843L203.863 91.5ZM213.718 91.5L220.039 88.4912C218.878 86.0531 216.419 84.5 213.718 84.5V91.5ZM220.873 106.53L214.553 109.539C215.813 112.185 218.588 113.766 221.506 113.501C224.425 113.236 226.87 111.181 227.632 108.351L220.873 106.53ZM224.923 91.5V84.5C221.759 84.5 218.988 86.6231 218.164 89.6787L224.923 91.5ZM235.363 91.5L242.124 93.3157C242.688 91.2132 242.243 88.9678 240.918 87.2403C239.593 85.5128 237.54 84.5 235.363 84.5V91.5ZM226.903 123V130C230.07 130 232.842 127.874 233.664 124.816L226.903 123ZM217.543 123L211.225 126.014C212.387 128.449 214.845 130 217.543 130V123ZM210.073 107.34L216.391 104.326C215.13 101.683 212.357 100.104 209.44 100.369C206.523 100.634 204.079 102.687 203.316 105.515L210.073 107.34ZM205.843 123V130C209.006 130 211.776 127.879 212.601 124.825L205.843 123ZM202.164 124.816L210.624 93.3157L197.103 89.6843L188.643 121.184L202.164 124.816ZM203.863 98.5H213.718V84.5H203.863V98.5ZM207.398 94.5088L214.553 109.539L227.194 103.521L220.039 88.4912L207.398 94.5088ZM227.632 108.351L231.682 93.3213L218.164 89.6787L214.114 104.709L227.632 108.351ZM224.923 98.5H235.363V84.5H224.923V98.5ZM228.603 89.6843L220.143 121.184L233.664 124.816L242.124 93.3157L228.603 89.6843ZM226.903 116H217.543V130H226.903V116ZM223.861 119.986L216.391 104.326L203.755 110.354L211.225 126.014L223.861 119.986ZM203.316 105.515L199.086 121.175L212.601 124.825L216.831 109.165L203.316 105.515ZM205.843 116H195.403V130H205.843V116ZM273.27 96.045L278.286 100.927C280.764 98.3816 280.942 94.3832 278.7 91.6274L273.27 96.045ZM266.7 102.795L261.947 107.934C264.734 110.512 269.068 110.398 271.716 107.677L266.7 102.795ZM258.735 114.495L261.541 120.908C263.41 120.09 264.829 118.498 265.427 116.547L258.735 114.495ZM259.77 111.12L266.462 113.172C267.113 111.05 266.719 108.744 265.399 106.959C264.079 105.173 261.99 104.12 259.77 104.12V111.12ZM254.595 111.12L247.809 109.401C247.279 111.494 247.745 113.715 249.071 115.419C250.397 117.123 252.436 118.12 254.595 118.12V111.12ZM256.305 104.37V97.37C253.101 97.37 250.306 99.5452 249.519 102.651L256.305 104.37ZM271.47 104.37L278.21 106.258C278.801 104.149 278.371 101.885 277.047 100.14C275.724 98.3951 273.66 97.37 271.47 97.37V104.37ZM266.97 120.435L270.546 126.453C272.092 125.534 273.225 124.055 273.71 122.323L266.97 120.435ZM254.865 116.675C252.066 116.675 249.823 115.92 248.449 114.848C247.314 113.963 246.295 112.53 246.295 109.635H232.295C232.295 116.64 235.146 122.227 239.839 125.887C244.292 129.36 249.834 130.675 254.865 130.675V116.675ZM246.295 109.635C246.295 103.561 250.886 97.825 260.085 97.825V83.825C243.904 83.825 232.295 95.0995 232.295 109.635H246.295ZM260.085 97.825C262.064 97.825 263.889 98.2563 265.351 98.8791C266.896 99.5376 267.663 100.245 267.84 100.463L278.7 91.6274C274.954 87.0232 267.688 83.825 260.085 83.825V97.825ZM268.254 91.1626L261.684 97.9126L271.716 107.677L278.286 100.927L268.254 91.1626ZM271.453 97.6563C268.419 94.8501 264.042 92.96 259.41 92.96V106.96C259.837 106.96 260.327 107.052 260.821 107.25C261.322 107.451 261.709 107.713 261.947 107.934L271.453 97.6563ZM259.41 92.96C254.756 92.96 250.506 94.5907 247.412 97.7273C244.353 100.829 242.87 104.952 242.87 109.14H256.87C256.87 108.243 257.165 107.776 257.379 107.559C257.559 107.377 258.078 106.96 259.41 106.96V92.96ZM242.87 109.14C242.87 112.927 244.315 116.39 247.105 118.816C249.757 121.121 253.036 121.99 255.99 121.99V107.99C255.659 107.99 255.878 107.892 256.291 108.25C256.507 108.438 256.682 108.679 256.787 108.923C256.89 109.16 256.87 109.265 256.87 109.14H242.87ZM255.99 121.99C257.848 121.99 259.745 121.694 261.541 120.908L255.929 108.082C256.105 108.005 256.219 107.981 256.24 107.978C256.257 107.974 256.182 107.99 255.99 107.99V121.99ZM265.427 116.547L266.462 113.172L253.078 109.068L252.043 112.443L265.427 116.547ZM259.77 104.12H254.595V118.12H259.77V104.12ZM261.381 112.839L263.091 106.089L249.519 102.651L247.809 109.401L261.381 112.839ZM256.305 111.37H271.47V97.37H256.305V111.37ZM264.729 102.482L260.229 118.547L273.71 122.323L278.21 106.258L264.729 102.482ZM263.394 114.417C261.331 115.643 258.105 116.675 254.865 116.675V130.675C260.715 130.675 266.399 128.917 270.546 126.453L263.394 114.417ZM281.061 113.19L274.073 112.79C273.963 114.713 274.65 116.596 275.972 117.996C277.294 119.396 279.135 120.19 281.061 120.19V113.19ZM281.916 98.25L275.164 96.4044C275.035 96.8767 274.956 97.3612 274.928 97.8501L281.916 98.25ZM283.761 91.5V84.5C280.606 84.5 277.841 86.6108 277.009 89.6544L283.761 91.5ZM295.191 91.5L301.944 93.3456C302.519 91.2405 302.08 88.9874 300.755 87.2526C299.431 85.5179 297.374 84.5 295.191 84.5V91.5ZM293.346 98.25L299.66 101.274C299.841 100.895 299.988 100.501 300.099 100.096L293.346 98.25ZM286.191 113.19V120.19C288.886 120.19 291.341 118.644 292.505 116.214L286.191 113.19ZM275.796 123L269.033 121.196C268.472 123.298 268.92 125.54 270.245 127.265C271.57 128.989 273.622 130 275.796 130V123ZM277.956 114.9V107.9C274.785 107.9 272.01 110.032 271.193 113.096L277.956 114.9ZM288.396 114.9L295.16 116.704C295.72 114.602 295.272 112.36 293.947 110.635C292.622 108.911 290.571 107.9 288.396 107.9V114.9ZM286.236 123V130C289.408 130 292.183 127.868 293 124.804L286.236 123ZM288.05 113.59L288.905 98.6499L274.928 97.8501L274.073 112.79L288.05 113.59ZM288.669 100.096L290.514 93.3456L277.009 89.6544L275.164 96.4044L288.669 100.096ZM283.761 98.5H295.191V84.5H283.761V98.5ZM288.439 89.6544L286.594 96.4044L300.099 100.096L301.944 93.3456L288.439 89.6544ZM287.033 95.2264L279.878 110.166L292.505 116.214L299.66 101.274L287.033 95.2264ZM286.191 106.19H281.061V120.19H286.191V106.19ZM282.56 124.804L284.72 116.704L271.193 113.096L269.033 121.196L282.56 124.804ZM277.956 121.9H288.396V107.9H277.956V121.9ZM281.633 113.096L279.473 121.196L293 124.804L295.16 116.704L281.633 113.096ZM286.236 116H275.796V130H286.236V116Z"
        fill="black"
        mask="url(#path-39-outside-1_2198_7735)"
      />
      <path
        d="M17.5 148C17.5 142.753 21.7533 138.5 27 138.5H330C335.247 138.5 339.5 142.753 339.5 148V236C339.5 241.247 335.247 245.5 330 245.5H27C21.7533 245.5 17.5 241.247 17.5 236V148Z"
        fill="#11202B"
        fillOpacity="0.8"
        stroke="#00FFD1"
      />
      <path
        d="M115.526 177.592L116.822 180.148L119.438 177.592H120.47L117.158 180.748L118.874 184H117.986L116.618 181.276L113.81 184H112.778L116.27 180.676L114.626 177.592H115.526ZM126.814 184L125.026 180.508H124.738H122.506L121.57 184H120.73L123.07 175.264H126.214C127.294 175.264 128.098 175.528 128.626 176.056C128.998 176.428 129.19 176.944 129.19 177.52C129.19 178.276 128.902 178.9 128.41 179.38C127.786 180.004 126.838 180.292 125.926 180.424L127.786 184H126.814ZM122.698 179.752H125.182C126.418 179.752 127.27 179.428 127.786 178.912C128.158 178.54 128.338 178.096 128.338 177.58C128.338 177.172 128.218 176.848 127.966 176.596C127.594 176.224 127.042 176.032 126.178 176.032H123.706L122.698 179.752ZM135.98 181.072H130.844C130.832 181.18 130.832 181.3 130.832 181.408C130.832 182.608 131.6 183.448 132.8 183.448C133.676 183.448 134.312 183.124 134.924 182.644L135.356 183.184C134.684 183.748 133.904 184.144 132.752 184.144C131.12 184.144 130.004 183.028 130.004 181.432C130.004 180.364 130.46 179.296 131.228 178.528C131.9 177.856 132.752 177.436 133.724 177.436C135.344 177.436 136.184 178.564 136.184 179.896C136.184 180.316 136.112 180.712 135.98 181.072ZM131.828 178.948C131.408 179.368 131.144 179.86 130.964 180.424H135.332C135.368 180.316 135.38 180.148 135.38 179.92C135.38 178.96 134.852 178.144 133.688 178.144C132.956 178.144 132.308 178.468 131.828 178.948ZM137.481 184L139.017 178.312H138.105L138.309 177.592H139.209L139.425 176.764C139.581 176.152 139.797 175.756 140.133 175.432C140.493 175.06 140.973 174.88 141.561 174.88C142.053 174.88 142.497 174.976 142.845 175.156L142.653 175.864C142.257 175.672 141.945 175.588 141.561 175.588C140.901 175.588 140.433 175.984 140.193 176.896L140.001 177.592H142.197L142.005 178.312H139.821L138.285 184H137.481ZM148.638 184.06L147.222 175.264H148.11L149.25 183.004L154.554 175.264H155.502L149.382 184.06H148.638ZM158.511 177.436C160.239 177.436 161.403 178.648 161.403 180.304C161.403 181.324 160.959 182.296 160.239 183.016C159.555 183.7 158.619 184.144 157.611 184.144C155.883 184.144 154.719 182.944 154.719 181.288C154.719 180.268 155.151 179.296 155.871 178.576C156.579 177.892 157.503 177.436 158.511 177.436ZM157.671 183.424C158.403 183.424 159.087 183.076 159.603 182.56C160.191 181.984 160.563 181.18 160.563 180.328C160.563 178.948 159.699 178.168 158.439 178.168C157.719 178.168 157.023 178.504 156.507 179.02C155.919 179.608 155.559 180.412 155.559 181.264C155.559 182.644 156.423 183.424 157.671 183.424ZM164.69 184.108C163.79 184.108 163.142 183.712 163.142 182.848C163.142 182.62 163.178 182.38 163.226 182.2L164.27 178.312H163.358L163.55 177.592H164.462L164.99 175.6H165.806L165.266 177.592H167.366L167.174 178.312H165.074L164.042 182.176C164.006 182.332 163.97 182.536 163.97 182.68C163.97 183.16 164.342 183.388 164.93 183.388C165.182 183.388 165.494 183.316 165.866 183.184L165.662 183.928C165.314 184.06 165.038 184.108 164.69 184.108ZM167.615 184L169.331 177.592H170.135L168.419 184H167.615ZM169.679 176.068L169.931 175.096H170.879L170.627 176.068H169.679ZM170.883 184L172.599 177.592H173.403L173.115 178.696C173.727 177.988 174.411 177.436 175.431 177.436C176.667 177.436 177.495 178.24 177.495 179.452C177.495 179.74 177.435 180.076 177.351 180.4L176.403 184H175.599L176.571 180.352C176.631 180.124 176.667 179.824 176.667 179.596C176.667 178.696 176.103 178.168 175.143 178.168C174.099 178.168 173.019 179.08 172.659 180.376L171.699 184H170.883ZM181.4 186.016C180.236 186.016 179.084 185.596 178.304 184.876L178.844 184.3C179.516 184.912 180.392 185.308 181.4 185.308C182.264 185.308 182.864 185.044 183.284 184.624C183.68 184.204 183.92 183.712 184.112 183.028L184.316 182.308C183.656 182.98 182.876 183.52 181.772 183.52C180.428 183.52 179.144 182.608 179.144 181.06C179.144 180.016 179.564 179.164 180.2 178.528C180.884 177.844 181.808 177.436 182.756 177.436C184.184 177.436 184.808 178.24 185.168 179.056L185.564 177.592H186.368L184.892 183.136C184.616 184.096 184.328 184.66 183.86 185.104C183.248 185.716 182.492 186.016 181.4 186.016ZM181.976 182.8C182.756 182.8 183.5 182.464 184.04 181.9C184.556 181.408 184.868 180.76 184.868 180.088C184.868 179.116 184.076 178.18 182.768 178.18C182.048 178.18 181.34 178.468 180.824 178.996C180.332 179.488 179.996 180.16 179.996 180.976C179.996 182.176 180.968 182.8 181.976 182.8ZM196.059 184L196.371 182.836C195.747 183.568 194.931 184.156 193.839 184.156C192.363 184.156 191.283 183.04 191.283 181.444C191.283 180.244 191.763 179.212 192.483 178.48C193.155 177.82 193.983 177.436 194.895 177.436C196.275 177.436 197.019 178.264 197.367 179.128L198.495 174.892H199.299L196.863 184H196.059ZM194.031 183.424C194.751 183.424 195.483 183.076 196.047 182.512C196.635 181.924 197.031 181.132 197.031 180.268C197.031 179.104 196.191 178.168 194.955 178.168C194.223 178.168 193.575 178.48 193.095 178.948C192.483 179.56 192.135 180.436 192.135 181.36C192.135 182.62 192.915 183.424 194.031 183.424ZM205.566 181.072H200.43C200.418 181.18 200.418 181.3 200.418 181.408C200.418 182.608 201.186 183.448 202.386 183.448C203.262 183.448 203.898 183.124 204.51 182.644L204.942 183.184C204.27 183.748 203.49 184.144 202.338 184.144C200.706 184.144 199.59 183.028 199.59 181.432C199.59 180.364 200.046 179.296 200.814 178.528C201.486 177.856 202.338 177.436 203.31 177.436C204.93 177.436 205.77 178.564 205.77 179.896C205.77 180.316 205.698 180.712 205.566 181.072ZM201.414 178.948C200.994 179.368 200.73 179.86 200.55 180.424H204.918C204.954 180.316 204.966 180.148 204.966 179.92C204.966 178.96 204.438 178.144 203.274 178.144C202.542 178.144 201.894 178.468 201.414 178.948ZM208.759 184.144C207.703 184.144 206.695 183.52 206.695 182.356C206.695 181.744 206.923 181.228 207.319 180.832C207.835 180.316 208.615 180.04 209.575 180.04C210.451 180.04 211.303 180.208 211.939 180.388L211.975 180.232C212.023 180.04 212.071 179.788 212.071 179.608C212.071 178.708 211.447 178.216 210.247 178.216C209.539 178.216 208.999 178.336 208.411 178.564L208.267 177.868C208.903 177.64 209.527 177.496 210.343 177.496C211.939 177.496 212.851 178.24 212.851 179.488C212.851 179.752 212.803 180.04 212.719 180.352L211.747 184H210.967L211.243 182.956C210.631 183.664 209.827 184.144 208.759 184.144ZM208.975 183.472C210.115 183.472 211.339 182.668 211.651 181.468L211.783 180.964C211.171 180.808 210.415 180.676 209.551 180.676C208.867 180.676 208.327 180.892 207.955 181.24C207.679 181.516 207.535 181.864 207.535 182.26C207.535 182.992 208.099 183.472 208.975 183.472ZM219.168 184L219.48 182.836C218.856 183.568 218.04 184.156 216.948 184.156C215.472 184.156 214.392 183.04 214.392 181.444C214.392 180.244 214.872 179.212 215.592 178.48C216.264 177.82 217.092 177.436 218.004 177.436C219.384 177.436 220.128 178.264 220.476 179.128L221.604 174.892H222.408L219.972 184H219.168ZM217.14 183.424C217.86 183.424 218.592 183.076 219.156 182.512C219.744 181.924 220.14 181.132 220.14 180.268C220.14 179.104 219.3 178.168 218.064 178.168C217.332 178.168 216.684 178.48 216.204 178.948C215.592 179.56 215.244 180.436 215.244 181.36C215.244 182.62 216.024 183.424 217.14 183.424ZM222.436 184L224.884 174.892H225.688L223.24 184H222.436ZM225.799 184L227.515 177.592H228.319L226.603 184H225.799ZM227.863 176.068L228.115 175.096H229.063L228.811 176.068H227.863ZM229.066 184L230.782 177.592H231.586L231.298 178.696C231.91 177.988 232.594 177.436 233.614 177.436C234.85 177.436 235.678 178.24 235.678 179.452C235.678 179.74 235.618 180.076 235.534 180.4L234.586 184H233.782L234.754 180.352C234.814 180.124 234.85 179.824 234.85 179.596C234.85 178.696 234.286 178.168 233.326 178.168C232.282 178.168 231.202 179.08 230.842 180.376L229.882 184H229.066ZM243.195 181.072H238.059C238.047 181.18 238.047 181.3 238.047 181.408C238.047 182.608 238.815 183.448 240.015 183.448C240.891 183.448 241.527 183.124 242.139 182.644L242.571 183.184C241.899 183.748 241.119 184.144 239.967 184.144C238.335 184.144 237.219 183.028 237.219 181.432C237.219 180.364 237.675 179.296 238.443 178.528C239.115 177.856 239.967 177.436 240.939 177.436C242.559 177.436 243.399 178.564 243.399 179.896C243.399 180.316 243.327 180.712 243.195 181.072ZM239.043 178.948C238.623 179.368 238.359 179.86 238.179 180.424H242.547C242.583 180.316 242.595 180.148 242.595 179.92C242.595 178.96 242.067 178.144 240.903 178.144C240.171 178.144 239.523 178.468 239.043 178.948Z"
        fill="#95A4AF"
      />
      <path
        d="M339.961 225.936C339.961 237.762 330.374 247.349 318.548 247.349C306.722 247.349 297.135 237.762 297.135 225.936C297.135 214.11 306.722 204.523 318.548 204.523C330.374 204.523 339.961 214.11 339.961 225.936Z"
        fill="#00A285"
        stroke="black"
        strokeWidth="0.6"
      />
      <mask id="path-44-inside-2_2198_7735" fill="white">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M322.473 213.642C328.041 214.899 333.379 212.262 334.397 207.753C335.414 203.244 331.726 198.57 326.158 197.313C320.59 196.057 315.252 198.693 314.234 203.203C313.217 207.712 316.905 212.386 322.473 213.642ZM322.87 209.48C325.921 210.168 328.82 208.839 329.345 206.51C329.871 204.181 327.824 201.736 324.773 201.047C321.722 200.359 318.823 201.688 318.297 204.017C317.772 206.345 319.819 208.791 322.87 209.48Z"
        />
      </mask>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M322.473 213.642C328.041 214.899 333.379 212.262 334.397 207.753C335.414 203.244 331.726 198.57 326.158 197.313C320.59 196.057 315.252 198.693 314.234 203.203C313.217 207.712 316.905 212.386 322.473 213.642ZM322.87 209.48C325.921 210.168 328.82 208.839 329.345 206.51C329.871 204.181 327.824 201.736 324.773 201.047C321.722 200.359 318.823 201.688 318.297 204.017C317.772 206.345 319.819 208.791 322.87 209.48Z"
        fill="#00FFD1"
      />
      <path
        d="M322.473 213.642L322.341 214.227L322.473 213.642ZM314.234 203.203L314.819 203.335L314.234 203.203ZM329.345 206.51L329.931 206.642L329.345 206.51ZM333.812 207.621C332.892 211.697 327.971 214.268 322.605 213.057L322.341 214.227C328.111 215.529 333.867 212.826 334.982 207.885L333.812 207.621ZM326.026 197.898C331.392 199.109 334.732 203.544 333.812 207.621L334.982 207.885C336.097 202.943 332.06 198.03 326.29 196.728L326.026 197.898ZM314.819 203.335C315.739 199.258 320.66 196.688 326.026 197.898L326.29 196.728C320.52 195.426 314.764 198.129 313.649 203.07L314.819 203.335ZM322.605 213.057C317.239 211.846 313.9 207.411 314.819 203.335L313.649 203.07C312.534 208.012 316.571 212.925 322.341 214.227L322.605 213.057ZM328.76 206.378C328.547 207.321 327.846 208.103 326.805 208.581C325.763 209.059 324.411 209.212 323.002 208.894L322.738 210.065C324.38 210.435 326.003 210.269 327.305 209.672C328.607 209.074 329.618 208.027 329.931 206.642L328.76 206.378ZM324.641 201.632C326.049 201.95 327.204 202.67 327.94 203.549C328.675 204.427 328.973 205.435 328.76 206.378L329.931 206.642C330.243 205.257 329.78 203.877 328.86 202.778C327.941 201.68 326.547 200.833 324.905 200.462L324.641 201.632ZM318.883 204.149C319.095 203.206 319.797 202.424 320.838 201.946C321.88 201.468 323.232 201.315 324.641 201.632L324.905 200.462C323.263 200.091 321.64 200.258 320.338 200.855C319.036 201.452 318.025 202.499 317.712 203.885L318.883 204.149ZM323.002 208.894C321.593 208.576 320.438 207.857 319.703 206.978C318.967 206.1 318.67 205.092 318.883 204.149L317.712 203.885C317.399 205.27 317.863 206.65 318.782 207.748C319.702 208.846 321.096 209.694 322.738 210.065L323.002 208.894Z"
        fill="black"
        mask="url(#path-44-inside-2_2198_7735)"
      />
      <rect
        x="321.671"
        y="202.098"
        width="6.08095"
        height="6.08095"
        rx="2.7"
        transform="rotate(18.2975 321.671 202.098)"
        fill="#00A285"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M337.456 224.683C337.456 235.817 328.43 244.843 317.295 244.843C306.161 244.843 297.135 235.817 297.135 224.683C297.135 213.549 306.161 204.523 317.295 204.523C328.43 204.523 337.456 213.549 337.456 224.683Z"
        fill="#00FFD1"
        stroke="black"
        strokeWidth="0.6"
      />
      <g filter="url(#filter0_i_2198_7735)">
        <ellipse
          cx="317.296"
          cy="224.685"
          rx="16.2848"
          ry="16.2848"
          fill="#EBF6F9"
        />
      </g>
      <path
        d="M333.28 224.685C333.28 233.513 326.124 240.67 317.296 240.67C308.467 240.67 301.311 233.513 301.311 224.685C301.311 215.857 308.467 208.7 317.296 208.7C326.124 208.7 333.28 215.857 333.28 224.685Z"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M320.235 217.013L316.044 224.017L319.941 225.52L321.341 217.423C321.454 216.768 320.576 216.442 320.235 217.013Z"
        fill="#704449"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M309.031 227.627L315.625 225.102L318.131 227.607L309.609 229.536C308.399 229.81 307.872 228.071 309.031 227.627Z"
        fill="#704449"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        d="M320.754 225.52C320.754 227.199 319.393 228.561 317.714 228.561C316.034 228.561 314.673 227.199 314.673 225.52C314.673 223.841 316.034 222.48 317.714 222.48C319.393 222.48 320.754 223.841 320.754 225.52Z"
        fill="#00FFD1"
        stroke="black"
        strokeWidth="0.6"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M320.95 211.346C320.615 211.259 320.274 211.461 320.187 211.796L319.874 213.008C319.787 213.343 319.988 213.685 320.323 213.772C320.658 213.858 321 213.657 321.086 213.322L321.4 212.109C321.486 211.774 321.285 211.432 320.95 211.346ZM314.683 235.601C314.348 235.514 314.006 235.716 313.919 236.051L313.606 237.264C313.519 237.598 313.721 237.94 314.056 238.027C314.391 238.113 314.732 237.912 314.819 237.577L315.132 236.364C315.219 236.029 315.017 235.688 314.683 235.601ZM330.395 227.371C330.73 227.458 330.931 227.8 330.845 228.134C330.758 228.469 330.416 228.671 330.082 228.584L328.869 228.271C328.534 228.184 328.332 227.842 328.419 227.508C328.506 227.173 328.847 226.971 329.182 227.058L330.395 227.371ZM306.588 221.866C306.675 221.531 306.474 221.189 306.139 221.102L304.926 220.789C304.591 220.702 304.249 220.904 304.163 221.239C304.076 221.574 304.277 221.915 304.612 222.002L305.825 222.315C306.16 222.402 306.502 222.201 306.588 221.866Z"
        fill="#9E756C"
      />
      <path
        d="M95.621 168L96.097 166.236L101.053 162.82C102.005 162.162 102.481 161.63 102.481 161C102.481 160.356 102.005 159.992 101.249 159.992C100.395 159.992 99.681 160.468 98.911 161.21L97.595 159.838C98.547 158.76 99.793 158.06 101.347 158.06C103.377 158.06 104.693 159.18 104.693 160.762C104.693 161.966 104.133 162.848 102.383 164.066L99.359 166.138H103.475L102.971 168H95.621ZM109.331 168.168C107.035 168.168 105.509 166.558 105.509 164.094C105.509 161.238 107.441 158.032 110.759 158.032C113.055 158.032 114.581 159.642 114.581 162.106C114.581 164.962 112.649 168.168 109.331 168.168ZM109.499 166.222C111.249 166.222 112.369 163.912 112.369 162.092C112.369 160.706 111.669 159.978 110.591 159.978C108.841 159.978 107.721 162.288 107.721 164.108C107.721 165.494 108.421 166.222 109.499 166.222ZM114.31 168L114.786 166.236L119.742 162.82C120.694 162.162 121.17 161.63 121.17 161C121.17 160.356 120.694 159.992 119.938 159.992C119.084 159.992 118.37 160.468 117.6 161.21L116.284 159.838C117.236 158.76 118.482 158.06 120.036 158.06C122.066 158.06 123.382 159.18 123.382 160.762C123.382 161.966 122.822 162.848 121.072 164.066L118.048 166.138H122.164L121.66 168H114.31ZM127.535 168L128.095 165.886H123.559L123.349 164.29L130.111 158.13H132.211L130.601 164.136H131.917L131.441 165.886H130.125L129.565 168H127.535ZM126.079 164.136H128.571L129.411 161L126.079 164.136ZM130.19 169.792L139.724 156.828H141.726L132.192 169.792H130.19ZM143.702 168.168C141.406 168.168 139.88 166.558 139.88 164.094C139.88 161.238 141.812 158.032 145.13 158.032C147.426 158.032 148.952 159.642 148.952 162.106C148.952 164.962 147.02 168.168 143.702 168.168ZM143.87 166.222C145.62 166.222 146.74 163.912 146.74 162.092C146.74 160.706 146.04 159.978 144.962 159.978C143.212 159.978 142.092 162.288 142.092 164.108C142.092 165.494 142.792 166.222 143.87 166.222ZM153.438 168.14C151.422 168.14 149.686 167.048 149.686 165.368C149.686 163.87 150.764 163.044 152.192 162.694C151.422 162.302 151.002 161.574 151.002 160.804C151.002 159.53 152.234 158.06 154.684 158.06C156.728 158.06 158.156 159.166 158.156 160.692C158.156 161.924 157.344 162.82 156.014 163.142C156.896 163.478 157.512 164.192 157.512 165.228C157.512 166.712 156 168.14 153.438 168.14ZM154.53 162.176C155.44 162.176 156.126 161.644 156.14 160.958C156.154 160.342 155.608 159.824 154.586 159.824C153.704 159.824 153.004 160.342 152.99 161.028C152.976 161.672 153.578 162.176 154.53 162.176ZM153.55 166.404C154.6 166.404 155.398 165.9 155.412 165.116C155.426 164.416 154.712 163.912 153.634 163.912C152.556 163.912 151.8 164.458 151.786 165.186C151.772 165.886 152.486 166.404 153.55 166.404ZM156.618 169.792L166.152 156.828H168.154L158.62 169.792H156.618ZM169.015 168L169.575 165.886H165.039L164.829 164.29L171.591 158.13H173.691L172.081 164.136H173.397L172.921 165.886H171.605L171.045 168H169.015ZM167.559 164.136H170.051L170.891 161L167.559 164.136ZM182.833 168.154C180.565 168.154 179.165 166.936 179.165 164.85C179.165 164.36 179.249 163.828 179.403 163.282L180.761 158.2H182.917L181.503 163.478C181.405 163.814 181.349 164.136 181.349 164.542C181.349 165.508 181.951 166.166 183.057 166.166C183.701 166.166 184.233 165.956 184.653 165.55C185.073 165.13 185.395 164.528 185.605 163.73L187.089 158.2H189.245L187.677 164.038C187.341 165.298 186.851 166.264 186.165 166.95C185.367 167.748 184.289 168.154 182.833 168.154ZM190.949 168L193.049 160.188H190.067L190.599 158.2H198.719L198.187 160.188H195.205L193.105 168H190.949ZM202.826 168.168C200.152 168.168 198.206 166.516 198.206 163.898C198.206 160.776 200.866 158.032 204.17 158.032C206.046 158.032 207.306 158.83 208.09 160.118L206.312 161.364C205.738 160.552 205.08 160.02 203.904 160.02C202.112 160.02 200.446 161.728 200.446 163.814C200.446 165.228 201.44 166.18 202.84 166.18C203.792 166.18 204.408 165.802 205.136 165.214L206.536 166.67C205.598 167.538 204.464 168.168 202.826 168.168ZM216.313 168.168C214.017 168.168 212.491 166.558 212.491 164.094C212.491 161.238 214.423 158.032 217.741 158.032C220.037 158.032 221.563 159.642 221.563 162.106C221.563 164.962 219.631 168.168 216.313 168.168ZM216.481 166.222C218.231 166.222 219.351 163.912 219.351 162.092C219.351 160.706 218.651 159.978 217.573 159.978C215.823 159.978 214.703 162.288 214.703 164.108C214.703 165.494 215.403 166.222 216.481 166.222ZM226.54 168.168C224.244 168.168 222.718 166.558 222.718 164.094C222.718 161.238 224.65 158.032 227.968 158.032C230.264 158.032 231.79 159.642 231.79 162.106C231.79 164.962 229.858 168.168 226.54 168.168ZM226.708 166.222C228.458 166.222 229.578 163.912 229.578 162.092C229.578 160.706 228.878 159.978 227.8 159.978C226.05 159.978 224.93 162.288 224.93 164.108C224.93 165.494 225.63 166.222 226.708 166.222ZM233.588 162.736L234.19 160.496H236.458L235.856 162.736H233.588ZM232.174 168L232.776 165.76H235.044L234.442 168H232.174ZM241.237 168.168C238.941 168.168 237.415 166.558 237.415 164.094C237.415 161.238 239.347 158.032 242.665 158.032C244.961 158.032 246.487 159.642 246.487 162.106C246.487 164.962 244.555 168.168 241.237 168.168ZM241.405 166.222C243.155 166.222 244.275 163.912 244.275 162.092C244.275 160.706 243.575 159.978 242.497 159.978C240.747 159.978 239.627 162.288 239.627 164.108C239.627 165.494 240.327 166.222 241.405 166.222ZM251.463 168.168C249.167 168.168 247.641 166.558 247.641 164.094C247.641 161.238 249.573 158.032 252.891 158.032C255.187 158.032 256.713 159.642 256.713 162.106C256.713 164.962 254.781 168.168 251.463 168.168ZM251.631 166.222C253.381 166.222 254.501 163.912 254.501 162.092C254.501 160.706 253.801 159.978 252.723 159.978C250.973 159.978 249.853 162.288 249.853 164.108C249.853 165.494 250.553 166.222 251.631 166.222Z"
        fill="#00FFD1"
      />
      <path
        d="M109.101 227L111.441 218.264H112.197L114.189 223.208L118.833 218.264H119.745L117.393 227H116.565L118.521 219.692L113.925 224.528H113.865L111.873 219.704L109.905 227H109.101ZM126.262 224.072H121.126C121.114 224.18 121.114 224.3 121.114 224.408C121.114 225.608 121.882 226.448 123.082 226.448C123.958 226.448 124.594 226.124 125.206 225.644L125.638 226.184C124.966 226.748 124.186 227.144 123.034 227.144C121.402 227.144 120.286 226.028 120.286 224.432C120.286 223.364 120.742 222.296 121.51 221.528C122.182 220.856 123.034 220.436 124.006 220.436C125.626 220.436 126.466 221.564 126.466 222.896C126.466 223.316 126.394 223.712 126.262 224.072ZM122.11 221.948C121.69 222.368 121.426 222.86 121.246 223.424H125.614C125.65 223.316 125.662 223.148 125.662 222.92C125.662 221.96 125.134 221.144 123.97 221.144C123.238 221.144 122.59 221.468 122.11 221.948ZM127.39 227L129.106 220.592H129.91L129.622 221.696C130.234 220.988 130.834 220.436 131.83 220.436C132.922 220.436 133.51 221.192 133.666 221.948C134.242 221.036 135.118 220.436 136.306 220.436C137.458 220.436 138.274 221.264 138.274 222.452C138.274 222.74 138.19 223.076 138.106 223.4L137.158 227H136.354L137.326 223.352C137.386 223.124 137.422 222.824 137.422 222.596C137.422 221.72 136.882 221.168 136.006 221.168C135.034 221.168 133.954 222.104 133.642 223.376L132.682 227H131.878L132.85 223.352C132.91 223.124 132.946 222.824 132.946 222.596C132.946 221.72 132.406 221.168 131.53 221.168C130.57 221.168 129.478 222.104 129.166 223.376L128.206 227H127.39ZM145.738 224.072H140.602C140.59 224.18 140.59 224.3 140.59 224.408C140.59 225.608 141.358 226.448 142.558 226.448C143.434 226.448 144.07 226.124 144.682 225.644L145.114 226.184C144.442 226.748 143.662 227.144 142.51 227.144C140.878 227.144 139.762 226.028 139.762 224.432C139.762 223.364 140.218 222.296 140.986 221.528C141.658 220.856 142.51 220.436 143.482 220.436C145.102 220.436 145.942 221.564 145.942 222.896C145.942 223.316 145.87 223.712 145.738 224.072ZM141.586 221.948C141.166 222.368 140.902 222.86 140.722 223.424H145.09C145.126 223.316 145.138 223.148 145.138 222.92C145.138 221.96 144.61 221.144 143.446 221.144C142.714 221.144 142.066 221.468 141.586 221.948ZM153.638 227.06L152.222 218.264H153.11L154.25 226.004L159.554 218.264H160.502L154.382 227.06H153.638ZM163.511 220.436C165.239 220.436 166.403 221.648 166.403 223.304C166.403 224.324 165.959 225.296 165.239 226.016C164.555 226.7 163.619 227.144 162.611 227.144C160.883 227.144 159.719 225.944 159.719 224.288C159.719 223.268 160.151 222.296 160.871 221.576C161.579 220.892 162.503 220.436 163.511 220.436ZM162.671 226.424C163.403 226.424 164.087 226.076 164.603 225.56C165.191 224.984 165.563 224.18 165.563 223.328C165.563 221.948 164.699 221.168 163.439 221.168C162.719 221.168 162.023 221.504 161.507 222.02C160.919 222.608 160.559 223.412 160.559 224.264C160.559 225.644 161.423 226.424 162.671 226.424ZM169.69 227.108C168.79 227.108 168.142 226.712 168.142 225.848C168.142 225.62 168.178 225.38 168.226 225.2L169.27 221.312H168.358L168.55 220.592H169.462L169.99 218.6H170.806L170.266 220.592H172.366L172.174 221.312H170.074L169.042 225.176C169.006 225.332 168.97 225.536 168.97 225.68C168.97 226.16 169.342 226.388 169.93 226.388C170.182 226.388 170.494 226.316 170.866 226.184L170.662 226.928C170.314 227.06 170.038 227.108 169.69 227.108ZM172.615 227L174.331 220.592H175.135L173.419 227H172.615ZM174.679 219.068L174.931 218.096H175.879L175.627 219.068H174.679ZM175.883 227L177.599 220.592H178.403L178.115 221.696C178.727 220.988 179.411 220.436 180.431 220.436C181.667 220.436 182.495 221.24 182.495 222.452C182.495 222.74 182.435 223.076 182.351 223.4L181.403 227H180.599L181.571 223.352C181.631 223.124 181.667 222.824 181.667 222.596C181.667 221.696 181.103 221.168 180.143 221.168C179.099 221.168 178.019 222.08 177.659 223.376L176.699 227H175.883ZM186.4 229.016C185.236 229.016 184.084 228.596 183.304 227.876L183.844 227.3C184.516 227.912 185.392 228.308 186.4 228.308C187.264 228.308 187.864 228.044 188.284 227.624C188.68 227.204 188.92 226.712 189.112 226.028L189.316 225.308C188.656 225.98 187.876 226.52 186.772 226.52C185.428 226.52 184.144 225.608 184.144 224.06C184.144 223.016 184.564 222.164 185.2 221.528C185.884 220.844 186.808 220.436 187.756 220.436C189.184 220.436 189.808 221.24 190.168 222.056L190.564 220.592H191.368L189.892 226.136C189.616 227.096 189.328 227.66 188.86 228.104C188.248 228.716 187.492 229.016 186.4 229.016ZM186.976 225.8C187.756 225.8 188.5 225.464 189.04 224.9C189.556 224.408 189.868 223.76 189.868 223.088C189.868 222.116 189.076 221.18 187.768 221.18C187.048 221.18 186.34 221.468 185.824 221.996C185.332 222.488 184.996 223.16 184.996 223.976C184.996 225.176 185.968 225.8 186.976 225.8ZM201.059 227L201.371 225.836C200.747 226.568 199.931 227.156 198.839 227.156C197.363 227.156 196.283 226.04 196.283 224.444C196.283 223.244 196.763 222.212 197.483 221.48C198.155 220.82 198.983 220.436 199.895 220.436C201.275 220.436 202.019 221.264 202.367 222.128L203.495 217.892H204.299L201.863 227H201.059ZM199.031 226.424C199.751 226.424 200.483 226.076 201.047 225.512C201.635 224.924 202.031 224.132 202.031 223.268C202.031 222.104 201.191 221.168 199.955 221.168C199.223 221.168 198.575 221.48 198.095 221.948C197.483 222.56 197.135 223.436 197.135 224.36C197.135 225.62 197.915 226.424 199.031 226.424ZM210.566 224.072H205.43C205.418 224.18 205.418 224.3 205.418 224.408C205.418 225.608 206.186 226.448 207.386 226.448C208.262 226.448 208.898 226.124 209.51 225.644L209.942 226.184C209.27 226.748 208.49 227.144 207.338 227.144C205.706 227.144 204.59 226.028 204.59 224.432C204.59 223.364 205.046 222.296 205.814 221.528C206.486 220.856 207.338 220.436 208.31 220.436C209.93 220.436 210.77 221.564 210.77 222.896C210.77 223.316 210.698 223.712 210.566 224.072ZM206.414 221.948C205.994 222.368 205.73 222.86 205.55 223.424H209.918C209.954 223.316 209.966 223.148 209.966 222.92C209.966 221.96 209.438 221.144 208.274 221.144C207.542 221.144 206.894 221.468 206.414 221.948ZM213.759 227.144C212.703 227.144 211.695 226.52 211.695 225.356C211.695 224.744 211.923 224.228 212.319 223.832C212.835 223.316 213.615 223.04 214.575 223.04C215.451 223.04 216.303 223.208 216.939 223.388L216.975 223.232C217.023 223.04 217.071 222.788 217.071 222.608C217.071 221.708 216.447 221.216 215.247 221.216C214.539 221.216 213.999 221.336 213.411 221.564L213.267 220.868C213.903 220.64 214.527 220.496 215.343 220.496C216.939 220.496 217.851 221.24 217.851 222.488C217.851 222.752 217.803 223.04 217.719 223.352L216.747 227H215.967L216.243 225.956C215.631 226.664 214.827 227.144 213.759 227.144ZM213.975 226.472C215.115 226.472 216.339 225.668 216.651 224.468L216.783 223.964C216.171 223.808 215.415 223.676 214.551 223.676C213.867 223.676 213.327 223.892 212.955 224.24C212.679 224.516 212.535 224.864 212.535 225.26C212.535 225.992 213.099 226.472 213.975 226.472ZM224.168 227L224.48 225.836C223.856 226.568 223.04 227.156 221.948 227.156C220.472 227.156 219.392 226.04 219.392 224.444C219.392 223.244 219.872 222.212 220.592 221.48C221.264 220.82 222.092 220.436 223.004 220.436C224.384 220.436 225.128 221.264 225.476 222.128L226.604 217.892H227.408L224.972 227H224.168ZM222.14 226.424C222.86 226.424 223.592 226.076 224.156 225.512C224.744 224.924 225.14 224.132 225.14 223.268C225.14 222.104 224.3 221.168 223.064 221.168C222.332 221.168 221.684 221.48 221.204 221.948C220.592 222.56 220.244 223.436 220.244 224.36C220.244 225.62 221.024 226.424 222.14 226.424ZM227.436 227L229.884 217.892H230.688L228.24 227H227.436ZM230.799 227L232.515 220.592H233.319L231.603 227H230.799ZM232.863 219.068L233.115 218.096H234.063L233.811 219.068H232.863ZM234.066 227L235.782 220.592H236.586L236.298 221.696C236.91 220.988 237.594 220.436 238.614 220.436C239.85 220.436 240.678 221.24 240.678 222.452C240.678 222.74 240.618 223.076 240.534 223.4L239.586 227H238.782L239.754 223.352C239.814 223.124 239.85 222.824 239.85 222.596C239.85 221.696 239.286 221.168 238.326 221.168C237.282 221.168 236.202 222.08 235.842 223.376L234.882 227H234.066ZM248.195 224.072H243.059C243.047 224.18 243.047 224.3 243.047 224.408C243.047 225.608 243.815 226.448 245.015 226.448C245.891 226.448 246.527 226.124 247.139 225.644L247.571 226.184C246.899 226.748 246.119 227.144 244.967 227.144C243.335 227.144 242.219 226.028 242.219 224.432C242.219 223.364 242.675 222.296 243.443 221.528C244.115 220.856 244.967 220.436 245.939 220.436C247.559 220.436 248.399 221.564 248.399 222.896C248.399 223.316 248.327 223.712 248.195 224.072ZM244.043 221.948C243.623 222.368 243.359 222.86 243.179 223.424H247.547C247.583 223.316 247.595 223.148 247.595 222.92C247.595 221.96 247.067 221.144 245.903 221.144C245.171 221.144 244.523 221.468 244.043 221.948Z"
        fill="#95A4AF"
      />
      <path
        d="M96.2519 211L96.7279 209.236L101.684 205.82C102.636 205.162 103.112 204.63 103.112 204C103.112 203.356 102.636 202.992 101.88 202.992C101.026 202.992 100.312 203.468 99.5419 204.21L98.2259 202.838C99.1779 201.76 100.424 201.06 101.978 201.06C104.008 201.06 105.324 202.18 105.324 203.762C105.324 204.966 104.764 205.848 103.014 207.066L99.9899 209.138H104.106L103.602 211H96.2519ZM109.961 211.168C107.665 211.168 106.139 209.558 106.139 207.094C106.139 204.238 108.071 201.032 111.389 201.032C113.685 201.032 115.211 202.642 115.211 205.106C115.211 207.962 113.279 211.168 109.961 211.168ZM110.129 209.222C111.879 209.222 112.999 206.912 112.999 205.092C112.999 203.706 112.299 202.978 111.221 202.978C109.471 202.978 108.351 205.288 108.351 207.108C108.351 208.494 109.051 209.222 110.129 209.222ZM114.941 211L115.417 209.236L120.373 205.82C121.325 205.162 121.801 204.63 121.801 204C121.801 203.356 121.325 202.992 120.569 202.992C119.715 202.992 119.001 203.468 118.231 204.21L116.915 202.838C117.867 201.76 119.113 201.06 120.667 201.06C122.697 201.06 124.013 202.18 124.013 203.762C124.013 204.966 123.453 205.848 121.703 207.066L118.679 209.138H122.795L122.291 211H114.941ZM128.166 211L128.726 208.886H124.19L123.98 207.29L130.742 201.13H132.842L131.232 207.136H132.548L132.072 208.886H130.756L130.196 211H128.166ZM126.71 207.136H129.202L130.042 204L126.71 207.136ZM130.821 212.792L140.355 199.828H142.357L132.823 212.792H130.821ZM144.333 211.168C142.037 211.168 140.511 209.558 140.511 207.094C140.511 204.238 142.443 201.032 145.761 201.032C148.057 201.032 149.583 202.642 149.583 205.106C149.583 207.962 147.651 211.168 144.333 211.168ZM144.501 209.222C146.251 209.222 147.371 206.912 147.371 205.092C147.371 203.706 146.671 202.978 145.593 202.978C143.843 202.978 142.723 205.288 142.723 207.108C142.723 208.494 143.423 209.222 144.501 209.222ZM154.069 211.14C152.053 211.14 150.317 210.048 150.317 208.368C150.317 206.87 151.395 206.044 152.823 205.694C152.053 205.302 151.633 204.574 151.633 203.804C151.633 202.53 152.865 201.06 155.315 201.06C157.359 201.06 158.787 202.166 158.787 203.692C158.787 204.924 157.975 205.82 156.645 206.142C157.527 206.478 158.143 207.192 158.143 208.228C158.143 209.712 156.631 211.14 154.069 211.14ZM155.161 205.176C156.071 205.176 156.757 204.644 156.771 203.958C156.785 203.342 156.239 202.824 155.217 202.824C154.335 202.824 153.635 203.342 153.621 204.028C153.607 204.672 154.209 205.176 155.161 205.176ZM154.181 209.404C155.231 209.404 156.029 208.9 156.043 208.116C156.057 207.416 155.343 206.912 154.265 206.912C153.187 206.912 152.431 207.458 152.417 208.186C152.403 208.886 153.117 209.404 154.181 209.404ZM157.249 212.792L166.783 199.828H168.785L159.251 212.792H157.249ZM169.789 211.154C168.375 211.154 166.835 210.398 166.163 209.404L167.675 208.13C168.333 208.844 169.061 209.208 169.971 209.208C171.133 209.208 171.959 208.508 171.959 207.682C171.959 206.982 171.385 206.422 170.139 206.422C169.719 206.422 169.187 206.576 168.823 206.73L167.731 205.848L169.257 201.2H175.193L174.675 203.09H170.685L170.125 204.756C170.447 204.686 170.783 204.644 171.119 204.644C172.911 204.644 174.171 205.736 174.171 207.444C174.171 209.39 172.463 211.154 169.789 211.154ZM183.833 211.154C181.565 211.154 180.165 209.936 180.165 207.85C180.165 207.36 180.249 206.828 180.403 206.282L181.761 201.2H183.917L182.503 206.478C182.405 206.814 182.349 207.136 182.349 207.542C182.349 208.508 182.951 209.166 184.057 209.166C184.701 209.166 185.233 208.956 185.653 208.55C186.073 208.13 186.395 207.528 186.605 206.73L188.089 201.2H190.245L188.677 207.038C188.341 208.298 187.851 209.264 187.165 209.95C186.367 210.748 185.289 211.154 183.833 211.154ZM191.949 211L194.049 203.188H191.067L191.599 201.2H199.719L199.187 203.188H196.205L194.105 211H191.949ZM203.826 211.168C201.152 211.168 199.206 209.516 199.206 206.898C199.206 203.776 201.866 201.032 205.17 201.032C207.046 201.032 208.306 201.83 209.09 203.118L207.312 204.364C206.738 203.552 206.08 203.02 204.904 203.02C203.112 203.02 201.446 204.728 201.446 206.814C201.446 208.228 202.44 209.18 203.84 209.18C204.792 209.18 205.408 208.802 206.136 208.214L207.536 209.67C206.598 210.538 205.464 211.168 203.826 211.168ZM217.313 211.168C215.017 211.168 213.491 209.558 213.491 207.094C213.491 204.238 215.423 201.032 218.741 201.032C221.037 201.032 222.563 202.642 222.563 205.106C222.563 207.962 220.631 211.168 217.313 211.168ZM217.481 209.222C219.231 209.222 220.351 206.912 220.351 205.092C220.351 203.706 219.651 202.978 218.573 202.978C216.823 202.978 215.703 205.288 215.703 207.108C215.703 208.494 216.403 209.222 217.481 209.222ZM227.54 211.168C225.244 211.168 223.718 209.558 223.718 207.094C223.718 204.238 225.65 201.032 228.968 201.032C231.264 201.032 232.79 202.642 232.79 205.106C232.79 207.962 230.858 211.168 227.54 211.168ZM227.708 209.222C229.458 209.222 230.578 206.912 230.578 205.092C230.578 203.706 229.878 202.978 228.8 202.978C227.05 202.978 225.93 205.288 225.93 207.108C225.93 208.494 226.63 209.222 227.708 209.222ZM234.588 205.736L235.19 203.496H237.458L236.856 205.736H234.588ZM233.174 211L233.776 208.76H236.044L235.442 211H233.174ZM242.237 211.168C239.941 211.168 238.415 209.558 238.415 207.094C238.415 204.238 240.347 201.032 243.665 201.032C245.961 201.032 247.487 202.642 247.487 205.106C247.487 207.962 245.555 211.168 242.237 211.168ZM242.405 209.222C244.155 209.222 245.275 206.912 245.275 205.092C245.275 203.706 244.575 202.978 243.497 202.978C241.747 202.978 240.627 205.288 240.627 207.108C240.627 208.494 241.327 209.222 242.405 209.222ZM252.463 211.168C250.167 211.168 248.641 209.558 248.641 207.094C248.641 204.238 250.573 201.032 253.891 201.032C256.187 201.032 257.713 202.642 257.713 205.106C257.713 207.962 255.781 211.168 252.463 211.168ZM252.631 209.222C254.381 209.222 255.501 206.912 255.501 205.092C255.501 203.706 254.801 202.978 253.723 202.978C251.973 202.978 250.853 205.288 250.853 207.108C250.853 208.494 251.553 209.222 252.631 209.222Z"
        fill="#00FFD1"
      />
      <defs>
        <filter
          id="filter0_i_2198_7735"
          x="301.011"
          y="208.4"
          width="32.5693"
          height="32.5703"
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
          <feOffset dx="2" dy="4" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.683626 0 0 0 0 0.451193 0 0 0 0 0 0 0 0 0.41 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_2198_7735"
          />
        </filter>
        <linearGradient
          id="paint0_linear_2198_7735"
          x1="178.5"
          y1="1"
          x2="178.5"
          y2="261"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#213441" />
          <stop offset="1" stopColor="#15242F" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2198_7735"
          x1="178.5"
          y1="1"
          x2="178.5"
          y2="261"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#213441" />
          <stop offset="1" stopColor="#15242F" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_2198_7735"
          x1="177"
          y1="31"
          x2="177"
          y2="131"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.295" stopColor="white" />
          <stop offset="1" stopColor="#00FFD1" />
        </linearGradient>
      </defs>
    </svg>
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
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAABYCAYAAAC056qlAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAB7gSURBVHgB7Xx7kBzHed+vZ/Z1u/fYvcPhcHgQRxIACRIQQUKkTLEo4ihLiSPSomzFTv6JKJeTiq1STCWpJHJSEZRKya7EKatUCWWlKiUplSpXXEnEqKLICkUDlBWJNCURhgmCIEHcHV7E63Dv3bvdnWl/39fdMz17Rxkre0lJ5d6bm1fPTPevv/fXMwo9LI+ce+SQVvqIUgpaa/xS+ZfxzsI76YyS80+v/j9ZaFfTT7nraEcrKLPP58xBs2Vr3ZK7Ff+w/9dMFTp2unUaX1j+vfTaEI9/bfxrX0YPSw49Lgya7T7STZ2ck/PpISkOOG0PKq2UhldPWYxsDR2nz1IyUrQdaYUel56C1263gQBCCRo6AUtZUpP9WEDJdDRG7O8qlaBlQaTasYrN9baSuxddq+1Nel56TnlxFEvfmXoc6TlwuMN0PoHOUo7Zlsoe08IQlT0HHThKNoMRE2ZRFCWUF8e9R6/nlGc7LBQTa0cttsMEnHSSqzhOhk5YVvFl5qyylJfcKwoiuZ+rq+k+lvLkUBAGGj0uvac8JgmrDLhzKasxmARCHBmqNIU2rcDXZlvkFx9juacSoal06MlSS6eW2gTwdtz+yZd5nvAn4oiVozzhSKYWxg4ZIhECE0XiKDLdp5U2MjCOU2UjDzAigO9GKDu272npLeW1jWC3RQlbaUOGzF6yH8fasqhCKuVUQmEwctAqGjMQSqdUbOVkRGCyzIOVjXT/nwLKC5RTCNRfLUrDkQRztCgMw6KOylTGzoNQnRCbk4dcIo/yHIgiIpCaOr0uvZd5RooLK8YJ5Rl+ZBkl2tgv5pT6ePUmjM+dw2eIcpeNqZKpp6P1bIvIUCr/Avr1uvT2CW1jrMZWtjlTRYvWhXSYWU1A1PZHoHyytou8kXE8GLXxufYaynEkikXqGcCF8oThtTV52FTRaZ0WWj2XeT0Fr00/6rTpLIGUyikDYGxZzwFSiUP1L0duxwcqY+YGxH27afUlIqktMQ0Cg2uBFuNapywr92nHyoFH6PWcdXsLHsk8seWsPec0ZAogYdAWqhTg/tP2g/jAwLhcax0v2R4nGJ7MB9jCmjkyIOmE8jzqc8+KEuXR09JztnXAxVGcoRLLakJNm3NF/eTEu7C7OIDEkOsgnHFSPE+WcxiDdcMMYin1xZaCY6FOnbhpPSw9l6pJZ+gX6Q4AqbNbwpL6ws0PqD2lQTgLJaU5V8TQIwpU+L2BIsaUTgZDvAw2kB2AkWFd2v7JZ1vuBC/Maoit6WqpZUuuD1/YcwjjhbK9wlEdYF3U9LiFYmsY4PdH+rGb1i5iY9y+2CiVyCinVrOFXpeeKwwnf7hjTsPyRjFYxa9sL2NroWJrKyQGIYxCydomSKy3gSDAp6oLGIzPWOCM6ycKw8m7tyCq8pbIPBbylqVEEZTCZdw59AMBMOuaeZS3kbLU6UYOq7gj/i8Y1S8mA+K0MD+HjPOfbPdMPIwwcV0Vy6VSuII7aieQJ2R15GjN/Vfo7HESVchgqSyQCrvUUwjVGl7R1cRPlgc20fPSM/D01GPVp+vz85+7PPtsPdaHBvOB3je4pO4aPUEoGrbSqkiG7Rba3IRIjSAOSZeGBaZNOlcCbjP3CtqXaLlM160giM4g13oJoZ4m6Nbk/M3BN3CxuAcHq1txob6AfBBOf3Dr7ulf079aVeoT8+hR6Uoj6Yu//huY+e5jshOgijCoIghpm7ift2WfBj8gu4LjaWFIa7tPdXRpFPHAA0SR29Fq7xbQ4riQOP5pkzbgOGU0rl9y7RMotI8gp08Cg9uA0nZTlQeH+Tdqc9CQZYccI6NyntbzQvJyvD0NFzRduXBM3foHn0AXpSvKi8f33a1y+YfU6WeVBC2UiGoTsxSzihsSKjnOpgJHVIhvxY8NR/WafkQ1Gz9LGBQy9834qBsBB2vTdYx1O3enLFwK8SkU9Ql66KIY0NBtZcI4kRKwRO1HQwRW1YAX8zIhN188S5edRbelO7blNo3eJqShTn9LGYffAefibxJnd74/nepDo/SraBUflliexNo6qUw5GdYBXEJtjhrXA+uodq19G9aW9qhC7jRKue8h0PMQ4LjR7BrqiGP19HxLlXKOysKMwtJZLRzUZekOPN2W5IHetMcC+KyN/rhQemhGlJV4EOvV0gfVauXvUsUKklCUCyPZ/wZvjSbZZcsrDcxdX5Aqyyt1qVEo5NFfKaNYzKNWG5R9lSLnDYS5f7O9S5ZS+AJK6ruGPWU02VQSKmRXxIzWwgyweI5FDouVKrosXYFHbDDBMUzNw71pjxBccOaPDYXwjrApjW24RdVr/0S1Cu+AFyuHozITFVa4dOkazp6/hJmzl7BCwAHZJJDbT7FSqFUHMTIyhJ07tmDH9jF3BulwmNJo34s1tQcD+O80jkyF1OpYYvVKcpXzBBxTXMgDTeDlgiH0Ejx5KEMXBOzSE4C7RMoFUwygpLN0q3CXWh77tKG2DuD412y28fLJMzj5yhSarXYCjvMoApch80D0s2bzC0uynH79HPr7yxgfG8Fd79iDSqWvQyKy2B3EAv4+yngGpfg5GNlHlDfPMo7Ay1ngWKmp7qMwXcq8OI2RK5NqYAAl7Dv1bawNvk8tb/5ntu0WOJFbFF8joF4+NY1XLGgOlFKuiVur0xitXMNo3ywGi0sYLCwaHWEwIHlWwLXGCK7UN+Eqrc8vbcNSaxD1egOvT52n5QJuvWUb7trHIJaQlaUaK3gv4iCHcusILHBaWFVZ4AJSakH3rnC3Mo+aFRgWUIEkY1lhqOFbUA8mUQ8nN7hG4/yFK/jOc8cFQJFz1M5tAxfxM1u/h+20NvXsPy8y4NIZxXAN2yoXsK18Ibnt+eWtOHl9L07O75X9MwQgP+f2PRPYv2+XMbg9eVgP3kMxvusoLxw1JhQ3IgzNCDJwYfcyryu44+XPTNGDJmjEDALMqrSstfeo5bUHM+4T35rBOv7yaZw6NZMcu6V6Bu/Z8R2hMBdScqAlYhFYPw0j2dcZpbvYHMDzV9+FV+bvSJ69efMI7r9vHyrlPq/1hhLLs19GefG/GQANaBCblNhX7T7aFR7dGcnL/3aKmjDhQOPGtPUmzK9+GEZzpvJqpbGKb3/nGObmDUgM1s/u/CNs67+Q9MXJNR1ncxF6bY19O1lUsUgqt+iiBdn2eOAvNQfx1LkPY7Ft5H6lXMLDh+6VNTpMxIHZ/4DS6jPOmHcAQt3yRz0Eb+HwlA6CnSzWtaT3BrHYeowiJgOZegzckWe/Txq0LuDcNnwSD277trBfJyVpZuX6CqIrl0n7kVZsNuHSjaaFYoxDlUkBFUpQgzXqPXEYyTCVAdDc84Xr78b35u6XQ4V8DofecxC1oX6XmDO3JDdv6PonkScXL5F5DN7EN3sHXjz/r+eoM1WhOrp0MX4Ea9EtSFuvRIgf/eMf0HpVOnbf+Au4d+x52zkk9p4i0KI3LkBfIplHiR6dYOU24IEHF+RLG14bhRrZSlLbeiseFR5fOIjvXH9Yns924fsevg9lpsDkxsS10RUML35Cq6ABozhI/uWDm9X4H07jBktXISl2b6zLg9X4dgLu5iQT5mJ1z377RdQbawLChsDxcvEC2i++gPjCWfY3jeZWyuZ4FeCvXd5XqRRIOqYXryGeOg597Zx4EAlb09/+ge9jcuTrxJUBcX4kbVpZWc3UaQejqPf9vNW4LPO617bdxfPEuY7I1uzHSnSfFerOhdL405dOo0HAsa3GoN27+Tkzdy62Gf7VVUQnjiOeOSOgKQvaOnAsQBmKs+ybbttl4Qr0+ZeJ/de8QQL2VP4Mh0b+r2DDbfr+sVegvR//LRd/GVG4GVZxaHRZugQvJis90vX4brRJzrmsFT/17LnLODN9QRp7O8m4d44+bxScYycG7mWilOVFYVHlAyMU5kAzx+YbGjPXIcvZOUVrC1zgYecoNKaQ+6VT0I0FJGxAy57SceyvfE/qzc4uiD2Y5o0MFyyUPmZuJJRX6gqOG7bz9NwTVbQoxI2qWtEHgYyjrnDqtRmhuP78Ig5uek7OJRMZVxuIXjom7JVQGjzKsmWagHr1isYp0h3zdWuzWFFfJX3x8fcGFvT1cpHVl56dhq7thCoNJYr5/oGncb09hjdaO3Hq1bPYQmZMIv/Yp8ZeNHN3oBC8ygMzwc3AXzV4eO35j6B20/xqeV9V57MU/urps0RYLQHm4Kbvoj+3kJgfeo2Ae+Ul46A7OredXiVxd+oKtXZW49XLZt+c11mF4W+uUx5a7qtdhcULElBVYcmKOI33DHwVfzD3j2jsYmnrXft3w7dfVoKfQ76vpVRx/IPAU0dxg+WG2Fb/yb0HyIb4LGZfq67g3rTRVBpklly4eFXavWfoBPYMnpARNURDumXqNFn2ax2yy7Df545qfPU4accLFrh1ss+jsEQObiQbfSqO2OFn2Zywb3+wgDtLfyLVuK3cZl95rGEf4r53IM5Vn4j0k0/gBstfCJ5+kYDL4QjbQWuVAxR8HIM/ZWL2+iJW15pCdXcOfd+wKp9jBXHtKsm4hawG9QDaMtQBjtt2fimQpUDVoX39ewZGGIocJBmoVq9Y7W7acqB0lOxM087pmTc8L1BLcLbRmLBz4KLf1fo/fgQ3UH4oePrkz0wgzH2FlirbQfX+93dk/SFCmBs0Xj6P4cJlo1n5RHMN8aVzHdoRGS162xa1/vxGFOcDu64u1u2LXG3OERG2EtuP4MGu/IsEboCLl2bFdUzmqFJ7V5tb2d4khUjHW60vtRr//hB+VPD0yUMT0HmiuHDC5iiwVtifqbO8XCeqM7JuV+W4Z+nT39KCYddApTIsoRizntikMgqDjxXzKgsUNgAsQDrvz67X24l0rjWXGs+07AhPilJrk+xborY7F1Ei0c3NRHQc9OBEfYu6G/8v3fx3B9AteHqKgAs0s+qExLxoaee3iGHpvztxnfxW16+byq+ZhsZGzsSXz2OdndbBcmNVhaEyuW/jCn9jf4B/cCjEP/9boVXEKgOgylCdShWE8kwWnwo54hRzaCuVfWPqDGnVVQHwDQrEpuLH9LvVHBJvh80x3W7XiAKP6MZvTeBNSm49cH+TKK5JKSlW2xYMakgruMUikZL6NbKdAnLVxoozKKhGMpJYoWBAu7m+Q+gAg8pvvC/IUpiLGGYo0j41nWWadeMS1vYB5+1Y/FitBmzbiPqCk5iKD1JAdcX12PaHwGtXUVScCOLZ43K8SpmHI3ru8KSqHZ7uxCrIAvdYFbn4K8KqOUkdUmo+FOe5mb8F/osoEjkhl4dHvZa/lMy9E2WxspiyVKAyMitj3LI46NSgIvjdIY8lvTpZlu243oEa2Ot1I2M4bybq4+Os5Fo2ku2WZrsmKUqTV27zBBumxAlNxEQATrwpeAJcce0INf6AOMkm0mAcZop9tSiY4me92Gfk2ZnckLHCTKIkRQg3lrBOAUjgNvBAQgebvTkVOc1oomBBRtZlr/NAFfrhQ6tWlJib1HDRjlsgAPoWayseIS5vsaKxwDHLMxvHE4gaR/Qb/2JiQ/Aw0Ppdora7hNKsnPNjXbFkwJAYnpzpchRRUKtJYEDSk61mQl3KWzKdhtqA6lJKg8+VCh0GcoD1dqNKFFH2XqxV7fxlWir6ugwiP8MFCxxhSgKe/feIsmy8xAQiR3wE0PYE1NpX9NQT1Qx4evbRL9Lm4y6zb1k2XdMSURolYVs7Xg6U/mA+9WG5RE0PBNupTqHuU4ylKOVAALLIwQPKo1jlUx/8Y8pje2VztaZKXptBZ6UR2YlHhmk0BXYHIIDFbTejgNcyR85EONQB9KkjeuqwAJjTS3/vUxSReNxwSZKzUtoEGZTzFuLVMnwab1s/NWFXzyRQGQXhUYPbZ10aeJ6xMgpCoeNaqCwLBx6QcPPjVQbkNOjgDYKwg32a7SGfZdGTiBplqzTrSHfg3jFMkvi0Jqeh/hXamsy1+9/FY25uq917X/xP5Jm8EiFz4Jp9krVzhUctSKhEm1YnGTMvdATPxgOylGRXeh1oHZ33WVbAMr1w18JTLEl9D+RO8JJ2KyThqaScf950JNZeQ7O+PJU/5X9BXn3sMEHxacV5WPEHrZBkKN1EGQIvUE14Pg2KnLl3sizxE+2yjkVVypJ2rS0Y2nW6M+jpg+Z2OtheWzZVgQd+EtpS1phmwzc0rpqdmeraHbJ8Twx7C2Lgcrlhovntcx1/f0m9+5j4vyItQvXxw0q3PyvzXhksmZBoJspoq7rddK7kJZEwSBpRj2sZSx65YgaojbSj8whSOaeR1dDIUqHD1MpP5cu8Dtb1QRaGiHMJA7TQl7SbCcALj1Jo/rJVlG7ml9JJds3E/I6qB4591DUr0bYqfOITBNh/VXYyDC8cNTY2T0zXLyUvjfCTCvmU8uq6loageE2Jmow9ppxHEGQ7rbyO+iDDo0CPCrVTAJ0aOlnQQcHcngKS8D+1bTHYniinUOY1pwyTi692gBY6ClRkhRxDUX/IG9KskRwW/+njJMye0nEyJUs7asyrJSCNQ8h9Hesu6K0p6Quy/Qk4DijHXutNjM5j2Fje2dYmJkunnag8KvUGR0e5pFl8aDHcnth55VIRKbvwLcnryBm7NqFAsTiCaYSVSXX3scxEyXXumVqrf5RSThN0wwMw+lfUdD68luoDZfRyuVxEazHCrN4FlxWTRuYr0IGjNk+QA+s0ZqqJPdaED0Zyk5Ti3HU+uB2KyD1Xt0rJFDhWmrO52wS4UjEvA5rY/XS2FL1sKM90Rqak0XqGDhBwR9fNMF0XGCAfbl41m5N04TFr68isonJ4QScSTxv7qJ8y8tyQJbWdbKQ+M7eRnxsUBcBEoTjQgo4OZ+JxgFMgWW2pUmrLsHqWPZP6Xh0dk3G/WkzlMYGxnN8hberrK0L7GpAK+bXa2rYmGZ4Lp5AvEnDPTWODsmFURQBsRx8ieTctxqHIwYbKMevqlDsHB8uJMXoe92WUhs4PpRb/ulSi13HfK/DZeR07Yr189O5tlA8y27pZgG9mXC/cjtXcqLSXE+G+d8GcVFKvKjtXjylwmvj2YbX36DTepLxpPE+iCDGYAqeVncNbyU3ZswahHI0OT2fgxlxW7zCNcS/n5Qg8yiVkwHEg+AAiBS0FAPC1rfZkXkaxeHJPtKqdBWLstwDRcsWYhDZUdrHvAbl/oZAjkVPI9KWMH8DO1WOFMY88seoPAc41Bz8MQApGTZLUJQBjVMLXtR8D48dWhyqijK6HezCrdiUeh7A4xQAzSiFQmYiIM1MSk8WBkmmERTKjea375Q2CuUeal4xXyKhvB3BvRzbCTbhYfkDsPh5wR22uL/3Bi1ZBhHNkekyqm384cH8heAbA356m4WMA5/qCs6qorsJCIw+vkNJglc++4uu5D3gGM8zrAOFgQh3Kk2l+uMk8aP2iMjIM8DWpVhuDaDQsUd1COR1Eas+ZgccEXG7nSK3fk3R8yzpl/I4bE0WHv6JufvoYbqDcUPZMANSLv4D4LFHfC0hmCsCo/OHagDR+jjTZTG5SwHPv38TBCKtfo9k2sumcsvDkobIopP4uEqWbodqEfQOHAgEXon11KImisBJjqntj4EHhkMGBMnLOs9COAGaB4TspatD/j9VNX38KN1huCDwpuUukfZdQC75BbV7JfCBhaKBPVD+P6pnio1hVm0zjhWVI42ErS8gkQKk6WLlTYWiPQ1N5Z4FVnVM0pJYBjiq3Lg9SYCRMlEFLlXFsy29K2xi0GomZxKuwbDs8dJIE4Rjam957QxTXNXiq9tQ8a92Awto19U2gw1lmVmDqisIKXi4/nnXXdEiXboGYles0a3ZbdZgzypN1qlNheKzMrNq6SBTXCmx4zCzTtV+gxNVmo2GrFQIwgB/EGOqfIRt2WbNPn8PqNLooXc9JZmoaVt/QC/rdqoVNySme6l8l02VhsYH5/O14tfx3sHv5981Jse5zRBFbEeRIHudWkDVskQHsI+8vWvZFUq9U8JVG1kiOV/NoX6sIcPI4O3AzI7+IC9Wfk6osm/tFUbgRZYukieF+M5tB8WzXG+fDHwU8LaHpQK+o8fg/42zwyfQcjSazb6sVo7HaJM32fuTjOiZW/nfqfVCDo+YwVERKpsR5Dvsqu6M6kXMaE+O5FDg54XsiSIATI3iuD+2FIvyQE5eZ4V8k8D4sl4ZEbbVqGbBmsQvS1SqnyO1cYMFMh/gllu7Q6652FE/L0FHUpRyfRC36Q89sMQ2rDfUJFTKbzAx8CDP9j6Wdch5Iq4z24hjiBgUUdA6+waysBl1nYHsyjkEj3Y/WuSHSqkVry5l7c7WzBNrZ0b8tci6fD7F5eAD2wyxWFsYo5a5jU/lF2nbvoUmwsquX/FQ3lfXpQ1OI9ITx+WIdxX3qTP4zlJYc9W6oJPoyO7dMkVrzUlyleRZ3Xv8siq2rtvUOT7OtchQ/zK8hKFCuICS5WmjDN5RZg+omOfjNUFg0buTS+zh/G0Y5TG15HFeGHpJjbAmM1MpiSrm28RAXwmXcVP068rmGHRCZFY+g8ptd4dEdeKcempKX3azs46WlR/B632+bBJFfl4BZWF6jTLx5Xb3UuoYdC/8TY8vfspxlgYMhSmWv8W6ATKAyuUSnKtirs1i5A69t/RjW8mYgWTFUSYwIcFZMurJz6P+gzFNDODTFL+SIgA0RDPyrHoJ38kEGb6eEqBlA+ZSR1qu4SU33/xtEysgVv9QbLazU0zeHi9E17L7yeQw2Xk4N6uQBKUhOqGdnytt/zs6k9WJlH85t/iUslu9IQOor5UhBFJCJ5tiype//Y7j0Z5AX9QQ8/kRaKDIjGPpUV3h0pzBY5gnlaaTUF6tSPEW522/iYvNRpN02pdyXp7hfTqiQgWgSi5/Y9ili4SvYMfs/BMRi83IKjgXGUKPhS/tVMluHv51XwfWh+3C1Okmg3ZloZiayftKq+VyQ3M9vy2j0NYwUpsT2NO99ca7CJdnjOXRZutS29sMH5l1V7QDU2+5R1e15Xax/S81cvJ8wzsOlnLQkXEiRDJaIhSNKNPNXfojdySh9ffzXpc5A/SWUycQaXDlB0dw6CmtXDGgWS7Yd630TWClO0Ppm1EsTaIf9zg8RCisVQjLUQxPDSyDTyZhsrz+JauMZSpmRvbn5Dth5cJD3gTlTqIIFdFm6pDznNUT84SbzqY/t9zB4nOdQfcUF3LrtCKYuPoBWVIGbr2wNCwrdByjmC2i2IjTbBGA7EvCWiPWWK/txZeTRdY/Unhjw84BMWxx2y+d4ZlVojOvUhHMXU572KrY3P68r7ZdMOH35kkF8dK+zrs1df4QPPXYL3ryJ7zngDhrgjJPIH5lROdJkt44/jUtzd2FuaafpQ2q0CaB5ApFSIES4Adp0nzYB2Y50kjX234T03ypi04M1KLOlmwniYM0qG7Oq6JPY3v4CCvqKAU58SrrJ0iUjEcb2mn3OuUa9Bq/dnpe+GFYlXrjHfJHSvIopEWdOWYZkuW+rPqfKuTdwZXE/mlH6+mgnOHmmHguC+byH2zbrwLlptr5f/BA64BiVAsFoYCz4Kjbpb4BfmhYj2EbXjbwjAmAK5Es27zXEENz4RG5Xun/flhXsjoOaqM544gYw2PSU3TfWcK38uhrue1VfXtyv5hq7CMT+LIUkcsn6rsq8wZm1Lfw6Pk+io44JLY3mj2CEfO8wXkZiLAbW6tZWzjnf1gBoZOCP8HXbrj8None8k+Wc848MUJzT4DRlsh0nX5Xgl5rHKj/QtcIrarm5BZcX7hSNm+18J8t4n7pUSO3CDeuyll3FaOlZbMo/g1CT3yzGOcfmJAtlqE5GPVAZ25G3ly+ZEdm8F92W7sDbds+zLOdM4ekYmHAzQe3HiScEUDO9oUr/qk5GFoJFPdw8qYZXPo+Vwj49m3tIrYYTxGA3eQ/w1Iul0M7X5N0+z2AY7nsNQ8UZ9IfnqSKbO5SY5+8uhDbsosndksX6xjGF1wM1L49huyaiHA2XFaLAq92zbVdG4V+myMyi+aMH0Fz8opk8KSFvtMJRXQ9vVmRoo0lxwCZ5LDwjqx1TNi40RncxVyclsUKJraYmn1RV8m+goBbhcivyKlbU/igwfVSNPzWNt6i8ZeC5or97YIJsliPe7FNlEs2BSzjD7cfVh+iKPJIPyzBV84TrqJ0cA39opkWZvvHfOYq3uHQZwfrLF3X/sWlyjSYJxmm4j0s7d8I6F7amXUnkOPHbNDKG37wKKVnzNgDH5S0Hj4skkbWapM5PmwOsFVTH9yV8PxcqkXfaRv6Umqbo4N2q9pmuQud/leVtAY+LABhGRIEOwA412vHtQTmU2HlEtbGalMTU21jeNvC4qL0EYCm8mzaPQSdeXLo2OQwz5dKZFkxx+cKGU/vf6vK2gseFksvzZDBNEjDrUn7JXFZnwSg1RT7spOr75DR+DMrbDh4XBlDd+syHCKQvmyNJQMq8smv49pgqNe75cQGOy48FeK6onU8/TqtPWw3ickKsS46qQm5SqcM9+5DgT03Rlx85rK89Subc7+go+twX8delu6Kv/vzhqPlbn8Vfl5/O8ufdmUrCkucqJQAAAABJRU5ErkJggg=="
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
