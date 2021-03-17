import React from "react";

import MicroModal from "react-micro-modal";

import SelectArrow from "~assets/misc/select-arrow.svg";
import NEAR from "../../assets/coins/near.svg";

import "react-micro-modal/dist/index.css";
import { DEFAULT_COIN_LIST } from "~consts/DefaultSupportedCoins";

interface SelectedCoinProps {
  coin: CoinForSwap;
}

function SelectedCoin({ coin }: SelectedCoinProps) {
  const { SVG, acronym } = coin;
  return (
    <>
      <SVG height="25" width="25" />
      <p>{acronym}</p>
    </>
  );
}

function Modal({ trigger, children }) {
  return (
    <MicroModal
      closeOnAnimationEnd
      closeOnEscapePress
      overrides={{
        Overlay: {
          style: {
            background: "rgba(0, 0, 0, 0.3)",
            maxWidth: "100%",
          },
        },
        Dialog: {
          style: { margin: 0, padding: 0 },
        },
      }}
      trigger={trigger}
    >
      {children}
    </MicroModal>
  );
}

function SelectButton({ handleOpen, coin }) {
  return (
    <button
      type="button"
      className="trigger-wrapper flex flex-row items-center space-x-1.5 hover:bg-disabledGray px-1.5 h-11 rounded-md"
      onClick={handleOpen}
    >
      {coin ? (
        <SelectedCoin coin={coin} />
      ) : (
        <p className="whitespace-nowrap">Select Token</p>
      )}
      <SelectArrow />
    </button>
  );
}

function CoinRow({ coin, onClick }) {
  const { SVG, acronym } = coin;
  return (
    <button
      onClick={() => onClick(coin)}
      type="button"
      className="flex flex-row w-full items-center justify-between py-4 px-6 hover:bg-backgroundGray"
    >
      <div className="flex flex-row items-center ">
        <SVG height="22.5" width="22.5" />
        <p className="ml-2 font-light ">{acronym}</p>
      </div>
      <p className="font-inter">0</p>
    </button>
  );
}

function CoinList({ handleClose, setCoin }) {
  const onClick = (coin) => {
    setCoin(coin);
    handleClose();
  };
  return (
    <div className="flex flex-col w-80 pb-8">
      <h1 className="text-md font-light text-gray-400 mb-1 p-6">
        Select a token
      </h1>
      {DEFAULT_COIN_LIST.map((coin) => (
        <CoinRow coin={coin} key={coin.id} onClick={onClick} />
      ))}
    </div>
  );
}

function SelectCurrencyModal({ selectedCoin, setCoin }) {
  return (
    <Modal
      trigger={(handleOpen: () => void) => (
        <SelectButton handleOpen={handleOpen} coin={selectedCoin} />
      )}
    >
      {(handleClose: () => void) => (
        <CoinList handleClose={handleClose} setCoin={setCoin} />
      )}
    </Modal>
  );
}

export default SelectCurrencyModal;
