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
          <ul className="text-sm list-disc pl-3 mt-5">
            <li>
              The Meme Token project requires xREF holders to deposit tokens
              into their vaults from the beginning of the month for selection.
            </li>
            <li>
              During the voting process, Memetoken communities can participate
              in donating in the 'Donate' section and allocate rewards to users
              to incentivize them to stake xREF and vote for the Memetoken.
            </li>
            <li>
              The first voting period is a 4-day window, to vote in xREF for
              your preferred Memetoken.
            </li>
            <li>
              After the xREF Voting, we have the top five Memecoins selected
              through xREF staking and Meme Staking start.
            </li>
            <li>
              Note:
              <p>
                1) The same mechanism as before will be used—snapshot on Meme
                gauge weight for the 80/20% staking and pools.
              </p>
              <p>
                2) xRef staking will determine the REF allocation ratio, while
                MemeToken staking will only determine the NEAR allocation ratio.
              </p>
            </li>
          </ul>
          <p className="mt-5 mb-2">
            Criteria for Existing Tokens Listed on REF MEME Season to be
            Eligible for the Next Season**
          </p>
          <ul className="text-sm list-disc pl-3">
            <li>The community coin must have at least 2.5K holders.</li>
            <li>
              The project should maintain a daily trading volume of at least 2K
              USD on average.
            </li>
            <li>The project must have at least 10K followers on Twitter/X.</li>
            <li>
              The project should have an active meme community within the NEAR
              Ecosystem.
            </li>
          </ul>
          <p className="mt-5 mb-2">
            Criteria for New Tokens Launched During August - September**
          </p>
          <ul className="text-sm list-disc pl-3">
            <li>
              The project must have been in existence for at least one week.
            </li>
            <li>
              The project must have its liquidity pool (LP) locked or burned.
            </li>
            <li>The project must be whitelisted on Ref Finance.</li>
            <li>
              The project must have at least 8,000 USD worth of liquidity.
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
