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

export function CoinPc() {
  return (
    <svg
      width="50"
      height="40"
      viewBox="0 0 56 47"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M51.3717 41.4272C47.6996 47.4638 37.6506 48.1534 28.936 42.9766C20.2125 37.7998 16.1195 28.7091 19.7916 22.6725C19.9886 22.3501 20.2036 22.0456 20.4275 21.75L22.2815 18.7049L23.3114 19.3139C28.0852 16.627 35.5458 17.1465 42.2273 21.1141C48.9177 25.0997 52.8854 31.3602 52.7152 36.7878L53.8079 37.4326L51.3807 41.4272H51.3717Z"
        fill="#3E3E49"
      />
      <path
        d="M20.4361 21.4314L20.8213 21.6643L20.8033 21.6911L20.7854 21.709L20.4361 21.4314ZM22.2901 18.3862L21.905 18.1534L22.1378 17.7682L22.523 18.0011L22.2901 18.3862ZM23.3201 18.9953L23.544 19.3804L23.3111 19.5058L23.0872 19.3714L23.3201 18.9863V18.9953ZM52.7149 36.4602L52.482 36.8453L52.2581 36.7109V36.4512L52.7149 36.4602ZM53.8075 37.105L54.0404 36.7199L54.4255 36.9528L54.1927 37.3379L53.8075 37.105ZM51.3804 41.0996L51.7655 41.3324L51.5326 41.7176L51.1475 41.4847L51.3804 41.0996ZM51.3804 41.0996L50.9952 40.8667L51.2281 40.4816L51.6132 40.7144L51.3804 41.0996ZM29.1775 42.2728C33.4676 44.8254 38.0712 45.9091 42.0299 45.6404C45.9886 45.3628 49.2577 43.7327 50.9952 40.8757L51.7655 41.3324C49.8309 44.5119 46.2484 46.2405 42.0837 46.5271C37.919 46.8137 33.1363 45.6673 28.7118 43.0341L29.1775 42.2728ZM20.1854 22.5868C18.4478 25.4438 18.5195 29.0622 20.1316 32.6448C21.7438 36.2273 24.8785 39.7292 29.1686 42.2728L28.7029 43.0341C24.2695 40.401 21.0004 36.7736 19.3076 33.003C17.6149 29.2413 17.4805 25.3005 19.4061 22.121L20.1764 22.5778L20.1854 22.5868ZM20.7944 21.709C20.5794 21.9867 20.3734 22.2733 20.1854 22.5868L19.4151 22.13C19.6211 21.7896 19.845 21.4672 20.0868 21.1627L20.7944 21.709ZM22.6752 18.6191L20.8213 21.6643L20.051 21.2075L21.905 18.1623L22.6752 18.6191ZM23.0872 19.3804L22.0572 18.7713L22.523 18.0101L23.5529 18.6191L23.0872 19.3804ZM42.0031 21.1806C35.4112 17.2667 28.1297 16.8009 23.535 19.3893L23.0962 18.6191C28.058 15.8247 35.6978 16.3979 42.4688 20.4193L42.0031 21.1806ZM52.2671 36.4512C52.4283 31.2386 48.5949 25.1035 42.0031 21.1896L42.4688 20.4283C49.2398 24.4407 53.3329 30.8356 53.1627 36.4691L52.2671 36.4512ZM53.5747 37.4901L52.482 36.8453L52.9477 36.084L54.0404 36.7289L53.5747 37.4901ZM50.9952 40.8757L53.4224 36.8811L54.1927 37.3379L51.7655 41.3324L50.9952 40.8757Z"
        fill="black"
      />
      <path
        d="M31.4377 38.8104C35.7641 41.3719 40.4136 42.4825 44.4258 42.2138C48.438 41.9451 52.294 40.0053 54.0712 37.0855C55.8574 34.1657 55.2507 30.7676 53.6081 27.1492C51.9655 23.5308 48.797 20.011 44.4707 17.4405C40.1353 14.879 35.4858 13.7773 31.4826 14.0371C27.4704 14.3058 24.1224 15.9537 22.3452 18.8735C20.559 21.7933 20.6577 25.4833 22.3003 29.1017C23.9429 32.7201 27.1114 36.2399 31.4377 38.8104Z"
        fill="#A0A0BF"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M32.7603 36.7073C36.2801 38.7941 40.0508 39.6987 43.284 39.4748C46.5262 39.2598 49.1863 37.9253 50.5924 35.6146C51.9986 33.2949 51.9448 30.3572 50.6193 27.4285C49.2937 24.4997 46.7233 21.6337 43.2034 19.5469C39.6836 17.46 35.9129 16.5555 32.6797 16.7794C29.4375 16.9943 26.7774 18.3288 25.3713 20.6396C23.9651 22.9593 24.0189 25.8969 25.3444 28.8257C26.67 31.7544 29.2404 34.6204 32.7603 36.7073Z"
        fill="black"
        stroke="black"
      />
      <path
        d="M32.6442 36.9039C36.1999 39.0176 39.9884 39.9759 43.2306 39.8236C46.4728 39.6714 49.0848 38.6386 50.4641 36.3637C51.8524 34.0887 51.7839 30.9568 50.3867 28.055C48.9985 25.1531 46.3653 22.305 42.8097 20.1913C39.254 18.0776 35.4654 17.1192 32.2232 17.2715C28.981 17.4148 26.3031 18.6687 24.9238 20.9436C23.5356 23.2185 23.6699 26.1383 25.0671 29.0402C26.4553 31.942 29.0885 34.7901 32.6442 36.9039Z"
        fill="#717194"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M39.1694 35.3302C38.7395 34.6656 38.8141 33.7943 39.3507 33.2124L39.8542 32.6664C40.6225 31.8334 41.9702 31.9488 42.5857 32.9004C43.0155 33.565 42.9409 34.4363 42.4043 35.0181L41.9008 35.5641C41.1325 36.3972 39.7848 36.2818 39.1694 35.3302ZM36.403 30.3871L36.4174 30.0662C37.6539 28.4172 37.9994 27.3943 37.4395 26.8843C37.1255 26.5938 36.7152 26.6234 36.2785 27.091C36.005 27.3871 35.774 27.7632 35.6051 28.2759C35.4079 28.8745 34.7923 29.2841 34.1959 29.0803C32.8996 28.6376 32.0255 27.3272 32.5832 26.0761C32.9242 25.3111 33.4044 24.5751 34.026 23.9004C35.7974 21.9789 38.0118 21.7176 39.545 23.1212C41.0836 24.5171 41.5471 26.6827 39.7121 29.4955L40.132 30.3195C40.3223 30.6928 40.2596 31.1452 39.975 31.4527L39.4309 32.0407C39.0358 32.4678 38.3609 32.4686 37.9647 32.0425L36.4059 30.3663L36.403 30.3871Z"
        fill="black"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.91519 31.6805C9.0231 38.4335 20.2647 39.205 30.0135 33.4139C39.7723 27.6227 44.3511 17.4531 40.2432 10.7001C40.0228 10.3395 39.7823 9.9988 39.5318 9.66816L37.4578 6.2616L36.3056 6.94291C30.9653 3.93713 22.6193 4.51824 15.1449 8.95679C7.66047 13.4154 3.22193 20.4189 3.41229 26.4905L2.18994 27.2119L4.90517 31.6805H4.91519Z"
        fill="#00B796"
      />
      <path
        d="M39.5217 9.67788L39.0909 9.93839L39.1109 9.96844L39.131 9.98848L39.5217 9.67788ZM37.4477 6.27133L37.8786 6.01083L37.6181 5.58L37.1872 5.8405L37.4477 6.27133ZM36.2955 6.95264L36.045 7.38347L36.3055 7.52374L36.556 7.37345L36.2955 6.94262V6.95264ZM3.41222 26.4902L3.67272 26.9211L3.9232 26.7708V26.4802L3.41222 26.4902ZM2.18987 27.2116L1.92936 26.7808L1.49854 27.0413L1.75904 27.4721L2.18987 27.2116ZM4.90509 31.6802L4.47426 31.9407L4.73477 32.3716L5.16559 32.1111L4.90509 31.6802ZM4.90509 31.6802L5.33592 31.4197L5.07542 30.9889L4.64459 31.2494L4.90509 31.6802ZM29.7429 32.9928C24.9437 35.8483 19.7938 37.0606 15.3652 36.76C10.9367 36.4494 7.27966 34.6259 5.33592 31.4298L4.47426 31.9407C6.63843 35.4976 10.6461 37.4313 15.3051 37.7519C19.9641 38.0725 25.3144 36.7901 30.2639 33.8444L29.7429 32.9928ZM39.8023 10.9704C41.746 14.1665 41.6659 18.2143 39.8624 22.222C38.0589 26.2297 34.5522 30.1473 29.7529 32.9928L30.2739 33.8444C35.2335 30.8987 38.8905 26.8409 40.7842 22.6228C42.6778 18.4147 42.8281 14.0062 40.674 10.4494L39.8123 10.9604L39.8023 10.9704ZM39.121 9.98848C39.3614 10.2991 39.5919 10.6197 39.8023 10.9704L40.6639 10.4594C40.4335 10.0787 40.183 9.71796 39.9125 9.37731L39.121 9.98848ZM37.0169 6.53183L39.0909 9.93839L39.9526 9.4274L37.8786 6.02084L37.0169 6.53183ZM36.556 7.38347L37.7082 6.70216L37.1872 5.85052L36.035 6.53183L36.556 7.38347ZM15.3953 9.39734C22.7695 5.01892 30.9152 4.49791 36.0551 7.39349L36.546 6.53183C30.9953 3.40581 22.4489 4.04704 14.8743 8.54571L15.3953 9.39734ZM3.91318 26.4802C3.73284 20.649 8.02109 13.7858 15.3953 9.40736L14.8743 8.55572C7.2997 13.0444 2.72089 20.1981 2.91125 26.5003L3.91318 26.4802ZM2.45037 27.6425L3.67272 26.9211L3.15172 26.0694L1.92936 26.7908L2.45037 27.6425ZM5.33592 31.4298L2.6207 26.9612L1.75904 27.4721L4.47426 31.9407L5.33592 31.4298Z"
        fill="black"
      />
      <path
        d="M27.1579 28.7548C22.3286 31.6203 17.1387 32.8627 12.66 32.5622C8.18141 32.2616 4.44422 30.418 2.4604 27.1517C0.466561 23.8855 0.576774 19.7575 2.4103 15.7097C4.24383 11.6619 7.78064 7.72435 12.6099 4.84881C17.4493 1.98329 22.6392 0.750922 27.1078 1.04148C31.5865 1.34206 35.3237 3.18561 37.3075 6.4519C39.3013 9.71819 39.1911 13.8461 37.3576 17.8939C35.524 21.9417 31.9872 25.8793 27.1579 28.7548Z"
        fill="#00FFD1"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M25.7353 26.3995C21.7977 28.734 17.5796 29.7459 13.9626 29.4954C10.3356 29.255 7.3599 27.7621 5.78687 25.1771C4.21384 22.5821 4.27395 19.2958 5.75681 16.0195C7.23966 12.7432 10.1152 9.537 14.0528 7.20251C17.9904 4.86802 22.2085 3.85607 25.8254 4.10655C29.4524 4.34701 32.4282 5.83989 34.0012 8.42486C35.5742 11.0199 35.5141 14.3062 34.0312 17.5825C32.5484 20.8588 29.6729 24.065 25.7353 26.3995Z"
        fill="black"
        stroke="black"
      />
      <path
        d="M25.8654 26.6204C21.8877 28.985 17.6496 30.057 14.0226 29.8867C10.3956 29.7164 7.39984 28.3237 5.85687 25.7788C4.30388 23.2339 4.45417 19.9676 6.01718 16.7213C7.57017 13.4751 10.5158 10.289 14.4935 7.92441C18.4712 5.55986 22.7093 4.48779 26.3363 4.65812C29.9633 4.81843 32.959 6.22113 34.502 8.76603C36.055 11.3109 35.9047 14.5772 34.3417 17.8235C32.7887 21.0697 29.843 24.2558 25.8654 26.6204Z"
        fill="#00D9B2"
        stroke="black"
        strokeWidth="0.5"
      />
      <path
        d="M14.0481 22.5215C14.3776 21.6997 15.2217 21.2052 16.0998 21.3196L16.9236 21.427C18.1807 21.5908 18.9456 22.8965 18.4738 24.0731C18.1442 24.895 17.3001 25.3895 16.4221 25.275L15.5982 25.1677C14.3411 25.0038 13.5763 23.6981 14.0481 22.5215ZM16.7772 16.8025L17.0796 16.6084C19.3843 16.6731 20.5419 16.3281 20.6462 15.4873C20.7088 15.013 20.4168 14.6573 19.7076 14.5602C19.2297 14.4976 18.6996 14.5383 18.0697 14.7489C17.4627 14.9519 16.762 14.6781 16.5813 14.064L16.4775 13.7112C16.0847 12.3767 16.6565 10.8894 18.0127 10.5796C18.9988 10.3544 20.0623 10.2988 21.1676 10.4423C24.0668 10.8196 25.7354 12.6738 25.4434 14.9807C25.1618 17.2875 23.4828 19.1093 19.7285 19.2495L19.2083 20.2385C19.0133 20.6093 18.6078 20.8192 18.1924 20.7644L17.095 20.6195C16.5182 20.5433 16.128 19.9927 16.2472 19.4232L16.798 16.7917L16.7772 16.8025Z"
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
