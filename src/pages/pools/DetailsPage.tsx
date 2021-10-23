import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { Card } from '~components/card/Card';
import { usePool, useRemoveLiquidity } from '~state/pool';
import { addLiquidityToPool, Pool } from '~services/pool';
import { useTokenBalances, useTokens, getExchangeRate } from '~state/token';
import Loading from '~components/layout/Loading';
import { FarmMiningIcon } from '~components/icon/FarmMining';
import { FarmStamp } from '~components/icon/FarmStamp';
import { MULTI_MINING_POOLS } from '~services/near';
import { PoolSlippageSelector } from '~components/forms/SlippageSelector';
import { Link } from 'react-router-dom';
import {
  calculateFairShare,
  calculateFeePercent,
  percent,
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
  toRoundedReadableNumber,
  toInternationalCurrencySystem,
} from '../../utils/numbers';
import TokenAmount from '~components/forms/TokenAmount';
import { TokenMetadata } from '~services/ft-contract';
import Alert from '~components/alert/Alert';
import InputAmount from '~components/forms/InputAmount';
import SlippageSelector from '~components/forms/SlippageSelector';
import { isMobile } from '~utils/device';
import ReactModal from 'react-modal';
import { toRealSymbol } from '~utils/token';

import { BackArrow } from '~components/icon';
import { useHistory } from 'react-router';
import { getPool } from '~services/indexer';
import { FaArrowLeft } from 'react-icons/fa';
import { BigNumber } from 'bignumber.js';
import { FormattedMessage, useIntl } from 'react-intl';
import { WatchListStart } from '~components/icon/WatchListStart';
import { OutlineButton, SolidButton } from '~components/button/Button';
import { wallet } from '~services/near';
import { FarmMining } from './MorePoolsPage';

interface ParamTypes {
  id: string;
}

interface LocationTypes {
  tvl: number;
  backToFarms: boolean;
}

function Icon(props: { icon?: string; className?: string; style?: any }) {
  const { icon, className, style } = props;
  return icon ? (
    <img
      className={`block h-7 w-7 ${className} rounded-full border border-solid`}
      src={icon}
      style={style}
    />
  ) : (
    <div
      className={`h-7 w-7 rounded-full ${className} border border-solid`}
      style={style}
    ></div>
  );
}

