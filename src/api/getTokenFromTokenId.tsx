import { DEFAULT_COIN_LIST } from "~consts/DefaultSupportedCoins";

const getTokenFromTokenId = async (tokenId: string) => {
  const tokens = DEFAULT_COIN_LIST;
  const token = tokens.find((token) => token.tokenId === tokenId);

  return token;
};

export default getTokenFromTokenId;
