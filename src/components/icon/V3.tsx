import React from 'react';
import { isClientMobie } from '../../utils/device';

export const ReturnIcon = function (props: any) {
  return (
    <svg
      {...props}
      width="6"
      height="12"
      viewBox="0 0 6 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.31201 1L1.00012 5.85088L5.31201 10.7018"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const AddIcon = function (props: any) {
  return (
    <svg
      {...props}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="11"
        cy="11"
        r="10"
        transform="rotate(-90 11 11)"
        stroke="#91A2AE"
        strokeOpacity="0.2"
        strokeWidth="1.2"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9749 6.77447C11.9749 6.34674 11.6282 6 11.2004 6C10.7727 6 10.426 6.34674 10.426 6.77447V10.4255H6.77447C6.34674 10.4255 6 10.7723 6 11.2C6 11.6277 6.34674 11.9745 6.77447 11.9745H10.426V15.6255C10.426 16.0533 10.7727 16.4 11.2004 16.4C11.6282 16.4 11.9749 16.0533 11.9749 15.6255V11.9745H15.6255C16.0533 11.9745 16.4 11.6277 16.4 11.2C16.4 10.7723 16.0533 10.4255 15.6255 10.4255H11.9749V6.77447Z"
        fill="#586F80"
      />
    </svg>
  );
};

export const SelectIcon = function (props: any) {
  return (
    <svg
      {...props}
      width="12"
      height="6"
      viewBox="0 0 12 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L5.85088 5.31189L10.7018 1"
        stroke="white"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const BgIcon = function (props: any) {
  return (
    <svg
      {...props}
      width="392"
      height="397"
      viewBox="0 0 392 397"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_124_4873"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="392"
        height="397"
      >
        <rect width="392" height="397" rx="12" fill="black" />
      </mask>
      <g mask="url(#mask0_124_4873)">
        <circle
          opacity="0.1"
          cx="375"
          cy="22.8345"
          r="40.8952"
          transform="rotate(45 375 22.8345)"
          fill="url(#paint0_linear_124_4873)"
          stroke="url(#paint1_linear_124_4873)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          opacity="0.1"
          d="M-28 216.348C-23.6273 225.034 -8.32298 242.406 17.913 242.406C50.7081 242.406 63.8261 184 109.739 184C155.652 184 158.932 246 201.565 246C244.199 246 247.478 184 290.112 184C332.745 184 333.565 242.406 368 242.406"
          stroke="url(#paint2_linear_124_4873)"
          strokeWidth="16"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_124_4873"
          x1="375"
          y1="-18.0607"
          x2="375"
          y2="63.7297"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#26343E" />
          <stop offset="1" stopColor="#1D2932" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_124_4873"
          x1="331.902"
          y1="63.7297"
          x2="390.492"
          y2="63.7297"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" />
          <stop offset="1" stopColor="#5B40FF" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_124_4873"
          x1="378.664"
          y1="246"
          x2="94.9946"
          y2="246"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0" />
          <stop offset="1" stopColor="#5B40FF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const SwitchButton = function (props: any) {
  return (
    <svg
      {...props}
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 4.11538H9.65385L6.53846 1"
        stroke="#00C6A2"
        strokeLinecap="round"
      />
      <path
        d="M10 6.88462L1.34615 6.88461L4.46154 10"
        stroke="#00C6A2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const AddButton = function (props: any) {
  return (
    <svg
      {...props}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.40039 0.7C5.40039 0.313401 5.08699 0 4.70039 0C4.31379 0 4.00039 0.313401 4.00039 0.7V4H0.7C0.313401 4 0 4.3134 0 4.7C0 5.0866 0.313401 5.4 0.7 5.4H4.00039V8.7C4.00039 9.0866 4.31379 9.4 4.70039 9.4C5.08699 9.4 5.40039 9.0866 5.40039 8.7V5.4H8.7C9.0866 5.4 9.4 5.0866 9.4 4.7C9.4 4.3134 9.0866 4 8.7 4H5.40039V0.7Z"
        fill="#7E8A93"
      />
    </svg>
  );
};
export const SwitchLRButton = function (props: any) {
  return (
    <svg
      {...props}
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        opacity="0.2"
        cx="12.5"
        cy="12.5"
        rx="11.5"
        ry="11.5"
        transform="rotate(-90 12.5 12.5)"
        stroke="#91A2AE"
        strokeLinecap="round"
      />
      <g opacity="0.5">
        <path
          d="M17.2764 10.6944H7.7233C7.29269 10.6944 6.94431 10.3846 6.94431 10.0017C6.94431 9.61877 7.29269 9.30897 7.7233 9.30897H15.3852L14.1086 8.17366C13.8035 7.90234 13.8035 7.46361 14.1086 7.19421C14.4137 6.92289 14.907 6.92289 15.21 7.19421L17.746 9.44751C17.9342 9.57451 18.0554 9.77463 18.0554 10.0017C18.0554 10.3846 17.707 10.6944 17.2764 10.6944Z"
          fill="#91A2AE"
        />
        <path
          d="M7.72332 13.6574H17.2765C17.7071 13.6574 18.0554 13.9672 18.0554 14.3501C18.0554 14.733 17.7071 15.0428 17.2765 15.0428H9.61453L10.8912 16.1782C11.1963 16.4495 11.1963 16.8882 10.8912 17.1576C10.5861 17.4289 10.0927 17.4289 9.7898 17.1576L7.25377 14.9043C7.06551 14.7773 6.94434 14.5772 6.94434 14.3501C6.94434 13.9672 7.29272 13.6574 7.72332 13.6574Z"
          fill="#91A2AE"
        />
      </g>
    </svg>
  );
};

export const SwitchArrowL = function (props: any) {
  return (
    <svg
      {...props}
      width="13"
      height="5"
      viewBox="0 0 13 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.72332 0.65738H11.2765C11.7071 0.65738 12.0554 0.967185 12.0554 1.35011C12.0554 1.73304 11.7071 2.04284 11.2765 2.04284H3.61453L4.8912 3.17815C5.1963 3.44947 5.1963 3.8882 4.8912 4.15759C4.5861 4.42891 4.09274 4.42891 3.7898 4.15759L1.25377 1.9043C1.06551 1.77729 0.944336 1.57717 0.944336 1.35011C0.944336 0.967185 1.29272 0.65738 1.72332 0.65738Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const SwitchArrowR = function (props: any) {
  return (
    <svg
      {...props}
      width="13"
      height="5"
      viewBox="0 0 13 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.2764 4.69443H1.7233C1.29269 4.69443 0.944309 4.38462 0.944309 4.0017C0.944309 3.61877 1.29269 3.30897 1.7233 3.30897H9.38523L8.10855 2.17366C7.80345 1.90234 7.80345 1.46361 8.10855 1.19421C8.41366 0.922893 8.90702 0.922893 9.20995 1.19421L11.746 3.44751C11.9342 3.57451 12.0554 3.77463 12.0554 4.0017C12.0554 4.38462 11.707 4.69443 11.2764 4.69443Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const ReduceButton = function (props: any) {
  return (
    <svg
      {...props}
      width="10"
      height="2"
      viewBox="0 0 10 2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0.7C0 0.313401 0.313401 0 0.7 0H8.7C9.0866 0 9.4 0.313401 9.4 0.7C9.4 1.0866 9.0866 1.4 8.7 1.4H0.7C0.313401 1.4 0 1.0866 0 0.7Z"
        fill="#7E8A93"
      />
    </svg>
  );
};

export const SwitchIcon = function (props: any) {
  return (
    <svg
      {...props}
      width="13"
      height="14"
      viewBox="0 0 13 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.73335 10.0165C9.73335 10.8358 9.06924 11.4999 8.25002 11.4999C7.4308 11.4999 6.76669 10.8358 6.76669 10.0165C6.76669 9.19733 7.4308 8.53322 8.25002 8.53322C9.06924 8.53322 9.73335 9.19733 9.73335 10.0165ZM11.1741 9.27205C11.2045 9.2684 11.2353 9.26652 11.2667 9.26652L12.2333 9.26652C12.6568 9.26652 13 9.60976 13 10.0332C13 10.4566 12.6568 10.7998 12.2333 10.7998L11.2667 10.7998C11.2325 10.7998 11.1988 10.7976 11.1657 10.7933C10.8231 12.0829 9.64753 13.0332 8.25002 13.0332C6.85251 13.0332 5.67696 12.0829 5.3343 10.7933C5.30128 10.7976 5.26761 10.7998 5.23341 10.7998L0.766754 10.7998C0.343337 10.7998 8.98706e-05 10.4566 8.99077e-05 10.0332C8.99447e-05 9.60976 0.343337 9.26651 0.766754 9.26651L5.23341 9.26652C5.26472 9.26652 5.2956 9.26839 5.32593 9.27204C5.65744 7.96604 6.8409 6.99989 8.25002 6.99989C9.65914 6.99989 10.8426 7.96604 11.1741 9.27205ZM3.26668 3.01657C3.26668 2.19735 3.93079 1.53324 4.75 1.53324C5.56922 1.53324 6.23333 2.19735 6.23333 3.01657C6.23333 3.83579 5.56922 4.49989 4.75001 4.49989C3.93079 4.49989 3.26668 3.83579 3.26668 3.01657ZM4.75 -9.03666e-05C3.3525 -9.04888e-05 2.17694 0.950207 1.83428 2.23986C1.80125 2.23551 1.76757 2.23327 1.73335 2.23327L0.766688 2.23327C0.343271 2.23327 2.38023e-05 2.57652 2.37653e-05 2.99993C2.37283e-05 3.42335 0.343271 3.7666 0.766688 3.7666L1.73335 3.7666C1.76468 3.7666 1.79557 3.76472 1.82592 3.76107C2.15742 5.06707 3.34089 6.03322 4.75001 6.03322C6.15912 6.03322 7.34258 5.06707 7.67409 3.76107C7.70443 3.76472 7.7353 3.7666 7.76662 3.7666L12.2333 3.7666C12.6567 3.7666 12.9999 3.42335 12.9999 2.99993C12.9999 2.57652 12.6567 2.23327 12.2333 2.23327L7.76662 2.23327C7.73242 2.23327 7.69874 2.23551 7.66573 2.23985C7.32307 0.950204 6.14751 -9.02444e-05 4.75 -9.03666e-05Z"
        fill="currentColor"
      />
    </svg>
  );
};
export const SideIcon = function (props: any) {
  return (
    <svg
      {...props}
      width="46"
      height="30"
      viewBox="0 0 46 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="0.772444"
        y1="23.5548"
        x2="45.7724"
        y2="0.554784"
        stroke="#00FFD1"
      />
      <circle cx="7.5" cy="9.5" r="7.5" fill="#00FFD1" />
      <path d="M26.5 13L33.8612 25.75H19.1388L26.5 13Z" fill="#5B40FF" />
    </svg>
  );
};

export const InvalidIcon = function (props: any) {
  return (
    <svg
      {...props}
      width="51"
      height="30"
      viewBox="0 0 51 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="0.767997"
        y1="23.5571"
        x2="21.768"
        y2="12.5571"
        stroke="#00FFD1"
      />
      <line
        x1="50.7671"
        y1="22.4425"
        x2="31.7671"
        y2="12.4425"
        stroke="#00FFD1"
      />
      <line
        x1="31.416"
        y1="4.27735"
        x2="29.416"
        y2="7.27735"
        stroke="#00FFD1"
      />
      <line
        x1="35.1213"
        y1="8.48507"
        x2="31.1213"
        y2="9.48507"
        stroke="#00FFD1"
      />
      <circle cx="8.5" cy="7.5" r="7.5" fill="#00FFD1" />
      <path d="M26.5 13L33.8612 25.75H19.1388L26.5 13Z" fill="#5B40FF" />
    </svg>
  );
};
export const BoxDarkBg = function (props: any) {
  return (
    <svg
      {...props}
      width="417"
      height="82"
      viewBox="0 0 417 82"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_124_5697"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="417"
        height="82"
      >
        <rect width="417" height="82" rx="12" fill="black" />
      </mask>
      <g mask="url(#mask0_124_5697)">
        <circle
          opacity="0.1"
          cx="390.938"
          cy="10.8772"
          r="35.9321"
          transform="rotate(45 390.938 10.8772)"
          fill="url(#paint0_linear_124_5697)"
          stroke="url(#paint1_linear_124_5697)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          opacity="0.1"
          d="M-20 56.3043C-17.4161 61.4879 -8.37266 71.8551 7.13044 71.8551C26.5093 71.8551 34.2609 37 61.3913 37C88.5217 37 90.4596 74 115.652 74C140.845 74 142.783 37 167.975 37C193.168 37 193.652 71.8551 214 71.8551"
          stroke="url(#paint2_linear_124_5697)"
          strokeWidth="12"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_124_5697"
          x1="390.938"
          y1="-25.0549"
          x2="390.938"
          y2="46.8093"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#26343E" />
          <stop offset="1" stopColor="#1D2932" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_124_5697"
          x1="353.071"
          y1="46.8093"
          x2="404.55"
          y2="46.8093"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" />
          <stop offset="1" stopColor="#5B40FF" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_124_5697"
          x1="220.302"
          y1="74"
          x2="52.6786"
          y2="74"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00FFD1" stopOpacity="0" />
          <stop offset="1" stopColor="#5B40FF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const WarningIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="20"
      height="18"
      viewBox="0 0 20 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.1274 6.07879C11.1317 6.04034 11.1339 6.0013 11.1339 5.96175C11.1339 5.36616 10.6336 4.88335 10.0164 4.88335C9.39924 4.88335 8.89893 5.36616 8.89893 5.96175C8.89893 5.96298 8.89893 5.9642 8.89894 5.96543H8.89547L9.1473 11.1058C9.14727 11.1086 9.14726 11.1114 9.14726 11.1141C9.14726 11.5774 9.53639 11.9529 10.0164 11.9529C10.4964 11.9529 10.8855 11.5774 10.8855 11.1141C10.8855 11.1065 10.8854 11.0989 10.8852 11.0913L11.1274 6.07879ZM7.2833 2.47745C8.76956 0.0286533 11.1824 0.0339056 12.6655 2.47745L19.3081 13.4219C20.7943 15.8707 19.6164 17.8559 16.6693 17.8559H3.27955C0.335916 17.8559 -0.842329 15.8655 0.640741 13.4219L7.2833 2.47745ZM10.0164 15.4277C10.6336 15.4277 11.1339 14.9449 11.1339 14.3493C11.1339 13.7537 10.6336 13.2709 10.0164 13.2709C9.39924 13.2709 8.89893 13.7537 8.89893 14.3493C8.89893 14.9449 9.39924 15.4277 10.0164 15.4277Z"
        fill="#DE9450"
      />
    </svg>
  );
};

export const EmptyIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="291"
      height="28"
      viewBox="0 0 291 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        y="12"
        width="291"
        height="8"
        rx="4"
        fill="black"
        fillOpacity="0.1"
      />
      <rect x="106" y="13" width="97" height="6" rx="3" fill="#333F47" />
      <circle
        cx="97"
        cy="14"
        r="13"
        fill="#1C272E"
        stroke="#333F47"
        strokeWidth="2"
      />
      <path
        d="M92.5 11H102"
        stroke="#333F47"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M92.5 17H102"
        stroke="#333F47"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="194"
        cy="14"
        r="13"
        fill="#1C272E"
        stroke="#333F47"
        strokeWidth="2"
      />
      <path
        d="M189.5 11H199"
        stroke="#333F47"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M189.5 17H199"
        stroke="#333F47"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const ColorsBox = (props: any) => {
  return (
    <img
      style={{ width: '100px' }}
      {...props}
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAAA8CAYAAABPXaeUAAAAAXNSR0IArs4c6QAAIABJREFUeF7NfQvMbtlZ1trfmZlSrEXRAQyoyCVoBBsTYxMSJRGNJI3KRSkxpoJG5BohmJZbaKlU0Ch4BVoCbUpnBmaYm0AbL53OFFBDQKSdGSAFiSISgwSqxbSdOd82630u77P298/0zJkpeOZy/sv37W/vtd7L8z7vZW3jsfveuW3bJ+9j/tn2MfZt4Bv8ZNv2fezbNsa+7/Pb+YV+xxfxe79t28a2jX0/7/VFvWFbXzsvVNfZx36qy499O8+/t31+/rbPd8z7GWM7j62+qsvM6237mD+bvxunfex1z/jtvMcdr8Hf83fbfpoXq5+N+h6vnj/Ee+qrM+9S763rb2Oc9/p8XK/uqK5/2rlgdS/zmnO1cJ+6V70H9z3GOPMz52VwLdwJr1/3NO+jroH77c8d4zROfX1/Vn067q/uY36B5/cz+fm4BvgeT8g14bu5/7XG81W8FvYEz4d7xvvqn61WA/sGscG6zlupn8/19xrkWnKtsQe4n1M/F649f3yud2P9uP71Pe6hflaffT7Vhs9/vc91jfweMlH3ON9a9zM/VT/nZ+4n7U7v3XyS83zmbZzmR+L56zp4Zu6znvE8fzIXUT+XDNWdQ/CwZv6+vpEyeVWwOvXjeW1dBsqJ++DS1A5R4+r15/Fj2/iZB1+57ftX7mN8GLRiKmBJDJW8fhAKD2OgD9TrcHPS2Hpc7DA+vn4NrcfX9dopNhRqKBTEh4LnJ5PQSHi9ua1QUGoq6lG5pARTLy2sVq5W4FDkVcFScb1hNFBU1rpnKrF2BIp3eX0YhdV4HZVA723DwKXTvUDhIN4yhFBuWFCKsQX5TMmY4nidgq+1rvvmzmAHsF+1N/oMyJOvX6+YigDDQpOM957rN2VY63dSzFbako+StTPuVMoCAzeVlSawDTOEhwZEhhCvhIR5/0q5Yn37+jbSkjEZrlonvq8+eRrBNCA0CnY4vmatT8lu/Ye7sPFpwzQNOFdZRq3cG8097ZiVvvQPz2WlhzGQDtUXVvC5MhQ3GQS+8NfP2/imbTx632ds107fte/jY+gWaTaw8aWMcMrwuqXk8hoSDv49X0sjodWvfQiEgIvKKtMbaKHssa3wVt6yUdPuytuVDS75sqDAk6yekN9jAw7KVXaobDM9X3keeEx4IzxxCROfwR57nMqjyytTyPC0UJxQjEAjEgbeixQkBRh7CWHTM84t9n3kOknhLZRlqCmk9rJldws5netXtWb1Pb1Je8dGB7U2gSjSK50kTfDYJZPwqERTR6WEEyKCooLrPaUYE2HQw/LabeBDianoQm10G/CmRk2rotPoQTZq/YXUQimhyDKe9uBS3TYIjb6gxHJjyz3SPMLI7dOACDXJ2LVHxhXkmWm1CgS32Fm7Ca9lAOTN7UITCMyvT/v4L7fs4zO38a43v3A88b57xxh/Fo9vHMEv5JaglK2ogPJW9f6K0GKD16aeA/PTgBmUy0JTsMszaCHlZVrxpOzw0IK3Mgrt0Q15JUhWBoqajJGgPGD3KCNCTwLFo/jPHxLGtue6FD4jJ1v3hpS2+iUCp326Oyv3ImD7tPwAgvCoxAxAeWFEoDYzPJLwH2F9bc4JEJ2eNddXClBCJn9A5SacDc9u4wyFVnhkZARHZuXE+tFftXdFGEUDQ4MaSIoIxR6+fJjRnkMvqx8VV3KDEI3eXp8v49/CuhgLKT2wJ++5rnFa4LbCv1pRh08MARiHpoFpGC8DNPdBDjnDXys10W/6RqkVPTdjRNqGMA7hTvGWvtb9HzbGy7bxE6+9dXzI7V84xvbKsY3bKU4Qd5o4aDw+vsIBQ3QCLlprgYwyRkLtRlbT2TcCkOKHl6DVo/cjRC0QKPtAYaTld1zbsWFFdx1zTiWw1wjligW3R1YIIUMz/SdjUBuVUjTyAFABoIqA02VKFoWT0Ab3QC+I6IYetGJzcAqEulQoGhQboFJeqFQpubxQG02iEaxFoRXH04Kj9tSMobe6ogQkYCvW1r7YfEXJg2NtesYFMmPXcu3KfJ1LJ6jsvSbypoTPJYaE9oyTCY/DeHdolEYXMXpFxjRgvjb2lgyDYnPxOUQVgt1cveZ6ADvEARBRaI/qiQrlzDeYHxKCEZQPZNeQvOE4FZfb4NhfmEEcmbaJ2oQwWTRYoICxj/8xxvjqJz5i3Ant/7n7/+R2fXvDGPsf0Qa2KVY4DhAOtwIs37il0TkpGAj/wcu3mjP+L6GmQgEGiUAB+VXfp0dvoUOM27EuXo+lVozK17SgcPPLe68b2hCVRsBCIoJJG0/qAbCdgLVILyoof18EHqEquIEimbZdz6l4dxI7eB3jXD6jSSd5AXrHeT+MyQFWCwYfQhPsNuB1KKSNBQ1ix/YOFRpi9vOAf9Du9H1K0VcPL4Qhj14WX+FmQ3cbgYC1chgRjlwQkkQKV0Fmw+vpRcpYHa9Nl+GwaRoP8kkwChBphn90GhR4hibmCMBX6DMpd00Ek5xrY0eGg9enH5QttitdlDgV3woJAhTsb5NuFHvIUtvsn3riNP7CPQ9tv9yq+Ni9PzDG6XPMkmdwP50W4C7iMep5Bw5UYQNfGKmV1NM9WBWDTRZMbYFl/ENWvaH64u3IFQAuyuLTijYOgOcxc88I2EoAYZhWWDG3oVbH+wAzvCbj72bFDfEMA03kLB6xEIaRAgyQMAgUEvs37xVEpWN0kX1+OrHNEepURFbXbHKsCaVgg8VgS2hlnBxrS6hpeCeGOMNJlnBT6YmkTMRNEm4SrhZ+KVQanLlWIr2IhMoHI0QpZNF7P41YmUmy6kDIk9S6UtHp7Ssmplfv8ChCwtwvxfYyDJExgKTqvw5F2iA4e0PmHsoP3qczD21sez0dBCdcV9Qs9c/vZe8Pr484XnhZWrjvp/GGO9+2/Q1cTn8eve+vj2179bZtf6B8ouJYarWzZHLmeJ64RKTluAv06rX5RRAtLp1xofzZATqTPKPn5QaTcCpoRKjb0H+SVfyAtuSEGjAkGV8DNtOT+msw51COVshQx0IRZRjomXknDVMNx5NvMHw3M4zQJglCeR/Fwv091wKGMcIYeVIZCxsDYJ0mChO6ixeW/yLfgVQbzYLQyuJZxTeQ7FP6rlNzZK07Xu7sSd2PU51SAhlBkX4IH+B1S6F5H6RbN3ANioONURX+MGVW90nFS16Bor6EJQqd5j1X5A2hPkuWFArimRxK0KCY75AaLfeXBqKQqTMQ5q3wkk6MSZ0OTPzi5R1EK5hmek/Bf4cEP7+N8fI7HtnuXxX9sX/1R8d2/u6x7y+m+w/XKxCDFNpBYVPZG8Pz6orpGeJjicpYEBo2C8oUmUkdgXd4vkzDOTZUXNqWV3BW8KuIH8Flx+aGwU3UKKKVF9edUjDsGR2bZlzYXytuJDaxoZlE31RsQX5BOuKLvQwHGVkjFMX+DD6Qz5cyALgtwhbGR0ZBCtOEl+41iKvy8NxWrG2mOJfagzKB5wJ18nYgaZXzdwztfD1eB28f0LjvI5h9mvCoIwAjQTh9XHMqEHkZrz33uUMKx8oQXe6xrru8DwbQhFZnWTJPXw6BgRt4lXlZoBFyAw3dhdq0VwLhqxohF26mPY2BFT0MQIlrfp/QHvD9rfsT46/c+aPbr6+KPr977P7XjrF/IbcRwSPUmMUyTsDpYxalV3GN3wWPj1WgcudFl5yo0z/kJjJfKuBGiF2MtTezIZmi0o4dWThRxFXJmFNsgQQills9eSuHAfaEjagrAEhF6iQIwEqD1cNO6J2FEri2oLXvhUUrF+m1MGb6hFCuJTuxxLH22MYh5TVkPOTpC9ziLp22E+JRYdGCGCJ95z3se2R+fYXuivf5eqTgZi4ZNRSA8IkITPwRW4QMeL/sNecVhMrIC5RUkvmfXwfPgf0ArdShWYQzCoGaZBRwpnEl37GEJwfDw6wDctEnkoH5eby/UPGjR1dyail4aT1E6CIwEzF8PToVdhvj+nkb/+Suh7e/q49avfPjD3zWGOM1IOX6T1mX+gAATqXVlIXt7xnLi+smxi7IA5ByuOjqCSXIULDYhPI2K8w95pUNxZUia8/SFtWEknhMVkcxv1DCD0a48vdWdHn7hPiK6SumJjdCuHyaBCIFDbYuQ4cKCcCH82+kzIJtF8pZhE8ekt6xXh7pNQl25pMRUBApJEtOIxCMuu6n05bt1UF0LkoBtMV0aP3uPPcX8JeGlqwx3QYVFMiI8Svjcaf3GsPJ+IK34H3ic8hBKb6PDIeLhBgmFOVqkrcNX5N0wecYuTE0KIkDEex6gqNMicVP9BcFM+1wtNdBjtr5sQiGCkyFJclVYrJG6hlum6igaokb2MZPXd/HK+56ZPu3Vyv6O37g47Zrt/zLsY3PWK7eSh5s+mXRDGmYtSJuoQis5xAd5pLL2u77ZgVJpluCq5jw6CUVSUyWWQrm90dsfGXKqGEc+fMFIgr+1t+ZY4flDsiK8A4sLNRXSlA/X9DEYsDA8yrPXV4WVxCcNawECeUFNMPMoheQeIfUXBtIst2sDo0ioYjv+YxaM5WdBjEnWmwpFWZMPEkzIBmmnPJ9B5jumDZ4CRj3Q/lqhSpYI+AhEF0oOcZaVAlqpDwVhixoAxkSGhkbrcWQZ0rsolw3Q0QRgwfvDEPWYU99xTAUFXFLKXMoIGBvJq6OZa180mDTTa4tBTQU52v7uPtDXzi+4HU/uP3fqxV9/vSx+14ztvG1bTjE4vMtobiCTjAk4axJe9XPzdepeIL7duklsBHNBONhghBSjAuGnBAaXjYq1ECwyXj09ZhHhyCI1pL3aZY80nxd5w3mbBHiurcWZuTOAXjm10tBTwp/P1OnZ/Ja+HqtpMq4XGRf1AikwC4wP0qC/XMXGi0ICbKGkARGq8hO5X8r5BCZiWxAp6Go2HiXYb9JSdWNm+rjPgfZucgCk6TiJ4zsrPLmA4QQiQA74xAGR/dUjoTrLL4l2f+E81xPIxIZCKbsxqnCjkBlVyCw0hrxFiB3lfZ1bM0yh1IchbcCvorRFYeDCaRpK3BtL96F5UDe79u28ao7Ht6+ZdHJ/Ka+fuz+Tx9bvehPkBO8eAkYlSsK7xOdu1QFJDWweEboYFczZhQ875hTxuXgJQjjVwjWtqsFH97gsilGvqBU3gxthwcXXleevkkqFX0IKRxivM6xwzvbiBkC01OhIacNXBNwUrdD4Q4ZAcXMJOhsEGlI4KnXElgYvc4GXHhfvxceVJAZJRPB5KMOIYwwUjGG1rXq8MbwpCJYacQEdVk5B/SC31ElXAgEg92hzbK3q4FvA0CeIpUN1WwCpDtShAidwNt0bG6HI7Xq0KVkSf51NdTMAuEZauUbRRDiY71V9dU+UL6QBFtnuOk+5UUTHF9Ewf2DH93HePldj2z/4ekV/fF7f984n75tO20vrb1UyY0/5QDZo2b20iI4rqdzbjNU/lj5UXgeNLgYArte2x5jFWbGvblBi5CTlKHiiPMVi3qIOb3hC4EjIRBkVkhAuE243x5Y6lFQ/9jMkVBflYMUoYLltQIQeMf0xh4QvoTuyrcTm8CYCc5inS8LZgjvS++cXpRCm2nmOleGAKQdk09tlBijr0aMINqZDBhiFiBQ0bAPbdxk5FSBBrKssygyRno2VNZ1HI17Be/RXWuUIiI7/XxFiGrGUcig1Kqu3eRduTUQh0jdFSG3VtbRKy+8DlYNxHHK38JWtYJCB0j5V5qvu8CUnbazZMGMHK6qm8b1bXzH9d87vvyee7brT6/o87eP3veV2zb+sXpEjC0Mw2XVCF+o7OQCXDVnaAWfxf/xydhb17HTAcotrHvDWcaBC7Q1FEuPND+G3XBXVci1tc7ikCBnFqJqXqtwyWr5UUfeLLyNDrf9iFho64NpBmgTGUdFFRmJ0IhwmtVv9KQMIxp5JCqwEUsyro2AynadgQDVFpV3BwQSZFR2yi2hlso+u1AlGPBwP/LIR88sr8l0YJB/CjFgh9YwResMWI81oDIG9LdHPsrHIUTy9R2+FRlHv7807lDRE+WIsCT2ccGOUKtR6cpaQXXxM7LWUg31eqrOPYzAwrzXW/He9+z7+Ko737697uh0V9Zdv33sgRePbfsHY5w/rRav1jDERxi8XHKTT/xAgbhoW+UzkP9XFrZy6Ya8gJno8e4YlZsXjQlgePtuSIKJNZU4iMK5bINVax/hsko6r6jOO0LqVSFcPGPGP/vRnVjs5hTDZj2f8+OAprD6YdQiTw4hLO8FcWXe3d5f16RBCEPWvfzByPe6U7wnWlDcD0bdSrUa19UYSrlgsEmmVcqxQiKm9SjGJKsY82ZFXWcgAHuX0l1XLRqSIztC1IJA8lAIgwYS/jvvgvMLhArnnRXPMP+ovdiKD8U7zY5zGAwottJ13RPfaHMxQgwZbTCpxeIbqGcHSN5Vp9hhe2nap6hK7xhY+snXvGW/Nr76rrdu77gxRX/07g8f222vGdv+RfWgYQ6UKOCzs9oHcJNooxWcBne5RocAFqYyRgubSivueIgbrzbVeiogAMWR3BCqeUOlFkRTTI59FfuBPkCqiluk9tWycYLVjT60CtOji3FXUwQY4Co8oGIGI74Wl3QoENVd9Axi6x1Hokqh1D2aX3DtrPprcnKF7gkf1fDh2Bj3CtUUbwHBi/vocEfUXrLZHb/Wb0MZEj0Fs879izoIZ1hI3FHh6a+7X7wV0hLfhksltr4uuQLGxgohoty2xDTKgpP7odRw1oC8diMLGcE2Xqyh4MCT5h/IBkQxDh0j8t/h2ZdBElGKTgWDVkW9u7pKt9N49R1v2155VHKp4VU/n/D9Zdu2fdfYttuYPKcjBg2nlGcoPtw+YAR8d9XFs9tN8J6vwYcqHZEtmwHBsCnxSiiT87eMH4tRlScj4SEy6ciUCxYLMK0FG5dst4GbUl5k+Z2WIq9Qz8oBDt1ckwIh43QwDPAYB/Z/JdEa1TilpEQX89dtePxapunEe0CYj6QTU0BCEkQTy+d1CCOvuw9Gf1nPXcZaRUzwsM1aY13k5V3GKuMs1hwQm24F6a6Y2MOsyQG+Z0oVXjoGb2QJLfcv5I6OBg6DTUz4fBgSKdRClJq0c3EMScSSvwMvkwRt1t/TY8OGtxtNeJ1wnYZSuXWwOABdJu62MX5tvza++M6HtnuemaL/zAOfMs7jm8fYX5JXy2QbHtp1eM6xCXWwnI5uqJ5uiU+c8lFPNWLczovq1Z1y4wgpegzXdEesxFjTTDdq1pUjXuJSe3t6rYV51XVakRGjg0UmiBcSEAGxKqKMRPeMr0yvWGagEoYxCg+UsokeAGTpEUcxbm5GH4QRpYaCmuk1oib03JPkE6JoRSdagIH2SCsQpJ0ynGTUrP+7KlUn4qoIN95vwWB0wE2ZwHCPJgMTWVHB5AQcd5uUO7DjiRaOzLkUtmXhuD8R/xs5yZmsKUTzQNnjEGW/ug+GBks2qUlSG/6MycNCQEXpJA3d+X3rb+av+NN9jLu3fXz9nW/f3vXMFP3Ru18w9lu/drs2vqab5N3FFrrP2nVOsgEKwYZWiSh5hgY94jYEz6y0azVUQlSXSyqOVWquhS/TScuQhQvoOQc7zKVA9VqnTqJksvLEPZuNsSCJM0JjeUyQykspqaK6C0WY0SfZ+CXPWiYw8try182kA0Y7JUS8Ii/F0INKTEbcKCfTSK74M7U171/daPCWYJWDeKxSJCs1d7KZZDLLqbjiGhTPR+06S1659kqjlbcvs4BaBLUAOwYmYlD5jNtBoYAsdY6hFjWi6tCJRv7joqiH6OxA9EWBDSomYURZh8HQhHMLgxRFvA80w3ZZpg4ta+nt7Lnh3SFMByhvrw9lwuLSm0up9zG+4s6Ht396lZLz0k/1qzHGO+99yThtd46xvbBeHM8r/c26eKh1+3yAfIIl3hy4tt6cZVwR4+Q1txk57YZC65w05mW1YQ0JS6Gx6NHDbdszxStJnEN+3pEobC6EDm2TteecbIYnJsO+Vq8pDAlPTvgs6F+rA+HQTDQPqSxqS1VsamElOunU3oGJZmFGrgW88eU99LU5/PIwMKOeVHl6pRrd0w+hTLZb4dJ2Ljot0myUAcTcVNYI1xRzX5CdB67F7a3dlJQjrbpQSvKlTM6ajhOHAL5AhVAkEp0GPBYFMWQkYsGzslZAmqHBG3iOCKuChwisvii51KQz0Jleg6eXost01y3Ur/77+TQ+//vetr315hT9537o48aTT/69Mfa/ulwg6t2sNHwBgnQqOL4pf6MquVqA+n0z57XEjNy60IBk1hW1zC6FFJQmzK73Etodq8tKZAxbdZP06FICFqGYSHIeXfhIVr4LeHBdTMwy8ZKFKibcYsAG/VetFAzNEq5ASLh2gRga7l5R4HEINWBOpVhHhUS8K0OmGSJsA603RvoLZlRIBLG4GW+SUWK9U3HojVURWaoRMXfC5uYKyoDSsLLYBj1/7m1fU4rLVFyu26xcYzdgVhkKg8FngRsx16EhlcqPF6rp8IRFO/PhXc+/kImG9nYKeiY6GsX+rGCg15a6OAKO3DmMvKAXFLrhfMTnYx+vu+WW8eo3PrT98s0p+rve/Lzx5BNfNs7nf7TNTMP0Zj2EQrSJ40ISt0i50ZOzKgbCIsmTl7dSrizm4iXEWHBjOLiBzPYKd6EaTaYAfp44abQhtiPHrKyKghPGo0AjKmitZV4bXTwDDGxxkzpgcVVKBLUBemjTR08dRJxYbilIw1awH/wUtjOSrELZrVbXnltVyWDqAWkLNTSCCpQSaR/Soxl/E7J28IVQRqGN0nAXRpDKGRBYBkyelJ1gUjiKB9JrRIPaCyjSiWEXntf0EPfFEByh2aEklkVJJXP25Cv3IENv46w1goeexqCKiFJu7b0jFK0191gzoDXKMYx6kHBU4HpgUSxrrTsWIwtp/BOo4D7GX7vz4e2Op1JyurWn+/UsiX3gxdt2fnCM7SPhJPR/5nWxFryXhW5DKik/RcEJP9KxvNIqRXTQ87EgUs0ka0npnHIST1vQXJgHD794pCimUK76uFkiUUqIs3xRGzmfRrlrCgSgdaSaPCaqWXPFZwpHWC2mGHNNDxF1ZMjQDTHgIzrOhFlDeg9pvnwmZrCbrKPRMloQkakcMpFX1ugvVWlm3yFZ4UnDix+Nx2VlXLDaax5dyhNtv25+JAuue8+QgasA70xY7Uq4zO3PF3Ieew6mmM+BKTbpedWxYG4BglxhU5meitU5152ogL/XOpFlRxoYS7Sm7aAdFZM7uyZTx49rgktOVcS83jJf+PNPnsZLv/+h7T89O0V/9Ic/aly7/qqxn//WmMNpxO0rxRbKC3elsEErk5x9MHPpo6Jeu8kxoALBcXV1wfonFD3GwfY8rktH1RfmunX8TwuljWkvQ3eCDfVnsX4pP3uF+BWPCA53jYCNjBjfYwqPexiEj4TOPIi64iZj7fCE5t9dU+lxm+0uozfHQGUBzOxA51pQmWNG30XxCRTbOZVg41WKaiOSPeA1UQX8A+o1Y0qLypt7rJSzTMGZXEyUKWXFK5tzSE86f94HONDIGvY7yxHQXcpnFCnsKblmkY+QouUPYyYM/8ULLYbHIaGGfDS6qVgVTtCFMlJUq5RxWSh+eUdgAkYo3zrG+Ja7Ht7+17NT9Le97ZZx+7s/f4z9O8c2rrXrZjKPaiE9KEiFu3ABjTVHTyAAm0zuohCtZNXnfPTQSv0ILh+mffSmSZmfYh4cRYbQccuKOxFYSiEiPgYBU/bfaTd52qhldwjBO28jk4UkEdPjdVI6x+elpBlyEB5FMwhhKOA7++LZLlsbUXuBCrVjzK5Qo6SNp6OwCeWQXgNsXlJG8D0d4/qeVZEW60WJXjw/9mgxegaLhRZYWmyC7wD7r1T0Wq/siV8QRgNPG/cIGSPnrXvDMx5GkMMz896RQkRQYeYfgRrGjYH5T+OBz7EmqAuNEFxQXEhvxcBxAgqX/4ntNP7SHQ9tb3k6JafUfKCXjDHe8QN/eFzb3jy2a38ox1jIovVddxbCgoDuFXwIRY3foEZckEbFHIDkLJaQFyS+SQgOTzW2OSmuUkSeL2NTGUcOMcKNjSdUdGWdGXcqhQtz4CVIHkat+4HtZoqLa9JpoyiGAbLowhWm1IDg9P4pWNFTTQ/CxaNCutyXMfkxWxExt5VR4hj19xjK2KrUaCk9FZUxWPdAGljrRXHm91A2EV7Yeub5aaTqZ2HEFDeTEVdEa4Tka7F/QUMhJGeA7pWCtEFpb93x5RrW0VB1/JwpNkx2N4JECrSnB0dLrsTboYIgv2SErH8iH6rdFcw7yhGlLpqSvsbogvD/+fq18Ze//6HtFz6QFusNT/+6d/zQ7x7Xnvi6McaXb1Updwi2w1N3pRw0qXwg2tTyD37gwRNHMq5htWIv5yLJAJvgkiLRI7prjCgA1nneYPaja5VzaqqgmCvvpAJgxoUrIhWmGmxwDShSYQTHXPClEqgvmV6D/raSp+s89zQK7W2cI7eB6tjbxURWCgpwK1yf1sIEkOJOUaWNKvAkKHqJFFsrKHcAxTtUZGQeYDqaIKylc9WgSK0C9O7RdsgWSCENyJGHSI8efAwNzOJxzf6bSjKnI6PQz0JuA8A0wsTyuBx95Tw5QzsYOwU3y1BQE6yI783UyOW15sClX5VSayeJV2vU83v3bXzz898/vu17fmz7P8+Nou+vPI13vuhzxrXtu8c2fmfquTts6DMVVhC/gxKGebKVrrulJ5h2fw4btGdY8rX0gOQsDgMiO71hj9HcdJc1krAMQQPckhJ2+alIMFdSRdotvBKLSRodtNCtFXouOmFpqOv5KysRwwvEbEiQREyVp+6qu1YeeagcUXWAqVjfSdTBZNTgBcJOIYDMr8szKwI2ZFUqMWA6FVdGePHorrpjwlQ2vg1yGQHAWueXhZR48GMbCyOaUrrOz4eid2qy9vRwCo5JRHEaMAJAk+QNcp8zz4/rQSJN11M1AAAdBUlEQVRhiHkmW58LoJCOw8O6lFnlwDTEJT/4GiGEsseu+TWRDT1Bjlw6I9gl2D8v8Rvna+Ml3/fQ9u8/kJJDdm/0z+xT308zFngRKt6krR2r0yD5AMWLUlgFIvVW9iQHG9kb70T8oRxWaRVPU12srqZbcJgE2VE2vmjCh5ot5DE1UcVEHRMFMTMuPCJZEQhoH82D+zLrzWsvU1uptMmaMyVH738sqgglt7AUdAy00Pl8E47ugqMxU6bgihRfbYfi5MhiUKA9UcbGBmnTqpzz4YZLao9nrwFNOaaXuOrZUXi07adJ5EQVXmcojISWFB3ShE6ftleM8txm3uN1LsgJXiGMfU+D5e8rlUbOpJ4lMxogEA3hnV5TSpmNUVMYo8Cnm1uUZgZE7KBcDaLtwKliDZ8bvs9fvX2/ZXzuXW/d/ueNqPCNK/pP/OCHjg958qvGabx87OMFkPh+OFghWD6aofLj5hk9J96+tIzqAkEpjN20wkeIGNCsOb2Rwn8N/l+8DCzwOtLZUUQolsgmzUJz51V4MceieO4j86+Cn45fr8oMzPfmUU8g8gjIcF3DZHw2my0uSi0vWOIcbSTCJ9KATps1FwHgSYIRm3b1qThRm9C1ATwF1fC+4mPK7novMMbiIbJPQB6ueQzujqrmGoLTD/rwh6vIOOTWoYROI8oQdfwMdhMypcyMUVoZPg74QDy/duiBY1kgvxLBem2JAifaOO3XoScpJKxJV7tJExmc+9uLOLnY9nfvY7zytjFe+4aHt/c+t4o+r/b4g39u7OfvHWN85IIFOtKgaGlmDxYEde+1RH3/aSXtbchcSpVo8Pq8cHlNeJaM24915TJCjBkRP0f3lrviFOM61g2SLRWaUB+TRqaFn8wwycREB4jrFu9ujyjet5shYBVZsUcDcpGyYQjA+BzCZxhv4u04cefSSCqTILKTnrbZ/0AOJqGIuHJ0tZVOnESkkfDsVg5y0vpepBSKrxxKICtAxAqv2iSi6iOIXq5Iry0MvjM0c29Y1OOwjSCWyt+xPVak5hDWPjO1q4DT4Qe68joP3wqPM9ngpQ31IyTQARF6Nvpz/0WHdXUjS7pj6NovPXHL+Ix73ro9fiNKzqe+0ZfOyTN3v2Dbbvnhfdv+tPwyn41+iXCczSy0WDkNgy9vr+j4DixshS6rINNLJKnGwwXN2Ovgg0Mjig3BiggcKxGTRL02YbvQAu1xpdLWAp2IC2M8E7CYUlT01msXGItxGHKgdFakz5UdWjQwZuL1/UEp8V4iBCiKePzmP1SYlDG6UZlGXOsZ5M1o+KxAUMK1PRSGTZA8jKjGkpDNNiMesN77TQTI9BP2jDGvY1s29pTvLntS7Tb1vK4QZFGRkBOMcXt4Xgst1OvAChYPGU/XdTNGR2jSp6zqvjgIHWt+GKVFjogOAKk5rhDi8KunxXRkbPeIcLlU6IeuPW983vf+m+03b1R7bxy6zyvOnPpH/saXbWN8/Rjb76kVbm/OzyRx4SOo4OE60MhbU1EMJo9enkQiJRfRREIFMR6VSjE4H8VeJsipSu3IUwsrr8cxM9445IrpvQH7DMNklSs9pbZFk1AHTypCbSXWBBnFdgMkMp52rO+ONnu1hZMgJObRyDmhppWzDam81GmM6z2EQdRQf6bXrVGD9sb5YBlEvNbh0sUEFmWZG/7SxMvYRpaCCgCDGq20qhlHNV4pxoFnWUI9FLUWj6AqSN6fZ9EtLH2XTMdpM95DGnQ3HJGYgxHMwzu4Is4uLJkHhg19Um6oQxfAWDE81hlK0/WlgPUzJv+6J24fbzjOhXs6pX9mij6v9M4HPnWc9jeObXy8xI/hhrhiW6lCPurv62TV2uDCOG1eujxnwKSEiNysnpFeyque56hBp1dVmkdpndVbNvMJpQ0yLZpJxMLXvTGORFkmi1MuN5DWOnq1FRNnqWnU2JdAZGltEm8ghmEUmD8uHUjv5RiUSucaBApJElXy6IFwlmKOefcoJcZkmWMF4vRVRFNZAjtfbxjO2F0iSijfBiHugWv/FNmTQAltqPv8sqgVSL7imAFATC2SrXbSxS7NgSRha48PgyPHgXtgusylsPH7Pi8ujaYq9ZBpqP9rjg9sAWNyWjcsWwa5B89+HuPRJ28ZL7nn323/7Ua9eV77xt8zU22Pv+j+bTv9xeXgRNpgk3FeJub/RdLJ78NUZZkrqrcuFA1Paitc5ZuGR5o2gxiPtk+Q3t4jD1+QcjLdsQjzIR5N6A98VTCcioCri+yzsIUAtvdiYYssIhMsLqtcDAffRWOwHEqx9qMvAmtmm4LZnGhwDknO5dnxOIQRf1KwzT0kg81UzWxFrevFjACfjw5jlIRZrE953Bmjs9mGU4Ok2OtJsDLCcgBuA+Y6R6cbsDxKghcIrZgZItl7EdfGew8GkH35KBNc0mWBMMknCNWsmSOi2eZkcp0RlrdH75wU2PWe/Lq64zs+8dPGy77xGz14+oZ095l79HnZx+//m+O8f+N22j46+81lnTKL1hn0SOZRqHg0MMfDdt84+VAMTCzho8dt4qlzkvR69TpB3wVmd3cV0zss6ligfRiZSh0BxsG8kk3uQRTw6U+12fT/S1orOp4OjD6zqz3u2bFw569BLOKkEoVBJa5CQFZS1JfTS5sFFxpSBSHY5Lns9NpkmXPGHNllRJwZUmCddXAViMHOh7dyaw/SuImkXFjrbiY5ptdY2UY2u+JlknvEkoUkInww2clsiUg9KTcN2QXRZwN4HADCKbCIr83kx94r042TfCXXfvY1ZepKvcsxDbozMJLwbetwSFz7F8cYr7jzkavHRT2dxt+coj9634vGtr1+27Y/Xo+nA0rWVnOyxDDgZJ34IFQhCXU0tTTRofLOIKvWOJcLuworDUN7fSKAEgefAhqxfhJ1wZYH+SW224cM1KZ3EUyTMzh6p/5UYyhIoguGfLH64TXF1iP1cwX733Pdo72yww7FrxIWTI5hg4uFVQrTB1U6T8DXZDiTZOlSUrr03HMPGFbUbkeKTYohTysy73xGWxc8LohE7syBeTecVuxuMhPX1n++j5XgVIooILwzEPFe5uh1vT3CE3l7ogbulJuYoAUM6hbysxFS3KNEJDWzG1UgwlklhzLY2Sn+o7deH5/9+h/ZfvWG3Hi86OYUfV7gsQe+eWz73xn7eL5TbSbmTMg1/qCbJ1wBYom6a+ZxVULpOPgYxzFfbTY24+gSltpMGEOy0K7nXoYjilG4QtEbsqdFhvrwd7UNRcZF7tvsbuVzY1yyEQbPyBYv4Zz+JWpRKAIW3/ncWj4drFAGFhXZZI8FwbmaTttRUTzyWPlpV92pSs3TTs0NhHGl0CrKVj0/WHitJ6EzoHYFoW3cExr7UAzkvfsoJyAzQ3U/2wXsTmSm0I2pzQ41VqNqZeM+0vOr15wlvzwGOY0poX2PGpehqBAJh2XEWKystsTak/dYiGkpn7y3epBy1HNMlZnB0re/6e3blz9TJbfhv5k3jsfu/9wxxjeNbXwil4+ZctVUUOtFNuBv84hVXUdFj3z4YsnVpJ+TSWDx14MLNdO7LHDCs2RnHdfTU6qzW+SThNAog7nw5BEMz6AonqNm6Jpwu+Gje9ZZ6ttpQcSjgNCRGpvHTbL01Yy2SCXghWCtofouaqnYW69QtgGYSkU9K8lG6MvoMXiJIgJFkFJcfZLMPBLEBjWge3pyIIB62lUJ1NOdI5HJj3QBEevmnUUROulrWcHa0AEhVFUbqXspmUIx0gp4zkZNxzy36tk7L47nWHibMNhZschUXuTbkzdgNCqlC+Lt0ODS56sBzj869vHyOx75wJ1qV+nzzXv0ebV33v9949p4KSwQ5Ks71TrX6eDFHj9SblaY9p4LYULFbWKnhKdHAbWA9ImnKTSEwWEcJNLc6ANZdWCFjRigaHjIapON44Cz2kwlIoLK5c2Z43WumUak740GTl5wFUJ5Vx5KwGFLSkfK+5EYjPXqrEWXoyL+0yGV2DIoBz8zjBYJvrV6zJkGKRLvrtaNBU8+ssgYp5/PCgbmGrlwWt0pRzrAEYjPqIzKY6JtLWrpFF9J3UIKElbnGKsMAT14lHvrclmFPFUftWYgRMLSCczlK0U3EQgkE+8rNwcZdiM6tOHYlYY+xrIn9vjY8Qdue2K87EYaWJ57RX/03i8Z2xwYv30Ebxp/Yc4B8JO9C561AxASjoptguygNaZ3VqzLByc8X9lTCKz+ryGBq3dS+2m8MiCxG1k6ldOFFlJIQmUpf9cvU110Fz1GaM3NzuVgDT0WgiXEGhgpkowVdzZuEnihlR7rDDUtQzNjbpOEB1jrlqLya+sEHZFZ6ymmGacz9mxOZN7HdSvGkkePenTDY+y5Qik4gDVGdseghXtNeTLHvhB/Su6moU62/dDckoShsitTYqJ/PolFGCEYM2cMjKT4PCIV+/kCSQRaWN/XOqzyVim7iLgg5GgI/ut2Ht/wprdvb7xKiW/kZ8/Oo//cD370uP7kPxv7+Gx9WB/YwBQh8gR9tHMQd8f423EhIdG8OQmlCarw1gVHFee3ordycXZYPSTj01QeANyG253/1IgmoQdaYlVYmVuIbACU1rXgC5kW6ZVjjzTpux74UPdK3vxA5AXVt5J1QCH2vChimfXWFFV+fkJ3IRy9z+k4lxbD13KUV59JDqMDbwTW36kslZyafGPp6cpGO/gK6CwegvBYBk1ZFq9ft3pCN7KKjqTeUpnWiECyRiwVPRY0tlrrVMrIgIBsOw7ljMYdODRXAIKExee7cYhrpfUorEGLv/wMLtHbfW0f3/P894wvet1Pbk/ciFI/9x59XvHx+z9zjrIZY3xSAZb5gDFAkpNmeLCEnopMXMUnzk/D3c+YOQ5mEBEl+1p/TwX2AQPH1JtgcW6CYk1iJadhriLM7HmmgSJJ5bPYl77qzsM2FNd81I4BIy3TaTk3kxhYKqXH8+x8OmpzB7oXMvnyGGvF3kUMqWQbITNSh8FiI9MgxY10WRjAKwptqOhuuzSKuiqOtcLEOrmKDobCBqOUvOcEHIuZjnnqK1JagL7uMDNBCZ3CsysXUfn8CmS6Qk6OHB164hEY21MerdDdLFSMBgumuinHuCDTqqGJimY9MhLKn4H8z5628TVvenh74GaVnA/0bN6OgG88/uCrxhjf0DaILfSHS7t3nQqu6SY6yUTE08KkOzcuiFnNCmupqkgRgGEN/xeM6omsJGR6rBJgfEKzZcxyxIiMV5sEY5XYCusaTsJjKt+LXuYOKfrAAUSpCa3n1xzHrAMfBM8tqHV1VM2tp9xAaYNPaATRZbRu9InOPoUR8FrJEawKDxjOUpfiZJhWUqOPsw2C21nI1EM8F/TUQy9RL2DyTveBiTUde0th14M2EMeXD/UBED0eDL8zHAciAaJTuBaZIKzBcZLs0tTC/VQoKOOJdVbrqw1Dle+CqyFljKUkkE8Gvu6xY/dX3/HIeFV8yk0p7LOD7vrIOWrqlmuvGWNC+MyjHRgFfUuZkyLIz3fVEx+LySQoo1NBMXctYuNMMSlmjcIFe1ilgZIpxkhnpEFimqqEABsUMDDSbO1h4rRNKUopHYdSUlnpURtmi9+Dxw32nLPG6r4AugXJk59oD07AHC2fbhImoz+VskIhjapCDQQaRS5ZdygAjcaFJ21Y23xAVI91Hbh4g9y/ZsXzunwWR66kw4J7UOmp4mYFPhMmT+OoTIC89oK0mLLrjMURjnvYp9BP7WOOjALlREY+6yM6xcay77qXtR+9433aKRvNgsJLcws0axv37mN8/V0Pbz97U9odb3puFH1e8LH7P31s4zvHGJ/geAPJI06Yicb8IOgX72IizPCb/gPRjL0n4GYrvISuO8xsbWVRldfNlErPrFste3IFTA+tBwianOtiFUBC/AejoaqqPiihfsfZ6vragdgRWSypH1eCYcyyPW5C0ZIMN8soku72XcaQKmTJ/DwVn+akjWpWeEHozT4HDI4c85pT7kyJjCTFbSlzhudcur4WRCGjj+muzbGwWhCvZXXlRRupMyti6etzZOwPbPpaOjsvvIQQLJbJ+1B8v06cwfWjm444YuWHyPTJqxdDSWsLpX/X2MYX3/E0p688E+V/7hR9furP3v+52/n0L/ax346ZtIRRfHBVMRdRwbVo5e086YX3JWMrRSoYfDj80NAzGOxjWkSKYLieAlUpkz42OVNLTFMtnWM4zmgeKLBMygmmuQtdav9i+OXiHa1wPTOujROTT4wfOx5VrSFPn8kSYXohlfAuiq4QgHXuXeTy1Gkwk3bkNYQg2tgY+sLbVYrpqJRJVNFZmQRVWpWiiKwAjVmnXBfitCA40Dyn/HSdujMfIsbWbA3uWwRi8BuVe2eTFJgjV8hRRjkSW8jPjLyRFqYOHgvB+vmaMI0Rq6AUl0aWbYxfPZ/Glz7VyajPRMH12udW0edCPXb/S8fp9B1j338XxqLUAi4ZMwkJfdBFcwYUgXDS+Wi+WlNgdGjB6nVgO+OUFDDEZte7os5WPa8b+dJSQE5kDcFTEi+LTkzKRT79iAqMJNhdFkhDacGoGY942uk4KULEz4rRNfgyUo+piEQzFmRzIZdTWO3NO1RBoU2TeB0uNTqKdl7HyfKcnO2uMMAhk44rdi4Ag6qQKYHKaCwWCTTXvkfKy4Ilw2Hme34uT8c78DbqzuvyZE/yMV/SSMtQn2jpMOGWRUEwwl2R6fVj1d1SbBOaireRgANf8+5bt/FFb3h4fP+zjcvTIDy3ij6v/NP/+neM5/3ml4zr2zfNs9VZf+qaGfKJ/j5z0oiRUCYqmChAGhNkxCMDL5DnxLG8Cn6uaLHM0dI9vmkphLByOtZcDjkUDOwxRYcKNZGlRh72oCU/cZKqiSoPZtABFUz3kWjLIQZYCQLKIuP6UAse9wRBUcklSa2G/QhDuL7zGY/HTsvbLUSfFDsQirMHagJBgQjJMCrpeooNu78Ifzt2XhAdo/NDzfkFw23jbdJONe59wAP4DIcMbG+tNTQBV4z7/MekKVkZzDNUPoLddUYXF008HQqsaAU8BVKG4DrMV0R02+q47+N95218xe3PH6//52/Z3ncznvup3vPcK/r8pEfvvm1cu/YF43z6h2OMFx7TbTRiKMvkeAATKZejgtzw4ETQeg64yzvLUChfXmvr8UqCzlc2QxyETdkNWHC1cCrOQjdXbX7VaIu5FW9gyBe5YRNkwT1A0ZbqPPYt4nwvrM2aL49aAd4zPnU5KbZZ8sWrK6F01bHN4hxqRr5PtHEYgrFZMAzVjz671yjAuI/O4SOOnvyEuwaDXAvylIo4fTcPbezmFoavVcefiM1pQSrPfEAd3hHpL4z7Unt0x++G41Bs8gIN8Q3rj+erMR0HXA53YHLYuX6GJ4EUTZRelCx7Vlzny/fxv8/beMW7nz9e/5bnWMlh3j6Yf376gT81TuPbt2vjk6O5tvxpVc3S3iGXmflgLmTdW/Wfszli9SrpOYUM6PeICIIIOx7/u2xIfnaw64KMfZJJjLpqZldhho7RpYV3F1PFkkude2YVOAlFte6O2duD2Ld0piBqrlOx2caJWesdEly1ts7Pc611cAY8XoWNPmChIL4qzUQ4Rtvu/FGMqhbHErXuCMUilZjEqqvmar8jLjdkj6aZ9tIdQ/OelerT54jFV8pVAp+k2Pp1tMxeJR8ueMlKPvps1Xe4eEncjc52K2nv0Viheaxj/5I3PbL9yAdLHT+4ig7v/lHjdOtk4/+S8QpXPBnUtJCk5SwcBkTRzgrrWxPDwMxYUaiAWc8cgm4hbIXSFBfEp5oEk4cQyh4ePewVzPjCNFtoIQya615eTMDQmYYeKQxvjqYZEoGHMlMjA6W2VCEACM1RxWg6Wdn/I+McTL1YEeXGlwYOpfQqVFI9esbOWcvtoRSuVovYXzXk8oBec3Rgjzk0EnsIQ064e73MzzrfTxV62pcaIQVxoDx09Z28qhh/wf4409wHLCCvD7MUQ0jFEcwc+TpFlrzJIidECs4IkZgmqWkvu40Hz6fxt290bPPNGoIPvqILyp9v/cJx2/by7Tx+P5s4naPFQ6fHYOmpQPQcGpkH/Tk9s5y33WwtyDydYnnwTIZ1TodhSzG55mr4JgqOFVw5gdaeMVhaHJrQ1jvqAcy+d3UaYzh5BqdlLurYzbovpbtivdU4k0iDMelSRHPkL6hUqOtCqgpZglbODIGqsg7sJJSpoftSvWjIzQCChviYj1cIEoVO8upqD+qpMYbUSmt5hNUyYqrbn0kSqnSZXW2kiI0iHYhwwi+U6aTz6DhCGnPomA5GWBPzB05npD0rdKlwJIndPHwSIcPYx7vefx5//z0vGHd9MKD60SD81ii6PvWdD/6xcdpfPrb9s8YYH5rljQvsipy5Rvwt8Iu5YHOqngKD9AY8mmb3otMMnkulibyhhK9xYIOE2Nl1tYxm6obxh2JaZgpYptrTbqJUl6Bu7YayCSnFv2Rtg63Hpx8GSHbq7sqTRpvfYFTtSbtOQ9Jz6uw6ZjwgyMRSqtAzo70qb2cQeJIpSKi1npxVi92n3wY38s5MWrpysDmMQEfN9hvrRQ0DobILew8l0kIJzKQkP5OkmmnPkpE4ZinWJxGpQGrzFQrPMs1Xa/2+bR+v3c7jW970I9uv3KyHfqbv+61VdN3d4/d98ti3V4x9/PltbLcTokERplIFbPZWyiNEsUUuKrjmmdeG+7Li5ZRPpr/clCHPLI+1xLJUd2YAaJQ6PZfE1bHYBZ6xC0wEz/tvkzmMpFWFlgMUDjCVuIfXRhX+Wk+gE15VhEQOYzkkY1mXKJph9aFjZKEcNQOts/wKAVm5IiZnRmQlGeuWG15fuTbKbWcKLRXaKVfzOQ5qUO4aDSMX8X/dgCv6l1p3ZWqWEAkpswO6UxuqxlmZmFMGaTGqp9m4qrZVjLx672nfHnzvNr71noe2H3+mivpsX//bo+i665++92PG6drnbdv40u28fayE8KqTWpKwSQIlU2KCYLTMUYustIZGFjFQ8rgnKnWckqKTNiqy4laShSejq/ewtl6VcQB99Q5lFNQKeQFzRZfBUBh14Hz05bC+Zk2PDR/JRdDbdA53nXRDU4gYvIwqik44Hlk8gASW0D1q3csAa4CnSETW6YOJFhz2AYpQQMS6hshONWFKMFhsnfPVdQLB1Xg9pJALF3JgvnVkUvezqy4B7PPiid22K0jtLkQeO4X5gY1aUAWnI5FVmlzHJicnw5Bm7Psv7fu478knT99+79u3dz1bhb3Z9//2Krru+u67r93ySbd96r5vL9227c/s+/YJ2z5uddFCEGcakAA1u6K5BZFS5McNjtGqKsqJMFwKNtNGOmujhajTRtzoqI5aY+G87tLvXRs+NZocgBJTnaIxO74U3pikK0WjklTsGKOlVBsv4bVBYyIulLHj7CjPdGcXlLEbZBpxkO+IaTp9EKI8KUa/HY5Liimw847xCRdFQTJ+UiRciF1gC89Rr3RKFgcpiFNRkHV1Hl18DYQdxVhLdaRq0h3yNUPeSs77l0FfUorYI+bln9zG6fExzm8+nccP/8qTt/zHhx/enrxZBX2u3vf/h6IfnuZDfuotH/vk/uTHb/v+KWNsLx7b+IPbeXz4vm8ffRrbC7L5IJXSyph5Swgwu4a6eETW140kVoTZg73GyvO66u3uk2Sa3efr2SBCYQrPgSKVmeOHQrTns6cRZEe5M2DuZMwPTTZcKFZjrbncbu/1tBjm/iMrAeRAGN1z2taGmSYyldokQadQBy3CB49PNZqPeByNHNAZBiVj64Uc5WmlKiZNtDCh1VITH7PapLxRxupUno01rIKZ/M6Fdw0/nISZ9np9nNTSRnpe6z3bPt69nbdfOJ9PP3/a9l/ctus//rz3v/8n3/jWF/7ac6Wgz9V1/h/j4HeteG9rlAAAAABJRU5ErkJggg=="
    />
  );
};
export const ColorsBox_small = (props: any) => {
  return (
    <svg
      {...props}
      width="76"
      height="20"
      viewBox="0 0 76 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0H76L71.6126 13.1623C70.2514 17.2457 66.43 20 62.1257 20H13.8743C9.56996 20 5.74857 17.2457 4.38743 13.1623L0 0Z"
        fill={`url(#${props.svgId || 'paint0_linear_124_7159'})`}
      />
      <defs>
        <linearGradient
          id={`${props.svgId || 'paint0_linear_124_7159'}`}
          x1="67.2058"
          y1="5.99998"
          x2="9.18108"
          y2="5.99998"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5B40FF" />
          <stop offset="1" stopColor="#00D6AF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const WarningMark = (props: any) => {
  return (
    <svg
      {...props}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.3125 3.375H5.25V2.4375H4.3125V3.375ZM4.3125 7.125H5.25V3.9375H4.3125V7.125ZM4.78125 0C3.504 0 2.30325 0.497437 1.40044 1.40044C0.49725 2.30344 0 3.50419 0 4.78125C0 7.41769 2.14481 9.5625 4.78125 9.5625H4.782C6.05888 9.5625 7.25944 9.06506 8.16263 8.16206C9.06506 7.25906 9.5625 6.05831 9.5625 4.78125C9.5625 2.14481 7.41769 0 4.78125 0ZM7.52531 7.52512C7.16594 7.88651 6.73844 8.17302 6.26758 8.36806C5.79672 8.56309 5.29184 8.66279 4.78219 8.66138H4.78125C2.64188 8.66138 0.900938 6.92081 0.900938 4.78125C0.899546 4.27149 0.999252 3.76651 1.19429 3.29553C1.38932 2.82455 1.67581 2.39692 2.03719 2.03737C2.39674 1.67595 2.8244 1.38942 3.29541 1.19435C3.76642 0.999284 4.27144 0.899556 4.78125 0.900938C6.92062 0.900938 8.66156 2.64169 8.66156 4.78125C8.66294 5.29101 8.56323 5.79599 8.3682 6.26697C8.17316 6.73795 7.88668 7.16558 7.52531 7.52512Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const Slider = (props: any) => {
  return (
    <svg
      {...props}
      width="47"
      height="35"
      viewBox="0 0 47 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 14C0 9.58172 3.58172 6 8 6H19.9224C20.2798 6 20.61 5.80928 20.7886 5.49972L23.3838 1.00139C23.7686 0.334352 24.7314 0.334352 25.1162 1.00139L27.7114 5.49972C27.89 5.80928 28.2202 6 28.5776 6H39C43.4183 6 47 9.58172 47 14V27C47 31.4183 43.4183 35 39 35H8C3.58172 35 0 31.4183 0 27V14Z"
        fill="#00D6AF"
      />
    </svg>
  );
};

export const Fire = (props: any) => {
  return (
    <svg
      {...props}
      width="12"
      height="14"
      viewBox="0 0 12 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.57796 0.367675C4.35716 1.05452 3.75595 2.28874 2.12094 3.92562C-0.699681 6.75295 -1.07348 11.3076 3.26035 13.5473C3.61615 13.7311 3.91316 13.6179 4.13636 13.3909C4.87436 12.6416 5.19477 11.5422 5.09877 10.0938C5.07177 9.69465 5.25477 9.59078 5.61717 9.86388C6.64498 10.6377 7.31578 11.8299 7.31578 13.1114C7.31578 13.5473 7.49519 13.7778 7.91339 13.699C10.677 13.1779 14.0448 9.32409 10.4154 3.68111C10.1982 3.394 9.8772 3.394 9.8826 3.78848C9.88861 4.27283 9.8316 4.75602 9.7122 5.22636C9.63 5.55315 9.3138 5.54849 9.2394 5.22636C8.787 3.2662 7.52939 1.60015 5.46597 0.225287C4.90916 -0.145271 4.70696 -0.0314774 4.57796 0.368259V0.367675Z"
        fill="url(#paint0_linear_2166_3579)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2166_3579"
          x1="0"
          y1="13.7143"
          x2="12"
          y2="13.7143"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFD278" />
          <stop offset="1" stopColor="#FF9900" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const FarmBoardInDetailPool = (props: any) => {
  return (
    <svg
      width={isClientMobie() ? '100%' : '340'}
      height={isClientMobie() ? '105' : '105'}
      viewBox={`0 0 340 ${isClientMobie() ? '92' : '100'}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="1"
        y="1"
        width={isClientMobie() ? '338' : '300'}
        height={isClientMobie() ? '90' : '100'}
        rx="11"
        fill="url(#paint0_radial_2166_3074)"
        stroke="url(#paint1_linear_2166_3074)"
        strokeWidth="2"
      />
      <defs>
        <radialGradient
          id="paint0_radial_2166_3074"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(86.8785 26.5) rotate(33.0988) scale(137.342 152.301)"
        >
          <stop stopColor="#0E3E48" />
          <stop offset="1" stopColor="#001320" />
        </radialGradient>
        <linearGradient
          id="paint1_linear_2166_3074"
          x1="0"
          y1="92"
          x2="340"
          y2="92"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00C6A2" />
          <stop offset="1" stopColor="#7F43FF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const FarmBoardInDetailDCLPool = (props: any) => {
  return (
    <svg
      width={isClientMobie() ? '100%' : '390'}
      height={isClientMobie() ? '105' : '105'}
      viewBox={`0 0 390 100`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="1"
        y="1"
        width={isClientMobie() ? 'calc(100% - 5px)' : '380'}
        height={'100'}
        rx="11"
        fill="url(#paint0_radial_2166_3074)"
        stroke="url(#paint1_linear_2166_3074)"
        strokeWidth="2"
      />
      <defs>
        <radialGradient
          id="paint0_radial_2166_3074"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(86.8785 26.5) rotate(33.0988) scale(137.342 152.301)"
        >
          <stop stopColor="#0E3E48" />
          <stop offset="1" stopColor="#001320" />
        </radialGradient>
        <linearGradient
          id="paint1_linear_2166_3074"
          x1="0"
          y1="92"
          x2="340"
          y2="92"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00C6A2" />
          <stop offset="1" stopColor="#7F43FF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const HintIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.3125 3.375H5.25V2.4375H4.3125V3.375ZM4.3125 7.125H5.25V3.9375H4.3125V7.125ZM4.78125 0C3.504 0 2.30325 0.497437 1.40044 1.40044C0.49725 2.30344 0 3.50419 0 4.78125C0 7.41769 2.14481 9.5625 4.78125 9.5625H4.782C6.05888 9.5625 7.25944 9.06506 8.16263 8.16206C9.06506 7.25906 9.5625 6.05831 9.5625 4.78125C9.5625 2.14481 7.41769 0 4.78125 0ZM7.52531 7.52512C7.16594 7.88651 6.73844 8.17302 6.26758 8.36806C5.79672 8.56309 5.29184 8.66279 4.78219 8.66138H4.78125C2.64188 8.66138 0.900938 6.92081 0.900938 4.78125C0.899546 4.27149 0.999252 3.76651 1.19429 3.29553C1.38932 2.82455 1.67581 2.39692 2.03719 2.03737C2.39674 1.67595 2.8244 1.38942 3.29541 1.19435C3.76642 0.999284 4.27144 0.899556 4.78125 0.900938C6.92062 0.900938 8.66156 2.64169 8.66156 4.78125C8.66294 5.29101 8.56323 5.79599 8.3682 6.26697C8.17316 6.73795 7.88668 7.16558 7.52531 7.52512Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const OrderIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="16"
      height="18"
      viewBox="0 0 16 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.15905 2.28451H9.72909C10.2712 2.28451 10.7292 1.76141 10.7292 1.14223C10.7292 0.512393 10.2707 0 9.70727 0H6.15905C5.59558 0 5.13721 0.512373 5.13721 1.14223C5.13721 1.77208 5.5956 2.28451 6.15905 2.28451ZM12.5353 8.24999C12.5051 7.82162 12.169 7.49866 11.7535 7.49866H4.09089C3.67869 7.49866 3.33032 7.8506 3.33032 8.26712C3.33032 8.68355 3.67869 9.03542 4.09089 9.03542H11.7752C12.1876 9.03542 12.5359 8.68355 12.5359 8.26712L12.5353 8.24999ZM4.09089 4.63977H11.7752C12.1876 4.63977 12.5359 4.99163 12.5359 5.40823C12.5359 5.82475 12.1876 6.17661 11.7752 6.17661H4.09089C3.67869 6.17661 3.33032 5.82475 3.33032 5.40823C3.33032 4.99163 3.67869 4.63977 4.09089 4.63977ZM11.7535 10.5991H4.09089C3.67869 10.5991 3.33032 10.9511 3.33032 11.3676C3.33032 11.784 3.67869 12.1359 4.09089 12.1359H11.7752C12.1876 12.1359 12.5359 11.784 12.5359 11.3676L12.5353 11.3505C12.5051 10.9221 12.169 10.5991 11.7535 10.5991ZM13.5604 0.505737C14.2609 0.505737 14.8471 0.739379 15.2556 1.18138C15.6411 1.59842 15.8449 2.17039 15.8449 2.83546V14.6002C15.8449 16.1592 14.9949 17.0179 13.4515 17.0179H2.39326C0.939403 17.0179 0 16.0688 0 14.6002V2.83548C0 1.37671 0.853961 0.505757 2.28443 0.505757H3.56876C3.96323 0.505757 4.19875 0.768319 4.19875 1.20814C4.19875 1.69407 3.94559 2.02061 3.56876 2.02061H2.28443C1.80759 2.02061 1.49952 2.3318 1.49952 2.81349V14.7101C1.49952 15.164 2.05181 15.503 2.54557 15.503H13.5604C14.0372 15.503 14.3453 15.1918 14.3453 14.7101V2.81347C14.3453 2.33178 14.0372 2.02059 13.5604 2.02059H12.5373C12.1095 2.02059 11.6896 1.61816 11.6896 1.20812C11.6896 0.774335 12.1296 0.505737 12.5373 0.505737H13.5604Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const SwitchInDetailIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="M11.1587 4.79979H0.841338C0.376285 4.79979 3.52859e-05 4.46521 3.52859e-05 4.05165C3.52859e-05 3.63809 0.376285 3.3035 0.841338 3.3035H9.1162L7.7374 2.07737C7.40789 1.78435 7.40789 1.31052 7.7374 1.01957C8.06691 0.726549 8.59973 0.726549 8.92691 1.01957L11.6658 3.45313C11.8691 3.59029 12 3.80642 12 4.05165C12 4.46521 11.6238 4.79979 11.1587 4.79979Z"
          fill="currentColor"
        />
        <path
          d="M0.841303 8.00001H11.1587C11.6237 8.00001 12 8.3346 12 8.74816C12 9.16172 11.6237 9.49631 11.1587 9.49631H2.8838L4.2626 10.7224C4.59211 11.0155 4.59211 11.4893 4.2626 11.7802C3.93309 12.0733 3.40027 12.0733 3.07309 11.7802L0.334184 9.34668C0.130869 9.20952 0 8.99338 0 8.74816C0 8.3346 0.376249 8.00001 0.841303 8.00001Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
};

export const NoLiquidityIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="57"
      height="57"
      viewBox="0 0 57 57"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="28.5" cy="28.5" r="28.5" fill="#0F1D27" />
      <path
        d="M9.77189 1.05235C10.7152 0.498255 11.9305 0.912726 12.3387 1.92775L14.8605 8.19831C15.0026 8.5518 14.8807 8.95659 14.567 9.17274C14.2137 9.41611 13.7322 9.3437 13.4662 9.0072L9.27443 3.70547C8.60074 2.85338 8.83528 1.6025 9.77189 1.05235Z"
        fill="#7C8891"
      />
      <path
        d="M2.38195 9.90524C2.8534 8.91801 4.09246 8.58108 4.99893 9.19362L10.5989 12.9777C10.9146 13.191 11.0402 13.5947 10.9012 13.9495C10.7447 14.3489 10.3052 14.5584 9.89641 14.4285L3.45503 12.3821C2.41979 12.0532 1.91385 10.8854 2.38195 9.90524Z"
        fill="#7C8891"
      />
      <path
        d="M16 43.7941C16 44.5352 17.2364 45.2459 19.4372 45.7699C21.638 46.2939 24.6229 46.5882 27.7353 46.5882C30.8477 46.5882 33.8326 46.2939 36.0334 45.7699C38.2342 45.2459 39.4706 44.5352 39.4706 43.7941C39.4706 43.0531 38.2342 42.3424 36.0334 41.8184C33.8326 41.2944 30.8477 41 27.7353 41C24.6229 41 21.638 41.2944 19.4372 41.8184C17.2364 42.3424 16 43.0531 16 43.7941Z"
        fill="black"
        fillOpacity="0.8"
      />
      <path
        d="M32.6591 33.1964C33.2143 33.0183 33.8141 33.079 34.3266 33.3652C34.8391 33.6514 35.2224 34.1396 35.3923 34.7226L37.4207 41.6894L37.4411 41.7624C37.5891 42.3383 37.5181 42.9521 37.2431 43.474C36.9681 43.996 36.5107 44.3852 35.9674 44.5594L35.825 44.6054C35.2699 44.7835 34.6702 44.7227 34.1577 44.4365C33.6453 44.1503 33.262 43.6621 33.0922 43.0792L31.0635 36.1121C30.9794 35.8235 30.9504 35.5203 30.978 35.2198C31.0055 34.9194 31.0892 34.6276 31.2241 34.3611C31.3591 34.0946 31.5427 33.8587 31.7644 33.6667C31.9862 33.4748 32.2419 33.3306 32.5167 33.2424L32.6591 33.1964ZM21.3974 33.1964L21.5398 33.2424C21.8146 33.3306 22.0703 33.4748 22.2921 33.6667C22.5138 33.8587 22.6974 34.0946 22.8324 34.3611C22.9673 34.6276 23.051 34.9194 23.0785 35.2198C23.1061 35.5203 23.0771 35.8235 22.993 36.1121L20.9643 43.0789C20.7945 43.6618 20.4112 44.15 19.8988 44.4362C19.3863 44.7224 18.7866 44.7832 18.2315 44.6051L18.0888 44.5591C17.5457 44.3848 17.0885 43.9955 16.8136 43.4737C16.5387 42.9518 16.4678 42.3381 16.6157 41.7624L16.6358 41.6894L18.6642 34.7226C18.8341 34.1396 19.2174 33.6514 19.7299 33.3652C20.2424 33.079 20.8422 33.0183 21.3974 33.1964ZM38.098 28.2326C38.1108 28.3659 38.1172 28.5002 38.1172 28.6341V30.6261C38.1172 31.2763 37.8713 31.8999 37.4335 32.3597C36.9956 32.8195 36.4019 33.0778 35.7827 33.0778H17.982C17.3628 33.0778 16.769 32.8195 16.3312 32.3597C15.8934 31.8999 15.6475 31.2763 15.6475 30.6261V28.6341C15.6475 26.43 17.3487 24.643 19.4481 24.643C19.5838 24.643 19.7194 24.6507 19.8546 24.666L26.4963 25.4165L33.9072 24.6347C36.0103 24.4129 37.8867 26.0236 38.098 28.2326ZM39.6621 11.2766L39.8045 11.3226C40.0794 11.4108 40.335 11.555 40.5568 11.7469C40.7785 11.9389 40.9622 12.1749 41.0971 12.4413C41.2321 12.7078 41.3157 12.9996 41.3433 13.3C41.3708 13.6005 41.3418 13.9037 41.2577 14.1923L38.6124 23.2774C38.4426 23.8603 38.0594 24.3485 37.5469 24.6347C37.0344 24.9209 36.4347 24.9816 35.8796 24.8036L35.7369 24.7576C35.1938 24.5832 34.7366 24.194 34.4617 23.6721C34.1868 23.1503 34.1159 22.5366 34.2638 21.9608L34.2839 21.8876L36.929 12.8028C37.0988 12.2199 37.4821 11.7316 37.9946 11.4454C38.5072 11.1592 39.1069 11.0985 39.6621 11.2766Z"
        fill="url(#paint0_linear_2579_389)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2579_389"
          x1="28.5004"
          y1="11.1763"
          x2="28.5004"
          y2="44.7057"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#7E8A93" />
          <stop offset="1" stopColor="#485158" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const SwitchButtonIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="14"
      height="12"
      viewBox="0 0 14 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.99952 10.2667V11.2L3.99474 9.33333L5.99952 7.46667V8.4H8.99919C9.62783 8.40014 10.2406 8.21592 10.751 7.87335C11.2614 7.53079 11.6436 7.0472 11.8437 6.4909C12.0437 5.9346 12.0514 5.33369 11.8658 4.77307C11.6801 4.21244 11.3104 3.72043 10.809 3.36653L10.82 3.35347L12.2298 2.03747C13.0118 2.65508 13.5717 3.48201 13.8337 4.40637C14.0957 5.33073 14.0472 6.30791 13.6947 7.20569C13.3423 8.10348 12.7029 8.87853 11.8631 9.426C11.0233 9.97347 10.0235 10.2669 8.99919 10.2667L5.99852 10.2676L5.99952 10.2667ZM7.9993 0.933333V0L10.0461 1.86667L7.9993 3.73333V2.8H4.99963C4.3709 2.79999 3.75807 2.9844 3.24771 3.32715C2.73735 3.6699 2.35527 4.15368 2.15546 4.71013C1.95564 5.26659 1.94819 5.86758 2.13416 6.42819C2.32013 6.98881 2.69011 7.48071 3.19183 7.8344L1.76899 9.1616C0.987385 8.5439 0.42786 7.71705 0.166084 6.79285C-0.0956921 5.86866 -0.0470885 4.89172 0.305321 3.99415C0.657731 3.09658 1.29694 2.32169 2.13652 1.77426C2.97609 1.22684 3.97551 0.933297 4.99963 0.933333H7.9993Z"
        fill="#7E8A93"
      />
    </svg>
  );
};

export const ColorsBoxCenter = (props: any) => {
  return (
    <svg
      {...props}
      width="87"
      height="20"
      viewBox="0 0 87 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 0L1 6H87L82 0H6Z" fill="#1E564C" />
      <path
        d="M6 0H82L77.6126 13.1623C76.2514 17.2457 72.43 20 68.1257 20H19.8743C15.57 20 11.7486 17.2457 10.3874 13.1623L8 6L6 0Z"
        fill="url(#paint0_linear_0_1)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_0_1"
          x1="73.2058"
          y1="5.99998"
          x2="15.1811"
          y2="5.99998"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5B40FF" />
          <stop offset="1" stopColor="#00D6AF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const AddButtonIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="9"
      height="9"
      viewBox="0 0 9 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.40054 0.9C5.40054 0.402944 4.9976 0 4.50054 0C4.00348 0 3.60054 0.402943 3.60054 0.9V3.59997H0.9C0.402944 3.59997 0 4.00291 0 4.49997C0 4.99702 0.402944 5.39997 0.9 5.39997H3.60054V8.1C3.60054 8.59706 4.00348 9 4.50054 9C4.9976 9 5.40054 8.59706 5.40054 8.1V5.39997H8.1C8.59706 5.39997 9 4.99702 9 4.49997C9 4.00291 8.59706 3.59997 8.1 3.59997H5.40054V0.9Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const ArrowRightIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="5"
      height="8"
      viewBox="0 0 5 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 7L4 4L1 1" stroke="currentColor" stroke-linecap="round" />
    </svg>
  );
};

export const JumpLinkIcon = (props: any) => {
  return (
    <svg
      {...props}
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.55556 3.55556C7.43768 3.55556 7.32464 3.60238 7.24129 3.68573C7.15794 3.76908 7.11111 3.88213 7.11111 4V6.66667C7.11111 6.78454 7.06429 6.89759 6.98094 6.98094C6.89759 7.06429 6.78454 7.11111 6.66667 7.11111H1.33333C1.21546 7.11111 1.10241 7.06429 1.01906 6.98094C0.935714 6.89759 0.888889 6.78454 0.888889 6.66667V1.33333C0.888889 1.21546 0.935714 1.10241 1.01906 1.01906C1.10241 0.935714 1.21546 0.888889 1.33333 0.888889H4C4.11786 0.888871 4.23089 0.842038 4.31423 0.75869C4.39756 0.675343 4.44438 0.562307 4.44438 0.444445C4.44438 0.326582 4.39756 0.213546 4.31423 0.130199C4.23089 0.0468512 4.11786 1.80439e-05 4 0H1.33333C0.979711 0 0.640573 0.140476 0.390524 0.390524C0.140476 0.640573 0 0.979711 0 1.33333V6.66667C0 7.02029 0.140476 7.35943 0.390524 7.60948C0.640573 7.85952 0.979711 8 1.33333 8H6.66667C7.02029 8 7.35943 7.85952 7.60948 7.60948C7.85952 7.35943 8 7.02029 8 6.66667V4C8 3.88213 7.95318 3.76908 7.86983 3.68573C7.78648 3.60238 7.67343 3.55556 7.55556 3.55556Z"
        fill="#00C6A2"
      />
      <path
        d="M5.77753 0.888889H6.47976L3.6842 3.68C3.64254 3.72132 3.60948 3.77047 3.58692 3.82463C3.56435 3.87879 3.55273 3.93688 3.55273 3.99556C3.55273 4.05423 3.56435 4.11232 3.58692 4.16648C3.60948 4.22064 3.64254 4.26979 3.6842 4.31111C3.72552 4.35277 3.77467 4.38583 3.82883 4.4084C3.88299 4.43096 3.94108 4.44258 3.99976 4.44258C4.05843 4.44258 4.11652 4.43096 4.17068 4.4084C4.22484 4.38583 4.27399 4.35277 4.31531 4.31111L7.11087 1.52V2.22222C7.11087 2.3401 7.15769 2.45314 7.24104 2.53649C7.32439 2.61984 7.43744 2.66667 7.55531 2.66667C7.67319 2.66667 7.78623 2.61984 7.86958 2.53649C7.95293 2.45314 7.99976 2.3401 7.99976 2.22222V0.444445C7.99976 0.326571 7.95293 0.213524 7.86958 0.130175C7.78623 0.0468253 7.67319 0 7.55531 0H5.77753C5.65967 1.80439e-05 5.54664 0.0468512 5.46331 0.130199C5.37997 0.213546 5.33316 0.326582 5.33316 0.444445C5.33316 0.562307 5.37997 0.675343 5.46331 0.75869C5.54664 0.842038 5.65967 0.888871 5.77753 0.888889Z"
        fill="#00C6A2"
      />
    </svg>
  );
};

export const TipIon = (props: any) => {
  return (
    <svg
      {...props}
      width="32"
      height="14"
      viewBox="0 0 32 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.283203 2C0.283203 0.89543 1.17863 0 2.2832 0L25.254 0C25.8999 0 26.506 0.311931 26.8814 0.837524L30.4529 5.83752C30.9496 6.53292 30.9496 7.46708 30.4529 8.16248L26.8814 13.1625C26.506 13.6881 25.8999 14 25.254 14H2.2832C1.17863 14 0.283203 13.1046 0.283203 12L0.283203 2Z"
        fill="#00FFD1"
      />
      <path
        d="M10.4232 4.42V3H4.6232V4.42H6.7532V10H8.2932V4.42H10.4232ZM13.0776 4.05V2.7H11.4776V4.05H13.0776ZM13.0376 10V4.64H11.5176V10H13.0376ZM20.0952 7.33V7.31C20.0952 6.86333 20.0252 6.47 19.8852 6.13C19.7518 5.78333 19.5718 5.49333 19.3452 5.26C19.1185 5.02 18.8585 4.84 18.5652 4.72C18.2718 4.6 17.9685 4.54 17.6552 4.54C17.2552 4.54 16.9218 4.62333 16.6552 4.79C16.3952 4.95 16.1718 5.15667 15.9852 5.41V4.64H14.4652V11.6H15.9852V9.3C16.1652 9.51333 16.3852 9.7 16.6452 9.86C16.9118 10.02 17.2485 10.1 17.6552 10.1C17.9752 10.1 18.2818 10.04 18.5752 9.92C18.8685 9.8 19.1252 9.62333 19.3452 9.39C19.5718 9.15 19.7518 8.86 19.8852 8.52C20.0252 8.17333 20.0952 7.77667 20.0952 7.33ZM18.5752 7.33C18.5752 7.55667 18.5385 7.76 18.4652 7.94C18.3985 8.12 18.3052 8.27667 18.1852 8.41C18.0652 8.53667 17.9252 8.63667 17.7652 8.71C17.6118 8.77667 17.4452 8.81 17.2652 8.81C17.0852 8.81 16.9152 8.77667 16.7552 8.71C16.6018 8.63667 16.4652 8.53667 16.3452 8.41C16.2318 8.27667 16.1385 8.12 16.0652 7.94C15.9985 7.75333 15.9652 7.55 15.9652 7.33V7.31C15.9652 7.09 15.9985 6.89 16.0652 6.71C16.1385 6.52333 16.2318 6.36667 16.3452 6.24C16.4652 6.10667 16.6018 6.00667 16.7552 5.94C16.9152 5.86667 17.0852 5.83 17.2652 5.83C17.4452 5.83 17.6118 5.86667 17.7652 5.94C17.9252 6.00667 18.0652 6.10667 18.1852 6.24C18.3052 6.36667 18.3985 6.52333 18.4652 6.71C18.5385 6.89 18.5752 7.09 18.5752 7.31V7.33ZM25.1432 8.37V8.35C25.1432 8.10333 25.0932 7.89333 24.9932 7.72C24.8932 7.54667 24.7665 7.4 24.6132 7.28C24.4599 7.16 24.2865 7.06 24.0932 6.98C23.8999 6.89333 23.7099 6.82 23.5232 6.76C23.3765 6.71333 23.2365 6.66667 23.1032 6.62C22.9765 6.57333 22.8632 6.52667 22.7632 6.48C22.6632 6.42667 22.5832 6.37333 22.5232 6.32C22.4632 6.26 22.4332 6.19333 22.4332 6.12V6.1C22.4332 5.99333 22.4799 5.90667 22.5732 5.84C22.6665 5.76667 22.8065 5.73 22.9932 5.73C23.1865 5.73 23.4099 5.77667 23.6632 5.87C23.9165 5.95667 24.1765 6.07667 24.4432 6.23L25.0232 5.18C24.7299 4.98667 24.4065 4.83667 24.0532 4.73C23.7065 4.61667 23.3632 4.56 23.0232 4.56C22.7499 4.56 22.4932 4.59667 22.2532 4.67C22.0199 4.74333 21.8132 4.85333 21.6332 5C21.4599 5.14667 21.3199 5.32667 21.2132 5.54C21.1132 5.74667 21.0632 5.98667 21.0632 6.26V6.28C21.0632 6.54 21.1099 6.76 21.2032 6.94C21.3032 7.12 21.4299 7.27333 21.5832 7.4C21.7365 7.52 21.9065 7.62 22.0932 7.7C22.2865 7.77333 22.4765 7.83667 22.6632 7.89C22.8099 7.93667 22.9499 7.98 23.0832 8.02C23.2165 8.06 23.3332 8.10333 23.4332 8.15C23.5399 8.19 23.6232 8.24 23.6832 8.3C23.7432 8.36 23.7732 8.43 23.7732 8.51V8.53C23.7732 8.65 23.7199 8.74667 23.6132 8.82C23.5132 8.89333 23.3532 8.93 23.1332 8.93C22.8799 8.93 22.6065 8.87667 22.3132 8.77C22.0265 8.66333 21.7365 8.50333 21.4432 8.29L20.7932 9.29C21.1532 9.57 21.5299 9.77667 21.9232 9.91C22.3232 10.0367 22.7132 10.1 23.0932 10.1C23.3799 10.1 23.6465 10.0667 23.8932 10C24.1465 9.92667 24.3665 9.82 24.5532 9.68C24.7399 9.54 24.8832 9.36333 24.9832 9.15C25.0899 8.93 25.1432 8.67 25.1432 8.37Z"
        fill="black"
      />
    </svg>
  );
};

export function WarningTip(props: any) {
  return (
    <svg
      {...props}
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.8582 1.4C9.7805 -0.466667 7.0862 -0.466663 6.00847 1.4L0.379311 11.15C-0.698409 13.0167 0.648743 15.35 2.80418 15.35H14.0625C16.218 15.35 17.5651 13.0167 16.4874 11.15L10.8582 1.4ZM7.39412 2.2C7.856 1.4 9.0107 1.4 9.47258 2.2L15.1017 11.95C15.5636 12.75 14.9863 13.75 14.0625 13.75H2.80418C1.88042 13.75 1.30307 12.75 1.76495 11.95L7.39412 2.2ZM8.84235 3.84998C8.74443 3.81541 8.63956 3.79846 8.53399 3.80015C8.42842 3.79846 8.32354 3.81541 8.22563 3.84998C8.12772 3.88455 8.03877 3.93603 7.96411 4.00134C7.88945 4.06665 7.8306 4.14446 7.79109 4.23011C7.75157 4.31577 7.7322 4.40751 7.73412 4.49986V8.51391C7.7322 8.60626 7.75157 8.698 7.79109 8.78365C7.8306 8.86931 7.88945 8.94711 7.96411 9.01243C8.03877 9.07774 8.12772 9.12922 8.22563 9.16379C8.32354 9.19835 8.42842 9.2153 8.53399 9.21362C8.63947 9.2153 8.74425 9.19838 8.84209 9.16387C8.93993 9.12936 9.02882 9.07797 9.10347 9.01276C9.17812 8.94755 9.23699 8.86986 9.27657 8.78431C9.31615 8.69877 9.33563 8.60713 9.33386 8.51486V4.49986C9.33578 4.40751 9.31641 4.31577 9.27689 4.23011C9.23738 4.14446 9.17853 4.06665 9.10387 4.00134C9.02921 3.93603 8.94026 3.88455 8.84235 3.84998ZM8.84235 10.2906C8.74443 10.256 8.63956 10.2391 8.53399 10.2408C8.32203 10.2413 8.11891 10.3151 7.96903 10.4463C7.81915 10.5774 7.7347 10.7551 7.73412 10.9405V11.5944C7.7322 11.6867 7.75157 11.7785 7.79109 11.8641C7.8306 11.9498 7.88945 12.0276 7.96411 12.0929C8.03877 12.1582 8.12772 12.2097 8.22563 12.2442C8.32354 12.2788 8.42842 12.2958 8.53399 12.2941C8.63956 12.2958 8.74443 12.2788 8.84235 12.2442C8.94026 12.2097 9.02921 12.1582 9.10387 12.0929C9.17853 12.0276 9.23738 11.9498 9.27689 11.8641C9.31641 11.7785 9.33578 11.6867 9.33386 11.5944V10.9405C9.33578 10.8481 9.31641 10.7564 9.27689 10.6707C9.23738 10.5851 9.17853 10.5073 9.10387 10.4419C9.02921 10.3766 8.94026 10.3252 8.84235 10.2906Z"
        fill="#FFA24D"
      />
    </svg>
  );
}

export function MobileWarningTip(props: any) {
  return (
    <svg
      {...props}
      width="33"
      height="30"
      viewBox="0 0 33 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.2213 2.73616C19.115 -0.912056 13.8492 -0.912049 11.7429 2.73616L0.741315 21.7915C-1.36498 25.4397 1.26789 30 5.48048 30H27.4837C31.6963 30 34.3292 25.4397 32.2229 21.7915L21.2213 2.73616ZM14.451 4.29968C15.3537 2.73616 17.6105 2.73616 18.5132 4.29967L29.5148 23.355C30.4175 24.9186 29.2891 26.873 27.4837 26.873H5.48048C3.67508 26.873 2.54671 24.9186 3.44941 23.355L14.451 4.29968ZM17.2801 7.52467C17.0887 7.45712 16.8838 7.42399 16.6774 7.42728C16.4711 7.42399 16.2662 7.45712 16.0748 7.52467C15.8834 7.59223 15.7096 7.69284 15.5637 7.82049C15.4178 7.94813 15.3028 8.1002 15.2255 8.2676C15.1483 8.43501 15.1104 8.61431 15.1142 8.7948V16.6398C15.1104 16.8203 15.1483 16.9996 15.2255 17.167C15.3028 17.3344 15.4178 17.4865 15.5637 17.6141C15.7096 17.7418 15.8834 17.8424 16.0748 17.91C16.2662 17.9775 16.4711 18.0106 16.6774 18.0074C16.8836 18.0106 17.0884 17.9776 17.2796 17.9101C17.4708 17.8427 17.6446 17.7422 17.7904 17.6148C17.9363 17.4873 18.0514 17.3355 18.1287 17.1683C18.2061 17.0011 18.2442 16.822 18.2407 16.6417V8.7948C18.2445 8.61431 18.2066 8.43501 18.1294 8.2676C18.0521 8.1002 17.9371 7.94813 17.7912 7.82049C17.6453 7.69284 17.4715 7.59223 17.2801 7.52467ZM17.2801 20.1122C17.0887 20.0446 16.8838 20.0115 16.6774 20.0148C16.2632 20.0158 15.8662 20.1602 15.5733 20.4164C15.2804 20.6727 15.1153 21.0199 15.1142 21.3823V22.6603C15.1104 22.8408 15.1483 23.0201 15.2255 23.1875C15.3028 23.3549 15.4178 23.5069 15.5637 23.6346C15.7096 23.7622 15.8834 23.8628 16.0748 23.9304C16.2662 23.998 16.4711 24.0311 16.6774 24.0278C16.8838 24.0311 17.0887 23.998 17.2801 23.9304C17.4715 23.8628 17.6453 23.7622 17.7912 23.6346C17.9371 23.5069 18.0521 23.3549 18.1294 23.1875C18.2066 23.0201 18.2445 22.8408 18.2407 22.6603V21.3823C18.2445 21.2018 18.2066 21.0225 18.1294 20.8551C18.0521 20.6877 17.9371 20.5356 17.7912 20.408C17.6453 20.2804 17.4715 20.1797 17.2801 20.1122Z"
        fill="#FFA24D"
      />
    </svg>
  );
}
