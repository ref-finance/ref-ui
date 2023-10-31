import React, { useEffect, useState, useContext } from 'react';
import Modal from 'react-modal';
import { FormattedMessage } from 'react-intl';
import { PoolInfo } from 'src/services/swapV3';
import { UserLiquidityInfo } from 'src/services/commonV3';
import { Seed } from '../../../../services/farm';
import _ from 'lodash';
import { YourLiquidityBox } from './YourLiquidityBox';
import { UnclaimedFeesBox } from './UnclaimedFeesBox';
import { NoYourLiquditiesBox } from './NoYourLiquditiesBox';
import { GradientButton } from 'src/components/button/Button';
import { WalletContext } from '../../../../utils/wallets-integration';

export function UserButtonBox(props: {
  poolDetail: PoolInfo;
  liquidities: UserLiquidityInfo[];
  tokenPriceList: any;
  matched_seeds: Seed[];
}) {
  const { poolDetail, liquidities, tokenPriceList, matched_seeds } = props;
  const [show, setShow] = useState<boolean>(false);
  const [tab, setTab] = useState<number>();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  if (!isSignedIn) return null;
  return (
    <>
      <UserTabBox
        poolDetail={poolDetail}
        tokenPriceList={tokenPriceList}
        liquidities={liquidities}
        matched_seeds={matched_seeds}
        show={show}
        tab={tab}
        setTab={setTab}
        setShow={setShow}
      />
      <div
        className={`fixed flex items-center gap-2.5  bottom-8 left-0 w-full bg-cardBg border-t border-bottomBoxBorderColor rounded-t-2xl px-2.5 py-4 z-50 ${
          show ? 'hidden' : ''
        }`}
      >
        <GradientButton
          onClick={(e) => {
            setShow(true);
            setTab(1);
          }}
          color="#fff"
          borderRadius={'8px'}
          className={`flex-grow w-1 h-10 text-center text-sm text-white focus:outline-none mr-2.5`}
        >
          You Liquidity
        </GradientButton>
        <div
          className={`flex items-center flex-grow w-1 h-10 font-gothamBold justify-center rounded-lg text-sm  bg-deepBlue hover:bg-deepBlueHover text-white cursor-pointer`}
          style={{
            background: 'linear-gradient(180deg, #646DF4 0%, #371BE4 100%)',
          }}
          onClick={(e) => {
            setShow(true);
            setTab(2);
          }}
        >
          Unclaimed Fees
        </div>
      </div>
    </>
  );
}
function UserTabBox(props: {
  poolDetail: PoolInfo;
  liquidities: UserLiquidityInfo[];
  tokenPriceList: any;
  matched_seeds: Seed[];
  show: boolean;
  setShow: Function;
  tab: number;
  setTab: Function;
}) {
  const {
    poolDetail,
    liquidities,
    tokenPriceList,
    matched_seeds,
    show,
    setShow,
    tab,
    setTab,
  } = props;
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  function switchTab(tabIndex: number) {
    setTab(tabIndex);
  }
  function onRequestClose() {
    setShow(false);
  }
  const no_data = !isSignedIn || (liquidities && liquidities.length == 0);

  return (
    <Modal
      isOpen={show}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          overflow: 'auto',
        },
        content: {
          outline: 'none',
          top: 'auto',
          left: 'auto',
          transform: 'none',
          bottom: '32px',
          width: '100%',
        },
      }}
    >
      <div
        className={`p-5 bg-cardBg rounded-xl w-full border border-bottomBoxBorderColor ${
          show ? '' : 'hidden'
        }`}
      >
        <div className="flex items-center justify-between border-b border-menuMoreBoxBorderColor -mx-5 px-5">
          <div
            className="flex flex-col items-center w-1 flex-grow mr-3"
            onClick={() => {
              switchTab(1);
            }}
          >
            <span
              className={`text-base ${
                tab == 1 ? 'text-white' : 'text-primaryText'
              }`}
            >
              <FormattedMessage id="your_liquidity" />
            </span>
            <label
              className={`bg-senderHot w-full rounded-full h-1 mt-3 ${
                tab == 1 ? 'bg-opacity-100' : 'bg-opacity-0'
              }`}
            ></label>
          </div>
          <div
            className="flex flex-col items-center w-1 flex-grow"
            onClick={() => {
              switchTab(2);
            }}
          >
            <span
              className={`text-base ${
                tab == 2 ? 'text-white' : 'text-primaryText'
              }`}
            >
              <FormattedMessage id="unclaimed_fees" />
            </span>
            <label
              className={`bg-senderHot w-full rounded-full h-1 mt-3 ${
                tab == 2 ? 'bg-opacity-100' : 'bg-opacity-0'
              }`}
            ></label>
          </div>
        </div>
        {no_data ? (
          <NoYourLiquditiesBox poolDetail={poolDetail} />
        ) : (
          <>
            {tab == 1 ? (
              <YourLiquidityBox
                poolDetail={poolDetail}
                tokenPriceList={tokenPriceList}
                liquidities={liquidities}
                matched_seeds={matched_seeds}
              ></YourLiquidityBox>
            ) : (
              <UnclaimedFeesBox
                poolDetail={poolDetail}
                tokenPriceList={tokenPriceList}
                liquidities={liquidities}
              ></UnclaimedFeesBox>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
