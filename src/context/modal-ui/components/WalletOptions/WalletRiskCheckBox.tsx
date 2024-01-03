import { useIntl } from 'react-intl';
import React, { useState } from 'react';
import { Checkbox, CheckboxSelected } from 'src/components/icon';
import CustomModal from 'src/components/customModal/customModal';
import { WalletSelectorFooter } from 'src/context/modal-ui/components/WalletOptions/WalletOptions';

export const WalletRiskCheckBox = (props: any) => {
  const { setCheckedStatus } = props;
  // <FormattedMessage id="login_risk_tip"></FormattedMessage>
  const intl = useIntl();
  const login_tip = intl.formatMessage({ id: 'login_risk_tip' });
  const [checkBoxStatus, setCheckBoxStatus] = useState(false);

  function switchCheckBox() {
    const newStatus = !checkBoxStatus;
    setCheckBoxStatus(newStatus);
    setCheckedStatus(newStatus);
  }

  return (
    <div
      className={`flex items-start ${checkBoxStatus ? 'my-4' : 'mb-4 mt-1'}`}
    >
      {checkBoxStatus ? (
        <CheckboxSelected
          className="relative flex-shrink-0 mr-3 top-1 cursor-pointer"
          onClick={switchCheckBox}
        ></CheckboxSelected>
      ) : (
        <Checkbox
          className="relative flex-shrink-0 mr-3 top-1 cursor-pointer"
          onClick={switchCheckBox}
        ></Checkbox>
      )}
      <span
        className="text-sm text-v3SwapGray"
        dangerouslySetInnerHTML={{ __html: login_tip }}
      ></span>
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  setCheckedStatus: any;
  onClose: any;
}

export const WalletRiskCheckBoxModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  setCheckedStatus,
}) => {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      onOutsideClick={onClose}
      className={'modal-style1x'}
      title={'Connect Wallet'}
      width={470}
    >
      <WalletRiskCheckBox setCheckedStatus={setCheckedStatus} />
      <WalletSelectorFooter />
    </CustomModal>
  );
};
