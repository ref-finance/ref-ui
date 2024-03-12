import React, { useCallback, useEffect, useState } from 'react';
import { TokenMetadata } from '../services/ft-contract';
import { getTokenPairRate } from '../services/indexer';
import useInterval from 'react-useinterval';
import moment from 'moment';

interface Diff {
  percent: string;
  direction: 'down' | 'up' | 'unChange';
  curPrice: number;
  h24Hight: number;
  h24Low: number;
  lastUpdate: string;
}

export const useTokenRate24h = ({
  token,
  base_token,
}: {
  token: TokenMetadata;
  base_token: TokenMetadata;
}) => {
  const [diff, setDiff] = useState<Diff>();

  const func = () => {
    return getTokenPairRate({
      token,
      base_token,
      dimension: 'D',
    }).then((res) => {
      const priceList = res.price_list.sort(
        (a, b) => moment(b.date_time).unix() - moment(a.date_time).unix()
      );

      const curPrice = priceList?.[0]?.price;

      const last24Price = priceList?.[priceList.length - 1]?.price;
      if (typeof curPrice === 'number' && typeof last24Price === 'number') {
        const diff = (curPrice - last24Price) / (last24Price || 1);
        const displayDiff = (Math.abs(diff) * 100).toFixed(2) + '%';
        setDiff({
          percent: displayDiff,
          direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'unChange',
          curPrice: curPrice,
          h24Hight: Math.max(...priceList.map((item) => item.price)),
          h24Low: Math.min(...priceList.map((item) => item.price)),
          lastUpdate: moment(priceList?.[0]?.date_time).format(
            'YYYY/MM/DD HH:mm'
          ),
        });
      } else {
        setDiff(undefined);
      }
    });
  };

  useEffect(() => {
    if (!token || !base_token) return;
    func();
  }, [base_token?.id, token?.id]);

  useInterval(func, 1000 * 60 * 10);

  return diff;
};
