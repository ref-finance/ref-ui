import React, { useEffect, useState } from 'react';
import { useOrderlyContext } from '../orderly/OrderlyContext';
import CustomPagination from 'src/components/customPagination/customPagination';
import { constOrderlyPageSize } from 'src/pages/Orderly/orderly/constant';

export const OrderlyPortfolioPaginateWrapper=({data})=>{
  const [filteredData, setFilteredData] = useState<any>();
  const [filteredPaginateData, setFilteredPaginateData] = useState({
    current_page: 1,
    records_per_page: constOrderlyPageSize,
    total: 0,
  });

  useEffect(()=>{
    setFilteredData(data);
    if (!filteredData) {
      setFilteredPaginateData(data?.data?.meta);
    }
  },[data])

  return (
    <OrderlyPortfolioPaginate
      total={filteredPaginateData?.total}
      pageSize={filteredPaginateData?.records_per_page}
      page={filteredPaginateData?.current_page}
    />
  )
}

const OrderlyPortfolioPaginate = ({
  total = 0,
  setPage,
  page = 1,
  pageSize = constOrderlyPageSize,
}: {
  total: number;
  setPage?: any;
  page: number;
  pageSize: number;
}) => {
  const { orderPageNum, setOrderPageNum, orderTotalPage } = useOrderlyContext();


  // if ((orderTotalPage || 0) <= 1) return null;
  const totalPage = Math.ceil(total / pageSize) || 1;
  const handleNextClick = () => {
    setOrderPageNum(orderPageNum + 1);
  };
  const handlePrevClick = () => {
    if (orderPageNum > 1) {
      setOrderPageNum(orderPageNum - 1);
    }
  };

  return (
    <div className={'px-2'}>
      <CustomPagination
        page={orderPageNum}
        totalPages={totalPage}
        nextClick={handleNextClick}
        prevClick={handlePrevClick}
        firstClick={() => setOrderPageNum(1)}
        lastClick={() => setOrderPageNum(totalPage)}
      />
    </div>
  );
};

export default OrderlyPortfolioPaginate;
