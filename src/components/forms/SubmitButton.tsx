import React, { useContext, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { ButtonTextWrapper } from '../../components/button/Button';

import { useWalletSelector } from '../../context/WalletSelectorContext';
import { ConnectToNearBtnSwap } from '../button/Button';

import {
  GoToOrderbookTip,
  OrderBookArrowRight,
} from '../../pages/Orderly/components/Common/Icons';
import { isMobile } from '../../utils/device';
import { GoToOrderbookTipMobile } from '../../pages/Orderly/components/Common/Icons';

interface SubmitButtonProps {
  text?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  info?: string | JSX.Element;
  label?: string;
  className?: string;
  loading?: boolean;
  signedInConfig?: boolean;
}

function SubmitButton({
  disabled,
  onClick,
  label,
  className,
  loading,
  signedInConfig,
}: SubmitButtonProps) {
  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();
  const isSignedIn = !!accountId;

  return (
    <>
      {isSignedIn || signedInConfig ? (
        <button
          type={onClick ? 'button' : 'submit'}
          disabled={disabled || loading}
          onClick={onClick}
          className={`flex flex-row w-full items-center justify-center px-5 py-2  text-white mx-auto ${
            disabled ? 'disabled:cursor-not-allowed opacity-40' : ''
          } ${loading ? 'opacity-40' : ''} ${
            label === 'insufficient_balance' ? 'font-bold' : ''
          } ${className} bg-buttonGradientBgOpacity  ${
            loading || disabled ? '' : 'hover:bg-buttonGradientBg'
          } `}
          style={{
            background: label === 'insufficient_balance' ? '#304352' : '',
            borderRadius: '5px',
            color: label === 'insufficient_balance' ? '#7E8A93' : '',
          }}
        >
          {!label && (
            <h1 className="text-base font-inter gotham_bold">
              <ButtonTextWrapper
                loading={label !== 'insufficient_balance' && loading}
                Text={() => (
                  <FormattedMessage id="swap" defaultMessage="Swap" />
                )}
              />
            </h1>
          )}
          {label && (
            <h1
              className={`text-base font-inter ${
                label !== 'insufficient_balance' ? 'font-bold' : 'font-semibold'
              } `}
            >
              <ButtonTextWrapper
                loading={label !== 'insufficient_balance' && loading}
                Text={() => (
                  <FormattedMessage id={label} defaultMessage={label} />
                )}
              />
            </h1>
          )}
        </button>
      ) : (
        <div className={`mt-4 w-full ${className}`}>
          <ConnectToNearBtnSwap />
        </div>
      )}
    </>
  );
}

export function GoOrderBookButton({
  label,
  className,
  signedInConfig,
}: SubmitButtonProps) {
  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();
  const isSignedIn = !!accountId;

  const storedShowTip = localStorage.getItem('orderbook_tip');

  const [showTip, setShowTip] = useState<boolean>(true);

  return (
    <>
      {isSignedIn ? (
        <>
          <div
            className="text-center text-white mb-4"
            style={{
              fontSize: '15px',
              lineHeight: '150%',
            }}
          >
            <FormattedMessage
              id="go_to_orderbook_tip"
              values={{
                br: <br />,
                // @ts-ignore
                strong: (...chunks) => (
                  <span className="font-gothamBold">{chunks}</span>
                ),
              }}
              defaultMessage={
                'This price is for reference only. {br} Please proceed to <strong>Orderbook</strong> to place the order.'
              }
            />
          </div>

          {showTip && !storedShowTip && !isMobile() && (
            <GoToOrderbookTip
              onClick={(e: any) => {
                setShowTip(false);
                localStorage.setItem('orderbook_tip', '1');
              }}
            ></GoToOrderbookTip>
          )}

          {showTip && !storedShowTip && isMobile() && (
            <GoToOrderbookTipMobile
              onClick={(e: any) => {
                setShowTip(false);
                localStorage.setItem('orderbook_tip', '1');
              }}
            ></GoToOrderbookTipMobile>
          )}

          <button
            type={'submit'}
            className={`flex relative flex-row w-full items-center text-white justify-center px-5 py-2   mx-auto   ${className} bg-buttonGradientBgOpacity  hover:bg-buttonGradientBg `}
            style={{
              borderRadius: '5px',
            }}
          >
            <h1 className="text-base font-inter frcc gotham_bold text-white">
              <span className="mr-1">
                <FormattedMessage
                  id="go_to_orderbook"
                  defaultMessage={'Go to Orderbook'}
                ></FormattedMessage>
              </span>
              <span>
                <OrderBookArrowRight />
              </span>
            </h1>
          </button>
        </>
      ) : (
        <div className={`mt-4 w-full ${className}`}>
          <ConnectToNearBtnSwap />
        </div>
      )}
    </>
  );
}

export function InsufficientButton(props: any) {
  const { divClassName, spanClassName } = props;
  return (
    <div
      className={`flex items-center justify-center bg-menuMoreBoxBorderColor rounded-lg cursor-not-allowed px-2 whitespace-nowrap ${divClassName}`}
    >
      <span
        className={`gotham_bold text-primaryText text-base ${spanClassName}`}
      >
        <FormattedMessage id="insufficient_balance"></FormattedMessage>
      </span>
    </div>
  );
}

export default SubmitButton;
