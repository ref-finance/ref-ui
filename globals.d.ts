declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}
export declare global {
  interface Window {
    /** Provider used for querying Ethereum data (transaction status, sync status ...) */
    ethWeb3Provider?: import('ethers').providers.Web3Provider;
  }
}
