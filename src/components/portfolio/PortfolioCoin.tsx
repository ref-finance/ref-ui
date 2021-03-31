import React from 'react';
import DefaultSupportedCoinsMetadataDev from '~consts/DefaultSupportCoinsMetadataDev';

interface PortfolioCoinProps {
  // price: number;
  // delta: number;
  balance: number;
  coinName: string;
}

export function PortfolioCoin({ coinName, balance }: PortfolioCoinProps) {
  const tokenMap = DefaultSupportedCoinsMetadataDev;
  const coin = tokenMap.[coinName] ?? {};
  const { symbol, icon } = coin;

  return (
    <tr>
      <td>
        <img className="h-6 w-6 mr-2" src={icon} />
      </td>
      <td>{symbol}</td>
      <td className="h-1">{balance}</td>
    </tr>
  );
}
