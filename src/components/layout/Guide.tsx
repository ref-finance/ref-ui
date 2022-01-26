import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import {
  RefGuideIcon,
  TipBox,
  TipBoxBig,
  RefSetPeople,
} from '~components/icon/Common';
import { ModalClose } from '~components/icon/ModalClose';
import { isMobile } from '~utils/device';

export function Guide(props: any) {
  const { bothStableToken } = props;
  const [closeStatus, setCloseStatus] = useState(true);
  const [closeStatusSet, setCloseStatusSet] = useState(true);
  useEffect(() => {
    const guideShow = localStorage.getItem('guideShow');
    const guideSetShow = localStorage.getItem('guideSetShow');
    if (guideShow == '1') {
      setCloseStatus(true);
    } else {
      setCloseStatus(false);
    }
    if (guideSetShow != '1' && guideShow == '1' && !bothStableToken) {
      setCloseStatusSet(false);
    } else {
      setCloseStatusSet(true);
    }
  }, [bothStableToken]);
  const closePop = (e: any) => {
    const guideSetShow = localStorage.getItem('guideSetShow');
    localStorage.setItem('guideShow', '1');
    e.stopPropagation();
    if (guideSetShow != '1' && !bothStableToken) {
      setCloseStatusSet(false);
    }
    setCloseStatus(true);
  };
  const closeSetPop = (e: any) => {
    localStorage.setItem('guideSetShow', '1');
    e.stopPropagation();
    setCloseStatusSet(true);
  };
  const mobile = isMobile();
  return (
    <>
      {!closeStatus ? (
        <div className="fixed right-20 top-20 z-10 xs:-mt-6 md:-mt-6 xs:relative md:relative xs:right-2 md:right-2 xs:-top-2 md:-top-2 xs:h-28 md:h-28 xs:overflow-hidden md:overflow-hidden">
          <div className="absolute right-20 top-5">
            <TipBoxBig></TipBoxBig>
            <ModalClose
              onClick={closePop}
              width="8"
              height="8"
              className="absolute right-5 top-3 cursor-pointer"
            ></ModalClose>
            <span className="absolute top-2.5 left-2.5 w-54 text-sm text-white">
              Go to your account to{' '}
              <label className="text-greenColor">deposit</label> &{' '}
              <label className="text-greenColor">withdraw</label>
            </span>
            <div
              onClick={closePop}
              className="cursor-pointer absolute bottom-2.5 right-12 border border-greenColor rounded-3xl text-xs text-greenColor px-5 py-0.5"
            >
              Got it
            </div>
          </div>
          <div className="xs:float-right md:float-right">
            {' '}
            <RefGuideIcon></RefGuideIcon>
          </div>
        </div>
      ) : null}
      {!closeStatusSet ? (
        <div className="absolute right-20 -top-12 z-50 xs:z-0 md:z-0 xs:-mt-6 md:-mt-6 xs:flex md:flex xs:justify-end md:justify-end xs:items-end md:items-end xs:right-2 md:right-2 xs:top-0 md:top-0 xs:relative md:relative xs:h-28 md:h-28">
          <div className="absolute right-20 -top-10 xs:relative md:relative xs:right-0 md:right-0 xs:-top-5 md:top-top-5">
            <TipBox></TipBox>
            <ModalClose
              onClick={closeSetPop}
              width="8"
              height="8"
              className="absolute right-5 top-3 cursor-pointer"
            ></ModalClose>
            <span className="absolute top-2 left-2.5 w-54 text-sm text-white">
              Check the transaction settings
            </span>
            <div
              onClick={closeSetPop}
              className="cursor-pointer absolute bottom-2 right-10 border border-greenColor rounded-3xl text-xs text-greenColor px-5 py-0.5"
            >
              Got it
            </div>
          </div>
          <div className="xs:ml-3 md:ml-3">
            <RefSetPeople></RefSetPeople>
          </div>
        </div>
      ) : null}
    </>
  );
}
export function GuideMobile(props: any) {
  const { close } = props;
  const [closeStatus, setCloseStatus] = useState(true);
  const history = useHistory();
  useEffect(() => {
    const guideShow = localStorage.getItem('guideShow');
    if (guideShow == '1' || close) {
      localStorage.setItem('guideShow', '1');
      setCloseStatus(true);
    } else {
      setCloseStatus(false);
      setTimeout(() => {
        document.body.style.overflow = 'hidden';
      }, 500);
    }
  }, [close]);
  const closePop = (e: any) => {
    localStorage.setItem('guideShow', '1');
    e.stopPropagation();
    setCloseStatus(true);
    document.body.style.overflow = 'auto';
  };
  return (
    <>
      {closeStatus ? null : (
        <div
          className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-30 z-50"
          style={{
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            top: '4rem',
          }}
        >
          <div className="absolute top-2 right-20">
            <RefGuideIcon></RefGuideIcon>
            {/* <CloseBtn
              onClick={closePop}
              boxColor="#1D2932"
              closeColor="rgba(255,255,255,0.5)"
              hoverCloseColor="white"
              hoverBoxColor="rgba(255,255,255,0.3)"
              className="absolute -right-8 top-3 cursor-pointer hover:text-white"
            ></CloseBtn> */}
            <span className="absolute -left-40 top-8 w-40 text-sm text-white">
              Go to your account to{' '}
              <label className="text-greenColor">deposit</label> &{' '}
              <label className="text-greenColor">withdraw</label>
            </span>
          </div>
        </div>
      )}
    </>
  );
}
