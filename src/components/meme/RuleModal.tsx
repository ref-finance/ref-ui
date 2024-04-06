import React from 'react';
import Modal from 'react-modal';
import { isMobile } from '../../utils/device';
import { ModalCloseIcon } from './icons';
function RuleModal(props: any) {
  const { isOpen, onRequestClose } = props;
  const cardWidth = isMobile() ? '95vw' : '35vw';
  const cardHeight = isMobile() ? '60vh' : '55vh';
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
          background: 'linear-gradient(180deg, #213441 0%, #15242F 100%)',
        }}
      >
        <div className="title flex items-center justify-between pr-3">
          <div className="text-white text-base gotham_bold">
            Meme Competition Rules
          </div>
          <ModalCloseIcon className="cursor-pointer" onClick={onRequestClose} />
        </div>
        <div
          className="overflow-auto pr-3"
          style={{
            height: cardHeight,
          }}
        >
          <p className="mt-4">New campaign start on 8th of April</p>
          <p className="mt-5">
            A new selection of top 5 reward meme tokens is voted by holders of
            xREF, with 25% boosted reward for the overall campaign (NEAR + Ref
            reward).
          </p>
          <p className="mt-5">Selection criteria:</p>
          <ul className="text-sm list-disc pl-3">
            <li>
              Meme token projects ask xREF holders to deposit into their vault
              for the selection period
            </li>
            <li>
              Meme token communities deposit some meme token into their xREF
              vault, to encourage more xREF holders to deposit more to vote for
              the selection of their meme token into the meme campaign
            </li>
            <li>
              The first voting period is a 48h window, to vote in xREF for your
              preferred memetoken
            </li>
            <li>
              After the 48h, we have the top five memecoins selected through
              xREF staking
            </li>
            <li>
              The following 24h, after the 48h, is for users to now stake their
              memecoin token to compete as before (for the gauge weight of their
              NEAR/REF reward distribution to their memetoken pool staking
            </li>
            <li>
              xREF holderes will be incentivized to stake as thry will be
              randomly selected for additional memecoins tokens drop to push for
              incentivisation to stake then their memecoins tokens
            </li>
          </ul>
          <p className="mt-5">Some rules:</p>
          <ul className="text-sm list-disc pl-3">
            <li>
              Users can unstake their xREF after the voting period but it won’t
              affect the pools, or they can leave their staked xREF
            </li>
            <li>
              xREF unstaking will have one day of cooldown before being able to
              withdraw
            </li>
            <li>
              For staked memecoin tokens, it wil still take five days of
              cooldown period before being able to withdraw the tokens.
            </li>
            <li>
              The selected five memecoins will have their staking pools running
              for one month
            </li>
            <li>
              After that, the competition starts again. Some may remain
              depending on voting or new memecoins may take the spot.
            </li>
          </ul>
        </div>
        <div className="flex items-center justify-center">
          <span
            onClick={onRequestClose}
            className="flex items-center justify-center mt-6 h-8 text-sm text-white cursor-pointer px-8 border border-primaryText rounded-lg gotham_bold"
          >
            Got it
          </span>
        </div>
      </div>
    </Modal>
  );
}

export default RuleModal;
