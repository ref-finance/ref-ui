import React, { useEffect, useState } from 'react';
import Loading from '~components/layout/Loading';
import { XrefLogo, XrefSymbol, RefSymbol } from '~components/icon/Xref';
import { SmallWallet } from '~components/icon/SmallWallet';
import OldInputAmount from '~components/forms/OldInputAmount';
import { FormattedMessage } from 'react-intl';
import {
  GradientButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from '~components/button/Button';
import BigNumber from 'bignumber.js';
import { isMobile } from '~utils/device';
import { FaExchangeAlt } from 'react-icons/fa';
import { toReadableNumber, formatWithCommas } from '~utils/numbers';
import getConfig from '~services/config';
import { ftGetBalance, ftGetTokenMetadata } from '~services/ft-contract';
import { metadata, getPrice, stake, unstake } from '~services/xref';
import { wallet } from '~services/near';
const { XREF_TOKEN_ID, REF_TOKEN_ID } = getConfig();
const DECIMALS_XREF_REF_TRANSTER = 8;

const displayBalance = (max: string) => {
  const formattedMax = new BigNumber(max);
  if (formattedMax.isEqualTo('0')) {
    return '0';
  } else {
    return formatWithCommas(formattedMax.toFixed(3, 1));
  }
};
function XrefPage() {
  const [tab, setTab] = useState(0);
  const [apr, setApr] = useState(0);
  const [refBalance, setRefBalance] = useState(null);
  const [xrefBalance, setXrefBalance] = useState(null);
  const [rate, setRate] = useState(null);
  const [forward, setForward] = useState(true);
  useEffect(() => {
    ftGetBalance(XREF_TOKEN_ID).then(async (data) => {
      const token = await ftGetTokenMetadata(XREF_TOKEN_ID);
      const { decimals } = token;
      const balance = toReadableNumber(decimals, data);
      setXrefBalance(balance);
    });
    metadata().then((data) => {
      const { locked_token, locked_token_amount, reward_per_sec } = data;
      const apr =
        (1 / locked_token_amount) *
        (Number(reward_per_sec) * 365 * 24 * 60 * 60 * 100);
      setApr(apr);
      ftGetBalance(locked_token).then(async (data) => {
        const token = await ftGetTokenMetadata(locked_token);
        const { decimals } = token;
        const balance = toReadableNumber(decimals, data);
        setRefBalance(balance);
      });
    });
    getPrice().then((data) => {
      const rate = toReadableNumber(DECIMALS_XREF_REF_TRANSTER, data);
      setRate(rate);
    });
  }, []);
  const isM = isMobile();
  const switchTab = (tab: number) => {
    setTab(tab);
  };
  const displayApr = () => {
    const aprBig = new BigNumber(apr);
    if (aprBig.isLessThan(0.01)) {
      return '<0.01';
    } else {
      return aprBig.toFixed(2, 1);
    }
  };
  const rateDisplay = () => {
    const cur_rate_forward = rate;
    const cur_rate_reverse = 1 / rate;
    if (rate) {
      if (forward) {
        return (
          <>
            1 <FormattedMessage id="xref"></FormattedMessage> ={' '}
            {new BigNumber(cur_rate_forward).toFixed(3)}{' '}
            <FormattedMessage id="ref"></FormattedMessage>
          </>
        );
      } else {
        return (
          <>
            1 <FormattedMessage id="ref"></FormattedMessage> ={' '}
            {new BigNumber(cur_rate_reverse).toFixed(3)}{' '}
            <FormattedMessage id="xref"></FormattedMessage>
          </>
        );
      }
    } else {
      return (
        <>
          1 <FormattedMessage id="xref"></FormattedMessage> = 1{' '}
          <FormattedMessage id="ref"></FormattedMessage>
        </>
      );
    }
  };
  if (!(refBalance && xrefBalance)) return <Loading></Loading>;
  return (
    <div className="flex flex-col mx-auto items-center -mt-5 xs:px-4 md:px-4 lg:w-3/5 xl:w-3/6 2xl:w-2/5">
      <div>
        <XrefLogo width={isM ? '140' : ''} height={isM ? '70' : ''}></XrefLogo>
      </div>
      <div className="mb-2.5 mt-5 text-white flex xs:flex-col md:flex-col items-center justify-center">
        <span className="text-2xl xs:text-3xl md:text-3xl xs:font-black md:font-black lg:mr-1.5">
          <FormattedMessage id="xref_title1"></FormattedMessage>
          <label className="xs:hidden md:hidden">
            <FormattedMessage id="xref_title2"></FormattedMessage>
          </label>
        </span>
        <label className="text-2xl lg:hidden">
          <FormattedMessage id="xref_title2"></FormattedMessage>
        </label>
      </div>
      <div className="text-primaryText text-sm mb-7">
        <FormattedMessage id="xref_introdution"></FormattedMessage>
      </div>
      <div className="w-full grid grid-rows-xrefContainer xs:grid-rows-xrefContainerM md:grid-rows-xrefContainerM gap-y-5 xs:gap-y-2.5 md:gap-y-2.5">
        <div className="grid lg:grid-cols-xrefColumn lg:gap-x-2.5 xs:grid-rows-xrefRowM md:grid-rows-xrefRowM xs:gap-y-2.5 md:gap-y-2.5">
          <div className="flex flex-col justify-between rounded-2xl bg-cardBg py-5 px-6 xs:py-4 md:py-4 xs:flex md:flex xs:justify-between md:justify-between items-center">
            <div className="flex items-center justify-between w-full">
              <p className="text-base text-primaryText">
                <FormattedMessage id="staking_apr"></FormattedMessage>
              </p>
              <p className="text-2xl text-white" title={apr.toString() + '%'}>
                {displayApr()}%
              </p>
            </div>
            <div className="flex items-center justify-between w-full ">
              <div className="rounded-md bg-primaryGradient text-sm text-white flex items-center justify-center px-3.5 py-1 cursor-not-allowed opacity-40">
                <FormattedMessage id="view_stats"></FormattedMessage>
              </div>
              <div
                onClick={() => {
                  setForward(!forward);
                }}
                className="flex items-center justify-center text-sm text-white rounded-lg bg-black bg-opacity-20 py-1.5 px-3 cursor-pointer"
              >
                <FaExchangeAlt color="#00C6A2" className="mr-3"></FaExchangeAlt>{' '}
                {rateDisplay()}
              </div>
            </div>
          </div>
          <div className="flex flex-col xs:flex-row md:flex-row xs:items-center md:items-center justify-between rounded-2xl bg-cardBg py-5 px-6 xs:py-3 md:py-3">
            {/* pc */}
            <div className="text-primaryText text-base w-full xs:hidden md:hidden">
              <label className="mr-1.5">
                <FormattedMessage id="xref"></FormattedMessage>
              </label>
              <label>
                <FormattedMessage id="balance"></FormattedMessage>
              </label>
            </div>
            <div className="flex items-center w-full xs:hidden md:hidden">
              <XrefSymbol width="38" height="42"></XrefSymbol>
              <div className="ml-3.5">
                <p
                  className="text-xl xs:text-base md:text-base text-white"
                  title={xrefBalance}
                >
                  {displayBalance(xrefBalance)}
                </p>
              </div>
            </div>
            {/* mobile */}
            <>
              <div className="lg:hidden flex items-center">
                <XrefSymbol width="38" height="42"></XrefSymbol>
                <div className="text-primaryText text-base ml-2">
                  <label className="mr-1.5">
                    <FormattedMessage id="xref"></FormattedMessage>
                  </label>
                  <label>
                    <FormattedMessage id="balance"></FormattedMessage>
                  </label>
                </div>
              </div>
              <p className="text-xl xs:text-base md:text-base text-white lg:hidden">
                {displayBalance(xrefBalance)}
              </p>
            </>
          </div>
        </div>
        <div className="rounded-2xl bg-cardBg p-5 xs:px-3 md:px-3">
          <div className="flex items-center h-12 rounded-lg bg-black bg-opacity-20 p-1">
            <label
              onClick={() => switchTab(0)}
              className={`rounded-md flex justify-center items-center text-lg flex-grow h-full cursor-pointer mr-1 ${
                tab == 0 ? 'bg-cardBg text-white' : 'text-primaryText'
              }`}
            >
              <FormattedMessage id="stake_ref"></FormattedMessage>
            </label>
            <label
              onClick={() => switchTab(1)}
              className={`rounded-md flex justify-center items-center text-lg flex-grow h-full cursor-pointer ${
                tab == 1 ? 'bg-cardBg text-white' : 'text-primaryText'
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
            hidden={tab != 0 ? 'hidden' : ''}
          ></InputView>
          {/* xref unstake */}
          <InputView
            tab={tab}
            max={xrefBalance}
            isM={isM}
            hidden={tab != 1 ? 'hidden' : ''}
          ></InputView>
        </div>
      </div>
    </div>
  );
}

function InputView(props: any) {
  const [amount, setAmount] = useState('0');
  const [loading, setLoading] = useState(false);
  const { tab, max, hidden, isM } = props;
  const onSubmit = () => {
    setLoading(true);
    if (tab == 0) {
      // stake
      stake({ amount });
    } else if (tab == 1) {
      // unstake
      unstake({ amount });
    }
  };
  const buttonStatus =
    !amount ||
    new BigNumber(amount).isEqualTo(0) ||
    new BigNumber(amount).isGreaterThan(max);
  return (
    <div className={`flex flex-col mt-14 ${hidden}`}>
      <div className="flex items-center mb-8 xs:mb-5 md:mb-5 h-16">
        <div className="flex-grow relative">
          <div className="flex items-center text-primaryText text-xs absolute right-0 -top-6">
            <SmallWallet></SmallWallet>
            <span className="ml-2" title={max}>
              <FormattedMessage id="balance"></FormattedMessage>:{' '}
              <label>{displayBalance(max)}</label>
            </span>
          </div>
          <OldInputAmount max={max} onChangeAmount={setAmount} />
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
              width={isM ? '38' : ''}
              height={isM ? '42' : ''}
            ></XrefSymbol>
          )}
        </div>
      </div>
      {wallet.isSignedIn() ? (
        <GradientButton
          color="#fff"
          className={`w-full h-11 text-center text-base text-white focus:outline-none font-semibold ${
            buttonStatus ? 'opacity-40' : ''
          }`}
          onClick={onSubmit}
          disabled={buttonStatus}
          btnClassName={buttonStatus ? 'cursor-not-allowed' : ''}
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
export default XrefPage;
