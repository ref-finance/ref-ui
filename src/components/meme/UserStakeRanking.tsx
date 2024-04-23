import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  UserStakeRankingFirst,
  UserStakeRankingLast,
  UserStakeRankingMobileTab1,
  UserStakeRankingMobileTab2,
  UserStakeRankingMobileTab3,
  UserStakeRankingNext,
  UserStakeRankingPopupDown,
  UserStakeRankingPrevious,
  UserStakeRankingSort,
  UserStakeRankingTab1,
  UserStakeRankingTab2,
  UserStakeRankingTab3,
} from './icons';
import { MemeContext } from './context';
import Loading from '../layout/Loading';
import { isMobile } from 'src/utils/device';

export default function UserStakeRanking({ hidden }: { hidden: boolean }) {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: 'Total Balance ($)',
    direction: 'descending',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const { allTokenMetadatas } = useContext(MemeContext);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [selectedToken, setSelectedToken] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const is_mobile = isMobile();
  useEffect(() => {
    const populateTableData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          'https://flipsidecrypto.xyz/api/v1/queries/b0cb2a69-c894-4884-8ac8-557757e8d94e/data/latest'
        );
        const data = await response.json();
        setTableData(data);
        setIsLoading(false);
        const headers =
          data.length > 0
            ? Object.keys(data[0])
                .filter(
                  (key) => key !== 'Wallet' && key !== 'Total Balance ($)'
                )
                .map((key) => {
                  const tokenSymbol = key.replace('$', '').toLowerCase();
                  const metadata = Object.values(allTokenMetadatas).find(
                    (meta) => meta.symbol.toLowerCase() === tokenSymbol
                  );
                  return {
                    symbol: tokenSymbol.toUpperCase(),
                    name: metadata?.symbol,
                    icon: metadata?.icon || '',
                  };
                })
            : [];
        setTableHeaders(headers);
        if (headers.length > 0) {
          setSelectedToken(headers[0].symbol);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    populateTableData();
  }, [allTokenMetadatas]);

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', checkIfClickedOutside);

    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside);
    };
  }, [isOpen]);

  const handleSort = (key) => {
    const keyForSort = key.includes('Total Balance')
      ? 'Total Balance ($)'
      : key.startsWith('$')
      ? key
      : '$' + key.toUpperCase();

    const sortedData = [...tableData].sort((a, b) => {
      const aValue = parseFloat(a[keyForSort] || 0);
      const bValue = parseFloat(b[keyForSort] || 0);
      return bValue - aValue;
    });

    setTableData(sortedData);
    setSortConfig({ key: keyForSort, direction: 'descending' });
    setCurrentPage(1);
  };

  const renderSortIcon = (key) => {
    const isActive = sortConfig && sortConfig.key === key;
    return (
      <UserStakeRankingSort
        className={`ml-1.5 ${
          isActive ? 'text-white' : 'text-borderColor hover:text-white'
        } transform`}
      />
    );
  };

  const getCustomPaginationRange = (current, total) => {
    if (is_mobile) {
      const pages = [];
      if (total <= 3) {
        return Array.from({ length: total }, (_, index) => index + 1);
      } else if (current === 1) {
        pages.push(1, 2, '...', total);
      } else if (current === total - 1) {
        pages.push(total - 2, total - 1, total);
      } else if (current === total) {
        pages.push(total - 2, total - 1, total);
      } else {
        pages.push(current, current + 1);
        if (current + 1 < total) {
          pages.push('...', total);
        }
      }
      return pages;
    } else {
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
    }
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelectToken = (symbol) => {
    setSelectedToken(symbol);
    setIsOpen(false);
    if (sortConfig && sortConfig.key === '$' + selectedToken.toUpperCase()) {
      handleSort('$' + symbol);
    }
  };
  function formatBalance(balance) {
    const number = Number(balance);
    if (isNaN(number)) {
      return;
    }

    if (number < 0.01) {
      return '<0.01';
    }
    return (
      '$' +
      number.toLocaleString('en-US', {
        maximumFractionDigits: 2,
      })
    );
  }
  function formatBalanceConvert(balance) {
    if (balance < 1000) {
      return balance.toFixed(2);
    } else if (balance < 1000000) {
      return (balance / 1000).toFixed(2) + 'K';
    } else if (balance < 1000000000) {
      return (balance / 1000000).toFixed(2) + 'M';
    } else {
      return (balance / 1000000000).toFixed(2) + 'B';
    }
  }
  return (
    <div className={`text-primaryText ${hidden ? 'hidden' : ''}`}>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div
            className="grid gap-6 text-sm text-gray2 text-left mb-1.5 px-6 flex items-center xsm:flex xsm:justify-between xsm:border-b xsm:border-memeBorderColor xsm:pb-3"
            style={{
              gridTemplateColumns: is_mobile
                ? ''
                : 'minmax(auto, 4rem) minmax(auto, 30rem) minmax(auto, 18rem) minmax(auto, 12rem)',
            }}
          >
            <div className="xsm:hidden">Ranking</div>
            <div className="xsm:hidden">Wallet</div>
            <div
              onClick={() => handleSort('Total Balance ($)')}
              className="flex items-center cursor-pointer"
            >
              Total Staked Value
              {renderSortIcon('Total Balance ($)')}
            </div>
            <div className="relative flex justify-end" ref={dropdownRef}>
              <div className="flex items-center">
                <div
                  className="cursor-pointer text-white flex items-center justify-end bg-memeModelgreyColor border border-memeBorderColor rounded-3xl pt-1.5 pb-1.5 pr-3 pl-1.5 w-max"
                  onClick={toggleDropdown}
                >
                  <img
                    src={
                      tableHeaders.find((h) => h.symbol === selectedToken)?.icon
                    }
                    style={{ width: '22px', height: '22px' }}
                    alt=""
                  />
                  <p className="ml-1.5 xsm:hidden">{selectedToken}</p>
                  <UserStakeRankingPopupDown className="ml-4" />
                </div>
                <div
                  onClick={() => handleSort('$' + selectedToken)}
                  className="cursor-pointer"
                >
                  {renderSortIcon('$' + selectedToken)}
                </div>
              </div>
              {isOpen && (
                <div
                  className="absolute top-11 right-0 z-10 bg-memeUserStackeBgColor rounded-xl pb-1 pt-5 xsm:pt-4 px-4 
                xsm:px-3 text-white w-60 xsm:w-max xsm:bg-memeModelgreyColor xsm:border xsm:border-memeBorderColor"
                >
                  <p className="text-base mb-2 xsm:hidden">Meme Token</p>
                  {tableHeaders.map(({ symbol, name, icon }) => (
                    <div
                      key={symbol}
                      className={`flex items-center justify-between mb-1.5 p-1.5 cursor-pointer rounded-lg hover:bg-selectTokenV3BgColor xsm:border-none
                       ${
                         selectedToken === symbol ? 'border border-borderC' : ''
                       }`}
                      onClick={() => handleSelectToken(symbol)}
                    >
                      <div className="flex items-center">
                        <img src={icon} alt="" className="h-5 w-5 mr-1.5" />
                        {name}
                      </div>
                      <div className="xsm:hidden">
                        <input
                          type="radio"
                          name="token"
                          checked={selectedToken === symbol}
                          onChange={() => handleSelectToken(symbol)}
                          className="radio-custom ml-auto cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="bg-memeModelgreyColor rounded-2xl mb-6 text-white border border-memeBorderColor xsm:hidden">
            {currentItems.map((item, index) => (
              <div
                key={item.Wallet}
                className="grid gap-6 text-base py-4 px-6 border-b border-memePoolBoxBorderColor"
                style={{
                  gridTemplateColumns:
                    'minmax(auto, 4rem) minmax(auto, 30rem) minmax(auto, 18rem) minmax(auto, 12rem)',
                  borderBottom: index === currentItems.length - 1 ? 'none' : '',
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
                  {formatBalance(item['Total Balance ($)'])}
                </div>
                <div className="truncate max-w-10 overflow-hidden text-ellipsis flex justify-end">
                  {item['$' + selectedToken].toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="lg:hidden overflow-x-hidden">
            {currentItems.map((item, index) => (
              <div
                key={item.Wallet}
                className="py-3.5 pl-3.5 flex items-center border-b border-memeBorderColor"
              >
                <div className="text-white w-8 mr-2 flex justify-center">
                  {(() => {
                    const globalIndex =
                      index + 1 + (currentPage - 1) * itemsPerPage;
                    return globalIndex === 1 ? (
                      <UserStakeRankingMobileTab1 />
                    ) : globalIndex === 2 ? (
                      <UserStakeRankingMobileTab2 />
                    ) : globalIndex === 3 ? (
                      <UserStakeRankingMobileTab3 />
                    ) : (
                      globalIndex
                    );
                  })()}
                </div>
                <div className="w-10/12">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      ${formatBalanceConvert(item['Total Balance ($)'])}
                    </div>
                    <div>{formatBalanceConvert(item['$' + selectedToken])}</div>
                  </div>
                  <div className="truncate w-11/12 overflow-hidden text-ellipsis">
                    {item.Wallet}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center text-sm xsm:px-4 xsm:mt-5">
            <div className="flex justify-center items-center">
              <div
                className={`flex justify-center items-center mr-6 xsm:mr-3 cursor-pointer ${
                  currentPage === 1 ? 'text-primaryText' : 'text-white'
                }`}
                onClick={() => {
                  if (currentPage > 1) paginate(1);
                }}
              >
                <div
                  className={`w-7 rounded-lg h-7 flex items-center justify-center ${
                    currentPage === 1
                      ? 'border-memeUserStackeMobileBgColor'
                      : 'border-senderHot'
                  } ${is_mobile ? 'border' : ''}`}
                >
                  <UserStakeRankingFirst
                    color={
                      is_mobile
                        ? currentPage === 1
                          ? '#7E8A93'
                          : '#00FFD1'
                        : currentPage === 1
                        ? '#7E8A93'
                        : '#FFFFFF'
                    }
                  />
                </div>
                <p className={`${is_mobile ? 'hidden' : ''}`}>First</p>
              </div>

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
                <div
                  className={`w-7 rounded-lg h-7 flex items-center justify-center ${
                    currentPage > 1
                      ? 'border-senderHot'
                      : 'border-memeUserStackeMobileBgColor'
                  } ${is_mobile ? 'border' : ''}`}
                >
                  <UserStakeRankingPrevious
                    color={
                      is_mobile
                        ? currentPage > 1
                          ? '#00FFD1'
                          : '#7E8A93'
                        : currentPage > 1
                        ? '#FFFFFF'
                        : '#7E8A93'
                    }
                  />
                </div>
                <p className={`${is_mobile ? 'hidden' : ''}`}>Previous</p>
              </div>
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
                        className={`mr-3.5 py-1 px-2 rounded-md xsm:w-7 xsm:h-7 ${
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
            <div className="flex justify-center items-center">
              <div
                className={`flex justify-center items-center ${
                  currentPage < Math.ceil(tableData.length / itemsPerPage)
                    ? 'text-white cursor-pointer'
                    : 'text-primaryText'
                }`}
                onClick={() => {
                  if (
                    currentPage < Math.ceil(tableData.length / itemsPerPage)
                  ) {
                    paginate(currentPage + 1);
                  }
                }}
              >
                <p className="xsm:hidden">Next</p>
                <div
                  className={`w-7 rounded-lg h-7 flex items-center justify-center ${
                    currentPage < Math.ceil(tableData.length / itemsPerPage)
                      ? 'border-senderHot'
                      : 'border-memeUserStackeMobileBgColor'
                  } ${is_mobile ? 'border' : ''}`}
                >
                  <UserStakeRankingNext
                    color={
                      is_mobile
                        ? currentPage <
                          Math.ceil(tableData.length / itemsPerPage)
                          ? '#00FFD1'
                          : '#7E8A93'
                        : currentPage <
                          Math.ceil(tableData.length / itemsPerPage)
                        ? '#FFFFFF'
                        : '#7E8A93'
                    }
                  />
                </div>
              </div>
              <div
                className={`flex justify-center items-center ml-6 xsm:ml-3 cursor-pointer ${
                  currentPage === Math.ceil(tableData.length / itemsPerPage)
                    ? 'text-primaryText'
                    : 'text-white'
                }`}
                onClick={() => {
                  if (
                    currentPage < Math.ceil(tableData.length / itemsPerPage)
                  ) {
                    paginate(Math.ceil(tableData.length / itemsPerPage));
                  }
                }}
              >
                <p className="xsm:hidden">Last</p>
                <div
                  className={`w-7 rounded-lg h-7 flex items-center justify-center ${
                    currentPage === Math.ceil(tableData.length / itemsPerPage)
                      ? 'border-memeUserStackeMobileBgColor'
                      : 'border-senderHot'
                  } ${is_mobile ? 'border' : ''}`}
                >
                  <UserStakeRankingLast
                    color={
                      is_mobile
                        ? currentPage ===
                          Math.ceil(tableData.length / itemsPerPage)
                          ? '#7E8A93'
                          : '#00FFD1'
                        : currentPage ===
                          Math.ceil(tableData.length / itemsPerPage)
                        ? '#7E8A93'
                        : '#FFFFFF'
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
