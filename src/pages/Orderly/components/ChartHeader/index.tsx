import React, { useState, useEffect, useMemo } from 'react';
import { useOrderlyContext } from '../../orderly/OrderlyContext';

import { parseSymbol } from '../RecentTrade';
import { nearMetadata, getFTmetadata, toPrecision } from '../../near';

import {
  IoArrowDownOutline,
  IoArrowUpOutline,
  IoCloseSharp,
} from 'react-icons/io5';

import { IoMdArrowDropdown } from 'react-icons/io';
import { useTokenMetaFromSymbol } from './state';
import { Ticker } from '../../orderly/type';
import { TokenIcon } from '../Common';
import useCallback from 'react';

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

function SymbolSelector(props: {
  setSymbol: (symbolName: string) => void;
  symbolName: string;
  mouseLeave: () => void;
}) {
  const { mouseLeave, setSymbol, symbolName } = props;

  const { allTickers, tokenInfo } = useOrderlyContext();

  const [SymbolList, setSymbolList] = useState<JSX.Element>();

  function SymbolLine({ ticker }: { ticker: Ticker }) {
    const { symbolFrom, symbolTo } = parseSymbol(ticker.symbol);
    const tokenIn = useTokenMetaFromSymbol(symbolFrom, tokenInfo);

    return (
      <div
        className="px-1.5 text-sm text-white rounded-lg hover:bg-symbolHover2 py-1.5 flex items-center justify-between"
        onClick={() => {
          setSymbol(ticker.symbol);
        }}
      >
        <div className="flex items-center">
          <TokenIcon src={tokenIn?.icon} />

          <div className="ml-2">
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
            .map((t) => {
              return <SymbolLine ticker={t} key={t.symbol}></SymbolLine>;
            })}
        </>
      );
    }
  }, [allTickers?.map((t) => t.symbol).join('-'), searchValue]);

  return (
    <div className="absolute left-0 top-8 pt-4">
      <div
        className="bg-darkBg  rounded-lg   border border-borderC px-2 py-3 w-p240 max-h-p360 "
        onMouseLeave={() => {
          mouseLeave();
        }}
      >
        {/* search filed */}

        <div className="border border-borderC flex items-center justify-between bg-black bg-opacity-20 w-full rounded-lg px-2 py-1">
          <input
            type="text"
            className="bg-transparent w-full text-white "
            placeholder="Token"
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
    </div>
  );
}

function ChartHeader() {
  const { symbol, setSymbol, tokenInfo, ticker } = useOrderlyContext();
  console.log('ticker: ', ticker);

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

  return (
    <div className="flex items-center  text-white text-sm">
      {/* icon */}
      <div
        className={`flex relative items-center flex-shrink-0 ${
          hoverSymbol ? 'cursor-pointer bg-symbolHover rounded-lg' : ''
        } 
        
          px-3 py-2
        `}
        onMouseEnter={() => {
          setHoverSymbol(true);
        }}
        onMouseLeave={() => {
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
        {hoverSymbol && (
          <SymbolSelector
            mouseLeave={() => {
              setHoverSymbol(false);
            }}
            setSymbol={setSymbol}
            symbolName={symbol}
          />
        )}
      </div>

      {ticker && (
        <div
          className={`flex  items-center  justify-between text-primaryOrderly`}
        >
          <div className="flex  ml-11 items-start flex-col">
            <span>Price</span>
            <div className="flex items-center mt-0.5">
              <span className="text-white font-bold">{ticker.close}</span>

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

          <div className="flex  ml-11 items-start flex-col">
            <span>High(24h)</span>

            <span className="text-white mt-0.5 font-bold">{ticker.high}</span>
          </div>

          <div className="flex items-start  ml-11 flex-col">
            <span>Low(24h)</span>

            <span className="text-white mt-0.5 font-bold">{ticker.low}</span>
          </div>

          <div className="flex items-start  ml-11 flex-col">
            <span>Volume(24h)</span>

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
