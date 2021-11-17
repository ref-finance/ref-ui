import React from 'react';
import { LightBulb, Setting } from '~components/icon/Near';
import { ModalClose } from '~components/icon';
import { FormattedMessage } from 'react-intl';
import { useState, useEffect } from 'react';

export default function SwapTip() {
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
