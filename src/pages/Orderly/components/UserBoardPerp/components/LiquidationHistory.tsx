import React, { useEffect, useState } from 'react';
import { useOrderlyContext } from '../../../orderly/OrderlyContext';
import { FormattedMessage } from 'react-intl';
import Modal from 'react-modal';

import { useClientMobile } from '../../../../../utils/device';
import { IoClose } from 'react-icons/io5';
import { TextWrapper } from '../../UserBoard';
import { MdArrowDropDown } from 'react-icons/md';
import { useLiquidationHistoryAll } from '~pages/Orderly/orderly/state';
import { useBatchTokenMetaFromSymbols } from '../../ChartHeader/state';
import { parseSymbol } from '../../RecentTrade';
import _ from 'lodash';
import { formatTimeDate } from '../../OrderBoard';
import { TokenIcon } from '../../Common';
import { numberWithCommas } from '~pages/Orderly/utiles';
import { OrderlyLoading } from '../../Common/Icons';

function SortArrow(props: any & { on: boolean }) {
  return (
    <MdArrowDropDown
      {...props}
      size={24}
      color={props.on ? 'white' : '#7E8A93'}
    ></MdArrowDropDown>
  );
}

function LiquidationHistoryModal(props: Modal.Props) {
  const isMobile = useClientMobile();

  const { availableSymbols, tokenInfo } = useOrderlyContext();

  const liquidations = useLiquidationHistoryAll(availableSymbols, tokenInfo);

  const allTokenSymbols = [
    ...new Set(
      !availableSymbols
        ? []
        : availableSymbols.flatMap((s) => {
            const { symbolFrom, symbolTo } = parseSymbol(s.symbol);

            return [symbolFrom, symbolTo];
          })
    ),
  ];

  const allTokens = useBatchTokenMetaFromSymbols(
    allTokenSymbols.length > 0 ? allTokenSymbols : null,
    tokenInfo
  );

  const [orderBy, setOrderBy] = useState<
    'timestamp' | 'transfer_amount_to_insurance_fund'
  >('timestamp');

  const loading = liquidations === undefined;

  const alldata = liquidations
    ?.map((l) => {
      return l.positions_by_perp.map((p) => {
        const symbolFrom = parseSymbol(p.symbol).symbolFrom;

        return {
          ...p,
          timestamp: l.timestamp,
          from_meta: allTokens[symbolFrom],
          transfer_amount_to_insurance_fund:
            l.transfer_amount_to_insurance_fund,
        };
      });
    })
    .flat();

  const renderData = _.orderBy(alldata, [orderBy], ['desc']);
  //   const renderData = [
  //     {
  //       symbol: 'PERP_BTC_USDT',
  //       position_qty: 1.23,
  //       cost_position_transfer: 1350,
  //       transfer_price: 18123.43,
  //       liquidator_fee: 0.015,
  //       insurance_fund_fee: 0.015,
  //       abs_liquidation_fee: 3520,
  //       timestamp: 1663313562090,
  //       transfer_amount_to_insurance_fund: 0,
  //     },
  //   ];

  return (
    <Modal
      {...props}
      style={{
        content: isMobile
          ? {
              position: 'fixed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              top: 'none',
              bottom: '0px',
              left: '50%',
              transform: 'translate(-50%, -20px)',
              outline: 'none',
            }
          : {
              height: '620px',
              zIndex: 999,
              top: '15%',
              transform: 'translate(-50%, 0%)',
            },
      }}
    >
      <div
        className={`${
          isMobile ? '' : 'border border-assetsBorder'
        } rounded-2xl xs:rounded-none xs:rounded-t-2xl relative  lg:overflow-hidden lg:h-p620 xs:pb-8 lg:w-p869 xs:w-screen xs:fixed xs:bottom-0  bg-boxBorder text-sm text-primaryOrderly border xs:border-none `}
        style={{
          height: isMobile ? '77vh' : '',
        }}
      >
        <div className=" frcb py-5 px-6   ">
          <div className="text-white font-gothamBold">
            <FormattedMessage
              id="liquidations"
              defaultMessage={'Liquidations'}
            />
          </div>

          <span
            className="cursor-pointer  "
            onClick={(e) => {
              props.onRequestClose && props.onRequestClose(e);
            }}
          >
            <IoClose size={22} />
          </span>
        </div>
        {loading && <OrderlyLoading></OrderlyLoading>}
        {!loading && (
          <table className="w-full">
            <thead>
              <th align="left" className="pb-3">
                <div className="pl-6 frcs ">
                  <FormattedMessage
                    id="instrument"
                    defaultMessage={'Instrument'}
                  ></FormattedMessage>
                </div>
              </th>

              <th className="pb-3">
                <div className="frcs gap-1">
                  <FormattedMessage
                    id="price"
                    defaultMessage={'Price'}
                  ></FormattedMessage>

                  <TextWrapper
                    className="text-10px px-1"
                    value="USDC"
                    textC="text-primaryText"
                  ></TextWrapper>
                </div>
              </th>

              <th align="left" className="pb-3">
                <FormattedMessage
                  id="quantity"
                  defaultMessage={'Quantity'}
                ></FormattedMessage>
              </th>

              <th align="left" className="pb-3">
                <FormattedMessage
                  id="liquidation_fee"
                  defaultMessage={'Liquidation Fee'}
                ></FormattedMessage>
              </th>

              <th className="pb-3">
                <div
                  className="frcs gap-0.5 max-w-max cursor-pointer"
                  onClick={() => {
                    setOrderBy('transfer_amount_to_insurance_fund');
                  }}
                >
                  <FormattedMessage
                    id="ins_fund_transfer"
                    defaultMessage={'Ins. Fund Transfer'}
                  ></FormattedMessage>

                  <SortArrow
                    on={orderBy === 'transfer_amount_to_insurance_fund'}
                  ></SortArrow>
                </div>
              </th>

              <th align="right" className="pb-3">
                <div
                  className="flex items-center max-w-max justify-end pr-4 gap-0.5 cursor-pointer"
                  onClick={() => {
                    setOrderBy('timestamp');
                  }}
                >
                  <FormattedMessage
                    id="time"
                    defaultMessage={'Time'}
                  ></FormattedMessage>

                  <SortArrow on={orderBy === 'timestamp'}></SortArrow>
                </div>
              </th>
            </thead>

            {
              <tbody className="text-white text-xs">
                {renderData.map((r, i) => {
                  return (
                    <tr
                      className={`${
                        i === renderData.length - 1 ? 'border-b' : ''
                      } border-t border-white border-opacity-10`}
                    >
                      <td>
                        <div className="frcs gap-1 pl-5 py-4">
                          <img
                            src={r?.from_meta?.icon}
                            alt=""
                            className={`h-7 w-7 flex-shrink-0 rounded-full border-gradientFromHover pr-2`}
                          />
                          <span>{parseSymbol(r.symbol).symbolFrom}</span>

                          <span>PERP</span>
                        </div>
                      </td>

                      <td>{numberWithCommas(r.transfer_price)}</td>

                      <td>{numberWithCommas(r.position_qty)}</td>

                      <td>
                        <div className="frcs whitespace-nowrap gap-1">
                          <span>{numberWithCommas(r.liquidator_fee)}</span>
                          <span>USDC</span>
                        </div>
                      </td>

                      <td>
                        {numberWithCommas(r.transfer_amount_to_insurance_fund)}
                      </td>

                      <td align="right">
                        <div className="pr-4">
                          {formatTimeDate(r.timestamp)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            }
          </table>
        )}
      </div>
    </Modal>
  );
}

export function LiquidationButton() {
  const { liquidations, setLiquidations } = useOrderlyContext();

  const [showLiquidationHistory, setShowLiquidationHistory] =
    useState<boolean>(false);

  return (
    <>
      <button
        onClick={() => {
          setLiquidations([]);
          setShowLiquidationHistory(true);
        }}
        className={`frcc w-1/2 py-2 rounded-lg border  gap-2
        
            ${
              liquidations.length > 0
                ? 'border-liquidationBorder text-sellRed'
                : 'border-orderTypeBg  text-white'
            }
        `}
      >
        <FormattedMessage
          id="liquidations"
          defaultMessage={'liquidations'}
        ></FormattedMessage>
        {liquidations.length > 0 && (
          <div
            className="rounded frcc bg-sellRed text-10px"
            style={{
              width: '14px',
              height: '14px',
              color: '#0E1B24',
            }}
          >
            {liquidations.length}
          </div>
        )}
      </button>

      {showLiquidationHistory && (
        <LiquidationHistoryModal
          isOpen={showLiquidationHistory}
          onRequestClose={() => {
            setShowLiquidationHistory(false);
          }}
        ></LiquidationHistoryModal>
      )}
    </>
  );
}

export function MobileliquidationList() {
  const {
    availableSymbols,
    tokenInfo,
    liquidations: liquidationsFromPush,
    setLiquidations,
  } = useOrderlyContext();

  const liquidations = useLiquidationHistoryAll(availableSymbols, tokenInfo);

  const allTokenSymbols = [
    ...new Set(
      !availableSymbols
        ? []
        : availableSymbols.flatMap((s) => {
            const { symbolFrom, symbolTo } = parseSymbol(s.symbol);

            return [symbolFrom, symbolTo];
          })
    ),
  ];

  const allTokens = useBatchTokenMetaFromSymbols(
    allTokenSymbols.length > 0 ? allTokenSymbols : null,
    tokenInfo
  );

  useEffect(() => {
    const id = setTimeout(() => {
      setLiquidations([]);
    }, 1000);

    return () => clearTimeout(id);
  }, []);

  const loading = liquidations === undefined;

  const alldata = liquidations
    ?.map((l) => {
      return l.positions_by_perp.map((p) => {
        const symbolFrom = parseSymbol(p.symbol).symbolFrom;

        return {
          ...p,
          timestamp: l.timestamp,
          from_meta: allTokens[symbolFrom],
          transfer_amount_to_insurance_fund:
            l.transfer_amount_to_insurance_fund,
          onPush: !!liquidationsFromPush.find(
            (p) => p.liquidationId === l.liquidation_id
          ),
        };
      });
    })
    .flat();

  // const renderData = _.orderBy(alldata, [orderBy], ['desc']);
  const renderData = [
    {
      symbol: 'PERP_BTC_USDT',
      position_qty: 1.23,
      cost_position_transfer: 1350,
      transfer_price: 18123.43,
      liquidator_fee: 0.015,
      insurance_fund_fee: 0.015,
      abs_liquidation_fee: 3520,
      timestamp: 1663313562090,
      transfer_amount_to_insurance_fund: 0,
      onPush: true,
    },
  ];

  return (
    <div className="flex flex-col gap-4 mt-4">
      {renderData.map((r) => {
        return (
          <div className="p-2 text-sm text-white rounded-xl bg-primaryText bg-opacity-20 flex flex-col gap-3 w-full">
            <div className="frcb">
              <div className="frcs gap-1 font-gothamBold w-1/2  flex-shrink-0">
                <img
                  src={r?.from_meta?.icon}
                  alt=""
                  className={`h-7 w-7 flex-shrink-0 rounded-full border-gradientFromHover pr-2`}
                />
                <span>{parseSymbol(r.symbol).symbolFrom}</span>

                <span>PERP</span>
              </div>

              <div className="w-1/2 flex items-center justify-end gap-1">
                {formatTimeDate(r.timestamp)}
                {r.onPush && (
                  <div className="w-2 h-2 rounded-full bg-sellRed"></div>
                )}
              </div>
            </div>

            <div className="frcb">
              <div className="w-1/2">
                {' '}
                <div className="frcs gap-1 text-primaryText">
                  <FormattedMessage
                    id="price"
                    defaultMessage={'Price'}
                  ></FormattedMessage>

                  <TextWrapper
                    className="text-10px px-1"
                    value="USDC"
                    textC="text-primaryText"
                  ></TextWrapper>
                </div>
                <div>{numberWithCommas(r.transfer_price)}</div>
              </div>

              <div className="w-1/2">
                <div className="text-primaryText">
                  <FormattedMessage
                    id="quantity"
                    defaultMessage={'Quantity'}
                  ></FormattedMessage>
                </div>

                <div>{numberWithCommas(r.position_qty)}</div>
              </div>
            </div>

            <div className="frcb">
              <div className="w-1/2">
                <div className="text-primaryText">
                  <FormattedMessage
                    id="liquidation_fee"
                    defaultMessage={'Liquidation Fee'}
                  ></FormattedMessage>
                </div>
                <div className="frcs whitespace-nowrap gap-1">
                  <span>{numberWithCommas(r.liquidator_fee)}</span>
                  <span>USDC</span>
                </div>
              </div>

              <div className="w-1/2">
                <div className="text-primaryText">
                  <FormattedMessage
                    id="ins_fund_transfer"
                    defaultMessage={'Ins. Fund Transfer'}
                  ></FormattedMessage>
                </div>

                <div>
                  {numberWithCommas(r.transfer_amount_to_insurance_fund)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
