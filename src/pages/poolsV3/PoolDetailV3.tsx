import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Card } from '~components/card/Card';
import { Link } from 'react-router-dom';
import {
  calculateFairShare,
  calculateFeePercent,
  percent,
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
  toRoundedReadableNumber,
} from '../../utils/numbers';
import { ftGetTokenMetadata, TokenMetadata } from '~services/ft-contract';
import { isMobile } from '~utils/device';
import { toRealSymbol } from '~utils/token';
import { useHistory } from 'react-router';
import { BigNumber } from 'bignumber.js';
import { FormattedMessage, useIntl } from 'react-intl';
import { PoolTabV3 } from '../../components/pool/PoolTabV3';

export function PoolDetailV3() {
  return (
    <>
      <PoolTabV3 />
      <div className="md:w-11/12 xs:w-11/12 w-4/6 lg:w-5/6 xl:w-1050px m-auto">
        {/* <BreadCrumb
          routes={[
            { id: 'top_pools', msg: 'Top Pools', pathname: '/pools' },
            {
              id: 'more_pools',
              msg: 'More Pools',
              pathname: `/more_pools/${tokens.map((tk) => tk.id)}`,
              state: {
                fromMorePools,
                tokens,
                morePoolIds,
              },
            },
            {
              id: 'detail',
              msg: 'Detail',
              pathname: `/pool`,
            },
          ]}
        /> */}
      </div>
    </>
  );
}
