import React, { useState, useEffect, useContext } from 'react';
import Big from 'big.js';
import { TokenMetadata } from '~src/services/ft-contract';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatWithCommas, toPrecision } from '../../utils/numbers';
import { WalletContext } from '../../utils/wallets-integration';
export function InputAmount({
  token,
  balance,
  tokenPriceList,
  changeAmount,
  amount,
  title,
}: {
  token: TokenMetadata;
  balance: string;
  tokenPriceList: Record<string, any>;
  changeAmount: any;
  amount: string;
  title?: string;
}) {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [inputPrice, setInputPrice] = useState('');
  useEffect(() => {
    const price = token ? tokenPriceList[token.id]?.price : '';
    if (price && amount) {
      setInputPrice(new Big(price).mul(amount).toFixed());
    } else {
      setInputPrice('');
    }
  }, [amount, token, tokenPriceList.length]);
  function getBalance() {
    let r = '0';
    if (token && balance) {
      r = formatWithCommas(toPrecision(balance.toString(), 3));
    }
    return isSignedIn ? r : '-';
  }
  function showCurrentPrice() {
    if (inputPrice) {
      return '$' + formatWithCommas(toPrecision(inputPrice.toString(), 3));
    }
    return '$-';
  }
  return (
    <div>
      <div
        className={`rounded-xl p-3 mt-7 border bg-black bg-opacity-20 border-inputV3BorderColor hover:border-inputV3BorderHoverColor`}
      >
        <div className="flex items-center justify-between">
          <input
            type="number"
            placeholder="0.0"
            className="font-gothamBold text-xl text-white"
            value={amount}
            step="any"
            onChange={({ target }) => {
              changeAmount(target.value);
            }}
          />
          <span
            className={`text-base gotham_bold ml-5 whitespace-nowrap text-white`}
          >
            {token.symbol}
          </span>
        </div>
        <div className={`flex items-center justify-between mt-2.5 visible`}>
          <span className="text-xs text-limitOrderInputColor">
            {showCurrentPrice()}
          </span>
          <div className="flex items-center text-xs text-limitOrderInputColor text-right">
            <span title={balance}>
              {title || <FormattedMessage id="balance" />}:{' '}
              <span
                className={`gotham_bold cursor-pointer hover:text-white underline`}
                onClick={() => {
                  changeAmount(balance);
                }}
              >
                {getBalance()}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
