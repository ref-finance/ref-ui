import React, { useState, useRef } from 'react';
import { isMobile } from '../../utils/device';

export function ArrowDownGreen() {
  return (
    <svg
      width="10"
      height="7"
      viewBox="0 0 10 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L5 6L9 1"
        stroke="#00C08B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowDownBlack() {
  return (
    <svg
      width="10"
      height="14"
      viewBox="0 0 10 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.9662 8.42193C7.82093 8.29125 7.59821 8.3027 7.46543 8.44829L4.89581 11.3102V1.58659C4.89581 1.39039 4.7374 1.23163 4.54167 1.23163C4.3459 1.23163 4.18752 1.39039 4.18752 1.58659V11.3101L1.6179 8.44826C1.48579 8.30197 1.26236 8.29052 1.11713 8.4219C0.971871 8.55295 0.960116 8.77757 1.09084 8.92315L4.27813 12.4727C4.34593 12.5476 4.44136 12.5902 4.54167 12.5902C4.64197 12.5902 4.7374 12.5476 4.8052 12.4727L7.9925 8.92315C8.12322 8.77757 8.11146 8.55295 7.9662 8.42193Z"
        fill="white"
        stroke="black"
        strokeWidth="2"
      />
    </svg>
  );
}

export function ArrowDownWhite() {
  return (
    <svg
      width="10"
      height="7"
      viewBox="0 0 10 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L5 6L9 1"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BackArrowWhite() {
  return (
    <svg
      width="11"
      height="19"
      viewBox="0 0 11 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 1L2 9.5L10 18"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function BackArrowGray() {
  return (
    <svg
      width="8"
      height="13"
      viewBox="0 0 8 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 1L2 6.5L7 12"
        stroke="#7E8A93"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DownArrowLight() {
  return (
    <svg
      width="8"
      height="11"
      viewBox="0 0 8 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.11372e-08 7.38265C-3.27892e-05 7.54503 0.0723861 7.70172 0.203402 7.82274L3.40758 10.781C3.70106 11.052 4.20422 11.0746 4.53142 10.8315C4.55284 10.8156 4.57321 10.7987 4.59242 10.781L7.79658 7.82274C8.09007 7.55179 8.06274 7.13509 7.73556 6.89203C7.58966 6.7836 7.40038 6.7236 7.20415 6.72358L5.75927 6.72357C5.48313 6.72357 5.25927 6.49971 5.25927 6.22357V0.997837C5.25927 0.446742 4.71866 0 4.05175 0C3.38485 0 2.84423 0.446742 2.84423 0.997825V6.22356C2.84423 6.49971 2.62037 6.72356 2.34423 6.72356H0.795846C0.360713 6.72356 0.00711989 7.01278 0.000104992 7.37175L1.11372e-08 7.38265Z"
        fill="#00C6A2"
      />
    </svg>
  );
}

export function DownArrowLightMobile() {
  return (
    <svg
      width="8"
      height="11"
      viewBox="0 0 8 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.11372e-08 7.38265C-3.27892e-05 7.54503 0.0723861 7.70172 0.203402 7.82274L3.40758 10.781C3.70106 11.052 4.20422 11.0746 4.53142 10.8315C4.55284 10.8156 4.57321 10.7987 4.59242 10.781L7.79658 7.82274C8.09007 7.55179 8.06274 7.13509 7.73556 6.89203C7.58966 6.7836 7.40038 6.7236 7.20415 6.72358L5.75927 6.72357C5.48313 6.72357 5.25927 6.49971 5.25927 6.22357V0.997837C5.25927 0.446742 4.71866 0 4.05175 0C3.38485 0 2.84423 0.446742 2.84423 0.997825V6.22356C2.84423 6.49971 2.62037 6.72356 2.34423 6.72356H0.795846C0.360713 6.72356 0.00711989 7.01278 0.000104992 7.37175L1.11372e-08 7.38265Z"
        fill="#c4c4c4"
      />
    </svg>
  );
}

export function UpArrowLight() {
  return (
    <svg
      width="8"
      height="11"
      viewBox="0 0 8 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 3.61735C8.00003 3.45497 7.92761 3.29828 7.7966 3.17726L4.59242 0.219006C4.29894 -0.0519651 3.79578 -0.0745939 3.46859 0.168471C3.44716 0.184392 3.42679 0.201262 3.40758 0.219006L0.203419 3.17725C-0.0900672 3.44821 -0.0627426 3.86491 0.26444 4.10797C0.410341 4.2164 0.599622 4.2764 0.795848 4.27642L2.24073 4.27643C2.51687 4.27643 2.74073 4.50029 2.74073 4.77643L2.74073 10.0022C2.74073 10.5533 3.28134 11 3.94825 11C4.61515 11 5.15577 10.5533 5.15577 10.0022L5.15577 4.77644C5.15577 4.50029 5.37963 4.27644 5.65577 4.27644L7.20415 4.27644C7.63929 4.27644 7.99288 3.98722 7.9999 3.62825L8 3.61735Z"
        fill="#00C6A2"
      />
    </svg>
  );
}

export function UpArrowDeep() {
  return (
    <svg
      width="8"
      height="11"
      viewBox="0 0 8 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 3.61735C8.00003 3.45497 7.92761 3.29828 7.7966 3.17726L4.59242 0.219006C4.29894 -0.0519651 3.79578 -0.0745939 3.46859 0.168471C3.44716 0.184392 3.42679 0.201262 3.40758 0.219006L0.203419 3.17725C-0.0900672 3.44821 -0.0627426 3.86491 0.26444 4.10797C0.410341 4.2164 0.599622 4.2764 0.795848 4.27642L2.24073 4.27643C2.51687 4.27643 2.74073 4.50029 2.74073 4.77643L2.74073 10.0022C2.74073 10.5533 3.28134 11 3.94825 11C4.61515 11 5.15577 10.5533 5.15577 10.0022L5.15577 4.77644C5.15577 4.50029 5.37963 4.27644 5.65577 4.27644L7.20415 4.27644C7.63929 4.27644 7.99288 3.98722 7.9999 3.62825L8 3.61735Z"
        fill="#7E8A93"
      />
    </svg>
  );
}

export function SwapArrowDown({ light }: { light?: boolean }) {
  return (
    <svg
      width="6"
      height="16"
      viewBox="0 0 6 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        marginLeft: '1px',
      }}
    >
      <path
        opacity={light ? '1' : '0.3'}
        d="M0.600016 14.8783L0.600017 1.12174C0.600017 0.501668 1.04614 6.98561e-07 1.59755 7.22664e-07C2.14896 7.46767e-07 2.59508 0.501668 2.59508 1.12174L2.59508 12.1549L4.22993 10.3165C4.62063 9.87717 5.2524 9.87717 5.64032 10.3165C6.03102 10.7559 6.03102 11.4663 5.64032 11.9025L2.39557 15.5544C2.21269 15.8255 1.92452 16 1.59755 16C1.04613 16 0.600016 15.4983 0.600016 14.8783Z"
        fill={light ? '#00C6A2' : 'white'}
      />
    </svg>
  );
}

export function SwapArrowUp({ light }: { light?: boolean }) {
  return (
    <svg
      width="6"
      height="16"
      viewBox="0 0 6 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        marginRight: '1px',
      }}
    >
      <path
        opacity={light ? '1' : '0.3'}
        d="M5.33333 1.12174L5.33333 14.8783C5.33333 15.4983 4.88721 16 4.3358 16C3.78439 16 3.33827 15.4983 3.33827 14.8783L3.33827 3.84508L1.70342 5.68349C1.31272 6.12283 0.680954 6.12283 0.293025 5.68349C-0.0976752 5.24414 -0.0976752 4.5337 0.293025 4.09747L3.53778 0.445581C3.72066 0.174493 4.00883 1.75232e-07 4.3358 1.89524e-07C4.88722 2.13627e-07 5.33333 0.501668 5.33333 1.12174Z"
        fill={light ? '#00C6A2' : 'white'}
      />
    </svg>
  );
}
export function SwapArrowRight({ light }: { light?: boolean }) {
  return (
    <svg
      width="17"
      height="6"
      viewBox="0 0 17 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        marginBottom: '1px',
      }}
    >
      <path
        opacity={light ? '1' : '0.3'}
        d="M15.3448 5.86654H1.58829C0.968221 5.86654 0.466554 5.42042 0.466554 4.869C0.466554 4.31759 0.968221 3.87147 1.58829 3.87147H12.6215L10.7831 2.23663C10.3437 1.84593 10.3437 1.21416 10.7831 0.826228C11.2224 0.435528 11.9329 0.435528 12.3691 0.826228L16.021 4.07098C16.2921 4.25386 16.4666 4.54204 16.4666 4.869C16.4666 5.42042 15.9649 5.86654 15.3448 5.86654Z"
        fill={light ? '#00C6A2' : 'white'}
      />
    </svg>
  );
}

export function SwapArrowLeft({ light }: { light?: boolean }) {
  return (
    <svg
      width="17"
      height="6"
      viewBox="0 0 17 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        marginTop: '1px',
      }}
    >
      <path
        opacity={light ? '1' : '0.3'}
        d="M1.58829 0.133463H15.3448C15.9649 0.133463 16.4666 0.579582 16.4666 1.131C16.4666 1.68241 15.9649 2.12853 15.3448 2.12853H4.31163L6.15004 3.76337C6.58939 4.15407 6.58939 4.78584 6.15004 5.17377C5.71069 5.56447 5.00025 5.56447 4.56402 5.17377L0.912133 1.92902C0.641046 1.74614 0.466553 1.45796 0.466553 1.131C0.466553 0.579582 0.96822 0.133463 1.58829 0.133463Z"
        fill={light ? '#00C6A2' : 'white'}
      />
    </svg>
  );
}

