import React, { useEffect, useMemo, useState, useContext } from 'react';
import BigNumber from 'bignumber.js';
import { useUserRegisteredTokensAllAndNearBalance } from '../../state/token';
import { TokenMetadata } from '../../services/ft-contract';
import {
  toInternationalCurrencySystem,
  toReadableNumber,
} from '~utils/numbers';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import ReactECharts from 'echarts-for-react';
import { useWalletSelector } from '~context/WalletSelectorContext';
import {
  auroraAddr,
  useAuroraBalancesNearMapping,
  useDCLAccountBalance,
} from '~services/aurora/aurora';
import { getCurrentWallet } from '~utils/wallets-integration';
import { useTokenBalances } from '~state/token';
import { NEARXIDS } from '~services/near';
import { PortfolioData } from '../../pages/Portfolio';
import {
  ArrowJumpLarge,
  display_percentage,
  display_value,
  display_number_international,
} from './Tool';
import { BlueCircleLoading } from '../../components/layout/Loading';
export default function Tokens() {
  const { tokenPriceList } = useContext(PortfolioData);
  const [pieOption, setPieOption] = useState(null);
  const [activeTab, setActiveTab] = useState('near'); // near,ref,dcl,aurora
  const [tabList, setTabList] = useState([
    { name: 'NEAR', tag: 'near' },
    { name: 'REF V1', tag: 'ref' },
    { name: 'REF V2', tag: 'dcl' },
  ]);

  const [ref_tokens, set_ref_tokens] = useState<TokenMetadata[]>([]);
  const [near_tokens, set_near_tokens] = useState<TokenMetadata[]>([]);
  const [dcl_tokens, set_dcl_tokens] = useState<TokenMetadata[]>([]);
  const [aurora_tokens, set_aurora_tokens] = useState<TokenMetadata[]>([]);

  const [ref_total_value, set_ref_total_value] = useState<string>('0');
  const [near_total_value, set_near_total_value] = useState<string>('0');
  const [dcl_total_value, set_dcl_total_value] = useState<string>('0');
  const [aurora_total_value, set_aurora_total_value] = useState<string>('0');

  const { accountId } = useWalletSelector();
  const auroraAddress = auroraAddr(
    getCurrentWallet()?.wallet?.getAccountId() || ''
  );

  const userTokens = useUserRegisteredTokensAllAndNearBalance();
  const balances = useTokenBalances(); // inner account balance
  const auroaBalances = useAuroraBalancesNearMapping(auroraAddress);
  const DCLAccountBalance = useDCLAccountBalance(!!accountId);
  const is_tokens_loading =
    !userTokens || !balances || !auroaBalances || !DCLAccountBalance;
  useEffect(() => {
    if (!is_tokens_loading) {
      userTokens.forEach((token: TokenMetadata) => {
        const { decimals, id, nearNonVisible } = token;
        token.ref =
          id === NEARXIDS[0]
            ? '0'
            : toReadableNumber(decimals, balances[id] || '0');
        token.near = toReadableNumber(
          decimals,
          (nearNonVisible || '0').toString()
        );
        token.dcl = toReadableNumber(decimals, DCLAccountBalance[id] || '0');
        token.aurora = toReadableNumber(
          decimals,
          auroaBalances[id] || '0'
        ).toString();
      });
    }
  }, [is_tokens_loading]);

  useEffect(() => {
    if (!is_tokens_loading) {
      const ref_tokens_temp: TokenMetadata[] = [];
      const near_tokens_temp: TokenMetadata[] = [];
      const dcl_tokens_temp: TokenMetadata[] = [];
      const aurora_tokens_temp: TokenMetadata[] = [];
      userTokens.forEach((token: TokenMetadata) => {
        const { ref, near, aurora, dcl } = token;
        if (+ref > 0) {
          ref_tokens_temp.push(token);
        }
        if (+near > 0) {
          near_tokens_temp.push(token);
        }
        if (+dcl > 0) {
          dcl_tokens_temp.push(token);
        }
        if (+aurora > 0) {
          aurora_tokens_temp.push(token);
        }
      });
      const { tokens: tokens_ref, total_value: total_value_ref } =
        token_data_process(ref_tokens_temp);
      const { tokens: tokens_near, total_value: total_value_near } =
        token_data_process(near_tokens_temp);
      const { tokens: tokens_dcl, total_value: total_value_dcl } =
        token_data_process(dcl_tokens_temp);
      const { tokens: tokens_aurora, total_value: total_value_aurora } =
        token_data_process(aurora_tokens_temp);
      set_ref_tokens(tokens_ref);
      set_near_tokens(tokens_near);
      set_dcl_tokens(tokens_dcl);
      set_aurora_tokens(tokens_aurora);

      set_ref_total_value(total_value_ref);
      set_near_total_value(total_value_near);
      set_dcl_total_value(total_value_dcl);
      set_aurora_total_value(total_value_aurora);
    }
  }, [tokenPriceList, userTokens]);
  useEffect(() => {
    let tokens;
    let total_value;
    if (activeTab == 'ref' && ref_tokens.length > 0) {
      tokens = ref_tokens;
      total_value = ref_total_value;
    }
    if (activeTab == 'near' && near_tokens.length > 0) {
      tokens = near_tokens;
      total_value = near_total_value;
    }
    if (activeTab == 'dcl' && dcl_tokens.length > 0) {
      tokens = dcl_tokens;
      total_value = dcl_total_value;
    }
    if (activeTab == 'aurora' && aurora_tokens.length > 0) {
      tokens = aurora_tokens;
      total_value = aurora_total_value;
    }
    if (tokens?.length > 0) {
      const pieData = getPieData(tokens, total_value);
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
                  const { symbol, decimals, nearNonVisible, value } = data.data;
                  const num = toReadableNumber(
                    decimals,
                    nearNonVisible.toString()
                  );
                  const display_num = display_number_international(num);
                  const display_v = display_value(value);
                  return `{a|${symbol}}\n{b|${display_num}}\n{a|${display_v}}`;
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
  }, [activeTab, ref_tokens, near_tokens, dcl_tokens, aurora_tokens]);
  if (!userTokens || !balances || !auroaBalances || !DCLAccountBalance)
    return (
      <div className="flex items-center justify-center mt-20">
        <BlueCircleLoading></BlueCircleLoading>
      </div>
    );
  function token_data_process(target_tokens: TokenMetadata[]) {
    const tokens = JSON.parse(JSON.stringify(target_tokens || []));
    tokens.forEach((token: TokenMetadata) => {
      const token_num = toReadableNumber(
        token.decimals,
        token.nearNonVisible.toString()
      );
      const token_price =
        tokenPriceList[token.id == 'NEAR' ? WRAP_NEAR_CONTRACT_ID : token.id]
          ?.price || '0';
      const token_value = new BigNumber(token_num).multipliedBy(token_price);
      token.value = token_value.toFixed();
    });
    tokens.sort((tokenB: TokenMetadata, tokenA: TokenMetadata) => {
      const a_value = new BigNumber(tokenA.value);
      const b_value = new BigNumber(tokenB.value);
      return a_value.minus(b_value).toNumber();
    });
    const total_value = tokens.reduce((acc: string, cur: TokenMetadata) => {
      return new BigNumber(acc).plus(cur.value).toFixed();
    }, '0');

    return { tokens, total_value };
  }
  function getPieData(tokens: TokenMetadata[], total_value: string) {
    const parseSerialization: TokenMetadata[] = JSON.parse(
      JSON.stringify(tokens)
    );
    const target = parseSerialization.map((token: TokenMetadata) => {
      if (+total_value > 0) {
        const { decimals, nearNonVisible, id } = token;
        const n = toReadableNumber(decimals, nearNonVisible.toString());
        const price =
          tokenPriceList[id == 'NEAR' ? WRAP_NEAR_CONTRACT_ID : id]?.price || 0;
        const p = new BigNumber(price).multipliedBy(n);
        const r = new BigNumber(p).dividedBy(total_value).multipliedBy(100);
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
  function getCurrentTokenProportion(token: TokenMetadata) {
    if (activeTab == 'near') {
      if (+near_total_value > 0 && +token.value > 0) {
        const percent = new BigNumber(token.value)
          .dividedBy(near_total_value)
          .multipliedBy(100)
          .toFixed();
        return display_percentage(percent) + '%';
      } else {
        return '-%';
      }
    }
    if (activeTab == 'ref') {
      if (+ref_total_value > 0) {
        const percent = new BigNumber(token.value)
          .dividedBy(ref_total_value)
          .multipliedBy(100)
          .toFixed();
        return display_percentage(percent) + '%';
      } else {
        return '-%';
      }
    }
    if (activeTab == 'dcl') {
      if (+dcl_total_value > 0) {
        const percent = new BigNumber(token.value)
          .dividedBy(dcl_total_value)
          .multipliedBy(100)
          .toFixed();
        return display_percentage(percent) + '%';
      } else {
        return '-%';
      }
    }
    if (activeTab == 'aurora') {
      if (+aurora_total_value > 0) {
        const percent = new BigNumber(token.value)
          .dividedBy(aurora_total_value)
          .multipliedBy(100)
          .toFixed();
        return display_percentage(percent) + '%';
      } else {
        return '-%';
      }
    }
  }
  return (
    <div className="">
      <div className="px-5">
        <div className="text-base text-white mb-4 gotham_bold">
          Token allocation
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center h-8 rounded-lg p-0.5 border border-commonTokenBorderColor">
            {tabList.map((item) => {
              return (
                <span
                  key={item.tag}
                  onClick={() => {
                    setActiveTab(item.tag);
                  }}
                  className={`flex items-center justify-center rounded-md h-full w-20 text-xs gotham_bold cursor-pointer ${
                    activeTab == item.tag
                      ? 'bg-portfolioLightGreyColor text-white'
                      : 'text-primaryText'
                  }`}
                >
                  {item.name}
                </span>
              );
            })}
          </div>
          <ArrowJumpLarge
            clickEvent={() => {
              window.open('/account');
            }}
            extraClass="flex-shrink-0"
          ></ArrowJumpLarge>
        </div>
      </div>
      <div className="flex items-center justify-center mt-8">
        {pieOption ? (
          <ReactECharts
            option={pieOption}
            style={{ width: '200px', height: '200px' }}
          />
        ) : null}
      </div>
      <div className="overflow-auto px-5 mt-5" style={{ maxHeight: '160px' }}>
        <div className={`${activeTab == 'near' ? '' : 'hidden'}`}>
          {near_tokens.map((token: TokenMetadata) => {
            return (
              <div
                key={token.id + 'near'}
                className="flex items-center justify-between mb-3 px-3"
              >
                <span className="text-sm text-primaryText">{token.symbol}</span>
                <span className="text-sm text-white">
                  {getCurrentTokenProportion(token)}
                </span>
              </div>
            );
          })}
        </div>
        <div className={`${activeTab == 'ref' ? '' : 'hidden'}`}>
          {ref_tokens.map((token: TokenMetadata) => {
            return (
              <div
                key={token.id + 'ref'}
                className="flex items-center justify-between mb-3 px-3"
              >
                <span className="text-sm text-primaryText">{token.symbol}</span>
                <span className="text-sm text-white">
                  {getCurrentTokenProportion(token)}
                </span>
              </div>
            );
          })}
        </div>
        <div className={`${activeTab == 'dcl' ? '' : 'hidden'}`}>
          {dcl_tokens.map((token: TokenMetadata) => {
            return (
              <div
                key={token.id + 'dcl'}
                className="flex items-center justify-between mb-3 px-3"
              >
                <span className="text-sm text-primaryText">{token.symbol}</span>
                <span className="text-sm text-white">
                  {getCurrentTokenProportion(token)}
                </span>
              </div>
            );
          })}
        </div>
        <div className={`${activeTab == 'aurora' ? '' : 'hidden'}`}>
          {aurora_tokens.map((token: TokenMetadata) => {
            return (
              <div
                key={token.id + 'aurora'}
                className="flex items-center justify-between mb-3 px-3"
              >
                <span className="text-sm text-primaryText">{token.symbol}</span>
                <span className="text-sm text-white">
                  {getCurrentTokenProportion(token)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
