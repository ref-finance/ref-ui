import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Learn_more,
  CloseBtn,
  Learn_more_m,
  CloseBtn_white,
} from '~components/icon/Common';

export default function PopUp() {
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
    history.push('/stableswap');
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
