import React, { useContext, useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { isMobile } from '../../utils/device';
import {
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
import { getMemeFarmingTokens } from '../../services/api';
function UserRankingModal(props: any) {
  const { isOpen, onRequestClose } = props;
  const cardWidth = isMobile() ? '86vw' : '52vw';
  const cardHeight = isMobile() ? '80vh' : '70vh';
  const is_mobile = isMobile();
  const { allTokenMetadatas } = useContext(MemeContext);
  const dropdownRef = useRef(null);
  const [memeFarmingTokens, setMemeFarmingTokens] = useState([]);
  const [isOpenToken, setIsOpenToken] = useState(false);
  const [selectedToken, setSelectedToken] = useState('All');
  // useEffect(() => {
  //   if (isOpen) {
  //     getMemeFarmingTokens()
  //       .then((data) => {
  //         setMemeFarmingTokens(data);
  //       })
  //       .catch((error) => {
  //         console.error('Failed to fetch meme farming tokens:', error);
  //         setMemeFarmingTokens([]);
  //       });
  //   }
  // }, [isOpen]);
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
  };
  const tokenData = [
    'blackdragon.tkn.near',
    'ftv2.nekotoken.near',
    'token.0xshitzu.near',
    'token.lonkingnearbackto2024.near',
  ];
  console.log(allTokenMetadatas);
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
        className="py-5 pl-5 pr-2 text-base text-v3SwapGray bg-senderHot rounded-2xl"
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
          <div className="flex items-center cursor-pointer">
            Total Staked Value
          </div>
          <div className="relative flex justify-end" ref={dropdownRef}>
            <div className="flex items-center">
              <div
                className="cursor-pointer text-white flex items-center justify-end bg-memeModelgreyColor border border-memeBorderColor rounded-3xl pt-1.5 pb-1.5 pr-3 pl-1.5 w-max"
                onClick={() => setIsOpenToken(!isOpenToken)}
              >
                {allTokenMetadatas[selectedToken]?.icon && (
                  <img
                    src={allTokenMetadatas[selectedToken]?.icon}
                    alt=""
                    className="h-5 w-5 mr-1.5"
                  />
                )}
                <span>{allTokenMetadatas[selectedToken]?.symbol || 'All'}</span>
                <UserStakeRankingPopupDown className="ml-4" />
              </div>
            </div>
            {isOpenToken && (
              <div className="absolute top-11 right-0 z-10 bg-memeUserStackeBgColor rounded-xl pb-1 pt-3 px-2 text-white w-60">
                <div
                  className={`flex items-center justify-between mb-1.5 p-1.5 cursor-pointer rounded-lg hover:bg-selectTokenV3BgColor xsm:border-none
                  ${selectedToken === 'All' ? 'border border-borderC' : ''}`}
                  onClick={() => handleSelectToken('All')}
                >
                  <div className="flex items-center">All</div>
                </div>
                {tokenData.map((token, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between mb-1.5 p-1.5 cursor-pointer rounded-lg hover:bg-selectTokenV3BgColor xsm:border-none
                   ${selectedToken === token ? 'border border-borderC' : ''}`}
                    onClick={() => handleSelectToken(token)}
                  >
                    <div className="flex items-center">
                      <img
                        src={allTokenMetadatas[token]?.icon || ''}
                        alt=""
                        className="h-5 w-5 mr-1.5"
                      />
                      {allTokenMetadatas[token]?.symbol}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="bg-memeModelgreyColor rounded-2xl mb-6 text-white border border-memeBorderColor xsm:hidden">
          <div
            className="grid gap-6 text-base py-4 px-6 border-b border-memePoolBoxBorderColor"
            style={{
              gridTemplateColumns:
                'minmax(auto, 4rem) minmax(auto, 30rem) minmax(auto, 18rem) minmax(auto, 12rem)',
            }}
          >
            <div className="flex justify-center items-center pr-6">1</div>
            <div className="truncate max-w-18 overflow-hidden text-ellipsis">
              1
            </div>
            <div className="truncate max-w-10 overflow-hidden text-ellipsis">
              1
            </div>
            <div className="truncate max-w-10 overflow-hidden text-ellipsis flex justify-end">
              1
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default UserRankingModal;
