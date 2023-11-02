import React, { useEffect, useState, useContext, useMemo, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { SliderCurColor } from 'src/components/icon/Info';
import { LiquidityProviderData } from '../../AddYourLiquidityPageV3';
import { isMobile } from '../../../../utils/device';
import { FEELIST } from '../../../../services/commonV3';
import { toInternationalCurrencySystem } from 'src/utils/numbers';
import { SelectedIcon } from '../../../../components/icon/swapV3';

export function SelectFeeTiers() {
  const [hoverFeeBox, setHoverFeeBox] = useState<boolean>(false);
  const {
    tokenX,
    tokenY,
    show_chart,
    currentSelectedPool,
    currentPools,
    switchSelectedFee,
    tokenPriceList,
  } = useContext(LiquidityProviderData);
  function displayTvl(tvl: any) {
    if (!tokenPriceList) {
      return '-';
    } else if (!tvl || +tvl == 0) {
      return '$0';
    } else if (+tvl < 1) {
      return '<$1';
    } else {
      return `$${toInternationalCurrencySystem(tvl.toString(), 0)}`;
    }
  }
  const mobileDevice = isMobile();
  return (
    <div
      className={`flex items-center justify-between mt-6 mb-7 xsm:px-4 xsm:mt-0 xsm:mb-3 xsm:w-full`}
    >
      <div className="text-white text-sm xsm:text-base xsm:font-gothamBold">
        <FormattedMessage
          id="select_fee_tiers"
          defaultMessage={'Select Fee Tiers'}
        ></FormattedMessage>
      </div>

      <div className="frcs gap-2">
        <span className="text-sm text-white xsm:text-base xsm:font-gothamBold">
          {!!currentSelectedPool?.fee
            ? `${currentSelectedPool.fee / 10000}%`
            : ''}
        </span>

        <div
          className="w-7 h-7 rounded-lg relative bg-v3SwapGray z-50 bg-opacity-10 hover:bg-opacity-30 text-primaryText hover:text-white frcc"
          onMouseLeave={() => {
            // if (mobileDevice) return;
            setHoverFeeBox(false);
          }}
          onMouseEnter={() => {
            if (mobileDevice) return;
            setHoverFeeBox(true);
          }}
          onClick={() => {
            if (mobileDevice) {
              setHoverFeeBox(!hoverFeeBox);
            }
          }}
        >
          <div>
            <SliderCurColor />
          </div>
          {hoverFeeBox && (
            <div className="absolute right-0 top-5 pt-4">
              <div
                className="rounded-xl  right-0 top-3 px-4 py-3  xs:px-2 md:px-2"
                style={{
                  border: '1.2px solid rgba(145, 162, 174, 0.2)',
                  width: mobileDevice ? '300px' : '418px',
                  background:
                    'linear-gradient(rgb(34, 47, 55) 0%, rgb(25, 34, 41) 100%)',
                }}
              >
                <div className="text-sm text-white font-gothamBold">
                  <FormattedMessage id="fee_Tiers" defaultMessage="Fee Tiers" />
                </div>
                <div
                  className={`lg:items-stretch lg:justify-between xsm:grid-cols-2 xsm:gap-1.5 mt-5 xsm:mt-2.5 lg:flex xsm:grid`}
                >
                  {FEELIST.map((feeItem, index) => {
                    const { fee, text } = feeItem;
                    const isNoPool = currentPools && !currentPools[fee];
                    return (
                      <div
                        onClick={() => {
                          switchSelectedFee(fee);
                        }}
                        key={fee + index}
                        className={`relative xsm:w-full flex flex-col px-2 py-1.5 xsm:py-1 rounded-lg w-1 flex-grow ${
                          tokenX && tokenY ? 'cursor-pointer' : ''
                        } ${index == 3 ? '' : 'mr-2.5 xsm:mr-1'} ${
                          isNoPool
                            ? 'border border-v3GreyColor'
                            : currentSelectedPool?.fee == fee
                            ? 'bg-feeBoxBgLiqudityColor'
                            : 'bg-v3GreyColor'
                        }`}
                      >
                        <span
                          className={`text-sm font-gothamBold ${
                            isNoPool || !(tokenX && tokenY && currentPools)
                              ? 'text-primaryText text-opacity-60'
                              : 'text-white'
                          }`}
                        >
                          {fee / 10000}%
                        </span>
                        {tokenX && tokenY && currentPools ? (
                          <span
                            className={`transform scale-90 origin-left text-xs text-primaryText whitespace-nowrap ${
                              isNoPool ? 'text-opacity-60' : ''
                            }`}
                          >
                            {isNoPool ? (
                              'No Pool'
                            ) : Object.keys(tokenPriceList).length > 0 ? (
                              <span>{displayTvl(currentPools[fee].tvl)}</span>
                            ) : (
                              'Loading...'
                            )}
                          </span>
                        ) : null}
                        {currentSelectedPool?.fee == fee ? (
                          <SelectedIcon className="absolute top-0 right-0" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
