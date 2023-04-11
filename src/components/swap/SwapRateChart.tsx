import React, { useEffect, useState } from 'react';
import { TokenMetadata } from '~services/ft-contract';
import { TokenPairRate, getTokenPairRate } from '~services/indexer';

export interface SwapRateChartProps {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
}

export default function SwapRateChart(props: SwapRateChartProps) {
  const { tokenIn, tokenOut } = props;

  const [priceList, setPriceList] = useState<TokenPairRate>();

  const [displayDimension, setDisplayDimension] = useState<
    '24H' | '7D' | '1M' | '1Y' | 'All'
  >('24H');

  const getDimension = (raw: '24H' | '7D' | '1M' | '1Y' | 'All') => {
    if (raw === '24H') return 'D';
    if (raw === '7D') return 'W';
    if (raw === '1M') return 'M';
    if (raw === '1Y') return 'Y';
    if (raw === 'All') return 'Y';
  };

  useEffect(() => {
    if (!tokenIn || !tokenOut) return;

    getTokenPairRate({
      token: tokenIn,
      base_token: tokenOut,
      dimension: getDimension(displayDimension),
    });
  }, [tokenIn?.id, tokenOut?.id, displayDimension]);
}
