import React, { useEffect, useState } from 'react';

type onClickHandler = () => any;

interface Props {
  page: number;
  totalPages: number;
  firstClick?: onClickHandler;
  prevClick?: onClickHandler;
  prevDisabled?: boolean;
  nextClick?: onClickHandler;
  lastClick?: onClickHandler;
  nextDisabled?: boolean;
  className?: string;
}

const CustomPagination = ({
  className = '',
  firstClick,
  prevClick,
  prevDisabled,
  nextClick,
  lastClick,
  nextDisabled,
  page,
  totalPages,
}: Props) => {
  const canPrevious = () => {
    return !prevDisabled && page !== 1;
  };

  const canNext = () => {
    return !nextDisabled && page < totalPages;
  };

  const handleFirstClick = () => {
    if (canPrevious() && firstClick) {
      firstClick();
    }
  };

  const handleLastClick = () => {
    if (canNext() && lastClick) {
      lastClick();
    }
  };

  const handlePrevClick = () => {
    if (canPrevious() && prevClick) {
      prevClick();
    }
  };

  const handleNextClick = () => {
    if (canNext() && nextClick) {
      nextClick();
    }
  };

  return (
    <div className={`custom-pagination ${className}`}>
      <div className="flex gap-2 items-center -pagination">
        <div className="flex gap-1 items-center">
          <div className={'cursor-pointer'}>
            <div onClick={handleFirstClick}>{firstSvg}</div>
          </div>
          <div className="cursor-pointer -previous">
            <div onClick={handlePrevClick}>{prevSvg}</div>
          </div>
        </div>
        <div>
          {page}/{totalPages}
        </div>
        <div className="flex gap-1 items-center">
          <div className={'cursor-pointer'}>
            <div onClick={handleNextClick}>{nextSvg}</div>
          </div>
          <div className={'cursor-pointer'}>
            <div onClick={handleLastClick}>{lastSvg}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const nextSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="6"
    height="9"
    viewBox="0 0 6 9"
    fill="none"
  >
    <path
      d="M5.22267 3.77071C5.64372 4.16574 5.64372 4.83426 5.22267 5.22928L1.68421 8.54905C1.04564 9.14816 -4.6751e-07 8.69538 -4.29236e-07 7.81976L-1.39013e-07 1.18023C-1.00738e-07 0.304619 1.04564 -0.148155 1.68421 0.450951L5.22267 3.77071Z"
      fill="currentColor"
    />
  </svg>
);

const lastSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="10"
    height="13"
    viewBox="0 0 10 13"
    fill="none"
  >
    <path
      d="M7.22267 5.77071C7.64372 6.16574 7.64372 6.83426 7.22267 7.22928L3.68421 10.5491C3.04564 11.1482 2 10.6954 2 9.81976L2 3.18023C2 2.30462 3.04564 1.85185 3.68421 2.45095L7.22267 5.77071Z"
      fill="currentColor"
    />
    <path
      d="M9 3V10"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const prevSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="6"
    height="9"
    viewBox="0 0 6 9"
    fill="none"
  >
    <path
      d="M0.777329 3.77071C0.356276 4.16574 0.356276 4.83426 0.777328 5.22928L4.31579 8.54905C4.95436 9.14816 6 8.69538 6 7.81976L6 1.18023C6 0.304619 4.95436 -0.148155 4.31579 0.450951L0.777329 3.77071Z"
      fill="currentColor"
    />
  </svg>
);

const firstSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="10"
    height="13"
    viewBox="0 0 10 13"
    fill="none"
  >
    <path
      d="M2.77733 5.77071C2.35628 6.16574 2.35628 6.83426 2.77733 7.22928L6.31579 10.5491C6.95436 11.1482 8 10.6954 8 9.81976L8 3.18023C8 2.30462 6.95436 1.85185 6.31579 2.45095L2.77733 5.77071Z"
      fill="currentColor"
    />
    <path
      d="M1 3V10"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CustomPagination;
