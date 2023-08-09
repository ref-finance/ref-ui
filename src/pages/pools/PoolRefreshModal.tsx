import React, { useState } from 'react';
import Modal from 'react-modal';
import { useIntl } from 'react-intl';
import { ButtonTextWrapper } from '../../components/button/Button';

export function PoolRefreshModal(props: Modal.Props) {
  const [loading, setLoading] = useState<boolean>(false);

  const [isOpen, setIsOpen] = useState<boolean>(props.isOpen);

  const intl = useIntl();
  return (
    <Modal
      {...props}
      isOpen={isOpen}
      onRequestClose={() => {
        setIsOpen(false);
      }}
      style={{
        content: {
          zIndex: 999,
          width: 255,
        },
      }}
    >
      <div
        className={`rounded-2xl lg:w-96 xs:w-95vw border border-gradientFrom border-opacity-30 bg-boxBorder text-sm text-primaryOrderly`}
      >
        <div className="px-5 py-6 flex flex-col ">
          <div className="flex items-center pb-6 justify-center">
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M40.4809 14.9359C39.8106 14.489 38.9039 14.6738 38.4571 15.3441L37.2668 17.1402C36.8028 15.516 36.1024 13.9691 35.1742 12.5254C33.8981 10.5273 32.2653 8.83866 30.3231 7.50663C28.4496 6.22186 26.3699 5.31952 24.1399 4.82967C21.9098 4.33983 19.6453 4.28397 17.4067 4.66639C15.0864 5.0617 12.8992 5.91248 10.9012 7.18866C8.90315 8.46483 7.21448 10.0976 5.88245 12.0355C4.59768 13.909 3.69534 15.9887 3.2055 18.2187C2.71995 20.4488 2.66409 22.7133 3.04651 24.9519C3.44182 27.2723 4.29261 29.4594 5.56878 31.4574C6.84495 33.4555 8.47776 35.1441 10.4199 36.4762C12.2934 37.7609 14.3731 38.6633 16.6032 39.1531C17.8578 39.4281 19.1211 39.5656 20.3887 39.5656C21.3727 39.5656 22.3567 39.484 23.3407 39.3164C25.661 38.9211 27.8481 38.0703 29.8461 36.7941C32.8196 34.8906 35.127 32.1793 36.5192 28.948C36.8371 28.2047 36.4934 27.3496 35.7543 27.0273C35.011 26.7094 34.1559 27.0531 33.8336 27.7922C32.6778 30.4863 30.7528 32.7465 28.2735 34.332C24.9778 36.4418 21.0547 37.1379 17.2348 36.3C13.4149 35.4578 10.1449 33.1805 8.03948 29.8848C5.92972 26.589 5.23362 22.666 6.07151 18.8461C6.9137 15.0262 9.19104 11.7562 12.4867 9.65077C15.7824 7.541 19.7055 6.84491 23.5254 7.6828C27.3453 8.52498 30.6153 10.8023 32.7207 14.098C33.3137 15.0305 33.7992 16.0101 34.1688 17.0285L33.2278 16.4055C32.5574 15.9586 31.6508 16.1433 31.2039 16.8137C30.7571 17.484 30.9418 18.3906 31.6121 18.8375L35.9778 21.7336C36.2184 21.8926 36.502 21.9785 36.7856 21.9785C36.8801 21.9785 36.9789 21.9699 37.0735 21.9484C37.4516 21.8711 37.7867 21.6476 38.0016 21.3254L40.8977 16.9598C41.336 16.2851 41.1512 15.3785 40.4809 14.9359Z"
                fill="#7E8A93"
              />
              <path
                d="M21.6348 15.6708C20.8914 15.3528 20.0363 15.6965 19.7184 16.4399L17.5699 21.4629C17.252 22.2063 17.5957 23.0614 18.3391 23.3794L27.7492 27.4098C27.9383 27.4915 28.1316 27.5301 28.325 27.5301C28.8922 27.5301 29.4336 27.1993 29.6699 26.645C29.9879 25.9016 29.6441 25.0465 28.9008 24.7286L20.8313 21.2696L22.4082 17.5915C22.7219 16.8481 22.3781 15.9887 21.6348 15.6708Z"
                fill="#7E8A93"
              />
            </svg>
          </div>

          <div className="flex items-center mb-5 justify-center">
            <span className="text-base text-white text-center">
              {intl.formatMessage({
                id: 'orderly_ws_refresh',
                defaultMessage:
                  'Something wrong with the server, please try again later.',
              })}
            </span>
          </div>

          <button
            className={`rounded-lg ${
              loading
                ? 'opacity-70 cursor-not-allowed bg-buttonGradientBgOpacity'
                : ''
            } flex items-center justify-center py-1 bg-buttonGradientBg hover:bg-buttonGradientBgOpacity text-base text-white`}
            onClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();

              setLoading(true);
              window.location.reload();
            }}
            disabled={loading}
          >
            <ButtonTextWrapper
              loading={loading}
              Text={() => {
                return (
                  <span>
                    {' '}
                    {intl.formatMessage({
                      id: 'refresh',
                      defaultMessage: 'Refresh',
                    })}
                  </span>
                );
              }}
            />
          </button>
        </div>
      </div>
    </Modal>
  );
}
