import React, { useEffect, useRef } from 'react';
import { CompactPicker } from 'react-color';
import { AdboardUtil } from '../../utils/AdboardUtil';
import { AdboardFrameData, editFrame } from '../../services/adboard';

interface DrawboardModalProps {
  framedata: AdboardFrameData;
  frameId: string;
  close: () => void;
}

const DrawboardModal = ({ framedata, frameId, close }: DrawboardModalProps) => {
  let activeColorBucket = 'colorbucket1';
  let activeColorHex = AdboardUtil.getStorageData('colorbucket1', '#F44336');
  let drawActive = false;

  const drawboardCanvasRef = useRef<HTMLCanvasElement>();
  const previewCanvasRef = useRef<HTMLCanvasElement>();
  const colorbucket1Ref = useRef<HTMLButtonElement>();
  const colorbucket2Ref = useRef<HTMLButtonElement>();
  const colorbucket3Ref = useRef<HTMLButtonElement>();
  const colorbucket4Ref = useRef<HTMLButtonElement>();
  const colorbucket5Ref = useRef<HTMLButtonElement>();
  const colorbucket6Ref = useRef<HTMLButtonElement>();

  function renderDrawboard() {
    AdboardUtil.initColorPalette();
    let drawboardData = framedata[Number(frameId)];
    const previewCanvasContext = previewCanvasRef.current.getContext('2d');
    previewCanvasContext.canvas.width = 40;
    previewCanvasContext.canvas.height = 40;

    const drawboardCanvasContext = drawboardCanvasRef.current.getContext('2d');
    drawboardCanvasContext.canvas.width = 600;
    drawboardCanvasContext.canvas.height = 600;
    drawboardCanvasContext.clearRect(0, 0, 600, 600);
    drawboardCanvasContext.lineWidth = 1;

    drawboardCanvasContext.strokeStyle = 'rbga(0, 0, 0, 50)';

    for (var i = 0; i <= AdboardUtil.LENGTH_BOXES; i++) {
      drawboardCanvasContext.moveTo(
        i * (drawboardCanvasContext.canvas.width / AdboardUtil.LENGTH_BOXES),
        0
      );
      drawboardCanvasContext.lineTo(
        i * (drawboardCanvasContext.canvas.width / AdboardUtil.LENGTH_BOXES),
        drawboardCanvasContext.canvas.width
      );
      drawboardCanvasContext.stroke();
    }

    for (var i = 0; i <= AdboardUtil.LENGTH_BOXES; i++) {
      drawboardCanvasContext.moveTo(
        0,
        i * (drawboardCanvasContext.canvas.width / AdboardUtil.LENGTH_BOXES)
      );
      drawboardCanvasContext.lineTo(
        drawboardCanvasContext.canvas.width,
        i * (drawboardCanvasContext.canvas.width / AdboardUtil.LENGTH_BOXES)
      );
      drawboardCanvasContext.stroke();
    }

    AdboardUtil.DrawboardData = new Array();
    for (let i = 0; i < AdboardUtil.LENGTH_BOXES; ++i) {
      AdboardUtil.DrawboardData[i] = new Array();
    }

    for (let i = 0; i < 400; i++) {
      var cx = Math.floor(i / AdboardUtil.LENGTH_BOXES);
      var cy = i % AdboardUtil.LENGTH_BOXES;

      const hexColor = AdboardUtil.byte_color(drawboardData[i]);
      colorPixel(cx, cy, hexColor);
    }
  }

  function colorPixel(cx: number, cy: number, hexColor: string) {
    const previewCanvasContext = previewCanvasRef.current.getContext('2d');
    const drawboardCanvasContext = drawboardCanvasRef.current.getContext('2d');

    drawboardCanvasContext.fillStyle = hexColor;
    drawboardCanvasContext.fillRect(
      cx * (drawboardCanvasContext.canvas.width / AdboardUtil.LENGTH_BOXES) + 1,
      cy * (drawboardCanvasContext.canvas.width / AdboardUtil.LENGTH_BOXES) + 1,
      drawboardCanvasContext.canvas.width / AdboardUtil.LENGTH_BOXES - 2,
      drawboardCanvasContext.canvas.height / AdboardUtil.HEIGHT_BOXES - 2
    );

    previewCanvasContext.fillStyle = hexColor;
    previewCanvasContext.fillRect(cx * 2, cy * 2, 2, 2);
    AdboardUtil.DrawboardData[cx][cy] = AdboardUtil.color_byte(hexColor);
  }

  function handleBoardClick(event: any) {
    if (!drawActive) {
      return;
    }
    const canvas = drawboardCanvasRef.current.getContext('2d');
    var x = event.x;
    var y = event.y;

    x -= canvas.canvas.offsetLeft;
    y -= canvas.canvas.offsetTop + 4;
    let cx = Math.floor(x / (canvas.canvas.width / AdboardUtil.LENGTH_BOXES));
    let cy =
      Math.floor(y / (canvas.canvas.height / AdboardUtil.LENGTH_BOXES)) - 3;
    //console.log(cx + " | " + cy);
    if (
      cx >= 0 &&
      cx < AdboardUtil.LENGTH_BOXES &&
      cy >= 0 &&
      cy < AdboardUtil.LENGTH_BOXES
    ) {
      colorPixel(cx, cy, activeColorHex);
    } else {
      //console.log("tried to change pixel outside of canvas");
    }
  }

  useEffect(() => {
    colorbucket1Ref.current.style.backgroundColor = AdboardUtil.getStorageData(
      'colorbucket1',
      '#F44336'
    );
    colorbucket2Ref.current.style.backgroundColor = AdboardUtil.getStorageData(
      'colorbucket2',
      '#673AB7'
    );
    colorbucket3Ref.current.style.backgroundColor = AdboardUtil.getStorageData(
      'colorbucket3',
      '#2196F3'
    );
    colorbucket4Ref.current.style.backgroundColor = AdboardUtil.getStorageData(
      'colorbucket4',
      '#F44336'
    );
    colorbucket5Ref.current.style.backgroundColor = AdboardUtil.getStorageData(
      'colorbucket5',
      '#673AB7'
    );
    colorbucket6Ref.current.style.backgroundColor = AdboardUtil.getStorageData(
      'colorbucket6',
      '#2196F3'
    );
    renderDrawboard();
  }, []);

  function startDraw(e: any) {
    drawActive = true;
    handleBoardClick(e.nativeEvent);
  }

  function draw(e: any) {
    handleBoardClick(e.nativeEvent);
  }

  function stopDraw() {
    drawActive = false;
  }

  function handleChangeComplete(color: any, id: string) {
    if (id == 'colorbucket1') {
      AdboardUtil.setStorageData(id, color);
      colorbucket1Ref.current.style.backgroundColor = color;
    }
    if (id == 'colorbucket2') {
      AdboardUtil.setStorageData(id, color);
      colorbucket2Ref.current.style.backgroundColor = color;
    }
    if (id == 'colorbucket3') {
      AdboardUtil.setStorageData(id, color);
      colorbucket3Ref.current.style.backgroundColor = color;
    }
    if (id == 'colorbucket4') {
      AdboardUtil.setStorageData(id, color);
      colorbucket4Ref.current.style.backgroundColor = color;
    }
    if (id == 'colorbucket5') {
      AdboardUtil.setStorageData(id, color);
      colorbucket5Ref.current.style.backgroundColor = color;
    }
    if (id == 'colorbucket6') {
      AdboardUtil.setStorageData(id, color);
      colorbucket6Ref.current.style.backgroundColor = color;
    }
    if (id == activeColorBucket) {
      activeColorHex = color;
    }
  }

  function saveFrame() {
    const boardData = JSON.stringify(
      AdboardUtil.DrawboardData.toString()
        .split(',')
        .map(function (t: any) {
          return parseInt(t);
        })
    );

    return editFrame({ frameId, framedata: AdboardUtil.compress(boardData) });
  }

  function changeUsedColor(event: any) {
    if (event.target.classList.contains('bucket')) {
      colorbucket1Ref.current.classList.remove('active-bucket');
      colorbucket2Ref.current.classList.remove('active-bucket');
      colorbucket3Ref.current.classList.remove('active-bucket');
      colorbucket4Ref.current.classList.remove('active-bucket');
      colorbucket5Ref.current.classList.remove('active-bucket');
      colorbucket6Ref.current.classList.remove('active-bucket');
      event.target.classList.add('active-bucket');
      activeColorBucket = event.target.id;

      activeColorHex = AdboardUtil.rgb2hex(event.target.style.backgroundColor);
    }
  }

  return (
    <>
      <div
        className="fixed flex flex-col items-center justify-start w-screen z-16"
        style={{
          zIndex: 15,
        }}
      >
        <div
          style={{ paddingLeft: '40px' }}
          className="z-40 flex flex-row items-center justify-center"
        >
          <div className="flex flex-row flex-wrap bg-white w-96 h-96 drawboard">
            <canvas
              ref={drawboardCanvasRef}
              id="drawboard-canvas"
              className="block"
              style={{ width: '600px', height: '600px', zIndex: 1001 }}
              onMouseDown={startDraw}
              onMouseUp={stopDraw}
              onMouseMove={draw}
              onMouseLeave={stopDraw}
            ></canvas>
          </div>
          <div className="z-50 flex flex-col flex-wrap items-center justify-center w-auto h-auto p-2 mt-6 ml-12 -mr-8 bg-gray-800 rounded gap-y-2">
            <button
              id="colorbucket1"
              className="w-8 h-8 text-center transition duration-200 rounded-full shadow-lg outline-none focus:outline-none group bg-theme-dark bucket hover-trigger"
              onClick={changeUsedColor}
              ref={colorbucket1Ref}
            >
              <div className="fixed w-24 h-8 pt-1 ml-8 -mt-4 text-white transition duration-200 border border-solid rounded-md shadow-lg hover-target border-theme-darker bg-theme-normal">
                <CompactPicker
                  colors={AdboardUtil.colorPalette}
                  onChangeComplete={(color, event) => {
                    handleChangeComplete(color.hex, 'colorbucket1');
                  }}
                />
              </div>
            </button>
            <button
              id="colorbucket2"
              className="w-8 h-8 text-center transition duration-200 rounded-full shadow-lg outline-none focus:outline-none group bg-theme-dark bucket hover-trigger"
              onClick={changeUsedColor}
              ref={colorbucket2Ref}
            >
              <div className="fixed w-24 h-8 pt-1 ml-8 -mt-4 text-white transition duration-200 border border-solid rounded-md shadow-lg hover-target border-theme-darker bg-theme-normal">
                <CompactPicker
                  colors={AdboardUtil.colorPalette}
                  onChangeComplete={(color, event) => {
                    handleChangeComplete(color.hex, 'colorbucket2');
                  }}
                />
              </div>
            </button>
            <button
              id="colorbucket3"
              className="w-8 h-8 text-center transition duration-200 rounded-full shadow-lg outline-none focus:outline-none group bg-theme-dark bucket hover-trigger"
              onClick={changeUsedColor}
              ref={colorbucket3Ref}
            >
              <div className="fixed w-24 h-8 pt-1 ml-8 -mt-4 text-white transition duration-200 border border-solid rounded-md shadow-lg hover-target border-theme-darker bg-theme-normal">
                <CompactPicker
                  colors={AdboardUtil.colorPalette}
                  onChangeComplete={(color, event) => {
                    handleChangeComplete(color.hex, 'colorbucket3');
                  }}
                />
              </div>
            </button>
            <button
              id="colorbucket4"
              className="w-8 h-8 text-center transition duration-200 rounded-full shadow-lg outline-none focus:outline-none group bg-theme-dark bucket hover-trigger"
              onClick={changeUsedColor}
              ref={colorbucket4Ref}
            >
              <div className="fixed w-24 h-8 pt-1 ml-8 -mt-4 text-white transition duration-200 border border-solid rounded-md shadow-lg hover-target border-theme-darker bg-theme-normal">
                <CompactPicker
                  colors={AdboardUtil.colorPalette}
                  onChangeComplete={(color, event) => {
                    handleChangeComplete(color.hex, 'colorbucket4');
                  }}
                />
              </div>
            </button>
            <button
              id="colorbucket5"
              className="w-8 h-8 text-center transition duration-200 rounded-full shadow-lg outline-none focus:outline-none group bg-theme-dark bucket hover-trigger"
              onClick={changeUsedColor}
              ref={colorbucket5Ref}
            >
              <div className="fixed w-24 h-8 pt-1 ml-8 -mt-4 text-white transition duration-200 border border-solid rounded-md shadow-lg hover-target border-theme-darker bg-theme-normal">
                <CompactPicker
                  colors={AdboardUtil.colorPalette}
                  onChangeComplete={(color, event) => {
                    handleChangeComplete(color.hex, 'colorbucket5');
                  }}
                />
              </div>
            </button>
            <button
              id="colorbucket6"
              className="w-8 h-8 text-center transition duration-200 rounded-full shadow-lg outline-none focus:outline-none group bg-theme-dark bucket hover-trigger"
              onClick={changeUsedColor}
              ref={colorbucket6Ref}
            >
              <div className="fixed w-24 h-8 pt-1 ml-8 -mt-4 text-white transition duration-200 border border-solid rounded-md shadow-lg hover-target border-theme-darker bg-theme-normal">
                <CompactPicker
                  colors={AdboardUtil.colorPalette}
                  onChangeComplete={(color, event) => {
                    handleChangeComplete(color.hex, 'colorbucket6');
                  }}
                />
              </div>
            </button>
          </div>
          <div
            className="fixed z-50 flex justify-between h-10 w-96"
            style={{
              marginTop: '680px',
              width: '600px',
              marginLeft: '-50px',
            }}
          >
            <button
              onClick={() => saveFrame()}
              className="flex flex-row justify-center h-auto py-2 text-white bg-gray-800 rounded-md shadow-xl focus:outline-none mr-11 w-28"
            >
              <svg
                className="w-6 h-6 mr-2"
                viewBox="0 0 42 41"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.5001 29.0416H24.5001V35.875H17.5001V29.0416Z"
                  fill="white"
                />
                <path
                  d="M35.21 14.8796L26.7575 6.62833C25.7739 5.66693 24.4394 5.1262 23.0475 5.125H17.5V15.375H26.25C26.7141 15.375 27.1592 15.555 27.4874 15.8754C27.8156 16.1957 28 16.6303 28 17.0833C28 17.5364 27.8156 17.9709 27.4874 18.2913C27.1592 18.6117 26.7141 18.7917 26.25 18.7917H15.75C15.2859 18.7917 14.8408 18.6117 14.5126 18.2913C14.1844 17.9709 14 17.5364 14 17.0833V5.125H10.5C9.10761 5.125 7.77226 5.66495 6.78769 6.62608C5.80312 7.5872 5.25 8.89077 5.25 10.25V30.75C5.25 32.1092 5.80312 33.4128 6.78769 34.3739C7.77226 35.335 9.10761 35.875 10.5 35.875H14V29.0417C14 28.1355 14.3687 27.2665 15.0251 26.6257C15.6815 25.985 16.5717 25.625 17.5 25.625H24.5C25.4283 25.625 26.3185 25.985 26.9749 26.6257C27.6313 27.2665 28 28.1355 28 29.0417V35.875H31.5C32.8924 35.875 34.2277 35.335 35.2123 34.3739C36.1969 33.4128 36.75 32.1092 36.75 30.75V18.5013C36.7488 17.1425 36.1948 15.8398 35.21 14.8796Z"
                  fill="white"
                />
              </svg>
              Save
            </button>
            <div
              className="w-10 h-10 text-center"
              style={{
                position: 'relative',
                left: '-40px',
              }}
            >
              <canvas
                ref={previewCanvasRef}
                id="preview-canvas"
                className="block"
                style={{ width: '40px', height: '40px' }}
              ></canvas>
            </div>
            <button
              onClick={close}
              className="flex flex-row justify-center h-auto py-2 text-white bg-gray-800 rounded-md shadow-xl focus:outline-none mr-11 w-28"
            >
              <svg
                className="w-6 h-6 mr-2"
                viewBox="0 0 31 31"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.2 0H24.8C26.4443 0 28.0213 0.653212 29.1841 1.81594C30.3468 2.97866 31 4.55566 31 6.2V24.8C31 26.4443 30.3468 28.0213 29.1841 29.1841C28.0213 30.3468 26.4443 31 24.8 31H6.2C4.55566 31 2.97866 30.3468 1.81594 29.1841C0.653212 28.0213 0 26.4443 0 24.8V6.2C0 4.55566 0.653212 2.97866 1.81594 1.81594C2.97866 0.653212 4.55566 0 6.2 0ZM6.2 3.1C5.37783 3.1 4.58933 3.42661 4.00797 4.00797C3.42661 4.58933 3.1 5.37783 3.1 6.2V24.8C3.1 25.6222 3.42661 26.4107 4.00797 26.992C4.58933 27.5734 5.37783 27.9 6.2 27.9H24.8C25.6222 27.9 26.4107 27.5734 26.992 26.992C27.5734 26.4107 27.9 25.6222 27.9 24.8V6.2C27.9 5.37783 27.5734 4.58933 26.992 4.00797C26.4107 3.42661 25.6222 3.1 24.8 3.1H6.2ZM17.6917 15.5L22.0766 19.8834C22.3675 20.1742 22.5309 20.5687 22.5309 20.98C22.5309 21.3913 22.3675 21.7858 22.0766 22.0766C21.7858 22.3675 21.3913 22.5309 20.98 22.5309C20.5687 22.5309 20.1742 22.3675 19.8834 22.0766L15.5 17.6917L11.1166 22.0766C10.8258 22.3675 10.4313 22.5309 10.02 22.5309C9.60866 22.5309 9.21419 22.3675 8.92335 22.0766C8.63251 21.7858 8.46911 21.3913 8.46911 20.98C8.46911 20.7764 8.50923 20.5747 8.58716 20.3865C8.6651 20.1984 8.77934 20.0274 8.92335 19.8834L13.3083 15.5L8.92335 11.1166C8.63251 10.8258 8.46911 10.4313 8.46911 10.02C8.46911 9.81631 8.50923 9.61465 8.58716 9.42649C8.6651 9.23833 8.77934 9.06736 8.92335 8.92335C9.06736 8.77934 9.23833 8.6651 9.42649 8.58716C9.61465 8.50923 9.81631 8.46911 10.02 8.46911C10.4313 8.46911 10.8258 8.63251 11.1166 8.92335L15.5 13.3083L19.8834 8.92335C20.1742 8.63251 20.5687 8.46911 20.98 8.46911C21.3913 8.46911 21.7858 8.63251 22.0766 8.92335C22.3675 9.21419 22.5309 9.60866 22.5309 10.02C22.5309 10.4313 22.3675 10.8258 22.0766 11.1166L17.6917 15.5Z"
                  fill="white"
                />
              </svg>
              Cancel
            </button>
          </div>
        </div>
      </div>
      <div className="fixed w-screen h-screen -mt-32 bg-black bg-opacity-25 blur"></div>
    </>
  );
};

export default DrawboardModal;
