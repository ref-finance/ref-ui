import React from 'react';
import { useClientMobile } from '../../../../utils/device';
import { useIntl } from 'react-intl';

function BuyRec() {
  return (
    <svg
      width="144"
      height="40"
      viewBox="0 0 144 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 7.99999C0 3.58172 3.58172 0 8 0H139.462C142.359 0 144.295 2.98332 143.115 5.62894L128.847 37.6289C128.204 39.0711 126.773 40 125.194 40H8C3.58173 40 0 36.4183 0 32V7.99999Z"
        fill="url(#paint0_linear_96_3428)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_96_3428"
          x1="72.8125"
          y1="0"
          x2="72.8125"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00C6A2" />
          <stop offset="1" stopColor="#008B72" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BuyRecMobile() {
  return (
    <svg
      width="144"
      height="40"
      viewBox="0 0 144 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 7.99999C0 3.58172 3.58172 0 8 0H139.462C142.359 0 144.295 2.98332 143.115 5.62894L128.847 37.6289C128.204 39.0711 126.773 40 125.194 40H8C3.58173 40 0 36.4183 0 32V7.99999Z"
        fill="url(#paint0_linear_96_34281111)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_96_34281111"
          x1="72.8125"
          y1="0"
          x2="72.8125"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00C6A2" />
          <stop offset="1" stopColor="#008B72" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SellRec() {
  return (
    <svg
      width="144"
      height="40"
      viewBox="0 0 144 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M144 32C144 36.4183 140.418 40 136 40H4.53821C1.64149 40 -0.294724 37.0167 0.884918 34.3711L15.1532 2.37108C15.7962 0.928928 17.2275 2.28882e-05 18.8065 2.28882e-05H136C140.418 2.28882e-05 144 3.58175 144 8.00002V32Z"
        fill="url(#paint0_linear_96_3774)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_96_3774"
          x1="71.1875"
          y1="40"
          x2="71.1875"
          y2="2.28882e-05"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#944A8C" />
          <stop offset="1" stopColor="#D26060" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SellRecMobile() {
  return (
    <svg
      width="144"
      height="40"
      viewBox="0 0 144 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M144 32C144 36.4183 140.418 40 136 40H4.53821C1.64149 40 -0.294724 37.0167 0.884918 34.3711L15.1532 2.37108C15.7962 0.928928 17.2275 2.28882e-05 18.8065 2.28882e-05H136C140.418 2.28882e-05 144 3.58175 144 8.00002V32Z"
        fill="url(#paint0_linear_96_37741111)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_96_37741111"
          x1="71.1875"
          y1="40"
          x2="71.1875"
          y2="2.28882e-05"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#944A8C" />
          <stop offset="1" stopColor="#D26060" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BuyButton(props: { select: boolean; onClick: () => void }) {
  const { select } = props;

  const clientWidth = document.documentElement.clientWidth;

  const isMobile = useClientMobile();
  const intl = useIntl();
  const buttonStyle = {
    transform: isMobile
      ? `scale( ${isMobile ? '0.75' : (clientWidth / 2 - 20) / 144} ,${
          isMobile ? 0.8 : 1
        })`
      : '',
  };
  return (
    <div
      className={`relative  w-1/2  flex items-center justify-center ${
        select ? '' : 'opacity-60 hover:opacity-80'
      }`}
      {...props}
      id="buy-button"
    >
      <div
        className="absolute cursor-pointer transform  z-10"
        style={buttonStyle}
      >
        {isMobile ? <BuyRecMobile /> : <BuyRec />}
      </div>
      <span
        className={`text-white cursor-pointer text-base z-20 relative font-bold`}
      >
        {intl.formatMessage({ id: 'buy', defaultMessage: 'Buy' })}
      </span>
    </div>
  );
}

function SellButton(props: { select: boolean; onClick: () => void }) {
  const { select } = props;
  const clientWidth = document.documentElement.clientWidth;
  const isMobile = useClientMobile();
  const intl = useIntl();
  const buttonStyle = {
    transform: isMobile
      ? `scale( ${isMobile ? '0.75' : (clientWidth / 2 - 20) / 144} ,${
          isMobile ? 0.8 : 1
        })`
      : '',
  };

  return (
    <div
      className={`relative  w-1/2  flex items-center justify-center ${
        select ? '' : 'opacity-60 hover:opacity-80'
      }`}
      {...props}
    >
      <div
        className="absolute z-10 cursor-pointer transform  "
        style={buttonStyle}
      >
        {isMobile ? <SellRecMobile /> : <SellRec />}
      </div>
      <span
        className={`text-white cursor-pointer  z-20 text-base relative  font-bold`}
      >
        {intl.formatMessage({ id: 'sell', defaultMessage: 'Sell' })}
      </span>
    </div>
  );
}

export { BuyButton, SellButton };
