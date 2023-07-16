import React from 'react';
import { useIntl } from 'react-intl';
import { MdArrowDropDown } from 'react-icons/md';
import { FlexRow } from '../Common';
import { Selector } from '../OrderBoard';
import { parseSymbol } from '../RecentTrade';

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
  marketList
}:{
  orderType: number;
  setOrderType: (item: number) => void;
  chooseMarketSymbol: string;
  setChooseMarketSymbol: (item: string) => void;
  chooseOrderSide: 'all_side' | 'BUY' | 'SELL';
  setChooseOrderSide: (item: 'all_side' | 'BUY' | 'SELL') => void;
  showMarketSelector: boolean;
  setShowMarketSelector: (item: boolean) => void;
  showSideSelector: boolean;
  setShowSideSelector: (item: boolean) => void;
  marketList: {
    text: JSX.Element;
    withSymbol: JSX.Element;
    textId: string;
  }[]
}) => {
  const intl = useIntl();

  return (
    <div className="w-full px-5 pb-5 flex justify-between items-center">
      <div
        className={`flex items-center w-225 border rounded-lg p-1`}
        style={{
          borderColor: 'rgba(145, 162, 174, 0.20)',
          width: 'calc(225px + 0.5rem)'
        }}
      >
        {['All', 'spot', 'futures'].map((tab, index) => (
          <label
            key={tab}
            onClick={() => {
              setOrderType(index);
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
                defaultMessage: tab
              })}
            </span>
          </label>
        ))}
      </div>
      <div className="flex justify-between">

        <FlexRow
          className="relative mr-2"
        >
          <div
            className="cursor-pointer flex items-center border rounded-lg py-1 px-2"
            style={{
              borderColor: 'rgba(145, 162, 174, 0.20)'
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
                    {parseSymbol(chooseMarketSymbol).symbolFrom}{chooseMarketSymbol.includes('PERP') ? ' PERP' : `/${parseSymbol(chooseMarketSymbol).symbolTo}`}
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
              list={marketList}
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
              {chooseOrderSide === 'all_side'
                ? intl.formatMessage({
                    id: 'all_side',
                    defaultMessage: 'All Side',
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
                    id: 'all_side',
                    defaultMessage: 'All Side',
                  }),
                  textId: 'all_side',
                  className: 'text-white'
                },
                {
                  text: intl.formatMessage({
                    id: 'buy',
                    defaultMessage: 'Buy',
                  }),
                  textId: 'buy',
                  className: 'text-white'
                },
                {
                  text: intl.formatMessage({
                    id: 'sell',
                    defaultMessage: 'Sell',
                  }),
                  textId: 'sell',
                  className: 'text-white'
                },
              ]}
            />
          )}
        </FlexRow>
      </div>
    </div>
  )
}

export default OrdersFilters;