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
          {/* <p className="mt-4">New campaign start on 1st of May</p> */}
          {/* <p className="mt-5">
            A new selection of top 5 reward Meme tokens is voted by holders of
            xREF, with 25% boosted reward for the overall campaign (NEAR + Ref
            reward).
          </p> */}
          {/* <p className="mt-5">Selection criteria:</p> */}
          <ul className="text-sm list-disc pl-3 mt-5">
            <li>
              Meme token projects ask xREF holders to deposit into their vault
              for the selection from July 1st.
            </li>
            <li>
              During the voting process, Memetoken communities can participate
              in donating in the 'Show love for voters' section and allocate
              rewards to users to incentivize them to stake xREF and vote for
              the Memetoken.
            </li>
            <li>
              The first voting period is a 72h window, to vote in xREF for your
              preferred Memetoken.
            </li>
            <li>
              After the 72h, we have the top three Memecoins selected through
              xREF staking.
            </li>
            {/* <li>
              The following 24h, after the 48h, is for users to now stake their
              Memecoin token to compete as before
            </li> */}
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
            <li>
              The top 2 out of 5 will be maintained from the current campaign as
              an ongoing mechanism for the following months. The other 3 seats
              will rotate based on the results of their xREF staking within a
              voting period.
            </li>
          </ul>
          <p className="mt-5">Some rules:</p>
          <ul className="text-sm list-disc pl-3">
            <li>
              Users who unstake their xREF after the voting period ends will not
              affect the rewards pool or the meme's position during that season.
            </li>
            <li>
              Users who keep their xREF staked will be able for extra incentive
              in the next season.
            </li>
            <li>
              Unstaking xREF will have a one-day cooldown before withdrawal is
              possible.
            </li>
            <li>
              Five selected MEME will have their staking pools active for one
              month.
            </li>
            <li>
              The top 2 MEME tokens based on staking volume at the end of the
              season will automatically qualify for the next season.
            </li>
            <li>
              The remaining 3 seats will be reshuffled based on the new season's
              voting session.
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
