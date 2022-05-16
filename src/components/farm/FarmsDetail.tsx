import React, { useEffect, useRef, useState, useContext, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { isMobile } from '~utils/device';
import {
  ArrowLeftIcon,
  FreeIcon,
  LockIcon,
  LightningIcon,
  GoldLevel1,
  GoldLevel2,
  GoldLevel3,
  GoldLevel4,
  LockedIcon,
  UnLockedIcon,
} from '~components/icon/FarmBoost';
import { useHistory, useLocation } from 'react-router-dom';
import getConfig from '../../services/config';
import { LinkIcon, ArrowDownHollow } from '~components/icon';
import {
  FarmBoost,
  Seed,
  getServerTime,
  stake_boost,
  get_config,
  unStake_boost,
  claimRewardBySeed_boost,
  lock_free_seed,
  force_unlock,
} from '~services/farm';
import { getCurrentWallet, WalletContext } from '../../utils/sender-wallet';
import {
  toPrecision,
  toReadableNumber,
  toNonDivisibleNumber,
  toInternationalCurrencySystem,
  percent,
  formatWithCommas,
  calculateFairShare,
} from '../../utils/numbers';
import BigNumber from 'bignumber.js';
import {
  GradientButton,
  ButtonTextWrapper,
  OprationButton,
  ConnectToNearButton,
  ConnectToNearBtn,
  SolidButton,
} from '~components/button/Button';
import Modal from 'react-modal';
import { usePool } from '~state/pool';
import { ModalClose, Calc } from '~components/icon';
import { unWrapToken, TokenMetadata } from '../../services/ft-contract';
import { addLiquidityToPool, Pool } from '~services/pool';
import {
  useWalletTokenBalances,
  useDepositableBalance,
} from '../../state/token';
import { WRAP_NEAR_CONTRACT_ID } from '~services/wrap-near';
import { useTokens, getDepositableBalance } from '~state/token';
import { scientificNotationToString, divide } from '../../utils/numbers';
import { NewFarmInputAmount } from '~components/forms/InputAmount';
import Alert from '~components/alert/Alert';
import { mftGetBalance } from '~services/mft-contract';
import { getMftTokenId, toRealSymbol } from '~utils/token';
import {
  LP_TOKEN_DECIMALS,
  LP_STABLE_TOKEN_DECIMALS,
} from '../../services/m-token';
import { Checkbox, CheckboxSelected } from '~components/icon';
import { CalcEle } from '~components/farm/CalcModelBooster';
import ReactTooltip from 'react-tooltip';
import QuestionMark from '~components/farm/QuestionMark';
import { wallet } from '~services/near';
import { ExternalLinkIcon } from '~components/icon/Risk';
import { FaAngleUp, FaAngleDown } from 'react-icons/fa';
import { useDayVolume } from '../../state/pool';
import { getPool } from '~services/indexer';
const ONLY_ZEROS = /^0*\.?0*$/;
const { STABLE_POOL_IDS, FARM_LOCK_SWITCH } = getConfig();
export default function FarmsDetail(props: {
  detailData: Seed;
  emptyDetailData: Function;
  tokenPriceList: any;
}) {
  const { detailData, emptyDetailData, tokenPriceList } = props;
  const history = useHistory();
  const pool = detailData.pool;
  const { token_account_ids } = pool;
  const tokens = useTokens(token_account_ids) || [];
  const goBacktoFarms = () => {
    history.replace('/farmsBoost');
    emptyDetailData();
  };
  const displaySymbols = () => {
    const symbols = pool?.token_symbols || [];
    let result = '';
    symbols.forEach((item: string, index: number) => {
      if (index == symbols.length - 1) {
        result += item === 'wNEAR' ? 'NEAR' : item;
      } else {
        result += item === 'wNEAR' ? 'NEAR' : item + '-';
      }
    });
    return result;
  };
  const displayImgs = () => {
    const tokenList: any[] = [];
    (tokens || []).forEach((token: any) => {
      const unWrapedToken = unWrapToken(token);
      tokenList.push(
        <label
          key={unWrapedToken.id}
          className={`h-11 w-11 xs:h-9 xs:w-9 md:h-9 md:w-9 rounded-full overflow-hidden border border-gradientFromHover -ml-1.5`}
        >
          <img src={unWrapedToken.icon} className="w-full h-full"></img>
        </label>
      );
    });
    return tokenList;
  };
  const goPoolPage = () => {
    const poolId = pool.id;
    window.open(`/pool/${poolId}`);
  };
  return (
    <div className={`m-auto lg:w-580px md:w-5/6 xs:w-11/12  xs:-mt-4 md:-mt-4`}>
      <div className="breadCrumbs flex items-center text-farmText text-base hover:text-white">
        <ArrowLeftIcon onClick={goBacktoFarms} className="cursor-pointer" />
        <label className="cursor-pointer" onClick={goBacktoFarms}>
          <FormattedMessage id="farms" />
        </label>
      </div>
      <div className="flex justify-between items-center mt-7 xs:mt-4 md:mt-4 xs:flex-col md:flex-col xs:items-start md:items-start">
        <div className="left flex items-center h-11 ml-3">
          <span className="flex">{displayImgs()}</span>
          <span className="flex items-center cursor-pointer text-white font-bold text-xl ml-4 xs:text-sm md:text-sm">
            {displaySymbols()}
          </span>
        </div>
        <div className="flex items-center" onClick={goPoolPage}>
          <label className="mx-2 text-sm text-primaryText hover:text-framBorder cursor-pointer">
            <FormattedMessage id="get_lp_token"></FormattedMessage>
          </label>
          <LinkIcon></LinkIcon>
        </div>
      </div>
      <StakeContainer
        detailData={detailData}
        tokenPriceList={tokenPriceList}
      ></StakeContainer>
    </div>
  );
}
function StakeContainer(props: { detailData: Seed; tokenPriceList: any }) {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [lpBalance, setLpBalance] = useState('0');
  const [showAddLiquidityEntry, setShowAddLiquidityEntry] = useState(false);
  const { detailData, tokenPriceList } = props;
  const pool = detailData.pool;
  function totalTvlPerWeekDisplay() {
    const farms = detailData.farmList;
    const rewardTokenIconMap = {};
    let totalPrice = 0;
    farms.forEach((farm: FarmBoost) => {
      const { id, decimals, icon } = farm.token_meta_data;
      const { daily_reward } = farm.terms;
      rewardTokenIconMap[id] = icon;
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != 'N/A') {
        const tokenAmount = toReadableNumber(decimals, daily_reward);
        totalPrice += +new BigNumber(tokenAmount)
          .multipliedBy(tokenPrice)
          .toFixed();
      }
    });
    totalPrice = +new BigNumber(totalPrice).multipliedBy(7).toFixed();
    const totalPriceDisplay =
      totalPrice == 0
        ? '-'
        : toInternationalCurrencySystem(totalPrice.toString(), 2);
    return (
      <>
        <span>{totalPriceDisplay}</span>
        <div className="flex items-center">
          {Object.values(rewardTokenIconMap).map(
            (icon: string, index: number) => {
              return (
                <img
                  src={icon}
                  key={index}
                  className={`w-4 h-4 rounded-full border border-greenColor ${
                    index != 0 ? '-ml-1' : ''
                  }`}
                ></img>
              );
            }
          )}
        </div>
      </>
    );
  }
  useEffect(() => {
    getStakeBalance();
  }, []);
  const getStakeBalance = async () => {
    if (!isSignedIn) {
      setShowAddLiquidityEntry(false);
    } else {
      const poolId = pool.id;
      const b = await mftGetBalance(getMftTokenId(poolId.toString()));
      if (new Set(STABLE_POOL_IDS || []).has(poolId?.toString())) {
        setLpBalance(toReadableNumber(LP_STABLE_TOKEN_DECIMALS, b));
      } else {
        setLpBalance(toReadableNumber(LP_TOKEN_DECIMALS, b));
      }
      const isEnded = detailData.farmList[0].status == 'Ended';
      if (isEnded) {
        setShowAddLiquidityEntry(false);
      } else {
        setShowAddLiquidityEntry(!Number(b));
      }
    }
  };
  return (
    <div className="mt-5">
      <div className="poolbaseInfo flex items-center justify-between">
        <div className="flex flex-col items-start bg-cardBg rounded-lg py-3.5 px-5 flex-grow mr-3.5">
          <span className="text-farmText text-sm">
            <FormattedMessage id="total_staked"></FormattedMessage>
          </span>
          <span className="text-white text-base mt-2.5">
            {`${
              Number(detailData.seedTvl) == 0
                ? '-'
                : `$${toInternationalCurrencySystem(detailData.seedTvl, 2)}`
            }`}
          </span>
        </div>
        <div className="flex flex-col items-start bg-cardBg rounded-lg py-3.5 px-5 flex-grow">
          <span className="text-farmText text-sm">
            <FormattedMessage id="rewards_week"></FormattedMessage>
          </span>
          <div className="flex items-center justify-between text-white text-base mt-2.5 w-full">
            {totalTvlPerWeekDisplay()}
          </div>
        </div>
      </div>
      <AddLiquidityEntryBar
        detailData={detailData}
        showAddLiquidityEntry={showAddLiquidityEntry}
      ></AddLiquidityEntryBar>
      <UserStakeBlock
        detailData={detailData}
        tokenPriceList={tokenPriceList}
        lpBalance={lpBalance}
      ></UserStakeBlock>
      <UserTotalUnClaimBlock
        detailData={detailData}
        tokenPriceList={tokenPriceList}
      ></UserTotalUnClaimBlock>
    </div>
  );
}

