import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { ModalCloseIcon } from './icons';
import {
  QuestionTipIcon,
  LevelIcon0,
  LevelIcon1,
  LevelIcon2,
  LevelIcon3,
  UpIcon,
  SuccessIcon,
} from './icons2';
import { isMobile } from '../../utils/device';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import { BeatLoading } from '../../components/layout/Loading';
import { check_in, query_user_claimed } from '../../services/meme_check_in';
import { getMemeCheckInConfig } from './memeConfig';
import { useWalletSelector } from '../../context/WalletSelectorContext';

const CheckInModal = (props: any) => {
  const { isOpen, onRequestClose } = props;
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [checkInLoading, setCheckInLoading] = useState<boolean>(false);
  const [claimed, setClaimed] = useState<boolean>(true);
  const is_mobile = isMobile();
  const { accountId } = useWalletSelector();
  const w = is_mobile ? '95vw' : '436px';
  const memeCheckInConfig = getMemeCheckInConfig();
  const token_id_list = memeCheckInConfig.token_id_list;
  useEffect(() => {
    if (accountId && isOpen) {
      query_user_claimed(token_id_list[0]).then((claimedTime) => {
        if (claimedTime && +claimedTime == 0) {
          setClaimed(false);
        } else {
          setClaimed(true);
        }
      });
    }
  }, [accountId, isOpen]);
  function getNftTip() {
    return `
    <div class="flex flex-col gap-2 items-start">
      <div class="">Meme Leval</div>
      <p>Leval 0: Stake Meme Value > $0</p>
      <p>Leval 1 : Stake Meme Value > $500，Lucky</p>
      <p>Leval 2 : Stake Meme Value > $5000，Lucky</p>
      <p>Leval 3 : Stake Meme Value > $10000，Lucky</p>
    </div>
  `;
  }
  function getLevelTip() {
    return `
    <div class="flex flex-col gap-2 items-start">
      <div class="">Meme Leval</div>
      <p>Leval 0: Stake Meme Value > $0</p>
      <p>Leval 1 : Stake Meme Value > $500，Lucky</p>
      <p>Leval 2 : Stake Meme Value > $5000，Lucky</p>
      <p>Leval 3 : Stake Meme Value > $10000，Lucky</p>
    </div>
  `;
  }
  function claim() {
    if (claimLoading) return;
    setClaimLoading(true);
  }
  function checkIn() {
    if (checkInLoading || claimed) return;
    setCheckInLoading(true);
    check_in(token_id_list);
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
            {/* <img src="" style={{ width: '54px' }} className="mr-3" /> */}
            <LevelIcon0 />
            <div className="flex flex-col gap-3">
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
              <div
                onClick={claim}
                style={{ width: '53px' }}
                className={`flex items-center justify-center text-sm text-senderHot rounded-md border border-senderHot px-1.5 h-6 ${
                  claimLoading
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                {claimLoading ? <BeatLoading /> : <>Claim</>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3.5 border border-memeDonateBorderColor border-opacity-20 rounded-xl bg-memeModelgreyColor  px-2.5 w-1 flex-grow">
            <LevelIcon1 />
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-base text-white gotham_bold">Lv.1</span>
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
              <div className="flex items-center gap-1">
                <span className="text-xs text-white">Lucky</span>
                <UpIcon />
              </div>
            </div>
          </div>
        </div>
        <div
          className={`flex items-center justify-center rounded-xl mt-8 ${
            claimed
              ? 'bg-memePoolBoxBorderColor cursor-not-allowed'
              : 'bg-greenLight'
          } ${
            checkInLoading ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
          }`}
          style={{ height: '50px' }}
          onClick={checkIn}
        >
          {checkInLoading ? (
            <BeatLoading />
          ) : (
            <span className="text-base text-cardBg gotham_bold">Check-In</span>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CheckInModal;
