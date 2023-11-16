import Big from 'big.js';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import useCallback from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from 'react-modal';
import { useHistory } from 'react-router-dom';

import {
  IoArrowDownOutline,
  IoArrowUpOutline,
  IoCloseSharp,
  IoMdArrowDropdown,
} from '../../../../components/reactIcons';
import { isNewHostName } from '../../../../services/config';
import { useClientMobile } from '../../../../utils/device';
import { getFTmetadata, nearMetadata, toPrecision } from '../../near';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { OpenInterest, Ticker, TokenInfo } from '../../orderly/type';
import {
  digitWrapper,
  numberWithCommas,
  numberWithCommasPadding,
  PerpOrSpot,
} from '../../utiles';
import { TokenIcon } from '../Common';
import { AllMarketIcon, CheckSelector } from '../Common/Icons';
import { parseSymbol } from '../RecentTrade';
import { TextWrapper } from '../UserBoard';
import { tickToPrecision } from '../UserBoardPerp/math';
import { MoreRouterButton } from './components/MoreRouterButton';
import { useTokenMetaFromSymbol } from './state';

export function tickerToDisplayDiff(ticker: Ticker | undefined) {
  const diff = ticker ? ((ticker.close - ticker.open) * 100) / ticker.open : 0;

  const disPlayDiff =
    Math.abs(diff) < 0.01 && Math.abs(diff) > 0
      ? '<0.01'
      : Math.abs(diff).toFixed(2);

  return { diff, disPlayDiff };
}

function TickerDisplayComponent({
  ticker,
  showBg,
}: {
  ticker: Ticker;
  showBg?: boolean;
}) {
  const { disPlayDiff, diff } = tickerToDisplayDiff(ticker);

  return (
    <span
      className={`${
        diff < 0 ? 'text-sellRed ' : diff > 0 ? 'text-buyGreen ' : 'text-white'
      }  text-xs flex items-center  rounded-md ml-2  py-0.5`}
    >
      {' '}
      <span className="relative ">
        {diff > 0 ? (
          <IoArrowUpOutline />
        ) : diff < 0 ? (
          <IoArrowDownOutline />
        ) : null}
      </span>
      <span>{disPlayDiff}%</span>
    </span>
  );
}

function SymbolLine({
  ticker,
  tokenInfo,
  setSymbol,
}: {
  ticker: Ticker;
  tokenInfo: TokenInfo[];
  setSymbol: (symbol: string) => void;
}) {
  const { symbolFrom, symbolTo } = parseSymbol(ticker.symbol);
  const tokenIn = useTokenMetaFromSymbol(symbolFrom, tokenInfo);

  const { symbol } = useOrderlyContext();

  return (
    <div
      className={`px-1.5 text-sm ${
        ticker.symbol === symbol ? 'bg-symbolHover2' : ''
      } text-white rounded-lg hover:bg-symbolHover2 py-2 gap-6 flex items-center `}
      onClick={() => {
        setSymbol(ticker.symbol);
      }}
    >
      <div className="flex items-center">
        <TokenIcon src={tokenIn?.icon} />

        <div className="ml-3 whitespace-nowrap">
          <span>{symbolFrom}&nbsp;PERP</span>
        </div>
      </div>
      <div className="flex flex-col text-xs items-end">
        <span>${ticker.close}</span>
        <TickerDisplayComponent ticker={ticker} />
      </div>
    </div>
  );
}