export function SwapArrow({
  hover,
  mobileClick,
}: {
  hover?: boolean;
  mobileClick?: boolean;
}) {
  const upRow = useRef(null);
  const downRow = useRef(null);

  const mobileDevice = isMobile();

  const [mobileAnimation, setMobileAnimation] = useState<boolean>(false);

  const runSwapAnimation = function () {
    upRow.current.style.animation = 'arrowUp 0.5s 0s ease-out 1';
    downRow.current.style.animation = 'arrowDown 0.5s 0s ease-out 1';
    setMobileAnimation(true);

    upRow.current.addEventListener('animationend', function () {
      upRow.current.style.animation = '';
      setMobileAnimation(false);
    });
    downRow.current.addEventListener('animationend', function () {
      downRow.current.style.animation = '';
      setMobileAnimation(false);
    });
  };

  mobileClick && mobileDevice && runSwapAnimation();

  return (
    <div className="flex items-center">
      <span
        className={`transition-transform transform ${
          hover ? 'lg:-translate-y-1 ' : ''
        }`}
        ref={upRow}
      >
        <SwapArrowUp light={mobileDevice ? mobileAnimation : hover} />
      </span>
      <span
        className={`transition-transform transform ${
          hover ? 'lg:translate-y-1 xs:animate-arrowUp' : ''
        }`}
        ref={downRow}
      >
        <SwapArrowDown light={mobileDevice ? mobileAnimation : hover} />
      </span>
    </div>
  );
}

