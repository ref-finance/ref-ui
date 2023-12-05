import React, { useEffect, useMemo } from 'react';
import SvgIcon from './SvgIcon';
import {
  formatAmountRaw,
  formatSortAddress,
  formatTimestamp,
  formatTxExplorerUrl,
} from '../utils/format';
import Button from './Button';
import useRainbowBridge from '../hooks/useRainbowBridge';
import useBridgeToken from '../hooks/useBridgeToken';

type Props = {
  data?: BridgeModel.BridgeTransaction[];
};

const columns = [
  { label: 'Time', prop: 'time', width: '15%' },
  { label: 'Direction', prop: 'direction', width: '15%' },
  { label: 'Amount', prop: 'amount', width: '15%' },
  { label: 'Sending address(Tx)', prop: 'sendingAddr', width: '20%' },
  { label: 'Receiving address(Tx)', prop: 'receivingAddr', width: '20%' },
  { label: 'Status', prop: 'status', width: '15%' },
];

function TableItem({ item }: { item: BridgeModel.BridgeTransaction }) {
  const { getDecodedTransaction, callAction, actionLoading } =
    useRainbowBridge();
  const transaction = useMemo(() => getDecodedTransaction(item), [item]);

  const { getTokenBySymbol } = useBridgeToken();

  const token = useMemo(
    () => getTokenBySymbol(transaction.symbol),
    [transaction.symbol]
  );

  useEffect(() => console.log('transaction', transaction), [transaction]);

  function handleAction() {
    callAction(transaction.id);
  }
  return (
    <tr>
      <td>{formatTimestamp(transaction.startTime)}</td>
      <td>
        <div className="flex items-center gap-2">
          <SvgIcon
            name={
              transaction.sourceNetwork === 'ethereum'
                ? 'IconChainEthereum'
                : 'IconChainNear'
            }
            className="text-2xl"
          />
          <SvgIcon name="IconDirection" />
          <SvgIcon
            name={
              transaction.sourceNetwork === 'near'
                ? 'IconChainEthereum'
                : 'IconChainNear'
            }
            className="text-2xl"
          />
        </div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <img className="w-5 h-5 rounded-full" src={token?.icon} />
          {formatAmountRaw(transaction.amount, transaction.decimals)}
          <span className="text-gray-400">{token?.symbol}</span>
        </div>
      </td>
      <td>
        <div>{formatSortAddress(transaction.sender)}</div>
        {formatSortAddress(
          transaction.lockHashes?.[0] || transaction.unlockHashes?.[0]
        )}
      </td>
      <td>
        <div>{formatSortAddress(transaction.recipient)}</div>
        <div>
          {formatSortAddress(transaction.burnHashes?.[0]) ||
            transaction.mintHashs?.[0]}
        </div>
      </td>
      <td>
        {transaction.status === 'action-needed' && transaction.callToAction ? (
          <Button
            loading={actionLoading}
            type="primary"
            size="small"
            onClick={handleAction}
          >
            {transaction.callToAction}
          </Button>
        ) : (
          <div className="flex items-center">
            {transaction.status === 'completed' && (
              <SvgIcon
                name="IconSuccess"
                className="text-primary text-sm mr-2"
              />
            )}
            {transaction.status}
          </div>
        )}
      </td>
    </tr>
  );
}

function HistoryTable({ data }: Props) {
  return (
    <div className="bg-dark-800 rounded overflow-x-auto">
      <table className="bridge-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.prop} style={{ width: column.width }}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.length ? (
            data?.map((item, index) => (
              <TableItem key={index} item={item}></TableItem>
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                <div className="flex flex-col items-center justify-center p-10 gap-3 text-gray-400">
                  <SvgIcon name="IconEmpty" className="text-4xl" />
                  No result
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default HistoryTable;