function SymbolSelector(props: {
  setSymbol: (symbolName: string) => void;
  symbolName: string;
  mouseLeave: () => void;
}) {
  const { mouseLeave, setSymbol, symbolName } = props;

  const { allTickersPerp, tokenInfo } = useOrderlyContext();

  const [SymbolList, setSymbolList] = useState<JSX.Element>();

  useEffect(() => {
    if (!allTickersPerp) return;
    else {
      setSymbolList(
        <>
          {allTickersPerp
            ?.sort((a, b) => (a.symbol > b.symbol ? 1 : -1))
            .map((t) => {
              return (
                <SymbolLine
                  setSymbol={setSymbol}
                  tokenInfo={tokenInfo}
                  ticker={t}
                  key={t.symbol}
                ></SymbolLine>
              );
            })}
        </>
      );
    }
  }, [allTickersPerp?.map((t) => t.symbol).join('-')]);

  const intl = useIntl();

  return (
    <div className="absolute left-0 top-8 pt-4 z-50">
      <div
        className="bg-darkBg  rounded-lg   border border-borderC px-2 py-3  "
        style={{
          width: '220px',
        }}
        onMouseLeave={() => {
          mouseLeave();
        }}
      >
        {SymbolList && (
          <div className="text-sm ml-2  mb-2 text-primaryText">
            <FormattedMessage
              id="instrument"
              defaultMessage="Instrument"
            ></FormattedMessage>
          </div>
        )}

        <section className="">{SymbolList}</section>
      </div>
    </div>
  );
}

export function SymbolSelectorMobileModal(
  props: {
    setSymbol: (symbolName: string) => void;
    fromList?: boolean;
    curSymbol?: string;
    all?: boolean;
    fromListClick?: () => void;
  } & Modal.Props
) {
  const { setSymbol, curSymbol, all, fromList, fromListClick } = props;

  const { allTickersPerp, tokenInfo } = useOrderlyContext();

  const { symbol } = useOrderlyContext();

  const [SymbolList, setSymbolList] = useState<JSX.Element>();

  function SymbolLine({ ticker }: { ticker: Ticker }) {
    const { symbolFrom, symbolTo } = parseSymbol(ticker.symbol);
    const tokenIn = useTokenMetaFromSymbol(symbolFrom, tokenInfo);

    return (
      <div
        className={`px-5 text-sm w-full  text-white py-1.5 flex items-center justify-between
        ${curSymbol === ticker.symbol && !all ? 'bg-charSymbolSelectorBg' : ''}
        
        `}
        onClick={(e: any) => {
          setSymbol(ticker.symbol);
          props.onRequestClose && props.onRequestClose(e);
        }}
      >
        <div className="flex items-center">
          <TokenIcon src={tokenIn?.icon} />

          <div className="ml-2 whitespace-nowrap">
            <span>{symbolFrom}</span>

            <span className="text-primaryOrderly">{`/${symbolTo}`} </span>
          </div>

          {curSymbol === ticker.symbol && !all && (
            <span className="ml-2">
              <CheckSelector></CheckSelector>
            </span>
          )}
        </div>

        <div className="flex flex-col text-xs items-end">
          <span>${ticker.close}</span>
          <TickerDisplayComponent ticker={ticker} />
        </div>
      </div>
    );
  }
  const [searchValue, setSearchValue] = useState<string>();
  const intl = useIntl();

  useEffect(() => {
    if (!allTickersPerp) return;
    else {
      setSymbolList(
        <>
          {fromList && (
            <div
              className={`px-5 text-sm text-white   py-3 flex w-full items-center 
            ${all ? 'bg-charSymbolSelectorBg' : ''}
            `}
              onClick={(e: any) => {
                fromListClick && fromListClick();
                props.onRequestClose && props.onRequestClose(e);
              }}
            >
              <div className="mr-2 ml-1 text-white text-sm ">
                <AllMarketIcon />
              </div>
              <span className="text-white mr-2">
                {intl.formatMessage({
                  id: 'All',
                  defaultMessage: 'All',
                })}
                {intl.locale !== 'zh-CN' ? ' ' : ''}
                {intl.formatMessage({
                  id: 'instrument',
                  defaultMessage: 'Instrument',
                })}
              </span>

              {all && <CheckSelector></CheckSelector>}
            </div>
          )}
          {allTickersPerp
            ?.filter((t) =>
              t.symbol
                .toLowerCase()
                .includes(searchValue?.toLocaleLowerCase() || '')
            )
            .sort((a, b) => (a.symbol > b.symbol ? 1 : -1))
            .map((t) => {
              return <SymbolLine ticker={t} key={t.symbol}></SymbolLine>;
            })}
        </>
      );
    }
  }, [allTickersPerp?.map((t) => t.symbol).join('-'), searchValue]);

  return (
    <Modal
      {...props}
      style={{
        content: {
          position: 'fixed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          top: 'none',
          bottom: '0px',
          left: '0px',
          transform: 'translate(-50%, -20px)',
          outline: 'none',
          height: '60vh',
        },
      }}
    >
      <div
        className="bg-darkBg overflow-auto  xs:w-screen xs:fixed xs:bottom-0 xs:left-0 rounded-t-2xl  text-sm text-white  rounded-lg   border border-borderC  py-4  w-p240"
        style={{
          height: '60vh',
        }}
      >
        {/* search filed */}
        <div className="font-bold mb-2 px-5">
          {intl.formatMessage({
            id: 'select_orderly',
            defaultMessage: 'Select',
          })}
          {intl.formatMessage({
            id: 'instrument',
            defaultMessage: 'Instrument',
          })}
        </div>

        <div className="border border-borderC mx-5 mb-2 px-2 flex items-center justify-between bg-black bg-opacity-20  rounded-lg py-2">
          <input
            type="text"
            className="bg-transparent w-full text-white "
            placeholder={intl.formatMessage({
              id: 'token_orderly',
              defaultMessage: 'Token',
            })}
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
            value={searchValue}
          />

          <IoCloseSharp
            size={22}
            onClick={() => {
              setSearchValue('');
            }}
            color="#7E8A93"
          />
        </div>

        {SymbolList}
      </div>
    </Modal>
  );
}

