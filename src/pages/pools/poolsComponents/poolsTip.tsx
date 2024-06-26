import React from 'react';

export const PoolsTip = ({ activeTab }) => {
  const tip = (text, link) => (
    <div className={'text-primaryText mb-6 gotham_font text-14px'}>
      {text}
      <a href={link} className={'underline ml-2 cursor-pointer'}>
        Learn more
      </a>
    </div>
  );

  let node = null;
  switch (activeTab) {
    case 'v1':
      node = tip(
        'Classic pools are based on the Uniswap v2 algorithm.',
        'https://guide.ref.finance/products/guides/liquidity-management/classic-pools'
      );
      break;
    case 'v2':
      node = tip(
        'Discretized Concentrated Liquidity (DCL) pools.',
        'https://guide.ref.finance/products/guides/liquidity-management/ref-v2-pools'
      );
      break;
    case 'stable':
      node = tip(
        "Stable pools, which can contain two or more tokens, use Curve's StableSwap algorithm.",
        'https://guide.ref.finance/products/guides/liquidity-management/stable-and-rated-pools'
      );
      break;
  }

  return node;
};
