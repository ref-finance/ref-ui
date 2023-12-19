import React, { useEffect, useState, useContext } from 'react';
import Loading from 'src/components/layout/Loading';
import {
  XrefLogo,
  XrefSymbol,
  RefSymbol,
  XrefIconWhole,
} from 'src/components/icon/Xref';
import OldInputAmount from 'src/components/forms/OldInputAmount';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  GradientButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from 'src/components/button/Button';
import BigNumber from 'bignumber.js';
import { isMobile } from 'src/utils/device';
import { FaExchangeAlt } from '../../components/reactIcons';
import {
  toReadableNumber,
  toPrecision,
  niceDecimals,
  formatWithCommas,
} from 'src/utils/numbers';
import getConfig from 'src/services/config';
import {
  ftGetBalance,
  ftGetTokenMetadata,
  TokenMetadata,
} from 'src/services/ft-contract';
import {
  metadata,
  getPrice,
  stake,
  unstake,
  XREF_TOKEN_DECIMALS,
  XrefMetaData,
} from 'src/services/xref';
import QuestionMark from 'src/components/farm/QuestionMark';
import { WalletContext } from '../../utils/wallets-integration';
import {
  constTransactionPage,
  useTranstionsExcuteDataStore,
} from '../../stores/transtionsExcuteData';
import CustomTooltip from 'src/components/customTooltip/customTooltip';

const {
  XREF_TOKEN_ID,
  REF_TOKEN_ID,
  TOTAL_PLATFORM_FEE_REVENUE,
  CUMULATIVE_REF_BUYBACK,
} = getConfig();
const DECIMALS_XREF_REF_TRANSTER = 8;

