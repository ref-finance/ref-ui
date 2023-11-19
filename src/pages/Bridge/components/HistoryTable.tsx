import React from 'react';

import { type BridgeTransaction } from '../services';

type Props = {
  data?: BridgeTransaction[]

}

const columns = [
  { label: 'Time', prop: 'time', width: '15%' },
  { label: 'Direction', prop: 'direction', width: '15%' },
  { label: 'Amount', prop: 'amount', width: '15%' },
  { label: 'Sending address(Tx)', prop: 'sendingAddr', width: '20%' },
  { label: 'Receiving address(Tx)', prop: 'receivingAddr', width: '20%' },
  { label: 'Status', prop: 'status', width: '15%' },
];

function HistoryTable({ data }: Props) {

  return (
    <div className="bg-dark-800 rounded">
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
          {data?.map((item, index) => (
            <tr key={index}>
              <td>{item.createdAt}</td>
              <td>
                {item.from} {'=>'} {item.to}
              </td>
              <td>{item.amount}</td>
              <td>{item.sendingAddress}</td>
              <td>{item.receivingAddress}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HistoryTable;
