import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { RefGuideIcon, GroundShadow, CloseBtn } from '~components/icon/Common';
import { isMobile } from '~utils/device';

export function Guide() {
  const [closeStatus, setCloseStatus] = useState(true);
  const history = useHistory();
  useEffect(() => {
    const guideShow = localStorage.getItem('guideShow');
    if (guideShow == '1') {
      setCloseStatus(true);
    } else {
      setCloseStatus(false);
    }
  }, []);
  const closePop = (e: any) => {
    localStorage.setItem('guideShow', '1');
    e.stopPropagation();
    setCloseStatus(true);
  };
  const mobile = isMobile();
  return (
    <>
      {!closeStatus && !mobile ? (
        <div className="xs:hidden md:hidden absolute right-8 top-16 z-10 guidAnimation">
          <RefGuideIcon></RefGuideIcon>
          <GroundShadow className="absolute -right-7 -bottom-5"></GroundShadow>
          <CloseBtn
            onClick={closePop}
            boxColor="#1D2932"
            closeColor="rgba(255,255,255,0.5)"
            hoverCloseColor="white"
            hoverBoxColor="rgba(255,255,255,0.3)"
            className="absolute -right-8 top-3 cursor-pointer hover:text-white"
          ></CloseBtn>
          <span className="absolute -left-40 top-8 w-40 text-sm text-white">
            Go to your account to{' '}
            <label className="text-greenColor">deposit</label> &{' '}
            <label className="text-greenColor">withdraw</label>
          </span>
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
            <GroundShadow className="absolute -right-7 -bottom-5"></GroundShadow>
            <CloseBtn
              onClick={closePop}
              boxColor="#1D2932"
              closeColor="rgba(255,255,255,0.5)"
              hoverCloseColor="white"
              hoverBoxColor="rgba(255,255,255,0.3)"
              className="absolute -right-8 top-3 cursor-pointer hover:text-white"
            ></CloseBtn>
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
