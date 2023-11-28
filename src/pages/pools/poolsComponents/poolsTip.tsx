import React from 'react';

export const PoolsTip = ({ activeTab }) => {
  const handleClick = (link) => {};

  const tip = (text, link) => (
    <div className={'text-primaryText mb-6'}>
      {text}
      <span className={'underline ml-2'} onClick={() => handleClick(link)}>
        Learn more
      </span>
    </div>
  );

  let node = null;
  switch (activeTab) {
    case 'v1':
      node = tip('Classic pools are based on the Uniswap v2 algorithm.', '');
      break;
    case 'v2':
      node = tip('Discretized Concentrated Liquidity (DCL) pools.', '');
      break;
    case 'stable':
      node = tip(
        "Stable pools, which can contain two or more tokens, use Curve's StableSwap algorithm.",
        ''
      );
      break;
  }

  return node;
};
