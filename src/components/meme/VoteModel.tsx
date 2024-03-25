import React, { useState } from 'react';
import { isMobile } from '../../utils/device';
import { ArrowRightTopIcon, ModalCloseIcon, TipIcon } from './icons';
import Modal from 'react-modal';

function VoteModel(props: any) {
  const { isOpen, onRequestClose } = props;
  const [selectedTab, setSelectedTab] = useState('LONK');
  const cardWidth = isMobile() ? '90vw' : '28vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          // backdropFilter: 'blur(15px)',
          // WebkitBackdropFilter: 'blur(15px)',
          overflow: 'auto',
        },
        content: {
          outline: 'none',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <div className="flex flex-col">
        <div
          className="px-5 xs:px-3 md:px-3 py-6 rounded-2xl bg-swapCardGradient overflow-auto"
          style={{
            width: cardWidth,
            maxHeight: cardHeight,
            border: '1px solid rgba(151, 151, 151, 0.2)',
          }}
        >
          <div className="title flex items-center justify-between">
            <div className="text-white text-2xl gotham_bold">Vote for Meme</div>
            <ModalCloseIcon
              className="cursor-pointer"
              onClick={onRequestClose}
            />
          </div>
          <div className="mt-6 mb-5">
            <div className="text-primaryText text-sm">
              Select Meme you support
            </div>
            <div className="mt-5 flex flex-wrap mb-2">
              <Tab
                isSelected={selectedTab === 'LONK'}
                label="LONK"
                onSelect={() => setSelectedTab('LONK')}
              />
              <Tab
                isSelected={selectedTab === 'Blackdragon'}
                label="Blackdragon"
                onSelect={() => setSelectedTab('Blackdragon')}
              />
              <Tab
                isSelected={selectedTab === 'Neko'}
                label="Neko"
                onSelect={() => setSelectedTab('Neko')}
              />
              <Tab
                isSelected={selectedTab === 'Shitzu'}
                label="Shitzu"
                onSelect={() => setSelectedTab('Shitzu')}
              />
              <Tab
                isSelected={selectedTab === 'Uwon'}
                label="Uwon"
                onSelect={() => setSelectedTab('Uwon')}
              />
              <Tab
                isSelected={selectedTab === 'ShillGPT'}
                label="ShillGPT"
                onSelect={() => setSelectedTab('ShillGPT')}
              />
            </div>
            <div className="flex justify-between text-sm">
              <div className="text-primaryText">Stake xREF</div>
              <div className="text-senderHot flex justify-end items-center">
                <p className="mr-2">Acquire $xREF</p>
                <ArrowRightTopIcon />
              </div>
            </div>
            <div style={{ height: '90px' }} className="mb-8">
              {/* input */}
            </div>
            <div className="bg-greenLight rounded-xl w-full text-black text-center gotham_bold text-base py-3.5 mb-4 cursor-pointer">
              Stake
            </div>
            <div className="flex items-start gap-2 mt-4">
              <TipIcon className="flex-shrink-0 transform translate-y-1" />
              <p className="text-sm text-greenLight">
                The unstaked $xREF will available to be withdrawn in 1 days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

const Tab = ({ isSelected, label, onSelect }) => {
  const baseStyle =
    'rounded-3xl border border-memeBorderColor pt-2 pl-2 pr-3 pb-2 flex items-center justify-between cursor-pointer w-min';
  const selectedStyle = 'bg-senderHot text-cardBg';
  const unselectedStyle = 'bg-memeModelgreyColor text-white';

  return (
    <button
      className={`${baseStyle} ${
        isSelected ? selectedStyle : unselectedStyle
      } mr-4 mb-4`}
      onClick={onSelect}
    >
      <div
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: 'pink',
        }}
      ></div>
      <div className="ml-1.5 text-base gotham_bold">{label}</div>
    </button>
  );
};

export default VoteModel;
