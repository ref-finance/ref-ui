import React, { useState, useMemo, useEffect } from 'react';
import Modal from 'react-modal';
import { isMobile } from '../../utils/device';
import { ModalCloseIcon } from '../../components/meme/icons';
import {
  OprationButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import {
  useWalletSelector,
  Ipermission,
} from '../../context/WalletSelectorContext';
import { toReadableNumber, toPrecision } from '../../utils/numbers';
import {
  batchDeleteKeys,
  batchOrderelyDeleteKeys,
} from '../../services/portfolioData';
import { getPublicKey } from '../../pages/Orderly/orderly/utils';
import { getAccountKeyInfo } from '../../pages/Orderly/orderly/off-chain-api';
import { IOrderKeyInfo } from '../../pages/Orderly/orderly/type';
import { ChartLoading } from 'src/components/icon/Loading';
import { ConnnectIcon, OrderlyIcon, CheckedIcon } from './icons';
import QuestionMark from 'src/components/farm/QuestionMark';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
const maxLength = 10;
const maxOrderlyLength = 10;
function AccessKeyModal(props: any) {
  const { isOpen, onRequestClose } = props;
  const cardWidth = isMobile() ? '95vw' : '32vw';
  const cardHeight = isMobile() ? '90vh' : '100vh';
  const [currentUsedKeys, setCurrentUsedKeys] = useState<string[]>([]);
  const { accountId } = useWalletSelector();
  const [tab, setTab] = useState<'accessKey' | 'orderlyKey'>('accessKey');
  useEffect(() => {
    getUsedKeys();
  }, [accountId]);
  async function getUsedKeys() {
    const keyUsed = await getPublicKey(accountId);
    setCurrentUsedKeys([keyUsed]);
  }
  function getApprovedTip() {
    return `
    <div class="flex items-center text-navHighLightText text-xs text-left w-48 gotham_font">
        Authorize one Gas fee key per Dapp. Clean up if there are multiples.
    </div>
    `;
  }
  function getOrderlyTip() {
    return `
    <div class="flex items-center text-navHighLightText text-xs text-left w-48 gotham_font">
    Authorize one ordering key per account. Clean up if there are multiples. Deleting Orderly Keys may have delays as it requires confirmation from Orderly.
    </div>
    `;
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          overflow: 'auto',
        },
        content: {
          outline: 'none',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <div
        className="rounded-2xl"
        style={{
          width: cardWidth,
          maxHeight: cardHeight,
          border: '1px solid #414D55',
          backgroundColor: '#1A2730',
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray1 xsm:p-3">
          <div className="flex items-center">
            <span
              onClick={() => {
                setTab('accessKey');
              }}
              className={`flex items-center gap-1.5 text-lg gotham_bold pr-4 border-r border-v3SwapGray border-opacity-20 cursor-pointer ${
                tab == 'accessKey' ? 'text-white' : 'text-limitOrderInputColor'
              }`}
            >
              Approved
              <div
                className="text-white text-right ml-1"
                data-class="reactTip"
                data-tooltip-id={'approved'}
                data-place="top"
                data-tooltip-html={getApprovedTip()}
              >
                <QuestionMark />
                <CustomTooltip id={'approved'} />
              </div>
            </span>
            <div
              onClick={() => {
                setTab('orderlyKey');
              }}
              className={`flex items-center gap-1.5 pl-4 cursor-pointer ${
                tab == 'orderlyKey' ? 'text-white' : 'text-limitOrderInputColor'
              }`}
            >
              <OrderlyIcon isActive={tab == 'orderlyKey'} />
              <span className="flex items-center gap-1.5 text-lg gotham_bold">
                Orderly
                <div
                  className="text-white text-right ml-1"
                  data-class="reactTip"
                  data-tooltip-id={'orderly'}
                  data-place="top"
                  data-tooltip-html={getOrderlyTip()}
                >
                  <QuestionMark />
                  <CustomTooltip id={'orderly'} />
                </div>
              </span>
            </div>
          </div>
          <ModalCloseIcon className="cursor-pointer" onClick={onRequestClose} />
        </div>
        <AuthorizedApps
          hidden={tab == 'orderlyKey'}
          currentUsedKeys={currentUsedKeys}
        />
        <OrderlyKeys
          hidden={tab == 'accessKey'}
          currentUsedKeys={currentUsedKeys}
        />
      </div>
    </Modal>
  );
}
function AuthorizedApps({
  hidden,
  currentUsedKeys,
}: {
  hidden: boolean;
  currentUsedKeys: string[];
}) {
  const [clear_loading, set_clear_loading] = useState<boolean>(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const { allKeys } = useWalletSelector();
  const disbaledWallet = ['sender', 'neth', 'keypom', 'okx-wallet'];
  const selectedWalletId = window.selector?.store?.getState()?.selectedWalletId;
  const functionCallKeys = useMemo(() => {
    return allKeys.filter((key) => key.access_key.permission !== 'FullAccess');
  }, [allKeys]);
  const allCheckdLength = useMemo(() => {
    if (functionCallKeys?.length) {
      const m = functionCallKeys.filter(
        (item) => !currentUsedKeys.includes(item.public_key)
      );
      return Math.min(m.length, maxLength);
    }
    return 0;
  }, [functionCallKeys, currentUsedKeys.length]);
  function getAllowance(b: string) {
    if (b) {
      return toPrecision(toReadableNumber(24, b), maxLength) + ' NEAR';
    }
    return 'Unlimited';
  }
  function onCheck(public_key) {
    if (selectedKeys.has(public_key)) {
      selectedKeys.delete(public_key);
    } else {
      if (selectedKeys.size == maxLength) return;
      selectedKeys.add(public_key);
    }
    setSelectedKeys(new Set(selectedKeys));
  }
  function onCheckAll() {
    if (selectedKeys.size == allCheckdLength) {
      setSelectedKeys(new Set([]));
    } else {
      const checkedAll = functionCallKeys
        .filter((key) => !currentUsedKeys.includes(key.public_key))
        .slice(0, maxLength)
        .reduce((acc, cur) => {
          acc.push(cur.public_key);
          return acc;
        }, []);
      setSelectedKeys(new Set(checkedAll));
    }
  }
  function batchClear() {
    set_clear_loading(true);
    batchDeleteKeys(Array.from(selectedKeys));
  }
  function switchWallet() {
    window.modal.show();
  }
  const disabled = selectedKeys.size === 0;
  const isEmpty = functionCallKeys.length == 0;
  const isDisabledAction = disbaledWallet.includes(selectedWalletId);
  return (
    <div className={`py-4 ${hidden ? 'hidden' : ''}`}>
      <div className="flex items-center justify-between px-6 mb-3 xsm:px-3">
        <div className="flex items-center gap-1">
          <span className="text-sm text-white gotham_bold">Approved Keys</span>
          <span className="flex items-center justify-center text-xs text-white px-1.5 py-1.5 rounded-md gotham_bold bg-primaryText bg-opacity-20">
            {functionCallKeys.length}
          </span>
        </div>
        {allCheckdLength > 0 && !isDisabledAction ? (
          <div className="flex items-center gap-1.5 text-sm text-primaryText">
            <Checkbox
              onClick={onCheckAll}
              checked={selectedKeys.size == allCheckdLength}
            />{' '}
            Remove-10
          </div>
        ) : null}
      </div>
      <div
        className="overflow-auto hide-scrollbar px-6 border-b border-gray1 xsm:px-3"
        style={{ maxHeight: '290px' }}
      >
        {functionCallKeys.map((item) => {
          const isUsed = currentUsedKeys.includes(item.public_key);
          return (
            <div
              key={item.public_key}
              className="bg-primaryText bg-opacity-20 rounded-xl p-4 mb-3"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1">
                  <p className="text-base gotham_bold text-white break-all">
                    {
                      (item?.access_key?.permission as Ipermission)
                        ?.FunctionCall?.receiver_id
                    }
                  </p>
                  {isUsed ? (
                    <span className="flex items-center justify-center bg-portfolioQinColor text-xs gotham_bold italic whitespace-nowrap rounded w-12 text-black">
                      In use
                    </span>
                  ) : null}
                </div>
                {!isUsed && (
                  <Checkbox
                    appearance="b"
                    checked={selectedKeys.has(item.public_key)}
                    hidden={isDisabledAction}
                    onClick={() => {
                      onCheck(item.public_key);
                    }}
                  />
                )}
              </div>
              <div className="flex items-center  bg-black bg-opacity-20 rounded-md text-xs text-greenColor p-2.5 my-3 break-all">
                {item.public_key}
              </div>
              <div className="flex items-center text-sm gap-1.5">
                <span className="text-primaryText">Fee Allowance</span>
                <span className="text-white">
                  {getAllowance(
                    (item?.access_key?.permission as Ipermission)?.FunctionCall
                      ?.allowance
                  )}{' '}
                </span>
              </div>
            </div>
          );
        })}
        {isEmpty ? (
          <div className="flex justify-center my-20 text-xs text-primaryText">
            No Data
          </div>
        ) : null}
      </div>
      {isDisabledAction ? (
        <div className="border border-warningYellowColor border-opacity-30 px-4 py-2.5 text-memeyellowColor text-sm bg-memeyellowColor bg-opacity-10 mx-6 rounded-xl my-4">
          This wallet doesn't support Delete Key. Consider switching to another
          wallet if necessary.
        </div>
      ) : null}
      {!isDisabledAction ? (
        <div className="px-6 xsm:px-3">
          <OprationButton
            minWidth="7rem"
            disabled={disabled}
            onClick={batchClear}
            background="linear-gradient(180deg, #00C6A2 0%, #008B72 100%"
            className={`flex flex-grow items-center justify-center text-white mt-6 rounded-xl h-12 text-base gotham_bold focus:outline-none ${
              disabled || clear_loading ? 'opacity-40' : ''
            }`}
          >
            <ButtonTextWrapper
              loading={clear_loading}
              Text={() => <div className="flex items-center gap-2">Clear</div>}
            />
          </OprationButton>
        </div>
      ) : (
        <div className="px-6 xsm:px-3">
          <OprationButton
            minWidth="7rem"
            onClick={switchWallet}
            className={`flex flex-grow items-center justify-center border border-greenColor text-greenColor gotham_font rounded-xl h-12 text-base focus:outline-none`}
          >
            Switch Wallet
          </OprationButton>
        </div>
      )}
    </div>
  );
}
function OrderlyKeys({
  hidden,
  currentUsedKeys,
}: {
  hidden: boolean;
  currentUsedKeys: string[];
}) {
  const [clear_loading, set_clear_loading] = useState<boolean>(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [allOrderlyKeys, setAllOrderlyKeys] = useState<string[]>([]);
  const [orderlyKeyLoading, setOrderlyKeyLoading] = useState<boolean>(true);
  const { accountId } = useWalletSelector();
  useEffect(() => {
    if (accountId) {
      getAccountKeyInfo({ accountId }).then((keys: IOrderKeyInfo[]) => {
        const activeKeys = keys
          .filter((key: IOrderKeyInfo) => key.key_status === 'ACTIVE')
          .reduce((acc, cur) => {
            acc.push(cur.orderly_key);
            return acc;
          }, []);
        setAllOrderlyKeys(activeKeys);
        setOrderlyKeyLoading(false);
      });
    }
  }, [accountId]);
  const displayAllOrderlyKeys = useMemo(() => {
    return allOrderlyKeys.filter((key) => !currentUsedKeys.includes(key));
  }, [allOrderlyKeys.length, currentUsedKeys.length]);
  const allCheckdLength = useMemo(() => {
    if (displayAllOrderlyKeys?.length) {
      return Math.min(displayAllOrderlyKeys.length, maxOrderlyLength);
    }
    return 0;
  }, [displayAllOrderlyKeys]);
  function onCheck(public_key) {
    if (selectedKeys.has(public_key)) {
      selectedKeys.delete(public_key);
    } else {
      if (selectedKeys.size == maxOrderlyLength) return;
      selectedKeys.add(public_key);
    }
    setSelectedKeys(new Set(selectedKeys));
  }
  function onCheckAll() {
    if (selectedKeys.size == allCheckdLength) {
      setSelectedKeys(new Set([]));
    } else {
      const checkedAll = displayAllOrderlyKeys
        .filter((key) => !currentUsedKeys.includes(key))
        .slice(0, maxOrderlyLength)
        .reduce((acc, cur) => {
          acc.push(cur);
          return acc;
        }, []);
      setSelectedKeys(new Set(checkedAll));
    }
  }
  function batchClear() {
    set_clear_loading(true);
    batchOrderelyDeleteKeys(Array.from(selectedKeys));
  }
  const disabled = selectedKeys.size === 0;
  const isEmpty = allOrderlyKeys.length == 0;
  const noConnected = allOrderlyKeys.length == 0;
  return (
    <div className={`py-4 ${hidden ? 'hidden' : ''}`}>
      {orderlyKeyLoading ? (
        <div className="flex justify-center my-20">
          <ChartLoading />
        </div>
      ) : null}
      <div className={`${orderlyKeyLoading || noConnected ? 'hidden' : ''}`}>
        <div className="flex items-center justify-between px-6 mb-3 xsm:px-3">
          <div className="flex items-center gap-1">
            <span className="text-sm text-white gotham_bold">Orderly Keys</span>
            <span className="flex items-center justify-center text-xs text-white px-1.5 py-1.5 rounded-md gotham_bold bg-primaryText bg-opacity-20">
              {allOrderlyKeys.length}
            </span>
          </div>
          {allCheckdLength > 0 ? (
            <div className="flex items-center gap-1.5 text-sm text-primaryText">
              <Checkbox
                onClick={onCheckAll}
                checked={selectedKeys.size == allCheckdLength}
              />{' '}
              Remove-10
            </div>
          ) : null}
        </div>
        <div
          className="overflow-auto hide-scrollbar px-6 border-b border-gray1 xsm:px-3"
          style={{ maxHeight: '290px' }}
        >
          <div
            className={`bg-primaryText bg-opacity-20 rounded-xl p-4 ${
              isEmpty ? 'hidden' : ''
            }`}
          >
            {allOrderlyKeys.map((key) => {
              const isUsed = currentUsedKeys.includes(key);
              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-6 mb-3"
                >
                  <span className="flex  flex-col gap-2 flex-grow  bg-black bg-opacity-20 rounded-md text-xs text-greenColor p-2.5 break-all">
                    {isUsed ? (
                      <span className="flex items-center justify-center bg-portfolioQinColor text-xs gotham_bold italic whitespace-nowrap rounded w-12 text-black">
                        In use
                      </span>
                    ) : null}
                    {key}
                  </span>
                  <div className={`${isUsed ? 'invisible' : ''}`}>
                    <Checkbox
                      appearance="b"
                      checked={selectedKeys.has(key)}
                      onClick={() => {
                        onCheck(key);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {isEmpty ? (
            <div className="flex justify-center my-20 text-xs text-primaryText">
              No Data
            </div>
          ) : null}
        </div>
        <div className="px-6 xsm:px-3">
          <OprationButton
            minWidth="7rem"
            disabled={disabled}
            onClick={batchClear}
            background="linear-gradient(180deg, #00C6A2 0%, #008B72 100%"
            className={`flex flex-grow items-center justify-center text-white mt-6 rounded-xl h-12 text-base gotham_bold focus:outline-none ${
              disabled || clear_loading ? 'opacity-40' : ''
            }`}
          >
            <ButtonTextWrapper
              loading={clear_loading}
              Text={() => <div className="flex items-center gap-2">Clear</div>}
            />
          </OprationButton>
        </div>
      </div>
      {!orderlyKeyLoading && noConnected ? (
        <div className="flex flex-col items-center my-20">
          <ConnnectIcon />
          <div className="text-sm text-primaryText text-center mt-10">
            Please{' '}
            <a className="underline text-greenColor" href="/orderbook/spot">
              connect Orderly
            </a>{' '}
            first
          </div>
        </div>
      ) : null}
    </div>
  );
}
function Checkbox({
  checked,
  appearance,
  onClick,
  hidden,
}: {
  checked?: boolean;
  appearance?: '' | 'b';
  onClick: any;
  hidden?: boolean;
}) {
  if (hidden) return null;
  if (checked) {
    return (
      <div
        onClick={onClick}
        className="flex items-center justify-center cursor-pointer w-4 h-4 rounded flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
        }}
      >
        <CheckedIcon />
      </div>
    );
  }
  return (
    <span
      onClick={onClick}
      className={`inline-block w-4 h-4 rounded cursor-pointer bg-navHighLightBg flex-shrink-0 ${
        appearance == 'b' ? 'border border-keyCheckBorder' : ''
      }`}
    ></span>
  );
}

export default AccessKeyModal;