function AddLiquidityEntryBar(props: {
  detailData: Seed;
  showAddLiquidityEntry: any;
}) {
  const { detailData, showAddLiquidityEntry } = props;
  const [addLiquidityModalVisible, setAddLiquidityModalVisible] =
    useState(false);
  const poolA = detailData.pool;
  const poolId = poolA.id;
  const { pool } = usePool(poolId);
  const tokens = useTokens(pool?.tokenIds);
  const history = useHistory();
  let addLiquidityButtonLoading;
  function openAddLiquidityModal() {
    if (new Set(STABLE_POOL_IDS || []).has(poolId?.toString())) {
      history.push(`/sauce/${poolId}`);
    } else {
      setAddLiquidityModalVisible(true);
    }
  }
  function displaySymbols() {
    const symbols = poolA?.token_symbols || [];
    let result = '';
    symbols.forEach((item: string, index: number) => {
      if (index == symbols.length - 1) {
        result += item === 'wNEAR' ? 'NEAR' : item;
      } else {
        result += item === 'wNEAR' ? 'NEAR' : item + '-';
      }
    });
    return result;
  }
  if (!(tokens && tokens.length > 0 && pool)) {
    addLiquidityButtonLoading = true;
  } else {
    addLiquidityButtonLoading = false;
  }
  if (!showAddLiquidityEntry) return null;
  return (
    <div
      className="rounded-lg overflow-hidden mt-8"
      style={{ backgroundColor: 'rgba(29, 41, 50, 0.5)' }}
    >
      <div className="w-full bg-gradientFrom h-1.5"></div>
      <div className="flex items-center justify-center pt-6 pb-3 px-3">
        <p className="text-sm text-white">
          Get {displaySymbols()} Liquidity Provide Token (LP Tokens) first!
        </p>
        <GradientButton
          onClick={openAddLiquidityModal}
          color="#fff"
          loading={addLiquidityButtonLoading}
          className={`w-36 h-8 ml-5 text-center text-base text-white focus:outline-none font-semibold `}
        >
          <ButtonTextWrapper
            loading={addLiquidityButtonLoading}
            Text={() => (
              <FormattedMessage
                id="add_liquidity"
                defaultMessage="Add Liquidity"
              />
            )}
          />
        </GradientButton>
      </div>
      {addLiquidityModalVisible ? (
        <AddLiquidityModal
          title="add_liquidity"
          isOpen={addLiquidityModalVisible}
          onRequestClose={() => {
            setAddLiquidityModalVisible(false);
          }}
          tokens={tokens}
          pool={pool}
        ></AddLiquidityModal>
      ) : null}
    </div>
  );
}
function AddLiquidityModal(props: any) {
  const { pool, tokens } = props;
  return (
    <CommonModal {...props}>
      <AddLiquidity pool={pool} tokens={tokens} />
    </CommonModal>
  );
}
function CommonModal(props: any) {
  const { isOpen, onRequestClose, title } = props;
  const cardWidth = isMobile() ? '90vw' : '30vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          overflow: 'auto',
        },
        content: {
          outline: 'none',
          transform:
            title.trim() === 'add_liquidity' && !isMobile()
              ? 'translate(-50%, -70%)'
              : 'translate(-50%, -50%)',
        },
      }}
    >
      <div
        className="px-5 xs:px-3 md:px-3 py-6 rounded-2xl bg-cardBg overflow-auto"
        style={{
          width: cardWidth,
          maxHeight: cardHeight,
          border: '1px solid rgba(0, 198, 162, 0.5)',
        }}
      >
        <div className="title flex items-center justify-between">
          <label className="text-white text-xl">
            <FormattedMessage id={title}></FormattedMessage>
          </label>
          <ModalClose className="cursor-pointer" onClick={onRequestClose} />
        </div>
        {props.children}
      </div>
    </Modal>
  );
}

function DetailIcons({ tokens }: { tokens: TokenMetadata[] }) {
  return (
    <div className="flex items-center">
      {tokens.map((token) => {
        return token.icon ? (
          <img
            src={token.icon}
            className="w-4 h-4 rounded-full border border-gradientFrom"
            alt=""
          />
        ) : (
          <div className="w-4 h-4 rounded-full border border-gradientFrom bg-cardBg"></div>
        );
      })}
    </div>
  );
}

function DetailSymbol({
  tokens,
  id,
}: {
  tokens: TokenMetadata[];
  id: string | number;
}) {
  return (
    <div className="text-xs text-white flex items-center">
      <span className="pl-2">
        {tokens.map((token) => toRealSymbol(token.symbol)).join('-')}
      </span>

      <span
        className="cursor-pointer pl-2 py-0.5 text-gradientFrom"
        onClick={() => window.open(`/pool/${id}`, '_blank')}
      >
        <ExternalLinkIcon />
      </span>
    </div>
  );
}

