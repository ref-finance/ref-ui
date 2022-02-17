import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import {
  Learn_more,
  CloseBtn,
  Learn_more_m,
  CloseBtn_white,
} from '~components/icon/Common';
import {
  PopupBox1,
  PopupBox2,
  PopupBox3,
  PopupBox4,
  PopupText,
  PopupBox1Mobile,
} from '~components/icon/Xref';
import { IncentivePopup, LoveIcon, CloseButton } from '~components/icon/Farm';
import { ModalCloseAuto } from '~components/icon';
import { isMobile } from '~utils/device';

export default function PopUp() {
  const [closeStatus, setCloseStatus] = useState(true);
  const history = useHistory();
  useEffect(() => {
    const farmIncentive = localStorage.getItem('farm-incentive-popup');
    if (farmIncentive == '1') {
      setCloseStatus(true);
    } else {
      setCloseStatus(false);
    }
  }, []);
  const closePop = (e: any) => {
    localStorage.setItem('farm-incentive-popup', '1');
    e.stopPropagation();
    setCloseStatus(true);
  };
  const gotoPage = () => {
    history.push('/farms');
  };
  const mobile = isMobile();
  return (
    <>
      {closeStatus ? null : (
        <div
          onClick={gotoPage}
          className={`fixed xs:left-1/2 xs:transform xs:-translate-x-1/2 md:left-1/2 md:transform md:-translate-x-1/2 z-50 lg:right-8 cursor-pointer ${
            mobile ? 'farmPopupBoxMobile' : 'farmPopupBox'
          } }`}
        >
          <IncentivePopup></IncentivePopup>
          <LoveIcon className="absolute left-10 -top-3"></LoveIcon>
          <CloseButton
            onClick={closePop}
            className="absolute top-0 right-0 cursor-pointer"
          ></CloseButton>
          <label className="absolute gold top-11 right-4"></label>
        </div>
      )}
    </>
  );
}
export function PopUp_xREF() {
  const [closeStatus, setCloseStatus] = useState(true);
  const history = useHistory();
  useEffect(() => {
    const popupXrefShow = localStorage.getItem('popupXrefShow');
    if (popupXrefShow == '1') {
      setCloseStatus(true);
    } else {
      setCloseStatus(false);
    }
  }, []);
  const closePop = (e: any) => {
    localStorage.setItem('popupXrefShow', '1');
    e.stopPropagation();
    setCloseStatus(true);
  };
  const gotoPage = () => {
    history.push('/xref');
  };
  return (
    <>
      {closeStatus ? null : (
        <>
          {isMobile() ? (
            <div
              className="lg:hidden fixed popupBox0Mobile flex flex-col items-center bottom-0 z-20 left-1/2 transform -translate-x-2/4"
              onClick={gotoPage}
            >
              <PopupBox4
                style={{ zoom: 0.7 }}
                className="absolute z-20 popupBox3Mobile"
              ></PopupBox4>
              <PopupBox3
                style={{ zoom: 0.7 }}
                className="absolute z-10 popupBox2Mobile"
              ></PopupBox3>
              <PopupBox2
                style={{ zoom: 0.7 }}
                className="absolute popupBox1Mobile"
              ></PopupBox2>
              <PopupText className="absolute bottom-12 cursor-pointer"></PopupText>
              <span className="text-white text-xs absolute bottom-10">
                <FormattedMessage id="stake_ref_to_xref_for_earning_more"></FormattedMessage>
              </span>
              <PopupBox1Mobile></PopupBox1Mobile>
              <ModalCloseAuto
                onClick={closePop}
                width="10"
                height="10"
                className="absolute text-primaryText top-6 right-6 cursor-pointer hover:text-white"
              ></ModalCloseAuto>
            </div>
          ) : (
            <div
              className="xs:hidden md:hidden fixed popupBox0 flex flex-col items-center right-6 z-50 cursor-pointer"
              onClick={gotoPage}
            >
              <PopupBox4 className="absolute z-20 popupBox3 cursor-pointer"></PopupBox4>
              <PopupBox3 className="absolute z-10 popupBox2 cursor-pointer"></PopupBox3>
              <PopupBox2 className="absolute popupBox1 cursor-pointer"></PopupBox2>
              <PopupText className="absolute bottom-20 cursor-pointer"></PopupText>
              <span className="text-white text-xs absolute bottom-16">
                <FormattedMessage id="stake_ref_to_xref_for_earning_more"></FormattedMessage>
              </span>
              <PopupBox1></PopupBox1>
              <ModalCloseAuto
                onClick={closePop}
                width="10"
                height="10"
                className="absolute text-primaryText top-6 right-6 cursor-pointer hover:text-white"
              ></ModalCloseAuto>
            </div>
          )}
        </>
      )}
    </>
  );
}
export function PopUp_stable() {
  const [closeStatus, setCloseStatus] = useState(true);
  const linkUrl =
    'https://ref-finance.medium.com/introducing-sauce-stableswap-feature-on-ref-6bcfb8342cba';
  const history = useHistory();
  useEffect(() => {
    const popupShow = localStorage.getItem('popupShow');
    if (popupShow == '1') {
      setCloseStatus(true);
    } else {
      setCloseStatus(false);
    }
  }, []);
  const closePop = (e: any) => {
    localStorage.setItem('popupShow', '1');
    e.stopPropagation();
    setCloseStatus(true);
  };
  const goStableSwap = () => {
    // history.push('/stableswap');
    window.open(linkUrl);
  };
  const goLearnMore = (e: any) => {
    e.stopPropagation();
    window.open(linkUrl);
  };
  return (
    <>
      {closeStatus ? null : (
        <>
          <div
            className="popUpPc fixed right-0 bottom-1 z-50 xs:hidden md:hidden cursor-pointer"
            onClick={goStableSwap}
          >
            <a
              className="absolute bottom-9 left-9 cursor-pointer"
              onClick={goLearnMore}
            >
              <Learn_more></Learn_more>
            </a>
            <div
              className="absolute top-14 right-5 cursor-pointer"
              onClick={closePop}
            >
              <CloseBtn></CloseBtn>
            </div>
          </div>
          <div
            className="fixed bottom-0 popUpMobile flex items-center justify-center z-50 lg:hidden"
            onClick={goStableSwap}
          >
            <a
              onClick={goLearnMore}
              className="cursor-pointer absolute bottom-1"
            >
              <Learn_more_m></Learn_more_m>
            </a>
            <div
              className="absolute top-11 right-5 cursor-pointer"
              onClick={closePop}
            >
              <CloseBtn_white></CloseBtn_white>
            </div>
          </div>
        </>
      )}
    </>
  );
}
