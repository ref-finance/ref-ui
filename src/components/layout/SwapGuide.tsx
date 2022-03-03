import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  NearIconDirectly,
  SwitchIcon,
  LiquidityIcon,
  SureIcon,
} from '~components/icon/Common';
import { isMobile } from '~utils/device';
import Modal from 'react-modal';

export default function SwapGuide() {
  const [closeStatus, setCloseStatus] = useState(true);

  useEffect(() => {
    const directlyGuidance = localStorage.getItem('directly-guidance');
    if (directlyGuidance == '1') {
      setCloseStatus(true);
    } else {
      setCloseStatus(false);
    }
  }, []);
  const closePop = (e: any) => {
    localStorage.setItem('directly-guidance', '1');
    e.stopPropagation();
    setCloseStatus(true);
  };
  const mobile = isMobile();
  return (
    <Modal
      isOpen={!closeStatus}
      // onRequestClose={closePop}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        },
        content: {
          outline: 'none',
          transform: `${
            mobile ? 'translate(-50%, -50%)' : 'translate(-50%, -70%)'
          }`,
        },
      }}
    >
      <div
        className={`flex flex-col justify-center`}
        style={{ width: mobile ? '90vw' : '' }}
      >
        <div
          className="flex justify-center"
          style={{ zoom: mobile ? '0.8' : '1' }}
        >
          {/* <NearIconDirectly></NearIconDirectly> */}
          <span>
            <img
              style={{ width: '110px' }}
              src="https://i.postimg.cc/TwrN5Jv1/directly-near.png"
            ></img>
          </span>
        </div>
        <p className="flex justify-center text-xl text-white font-bold text-center mt-10 mb-6 xs:text-base md:text-base">
          <FormattedMessage id="do_not_need_to_deposit_in_ref"></FormattedMessage>
        </p>
        <p className="text-white text-base text-center xs:text-sm md:text-sm">
          <FormattedMessage id="you_can_add_liquidity_directly"></FormattedMessage>
        </p>
        {/* <p className="text-white text-base text-center mt-1 xs:text-sm md:text-sm">
          <FormattedMessage id="do_not_need_deposit_anymore"></FormattedMessage>
        </p> */}
        <div className="flex items-center text-xl text-white font-bold mt-10 xs:text-base md:text-base">
          <span
            className="flex-shrink-0"
            style={{ zoom: mobile ? '0.8' : '1' }}
          >
            {/* <SwitchIcon></SwitchIcon> */}
            <span>
              <img
                style={{ width: '59px' }}
                src="https://i.postimg.cc/J0xTP7nW/directly-two-cricle.png"
              ></img>
            </span>
          </span>
          <span className="mx-7">
            <FormattedMessage id="lightning_swaps"></FormattedMessage>
          </span>
          <span
            className="flex-shrink-0"
            style={{ zoom: mobile ? '0.8' : '1' }}
          >
            <SureIcon></SureIcon>
          </span>
        </div>
        <div className="flex items-center text-xl text-white font-bold mt-10 xs:text-base md:text-base">
          <span
            className="flex-shrink-0"
            style={{ zoom: mobile ? '0.8' : '1' }}
          >
            {/* <LiquidityIcon></LiquidityIcon> */}
            <span>
              <img
                style={{ width: '59px' }}
                src="https://i.postimg.cc/KjxqP3mN/directly-one-cricle.png"
              ></img>
            </span>
          </span>
          <span className="mx-7">
            <FormattedMessage id="frictionless_add_remove_liquidity"></FormattedMessage>
          </span>
          <span
            className="flex-shrink-0"
            style={{ zoom: mobile ? '0.8' : '1' }}
          >
            <SureIcon></SureIcon>
          </span>
        </div>
        <div className="flex justify-center items-center mt-4 xs:mt-8 md:mt-8">
          <span
            onClick={closePop}
            className="flex justify-center items-center bg-greenColor rounded-3xl text-sm text-black cursor-pointer px-8 py-1.5"
          >
            <FormattedMessage id="got_it"></FormattedMessage> !
          </span>
        </div>
      </div>
    </Modal>
  );
}
