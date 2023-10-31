import React, { useEffect, useState, useContext, useMemo, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import { BigNumber } from 'bignumber.js';
import {
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from '../../../../utils/numbers';
import { Icon } from './Icon';
import { toRealSymbol } from 'src/utils/token';
import { TokenLinks } from 'src/components/tokens/Token';
import { FiArrowUpRight } from 'react-icons/fi';
import { TokenMetadata } from '~services/ft-contract';
import { RencentTabKey } from './type';
import { useDCLPoolTransaction } from 'src/state/pool';
import { numberWithCommas } from 'src/pages/Orderly/utiles';
import { HiOutlineExternalLink } from 'react-icons/hi';
import getConfig from '../../../../services/config';
import Big from 'big.js';
import {
  sort_tokens_by_base,
  openUrl,
  reverse_price,
} from 'src/services/commonV3';
import { pointToPrice } from 'src/services/swapV3';
import { RelatedFarmsBox } from './RelatedFarmsBox';
import { isClientMobie } from '../../../../utils/device';

export function TablePool(props: any) {
  const { poolDetail, tokenPriceList, sole_seed } = props;
  const [tokens, setTokens] = useState([]);
  const intl = useIntl();
  useEffect(() => {
    const {
      token_x,
      token_y,
      total_x,
      total_y,
      token_x_metadata,
      token_y_metadata,
      total_fee_x_charged,
      total_fee_y_charged,
    } = poolDetail;
    const pricex = tokenPriceList[token_x]?.price || 0;
    const pricey = tokenPriceList[token_y]?.price || 0;
    const totalX = new BigNumber(total_x).minus(total_fee_x_charged).toFixed();
    const totalY = new BigNumber(total_y).minus(total_fee_y_charged).toFixed();
    const amountx = toReadableNumber(token_x_metadata.decimals, totalX);
    const amounty = toReadableNumber(token_y_metadata.decimals, totalY);
    const tvlx = Number(amountx) * Number(pricex);
    const tvly = Number(amounty) * Number(pricey);
    const temp_list = [];
    const temp_tokenx = {
      meta: token_x_metadata,
      amount: amountx,
      tvl: tvlx,
    };
    const temp_tokeny = {
      meta: token_y_metadata,
      amount: amounty,
      tvl: tvly,
    };
    temp_list.push(temp_tokenx, temp_tokeny);
    setTokens(temp_list);
  }, [Object.keys(tokenPriceList).length]);
  function valueOfNearTokenTip() {
    const tip = intl.formatMessage({ id: 'awesomeNear_verified_token' });
    let result: string = `<div class="text-navHighLightText text-xs text-left font-normal">${tip}</div>`;
    return result;
  }
  function displayAmount(amount: string) {
    if (+amount == 0) {
      return '0';
    } else if (+amount < 0.01) {
      return '< 0.01';
    } else {
      return toInternationalCurrencySystem(amount.toString(), 2);
    }
  }
  function displayTvl(token: any) {
    const { tvl } = token;
    if (+tvl == 0 && !tokenPriceList[token.meta.id]?.price) {
      return '$ -';
    } else if (+tvl == 0) {
      return '$0';
    } else if (+tvl < 0.01) {
      return '< $0.01';
    } else {
      return '$' + toInternationalCurrencySystem(tvl.toString(), 2);
    }
  }
  const isMobile = isClientMobie();
  return (
    <div className="mt-8">
      <div className="text-white font-gothamBold text-base mb-3 w-full">
        <FormattedMessage
          id="pool_composition"
          defaultMessage={'Pool Composition'}
        />
      </div>
      <div className="rounded-lg w-full bg-detailCardBg pt-4 pb-1">
        <div className="grid grid-cols-10  px-5">
          <div className="col-span-5 text-sm text-farmText">
            <FormattedMessage id="token" defaultMessage="Token" />
          </div>

          <div className="col-span-3 text-sm text-farmText">
            <FormattedMessage id="amount" defaultMessage="Amount" />
          </div>

          <div className="col-span-2 text-sm text-farmText">
            <FormattedMessage id="value" defaultMessage="Value" />
          </div>
        </div>
        {tokens.map((token: any, i: number) => (
          <div
            key={i}
            className="grid grid-cols-10 items-center px-5 py-3 hover:bg-chartBg hover:bg-opacity-30"
          >
            <div className="col-span-5 flex items-center">
              <Icon icon={token.meta.icon} className="h-7 w-7 mr-2" />
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-white text-base">
                    {toRealSymbol(token.meta.symbol)}
                  </span>
                  {TokenLinks[token.meta.symbol] ? (
                    <div
                      className="ml-0.5 text-sm"
                      data-type="info"
                      data-place="right"
                      data-multiline={true}
                      data-class="reactTip"
                      data-html={true}
                      data-tip={valueOfNearTokenTip()}
                      data-for={'nearVerifiedId1' + i}
                    >
                      <a
                        className=""
                        onClick={(e) => {
                          e.stopPropagation();
                          openUrl(TokenLinks[token.meta.symbol]);
                        }}
                      >
                        <FiArrowUpRight className="text-primaryText hover:text-greenColor cursor-pointer" />
                      </a>
                      <ReactTooltip
                        id={'nearVerifiedId1' + i}
                        backgroundColor="#1D2932"
                        border
                        borderColor="#7e8a93"
                        effect="solid"
                      />
                    </div>
                  ) : null}
                </div>
                <a
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  href={`/swap/#${tokens[0].meta.id}|${tokens[1].meta.id}`}
                  className="text-xs text-primaryText xsm:hidden"
                  title={token.meta.id}
                >{`${token.meta.id.substring(0, 24)}${
                  token.meta.id.length > 24 ? '...' : ''
                }`}</a>
              </div>
            </div>
            <div
              className="col-span-3 text-base text-white"
              title={token.amount}
            >
              {displayAmount(token.amount)}
            </div>
            <div
              className="col-span-2 text-base text-white"
              title={`$${token.tvl}`}
            >
              {displayTvl(token)}
            </div>
          </div>
        ))}
      </div>
      {isMobile ? (
        <RelatedFarmsBox
          poolDetail={poolDetail}
          tokenPriceList={tokenPriceList}
          sole_seed={sole_seed}
        ></RelatedFarmsBox>
      ) : null}
      <RecentTransactions
        tokens={tokens.map((t) => t.meta)}
        pool_id={poolDetail.pool_id}
      ></RecentTransactions>
    </div>
  );
}
const REF_FI_RECENT_TRANSACTION_TAB_KEY_DCL =
  'REF_FI_RECENT_TRANSACTION_TAB_KEY_DCL';

function RecentTransactions({
  pool_id,
  tokens,
}: {
  pool_id: string;
  tokens: TokenMetadata[];
}) {
  const storedTab = sessionStorage.getItem(
    REF_FI_RECENT_TRANSACTION_TAB_KEY_DCL
  ) as RencentTabKey;

  const { swapTransactions, liquidityTransactions, limitOrderTransactions } =
    useDCLPoolTransaction({ pool_id });
  const [tab, setTab] = useState<RencentTabKey>(storedTab || 'swap');

  const onChangeTab = (tab: RencentTabKey) => {
    sessionStorage.setItem(REF_FI_RECENT_TRANSACTION_TAB_KEY_DCL, tab);
    setTab(tab);
  };

  const renderSwapTransactions = swapTransactions.map((tx) => {
    const swapIn = tokens.find((t) => t.id === tx.token_in);

    const swapOut = tokens.find((t) => t.id === tx.token_out);

    if (!swapIn || !swapOut) return null;

    const swapInAmount = toReadableNumber(swapIn.decimals, tx.amount_in);
    const displayInAmount =
      Number(swapInAmount) < 0.01
        ? '<0.01'
        : numberWithCommas(toPrecision(swapInAmount, 6));

    const swapOutAmount = toReadableNumber(swapOut.decimals, tx.amount_out);

    const displayOutAmount =
      Number(swapOutAmount) < 0.01
        ? '<0.01'
        : numberWithCommas(toPrecision(swapOutAmount, 6));

    const txLink = (
      <a
        rel="noopener  noreferrer nofollow "
        className="  hover:underline ml-2"
        target="_blank"
      >
        <HiOutlineExternalLink className="relative "></HiOutlineExternalLink>
      </a>
    );

    return (
      <tr className="text-sm text-primaryText lg:grid w-full lg:grid-cols-3 hover:text-white hover:bg-poolRecentHover">
        <td className="gap-1 p-4 col-span-1">
          <span className="text-white" title={swapInAmount}>
            {displayInAmount}
          </span>

          <span className="ml-1 text-primaryText">
            {toRealSymbol(swapIn.symbol)}
          </span>
        </td>

        <td className=" gap-1 col-span-1 lg:flex items-center">
          <span className="text-white" title={swapOutAmount}>
            {displayOutAmount}
          </span>

          <span className="ml-1 text-primaryText">
            {toRealSymbol(swapOut.symbol)}
          </span>
        </td>

        <td className=" relative  py-4 pr-4 lg:flex items-center justify-end col-span-1">
          <span
            className="inline-flex items-center cursor-pointer xsm:whitespace-nowrap"
            onClick={() => {
              openUrl(`${getConfig().explorerUrl}/txns/${tx.tx_id}`);
            }}
          >
            <span className="hover:underline cursor-pointer">
              {tx.timestamp}
            </span>
            {txLink}
          </span>
        </td>
      </tr>
    );
  });

  const renderLiquidityTransactions = liquidityTransactions.map((tx) => {
    const swapIn = tokens[0];

    const swapOut = tokens[1];

    if (!swapIn || !swapOut) return null;

    const AmountIn = toReadableNumber(swapIn.decimals, tx.amount_x);
    const displayInAmount =
      Number(AmountIn) < 0.01 && Number(AmountIn) > 0
        ? '<0.01'
        : numberWithCommas(toPrecision(AmountIn, 6));

    const AmountOut = toReadableNumber(swapOut.decimals, tx.amount_y);

    const displayOutAmount =
      Number(AmountOut) < 0.01 && Number(AmountOut) > 0
        ? '<0.01'
        : numberWithCommas(toPrecision(AmountOut, 6));

    const txLink = (
      <a
        rel="noopener  noreferrer nofollow "
        className="hover:underline ml-2 "
        target="_blank"
      >
        <HiOutlineExternalLink className="relative "></HiOutlineExternalLink>
      </a>
    );

    return (
      <tr className="text-sm text-primaryText lg:grid lg:grid-cols-5 hover:text-white hover:bg-poolRecentHover">
        <td className="gap-1 p-4  col-span-1">
          <span className="text-white">
            {(tx.method_name.toLowerCase().indexOf('add') > -1 ||
              tx.method_name.toLowerCase().indexOf('append') > -1) &&
              'Add'}

            {tx.method_name.toLowerCase().indexOf('remove') > -1 && 'Remove'}
          </span>
        </td>

        <td className="text-white col-span-2 lg:flex items-center whitespace-nowrap">
          {Big(AmountIn || 0).gt(0) ? (
            <>
              <span className="text-white" title={AmountIn}>
                {displayInAmount}
              </span>

              <span className="ml-1 text-primaryText">
                {toRealSymbol(swapIn.symbol)}
              </span>
            </>
          ) : null}
          {Big(AmountIn || 0).gt(0) && Big(AmountOut || 0).gt(0) ? (
            <span className="mx-1">+</span>
          ) : null}
          {Big(AmountOut || 0).gt(0) ? (
            <>
              {' '}
              <span className="text-white" title={AmountOut}>
                {displayOutAmount}
              </span>
              <span className="ml-1 text-primaryText">
                {toRealSymbol(swapOut.symbol)}
              </span>
            </>
          ) : null}
        </td>

        <td className="relative py-4 pr-4 lg:flex items-center justify-end col-span-2">
          <span
            className="inline-flex items-center cursor-pointer xsm:whitespace-nowrap"
            onClick={() => {
              openUrl(`${getConfig().explorerUrl}/txns/${tx.tx_id}`);
            }}
          >
            <span className="hover:underline cursor-pointer">
              {tx.timestamp}
            </span>
            {txLink}
          </span>
        </td>
      </tr>
    );
  });

  const renderLimitOrderTransactions = limitOrderTransactions.map((tx) => {
    const swapIn = tokens.find((t) => t.id === tx.sell_token);

    const swapOut = tokens.find((t) => t.id !== tx.sell_token);

    if (!swapIn || !swapOut) return null;
    let reverse = false;
    const sort_tokens = sort_tokens_by_base([swapIn, swapOut]);
    if (sort_tokens[0].id !== swapIn.id) {
      reverse = true;
    }

    const AmountIn = toReadableNumber(swapIn.decimals, tx.amount);
    const displayInAmount =
      Number(AmountIn) < 0.01
        ? '<0.01'
        : numberWithCommas(toPrecision(AmountIn, 3));

    const price = pointToPrice({
      tokenA: swapIn,
      tokenB: swapOut,
      point:
        swapIn.id === pool_id.split('|')[0]
          ? Number(tx.point)
          : -Number(tx.point),
    });
    const AmountOut = new Big(AmountIn).mul(price).toFixed();

    const displayOutAmount =
      Number(AmountOut) < 0.01
        ? '<0.01'
        : numberWithCommas(toPrecision(AmountOut, 3));

    const txLink = (
      <a
        rel="noopener  noreferrer nofollow "
        className="  hover:underline ml-2 "
        target="_blank"
      >
        <HiOutlineExternalLink className="relative "></HiOutlineExternalLink>
      </a>
    );
    const display_price = reverse ? reverse_price(price) : price;
    return (
      <tr className="hover:text-white lg:grid lg:grid-cols-5 lg:overflow-hidden hover:bg-poolRecentHover text-sm text-primaryText">
        <td className=" gap-1 p-4 lg:flex items-center text-white">
          {tx.method_name.toLowerCase().indexOf('cancelled') > -1 && 'Cancel'}

          {tx.method_name.toLowerCase().indexOf('add') > -1 && 'Place'}
        </td>

        <td className="text-white lg:flex items-center">
          <div className="frcs flex-wrap">
            <span className="text-white mr-1" title={AmountIn}>
              {displayInAmount}
            </span>

            <span className="text-primaryText">
              {toRealSymbol(swapIn.symbol)}
            </span>
          </div>
        </td>

        <td className="lg:flex items-center">
          <div className="frcs flex-wrap">
            <span className="text-white mr-1" title={AmountOut}>
              {displayOutAmount}
            </span>

            <span className="text-primaryText">
              {toRealSymbol(swapOut.symbol)}
            </span>
          </div>
        </td>

        <td className="lg:flex items-center">
          <div className="frcs flex-wrap">
            <span className="text-white mr-1" title={price}>
              {numberWithCommas(toPrecision(display_price, 4))}
            </span>

            <span className="text-primaryText">
              {toRealSymbol(sort_tokens?.[1]?.symbol)}/
              {toRealSymbol(sort_tokens?.[0]?.symbol)}
            </span>
          </div>
        </td>

        <td className="relative py-4 lg:flex items-center justify-end pr-2">
          <span
            className="inline-flex items-center cursor-pointer xsm:whitespace-nowrap xsm:pl-3"
            onClick={() => {
              openUrl(`${getConfig().explorerUrl}/txns/${tx.tx_id}`);
            }}
          >
            <span className="hover:underline cursor-pointer text-right">
              {tx.timestamp}
            </span>
            {txLink}
          </span>
        </td>
      </tr>
    );
  });

  const renderTransactions =
    tab === 'swap'
      ? renderSwapTransactions
      : tab === 'liquidity'
      ? renderLiquidityTransactions
      : renderLimitOrderTransactions;
  return (
    <>
      <div className="flex items-center lg:justify-between xsm:flex-col xsm:items-start w-full mb-3 mt-7">
        <div className="text-white font-gothamBold text-base">
          <FormattedMessage
            id="recent_transactions"
            defaultMessage={'Recent Transactions'}
          />
        </div>

        <div className="flex items-center justify-between gap-2 h-8 text-sm text-primaryText xsm:mt-4">
          <div
            className={`rounded-lg frcc cursor-pointer h-full w-28 text-center align-middle ${
              tab === 'swap'
                ? 'text-white bg-inputV3BorderColor '
                : 'bg-detailCardBg'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChangeTab('swap');
            }}
          >
            <FormattedMessage
              id="swap"
              defaultMessage={'Swap'}
            ></FormattedMessage>
          </div>

          <div
            className={`rounded-lg frcc cursor-pointer h-full w-28 text-center align-middle ${
              tab === 'liquidity'
                ? 'text-white bg-inputV3BorderColor '
                : 'bg-detailCardBg'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChangeTab('liquidity');
            }}
          >
            <FormattedMessage
              id="liquidity"
              defaultMessage={'Liquidity'}
            ></FormattedMessage>
          </div>

          <div
            className={`rounded-lg frcc cursor-pointer h-full w-28 text-center align-middle ${
              tab === 'limit_order'
                ? 'text-white bg-inputV3BorderColor '
                : 'bg-detailCardBg'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChangeTab('limit_order');
            }}
          >
            <FormattedMessage
              id="limit_order"
              defaultMessage={'Limit Order'}
            ></FormattedMessage>
          </div>
        </div>
      </div>
      <div className="text-sm rounded-lg overflow-hidden w-full text-primaryText bg-detailCardBg">
        <table className="w-full xsm:hidden">
          <tr
            className={`text-left grid ${
              tab === 'swap' ? 'grid-cols-3' : 'grid-cols-5'
            } border-b border-gray1`}
          >
            <th className={`p-4 ${'col-span-1'} pb-3`}>
              {tab === 'liquidity' && (
                <FormattedMessage
                  id="action"
                  defaultMessage={'Action'}
                ></FormattedMessage>
              )}

              {tab === 'limit_order' && (
                <FormattedMessage
                  id="action"
                  defaultMessage={'Action'}
                ></FormattedMessage>
              )}

              {tab === 'swap' && (
                <FormattedMessage
                  id="from"
                  defaultMessage={'From'}
                ></FormattedMessage>
              )}
            </th>

            <th
              className={`py-4 pb-3 ${
                tab === 'limit_order' || tab === 'swap'
                  ? 'col-span-1'
                  : 'col-span-2'
              }`}
            >
              {tab === 'liquidity' && (
                <FormattedMessage
                  id="amount"
                  defaultMessage={'Amount'}
                ></FormattedMessage>
              )}
              {tab === 'swap' && (
                <FormattedMessage
                  id="to"
                  defaultMessage={'To'}
                ></FormattedMessage>
              )}

              {tab === 'limit_order' && (
                <FormattedMessage
                  id="from"
                  defaultMessage={'From'}
                ></FormattedMessage>
              )}
            </th>

            {tab === 'limit_order' && (
              <th className="py-4 pb-3 col-span-1">
                <FormattedMessage
                  id="to"
                  defaultMessage={'To'}
                ></FormattedMessage>
              </th>
            )}

            {tab === 'limit_order' && (
              <th className="py-4 pb-3 col-span-1">
                <FormattedMessage
                  id="price"
                  defaultMessage={'Price'}
                ></FormattedMessage>
              </th>
            )}

            <th
              className={`p-4 text-right pb-3 ${
                tab === 'limit_order' || tab === 'swap'
                  ? 'col-span-1'
                  : 'col-span-2'
              }`}
            >
              <FormattedMessage
                id="time"
                defaultMessage={'Time'}
              ></FormattedMessage>
            </th>
          </tr>
        </table>

        <div
          className="overflow-auto "
          style={{
            maxHeight: '700px',
          }}
        >
          <table className="w-full">
            <tr className="text-left border-b border-gray1 lg:hidden">
              <th className={`p-4 ${'col-span-1'} pb-3`}>
                {tab === 'liquidity' && (
                  <FormattedMessage
                    id="action"
                    defaultMessage={'Action'}
                  ></FormattedMessage>
                )}

                {tab === 'limit_order' && (
                  <FormattedMessage
                    id="action"
                    defaultMessage={'Action'}
                  ></FormattedMessage>
                )}

                {tab === 'swap' && (
                  <FormattedMessage
                    id="from"
                    defaultMessage={'From'}
                  ></FormattedMessage>
                )}
              </th>

              <th
                className={`py-4 pb-3 ${
                  tab === 'limit_order' ? 'col-span-1' : 'col-span-2'
                }`}
              >
                {tab === 'liquidity' && (
                  <FormattedMessage
                    id="amount"
                    defaultMessage={'Amount'}
                  ></FormattedMessage>
                )}
                {tab === 'swap' && (
                  <FormattedMessage
                    id="to"
                    defaultMessage={'To'}
                  ></FormattedMessage>
                )}

                {tab === 'limit_order' && (
                  <FormattedMessage
                    id="from"
                    defaultMessage={'From'}
                  ></FormattedMessage>
                )}
              </th>

              {tab === 'limit_order' && (
                <th className="py-4 pb-3 col-span-1">
                  <FormattedMessage
                    id="to"
                    defaultMessage={'To'}
                  ></FormattedMessage>
                </th>
              )}

              {tab === 'limit_order' && (
                <th className="py-4 pb-3 col-span-1">
                  <FormattedMessage
                    id="price"
                    defaultMessage={'Price'}
                  ></FormattedMessage>
                </th>
              )}

              <th
                className={`p-4 pb-3 ${
                  tab === 'limit_order' ? 'col-span-1' : 'col-span-2'
                }`}
              >
                <FormattedMessage
                  id="time"
                  defaultMessage={'Time'}
                ></FormattedMessage>
              </th>
            </tr>
            {renderTransactions}
          </table>
        </div>
      </div>
    </>
  );
}
