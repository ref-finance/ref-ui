import React, { useEffect, useState } from 'react';
import { useOrderlyContext } from '../../../orderly/OrderlyContext';
import { FormattedMessage } from 'react-intl';
import Modal from 'react-modal';

import { useClientMobile } from '../../../../../utils/device';
import { TextWrapper } from '../../UserBoard';
import { MdArrowDropDown, IoClose } from '../../../../../components/reactIcons';
import { useLiquidationHistoryAll } from '../../../../../pages/Orderly/orderly/state';
import { useBatchTokenMetaFromSymbols } from '../../ChartHeader/state';
import { parseSymbol } from '../../RecentTrade';
import _ from 'lodash';
import { formatTimeDate } from '../../OrderBoard';
import { numberWithCommas } from '../../../../../pages/Orderly/utiles';
import { NoOrderEmpty, OrderlyLoading } from '../../Common/Icons';

export const REF_FI_ORDERLY_LIQUIDATION_UNREAD =
  'REF_FI_ORDERLY_LIQUIDATION_UNREAD';

function SortArrow(props: any & { on: boolean }) {
  return (
    <MdArrowDropDown
      {...props}
      size={24}
      color={props.on ? 'white' : '#7E8A93'}
      className="flex-shrink-0"
    ></MdArrowDropDown>
  );
}

