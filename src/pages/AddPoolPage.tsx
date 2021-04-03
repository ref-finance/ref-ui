import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaAngleLeft } from 'react-icons/fa';
import { useWhitelistTokens } from '~/state/token';
import { addSimpleLiquidityPool } from '~/services/pool';
import FormWrap from '~components/forms/FormWrap';
import SelectToken from '~components/forms/SelectToken';
import Icon from '~components/tokens/Icon';
import { TokenMetadata } from '~services/ft-contract';

export default function AddPool() {
  const [firstToken, setFirstToken] = useState<TokenMetadata>();
  const [secondToken, setSecondToken] = useState<TokenMetadata>();
  const [fee, setFee] = useState<number>(30);

  const tokens = useWhitelistTokens();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    addSimpleLiquidityPool([firstToken.id, secondToken.id], 30);
  };

  return (
    <section className="bg-secondary shadow-2xl rounded p-8 sm:w-full md:w-1/4 lg:w-1/2 m-auto place-self-center">
      <Link to="/pools" className="mb-2">
        <FaAngleLeft size={30} />
      </Link>
      <FormWrap
        title="Add Liquidity Pool"
        canSubmit={firstToken && secondToken && fee !== 0}
        onSubmit={handleSubmit}
      >
        <input
          type="number"
          value={fee}
          onChange={({ target }) => setFee(Number(target.value))}
        />
        <SelectToken
          tokens={tokens}
          selected={firstToken && <Icon token={firstToken} />}
          onSelect={setFirstToken}
        />
        <SelectToken
          tokens={tokens}
          selected={secondToken && <Icon token={secondToken} />}
          onSelect={setSecondToken}
        />
      </FormWrap>
    </section>
  );
}
