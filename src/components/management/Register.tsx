import React, { useState } from 'react';
import FormWrap from '../forms/FormWrap';
import { registerToken } from '../../services/token';
import { useToken } from '../../state/token';
import SelectToken from '../../components/forms/SelectToken';
import Icon from '../../components/tokens/Icon';
import { useIntl } from 'react-intl';

export default function Register({
  initialTokenId,
}: {
  initialTokenId?: string;
}) {
  const [tokenId, setTokenId] = useState<string>(initialTokenId);
  const token = useToken(tokenId);
  const intl = useIntl();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    return registerToken(tokenId);
  };

  return (
    <FormWrap
      buttonText="Whitelist Token"
      canSubmit={!!tokenId}
      onSubmit={handleSubmit}
      info={intl.formatMessage({ id: 'whitelistTokenCopy' })}
    >
      <fieldset className="relative grid grid-cols-12 align-center">
        <input
          className="col-span-11 focus:outline-none shadow bg-inputBg appearance-none border rounded border-opacity-30 w-full py-2 px-3 text-3xl text-inputText leading-tight"
          type="text"
          disabled={!!initialTokenId}
          placeholder={intl.formatMessage({ id: 'enter_token_address' })}
          value={tokenId}
          onChange={({ target }) => setTokenId(target.value)}
        />
        {token?.icon && (
          <SelectToken
            tokens={[token]}
            selected={token && <Icon token={token} />}
          />
        )}
      </fieldset>
    </FormWrap>
  );
}
