import React, { useContext, useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { isMobile } from '../../utils/device';
import {
  MemeEllipsis,
  ModalCloseIcon,
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
import {
  getMemeFarmingAssetsList,
  getMemeFarmingTokens,
  getMemeFarmingTotalAssetsList,
} from '../../services/api';
import Loading from '../layout/Loading';
function UserRankingModal(props: any) {
  const { isOpen, onRequestClose } = props;
  const cardWidth = isMobile() ? '90vw' : '52vw';
  const cardHeight = isMobile() ? '588px' : 'auto';
  const is_mobile = isMobile();
  const { allTokenMetadatas } = useContext(MemeContext);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);
  const [memeFarmingTokens, setMemeFarmingTokens] = useState([]);
  const [isOpenToken, setIsOpenToken] = useState(false);
  const [selectedToken, setSelectedToken] = useState('All');
  const [tableDate, setTableDate] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(isMobile() ? 5 : 7);
  const [totalPages, setTotalPages] = useState(0);
  const rowRefs = useRef([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [sorted, setSorted] = useState(false);
  const [currentPageInput, setCurrentPageInput] = useState('');
  useEffect(() => {
    if (isOpen) {
      getMemeFarmingTokens()
        .then((data) => {
          setMemeFarmingTokens(data?.data);
        })
        .catch((error) => {
          console.log(error);
          setMemeFarmingTokens([]);
        });
    }
  }, [isOpen]);
  useEffect(() => {
    let loadingTimeout = null;
    if (isOpen) {
      const fetchData = async () => {
        loadingTimeout = setTimeout(() => {
          setIsLoading(true);
        }, 500);
        try {
          let data;
          const offset = (currentPage - 1) * itemsPerPage;
          if (selectedToken === 'All') {
            data = await getMemeFarmingTotalAssetsList(
              itemsPerPage,
              offset,
              'desc'
            );
          } else {
            data = await getMemeFarmingAssetsList(
              selectedToken,
              'total_value',
              itemsPerPage,
              offset,
              'desc'
            );
          }
          setTableDate(data?.data.list || []);
          setTotalPages(Math.ceil(data?.data.total / itemsPerPage));
          setIsLoading(false);
        } catch (error) {
          console.log(error);
          setTableDate([]);
        } finally {
          clearTimeout(loadingTimeout);
          setIsLoading(false);
        }
      };
      fetchData();
    }
    return () => clearTimeout(loadingTimeout);
  }, [isOpen, selectedToken, currentPage, itemsPerPage]);
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedToken]);
  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpenToken(false);
      }
    };

    document.addEventListener('mousedown', checkIfClickedOutside);

    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside);
    };
  }, [isOpen]);
  const handleSelectToken = (token) => {
    setSelectedToken(token);
    setIsOpenToken(false);
    setSorted(false);
    setCurrentPage(1);
  };
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const getCustomPaginationRange = (current, total) => {
    if (is_mobile) {
      const pages = [];
      if (total <= 3) {
        return Array.from({ length: total }, (_, index) => index + 1);
      } else if (current === 1) {
        pages.push(`${current}/${total}`);
      } else if (current === total) {
        pages.push(`${total}`);
      } else {
        pages.push(`${current}/${total}`);
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
        pages = [1, 2, 3, 4, '...', lastPage];
      } else if (current === 2) {
        pages = [1, 2, 3, 4, '...', lastPage];
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
          current + 2,
          '...',
          lastPage,
        ];
      }
      return pages;
    }
  };
  function abbreviateNumber(value) {
    const number = Number(value);
    if (isNaN(number)) {
      return '';
    } else if (number >= 1e9) {
      return (number / 1e9).toFixed(2) + 'B';
    } else if (number >= 1e6) {
      return (number / 1e6).toFixed(2) + 'M';
    } else if (number >= 1e3) {
      return (number / 1e3).toFixed(2) + 'K';
    } else {
      return number.toFixed(2);
    }
  }
  let timeoutId;
  const handleMouseEnterRow = (itemIndex) => {
    setHoveredRow(itemIndex);
    clearTimeout(timeoutId);
  };

  const handleMouseLeaveRow = () => {
    timeoutId = setTimeout(() => {
      setHoveredRow(null);
    }, 300);
  };
  const sortTableData = () => {
    const sortedData = [...tableDate];
    if (selectedToken === 'All') {
      sortedData.sort((a, b) => {
        const totalA = a.token_list.reduce((acc, curr) => acc + curr.total, 0);
        const totalB = b.token_list.reduce((acc, curr) => acc + curr.total, 0);
        return totalB - totalA;
      });
    } else {
      sortedData.sort((a, b) => b.total - a.total);
    }
    setTableDate(sortedData);
    setSorted(true);
    setCurrentPage(1);
  };
  const getPopupPosition = (triggerElement) => {
    if (triggerElement) {
      const rect = triggerElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const popupHeight = 200;
      if (windowHeight - rect.bottom < popupHeight) {
        return { top: 'initial', bottom: '150%' };
      } else {
        return { top: '150%', bottom: 'initial' };
      }
    }
    return null;
  };
  const handlePageJump = () => {
    const pageNumber = parseInt(currentPageInput);
    if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setCurrentPageInput('');
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          overflow: 'auto',
        },
        content: {
          outline: 'none',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <div
        className="py-5 px-4 text-base text-v3SwapGray bg-senderHot rounded-2xl "
        style={{
          width: cardWidth,
          height: cardHeight,
          background: 'linear-gradient(180deg, #213441 0%, #15242F 100%)',
        }}
      >
        <div className="title flex items-center justify-between pr-3 mb-6">
          <div className="text-white text-xl gotham_bold">
            User stake ranking
          </div>
          <ModalCloseIcon className="cursor-pointer" onClick={onRequestClose} />
        </div>
        <div className="text-sm text-gray2 text-left mb-1.5 px-6 flex items-center xsm:justify-between xsm:border-b xsm:border-memeBorderColor xsm:pb-3 xsm:px-0">
          <div className="xsm:hidden" style={{ width: '10%' }}>
            Ranking
          </div>
          <div className="xsm:hidden" style={{ width: '30%' }}>
            Wallet
          </div>
          <div
            className="flex items-center cursor-pointer"
            style={{
              width: is_mobile ? 'auto' : '30%',
            }}
          >
            Total Staked Value
          </div>
          <div
            className="relative flex justify-end"
            ref={dropdownRef}
            style={{ width: '30%' }}
          >
            <div className="flex items-center">
              <div
                className="cursor-pointer text-white flex items-center justify-end bg-memeModelgreyColor border border-memeBorderColor rounded-3xl pt-1.5 pb-1.5 pr-3 pl-1.5 w-max"
                onClick={() => setIsOpenToken(!isOpenToken)}
              >
                {allTokenMetadatas[selectedToken]?.icon ? (
                  <img
                    src={allTokenMetadatas[selectedToken]?.icon}
                    alt=""
                    className="h-5 w-5 mr-1.5 rounded-3xl"
                  />
                ) : (
                  <span className="lg:hidden">All</span>
                )}
                <span className="xsm:hidden">
                  {allTokenMetadatas[selectedToken]?.symbol || 'All'}
                </span>
                <UserStakeRankingPopupDown className="ml-4" />
              </div>
              {/* <UserStakeRankingSort
                className={`ml-1.5 transform cursor-pointer ${
                  sorted ? 'text-white' : 'text-borderColor hover:text-white '
                }`}
                onClick={sortTableData}
              /> */}
            </div>
            {isOpenToken && (
              <div className="absolute top-11 right-0 z-10 bg-memeUserStackeBgColor rounded-xl pb-1 pt-3 px-2 text-white w-60 border border-borderC">
                <div
                  className={`flex items-center justify-between mb-1.5 p-1.5 cursor-pointer rounded-lg hover:bg-selectTokenV3BgColor xsm:border-none
                  ${selectedToken === 'All' ? 'border border-borderC' : ''}`}
                  onClick={() => handleSelectToken('All')}
                >
                  <div className="flex items-center">All</div>
                </div>
                <div className="overflow-auto" style={{ height: '300px' }}>
                  {memeFarmingTokens &&
                    memeFarmingTokens.map((token, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between mb-1.5 p-1.5 cursor-pointer rounded-lg hover:bg-selectTokenV3BgColor
                    ${selectedToken === token ? 'border border-borderC' : ''}`}
                        onClick={() => handleSelectToken(token)}
                      >
                        <div className="flex items-center">
                          <img
                            src={allTokenMetadatas[token]?.icon || ''}
                            alt=""
                            className="h-5 w-5 mr-1.5 rounded-3xl"
                          />
                          {allTokenMetadatas[token]?.symbol}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {isLoading ? (
          <div style={{ minHeight: is_mobile ? '400px' : '468px' }}>
            <Loading />
          </div>
        ) : (
          <>
            <div className="xsm:hidden" style={{ minHeight: '468px' }}>
              <div className="bg-memeModelgreyColor rounded-2xl mb-6 text-white border border-memeBorderColor ">
                {tableDate &&
                  tableDate.map((item, index) => (
                    <div
                      key={index}
                      className={`text-base py-4 px-6 h-16 flex items-center ${
                        index === tableDate.length - 1
                          ? ''
                          : 'border-b border-memePoolBoxBorderColor'
                      }`}
                    >
                      <div
                        className="flex justify-center items-center pr-10"
                        style={{ width: '10%' }}
                      >
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
                      <div
                        className="truncate overflow-hidden text-ellipsis pr-6"
                        title={item.wallet}
                        style={{ width: '30%' }}
                      >
                        {item.wallet}
                      </div>
                      <div
                        className="truncate overflow-hidden text-ellipsis"
                        style={{ width: '30%' }}
                      >
                        {item.total_value < 0.01
                          ? '$<0.01'
                          : `$${abbreviateNumber(item.total_value)}`}
                      </div>
                      <div className="" style={{ width: '30%' }}>
                        {selectedToken === 'All' &&
                        Array.isArray(item.token_list) ? (
                          <div
                            className="flex justify-end relative cursor-pointer"
                            onMouseEnter={() => handleMouseEnterRow(index)}
                            onMouseLeave={handleMouseLeaveRow}
                          >
                            {item.token_list.map((token, tokenIndex) => (
                              <div
                                className="relative"
                                key={tokenIndex}
                                style={{
                                  width: '22px',
                                  height: '22px',
                                  marginLeft: tokenIndex === 0 ? '0' : '-5px',
                                }}
                              >
                                <img
                                  className="absolute size-full block left-0 top-0 rounded-3xl"
                                  src={
                                    allTokenMetadatas[token.token]?.icon || ''
                                  }
                                  alt=""
                                />
                              </div>
                            ))}
                            {hoveredRow === index && (
                              <div
                                className="absolute top-8 right-0 bg-boxBorder bg-opacity-80 px-3 pt-3 z-50 rounded-md border border-toolTipBoxBorderColor"
                                style={{
                                  maxHeight: '220px',
                                  overflow: 'auto',
                                  backdropFilter: 'blur(4px)',
                                }}
                              >
                                {item.token_list.map((token) => (
                                  <div
                                    className="flex items-center justify-between mb-4"
                                    key={token.token}
                                  >
                                    <div className="flex items-center mr-10">
                                      <img
                                        className="w-5 h-5 rounded-3xl"
                                        src={
                                          allTokenMetadatas[token.token]
                                            ?.icon || ''
                                        }
                                        alt=""
                                      />
                                      <p className="text-gray2 text-sm ml-1.5">
                                        {allTokenMetadatas[token.token]
                                          ?.symbol || ''}
                                      </p>
                                    </div>
                                    <div className="text-sm">
                                      {token.total < 0.01
                                        ? '<0.01'
                                        : `${abbreviateNumber(token.total)}`}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            {item.total < 0.01
                              ? '<0.01'
                              : `${abbreviateNumber(item.total)}`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div
              className="lg:hidden overflow-x-hidden"
              style={{ height: '72%' }}
            >
              {tableDate &&
                tableDate.map((item, index) => (
                  <div
                    key={item.wallet}
                    className="py-3.5 pl-3.5 flex items-center border-b border-memeBorderColor xsm:pl-0"
                  >
                    <div className="text-white w-10 mr-2 flex justify-center">
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
                    <div style={{ width: '86%' }}>
                      <div className="flex items-center justify-between text-white">
                        <div>
                          {item.total_value < 0.01
                            ? '$<0.01'
                            : `$${abbreviateNumber(item.total_value)}`}
                        </div>
                        <div>
                          {selectedToken === 'All' &&
                          Array.isArray(item.token_list) ? (
                            <div
                              className="flex justify-end relative cursor-pointer"
                              ref={(el) => (rowRefs.current[index] = el)}
                              onMouseEnter={() => handleMouseEnterRow(index)}
                              onMouseLeave={handleMouseLeaveRow}
                            >
                              {item.token_list.length >= 4 ? (
                                <>
                                  {item.token_list
                                    .slice(0, 2)
                                    .map((token, tokenIndex) => (
                                      <div
                                        className="relative"
                                        key={tokenIndex}
                                        style={{
                                          width: '20px',
                                          height: '20px',
                                          marginLeft:
                                            tokenIndex === 0 ? '0' : '-5px',
                                        }}
                                      >
                                        <img
                                          className="absolute size-full block left-0 top-0 rounded-3xl"
                                          src={
                                            allTokenMetadatas[token.token]
                                              ?.icon || ''
                                          }
                                          alt=""
                                        />
                                      </div>
                                    ))}
                                  <div
                                    className="relative"
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      marginLeft: '-5px',
                                    }}
                                  >
                                    <MemeEllipsis />
                                  </div>
                                  <div
                                    className="relative"
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      marginLeft: '-5px',
                                    }}
                                  >
                                    <img
                                      className="absolute size-full block left-0 top-0 rounded-3xl"
                                      src={
                                        allTokenMetadatas[
                                          item.token_list[
                                            item.token_list.length - 1
                                          ].token
                                        ]?.icon || ''
                                      }
                                      alt=""
                                    />
                                  </div>
                                </>
                              ) : (
                                item.token_list.map((token, tokenIndex) => (
                                  <div
                                    className="relative"
                                    key={tokenIndex}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      marginLeft:
                                        tokenIndex === 0 ? '0' : '-5px',
                                    }}
                                  >
                                    <img
                                      className="absolute size-full block left-0 top-0 rounded-3xl"
                                      src={
                                        allTokenMetadatas[token.token]?.icon ||
                                        ''
                                      }
                                      alt=""
                                    />
                                  </div>
                                ))
                              )}

                              {hoveredRow === index && (
                                <div
                                  className="absolute top-8 right-0 bg-boxBorder px-3 pt-3 z-50 rounded-md border border-toolTipBoxBorderColor max-h-64 overflow-auto"
                                  style={{
                                    ...getPopupPosition(rowRefs.current[index]),
                                    backdropFilter: 'blur(4px)',
                                  }}
                                >
                                  {item.token_list.map((token) => (
                                    <div
                                      className="flex items-center justify-between mb-4"
                                      key={token.token}
                                    >
                                      <div className="flex items-center mr-10">
                                        <img
                                          className="w-5 h-5  rounded-3xl"
                                          src={
                                            allTokenMetadatas[token.token]
                                              ?.icon || ''
                                          }
                                          alt=""
                                        />
                                        <p className="text-gray2 text-sm ml-1.5">
                                          {allTokenMetadatas[token.token]
                                            ?.symbol || ''}
                                        </p>
                                      </div>
                                      <div className="text-sm">
                                        {token.total < 0.01
                                          ? '<0.01'
                                          : `${abbreviateNumber(token.total)}`}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              {item.total < 0.01
                                ? '<0.01'
                                : `${abbreviateNumber(item.total)}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        className="truncate w-11/12 overflow-hidden text-ellipsis"
                        title={item.wallet}
                      >
                        {item.wallet}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div className="flex justify-between items-center text-sm xsm:mt-5">
              <div className="flex justify-center items-center">
                <div
                  className={`flex justify-center items-center mr-6 xsm:mr-3 cursor-pointer lg:hidden ${
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
              <div className="flex items-center">
                <div>
                  <PaginationComponent
                    getCustomPaginationRange={getCustomPaginationRange}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    paginate={paginate}
                  />
                </div>
                <div className="xsm:hidden ml-4 flex items-center">
                  <p className="text-memePaginationComponentColor mr-1.5 text-sm ">
                    Go to
                  </p>
                  <input
                    type="text"
                    className="bg-black bg-opacity-40 border border-border2 w-11 h-6 rounded p-2"
                    value={currentPageInput}
                    onChange={(e) => setCurrentPageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePageJump();
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-center items-center">
                <div
                  className={`flex justify-center items-center ${
                    currentPage < totalPages
                      ? 'text-white cursor-pointer'
                      : 'text-primaryText'
                  }`}
                  onClick={() => {
                    if (currentPage < totalPages) {
                      paginate(currentPage + 1);
                    }
                  }}
                >
                  <p className="xsm:hidden">Next</p>
                  <div
                    className={`w-7 rounded-lg h-7 flex items-center justify-center ${
                      currentPage < totalPages
                        ? 'border-senderHot'
                        : 'border-memeUserStackeMobileBgColor'
                    } ${is_mobile ? 'border' : ''}`}
                  >
                    <UserStakeRankingNext
                      color={
                        is_mobile
                          ? currentPage < totalPages
                            ? '#00FFD1'
                            : '#7E8A93'
                          : currentPage < totalPages
                          ? '#FFFFFF'
                          : '#7E8A93'
                      }
                    />
                  </div>
                </div>
                <div
                  className={`flex justify-center items-center ml-6 xsm:ml-3 cursor-pointer lg:hidden ${
                    currentPage === totalPages
                      ? 'text-primaryText'
                      : 'text-white'
                  }`}
                  onClick={() => {
                    if (currentPage < totalPages) {
                      paginate(totalPages);
                    }
                  }}
                >
                  <p className="xsm:hidden">Last</p>
                  <div
                    className={`w-7 rounded-lg h-7 flex items-center justify-center ${
                      currentPage === totalPages
                        ? 'border-memeUserStackeMobileBgColor'
                        : 'border-senderHot'
                    } ${is_mobile ? 'border' : ''}`}
                  >
                    <UserStakeRankingLast
                      color={
                        is_mobile
                          ? currentPage === totalPages
                            ? '#7E8A93'
                            : '#00FFD1'
                          : currentPage === totalPages
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
    </Modal>
  );
}

interface PaginationComponentProps {
  getCustomPaginationRange: (
    currentPage: number,
    totalPages: number
  ) => Array<number | string>;
  currentPage: number;
  totalPages: number;
  paginate: (pageNumber: number) => void;
}
const PaginationComponent: React.FC<PaginationComponentProps> = ({
  getCustomPaginationRange,
  currentPage,
  totalPages,
  paginate,
}) => {
  const paginationRange = getCustomPaginationRange(currentPage, totalPages);
  return (
    <>
      {paginationRange &&
        paginationRange.map((page, index) => {
          if (typeof page === 'number') {
            return (
              <button
                key={index}
                onClick={() => paginate(page)}
                className={`mr-3.5 py-1 px-2 xsm:px-1.5 rounded-md xsm:h-7 ${
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
                className="mr-3.5 py-1 px-2 xsm:px-1.5 rounded-md text-primaryText cursor-default"
              >
                {page}
              </span>
            );
          }
        })}
    </>
  );
};
export default UserRankingModal;
