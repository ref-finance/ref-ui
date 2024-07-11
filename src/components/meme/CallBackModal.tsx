import React, { useContext, useMemo } from 'react';
import Big from 'big.js';
import { OprationButton } from '../../components/button/Button';
import { isMobile } from '../../utils/device';
import { ModalCloseIcon, ArrowRightIcon } from './icons';
import Modal from 'react-modal';
import { MemeContext } from './context';
import { ITxParams } from './SeedsBox';
import { getListedMemeSeeds } from './tool';
import { toReadableNumber } from '../../utils/numbers';
import {
  formatWithCommas_number,
  formatPercentage,
} from '../../utils/uiNumber';
import { openUrl } from '../../services/commonV3';
import getConfig from '../../services/config';
import { useHistory } from 'react-router';
import { getMemeUiConfig, getMemeContractConfig } from './memeConfig';
const progressConfig = getMemeUiConfig();
function CallBackModal(props: any) {
  const { seeds, xrefTokenId, tokenPriceList, allTokenMetadatas } =
    useContext(MemeContext);
  const {
    isOpen,
    onRequestClose,
    txParams,
  }: { isOpen: boolean; onRequestClose: any; txParams: ITxParams } = props;
  const history = useHistory();
  const cardWidth = isMobile() ? '95vw' : '28vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';
  const [seed, amount, metadata, isXrefAction] = useMemo(() => {
    const { action, receiver_id, params } = txParams;
    const { XREF_MEME_FARM_CONTRACT_IDS } = getMemeContractConfig();
    const isXrefAction =
      action == 'stake'
        ? receiver_id === xrefTokenId
        : XREF_MEME_FARM_CONTRACT_IDS.includes(receiver_id);
    const metadata =
      action == 'stake'
        ? allTokenMetadatas[receiver_id]
        : isXrefAction
        ? allTokenMetadatas[xrefTokenId]
        : seeds?.[params.seed_id]?.token_meta_data;
    if (action == 'stake') {
      const seed = seeds[receiver_id];
      return [
        seed,
        toReadableNumber(metadata?.decimals || 0, txParams.params.amount),
        metadata,
        isXrefAction,
      ];
    } else {
      const seed = seeds[params.seed_id];
      return [
        seed,
        toReadableNumber(
          metadata?.decimals || 0,
          txParams.params.unstake_amount
        ),
        metadata,
        isXrefAction,
      ];
    }
  }, [seeds, txParams, allTokenMetadatas]);
  const [weightFrom, weightTo] = useMemo(() => {
    const { action } = txParams;
    const listedSeeds = getListedMemeSeeds(seeds);
    const totalTvl = Object.entries(listedSeeds).reduce((acc, [, seed]) => {
      return acc.plus(seed?.seedTvl || 0);
    }, Big(0));
    const seedTvl = seed?.seedTvl || 0;
    const actionTvl = Big(amount || 0).mul(
      tokenPriceList[seed?.seed_id]?.price || 0
    );
    let from;
    const to = totalTvl.gt(0) ? Big(seedTvl).div(totalTvl).mul(100) : Big(0);
    if (action == 'stake') {
      from = totalTvl.minus(actionTvl).gt(0)
        ? Big(seedTvl).minus(actionTvl).div(totalTvl.minus(actionTvl)).mul(100)
        : Big(0);
    } else {
      from = totalTvl.plus(actionTvl).gt(0)
        ? Big(seedTvl).plus(actionTvl).div(totalTvl.plus(actionTvl)).mul(100)
        : Big(0);
    }
    return [from.toFixed(), to.toFixed()];
  }, [amount, seeds, txParams, seed]);

  if (!seed && !isXrefAction) return null;
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
                src={metadata?.icon}
                style={{ width: '86px', height: '86px' }}
                className="rounded-full"
              />
              <div className="flex flex-col items-center">
                {txParams?.action == 'stake' ? (
                  <span className="text-2xl text-white gotham_bold text-center">
                    {isXrefAction
                      ? metadata?.symbol + ' Staked'
                      : progressConfig.progress[seed?.seed_id]?.stakeTip}
                  </span>
                ) : (
                  <span className="text-2xl text-white gotham_bold text-center">
                    {metadata?.symbol} Unstaked
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-center text-sm text-white mt-6 text-center">
              You have just {txParams.action == 'stake' ? 'feed' : 'unstake'}{' '}
              {formatWithCommas_number(amount)} {metadata?.symbol}{' '}
            </div>
            {isXrefAction ? null : (
              <div className="flex justify-center text-sm text-white mt-3">
                Gauge Weight
                <div className="flex items-center text-sm text-white gap-2 ml-3">
                  <span className="line-through">
                    {formatPercentage(weightFrom)}
                  </span>
                  <ArrowRightIcon />
                  <span>{formatPercentage(weightTo)}</span>
                </div>
              </div>
            )}

            <OprationButton
              minWidth="7rem"
              onClick={goNearblocks}
              className={`flex flex-grow items-center justify-center border border-purple border-opacity-20  text-white mt-12 rounded-xl h-12 text-base gotham_bold focus:outline-none`}
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