function PoolDetailCard({
  tokens,
  pool,
}: {
  tokens: TokenMetadata[];
  pool: Pool;
}) {
  const [showDetail, setShowDetail] = useState(true);

  const [poolTVL, setPoolTVl] = useState<string>('');
  const h24Volume = useDayVolume(pool.id.toString());

  useEffect(() => {
    getPool(pool.id.toString()).then((pool) => {
      setPoolTVl(pool.tvl.toString());
    });
  }, []);

  const DetailRow = ({
    value,
    valueTitle,
    title,
  }: {
    value: JSX.Element | string;
    valueTitle?: string;
    title: JSX.Element | string;
  }) => {
    return (
      <div className="flex items-center justify-between pt-4">
        <div className="text-farmText">{title}</div>
        <div className="text-white" title={valueTitle}>
          {value}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-cardBg rounded-2xl p-6 text-xs w-full right-0">
      <div className="detail-header flex items-center justify-between">
        <div className="flex items-center">
          <DetailIcons tokens={tokens} />
          <DetailSymbol tokens={tokens} id={pool.id} />
        </div>
        <div
          className="cursor-pointer text-gradientFrom flex items-center"
          onClick={() => setShowDetail(!showDetail)}
        >
          <span>
            <FormattedMessage id="pool_stats" defaultMessage="Pool Stats" />
          </span>
          <span>
            <div className="pl-1">
              {showDetail ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </span>
        </div>
      </div>
      {!showDetail ? null : (
        <>
          {' '}
          <DetailRow
            title={
              <FormattedMessage
                id="TVL"
                defaultMessage={'TVL'}
              ></FormattedMessage>
            }
            value={`$${toInternationalCurrencySystem(poolTVL || '0', 2)}`}
            valueTitle={poolTVL}
          />
          <DetailRow
            title={toRealSymbol(tokens[0].symbol)}
            value={toInternationalCurrencySystem(
              toReadableNumber(tokens[0].decimals, pool.supplies[tokens[0].id]),
              2
            )}
            valueTitle={toReadableNumber(
              tokens[0].decimals,
              pool.supplies[tokens[0].id]
            )}
          />
          <DetailRow
            title={toRealSymbol(tokens[1].symbol)}
            value={toInternationalCurrencySystem(
              toReadableNumber(tokens[1].decimals, pool.supplies[tokens[1].id]),
              2
            )}
            valueTitle={toReadableNumber(
              tokens[1].decimals,
              pool.supplies[tokens[1].id]
            )}
          />
          <DetailRow
            title={
              <FormattedMessage id="h24_volume" defaultMessage="24h volume" />
            }
            value={
              h24Volume ? toInternationalCurrencySystem(h24Volume, 2) : '-'
            }
            valueTitle={h24Volume || ''}
          />
          <DetailRow
            title={
              <FormattedMessage
                id="Fee"
                defaultMessage="Fee"
              ></FormattedMessage>
            }
            value={`${pool.fee / 100}%`}
          />
        </>
      )}
    </div>
  );
}

function AddLiquidity(props: { pool: Pool; tokens: TokenMetadata[] }) {
  const { pool, tokens } = props;
  const [firstTokenAmount, setFirstTokenAmount] = useState<string>('');
  const [secondTokenAmount, setSecondTokenAmount] = useState<string>('');
  const [messageId, setMessageId] = useState<string>('add_liquidity');
  const [defaultMessage, setDefaultMessage] = useState<string>('Add Liquidity');
  const balances = useWalletTokenBalances(tokens.map((token) => token.id));

  const nearBalance = useDepositableBalance('NEAR');

  const [error, setError] = useState<Error>();
  const intl = useIntl();
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [canDeposit, setCanDeposit] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [preShare, setPreShare] = useState(null);
  const [modal, setModal] = useState(null);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  // if (!balances) return null;

  balances && (balances[WRAP_NEAR_CONTRACT_ID] = nearBalance);

  const changeFirstTokenAmount = (amount: string) => {
    setError(null);
    if (Object.values(pool.supplies).every((s) => s === '0')) {
      setFirstTokenAmount(amount);
      const zero = new BigNumber('0');
      if (
        zero.isLessThan(secondTokenAmount || '0') &&
        zero.isLessThan(amount || '0')
      ) {
        setPreShare(1);
      } else {
        setPreShare(null);
      }
      try {
        validate({
          firstAmount: amount,
          secondAmount: secondTokenAmount,
        });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = calculateFairShare({
        shareOf: pool.shareSupply,
        contribution: toNonDivisibleNumber(tokens[0].decimals, amount),
        totalContribution: pool.supplies[tokens[0].id],
      });
      let secondAmount = '';
      if (amount) {
        secondAmount = toReadableNumber(
          tokens[1].decimals,
          calculateFairShare({
            shareOf: pool.supplies[tokens[1].id],
            contribution: fairShares,
            totalContribution: pool.shareSupply,
          })
        );
      }
      setFirstTokenAmount(amount);
      setSecondTokenAmount(secondAmount);
      setPreShare(toReadableNumber(24, fairShares));
      try {
        validate({
          firstAmount: amount,
          secondAmount,
        });
      } catch (error) {
        setError(error);
      }
    }
  };

  const changeSecondTokenAmount = (amount: string) => {
    setError(null);
    if (Object.values(pool.supplies).every((s) => s === '0')) {
      setSecondTokenAmount(amount);
      const zero = new BigNumber('0');
      if (
        zero.isLessThan(firstTokenAmount || '0') &&
        zero.isLessThan(amount || '0')
      ) {
        setPreShare(1);
      } else {
        setPreShare(null);
      }
      try {
        validate({
          firstAmount: firstTokenAmount,
          secondAmount: amount,
        });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = calculateFairShare({
        shareOf: pool.shareSupply,
        contribution: toNonDivisibleNumber(tokens[1].decimals, amount),
        totalContribution: pool.supplies[tokens[1].id],
      });
      let firstAmount = '';
      if (amount) {
        firstAmount = toReadableNumber(
          tokens[0].decimals,
          calculateFairShare({
            shareOf: pool.supplies[tokens[0].id],
            contribution: fairShares,
            totalContribution: pool.shareSupply,
          })
        );
      }
      setSecondTokenAmount(amount);
      setFirstTokenAmount(firstAmount);
      setPreShare(toReadableNumber(24, fairShares));
      try {
        validate({
          firstAmount,
          secondAmount: amount,
        });
      } catch (error) {
        setError(error);
      }
    }
  };

  function validate({
    firstAmount,
    secondAmount,
  }: {
    firstAmount: string;
    secondAmount: string;
  }) {
    const firstTokenAmountBN = new BigNumber(firstAmount.toString());
    const firstTokenBalanceBN = new BigNumber(
      getMax(
        tokens[0].id,
        toReadableNumber(tokens[0].decimals, balances[tokens[0].id])
      )
    );
    const secondTokenAmountBN = new BigNumber(secondAmount.toString());
    const secondTokenBalanceBN = new BigNumber(
      getMax(
        tokens[1].id,
        toReadableNumber(tokens[1].decimals, balances[tokens[1].id])
      )
    );

    setCanSubmit(false);
    setCanDeposit(false);
    if (firstTokenAmountBN.isGreaterThan(firstTokenBalanceBN)) {
      setCanDeposit(true);
      const { id, decimals } = tokens[0];
      const modalData: any = {
        token: tokens[0],
        action: 'deposit',
      };
      getDepositableBalance(id, decimals).then((nearBalance) => {
        modalData.max = nearBalance;
        setModal(Object.assign({}, modalData));
      });
      setModal(modalData);

      return;
    }

    if (secondTokenAmountBN.isGreaterThan(secondTokenBalanceBN)) {
      setCanDeposit(true);
      // setMessageId('deposit_to_add_liquidity');
      // setDefaultMessage('Deposit to Add Liquidity');
      const { id, decimals } = tokens[1];
      const modalData: any = {
        token: tokens[1],
        action: 'deposit',
      };
      getDepositableBalance(id, decimals).then((nearBalance) => {
        modalData.max = nearBalance;
        setModal(Object.assign({}, modalData));
      });
      setModal(modalData);
      return;
    }

    if (ONLY_ZEROS.test(firstAmount)) {
      setCanSubmit(false);
      setMessageId('add_liquidity');
      setDefaultMessage('Add Liquidity');
      return;
    }

    if (ONLY_ZEROS.test(secondAmount)) {
      setCanSubmit(false);
      setMessageId('add_liquidity');
      setDefaultMessage('Add Liquidity');
      return;
    }

    if (!tokens[0]) {
      throw new Error(
        `${tokens[0].id} ${intl.formatMessage({
          id: 'is_not_exist',
        })}`
      );
    }

    if (!tokens[1]) {
      throw new Error(
        `${tokens[1].id} ${intl.formatMessage({
          id: 'is_not_exist',
        })}`
      );
    }

    setCanSubmit(true);
    setMessageId('add_liquidity');
    setDefaultMessage('Add Liquidity');
  }

  function submit() {
    return addLiquidityToPool({
      id: pool.id,
      tokenAmounts: [
        { token: tokens[0], amount: firstTokenAmount },
        { token: tokens[1], amount: secondTokenAmount },
      ],
    });
  }

  const ButtonRender = () => {
    if (!isSignedIn) {
      return <ConnectToNearBtn />;
    }

    const handleClick = async () => {
      if (canSubmit) {
        setButtonLoading(true);
        submit();
      }
    };
    return (
      <SolidButton
        disabled={!canSubmit || canDeposit}
        className="focus:outline-none  w-full text-lg"
        onClick={handleClick}
        loading={buttonLoading}
        padding={'p-4'}
      >
        <div className="flex items-center justify-center w-full m-auto">
          <div>
            <ButtonTextWrapper
              loading={buttonLoading}
              Text={() => (
                <FormattedMessage
                  id={messageId}
                  defaultMessage={defaultMessage}
                />
              )}
            />
          </div>
        </div>
      </SolidButton>
    );
  };

  const shareDisplay = () => {
    let result = '';
    let percentShare = '';
    let displayPercentShare = '';
    if (preShare && new BigNumber('0').isLessThan(preShare)) {
      const myShareBig = new BigNumber(preShare);
      if (myShareBig.isLessThan('0.001')) {
        result = '<0.001';
      } else {
        result = `${myShareBig.toFixed(3)}`;
      }
    } else {
      result = '-';
    }

    if (result !== '-') {
      percentShare = `${percent(
        preShare,
        scientificNotationToString(
          new BigNumber(toReadableNumber(24, pool.shareSupply))
            .plus(new BigNumber(preShare))
            .toString()
        )
      )}`;

      if (Number(percentShare) > 0 && Number(percentShare) < 0.01) {
        displayPercentShare = '< 0.01%';
      } else {
        displayPercentShare = `${toPrecision(percentShare, 2)}%`;
      }
    }

    return {
      lpTokens: result,
      shareDisplay: displayPercentShare,
    };
  };

  const getMax = function (id: string, amount: string) {
    return id !== WRAP_NEAR_CONTRACT_ID
      ? amount
      : Number(amount) <= 0.5
      ? '0'
      : String(Number(amount) - 0.5);
  };

  return (
    <>
      <div className="text-white outline-none ">
        <div className="mt-8">
          <div className="flex justify-end items-center text-sm text-right mb-1.5 text-farmText">
            <FormattedMessage id="balance" defaultMessage="Balance" />
            {':'}
            <span
              className="ml-1"
              title={toReadableNumber(
                tokens[0].decimals,
                balances?.[tokens[0].id]
              )}
            >
              {toPrecision(
                toReadableNumber(tokens[0].decimals, balances?.[tokens[0].id]),
                2,
                true
              )}
            </span>
          </div>
          <div className="flex items-center ">
            <NewFarmInputAmount
              className="w-full border border-transparent rounded"
              max={getMax(
                tokens[0].id,
                toReadableNumber(tokens[0].decimals, balances?.[tokens[0].id])
              )}
              onChangeAmount={changeFirstTokenAmount}
              value={firstTokenAmount}
              tokenSymbol={toRealSymbol(tokens[0].symbol)}
            />
          </div>
        </div>

        <div className="my-8">
          <div className="flex justify-end items-center text-sm text-right mb-1.5 text-farmText">
            <FormattedMessage id="balance" defaultMessage="Balance" />
            {':'}
            <span
              className="ml-1"
              title={toReadableNumber(
                tokens[1].decimals,
                balances?.[tokens[1].id]
              )}
            >
              {toPrecision(
                toReadableNumber(tokens[1].decimals, balances?.[tokens[1].id]),
                2,
                true
              )}
            </span>
          </div>
          <div className="flex items-center">
            <NewFarmInputAmount
              className="w-full border border-transparent rounded"
              max={getMax(
                tokens[1].id,
                toReadableNumber(tokens[1].decimals, balances?.[tokens[1].id])
              )}
              onChangeAmount={changeSecondTokenAmount}
              value={secondTokenAmount}
              tokenSymbol={toRealSymbol(tokens[1].symbol)}
            />
          </div>
        </div>
        {error ? (
          <div className="flex justify-center mb-8 ">
            <Alert level="warn" message={error.message} />
          </div>
        ) : null}
        <div className="flex justify-between flex-col bg-black bg-opacity-20 text-farmText text-sm mt-6 mb-4 border border-gradientFrom p-5 rounded-lg">
          <div className="flex items-center justify-between">
            <label>
              <FormattedMessage id="lp_tokens" defaultMessage={'LP tokens'} />
            </label>
            <span className="text-white text-sm">
              {canDeposit ? '-' : shareDisplay().lpTokens}
            </span>
          </div>
          <div className="flex items-center justify-between pt-4">
            <label>
              <FormattedMessage id="Share" defaultMessage="Share" />
            </label>
            <span className="text-white text-sm">
              {!shareDisplay().shareDisplay || canDeposit
                ? '-'
                : shareDisplay().shareDisplay}
            </span>
          </div>
        </div>

        {canDeposit ? (
          <div className="flex items-center rounded-md mb-6 py-3 px-4 xs:px-2 border border-warnColor text-sm">
            <label className="text-warnColor ">
              <FormattedMessage id="oops" defaultMessage="Oops" />!
            </label>
            <label className="ml-2.5 text-warnColor ">
              <FormattedMessage id="you_do_not_have_enough" />{' '}
              {modal?.token?.symbol}.
            </label>
          </div>
        ) : null}

        <ButtonRender />
      </div>
      <div
        className="absolute pb-20 w-full right-0"
        style={{
          top: '102%',
          height: '300px',
        }}
      >
        <PoolDetailCard tokens={tokens} pool={pool} />
      </div>
    </>
  );
}
function UserTotalUnClaimBlock(props: {
  detailData: Seed;
  tokenPriceList: any;
}) {
  const { detailData, tokenPriceList } = props;
  const [claimLoading, setClaimLoading] = useState(false);
  const farms = detailData.farmList;
  const unClaimedTokens = useTokens(Object.keys(detailData.unclaimed || {}));
  function claimReward() {
    if (claimLoading) return;
    setClaimLoading(true);
    claimRewardBySeed_boost(detailData.seed_id)
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        setClaimLoading(false);
        // setError(error);
      });
  }
  function getTotalUnclaimedRewards() {
    let totalPrice = 0;
    let resultTip = '';
    unClaimedTokens?.forEach((token: TokenMetadata) => {
      // total price
      const { id, decimals, icon } = token;
      const amount = toReadableNumber(
        decimals,
        detailData.unclaimed[id] || '0'
      );
      const tokenPrice = tokenPriceList[id].price;
      if (tokenPrice && tokenPrice != 'N/A') {
        totalPrice += +amount * tokenPrice;
      }
      // rewards number
      let displayNum = '';
      if (new BigNumber('0').isEqualTo(amount)) {
        displayNum = '-';
      } else if (new BigNumber('0.001').isGreaterThan(amount)) {
        displayNum = '<0.001';
      } else {
        displayNum = new BigNumber(amount).toFixed(3, 1);
      }
      const itemHtml = `<div class="flex justify-between items-center h-8">
          <image class="w-5 h-5 rounded-full mr-7" src="${icon}"/>
          <label class="text-xs text-navHighLightText">${formatWithCommas(
            displayNum
          )}</label>
        </div>`;
      resultTip += itemHtml;
    });
    if (totalPrice == 0) {
      return {
        worth: <label className="opacity-30">$0</label>,
        showClaimButton: false,
        tip: resultTip,
      };
    } else if (new BigNumber('0.01').isGreaterThan(totalPrice)) {
      return {
        worth: '<$0.01',
        showClaimButton: true,
        tip: resultTip,
      };
    } else {
      return {
        worth: `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`,
        showClaimButton: true,
        tip: resultTip,
      };
    }
  }
  const unclaimedRewardsData = useMemo(() => {
    return getTotalUnclaimedRewards();
  }, [unClaimedTokens]);
  return (
    <div
      className="bg-cardBg rounded-2xl p-5"
      style={{ backgroundColor: 'rgba(29, 41, 50, 0.5)' }}
    >
      <div className="text-sm text-primaryText">
        <FormattedMessage id="unclaimed_rewards"></FormattedMessage>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div
          className="text-white text-right"
          data-class="reactTip"
          data-for={'unclaimedRewardId' + detailData.seed_id}
          data-place="top"
          data-html={true}
          data-tip={unclaimedRewardsData.tip}
        >
          <span className="text-xl text-white">
            {unclaimedRewardsData.worth}
          </span>
          <ReactTooltip
            id={'unclaimedRewardId' + detailData.seed_id}
            backgroundColor="#1D2932"
            border
            borderColor="#7e8a93"
            effect="solid"
          />
        </div>
        {unclaimedRewardsData.showClaimButton ? (
          <span
            className="flex items-center justify-center bg-deepBlue rounded-lg text-sm text-white h-8 w-20 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              claimReward();
            }}
          >
            <ButtonTextWrapper
              loading={claimLoading}
              Text={() => <FormattedMessage id="claim" />}
            />
          </span>
        ) : null}
      </div>
    </div>
  );
}
function UserStakeBlock(props: {
  detailData: Seed;
  tokenPriceList: any;
  lpBalance: string;
}) {
  const { detailData, tokenPriceList, lpBalance } = props;
  const [stakeModalVisible, setStakeModalVisible] = useState(false);
  const [unStakeModalVisible, setUnStakeModalVisible] = useState(false);
  const [stakeType, setStakeType] = useState('');
  const [unStakeType, setUnStakeType] = useState('');
  const [serverTime, setServerTime] = useState<number>();
  const [lockButtonStatus, setLockButtonStatus] = useState(false);
  const { pool, user_seed, unclaimed, min_locking_duration_sec } = detailData;
  const {
    free_amount = '0',
    locked_amount = '0',
    x_locked_amount = '0',
    unlock_timestamp,
    duration_sec,
  } = user_seed;
  const { shares_total_supply, tvl } = pool;
  const unClaimedTokens = useTokens(Object.keys(unclaimed || {}));
  const DECIMALS = new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())
    ? LP_STABLE_TOKEN_DECIMALS
    : LP_TOKEN_DECIMALS;

  const userTotalStake = toReadableNumber(
    DECIMALS,
    new BigNumber(free_amount).plus(locked_amount).toFixed()
  );
  const totalPower = toReadableNumber(
    DECIMALS,
    new BigNumber(free_amount).plus(x_locked_amount).toFixed()
  );
  const freeAmount = toReadableNumber(DECIMALS, free_amount);
  const lockAmount = toReadableNumber(DECIMALS, locked_amount);
  const xlocked_amount = toReadableNumber(DECIMALS, x_locked_amount);
  useEffect(() => {
    get_server_time();
  }, []);
  const get_server_time = async () => {
    const timestamp = await getServerTime();
    setServerTime(timestamp);
  };
  function showLpAmount() {
    const totalSharesBigNumber = new BigNumber(userTotalStake);
    if (totalSharesBigNumber.isEqualTo(0)) {
      return '-';
    } else if (totalSharesBigNumber.isLessThan('0.001')) {
      return '<0.001';
    } else {
      return toPrecision(userTotalStake, 3);
    }
  }
  function showLpWorth() {
    const poolLpAmount = Number(
      toReadableNumber(DECIMALS, shares_total_supply)
    );
    const userLpAmount = Number(userTotalStake);
    if (poolLpAmount == 0 || userLpAmount == 0) {
      return <label className="opacity-30">$0</label>;
    } else {
      const userLpWorth = ((userLpAmount * tvl) / poolLpAmount).toString();
      const userLpWorthBigNumber = new BigNumber(userLpWorth);
      if (userLpWorthBigNumber.isEqualTo(0)) {
        return '$0';
      } else if (userLpWorthBigNumber.isLessThan(0.001)) {
        return '<$0.001';
      } else {
        return '$' + toPrecision(userLpWorth, 3);
      }
    }
  }
  function displayLpBalance() {
    return toPrecision(lpBalance || '0', 3);
  }
  function closeStakeModalVisible() {
    setStakeType('');
    setStakeModalVisible(false);
  }
  function closeUnStakeModalVisible() {
    setUnStakeType('');
    setUnStakeModalVisible(false);
  }
  function openStakeModalVisible(stakeType: string) {
    setStakeType(stakeType);
    setStakeModalVisible(true);
  }
  function openUnStakeModalVisible(unStakeType: string) {
    setUnStakeType(unStakeType);
    setUnStakeModalVisible(true);
  }
  function displayRewards(stakeType: string) {
    let percent: number;
    if (stakeType == 'free') {
      percent = Number(freeAmount) / Number(totalPower);
    } else {
      percent = Number(xlocked_amount) / Number(totalPower);
    }
    let totalPrice = 0;
    unClaimedTokens?.forEach((token: TokenMetadata) => {
      const { id, decimals } = token;
      const amount = toReadableNumber(
        decimals,
        detailData.unclaimed[id] || '0'
      );
      const tokenPrice = tokenPriceList[id].price;
      if (tokenPrice && tokenPrice != 'N/A') {
        totalPrice += +amount * tokenPrice;
      }
    });
    totalPrice = totalPrice * percent;
    if (totalPrice == 0) {
      return '$0';
    } else if (new BigNumber('0.01').isGreaterThan(totalPrice)) {
      return '<$0.01';
    } else {
      return `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`;
    }
  }
  function displayLp(lp: string) {
    if (new BigNumber(lp).isLessThan('0.001')) {
      return '<0.001';
    } else {
      return toPrecision(lp, 3);
    }
  }
  function displayBooster() {
    const rate = Number(xlocked_amount) / Number(lockAmount);
    return toPrecision(rate.toString(), 2);
  }
  function displayDuration() {
    const month = duration_sec / 2592000;
    if (serverTime && unlock_timestamp) {
      // get reset time
      const restTime_sec = new BigNumber(unlock_timestamp)
        .minus(serverTime)
        .dividedBy(1000000000)
        .toNumber();
      const pecent = 1 - restTime_sec / duration_sec;
      // get start~end
      const end_sec = unlock_timestamp / 1000000000;
      const begin_sec = end_sec - duration_sec;
      const durationDOMStr = displayLockDuration(begin_sec, end_sec);
      return (
        <>
          <div className="flex items-center mb-2">
            {`${toPrecision(
              (pecent * 100).toString(),
              3
            )} % of ${month} months`}
            <div
              className="text-white text-right ml-1"
              data-class="reactTip"
              data-for="duration_start_end_id"
              data-place="top"
              data-html={true}
              data-tip={durationDOMStr}
            >
              <QuestionMark></QuestionMark>
              <ReactTooltip
                id="duration_start_end_id"
                backgroundColor="#1D2932"
                border
                borderColor="#7e8a93"
                effect="solid"
              />
            </div>
          </div>
          <div
            className="rounded-lg bg-darkBg overflow-hidden"
            style={{ width: '150px', height: '4px' }}
          >
            <div
              className="rounded-2xl bg-lightGreyColor h-full"
              style={{ width: pecent * 100 + '%' }}
            ></div>
          </div>
        </>
      );
    }
    return '';
  }
  const displayLockDuration = (begin_sec: number, end_sec: number) => {
    const startDate = new Date(begin_sec * 1000).toString();
    const endDate = new Date(end_sec * 1000).toString();
    const startArr = startDate.split(' ');
    const endArr = endDate.split(' ');
    const startDisplay = `${startArr[2]} ${startArr[1]}, ${startArr[3]}`;
    const endDisplay = `${endArr[2]} ${endArr[1]}, ${endArr[3]}`;
    const hm = endArr[4].substring(0, 5);
    return `<span class="text-farmText text-xs">${hm} ${startDisplay} - ${endDisplay}</span>`;
  };
  const isEnded = detailData.farmList[0].status == 'Ended';
  return (
    <div className="bg-cardBg rounded-2xl p-5 mt-5">
      <div className="text-sm text-primaryText">
        <FormattedMessage id="you_staked" />
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="text-xl text-white">{showLpWorth()}</span>
        <span className="text-sm text-primaryText">
          {showLpAmount()} <FormattedMessage id="lp_tokens"></FormattedMessage>
        </span>
      </div>
      <div className="stakeEntryArea">
        {Number(userTotalStake) > 0 ||
        Number(lpBalance) == 0 ||
        isEnded ? null : (
          <div className="pt-5 mt-5 borde border-dashed border-dashBorderColor border-t-2 border-opacity-20">
            <div className="flex justify-between items-center bg-black bg-opacity-20 rounded-lg py-2 pl-4 pr-2 border border-greenColor">
              <span className="text-farmText text-sm">
                <FormattedMessage id="you_have" />{' '}
                <label className="text-white">{displayLpBalance()}</label> LP
                <FormattedMessage id="tokens_small" />
              </span>
              <GradientButton
                onClick={() => {
                  openStakeModalVisible('init');
                }}
                color="#fff"
                className={`w-28 h-8 text-center text-sm text-white focus:outline-none`}
              >
                <FormattedMessage id="stake"></FormattedMessage>
              </GradientButton>
            </div>
          </div>
        )}
        {Number(userTotalStake) == 0 ? null : (
          <div className="pt-5 mt-5 borde border-dashed border-dashBorderColor border-t-2 border-opacity-20">
            {min_locking_duration_sec == 0 || FARM_LOCK_SWITCH == 0 ? (
              <div className="flex justify-end">
                <GradientButton
                  onClick={() => {
                    openStakeModalVisible('free');
                  }}
                  color="#fff"
                  className={`w-36 h-8 text-center text-sm text-white focus:outline-none mr-3 ${
                    isEnded ? 'hidden' : ''
                  }`}
                >
                  <FormattedMessage id="append"></FormattedMessage>
                </GradientButton>
                <OprationButton
                  onClick={() => {
                    openUnStakeModalVisible('free');
                  }}
                  color="#fff"
                  className={`flex items-center justify-center w-36 h-8 text-center text-base text-white focus:outline-none font-semibold bg-lightGreyColor`}
                >
                  <FormattedMessage id="unstake" defaultMessage="Unstake" />
                </OprationButton>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="freeBox rounded-lg bg-boostBg w-1 flex-grow mr-3 px-3.5">
                  <div className="flex items-center justify-center bg-freeTitleBg h-6 text-white text-sm rounded-b-lg w-40 mx-auto mb-3">
                    <FormattedMessage id="ordinary_stake" />
                  </div>
                  <div className="center h-32">
                    {Number(freeAmount) > 0 ? (
                      <>
                        <CommonLine title="lp_tokens">
                          <span className="text-white text-sm">
                            {displayLp(freeAmount)}
                          </span>
                        </CommonLine>
                        <CommonLine title="Rewards">
                          <span className="text-white text-sm">
                            {displayRewards('free')}
                          </span>
                        </CommonLine>
                        <div className="flex justify-end">
                          <span
                            onClick={() => {
                              openStakeModalVisible('freeToLock');
                            }}
                            className={`text-greenColor text-sm cursor-pointer ${
                              isEnded ? 'hidden' : ''
                            }`}
                          >
                            <FormattedMessage id="change_to_lock" /> {'>'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="freeEmpty flex flex-col items-center">
                        <span className="my-8">
                          <FreeIcon></FreeIcon>
                        </span>
                        <span className="text-sm text-primaryText">
                          <FormattedMessage id="unstaked_anytime_no_booster" />
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="my-3">
                    {Number(freeAmount) > 0 ? (
                      <div className="flex justify-between">
                        <GradientButton
                          onClick={() => {
                            openStakeModalVisible('free');
                          }}
                          color="#fff"
                          className={`w-1/2 h-8 text-center text-sm text-white focus:outline-none mr-3 ${
                            isEnded ? 'hidden' : ''
                          }`}
                        >
                          <FormattedMessage id="append"></FormattedMessage>
                        </GradientButton>
                        <OprationButton
                          onClick={() => {
                            openUnStakeModalVisible('free');
                          }}
                          color="#fff"
                          className={`flex items-center justify-center w-1/2 h-8 text-center text-base text-white focus:outline-none font-semibold bg-lightGreyColor`}
                        >
                          <FormattedMessage
                            id="unstake"
                            defaultMessage="Unstake"
                          />
                        </OprationButton>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <GradientButton
                          onClick={() => {
                            openStakeModalVisible('free');
                          }}
                          color="#fff"
                          className={`w-1/2 h-8 text-center text-sm text-white focus:outline-none mr-3 ${
                            isEnded ? 'hidden' : ''
                          }`}
                        >
                          <FormattedMessage id="stake"></FormattedMessage>
                        </GradientButton>
                      </div>
                    )}
                  </div>
                </div>
                <div className="lockBox rounded-lg bg-boostBg w-1 flex-grow px-3.5">
                  <div className="flex items-center justify-center bg-lockTitleBg h-6 text-white text-sm rounded-b-lg w-40 mx-auto mb-3">
                    <FormattedMessage id="locking_stake" />
                  </div>
                  <div className="center h-32">
                    {Number(lockAmount) > 0 ? (
                      <div>
                        <CommonLine title="lp_tokens">
                          <span className="text-white text-sm">
                            {displayLp(lockAmount)}
                          </span>
                        </CommonLine>
                        <CommonLine title="Rewards">
                          <span className="text-white text-sm">
                            {displayRewards('lock')}
                          </span>
                        </CommonLine>
                        <CommonLine title="booster">
                          <div className="flex items-center text-white text-sm">
                            x{displayBooster()} <LightningIcon></LightningIcon>
                          </div>
                        </CommonLine>
                        <CommonLine title="stake_for">
                          <div className="flex flex-col items-center text-white text-sm">
                            {displayDuration()}
                          </div>
                        </CommonLine>
                      </div>
                    ) : (
                      <div className="lockEmpty flex flex-col items-center">
                        <div className="flex items-center justify-center my-6">
                          <LockIcon></LockIcon>
                        </div>
                        <p className="text-primaryText text-sm text-center">
                          <FormattedMessage id="lock_your_lp_tokens_with_booster" />
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="my-3">
                    {Number(lockAmount) > 0 ? (
                      <div className="flex items-center justify-center ">
                        <GradientButton
                          onClick={() => {
                            openStakeModalVisible('lock');
                          }}
                          color="#fff"
                          className={`w-1/2 h-8 text-center text-sm text-white focus:outline-none mr-3 ${
                            isEnded ? 'hidden' : ''
                          }`}
                        >
                          <FormattedMessage id="append"></FormattedMessage>
                        </GradientButton>
                        <OprationButton
                          onClick={() => {
                            openUnStakeModalVisible('lock');
                          }}
                          onMouseOver={() => {
                            setLockButtonStatus(true);
                          }}
                          onMouseLeave={() => {
                            setLockButtonStatus(false);
                          }}
                          color="#fff"
                          // unLockedbg
                          className={`flex items-center justify-center w-28 h-8 text-center text-base text-white focus:outline-none font-semibold bg-lockedBg`}
                        >
                          {lockButtonStatus ? (
                            <UnLockedIcon></UnLockedIcon>
                          ) : (
                            <LockedIcon></LockedIcon>
                          )}
                        </OprationButton>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <GradientButton
                          onClick={() => {
                            openStakeModalVisible('lock');
                          }}
                          color="#fff"
                          className={`w-1/2 h-8 text-center text-sm text-white focus:outline-none mr-3 ${
                            isEnded ? 'hidden' : ''
                          }`}
                        >
                          <FormattedMessage id="stake"></FormattedMessage>
                        </GradientButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {stakeModalVisible ? (
        <StakeModal
          title="stake"
          isOpen={stakeModalVisible}
          detailData={detailData}
          onRequestClose={closeStakeModalVisible}
          lpBalance={lpBalance}
          stakeType={stakeType}
          serverTime={serverTime}
          tokenPriceList={tokenPriceList}
        ></StakeModal>
      ) : null}
      {unStakeModalVisible ? (
        <UnStakeModal
          title="unstake"
          isOpen={unStakeModalVisible}
          detailData={detailData}
          onRequestClose={closeUnStakeModalVisible}
          unStakeType={unStakeType}
          serverTime={serverTime}
          tokenPriceList={tokenPriceList}
        ></UnStakeModal>
      ) : null}
    </div>
  );
}
function StakeModal(props: {
  title: string;
  isOpen: boolean;
  detailData: Seed;
  onRequestClose: Function;
  lpBalance: string;
  stakeType: string;
  serverTime: number;
  tokenPriceList: any;
}) {
  const {
    title,
    isOpen,
    onRequestClose,
    detailData,
    lpBalance,
    stakeType,
    serverTime,
    tokenPriceList,
  } = props;
  const {
    pool,
    min_locking_duration_sec,
    user_seed,
    total_seed_amount,
    min_deposit,
  } = detailData;
  const DECIMALS = new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())
    ? LP_STABLE_TOKEN_DECIMALS
    : LP_TOKEN_DECIMALS;

  const {
    free_amount = '0',
    locked_amount = '0',
    x_locked_amount = '0',
    unlock_timestamp,
    duration_sec,
  } = user_seed;
  const freeAmount = toReadableNumber(DECIMALS, free_amount);
  const lockedAmount = toReadableNumber(DECIMALS, locked_amount);
  const [amount, setAmount] = useState(
    stakeType == 'freeToLock' ? freeAmount : ''
  );
  const [stakeLoading, setStakeLoading] = useState(false);
  const [amountAvailableCheck, setAmountAvailableCheck] = useState(true);
  const [lockDataList, setLockDataList] = useState<Lock[]>([]);
  const [selectedLockData, setSelectedLockData] = useState<Lock>(null);
  const [selectedLockPrice, setSelectedLockPrice] = useState('');
  const [acceptSlashPolicy, setAcceptSlashPolicy] = useState<boolean>(false);
  const [switchButton, setSwitchButton] = useState<boolean>(true);
  const [showCalc, setShowCalc] = useState(false);
  const intl = useIntl();
  useEffect(() => {
    if (stakeType !== 'free') {
      const goldList = [
        <GoldLevel1></GoldLevel1>,
        <GoldLevel2></GoldLevel2>,
        <GoldLevel3></GoldLevel3>,
        <GoldLevel4></GoldLevel4>,
      ];
      const lockable_duration_month = [1, 3, 6, 12];
      const lockable_duration_second = lockable_duration_month.map(
        (duration: number, index: number) => {
          return {
            second: duration * 2592000,
            month: duration,
            icon: goldList[index],
          };
        }
      );
      let restTime_sec = 0;
      if (user_seed.unlock_timestamp) {
        restTime_sec = new BigNumber(user_seed.unlock_timestamp)
          .minus(serverTime)
          .dividedBy(1000000000)
          .toNumber();
      }
      get_config().then((config) => {
        const list: any = [];
        const { maximum_locking_duration_sec, max_locking_multiplier } = config;
        lockable_duration_second.forEach(
          (item: { second: number; month: number; icon: any }, index) => {
            if (
              item.second >= Math.max(min_locking_duration_sec, restTime_sec) &&
              item.second <= maximum_locking_duration_sec
            ) {
              const locking_multiplier =
                ((max_locking_multiplier - 10000) * item.second) /
                (maximum_locking_duration_sec * 10000);
              list.push({
                ...item,
                multiplier: locking_multiplier,
              });
            }
          }
        );
        setLockDataList(list);
        setSelectedLockData(list[0]);
      });
    }
  }, [stakeType]);
  useEffect(() => {
    getSelectedLockPrice();
  }, [amount, selectedLockData]);
  const displaySymbols = () => {
    const symbols = pool?.token_symbols || [];
    let result = '';
    symbols.forEach((item: string, index: number) => {
      if (index == symbols.length - 1) {
        result += item === 'wNEAR' ? 'NEAR' : item;
      } else {
        result += item === 'wNEAR' ? 'NEAR' : item + '-';
      }
    });
    return result;
  };
  const displayImgs = () => {
    const tokenList: any[] = [];
    (pool.tokens_meta_data || []).forEach((token: any, index: number) => {
      const unWrapedToken = unWrapToken(token);
      tokenList.push(
        <label
          key={unWrapedToken.id}
          className={`h-8 w-8 rounded-full overflow-hidden border border-gradientFromHover ${
            index != 0 ? '-ml-1.5' : ''
          }`}
        >
          <img src={unWrapedToken.icon} className="w-full h-full"></img>
        </label>
      );
    });
    return tokenList;
  };
  function getSelectedLockPrice() {
    if (
      !(
        Number(amount) > 0 &&
        stakeType != 'free' &&
        min_locking_duration_sec > 0 &&
        FARM_LOCK_SWITCH != 0 &&
        switchButton &&
        selectedLockData
      )
    ) {
      setSelectedLockPrice('$ -');
      return;
    }
    // get total rewards price per day
    const DECIMALS = new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())
      ? LP_STABLE_TOKEN_DECIMALS
      : LP_TOKEN_DECIMALS;
    const totalSeedAmount = toReadableNumber(DECIMALS, total_seed_amount);
    const farms = detailData.farmList;
    let totalPrice = 0;
    farms.forEach((farm: FarmBoost) => {
      const { id, decimals } = farm.token_meta_data;
      const { daily_reward } = farm.terms;
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != 'N/A') {
        const tokenAmount = toReadableNumber(decimals, daily_reward);
        totalPrice += +new BigNumber(tokenAmount)
          .multipliedBy(tokenPrice)
          .toFixed();
      }
    });
    // get user stake pecent
    const pecent = +amount / (+totalSeedAmount + +amount);
    // get result price
    const lastPrice = selectedLockData.month * 30 * totalPrice * pecent;
    let display = '';
    if (new BigNumber('0').isEqualTo(lastPrice)) {
      display = '$ -';
    } else if (new BigNumber('0.001').isGreaterThan(lastPrice)) {
      display = '<$ 0.001';
    } else {
      display = `$${toInternationalCurrencySystem(lastPrice.toString(), 3)}`;
    }
    setSelectedLockPrice(display);
  }
  function changeAmount(value: string) {
    setAmount(value);
    // check
    const curValue = toNonDivisibleNumber(DECIMALS, value);
    if (curValue && new BigNumber(curValue).isLessThan(min_deposit)) {
      setAmountAvailableCheck(false);
    } else {
      setAmountAvailableCheck(true);
    }
  }
  function operationStake() {
    setStakeLoading(true);
    if (stakeType == 'freeToLock') {
      lock_free_seed({
        seed_id: detailData.seed_id,
        amount: toNonDivisibleNumber(DECIMALS, amount),
        duration_sec: selectedLockData.second,
      });
    } else {
      let msg = '';
      if (
        stakeType == 'free' ||
        min_locking_duration_sec == 0 ||
        FARM_LOCK_SWITCH == 0 ||
        (stakeType == 'init' && !switchButton)
      ) {
        msg = JSON.stringify('Free');
      } else if (stakeType == 'lock' || (stakeType == 'init' && switchButton)) {
        msg = JSON.stringify({
          Lock: {
            duration_sec: selectedLockData.second,
          },
        });
      }
      stake_boost({
        token_id: getMftTokenId(pool.id.toString()),
        amount: toNonDivisibleNumber(DECIMALS, amount),
        msg,
      });
    }
  }
  function getMultiplier(muti: number) {
    if (muti) {
      return Number(toPrecision(muti.toString(), 2)) + 1;
    }
    return '';
  }
  function getFinalUnLockTime() {
    if (!selectedLockData) return '';
    if (serverTime) {
      const temp_timestamp =
        serverTime / 1000000 + selectedLockData.second * 1000;
      const endLineArr = (new Date(temp_timestamp).toString() || '').split(' ');
      return `${endLineArr[2]} ${endLineArr[1]}, ${endLineArr[3]}`;
    }
    return '';
  }
  function FinalMuti() {
    if (!selectedLockData) return '';
    let preMuti = 0;
    if (+locked_amount) {
      preMuti = +x_locked_amount / +locked_amount;
    }
    const curMuti = selectedLockData.multiplier + 1;
    if (curMuti > preMuti) {
      return toPrecision(curMuti.toString(), 2);
    } else {
      const cur_x_locked_amount = Number(amount || 0) * curMuti;
      const final_x =
        (+cur_x_locked_amount + +x_locked_amount) /
        ((+amount || 0) + +locked_amount);
      return toPrecision(final_x.toString(), 2);
    }
  }
  const isDisabled =
    !amount ||
    !amountAvailableCheck ||
    new BigNumber(amount).isLessThanOrEqualTo(0) ||
    new BigNumber(amount).isGreaterThan(lpBalance) ||
    (stakeType !== 'free' &&
      min_locking_duration_sec > 0 &&
      FARM_LOCK_SWITCH != 0 &&
      switchButton &&
      !acceptSlashPolicy);
  return (
    <CommonModal title={title} isOpen={isOpen} onRequestClose={onRequestClose}>
      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center">
          <span className="flex">{displayImgs()}</span>
          <span className="flex items-center cursor-pointer text-white font-bold text-base ml-4 xs:text-sm md:text-sm">
            {displaySymbols()}
          </span>
        </div>
        <div className="text-farmText text-sm">
          {stakeType == 'freeToLock'
            ? toPrecision(freeAmount, 6)
            : toPrecision(lpBalance, 6)}
        </div>
      </div>
      <div className="flex justify-between items-center h-14 px-3 mt-4 bg-black bg-opacity-20 rounded-lg">
        <input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={({ target }) => changeAmount(target.value)}
          className="text-white text-lg focus:outline-non appearance-none leading-tight"
        ></input>
        <div className="flex items-center ml-2">
          <span
            onClick={() => {
              changeAmount(stakeType == 'freeToLock' ? freeAmount : lpBalance);
            }}
            className="text-xs text-farmText px-2 py-1 rounded-lg border border-maxBorderColor cursor-pointer"
          >
            Max
          </span>
        </div>
      </div>
      {amountAvailableCheck ? null : (
        <div className="flex justify-center mt-2">
          <Alert
            level="warn"
            message={
              intl.formatMessage({ id: 'more_than_seed' }) +
              toReadableNumber(DECIMALS, min_deposit)
            }
          />
        </div>
      )}
      {stakeType == 'free' ||
      min_locking_duration_sec == 0 ||
      FARM_LOCK_SWITCH == 0 ? null : (
        <div className="boostArea">
          <div className="flex justify-between items-center mb-1.5 mt-5">
            <p className="text-farmText text-sm">
              <FormattedMessage id="booster_expected_reward" />
            </p>
            {stakeType == 'init' ? (
              <span
                onClick={() => {
                  setSwitchButton(!switchButton);
                }}
                style={{ width: '29px', height: '16px' }}
                className={`flex items-center rounded-2xl transition-all cursor-pointer px-px ${
                  switchButton
                    ? 'justify-end bg-switchButtonGradientBg'
                    : 'justify-start bg-farmSbg'
                }`}
              >
                <label
                  style={{ width: '13px', height: '13px' }}
                  className={`rounded-full cursor-pointer bg-white ${
                    switchButton ? 'bg-white' : 'bg-farmRound'
                  }`}
                ></label>
              </span>
            ) : null}
          </div>
          <div className={switchButton ? '' : 'hidden'}>
            <div className="bg-black bg-opacity-20 rounded-lg px-10 pb-14 pt-10">
              <div
                className="flex items-center justify-center mb-12"
                style={{ height: '120px' }}
              >
                <div className="text-white mr-10">{selectedLockData?.icon}</div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <span className="text-white text-3xl ml-2">
                      x{getMultiplier(selectedLockData?.multiplier)}
                    </span>
                    <LightningIcon></LightningIcon>
                  </div>
                  <span className="text-white text-lg">
                    <FormattedMessage id="Rewards"></FormattedMessage>
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                {lockDataList.length == 1 ? (
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-farmText text-sm">
                        <FormattedMessage id="stake_for"></FormattedMessage>
                      </span>
                      <span className="text-white text-sm">
                        {lockDataList[0].month} M
                      </span>
                    </div>
                    <div className="flex justify-between items-center w-full mt-4">
                      <span className="text-farmText text-sm">
                        <FormattedMessage id="expected_reward" />
                      </span>
                      <span className="text-white text-sm">
                        {selectedLockPrice}
                      </span>
                    </div>
                  </div>
                ) : (
                  lockDataList.map((item: Lock, index: number) => {
                    return (
                      <div
                        key={index}
                        className={`flex items-center relative ${
                          index == 0
                            ? 'w-0'
                            : lockDataList.length == 2
                            ? 'w-full'
                            : 'w-1/' + (lockDataList.length - 1)
                        }`}
                      >
                        <div
                          style={{ height: '5px' }}
                          className={`rounded-lg w-full  ${
                            selectedLockData?.month >= item.month
                              ? 'bg-greenColor'
                              : 'bg-darkBg'
                          }`}
                        ></div>
                        <div
                          className={`absolute right-0 flex flex-col items-center transform translate-x-1/2 z-10`}
                        >
                          <label
                            className={`text-white text-sm h-5 whitespace-nowrap ${
                              selectedLockData?.month == item.month
                                ? 'visible'
                                : 'invisible'
                            }`}
                          >
                            {selectedLockPrice}
                          </label>
                          <span
                            onClick={() => {
                              setSelectedLockData(item);
                            }}
                            style={{ width: '21px', height: '21px' }}
                            className={`rounded-full my-2 cursor-pointer ${
                              selectedLockData?.month >= item.month
                                ? 'bg-greenColor'
                                : 'bg-darkBg'
                            } `}
                          ></span>
                          <label
                            className={`text-sm whitespace-nowrap ${
                              selectedLockData?.month == item.month
                                ? 'text-white'
                                : 'text-farmText'
                            }`}
                          >
                            {item.month} M
                          </label>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className="">
              {Number(lockedAmount) == 0 ? (
                <div className="flex justify-between items-center mt-3.5">
                  <span className="text-farmText text-sm">
                    <FormattedMessage id="unstake_time"></FormattedMessage>
                  </span>
                  <span className="text-white text-sm">
                    {getFinalUnLockTime()}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mt-3.5">
                    <span className="text-farmText text-sm">
                      <FormattedMessage id="final_booster" />
                    </span>
                    <span className="flex items-center text-white text-sm">
                      x{FinalMuti()} <LightningIcon></LightningIcon>
                    </span>
                  </div>
                  <div
                    className={`text-center p-3 border border-greenColor rounded-lg text-sm text-white mt-5 ${
                      Number(amount) > 0 ? '' : 'hidden'
                    }`}
                  >
                    <FormattedMessage id="existing_amount" />{' '}
                    <span className="text-greenColor">
                      {toPrecision(lockedAmount, 3)}
                    </span>{' '}
                    + <FormattedMessage id="append_amount" />{' '}
                    <span className="text-greenColor">
                      {toPrecision(amount, 3)}
                    </span>{' '}
                    <FormattedMessage id="will_be_able_to_unstaked_after" />{' '}
                    <span className="text-greenColor">
                      {getFinalUnLockTime()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center justify-center mt-5">
        <div
          className="flex items-center justify-center mb-4 cursor-pointer"
          onClick={() => {
            setShowCalc(!showCalc);
          }}
        >
          <Calc></Calc>
          <label className="text-sm text-white ml-3 mr-4  cursor-pointer">
            <FormattedMessage id="calculate_roi"></FormattedMessage>
          </label>
          <label
            className={
              'cursor-pointer ' + (showCalc ? 'transform rotate-180' : '')
            }
          >
            <ArrowDownHollow></ArrowDownHollow>
          </label>
        </div>
        <div className={'w-full ' + (showCalc ? 'block' : 'hidden')}>
          <CalcEle
            seed={detailData}
            tokenPriceList={tokenPriceList}
            lpTokenNumAmount={amount}
          ></CalcEle>
        </div>
      </div>

      <div className="mt-5">
        <GradientButton
          onClick={operationStake}
          color="#fff"
          disabled={stakeLoading || isDisabled}
          loading={stakeLoading || isDisabled}
          btnClassName={`${isDisabled ? 'cursor-not-allowed' : ''}`}
          className={`w-full h-14 text-center text-lg text-white focus:outline-none font-semibold`}
        >
          <ButtonTextWrapper
            loading={stakeLoading}
            Text={() => <FormattedMessage id="stake" />}
          />
        </GradientButton>
      </div>
      {stakeType == 'free' ||
      min_locking_duration_sec == 0 ||
      FARM_LOCK_SWITCH == 0 ? null : (
        <div
          className={`flex items-center justify-start mt-4 ${
            switchButton ? '' : 'hidden'
          }`}
        >
          <div className="flex items-start">
            <span
              className="mr-3 cursor-pointer mt-1"
              onClick={() => {
                setAcceptSlashPolicy(!acceptSlashPolicy);
              }}
            >
              {acceptSlashPolicy ? (
                <CheckboxSelected></CheckboxSelected>
              ) : (
                <Checkbox></Checkbox>
              )}
            </span>
            <div className="flex flex-col">
              <label className="text-white text-sm">
                <FormattedMessage id="accept_pay_slash_tip"></FormattedMessage>
              </label>
              <p className="text-xs text-primaryText mt-1">
                <FormattedMessage id="slash_policy_content" />
              </p>
            </div>
          </div>
        </div>
      )}
    </CommonModal>
  );
}
function UnStakeModal(props: {
  title: string;
  isOpen: boolean;
  detailData: Seed;
  unStakeType: string;
  onRequestClose: Function;
  serverTime: number;
  tokenPriceList: any;
}) {
  const {
    title,
    isOpen,
    onRequestClose,
    detailData,
    unStakeType,
    serverTime,
    tokenPriceList,
  } = props;
  const [amount, setAmount] = useState('');
  const [unStakeLoading, setUnStakeLoading] = useState(false);
  const [acceptSlashPolicy, setAcceptSlashPolicy] = useState<boolean>(false);
  const { pool, user_seed, seed_id, slash_rate, unclaimed } = detailData;
  const {
    free_amount = '0',
    locked_amount = '0',
    x_locked_amount = '0',
    unlock_timestamp,
    duration_sec,
  } = user_seed;
  const DECIMALS = new Set(STABLE_POOL_IDS || []).has(pool.id?.toString())
    ? LP_STABLE_TOKEN_DECIMALS
    : LP_TOKEN_DECIMALS;
  const lpBalance =
    unStakeType == 'free'
      ? toReadableNumber(DECIMALS, free_amount)
      : toReadableNumber(DECIMALS, locked_amount);
  const lockStatus = new BigNumber(unlock_timestamp).isLessThan(serverTime);
  const slashRate = slash_rate / 10000;

  function changeAmount(value: string) {
    setAmount(value);
  }
  function operationUnStake() {
    setUnStakeLoading(true);
    if (unStakeType == 'free') {
      unStake_boost({
        seed_id: seed_id,
        unlock_amount: '0',
        withdraw_amount: toNonDivisibleNumber(DECIMALS, amount),
      });
    } else if (lockStatus) {
      unStake_boost({
        seed_id: seed_id,
        unlock_amount: toNonDivisibleNumber(DECIMALS, amount),
        withdraw_amount: '0',
      });
    } else {
      force_unlock({
        seed_id: seed_id,
        unlock_amount: toNonDivisibleNumber(DECIMALS, amount),
      });
    }
  }
  function displayStatus() {
    if (lockStatus) {
      return <span className="text-white text-sm">expired</span>;
    } else {
      return <span className="text-redwarningColor text-sm">Not expired</span>;
    }
  }
  function displayDate() {
    const endLineArr = (
      new Date(unlock_timestamp / 1000000).toString() || ''
    ).split(' ');
    return `${endLineArr[2]} ${endLineArr[1]}, ${endLineArr[3]}`;
  }
  function getSlashAmount() {
    let result = '0';
    const restTime_sec = new BigNumber(unlock_timestamp)
      .minus(serverTime)
      .dividedBy(1000000000)
      .toNumber();
    const slashAmount =
      (restTime_sec / duration_sec) * slashRate * Number(amount);
    if (new BigNumber(slashAmount).isLessThan(0.001)) {
      result = '< 0.01%';
    } else {
      result = `${toPrecision(slashAmount.toString(), 3)}`;
    }
    return result;
  }
  function showSlashTip() {
    // const tip = intl.formatMessage({ id: 'farmRewardsCopy' });
    const tip = 'Slash = Slash Rate * Unexpired Time * Unstaked amount';
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  const isDisabled =
    !amount ||
    new BigNumber(amount).isLessThanOrEqualTo(0) ||
    new BigNumber(amount).isGreaterThan(lpBalance) ||
    (unStakeType !== 'free' && !lockStatus && !acceptSlashPolicy);
  return (
    <CommonModal title={title} isOpen={isOpen} onRequestClose={onRequestClose}>
      <div className="flex flex-col mt-4 bg-black bg-opacity-20 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-farmText text-sm">
            <FormattedMessage id="unstake"></FormattedMessage>
          </span>
          <span className="text-farmText text-sm">
            <FormattedMessage id="lp_token"></FormattedMessage>{' '}
            {toPrecision(lpBalance, 6)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={({ target }) => changeAmount(target.value)}
            className="text-white text-lg focus:outline-non appearance-none leading-tight"
          ></input>
          <div className="flex items-center ml-2">
            <span
              onClick={() => {
                changeAmount(lpBalance);
              }}
              className="text-xs text-farmText px-2 py-1 rounded-lg border border-maxBorderColor cursor-pointer"
            >
              Max
            </span>
          </div>
        </div>
      </div>
      <UnClaimBox
        detailData={detailData}
        tokenPriceList={tokenPriceList}
      ></UnClaimBox>
      {unStakeType == 'free' ? null : (
        <div className="mt-4">
          <div className="flex justify-between items-center w-full mb-4">
            <span className="text-farmText text-sm">status</span>
            {displayStatus()}
          </div>
          <div className="flex justify-between items-center w-full">
            <span className="text-farmText text-sm">Expired Time</span>
            <span className="text-white text-sm">{displayDate()}</span>
          </div>
        </div>
      )}
      <div className="mt-5">
        <GradientButton
          onClick={operationUnStake}
          color="#fff"
          disabled={unStakeLoading || isDisabled}
          loading={unStakeLoading || isDisabled}
          btnClassName={`${isDisabled ? 'cursor-not-allowed' : ''}`}
          className={`w-full h-14 text-center text-lg text-white focus:outline-none font-semibold`}
        >
          <ButtonTextWrapper
            loading={unStakeLoading}
            Text={() => <FormattedMessage id="unstake" />}
          />
        </GradientButton>
      </div>
      {unStakeType == 'free' ||
      lockStatus ||
      (!lockStatus && Number(amount) == 0) ? null : (
        <div className="flex items-center w-full justify-between rounded-md border border-redwarningColor bg-black bg-opacity-20 py-4 px-3 mt-4">
          <div className="flex items-center">
            <span
              className="mr-2.5 cursor-pointer"
              onClick={() => {
                setAcceptSlashPolicy(!acceptSlashPolicy);
              }}
            >
              {acceptSlashPolicy ? (
                <CheckboxSelected></CheckboxSelected>
              ) : (
                <Checkbox></Checkbox>
              )}
            </span>
            <span className="text-sm text-redwarningColor">
              <FormattedMessage id="i_will_pay" /> {getSlashAmount()}{' '}
              <FormattedMessage id="lp_token_slash" />
            </span>
          </div>
          <div
            className="text-white text-right ml-1"
            data-class="reactTip"
            data-for={'slashTipId' + seed_id}
            data-place="top"
            data-html={true}
            data-tip={showSlashTip()}
          >
            <QuestionMark></QuestionMark>
            <ReactTooltip
              id={'slashTipId' + seed_id}
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
        </div>
      )}
    </CommonModal>
  );
}
function CommonLine(props: any) {
  const { title, ...rest } = props;
  return (
    <div {...rest} className={`flex items-center justify-between mb-3`}>
      <span className="text-farmText text-sm">
        <FormattedMessage id={title}></FormattedMessage>
      </span>
      {props.children}
    </div>
  );
}
function UnClaimBox(props: { detailData: Seed; tokenPriceList: any }) {
  const [showClaim, setShowClaim] = useState(false);
  const { detailData, tokenPriceList } = props;
  const { unclaimed, farmList } = detailData;
  const unclaimedkeys = Object.keys(unclaimed);
  const rewardTokenMetaMap = {};
  farmList.forEach((farm: FarmBoost) => {
    const token_meta_data = farm.token_meta_data;
    rewardTokenMetaMap[token_meta_data.id] = token_meta_data;
  });
  function switchShowClaim() {
    setShowClaim(!showClaim);
  }
  const displayTotalPrice = () => {
    let totalPrice = 0;
    unclaimedkeys.forEach((rewardId: string) => {
      const token = rewardTokenMetaMap[rewardId];
      const { id, decimals } = token;
      const amount = toReadableNumber(decimals, unclaimed[rewardId]);
      const tokenPrice = tokenPriceList[id].price;
      if (tokenPrice && tokenPrice != 'N/A') {
        totalPrice += +amount * tokenPrice;
      }
    });
    let result = '';
    if (new BigNumber(0).isEqualTo(totalPrice)) {
      result = '-';
    } else if (new BigNumber('0.01').isGreaterThan(totalPrice)) {
      result = '<$0.01';
    } else {
      result = `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`;
    }
    return result;
  };
  const displayTokenNumber = (rewardId: string) => {
    const meta = rewardTokenMetaMap[rewardId];
    const { decimals } = meta;
    const amount = toReadableNumber(decimals, unclaimed[rewardId]);
    const curUserUnclaimedReward = new BigNumber(amount).toString();
    if (
      !curUserUnclaimedReward ||
      new BigNumber('0').isEqualTo(curUserUnclaimedReward)
    ) {
      return '-';
    } else if (new BigNumber('0.001').isGreaterThan(curUserUnclaimedReward)) {
      return '<0.001';
    } else {
      return formatWithCommas(
        new BigNumber(curUserUnclaimedReward).toFixed(3, 1)
      );
    }
  };
  if (unclaimedkeys.length == 0) return null;
  return (
    <div className="mt-7 xs:mt-4 md:mt-4">
      <div
        className="flex items-center justify-center cursor-pointer"
        onClick={switchShowClaim}
      >
        <label className="text-sm text-white ml-3 mr-4 cursor-pointer">
          <FormattedMessage id="rewards_claimed"></FormattedMessage>
        </label>
        <label
          className={
            'cursor-pointer ' + (showClaim ? 'transform rotate-180' : '')
          }
        >
          <ArrowDownHollow></ArrowDownHollow>
        </label>
      </div>
      <div
        className={
          'rounded bg-black bg-opacity-20 p-5 mt-3.5 ' +
          (showClaim ? 'block' : 'hidden')
        }
      >
        <p className="flex justify-between items-center">
          <label className="text-sm text-farmText">
            <FormattedMessage id="value_rewards_token"></FormattedMessage>
          </label>
          <label className="text-sm text-farmText text-right">
            {displayTotalPrice()}
          </label>
        </p>
        <div className="flex flex-col mt-4">
          <label className="text-sm text-farmText">
            <FormattedMessage id="reward_token"></FormattedMessage>
          </label>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {unclaimedkeys.map((rewardId: string, index: number) => {
              return (
                <span className="flex items-center" key={index}>
                  <img
                    src={rewardTokenMetaMap[rewardId]?.icon}
                    className="w-6 h-6 xs:w-5 xs:h-5 md:w-5 md:h-5 rounded-full border border-gradientFromHover"
                  ></img>{' '}
                  <label className="text-sm text-farmText ml-2.5">
                    {displayTokenNumber(rewardId)}
                  </label>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
interface Lock {
  second: number;
  month: number;
  icon: any;
  multiplier: number;
}
