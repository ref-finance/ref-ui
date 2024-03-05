import React from 'react';
import Big from 'big.js';
import { BoneIcon, FireIcon, MoneyIcon, DrumstickIcon } from './icons';
import {
  DragonHead,
  DragonTail,
  DragonBody,
  LonkHead,
  LonkTail,
  LonkBody,
  NekoTail,
  NekoHead,
  NekoBody,
  ShitzuHead,
  ShitzuTail,
  ShitzuBody,
} from './ani_pc';
import {
  DragonHeadMobile,
  DragonTailMobile,
  DragonBodyMobile,
  LonkHeadMobile,
  LonkTailMobile,
  LonkBodyMobile,
  NekoTailMobile,
  NekoHeadMobile,
  NekoBodyMobile,
  ShitzuHeadMobile,
  ShitzuTailMobile,
  ShitzuBodyMobile,
} from './ani_mobile';
import { isMobile } from '../../utils/device';
const is_mobile = isMobile();
const LONK_CONFIG = {
  head: is_mobile ? (
    <LonkHeadMobile className="relative" style={{ top: '-14px' }} />
  ) : (
    <LonkHead className="relative" style={{ top: '-21px' }} />
  ),
  tail: is_mobile ? (
    <LonkTailMobile className="relative" />
  ) : (
    <LonkTail className="relative" />
  ),
  body: (initWidth, addWidth, percent) => {
    const w = Big(initWidth || 0)
      .plus(addWidth || 0)
      .toFixed();
    return (
      <div className="flex justify-center relative">
        <div
          style={{ width: `${w + 'px'}`, top: '-1px' }}
          className="relative overflow-hidden"
        >
          {is_mobile ? <LonkBodyMobile /> : <LonkBody />}
        </div>
        <span className="absolute lg:top-2 xsm:top-1.5 lg:text-xl xsm:text-sm text-white gotham_bold z-10">
          {percent || ''}
        </span>
      </div>
    );
  },
  feedIcon: DrumstickIcon,
};
const NEKO_CONFIG = {
  head: is_mobile ? (
    <NekoHeadMobile className="relative" style={{ top: '-14px' }} />
  ) : (
    <NekoHead className="relative" style={{ top: '-16px' }} />
  ),
  tail: is_mobile ? <NekoTailMobile /> : <NekoTail />,
  body: (initWidth, addWidth, percent) => {
    const w = Big(initWidth || 0)
      .plus(addWidth || 0)
      .toFixed();
    return (
      <div className="flex justify-center relative">
        <div
          style={{ width: `${w + 'px'}`, top: is_mobile ? '7px' : '12px' }}
          className="relative overflow-hidden"
        >
          {is_mobile ? <NekoBodyMobile /> : <NekoBody />}
        </div>
        <span className="absolute lg:top-4 xsm:top-3 lg:text-xl xsm:text-sm text-black gotham_bold z-10">
          {percent || ''}
        </span>
      </div>
    );
  },
  feedIcon: MoneyIcon,
};
const DRAGON_CONFIG = {
  head: is_mobile ? (
    <DragonHeadMobile className="relative" style={{ top: '-21px' }} />
  ) : (
    <DragonHead className="relative" style={{ top: '-36px' }} />
  ),
  tail: is_mobile ? (
    <DragonTailMobile style={{ marginTop: '1px' }} />
  ) : (
    <DragonTail />
  ),
  body: (initWidth, addWidth, percent) => {
    const w = Big(initWidth || 0)
      .plus(addWidth || 0)
      .toFixed();
    return (
      <div className="flex justify-center relative">
        <div
          style={{
            width: `${w + 'px'}`,
            top: is_mobile ? '1px' : '0px',
            marginLeft: is_mobile ? '0' : '-2px',
          }}
          className="relative overflow-hidden"
        >
          {is_mobile ? <DragonBodyMobile /> : <DragonBody />}
        </div>
        <span className="absolute lg:top-1 xsm:top-0.5 lg:text-xl xsm:text-sm xsm:-ml-2 text-white gotham_bold z-10">
          {percent || ''}
        </span>
      </div>
    );
  },
  feedIcon: FireIcon,
};
const SHITZU_CONFIG = {
  head: is_mobile ? (
    <ShitzuHeadMobile className="relative" style={{ top: '-7px' }} />
  ) : (
    <ShitzuHead className="relative" style={{ top: '-16px' }} />
  ),
  tail: is_mobile ? <ShitzuTailMobile /> : <ShitzuTail />,
  body: (initWidth, addWidth, percent) => {
    const w = Big(initWidth || 0)
      .plus(addWidth || 0)
      .toFixed();
    return (
      <div className="flex justify-center relative">
        <div
          style={{ width: `${w + 'px'}`, top: is_mobile ? '13px' : '19px' }}
          className="relative overflow-hidden"
        >
          {is_mobile ? <ShitzuBodyMobile /> : <ShitzuBody />}
        </div>
        <span className="absolute lg:top-6 xsm:top-4 lg:text-xl xsm:text-sm xsm:-ml-4 text-black gotham_bold z-10 transform translate-x-4">
          {percent || ''}
        </span>
      </div>
    );
  },
  feedIcon: BoneIcon,
};
export function getProgressConfig(): any {
  const env: string = process.env.REACT_APP_NEAR_ENV;
  if (env == 'pub-testnet') {
    return {
      progress: {
        'lonk.fakes.testnet': {
          head: LONK_CONFIG.head,
          tail: LONK_CONFIG.tail,
          body: LONK_CONFIG.body,
          translateY: is_mobile ? '90px' : '110px',
          initW: is_mobile ? '0' : '0',
          feedIcon: LONK_CONFIG.feedIcon,
          stakeTip: 'LONK you welth!',
        },
        'neko.fakes.testnet': {
          head: NEKO_CONFIG.head,
          tail: NEKO_CONFIG.tail,
          body: NEKO_CONFIG.body,
          translateY: is_mobile ? '82px' : '100px',
          initW: is_mobile ? '28' : '62',
          feedIcon: NEKO_CONFIG.feedIcon,
          stakeTip: 'Kung Hei Fat Choy!',
        },
        'blackdragon.fakes.testnet': {
          head: DRAGON_CONFIG.head,
          tail: DRAGON_CONFIG.tail,
          body: DRAGON_CONFIG.body,
          translateY: is_mobile ? '95px' : '110px',
          initW: is_mobile ? '6' : '6',
          feedIcon: DRAGON_CONFIG.feedIcon,
          stakeTip: (
            <div className="flex items-center gap-1">
              Let’s fire! <FireIcon className="w-6 h-6" />{' '}
            </div>
          ),
        },
        'shitzu.fakes.testnet': {
          head: SHITZU_CONFIG.head,
          tail: SHITZU_CONFIG.tail,
          body: SHITZU_CONFIG.body,
          translateY: is_mobile ? '75px' : '90px',
          initW: is_mobile ? '28' : '42',
          feedIcon: SHITZU_CONFIG.feedIcon,
          stakeTip: 'Woof-woof!',
        },
      },
    };
  } else if (env == 'testnet') {
    return {
      progress: {
        'lonk.fakes.testnet': {
          head: LONK_CONFIG.head,
          tail: LONK_CONFIG.tail,
          body: LONK_CONFIG.body,
          translateY: is_mobile ? '90px' : '110px',
          initW: is_mobile ? '0' : '0',
          feedIcon: LONK_CONFIG.feedIcon,
          stakeTip: 'LONK you welth!',
        },
        'neko.fakes.testnet': {
          head: NEKO_CONFIG.head,
          tail: NEKO_CONFIG.tail,
          body: NEKO_CONFIG.body,
          translateY: is_mobile ? '82px' : '100px',
          initW: is_mobile ? '28' : '62',
          feedIcon: NEKO_CONFIG.feedIcon,
          stakeTip: 'Kung Hei Fat Choy!',
        },
        'blackdragon.fakes.testnet': {
          head: DRAGON_CONFIG.head,
          tail: DRAGON_CONFIG.tail,
          body: DRAGON_CONFIG.body,
          translateY: is_mobile ? '95px' : '110px',
          initW: is_mobile ? '6' : '6',
          feedIcon: DRAGON_CONFIG.feedIcon,
          stakeTip: (
            <div className="flex items-center gap-1">
              Let’s fire! <FireIcon className="w-6 h-6" />{' '}
            </div>
          ),
        },
        'shitzu.fakes.testnet': {
          head: SHITZU_CONFIG.head,
          tail: SHITZU_CONFIG.tail,
          body: SHITZU_CONFIG.body,
          translateY: is_mobile ? '75px' : '90px',
          initW: is_mobile ? '28' : '42',
          feedIcon: SHITZU_CONFIG.feedIcon,
          stakeTip: 'Woof-woof!',
        },
      },
    };
  } else {
    return {
      progress: {
        'token.lonkingnearbackto2024.near': {
          head: LONK_CONFIG.head,
          tail: LONK_CONFIG.tail,
          body: LONK_CONFIG.body,
          translateY: is_mobile ? '90px' : '110px',
          initW: is_mobile ? '0' : '0',
          feedIcon: LONK_CONFIG.feedIcon,
          stakeTip: 'LONK you welth!',
        },
        'ftv2.nekotoken.near': {
          head: NEKO_CONFIG.head,
          tail: NEKO_CONFIG.tail,
          body: NEKO_CONFIG.body,
          translateY: is_mobile ? '82px' : '100px',
          initW: is_mobile ? '28' : '62',
          feedIcon: NEKO_CONFIG.feedIcon,
          stakeTip: 'Kung Hei Fat Choy!',
        },
        'blackdragon.tkn.near': {
          head: DRAGON_CONFIG.head,
          tail: DRAGON_CONFIG.tail,
          body: DRAGON_CONFIG.body,
          translateY: is_mobile ? '95px' : '110px',
          initW: is_mobile ? '6' : '6',
          feedIcon: DRAGON_CONFIG.feedIcon,
          stakeTip: (
            <div className="flex items-center gap-1">
              Let’s fire! <FireIcon className="w-6 h-6" />{' '}
            </div>
          ),
        },
        'token.0xshitzu.near': {
          head: SHITZU_CONFIG.head,
          tail: SHITZU_CONFIG.tail,
          body: SHITZU_CONFIG.body,
          translateY: is_mobile ? '75px' : '90px',
          initW: is_mobile ? '28' : '42',
          feedIcon: SHITZU_CONFIG.feedIcon,
          stakeTip: 'Woof-woof!',
        },
      },
    };
  }
}
