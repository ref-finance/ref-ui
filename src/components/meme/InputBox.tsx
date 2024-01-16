import React, { useState, useEffect, useContext } from 'react';
import { BlackDragonIcon, LonkIcon, NekoIcon, Shitzu } from './icons';
import {
  OprationButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import { FormattedMessage, useIntl } from 'react-intl';

export function InputAmount({
  // token,
  balance,
  tokenPriceList,
  changeAmount,
  disabled,
  amount,
}: {
  // token: TokenMetadata;
  balance: string;
  tokenPriceList: Record<string, any>;
  changeAmount: any;
  amount: string;
  disabled?: Boolean;
}) {
  const [inputPrice, setInputPrice] = useState('');
  // useEffect(() => {
  //   const price = token ? tokenPriceList[token.id]?.price : '';
  //   if (price && amount) {
  //     setInputPrice(new BigNumber(price).multipliedBy(amount).toFixed());
  //   } else {
  //     setInputPrice('');
  //   }
  //   if (token?.id == WRAP_NEAR_CONTRACT_ID && amount) {
  //     const difference = new BigNumber(maxBalance).minus(amount);
  //     const b = difference.toFixed();
  //     const r = difference.isLessThan(0);
  //     if (r) {
  //       setShowNearTip(true);
  //     } else {
  //       setShowNearTip(false);
  //     }
  //   } else {
  //     setShowNearTip(false);
  //   }
  // }, [amount, token, tokenPriceList.length]);
  function getBalance() {
    // let r = '0';
    // if (token && balance) {
    //   r = formatWithCommas(toPrecision(balance.toString(), 3));
    // }
    // return isSignedIn ? r : '-';
  }
  function showCurrentPrice() {
    // if (isNoPool) {
    //   return '$-';
    // } else if (inputPrice) {
    //   return '$' + formatWithCommas(toPrecision(inputPrice.toString(), 3));
    // }
    // return '$-';
  }
  const maxBalance = balance;
  return (
    <div>
      <div
        className={`rounded-xl p-3 mt-7 border ${
          disabled
            ? 'border-inputV3BorderHoverColor'
            : 'bg-black bg-opacity-20 border-inputV3BorderColor hover:border-inputV3BorderHoverColor'
        }`}
      >
        <div className="flex items-center justify-between">
          <input
            type="number"
            placeholder="0.0"
            className="font-gothamBold text-xl text-white"
            disabled={false}
            value={amount}
            step="any"
            onChange={({ target }) => {
              changeAmount(target.value);
            }}
          />
          <span
            className={`text-base gotham_bold ml-5 whitespace-nowrap text-white`}
          >
            LONK
          </span>
        </div>
        <div className={`flex items-center justify-between mt-2.5 visible`}>
          <span className="text-xs text-limitOrderInputColor">$82.25</span>
          <div className="flex items-center text-xs text-limitOrderInputColor text-right">
            <span title={balance}>
              <FormattedMessage id="balance" />:{' '}
              <span
                className={`gotham_bold ${
                  disabled ? '' : 'cursor-pointer hover:text-white underline '
                }`}
                onClick={() => {
                  if (disabled) return;
                  changeAmount(maxBalance);
                }}
              >
                {23423}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
