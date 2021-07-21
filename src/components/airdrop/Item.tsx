import React, { PropsWithChildren } from 'react';
import { TokenMetadata } from '~services/ft-contract';

export function Item(props: {
  token: TokenMetadata;
  className?: string;
  amount?: string | number;
  label?: string;
}) {
  return (
    <div>
      <label>{props.label}</label>
      <div
        className={`bg-gray-200 rounded px-4 py-2 my-4 flex items-center xs:px-2 md:px-2 ${props.className}`}
      >
        <img
          key={props.token.id}
          className="h-8 w-8 rounded-full border bg-white"
          src={props.token.icon}
        />
        <span className="ml-2">{props.token.symbol}</span>
        <span className="order-last ml-auto font-bold">{props.amount}</span>
      </div>
    </div>
  );
}