function XrefPage() {
  const [tab, setTab] = useState(0);
  const [apr, setApr] = useState('');
  const [refBalance, setRefBalance] = useState(null);
  const [xrefBalance, setXrefBalance] = useState(null);
  const [rate, setRate] = useState(null);
  const [totalDataArray, setTotalDataArray] = useState([]);
  const [refToken, setRefToken] = useState<TokenMetadata>();
  const [xrefToken, setXrefToken] = useState<TokenMetadata>();
  const [xrefMetaData, setXrefMetaData] = useState<XrefMetaData>();
  const intl = useIntl();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const transtionsExcuteDataStore = useTranstionsExcuteDataStore();
  const actionStatus = transtionsExcuteDataStore.getActionStatus();
  const displayBalance = (max: string) => {
    const formattedMax = new BigNumber(max);
    if (!isSignedIn) {
      return '-';
    } else if (formattedMax.isEqualTo('0')) {
      return '0';
    } else {
      return toPrecision(max, 3, true);
    }
  };
  useEffect(() => {
    if (actionStatus == 'pending') return;
    ftGetBalance(XREF_TOKEN_ID).then(async (data: any) => {
      const token = await ftGetTokenMetadata(XREF_TOKEN_ID);
      const { decimals } = token;
      const balance = toReadableNumber(decimals, data);
      setXrefToken(token);
      setXrefBalance(balance);
    });
    metadata().then((data) => {
      const {
        locked_token_amount,
        reward_per_sec,
        cur_locked_token_amount,
        supply,
        account_number,
      } = data;
      setXrefMetaData(data);
      if (new BigNumber(locked_token_amount).isGreaterThan('0')) {
        const apr =
          (1 / locked_token_amount) *
          (Number(reward_per_sec) * 365 * 24 * 60 * 60 * 100);
        setApr(apr.toString());
      }
      ftGetBalance(REF_TOKEN_ID).then(async (data: any) => {
        const token = await ftGetTokenMetadata(REF_TOKEN_ID);
        setRefToken(token);
        const { decimals } = token;
        const balance = toReadableNumber(decimals, data);
        setRefBalance(balance);
      });
      const joinAmount = toPrecision(
        (account_number || '0').toString(),
        0,
        true
      );
      const totalFee = `${toPrecision(
        TOTAL_PLATFORM_FEE_REVENUE.toString(),
        2,
        true
      )}`;
      const refAmount = toPrecision(
        toReadableNumber(XREF_TOKEN_DECIMALS, cur_locked_token_amount || '0'),
        2,
        true
      );
      const xrefAmount = toPrecision(
        toReadableNumber(XREF_TOKEN_DECIMALS, supply || '0'),
        2,
        true
      );
      const totalBuyBack = `${toPrecision(
        CUMULATIVE_REF_BUYBACK.toString(),
        2,
        true
      )}`;
      const revenueBooster = 'x1';
      setTotalDataArray([
        joinAmount,
        totalFee,
        refAmount,
        xrefAmount,
        totalBuyBack,
        revenueBooster,
      ]);
    });
    getPrice().then((data) => {
      const rate = toReadableNumber(DECIMALS_XREF_REF_TRANSTER, data);
      setRate(rate);
    });
  }, [isSignedIn, actionStatus]);
  const isM = isMobile();
  const switchTab = (tab: number) => {
    setTab(tab);
  };
  const displayApr = () => {
    if (!apr) {
      return '-';
    }
    const aprBig = new BigNumber(apr);
    if (aprBig.isEqualTo(0)) {
      return '0';
    } else if (aprBig.isLessThan(0.01)) {
      return '<0.01';
    } else {
      return aprBig.toFixed(2, 1);
    }
  };

  const analysisText: any = {
    first: {
      title: intl.formatMessage({ id: 'number_of_unique_stakers' }),
    },
    second: {
      title: intl.formatMessage({ id: 'protocol_projected_revenue' }),
      tipContent: `<p class="text-left lg:w-72 xs:w-48 md:w-48 text-xs">${intl.formatMessage(
        { id: 'protocol_projected_revenue_tip' }
      )}</p>`,
      unit: 'REF',
    },
    third: {
      title: intl.formatMessage({ id: 'total_ref_staked' }),
      unit: 'REF',
    },
    fourth: {
      title: intl.formatMessage({ id: 'total_xref_minted' }),
      unit: 'xREF',
    },
    fifth: {
      title: intl.formatMessage({ id: 'cumulative_ref_buyback' }),
      unit: 'REF',
    },
    sixth: {
      title: intl.formatMessage({ id: 'yearly_revenue_booster' }),
    },
  };
  const displayTotalREF = () => {
    const bigAmount = new BigNumber(xrefBalance || '0');
    let receive;
    receive = bigAmount.multipliedBy(rate);
    if (!isSignedIn) {
      return '-';
    } else if (receive.isEqualTo(0)) {
      return 0;
    } else if (receive.isLessThan(0.001)) {
      return '<0.001';
    } else {
      return (
        <>
          <label className="font-sans mr-0.5">≈</label>
          {toPrecision(receive.valueOf(), 3, true)}
        </>
      );
    }
  };
  function getXrefAprTip() {
    if (refToken && xrefMetaData) {
      const reward_per_sec = xrefMetaData.reward_per_sec;
      const week_rewards = new BigNumber(reward_per_sec)
        .multipliedBy(7 * 24 * 60 * 60)
        .toFixed(0);
      const amount = toReadableNumber(refToken.decimals, week_rewards);
      const displayAmount = formatWithCommas(toPrecision(amount, 2));
      const content = intl.formatMessage({ id: 'total_ref_week' });
      return `<div class="flex flex-col">
          <span class="text-xs text-navHighLightText">${content}</span>
          <div class="flex items-center justify-between mt-3">
            <image class="w-5 h-5 rounded-full mr-7" src="${refToken.icon}"/>
            <label class="text-xs text-navHighLightText">${displayAmount}</label>
          </div>
      </div>`;
    }
  }
  function getYourRewardsTip() {
    if (refToken && xrefMetaData) {
      const { locked_token_amount, reward_per_sec } = xrefMetaData;
      const bigAmount = new BigNumber(xrefBalance || '0');
      const userReceiveRef = bigAmount.multipliedBy(rate);
      const totalRef = toReadableNumber(refToken.decimals, locked_token_amount);
      const percent = new BigNumber(userReceiveRef).dividedBy(totalRef);
      const week_rewards = new BigNumber(reward_per_sec)
        .multipliedBy(7 * 24 * 60 * 60)
        .toFixed();
      const week_rewards_amount = toReadableNumber(
        refToken.decimals,
        week_rewards
      );
      const user_get_rewards_per_week =
        percent.multipliedBy(week_rewards_amount);
      let displayAmount = '';
      if (user_get_rewards_per_week.isEqualTo(0)) {
        displayAmount = '0';
      } else if (user_get_rewards_per_week.isLessThan('0.001')) {
        displayAmount = '<0.001';
      } else {
        displayAmount = formatWithCommas(user_get_rewards_per_week.toFixed(2));
      }
      const content = intl.formatMessage({ id: 'ref_week_you_will_get' });
      return `<div class="flex flex-col">
          <span class="text-xs text-navHighLightText">${content}</span>
          <div class="flex items-center justify-between mt-3">
            <image class="w-5 h-5 rounded-full mr-7" src="${refToken.icon}"/>
            <label class="text-xs text-navHighLightText">${displayAmount}</label>
          </div>
      </div>`;
    }
  }
  if (!(refBalance && xrefBalance)) return <Loading></Loading>;
  return (
    <div className="flex flex-col mx-auto items-center -mt-5 xs:px-4 md:px-4 lg:w-3/5 xl:w-3/6 2xl:w-2/5">
      <div>
        <XrefLogo width={isM ? '140' : ''} height={isM ? '70' : ''}></XrefLogo>
      </div>
      <div className="mb-5 mt-1.5 text-white flex xs:flex-col md:flex-col items-center justify-center">
        <label className="text-xl font-black">
          <FormattedMessage id="xref_title"></FormattedMessage>
        </label>
        <XrefIconWhole
          width="133"
          height="20"
          className="lg:ml-5 xs:mt-4 md:mt-4"
        ></XrefIconWhole>
      </div>
      <div className="text-primaryText text-sm mb-7">
        <FormattedMessage id="xref_introdution"></FormattedMessage>&nbsp;
      </div>
      <div className="w-full">
        <div className="xs:mb-2.5 md:mb-2.5 lg:mb-3 grid lg:grid-cols-xrefColumn lg:gap-x-2.5 xs:grid-rows-xrefRowM md:grid-rows-xrefRowM xs:gap-y-2.5 md:gap-y-2.5">
          <div className="flex flex-col xs:flex-row md:flex-row justify-between rounded-2xl bg-cardBg py-5 px-6 xs:py-4 md:py-4 xs:flex md:flex xs:justify-between md:justify-between">
            <p className="text-base text-primaryText">
              <FormattedMessage id="staking_apr"></FormattedMessage>
            </p>
            <div className="flex">
              <div
                className="text-white text-left"
                data-class="reactTip"
                data-tooltip-id={'xrefAprId'}
                data-place="top"
                data-tooltip-html={getXrefAprTip()}
              >
                <span className="text-2xl text-white">
                  {displayApr() + '%'}
                </span>
                <CustomTooltip id={'xrefAprId'} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-cardBg py-5 px-6 xs:py-3 md:py-3">
            {/* pc */}
            <div className="flex items-start justify-between xs:hidden md:hidden">
              <div className="text-primaryText text-base w-full">
                <label className="mr-1.5">
                  <FormattedMessage id="xref"></FormattedMessage>
                </label>
                <label>
                  <FormattedMessage id="balance"></FormattedMessage>
                </label>
              </div>
              <div className="relative -mt-1">
                <div className="flex items-center">
                  <XrefSymbol></XrefSymbol>
                  <div className="ml-1.5 flex-grow">
                    <p
                      className="text-xl xs:text-base md:text-base text-white text-right"
                      title={xrefBalance}
                    >
                      {displayBalance(xrefBalance)}
                    </p>
                  </div>
                </div>
                <div className="whitespace-nowrap ml-8 text-white text-sm text-right">
                  <div
                    className="text-white text-left"
                    data-class="reactTip"
                    data-tooltip-id={'youGetId'}
                    data-place="top"
                    data-tooltip-html={getYourRewardsTip()}
                  >
                    {displayTotalREF()}{' '}
                    <FormattedMessage id="ref"></FormattedMessage>
                    <CustomTooltip id={'youGetId'} />
                  </div>
                </div>
              </div>
            </div>
            {/* mobile */}
            <div className="flex items-start justify-between lg:hidden">
              <div className="flex items-center">
                <XrefSymbol></XrefSymbol>
                <div className="text-primaryText text-base ml-2">
                  <label className="mr-1.5">
                    <FormattedMessage id="xref"></FormattedMessage>
                  </label>
                  <label>
                    <FormattedMessage id="balance"></FormattedMessage>
                  </label>
                </div>
              </div>
              <div className="flex flex-col items-end text-xl xs:text-base md:text-base text-white relative top-3">
                <label>{displayBalance(xrefBalance)}</label>
                <div className="whitespace-nowrap text-white text-sm">
                  <div
                    className="text-white text-left"
                    data-class="reactTip"
                    data-tooltip-id={'youGetMId'}
                    data-place="top"
                    data-tooltip-html={getYourRewardsTip()}
                  >
                    {displayTotalREF()}{' '}
                    <FormattedMessage id="ref"></FormattedMessage>
                    <CustomTooltip id={'youGetMId'} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-cardBg p-5 xs:px-3 md:px-3">
          <div className="flex items-center h-12 rounded-lg bg-black bg-opacity-20 p-1">
            <label
              onClick={() => switchTab(0)}
              className={`rounded-md flex justify-center items-center text-lg flex-grow h-full cursor-pointer mr-1 ${
                tab == 0 ? 'bg-xrefTab text-white' : 'text-primaryText'
              }`}
            >
              <FormattedMessage id="stake"></FormattedMessage>
            </label>
            <label
              onClick={() => switchTab(1)}
              className={`rounded-md flex justify-center items-center text-lg flex-grow h-full cursor-pointer ${
                tab == 1 ? 'bg-xrefTab text-white' : 'text-primaryText'
              }`}
            >
              <FormattedMessage id="unstake"></FormattedMessage>
            </label>
          </div>
          {/* ref stake*/}
          <InputView
            tab={tab}
            max={refBalance}
            isM={isM}
            rate={rate}
            hidden={tab != 0 ? 'hidden' : ''}
            refToken={refToken}
          ></InputView>
          {/* xref unstake */}
          <InputView
            tab={tab}
            max={xrefBalance}
            isM={isM}
            rate={rate}
            hidden={tab != 1 ? 'hidden' : ''}
            xrefToken={xrefToken}
          ></InputView>
        </div>
      </div>
      <div className="w-full grid mt-3 grid-cols-2 lg:grid-rows-2 gap-2">
        {Object.values(analysisText).map(
          ({ title, tipContent, unit }, index) => {
            return (
              <InfoBox
                key={title}
                title={title}
                tip={tipContent}
                unit={unit}
                value={totalDataArray[index]}
              ></InfoBox>
            );
          }
        )}
      </div>
    </div>
  );
}