function LiquidationHistoryModal(
  props: Modal.Props & {
    unReadCount: number;
    setUnReadCount: React.Dispatch<React.SetStateAction<number>>;
  }
) {
  const isMobile = useClientMobile();

  const { availableSymbols, tokenInfo } = useOrderlyContext();

  const liquidations = useLiquidationHistoryAll();

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

  const loading = liquidations === undefined;

  const [orderBy, setOrderBy] = useState<
    'timestamp' | 'transfer_amount_to_insurance_fund'
  >(loading ? undefined : 'timestamp');

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

  useEffect(() => {
    if (!loading && renderData.length > 0) {
      setOrderBy('timestamp');
    }
  }, [renderData.length, loading]);

  useEffect(() => {
    if (loading) return;

    const id = setTimeout(() => {
      props.setUnReadCount(0);
      localStorage.removeItem(REF_FI_ORDERLY_LIQUIDATION_UNREAD);
    }, 1000);

    return () => clearTimeout(id);
  }, [loading]);

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
          <table className="w-full table table-fixed">
            <thead className="table w-full table-fixed">
              <th align="left" className="pb-3">
                <div className="pl-6 frcs ">
                  <FormattedMessage
                    id="instrument"
                    defaultMessage={'Instrument'}
                  ></FormattedMessage>
                </div>
              </th>

              <th className="pb-3 relative left-4">
                <div className="frcs gap-1 relative">
                  <FormattedMessage
                    id="price"
                    defaultMessage={'Price'}
                  ></FormattedMessage>

                  <TextWrapper
                    className="text-10px px-1"
                    value="USDC.e"
                    textC="text-primaryText"
                  ></TextWrapper>
                </div>
              </th>

              <th align="left" className="pb-3 relative right-2">
                <FormattedMessage
                  id="quantity"
                  defaultMessage={'Quantity'}
                ></FormattedMessage>
              </th>

              <th align="left" className="pb-3 relative right-14">
                <div className="frcs gap-1 whitespace-nowrap">
                  <FormattedMessage
                    id="liquidation_fee"
                    defaultMessage={'Liquidation Fee'}
                  ></FormattedMessage>

                  <TextWrapper
                    className="text-10px px-1"
                    value="USDC.e"
                    textC="text-primaryText"
                  ></TextWrapper>
                </div>
              </th>

              <th className="pb-3 ">
                <div
                  className={`frcs gap-0.5 whitespace-nowrap max-w-max cursor-pointer    relative right-8  ${
                    orderBy === 'transfer_amount_to_insurance_fund'
                      ? 'text-white'
                      : ''
                  }`}
                  onClick={() => {
                    setOrderBy('transfer_amount_to_insurance_fund');
                  }}
                >
                  <FormattedMessage
                    id="ins_fund_transfer"
                    defaultMessage={'Ins. Fund Transfer'}
                  ></FormattedMessage>

                  <TextWrapper
                    className="text-10px px-1"
                    value="USDC.e"
                    textC="text-primaryText"
                  ></TextWrapper>

                  <SortArrow
                    on={orderBy === 'transfer_amount_to_insurance_fund'}
                  ></SortArrow>
                </div>
              </th>

              <th align="right" className="pb-3">
                <div
                  className={`flex items-center  max-w-max justify-end pr-4 gap-0.5 cursor-pointer
                  
                    ${orderBy === 'timestamp' ? 'text-white' : ''}
                  `}
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

            {renderData.length > 0 && (
              <div
                className="overflow-auto w-full"
                style={{
                  maxHeight: '480px',
                }}
              >
                <tbody className="text-white text-xs table table-fixed">
                  {renderData.map((r, i) => {
                    return (
                      <tr
                        className={`${
                          i === renderData.length - 1 ? 'border-b' : ''
                        } border-t border-white border-opacity-10 table w-full  table-fixed`}
                      >
                        <td className="">
                          <div className="frcs gap-1 pl-5 py-4">
                            <img
                              src={r?.from_meta?.icon}
                              alt=""
                              className={`h-7 w-7 flex-shrink-0 rounded-full border-gradientFromHover `}
                            />
                            <span className="pl-2">
                              {parseSymbol(r.symbol).symbolFrom}
                            </span>

                            <span>PERP</span>
                          </div>
                        </td>

                        <td className="relative left-4">
                          {numberWithCommas(r.transfer_price)}
                        </td>

                        <td className="">{numberWithCommas(r.position_qty)}</td>

                        <td className=" relative right-12">
                          <div className="frcs whitespace-nowrap gap-1">
                            <span>
                              {numberWithCommas(r.abs_liquidation_fee || 0)}
                            </span>
                          </div>
                        </td>

                        <td className="relative right-8">
                          <div className="frcs whitespace-nowrap gap-1 relative left-6">
                            <span>
                              {numberWithCommas(
                                r.transfer_amount_to_insurance_fund || 0
                              )}
                            </span>
                          </div>
                        </td>

                        <td align="right" className="">
                          <div className="pr-4 text-primaryText whitespace-nowrap">
                            {formatTimeDate(r.timestamp)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </div>
            )}

            {renderData.length === 0 && (
              <div className="absolute top-1/2 flex gap-2 flex-col items-center justify-center left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <NoOrderEmpty></NoOrderEmpty>
                <span className="text-opacity-30 text-sm text-primaryText">
                  <FormattedMessage
                    id="no_liquidation_yet"
                    defaultMessage={'No liquidation yet'}
                  ></FormattedMessage>
                </span>
              </div>
            )}
          </table>
        )}
      </div>
    </Modal>
  );
}

export function LiquidationButton() {
  const { liquidations, setLiquidations } = useOrderlyContext();

  const storedUnRead = localStorage.getItem(REF_FI_ORDERLY_LIQUIDATION_UNREAD);

  const [unReadCount, setUnReadCount] = useState<number>(
    !storedUnRead ? 0 : Number(storedUnRead)
  );
  useEffect(() => {
    if (!liquidations.length) return;
    setUnReadCount((c) => c + 1);
    localStorage.setItem(
      REF_FI_ORDERLY_LIQUIDATION_UNREAD,

      (liquidations.length + 1).toString()
    );
  }, [liquidations?.length]);

  const [showLiquidationHistory, setShowLiquidationHistory] =
    useState<boolean>(false);

  return (
    <>
      <button
        onClick={() => {
          setShowLiquidationHistory(true);
        }}
        className={`frcc w-1/2 py-2 rounded-lg border  gap-2
        
            ${'border-orderTypeBg  text-white'}
        `}
      >
        <FormattedMessage
          id="liquidations"
          defaultMessage={'liquidations'}
        ></FormattedMessage>
        {/* {unReadCount > 0 && (
          <div
            className="rounded frcc bg-sellRed text-10px"
            style={{
              width: '14px',
              height: '14px',
              color: '#0E1B24',
            }}
          >
            {unReadCount}
          </div>
        )} */}
      </button>

      {showLiquidationHistory && (
        <LiquidationHistoryModal
          isOpen={showLiquidationHistory}
          onRequestClose={() => {
            setShowLiquidationHistory(false);
          }}
          unReadCount={unReadCount}
          setUnReadCount={setUnReadCount}
        ></LiquidationHistoryModal>
      )}
    </>
  );
}

export function MobileliquidationList({
  unReadCount,
  setUnReadCount,
}: {
  unReadCount: number;
  setUnReadCount: React.Dispatch<React.SetStateAction<number>>;
}) {
  const {
    availableSymbols,
    tokenInfo,
    liquidations: liquidationsFromPush,
    validAccountSig,
  } = useOrderlyContext();

  const liquidations = useLiquidationHistoryAll();

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
      setUnReadCount(0);
      localStorage.removeItem(REF_FI_ORDERLY_LIQUIDATION_UNREAD);
    }, 1000);

    return () => clearTimeout(id);
  }, [liquidationsFromPush?.[0]?.timestamp]);

  const loading = liquidations === undefined && validAccountSig;

  const alldata = (
    liquidations?.map((l) => {
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
    }) || []
  ).flat();

  return (
    <div className="flex flex-col gap-4 mt-4 relative">
      {loading && (
        <div
          className="w-full relative text-primaryText"
          style={{
            minHeight: '100px',
          }}
        >
          <OrderlyLoading></OrderlyLoading>
        </div>
      )}
      {!loading && alldata.length === 0 && (
        <div
          className="w-full relative text-primaryText text-opacity-30"
          style={{
            minHeight: '100px',
          }}
        >
          <div className="absolute top-1/2 flex gap-2 flex-col items-center justify-center left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <NoOrderEmpty></NoOrderEmpty>
            <span className="text-sm">
              <FormattedMessage
                id="no_liquidation_yet"
                defaultMessage={'No liquidation yet'}
              ></FormattedMessage>
            </span>
          </div>
        </div>
      )}

      {!loading &&
        alldata.map((r) => {
          return (
            <div className="p-2 text-sm text-white rounded-xl bg-primaryText bg-opacity-20 flex flex-col gap-3 w-full">
              <div className="frcb">
                <div className="frcs gap-1 font-gothamBold w-1/2  flex-shrink-0">
                  <img
                    // const renderData = _.orderBy(alldata, [orderBy], ['desc']);
                    // const renderData = [
                    src={r?.from_meta?.icon}
                    alt=""
                    className={`h-7 w-7 flex-shrink-0 rounded-full border-gradientFromHover `}
                  />
                  <span className="ml-2">
                    {parseSymbol(r.symbol).symbolFrom}
                  </span>

                  <span>PERP</span>
                </div>

                <div className="w-1/2 flex items-center justify-end gap-1">
                  {formatTimeDate(r.timestamp)}
                  {r?.onPush && unReadCount && (
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
                      value="USDC.e"
                      textC="text-primaryText"
                    ></TextWrapper>
                  </div>
                  <div>{numberWithCommas(r?.transfer_price || 0)}</div>
                </div>

                <div className="w-1/2">
                  <div className="text-primaryText">
                    <FormattedMessage
                      id="quantity"
                      defaultMessage={'Quantity'}
                    ></FormattedMessage>
                  </div>

                  <div>{numberWithCommas(r?.position_qty || 0)}</div>
                </div>
              </div>

              <div className="frcb">
                <div className="w-1/2">
                  <div className="text-primaryText frcs gap-1">
                    <FormattedMessage
                      id="liquidation_fee"
                      defaultMessage={'Liquidation Fee'}
                    ></FormattedMessage>

                    <TextWrapper
                      className="text-10px px-1"
                      value="USDC.e"
                      textC="text-primaryText"
                    ></TextWrapper>
                  </div>
                  <div className="frcs whitespace-nowrap gap-1">
                    <span>{numberWithCommas(r.abs_liquidation_fee || 0)}</span>
                  </div>
                </div>

                <div className="w-1/2">
                  <div className="text-primaryText frcs gap-1">
                    <FormattedMessage
                      id="ins_fund_transfer"
                      defaultMessage={'Ins. Fund Transfer'}
                    ></FormattedMessage>

                    <TextWrapper
                      className="text-10px px-1"
                      value="USDC.e"
                      textC="text-primaryText"
                    ></TextWrapper>
                  </div>

                  <div>
                    {numberWithCommas(
                      r?.transfer_amount_to_insurance_fund || 0
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
