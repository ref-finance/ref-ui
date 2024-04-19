import React, { useEffect, useState } from 'react';
import {
  BlackdragonLogo,
  LonkLogo,
  NekoLogo,
  ShitzuLogo,
  UserStakeRankingNext,
  UserStakeRankingPrevious,
  UserStakeRankingSort,
  UserStakeRankingTab1,
  UserStakeRankingTab2,
  UserStakeRankingTab3,
} from './icons';

export default function UserStakeRanking({ hidden }: { hidden: boolean }) {
  const [tableData, setTableData] = useState([]);
  const [sortConfig, setSortConfig] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);

  useEffect(() => {
    fetchDataAndPopulateTable();
  }, []);

  const fetchDataAndPopulateTable = async () => {
    try {
      const response = await fetch(
        'https://flipsidecrypto.xyz/api/v1/queries/b0cb2a69-c894-4884-8ac8-557757e8d94e/data/latest'
      );
      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
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
    const sortedData = [...tableData].sort((a, b) => {
      if (key !== 'Total Balance ($)') {
        a = parseFloat(a['$' + key.toUpperCase()]);
        b = parseFloat(b['$' + key.toUpperCase()]);
      } else {
        a = parseFloat(a[key]);
        b = parseFloat(b[key]);
      }
      if (direction === 'ascending') {
        return a > b ? 1 : -1;
      } else {
        return a < b ? 1 : -1;
      }
    });
    setTableData(sortedData);
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <UserStakeRankingSort className="ml-1.5" />;
    }
    return (
      <UserStakeRankingSort
        className={
          sortConfig.direction === 'ascending' ? 'rotate-180 ml-1.5' : 'ml-1.5'
        }
      />
    );
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className={`text-primaryText ${hidden ? 'hidden' : ''}`}>
      <div
        className="grid gap-6 text-sm text-gray2 text-left mb-3 px-6"
        style={{
          gridTemplateColumns:
            'minmax(auto, 4rem) minmax(auto, 26rem) repeat(5, minmax(auto, 8rem))',
        }}
      >
        <div>Ranking</div>
        <div>Wallet</div>
        <div className="flex items-center justify-center cursor-pointer">
          <LonkLogo className="mr-1.5" />
          Lonk
          {/* {renderSortIcon('Lonk')} */}
        </div>
        <div className="flex items-center justify-center cursor-pointer">
          <NekoLogo className="mr-1.5" />
          Neko
          {/* {renderSortIcon('Neko')} */}
        </div>
        <div className="flex items-center justify-center cursor-pointer">
          <BlackdragonLogo className="mr-1.5" />
          Blackdragon
          {/* {renderSortIcon('Blackdragon')} */}
        </div>
        <div className="flex items-center justify-center cursor-pointer">
          <ShitzuLogo className="mr-1.5" />
          Shitzu
          {/* {renderSortIcon('Shitzu')} */}
        </div>
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
                'minmax(auto, 4rem) minmax(auto, 26rem) repeat(5, minmax(auto, 8rem))',
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
            currentPage > 1 ? 'text-white cursor-pointer' : 'text-primaryText'
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
          {[...Array(Math.ceil(tableData.length / itemsPerPage)).keys()].map(
            (x) => (
              <button
                key={x + 1}
                onClick={() => paginate(x + 1)}
                className={`mr-3.5 py-1 px-2 rounded-md ${
                  currentPage === x + 1
                    ? 'bg-limitOrderInputColor bg-opacity-30 text-white'
                    : 'text-primaryText'
                }`}
              >
                {x + 1}
              </button>
            )
          )}
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
    </div>
  );
}