function InputView(props: any) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { tab, max, hidden, isM, rate, refToken, xrefToken } = props;
  const [forward, setForward] = useState(true);
  const transtionsExcuteDataStore = useTranstionsExcuteDataStore();
  const actionStatus = transtionsExcuteDataStore.getActionStatus();
  useEffect(() => {
    setForward(true);
  }, [tab]);
  useEffect(() => {
    if (actionStatus !== 'pending') {
      setLoading(false);
    }
    if (actionStatus == 'resolved' || actionStatus == 'rejected') {
      setAmount('');
    }
  }, [actionStatus]);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const onSubmit = () => {
    setLoading(true);
    const transactionId = String(Date.now());
    transtionsExcuteDataStore.setActionStatus('pending');
    if (tab == 0) {
      transtionsExcuteDataStore.setActionData({
        status: 'pending',
        page: constTransactionPage.xref,
        transactionId,
        data: {
          prefix: 'Stake',
          tokens: [
            {
              token: refToken,
              amount: toPrecision(amount, 3),
            },
          ],
        },
      });
      // stake
      stake({ amount })
        .then(({ response }) => {
          transtionsExcuteDataStore.setActionData({
            status: 'success',
            transactionResponse: response,
          });
          transtionsExcuteDataStore.setActionStatus('resolved');
        })
        .catch((e) => {
          transtionsExcuteDataStore.setActionData({
            status: 'error',
            transactionError: {
              message: e.message,
              transactionId,
            },
          });
          transtionsExcuteDataStore.setActionStatus('rejected');
        });
    } else if (tab == 1) {
      transtionsExcuteDataStore.setActionData({
        status: 'pending',
        page: constTransactionPage.xref,
        transactionId,
        data: {
          prefix: 'Unstake',
          tokens: [
            {
              token: xrefToken,
              amount: toPrecision(amount, 3),
            },
          ],
        },
      });

      // unstake
      unstake({ amount })
        .then(({ response }) => {
          transtionsExcuteDataStore.setActionData({
            status: 'success',
            transactionResponse: response,
          });
          transtionsExcuteDataStore.setActionStatus('resolved');
        })
        .catch((e) => {
          transtionsExcuteDataStore.setActionData({
            status: 'error',
            transactionError: {
              message: e.message,
              transactionId,
            },
          });
          transtionsExcuteDataStore.setActionStatus('rejected');
        });
    }
  };

  const buttonStatus =
    !amount ||
    new BigNumber(amount).isEqualTo(0) ||
    new BigNumber(amount).isGreaterThan(max);
  const exchangeDisplay = () => {
    const bigAmount = new BigNumber(amount || '0');
    let receive;
    if (tab == 0) {
      receive = bigAmount.dividedBy(rate);
    } else {
      receive = bigAmount.multipliedBy(rate);
    }
    if (receive.isEqualTo(0)) {
      return 0;
    } else if (receive.isLessThan(0.001)) {
      return '<0.001';
    } else {
      return (
        <>
          <label className="font-sans mr-0.5">≈</label>
          {receive.toFixed(3, 1)}
        </>
      );
    }
  };
  const rateDisplay = (tab: number) => {
    const cur_rate_forward = rate;
    const cur_rate_reverse = 1 / rate;
    if (rate) {
      if ((tab == 1 && forward) || (tab == 0 && !forward)) {
        // forward
        const displayStr = niceDecimals(cur_rate_forward, 4);
        return (
          <>
            1 <FormattedMessage id="xref"></FormattedMessage> =&nbsp;
            <span className="cursor-text" title={cur_rate_forward.toString()}>
              {displayStr}
            </span>
            &nbsp;
            <FormattedMessage id="ref"></FormattedMessage>
          </>
        );
      } else {
        const displayStr = niceDecimals(cur_rate_reverse, 4);
        return (
          <>
            1 <FormattedMessage id="ref"></FormattedMessage> =&nbsp;
            <span className="cursor-text" title={cur_rate_reverse.toString()}>
              {displayStr}
            </span>
            &nbsp;
            <FormattedMessage id="xref"></FormattedMessage>
          </>
        );
      }
    } else {
      return (
        <>
          1 <FormattedMessage id="xref"></FormattedMessage> ={' '}
          <span title="1">1</span>&nbsp;
          <FormattedMessage id="ref"></FormattedMessage>
        </>
      );
    }
  };
  const displayBalance = (max: string) => {
    const formattedMax = new BigNumber(max);
    if (!isSignedIn) {
      return '-';
    } else if (formattedMax.isEqualTo('0')) {
      return '0';
    } else {
      return toPrecision(max, 3, true);
    }
  };
  return (
    <div className={`flex flex-col ${hidden} lg:mt-14`}>
      <div
        onClick={() => {
          setForward(!forward);
        }}
        className="lg:hidden mt-2.5 mb-6 w-full flex items-center justify-center text-sm text-white rounded-lg bg-black bg-opacity-20 py-1 px-3 xs:px-2 md:px-2 cursor-pointer"
      >
        <FaExchangeAlt color="#00C6A2" className="mr-3"></FaExchangeAlt>{' '}
        {rateDisplay(tab)}
      </div>
      <div className="relative flex items-center mb-8 xs:mb-5 md:mb-5 h-16">
        <div className="flex-grow relative">
          <div className="flex justify-between items-center absolute right-0 lg:-top-8  xs:-top-5 md:-top-5 w-full">
            <div
              onClick={() => {
                setForward(!forward);
              }}
              className="xs:hidden md:hidden flex items-center justify-center text-sm text-white rounded-lg bg-black bg-opacity-20 py-1 px-3 xs:px-2 md:px-2 cursor-pointer"
            >
              <FaExchangeAlt color="#00C6A2" className="mr-3"></FaExchangeAlt>{' '}
              {rateDisplay(tab)}
            </div>
            <div className="flex items-center text-primaryText text-xs ">
              <span className="ml-2">
                <FormattedMessage id="balance"></FormattedMessage>:{' '}
                <span title={max}>{displayBalance(max)}</span>
              </span>
            </div>
          </div>
          <OldInputAmount max={max} value={amount} onChangeAmount={setAmount} />
        </div>
        <label className="ml-5 xs:ml-2 ml:mx-2 text-white text-lg xs:text-base md:text-base w-14 text-center">
          {tab == 0 ? (
            <FormattedMessage id="ref"></FormattedMessage>
          ) : (
            <FormattedMessage id="xref"></FormattedMessage>
          )}
        </label>
        <div className="w-16 flex justify-center">
          {tab == 0 ? (
            <RefSymbol
              width={isM ? '33' : ''}
              height={isM ? '33' : ''}
            ></RefSymbol>
          ) : (
            <XrefSymbol
              width={isM ? '' : '56'}
              height={isM ? '' : '60'}
            ></XrefSymbol>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        {tab == 0 ? (
          <label className="text-sm text-primaryText">
            <FormattedMessage id="xref_to_receive"></FormattedMessage>
          </label>
        ) : (
          <label className="text-sm text-primaryText">
            <FormattedMessage id="ref_to_receive"></FormattedMessage>
          </label>
        )}

        <label className="text-sm text-white"> {exchangeDisplay()}</label>
      </div>
      {isSignedIn ? (
        <GradientButton
          color="#fff"
          className={`w-full h-11 text-center text-base text-white focus:outline-none font-semibold ${
            buttonStatus || loading ? 'opacity-40' : ''
          }`}
          onClick={onSubmit}
          disabled={buttonStatus || loading}
          btnClassName={buttonStatus || loading ? 'cursor-not-allowed' : ''}
        >
          {tab == 0 ? (
            <ButtonTextWrapper
              loading={loading}
              Text={() => <FormattedMessage id="stake"></FormattedMessage>}
            ></ButtonTextWrapper>
          ) : (
            <ButtonTextWrapper
              loading={loading}
              Text={() => <FormattedMessage id="unstake"></FormattedMessage>}
            ></ButtonTextWrapper>
          )}
        </GradientButton>
      ) : (
        <ConnectToNearBtn></ConnectToNearBtn>
      )}
    </div>
  );
}
function InfoBox(props: any) {
  const { title, value, tip, unit } = props;
  const [hover, setHover] = useState(false);
  return (
    <div
      className="lg:h-16 xs:h-24 md:h-24 rounded-lg bg-darkGradientBg shadow-dark p-2.5 hover:bg-darkGradientHoverBg"
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <div className="text-primaryText text-xs mb-1 lg:text-center">
        {title}
        {tip ? (
          <>
            <span
              className="relative top-0.5 inline-block ml-1"
              data-type="info"
              data-place="right"
              data-multiline={true}
              data-class="reactTip"
              data-tooltip-html={tip}
              data-tooltip-id="yourRewardsId"
            >
              <QuestionMark />
            </span>
            <CustomTooltip className="w-20" id="yourRewardsId" />
          </>
        ) : null}
      </div>
      <div className="lg:flex lg:justify-center lg:items-center">
        <label
          className={`text-base font-medium ${
            hover ? 'text-white' : 'text-xREFColor'
          }`}
        >
          {value}
        </label>
        <label
          className={`text-xs ml-1.5 ${
            hover ? 'text-white' : 'text-primaryText'
          }`}
        >
          {unit}
        </label>
      </div>
    </div>
  );
}
export default XrefPage;
