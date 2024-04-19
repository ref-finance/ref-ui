import React, { useContext, useEffect, useState } from 'react';
import {
  UserStakeRankingNext,
  UserStakeRankingPrevious,
  UserStakeRankingSort,
  UserStakeRankingTab1,
  UserStakeRankingTab2,
  UserStakeRankingTab3,
} from './icons';
import { MemeContext } from './context';
import Loading from '../layout/Loading';

export default function UserStakeRanking({ hidden }: { hidden: boolean }) {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const { allTokenMetadatas } = useContext(MemeContext);
  useEffect(() => {
    fetchDataAndPopulateTable();
  }, []);

  const fetchDataAndPopulateTable = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://flipsidecrypto.xyz/api/v1/queries/b0cb2a69-c894-4884-8ac8-557757e8d94e/data/latest'
      );
      const data = await response.json();
      setTableData(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    const keyForSort = key.includes('Total Balance')
      ? 'Total Balance ($)'
      : key.startsWith('$')
      ? key
      : '$' + key.toUpperCase();
    const sortedData = [...tableData].sort((a, b) => {
      const aValue = parseFloat(a[keyForSort] || 0);
      const bValue = parseFloat(b[keyForSort] || 0);
      return direction === 'ascending' ? aValue - bValue : bValue - aValue;
    });

    setTableData(sortedData);
    setSortConfig({ key: keyForSort, direction });
  };

  const renderSortIcon = (key) => {
    const isActive = sortConfig && sortConfig.key === key;
    const isAscending = isActive && sortConfig.direction === 'ascending';

    return (
      <UserStakeRankingSort
        className={`ml-1.5 text-borderColor hover:text-white transform ${
          isAscending ? 'rotate-180' : ''
        }`}
      />
    );
  };

  const getCustomPaginationRange = (current, total) => {
    let pages = [];
    const lastPage = total;
    const secondLastPage = total - 1;
    if (total <= 5) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }
    if (current === 1) {
      pages = [1, 2, 3, '...', secondLastPage, lastPage];
    } else if (current === 2) {
      pages = [1, 2, 3, '...', secondLastPage, lastPage];
    } else if (current === lastPage - 3) {
      pages = [current - 1, current, lastPage - 2, lastPage - 1, lastPage];
    } else if (current === lastPage - 2) {
      pages = [current - 2, current - 1, current, lastPage - 1, lastPage];
    } else if (current === lastPage - 1) {
      pages = [current - 3, current - 2, current - 1, current, lastPage];
    } else if (current === lastPage) {
      pages = [
        lastPage - 4,
        lastPage - 3,
        lastPage - 2,
        lastPage - 1,
        lastPage,
      ];
    } else {
      pages = [
        current - 1,
        current,
        current + 1,
        '...',
        secondLastPage,
        lastPage,
      ];
    }

    return pages;
  };
  const findMetadataBySymbol = (symbol) => {
    return Object.values(allTokenMetadatas).find(
      (metadata) => metadata.symbol === symbol
    );
  };
  const tableHeaders =
    tableData.length > 0
      ? Object.keys(tableData[0])
          .filter((key) => key !== 'Wallet' && key !== 'Total Balance ($)')
          .map((key) => key.replace('$', ''))
      : [];
  return (
    <div className={`text-primaryText ${hidden ? 'hidden' : ''}`}>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div
            className="grid gap-6 text-sm text-gray2 text-left mb-3 px-6"
            style={{
              gridTemplateColumns:
                'minmax(auto, 4rem) minmax(auto, 26rem) repeat(4, minmax(auto, 8rem)) minmax(auto, 7rem)',
            }}
          >
            <div>Ranking</div>
            <div>Wallet</div>
            {tableHeaders.map((symbol) => {
              const metadata = findMetadataBySymbol(symbol);
              return metadata ? (
                <div
                  key={symbol}
                  onClick={() => handleSort('$' + symbol)}
                  className="flex items-center cursor-pointer"
                >
                  <img
                    src={metadata.icon}
                    alt={`${symbol} logo`}
                    className="mr-1.5"
                    style={{ width: 20, height: 20 }}
                  />
                  {symbol}
                  {renderSortIcon('$' + symbol)}
                </div>
              ) : null;
            })}
            <div
              onClick={() => handleSort('Total Balance ($)')}
              className="flex items-center justify-center cursor-pointer"
            >
              Total Balance
              {renderSortIcon('Total Balance ($)')}
            </div>
          </div>
          <div className="bg-memeModelgreyColor rounded-2xl mb-6 text-white">
            {currentItems.map((item, index) => (
              <div
                key={item.Wallet}
                className="grid gap-6 text-base py-4 px-6 border-b border-memePoolBoxBorderColor"
                style={{
                  gridTemplateColumns:
                    'minmax(auto, 4rem) minmax(auto, 26rem) repeat(4, minmax(auto, 8rem)) minmax(auto, 7rem)',
                  borderBottom:
                    index === currentItems.length - 1
                      ? 'none'
                      : '1px solid #yourBorderColorHere',
                }}
              >
                <div>
                  {(() => {
                    const globalIndex =
                      index + 1 + (currentPage - 1) * itemsPerPage;
                    return globalIndex === 1 ? (
                      <UserStakeRankingTab1 />
                    ) : globalIndex === 2 ? (
                      <UserStakeRankingTab2 />
                    ) : globalIndex === 3 ? (
                      <UserStakeRankingTab3 />
                    ) : (
                      globalIndex
                    );
                  })()}
                </div>
                <div className="truncate max-w-18 overflow-hidden text-ellipsis">
                  {item.Wallet}
                </div>
                <div className="truncate max-w-10 overflow-hidden text-ellipsis">
                  {item.$LONK.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="truncate max-w-10 overflow-hidden text-ellipsis">
                  {item.$NEKO.toLocaleString('en-US')}
                </div>
                <div className="truncate max-w-10 overflow-hidden text-ellipsis">
                  {item.$BLACKDRAGON.toLocaleString('en-US')}
                </div>
                <div className="truncate max-w-10 overflow-hidden text-ellipsis">
                  {item.$SHITZU.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="truncate max-w-10 overflow-hidden text-ellipsis">
                  {item['Total Balance ($)'].toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center text-sm">
            <div
              className={`flex justify-center items-center ${
                currentPage > 1
                  ? 'text-white cursor-pointer'
                  : 'text-primaryText'
              }`}
              onClick={() => {
                if (currentPage > 1) {
                  paginate(currentPage - 1);
                }
              }}
            >
              <UserStakeRankingPrevious
                color={currentPage > 1 ? '#FFFFFF' : '#7E8A93'}
                className="mr-2.5"
              />
              Previous
            </div>
            <div>
              <div>
                {getCustomPaginationRange(
                  currentPage,
                  Math.ceil(tableData.length / itemsPerPage)
                ).map((page, index) => {
                  if (typeof page === 'number') {
                    return (
                      <button
                        key={index}
                        onClick={() => paginate(page)}
                        className={`mr-3.5 py-1 px-2 rounded-md ${
                          currentPage === page
                            ? 'bg-limitOrderInputColor bg-opacity-30 text-white'
                            : 'text-primaryText'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else {
                    return (
                      <span
                        key={index}
                        className="mr-3.5 py-1 px-2 rounded-md text-primaryText cursor-default"
                      >
                        {page}
                      </span>
                    );
                  }
                })}
              </div>
            </div>
            <div
              className={`flex justify-center items-center ${
                currentPage < Math.ceil(tableData.length / itemsPerPage)
                  ? 'text-white cursor-pointer'
                  : 'text-primaryText'
              }`}
              onClick={() => {
                if (currentPage < Math.ceil(tableData.length / itemsPerPage)) {
                  paginate(currentPage + 1);
                }
              }}
            >
              Next
              <UserStakeRankingNext
                color={
                  currentPage < Math.ceil(tableData.length / itemsPerPage)
                    ? '#FFFFFF'
                    : '#7E8A93'
                }
                className="ml-2.5"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
