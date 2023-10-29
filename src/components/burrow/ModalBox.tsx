import React, { useEffect, useMemo, useState, useContext } from 'react';
import Modal from 'react-modal';
import { isMobile } from '../../utils/device';
import { CloseButton } from './icons';
import { GradientButton, PurpleButton } from './burrow-button';
import InputBox from './InputBox';
import {
  IModalProps,
  IAccount,
  IAsset,
  IAssetRewardDetail,
  IBurrowConfig,
  IRepayWay,
} from 'src/services/burrow-interfaces';
import {
  computeAdjustMaxAmount,
  computeWithdrawMaxAmount,
  computeSupplyMaxAmount,
  computeRepayMaxAmount,
  computeBurrowMaxAmount,
  getHealthFactor,
  recomputeAdjustHealthFactor,
  recomputeWithdrawHealthFactor,
  recomputeSupplyHealthFactor,
  recomputeRepayHealthFactor,
  recomputeRepayHealthFactorFromDeposits,
  recomputeBurrowHealthFactor,
  get_as_collateral_adjust,
  get_remain_borrow_repay,
  get_remain_collateral_withdraw,
} from 'src/services/burrow-business';
import {
  formatPercentage,
  isInvalid,
  formatNumber,
  formatWithCommas_usd,
  expandToken,
} from 'src/services/burrow-utils';
import {
  submitAdjust,
  submitSupply,
  submitWithdraw,
  submitRepay,
  submitBorrow,
} from 'src/services/burrow';
import { BurrowData } from '../../pages/Burrow';
import { WarningIcon } from 'src/components/icon/V3';
import {
  ButtonTextWrapper,
  ConnectToNearBtn,
} from 'src/components/button/Button';
import { WalletContext } from '../../utils/wallets-integration';
import Big from 'big.js';
import { FormattedMessage, useIntl } from 'react-intl';
export default function ModalBox(props: {
  showModalBox: boolean;
  setShowModalBox: Function;
  modalData: IModalProps;
}) {
  const {
    account,
    assets,
    rewards,
    nearBalance,
    globalConfig,
  }: {
    account: IAccount;
    assets: IAsset[];
    rewards: IAssetRewardDetail[];
    nearBalance: string;
    globalConfig: IBurrowConfig;
  } = useContext(BurrowData);
  const { showModalBox, setShowModalBox, modalData } = props;
  const [switchStatus, setSwitchStatus] = useState<boolean>(
    !!modalData?.asset?.config?.can_use_as_collateral
  );
  const [extraDetail, setExtraDetail] = useState<React.ReactElement>();
  const [actionButton, setActionButton] = useState<React.ReactElement>();
  const [modalTitle, setModalTitle] = useState<string | React.ReactElement>();
  const [availableBalance, setAvailableBalance] = useState<string>();
  const [availableBalanceInAccount, setAvailableBalanceInAccount] =
    useState<string>();
  const [volatility_ratio, set_volatility_ratio] = useState<string>();
  const [healthFactor, setHealthFactor] = useState<number>();
  const [isMax, setIsMax] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [sliderAmount, setSliderAmount] = useState<string>('0');
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [repayWay, setRepayWay] = useState<IRepayWay>('wallet');
  const [errorText, setErrorText] = useState<string>('');
  const cardWidth = isMobile() ? '95vw' : '430px';
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const intl = useIntl();
  function switchEvent() {
    setSwitchStatus(!switchStatus);
  }
  // get details
  function Details() {
    const { action, asset } = modalData;
    let detail;
    let button;
    const [buttonDisabled, errorText] = operatingState() as [boolean, string];
    setErrorText(errorText);
    if (action == 'supply') {
      detail = (
        <>
          <Template
            title={<FormattedMessage id="UseAsCollateral" />}
            value={''}
            className="mb-5"
            switchButton={
              <div className="flex items-center">
                <div
                  className={`flex items-center w-9 h-5 rounded-2xl ml-2 p-0.5 ${
                    asset.config.can_use_as_collateral
                      ? 'cursor-pointer'
                      : 'opacity-40 cursor-not-allowed'
                  } ${switchStatus ? 'bg-greenColor' : 'bg-gray3'}`}
                  onClick={() => {
                    if (asset.config.can_use_as_collateral) {
                      switchEvent();
                    }
                  }}
                >
                  <label
                    style={{
                      boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.5)',
                      transition: 'all 100ms ease-out',
                      marginLeft: switchStatus ? '16px' : '2px',
                    }}
                    className={`w-3.5 h-3.5 bg-white rounded-full ${
                      asset.config.can_use_as_collateral
                        ? 'cursor-pointer'
                        : 'cursor-not-allowed'
                    }`}
                  ></label>
                </div>
              </div>
            }
          ></Template>

          <Template
            title={<FormattedMessage id="CollateralFactor" />}
            value={volatility_ratio}
          ></Template>
        </>
      );
      button = (
        <GradientButton
          full={true}
          disabled={buttonLoading || buttonDisabled}
          onClick={handleSupply}
        >
          <ButtonTextWrapper
            loading={buttonLoading}
            Text={() => (
              <>
                <FormattedMessage id="Supply" />
              </>
            )}
          />
        </GradientButton>
      );
    } else if (action == 'adjust') {
      const v = get_as_collateral_adjust(account, asset, amount);
      detail = (
        <Template
          title={<FormattedMessage id="UseAsCollateral" />}
          value={v}
          show$={true}
          asset={asset}
        ></Template>
      );
      button = (
        <GradientButton
          disabled={buttonLoading || buttonDisabled}
          onClick={handleAdjust}
          full={true}
        >
          <ButtonTextWrapper
            loading={buttonLoading}
            Text={() => (
              <>
                <FormattedMessage id="Confirm" />
              </>
            )}
          />
        </GradientButton>
      );
    } else if (action == 'borrow') {
      detail = (
        <Template
          title={<FormattedMessage id="CollateralFactor" />}
          value={volatility_ratio}
        ></Template>
      );
      button = (
        <PurpleButton
          full={true}
          disabled={buttonLoading || buttonDisabled}
          onClick={handleBorrow}
        >
          <ButtonTextWrapper
            loading={buttonLoading}
            Text={() => (
              <>
                <FormattedMessage id="Borrow" />
              </>
            )}
          />
        </PurpleButton>
      );
    } else if (action == 'repay') {
      const v = get_remain_borrow_repay(account, asset, amount);
      detail = (
        <Template
          title={<FormattedMessage id="RemainingBorrow" />}
          value={v}
          show$={true}
          asset={asset}
        ></Template>
      );
      button = (
        <PurpleButton
          full={true}
          disabled={buttonLoading || buttonDisabled}
          onClick={handleRepay}
        >
          <ButtonTextWrapper
            loading={buttonLoading}
            Text={() => (
              <>
                <FormattedMessage id="Repay" />
              </>
            )}
          />
        </PurpleButton>
      );
    } else if (action == 'withdraw') {
      const v = get_remain_collateral_withdraw(account, asset, amount);
      detail = (
        <Template
          title={<FormattedMessage id="RemainingCollateral" />}
          value={v}
          show$={true}
          asset={asset}
        ></Template>
      );
      button = (
        <GradientButton
          full={true}
          disabled={buttonLoading || buttonDisabled}
          onClick={handleWithdraw}
        >
          <ButtonTextWrapper
            loading={buttonLoading}
            Text={() => (
              <>
                <FormattedMessage id="Withdraw" />
              </>
            )}
          />
        </GradientButton>
      );
    }
    if (!isSignedIn) {
      button = <ConnectToNearBtn></ConnectToNearBtn>;
    }
    setActionButton(button);
    setExtraDetail(detail);
  }
  function operatingState() {
    const burrowErrorTip = intl.formatMessage({ id: 'burrowErrorTip' });
    const healthErrorTip = intl.formatMessage({ id: 'healthErrorTip' });
    let buttonDisabled = false;
    let errorText = '';
    const { action, asset } = modalData;
    if (isInvalid(amount) || (action !== 'adjust' && Big(amount).lte(0))) {
      buttonDisabled = true;
      errorText = '';
      return [buttonDisabled, errorText];
    }
    if (Big(healthFactor || 0).gte(0) && Big(healthFactor || 0).lte(105)) {
      errorText = healthErrorTip;
      if (Big(healthFactor || 0).lte(100)) {
        buttonDisabled = true;
      }
      return [buttonDisabled, errorText];
    }
    if (
      Big(amount || 0).gt(0) &&
      Big(expandToken(amount, asset?.metadata?.decimals)).lt(1)
    ) {
      if (
        action == 'borrow' ||
        action == 'supply' ||
        action == 'withdraw' ||
        (action == 'repay' && repayWay == 'wallet')
      ) {
        buttonDisabled = true;
        errorText = burrowErrorTip;
        return [buttonDisabled, errorText];
      }
    }
    return [buttonDisabled, errorText];
  }
  // get max balance、title、button、cf
  function getStaticData() {
    const { action, asset } = modalData;
    let title;
    let availableBalance;
    if (action == 'supply') {
      title = `${intl.formatMessage({ id: 'Supply' })} ${
        asset?.metadata?.symbol
      }`;
      availableBalance = computeSupplyMaxAmount(asset, nearBalance);
    } else if (action == 'adjust') {
      title = <FormattedMessage id="AdjustCollateral" />;
      availableBalance = computeAdjustMaxAmount(account, asset);
    } else if (action == 'borrow') {
      title = `${intl.formatMessage({ id: 'Borrow' })} ${
        asset?.metadata?.symbol
      }`;
      availableBalance = computeBurrowMaxAmount(account, asset, assets);
    } else if (action == 'repay') {
      title = `${intl.formatMessage({ id: 'Repay' })} ${
        asset?.metadata?.symbol
      }`;
      const [availableBalance_wallet, availableBalance_deposit] =
        computeRepayMaxAmount(account, asset, assets, nearBalance);
      availableBalance = availableBalance_wallet;
      setAvailableBalanceInAccount(availableBalance_deposit);
    } else if (action == 'withdraw') {
      title = `${intl.formatMessage({ id: 'Withdraw' })} ${
        asset?.metadata?.symbol
      }`;
      availableBalance = computeWithdrawMaxAmount(account, asset, assets);
    }
    setAvailableBalance(availableBalance);
    setModalTitle(title);
    set_volatility_ratio(asset.config.volatility_ratio / 100 + '%');
  }
  useEffect(() => {
    if (account && modalData && availableBalance) {
      const { action, asset } = modalData;
      if (action == 'adjust') {
        const init_collateral = get_as_collateral_adjust(account, asset, '');
        setAmount(init_collateral);
        setSliderAmount(
          Big(init_collateral || 0)
            .div(availableBalance || 1)
            .mul(100)
            .toFixed()
        );
        if (Big(init_collateral).eq(availableBalance)) {
          setIsMax(true);
        }
      }
    }
  }, [modalData, account, availableBalance]);
  useEffect(() => {
    if (modalData) {
      Details();
    }
  }, [
    modalData,
    switchStatus,
    amount,
    volatility_ratio,
    healthFactor,
    repayWay,
    buttonLoading,
    isMax,
  ]);
  useEffect(() => {
    if (modalData) {
      getStaticData();
    }
  }, [modalData]);
  // get healthFactor
  useEffect(() => {
    if (!(assets && modalData)) return;
    let newHealthFactor;
    if (!isInvalid(amount)) {
      const { action, asset } = modalData;
      if (action == 'adjust') {
        newHealthFactor = recomputeAdjustHealthFactor(
          account,
          asset,
          assets,
          amount
        );
      } else if (action == 'withdraw') {
        newHealthFactor = recomputeWithdrawHealthFactor(
          account,
          asset,
          assets,
          amount
        );
      } else if (action == 'supply') {
        newHealthFactor = switchStatus
          ? recomputeSupplyHealthFactor(account, asset, assets, amount)
          : getHealthFactor(account, assets);
      } else if (action == 'repay') {
        if (repayWay == 'wallet') {
          newHealthFactor = recomputeRepayHealthFactor(
            account,
            asset,
            assets,
            amount
          );
        } else if (repayWay == 'deposit') {
          newHealthFactor = recomputeRepayHealthFactorFromDeposits(
            account,
            asset,
            assets,
            amount
          );
        }
      } else if (action == 'borrow') {
        newHealthFactor = recomputeBurrowHealthFactor(
          account,
          asset,
          assets,
          amount
        );
      }
    } else {
      newHealthFactor = getHealthFactor(account, assets);
    }
    setHealthFactor(newHealthFactor);
  }, [amount, modalData, account, assets, switchStatus]);
  function handleAdjust() {
    setButtonLoading(true);
    submitAdjust({
      account,
      asset: modalData.asset,
      isMax,
      amount,
      availableBalance,
      setShowModalBox,
      globalConfig,
    });
  }
  function handleSupply() {
    setButtonLoading(true);
    submitSupply({
      asset: modalData.asset,
      isMax,
      amount,
      availableBalance,
      switchStatus,
    });
  }
  function handleBorrow() {
    setButtonLoading(true);
    submitBorrow({
      asset: modalData.asset,
      isMax,
      amount,
      availableBalance,
      globalConfig,
    });
  }
  function handleRepay() {
    setButtonLoading(true);
    submitRepay({
      account,
      asset: modalData.asset,
      isMax,
      amount,
      availableBalance:
        repayWay == 'deposit' ? availableBalanceInAccount : availableBalance,
      repayWay,
      globalConfig,
    });
  }
  function handleWithdraw() {
    setButtonLoading(true);
    submitWithdraw({
      account,
      asset: modalData.asset,
      isMax,
      amount,
      availableBalance,
      globalConfig,
    });
  }
  return (
    <Modal
      isOpen={showModalBox}
      onRequestClose={(e) => {
        e.stopPropagation();
        setShowModalBox(false);
      }}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        },
        content: {
          outline: 'none',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <div
        style={{ width: cardWidth, maxHeight: '95vh' }}
        className={`outline-none bg-cardBg border border-gradientFrom border-opacity-30 overflow-auto rounded-2xl  xsm:rounded-lg`}
      >
        <div className="px-6 py-5 xsm:p-5">
          {/* Title */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-white text-lg gotham_bold">{modalTitle}</span>
            <CloseButton
              className="cursor-pointer"
              onClick={() => {
                setShowModalBox(false);
              }}
            ></CloseButton>
          </div>
          {/* repay way select */}
          {modalData?.action == 'repay' ? (
            <RepayTab
              repayWay={repayWay}
              setRepayWay={setRepayWay}
              setAmount={setAmount}
              setSliderAmount={setSliderAmount}
            ></RepayTab>
          ) : null}
          {/* Input */}
          {repayWay !== 'deposit' ? (
            <InputBox
              balance={availableBalance}
              asset={modalData?.asset}
              setIsMax={setIsMax}
              isMax={isMax}
              amount={amount}
              setAmount={setAmount}
              sliderAmount={sliderAmount}
              setSliderAmount={setSliderAmount}
              action={modalData?.action}
            ></InputBox>
          ) : (
            <InputBox
              balance={availableBalanceInAccount}
              asset={modalData?.asset}
              setIsMax={setIsMax}
              isMax={isMax}
              amount={amount}
              setAmount={setAmount}
              sliderAmount={sliderAmount}
              setSliderAmount={setSliderAmount}
              action={modalData?.action}
            ></InputBox>
          )}
        </div>
        {errorText ? <ErrorTemplate tip={errorText}></ErrorTemplate> : null}

        <div className="px-6 py-5 xsm:p-5 border-2 border-burrowTableBorderColor">
          {/* Details */}
          <div className="flex items-center justify-between  mb-5">
            <span className="text-sm text-primaryText">
              <FormattedMessage id="HealthFactor" />
            </span>
            <span className="text-sm text-white">
              {isSignedIn ? formatPercentage(healthFactor) : '-%'}
            </span>
          </div>
          {extraDetail}
          {/* Action */}
          <div className="mt-6">{actionButton}</div>
        </div>
      </div>
    </Modal>
  );
}

