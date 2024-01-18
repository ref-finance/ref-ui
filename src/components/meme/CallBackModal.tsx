import React, { useContext, useMemo } from 'react';
import { OprationButton } from '../../components/button/Button';
import { isMobile } from '../../utils/device';
import { ModalCloseIcon } from './icons';
import Modal from 'react-modal';
import { MemeContext } from './context';
import { ITxParams } from './SeedsBox';
import { Seed } from '../../services/farm';
import { toReadableNumber } from '../../utils/numbers';
import { formatWithCommas_number } from '../../utils/uiNumber';
import { openUrl } from '../../services/commonV3';
import getConfig from '../../services/config';
import { useHistory } from 'react-router';

function CallBackModal(props: any) {
  const { seeds } = useContext(MemeContext);
  const {
    isOpen,
    onRequestClose,
    txParams,
  }: { isOpen: boolean; onRequestClose: any; txParams: ITxParams } = props;
  const history = useHistory();
  const cardWidth = isMobile() ? '90vw' : '28vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';
  let b: ITxParams;
  const seed: Seed = useMemo(() => {
    const { action, receiver_id, params, txHash } = txParams;
    if (action == 'stake') {
      return seeds[receiver_id];
    } else {
      return seeds[params.seed_id];
    }
  }, [seeds, txParams]);
  if (!seed) return null;
  function getAmount() {
    const amount =
      txParams.action == 'stake'
        ? txParams.params.amount
        : txParams.params.unstake_amount;
    return formatWithCommas_number(toReadableNumber(seed.seed_decimal, amount));
  }
  function goNearblocks() {
    history.replace('/meme');
    onRequestClose();
    openUrl(`${getConfig().explorerUrl}/txns/${txParams.txHash}`);
  }
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
          <div className="title flex items-center justify-end">
            <ModalCloseIcon
              className="cursor-pointer"
              onClick={onRequestClose}
            />
          </div>
          <div className="mt-5">
            <div className="flex flex-col items-center gap-5">
              <img
                src={seed?.token_meta_data.icon}
                style={{ width: '86px', height: '86px' }}
                className="rounded-full"
              />
              <div className="flex flex-col items-center">
                <span className="text-2xl text-white gotham_bold">
                  Youda best!
                </span>
                <span className="text-2xl text-white gotham_bold">
                  {seed?.token_meta_data.symbol} you welth!
                </span>
              </div>
            </div>
            <div className="flex justify-center text-sm text-white mt-6">
              You have just {txParams.action == 'stake' ? 'feed' : 'unstake'}{' '}
              {getAmount()} {seed?.token_meta_data.symbol}{' '}
            </div>
            <OprationButton
              minWidth="7rem"
              onClick={goNearblocks}
              className={`flex flex-grow items-center justify-center border border-purple border-opacity-20  text-white mt-6 rounded-xl h-12 text-base gotham_bold focus:outline-none`}
            >
              Check on Nearblocks
            </OprationButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default CallBackModal;
