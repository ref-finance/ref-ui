import React from 'react';

const bgGridImg = 'https://i.postimg.cc/t4Dh5Xbf/Rectangle.png';
const bgGridSmallImg = 'https://i.postimg.cc/qMXN2t0M/small-Grid-Image-2.png';

export function BgShapeLeftTop() {
  return (
    <div
      className="w-40 absolute md:hidden xs:hidden"
      style={{
        top: -30,
        left: -35,
        pointerEvents: 'none',
      }}
    >
      <svg
        width="111"
        height="87"
        viewBox="0 0 111 87"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="38" cy="14" r="73" fill="url(#paint0_linear_148:1006)" />
        <defs>
          <linearGradient
            id="paint0_linear_148:1006"
            x1="-5.11409"
            y1="-40.1376"
            x2="75.2349"
            y2="78.6711"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#5AC694" />
            <stop offset="1" stopColor="#5AC694" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function BgShapeAnimation() {
  return (
    <div className="w-full top-0 md:hidden xs:hidden block absolute left-0 overflow-hidden max-h-screen pt-40">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 565"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M-14 564.5L1064 49.5L1128.5 175.5L1447.5 1" stroke="#007560" />
      </svg>
    </div>
  );
}

export function BgShapeCenter() {
  return (
    <div className="w-full top-0 md:hidden xs:hidden block absolute left-0 overflow-hidden max-h-screen pt-20">
      <img src={bgGridImg} alt="" className="w-full max-h-screen" />
    </div>
  );
}

export function BgShapeCenterSmall() {
  return (
    <div className="w-full top-0 absolute left-0 overflow-hidden max-h-screen hidden md:block xs:block">
      <img src={bgGridSmallImg} alt="" className="w-full h-auto" />
    </div>
  );
}
