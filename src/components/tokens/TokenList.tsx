import React from 'react';
import Token from './Token';

export default function TokenList({ tokenIds }: { tokenIds: string[] }) {
  const tokenElements = tokenIds.map((id) => (
    <li key={id}>
      <Token id={id} />
    </li>
  ));

  return <tbody>{tokenElements}</tbody>;
}