export function SwapExchange({ onChange }: { onChange: (e?: any) => void }) {
  const [hover, setHover] = useState<boolean>(false);
  const upRow = useRef(null);
  const downRow = useRef(null);

  const mobileDevice = isMobile();

  const [mobileAnimation, setMobileAnimation] = useState<boolean>(false);

  const runSwapAnimation = function () {
    upRow.current.style.animation = 'arrowUp 0.5s 0s ease-out 1';
    downRow.current.style.animation = 'arrowDown 0.5s 0s ease-out 1';
    setMobileAnimation(true);

    upRow.current.addEventListener('animationend', function () {
      upRow.current.style.animation = '';
      setMobileAnimation(false);
    });
    downRow.current.addEventListener('animationend', function () {
      downRow.current.style.animation = '';
      setMobileAnimation(false);
    });
  };

  return (
    <div
      className="relative flex items-center justify-center -mt-6 mb-4 w-11 h-11 border border-white border-opacity-40 rounded-full cursor-pointer bg-dark"
      onClick={() => {
        onChange();
        mobileDevice && runSwapAnimation();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-center">
        <span
          className={`transition-transform transform ${
            hover ? 'lg:-translate-y-1 ' : ''
          }`}
          ref={upRow}
        >
          <SwapArrowUp light={mobileDevice ? mobileAnimation : hover} />
        </span>
        <span
          className={`transition-transform transform ${
            hover ? 'lg:translate-y-1 ' : ''
          }`}
          ref={downRow}
        >
          <SwapArrowDown light={mobileDevice ? mobileAnimation : hover} />
        </span>
      </div>
    </div>
  );
}

export function StableSwapExchangePC({
  onChange,
}: {
  onChange: (e?: any) => void;
}) {
  const [hover, setHover] = useState<boolean>(false);
  const rightRow = useRef(null);
  const leftRow = useRef(null);

  const mobileDevice = isMobile();

  const [mobileAnimation, setMobileAnimation] = useState<boolean>(false);

  const runSwapAnimation = function () {
    rightRow.current.style.animation = 'arrowUp 0.5s 0s ease-out 1';
    leftRow.current.style.animation = 'arrowDown 0.5s 0s ease-out 1';
    setMobileAnimation(true);

    rightRow.current.addEventListener('animationend', function () {
      rightRow.current.style.animation = '';
      setMobileAnimation(false);
    });
    leftRow.current.addEventListener('animationend', function () {
      leftRow.current.style.animation = '';
      setMobileAnimation(false);
    });
  };

  return (
    <div
      className="relative flex items-center justify-center -mt-6 mb-4 w-11 h-11 border border-white border-opacity-40 rounded-full cursor-pointer bg-dark"
      onClick={() => {
        onChange();
        mobileDevice && runSwapAnimation();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex flex-col items-center">
        <span
          className={`transition-transform transform ${
            hover ? 'lg:translate-x-1 ' : ''
          }`}
          ref={rightRow}
        >
          <SwapArrowRight light={mobileDevice ? mobileAnimation : hover} />
        </span>
        <span
          className={`transition-transform transform ${
            hover ? 'lg:-translate-x-1' : ''
          }`}
          ref={leftRow}
        >
          <SwapArrowLeft light={mobileDevice ? mobileAnimation : hover} />
        </span>
      </div>
    </div>
  );
}

export const ExchangeArrow = () => {
  return (
    <div className="flex flex-col items-center mx-1">
      <span>
        <SwapArrowRight />
      </span>
      <span>
        <SwapArrowLeft />
      </span>
    </div>
  );
};
