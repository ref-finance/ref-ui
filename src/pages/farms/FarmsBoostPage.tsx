import React, { useEffect, useRef, useState, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import FarmsHome from '~components/farm/FarmsHome';
import FarmsDetail from '~components/farm/FarmsDetail';
import { useHistory, useLocation } from 'react-router-dom';
import Loading, { BeatLoading } from '~components/layout/Loading';
import { Seed } from '~services/farm';
export default function FarmsBoosterPage(props: any) {
  const [detailData, setDetailData] = useState(null);
  const [tokenPriceList, setTokenPriceList] = useState(null);
  const paramId = props.match.params.id;
  const getDetailData = (detailData: Seed, tokenPriceList: any) => {
    setDetailData(detailData);
    setTokenPriceList(tokenPriceList);
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
        ></FarmsDetail>
      ) : null}
    </>
  );
}
