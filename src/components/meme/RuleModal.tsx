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
          <p className="mt-4">New campaign start on 1st of May</p>
          <p className="mt-5">
            A new selection of top 5 reward Meme tokens is voted by holders of
            xREF, with 25% boosted reward for the overall campaign (NEAR + Ref
            reward).
          </p>
          <p className="mt-5">Selection criteria:</p>
          <ul className="text-sm list-disc pl-3">
            <li>
              Meme token projects ask xREF holders to deposit into their vault
              for the selection from May 1st
            </li>
            <li>
              During the voting process, Memetoken communities can participate
              in donating in the 'Show love for voters' section and allocate
              rewards to users to incentivize them to stake xREF and vote for
              the Memetoken
            </li>
            <li>
              The first voting period is a 48h window, to vote in xREF for your
              preferred Memetoken
            </li>
            <li>
              After the 48h, we have the top three Memecoins selected through
              xREF staking
            </li>
            <li>
              The following 24h, after the 48h, is for users to now stake their
              Memecoin token to compete as before
            </li>
            <li>
              Note:
              <p>
                1) As same mechanism as before - snapshot on Meme gauge weight
                for the 80/20 % staking and pools
              </p>
              <p>
                2) *xRef stake will determine Ref allocation ratio, while
                MeMeToken stake only determines Near allocation ratio.
              </p>
            </li>
            <li>
              The top 2 out of 5 will be maintained from the current campaign
              and as an ongoing mechanism for following months, while the other
              3 seats will rotate based on the results of their xREF staking
              within a 48-hour period.
            </li>
          </ul>
          <p className="mt-5">Some rules:</p>
          <ul className="text-sm list-disc pl-3">
            <li>
              Users can unstake their xREF after the voting period of xREF but
              it won’t affect the pools, or they can leave their staked xREF for
              the next round of vote at the end of the month
            </li>
            <li>
              xREF unstaking will have one day of cooldown before being able to
              withdraw
            </li>
            <li>
              For staked Memecoin tokens, it will still take five days of
              cooldown period before being able to withdraw the tokens.
            </li>
            <li>
              The selected five Memecoins will have their staking pools running
              for one month
            </li>
            <li>
              After that, the competition starts again. Some may remain
              depending on voting or new Memecoins may take the spot.
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