function ErrorTemplate({ tip }: { tip: string }) {
  return (
    <div className="flex items-start text-sm text-warnColor mt-2.5 px-6 pb-6">
      <WarningIcon className="ml-2.5 mr-2 flex-shrink-0 relative top-1"></WarningIcon>
      {tip}
    </div>
  );
}
function Template(props: {
  title: string | React.ReactElement;
  value: string;
  show$?: boolean;
  switchButton?: React.ReactElement;
  asset?: IAsset;
  className?: string;
}) {
  const { title, value, show$, switchButton, asset, className } = props;
  let value$;
  let formatValue = value;
  if (show$ && asset) {
    value$ = formatWithCommas_usd(
      Big(asset.price?.usd || 0)
        .mul(value || 0)
        .toFixed()
    );
    formatValue = formatNumber(value);
  }
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-sm text-primaryText">{title}</span>
      <span className="flex items-center text-sm text-white">
        {formatValue}
        {show$ && <label className="text-primaryText ml-1.5">({value$})</label>}
        {switchButton}
      </span>
    </div>
  );
}

function RepayTab(props: {
  repayWay: IRepayWay;
  setRepayWay: Function;
  setAmount: Function;
  setSliderAmount: Function;
}) {
  const { repayWay, setRepayWay, setAmount, setSliderAmount } = props;
  return (
    <div className="flex items-center justify-between mb-5">
      <span className="text-sm text-primaryText">From</span>
      <div className="flex items-center border border-v3borderColor rounded-lg p-0.5">
        <div
          onClick={() => {
            setRepayWay('wallet');
            setAmount('0');
            setSliderAmount('0');
          }}
          className={`flex items-center justify-center px-5 w-1/2 h-7 rounded-md cursor-pointer gotham_bold text-xs whitespace-nowrap ${
            repayWay == 'wallet'
              ? 'bg-burrowTabColor text-white'
              : 'text-primaryText'
          }`}
        >
          <FormattedMessage id="wallet_up" />
        </div>
        <div
          onClick={() => {
            setRepayWay('deposit');
            setAmount('0');
            setSliderAmount('0');
          }}
          className={`flex items-center justify-center px-5 w-1/2 h-7 rounded-md cursor-pointer gotham_bold text-xs whitespace-nowrap ${
            repayWay == 'deposit'
              ? 'bg-burrowTabColor text-white'
              : 'text-primaryText'
          }`}
        >
          <FormattedMessage id="Supplied" />
        </div>
      </div>
    </div>
  );
}
