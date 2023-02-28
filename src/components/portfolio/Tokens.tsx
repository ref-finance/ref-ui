import React, { useEffect, useMemo, useState, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import BigNumber from 'bignumber.js';
import { useUserRegisteredTokensAllAndNearBalance } from '../../state/token';
import { TokenMetadata } from '../../services/ft-contract';
import QuestionMark from '../../components/farm/QuestionMark';
import ReactTooltip from 'react-tooltip';
import {
  toInternationalCurrencySystem,
  toPrecision,
  toReadableNumber,
} from '~utils/numbers';
import { getBoostTokenPrices } from '../../services/farm';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import ReactECharts from 'echarts-for-react';
import { ArrowJump } from './Tool';
import { useWalletSelector } from '~context/WalletSelectorContext';
import getConfig from '~services/config';
export default function Tokens() {
  const [tokens, setTokens] = useState([]);
  const [totalPrice, setTotalPrice] = useState('0');
  const allTokens = useUserRegisteredTokensAllAndNearBalance();
  const total = useUserRegisteredTokensAllAndNearBalance();
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>();
  const [pieOption, setPieOption] = useState(null);
  const intl = useIntl();
  const config = getConfig();
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
      hasBlanceTokens.sort((b: TokenMetadata, a: TokenMetadata) => {
        const b_num = toReadableNumber(b.decimals, b.nearNonVisible.toString());
        const b_price =
          tokenPriceList[b.id == 'NEAR' ? WRAP_NEAR_CONTRACT_ID : b.id]
            ?.price || '0';
        const b_total_price = new BigNumber(b_num).multipliedBy(b_price);
        const a_num = toReadableNumber(a.decimals, a.nearNonVisible.toString());
        const a_price =
          tokenPriceList[a.id == 'NEAR' ? WRAP_NEAR_CONTRACT_ID : a.id]
            ?.price || '0';
        const a_total_price = new BigNumber(a_num).multipliedBy(a_price);
        return +a_total_price.minus(b_total_price).toFixed();
      });
      setTokens(hasBlanceTokens);
      setTotalPrice(totalPrice);
    }
  }, [tokenPriceList, allTokens]);
  useEffect(() => {
    if (tokens.length > 0) {
      const pieData = getPieData();
      const pieOption = {
        tooltip: {
          trigger: 'item',
          show: false,
        },
        legend: {
          top: '5%',
          left: 'center',
          show: false,
        },
        color: [
          '#00D6AF',
          '#455563',
          '#354F53',
          '#284251',
          '#1F4247',
          '#173C41',
        ],
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['60%', '70%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 10,
              borderWidth: 2,
              borderColor: 'rgba(0, 0, 0, 0.1)',
            },
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              scaleSize: 5,
              label: {
                show: true,
                formatter: (data: any) => {
                  const { symbol, decimals, nearNonVisible, price } = data.data;
                  const num = toReadableNumber(
                    decimals,
                    nearNonVisible.toString()
                  );
                  let display_num;
                  if (new BigNumber(num).isLessThan('0.01')) {
                    display_num = '<0.01';
                  } else {
                    display_num = toInternationalCurrencySystem(num, 2);
                  }
                  return `{a|${symbol}}\n{b|${display_num}}\n{a|${price}}`;
                },
                rich: {
                  a: {
                    fontSize: 12,
                    color: '#7E8A93',
                    lineHeight: 20,
                  },
                  b: {
                    fontSize: 13,
                    color: '#FFFFFF',
                    lineHeight: 20,
                  },
                },
              },
            },
            labelLine: {
              show: false,
            },
            data: pieData,
          },
        ],
      };
      setPieOption(pieOption);
    }
  }, [tokens]);
  const { selector } = useWalletSelector();
  function getPieData() {
    const parseSerialization: TokenMetadata[] = JSON.parse(
      JSON.stringify(tokens)
    );
    const target = parseSerialization.map((token: TokenMetadata) => {
      if (+totalPrice > 0) {
        const { decimals, nearNonVisible, id } = token;
        const n = toReadableNumber(decimals, nearNonVisible.toString());
        const price =
          tokenPriceList[id == 'NEAR' ? WRAP_NEAR_CONTRACT_ID : id]?.price || 0;
        const p = new BigNumber(price).multipliedBy(n);
        const r = new BigNumber(p).dividedBy(totalPrice).multipliedBy(100);
        let p_display;
        if (p.isLessThan('0.01')) {
          p_display = '<$0.01';
        } else {
          p_display = toInternationalCurrencySystem(p.toFixed(), 2);
        }
        if (r.isLessThan('0.5')) {
          return {
            ...token,
            price: p_display,
            value: 0.5,
          };
        } else {
          return {
            ...token,
            price: p_display,
            value: +r,
          };
        }
      }
    });
    return target;
  }

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
    <div className="text-white w-60 py-3">
      <div className="flex items-center px-3">
        <div className="flex items-center">
          <span className="text-sm text-primaryText mr-1">Wallet Tokens</span>
          <ArrowJump
            clickEvent={() => {
              window.open(
                selector.store.getState().selectedWalletId === 'my-near-wallet'
                  ? config.myNearWalletUrl
                  : config.walletUrl,
                '_blank'
              );
            }}
          ></ArrowJump>
        </div>
        {/* <div
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
        </div> */}
      </div>
      <div className="flex items-center justify-center">
        {pieOption ? (
          <ReactECharts
            option={pieOption}
            style={{ width: '200px', height: '200px' }}
          />
        ) : null}
      </div>
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
