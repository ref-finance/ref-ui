import React, { useEffect, useMemo, useState, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import BigNumber from 'bignumber.js';
import { useUserRegisteredTokensAllAndNearBalance } from '../../state/token';
import { TokenMetadata } from '../../services/ft-contract';
import QuestionMark from '../../components/farm/QuestionMark';
import ReactTooltip from 'react-tooltip';
import { toPrecision, toReadableNumber } from '~utils/numbers';
import { getBoostTokenPrices } from '../../services/farm';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
export default function Tokens() {
  const [tokens, setTokens] = useState([]);
  const [totalPrice, setTotalPrice] = useState('0');
  const allTokens = useUserRegisteredTokensAllAndNearBalance();
  const total = useUserRegisteredTokensAllAndNearBalance();
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>();
  const intl = useIntl();
  useEffect(() => {
    getBoostTokenPrices().then(setTokenPriceList);
  }, []);
  useEffect(() => {
    if (allTokens && tokenPriceList) {
      const hasBlanceTokens = allTokens.filter((token: TokenMetadata) => {
        if (+token.near > 0) return true;
      });
      const totalPrice = hasBlanceTokens.reduce((acc, cur: TokenMetadata) => {
        const { decimals, nearNonVisible, id } = cur;
        const n = toReadableNumber(decimals, nearNonVisible.toString());
        const price =
          tokenPriceList[id == 'NEAR' ? WRAP_NEAR_CONTRACT_ID : id]?.price ||
          '0';
        return new BigNumber(n).multipliedBy(price).plus(acc).toFixed();
      }, '0');
      setTokens(hasBlanceTokens);
      setTotalPrice(totalPrice);
    }
  }, [tokenPriceList, allTokens]);
  function getTokenAllocationTip() {
    // const tip = intl.formatMessage({ id: 'over_tip' });
    const tip = 'Tokens in your wallet';
    let result: string = `<div class="text-navHighLightText text-xs text-left">${tip}</div>`;
    return result;
  }
  function getCurrentTokenProportion(token: TokenMetadata) {
    if (+totalPrice > 0) {
      const { decimals, nearNonVisible, id } = token;
      const n = toReadableNumber(decimals, nearNonVisible.toString());
      const price =
        tokenPriceList[id == 'NEAR' ? WRAP_NEAR_CONTRACT_ID : id]?.price || 0;
      const p = new BigNumber(price).multipliedBy(n);
      const r = new BigNumber(p).dividedBy(totalPrice).multipliedBy(100);
      if (r.isLessThan('0.01')) {
        return '<0.01%';
      } else {
        return toPrecision(r.toFixed(), 2) + '%';
      }
    }
    return '-%';
  }
  return (
    <div className="text-white w-64 py-3">
      <div className="flex items-center px-3">
        <span className="text-sm text-primaryText">Token Allocation</span>
        <div
          className="text-white text-right ml-1"
          data-class="reactTip"
          data-for="selectAllId"
          data-place="top"
          data-html={true}
          data-tip={getTokenAllocationTip()}
        >
          <QuestionMark></QuestionMark>
          <ReactTooltip
            id="selectAllId"
            backgroundColor="#1D2932"
            border
            borderColor="#7e8a93"
            effect="solid"
          />
        </div>
      </div>
      <div className="h-5"></div>
      <div className="overflow-auto" style={{ maxHeight: '150px' }}>
        {tokens.map((token: TokenMetadata) => {
          return (
            <div className="flex items-center justify-between mb-3 px-3">
              <span className="text-xs text-primaryText">{token.symbol}</span>
              <span>{getCurrentTokenProportion(token)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
