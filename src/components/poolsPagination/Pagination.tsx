import React, { useState, useMemo } from 'react';
import { isMobile } from '../../utils/device';

const Pagination = ({
  totalItems,
  itemsPerPage,
  onChangePage,
  onPageSizeChange,
}: {
  totalItems: number;
  itemsPerPage: number;
  onChangePage: any;
  onPageSizeChange: any;
}) => {
  const pageCount = Math.ceil(totalItems / itemsPerPage);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(itemsPerPage);

  const activePageStyle = { backgroundColor: '#566069' };
  const disableStyle = { color: '#7E8A93' };
  const activeLinkStyle = { color: '#fff' };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pageCount && pageNumber !== '...') {
      setCurrentPage(pageNumber);
      onChangePage(pageNumber, pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    onPageSizeChange(newPageSize);
    goToPage(1);
  };

  const goPreOrNext = (index) => {
    if (index + 1 > 5) {
      setCurrentPage((pre) => pre + 5);
    } else {
      setCurrentPage((pre) => pre - 5);
    }
  };

  const pageNumbersList = useMemo(() => {
    const renderList = [];
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) {
        renderList.push(i);
      }
    } else {
      // Condition for current page
      if (currentPage < 5) {
        renderList.push(...[1, 2, 3, 4, 5, 6, '...', pageCount]);
      } else if (currentPage >= 5 && currentPage < pageCount - 4) {
        renderList.push(
          ...[
            1,
            '...',
            currentPage - 2,
            currentPage - 1,
            currentPage,
            currentPage + 1,
            currentPage + 2,
            '...',
            pageCount,
          ]
        );
      } else if (currentPage >= pageCount - 4) {
        renderList.push(
          ...[
            1,
            '...',
            pageCount - 5,
            pageCount - 4,
            pageCount - 3,
            pageCount - 2,
            pageCount - 1,
            pageCount,
          ]
        );
      }
    }
    return renderList;
  }, [currentPage, pageCount]);

  const pageNumbersListForMobile = useMemo(() => {
    return (
      <div>
        <span className="text-white">{currentPage}</span>/
        <span className="text-primaryText">{pageCount}</span>
      </div>
    );
  }, [currentPage, pageCount]);

  return (
    <div
      className={`flex justify-center items-center text-white text-sm font-bold cursor-pointer`}
    >
      <div
        style={currentPage == 1 ? disableStyle : activeLinkStyle}
        onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
        className="mr-auto"
      >
        {`<<  Previous`}
      </div>
      {!isMobile() ? (
        <ul className="flex w-80 justify-center">
          {pageNumbersList.map((item, index) => {
            if (item === '...') {
              return (
                <li key={`ellipsis-${index}`} className="w-6 h-6 frcc rounded">
                  <span
                    className="page-link"
                    onClick={() => goPreOrNext(index)}
                  >
                    {item}
                  </span>
                </li>
              );
            } else {
              return (
                <li
                  key={item}
                  className={`frcc w-6 h-6 rounded ${
                    index % 2 == 0 ? 'mx-2' : ''
                  }`}
                  style={currentPage == item ? activePageStyle : undefined}
                >
                  <span className="page-link" onClick={() => goToPage(item)}>
                    {item}
                  </span>
                </li>
              );
            }
          })}
        </ul>
      ) : (
        pageNumbersListForMobile
      )}

      <div
        style={
          pageCount == 1 || currentPage == pageCount
            ? disableStyle
            : activeLinkStyle
        }
        onClick={() => currentPage < pageCount && goToPage(currentPage + 1)}
        className=" ml-auto"
      >
        {`Next  >>`}
      </div>
    </div>
  );
};

export default Pagination;
