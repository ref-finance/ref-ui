import React, { useEffect, useState } from 'react';
import { FiChevronDown } from '../reactIcons';
import {
  CircleIcon,
  AddButtonIcon,
  MoreButtonIcon,
  CircleIconLarge,
  SelectedButtonIcon,
  SetButtonIcon,
  ReturnArrowButtonIcon,
  DeleteButtonIcon,
} from 'src/components/icon/Common';
import { getExtendConfig, getCustomConfig } from 'src/services/config';
import { isMobile } from 'src/utils/device';
import Modal from 'react-modal';
import { ModalClose, Checkbox, CheckboxSelected } from 'src/components/icon';
import { BeatLoading } from 'src/components/layout/Loading';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  GradientButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
const MAXELOADTIMES = 3;
const RpcList = () => {
  const rpclist = getRpcList();
  const [hover, setHover] = useState(false);
  const [hoverSet, setHoverSet] = useState(false);
  const [responseTimeList, setResponseTimeList] = useState({});
  const [modalCustomVisible, setModalCustomVisible] = useState(false);
  let currentEndPoint = localStorage.getItem('endPoint') || 'defaultRpc';
  if (!rpclist[currentEndPoint]) {
    currentEndPoint = 'defaultRpc';
    localStorage.removeItem('endPoint');
  }
  useEffect(() => {
    Object.entries(rpclist).forEach(([key, data]) => {
      ping(data.url, key).then((time) => {
        responseTimeList[key] = time;
        setResponseTimeList(Object.assign({}, responseTimeList));
      });
    });
    window.addEventListener('storage', (e) => {
      if (e.key == 'customRpcList') {
        localStorage.setItem(e.key, e.oldValue); //restore
      }
    });
  }, []);
  function updateResponseTimeList(data: any) {
    const { key, responseTime, isDelete } = data;
    if (isDelete) {
      // delete
      delete responseTimeList[key];
      setResponseTimeList(Object.assign({}, responseTimeList));
    } else {
      // add
      responseTimeList[key] = responseTime;
      setResponseTimeList(Object.assign({}, responseTimeList));
    }
  }
  function addCustomNetwork() {
    setModalCustomVisible(true);
  }
  const minWidth = '180px';
  const maxWith = '230px';
  const mobile = isMobile();
  const prd = isPrd();
  return (
    <>
      {mobile ? (
        <div
          style={{
            zIndex: 999999,
            boxShadow: '0px 0px 10px 10px rgba(0, 0, 0, 0.15)',
          }}
          className="fixed bottom-0 left-0 w-full h-8 bg-cardBg mt-3"
        >
          <div
            className="flex items-center w-full h-full justify-between"
            onClick={addCustomNetwork}
          >
            <div
              className={`flex items-center justify-between w-full flex-grow px-16`}
            >
              <div className="flex items-center w-3/4">
                <label className="text-xs text-primaryText mr-5">RPC</label>
                <label className="text-xs text-primaryText cursor-pointer pr-5 whitespace-nowrap overflow-hidden overflow-ellipsis">
                  {rpclist[currentEndPoint].simpleName}
                </label>
              </div>
              <div className="flex items-center">
                {displayCurrentRpc(responseTimeList, currentEndPoint)}
                <FiChevronDown
                  className={`text-primaryText transform rotate-180 cursor-pointer`}
                ></FiChevronDown>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{ zIndex: 99998 }}
            className="flex items-end fixed right-8 bottom-0"
          >
            <div
              onMouseEnter={() => {
                setHover(true);
              }}
              onMouseLeave={() => {
                setHover(false);
              }}
              className="relative"
            >
              <div className="pt-3">
                <div
                  className="flex items-center justify-between px-2  bg-darkGradientHoverBg rounded cursor-pointer"
                  style={{
                    minWidth: minWidth,
                    maxWidth: maxWith,
                    boxShadow: '0px 0px 10px 10px rgba(0, 0, 0, 0.15)',
                    height: '25px',
                  }}
                >
                  <div className="flex items-center w-2/3">
                    <label className="text-xs w-full text-primaryText cursor-pointer pr-3 whitespace-nowrap overflow-hidden overflow-ellipsis">
                      {rpclist[currentEndPoint].simpleName}
                    </label>
                  </div>
                  <div className="flex items-center">
                    {displayCurrentRpc(responseTimeList, currentEndPoint)}
                    <FiChevronDown
                      className={`text-primaryText transform rotate-180 cursor-pointer ${
                        hover ? 'text-greenColor' : ''
                      }`}
                    ></FiChevronDown>
                  </div>
                </div>
              </div>
              <div
                className={`absolute py-2 bottom-8 flex flex-col w-full bg-cardBg rounded ${
                  hover ? '' : 'hidden'
                }`}
                style={{ boxShadow: '0px 0px 10px 10px rgba(0, 0, 0, 0.15)' }}
              >
                {Object.entries(rpclist).map(([key, data]) => {
                  return (
                    <div
                      key={key}
                      className={`flex items-center px-2 py-1 justify-between text-primaryText hover:bg-navHighLightBg  hover:text-white ${
                        currentEndPoint == key ? 'bg-navHighLightBg' : ''
                      }`}
                      style={{ minWidth: minWidth, maxWidth: maxWith }}
                      onClick={() => {
                        switchPoint(key);
                      }}
                    >
                      <label
                        className={`text-xs pr-5 whitespace-nowrap overflow-hidden overflow-ellipsis ${
                          responseTimeList[key] && responseTimeList[key] != -1
                            ? 'cursor-pointer'
                            : 'cursor-pointer'
                        }`}
                      >
                        {data.simpleName}
                      </label>
                      <div className={`flex items-center`}>
                        {displayCurrentRpc(responseTimeList, key)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              onMouseEnter={() => {
                setHoverSet(true);
              }}
              onMouseLeave={() => {
                setHoverSet(false);
              }}
              onClick={addCustomNetwork}
              style={{ height: '25px' }}
              className="flex items-center bg-darkGradientHoverBg rounded  cursor-pointer ml-0.5 px-2 "
            >
              <MoreButtonIcon
                className={`text-primaryText ${
                  hoverSet ? 'text-greenColor' : ''
                }`}
              ></MoreButtonIcon>
            </div>
          </div>
        </>
      )}
      <ModalAddCustomNetWork
        isOpen={modalCustomVisible}
        onRequestClose={() => {
          setModalCustomVisible(false);
        }}
        updateResponseTimeList={updateResponseTimeList}
        currentEndPoint={currentEndPoint}
        responseTimeList={responseTimeList}
        rpclist={rpclist}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            zIndex: '999999',
          },
          content: {
            outline: 'none',
            transform: 'translate(-50%, -50%)',
          },
        }}
      ></ModalAddCustomNetWork>
    </>
  );
};

const ModalBox = (props: any) => {
  const { rpclist, responseTimeList, currentEndPoint, ...rest } = props;
  const [selectCheckbox, setSelectCheckbox] = useState(currentEndPoint);
  return (
    <Modal {...rest}>
      <div
        className="px-5 py-3.5 text-white bg-cardBg border border-gradientFrom border-opacity-50 rounded-lg"
        style={{ width: '90vw' }}
      >
        <div className="flex items-center justify-between mb-2">
          <label className="text-base text-white font-semibold ">RPC</label>
          <span
            onClick={() => {
              props.onRequestClose();
            }}
          >
            <ModalClose></ModalClose>
          </span>
        </div>
        <div>
          {Object.entries(rpclist).map(([key, data]: any) => {
            return (
              <div
                key={key}
                className={`flex items-center py-3 justify-between text-primaryText`}
              >
                <label
                  className={`text-sm pr-5 whitespace-nowrap overflow-hidden overflow-ellipsis cursor-pointer`}
                >
                  {data.simpleName}
                </label>
                <div className={`flex items-center`}>
                  {displayCurrentRpc(responseTimeList, key)}
                  {selectCheckbox == key ? (
                    <CheckboxSelected />
                  ) : (
                    <span
                      onClick={() => {
                        setSelectCheckbox(key);
                        switchPoint(key);
                      }}
                    >
                      <Checkbox />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

const switchPoint = (chooseEndPoint: string) => {
  localStorage.setItem('endPoint', chooseEndPoint);
  window.location.reload();
};
const displayCurrentRpc = (
  responseTimeList: any,
  key: any,
  inBox?: boolean
) => {
  if (responseTimeList[key] == -1) {
    return (
      <>
        <span className={`cursor-pointer text-error`}>
          {inBox ? (
            <CircleIconLarge></CircleIconLarge>
          ) : (
            <CircleIcon></CircleIcon>
          )}
        </span>
        <label className="text-xs ml-1.5 mr-2.5 cursor-pointer text-error whitespace-nowrap">
          time out
        </label>
      </>
    );
  } else if (responseTimeList[key]) {
    return (
      <>
        <span className="cursor-pointer text-darkGreenColor">
          {inBox ? (
            <CircleIconLarge></CircleIconLarge>
          ) : (
            <CircleIcon></CircleIcon>
          )}
        </span>
        <label className="text-xs text-primaryText ml-1.5 mr-2.5 cursor-pointer whitespace-nowrap">
          {responseTimeList[key]}ms
        </label>
      </>
    );
  } else {
    return (
      <label className="mr-2.5 whitespace-nowrap">
        <BeatLoading />
      </label>
    );
  }
};
const specialRpcs: string[] = [
  'https://near-mainnet.infura.io/v3',
  'https://gynn.io',
];
const ModalAddCustomNetWork = (props: any) => {
  const { rpclist, currentEndPoint, responseTimeList, onRequestClose, isOpen } =
    props;
  const [customLoading, setCustomLoading] = useState(false);
  const [customRpcName, setCustomRpcName] = useState('');
  const [customRpUrl, setCustomRpUrl] = useState('');
  const [customShow, setCustomShow] = useState(false);
  const [unavailableError, setUnavailableError] = useState(false);
  const [testnetError, setTestnetError] = useState(false);
  const [notSupportTestnetError, setNotSupportTestnetError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [isInEditStatus, setIsInEditStatus] = useState(false);
  const cardWidth = isMobile() ? '90vw' : '400px';
  const cardHeight = isMobile() ? '40vh' : '400px';
  useEffect(() => {
    hideCustomNetWork();
  }, [isOpen]);
  async function addCustomNetWork() {
    setCustomLoading(true);
    const rpcMap = getRpcList();
    // check if has same url and same name
    const fondItem = Object.values(rpcMap).find((item) => {
      if (trimStr(item['simpleName']) == trimStr(customRpcName)) {
        return true;
      }
    });
    if (fondItem) {
      setNameError(true);
      setCustomLoading(false);
      return;
    }
    // check network
    let responseTime;
    // special check
    if (checkContain(customRpUrl)) {
      const { status, responseTime: responseTime_gas } = await ping_gas(
        customRpUrl
      );
      if (!status) {
        setUnavailableError(true);
        setCustomLoading(false);
        return;
      }
      responseTime = responseTime_gas;
    } else {
      // common check
      const {
        status,
        responseTime: responseTime_status,
        chain_id,
      } = await pingChain(customRpUrl);
      responseTime = responseTime_status;
      if (!status) {
        setUnavailableError(true);
        setCustomLoading(false);
        return;
      }
      if (status && chain_id == 'testnet') {
        setTestnetError(true);
        setCustomLoading(false);
        return;
      }
    }
    // do not support testnet
    const env = process.env.REACT_APP_NEAR_ENV;
    if (env == 'testnet' || env == 'pub-testnet') {
      setNotSupportTestnetError(true);
      setCustomLoading(false);
      return;
    }
    const customRpcMap = getCustomConfig();
    const key = 'custom' + Object.keys(customRpcMap).length + 1;
    customRpcMap[key] = {
      url: customRpUrl,
      simpleName: trimStr(customRpcName),
      custom: true,
    };

    localStorage.setItem('customRpcList', JSON.stringify(customRpcMap));
    setCustomLoading(false);
    props.updateResponseTimeList({
      key,
      responseTime,
    });
    setCustomShow(false);
  }
  function checkContain(url: string) {
    const res = specialRpcs.find((rpc: string) => {
      if (url.indexOf(rpc) > -1) return true;
    });
    return !!res;
  }
  function changeNetName(v: string) {
    setNameError(false);
    setCustomRpcName(v);
  }
  function changeNetUrl(v: string) {
    setUnavailableError(false);
    setTestnetError(false);
    setCustomRpUrl(v);
  }
  function showCustomNetWork() {
    setCustomShow(true);
    initData();
  }
  function hideCustomNetWork() {
    setCustomShow(false);
    initData();
  }
  function closeModal() {
    setCustomShow(false);
    initData();
    onRequestClose();
  }
  function switchEditStatus() {
    setIsInEditStatus(!isInEditStatus);
  }
  function deleteCustomNetwork(key: string) {
    const customMap = getCustomConfig();
    delete customMap[key];
    localStorage.setItem('customRpcList', JSON.stringify(customMap));
    if (key == currentEndPoint) {
      window.location.reload();
    } else {
      props.updateResponseTimeList({
        key,
        isDelete: true,
      });
      if (Object.keys(customMap).length == 0) {
        setIsInEditStatus(false);
      }
    }
  }
  function initData() {
    setCustomRpcName('');
    setCustomRpUrl('');
    setTestnetError(false);
    setNameError(false);
    setUnavailableError(false);
    setIsInEditStatus(false);
    setNotSupportTestnetError(false);
  }
  const submitStatus =
    trimStr(customRpcName) &&
    trimStr(customRpUrl) &&
    !unavailableError &&
    !nameError &&
    !testnetError;
  return (
    <Modal {...props}>
      <div className="relative flex items-center justify-center">
        <div
          className="absolute top-0 bottom-0"
          style={{
            background:
              'linear-gradient(146.59deg, rgba(0, 255, 209, 0.6) 1.14%, rgba(147, 62, 255, 0.6) 99.25%)',
            filter: 'blur(50px)',
            width: cardWidth,
          }}
        ></div>
        <div
          className="relative z-10 px-4 py-7 text-white bg-cardBg border border-gradientFrom border-opacity-50 rounded-lg"
          style={{
            width: cardWidth,
          }}
        >
          {customShow ? (
            <div>
              <div className="flex items-center justify-between text-xl text-white">
                <div className="flex items-center">
                  <ReturnArrowButtonIcon
                    className="mr-3 cursor-pointer"
                    onClick={hideCustomNetWork}
                  ></ReturnArrowButtonIcon>
                  <FormattedMessage id="add_custom_network" />
                </div>
                <span onClick={closeModal} className="cursor-pointer">
                  <ModalClose></ModalClose>
                </span>
              </div>
              <div className="flex flex-col  mt-10">
                <span className="text-white text-sm mb-2.5">
                  <FormattedMessage id="network_name"></FormattedMessage>
                </span>
                <div
                  className={`overflow-hidden rounded-md ${
                    nameError ? 'border border-warnRedColor' : ''
                  }`}
                >
                  <input
                    className="px-3 h-12 bg-black bg-opacity-20"
                    onChange={({ target }) => changeNetName(target.value)}
                  ></input>
                </div>
                <span
                  className={`errorTip text-redwarningColor text-sm mt-2 ${
                    nameError ? '' : 'hidden'
                  }`}
                >
                  <FormattedMessage id="rpc_name_taken_tip" />
                </span>
              </div>
              <div className="flex flex-col mt-10">
                <span className="text-white text-sm mb-2.5">RPC URL</span>
                <div
                  className={`overflow-hidden rounded-md ${
                    unavailableError ? 'border border-warnRedColor' : ''
                  }`}
                >
                  <input
                    className="px-3 h-12 rounded-md bg-black bg-opacity-20"
                    onChange={({ target }) => changeNetUrl(target.value)}
                  ></input>
                </div>
                <span
                  className={`errorTip text-redwarningColor text-sm mt-2 ${
                    unavailableError ? '' : 'hidden'
                  }`}
                >
                  <FormattedMessage id="network_invalid" />
                </span>
                <span
                  className={`errorTip text-redwarningColor text-sm mt-2 ${
                    testnetError ? '' : 'hidden'
                  }`}
                >
                  <FormattedMessage id="fobidden_testnet_rpc_tip" />
                </span>
                <span
                  className={`errorTip text-redwarningColor text-sm mt-2 ${
                    notSupportTestnetError ? '' : 'hidden'
                  }`}
                >
                  <FormattedMessage id="no_support_testnet_rpc_tip" />
                </span>
              </div>
              <GradientButton
                color="#fff"
                className={`w-full h-10 text-center text-base text-white mt-10 focus:outline-none font-semibold ${
                  submitStatus ? '' : 'opacity-40'
                }`}
                onClick={addCustomNetWork}
                disabled={!submitStatus}
                btnClassName={submitStatus ? '' : 'cursor-not-allowed'}
                loading={customLoading}
              >
                <div className={`${isInEditStatus ? 'hidden' : ''}`}>
                  <ButtonTextWrapper
                    loading={customLoading}
                    Text={() => {
                      return (
                        <>{<FormattedMessage id="add"></FormattedMessage>}</>
                      );
                    }}
                  />
                </div>
              </GradientButton>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-xl text-white mb-5">
                RPC
                <span onClick={closeModal} className="cursor-pointer">
                  <ModalClose></ModalClose>
                </span>
              </div>
              <div
                style={{ maxHeight: cardHeight }}
                className="overflow-y-auto overflow-x-hidden px-2 py-2"
              >
                {Object.entries(rpclist).map(
                  ([key, data]: any, index: number) => {
                    return (
                      <div className="flex items-center" key={data.simpleName}>
                        <div
                          className={`relative flex items-center rounded-lg h-14 px-5 ${
                            isInEditStatus && data.custom ? 'w-4/5' : 'w-full'
                          } ${
                            index != Object.entries(rpclist).length - 1
                              ? 'mb-3'
                              : ''
                          } ${isInEditStatus ? '' : 'cursor-pointer'} ${
                            isInEditStatus && !data.custom
                              ? ''
                              : 'bg-black bg-opacity-20 hover:bg-opacity-30'
                          } justify-between text-white ${
                            currentEndPoint == key && !isInEditStatus
                              ? 'bg-opacity-30'
                              : ''
                          }`}
                          onClick={() => {
                            if (!isInEditStatus) {
                              switchPoint(key);
                            }
                          }}
                        >
                          <label
                            className={`text-sm pr-5 whitespace-nowrap overflow-hidden overflow-ellipsis`}
                          >
                            {data.simpleName}
                          </label>
                          <div className={`flex items-center text-sm`}>
                            {displayCurrentRpc(responseTimeList, key, true)}
                          </div>
                          {currentEndPoint == key && !isInEditStatus ? (
                            <SelectedButtonIcon className="absolute -right-1 -top-1"></SelectedButtonIcon>
                          ) : null}
                        </div>
                        {isInEditStatus && data.custom ? (
                          <div>
                            <DeleteButtonIcon
                              className="cursor-pointer ml-4"
                              onClick={() => {
                                deleteCustomNetwork(key);
                              }}
                            ></DeleteButtonIcon>
                          </div>
                        ) : null}
                      </div>
                    );
                  }
                )}
              </div>
              <div
                className={`flex items-center mt-6 px-2 ${
                  isInEditStatus ? 'justify-end' : 'justify-between'
                }`}
              >
                <GradientButton
                  color="#fff"
                  className={`h-10 px-4 text-center text-base text-white focus:outline-none font-semibold ${
                    isInEditStatus ? 'hidden' : ''
                  }`}
                  onClick={showCustomNetWork}
                >
                  <div className={'flex items-center'}>
                    <AddButtonIcon
                      style={{ zoom: 1.35 }}
                      className="mr-1 text-white"
                    ></AddButtonIcon>
                    <FormattedMessage id="add" />
                  </div>
                </GradientButton>
                {Object.keys(rpclist).length > 2 ? (
                  <div className="flex items-center">
                    {isInEditStatus ? (
                      <span
                        className="text-sm text-white cursor-pointer mr-2"
                        onClick={switchEditStatus}
                      >
                        <FormattedMessage id="finish" />
                      </span>
                    ) : null}
                    <SetButtonIcon
                      className="cursor-pointer text-primaryText hover:text-white"
                      onClick={switchEditStatus}
                    ></SetButtonIcon>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
const getRpcList = () => {
  const RPCLIST_system = getExtendConfig().RPC_LIST;
  const RPCLIST_custom = getCustomConfig();
  const RPCLIST = Object.assign(RPCLIST_system, RPCLIST_custom);
  return RPCLIST;
};
async function ping(url: string, key: string) {
  const RPCLIST = getRpcList();
  const start = new Date().getTime();
  const businessRequest = fetch(url, {
    method: 'POST',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'dontcare',
      method: 'gas_price',
      params: [null],
    }),
  });
  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(-1);
    }, 8000);
  });
  const responseTime = await Promise.race([businessRequest, timeoutPromise])
    .then(() => {
      const end = new Date().getTime();
      return end - start;
    })
    .catch((result) => {
      if (result == -1) {
        // timeout
        return -1;
      } else {
        // other exception
        const currentRpc = localStorage.getItem('endPoint') || 'defaultRpc';
        if (currentRpc != key) {
          return -1;
        } else {
          const availableRpc = Object.keys(RPCLIST).find((item) => {
            if (item != key) return item;
          });
          let reloadedTimes = Number(
            localStorage.getItem('rpc_reload_number') || 0
          );
          setTimeout(() => {
            reloadedTimes = reloadedTimes + 1;
            if (reloadedTimes > MAXELOADTIMES) {
              localStorage.setItem('endPoint', 'defaultRpc');
              localStorage.setItem('rpc_reload_number', '');
              return -1;
            } else {
              localStorage.setItem('endPoint', availableRpc);
              window.location.reload();
              localStorage.setItem(
                'rpc_reload_number',
                reloadedTimes.toString()
              );
            }
          }, 1000);
        }
      }
    });
  return responseTime;
}
async function pingChain(url: string) {
  const start = new Date().getTime();
  let status;
  let responseTime;
  let chain_id;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'dontcare',
        method: 'status',
        params: [],
      }),
    })
      .then((res) => {
        return res.json();
      })
      .catch(() => {
        return {};
      });
    if (res?.result?.chain_id) {
      const end = new Date().getTime();
      responseTime = end - start;
      status = true;
      chain_id = res.result.chain_id;
    }
  } catch {
    status = false;
  }
  return {
    status,
    responseTime,
    chain_id,
  };
}
const isPrd = (env: string = process.env.REACT_APP_NEAR_ENV) => {
  if (env != 'pub-testnet' && env != 'testnet') return true;
};
function trimStr(str: string = '') {
  return str.replace(/(^\s*)|(\s*$)/g, '');
}
async function ping_gas(url: string) {
  const start = new Date().getTime();
  let responseTime;
  const businessRequest = fetch(url, {
    method: 'POST',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'dontcare',
      method: 'gas_price',
      params: [null],
    }),
  });
  let r;
  try {
    r = await businessRequest;
    if (r?.status == 200) {
      r = true;
    } else {
      r = false;
    }
  } catch (error) {
    r = false;
  }
  const end = new Date().getTime();
  responseTime = end - start;
  return {
    status: !!r,
    responseTime,
  };
}
export default RpcList;
