import React, { useEffect, useMemo } from 'react';
import SvgIcon from './SvgIcon';
import {
  formatAmount,
  formatSortAddress,
  formatTimestamp,
  formatTxExplorerUrl,
} from '../utils/format';
import Button from './Button';
import useBridge from '../hooks/useBridge';
import { getTokenMeta } from '../utils/token';

const columns = [
  { label: 'Time', prop: 'time', width: '15%' },
  { label: 'Direction', prop: 'direction', width: '15%' },
  { label: 'Amount', prop: 'amount', width: '15%' },
  { label: 'Sending address(Tx)', prop: 'sendingAddr', width: '20%' },
  { label: 'Receiving address(Tx)', prop: 'receivingAddr', width: '20%' },
  { label: 'Status', prop: 'status', width: '15%' },
];

function TableItem({
  item: transaction,
  onRefresh,
}: {
  item: BridgeModel.BridgeTransaction;
  onRefresh?: () => void;
}) {
  const { callAction, actionLoading } = useBridge();

  const token = useMemo(
    () => getTokenMeta(transaction.symbol),
    [transaction.symbol]
  );

  async function handleAction() {
    await callAction(transaction.id);
    onRefresh();
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
          {formatAmount(transaction.amount, transaction.decimals)}
          <span className="text-gray-400">{token?.symbol}</span>
        </div>
      </td>
      <td>
        <div>{formatSortAddress(transaction.sender)}</div>
        <a
          href={formatTxExplorerUrl(
            transaction.sourceNetwork,
            transaction.burnHashes?.[0] ||
              transaction.lockHashes?.[0] ||
              transaction.unlockHashes?.[0]
          )}
          target="_blank"
          rel="noreferrer"
          style={{ color: '#99B0FF' }}
          className="hover:underline"
        >
          {formatSortAddress(
            transaction.burnHashes?.[0] ||
              transaction.lockHashes?.[0] ||
              transaction.unlockHashes?.[0]
          )}
        </a>
      </td>
      <td>
        <div>{formatSortAddress(transaction.recipient)}</div>
        <a
          href={formatTxExplorerUrl(
            transaction.sourceNetwork === 'near' ? 'ethereum' : 'near',
            transaction.mintHashes?.[0]
          )}
          target="_blank"
          rel="noreferrer"
          style={{ color: '#99B0FF' }}
          className="hover:underline"
        >
          {formatSortAddress(transaction.mintHashes?.[0])}
        </a>
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

type Props = {
  data?: BridgeModel.BridgeTransaction[];
  loading?: boolean;
  onRefresh?: () => void;
};
function HistoryTable({ data, loading, onRefresh }: Props) {
  return (
    <div
      className="relative overflow-auto"
      style={{
        minHeight: 'calc(100vh - 500px)',
        maxHeight: 'calc(100vh - 420px)',
      }}
    >
      {loading && (
        <div className="absolute left-0 top-0 right-0 bottom-0  z-1 flex items-center justify-center">
          <SvgIcon name="IconLoading" className="text-6xl" />
        </div>
      )}
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
          {data?.length
            ? data?.map((item, index) => (
                <TableItem
                  key={index}
                  item={item}
                  onRefresh={onRefresh}
                ></TableItem>
              ))
            : !loading && (
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
