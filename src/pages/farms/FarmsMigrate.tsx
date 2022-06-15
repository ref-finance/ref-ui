import React, { useEffect, useRef, useState, useContext } from 'react';
import Modal from 'react-modal';
import { Card } from '~components/card/Card';
import Alert from '~components/alert/Alert';
import TipsBox from '~components/farm/TipsBox';
import CalcModel, { CalcEle, LinkPool } from '~components/farm/CalcModel';
import UnClaim from '~components/farm/UnClaim';
import QuestionMark from '~components/farm/QuestionMark';
import SelectUi from '~components/farm/SelectUi';
import {
  FarmMiningIcon,
  ModalClose,
  Dots,
  Light,
  Calc,
  ArrowDownHollow,
  Checkbox,
  CheckboxSelected,
  CoinPropertyIcon,
  SortIcon,
  NoDataIcon,
  LightSmall,
} from '~components/icon';
import {
  GreenLButton,
  BorderButton,
  GradientButton,
  ButtonTextWrapper,
} from '~components/button/Button';
import {
  getFarms,
  claimRewardByFarm,
  FarmInfo,
  getFarmInfo,
  getStakedListByAccountId,
  getRewards,
  getSeeds,
  DEFAULT_PAGE_LIMIT,
  claimRewardBySeed,
  getAllSinglePriceByTokenIds,
  classificationOfCoins,
  classificationOfCoins_key,
  incentiveLpTokenConfig,
  defaultConfig,
  frontConfig,
  get_seed_info,
  get_list_user_seeds,
  getBoostSeeds,
} from '~services/farm';
import {
  stake,
  unstake,
  LP_TOKEN_DECIMALS,
  withdrawAllReward,
  LP_STABLE_TOKEN_DECIMALS,
} from '~services/m-token';
import {
  formatWithCommas,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
  percentLess,
  calculateFairShare,
  toNonDivisibleNumber,
  percent,
} from '~utils/numbers';
import {
  ArrowLeftIcon,
  FreeIcon,
  LockIcon,
  LightningIcon,
  BigLightningIcon,
  GoldLevel1,
  GoldLevel2,
  GoldLevel3,
  GoldLevel4,
  LockedIcon,
  UnLockedIcon,
  CalcIcon,
  LockImgIcon,
  FreenWarningIcon,
  MigrateIcon,
} from '~components/icon/FarmBoost';
import { mftGetBalance } from '~services/mft-contract';
import { wallet } from '~services/near';
import Loading, { BeatLoading } from '~components/layout/Loading';
import { ConnectToNearBtn } from '~components/button/Button';
import { useTokens } from '~state/token';
import { Info } from '~components/icon/Info';
import ReactTooltip from 'react-tooltip';
import { getMftTokenId, toRealSymbol } from '~utils/token';
import ReactModal from 'react-modal';
import { isMobile } from '~utils/device';
import ClipLoader from 'react-spinners/ClipLoader';
import { ftGetTokenMetadata, TokenMetadata } from '~services/ft-contract';
import { getTokenPriceList } from '~services/indexer';
import Countdown, { zeroPad } from 'react-countdown';
import moment from 'moment';
import { Link, useHistory, useLocation } from 'react-router-dom';
import _ from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import { FaArrowCircleRight, FaRegQuestionCircle } from 'react-icons/fa';
import OldInputAmount from '~components/forms/OldInputAmount';
import { BigNumber } from 'bignumber.js';
import getConfig from '~services/config';
import { getCurrentWallet, WalletContext } from '../../utils/sender-wallet';

const config = getConfig();
const STABLE_POOL_IDS = config.STABLE_POOL_IDS;
const XREF_TOKEN_ID = config.XREF_TOKEN_ID;
const REF_TOKEN_ID = config.REF_TOKEN_ID;
const DECIMALS_XREF_REF_TRANSTER = 8;

