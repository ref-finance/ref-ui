import React, { useState, useContext, useEffect, useMemo, useRef } from 'react';
import { useHistory } from 'react-router';
import Big from 'big.js';
import { WalletContext } from '../../utils/wallets-integration';
import {
  TRANSACTION_WALLET_TYPE,
  parsedArgs,
} from '../../components/layout/transactionTipPopUp';
import { checkTransaction } from '../../services/swap';
import MarketSeedsBox from './MarketSeedsBox';
import MySeedsBox from './MySeedsBox';
import CallBackModal from './CallBackModal';
import { getMemeDataConfig } from './memeConfig';
import { emptyObject, getSeedsTotalStaked } from './tool';
import { MemeContext } from './context';
import { Seed } from '~src/services/farm';
import { formatPercentage } from '../../utils/uiNumber';
import { Intro } from './Intro';
import { useScrollToTopOnFirstPage } from '../../state/pool';
export interface ITxParams {
  action: 'stake' | 'unstake';
  params: any;
  txHash: string;
  receiver_id: string;
}
const SeedsBox = () => {
  const [tab, setTab] = useState<'market' | 'your'>('market');
  const [isTxHashOpen, setIsTxHashOpen] = useState(false);
  const [txParams, setTxParams] = useState<ITxParams>();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const history = useHistory();
  const { seeds } = useContext(MemeContext);
  const memeDataConfig = getMemeDataConfig();
  const meme_winner_tokens = memeDataConfig.meme_winner_tokens;

  const getURLInfo = () => {
    const search = window.location.search;
    const pathname = window.location.pathname;
    const errorType = new URLSearchParams(search).get('errorType');
    const errorCode = new URLSearchParams(search).get('errorCode');
    const signInErrorType = new URLSearchParams(search).get('signInErrorType');
    const txHashes = (
      new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.NEAR_WALLET) ||
      new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.SENDER_WALLET) ||
      new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.WalletSelector)
    )?.split(',');
    return {
      txHash: txHashes && txHashes.length > 0 ? txHashes[0] : '',
      pathname,
      errorType,
      signInErrorType,
      errorCode,
      txHashes,
    };
  };
  const { txHash } = getURLInfo();
  useEffect(() => {
    if (txHash && isSignedIn) {
      checkTransaction(txHash).then((res: any) => {
        const { transaction, receipts } = res;
        const isNeth =
          transaction?.actions?.[0]?.FunctionCall?.method_name === 'execute';
        const methodNameNeth =
          receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall
            ?.method_name;
        const methodNameNormal =
          transaction?.actions[0]?.FunctionCall?.method_name;
        const args = parsedArgs(
          isNeth
            ? res?.receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall
                ?.args
            : res?.transaction?.actions?.[0]?.FunctionCall?.args || ''
        );
        const receiver_id = transaction?.receiver_id;
        const parsedInputArgs = JSON.parse(args || '');
        const methodName = isNeth ? methodNameNeth : methodNameNormal;
        if (
          methodName == 'unlock_and_unstake_seed' ||
          methodName == 'ft_transfer_call'
        ) {
          setIsTxHashOpen(true);
          setTxParams({
            action:
              methodName == 'unlock_and_unstake_seed' ? 'unstake' : 'stake',
            params: parsedInputArgs,
            txHash,
            receiver_id,
          });
        }
      });
    }
  }, [txHash, isSignedIn]);
  const displaySeeds = useMemo(() => {
    if (emptyObject(seeds)) return {};
    return meme_winner_tokens.reduce(
      (acc, memeTokenId) => ({
        ...acc,
        ...{ [memeTokenId]: seeds[memeTokenId] },
      }),
      {}
    ) as Record<string, Seed>;
  }, [meme_winner_tokens, seeds]);
  const displaySeedsPercent = useMemo(() => {
    const displaySeedsPercent = {};
    if (!emptyObject(displaySeeds)) {
      const totalTvl = getSeedsTotalStaked(displaySeeds);
      Object.entries(displaySeeds).map(([seed_id, seed]) => {
        let percent = '0';
        const seedTvl = seed.seedTvl;
        if (Big(seedTvl).gt(0) && Big(totalTvl).gt(0)) {
          const p = Big(seedTvl).div(totalTvl);
          percent = formatPercentage(p.mul(100).toFixed());
          displaySeedsPercent[seed_id] = percent;
        } else {
          displaySeedsPercent[seed_id] = '0%';
        }
      });
    }
    return displaySeedsPercent;
  }, [displaySeeds]);

  const { currentPage, introRef, hasGuided } = useScrollToTopOnFirstPage(2);
  return (
    <div className="mt-14" ref={introRef}>
      <div className="flex items-center text-2xl gotham_bold gap-12 mb-5 ml-2 xsm:text-xl xsm:mx-3 xsm:gap-0 xsm:border-b xsm:border-memeVoteBorderColor">
        {!hasGuided && currentPage === 2 && (
          <div className="relative">
            <Intro top={-280} left={-10}></Intro>
          </div>
        )}
        <div
          className={` py-2 px-5 cursor-pointer xsm:w-1/2 xsm:text-center ${
            tab === 'market'
              ? `text-white border-b-4 ${
                  isSignedIn ? 'border-white' : 'border-transparent'
                }`
              : 'border-b-4 text-primaryText border-transparent'
          }`}
          onClick={() => {
            setTab('market');
          }}
        >
          Feed Meme
        </div>
        <div
          className={`py-2 border-b-4  px-5 cursor-pointer xsm:w-1/2 xsm:text-center ${
            isSignedIn ? '' : 'hidden'
          } ${
            tab === 'your'
              ? 'text-white border-white'
              : 'text-primaryText border-transparent'
          }`}
          onClick={() => {
            setTab('your');
          }}
        >
          Yours
        </div>
      </div>
      <MarketSeedsBox
        hidden={tab === 'market' ? false : true}
        displaySeedsPercent={displaySeedsPercent}
      />
      <MySeedsBox
        hidden={tab === 'your' ? false : true}
        displaySeedsPercent={displaySeedsPercent}
      />
      {isTxHashOpen && txParams ? (
        <CallBackModal
          isOpen={isTxHashOpen}
          onRequestClose={() => {
            setIsTxHashOpen(false);
            history.replace('/meme');
          }}
          txParams={txParams}
        />
      ) : null}
    </div>
  );
};
export default SeedsBox;
