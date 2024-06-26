import React, { useEffect, useState, useContext } from 'react';
import Loading from '../layout/Loading';
import getConfig from '../../services/config';
import { useTokens } from 'src/state/token';
import Modal from 'react-modal';
import { isMobile } from '../../utils/device';
import { SolidButton, ConnectToNearBtn } from '../button/Button';
import { FormattedMessage, useIntl } from 'react-intl';
import { HiOutlineExternalLink, IoClose } from '../reactIcons';
import QuestionMark from 'src/components/farm/QuestionMark';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { TokenAmountV2 } from '../forms/TokenAmount';
import { SwapExchange } from '../icon/Arrows';
import { ftGetBalance, TokenMetadata } from '../../services/ft-contract';
import { WalletContext } from '../../utils/wallets-integration';
import {
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
} from '../../utils/numbers';
import {
  buyUSNInUSDT,
  sellUSNGetUSDT,
  USDT_ID,
} from '../../services/buy-sell-usn';
import { getTokenPriceList } from '../../services/indexer';
import BigNumber from 'bignumber.js';
import {
  GradientButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import { openUrl } from '../../services/commonV3';
import Burrow from '../icon/logos/Burrow';
import CustomTooltip from 'src/components/customTooltip/customTooltip';

function USNPage(props: ReactModal.Props) {
  const intl = useIntl();
  const [tokenIn, setTokenIn] = useState<TokenMetadata>();
  const [tokenInAmount, setTokenInAmount] = useState<string>('1');
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [usnBalance, setUsnBalance] = useState('0');
  const [showBuyLoading, setShowBuyLoading] = useState<boolean>(false);
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const { USN_ID } = getConfig();
  const ids = [USDT_ID, USN_ID];
  const tokens = useTokens(ids);
  useEffect(() => {
    getTokenPriceList().then((list) => {
      setTokenPriceList(JSON.parse(JSON.stringify(list)));
    });
  }, []);
  useEffect(() => {
    if (tokens) {
      const usdtToken = tokens[0];
      const usnToken = tokens[1];
      setTokenIn(usdtToken);
      setTokenOut(usnToken);
      if (isSignedIn) {
        ftGetBalance(ids[0]).then((available: string) => {
          setUsdtBalance(toReadableNumber(usdtToken?.decimals, available));
        });
        ftGetBalance(ids[1]).then((available: string) => {
          setUsnBalance(toReadableNumber(usnToken?.decimals, available));
        });
      }
    }
  }, [tokens, isSignedIn]);
  let tokenInMax = '0';
  let tokenOutMax = '0';
  if (tokenIn?.id === ids[0]) {
    tokenInMax = usdtBalance;
    tokenOutMax = usnBalance;
  } else {
    tokenInMax = usnBalance;
    tokenOutMax = usdtBalance;
  }
  if (!tokens) return <Loading />;
  function buy_nsn_tip() {
    const tip = intl.formatMessage({ id: 'buy_nsn_tip' });
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left font-normal">${tip}</div>`;
    return result;
  }
  function handleSubmit() {
    setShowBuyLoading(true);
    const amount = toNonDivisibleNumber(tokenIn.decimals, tokenInAmount);
    if (tokenIn.id == tokens[0].id) {
      // buy
      buyUSNInUSDT({ amount });
    } else {
      // sell
      sellUSNGetUSDT({ amount });
    }
  }
  function displayCutAmount() {
    let display = '';
    if (cutAmount.isLessThan('0.00001')) {
      display = '0';
    } else {
      display = toPrecision(cutAmount.toFixed().toString(), 5);
    }
    return display;
  }
  const cutAmount = new BigNumber(+tokenInAmount).multipliedBy(0.0001);
  const tokenOutAmount = new BigNumber(+tokenInAmount)
    .minus(cutAmount)
    .toFixed();
  const canSubmit =
    tokenIn?.id === tokens[1].id &&
    +tokenInAmount > 0 &&
    new BigNumber(tokenInAmount).isLessThanOrEqualTo(tokenInMax) &&
    tokenIn &&
    tokenOut;
  return (
    <Modal {...props}>
      <div className="swap md:w-5/6 xs:w-full">
        <section className="lg:w-480px xs:p-2 m-auto relative">
          <div
            style={{
              height: isMobile() ? '510px' : '',
              overflow: isMobile() ? 'auto' : '',
            }}
            className={`overflow-y-visible bg-secondary shadow-2xl rounded-2xl p-7 xs:px-3.5 md:px-3.5 bg-dark xs:rounded-lg md:rounded-lg overflow-x-visible border-gradientFrom border border-opacity-50`}
          >
            <h2 className="formTitle flex justify-between items-center font-bold text-xl text-white text-left pb-8">
              <div className="flex items-center text-2xl text-white">
                <FormattedMessage id="buy_nsn"></FormattedMessage>
                <div
                  className="ml-2 text-sm"
                  data-type="info"
                  data-place="right"
                  data-multiline={true}
                  data-class="reactTip"
                  data-tooltip-html={buy_nsn_tip()}
                  data-tooltip-id="buyUSNTip"
                >
                  <QuestionMark />
                  <CustomTooltip className="w-20" id="buyUSNTip" />
                </div>
              </div>
              <IoClose
                onClick={props.onRequestClose}
                className="text-primaryText cursor-pointer ml-2"
              />
            </h2>
            <TokenAmountV2
              amount={tokenInAmount}
              total={tokenInMax}
              max={tokenInMax}
              selectedToken={tokenIn}
              onChangeAmount={(amount) => {
                setTokenInAmount(amount);
              }}
              tokenPriceList={tokenPriceList}
              isError={tokenIn?.id === tokenOut?.id}
              showQuickButton={true}
            />
            <div
              className="flex items-center justify-center border-t mt-12"
              style={{ borderColor: 'rgba(126, 138, 147, 0.3)' }}
            >
              <SwapExchange
                onChange={() => {
                  setTokenIn(tokenOut);
                  setTokenOut(tokenIn);
                  setTokenInAmount(toPrecision('1', 6));
                }}
              />
            </div>
            <TokenAmountV2
              amount={toPrecision(tokenOutAmount, 8)}
              total={tokenOutMax}
              selectedToken={tokenOut}
              isError={tokenIn?.id === tokenOut?.id}
              tokenPriceList={tokenPriceList}
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-primaryText">
                <FormattedMessage id="protocol_fee"></FormattedMessage>
              </span>
              <span className="text-xs text-white">
                0.01% / {displayCutAmount()} {tokenIn?.symbol}
              </span>
            </div>
            <div className="flex items-center justify-end">
              <div className="text-greenColor text-xs flex items-center justify-center bg-xrefbg rounded-3xl px-3 py-1 mt-1.5">
                <FormattedMessage id="usn_fee_tip"></FormattedMessage>
              </div>
            </div>
            {isSignedIn ? (
              <GradientButton
                color="#fff"
                className={`w-full h-10 text-center text-base text-white mt-7 focus:outline-none font-semibold ${
                  !canSubmit ? 'opacity-40' : ''
                }`}
                onClick={handleSubmit}
                disabled={!canSubmit || showBuyLoading}
                btnClassName={!canSubmit ? 'cursor-not-allowed' : ''}
                loading={showBuyLoading}
              >
                <div>
                  <ButtonTextWrapper
                    loading={showBuyLoading}
                    Text={() => (
                      <FormattedMessage
                        id={tokenIn?.id == tokens[1].id ? 'sell' : 'buy'}
                      />
                    )}
                  />
                </div>
              </GradientButton>
            ) : (
              <div className="mt-7">
                <ConnectToNearBtn />
              </div>
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}

export function BorrowLinkCard(props: ReactModal.Props) {
  return (
    <Modal {...props}>
      <div className="swap w-full">
        <section className="lg:w-560px md:w-5/6 xs:w-full xs:p-2 m-auto relative">
          <div
            className="rounded-2xl xs:rounded-lg md:rounded-lg border border-opacity-50 flex items-center flex-col border-gradientFrom p-7 bg-cardBg "
            style={{
              height: isMobile() ? '510px' : '500px',
            }}
          >
            <div className="pl-2 pb-1 self-end cursor-pointer text-xl">
              <IoClose
                onClick={props.onRequestClose}
                className="text-primaryText cursor-pointer ml-2"
              />
            </div>

            <div className="pb-6 xs:pb-2 xs:transform xs:scale-75">
              <Burrow />
            </div>

            <div className="text-white text-sm text-center pb-5">
              <FormattedMessage
                id="burrow_usn_tip"
                defaultMessage={'You can borrow USN on Burrow.'}
              ></FormattedMessage>
            </div>

            <SolidButton
              className="flex items-center justify-center  text-xl py-3 w-4/5"
              onClick={(e) => {
                openUrl('https://app.burrow.cash/');
              }}
            >
              <span>
                <FormattedMessage
                  id="go_to_borrow"
                  defaultMessage="Go to Burrow"
                />
              </span>
              <span className="ml-1.5">
                <HiOutlineExternalLink />
              </span>
            </SolidButton>
          </div>
        </section>
      </div>
    </Modal>
  );
}

export default USNPage;
