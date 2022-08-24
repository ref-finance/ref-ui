import React, { useState, useContext, useEffect } from 'react';
import {
  ReturnIcon,
  AddIcon,
  SelectIcon,
  BgIcon,
  SwitchButton,
} from '~components/icon/V3';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import {
  GreenLButton,
  BorderButton,
  GradientButton,
  ButtonTextWrapper,
  BlacklightConnectToNearBtn,
} from '~components/button/Button';
import SelectToken from '~components/forms/SelectToken';
import { useTriTokens, useWhitelistTokens } from '../../state/token';
import { useTriTokenIdsOnRef } from '../../services/aurora/aurora';
import { TokenMetadata } from '../../services/ft-contract';
import { getTokenPriceList } from '../../services/indexer';
import { useTokenBalances } from '../../state/token';
import Loading from '~components/layout/Loading';
import { list_pools, PoolInfo } from '../../services/swapV3';
import _ from 'lodash';

export default function AddYourLiquidityPageV3() {
  const [tokenX, setTokenX] = useState<TokenMetadata>(null);
  const [tokenY, setTokenY] = useState<TokenMetadata>(null);
  const [listPool, setListPool] = useState<PoolInfo[]>([]);
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});
  const [currentPoolMap, setCurrentPoolMap] = useState<Record<string, any>>({});
  const history = useHistory();
  const triTokenIds = useTriTokenIdsOnRef();
  const refTokens = useWhitelistTokens((triTokenIds || []).concat(['aurora']));
  const triTokens = useTriTokens();
  const balances = useTokenBalances();
  useEffect(() => {
    getTokenPriceList().then(setTokenPriceList);
    get_list_pools();
  }, []);
  if (!refTokens || !triTokens || !triTokenIds) return <Loading />;
  const allTokens = getAllTokens(refTokens, triTokens);
  const nearSwapTokens = allTokens.filter((token) => token.onRef);
  function goYourLiquidityPage() {
    history.push('/yoursV3');
  }
  async function get_list_pools() {
    const list: PoolInfo[] = await list_pools();
    if (list.length > 0) {
      console.log('11111111--pool-list', list);
      setListPool(list);
    }
  }
  function searchPool(tokenX: TokenMetadata, tokenY: TokenMetadata) {
    if (listPool.length > 0 && tokenX && tokenY) {
      // TODO pool的tvl怎么获取？
      const availablePools = listPool.filter((pool: PoolInfo) => {
        const { token_x, token_y } = pool;
        if (token_x == tokenX.id && token_y == tokenY.id) return true;
      });
      availablePools.forEach((pool: PoolInfo) => {
        const f = pool.fee;
        currentPoolMap[f] = '25'; // TODO test data
      });
      if (availablePools.length == 0) {
        setCurrentPoolMap(currentPoolMap);
      } else {
        setCurrentPoolMap(currentPoolMap);
      }
      console.log('8888888888', currentPoolMap);
    } else {
      setCurrentPoolMap(currentPoolMap);
    }
  }
  return (
    <div className="relative flex items flex-col lg:w-2/3 xl:w-3/5 md:w-5/6 xs:w-11/12 m-auto text-white rounded-2xl">
      <div
        className="absolute w-full top-0 bottom-0 rounded-2xl"
        style={{
          background:
            'linear-gradient(146.59deg, rgba(0, 255, 209, 0.6) 1.14%, rgba(70, 163, 231, 0) 47.93%, rgba(147, 62, 255, 0.6) 99.25%)',
          filter: 'blur(50px)',
        }}
      ></div>
      <div
        className="relative rounded-2xl z-10 border-4 border-greenColor py-5 px-7"
        style={{
          background: 'linear-gradient(180deg, #26343E 0%, #1D2932 100%)',
        }}
      >
        <div className="relative flex items-center justify-center">
          <ReturnIcon
            className="absolute left-1 cursor-pointer"
            onClick={goYourLiquidityPage}
          ></ReturnIcon>
          <span className="text-v3LightGreyColor text-xl">
            <FormattedMessage id="add_liquidity"></FormattedMessage>
          </span>
        </div>
        <div className="flex items-start justify-between mt-7">
          <div className="w-1/2 mr-7 flex-shrink-0">
            <div className="text-white font-bold text-base">Select Tokens</div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-grow">
                <SelectToken
                  tokenPriceList={tokenPriceList}
                  tokens={nearSwapTokens}
                  standalone
                  selected={
                    <div
                      className={`flex items-center justify-between flex-grow h-12 text-base text-white rounded-xl px-4 cursor-pointer ${
                        tokenX ? 'bg-black bg-opacity-20' : 'bg-primaryGradient'
                      }`}
                    >
                      {tokenX ? (
                        <div className="flex items-center">
                          <img
                            src={tokenX.icon}
                            className="w-8 h-8 rounded-full border border-greenColor"
                          ></img>
                          <span className="text-white text-base font-bold ml-2.5">
                            {tokenX.symbol}
                          </span>
                        </div>
                      ) : (
                        <>Select Token</>
                      )}
                      <SelectIcon></SelectIcon>
                    </div>
                  }
                  onSelect={(token) => {
                    if (tokenY && tokenY.id == token.id) return;
                    setTokenX(token);
                    searchPool(token, tokenY);
                  }}
                  balances={balances}
                />
              </div>
              <AddIcon className="mx-2"></AddIcon>
              <div className="flex flex-grow">
                <SelectToken
                  tokenPriceList={tokenPriceList}
                  tokens={nearSwapTokens}
                  standalone
                  selected={
                    <div
                      className={`flex items-center justify-between flex-grow h-12 text-base text-white rounded-xl px-4 cursor-pointer ${
                        tokenY ? 'bg-black bg-opacity-20' : 'bg-primaryGradient'
                      }`}
                    >
                      {tokenY ? (
                        <div className="flex items-center">
                          <img
                            src={tokenY.icon}
                            className="w-8 h-8 rounded-full border border-greenColor"
                          ></img>
                          <span className="text-white text-base font-bold ml-2.5">
                            {tokenY.symbol}
                          </span>
                        </div>
                      ) : (
                        <>Select Token</>
                      )}
                      <SelectIcon></SelectIcon>
                    </div>
                  }
                  onSelect={(token: TokenMetadata) => {
                    if (tokenX && tokenX.id == token.id) return;
                    setTokenY(token);
                    searchPool(tokenX, token);
                  }}
                  balances={balances}
                />
              </div>
            </div>
            <div
              className="rounded-xl px-4 py-3 mt-5"
              style={{ border: '1.2px solid rgba(145, 162, 174, 0.2)' }}
            >
              <div className="text-white text-base mt-1">Fee Tiers</div>
              <div className="flex items-stretch justify-between mt-5">
                <div className="flex flex-col items-center  rounded-xl w-1 flex-grow px-1 py-3  cursor-pointer mr-2.5 border border-v3feeBorderColor hover:border-greenColor">
                  <span className="text-sm text-white">0.01%</span>
                  <div className="text-v3feeTextColor text-xs text-center mt-2">
                    Best for very stable pairs
                  </div>
                  <div
                    className={`flex items-center justify-center w-full py-1 rounded-xl bg-black bg-opacity-20 text-xs text-v3LightGreyColor mt-2 ${
                      tokenX && tokenY ? '' : 'hidden'
                    }`}
                  >
                    {currentPoolMap[100]
                      ? currentPoolMap[100] + '%' + ' select'
                      : 'No Pool'}
                  </div>
                </div>
                <div className="flex flex-col items-center rounded-xl w-1 flex-grow px-1 py-3  cursor-pointer mr-2.5 border border-v3feeBorderColor hover:border-greenColor">
                  <span className="text-sm text-white">0.04%</span>
                  <div className="text-v3feeTextColor text-xs  text-center mt-2">
                    Best for very stable pairs
                  </div>
                  <div
                    className={`flex items-center justify-center w-full py-1 rounded-xl bg-black bg-opacity-20 text-xs text-v3LightGreyColor mt-2 ${
                      tokenX && tokenY ? '' : 'hidden'
                    }`}
                  >
                    {currentPoolMap[400]
                      ? currentPoolMap[400] + '%' + ' select'
                      : 'No Pool'}
                  </div>
                </div>
                <div className="flex flex-col items-center rounded-xl w-1 flex-grow px-1 py-3 cursor-pointer  mr-2.5 border border-v3feeBorderColor hover:border-greenColor">
                  <span className="text-sm text-white">0.2%</span>
                  <div className="text-v3feeTextColor text-xs  text-center mt-2">
                    Best for very stable pairs
                  </div>
                  <div
                    className={`flex items-center justify-center w-full py-1 rounded-xl bg-black bg-opacity-20 text-xs text-v3LightGreyColor mt-2 ${
                      tokenX && tokenY ? '' : 'hidden'
                    }`}
                  >
                    {currentPoolMap[2000]
                      ? currentPoolMap[2000] + '%' + ' select'
                      : 'No Pool'}
                  </div>
                </div>
                <div className="flex flex-col items-center rounded-xl w-1 flex-grow px-1 py-3  cursor-pointer border border-v3feeBorderColor hover:border-greenColor">
                  <span className="text-sm text-white">1%</span>
                  <div className="text-v3feeTextColor text-xs text-center  mt-2">
                    Best for very stable pairs
                  </div>
                  <div
                    className={`flex items-center justify-center w-full py-1 rounded-xl bg-black bg-opacity-20 text-xs text-v3LightGreyColor mt-2 ${
                      tokenX && tokenY ? '' : 'hidden'
                    }`}
                  >
                    {currentPoolMap[10000]
                      ? currentPoolMap[10000] + '%' + ' select'
                      : 'No Pool'}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-base text-white">Input Amount</span>
              <InputAmount></InputAmount>
              <InputAmount></InputAmount>
            </div>
          </div>
          <div className="flex flex-col justify-between flex-grow self-stretch">
            <div className="text-white font-bold text-base">
              Initialize the pool:
            </div>
            <div className="relative flex-grow bg-black bg-opacity-10 rounded-xl px-4 py-7 mt-3">
              <BgIcon className="absolute right-0 top-0"></BgIcon>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <p className="text-sm text-white">
                    This pool is not initialized before. To initialize, select a
                    starting price for the pool and the enter your liquidity
                    price range and deposit amount.
                  </p>
                  <p className="text-sm text-v3WarningColor mt-1">
                    Gas fees will be higher than usual!
                  </p>
                </div>
                <div>
                  <p className="text-base text-white">Starting Price</p>
                  <div className="flex items-center justify-between mt-3">
                    <span>1 NEAR =</span>
                    <div className="flex items-center justify-between rounded-xl bg-black bg-opacity-20 px-3 h-12">
                      <input
                        type="number"
                        placeholder="0.0"
                        className="text-xl font-bold"
                        onChange={({ target }) => {}}
                      />
                      <span className="text-base text-white ml-3">REF</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3.5">
                    <span className="text-xs text-v3LightGreyColor">
                      Current Price
                    </span>
                    <div className="flex items-center text-xs text-white">
                      1 NEAR = 10.942 REF{' '}
                      <span className="text-v3LightGreyColor">($5.89)</span>{' '}
                      <SwitchButton className="cursor-pointer ml-1.5"></SwitchButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <GradientButton
              color="#fff"
              className={`w-full h-10 mt-5 text-center text-base text-white focus:outline-none`}
              // onClick={goAddLiquidityPage}
            >
              Create a Pool
            </GradientButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputAmount() {
  return (
    <div className="bg-black bg-opacity-10 rounded-xl p-3 mt-3">
      <div className="flex items-center justify-between">
        <input
          type="number"
          placeholder="0.0"
          className="text-2xl"
          onChange={({ target }) => {}}
        />
        <span className="text-base font-bold text-v3feeTextColor ml-5">
          NEAR
        </span>
      </div>
      <div className="flex items-center justify-between mt-2.5 invisible">
        <span className="text-xs text-primaryText">$-</span>
        <div className="flex items-center text-xs text-primaryText">
          <FormattedMessage id="balance" />: 20
          <span
            onClick={() => {
              // changeAmount(loveTokenBalance);
            }}
            className={`ml-2.5 text-xs text-farmText px-1.5 py-0.5 rounded-lg border cursor-pointer hover:text-greenColor hover:border-greenColor ${
              false
                ? 'bg-black bg-opacity-20 border-black border-opacity-20'
                : 'border-maxBorderColor'
            }`}
          >
            Max
          </span>
        </div>
      </div>
    </div>
  );
}
function getAllTokens(refTokens: TokenMetadata[], triTokens: TokenMetadata[]) {
  triTokens.forEach((tk) => {
    const tokenInRef = refTokens.find((token) => token.id === tk.id);
    if (tokenInRef) {
      tokenInRef.onTri = true;
    } else {
      refTokens.push(tk);
    }
  });

  return refTokens;
}
