import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { Card } from '~components/card/Card';
import { usePool, useRemoveLiquidity } from '~state/pool';
import { addLiquidityToPool, Pool } from '~services/pool';
import { useTokenBalances, useTokens, getExchangeRate } from '~state/token';
import Loading from '~components/layout/Loading';
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
    const firstTokenAmountBN = new BigNumber(firstTokenAmount.toString());
    const firstTokenBalanceBN = new BigNumber(
      toReadableNumber(tokens[0].decimals, balances[tokens[0].id])
    );
    const secondTokenAmountBN = new BigNumber(secondTokenAmount.toString());
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

  const cardWidth = isMobile() ? '75vw' : '30vw';

  return (
    <Modal {...props}>
      <div></div>
      <Card style={{ width: cardWidth }}>
        <div className="text-sm text-gray-800 font-semibold pb-4">
          <FormattedMessage id="add_liquidity" defaultMessage="Add Liquidity" />
        </div>
        <div className="flex justify-center">
          {error && <Alert level="error" message={error.message} />}
        </div>
        <TokenAmount
          amount={firstTokenAmount}
          max={toReadableNumber(tokens[0].decimals, balances[tokens[0].id])}
          total={toReadableNumber(tokens[0].decimals, balances[tokens[0].id])}
          tokens={[tokens[0]]}
          selectedToken={tokens[0]}
          onChangeAmount={changeFirstTokenAmount}
        />
        <div className="pt-4">
          <TokenAmount
            amount={secondTokenAmount}
            max={toReadableNumber(tokens[1].decimals, balances[tokens[1].id])}
            total={toReadableNumber(tokens[1].decimals, balances[tokens[1].id])}
            tokens={[tokens[1]]}
            selectedToken={tokens[1]}
            onChangeAmount={changeSecondTokenAmount}
          />
        </div>
        <div className="flex items-center justify-center pt-6">
          <button
            disabled={!canSubmit}
            className={`rounded-full text-xs text-white px-5 py-2.5 focus:outline-none font-semibold bg-greenLight ${
              canSubmit ? '' : 'bg-opacity-50 disabled:cursor-not-allowed'
            }`}
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
          </button>
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
  const cardWidth = isMobile() ? '85vw' : '30vw';
  const intl = useIntl();

  function submit() {
    const amountBN = new BigNumber(amount.toString());
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
      <Card style={{ width: cardWidth }}>
        <div className="text-sm text-gray-800 font-semibold pb-4">
          <FormattedMessage
            id="remove_liquidity"
            defaultMessage="Remove Liquidity"
          />
        </div>
        <div className="flex justify-center">
          {error && <Alert level="error" message={error.message} />}
        </div>
        <div>
          <p className="col-span-12 p-2 text-right text-xs font-semibold">
            <FormattedMessage id="balance" defaultMessage="Balance" />: &nbsp;
            {toPrecision(toReadableNumber(24, shares), 6)}
          </p>
          <div className="border rounded-lg overflow-hidden">
            <InputAmount
              maxBorder={false}
              value={amount}
              max={toReadableNumber(24, shares)}
              onChangeAmount={setAmount}
            />
          </div>
        </div>
        <div className="pt-2">
          <SlippageSelector
            slippageTolerance={slippageTolerance}
            onChange={setSlippageTolerance}
          />
        </div>
        {amount ? (
          <>
            <p className="mt-3 text-left text-xs font-semibold">
              <FormattedMessage
                id="minimum_tokens_out"
                defaultMessage="Minimum Tokens Out"
              />
            </p>
            <section className="grid grid-cols-2 mt-3 text-xs font-semibold">
              {Object.entries(minimumAmounts).map(
                ([tokenId, minimumAmount], i) => {
                  const token = tokens.find((t) => t.id === tokenId);

                  return (
                    <section key={tokenId} className="flex items-center">
                      <Icon icon={token.icon} />
                      <span className="ml-2">
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
        <div className="flex items-center justify-center pt-6">
          <button
            className={`rounded-full text-xs text-white px-5 py-2.5 ml-3 focus:outline-none font-semibold bg-greenLight ${
              amount ? '' : 'bg-opacity-50 disabled:cursor-not-allowed'
            }`}
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
          </button>
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
    <div className="flex items-start flex-row w-3/6 lg:w-5/6 xl:w-4/5 md:w-5/6 m-auto">
      <div
        className="p-2 mr-4"
        onClick={() => {
          history.goBack();
        }}
      >
        <BackArrow />
      </div>
      <div>
        <Card
          className="rounded-2xl mr-3"
          padding="px-8 pt-8 pb-4"
          bgColor="bg-cardBg"
          width="w-96"
        >
          {/* 展示token */}
          <div className="text-center border-b border-gray-600">
            {backToFarmsButton ? (
              <div className="float-left">
                <a href="/farms">
                  <FaArrowLeft className="mx-auto text-gray-600 mt-2 mb-6" />
                </a>
              </div>
            ) : null}

            <div className="flex flex-col text-center text-base pt-2 pb-6">
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

          {/* 内部内容 */}
          <div className="text-base text-gray-400 pt-6">
            {/* fee */}
            <div className="flex items-center justify-between py-2.5">
              <div>
                <FormattedMessage id="fee" defaultMessage="Fee" />
              </div>
              <div className="text-sm text-white border-greenLight border px-2 rounded-sm">{`${calculateFeePercent(
                pool.fee
              )}%`}</div>
            </div>
            {/* Total liquidity */}
            <div className="flex items-center justify-between py-2.5">
              <div>
                <FormattedMessage
                  id="total_liquidity"
                  defaultMessage="Total Liquidity"
                />
              </div>
              <div>
                <FormattedMessage
                  id="coming_soon"
                  defaultMessage="Coming Soon"
                />
              </div>
            </div>
            {/* TVL */}
            <div className="flex items-center justify-between py-2.5">
              <div>
                <FormattedMessage id="tvl" defaultMessage="TVL" />
              </div>
              <div className="text-lg text-white">
                {' '}
                ${toInternationalCurrencySystem(poolTVL.toString())}
              </div>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <div>
                <FormattedMessage id="24h_volume" defaultMessage="24h Volume" />
              </div>
              <div className="text-lg text-white">{'coming soon'}</div>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div>
                <FormattedMessage
                  id="total_shares"
                  defaultMessage="Total Shares"
                />
              </div>
              <div className="text-white">
                {toRoundedReadableNumber({
                  decimals: 24,
                  number: pool.shareSupply,
                  precision: 0,
                })}
              </div>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div>
                <FormattedMessage id="my_shares" defaultMessage="My Shares" />
              </div>
              <div
                // className="text-white"
                style={{
                  color: '#FFFFFF',
                }}
              >
                <MyShares shares={shares} totalShares={pool.shareSupply} />
              </div>
            </div>
            {/* <div className="flex items-center justify-center pt-6">
              <button
                className={`rounded-full text-xs text-white px-5 py-2.5 focus:outline-none font-semibold bg-greenLight`}
                onClick={() => {
                  setShowFunding(true);
                }}
              >
                <FormattedMessage
                  id="add_liquidity"
                  defaultMessage="Add Liquidity"
                />
              </button>
              <button
                className={`rounded-full text-xs text-white px-5 py-2.5 ml-3 focus:outline-none font-semibold bg-greenLight ${
                  1 ? '' : 'bg-opacity-50 disabled:cursor-not-allowed'
                }`}
                onClick={() => {
                  setShowWithdraw(true);
                }}
              >
                <FormattedMessage
                  id="remove_liquidity"
                  defaultMessage="Remove Liquidity"
                />
              </button>
            </div> */}
          </div>
        </Card>
      </div>

      {/* 展示chart */}
      <div
        className="w-full  opacity-70"
        style={{
          height: '559px',
        }}
      >
        <Card
          width="w-full"
          className="rounded-2xl h-full flex flex-col justify-between"
          bgColor="bg-chartBg"
          padding="p-7"
        >
          <div className="pb-7">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-xl float-left">$&nbsp;-</div>
              <div className="text-white rounded-2xl flex items-center bg-gray-700">
                <div className="py-2 px-6 rounded-2xl bg-gradient-to-b from-gradientFrom to-gradientTo">
                  TVL
                </div>
                <div className="py-2 px-6">Volume</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">Sep. 11 2021</div>
          </div>
          <div className="text-center text-lg text-white">Coming soon...</div>

          <div>
            <div className="border border-gradientFrom w-full mb-2"></div>
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
              ].map((d) => {
                return <div>{d}</div>;
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
      />
      <AddLiquidityModal
        pool={pool}
        tokens={tokens}
        isOpen={showFunding}
        onRequestClose={() => setShowFunding(false)}
      />
    </div>
  );
}
