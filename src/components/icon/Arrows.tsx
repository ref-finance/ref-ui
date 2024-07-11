import React, { useState, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { isMobile } from '../../utils/device';
import { TokenMetadata } from '../../services/ft-contract';
import { regularizedPrice } from '../../services/swapV3';
import { ONLY_ZEROS, toPrecision } from '../../utils/numbers';

export function ArrowGrey() {
  return (
    <svg
      width="10"
      height="8"
      viewBox="0 0 10 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 3.5C0.723858 3.5 0.5 3.72386 0.5 4C0.5 4.27614 0.723858 4.5 1 4.5L1 3.5ZM9.35355 4.35355C9.54882 4.15829 9.54882 3.84171 9.35355 3.64645L6.17157 0.464467C5.97631 0.269204 5.65973 0.269204 5.46447 0.464466C5.2692 0.659729 5.2692 0.976311 5.46447 1.17157L8.29289 4L5.46447 6.82843C5.2692 7.02369 5.2692 7.34027 5.46447 7.53553C5.65973 7.7308 5.97631 7.7308 6.17157 7.53553L9.35355 4.35355ZM1 4.5L9 4.5L9 3.5L1 3.5L1 4.5Z"
        fill="#7E8A93"
      />
    </svg>
  );
}

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

export function ArrowDownCur() {
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
        stroke="currentColor"
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

export function DownArrowLightMobile({ color }: { color?: string }) {
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
        fill={color || '#c4c4c4'}
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

export function SwapArrowDown({
  light,
  width,
}: {
  light?: boolean;
  width?: string;
}) {
  return (
    <svg
      width={width || '6'}
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

export function SwapArrowUp({
  light,
  width,
}: {
  light?: boolean;
  width?: string;
}) {
  return (
    <svg
      width={width || '6'}
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
        opacity={'1'}
        d="M15.3448 5.86654H1.58829C0.968221 5.86654 0.466554 5.42042 0.466554 4.869C0.466554 4.31759 0.968221 3.87147 1.58829 3.87147H12.6215L10.7831 2.23663C10.3437 1.84593 10.3437 1.21416 10.7831 0.826228C11.2224 0.435528 11.9329 0.435528 12.3691 0.826228L16.021 4.07098C16.2921 4.25386 16.4666 4.54204 16.4666 4.869C16.4666 5.42042 15.9649 5.86654 15.3448 5.86654Z"
        fill={light ? '#00C6A2' : 'currentColor'}
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
        opacity={'1'}
        d="M1.58829 0.133463H15.3448C15.9649 0.133463 16.4666 0.579582 16.4666 1.131C16.4666 1.68241 15.9649 2.12853 15.3448 2.12853H4.31163L6.15004 3.76337C6.58939 4.15407 6.58939 4.78584 6.15004 5.17377C5.71069 5.56447 5.00025 5.56447 4.56402 5.17377L0.912133 1.92902C0.641046 1.74614 0.466553 1.45796 0.466553 1.131C0.466553 0.579582 0.96822 0.133463 1.58829 0.133463Z"
        fill={light ? '#00C6A2' : 'currentColor'}
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
    <div className="flex items-center -my-2.5 justify-center">
      <div
        className="relative  flex items-center justify-center w-7 h-7 border-2 border-switchIconBorderColor rounded-lg cursor-pointer bg-switchIconBgColor"
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
              hover ? 'lg:-translate-y-0.5' : ''
            }`}
            ref={upRow}
          >
            <SwapArrowUp
              width="5"
              light={mobileDevice ? mobileAnimation : hover}
            />
          </span>
          <span
            className={`transition-transform transform ${
              hover ? 'lg:translate-y-1 ' : ''
            }`}
            ref={downRow}
          >
            <SwapArrowDown
              width="5"
              light={mobileDevice ? mobileAnimation : hover}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

export function SwapRateExchange({
  onChange,
}: {
  onChange: (e?: any) => void;
}) {
  const [hover, setHover] = useState<boolean>(false);
  const upRow = useRef(null);
  const downRow = useRef(null);

  const mobileDevice = isMobile();

  const [mobileAnimation, setMobileAnimation] = useState<boolean>(false);

  const runSwapAnimation = function () {
    upRow.current.style.animation = 'arrowRight 0.5s 0s ease-out 1';
    downRow.current.style.animation = 'arrowLeft 0.5s 0s ease-out 1';
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
      className="relative flex-shrink-0 transform scale-75 rotate-90 flex items-center justify-center w-7 h-7 border-2 border-switchIconBorderColor rounded-lg cursor-pointer bg-switchIconBgColor"
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
            hover ? 'lg:-translate-y-0.5' : ''
          }`}
          ref={upRow}
        >
          <SwapArrowUp width="5" light={mobileDevice ? false : hover} />
        </span>
        <span
          className={`transition-transform transform ${
            hover ? 'lg:translate-y-1 ' : ''
          }`}
          ref={downRow}
        >
          <SwapArrowDown width="5" light={mobileDevice ? false : hover} />
        </span>
      </div>
    </div>
  );
}

export const RouterArrowLeft = ({ color }: { color?: string }) => {
  return (
    <svg
      width="6"
      height="12"
      viewBox="0 0 6 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.31152 1L0.999633 5.85088L5.31152 10.7018"
        stroke={color || 'white'}
        strokeLinecap="round"
      />
    </svg>
  );
};

export const RouterArrowRight = () => {
  return (
    <svg
      width="6"
      height="12"
      viewBox="0 0 6 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L5.31189 5.85088L1 10.7018"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
};

export function SwapExchangeV3Old({
  onChange,
  tokenIn,
  tokenOut,
  rate,
  setRate,
  curPrice,
  fee,
  triggerFetch,
}: {
  onChange: (e?: any) => void;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  rate: string;
  setRate: (r: string) => void;
  curPrice?: string;
  fee: number;
  triggerFetch?: (e?: any) => void;
}) {
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
  const ref = useRef<HTMLInputElement>();

  const [symbolsArr] = useState(['e', 'E', '+', '-']);

  const inputRef = useRef<HTMLInputElement>(null);

  if (!tokenIn || !tokenOut) return null;

  return (
    <>
      <div className="flex items-center xs:relative xs:bottom-4">
        <div
          className="relative flex items-center justify-center  w-6 h-6 border border-primaryText border-opacity-30 rounded-full cursor-pointer bg-dark"
          onClick={() => {
            onChange();
            mobileDevice && runSwapAnimation();
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <div className="flex items-center whitespace-nowrap">
            <span
              className={`transition-transform transform ${
                hover ? 'lg:-translate-y-0.5 ' : ''
              }`}
              ref={upRow}
            >
              <SwapArrowUp
                width="5"
                light={mobileDevice ? mobileAnimation : hover}
              />
            </span>
            <span
              className={`transition-transform transform ${
                hover ? 'lg:translate-y-0.5 ' : ''
              }`}
              ref={downRow}
            >
              <SwapArrowDown
                width="5"
                light={mobileDevice ? mobileAnimation : hover}
              />
            </span>
          </div>
        </div>

        <span className="text-v3SwapGray text-xs ml-2 mr-1">
          <FormattedMessage id="rate" defaultMessage={'Rate'} />
        </span>

        <span
          className={`text-xs px-2 xs:hidden py-1 ${
            Number(rate) === Number(curPrice)
              ? 'text-v3Blue bg-v3Blue bg-opacity-10 border border-transparent'
              : 'text-primaryText border border-primaryText border-opacity-20 hover:border hover:border-transparent hover:text-v3Blue hover:bg-v3Blue hover:bg-opacity-10'
          }  rounded-2xl whitespace-nowrap cursor-pointer`}
          onClick={() => {
            setRate(curPrice);
            if (triggerFetch) triggerFetch();
          }}
        >
          <FormattedMessage id="current_rate" defaultMessage={'Current Rate'} />
        </span>
      </div>

      <div className="flex items-center text-v3SwapGray text-xs whitespace-nowrap xs:w-9/12">
        <span className="xs:relative xs:bottom-4">{`1 ${tokenIn.symbol} = `}</span>
        <div className="ml-1  items-center bg-black bg-opacity-20 rounded-xl px-4 py-3">
          <div className="flex items-center">
            <input
              onWheel={() => inputRef.current.blur()}
              min="0"
              ref={inputRef}
              step="any"
              type="number"
              placeholder={!curPrice ? '-' : '0.0'}
              value={!curPrice ? '-' : rate}
              onBlur={(e) => {
                const newR = regularizedPrice(rate, tokenIn, tokenOut, fee);

                if (ONLY_ZEROS.test(toPrecision(newR, 8, false, false))) {
                  return;
                }

                setRate(newR);
              }}
              onChange={(e) => {
                if (!curPrice) {
                  return null;
                } else setRate(e.target.value);
              }}
              disabled={!curPrice}
              style={{
                fontSize: '16px',
                color: 'white',
                maxWidth: '150px',
              }}
              onKeyDown={(e) =>
                symbolsArr.includes(e.key) && e.preventDefault()
              }
            />

            <span className="text-white text-xs">{tokenOut.symbol}</span>
          </div>

          <div
            className={`text-xs px-2 mt-1 inline float-right lg:hidden md:hidden py-1 ${
              Number(rate) === Number(curPrice)
                ? 'text-v3Blue bg-v3Blue bg-opacity-10 border border-transparent'
                : 'text-primaryText border border-primaryText border-opacity-20 hover:border hover:border-transparent hover:text-v3Blue hover:bg-v3Blue hover:bg-opacity-10'
            }  rounded-2xl whitespace-nowrap cursor-pointer`}
            onClick={() => {
              setRate(curPrice);
              if (triggerFetch) triggerFetch();
            }}
          >
            <FormattedMessage
              id="current_rate"
              defaultMessage={'Current Rate'}
            />
          </div>
        </div>
      </div>
    </>
  );
}
export function SwapExchangeV3({
  onChange,
  tokenIn,
  tokenOut,
  rate,
  setRate,
  curPrice,
  fee,
  triggerFetch,
}: {
  onChange: (e?: any) => void;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  rate: string;
  setRate: (r: string) => void;
  curPrice?: string;
  fee: number;
  triggerFetch?: (e?: any) => void;
}) {
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
  const ref = useRef<HTMLInputElement>();

  const [symbolsArr] = useState(['e', 'E', '+', '-']);

  const inputRef = useRef<HTMLInputElement>(null);

  if (!tokenIn || !tokenOut) return null;

  return (
    <>
      <div className="flex items-center">
        <div
          className="relative flex items-center justify-center  w-7 h-7 border-2 border-switchIconBorderColor rounded-lg cursor-pointer bg-switchIconBgColor"
          onClick={() => {
            onChange();
            mobileDevice && runSwapAnimation();
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <div className="flex items-center whitespace-nowrap">
            <span
              className={`transition-transform transform ${
                hover ? 'lg:-translate-y-0.5 ' : ''
              }`}
              ref={upRow}
            >
              <SwapArrowUp
                width="5"
                light={mobileDevice ? mobileAnimation : hover}
              />
            </span>
            <span
              className={`transition-transform transform ${
                hover ? 'lg:translate-y-0.5 ' : ''
              }`}
              ref={downRow}
            >
              <SwapArrowDown
                width="5"
                light={mobileDevice ? mobileAnimation : hover}
              />
            </span>
          </div>
        </div>
      </div>
    </>
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

export const ExchangeArrow = ({}: {}) => {
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

export const MyOrderMobileArrow = () => {
  return (
    <svg
      width="28"
      height="10"
      viewBox="0 0 28 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute left-1/2 transform -translate-x-1/2"
    >
      <path
        opacity="0.65"
        d="M26.38 9.99316C26.3934 9.99316 26.4052 9.99316 26.4169 9.98974L26.459 9.98632L26.4875 9.98119L26.5312 9.97435C26.538 9.97435 26.5464 9.96922 26.5548 9.96922C26.5689 9.96572 26.5829 9.96173 26.5968 9.95726L26.6203 9.95384L26.664 9.94187C26.6724 9.93674 26.6808 9.93674 26.6876 9.93332L26.7279 9.92135C26.7362 9.91673 26.7454 9.91383 26.7548 9.9128L26.7901 9.90083L26.822 9.88887L26.854 9.87689C26.8657 9.87348 26.8775 9.86493 26.8876 9.86151L26.9162 9.84954L26.9515 9.82902L26.975 9.81705L27.0153 9.79312L27.0355 9.78115L27.0742 9.75721L27.0943 9.74524C27.1064 9.73728 27.1177 9.72812 27.128 9.71789C27.1355 9.71328 27.1423 9.70751 27.1481 9.70079C27.1611 9.69411 27.1725 9.6848 27.1817 9.67343C27.1885 9.66488 27.2002 9.65634 27.2086 9.6495C27.2524 9.61271 27.2934 9.5727 27.3313 9.52981C27.3381 9.52126 27.3465 9.51271 27.3498 9.50417C27.3582 9.49733 27.3666 9.48536 27.3734 9.47681C27.3818 9.46484 27.3902 9.45287 27.4003 9.44433L27.4171 9.42381L27.444 9.38961L27.4557 9.36909L27.4793 9.32806L27.491 9.30925L27.5146 9.26822L27.5263 9.24428L27.5465 9.20838L27.5583 9.18444L27.5751 9.14853L27.5868 9.11605L27.5986 9.08356L27.6104 9.04937C27.6145 9.04025 27.6168 9.03036 27.6171 9.0203L27.6289 8.97927C27.6339 8.97243 27.6339 8.96388 27.6373 8.95533L27.649 8.91088L27.6524 8.88694C27.6567 8.87303 27.6595 8.85871 27.6608 8.84419C27.6608 8.83565 27.6658 8.8271 27.6658 8.82026C27.6692 8.80316 27.6692 8.78606 27.6726 8.7758L27.6776 8.74674L27.681 8.70399C27.681 8.69203 27.681 8.68006 27.6843 8.66809C27.6843 8.65441 27.6843 8.64244 27.6894 8.63389C27.6933 8.5861 27.6933 8.53806 27.6894 8.49027C27.6894 8.4783 27.6894 8.46634 27.6843 8.4595C27.6843 8.44753 27.6843 8.43556 27.681 8.42359L27.6776 8.37914L27.6726 8.35007L27.6658 8.30733C27.6658 8.29878 27.6608 8.29023 27.6608 8.28339C27.6574 8.26629 27.6524 8.24919 27.6524 8.23894L27.649 8.215L27.6373 8.17054C27.6339 8.162 27.6339 8.15345 27.6289 8.14661L27.6171 8.10557C27.6131 8.09698 27.6109 8.08769 27.6104 8.07822L27.5986 8.04231L27.5868 8.00983L27.5751 7.97734L27.5583 7.94314L27.5465 7.9175C27.5398 7.90553 27.5347 7.89356 27.5263 7.8833L27.5146 7.85766L27.491 7.81833L27.4793 7.79781L27.4557 7.75678L27.444 7.73797C27.4362 7.7251 27.4272 7.71307 27.4171 7.70207C27.4125 7.69439 27.4069 7.68747 27.4003 7.68155C27.3935 7.66901 27.3844 7.65797 27.3734 7.64906C27.365 7.64222 27.3566 7.62855 27.3498 7.62171L27.3263 7.59777L27.2792 7.54648L20.2901 0.42357C20.1586 0.289315 20.0023 0.182789 19.8303 0.110102C19.6582 0.037416 19.4737 0 19.2874 0C19.1011 0 18.9166 0.037416 18.7446 0.110102C18.5725 0.182789 18.4163 0.289315 18.2848 0.42357C18.1528 0.557321 18.0481 0.716264 17.9766 0.891279C17.9051 1.06629 17.8684 1.25394 17.8684 1.44345C17.8684 1.63296 17.9051 1.8206 17.9766 1.99562C18.0481 2.17063 18.1528 2.32958 18.2848 2.46333L22.8551 7.11391H1.41868C1.04242 7.11391 0.681574 7.26594 0.415521 7.53656C0.149467 7.80719 0 8.17423 0 8.55695C0 8.93967 0.149467 9.30672 0.415521 9.57734C0.681574 9.84797 1.04242 10 1.41868 10L26.2791 9.99829H26.3497C26.3615 9.99829 26.3732 9.99316 26.38 9.99316Z"
        fill="#7E8A93"
      />
    </svg>
  );
};

export const TokenRisk = (props) => {
  return (
    <svg
      {...props}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.59381 9.07598C9.55358 9.51521 9.27431 9.72046 8.99865 9.72046C8.73683 9.67114 8.53351 9.55946 8.4442 9.11525L8.08398 4.96248C8.08398 4.54505 8.59144 4.17566 9.02198 4.17566C9.4526 4.17566 9.91638 4.56195 9.91638 4.97865L9.59381 9.07598ZM9.00026 10.2637C8.56964 10.2637 8.2202 10.6128 8.2202 11.0438C8.2202 11.4749 8.56924 11.8244 9.00026 11.8244C9.4312 11.8244 9.7804 11.4749 9.7804 11.0438C9.78032 10.6133 9.43112 10.2637 9.00026 10.2637Z"
        fill="#FF8B8B"
      />
      <path
        d="M7.26795 3C8.03775 1.66666 9.96225 1.66667 10.7321 3L15.0622 10.5C15.832 11.8333 14.8697 13.5 13.3301 13.5H4.66987C3.13027 13.5 2.16802 11.8333 2.93782 10.5L7.26795 3Z"
        stroke="#FF8B8B"
      />
    </svg>
  );
};
