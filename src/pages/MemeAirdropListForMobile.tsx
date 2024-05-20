import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-modal';
import { ModalClose } from '../components/icon';
import { memeComingSoonJson } from '../config/memeConfig';
import { useHistory } from 'react-router-dom';
import { ftGetTokenMetadata } from '../services/ft-contract';
import CustomTooltip from '../components/customTooltip/customTooltip';
import { Goback, RuleIcon, RuleTips } from '../components/meme/icons';
export default function MemeComingSoon() {
  const [icons, setIcons] = useState({});
  //
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  //
  const [selectListItem, setSelectListItem] = useState<any>(null);
  //
  const history = useHistory();
  //
  useEffect(() => {
    window.scrollTo({
      top: 0,
    });
    fetchIcons();
  }, []);

  const fetchIcons = async () => {
    const newIcons = {};
    const promises = memeComingSoonJson.map(async (item) => {
      const iconData = await ftGetTokenMetadata(item.id);
      newIcons[item.id] = iconData.icon;
    });

    await Promise.all(promises);
    setIcons(newIcons);
  };
  const Tip = `
  <div class="text-navHighLightText text-xs text-left w-40">
  The airdropped tokens below are not investment advice.
  </div>`;
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
        <h3 className="font-gothamBold text-lg">Airdrop Announcement</h3>
        <div
          className="text-white text-right ml-1.5 inline-block cursor-pointer"
          data-class="reactTip"
          data-tooltip-id="ruleId"
          data-place="left"
          data-tooltip-html={Tip}
        >
          <RuleTips />
          <CustomTooltip id="ruleId" />
        </div>
      </div>

      {/* air drop list */}
      {memeComingSoonJson.map((item, index) => {
        return (
          <div
            className="flex flex-col justify-evenly w-full h-72 my-3 overflow-auto border border-memePoolBoxBorderColor rounded-2xl p-3 relative bg-memeVoteBgColor"
            style={{ backgroundColor: 'linear-gradient(#213441, #15242F)' }}
            key={item.title + index}
          >
            {/* icon and title */}
            <div className="flex items-center">
              {icons[item.id] ? (
                <img
                  src={icons[item.id]}
                  alt="Icon"
                  style={{ width: '2.5rem', height: '2.5rem' }}
                />
              ) : null}
              <span className="gotham_bold text-xl ml-3"> {item.title} </span>
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
              <RuleIcon />
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
          {/*  */}
          <div className="flex items-center">
            <label className="text-white text-xl">
              Rules for {selectListItem?.title}
            </label>
          </div>
          {/*  */}
          <ModalClose
            className="cursor-pointer"
            onClick={() => setIsShowModal(false)}
          />
        </div>

        {/* content */}
        <div className="w-full p-4 h-full">
          <div className=" leading-5 overflow-auto p-3 h-3/4 flex-1 text-sm text-v3LightGreyColor border border-memeBorderColor rounded-xl bg-memeDarkColor whitespace-pre-wrap leading-6">
            {selectListItem?.rules}
          </div>
        </div>
      </Modal>
    </div>
  );
}
