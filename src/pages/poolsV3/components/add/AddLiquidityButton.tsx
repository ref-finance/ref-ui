import React, { useEffect, useState, useContext, useMemo, useRef } from 'react';
import Big from 'big.js';
import { FormattedMessage } from 'react-intl';
import BigNumber from 'bignumber.js';
import { LiquidityProviderData } from '../../AddYourLiquidityPageV3';
import { WalletContext } from '../../../../utils/wallets-integration';
import {
  add_liquidity,
  batch_add_liquidity,
} from '../../../../services/swapV3';
import { IAddLiquidityInfo } from '../../interfaces';
import { TokenMetadata } from '../../../../services/ft-contract';
import { WRAP_NEAR_CONTRACT_ID } from '../../../../services/wrap-near';
import {
  GradientButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from 'src/components/button/Button';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';
import {
  constTransactionPage,
  useTranstionsExcuteDataStore,
} from '../../../../stores/transtionsExcuteData';
import { addLiquidityTxHashHandle } from '../../../../services/commonV3';
import { useHistory } from 'react-router-dom';
import { HiOutlinePlusSm } from 'src/components/reactIcons';
import { toReadableNumber } from 'src/utils/numbers';
import getConfigV2 from '../../../../services/configV2';

const configV2 = getConfigV2();

/**
 * 双边 最小token数量不满足 提示
 * 双边 一侧token 数量太多 传递的时候只传实际使用值
 * @returns
 */
export function AddLiquidityButton() {
  const {
    currentSelectedPool,
    tokenX,
    tokenY,
    liquidityShape,
    tokenXAmount,
    tokenYAmount,
    tokenXBalanceFromNear,
    tokenYBalanceFromNear,
    onlyAddXToken,
    onlyAddYToken,
    invalidRange,
    getLiquiditySpot,
    getLiquidityForCurveAndBidAskMode,
  } = useContext(LiquidityProviderData);
  const [addLiquidityButtonLoading, setAddLiquidityButtonLoading] =
    useState(false);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const { selector } = useWalletSelector();
  const history = useHistory();
  const processTransactionPending = useTranstionsExcuteDataStore(
    (state) => state.processTransactionPending
  );
  const processTransactionSuccess = useTranstionsExcuteDataStore(
    (state) => state.processTransactionSuccess
  );
  const processTransactionError = useTranstionsExcuteDataStore(
    (state) => state.processTransactionError
  );

  function addLiquiditySpot() {
    const transactionId = String(Date.now());
    setAddLiquidityButtonLoading(true);
    const new_liquidity = getLiquiditySpot();
    processTransactionPending({
      transactionId,
      page: constTransactionPage.pool,
      data: {
        prefix: 'Supplying',
        tokens: [
          {
            token: new_liquidity?.token_x,
            amount: toReadableNumber(
              new_liquidity?.token_x?.decimals,
              new_liquidity?.amount_x
            ),
          },
          {
            symbol: '+',
          },
          {
            token: new_liquidity?.token_y,
            amount: toReadableNumber(
              new_liquidity?.token_y?.decimals,
              new_liquidity?.amount_y
            ),
          },
        ],
      },
    });

    add_liquidity(new_liquidity)
      .then(({ txHash, response }: any) => {
        addLiquidityTxHashHandle(txHash).then((link) => {
          setAddLiquidityButtonLoading(false);
          processTransactionSuccess({
            transactionId,
            transactionResponse: response,
            onClose: () => history.replace(link),
          });
          // transtionsExcuteDataStore.setActionStatus('resolved');
          // transtionsExcuteDataStore.setActionData({
          //   status: 'success',
          //   transactionResponse: response,
          //   onClose: () => history.replace(link),
          // });
        });
      })
      .catch((e) => {
        processTransactionError({
          error: e,
          transactionId,
        });
        setAddLiquidityButtonLoading(false);
      });
  }

  function addLiquidityForCurveAndBidAskMode() {
    const transactionId = String(Date.now());
    /**
     *  已知条件:
     *  bin的数量、一个bin里 slot的数量、leftPoint、rightPoint、tokenXAmount、tokenYAmount
     *  当前点位为point，以slot为单位 下一跳是 point + slot
     *  当前点位为point，以bin为单位 下一跳是 point + bin * slots
     *  最小的bin的高度就是等差的值 为dis
     **/
    setAddLiquidityButtonLoading(true);
    let nftList: IAddLiquidityInfo[] = [];
    nftList = getLiquidityForCurveAndBidAskMode();
    if (!nftList) {
      setAddLiquidityButtonLoading(false);
      return;
    }
    /**
     * 计算出 nftList token x tokeny 的数量，这是需要的总数量
     * tokenXAmount_nonDivisible，tokenYAmount_nonDivisible 是输入的总数量
     * 单边只有一个nft且包含当前点位的，输入的量可能会多余，所以不采用输入的值作为参数，而是采用实际使用的值作为参数
     */
    let last_total_needed_token_x_amount = Big(0);
    let last_total_needed_token_y_amount = Big(0);
    nftList.forEach((nft: IAddLiquidityInfo) => {
      const { amount_x, amount_y } = nft;
      last_total_needed_token_x_amount = last_total_needed_token_x_amount.plus(
        amount_x || 0
      );
      last_total_needed_token_y_amount = last_total_needed_token_y_amount.plus(
        amount_y || 0
      );
    });
    console.log('heyyo', tokenX);
    processTransactionPending({
      transactionId,
      page: constTransactionPage.pool,
      data: {
        prefix: 'Supplying',
        tokens: [
          {
            token: tokenX,
            amount: tokenXAmount,
          },
          {
            symbol: '+',
          },
          {
            token: tokenY,
            amount: tokenYAmount,
          },
        ],
      },
    });
    batch_add_liquidity({
      liquidityInfos: nftList,
      token_x: tokenX,
      token_y: tokenY,
      amount_x: last_total_needed_token_x_amount.toFixed(),
      amount_y: last_total_needed_token_y_amount.toFixed(),
      selectedWalletId: selector.store.getState().selectedWalletId,
    })
      .then(({ txHash, response }: any) => {
        addLiquidityTxHashHandle(txHash).then((link) => {
          setAddLiquidityButtonLoading(false);
          processTransactionSuccess({
            transactionId,
            transactionResponse: response,
            onClose: () => history.replace(link),
          });
        });
      })
      .catch((e) => {
        setAddLiquidityButtonLoading(false);
        processTransactionError({
          error: e,
          transactionId,
        });
      });
  }

  function getMax(token: TokenMetadata, balance: string) {
    return token.id !== WRAP_NEAR_CONTRACT_ID
      ? balance
      : Number(balance) <= 0.5
      ? '0'
      : String(Number(balance) - 0.5);
  }
  function getButtonText() {
    let txt: any = (
      <FormattedMessage id="add_liquidity" defaultMessage="Add Liquidity" />
    );
    if (!currentSelectedPool?.pool_id) {
      txt = <FormattedMessage id="no_pool" defaultMessage="No Pool" />;
    } else if (invalidRange) {
      txt = (
        <FormattedMessage id="update_range" defaultMessage="Update Range" />
      );
    } else if (onlyAddXToken && +tokenXAmount == 0) {
      txt = (
        <FormattedMessage
          id="input_amount"
          defaultMessage="Input Amount"
        ></FormattedMessage>
      );
    } else if (onlyAddYToken && +tokenYAmount == 0) {
      txt = (
        <FormattedMessage
          id="input_amount"
          defaultMessage="Input Amount"
        ></FormattedMessage>
      );
    } else if (
      !onlyAddXToken &&
      !onlyAddYToken &&
      (+tokenXAmount == 0 || +tokenYAmount == 0)
    ) {
      txt = (
        <FormattedMessage
          id="input_amount"
          defaultMessage="Input Amount"
        ></FormattedMessage>
      );
    } else if (
      +tokenXAmount > 0 &&
      new BigNumber(tokenXAmount).isGreaterThan(
        getMax(tokenX, tokenXBalanceFromNear)
      )
    ) {
      txt = (
        <FormattedMessage
          id="not_enough_balance"
          defaultMessage="Not Enough Balance"
        />
      );
    } else if (
      +tokenYAmount > 0 &&
      new BigNumber(tokenYAmount).isGreaterThan(
        getMax(tokenY, tokenYBalanceFromNear)
      )
    ) {
      txt = (
        <FormattedMessage
          id="not_enough_balance"
          defaultMessage="Not Enough Balance"
        />
      );
    }
    return txt;
  }
  function getButtonStatus() {
    const condition1 = currentSelectedPool?.pool_id;
    let condition2;
    if (onlyAddXToken) {
      condition2 =
        +tokenXAmount > 0 &&
        new BigNumber(
          getMax(tokenX, tokenXBalanceFromNear)
        ).isGreaterThanOrEqualTo(tokenXAmount);
    } else if (onlyAddYToken) {
      condition2 =
        +tokenYAmount > 0 &&
        new BigNumber(
          getMax(tokenY, tokenYBalanceFromNear)
        ).isGreaterThanOrEqualTo(tokenYAmount);
    } else if (!invalidRange) {
      condition2 =
        +tokenXAmount > 0 &&
        new BigNumber(
          getMax(tokenX, tokenXBalanceFromNear)
        ).isGreaterThanOrEqualTo(tokenXAmount) &&
        +tokenYAmount > 0 &&
        new BigNumber(
          getMax(tokenY, tokenYBalanceFromNear)
        ).isGreaterThanOrEqualTo(tokenYAmount);
    }
    return !(condition1 && condition2);
  }
  const isAddLiquidityDisabled =
    getButtonStatus() ||
    configV2.BLACK_LIST_DCL_POOL_IDS_IN_POOLS.includes(
      currentSelectedPool?.pool_id
    );

  const add_lp_func =
    liquidityShape === 'Spot'
      ? addLiquiditySpot
      : addLiquidityForCurveAndBidAskMode;

  return (
    <div
      className={`w-full xs:w-full md:w-full flex flex-col justify-between self-stretch mt-5`}
    >
      {isSignedIn ? (
        <GradientButton
          color="#fff"
          className={`add_lp_func w-full h-12 text-center text-base text-white focus:outline-none ${
            isAddLiquidityDisabled ? 'opacity-40' : ''
          }`}
          loading={addLiquidityButtonLoading}
          disabled={addLiquidityButtonLoading || isAddLiquidityDisabled}
          btnClassName={`${isAddLiquidityDisabled ? 'cursor-not-allowed' : ''}`}
          onClick={add_lp_func}
        >
          <ButtonTextWrapper
            loading={addLiquidityButtonLoading}
            Text={() => <>{getButtonText()}</>}
          />
        </GradientButton>
      ) : (
        <ConnectToNearBtn />
      )}
    </div>
  );
}
