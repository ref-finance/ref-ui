import React, { useEffect, useState, useContext } from 'react';
import Modal from 'react-modal';
import { ModalCloseIcon } from './icons';
import { SuccessIcon } from './icons2';
import { isMobile } from '../../utils/device';
import { IReward, IUiReward } from '../../interface/meme';
import { ftGetTokenMetadata, TokenMetadata } from '../../services/ft-contract';
import { toReadableNumber } from '../../utils/numbers';
import { toInternationalCurrencySystem_number } from '../../utils/uiNumber';
import { useHistory } from 'react-router-dom';
import { MemeContext } from '../../components/meme/context';

const CheckInSuccessModal = () => {
  const [list, setList] = useState<IUiReward[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const memeContext = useContext(MemeContext);
  const history = useHistory();
  const earnRewards = memeContext.earnRewards;
  const is_mobile = isMobile();
  const w = is_mobile ? 'auto' : '300px';
  useEffect(() => {
    if (earnRewards.length > 0) {
      getRewards();
    }
  }, [JSON.stringify(earnRewards || [])]);
  async function getRewards() {
    const tokenMetadatas = earnRewards.map((reward: IReward) =>
      ftGetTokenMetadata(reward.token_id)
    );
    const metadatasResolved = (await Promise.all(
      tokenMetadatas
    )) as TokenMetadata[];
    const list = metadatasResolved.map((meta, index) => {
      return {
        meta,
        amount: toReadableNumber(meta.decimals, earnRewards[index].amount),
      };
    });
    setList(list);
  }
  function onRequestClose() {
    setIsOpen(false);
    history.replace('/meme');
  }
  if (list.length == 0) return null;
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
        <div className="flex items-center justify-end">
          <ModalCloseIcon className="cursor-pointer" onClick={onRequestClose} />
        </div>
        <div className="flex flex-col items-center gap-2.5 mt-4">
          <SuccessIcon />
          <div className="flex items-center justify-center text-base text-white whitespace-nowrap">
            Check-In successfully!
          </div>
          <div className="border border-inputV3BorderColor bg-black bg-opacity-20 rounded-md p-4 mt-4">
            <div className="text-sm text-primaryOrderly mb-3 whitespace-nowrap">
              Wonderful！You‘ve earned：
            </div>
            <div className="flex flex-col gap-3">
              {list.map(({ meta, amount }: IUiReward) => {
                return (
                  <div className="flex items-center gap-1.5" key={meta.id}>
                    <img src={meta.icon} className="w-5 h-5 rounded-full" />
                    <div className="flex items-center justify-between text-sm text-white gap-1.5">
                      <span>
                        {toInternationalCurrencySystem_number(amount)}
                      </span>
                      <span>{meta.symbol}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CheckInSuccessModal;
