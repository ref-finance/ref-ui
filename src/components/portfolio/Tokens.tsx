import React, { useEffect, useMemo, useState, useContext, useRef } from 'react';
import BigNumber from 'bignumber.js';
import { useUserRegisteredTokensAllAndNearBalance } from '../../state/token';
import { TokenMetadata } from '../../services/ft-contract';
import { toReadableNumber } from 'src/utils/numbers';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import ReactECharts from 'echarts-for-react';
import { useWalletSelector } from 'src/context/WalletSelectorContext';
import {
  auroraAddr,
  useAuroraBalancesNearMapping,
  useDCLAccountBalance,
} from 'src/services/aurora/aurora';
import { useTokenBalances } from 'src/state/token';
import { NEARXIDS } from 'src/services/near';
import { PortfolioData } from '../../pages/Portfolio';
import {
  ArrowJumpLarge,
  display_percentage_2,
  display_value,
  display_value_withCommas,
  display_number_internationalCurrencySystemNature,
  getAccountId,
} from './Tool';
import { BlueCircleLoading } from '../../components/layout/Loading';
import {
  WalletContext,
  getCurrentWallet,
} from '../../utils/wallets-integration';
import {
  AuroraIcon,
  AuroraIconActive,
  TriangleGreyIcon,
  CopyIcon,
} from '../../components/icon/Portfolio';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { isMobile } from 'src/utils/device';
import { FormattedMessage, useIntl } from 'react-intl';
import { openUrl } from '../../services/commonV3';

