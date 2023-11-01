import React, { useEffect, useState } from 'react';
import {
  getEffectiveFarmList,
  get_pool_name,
  openUrl,
} from 'src/services/commonV3';
import { FarmBoost, Seed } from '../../../../services/farm';
import {
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from '../../../../utils/numbers';
import { BigNumber } from 'bignumber.js';
import { Fire, FarmBoardInDetailDCLPool } from '../../../../components/icon/V3';
import { SolidButton } from 'src/components/button/Button';
import { FormattedMessage, useIntl } from 'react-intl';

export function RelatedFarmsBox(props: any) {
  const { poolDetail, tokenPriceList, sole_seed } = props;
  const [related_seed, set_related_seed] = useState<Seed>();
  const [farm_loading, set_farm_loading] = useState<boolean>(true);
  useEffect(() => {
    if (poolDetail && Object.keys(tokenPriceList).length > 0) {
      get_farms_data();
    }
  }, [poolDetail, tokenPriceList, sole_seed]);
  async function get_farms_data() {
    if (sole_seed) {
      set_related_seed(sole_seed);
    }
    set_farm_loading(false);
  }
  function totalTvlPerWeekDisplay() {
    const farms = related_seed.farmList;
    const rewardTokenIconMap = {};
    let totalPrice = 0;
    const effectiveFarms = getEffectiveFarmList(farms);
    effectiveFarms.forEach((farm: FarmBoost) => {
      const { id, decimals, icon } = farm.token_meta_data;
      const { daily_reward } = farm.terms;
      rewardTokenIconMap[id] = icon;
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != 'N/A') {
        const tokenAmount = toReadableNumber(decimals, daily_reward);
        totalPrice += +new BigNumber(tokenAmount)
          .multipliedBy(tokenPrice)
          .toFixed();
      }
    });
    totalPrice = +new BigNumber(totalPrice).multipliedBy(7).toFixed();
    const totalPriceDisplay =
      totalPrice == 0
        ? '-'
        : '$' + toInternationalCurrencySystem(totalPrice.toString(), 2);
    return totalPriceDisplay;
  }
  function isPending(seed: Seed) {
    let pending: boolean = true;
    const farms = seed.farmList;
    for (let i = 0; i < farms.length; i++) {
      if (farms[i].status != 'Created' && farms[i].status != 'Pending') {
        pending = false;
        break;
      }
    }
    return pending;
  }
  function getTotalAprForSeed() {
    const farms = related_seed.farmList;
    let apr = 0;
    const allPendingFarms = isPending(related_seed);
    farms.forEach(function (item: FarmBoost) {
      const pendingFarm = item.status == 'Created' || item.status == 'Pending';
      if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
        apr = +new BigNumber(item.apr).plus(apr).toFixed();
      }
    });
    if (apr == 0) {
      return '-';
    } else {
      apr = +new BigNumber(apr).multipliedBy(100).toFixed();
      return toPrecision(apr.toString(), 2) + '%';
    }
  }
  function getAllRewardsSymbols() {
    const tempMap = {};
    related_seed.farmList.forEach((farm: FarmBoost) => {
      const { token_meta_data } = farm;
      const { icon, id } = token_meta_data;
      tempMap[id] = icon;
    });
    const arr = Object.entries(tempMap);
    return arr.slice(0, 5);
  }
  function go_farm() {
    const { seed_id } = related_seed;
    const [contractId, temp_pool_id] = seed_id.split('@');
    const [fixRange, pool_id, left_point, right_point] =
      temp_pool_id.split('&');
    const link_params = `${get_pool_name(
      pool_id
    )}[${left_point}-${right_point}]`;
    openUrl(`/v2farms/${link_params}-r`);
  }
  if (farm_loading) return null;
  if (!related_seed) return null;
  return (
    <div className="relative py-5 px-3 z-0 mt-3">
      <FarmBoardInDetailDCLPool
        style={{
          position: 'absolute',
          // transform: isClientMobie() ? 'scale(1,1.05)' : 'scale(1.05)',
          zIndex: -1,
          left: 0,
          top: 0,
        }}
      ></FarmBoardInDetailDCLPool>
      <div className="flex items-center justify-between">
        <span className="text-base text-white gotham_bold">Farm APR</span>
        <div className="flex items-center bg-dclButtonBgColor rounded-xl pl-1 pr-2 py-px">
          {getAllRewardsSymbols().map(([id, icon]: [string, string], index) => {
            return (
              <img
                key={id}
                src={icon}
                className={`h-4 w-4 rounded-full border border-gradientFromHover ${
                  index != 0 ? '-ml-1.5' : ''
                }`}
              ></img>
            );
          })}
          {related_seed?.farmList.length > 5 ? (
            <div
              className={`flex h-4 w-4 -ml-1.5 flex-shrink-0  items-center justify-center text-gradientFrom rounded-full bg-darkBg border border-gradientFromHover`}
            >
              <span className={`relative bottom-1`}>...</span>
            </div>
          ) : null}

          <span className="flex items-center text-sm text-v3SwapGray ml-1.5">
            {totalTvlPerWeekDisplay()}/week
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center">
          <span className="valueStyleYellow text-xl gotham_bold mr-1">
            {getTotalAprForSeed()}
          </span>
          <Fire></Fire>
        </div>
        <SolidButton
          className="py-1.5 pb-1.5 px-2 flex rounded-lg items-center justify-center whitespace-nowrap"
          onClick={go_farm}
        >
          <FormattedMessage id="farm_now" defaultMessage={'Farm Now!'} />
        </SolidButton>
      </div>
    </div>
  );
}
