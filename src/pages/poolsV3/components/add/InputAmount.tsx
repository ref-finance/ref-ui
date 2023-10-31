import React, { useEffect, useState, useContext, useMemo, useRef } from 'react';
import { TokenMetadata } from '../../../../services/ft-contract';
import { FormattedMessage } from 'react-intl';
import BigNumber from 'bignumber.js';
import { PoolInfo } from '../../../../services/swapV3';
import { formatWithCommas, toPrecision } from 'src/utils/numbers';
import { WalletContext } from '../../../../utils/wallets-integration';
import { WRAP_NEAR_CONTRACT_ID } from '../../../../services/wrap-near';
import { toRealSymbol } from '../../../../utils/token';
import { WarningIcon } from 'src/components/icon/V3';

export function InputAmount({
  token,
  balance,
  tokenPriceList,
  changeAmount,
  amount,
  currentSelectedPool,
  disabled,
}: {
  token: TokenMetadata;
  balance: string;
  tokenPriceList: Record<string, any>;
  changeAmount: any;
  amount: string;
  currentSelectedPool: PoolInfo;
  disabled?: Boolean;
}) {
  const [inputPrice, setInputPrice] = useState('');
  const [showNearTip, setShowNearTip] = useState(false);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    const price = token ? tokenPriceList[token.id]?.price : '';
    if (price && amount) {
      setInputPrice(new BigNumber(price).multipliedBy(amount).toFixed());
    } else {
      setInputPrice('');
    }
    if (token?.id == WRAP_NEAR_CONTRACT_ID && amount) {
      const difference = new BigNumber(maxBalance).minus(amount);
      const b = difference.toFixed();
      const r = difference.isLessThan(0);
      if (r) {
        setShowNearTip(true);
      } else {
        setShowNearTip(false);
      }
    } else {
      setShowNearTip(false);
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
    if (isNoPool) {
      return '$-';
    } else if (inputPrice) {
      return '$' + formatWithCommas(toPrecision(inputPrice.toString(), 3));
    }
    return '$-';
  }
  const maxBalance =
    token?.id !== WRAP_NEAR_CONTRACT_ID
      ? balance
      : Number(balance) <= 0.5
      ? '0'
      : String(Number(balance) - 0.5);
  const isNoPool = !currentSelectedPool?.pool_id;
  return (
    <div>
      <div
        className={`rounded-xl p-3 mt-3 border ${
          disabled
            ? 'border-inputV3BorderHoverColor'
            : 'bg-black bg-opacity-20 border-inputV3BorderColor hover:border-inputV3BorderHoverColor'
        }`}
      >
        <div className="flex items-center justify-between">
          <input
            type="number"
            placeholder="0.0"
            className="font-gothamBold text-base"
            disabled={!currentSelectedPool?.pool_id || disabled ? true : false}
            value={isNoPool ? '' : amount}
            step="any"
            onChange={({ target }) => {
              changeAmount(target.value);
            }}
          />
          <span
            className={`text-base gotham_bold ml-5 whitespace-nowrap ${
              currentSelectedPool?.pool_id
                ? 'text-white'
                : 'text-v3feeTextColor'
            }`}
          >
            {token ? toRealSymbol(token.symbol) : 'Selet Token'}
          </span>
        </div>
        <div
          className={`flex items-center justify-between mt-2.5 ${
            token ? 'visible' : 'invisible'
          }`}
        >
          <span className="text-xs text-primaryText">{showCurrentPrice()}</span>
          <div className="flex items-center text-xs text-primaryText text-right">
            <span title={balance}>
              <FormattedMessage id="balance" />:{' '}
              <span
                className={`${
                  disabled ? '' : 'cursor-pointer hover:text-white underline'
                }`}
                onClick={() => {
                  if (disabled) return;
                  changeAmount(maxBalance);
                }}
              >
                {getBalance()}
              </span>
            </span>
          </div>
        </div>
      </div>
      {showNearTip && !isNoPool ? (
        <div className="flex items-center text-sm text-warnColor mt-2.5">
          <WarningIcon className="ml-2.5 mr-2"></WarningIcon>
          <FormattedMessage
            id="near_validation_error"
            defaultMessage="Must have 0.5N or more left in wallet for gas fee."
          />
        </div>
      ) : null}
    </div>
  );
}
