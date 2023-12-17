export const genTokensSymbolArr = (tokens, symbol = '+') => {
  const tokensNode = [];
  let i = 0,
    ti = 0;
  while (ti < tokens?.length) {
    if (i % 2 == 1) {
      tokensNode.push({ symbol });
    } else {
      const value = tokens[ti];
      const toPush: { token?: any; amount?: any } = {};

      if (value?.token) {
        toPush.token = value?.token;
        if (value?.amount) {
          toPush.amount = value?.amount;
        }
      } else {
        toPush.token = value;
      }

      tokensNode.push(toPush);
      ti++;
    }
    i++;
  }
  return tokensNode;
};
