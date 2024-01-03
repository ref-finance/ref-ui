import React, { useEffect, useRef, useState, useContext } from 'react';
import FarmsHome from '~components/farm/FarmsHome';
import FarmsDetail from '~components/farm/FarmsDetail';
import FarmsDclDetail from '~components/farm/FarmsDclDetailCopy';
import Loading, { BeatLoading } from '~components/layout/Loading';
import { Seed, BoostConfig, UserSeedInfo } from '~services/farm';
export default function FarmsBoosterPage(props: any) {
  const [detailData, setDetailData] = useState(null);
  const [tokenPriceList, setTokenPriceList] = useState(null);
  const [loveSeed, serLoveSeed] = useState(null);
  const [boostConfig, setBoostConfig] = useState(null);
  const [user_data, set_user_data] = useState({});
  const [user_data_loading, set_user_data_loading] = useState(true);
  const [dayVolumeMap, setDayVolumeMap] = useState({});
  const [all_seeds, set_all_seeds] = useState<Seed[]>([]);
  const paramId = decodeURIComponent(props.match.params.id || '');
  const is_dcl = paramId.indexOf('<>') > -1 || paramId.indexOf('|') > -1;
  const getDetailData_user_data = (data: {
    user_seeds_map: Record<string, UserSeedInfo>;
    user_unclaimed_token_meta_map: Record<string, any>;
    user_unclaimed_map: Record<string, any>;
  }) => {
    const {
      user_seeds_map,
      user_unclaimed_map,
      user_unclaimed_token_meta_map,
    } = data;
    set_user_data({
      user_seeds_map,
      user_unclaimed_map,
      user_unclaimed_token_meta_map,
    });
    set_user_data_loading(false);
  };
  const getDayVolumeMap = (map: any) => {
    setDayVolumeMap(map || {});
  };
  const getDetailData_boost_config = (boostConfig: BoostConfig) => {
    setBoostConfig(boostConfig);
  };
  const getDetailData = (data: {
    detailData: Seed;
    tokenPriceList: any;
    loveSeed: Seed;
    all_seeds: Seed[];
  }) => {
    const { detailData, tokenPriceList, loveSeed, all_seeds } = data;
    setDetailData(detailData);
    setTokenPriceList(tokenPriceList);
    serLoveSeed(loveSeed);
    set_all_seeds(all_seeds);
  };
  const emptyDetailData = () => {
    setDetailData(null);
  };
  const baseCondition =
    paramId &&
    detailData &&
    tokenPriceList &&
    Object.keys(tokenPriceList).length > 0;
  const showDetailPage = baseCondition && !is_dcl;
  const showDclDetailPage = baseCondition && is_dcl;
  const showLoading = paramId && !showDetailPage && !showDclDetailPage;
  return (
    <>
      <FarmsHome
        getDetailData={getDetailData}
        getDetailData_user_data={getDetailData_user_data}
        getDetailData_boost_config={getDetailData_boost_config}
        getDayVolumeMap={getDayVolumeMap}
      ></FarmsHome>
      {showLoading ? <Loading></Loading> : null}
      {showDetailPage ? (
        <FarmsDetail
          detailData={detailData}
          tokenPriceList={tokenPriceList}
          emptyDetailData={emptyDetailData}
          loveSeed={loveSeed}
          boostConfig={boostConfig}
          user_data={user_data}
          user_data_loading={user_data_loading}
          dayVolumeMap={dayVolumeMap}
        ></FarmsDetail>
      ) : null}
      {showDclDetailPage ? (
        <FarmsDclDetail
          detailData={detailData}
          tokenPriceList={tokenPriceList}
          emptyDetailData={emptyDetailData}
          loveSeed={loveSeed}
          boostConfig={boostConfig}
          user_data={user_data}
          user_data_loading={user_data_loading}
          dayVolumeMap={dayVolumeMap}
          all_seeds={all_seeds}
        ></FarmsDclDetail>
      ) : null}
    </>
  );
}
