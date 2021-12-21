import React, { useState } from 'react';
import Loading from '~components/layout/Loading';
import { XrefLogo, XrefSymbol, RefSymbol } from '~components/icon/Xref';
import OldInputAmount from '~components/forms/OldInputAmount';
import { FormattedMessage } from 'react-intl';
import { GradientButton } from '~components/button/Button';
import BigNumber from 'bignumber.js';
import { isMobile } from '~utils/device';

function XrefPage() {
  const [tab, setTab] = useState(0);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [unstakeAmount, setUnstakeAmount] = useState(0);
  const setAmount = () => {};
  const stake = () => {};
  const unstake = () => {};
  const switchTab = (tab: number) => {
    setTab(tab);
  };
  const isM = isMobile();
  return (
    <div className="xrefPage flex justify-center items-start xs:flex-col md:flex-col xs:items-center md:items-center xs:-mt-3 md:-mt-3">
      <div>
        <XrefLogo width={isM ? '140' : ''} height={isM ? '70' : ''}></XrefLogo>
      </div>
      <div className="lg:ml-11 lg:w-3/5 xl:w-3/6 2xl:w-2/5 xs:p-4 md:p-4">
        <div className="text-white text-2xl xs:flex xs:flex-col md:flex md:flex-col items-center">
          <label className="xs:font-black md:font-black xs:text-3xl md:text-3xl">
            <FormattedMessage id="xref_title1"></FormattedMessage>
          </label>
          <label>
            <FormattedMessage id="xref_title2"></FormattedMessage>
          </label>
        </div>
        <div className="text-primaryText text-sm mt-2.5 mb-3 xs:mb-5 md:mb-5 ">
          <FormattedMessage id="xref_introdution"></FormattedMessage>
        </div>
        <div className="grid grid-rows-xrefContainer xs:grid-rows-xrefContainerM md:grid-rows-xrefContainerM gap-y-3 w-11/12 xs:w-full md:w-full">
          <div className="grid lg:grid-cols-farmContainerOther lg:gap-x-2.5 xs:grid-rows-xrefRowM md:grid-rows-xrefRowM xs:gap-y-2.5 md:gap-y-2.5">
            <div className="rounded-2xl bg-cardBg py-5 px-6 xs:py-4 md:py-4 xs:flex md:flex xs:justify-between md:justify-between items-center">
              <p className="text-base text-primaryText">
                <FormattedMessage id="staking_apr"></FormattedMessage>
              </p>
              <p className="text-2xl text-white mt-2 mb-3.5 text-center xs:m-0 md:x-0">
                32.52%
              </p>
              <div className="xs:hidden md:hidden rounded-md bg-primaryGradient text-sm text-white flex items-center justify-center px-p-3.5 py-1 cursor-not-allowed opacity-40">
                <FormattedMessage id="view_stats"></FormattedMessage>
              </div>
            </div>
            <div className="flex justify-between rounded-2xl bg-cardBg py-5 px-6 flex-grow">
              <div>
                <label className="text-primaryText text-base">
                  <FormattedMessage id="balance"></FormattedMessage>
                </label>
                <div className="flex items-center mt-3">
                  <XrefSymbol
                    width={isM ? '38' : ''}
                    height={isM ? '42' : ''}
                  ></XrefSymbol>
                  <div className="ml-3.5">
                    <p className="text-xl xs:text-base md:text-base text-white">
                      2,135.201
                    </p>
                    <label className="text-primaryText text-sm">
                      <FormattedMessage id="xref"></FormattedMessage>
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-primaryText text-base">
                  <FormattedMessage id="unstaked"></FormattedMessage>
                </label>
                <div className="flex items-center mt-3">
                  <XrefSymbol
                    width={isM ? '38' : ''}
                    height={isM ? '42' : ''}
                  ></XrefSymbol>
                  <div className="ml-3.5">
                    <p className="text-xl xs:text-base md:text-base text-white">
                      2,135.201
                    </p>
                    <label className="text-primaryText text-sm">
                      <FormattedMessage id="ref"></FormattedMessage>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-cardBg p-5">
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
                <FormattedMessage id="unstaked"></FormattedMessage>
              </label>
            </div>
            <div className="flex flex-col items-center mt-8">
              <div className="relative flex items-center">
                <XrefSymbol
                  className="absolute -left-4"
                  width="38"
                  height="42"
                ></XrefSymbol>
                <XrefSymbol
                  className="absolute -right-4"
                  width="38"
                  height="42"
                ></XrefSymbol>
                <div className="flex justify-center items-center h-8 w-48 bg-xrefbg border-t border-b border-greenColor shadow-green text-white text-sm">
                  1 <FormattedMessage id="xref"></FormattedMessage> = 1.235{' '}
                  <FormattedMessage id="ref"></FormattedMessage>
                </div>
              </div>
            </div>
            {/* ref stake*/}
            <div className={`flex flex-col mt-14 ${tab != 0 ? 'hidden' : ''}`}>
              <div className="flex items-center mb-8 xs:mb-5 md:mb-5">
                <div className="flex-grow relative">
                  <span className="text-primaryText text-xs absolute right-0 -top-6">
                    <FormattedMessage id="balance"></FormattedMessage>:
                    <label>199.203</label>
                  </span>
                  <OldInputAmount max={'9999'} onChangeAmount={setAmount} />
                </div>
                <label className="ml-7 mr-4 xs:mx-2 md:mx-2 text-white text-lg w-12 text-center">
                  <FormattedMessage id="ref"></FormattedMessage>
                </label>
                <XrefSymbol></XrefSymbol>
              </div>
              <GradientButton
                color="#fff"
                className={`w-full h-11 text-center text-base text-white mt-4 focus:outline-none font-semibold ${
                  !stakeAmount || new BigNumber(stakeAmount).isEqualTo(0)
                    ? 'opacity-40'
                    : ''
                }`}
                onClick={stake}
                disabled={
                  !stakeAmount || new BigNumber(stakeAmount).isEqualTo(0)
                }
                btnClassName={
                  !stakeAmount || new BigNumber(stakeAmount).isEqualTo(0)
                    ? 'cursor-not-allowed'
                    : ''
                }
              >
                <FormattedMessage id="confirm_stake"></FormattedMessage>
              </GradientButton>
            </div>
            {/* xref unstake */}
            <div className={`flex flex-col mt-14 ${tab != 1 ? 'hidden' : ''}`}>
              <div className="flex items-center mb-8 xs:mb-5 md:mb-5">
                <div className="flex-grow relative">
                  <span className="text-primaryText text-xs absolute right-0 -top-6">
                    <FormattedMessage id="balance"></FormattedMessage>:
                    <label>199.203</label>
                  </span>
                  <OldInputAmount max={'9999'} onChangeAmount={setAmount} />
                </div>
                <label className="ml-7 mr-4 xs:mx-2 md:mx-2 text-white text-lg xs:text-base md:text-base w-12 text-center">
                  <FormattedMessage id="xref"></FormattedMessage>
                </label>
                <XrefSymbol></XrefSymbol>
              </div>
              <GradientButton
                color="#fff"
                className={`w-full h-11 text-center text-base xs:text-base md:text-base text-white mt-4 focus:outline-none font-semibold ${
                  !unstakeAmount || new BigNumber(unstakeAmount).isEqualTo(0)
                    ? 'opacity-40'
                    : ''
                }`}
                onClick={unstake}
                disabled={
                  !unstakeAmount || new BigNumber(unstakeAmount).isEqualTo(0)
                }
                btnClassName={
                  !unstakeAmount || new BigNumber(unstakeAmount).isEqualTo(0)
                    ? 'cursor-not-allowed'
                    : ''
                }
              >
                <FormattedMessage id="confirm_unstake"></FormattedMessage>
              </GradientButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default XrefPage;
