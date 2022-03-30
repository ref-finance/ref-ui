import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { TipBox, RefSetPeople, ViGuide } from '../../components/icon/Common';
import { ModalClose } from '../../components/icon/ModalClose';
import { isMobile } from '../../utils/device';
import { IconVi } from '../../components/icon/Nav';

export function Guide(props: any) {
  const { bothStableToken } = props;
  const [closeStatus, setCloseStatus] = useState(true);
  const [closeStatusSet, setCloseStatusSet] = useState(true);
  useEffect(() => {
    const viGuideShow = localStorage.getItem('viGuideShow');
    const guideSetShow = localStorage.getItem('guideSetShow');
    if (viGuideShow == '1') {
      setCloseStatus(true);
    } else {
      setCloseStatus(false);
    }
    if (guideSetShow != '1' && viGuideShow == '1' && !bothStableToken) {
      setCloseStatusSet(false);
    } else {
      setCloseStatusSet(true);
    }
  }, [bothStableToken]);
  const closePop = (e: any) => {
    const guideSetShow = localStorage.getItem('guideSetShow');
    localStorage.setItem('viGuideShow', '1');
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
        <>
          {mobile ? (
            <div className="flex justify-end mr-4 -mt-8 h-24">
              <div className="relative">
                <ViGuide></ViGuide>
                <ModalClose
                  onClick={closePop}
                  width="8"
                  height="8"
                  className="absolute right-4 top-7 cursor-pointer"
                ></ModalClose>
                <div className="flex flex-col absolute left-16 top-6 pl-1">
                  <span className="text-white text-sm">
                    <FormattedMessage id="vi_go_live"></FormattedMessage>
                  </span>
                  <span className="flex items-center text-greenColor text-sm mt-2">
                    <FormattedMessage id="language"></FormattedMessage>
                    &nbsp;{'->'}&nbsp;
                    <IconVi />
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="fixed right-11 top-20 z-20">
              <ViGuide></ViGuide>
              <ModalClose
                onClick={closePop}
                width="8"
                height="8"
                className="absolute right-4 top-7 cursor-pointer"
              ></ModalClose>
              <div className="flex flex-col absolute left-16 top-6 pl-1">
                <span className="text-white text-sm">
                  <FormattedMessage id="vi_go_live"></FormattedMessage>
                </span>
                <span className="flex items-center text-greenColor text-sm mt-2">
                  <FormattedMessage id="language"></FormattedMessage>
                  &nbsp;{'->'}&nbsp;
                  <IconVi />
                </span>
              </div>
            </div>
          )}
        </>
      ) : null}
      {/* {!closeStatusSet ? (
        <>
          {mobile ? (
            <div className="flex w-full justify-between items-end relative h-24 -mt-8">
              <div className="relative mb-5">
                <TipBox></TipBox>
                <ModalClose
                  onClick={closeSetPop}
                  width="8"
                  height="8"
                  className="absolute right-5 top-3 cursor-pointer"
                ></ModalClose>
                <span className="absolute top-2 left-2.5 w-54 text-sm text-white">
                  <FormattedMessage id="check_the_transaction_settings" />
                </span>
                <div
                  onClick={closeSetPop}
                  className="cursor-pointer absolute bottom-2 right-10 border border-greenColor rounded-3xl text-xs text-greenColor px-5 py-0.5"
                >
                  <FormattedMessage id="got_it" />
                </div>
              </div>
              <div className="-mb-6">
                <RefSetPeople></RefSetPeople>
              </div>
            </div>
          ) : (
            <div className="absolute right-2 -top-12 z-50">
              <div className="absolute right-20 -top-10">
                <TipBox></TipBox>
                <ModalClose
                  onClick={closeSetPop}
                  width="8"
                  height="8"
                  className="absolute right-5 top-3 cursor-pointer"
                ></ModalClose>
                <span className="absolute top-2 left-2.5 w-54 text-sm text-white">
                  <FormattedMessage id="check_the_transaction_settings" />
                </span>
                <div
                  onClick={closeSetPop}
                  className="cursor-pointer absolute bottom-2 right-10 border border-greenColor rounded-3xl text-xs text-greenColor px-5 py-0.5"
                >
                  <FormattedMessage id="got_it" />
                </div>
              </div>
              <div className="xs:ml-3 md:ml-3">
                <RefSetPeople></RefSetPeople>
              </div>
            </div>
          )}
        </>
      ) : null} */}
    </>
  );
}