function ChartHeader({ maintenance }: { maintenance: boolean }) {
  const {
    symbol,
    setSymbol,
    tokenInfo,
    ticker,
    openinterests,
    estFundingRate,
    markPrices,
    availableSymbols,
  } = useOrderlyContext();

  const curOpenInterest = openinterests?.find((o) => o.symbol === symbol);

  const curMarkPrice = markPrices?.find((o) => o.symbol === symbol);

  const [displayCountDown, setDisplayCountDown] = useState<string>();

  const interval = 1000;
  useEffect(() => {
    if (!estFundingRate?.fundingTs) return;

    const duration = moment.duration(estFundingRate.fundingTs - Date.now());

    const hours = duration.hours().toString().padStart(2, '0');
    const minutes = duration.minutes().toString().padStart(2, '0');
    const seconds = duration.seconds().toString().padStart(2, '0');
    if (duration.asSeconds() < 0) {
      setDisplayCountDown('00:00:00');
      return;
    }
    setDisplayCountDown(`${hours}:${minutes}:${seconds}`);

    const id = setInterval(() => {
      const duration = moment.duration(estFundingRate?.fundingTs - Date.now());

      const hours = duration.hours().toString().padStart(2, '0');
      const minutes = duration.minutes().toString().padStart(2, '0');
      const seconds = duration.seconds().toString().padStart(2, '0');

      if (duration.asSeconds() < 0) {
        setDisplayCountDown('00:00:00');
        return;
      }

      setDisplayCountDown(`${hours}:${minutes}:${seconds}`);
    }, interval);

    return () => clearInterval(id);
  }, [estFundingRate?.fundingTs?.toString()]);

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const symbolType = PerpOrSpot(symbol);

  const idFrom =
    tokenInfo &&
    tokenInfo.find((t) =>
      symbolFrom === 'BTC' ? t.token === 'WBTC' : t.token === symbolFrom
    )?.token_account_id;

  const [iconIn, setIconIn] = useState<string>();

  useEffect(() => {
    if (!idFrom || symbolType !== 'PERP') return;

    if (idFrom === 'near') {
      setIconIn(nearMetadata.icon);
    } else {
      getFTmetadata(idFrom).then((res) => {
        setIconIn(res.icon);
      });
    }
  }, [idFrom, symbolFrom, symbolType]);

  const { diff, disPlayDiff } = tickerToDisplayDiff(ticker);

  const [hoverSymbol, setHoverSymbol] = useState<boolean>(false);

  const isMobile = useClientMobile();

  const intl = useIntl();

  const history = useHistory();

  const curSymbol = availableSymbols?.find((s) => s.symbol === symbol);
  return (
    <div className="flex items-center  mb-3 mr-3 px-3 py-2 rounded-lg  text-white text-sm">
      <div className="rounded-xl frcs mr-2 gap-1 text-13px border border-v3SwapGray p-1 border-opacity-20 ">
        {['spot', 'perps'].map((type) => {
          return (
            // eslint-disable-next-line react/jsx-key
            <div
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${
                type.indexOf(symbolType.toString().toLowerCase()) > -1
                  ? 'bg-mobileOrderBg text-white'
                  : 'text-primaryText'
              } cursor-pointer`}
              onClick={() => {
                if (type === 'spot') {
                  if (isNewHostName) {
                    history.push('/spot');
                  } else {
                    history.push('/orderbook/spot');
                  }
                } else {
                  if (isNewHostName) {
                    history.push('/');
                  } else {
                    history.push('/orderbook/perps');
                  }
                }
              }}
            >
              <FormattedMessage
                id={type + '_nav'}
                defaultMessage={type.charAt(0).toUpperCase() + type.slice(1)}
              ></FormattedMessage>
            </div>
          );
        })}
      </div>

      <div
        className={`flex 2xl:mr-11 xl:mr-6 lg2:mr-3  relative items-center flex-shrink-0 ${
          hoverSymbol ? 'cursor-pointer bg-symbolHover rounded-lg' : ''
        } 
          pl-1 py-2
        `}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isMobile) {
            setHoverSymbol(!hoverSymbol);
          }
        }}
        onMouseEnter={() => {
          if (isMobile) return;
          setHoverSymbol(true);
        }}
        onMouseLeave={() => {
          if (isMobile) return;
          setHoverSymbol(false);
        }}
      >
        {<img src={iconIn} alt="" className="rounded-full relative  h-6 w-6" />}

        <span className="text-base ml-4 font-gothamBold">
          {symbolFrom} PERP
        </span>

        <IoMdArrowDropdown
          color={!hoverSymbol ? '#566069' : '#FFFFFF'}
          size={20}
          className="ml-2"
        />
        {hoverSymbol && !isMobile && (
          <SymbolSelector
            mouseLeave={() => {
              setHoverSymbol(false);
            }}
            setSymbol={setSymbol}
            symbolName={symbol}
          />
        )}
      </div>

      {hoverSymbol && isMobile && (
        <SymbolSelectorMobileModal
          setSymbol={setSymbol}
          curSymbol={symbol}
          all={false}
          fromList={false}
          isOpen={hoverSymbol}
          onRequestClose={() => {
            setHoverSymbol(false);
          }}
        />
      )}

      {ticker && !maintenance && curSymbol && (
        <div
          className={`flex  items-center  mr-2 w-full 
            justify-between xs:justify-end md:justify-end  text-primaryOrderly`}
        >
          <div className="flex xs:justify-end md:justify-end  items-start flex-col xs:flex-row md:flex-row xs:items-center md:items-center">
            <span className="xs:hidden md:hidden frcs gap-2">
              {intl.formatMessage({
                id: 'price',
                defaultMessage: 'Price',
              })}

              <MoreRouterButton></MoreRouterButton>
            </span>
            <div className="flex items-center mt-0.5">
              <span className="text-white font-bold">
                {numberWithCommasPadding(
                  ticker.close,
                  tickToPrecision(curSymbol.quote_tick)
                )}
              </span>

              <span
                className={`${
                  diff < 0
                    ? 'text-sellRed bg-sellRed'
                    : diff > 0
                    ? 'text-buyGreen bg-buyGreen'
                    : 'text-white'
                } bg-opacity-10 text-xs flex items-center  rounded-md ml-2 px-1 py-0.5`}
              >
                {' '}
                <span className="relative ">
                  {diff > 0 ? (
                    <IoArrowUpOutline />
                  ) : diff < 0 ? (
                    <IoArrowDownOutline />
                  ) : null}
                </span>
                <span>{disPlayDiff}%</span>
              </span>
            </div>
          </div>

          <div className="flex  xs:hidden md:hidden  items-start flex-col">
            <span>
              {intl.formatMessage({
                id: 'mark_price',
                defaultMessage: 'Mark Price',
              })}
            </span>

            <span className="text-white mt-0.5 font-bold">
              {curMarkPrice &&
                numberWithCommasPadding(
                  curMarkPrice.price,
                  tickToPrecision(curSymbol.quote_tick)
                )}
            </span>
          </div>

          <div className="flex  xs:hidden md:hidden  items-start flex-col">
            <span>
              {intl.formatMessage({
                id: 'h24_high',
                defaultMessage: '24h High',
              })}
            </span>

            <span className="text-white mt-0.5 font-bold">
              {numberWithCommasPadding(
                ticker.high,
                tickToPrecision(curSymbol.quote_tick)
              )}
            </span>
          </div>

          <div className="flex items-start xs:hidden md:hidden flex-col">
            <span>
              {intl.formatMessage({
                id: 'h24_low',
                defaultMessage: '24h Low',
              })}
            </span>

            <span className="text-white mt-0.5 font-bold">
              {numberWithCommasPadding(
                ticker.low,
                tickToPrecision(curSymbol.quote_tick)
              )}
            </span>
          </div>

          <div className="flex items-start xs:hidden md:hidden  flex-col">
            <span>
              {intl.formatMessage({
                id: 'h24_Volume',
                defaultMessage: '24h Volume',
              })}
            </span>

            <span className="text-white mt-0.5 font-bold">
              ${toPrecision(ticker.amount.toString(), 3, true)}
            </span>
          </div>

          <div className="flex items-start xs:hidden md:hidden  flex-col">
            <span>
              {intl.formatMessage({
                id: 'open_interest',
                defaultMessage: 'Open Interest',
              })}
            </span>

            <span className="text-white mt-0.5 font-bold frcs gap-2">
              <span>
                {curOpenInterest?.openInterest
                  ? numberWithCommas(curOpenInterest?.openInterest)
                  : '-'}
              </span>

              <TextWrapper
                value={symbolFrom}
                textC="text-primaryText"
                className="text-10px px-1"
              ></TextWrapper>
            </span>
          </div>

          <div className="flex items-start xs:hidden md:hidden  flex-col">
            <span>
              {intl.formatMessage({
                id: 'pred_funding_rate',
                defaultMessage: 'Pred. Funding Rate',
              })}
            </span>

            <span className="text-white mt-0.5 font-bold">
              <span className="text-white mt-0.5 font-bold frcs gap-2 whitespace-nowrap">
                <span
                  style={{
                    color: estFundingRate?.fundingRate ? '#FFAA47' : '',
                  }}
                  title={numberWithCommasPadding(
                    estFundingRate?.fundingRate * 100,
                    4
                  )}
                >
                  {estFundingRate?.fundingRate
                    ? numberWithCommasPadding(
                        Number(
                          new Big(estFundingRate.fundingRate * 100).toFixed(4)
                        ),
                        4
                      ) + '%'
                    : '-'}
                </span>

                <TextWrapper
                  value={displayCountDown || '-'}
                  textC="text-primaryText"
                  className="text-10px px-1 font-nunito"
                ></TextWrapper>
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChartHeader;
