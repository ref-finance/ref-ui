import React, { useEffect, useRef, useState } from 'react';
import DrawboardModal from './DrawboardModal';
import { AdboardUtil } from '../../utils/AdboardUtil';
import { useAdboardState } from '../../state/adboard';
import BuyModal from './BuyModal';
import { useWhitelistTokens } from '../../state/token';
import Loading from '../../components/layout/Loading';
import { AdboardMetadata } from '../../services/adboard';
import Icon from '../../components/tokens/Icon';
import { toReadableNumber } from '../../utils/numbers';
import { toRealSymbol } from '~utils/token';

export default function AdboardPage() {
  const adboardCanvasRef = useRef<HTMLCanvasElement>();
  const adboardWrapperRef = useRef<HTMLDivElement>();

  const [selectedFrameId, setSelectedFrameId] = useState<string>();
  const [buyMetadata, setBuyMetadata] = useState<AdboardMetadata>();
  const { framedata, metadata, loading, ownedFrames, isOwnFrame } =
    useAdboardState();
  const tokens = useWhitelistTokens();

  useEffect(() => {
    if (loading) return;

    AdboardUtil.initColorPalette();
    adboardCanvasRef.current.style.width = AdboardUtil.PIX_WIDTH_BOARD + 'px';
    adboardCanvasRef.current.style.height = AdboardUtil.PIX_HEIGHT_BOARD + 'px';

    const ctx = adboardCanvasRef.current.getContext('2d');
    ctx.canvas.width = AdboardUtil.PIX_WIDTH_BOARD;
    ctx.canvas.height = AdboardUtil.PIX_HEIGHT_BOARD;
    for (let p = 0; p < framedata.length; p++) {
      const x_offset = Math.floor(p / AdboardUtil.PIX_HORIZONTAL_BOXES);
      const y_offset = p % AdboardUtil.PIX_HORIZONTAL_BOXES;

      for (let i = 0; i < AdboardUtil.FRAME_COUNT; i++) {
        const row = Math.floor(i / 20);
        const cell = i % 20;
        ctx.fillStyle = AdboardUtil.byte_color(framedata[p][i]);
        ctx.fillRect(
          (row + 20 * y_offset) * 2,
          (cell + 20 * x_offset) * 2,
          2,
          2
        );
      }
    }
    let base64PngData = adboardCanvasRef.current.toDataURL();
    adboardWrapperRef.current.style.background = 'url(' + base64PngData + ')';
  }, [loading]);

  if (loading) return <Loading />;

  return (
    <div className="flex items-center flex-col">
      {selectedFrameId && (
        <DrawboardModal
          framedata={framedata}
          frameId={selectedFrameId}
          close={() => setSelectedFrameId(null)}
        />
      )}
      {buyMetadata && (
        <BuyModal
          metadata={buyMetadata}
          tokens={tokens}
          close={() => setBuyMetadata(null)}
        />
      )}
      <div
        className="h-auto mx-auto"
        style={{
          marginTop: '30px',
          width: '1132px',
        }}
      >
        <canvas
          ref={adboardCanvasRef}
          id="adboard-canvas"
          style={{ width: '500px', height: '500px', display: 'none' }}
        ></canvas>
        <div
          className="mx-auto rounded rounded-md shadow-md float-left"
          style={{
            marginTop: '30px',
            width: '120px',
            maxWidth: '120px',
            overflow: 'auto',
          }}
        >
          <p className="text-white px-2 font-semibold	mb-2">
            My frames: {ownedFrames.length}
          </p>
          {ownedFrames?.map(({ frameId }, index) => (
            <div
              onClick={() => setSelectedFrameId(frameId)}
              className="text-white shadow group"
              key={frameId}
              style={{
                height: '40px',
                width: '110px',
                margin: '3px',
                cursor: 'pointer',
                float: 'left',
                backgroundColor: '#01C08B',
                textAlign: 'center',
                borderRadius: '4px',
                paddingTop: '8px',
              }}
            >
              #{frameId.padStart(3, '0')}
            </div>
          ))}
        </div>
        <div
          className="mx-auto float-left"
          style={{
            marginTop: '30px',
            width: '1012px',
          }}
        >
          <div
            className="flex flex-row flex-wrap mx-auto"
            ref={adboardWrapperRef}
            style={{
              height: '640px',
              width: '1000px',
              minWidth: '800px',
              backgroundColor: '#123456',
            }}
          >
            {metadata?.map((metadata) => (
              <div
                className="group z-12 has-tooltip"
                key={metadata.frameId}
                style={{
                  height: '40px',
                  width: '40px',
                }}
              >
                <div className="absolute py-4 px-6 z-30 flex flex-col invisible h-auto mt-8 ml-5 text-white transition duration-100 transform -translate-x-1/2 bg-gray-800 rounded-xl shadow-xl cursor-default group-hover:visible w-max tooltip tooltip-content">
                  <div className="p-2 rounded-xl rounded-b-none text-center bg-green-500 text-black font-semibold">
                    {metadata.owner}
                  </div>
                  <div className="flex justify-center items-center p-1 font-serif text-sm text-center my-2">
                    <span className="ml-3">
                      Coordinate #{metadata.frameId.padStart(3, '0')}
                    </span>
                    <span className="mr-2">
                      {tokens && (
                        <Icon
                          label={false}
                          token={
                            tokens.find((t) => t.id === metadata.token_id) ||
                            tokens[0]
                          }
                        />
                      )}
                    </span>
                  </div>
                  <div className="p-1 font-serif text-sm text-center">
                    <div>
                      <div>
                        <button
                          key={metadata.frameId}
                          onClick={() =>
                            isOwnFrame(metadata.owner)
                              ? ''
                              : setBuyMetadata(metadata)
                          }
                          className={[
                            'flex flex-row justify-between h-auto px-6 py-1 font-semibold transition duration-200 border border-solid rounded-3xl shadow-xl hover:opacity-80 focus:outline-none border-theme-light',
                            isOwnFrame(metadata.owner)
                              ? 'bg-gray-600 text-white'
                              : 'bg-white text-black',
                          ].join(' ')}
                        >
                          {(isOwnFrame(metadata.owner) && (
                            <span className="pr-2">Sell</span>
                          )) || <span className="pr-2">Buy</span>}{' '}
                          for{' '}
                          <span className="text-green-400 px-2">
                            {toReadableNumber(
                              tokens &&
                                (
                                  tokens.find(
                                    (t) => t.id === metadata.token_id
                                  ) || tokens[0]
                                ).decimals,
                              metadata.token_price.toString()
                            )}
                          </span>
                          {tokens &&
                            toRealSymbol(
                              (
                                tokens.find(
                                  (t) => t.id === metadata.token_id
                                ) || tokens[0]
                              ).symbol
                            )}
                        </button>
                      </div>
                      {metadata.protected_ts / 1000 / 1000 > Date.now() && (
                        <div>
                          Sale starts at:{' '}
                          {new Date(
                            metadata.protected_ts / 1000 / 1000
                          ).toISOString()}{' '}
                        </div>
                      )}
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
