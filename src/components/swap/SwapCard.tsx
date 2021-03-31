import React, { useEffect, useState } from 'react';
import InputAmount from '~components/forms/InputAmount';
import SelectToken from '~components/forms/SelectToken';
import Icon from '~components/tokens/Icon';
import {
  getRegisteredTokens,
  getTokenMetadata,
  TokenMetadata,
} from '~services/token';
import { useSwap } from '../../state/swap';

export default function SwapCard() {
  const [tokens, setTokens] = useState<TokenMetadata[]>();
  const [tokenIn, setTokenIn] = useState<TokenMetadata>();
  const [tokenInAmount, setTokenInAmount] = useState<string>();
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();

  const { tokenOutAmount, makeSwap } = useSwap({
    tokenInId: tokenIn?.id,
    tokenInAmount,
    tokenOutId: tokenOut?.id,
  });

  useEffect(() => {
    getRegisteredTokens()
      .then((tokenIds) =>
        Promise.all(tokenIds.map((tokenId) => getTokenMetadata(tokenId)))
      )
      .then(setTokens);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    makeSwap();
  };

  return (
    <form
      className="bg-white shadow-md rounded px-8 pt-6 pb-1 mb-4 max-w-md"
      onSubmit={handleSubmit}
    >
      <fieldset className="relative grid grid-cols-12 align-center">
        <InputAmount
          className="col-span-11"
          value={tokenInAmount}
          onChange={({ target }) => setTokenInAmount(target.value)}
        />
        <SelectToken
          tokens={tokens}
          selected={tokenIn && <Icon token={tokenIn} />}
          onSelect={(token) => setTokenIn(token)}
        />
      </fieldset>
      <fieldset className="relative grid grid-cols-12 align-center">
        <InputAmount className="col-span-11" value={tokenOutAmount} />
        <SelectToken
          tokens={tokens}
          selected={tokenOut && <Icon token={tokenOut} />}
          onSelect={(token) => setTokenOut(token)}
        />
      </fieldset>
      <button className="my-8 h-10 w-full border border-black flex-row-centered shadow-lg hover:bg-disabledGray rounded-lg transition-colors">
        Swap
      </button>
    </form>
  );
}
