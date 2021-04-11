import React from "react";
import { useRecoilState } from "recoil";
import { buyModalState } from "./Store";

const BuyModal = () => {
  const [BuyModaleState, setBuyModaleState] = useRecoilState(buyModalState);

  function buyFrame(token: string) {
    //???
  }

  return (
    <div className="fixed flex items-center justify-center w-screen h-screen">
      <div
        className="fixed w-screen h-screen blur"
        style={{
          filter: "blur(5px)",
          background: "rgba(0, 0, 0, 0.75)",
        }}
      ></div>
      <div className="fixed flex flex-row h-48 rounded-md shadow-xl bg-theme-normal">
        <div className="p-6" style={{
          backgroundColor: "black",
          borderRadius: "6px"
        }}>
          <span className="mb-2 text-2xl font-semibold text-white">
            Do you want to buy Frame #{BuyModaleState.frameId}?
          </span>
          <br></br>
          {Array.from(BuyModaleState.availableTokens.values()).map((token, index) => (

            <div className="text-white "> XX {token.split('.')[0]}             <button
              onClick={() => buyFrame("")}
              style={{ backgroundColor: "green", float: "right" }}
              className="flex flex-row justify-between w-32 h-auto px-4 py-2 font-semibold border border-solid rounded-md shadow-xl focus:outline-none border-theme-light text-theme-white bg-theme-blue"
            >
              Buy
          </button><br /></div>
          ))}

          <div className="flex flex-row justify-between w-full px-4 mt-12">
            <button
              onClick={() => setBuyModaleState({ showModal: false, frameId: -1, price: 0, availableTokens: new Set<string>() })}
              className="flex flex-row justify-center h-auto py-2 -ml-5 font-semibold border border-solid rounded-md shadow-xl focus:outline-none border-theme-light w-28 text-theme-dark bg-theme-light"
              style={{ backgroundColor: "green" }}
            >
              <svg
                className="w-6 h-6 mr-2"
                viewBox="0 0 31 31"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.2 0H24.8C26.4443 0 28.0213 0.653212 29.1841 1.81594C30.3468 2.97866 31 4.55566 31 6.2V24.8C31 26.4443 30.3468 28.0213 29.1841 29.1841C28.0213 30.3468 26.4443 31 24.8 31H6.2C4.55566 31 2.97866 30.3468 1.81594 29.1841C0.653212 28.0213 0 26.4443 0 24.8V6.2C0 4.55566 0.653212 2.97866 1.81594 1.81594C2.97866 0.653212 4.55566 0 6.2 0ZM6.2 3.1C5.37783 3.1 4.58933 3.42661 4.00797 4.00797C3.42661 4.58933 3.1 5.37783 3.1 6.2V24.8C3.1 25.6222 3.42661 26.4107 4.00797 26.992C4.58933 27.5734 5.37783 27.9 6.2 27.9H24.8C25.6222 27.9 26.4107 27.5734 26.992 26.992C27.5734 26.4107 27.9 25.6222 27.9 24.8V6.2C27.9 5.37783 27.5734 4.58933 26.992 4.00797C26.4107 3.42661 25.6222 3.1 24.8 3.1H6.2ZM17.6917 15.5L22.0766 19.8834C22.3675 20.1742 22.5309 20.5687 22.5309 20.98C22.5309 21.3913 22.3675 21.7858 22.0766 22.0766C21.7858 22.3675 21.3913 22.5309 20.98 22.5309C20.5687 22.5309 20.1742 22.3675 19.8834 22.0766L15.5 17.6917L11.1166 22.0766C10.8258 22.3675 10.4313 22.5309 10.02 22.5309C9.60866 22.5309 9.21419 22.3675 8.92335 22.0766C8.63251 21.7858 8.46911 21.3913 8.46911 20.98C8.46911 20.7764 8.50923 20.5747 8.58716 20.3865C8.6651 20.1984 8.77934 20.0274 8.92335 19.8834L13.3083 15.5L8.92335 11.1166C8.63251 10.8258 8.46911 10.4313 8.46911 10.02C8.46911 9.81631 8.50923 9.61465 8.58716 9.42649C8.6651 9.23833 8.77934 9.06736 8.92335 8.92335C9.06736 8.77934 9.23833 8.6651 9.42649 8.58716C9.61465 8.50923 9.81631 8.46911 10.02 8.46911C10.4313 8.46911 10.8258 8.63251 11.1166 8.92335L15.5 13.3083L19.8834 8.92335C20.1742 8.63251 20.5687 8.46911 20.98 8.46911C21.3913 8.46911 21.7858 8.63251 22.0766 8.92335C22.3675 9.21419 22.5309 9.60866 22.5309 10.02C22.5309 10.4313 22.3675 10.8258 22.0766 11.1166L17.6917 15.5Z"
                  fill="currentColor"
                />
              </svg>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div >
  );
};

export default BuyModal;
