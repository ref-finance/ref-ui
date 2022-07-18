import React from 'react';
import { Wallet } from '@near-wallet-selector/core';
import { BeatLoader } from 'react-spinners';
import { FormattedMessage } from 'react-intl';
import { GradientWrapper } from './BorderWrapper';

interface WalletConnectingProps {
  wallet: Wallet | undefined;
  onBack: () => void;
}

const REF_ICON = () => {
  return (
    <svg
      width="29"
      height="29"
      viewBox="0 0 29 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.4551 29H29.0005L18.4551 18.4545V29Z" fill="white" />
      <path
        d="M29 -2.38419e-06L22.8485 -2.92197e-06L29 6.15151L29 -2.38419e-06Z"
        fill="#00C6A2"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M18.8925 18.4545C18.7451 18.4545 18.5986 18.4507 18.4531 18.4432V11.8427L25.6314 5.17717C26.6434 6.55848 27.241 8.26248 27.241 10.1061C27.241 14.7168 23.5033 18.4545 18.8925 18.4545ZM23.7567 3.32025L18.4531 8.24504V1.76894C18.5986 1.7614 18.7451 1.75758 18.8925 1.75758C20.7074 1.75758 22.3871 2.33671 23.7567 3.32025Z"
        fill="white"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M17.5771 1.75758H9.66797V9.55996L13.2171 13.1091L17.5771 9.06056V1.75758ZM17.5771 12.6583L13.1493 16.7697L9.66797 13.2883V29H17.5771V12.6583Z"
        fill="white"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.78788 1.75758H0V13.0753L6.59101 6.4843L8.78788 8.68117V1.75758ZM8.78788 12.4096L6.59101 10.2127L0 16.8037V29H8.78788V12.4096Z"
        fill="white"
      />
    </svg>
  );
};

export const WalletConnecting: React.FC<WalletConnectingProps> = ({
  wallet,
  onBack,
}) => {
  return (
    <div className="connecting-wrapper">
      <GradientWrapper className="rounded-full p-2  inline-flex left-1/2 relative  transform -translate-x-1/2">
        <div
          className=" rounded-full flex items-center justify-center"
          style={{
            backgroundColor: '#1D2932',
          }}
        >
          <GradientWrapper className="rounded-full" reverse>
            <div
              className="rounded-full  w-14 h-14 flex items-center justify-center"
              style={{
                backgroundColor: '#212734',
              }}
            >
              <REF_ICON />
            </div>
          </GradientWrapper>

          <span className="mx-4">
            <BeatLoader margin={6} size={5} color="#00C6A2" />
          </span>
          <GradientWrapper className="rounded-full" reverse>
            <div
              className="rounded-full w-14 h-14 items-center justify-center flex "
              style={{
                backgroundColor: '#212734',
              }}
            >
              <img
                className="rounded-full"
                src={wallet?.metadata.iconUrl}
                alt=""
              />
            </div>
          </GradientWrapper>
        </div>
      </GradientWrapper>

      <div className="text-center py-5 text-xl font-bold">
        <FormattedMessage id="connecting" defaultMessage={'Connecting'} />
      </div>

      <span className="text-center font-normal flex items-center justify-center">
        <span className="text-xs">
          <FormattedMessage
            id="having_trouble"
            defaultMessage="Having trouble?"
          />
        </span>{' '}
        <button
          className="text-xs font-bold ml-1"
          onClick={() => {
            onBack();
          }}
        >
          <FormattedMessage id="go_back" defaultMessage="Go back" />
        </button>
      </span>
    </div>
  );
};
