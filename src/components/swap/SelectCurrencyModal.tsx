import React from 'react';

import MicroModal from 'react-micro-modal';

import SelectArrow from '~assets/misc/select-arrow.svg';

import 'react-micro-modal/dist/index.css';

interface SelectedCoinProps {
  coin: CoinForSwap;
}

function CoinIcon(icon: String) {
  return (
    <>
      {icon.startsWith('http') ? (
        <img className="object-cover" src={icon} height={25} width={25} />
      ) : (
        <p>{icon}</p>
      )}
    </>
  );
}

function SelectedCoin({ coin }: SelectedCoinProps) {
  const { icon, symbol } = coin;
  return (
    <>
      {CoinIcon(icon)}
      <p>{symbol}</p>
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
            background: 'rgba(0, 0, 0, 0.3)',
            maxWidth: '100%',
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
  const { icon, symbol, id } = coin;
  return (
    <button
      onClick={() => onClick(coin)}
      type="button"
      className="flex flex-row w-full items-center justify-between py-4 px-6 hover:bg-backgroundGray"
    >
      <div className="flex flex-row items-center ">
        {CoinIcon(icon)}
        <p className="ml-2 font-light ">{symbol}</p>
      </div>
      <p className="font-inter">{window.deposits[id] || 0}</p>
    </button>
  );
}

function CoinList({ handleClose, setCoin, supportedCoins, showAll }) {
  const onClick = (coin) => {
    setCoin(coin);
    handleClose();
  };
  console.log(showAll);
  return (
    <div className="flex flex-col w-80 pb-8">
      <h1 className="text-md font-light text-gray-400 mb-1 p-6">
        Select a token
      </h1>
      {supportedCoins.map((coin) => {
        if ((window.deposits[coin.id] || 0) > 0 || showAll) {
          return <CoinRow coin={coin} key={coin.id} onClick={onClick} />;
        }
      })}
    </div>
  );
}

function SelectCurrencyModal({ selectedCoin, setCoin, showAll }) {
  const supportedCoins = Object.values({});
  return (
    <Modal
      trigger={(handleOpen: () => void) => (
        <SelectButton handleOpen={handleOpen} coin={selectedCoin} />
      )}
    >
      {(handleClose: () => void) => (
        <CoinList
          handleClose={handleClose}
          setCoin={setCoin}
          supportedCoins={supportedCoins}
          showAll={showAll}
        />
      )}
    </Modal>
  );
}

export default SelectCurrencyModal;
