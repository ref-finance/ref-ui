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
} from '~components/icon/Xref';
import { ModalCloseAuto } from '~components/icon';
import { isMobile } from '~utils/device';

export default function PopUp() {
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
