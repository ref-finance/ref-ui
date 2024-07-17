import React, { useEffect, useMemo } from 'react';
import SvgIcon from './SvgIcon';
import {
  formatAmount,
  formatFileUrl,
  formatSortAddress,
  formatTimestamp,
  formatTxExplorerUrl,
} from '../utils/format';
import Button from './Button';
import useBridge from '../hooks/useBridge';
import { getTokenByAddress, getTokenMeta } from '../utils/token';
import CustomTooltip from 'src/components/customTooltip/customTooltip';

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
  item: BridgeModel.BridgeHistory;
  onRefresh?: () => void;
}) {
  const tokenMeta = useMemo(
    () => getTokenByAddress(transaction.token, transaction.from_chain),
    [transaction.token, transaction.from_chain]
  );

  // const { callAction, actionLoading } = useBridge();
  // async function handleAction() {
  //   await callAction(transaction.id);
  //   onRefresh();
  // }
  return (
    <tr>
      <td>{formatTimestamp(transaction.created_time)}</td>
      <td>
        <div className="flex items-center gap-2">
          <img
            src={formatFileUrl(
              `/chain/${transaction.from_chain.toLowerCase()}.svg`
            )}
            className="w-7 h-7"
          />
          <SvgIcon name="IconDirection" />
          <img
            src={formatFileUrl(
              `/chain/${transaction.to_chain.toLowerCase()}.svg`
            )}
            className="w-7 h-7"
          />
        </div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <span
            data-tooltip-id="token-symbol"
            data-place="top"
            data-class="reactTip"
            data-tooltip-html={tokenMeta?.symbol}
          >
            <img className="w-5 h-5 rounded-full" src={tokenMeta?.icon} />

            <CustomTooltip id="token-symbol" />
          </span>
          {formatAmount(transaction.volume, tokenMeta.decimals)}
        </div>
      </td>
      <td>
        <div>{formatSortAddress(transaction.from)}</div>
        <a
          href={formatTxExplorerUrl(
            transaction.from_chain,
            transaction.from_chain_hash
          )}
          target="_blank"
          rel="noreferrer"
          style={{ color: '#99B0FF' }}
          className="hover:underline"
        >
          {formatSortAddress(transaction.from_chain_hash)}
        </a>
      </td>
      <td>
        <div>{formatSortAddress(transaction.to)}</div>
        <a
          href={formatTxExplorerUrl(
            transaction.to_chain,
            transaction.to_chain_hash
          )}
          target="_blank"
          rel="noreferrer"
          style={{ color: '#99B0FF' }}
          className="hover:underline"
        >
          {formatSortAddress(transaction.to_chain_hash)}
        </a>
      </td>
      <td>
        <div className="flex items-center">
          {transaction.status === 'DELIVERED' ? (
            <>
              <SvgIcon
                name="IconSuccess"
                className="text-primary text-sm mr-2"
              />
              Completed
            </>
          ) : (
            <>Pending</>
          )}
        </div>
        {/* {transaction.status === 'action-needed' && transaction.callToAction ? (
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
        )} */}
      </td>
    </tr>
  );
}

type Props = {
  data?: BridgeModel.BridgeHistory[];
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