function AddLiquidityModal(
  props: ReactModal.Props & {
    pool: Pool;
    tokens: TokenMetadata[];
  }
) {
  const { pool, tokens } = props;
  const [firstTokenAmount, setFirstTokenAmount] = useState<string>('');
  const [secondTokenAmount, setSecondTokenAmount] = useState<string>('');
  const balances = useTokenBalances();
  const [error, setError] = useState<Error>();
  const intl = useIntl();

  if (!balances) return null;

  const changeFirstTokenAmount = (amount: string) => {
    setError(null);
    if (Object.values(pool.supplies).every((s) => s === '0')) {
      setFirstTokenAmount(amount);
    } else {
      const fairShares = calculateFairShare({
        shareOf: pool.shareSupply,
        contribution: toNonDivisibleNumber(tokens[0].decimals, amount),
        totalContribution: pool.supplies[tokens[0].id],
      });

      setFirstTokenAmount(amount);
      setSecondTokenAmount(
        toReadableNumber(
          tokens[1].decimals,
          calculateFairShare({
            shareOf: pool.supplies[tokens[1].id],
            contribution: fairShares,
            totalContribution: pool.shareSupply,
          })
        )
      );
    }
  };

  const changeSecondTokenAmount = (amount: string) => {
    setError(null);
    if (Object.values(pool.supplies).every((s) => s === '0')) {
      setSecondTokenAmount(amount);
    } else {
      const fairShares = calculateFairShare({
        shareOf: pool.shareSupply,
        contribution: toNonDivisibleNumber(tokens[1].decimals, amount),
        totalContribution: pool.supplies[tokens[1].id],
      });

      setSecondTokenAmount(amount);
      setFirstTokenAmount(
        toReadableNumber(
          tokens[0].decimals,
          calculateFairShare({
            shareOf: pool.supplies[tokens[0].id],
            contribution: fairShares,
            totalContribution: pool.shareSupply,
          })
        )
      );
    }
  };

  const canSubmit = firstTokenAmount && secondTokenAmount;

  function submit() {
    const firstTokenAmountBN = new BigNumber(firstTokenAmount?.toString());
    const firstTokenBalanceBN = new BigNumber(
      toReadableNumber(tokens[0].decimals, balances[tokens[0].id])
    );
    const secondTokenAmountBN = new BigNumber(secondTokenAmount?.toString());
    const secondTokenBalanceBN = new BigNumber(
      toReadableNumber(tokens[1].decimals, balances[tokens[1].id])
    );

    if (firstTokenAmountBN.isGreaterThan(firstTokenBalanceBN)) {
      throw new Error(
        `${intl.formatMessage({ id: 'you_do_not_have_enough' })} ${toRealSymbol(
          tokens[0].symbol
        )}`
      );
    }

    if (secondTokenAmountBN.isGreaterThan(secondTokenBalanceBN)) {
      throw new Error(
        `${intl.formatMessage({ id: 'you_do_not_have_enough' })} ${toRealSymbol(
          tokens[1].symbol
        )}`
      );
    }

    if (!firstTokenAmount || firstTokenAmount === '0') {
      throw new Error(
        `${intl.formatMessage({
          id: 'must_provide_at_least_one_token_for',
        })} ${toRealSymbol(tokens[0].symbol)}`
      );
    }

    if (!secondTokenAmount || secondTokenAmount === '0') {
      throw new Error(
        `${intl.formatMessage({
          id: 'must_provide_at_least_one_token_for',
        })} ${toRealSymbol(tokens[1].symbol)}`
      );
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

    return addLiquidityToPool({
      id: pool.id,
      tokenAmounts: [
        { token: tokens[0], amount: firstTokenAmount },
        { token: tokens[1], amount: secondTokenAmount },
      ],
    });
  }

  const cardWidth = isMobile() ? '75vw' : '40vw';

  return (
    <Modal {...props}>
      <Card
        style={{
          width: cardWidth,
          border: '1px solid rgba(0, 198, 162, 0.5)',
        }}
        padding="p-8"
        bgcolor="bg-cardBg"
        className="text-white"
      >
        <div className="text-base font-bold pb-4">
          <FormattedMessage id="add_liquidity" defaultMessage="Add Liquidity" />
        </div>
        <div className="flex justify-center">
          {error && <Alert level="error" message={error.message} />}
        </div>

        {/* PC display */}
        <div className="mt-6 md:hidden xs:hidden">
          <div className="text-xs text-right mb-1 text-gray-400">
            <FormattedMessage id="balance" defaultMessage="Balance" />
            :&nbsp;
            {toPrecision(
              toReadableNumber(tokens[0].decimals, balances[tokens[0].id]),
              6,
              true
            )}
          </div>
          <div className="flex items-center ">
            <div className="flex items-end mr-10">
              <Icon icon={tokens[0].icon} className="h-12 w-12 mr-2" />
              <div className="flex items-start flex-col">
                <div className="text-white text-xl">
                  {toRealSymbol(tokens[0].symbol)}
                </div>
                <div
                  className="text-xs text-gray-400"
                  title={tokens[0].id}
                >{`${tokens[0].id.substring(0, 12)}${
                  tokens[0].id.length > 12 ? '...' : ''
                }`}</div>
              </div>
            </div>
            <InputAmount
              className="w-full"
              max={toReadableNumber(tokens[0].decimals, balances[tokens[0].id])}
              onChangeAmount={changeFirstTokenAmount}
              value={firstTokenAmount}
              disabled={!wallet.isSignedIn()}
            />
          </div>
        </div>

        {/* mobile display */}
        <div className="mt-6 lg:hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-end">
              <Icon icon={tokens[0].icon} className="h-12 w-12 mr-2" />
              <div className="flex items-start flex-col">
                <div className="text-white text-xl">
                  {toRealSymbol(tokens[0].symbol)}
                </div>
                <div
                  className="text-xs text-gray-400"
                  title={tokens[0].id}
                >{`${tokens[0].id.substring(0, 12)}${
                  tokens[0].id.length > 12 ? '...' : ''
                }`}</div>
              </div>
            </div>
            <div className="text-xs text-right mb-1 text-gray-400">
              <FormattedMessage id="balance" defaultMessage="Balance" />
              :&nbsp;
              {toPrecision(
                toReadableNumber(tokens[0].decimals, balances[tokens[0].id]),
                6,
                true
              )}
            </div>
          </div>
          <InputAmount
            className="w-full"
            max={toReadableNumber(tokens[0].decimals, balances[tokens[0].id])}
            onChangeAmount={changeFirstTokenAmount}
            value={firstTokenAmount}
            disabled={!wallet.isSignedIn()}
          ></InputAmount>
        </div>

        <div className="my-10 md:hidden xs:hidden">
          <div className="text-xs text-right mb-1 text-gray-400">
            <FormattedMessage id="balance" defaultMessage="Balance" />
            :&nbsp;
            {toPrecision(
              toReadableNumber(tokens[1].decimals, balances[tokens[1].id]),
              6,
              true
            )}
          </div>
          <div className="flex items-center">
            <div className="flex items-end mr-10">
              <Icon icon={tokens[1].icon} className="h-12 w-12 mr-2" />
              <div className="flex items-start flex-col">
                <div className="text-white text-xl">
                  {toRealSymbol(tokens[1].symbol)}
                </div>
                <div
                  className="text-xs text-gray-400"
                  title={tokens[1].id}
                >{`${tokens[1].id.substring(0, 12)}${
                  tokens[1].id.length > 12 ? '...' : ''
                }`}</div>
              </div>
            </div>
            <InputAmount
              className="w-full"
              max={toReadableNumber(tokens[1].decimals, balances[tokens[1].id])}
              onChangeAmount={changeSecondTokenAmount}
              value={secondTokenAmount}
              disabled={!wallet.isSignedIn()}
            />
          </div>
        </div>

        <div className="my-10 lg:hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-end">
              <Icon icon={tokens[1].icon} className="h-12 w-12 mr-2" />
              <div className="flex items-start flex-col">
                <div className="text-white text-xl">
                  {toRealSymbol(tokens[1].symbol)}
                </div>
                <div
                  className="text-xs text-gray-400"
                  title={tokens[1].id}
                >{`${tokens[1].id.substring(0, 12)}${
                  tokens[1].id.length > 12 ? '...' : ''
                }`}</div>
              </div>
            </div>
            <div className="text-xs text-right mb-1 text-gray-400">
              <FormattedMessage id="balance" defaultMessage="Balance" />
              :&nbsp;
              {toPrecision(
                toReadableNumber(tokens[1].decimals, balances[tokens[1].id]),
                6,
                true
              )}
            </div>
          </div>
          <InputAmount
            className="w-full"
            max={toReadableNumber(tokens[1].decimals, balances[tokens[1].id])}
            onChangeAmount={changeSecondTokenAmount}
            value={secondTokenAmount}
            disabled={!wallet.isSignedIn()}
          ></InputAmount>
        </div>

        <div className="flex items-center justify-center">
          <SolidButton
            disabled={!canSubmit}
            className={`focus:outline-none px-4`}
            onClick={async () => {
              try {
                await submit();
              } catch (err) {
                setError(err);
              }
            }}
          >
            <FormattedMessage
              id="add_liquidity"
              defaultMessage="Add Liquidity"
            />
          </SolidButton>
        </div>
      </Card>
    </Modal>
  );
}

export function RemoveLiquidityModal(
  props: ReactModal.Props & {
    pool: Pool;
    shares: string;
    tokens: TokenMetadata[];
  }
) {
  const { pool, shares, tokens } = props;
  const [amount, setAmount] = useState<string>('');
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const { minimumAmounts, removeLiquidity } = useRemoveLiquidity({
    pool,
    slippageTolerance,
    shares: amount ? toNonDivisibleNumber(24, amount) : '0',
  });
  const [error, setError] = useState<Error>();
  const cardWidth = isMobile() ? '75vw' : '40vw';
  const intl = useIntl();

  function submit() {
    const amountBN = new BigNumber(amount?.toString());
    const shareBN = new BigNumber(toReadableNumber(24, shares));
    if (Number(amount) === 0) {
      throw new Error(
        intl.formatMessage({ id: 'must_input_a_value_greater_than_zero' })
      );
    }
    if (amountBN.isGreaterThan(shareBN)) {
      throw new Error(
        intl.formatMessage({
          id: 'must_input_a_value_not_greater_than_your_balance',
        })
      );
    }

    return removeLiquidity();
  }

  return (
    <Modal {...props}>
      <Card
        style={{
          width: cardWidth,
          border: '1px solid rgba(0, 198, 162, 0.5)',
        }}
        padding="p-8"
        bgcolor="bg-cardBg"
        className="text-white"
      >
        <div className="text-base pb-4">
          <FormattedMessage
            id="remove_liquidity"
            defaultMessage="Remove Liquidity"
          />
        </div>
        <div className="flex justify-center">
          {error && <Alert level="error" message={error.message} />}
        </div>
        <div>
          <div className="text-xs text-right mb-1 text-gray-400">
            <FormattedMessage id="balance" defaultMessage="Balance" />
            :&nbsp;
            {toPrecision(toReadableNumber(24, shares), 6)}
          </div>
          <div className="rounded overflow-hidden">
            <InputAmount
              maxBorder={false}
              value={amount}
              max={toReadableNumber(24, shares)}
              onChangeAmount={setAmount}
            />
          </div>
        </div>
        <div className="pt-4 mb-8">
          <PoolSlippageSelector
            slippageTolerance={slippageTolerance}
            onChange={setSlippageTolerance}
          />
        </div>
        {amount ? (
          <>
            <p className="mt-3 text-left text-sm ">
              <FormattedMessage
                id="minimum_tokens_out"
                defaultMessage="Minimum Tokens Out"
              />
            </p>
            <section className="flex items-center xs:flex-col justify-center mx-3 mb-12">
              {Object.entries(minimumAmounts).map(
                ([tokenId, minimumAmount], i) => {
                  const token = tokens.find((t) => t.id === tokenId);

                  return (
                    <section
                      key={tokenId}
                      className="flex flex-col items-center"
                    >
                      <Icon icon={token.icon} className="h-12 w-12" />
                      <span className="m-1 mb-2 text-sm">{token.symbol} </span>
                      <span className="ml-2 text-lg font-bold">
                        {toRoundedReadableNumber({
                          decimals: tokens.find((t) => t.id === tokenId)
                            .decimals,
                          number: minimumAmount,
                          precision: 6,
                        })}
                      </span>
                    </section>
                  );
                }
              )}
            </section>
          </>
        ) : null}
        <div className="flex items-center justify-center">
          <SolidButton
            disabled={!amount}
            className={`focus:outline-none px-4`}
            onClick={async () => {
              try {
                await submit();
              } catch (error) {
                setError(error);
              }
            }}
          >
            <FormattedMessage
              id="remove_liquidity"
              defaultMessage="Remove Liquidity"
            />
          </SolidButton>
        </div>
      </Card>
    </Modal>
  );
}

function MyShares({
  shares,
  totalShares,
}: {
  shares: string;
  totalShares: string;
}) {
  if (!shares || !totalShares) return null;

  let sharePercent = percent(shares, totalShares);

  let displayPercent;
  if (Number.isNaN(sharePercent) || sharePercent === 0) displayPercent = '0';
  else if (sharePercent < 0.0001) displayPercent = '< 0.0001';
  else displayPercent = toPrecision(String(sharePercent), 4);

  return <div>{displayPercent}% of Total</div>;
}

export function PoolDetailsPage() {
  const { id } = useParams<ParamTypes>();
  const { state } = useLocation<LocationTypes>();
  const { pool, shares } = usePool(id);
  const history = useHistory();
  const tokens = useTokens(pool?.tokenIds);

  const [showFunding, setShowFunding] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [poolTVL, setPoolTVL] = useState<number>();
  const [backToFarmsButton, setBackToFarmsButton] = useState(false);

  const farmButton = () => {
    if (backToFarmsButton)
      return (
        <div className="flex items-center">
          <div className="mx-2">
            <FarmStamp />
          </div>
          <div>
            {MULTI_MINING_POOLS.includes(pool.id) && <FarmMiningIcon />}
          </div>
        </div>
      );
    return '';
  };

  useEffect(() => {
    if (state?.tvl > 0) {
      setPoolTVL(state?.tvl);
    } else {
      getPool(id).then((pool) => {
        setPoolTVL(pool?.tvl);
      });
    }
    setBackToFarmsButton(state?.backToFarms);
  }, [id]);

  if (!pool || !tokens || tokens.length < 2) return <Loading />;

  return (
    <div className="flex items-start flex-row md:w-11/12 xs:w-11/12 w-4/6 lg:w-5/6 xl:w-4/5 md:flex-col xs:flex-col m-auto">
      <div
        className="p-2 mr-4"
        onClick={() => {
          history.goBack();
        }}
      >
        <BackArrow />
      </div>

      <div className="md:w-full xs:w-full">
        <Card
          className="rounded-2xl mr-3 lg:w-96 md:w-full xs:w-full"
          padding="pt-8 pb-4 px-0"
          bgcolor="bg-cardBg"
        >
          {/* show token */}

          <div className="text-center mx-8">
            <div className="flex flex-col text-center text-base pt-2 pb-4">
              <div className="flex justify-end mb-4">
                {backToFarmsButton && (
                  <Link
                    to={{
                      pathname: '/farms',
                    }}
                  >
                    {farmButton()}
                  </Link>
                )}
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-end">
                  <Icon icon={tokens[0].icon} className="h-12 w-12 mr-2" />
                  <div className="flex items-start flex-col">
                    <div className="text-white text-xl">
                      {toRealSymbol(tokens[0].symbol)}
                    </div>
                    <a
                      target="_blank"
                      href={`/swap/#${tokens[0].id}|${tokens[1].id}`}
                      className="text-xs text-gray-400"
                      title={tokens[0].id}
                    >{`${tokens[0].id.substring(0, 12)}${
                      tokens[0].id.length > 12 ? '...' : ''
                    }`}</a>
                  </div>
                </div>
                <div className="text-white">
                  {toInternationalCurrencySystem(
                    toReadableNumber(
                      tokens[0].decimals,
                      pool.supplies[tokens[0].id]
                    )
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-end">
                  <Icon icon={tokens[1].icon} className="h-12 w-12 mr-2" />
                  <div className="flex items-start flex-col">
                    <div className="text-white text-xl">
                      {toRealSymbol(tokens[1].symbol)}
                    </div>
                    <a
                      target="_blank"
                      href={`/swap/#${tokens[0].id}|${tokens[1].id}`}
                      className="text-xs text-gray-400"
                      title={tokens[1].id}
                    >{`${tokens[1].id.substring(0, 12)}${
                      tokens[1].id.length > 12 ? '...' : ''
                    }`}</a>
                  </div>
                </div>
                <div className="text-white">
                  {toInternationalCurrencySystem(
                    toReadableNumber(
                      tokens[1].decimals,
                      pool.supplies[tokens[1].id]
                    )
                  )}
                </div>
              </div>
              {/* rate */}
              <div className="flex justify-between">
                <div className="text-white text-sm text-center px-2  rounded-sm border border-solid">
                  1&nbsp;{toRealSymbol(tokens[0].symbol)}&nbsp;
                  {getExchangeRate(tokens, pool, pool.token0_ref_price, false)}
                </div>
                <div className="text-white text-sm text-center px-2  rounded-sm border border-solid">
                  1&nbsp;{toRealSymbol(tokens[1].symbol)}&nbsp;
                  {getExchangeRate(
                    tokens.reverse(),
                    pool,
                    pool.token0_ref_price,
                    false
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="border border-solid border-gray-600"></div>
          <div className="text-base text-gray-400 pt-6 mx-8">
            {/* fee */}
            <div className="flex items-center justify-between py-2.5">
              <div>
                <FormattedMessage id="fee" defaultMessage="Fee" />
              </div>
              <div className="text-sm text-white border-greenLight border px-2 rounded-sm">{`${calculateFeePercent(
                pool.fee
              )}%`}</div>
            </div>
            {/* TVL */}
            <div className="flex items-center justify-between py-2.5">
              <div>
                <FormattedMessage id="tvl" defaultMessage="TVL" />
              </div>
              <div className="text-lg text-white">
                {' '}
                ${toInternationalCurrencySystem(poolTVL?.toString())}
              </div>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <div>
                <FormattedMessage id="h24_volume" defaultMessage="24h Volume" />
              </div>
              <div className="text-base text-white">
                <FormattedMessage
                  id="coming_soon"
                  defaultMessage="Coming soon"
                />
              </div>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <div>
                <FormattedMessage
                  id="total_shares"
                  defaultMessage="Total Shares"
                />
              </div>
              <div className="text-base text-white">
                {toInternationalCurrencySystem(
                  toReadableNumber(24, pool?.shareSupply)
                )}
              </div>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <div>
                <FormattedMessage id="my_shares" defaultMessage="My Shares" />
              </div>
              <div
                style={{
                  color: '#FFFFFF',
                }}
              >
                <MyShares shares={shares} totalShares={pool.shareSupply} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* chart */}
      <div className="w-full flex flex-col h-full">
        <div className="lg:flex items-center justify-end mb-4">
          <div className="hidden flex items-center xs:hidden md:hidden">
            <div className="mr-2">
              <WatchListStart />
            </div>
            <div className="text-gray-400 text-xs"> {'Add Watchlist'} </div>
          </div>
          <div className="lg:flex items-center justify-end xs:mt-8 md:mt-8 xs:grid xs:grid-cols-2 md:grid md:grid-cols-2 w-full">
            <div className="pr-2">
              <SolidButton
                padding="px-0"
                className="w-48 xs:w-full  md:w-full xs:col-span-1 md:col-span-1"
                onClick={() => {
                  setShowFunding(true);
                }}
              >
                <FormattedMessage
                  id="add_liquidity"
                  defaultMessage="Add Liquidity"
                />
              </SolidButton>
            </div>
            <div className="pl-2">
              <OutlineButton
                padding="px-0"
                onClick={() => {
                  setShowWithdraw(true);
                }}
                className="w-48 xs:w-full md:w-full xs:col-span-1 md:col-span-1"
              >
                <FormattedMessage
                  id="remove_liquidity"
                  defaultMessage="Remove Liquidity"
                />
              </OutlineButton>
            </div>
          </div>
        </div>

        <Card
          width="w-full"
          className="relative rounded-2xl bg-chartBg h-full flex flex-col justify-between md:hidden xs:hidden"
          padding="p-7"
          style={{
            height: '466px',
          }}
        >
          <div className="pb-7">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-xl float-left">$&nbsp;-</div>
              <div className="text-white rounded-2xl flex items-center bg-gray-700">
                <div className="py-2 px-4 w-25 rounded-2xl bg-gradient-to-b from-gradientFrom to-gradientTo">
                  <FormattedMessage id="tvl" defaultMessage="TVL" />
                </div>
                <div className="py-2 px-4 w-25">
                  <FormattedMessage id="volume" defaultMessage="Volume" />
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Sep. 11 2021</div>
          </div>
          <div
            className="absolute w-full left-0 top-0 h-full m-auto text-center text-xl text-gray-500 flex items-center justify-center opacity-70"
            style={{
              backdropFilter: 'blur(1px)',
              background: '#001320',
            }}
          >
            <div>
              <FormattedMessage id="coming_soon" defaultMessage="Coming Soon" />
            </div>
          </div>

          <div>
            <div
              style={{
                width: '400px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1px',
                transform: 'rotate(90deg)',
                position: 'relative',
                bottom: '190px',
                left: '100px',
              }}
            />
            <div
              style={{
                border: '1px solid #ffffff',
                boxSizing: 'border-box',
                width: '13px',
                height: '13px',
                position: 'relative',
                left: '295px',
                top: '4px',
                backgroundColor: '#00d6af',
                opacity: 0.4,
              }}
              className="rounded-full"
            />
            <div className="border border-gradientFrom w-full mb-2" />
            <div className="flex text-xs text-gray-500 justify-between">
              {[
                '24',
                '31',
                '07',
                '14',
                '21',
                '28',
                '04',
                '11',
                '18',
                '25',
                '02',
                '09',
              ].map((d, i) => {
                return <div key={i}>{d}</div>;
              })}
            </div>
          </div>
        </Card>
      </div>

      <RemoveLiquidityModal
        pool={pool}
        shares={shares}
        tokens={tokens}
        isOpen={showWithdraw}
        onRequestClose={() => setShowWithdraw(false)}
        style={{
          content: {
            position: 'absolute',
            top: '50%',
          },
          overlay: {
            backdropFilter: 'blur(10px)',
          },
        }}
      />
      <AddLiquidityModal
        pool={pool}
        tokens={tokens}
        isOpen={showFunding}
        onRequestClose={() => setShowFunding(false)}
        style={{
          content: {
            position: 'absolute',
            top: '50%',
          },
          overlay: {
            backdropFilter: 'blur(10px)',
          },
        }}
      />
    </div>
  );
}
