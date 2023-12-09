export const isValidEthereumAddress = (address: string) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const isValidNearAddress = (address: string) => {
  return (
    /^[a-z0-9](?:[a-z0-9-_]*[a-z0-9])?\.(near|testnet)$/.test(address) ||
    /^[0-9a-fA-F]{64}$/.test(address)
  );
};
