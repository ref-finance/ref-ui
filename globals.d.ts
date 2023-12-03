declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}
export declare global {
  interface Window {
    /** Provider used for querying Ethereum data (transaction status, sync status ...) */
    ethProvider?: import('@web3-onboard/core').EIP1193Provider;
    ethWeb3Provider?: import('ethers').providers.Web3Provider;
    Near?: import('near-api-js').Near;
    walletNearConnection?: import('near-api-js').WalletConnection;
  }
}
