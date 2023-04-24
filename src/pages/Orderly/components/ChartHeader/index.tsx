import React, { useState, useEffect, useMemo } from 'react';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import Modal from 'react-modal';
import { parseSymbol } from '../RecentTrade';
import { nearMetadata, getFTmetadata, toPrecision } from '../../near';

import {
  IoArrowDownOutline,
  IoArrowUpOutline,
  IoCloseSharp,
} from 'react-icons/io5';

import { IoMdArrowDropdown } from 'react-icons/io';
import { useTokenMetaFromSymbol } from './state';
import { Ticker, TokenInfo } from '../../orderly/type';
import { TokenIcon } from '../Common';
import useCallback from 'react';
import { digitWrapper } from '../../utiles';
import { AllMarketIcon, CheckSelector } from '../Common/Icons';
import { useClientMobile } from '../../../../utils/device';
import { useIntl } from 'react-intl';

function tickerToDisplayDiff(ticker: Ticker | undefined) {
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
      } text-white rounded-lg hover:bg-symbolHover2 py-1.5 flex items-center justify-between`}
      onClick={() => {
        setSymbol(ticker.symbol);
      }}
    >
      <div className="flex items-center">
        <TokenIcon src={tokenIn?.icon} />

        <div className="ml-2 whitespace-nowrap">
          <span>{symbolFrom}</span>

          <span className="text-primaryOrderly">{` / ${symbolTo}`} </span>
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

  const { allTickers, tokenInfo } = useOrderlyContext();

  const [SymbolList, setSymbolList] = useState<JSX.Element>();

  const [searchValue, setSearchValue] = useState<string>();

  useEffect(() => {
    if (!allTickers) return;
    else {
      setSymbolList(
        <>
          {allTickers
            ?.filter((t) =>
              t.symbol
                .toLowerCase()
                .includes(searchValue?.toLocaleLowerCase() || '')
            )
            .sort((a, b) => (a.symbol > b.symbol ? 1 : -1))
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
  }, [allTickers?.map((t) => t.symbol).join('-'), searchValue]);

  const intl = useIntl();

  return (
    <div className="absolute left-0 top-8 pt-4 z-50">
      <div
        className="bg-darkBg  rounded-lg   border border-borderC px-2 py-3 w-p240  "
        onMouseLeave={() => {
          mouseLeave();
        }}
      >
        {/* search filed */}

        <div className="border border-borderC flex items-center justify-between bg-black bg-opacity-20 w-full rounded-lg px-2 py-1">
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

  const { allTickers, tokenInfo } = useOrderlyContext();

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
    if (!allTickers) return;
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
          {allTickers
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
  }, [allTickers?.map((t) => t.symbol).join('-'), searchValue]);

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
  const { symbol, setSymbol, tokenInfo, ticker } = useOrderlyContext();

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const idFrom =
    tokenInfo &&
    tokenInfo.find((t) => t.token === symbolFrom)?.token_account_id;

  const idTo =
    tokenInfo && tokenInfo.find((t) => t.token === symbolTo)?.token_account_id;

  const [iconIn, setIconIn] = useState<string>();

  const [iconOut, setIconOut] = useState<string>();

  useEffect(() => {
    if (!idFrom) return;

    if (idFrom === 'near') {
      setIconIn(nearMetadata.icon);
    } else {
      getFTmetadata(idFrom).then((res) => {
        setIconIn(res.icon);
      });
    }
  }, [idFrom]);

  useEffect(() => {
    if (!idTo) return;

    if (idTo === 'near') {
      setIconOut(nearMetadata.icon);
    } else {
      getFTmetadata(idTo).then((res) => {
        setIconOut(res.icon);
      });
    }
  }, [idTo]);

  const { diff, disPlayDiff } = tickerToDisplayDiff(ticker);

  const [hoverSymbol, setHoverSymbol] = useState<boolean>(false);

  const isMobile = useClientMobile();

  const intl = useIntl();

  return (
    <div className="flex items-center  text-white text-sm">
      {/* icon */}
      <div
        className={`flex 2xl:mr-11 xl:mr-6 lg2:mr-3  relative items-center flex-shrink-0 ${
          hoverSymbol ? 'cursor-pointer bg-symbolHover rounded-lg' : ''
        } 
        
          px-3 py-2
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

        {
          <img
            src={iconOut}
            alt=""
            className="rounded-full relative right-1 z-10 h-6 w-6"
          />
        }

        <span className="text-base ml-4">
          {symbolFrom} / {symbolTo}
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

      {ticker && !maintenance && (
        <div
          className={`flex  items-center  mr-2 max-w-full w-p460
            justify-between xs:justify-end md:justify-end  text-primaryOrderly`}
        >
          <div className="flex xs:justify-end md:justify-end  items-start flex-col xs:flex-row md:flex-row xs:items-center md:items-center">
            <span className="xs:hidden md:hidden">
              {intl.formatMessage({
                id: 'price',
                defaultMessage: 'Price',
              })}
            </span>
            <div className="flex items-center mt-0.5">
              <span className="text-white font-bold">
                {digitWrapper(ticker.close.toString(), 3)}
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
                id: 'h24_high',
                defaultMessage: '24h High',
              })}
            </span>

            <span className="text-white mt-0.5 font-bold">
              {digitWrapper(ticker.high.toString(), 3)}
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
              {digitWrapper(ticker.low.toString(), 3)}
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
        </div>
      )}
    </div>
  );
}

export default ChartHeader;