function WithdrawView({
  data,
  tokenPriceList,
  updateCheckList,
  checkedList,
  index,
}: {
  data: any;
  tokenPriceList: any;
  updateCheckList: any;
  checkedList: any;
  index: number;
}) {
  const [token, setToken] = useState<TokenMetadata>();
  const [checkStatus, setCheckStatus] = useState(false);
  const [priceData, setPriceData] = useState<Record<string, any>>({});
  useEffect(() => {
    ftGetTokenMetadata(data[0]).then((token) => {
      setToken(token);
      const { id } = token;
      const price = tokenPriceList && tokenPriceList[id]?.price;
      let resultTotalPrice = '0';
      if (price) {
        const totalPrice = new BigNumber(price).multipliedBy(
          toReadableNumber(token.decimals, data[1])
        );
        if (new BigNumber('0.01').isGreaterThan(totalPrice)) {
          resultTotalPrice = '<$0.01';
        } else {
          resultTotalPrice = `$${toInternationalCurrencySystem(
            totalPrice.toString(),
            2
          )}`;
        }
        let displayPrice;
        if (new BigNumber('0.01').isGreaterThan(price)) {
          displayPrice = '<$0.01';
        } else {
          displayPrice = `$${toInternationalCurrencySystem(
            price.toString(),
            2
          )}`;
        }
        setPriceData({
          price: displayPrice,
          totalPrice: resultTotalPrice,
        });
      }
    });
  }, [data]);
  useEffect(() => {
    setCheckStatus(!!checkedList[data[0]]);
  }, [Object.keys(checkedList)]);
  if (!token) return null;
  function changeStatus() {
    updateCheckList(!checkStatus, data, index);
  }
  function getTokenNumber() {
    const tokenNumber = toReadableNumber(token.decimals, data[1]);
    let resultDisplay = '';
    if (new BigNumber('0.001').isGreaterThan(tokenNumber)) {
      resultDisplay = '<0.001';
    } else {
      resultDisplay = formatWithCommas(
        new BigNumber(tokenNumber).toFixed(3, 1).toString()
      );
    }
    return resultDisplay;
  }
  return (
    <div key={data.farm_id}>
      <div className="flex justify-between py-3.5">
        <div className="flex items-center text-sm text-white">
          <div className="mr-3" onClick={changeStatus}>
            {checkStatus ? (
              <CheckboxSelected></CheckboxSelected>
            ) : (
              <Checkbox></Checkbox>
            )}
          </div>
          <img src={token.icon} className="w-8 h-8 rounded-full mr-2" />
          <div className="flex flex-col">
            <label className="text-sm text-white">
              {toRealSymbol(token.symbol)}
            </label>
            <label className="text-primaryText text-xs">
              {priceData.price || '$-'}
            </label>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <label className="text-sm text-white">{getTokenNumber()}</label>
          <label className="text-primaryText text-xs">
            {priceData.totalPrice || '$-'}
          </label>
        </div>
      </div>
    </div>
  );
}
export default function FarmsMigrate() {
  debugger;
  const [user_migrate_seeds, set_user_migrate_seeds] = useState();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const history = useHistory();
  const goBacktoFarms = () => {
    history.push('/farms');
  };
  useEffect(() => {
    if (isSignedIn) {
      get_user_seeds();
      get_user_claimed_rewards();
    }
  }, []);

  async function get_user_seeds() {
    if (isSignedIn) {
      const result_old = await get_list_user_seeds({});
      const result_new = await getBoostSeeds();
      // debugger;
      // console.log('77777777');
    }
  }
  async function get_user_claimed_rewards() {
    await getRewards({});
  }

  return (
    <div className={`m-auto lg:w-580px md:w-5/6 xs:w-11/12 xs:-mt-4 md:-mt-4`}>
      <div className="breadCrumbs flex items-center text-farmText text-base hover:text-white">
        <ArrowLeftIcon onClick={goBacktoFarms} className="cursor-pointer" />
        <label className="cursor-pointer" onClick={goBacktoFarms}>
          <FormattedMessage id="farms" />
        </label>
      </div>
      <div className="instruction flex justify-between items-center mt-10">
        <MigrateIcon className="flex-shrink-0 mr-4"></MigrateIcon>
        <div>
          <span className="text-2xl font-bold text-lightGreenColor">
            V2 New Farm Migration
          </span>
          <p className="text-base text-white mt-4">
            V2 Farm will support boost farm for the LOVE token stakers.
            Meanwhile, the V1 farm rewards will stop at 1. July,2022. Please
            migrate your farms and withdraw your rewards.
          </p>
        </div>
      </div>
      <div className="bg-cardBg rounded-2xl p-5 mt-8">123</div>
      <div className="bg-cardBg rounded-2xl p-5 mt-3">446</div>
    </div>
  );
}
