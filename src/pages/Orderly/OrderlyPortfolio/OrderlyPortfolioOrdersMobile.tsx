import Big from 'big.js';
import { parseSymbol } from 'src/pages/Orderly/components/RecentTrade';
import { formatTimeDate } from 'src/pages/Orderly/orderly/utils';
import React from 'react';
import { useIntl } from 'react-intl';

const OrderlyPortfolioOrdersMobile = ({
  order,
  openTrades,
  marketList,
  children,
}: any) => {
  const {
    symbol,
    side,
    created_time,
    price,
    average_executed_price,
    quantity,
    executed,
    broker_name,
  } = order;
  const intl = useIntl();
  return (
    <div
      className={`m-2 p-3 gap-2 rounded-xl`}
      style={{ backgroundColor: '#7E8A931A' }}
      onClick={() => openTrades && openTrades(order)}
    >
      <div className="w-8/12 inline-block">
        <div className={`p-0.5 my-0.5 flex items-center`}>
          <div
            className={`px-2 pt-0.5 text-sm mr-2 inline-flex items-center justify-center rounded-md gotham_bold text-dark5 ${
              side === 'BUY' ? 'bg-greenLight' : 'bg-redLight'
            }`}
          >
            {intl.formatMessage({
              id: side?.toLowerCase(),
              defaultMessage: side,
            })}
          </div>
          <div className="flex items-center ">
            {marketList.find((m) => m.textId === symbol)?.withSymbol}
          </div>
        </div>
      </div>
      <div className="w-4/12 inline-block text-right">
        <div className={`p-0.5 text-xs my-1 flex justify-end items-center`}>
          <span className="mr-1">
            {parseFloat(
              new Big((executed / (quantity || executed)) * 100).toFixed(2)
            )}
            % filled
          </span>

          <div className="flex justify-end items-center relative">
            <div
              className="flex items-center relative ml-1.5 justify-center border border-dashed rounded-full border-portfolioGreenColor"
              style={{
                height: '14px',
                width: '14px',
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
      <div className="w-8/12 inline-block">
        <div className={`p-0.5 text-xs my-1 text-white`}>
          <span className="flex flex-wrap gap-1">
            <span>
              {quantity || executed}
              <span
                className="text-10px p-1 text-gray2 mx-1"
                style={{
                  borderRadius: '4px',
                  backgroundColor: 'rgba(126, 138, 147, 0.15)',
                }}
              >
                {parseSymbol(symbol).symbolFrom}
              </span>
            </span>
            <span>
              <span>* {price || average_executed_price}</span>
              <span
                className="text-10px p-1 text-gray2 mx-1"
                style={{
                  borderRadius: '4px',
                  backgroundColor: 'rgba(126, 138, 147, 0.15)',
                }}
              >
                USDC.e
              </span>
            </span>
          </span>
        </div>
      </div>
      <div className="w-4/12 inline-block text-right">
        <span>
          Total&nbsp;
          <span className="text-white gotham_bold">
            {(quantity * (price || average_executed_price)).toFixed(1)}
          </span>
        </span>
      </div>
      <div className="w-8/12 inline-block">
        <div className={`p-0.5 text-xs my-1`}>
          <span>{formatTimeDate(created_time)}</span>
        </div>
      </div>
      <div className="w-4/12 inline-block text-right">
        <div className={`p-0.5 text-xs my-1 flex justify-end items-center`}>
          {broker_name ? `from ${broker_name.replace('DEX', '')}` : ''}
        </div>
      </div>
    </div>
  );
};

export default OrderlyPortfolioOrdersMobile;
