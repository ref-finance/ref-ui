import React, { useEffect, useRef, useState, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import FarmsHome from '~components/farm/FarmsHome';
import FarmsDetail from '~components/farm/FarmsDetail';
import { useHistory, useLocation } from 'react-router-dom';
import Loading, { BeatLoading } from '~components/layout/Loading';
import { Seed, BoostConfig, UserSeedInfo } from '~services/farm';
export default function FarmsBoosterPage(props: any) {
  const [detailData, setDetailData] = useState(null);
  const [tokenPriceList, setTokenPriceList] = useState(null);
  const [loveSeed, serLoveSeed] = useState(null);
  const [boostConfig, setBoostConfig] = useState(null);
  const [user_seeds_map, set_user_seeds_map] = useState<
    Record<string, UserSeedInfo>
  >({});
  const [user_unclaimed_map, set_user_unclaimed_map] = useState<
    Record<string, any>
  >({});
  const [user_unclaimed_token_meta_map, set_user_unclaimed_token_meta_map] =
    useState<Record<string, any>>({});
  const paramId = props.match.params.id;
  const getDetailData = (data: {
    detailData: Seed;
    tokenPriceList: any;
    loveSeed: Seed;
    boostConfig: BoostConfig;
    user_seeds_map: Record<string, UserSeedInfo>;
    user_unclaimed_token_meta_map: Record<string, any>;
    user_unclaimed_map: Record<string, any>;
  }) => {
    const {
      detailData,
      tokenPriceList,
      loveSeed,
      boostConfig,
      user_seeds_map,
      user_unclaimed_token_meta_map,
      user_unclaimed_map,
    } = data;
    setDetailData(detailData);
    setTokenPriceList(tokenPriceList);
    serLoveSeed(loveSeed);
    setBoostConfig(boostConfig);
    set_user_seeds_map(user_seeds_map);
    set_user_unclaimed_map(user_unclaimed_map);
    set_user_unclaimed_token_meta_map(user_unclaimed_token_meta_map);
  };
  const emptyDetailData = () => {
    setDetailData(null);
  };
  const showDetailPage =
    paramId &&
    detailData &&
    tokenPriceList &&
    Object.keys(tokenPriceList).length > 0;
  const showLoading = paramId && !showDetailPage;
  return (
    <>
      <FarmsHome getDetailData={getDetailData}></FarmsHome>
      {showLoading ? <Loading></Loading> : null}
      {showDetailPage ? (
        <FarmsDetail
          detailData={detailData}
          tokenPriceList={tokenPriceList}
          emptyDetailData={emptyDetailData}
          loveSeed={loveSeed}
          boostConfig={boostConfig}
          user_seeds_map={user_seeds_map}
          user_unclaimed_map={user_unclaimed_map}
          user_unclaimed_token_meta_map={user_unclaimed_token_meta_map}
        ></FarmsDetail>
      ) : null}
    </>
  );
}
