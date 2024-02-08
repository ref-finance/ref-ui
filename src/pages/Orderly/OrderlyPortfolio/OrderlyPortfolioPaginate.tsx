import React, { useEffect, useState } from 'react';
import { useOrderlyContext } from '../orderly/OrderlyContext';
import CustomPagination from 'src/components/customPagination/customPagination';
import { constOrderlyPageSize } from 'src/pages/Orderly/orderly/constant';

const OrderlyPortfolioPaginate = ({
  total = 0,
  setPage,
  page = 1,
  pageSize = constOrderlyPageSize,
  isLoading = false,
}: {
  total: number;
  setPage?: any;
  page: number;
  pageSize: number;
  isLoading?: boolean;
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
      {isLoading ? (
        '...'
      ) : (
        <CustomPagination
          page={orderPageNum}
          totalPages={totalPage}
          nextClick={handleNextClick}
          prevClick={handlePrevClick}
          firstClick={() => setOrderPageNum(1)}
          lastClick={() => setOrderPageNum(totalPage)}
        />
      )}
    </div>
  );
};

export default OrderlyPortfolioPaginate;
