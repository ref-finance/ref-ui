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
} from '~services/burrow-interfaces';
import {
  computeAdjustMaxBalance,
  computeWithdrawMaxAmount,
  computeSupplyMaxAmount,
  computeRepayMaxAmount,
  computeBurrowMaxAmount,
} from '~services/burrow-business';
import { BurrowData } from '../../pages/Burrow';
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
  }: {
    account: IAccount;
    assets: IAsset[];
    rewards: IAssetRewardDetail[];
    nearBalance: string;
  } = useContext(BurrowData);
  const { showModalBox, setShowModalBox, modalData } = props;
  const [switchStatus, setSwitchStatus] = useState<boolean>(false);
  const [extraDetail, setExtraDetail] = useState<React.ReactElement>();
  const [actionButton, setActionButton] = useState<React.ReactElement>();
  const [modalTitle, setModalTitle] = useState<string>();
  const [availableBalance, setAvailableBalance] = useState<string>();
  const [use_as_collateral_balance, set_use_as_collateral_balance] =
    useState<string>();
  const cardWidth = isMobile() ? '90vw' : '415px';
  function switchEvent() {
    setSwitchStatus(!switchStatus);
  }
  function Details() {
    const { action } = modalData;
    let detail;
    if (action == 'supply') {
      detail = (
        <Template
          title="Use as Collateral"
          value="95%"
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
      detail = (
        <Template title="Use as Collateral" value="95%" value$="$10"></Template>
      );
    } else if (action == 'borrow') {
      detail = <Template title="Collateral Factor" value="95%"></Template>;
    } else if (action == 'repay') {
      detail = (
        <Template title="Remaining Borrow" value="100" value$="$10"></Template>
      );
    } else if (action == 'withdraw') {
      detail = (
        <Template
          title="Remaining Collateral"
          value="100"
          value$="$10"
        ></Template>
      );
    }
    setExtraDetail(detail);
  }
  function Actions() {
    const { action, asset } = modalData;
    let button;
    let title;
    let availableBalance;
    let use_as_collateral_balance;
    if (action == 'supply') {
      button = <GradientButton full={true}>Supply</GradientButton>;
      title = `Supply ${asset?.metadata?.symbol}`;
      const data = computeSupplyMaxAmount(asset, nearBalance);
      availableBalance = data[0];
    } else if (action == 'adjust') {
      button = <GradientButton full={true}>Confirm</GradientButton>;
      title = `Adjust Collateral`;
      const data = computeAdjustMaxBalance(account, asset);
      availableBalance = data[0];
      use_as_collateral_balance = data[1];
    } else if (action == 'borrow') {
      button = <PurpleButton full={true}>Borrow</PurpleButton>;
      title = `Borrow ${asset?.metadata?.symbol}`;
      const data = computeBurrowMaxAmount(account, asset, assets);
      availableBalance = data[0];
    } else if (action == 'repay') {
      button = <PurpleButton full={true}>Repay</PurpleButton>;
      title = `Repay ${asset?.metadata?.symbol}`;
      const data = computeRepayMaxAmount(account, asset, nearBalance);
      availableBalance = data[0];
    } else if (action == 'withdraw') {
      button = <GradientButton full={true}>Withdraw</GradientButton>;
      title = `Withdraw ${asset?.metadata?.symbol}`;
      const data = computeWithdrawMaxAmount(account, asset, assets);
      availableBalance = data[0];
    }
    setAvailableBalance(availableBalance);
    set_use_as_collateral_balance(use_as_collateral_balance);
    setActionButton(button);
    setModalTitle(title);
  }
  useEffect(() => {
    if (modalData) {
      Details();
      Actions();
    }
  }, [modalData]);
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
          ></InputBox>
        </div>
        <div className="px-6 py-5 xsm:p-3 border-2 border-burrowTableBorderColor">
          {/* Details */}
          <div className="flex items-center justify-between  mb-5">
            <span className="text-sm text-primaryText">Health Factor</span>
            <span className="text-sm text-white">100.08%</span>
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
  value$?: string;
  switchButton?: React.ReactElement;
}) {
  const { title, value, value$, switchButton } = props;
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-primaryText">{title}</span>
      <span className="text-sm text-white">
        {value}
        {value$ && (
          <label className="text-primaryText ml-1.5">({value$})</label>
        )}
        {switchButton}
      </span>
    </div>
  );
}
