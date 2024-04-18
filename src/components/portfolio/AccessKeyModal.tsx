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
const maxLength = 10;
const maxOrderlyLength = 5;
function AccessKeyModal(props: any) {
  const { isOpen, onRequestClose } = props;
  const cardWidth = isMobile() ? '95vw' : '32vw';
  const cardHeight = isMobile() ? '90vh' : '100vh';
  // const [selfIsOpen, setSelfIsOpen] = useState(isOpen);
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
              className={`text-lg gotham_bold pr-4 border-r border-v3SwapGray border-opacity-20 cursor-pointer ${
                tab == 'accessKey' ? 'text-white' : 'text-limitOrderInputColor'
              }`}
            >
              Access
            </span>
            <div
              onClick={() => {
                setTab('orderlyKey');
              }}
              className={`flex items-center gap-1.5 pl-4 cursor-pointer ${
                tab == 'orderlyKey' ? 'text-white' : 'text-limitOrderInputColor'
              }`}
            >
              <OrderlyIcon isActive={true} />
              <span className="text-lg gotham_bold">Orderly</span>
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
      return toPrecision(toReadableNumber(24, b), maxLength);
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
  const disabled = selectedKeys.size === 0;
  const isEmpty = functionCallKeys.length == 0;
  return (
    <div className={`py-4 ${hidden ? 'hidden' : ''}`}>
      <div className="flex items-center justify-between px-6 mb-3 xsm:px-3">
        <div className="flex items-center gap-1">
          <span className="text-sm text-white gotham_bold">
            Authorized Apps
          </span>
          <span className="flex items-center justify-center text-xs text-white px-1.5 py-1.5 rounded-md gotham_bold bg-primaryText bg-opacity-20">
            {functionCallKeys.length}
          </span>
        </div>
        {allCheckdLength > 0 ? (
          <div className="flex items-center gap-1.5 text-sm text-primaryText">
            <Checkbox
              onClick={onCheckAll}
              checked={selectedKeys.size == allCheckdLength}
            />{' '}
            ALL
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <p className="text-base gotham_bold text-white">
                    {
                      (item?.access_key?.permission as Ipermission)
                        ?.FunctionCall?.receiver_id
                    }
                  </p>
                  {isUsed ? (
                    <span className="text-xs text-black px-1.5 rounded-2xl bg-primary whitespace-nowrap">
                      Currently in use
                    </span>
                  ) : null}
                </div>
                {!isUsed && (
                  <Checkbox
                    appearance="b"
                    checked={selectedKeys.has(item.public_key)}
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
                  NEAR
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
  const isEmpty = displayAllOrderlyKeys.length == 0;
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
              {displayAllOrderlyKeys.length}
            </span>
          </div>
          {allCheckdLength > 0 ? (
            <div className="flex items-center gap-1.5 text-sm text-primaryText">
              <Checkbox
                onClick={onCheckAll}
                checked={selectedKeys.size == allCheckdLength}
              />{' '}
              ALL
            </div>
          ) : null}
        </div>
        <div
          className="overflow-auto hide-scrollbar px-6 border-b border-gray1 xsm:px-3"
          style={{ maxHeight: '300px' }}
        >
          <div
            className={`bg-primaryText bg-opacity-20 rounded-xl p-4 ${
              isEmpty ? 'hidden' : ''
            }`}
          >
            {displayAllOrderlyKeys.map((key) => {
              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-6 mb-3"
                >
                  <span className="flex items-center flex-grow  bg-black bg-opacity-20 rounded-md text-xs text-greenColor p-2.5 break-all">
                    {key}
                  </span>
                  <Checkbox
                    appearance="b"
                    checked={selectedKeys.has(key)}
                    onClick={() => {
                      onCheck(key);
                    }}
                  />
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
}: {
  checked?: boolean;
  appearance?: '' | 'b';
  onClick: any;
}) {
  if (checked) {
    return (
      <div
        onClick={onClick}
        className="flex items-center justify-center cursor-pointer w-4 h-4 rounded"
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
      className={`inline-block w-4 h-4 rounded cursor-pointer bg-navHighLightBg ${
        appearance == 'b' ? 'border border-keyCheckBorder' : ''
      }`}
    ></span>
  );
}

export default AccessKeyModal;
