import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-modal';
import { ModalClose } from '../components/icon';
import { RuleTips, Goback } from '../components/icon/memeComingModal';
import { memeComingSoonJson } from '../config/memeConfig';
import { useHistory } from 'react-router-dom';
export default function MemeComingSoon() {
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [selectListItem, setSelectListItem] = useState<any>(null);
  const history = useHistory();
  return (
    <div
      className="text-white p-2"
      style={{ backgroundColor: 'linear-gradient(#1D2D38, #000D16)' }}
    >
      {/* title */}
      <div className="mb-3 flex items-center justify-center relative">
        <div className="absolute left-0" onClick={() => history.push('/meme')}>
          <Goback />
        </div>
        <h3 className="font-gothamBold text-lg">Airdrop Activity</h3>
      </div>
      {/* air drop list */}
      {memeComingSoonJson.map((item, index) => {
        return (
          <div
            className="flex flex-col justify-evenly w-full h-72 my-3 overflow-auto border border-memePoolBoxBorderColor rounded-2xl p-3 relative"
            style={{ backgroundColor: 'linear-gradient(#213441, #15242F)' }}
            key={item.title + index}
          >
            {/* icon and title */}
            <div className="flex items-center">
              {item.icon}
              <span className="gotham_bold text-xl ml-3">{item.title}</span>
            </div>
            {/* introduce */}
            <p className="text-primaryText text-sm my-3 max-h-40 overflow-auto">
              {item.introduce}
            </p>
            {/* amount */}
            <div>
              <h5 className="text-sm">Amount</h5>
              <p className="text-xl gotham_bold text-greenLight">
                {item.amount}
              </p>
            </div>
            {/* air drop */}
            <div className="my-3">
              <h5 className="text-sm">Airdrop time</h5>
              <p className="text-xl gotham_bold text-greenLight">
                {item.airdropTime}
              </p>
            </div>
            {/* rules */}
            <div
              className="absolute top-2 right-2 flex items-center"
              onClick={() => {
                setIsShowModal(!isShowModal);
                setSelectListItem(item);
              }}
            >
              <RuleTips />
              <span className="mx-2 text-sm">Rules</span>
            </div>
          </div>
        );
      })}

      {/* modal */}
      <Modal
        isOpen={isShowModal}
        className="w-full h-1/2 absolute z-50 bottom-0 bg-memeModelgreyColor rounded-lg"
        onRequestClose={() => setIsShowModal(false)}
        style={{
          overlay: {
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          },
          content: {
            outline: 'none',
          },
        }}
      >
        {/* header */}
        <div className="px-4 pt-6 pb-1 flex items-center justify-between">
          <div className="flex items-center">
            <label className="text-white text-xl">
              Rules for {selectListItem?.title}
            </label>
          </div>
          <ModalClose
            className="cursor-pointer"
            onClick={() => setIsShowModal(false)}
          />
        </div>
        {/* content */}
        <div className="w-full p-4 h-full">
          <div className=" leading-5 overflow-auto p-3 h-3/4 flex-1 text-sm text-v3LightGreyColor border border-memeBorderColor rounded-xl bg-memeDarkColor">
            {selectListItem?.rules}
          </div>
        </div>
      </Modal>
    </div>
  );
}
