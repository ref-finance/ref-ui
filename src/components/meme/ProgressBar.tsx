import React, { useContext, useMemo } from 'react';
import Big from 'big.js';
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
  BoneIcon,
  FireIcon,
  MoneyIcon,
  DrumstickIcon,
  FeedMe,
} from './icons';
import { MemeContext } from './context';
import { formatPercentage } from '../../utils/uiNumber';

const ProgressBar = () => {
  const config = getProgressConfig();
  const { seeds } = useContext(MemeContext);
  const totalTvl = useMemo(() => {
    const totalTvl = Object.entries(seeds)
      .reduce((acc, [seed_id, seed]) => {
        return acc.plus(seed.seedTvl || 0);
      }, Big(0))
      .toFixed();
    return totalTvl;
  }, [seeds]);
  return (
    <div className="text-white" style={{ marginTop: '80px' }}>
      <div className="flex items-center justify-center">
        <span className="text-3xl gotham_bold text-white">
          MEME Gauge Weight
        </span>
      </div>
      {/* Race */}
      {Object.entries(seeds).map(([seed_id, seed]) => {
        let addW = '0';
        let percent = '';
        const seedTvl = seed.seedTvl;
        if (Big(seedTvl).gt(0) && Big(totalTvl).gt(0)) {
          const p = Big(seedTvl).div(totalTvl);
          addW = p.mul(800).toFixed();
          percent = formatPercentage(p.mul(100).toFixed());
        }
        const FeedIcon = config.progress[seed_id].feedIcon;
        return (
          <RaceTemplate key={seed_id}>
            <div
              className="flex"
              style={{
                transform: `translateY(${config.progress[seed_id].translateY})`,
              }}
            >
              <div>{config.progress[seed_id].tail}</div>
              <div className="relative z-10" style={{ marginLeft: '-1px' }}>
                {config.progress[seed_id].body(
                  config.progress[seed_id].initW,
                  addW,
                  percent
                )}
              </div>
              <div style={{ marginLeft: '-1px' }}>
                {config.progress[seed_id].head}
              </div>
              <div className="relative transform -translate-y-10 ml-1.5">
                <FeedIcon className="w-8 h-8 absolute -top-4 left-4" />
                <FeedMe />
              </div>
            </div>
          </RaceTemplate>
        );
      })}
    </div>
  );
};

function RaceTemplate({ children }: any) {
  return (
    <div
      className="border-b border-greenLight border-opacity-10"
      style={{ height: '166px' }}
    >
      {children}
    </div>
  );
}

const LONK_CONFIG = {
  head: <LonkHead className="relative" style={{ top: '-21px' }} />,
  tail: <LonkTail className="relative" />,
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
          <LonkBody />
        </div>
        <span className="absolute top-2 text-xl text-white gotham_bold z-10">
          {percent || ''}
        </span>
      </div>
    );
  },
  feedIcon: DrumstickIcon,
};
const NEKO_CONFIG = {
  head: <NekoHead className="relative" style={{ top: '-16px' }} />,
  tail: <NekoTail />,
  body: (initWidth, addWidth, percent) => {
    const w = Big(initWidth || 0)
      .plus(addWidth || 0)
      .toFixed();
    return (
      <div className="flex justify-center relative">
        <div
          style={{ width: `${w + 'px'}`, top: '12px' }}
          className="relative overflow-hidden"
        >
          <NekoBody />
        </div>
        <span className="absolute top-4 text-xl text-black gotham_bold z-10">
          {percent || ''}
        </span>
      </div>
    );
  },
  feedIcon: MoneyIcon,
};
const DRAGON_CONFIG = {
  head: <DragonHead className="relative" style={{ top: '-51px' }} />,
  tail: <DragonTail />,
  body: (initWidth, addWidth, percent) => {
    const w = Big(initWidth || 0)
      .plus(addWidth || 0)
      .toFixed();
    return (
      <div className="flex justify-center relative">
        <div
          style={{ width: `${w + 'px'}`, top: '0px' }}
          className="relative overflow-hidden"
        >
          <DragonBody />
        </div>
        <span className="absolute top-2 text-xl text-white gotham_bold z-10">
          {percent || ''}
        </span>
      </div>
    );
  },
  feedIcon: FireIcon,
};
const SHITZU_CONFIG = {
  head: <ShitzuHead className="relative" style={{ top: '-16px' }} />,
  tail: <ShitzuTail />,
  body: (initWidth, addWidth, percent) => {
    const w = Big(initWidth || 0)
      .plus(addWidth || 0)
      .toFixed();
    return (
      <div className="flex justify-center relative">
        <div
          style={{ width: `${w + 'px'}`, top: '19px' }}
          className="relative overflow-hidden"
        >
          <ShitzuBody />
        </div>
        <span className="absolute top-6 text-xl text-black gotham_bold z-10 transform translate-x-4">
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
          translateY: '110px',
          initW: '40',
          feedIcon: LONK_CONFIG.feedIcon,
          stakeTip: 'LONK you welth!',
        },
        'neko.fakes.testnet': {
          head: NEKO_CONFIG.head,
          tail: NEKO_CONFIG.tail,
          body: NEKO_CONFIG.body,
          translateY: '100px',
          initW: '90',
          feedIcon: NEKO_CONFIG.feedIcon,
          stakeTip: 'Kung Hei Fat Choy!',
        },
        'blackdragon.fakes.testnet': {
          head: DRAGON_CONFIG.head,
          tail: DRAGON_CONFIG.tail,
          body: DRAGON_CONFIG.body,
          translateY: '110px',
          initW: '0',
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
          translateY: '90px',
          initW: '60',
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
          translateY: '110px',
          initW: '40',
          feedIcon: LONK_CONFIG.feedIcon,
          stakeTip: 'LONK you welth!',
        },
        'neko.fakes.testnet': {
          head: NEKO_CONFIG.head,
          tail: NEKO_CONFIG.tail,
          body: NEKO_CONFIG.body,
          translateY: '100px',
          initW: '90',
          feedIcon: NEKO_CONFIG.feedIcon,
          stakeTip: 'Kung Hei Fat Choy!',
        },
        'blackdragon.fakes.testnet': {
          head: DRAGON_CONFIG.head,
          tail: DRAGON_CONFIG.tail,
          body: DRAGON_CONFIG.body,
          translateY: '110px',
          initW: '0',
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
          translateY: '90px',
          initW: '60',
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
          translateY: '110px',
          initW: '40',
          feedIcon: LONK_CONFIG.feedIcon,
          stakeTip: 'LONK you welth!',
        },
        'ftv2.nekotoken.near': {
          head: NEKO_CONFIG.head,
          tail: NEKO_CONFIG.tail,
          body: NEKO_CONFIG.body,
          translateY: '100px',
          initW: '90',
          feedIcon: NEKO_CONFIG.feedIcon,
          stakeTip: 'Kung Hei Fat Choy!',
        },
        'blackdragon.tkn.near': {
          head: DRAGON_CONFIG.head,
          tail: DRAGON_CONFIG.tail,
          body: DRAGON_CONFIG.body,
          translateY: '110px',
          initW: '0',
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
          translateY: '90px',
          initW: '60',
          feedIcon: SHITZU_CONFIG.feedIcon,
          stakeTip: 'Woof-woof!',
        },
      },
    };
  }
}
export default ProgressBar;
