import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  PriceBoardIcon,
  PriceFloatUpIcon,
  CloseRadiusIcon,
} from 'src/components/icon/Common';
import { getListHistoryTokenPriceByIds } from 'src/services/indexer';
import {
  useWhitelistTokens,
  useGlobalWhitelistTokens,
} from '../../state/token';
import anime from 'animejs';
import { TokenMetadata } from 'src/services/ft-contract';
import { useHistory, useLocation } from 'react-router-dom';
import { toRealSymbol } from 'src/utils/token';
import { toPrecision, formatWithCommas } from 'src/utils/numbers';
export default function Marquee() {
  const [showMarquee, setShowMarquee] = useState(
    localStorage.getItem('marquee') == '0' ? false : true
  );
  const [tokenHistoryList, setTokenHistoryList] = useState<HistoryTokenPrice[]>(
    []
  );
  const [animationObj, setAnimationObj] = useState(null);
  const location = useLocation();
  const COMMON_BASSES = [
    'NEAR',
    'REF',
    'SKYWARD',
    'OCT',
    'STNEAR',
    'ETH',
    'WBTC',
    'WOO',
    'CELO',
    'AURORA',
    'LINEAR',
  ];
  const switchStatus = () => {
    const newStatus = !showMarquee;
    if (newStatus) {
      localStorage.setItem('marquee', '1');
    } else {
      localStorage.setItem('marquee', '0');
    }
    setShowMarquee(!showMarquee);
  };
  // const allTokens = useWhitelistTokens() || [];
  const allTokens = useGlobalWhitelistTokens() || [];
  useEffect(() => {
    if (tokenHistoryList.length > 0 && !animationObj) {
      const length = (tokenHistoryList.length / 2) * 220;
      const xTrans: any = [];
      anime.set('.box', {
        translateX: function (el: any, i: number, l: any) {
          xTrans[i] = {
            x: i * 220,
          };
          return i * 220;
        },
      });
      const animationObj = anime({
        targets: xTrans,
        duration: 30000,
        easing: 'linear',
        x: `-=${length}`,
        loop: true,
        update: function (anim: any) {
          anime.set('.box', {
            translateX: function (el: any, i: number, l: any) {
              return xTrans[i].x % length;
            },
          });
        },
      });
      setAnimationObj(animationObj);
    }
  }, [tokenHistoryList.length]);
  useEffect(() => {
    let intervalId: any;
    if (allTokens.length > 0) {
      getHistoryList();
      intervalId = setInterval(() => {
        getHistoryList();
      }, 300000);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [allTokens.length]);
  async function getHistoryList() {
    const commonBassesTokens = allTokens.filter((item) => {
      return COMMON_BASSES.indexOf(item?.symbol) > -1;
    });
    const tokenIds: string[] = [];
    commonBassesTokens.forEach((token: TokenMetadata) => {
      tokenIds.push(token.id);
    });
    const result: HistoryTokenPrice[] = await getListHistoryTokenPriceByIds(
      tokenIds.join('|')
    );
    setTokenHistoryList(result.concat(result));
  }
  if (tokenHistoryList.length == 0) return null;
  const hiddenRouters = [
    '/risks',
    '/portfolio',
    '/orderbook',
    '/orderbook/perps',
    '/orderbook/spot',

    '/burrow',
    '/overview',
    '/orderly',
  ];
  return (
    <div
      className={`transform relative z-10 h-8 xs:-mt-6 md:-mt-6 xs:mb-6 md:mb-6 ${
        hiddenRouters.indexOf(location.pathname) > -1 ? 'hidden' : ''
      }`}
    >
      <div
        onClick={switchStatus}
        className={`flex items-center absolute right-0 w-28 xs:w-auto md:w-auto h-8 bg-priceBoardColor rounded-l-full px-1.5 cursor-pointer text-primaryText hover:text-greenColor z-10`}
      >
        <span className="flex items-center justify-center w-6 h-6 bg-black bg-opacity-30 rounded-full flex-shrink-0">
          {showMarquee ? (
            <CloseRadiusIcon></CloseRadiusIcon>
          ) : (
            <PriceBoardIcon></PriceBoardIcon>
          )}
        </span>
        <label className="text-xs ml-1.5 cursor-pointer xs:hidden md:hidden">
          {showMarquee ? (
            <FormattedMessage id="close"></FormattedMessage>
          ) : (
            <FormattedMessage id="price_board"></FormattedMessage>
          )}
        </label>
      </div>
      {
        <div
          className={`mr-20 xs:mr-6 md:mr-6 bg-cardBg h-8 guidAnimation ${
            showMarquee ? '' : 'hidden'
          }`}
        >
          <div className="h-8 relative overflow-hidden">
            <div
              className={`flex items-center h-8 relative`}
              onMouseOver={() => {
                animationObj.pause();
              }}
              onMouseOut={() => {
                animationObj.play();
              }}
            >
              {tokenHistoryList.map((item: HistoryTokenPrice, index) => {
                return (
                  <div
                    key={index}
                    style={{ paddingLeft: '10px', paddingRight: '10px' }}
                    className="box absolute"
                  >
                    <div
                      style={{ width: '220px' }}
                      className={`flex items-center justify-center text-white rounded-md py-1 hover:bg-black hover:bg-opacity-20`}
                    >
                      <label className="text-sm text-white font-semibold">
                        {toRealSymbol(
                          item.symbol == 'near' ? 'NEAR' : item.symbol
                        )}
                      </label>
                      <label className="text-sm text-white mx-2.5">
                        $
                        {item?.price?.toString()
                          ? formatWithCommas(
                              toPrecision(
                                item.price.toString(),
                                3,
                                false,
                                false
                              )
                            )
                          : '-'}
                      </label>
                      {}
                      {Number(item.float_ratio) >= 0 ? (
                        <span
                          className={`flex items-center text-xs text-lightGreenColor_p ${
                            Number(item.float_ratio) == 1 ? 'hidden' : ''
                          }`}
                        >
                          <label
                            className={`mr-0.5 ${
                              Number(item.float_ratio) == 0
                                ? 'text-primaryText'
                                : ''
                            }`}
                          >
                            {item.float_ratio}%
                          </label>
                          <div
                            className={
                              Number(item.float_ratio) == 0 ? 'hidden' : ''
                            }
                          >
                            <PriceFloatUpIcon></PriceFloatUpIcon>
                          </div>
                        </span>
                      ) : (
                        <span className="flex items-center text-xs text-lightRedColor">
                          <label className="mr-0.5">{item.float_ratio}%</label>
                          <div className="transform rotate-90">
                            <PriceFloatUpIcon></PriceFloatUpIcon>
                          </div>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      }
    </div>
  );
}

interface HistoryTokenPrice {
  contract_address: string;
  create_time: string;
  decimal: number;
  float_ratio: string;
  price: number;
  symbol: string;
}
