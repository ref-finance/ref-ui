import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { UserLiquidityDetail } from './type';
import { BigNumber } from 'bignumber.js';
import { toPrecision, formatWithCommas } from '../../../../utils/numbers';
import { isClientMobie } from '../../../../utils/device';
import {
  UserLiquidityInfo,
  TOKEN_LIST_FOR_RATE,
  displayNumberToAppropriateDecimals,
  get_pool_name,
  openUrl,
} from '~services/commonV3';
import { FormattedMessage } from 'react-intl';
import getConfig from '../../../../services/config';
import { FarmBoost, Seed } from '../../../../services/farm';
import { RemovePoolV3 } from '~components/pool/RemovePoolV3';
const { REF_UNI_V3_SWAP_CONTRACT_ID, DCL_POOL_BLACK_LIST } = getConfig();

export function SelectLiquidityBox(props: any) {
  const {
    isOpen,
    onRequestClose,
    poolDetail,
    operation,
    tokenPriceList,
    user_liquidities,
    matched_seeds,
  } = props;

  const [hoverHashId, setHoverHashId] = useState('');
  const [showRemoveBox, setShowRemoveBox] = useState<boolean>(false);
  const [showAddBox, setShowAddBox] = useState<boolean>(false);
  const history = useHistory();
  const { token_x_metadata, token_y_metadata } = poolDetail;
  function displayLiqudityTvl(liquidityDetail: UserLiquidityDetail) {
    const total = +liquidityDetail.total_liqudities_price;
    if (total == 0) {
      return '$0';
    } else if (total < 0.01) {
      return '<$0.01';
    } else {
      return '$' + formatWithCommas(toPrecision(total.toString(), 2));
    }
  }
  function displayLiqudityFee(liquidityDetail: UserLiquidityDetail) {
    const total = +liquidityDetail.total_fees_price;
    if (total == 0) {
      return '$0';
    } else if (total < 0.01) {
      return '<$0.01';
    } else {
      return '$' + formatWithCommas(toPrecision(total.toString(), 2));
    }
  }
  function displayRange(liquidityDetail: UserLiquidityDetail) {
    const { l_price, r_price } = liquidityDetail;
    let display_l;
    let display_r;
    if (
      TOKEN_LIST_FOR_RATE.indexOf(token_x_metadata?.symbol) > -1 &&
      +r_price !== 0 &&
      +l_price !== 0
    ) {
      display_l = new BigNumber(1).dividedBy(r_price).toFixed();
      display_r = new BigNumber(1).dividedBy(l_price).toFixed();
    } else {
      display_l = l_price;
      display_r = r_price;
    }
    display_l = displayNumberToAppropriateDecimals(display_l);
    display_r = displayNumberToAppropriateDecimals(display_r);
    return `${display_l} - ${display_r}`;
  }
  function hoverLine(hashId: string) {
    setHoverHashId(hashId);
  }
  function getCurrentLiqudity(hashId: string) {
    const c_l = user_liquidities.find((liquidity: UserLiquidityInfo) => {
      if (liquidity.lpt_id.split('#')[1] == hashId) return true;
    });
    return c_l;
  }
  function goAddLiqudityPage() {
    const pool_id = poolDetail.pool_id;
    const [token_x, token_y, fee] = pool_id.split('|');
    let url_hash = pool_id;
    if (TOKEN_LIST_FOR_RATE.indexOf(token_x_metadata?.symbol) > -1) {
      url_hash = `${token_y}|${token_x}|${fee}`;
    }
    history.push(`/addLiquidityV2#${url_hash}`);
  }
  function displayFarmStatus(liquidity: UserLiquidityInfo) {
    const is_in_farming =
      liquidity.part_farm_ratio && +liquidity.part_farm_ratio > 0;
    if (is_in_farming) {
      return (
        <label className="text-sm text-white">
          <FormattedMessage id="farming" />
        </label>
      );
    } else {
      return (
        <label className="text-sm text-primaryText">
          <FormattedMessage id="unstaked_2" />
        </label>
      );
    }
  }
  function go_farm(liquidity: UserLiquidityInfo) {
    const { mft_id } = liquidity;
    const [fixRange, pool_id, left_point, right_point] = mft_id.split('&');
    const link_params = `${get_pool_name(
      pool_id
    )}[${left_point}-${right_point}]`;
    const seed_id = REF_UNI_V3_SWAP_CONTRACT_ID + '@' + mft_id.slice(1);
    const temp_seeds = (matched_seeds || []).filter((seed: Seed) => {
      return seed_id == seed.seed_id;
    });
    let actives: FarmBoost[] = [];
    temp_seeds.forEach((seed: Seed) => {
      const { farmList } = seed;
      const temp = farmList.filter((farm: FarmBoost) => {
        return farm.status != 'Ended';
      });
      actives = actives.concat(temp);
    });
    let url;
    if (actives.length > 0) {
      url = `/v2farms/${link_params}-r`;
    } else {
      url = `/v2farms/${link_params}-e`;
    }
    openUrl(url);
  }
  function is_in_farming(liquidity: UserLiquidityInfo) {
    const is_in_farming =
      liquidity.part_farm_ratio && +liquidity.part_farm_ratio > 0;
    return is_in_farming;
  }
  const isMobile = isClientMobie();
  const has_no_related_seed =
    matched_seeds?.length == 0 &&
    user_liquidities?.every(
      (liquidity: UserLiquidityInfo) => +(liquidity.part_farm_ratio || 0) == 0
    );
  return operation == 'remove' && isOpen ? (
    <RemovePoolV3
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      listLiquidities={user_liquidities}
      tokenMetadata_x_y={[token_x_metadata, token_y_metadata]}
      poolDetail={poolDetail}
      tokenPriceList={tokenPriceList}
      userLiquidity={getCurrentLiqudity(hoverHashId)}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        },
        content: {
          outline: 'none',
          transform: 'translate(-50%, -50%)',
        },
      }}
    />
  ) : null;
}
