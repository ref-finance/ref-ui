import React, { useEffect, useRef, useState, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import FarmsHome from '~components/farm/FarmsHome';
import FarmsDetail from '~components/farm/FarmsDetail';
import { useHistory, useLocation } from 'react-router-dom';
import Loading, { BeatLoading } from '~components/layout/Loading';
import { Seed, BoostConfig } from '~services/farm';
export default function FarmsBoosterPage(props: any) {
  const [detailData, setDetailData] = useState(null);
  const [tokenPriceList, setTokenPriceList] = useState(null);
  const [loveSeed, serLoveSeed] = useState(null);
  const [boostConfig, setBoostConfig] = useState(null);
  const paramId = props.match.params.id;
  const getDetailData = (data: {
    detailData: Seed;
    tokenPriceList: any;
    loveSeed: Seed;
    boostConfig: BoostConfig;
  }) => {
    const { detailData, tokenPriceList, loveSeed, boostConfig } = data;
    setDetailData(detailData);
    setTokenPriceList(tokenPriceList);
    serLoveSeed(loveSeed);
    setBoostConfig(boostConfig);
  };
  const emptyDetailData = () => {
    setDetailData(null);
  };
  const showDetailPage =
    paramId &&
    detailData &&
    tokenPriceList &&
    loveSeed &&
    boostConfig &&
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
        ></FarmsDetail>
      ) : null}
    </>
  );
}
