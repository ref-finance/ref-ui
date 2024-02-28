import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import {
  IoClose,
  IoCloseSharp,
  RiArrowDownSFill,
  MdArrowDropDown,
} from '../../../../components/reactIcons';
import Modal from 'react-modal';
import { FlexRow, CheckBox, TokenIcon } from '../Common';
import { AllMarketIcon, CheckSelector } from '../Common/Icons';
import { TickerDisplayComponent } from '../ChartHeader';
import { useTokenMetaFromSymbol } from '../ChartHeader/state';
import { Selector } from '../OrderBoard';
import { parseSymbol } from '../RecentTrade';
import { PerpOrSpot } from '../../utiles';
import { Ticker } from '../../orderly/type';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import {
  Checkbox as TickCheckbox,
  CheckboxSelected,
} from '../../../../components/icon';

const OrdersFilters = ({
  orderType,
  setOrderType,
  chooseMarketSymbol,
  setChooseMarketSymbol,
  chooseOrderSide,
  setChooseOrderSide,
  showMarketSelector,
  setShowMarketSelector,
  showSideSelector,
  setShowSideSelector,
  marketList,
}: {
  orderType: number;
  setOrderType: (item: number) => void;
  chooseMarketSymbol: string;
  setChooseMarketSymbol: (item: string) => void;
  chooseOrderSide: 'both_side' | 'BUY' | 'SELL';
  setChooseOrderSide: (item: 'both_side' | 'BUY' | 'SELL') => void;
  showMarketSelector: boolean;
  setShowMarketSelector: (item: boolean) => void;
  showSideSelector: boolean;
  setShowSideSelector: (item: boolean) => void;
  marketList: {
    text: JSX.Element;
    withSymbol: JSX.Element;
    textId: string;
  }[];
}) => {
  const intl = useIntl();
  const [displayList, setDisplayList] = useState<
    {
      text: JSX.Element;
      withSymbol: JSX.Element;
      textId: string;
    }[]
  >([]);

  useEffect(() => {
    if (showMarketSelector || showSideSelector)
      document.addEventListener('click', () => {
        setShowMarketSelector(false);
        setShowSideSelector(false);
      });
  }, [showMarketSelector, showSideSelector]);

  useEffect(() => {
    if (orderType === 0) {
      setDisplayList(marketList);
    } else if (orderType === 1) {
      setDisplayList(
        marketList.filter((market) => !market.textId.includes('PERP'))
      );
    } else if (orderType === 2) {
      setDisplayList(
        marketList.filter(
          (market) =>
            market.textId.includes('PERP') || market.textId === 'all_markets'
        )
      );
    }
  }, [orderType, marketList]);

  return (
    <div className="w-full flex justify-between items-center">
      <div
        className={`flex items-center w-225 border rounded-lg p-1`}
        style={{
          borderColor: 'rgba(145, 162, 174, 0.20)',
          width: 'calc(225px + 0.5rem)',
        }}
      >
        {['All', 'spot', 'futures'].map((tab, index) => (
          <label
            key={tab}
            onClick={() => {
              setOrderType(index);
              setChooseMarketSymbol('all_markets');
            }}
            className={`flex items-center justify-center h-25 text-base rounded-md font-bold  ${
              orderType === index
                ? 'text-white bg-acccountBlock'
                : 'text-primaryText cursor-pointer'
            }`}
            style={{ flex: '0 0 75px' }}
          >
            <span className="hidden md:block lg:block">
              {intl.formatMessage({
                id: tab,
                defaultMessage: tab,
              })}
            </span>
          </label>
        ))}
      </div>
      <div className="flex justify-between">
        <FlexRow className="relative mr-2">
          <div
            className="cursor-pointer flex items-center border rounded-lg py-1 px-2"
            style={{
              borderColor: 'rgba(145, 162, 174, 0.20)',
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMarketSelector(!showMarketSelector);
              setShowSideSelector(false);
            }}
          >
            <span className="flex items-center">
              {chooseMarketSymbol === 'all_markets' ? (
                intl.formatMessage({
                  id: 'all_instrument',
                  defaultMessage: 'All Instrument',
                })
              ) : (
                <>
                  <span className="text-white">
                    {parseSymbol(chooseMarketSymbol).symbolFrom}
                    {chooseMarketSymbol.includes('PERP')
                      ? ' PERP'
                      : `/${parseSymbol(chooseMarketSymbol).symbolTo}`}
                  </span>
                </>
              )}
            </span>

            <MdArrowDropDown
              size={22}
              color={showMarketSelector ? 'white' : '#7E8A93'}
            />
          </div>

          {showMarketSelector && (
            <Selector
              selected={chooseMarketSymbol}
              setSelect={(value: any) => {
                setChooseMarketSymbol(value);
                setShowMarketSelector(false);
              }}
              list={displayList}
              top={8}
            />
          )}
        </FlexRow>
        <FlexRow className="relative">
          <div
            className="cursor-pointer flex items-center border rounded-lg py-1 px-2"
            style={{ borderColor: 'rgba(145, 162, 174, 0.20)' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowSideSelector(!showSideSelector);
              setShowMarketSelector(false);
            }}
          >
            <span>
              {chooseOrderSide === 'both_side'
                ? intl.formatMessage({
                    id: 'both_side',
                    defaultMessage: 'Both Side',
                  })
                : intl.formatMessage({
                    id: chooseOrderSide.toLocaleLowerCase(),
                    defaultMessage: chooseOrderSide,
                  })}
            </span>

            <MdArrowDropDown
              size={22}
              color={showSideSelector ? 'white' : '#7E8A93'}
            />
          </div>

          {showSideSelector && (
            <Selector
              selected={chooseOrderSide.toLowerCase()}
              setSelect={(value: any) => {
                setChooseOrderSide(value);
                setShowSideSelector(false);
              }}
              list={[
                {
                  text: intl.formatMessage({
                    id: 'both_side',
                    defaultMessage: 'Both Side',
                  }),
                  textId: 'both_side',
                  className: 'text-white',
                },
                {
                  text: intl.formatMessage({
                    id: 'buy',
                    defaultMessage: 'Buy',
                  }),
                  textId: 'buy',
                  className: 'text-white',
                },
                {
                  text: intl.formatMessage({
                    id: 'sell',
                    defaultMessage: 'Sell',
                  }),
                  textId: 'sell',
                  className: 'text-white',
                },
              ]}
              top={8}
            />
          )}
        </FlexRow>
      </div>
    </div>
  );
};

