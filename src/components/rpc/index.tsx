import React, { useEffect, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { CircleIcon } from '~components/icon/Common';
import getConfig, { getExtendConfig } from '~services/config';
import { JsonRpcProvider } from 'near-api-js/lib/providers';
import { near } from '~services/near';
import { isMobile } from '~utils/device';
import Modal from 'react-modal';
import { ModalClose, Checkbox, CheckboxSelected } from '~components/icon';
import { BeatLoading } from '~components/layout/Loading';

const RpcList = () => {
  const rpclist = getExtendConfig().RPC_LIST;
  const [hover, setHover] = useState(false);
  const [responseTimeList, setResponseTimeList] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const currentEndPoint = localStorage.getItem('endPoint') || 'defaultRpc';
  useEffect(() => {
    Object.entries(rpclist).forEach(([key, data]) => {
      console.log(data.url);
      ping(data.url).then((time) => {
        responseTimeList[key] = time;
        setResponseTimeList(Object.assign({}, responseTimeList));
      });
    });
  }, []);
  const minWidth = '180px';
  const maxWith = '230px';
  const mobile = isMobile();
  return (
    <>
      {mobile ? (
        <div className="w-full h-8 px-16 bg-cardBg mt-3">
          <div
            className="flex items-center w-full h-full justify-between"
            onClick={() => {
              setModalVisible(true);
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
            </div>
          </div>
          <ModalBox
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
              },
              content: {
                outline: 'none',
                transform: 'translate(-50%, -50%)',
              },
            }}
          ></ModalBox>
        </div>
      ) : (
        <div
          className="absolute right-8 bottom-1 pt-3"
          onMouseEnter={() => {
            setHover(true);
          }}
          onMouseLeave={() => {
            setHover(false);
          }}
        >
          <div
            className="flex items-center justify-between px-2 py-1 bg-cardBg rounded cursor-pointer"
            style={{ minWidth: minWidth, maxWidth: maxWith }}
          >
            <label className="text-xs text-primaryText cursor-pointer pr-5 whitespace-nowrap overflow-hidden overflow-ellipsis">
              {rpclist[currentEndPoint].simpleName}
            </label>
            <div className="flex items-center">
              {displayCurrentRpc(responseTimeList, currentEndPoint)}
              <FiChevronDown className="text-primaryText transform rotate-180 cursor-pointer"></FiChevronDown>
            </div>
          </div>
          <div
            className={`absolute py-2 bottom-8 flex flex-col w-full bg-cardBg rounded ${
              hover ? '' : 'hidden'
            }`}
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
                    if (responseTimeList[key] && responseTimeList[key] != -1) {
                      switchPoint(key);
                    }
                  }}
                >
                  <label
                    className={`text-xs pr-5 whitespace-nowrap overflow-hidden overflow-ellipsis ${
                      responseTimeList[key] && responseTimeList[key] != -1
                        ? 'cursor-pointer'
                        : 'cursor-default'
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
      )}
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
                        if (
                          responseTimeList[key] &&
                          responseTimeList[key] != -1
                        ) {
                          setSelectCheckbox(key);
                          switchPoint(key);
                        }
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
        <span className="cursor-default text-error">
          <CircleIcon></CircleIcon>
        </span>
        <label className="text-xs ml-1.5 mr-2.5 cursor-default text-error">
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
        <label className="text-xs text-primaryText ml-1.5 mr-2.5 cursor-pointer">
          {responseTimeList[key]}ms
        </label>
      </>
    );
  } else {
    return (
      <label className="mr-2.5">
        <BeatLoading />
      </label>
    );
  }
};

async function ping(url: string) {
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
    }, 5000);
  });
  const responseTime = await Promise.race([businessRequest, timeoutPromise])
    .then(() => {
      const end = new Date().getTime();
      return end - start;
    })
    .catch((result) => {
      return result;
    });
  return responseTime;
}
export default RpcList;
