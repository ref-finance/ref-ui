import "regenerator-runtime/runtime";
import React, { useEffect, useRef, useState } from "react";
import DrawboardModal from "./DrawboardModal";
import { useRecoilState } from "recoil";
import { adboardState, drawboardModalState, buyModalState } from "./Store";
import { AdboardUtil } from "./AdboardUtil";
import { getAdboardDataViewState } from "./AdboardFetcher";
import { wallet } from "~services/near";
import metadataDefaults from '../../utils/metadata';
import { getWhitelistedTokens } from "~services/token";
import { getPools } from "~services/pool";
import { estimateSwap } from "~services/swap";
import BuyModal from "./BuyModal";


export default function AdboardPage() {
  const adboardCanvasRef = useRef<HTMLCanvasElement>();
  const adboardWrapperRef = useRef<HTMLDivElement>();
  const [DrawBoardState, setDrawboardState] = useRecoilState(drawboardModalState);
  const [AdboardState, setAdboardState] = useRecoilState(adboardState);
  const [BuyModaleState, setBuyModaleState] = useRecoilState(buyModalState);

  const [YourFrames, setYourFrames] = useState([]);
  const [AvailableWhitelistedToken, setAvailableWhitelistedToken] = useState(new Set<string>());

  const refreshAdboard = async (frameId: number) => {
    // = await getFrameData();

    // yourFrames = [];
    // resp.data.metadata.forEach((element: string, index: number) => {
    //   if (
    //     (element.owner == NearUtils.accountId ||
    //       element.coauthor == NearUtils.accountId) &&
    //     NearUtils.accountId != ""
    //   ) {
    //     const newElement = Object.assign({}, element);
    //     newElement["frameId"] = index;
    //     yourFrames.push(newElement);
    //   }
    // });
    // setYourFrames(yourFrames);
  };

  const calculateYourFrames = (metadata: any) => {

    const yourFrames: any = [];
    metadata.forEach((element: any, index: number) => {
      if (element.owner == wallet.getAccountId()) {
        const newElement = Object.assign({}, element);
        newElement["frameId"] = index;
        yourFrames.push(newElement);
      }
    });
    //console.log(yourFrames);
    setYourFrames(yourFrames);
  };

  const getAvailableToken = async (): Promise<any> => {
    let availableWhitelistedToken = new Set<string>();
    getWhitelistedTokens().then(whitelistedToken => {
      console.log(whitelistedToken);
      getPools().then(pools => {

        pools.forEach(pool => {
          if (whitelistedToken.includes(pool.tokenIds[0])) {
            availableWhitelistedToken.add(pool.tokenIds[0])
          }
          if (whitelistedToken.includes(pool.tokenIds[1])) {
            availableWhitelistedToken.add(pool.tokenIds[1])
          }
        })
        setAvailableWhitelistedToken(availableWhitelistedToken);
      });
    });
  }

  const renderAdboard = () => {
    adboardCanvasRef.current.style.width = AdboardUtil.PIX_WIDTH_BOARD + "px";
    adboardCanvasRef.current.style.height = AdboardUtil.PIX_HEIGHT_BOARD + "px";

    var ctx = adboardCanvasRef.current.getContext("2d");
    ctx.canvas.width = AdboardUtil.PIX_WIDTH_BOARD;
    ctx.canvas.height = AdboardUtil.PIX_HEIGHT_BOARD;

    for (let p = 0; p < AdboardUtil.AdboardData.framedata.length; p++) {
      var x_offset = Math.floor(p / AdboardUtil.PIX_HORIZONTAL_BOXES);
      var y_offset = p % AdboardUtil.PIX_HORIZONTAL_BOXES;

      for (let i = 0; i < AdboardUtil.FRAME_COUNT; i++) {
        var row = Math.floor(i / 20);
        var cell = i % 20;
        ctx.fillStyle = AdboardUtil.byte_color(
          AdboardUtil.AdboardData.framedata[p][i]
        );
        ctx.fillRect(
          (row + 20 * y_offset) * 2,
          (cell + 20 * x_offset) * 2,
          2,
          2
        );
      }
    }
    let base64PngData = adboardCanvasRef.current.toDataURL();
    adboardWrapperRef.current.style.background = "url(" + base64PngData + ")";
  };

  const openDrawModal = (frameId: number) => {
    setDrawboardState({
      showModal: true,
      frameId: frameId,
      frameData: AdboardUtil.AdboardData.framedata[frameId],
    });
  };

  function pad(num: number, size: number) {
    var s = "00000" + num;
    return s.substr(s.length - size);
  }

  useEffect(() => {
    AdboardUtil.initColorPalette();

    getAdboardDataViewState().then(resp => {
      setAdboardState(resp);
      AdboardUtil.AdboardData = resp;
      renderAdboard();
      calculateYourFrames(resp.metadata);
    });


    getAvailableToken();

    // estimateSwap({})

  }, []);

  return (
    <div>
      {DrawBoardState.showModal && <DrawboardModal></DrawboardModal>}
      {BuyModaleState.showModal && <BuyModal></BuyModal>}
      <div
        className="h-auto mx-auto"
        style={{
          marginTop: "30px",
          width: "1100px"
        }}
      >
        <canvas
          ref={adboardCanvasRef}
          id="adboard-canvas"
          style={{ width: "500px", height: "500px", display: "none" }}
        ></canvas>
        <div
          className="mx-auto border border-gray-300 rounded rounded-md shadow-md"
          style={{
            width: "1000px",
            minWidth: "1000px",
            padding: "4px",
            backgroundColor: "white",
            overflow: "auto"
          }}
        >
          {YourFrames.map((frame, index) => (
            <div
              onClick={() => openDrawModal(frame.frameId)}
              className="bg-gray-400 shadow group"
              key={frame.frameId}
              style={{
                height: "40px",
                width: "50px",
                margin: "3px",
                cursor: "pointer",
                float: "left",
                backgroundColor: "white",
                border: "1px solid #000",
                textAlign: "center",
                borderRadius: "4px",
                paddingTop: "8px"
              }}
            >#{pad(frame.frameId + 1, 3)}</div>
          ))}

        </div>
        <div className="mx-auto" style={{
          backgroundColor: "white",
          borderRadius: "4px",
          padding: "6px",
          marginTop: "30px",
          width: "1012px",
        }}>
          <div
            className="flex flex-row flex-wrap mx-auto"
            ref={adboardWrapperRef}
            style={{
              height: "640px",
              width: "1000px",
              minWidth: "800px",
              backgroundColor: "#123456",
            }}
          >

            {AdboardState.metadata.map((metadata, index) => (
              <div
                className="group z-12 has-tooltip"
                key={index}
                style={{
                  height: "40px",
                  width: "40px",
                }}
              >
                <div className="absolute z-30 flex flex-col invisible h-auto mt-8 ml-5 text-white transition duration-100 transform -translate-x-1/2 bg-gray-800 border-2 rounded shadow-xl cursor-default group-hover:visible w-max border-opacity-10 border-theme-white tooltip tooltip-content">
                  <div className="flex justify-center p-1 font-serif text-sm text-center border-b-2 border-gray-700">
                    #{pad(index + 1, 3)} -   {metadata.near_baseprice}  Near
                  </div>
                  <div className="p-1 font-serif text-sm text-center border-b-2 border-gray-700">
                    <div>
                      <button
                        key={index}
                        onClick={() => setBuyModaleState({ showModal: true, frameId: index, price: metadata.near_baseprice, availableTokens: AvailableWhitelistedToken })}
                        className="flex flex-row justify-between w-22 h-auto px-4 py-2 font-semibold transition duration-200 border border-solid rounded-md shadow-xl hover:opacity-80 focus:outline-none border-theme-light text-theme-white bg-theme-blue"
                      >
                        Buy
                        </button>
                      {/* {Array.from(AvailableWhitelistedToken.values()).map((token, index) => (
       

                      ))} */}
                    </div>

                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}

// this component gets rendered by App after the form is submitted
