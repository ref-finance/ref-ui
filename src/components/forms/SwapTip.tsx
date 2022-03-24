import React from 'react';
import { LightBulb, Setting } from '../../components/icon/Near';
import { ModalClose } from '../../components/icon';
import { FormattedMessage, useIntl } from 'react-intl';
import { useState, useEffect } from 'react';
import { RefGuy } from '../../components/icon/Common';
import { Link } from 'react-router-dom';

export function WalletSettingTip() {
  const [tipShow, setTipShow] = useState<Boolean>(true);
  useEffect(() => {
    const swapTipStatus = window.localStorage.getItem('swapTipStatus');
    if (swapTipStatus && swapTipStatus == '0') {
      // has closed
      setTipShow(false);
    } else {
      setTipShow(true);
    }
  }, [tipShow]);
  function closeTipBox() {
    setTipShow(false);
    window.localStorage.setItem('swapTipStatus', '0');
  }
  return tipShow ? (
    <div className="flex relative items-center py-3 border border-framBorder rounded-lg mb-6 pl-6 pr-10 bg-cardBg xs:flex-col md:flex-col xs:mb-2.5 md:mb-2.5 xs:pr-6 md:pr-6">
      <div
        className="absolute top-3.5 right-3.5 cursor-pointer"
        onClick={closeTipBox}
      >
        <ModalClose></ModalClose>
      </div>
      <div className="xs:hidden md:hidden mr-4">
        <LightBulb></LightBulb>
      </div>
      <div className="lg:hidden flex items-center mb-2.5">
        <LightBulb></LightBulb>
        <label className="text-sm text-framBorder font-semibold ml-1.5">
          <FormattedMessage id="attention"></FormattedMessage>
        </label>
      </div>
      <div className="text-sm text-white">
        <FormattedMessage id="swap_tip"></FormattedMessage>
        <Setting className="inline-block ml-2.5"></Setting>
      </div>
    </div>
  ) : null;
}

export default function SwapTip({
  bothStableToken,
  tokenInId,
  tokenOutId,
}: {
  bothStableToken: boolean;
  tokenInId: string;
  tokenOutId: string;
}) {
  return bothStableToken ? (
    <ToStableTip
      bothStableToken={bothStableToken}
      tokenInId={tokenInId}
      tokenOutId={tokenOutId}
    />
  ) : null;
}

export function ToStableTip({
  bothStableToken,
  tokenInId,
  tokenOutId,
}: {
  bothStableToken: boolean;
  tokenInId: string;
  tokenOutId: string;
}) {
  useEffect(() => {
    setTipShow(bothStableToken);
  }, [bothStableToken, tokenInId, tokenOutId]);

  const [tipShow, setTipShow] = useState<Boolean>(false);

  const intl = useIntl();

  return tipShow ? (
    <div className="toStableTipAnimation flex relative items-center justify-center py-3 border border-framBorder rounded-lg mb-2 pl-6 pr-10 bg-cardBg xs:flex-col md:flex-col xs:mb-2.5 md:mb-2.5 xs:pr-6 md:pr-6 h-10">
      <div
        className="absolute top-3.5 right-3.5 cursor-pointer"
        onClick={() => setTipShow(false)}
      >
        <ModalClose />
      </div>

      <div className="text-white relative xs:left-7 xs:text-sm lg:left-7 ">
        <span>{intl.formatMessage({ id: 'check_to_stable_banner' })}</span>{' '}
        <Link
          to={{
            pathname: '/sauce',
          }}
          className="underline text-gradientFrom"
        >
          {intl.formatMessage({ id: 'stable_swap' })}
        </Link>{' '}
        <span>{intl.formatMessage({ id: 'rates_to_stable_banner' })}</span>!
      </div>

      <div
        className="z-30 xs:left-0 md:left-5 lg:left-12"
        style={{
          top: '-18px',
          position: 'absolute',
        }}
      >
        <RefGuy />
      </div>
    </div>
  ) : null;
}
