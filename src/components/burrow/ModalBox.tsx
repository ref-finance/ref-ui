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
} from '~services/burrow-interfaces';
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
  recomputeBurrowHealthFactor,
  get_as_collateral_adjust,
  get_remain_borrow_repay,
  get_remain_collateral_withdraw,
} from '~services/burrow-business';
import {
  formatPercentage,
  isInvalid,
  formatNumber,
  formatWithCommas_usd,
} from '~services/burrow-utils';
import {
  submitAdjust,
  submitSupply,
  submitWithdraw,
  submitRepay,
  submitBorrow,
} from '~services/burrow';
import { BurrowData } from '../../pages/Burrow';
import { WarningIcon } from '~components/icon/V3';
import { ButtonTextWrapper, ConnectToNearBtn } from '~components/button/Button';
import { WalletContext } from '../../utils/wallets-integration';
import Big from 'big.js';
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
  const [switchStatus, setSwitchStatus] = useState<boolean>(false);
  const [extraDetail, setExtraDetail] = useState<React.ReactElement>();
  const [actionButton, setActionButton] = useState<React.ReactElement>();
  const [modalTitle, setModalTitle] = useState<string>();
  const [availableBalance, setAvailableBalance] = useState<string>();
  const [volatility_ratio, set_volatility_ratio] = useState<string>();
  const [healthFactor, setHealthFactor] = useState<number>();
  const [isMax, setIsMax] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [sliderAmount, setSliderAmount] = useState<string>('0');
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const cardWidth = isMobile() ? '90vw' : '415px';
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  function switchEvent() {
    setSwitchStatus(!switchStatus);
  }
  // get details
  function Details() {
    const { action, asset } = modalData;
    let detail;
    if (action == 'supply') {
      detail = (
        <Template
          title="Use as Collateral"
          value={volatility_ratio}
          switchButton={
            <div
              className={`flex items-center w-9 h-5 rounded-2xl cursor-pointer ml-2 p-0.5 ${
                switchStatus ? 'bg-greenColor' : 'bg-gray3'
              }`}
              onClick={switchEvent}
            >
              <label
                style={{
                  boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.5)',
                  transition: 'all 100ms ease-out',
                  marginLeft: switchStatus ? '16px' : '2px',
                }}
                className={`w-3.5 h-3.5 bg-white rounded-full cursor-pointer`}
              ></label>
            </div>
          }
        ></Template>
      );
    } else if (action == 'adjust') {
      const v = get_as_collateral_adjust(account, asset, amount);
      detail = (
        <Template
          title="Use as Collateral"
          value={v}
          show$={true}
          asset={asset}
        ></Template>
      );
    } else if (action == 'borrow') {
      detail = (
        <Template title="Collateral Factor" value={volatility_ratio}></Template>
      );
    } else if (action == 'repay') {
      const v = get_remain_borrow_repay(availableBalance, amount);
      detail = (
        <Template
          title="Remaining Borrow"
          value={v}
          show$={true}
          asset={asset}
        ></Template>
      );
    } else if (action == 'withdraw') {
      const v = get_remain_collateral_withdraw(account, asset, amount);
      detail = (
        <Template
          title="Remaining Collateral"
          value={v}
          show$={true}
          asset={asset}
        ></Template>
      );
    }
    if (
      isInvalid(amount) ||
      Big(healthFactor || 0).lt(100) ||
      (action !== 'adjust' && Big(amount).lte(0))
    ) {
      setButtonDisabled(true);
    } else {
      setButtonDisabled(false);
    }
    setExtraDetail(detail);
  }
  // get max balance
  function Actions() {
    const { action, asset } = modalData;
    let button;
    let title;
    let availableBalance;
    if (action == 'supply') {
      button = (
        <GradientButton
          full={true}
          disabled={buttonLoading || buttonDisabled}
          onClick={handleSupply}
        >
          <ButtonTextWrapper loading={buttonLoading} Text={() => <>Supply</>} />
        </GradientButton>
      );
      title = `Supply ${asset?.metadata?.symbol}`;
      availableBalance = computeSupplyMaxAmount(asset, nearBalance);
    } else if (action == 'adjust') {
      button = (
        <GradientButton
          disabled={buttonLoading || buttonDisabled}
          onClick={handleAdjust}
          full={true}
        >
          <ButtonTextWrapper
            loading={buttonLoading}
            Text={() => <>Confirm</>}
          />
        </GradientButton>
      );
      title = `Adjust Collateral`;
      availableBalance = computeAdjustMaxAmount(account, asset);
    } else if (action == 'borrow') {
      button = (
        <PurpleButton
          full={true}
          disabled={buttonLoading || buttonDisabled}
          onClick={handleBorrow}
        >
          <ButtonTextWrapper loading={buttonLoading} Text={() => <>Borrow</>} />
        </PurpleButton>
      );
      title = `Borrow ${asset?.metadata?.symbol}`;
      availableBalance = computeBurrowMaxAmount(account, asset, assets);
    } else if (action == 'repay') {
      button = (
        <PurpleButton
          full={true}
          disabled={buttonLoading || buttonDisabled}
          onClick={handleRepay}
        >
          <ButtonTextWrapper loading={buttonLoading} Text={() => <>Repay</>} />
        </PurpleButton>
      );
      title = `Repay ${asset?.metadata?.symbol}`;
      availableBalance = computeRepayMaxAmount(account, asset, nearBalance);
    } else if (action == 'withdraw') {
      button = (
        <GradientButton
          full={true}
          disabled={buttonLoading || buttonDisabled}
          onClick={handleWithdraw}
        >
          <ButtonTextWrapper
            loading={buttonLoading}
            Text={() => <>Withdraw</>}
          />
        </GradientButton>
      );
      title = `Withdraw ${asset?.metadata?.symbol}`;
      availableBalance = computeWithdrawMaxAmount(account, asset, assets);
    }
    if (!isSignedIn) {
      button = <ConnectToNearBtn></ConnectToNearBtn>;
    }
    setAvailableBalance(availableBalance);
    setActionButton(button);
    setModalTitle(title);
    set_volatility_ratio(asset.config.volatility_ratio / 100 + '%');
  }
  useEffect(() => {
    if (modalData) {
      Details();
    }
  }, [modalData, switchStatus, amount, volatility_ratio, healthFactor]);
  useEffect(() => {
    if (modalData) {
      Actions();
    }
  }, [modalData, buttonDisabled, buttonLoading, switchStatus]);
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
        newHealthFactor = recomputeRepayHealthFactor(
          account,
          asset,
          assets,
          amount
        );
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
    if (Number(newHealthFactor) >= 0 && Number(newHealthFactor) <= 105) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
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
      asset: modalData.asset,
      isMax,
      amount,
      availableBalance,
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
        <div className="px-6 py-5 xsm:p-3">
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
          {/* Input */}
          <InputBox
            balance={availableBalance}
            asset={modalData?.asset}
            setIsMax={setIsMax}
            isMax={isMax}
            amount={amount}
            setAmount={setAmount}
            sliderAmount={sliderAmount}
            setSliderAmount={setSliderAmount}
          ></InputBox>
        </div>
        {showWarning && (
          <div className="flex items-start text-sm text-warnColor mt-2.5 px-6 pb-6">
            <WarningIcon className="ml-2.5 mr-2"></WarningIcon>
            Your health factor will be dangerously low and you're at risk of
            liquidation
          </div>
        )}

        <div className="px-6 py-5 xsm:p-3 border-2 border-burrowTableBorderColor">
          {/* Details */}
          <div className="flex items-center justify-between  mb-5">
            <span className="text-sm text-primaryText">Health Factor</span>
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

function Template(props: {
  title: string;
  value: string;
  show$?: boolean;
  switchButton?: React.ReactElement;
  asset?: IAsset;
}) {
  const { title, value, show$, switchButton, asset } = props;
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
    <div className="flex items-center justify-between">
      <span className="text-sm text-primaryText">{title}</span>
      <span className="flex items-center text-sm text-white">
        {formatValue}
        {show$ && <label className="text-primaryText ml-1.5">({value$})</label>}
        {switchButton}
      </span>
    </div>
  );
}