const is_mobile = isMobile();
export default function Tokens() {
  const { tokenPriceList } = useContext(PortfolioData);
  const [pieOption, setPieOption] = useState(null);
  const [activeTab, setActiveTab] = useState('near'); // near,ref,dcl,aurora
  const [tabList, setTabList] = useState([{ name: 'NEAR', tag: 'near' }]);

  const [ref_tokens, set_ref_tokens] = useState<TokenMetadata[]>([]);
  const [near_tokens, set_near_tokens] = useState<TokenMetadata[]>([]);
  const [dcl_tokens, set_dcl_tokens] = useState<TokenMetadata[]>([]);
  const [aurora_tokens, set_aurora_tokens] = useState<TokenMetadata[]>([]);

  const [ref_total_value, set_ref_total_value] = useState<string>('0');
  const [near_total_value, set_near_total_value] = useState<string>('0');
  const [dcl_total_value, set_dcl_total_value] = useState<string>('0');
  const [aurora_total_value, set_aurora_total_value] = useState<string>('0');
  const [color_list, set_color_list] = useState([
    '#468173',
    '#467681',
    '#455563',
    '#43698D',
    '#566583',
  ]);
  const [chartEvents, setChartEvents] = useState<any>({});
  const tokenRef = useRef(null);
  const { globalState } = useContext(WalletContext);
  const accountId = getAccountId();
  const isSignedIn = !!accountId || globalState.isSignedIn;
  const auroraAddress = auroraAddr(
    getCurrentWallet()?.wallet?.getAccountId() || ''
  );
  const displayAuroraAddress = `${auroraAddress?.substring(
    0,
    6
  )}...${auroraAddress?.substring(
    auroraAddress.length - 6,
    auroraAddress.length
  )}`;

  const userTokens = useUserRegisteredTokensAllAndNearBalance();
  const balances = useTokenBalances(); // inner account balance
  const auroaBalances = useAuroraBalancesNearMapping(auroraAddress);
  const DCLAccountBalance = useDCLAccountBalance(!!accountId);
  const is_tokens_loading =
    !userTokens || !balances || !auroaBalances || !DCLAccountBalance;
  const intl = useIntl();
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
        const { ref, near, aurora, dcl, id } = token;
        if (id === NEARXIDS[0]) return;
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
      const { tokens: tokens_near, total_value: total_value_near } =
        token_data_process(near_tokens_temp, 'near');
      const { tokens: tokens_ref, total_value: total_value_ref } =
        token_data_process(ref_tokens_temp, 'ref');
      const { tokens: tokens_dcl, total_value: total_value_dcl } =
        token_data_process(dcl_tokens_temp, 'dcl');
      const { tokens: tokens_aurora, total_value: total_value_aurora } =
        token_data_process(aurora_tokens_temp, 'aurora');
      set_ref_tokens(tokens_ref);
      set_near_tokens(tokens_near);
      set_dcl_tokens(tokens_dcl);
      set_aurora_tokens(tokens_aurora);

      set_ref_total_value(total_value_ref);
      set_near_total_value(total_value_near);
      set_dcl_total_value(total_value_dcl);
      set_aurora_total_value(total_value_aurora);
      const tab_list = [{ name: 'NEAR', tag: 'near' }];
      if (tokens_ref?.length > 0) {
        tab_list.push({
          name: 'REF' + '(' + intl.formatMessage({ id: 'classic' }) + ')',
          tag: 'ref',
        });
      }
      if (tokens_dcl?.length > 0) {
        tab_list.push({ name: 'DCL', tag: 'dcl' });
      }
      setTabList(JSON.parse(JSON.stringify(tab_list)));
    }
  }, [tokenPriceList, userTokens, is_tokens_loading]);
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
          show: true,
          textStyle: {
            color: '#fff',
            fontFamily: 'gotham',
            fontSize: '12',
          },
          backgroundColor: 'rgba(29, 41, 50, 0.8)',
          borderWidth: 1,
          padding: [2, 5],
          borderColor: '#293844',
          extraCssText:
            'box-shadow:0px 0px 10px 4px rgba(0, 0, 0, 0.15);border-radius:5px;',
          // position: ['100%', '100%'],

          formatter: (params: any) => {
            const { data } = params;
            const percent = getCurrentTokenProportion(data);
            return percent;
          },
        },
        legend: {
          top: '5%',
          left: 'center',
          show: false,
        },
        color: color_list,
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
              emphasis: {
                color: '#00D6AF',
              },
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
                  const { symbol, t_value } = data.data;
                  const num = data.data[activeTab];
                  const display_num =
                    display_number_internationalCurrencySystemNature(num);
                  const display_v = display_value(t_value);
                  return `{a|${symbol}}\n{b|${display_num}}\n{a|${display_v}}`;
                },
                rich: {
                  a: {
                    fontSize: 12,
                    color: '#7E8A93',
                    lineHeight: 20,
                    fontFamily: 'gotham',
                  },
                  b: {
                    fontSize: 16,
                    color: '#FFFFFF',
                    lineHeight: 20,
                    fontWeight: '700',
                    fontFamily: 'gotham',
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
  }, [activeTab, tokenRef, ref_tokens, near_tokens, dcl_tokens, aurora_tokens]);
  useMemo(() => {
    // for fixing mobile issue (may be have a better way)
    if (pieOption) {
      const chartEvents =
        is_mobile && tokenRef?.current?.echarts ? { click: () => {} } : {};
      setChartEvents(chartEvents);
    }
  }, [pieOption, tokenRef]);
  if (
    (!userTokens || !balances || !auroaBalances || !DCLAccountBalance) &&
    isSignedIn
  )
    return (
      <div className="flex items-center justify-center mt-20">
        <BlueCircleLoading></BlueCircleLoading>
      </div>
    );
  function token_data_process(
    target_tokens: TokenMetadata[],
    accountType: string
  ) {
    const tokens = JSON.parse(JSON.stringify(target_tokens || []));
    tokens.forEach((token: TokenMetadata) => {
      const token_num = token[accountType] || 0;
      const token_price =
        tokenPriceList[token.id == 'NEAR' ? WRAP_NEAR_CONTRACT_ID : token.id]
          ?.price || '0';
      const token_value = new BigNumber(token_num).multipliedBy(token_price);
      token['t_value'] = token_value.toFixed();
    });
    tokens.sort((tokenB: TokenMetadata, tokenA: TokenMetadata) => {
      const a_value = new BigNumber(tokenA['t_value']);
      const b_value = new BigNumber(tokenB['t_value']);
      return a_value.minus(b_value).toNumber();
    });
    const total_value = tokens.reduce((acc: string, cur: TokenMetadata) => {
      return new BigNumber(acc).plus(cur['t_value']).toFixed();
    }, '0');

    return { tokens, total_value };
  }
  function getPieData(tokens: TokenMetadata[], total_value: string) {
    const parseSerialization: TokenMetadata[] = JSON.parse(
      JSON.stringify(tokens)
    );
    const target = parseSerialization.map(
      (token: TokenMetadata, index: number) => {
        if (+total_value > 0) {
          const { t_value } = token;
          const value_big = new BigNumber(t_value);
          const percent = value_big.dividedBy(total_value).multipliedBy(100);
          const display_value = new BigNumber(0.005)
            .multipliedBy(total_value)
            .toFixed();
          return {
            ...token,
            value: percent.isLessThan('0.5') ? display_value : t_value,
          };
        }
      }
    );
    return target;
  }
  function getCurrentTokenProportion(token: TokenMetadata) {
    if (activeTab == 'near') {
      if (+near_total_value > 0 && +token['t_value'] > 0) {
        const percent = new BigNumber(token['t_value'])
          .dividedBy(near_total_value)
          .multipliedBy(100)
          .toFixed();
        return display_percentage_2(percent) + '%';
      } else {
        return '-%';
      }
    }
    if (activeTab == 'ref') {
      if (+ref_total_value > 0) {
        const percent = new BigNumber(token['t_value'])
          .dividedBy(ref_total_value)
          .multipliedBy(100)
          .toFixed();
        return display_percentage_2(percent) + '%';
      } else {
        return '-%';
      }
    }
    if (activeTab == 'dcl') {
      if (+dcl_total_value > 0) {
        const percent = new BigNumber(token['t_value'])
          .dividedBy(dcl_total_value)
          .multipliedBy(100)
          .toFixed();
        return display_percentage_2(percent) + '%';
      } else {
        return '-%';
      }
    }
    if (activeTab == 'aurora') {
      if (+aurora_total_value > 0) {
        const percent = new BigNumber(token['t_value'])
          .dividedBy(aurora_total_value)
          .multipliedBy(100)
          .toFixed();
        return display_percentage_2(percent) + '%';
      } else {
        return '-%';
      }
    }
  }
  function showTotalValue() {
    let target = '0';
    if (activeTab == 'near') {
      target = near_total_value;
    } else if (activeTab == 'ref') {
      target = ref_total_value;
    } else if (activeTab == 'dcl') {
      target = dcl_total_value;
    } else if (activeTab == 'aurora') {
      target = aurora_total_value;
    }
    return display_value_withCommas(target);
  }
  return (
    <div className="mt-6">
      <div className="px-5">
        <div className="text-base text-white mb-4 gotham_bold">
          <FormattedMessage id="token_balances"></FormattedMessage>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`flex items-center mr-2 ${
                tabList.length > 1 ? '' : 'hidden'
              }`}
            >
              <div className="flex items-center h-8 rounded-lg p-0.5 border border-commonTokenBorderColor">
                {tabList.map((item, index) => {
                  return (
                    <span
                      key={item.tag}
                      onClick={() => {
                        setActiveTab(item.tag);
                      }}
                      className={`flex items-center justify-center rounded-md h-full ${
                        item.tag == 'ref' ? 'w-24' : 'w-12'
                      } text-xs gotham_bold cursor-pointer hover:bg-portfolioLightGreyColor ${
                        index != tabList.length - 1 ? 'mr-0.5' : ''
                      } ${
                        activeTab == item.tag
                          ? 'bg-portfolioLightGreyColor text-white'
                          : 'text-primaryText'
                      }`}
                    >
                      {item.tag == 'ref'
                        ? 'REF' +
                          '(' +
                          intl.formatMessage({ id: 'classic' }) +
                          ')'
                        : item.name}
                    </span>
                  );
                })}
              </div>
            </div>
            <div
              className={`flex items-center justify-center rounded-lg h-8 p-0.5 mr-3 ${
                tabList.length == 1 && isSignedIn ? '' : 'hidden'
              } ${
                activeTab == 'near'
                  ? 'border border-gradientFromHover text-white'
                  : 'text-primaryText'
              }`}
            >
              <span
                onClick={() => {
                  setActiveTab('near');
                }}
                className={`flex items-center justify-center rounded-md h-full px-2 text-xs gotham_bold cursor-pointer bg-portfolioLightGreyColor hover:text-white`}
              >
                NEAR wallet
              </span>
            </div>
            <div
              className={`text-sm text-primaryText ${
                isSignedIn ? 'hidden' : ''
              }`}
            >
              NEAR Wallet
            </div>
            {aurora_tokens?.length > 0 ? (
              activeTab == 'aurora' ? (
                <AuroraIconActive className="cursor-pointer"></AuroraIconActive>
              ) : (
                <AuroraIcon
                  onClick={() => {
                    setActiveTab('aurora');
                  }}
                  className="text-primaryText hover:text-portfolioLightGreenColor cursor-pointer"
                ></AuroraIcon>
              )
            ) : null}
          </div>
          <ArrowJumpLarge
            clickEvent={() => {
              if (activeTab == 'aurora') {
                localStorage.setItem('REF_FI_SWAP_SWAPPAGE_TAB_VALUE', 'cross');
                localStorage.setItem(
                  'REF_FI_ACCOUNT_TAB_AURORA_KEY',
                  activeTab
                );
              } else {
                localStorage.setItem(
                  'REF_FI_SWAP_SWAPPAGE_TAB_VALUE',
                  'normal'
                );
                localStorage.setItem('REF_FI_ACCOUNT_TAB_KEY', activeTab);
              }

              openUrl('/account');
            }}
            extraClass={`flex-shrink-0 ${isSignedIn ? '' : 'hidden'}`}
          ></ArrowJumpLarge>
        </div>
        <div
          className={`flex items-center justify-between mt-4 ${
            activeTab == 'aurora' ? '' : 'hidden'
          }`}
        >
          <div className="flex items-center">
            <TriangleGreyIcon className="mr-1"></TriangleGreyIcon>
            <span className="text-xs text-primaryText">
              <FormattedMessage id="mapping_account" />
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-white mr-1.5">
              {displayAuroraAddress}
            </span>
            <CopyToClipboard text={auroraAddress}>
              <CopyIcon className="text-primaryText hover:text-white cursor-pointer"></CopyIcon>
            </CopyToClipboard>
          </div>
        </div>
        <div className="text-xl gotham_bold text-white mt-2">
          {showTotalValue()}
        </div>
      </div>
      {isSignedIn ? null : (
        <div className="flex items-center justify-center text-sm text-primaryText my-20 w-60 mx-auto text-center">
          <FormattedMessage id="account_appear_here_tip" />
        </div>
      )}
      <div className="flex items-center justify-center mt-8 xsm:mt-0">
        {pieOption ? (
          <ReactECharts
            ref={tokenRef}
            option={pieOption}
            style={{
              width: is_mobile ? '240px' : '200px',
              height: is_mobile ? '240px' : '200px',
            }}
            onEvents={chartEvents}
          />
        ) : null}
      </div>
      <div
        className="overflow-auto px-2 mt-5 xsm:mt-0 lg:absolute lg:w-full lg:bottom-0"
        style={{
          maxHeight: is_mobile ? '160px' : 'none',
          top: !is_mobile ? (activeTab == 'aurora' ? '24rem' : '22rem') : '',
        }}
      >
        <div className={`${activeTab == 'near' ? '' : 'hidden'}`}>
          {near_tokens.map((token: TokenMetadata, index) => {
            return (
              <div
                key={token.id + 'near'}
                className="flex items-center justify-between mb-3 px-3 hover:bg-symbolHover rounded-md py-1.5"
              >
                <div className="flex items-center">
                  <img
                    className="w-4 h-4 border border-gradientFrom rounded-full mr-2.5"
                    src={token.icon}
                  />
                  <span className="text-sm text-primaryText">
                    {token.symbol}
                  </span>
                </div>
                <span className="text-sm text-white">
                  {display_value(token.t_value)}
                </span>
              </div>
            );
          })}
        </div>
        <div className={`${activeTab == 'ref' ? '' : 'hidden'}`}>
          {ref_tokens.map((token: TokenMetadata, index) => {
            return (
              <div
                key={token.id + 'ref'}
                className="flex items-center justify-between mb-3 px-3 hover:bg-symbolHover rounded-md py-1.5"
              >
                <div className="flex items-center">
                  <img
                    className="w-4 h-4 border border-gradientFrom rounded-full mr-2.5"
                    src={token.icon}
                  />
                  <span className="text-sm text-primaryText">
                    {token.symbol}
                  </span>
                </div>
                <span className="text-sm text-white">
                  {display_value(token.t_value)}
                </span>
              </div>
            );
          })}
        </div>
        <div className={`${activeTab == 'dcl' ? '' : 'hidden'}`}>
          {dcl_tokens.map((token: TokenMetadata, index) => {
            return (
              <div
                key={token.id + 'dcl'}
                className="flex items-center justify-between mb-3 px-3 hover:bg-symbolHover rounded-md py-1.5"
              >
                <div className="flex items-center">
                  <img
                    className="w-4 h-4 border border-gradientFrom rounded-full mr-2.5"
                    src={token.icon}
                  />
                  <span className="text-sm text-primaryText">
                    {token.symbol}
                  </span>
                </div>
                <span className="text-sm text-white">
                  {display_value(token.t_value)}
                </span>
              </div>
            );
          })}
        </div>
        <div className={`${activeTab == 'aurora' ? '' : 'hidden'}`}>
          {aurora_tokens.map((token: TokenMetadata, index) => {
            return (
              <div
                key={token.id + 'aurora'}
                className="flex items-center justify-between mb-3 px-3 hover:bg-symbolHover rounded-md py-1.5"
              >
                <div className="flex items-center">
                  <img
                    className="w-4 h-4 border border-gradientFrom rounded-full mr-2.5"
                    src={token.icon}
                  />
                  <span className="text-sm text-primaryText">
                    {token.symbol}
                  </span>
                </div>
                <span className="text-sm text-white">
                  {display_value(token.t_value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