export default OrdersFilters;

export function MobileFilterModal(
  props: {
    tab: number;
    refOnly: boolean;
    setRefOnly?: (value: boolean) => void;
    curInstrument: JSX.Element | string;
    curSymbol?: string;
    curType?: string;
    curSide: string;
    curStatus?: string;
    setType?: (value: any) => void;
    setSide: (value: any) => void;
    setStatus?: (value: any) => void;
    setInstrument?: (value: string) => void;
    setShowCurSymbol?: (value: boolean) => void;
  } & Modal.Props
) {
  const {
    tab,
    refOnly,
    setRefOnly,
    curInstrument,
    curSide,
    curStatus,
    curType,
    setType,
    setSide,
    setStatus,
    curSymbol,
    setInstrument,
  } = props;

  const [showSymbolSelector, setShowSymbolSelector] = useState<boolean>(false);

  const { setSymbol } = useOrderlyContext();

  function SelectList({
    curSelect,
    list,
    listKey,
    setCurSelect,
  }: {
    listKey: string;
    curSelect: string;
    list: string[];
    setCurSelect: (value: string) => void;
    keyTranslate: 'type' | 'status' | 'side' | 'instrument';
  }) {
    return (
      <div className="mb-5 flex items-start w-full justify-between">
        <div className="text-gray2">{listKey}</div>

        <div
          className={` flex-shrink-0 items-center ${
            list.length > 3 ? 'grid' : 'flex'
          }  grid-cols-2`}
        >
          {list.map((item, index) => {
            return (
              <div
                className="flex items-center ml-4 mb-1"
                key={'mobile-select-list-' + item + index}
                onClick={() => {
                  setCurSelect(item);
                }}
              >
                <CheckBox
                  check={item === curSelect}
                  setCheck={() => setCurSelect(item)}
                />

                <span className="ml-2">
                  {intl.formatMessage({ id: item, defaultMessage: item })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const intl = useIntl();

  return (
    <>
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
            zIndex: 999,
          },
        }}
      >
        <div className="bg-darkBg px-5 overflow-auto  xs:w-screen xs:fixed xs:bottom-0 xs:left-0 rounded-t-2xl  text-base   rounded-lg   border-t border-borderC  py-4 text-white">
          <div className="text-left font-bold flex items-center justify-between">
            <span>
              {intl.formatMessage({
                id: 'filter',
                defaultMessage: 'Filter',
              })}
            </span>

            <span
              onClick={(e: any) => {
                e.stopPropagation();
                e.preventDefault();

                props.onRequestClose && props.onRequestClose(e);
              }}
            >
              <IoClose size={20} className="text-primaryText"></IoClose>
            </span>
          </div>

          <div className="flex items-center justify-between my-5">
            <span className="text-gray2">
              {intl.formatMessage({
                id: 'dex',
                defaultMessage: 'Dex',
              })}
            </span>

            <span className="flex items-center mr-2">
              <label
                className="cursor-pointer mr-1"
                onClick={() => setRefOnly(!refOnly)}
              >
                {refOnly ? <CheckboxSelected /> : <TickCheckbox />}
              </label>
              {intl.formatMessage({
                id: 'ref_order',
                defaultMessage: 'REF Dex only',
              })}
            </span>
          </div>

          <div className="flex items-center justify-between my-5">
            <span className="text-gray2">
              {intl.formatMessage({
                id: 'instrument',
                defaultMessage: 'Instrument',
              })}
            </span>
            <div
              className="flex items-center"
              onClick={() => {
                setShowSymbolSelector(true);
              }}
            >
              <span className={curInstrument === 'All' ? 'mr-2' : ''}>
                {curInstrument === 'All'
                  ? intl.formatMessage({
                      id: 'All',
                      defaultMessage: 'All',
                    })
                  : curInstrument}
              </span>
              <RiArrowDownSFill
                color="white"
                className="relative bottom-0.5 right-1"
                size="22"
              />
            </div>
          </div>

          <SelectList
            curSelect={curType}
            listKey={intl.formatMessage({
              id: 'type',
              defaultMessage: 'Type',
            })}
            list={['all', 'limit', 'market']}
            setCurSelect={setType}
            keyTranslate="type"
          />

          <SelectList
            curSelect={curSide}
            listKey={intl.formatMessage({ id: 'Side' })}
            list={['both_side', 'buy', 'sell']}
            setCurSelect={setSide}
            keyTranslate="side"
          />

          <SelectList
            curSelect={curStatus}
            listKey={intl.formatMessage({
              id: 'status',
              defaultMessage: 'Status',
            })}
            list={
              tab === 1
                ? ['all', 'New', 'Partial Filled']
                : ['all', 'Cancelled', 'filled', 'Rejected']
            }
            setCurSelect={setStatus}
            keyTranslate="status"
          />
        </div>
      </Modal>

      {showSymbolSelector && (
        <SymbolSelectorMobileModal
          isOpen={showSymbolSelector}
          setSymbol={(value: string) => {
            setSymbol(value);
            setInstrument(value);
          }}
          onRequestClose={() => {
            setShowSymbolSelector(false);
          }}
          fromList
          all={curInstrument === 'All'}
          curSymbol={curSymbol}
          fromListClick={() => {
            setInstrument('all_markets');
          }}
        />
      )}
    </>
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

  const { symbol } = useOrderlyContext();

  const {
    allTickers: allTickersSpot,
    tokenInfo,
    allTickersPerp,
  } = useOrderlyContext();

  const symbolType = PerpOrSpot(symbol);

  const allTickers = [...allTickersSpot, ...allTickersPerp];

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

            <span
              className={` ${
                symbolType === 'SPOT' ? 'text-primaryOrderly' : 'text-white'
              }`}
            >
              {ticker.symbol.includes('PERP') ? ' PERP' : `/${symbolTo}`}{' '}
            </span>
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
