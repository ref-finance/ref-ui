import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import { useHistory } from 'react-router';
import {
  calculateFeePercent,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from '../../utils/numbers';
import { TokenMetadata, REF_META_DATA } from '../../services/ft-contract';
import { scientificNotationToString } from '../../utils/numbers';
import { useMobile, useClientMobile } from '../../utils/device';
import getConfig from '../../services/config';
import {
  GreenLButton,
  BorderButton,
  GradientButton,
  ButtonTextWrapper,
  BlacklightConnectToNearBtn,
} from '~components/button/Button';
import { FormattedMessage, useIntl } from 'react-intl';

export default function YourLiquidityPageV3() {
  const history = useHistory();
  function goAddLiquidityPage() {
    history.push('/addYoursV3');
  }
  return (
    <div className="flex items flex-col lg:w-2/3 xl:w-3/5 md:w-5/6 xs:w-11/12 m-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-white text-xl mr-5">Liquidity</span>
          <div className="flex items-center text-xs text-primaryText border border-v3borderColor p-0.5 rounded-lg">
            <span className="flex items-center justify-center h-6 py-0.5 px-1.5 rounded-md cursor-pointer">
              All
            </span>
            <span
              className="flex items-center justify-center h-6 py-0.5 px-1.5 rounded-md cursor-pointer"
              style={{
                background: 'rgba(48, 68, 82, 0.5)',
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(50px)',
              }}
            >
              New
            </span>
            <span className="flex items-center justify-center h-6 py-0.5 px-1.5 rounded-md cursor-pointer">
              Old
            </span>
          </div>
        </div>
        <div className="">
          <GradientButton
            color="#fff"
            className={`px-4 h-8 text-center text-base text-white focus:outline-none`}
            onClick={goAddLiquidityPage}
          >
            <FormattedMessage
              id="add_liquidity"
              defaultMessage="Add Liquidity"
            />
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
