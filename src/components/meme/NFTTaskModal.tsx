import React from 'react';
import Modal from 'react-modal';
import { ModalCloseIcon } from './icons';
import { isMobile } from '../../utils/device';

const NFTTaskModal = (props: any) => {
  const { isOpen, onRequestClose, setShareButtonClicked } = props;
  const is_mobile = isMobile();
  const w = is_mobile ? '80vw' : '320px';
  function share() {
    setShareButtonClicked('1');
    onRequestClose();
    window.open('https://x.com/intent/retweet?tweet_id=1852387777192870132');
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          overflow: 'auto',
          background: 'transparent',
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
          <span className="text-white text-base gotham_bold">
            MEME Honorary NFT7
          </span>
          <ModalCloseIcon className="cursor-pointer" onClick={onRequestClose} />
        </div>
        <div className="flex flex-col items-center mt-3 text-white text-sm gap-2">
          <p className="text-left">
            Unlock endless rewards from the MEME world, exclusive to MEME Season
            7! Complete the following tasks to claim:
          </p>
          <div className="flex items-start justify-start w-full gap-1.5 text-left">
            <span className="relative top-1.5 w-1 h-1 rounded-full bg-white flex-shrink-0"></span>
            <span>Follow @ref.finance on X</span>
          </div>
          <div className="flex items-start justify-start w-full gap-1.5 text-left">
            <span className="relative top-1.5 w-1 h-1 rounded-full bg-white flex-shrink-0"></span>
            <span>Retweet the post and share with friends</span>
          </div>
          <div
            onClick={share}
            className={`flex items-center justify-center text-sm text-senderHot rounded-md border border-senderHot h-7 cursor-pointer mt-2 px-2`}
          >
            share to claim
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NFTTaskModal;
