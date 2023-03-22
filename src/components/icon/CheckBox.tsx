import React from 'react';

const CheckedBg = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="15" height="15" rx="4" fill="url(#paint0_linear_105:1138)" />
      <defs>
        <linearGradient
          id="paint0_linear_105:1138"
          x1="7.5"
          y1="0"
          x2="7.5"
          y2="15"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00C6A2" />
          <stop offset="1" stopColor="#008B72" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const Tick = () => {
  return (
    <svg
      width="10"
      height="8"
      viewBox="0 0 10 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 3.5L3.66667 6L9 1"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
export const UnCheckedBoxVE = () => {
  return (
    <svg
      width="37"
      height="37"
      viewBox="0 0 37 37"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_bd_106_2650)">
        <rect x="11" y="11" width="15" height="15" rx="4" fill="#304452" />
        <rect x="11" y="11" width="15" height="15" rx="4" stroke="#00C6A2" />
      </g>
      <defs>
        <filter
          id="filter0_bd_106_2650"
          x="-39.5"
          y="-39.5"
          width="116"
          height="116"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImage" stdDeviation="25" />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_106_2650"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_backgroundBlur_106_2650"
            result="effect2_dropShadow_106_2650"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_106_2650"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

export const CheckedTick = () => {
  return (
    <div className="relative">
      <CheckedBg />
      <div className="absolute top-1 left-0.5">
        <Tick />
      </div>
    </div>
  );
};

export const CheckedEmpty = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="15" height="15" rx="4" fill="#304452" />
    </svg>
  );
};

export const UnCheckedRadio = ({ size }: { size?: string }) => {
  return (
    <div
      className={`w-${size ? size : '4'} h-${
        size ? size : '4'
      } rounded-full border border-gradientFrom bg-inputDarkBg`}
    />
  );
};

export const CheckedRadio = ({ size }: { size?: string }) => {
  return (
    <div
      className={`w-${size ? size : '4'} h-${
        size ? size : '4'
      } rounded-full border border-gradientFrom`}
      style={{
        padding: `${Math.floor(Number(size || '4') / 2).toString()}px`,
      }}
    >
      <div className="rounded-full bg-gradientFrom w-full h-full" />
    </div>
  );
};

export function Radio({
  checked,
  handleSelect,
  value,
  size,
  checkOut,
}: {
  checked: boolean;
  handleSelect: (e: string) => void;
  value?: string;
  size?: string;
  checkOut?: boolean;
}) {
  return (
    <div
      className="cursor-pointer"
      onClick={() => {
        !checked && handleSelect(value);
        checkOut && checked && handleSelect('');
      }}
    >
      {checked ? <CheckedRadio size={size} /> : <UnCheckedRadio size={size} />}
    </div>
  );
}

export const LedgerAccountChecked = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="9.5" fill="#00C6A2" stroke="#00C6A2" />
      <path
        d="M6 10.5L8.66667 13L14 8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const LedgerAccountNotChecked = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="9.5" fill="#19232A" stroke="#00C6A2" />
    </svg>
  );
};

export const LedgerCheckbox = ({
  checked,
  setChecked,
  index,
}: {
  checked: boolean;
  setChecked: (index: number, c: boolean) => void;
  index: number;
}) => {
  return (
    <div
      onClick={() => {
        setChecked(index, !checked);
      }}
      className="absolute cursor-pointer top-4 -right-8"
    >
      {checked ? <LedgerAccountChecked /> : <LedgerAccountNotChecked />}
    </div>
  );
};
