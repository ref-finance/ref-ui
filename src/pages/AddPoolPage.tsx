import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaAngleLeft } from 'react-icons/fa';
import { useWhitelistTokens } from '../state/token';
import { addSimpleLiquidityPool } from '../services/pool';
import FormWrap from '../components/forms/FormWrap';
import SelectToken from '../components/forms/SelectToken';
import Icon from '../components/tokens/Icon';
import { ftRegisterExchange, TokenMetadata } from '../services/ft-contract';
import TabFormWrap from '~components/forms/TabFormWrap';
import { registerTokenAndExchange } from '~services/token';

function AddPool() {
  const [firstToken, setFirstToken] = useState<TokenMetadata>();
  const [secondToken, setSecondToken] = useState<TokenMetadata>();
  const [fee, setFee] = useState<number>(30);

  const tokens = useWhitelistTokens();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    addSimpleLiquidityPool([firstToken.id, secondToken.id], 30);
  };

  return (
    <FormWrap
      buttonText="Add Liquidity Pool"
      canSubmit={firstToken && secondToken && fee !== 0}
      onSubmit={handleSubmit}
    >
      <fieldset className="flex items-center">
        <label className="mr-4 text-2xl text-inputText">Fee: </label>
        <input
          className="focus:outline-none shadow bg-inputBg appearance-none border rounded border-opacity-30 w-full py-2 px-3 text-3xl text-inputText leading-tight"
          type="number"
          value={fee}
          onChange={({ target }) => setFee(Number(target.value))}
        />
      </fieldset>
      <fieldset className="flex justify-around items-center my-3">
        <div className="flex items-center">
          <label className="mr-4 text-2xl text-inputText">Token1: </label>
          <SelectToken
            tokens={tokens}
            selected={firstToken && <Icon token={firstToken} />}
            onSelect={setFirstToken}
          />
        </div>
        <div className="flex items-center">
          <label className="mr-4 text-2xl text-inputText">Token 2: </label>
          <SelectToken
            tokens={tokens}
            selected={secondToken && <Icon token={secondToken} />}
            onSelect={setSecondToken}
          />
        </div>
      </fieldset>
    </FormWrap>
  );
}

function RegisterToken() {
  const [tokenId, setTokenId] = useState<string>();
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    registerTokenAndExchange(tokenId);
  };

  return (
    <FormWrap
      buttonText="Register Token"
      canSubmit={!!tokenId}
      onSubmit={handleSubmit}
    >
      <input
        className="focus:outline-none shadow bg-inputBg appearance-none border rounded border-opacity-30 w-full py-2 px-3 text-3xl text-inputText leading-tight"
        type="text"
        placeholder="Token Address"
        value={tokenId}
        onChange={({ target }) => setTokenId(target.value)}
      />
    </FormWrap>
  );
}

export default function AddPoolPage() {
  return (
    <section className="bg-secondary shadow-2xl rounded p-8 sm:w-full md:w-1/4 lg:w-1/2 m-auto place-self-center">
      <Link to="/pools" className="mb-2">
        <FaAngleLeft size={30} />
      </Link>
      <TabFormWrap titles={['Add Liquidity Pool', 'Register Token']}>
        <AddPool />
        <RegisterToken />
      </TabFormWrap>
    </section>
  );
}
