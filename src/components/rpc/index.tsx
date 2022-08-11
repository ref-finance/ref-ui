import React, { useEffect, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { CircleIcon, AddButtonIcon } from '~components/icon/Common';
import getConfig, { getExtendConfig, getCustomConfig } from '~services/config';
import { JsonRpcProvider } from 'near-api-js/lib/providers';
import { near } from '~services/near';
import { isMobile } from '~utils/device';
import Modal from 'react-modal';
import { ModalClose, Checkbox, CheckboxSelected } from '~components/icon';
import { BeatLoading } from '~components/layout/Loading';
import { FormattedMessage, useIntl } from 'react-intl';
import { GradientButton, ButtonTextWrapper } from '~components/button/Button';
const MAXELOADTIMES = 3;
const RpcList = () => {
  const rpclist = getRpcList();
  const [hover, setHover] = useState(false);
  const [responseTimeList, setResponseTimeList] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
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
  }, []);
  function updateResponseTimeList(data: any) {
    const { key, responseTime } = data;
    responseTimeList[key] = responseTime;
    setResponseTimeList(Object.assign({}, responseTimeList));
  }
  function addCustomNetwork() {
    setModalCustomVisible(true);
    if (mobile) {
      setHover(false);
    }
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
          <div className="flex items-center w-full h-full justify-between">
            <div
              className={`flex items-center justify-between flex-grow pl-12 ${
                prd ? 'pr-7' : 'pr-20'
              }`}
              onClick={() => {
                setHover(!hover);
              }}
            >
              <div className="flex items-center">
                <label className="text-xs text-primaryText mr-5">RPC</label>
                <label className="text-xs text-primaryText cursor-pointer pr-5 whitespace-nowrap overflow-hidden overflow-ellipsis">
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
            {prd ? (
              <div
                onClick={addCustomNetwork}
                className="flex items-center justify-between px-5 h-full"
                style={{ borderLeft: '1px solid rgba(115, 129, 139, 0.15)' }}
              >
                <AddButtonIcon className="text-primaryText hover:text-greenColor"></AddButtonIcon>
              </div>
            ) : null}
          </div>
          <div
            className={`flex flex-col items-center justify-center absolute bottom-8 w-full bg-cardBg rounded mb-px ${
              hover ? '' : 'hidden'
            }`}
            style={{ boxShadow: '0px 0px 10px 10px rgba(0, 0, 0, 0.15)' }}
          >
            {Object.entries(rpclist).map(([key, data]) => {
              return (
                <div
                  key={key}
                  className={`flex items-center w-full pl-20 pr-24 py-2 justify-between text-primaryText hover:bg-navHighLightBg  hover:text-white ${
                    currentEndPoint == key ? 'bg-navHighLightBg' : ''
                  }`}
                  onClick={() => {
                    switchPoint(key);
                  }}
                >
                  <label
                    className={`text-xs pl-3 pr-5 whitespace-nowrap overflow-hidden overflow-ellipsis ${
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

          {/* <ModalBox
            isOpen={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
            }}
            rpclist={rpclist}
            responseTimeList={responseTimeList}
            currentEndPoint={currentEndPoint}
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
          ></ModalBox> */}
        </div>
      ) : (
        <>
          <div
            style={{ zIndex: 999999 }}
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
                  <div className="flex items-center">
                    <label className="text-xs text-primaryText cursor-pointer pr-5 whitespace-nowrap overflow-hidden overflow-ellipsis">
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
            {prd ? (
              <div
                onClick={addCustomNetwork}
                style={{ height: '25px' }}
                className="flex items-center bg-darkGradientHoverBg rounded  cursor-pointer ml-0.5 px-2 "
              >
                <AddButtonIcon className="text-primaryText hover:text-greenColor"></AddButtonIcon>
              </div>
            ) : null}
          </div>
        </>
      )}
      <ModalAddCustomNetWork
        isOpen={modalCustomVisible}
        onRequestClose={() => {
          setModalCustomVisible(false);
        }}
        updateResponseTimeList={updateResponseTimeList}
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
const displayCurrentRpc = (responseTimeList: any, key: any) => {
  if (responseTimeList[key] == -1) {
    return (
      <>
        <span className="cursor-pointer text-error">
          <CircleIcon></CircleIcon>
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
          <CircleIcon></CircleIcon>
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
const ModalAddCustomNetWork = (props: any) => {
  // todo
  const [customLoading, setCustomLoading] = useState(false);
  const [customRpcName, setCustomRpcName] = useState('');
  const [customRpUrl, setCustomRpUrl] = useState('');
  const [unavailableError, setUnavailableError] = useState(false);
  const [testnetError, setTestnetError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const cardWidth = isMobile() ? '90vw' : '400px';
  async function addCustomNetWork() {
    setCustomLoading(true);
    const rpcMap = getRpcList();
    // check if has same url and same name
    const fondItem = Object.values(rpcMap).find((item) => {
      if (item['simpleName'] == customRpcName) {
        return true;
      }
    });
    if (fondItem) {
      setNameError(true);
      setCustomLoading(false);
      return;
    }
    // check network
    const { status, responseTime, chain_id } = await pingChain(customRpUrl);
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
    const customRpcMap = getCustomConfig();
    const key = 'custom' + Object.keys(customRpcMap).length + 1;
    customRpcMap[key] = {
      url: customRpUrl,
      simpleName: customRpcName,
    };

    localStorage.setItem('customRpc', JSON.stringify(customRpcMap));
    setCustomLoading(false);
    props.onRequestClose();
    props.updateResponseTimeList({
      key,
      responseTime,
    });
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
  const submitStatus =
    customRpcName &&
    customRpUrl &&
    !unavailableError &&
    !nameError &&
    !testnetError;
  return (
    <Modal {...props}>
      <div
        className="px-6 py-7 text-white bg-cardBg border border-gradientFrom border-opacity-50 rounded-lg"
        style={{
          width: cardWidth,
        }}
      >
        <div className="flex items-center justify-between text-xl text-white">
          Add Custom Network
          <span
            onClick={() => {
              props.onRequestClose();
            }}
            className="cursor-pointer"
          >
            <ModalClose></ModalClose>
          </span>
        </div>
        <div className="flex flex-col  mt-10">
          <span className="text-white text-sm mb-2.5">Network Name</span>
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
            The Network name was already taken.
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
            The Network was invalid
          </span>
          <span
            className={`errorTip text-redwarningColor text-sm mt-2 ${
              testnetError ? '' : 'hidden'
            }`}
          >
            RPC server's network (testnet) is different with this network
            (mainnet)
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
          <div>
            <ButtonTextWrapper
              loading={customLoading}
              // Text={() => (
              //   <FormattedMessage
              //     id="add"
              //     defaultMessage="Add"
              //   />
              // )}
              Text={() => {
                return <>{'Add'}</>;
              }}
            />
          </div>
        </GradientButton>
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
export const isPrd = (env: string = process.env.NEAR_ENV) => {
  if (env != 'pub-testnet' && env != 'testnet') return true;
};
export default RpcList;
