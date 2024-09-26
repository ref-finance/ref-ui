import React, { useEffect, useMemo, useState } from 'react';
import Modal from 'react-modal';
import Big from 'big.js';
import { ModalCloseIcon } from './icons';
import { QuestionTipIcon, UpIcon } from './icons2';
import { isMobile } from '../../utils/device';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import { BeatLoading } from '../../components/layout/Loading';
import dayjs from '../../utils/dayjs';
import {
  check_in,
  query_user_claimed,
  get_nft_metadata,
  is_account_already_minted,
  claim_nft,
  query_user_nftInfo,
} from '../../services/meme_check_in';
import { getMemeCheckInConfig } from './memeConfig';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { INFT_metadata } from '../../interface/meme';
import NFTTaskModal from '../../components/meme/NFTTaskModal';
import { getMemeFarmingTotalAssetsList } from '../../services/api';
import { IStakeItem, ILEVEL } from '../../interface/meme';
import { ConnectToNearBtn } from '../../components/button/Button';
const CheckInModal = (props: any) => {
  const { isOpen, onRequestClose } = props;
  const [isNftTaskOpen, setIsNftTaskOpen] = useState<boolean>(false);
  const [shareButtonClicked, setShareButtonClicked] = useState<'0' | '1' | '2'>(
    '0'
  ); // '0': init state '1': shared '2': share ended
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [checkInLoading, setCheckInLoading] = useState<boolean>(false);
  const [claimed, setClaimed] = useState<boolean>();
  const [nft_metadata, set_nft_metadata] = useState<INFT_metadata>();
  const [already_minted, set_already_minted] = useState<boolean>();
  const [stakeList, setStakeList] = useState<IStakeItem[]>([]);
  const [accountStakeLevel, setAccountStakeLevel] = useState<ILEVEL>('0');
  const [hasNft, setHasNft] = useState<boolean>(false);
  const is_mobile = isMobile();
  const { accountId } = useWalletSelector();
  const w = is_mobile ? '95vw' : '436px';
  const memeCheckInConfig = getMemeCheckInConfig();
  const token_id_list = memeCheckInConfig.token_id_list;
  const level = memeCheckInConfig.level;
  useEffect(() => {
    get_nft_metadata().then((res) => {
      set_nft_metadata(res);
    });
  }, []);
  useEffect(() => {
    if (shareButtonClicked == '1') {
      const clearId = setTimeout(() => {
        setShareButtonClicked('2');
      }, 3000);
      return () => {
        clearTimeout(clearId);
      };
    }
  }, [shareButtonClicked]);
  useEffect(() => {
    if (accountId && isOpen) {
      query_user_claimed(token_id_list[0]).then((claimedTime) => {
        if (
          dayjs(Number(claimedTime || 0)).isBefore(dayjs().utc().startOf('day'))
        ) {
          setClaimed(false);
        } else {
          setClaimed(true);
        }
      });
      is_account_already_minted().then((res) => {
        set_already_minted(res);
      });
      query_user_nftInfo().then((res) => {
        if (res?.length > 0) {
          setHasNft(true);
        } else {
          setHasNft(false);
        }
      });
      getMemeFarmingTotalAssetsList(10000, 0, 'desc').then((res) => {
        setStakeList(res.data.list || []);
      });
    }
  }, [accountId, isOpen]);
  useEffect(() => {
    if (accountId) {
      getMemeFarmingTotalAssetsList(10000, 0, 'desc').then((res) => {
        setStakeList(res.data.list || []);
      });
    }
  }, [accountId]);
  useMemo(() => {
    if (stakeList.length && accountId) {
      const find = stakeList.find((item) => {
        return item.wallet == accountId;
      });
      if (find) {
        if (Big(find.total_value).lt(level['0'].value)) {
          setAccountStakeLevel('0');
        } else if (Big(find.total_value).lt(level['1'].value)) {
          setAccountStakeLevel('1');
        } else if (Big(find.total_value).lt(level['2'].value)) {
          setAccountStakeLevel('2');
        } else {
          setAccountStakeLevel('3');
        }
      } else {
        setAccountStakeLevel('0');
      }
    }
  }, [JSON.stringify(stakeList), accountId]);
  function getNftTip() {
    return `
    <div class="flex flex-col gap-2 items-start w-80 xsm:w-72 text-left">
      <div class="gotham_bold">MEME Honorary NFT Overview</div>
      <div class="flex items-start gap-1.5">
        <span class="relative top-1.5 w-1 h-1 rounded-full bg-white flex-shrink-0"></span>
        <span>Airdropped MEME Honorary NFT 4 to OG users via a snapshot.</span>
      </div>
      <div class="flex items-start gap-1.5">
        <span class="relative top-1.5 w-1 h-1 rounded-full bg-white flex-shrink-0"></span>
        <span>Unlock MEME Honorary NFT 6 for all users in MEME Season 6 by completing tasks.</span>
      </div>
      <div class="flex items-start gap-1.5">
        <span class="relative top-1.5 w-1 h-1 rounded-full bg-white flex-shrink-0"></span>
        <span>All NFTs boost the luck in Daily Check-in draws.</span>
      </div>
      <div class="flex items-start gap-1.5">
        <span class="relative top-1.5 w-1 h-1 rounded-full bg-white flex-shrink-0"></span>
        <span>Holders of MEME Honorary NFT can accelerate MEME token acquisition and participate in Season 6 staking.</span>
      </div>
      <div class="flex items-start gap-1.5">
        <span class="relative top-1.5 w-1 h-1 rounded-full bg-white flex-shrink-0"></span>
        <span>Users can own both NFTs at the same period.</span>
      </div>
      <div class="flex items-start gap-1.5">
        <span class="relative top-1.5 w-1 h-1 rounded-full bg-white flex-shrink-0"></span>
        <span>Collecting these NFTs unlocks more future benefits.</span>
      </div>
    </div>
  `;
  }
  function getLevelTip() {
    return `
    <div class="flex flex-col gap-2 items-start w-80 xsm:w-72">
      <div class="gotham_bold">Meme Level</div>
      <p>Level 0: Stake Meme Value < $1000</p>
      <p>Level 1 : Stake Meme Value < $5000</p>
      <p>Level 2 : Stake Meme Value < $100000</p>
      <p>Level 3 : Stake Meme Value >= $100000</p>
      <div class="text-left mt-2">The higher your level, the better your luck—meaning a greater chance to win high-value Daily Check-in rewards, up to $10! Stake more MEME tokens to level up!</div>
    </div>
  `;
  }
  function claim() {
    if (shareButtonClicked == '0') {
      setIsNftTaskOpen(true);
      return;
    }
    if (claimLoading || shareButtonClicked == '1') return;
    setClaimLoading(true);
    claim_nft({ media: nft_metadata.base_uri });
  }
  function callCheckIn() {
    if (checkInLoading || claimed) return;
    setCheckInLoading(true);
    check_in(token_id_list);
  }
  function onNftTaskRequestClose() {
    setIsNftTaskOpen(false);
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          overflow: 'auto',
        },
        content: {
          outline: 'none',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <div
        className="border border-memeDonateBorderColor border-opacity-20 bg-memeDonateBgColor rounded-2xl p-5 pb-6"
        style={{ width: w }}
      >
        <div className="flex items-center justify-between">
          <span className="text-white text-lg gotham_bold">Daily Check-In</span>
          <ModalCloseIcon className="cursor-pointer" onClick={onRequestClose} />
        </div>
        <div
          className="flex items-stretch justify-between gap-4 mt-8"
          style={{ height: '90px' }}
        >
          <div className="flex items-center gap-3.5 border border-memeDonateBorderColor border-opacity-20 rounded-xl bg-memeModelgreyColor px-2.5 w-1 flex-grow">
            <div
              className="relative flex items-center justify-center rounded-xl bg-black mr-3 pl-0.5 overflow-hidden"
              style={{ width: '54px', height: '54px' }}
            >
              <img src={nft_metadata?.icon} style={{ width: '42px' }} />
              {hasNft && accountId ? null : (
                <div className="absolute left-0 right-0 top-0 bottom-0 bg-black opacity-80"></div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-base text-white gotham_bold">NFT</span>
                <div
                  className="text-white text-right"
                  data-class="reactTip"
                  data-tooltip-id="nft-description-id"
                  data-place="top"
                  data-tooltip-html={getNftTip()}
                >
                  <QuestionTipIcon />
                  <CustomTooltip id="nft-description-id" />
                </div>
              </div>
              {already_minted ||
              !accountId ||
              already_minted == undefined ? null : (
                <div
                  onClick={claim}
                  style={{ width: '53px' }}
                  className={`flex items-center justify-center text-sm text-senderHot rounded-md border border-senderHot px-1.5 h-6 ${
                    claimLoading || shareButtonClicked == '1'
                      ? 'opacity-40 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  {claimLoading ? <BeatLoading /> : <>Claim</>}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3.5 border border-memeDonateBorderColor border-opacity-20 rounded-xl bg-memeModelgreyColor  px-2.5 w-1 flex-grow">
            {level[accountStakeLevel].icon}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-base text-white gotham_bold">
                  Lv.{accountStakeLevel}
                </span>
                <div
                  className="text-white text-right"
                  data-class="reactTip"
                  data-tooltip-id="level-description-id"
                  data-place="top"
                  data-tooltip-html={getLevelTip()}
                >
                  <QuestionTipIcon />
                  <CustomTooltip id="level-description-id" />
                </div>
              </div>
              {+accountStakeLevel > 0 ? (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-white">Lucky</span>
                  <UpIcon />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {accountId ? (
          <div
            className="text-white text-right"
            data-class="reactTip"
            data-tooltip-id="check-in-button-id"
            data-place="top"
            data-tooltip-html={claimed ? 'Please come back tomorrow.' : ''}
          >
            <div
              className={`flex items-center justify-center rounded-xl mt-8 ${
                claimed || claimed == undefined
                  ? 'bg-memePoolBoxBorderColor cursor-not-allowed'
                  : 'bg-greenLight'
              } ${
                checkInLoading
                  ? 'opacity-40 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              style={{ height: '50px' }}
              onClick={callCheckIn}
            >
              {checkInLoading ? (
                <BeatLoading />
              ) : (
                <span className="text-base text-cardBg gotham_bold">
                  Check-In
                </span>
              )}
            </div>
            <CustomTooltip id="check-in-button-id" />
          </div>
        ) : (
          <div className="mt-8">
            <ConnectToNearBtn />
          </div>
        )}

        <NFTTaskModal
          isOpen={isNftTaskOpen}
          onRequestClose={onNftTaskRequestClose}
          setShareButtonClicked={setShareButtonClicked}
        />
      </div>
    </Modal>
  );
};

export default CheckInModal;
