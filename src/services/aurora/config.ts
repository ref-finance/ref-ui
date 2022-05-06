export function getAuroraConfig(env: string = process.env.NEAR_ENV) {
  switch (env) {
    case 'production':
    case 'pub-testnet':
      return {
        trisolarisAddress: '0x26ec2aFBDFdFB972F106100A3deaE5887353d9B9',
        ethBridgeAddress: '0xe9217bc70b7ed1f598ddd3199e80b093fa71124f',
        factoryAddress: '0x60913758635b54e6C9685f92201A5704eEe74748',
        WETH: '0x1b6A3d5B5DCdF7a37CFE35CeBC0C4bD28eA7e946',
        Pairs: {
          'wNEAR-USDC': '0x37401f53be96E28996d18A1964F47dF9e23b15D2',
          'ETH-USDC': '0x0084B7b4C64eDaaB4d7783e5Fe27f796C4783d44',
          'wNEAR-LINEAR': '0x75164fb3589c568Ce422Ca99aF9d23dCA410541a',
          'ETH-LINEAR': '0xF6E611DE9584A95Df64e587E0C67de94f299C717',
        },
        networkId: 'testnet',
      };
    case 'testnet':
      return {
        trisolarisAddress: '0x26ec2aFBDFdFB972F106100A3deaE5887353d9B9',
        ethBridgeAddress: '0xe9217bc70b7ed1f598ddd3199e80b093fa71124f',
        factoryAddress: '0x60913758635b54e6C9685f92201A5704eEe74748',
        WETH: '0x1b6A3d5B5DCdF7a37CFE35CeBC0C4bD28eA7e946',
        Pairs: {
          'wNEAR-USDC': '0x37401f53be96E28996d18A1964F47dF9e23b15D2',
          'ETH-USDC': '0x0084B7b4C64eDaaB4d7783e5Fe27f796C4783d44',
          'wNEAR-LINEAR': '0x75164fb3589c568Ce422Ca99aF9d23dCA410541a',
          'ETH-LINEAR': '0xF6E611DE9584A95Df64e587E0C67de94f299C717',
        },
        networkId: 'testnet',
      };
    case 'development':
    case 'mainnet':
      return {
        trisolarisAddress: '0x2cb45edb4517d5947afde3beabf95a582506858b',
        ethBridgeAddress: '0xe9217bc70b7ed1f598ddd3199e80b093fa71124f',
        factoryAddress: '0xc66F594268041dB60507F00703b152492fb176E7',
        WETH: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
        Pairs: {
          'wNEAR-TRI': '0x84b123875F0F36B966d0B6Ca14b31121bd9676AD',
          'AURORA-ETH': '0x5eeC60F348cB1D661E4A5122CF4638c7DB7A886e',
          'wNEAR-ETH': '0x63da4DB6Ef4e7C62168aB03982399F9588fCd198',
          'wNEAR-USDC': '0x20F8AeFB5697B77E0BB835A8518BE70775cdA1b0',
          'wNEAR-USDT': '0x03B666f3488a7992b2385B12dF7f35156d7b29cD',
          'USDC-USDT': '0x2fe064B6c7D274082aa5d2624709bC9AE7D16C77',
          'wNEAR-WBTC': '0xbc8A244e8fb683ec1Fd6f88F3cc6E565082174Eb',
          'TRI-AURORA': '0xd1654a7713617d41A8C9530Fb9B948d00e162194',
          'wNEAR-atLUNA': '0xdF8CbF89ad9b7dAFdd3e37acEc539eEcC8c47914',
          'wNEAR-atUST': '0xa9eded3E339b9cd92bB6DEF5c5379d678131fF90',
          'TRI-USDT': '0x61C9E05d1Cdb1b70856c7a2c53fA9c220830633c',
          'wNEAR-AVAX': '0x6443532841a5279cb04420E61Cf855cBEb70dc8C',
          'wNEAR-BNB': '0x7be4a49AA41B34db70e539d4Ae43c7fBDf839DfA',
          'wNEAR-MATIC': '0x3dC236Ea01459F57EFc737A12BA3Bb5F3BFfD071',
          'wNEAR-FLX': '0x48887cEEA1b8AD328d5254BeF774Be91B90FaA09',
          'wNEAR-MECHA': '0xd62f9ec4C4d323A0C111d5e78b77eA33A2AA862f',
          // 'wNEAR-SOLACE': '0xdDAdf88b007B95fEb42DDbd110034C9a8e9746F2',
          'XTRI-STNEAR': '0x5913f644A10d98c79F2e0b609988640187256373',
          'wNEAR-STNEAR': '0x47924Ae4968832984F4091EEC537dfF5c38948a4',
          'AURORA-XNL': '0xb419ff9221039Bdca7bb92A131DD9CF7DEb9b8e5',
          'wNEAR-XNL': '0xFBc4C42159A5575a772BebA7E3BF91DB508E127a',
          'GBA-USDT': '0x7B273238C6DD0453C160f305df35c350a123E505',
          'aUSDO-USDT': '0x6277f94a69Df5df0Bc58b25917B9ECEFBf1b846A',
          'BBT-wNEAR': '0xadaba7e2bf88bd10acb782302a568294566236dc',
          'SHITZU-USDC': '0x5E74D85311fe2409c341Ce49Ce432BB950D221DE',
          'ROSE-wNEAR': '0xbe753E99D0dBd12FB39edF9b884eBF3B1B09f26C',
          'rUSD-wNEAR': '0xbC0e71aE3Ef51ae62103E003A9Be2ffDe8421700',
          'LINEAR-wNEAR': '0xbceA13f9125b0E3B66e979FedBCbf7A4AfBa6fd1',
          'KSW-wNEAR': '0x29C160d2EF4790F9A23B813e7544D99E539c28Ba',
          'AURORA-wNEAR': '0x1e0e812FBcd3EB75D8562AD6F310Ed94D258D008',
        },
        networkId: 'mainnet',
      };
    default:
      return {
        trisolarisAddress: '0x2cb45edb4517d5947afde3beabf95a582506858b',
        ethBridgeAddress: '0xe9217bc70b7ed1f598ddd3199e80b093fa71124f',
        factoryAddress: '0xc66F594268041dB60507F00703b152492fb176E7',
        WETH: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
        Pairs: {
          'wNEAR-TRI': '0x84b123875F0F36B966d0B6Ca14b31121bd9676AD',
          'AURORA-ETH': '0x5eeC60F348cB1D661E4A5122CF4638c7DB7A886e',
          'wNEAR-ETH': '0x63da4DB6Ef4e7C62168aB03982399F9588fCd198',
          'wNEAR-USDC': '0x20F8AeFB5697B77E0BB835A8518BE70775cdA1b0',
          'wNEAR-USDT': '0x03B666f3488a7992b2385B12dF7f35156d7b29cD',
          'USDC-USDT': '0x2fe064B6c7D274082aa5d2624709bC9AE7D16C77',
          'wNEAR-WBTC': '0xbc8A244e8fb683ec1Fd6f88F3cc6E565082174Eb',
          'TRI-AURORA': '0xd1654a7713617d41A8C9530Fb9B948d00e162194',
          'wNEAR-atLUNA': '0xdF8CbF89ad9b7dAFdd3e37acEc539eEcC8c47914',
          'wNEAR-atUST': '0xa9eded3E339b9cd92bB6DEF5c5379d678131fF90',
          'TRI-USDT': '0x61C9E05d1Cdb1b70856c7a2c53fA9c220830633c',
          'wNEAR-AVAX': '0x6443532841a5279cb04420E61Cf855cBEb70dc8C',
          'wNEAR-BNB': '0x7be4a49AA41B34db70e539d4Ae43c7fBDf839DfA',
          'wNEAR-MATIC': '0x3dC236Ea01459F57EFc737A12BA3Bb5F3BFfD071',
          'wNEAR-FLX': '0x48887cEEA1b8AD328d5254BeF774Be91B90FaA09',
          'wNEAR-MECHA': '0xd62f9ec4C4d323A0C111d5e78b77eA33A2AA862f',
          // 'wNEAR-SOLACE': '0xdDAdf88b007B95fEb42DDbd110034C9a8e9746F2',
          'XTRI-STNEAR': '0x5913f644A10d98c79F2e0b609988640187256373',
          'wNEAR-STNEAR': '0x47924Ae4968832984F4091EEC537dfF5c38948a4',
          'AURORA-XNL': '0xb419ff9221039Bdca7bb92A131DD9CF7DEb9b8e5',
          'wNEAR-XNL': '0xFBc4C42159A5575a772BebA7E3BF91DB508E127a',
          'GBA-USDT': '0x7B273238C6DD0453C160f305df35c350a123E505',
          'aUSDO-USDT': '0x6277f94a69Df5df0Bc58b25917B9ECEFBf1b846A',
          'BBT-wNEAR': '0xadaba7e2bf88bd10acb782302a568294566236dc',
          'SHITZU-USDC': '0x5E74D85311fe2409c341Ce49Ce432BB950D221DE',
          'ROSE-wNEAR': '0xbe753E99D0dBd12FB39edF9b884eBF3B1B09f26C',
          'rUSD-wNEAR': '0xbC0e71aE3Ef51ae62103E003A9Be2ffDe8421700',
          'LINEAR-wNEAR': '0xbceA13f9125b0E3B66e979FedBCbf7A4AfBa6fd1',
          'KSW-wNEAR': '0x29C160d2EF4790F9A23B813e7544D99E539c28Ba',
          'AURORA-wNEAR': '0x1e0e812FBcd3EB75D8562AD6F310Ed94D258D008',
        },
        networkId: 'mainnet',
      };
  }
}
export const tokenListTestnet = {
  name: 'Aurora',
  logoURI:
    'https://raw.githubusercontent.com/aurora-is-near/aurora-press-kit/master/Logos/SVG/aurora-stack.svg',
  keywords: ['aurora', 'near', 'rainbow', 'bridge', 'audited', 'verified'],
  tags: {
    aurora: {
      name: 'Native Aurora',
      description: 'Tokens that were deployed initially on Aurora.',
    },
    near: {
      name: 'Native NEAR',
      description:
        'Tokens that were deployed initially on NEAR. They have an equivalent token in Aurora.',
    },
    ethereum: {
      name: 'Native Ethereum',
      description:
        'Tokens that were deployed initially on Ethereum. They have an equivalent token in NEAR and Aurora.',
    },
    bsc: {
      name: 'Native BSC',
      description:
        'Tokens that were deployed initially on BSC. They have an equivalent token in NEAR and Aurora.',
    },
    terra: {
      name: 'Native Terra',
      description:
        'Tokens that were deployed initially on Terra. They have an equivalent token in Aurora.',
    },
  },
  timestamp: '2022-01-19T16:04:39+00:00',
  tokens: [
    {
      chainId: 1313161555,
      address: '0x4861825E75ab14553E5aF711EbbE6873d369d146',
      symbol: 'wNEAR',
      name: 'Wrapped NEAR fungible token',
      decimals: 24,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/near.svg',
      tags: [],
    },
    {
      chainId: 1313161555,
      address: '0xfbe05B1d7bE9A5510C8363e5B9dc1F6AcB03F209',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/usdc.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161555,
      address: '0xE4979CaC5D70F01697f795f0ad56BbcA05912c44',
      symbol: 'LINEAR',
      name: 'LiNEAR',
      decimals: 24,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/linear.svg',
      tags: [],
    },
  ],
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
};

export const tokenListMainnet = {
  name: 'Aurora',
  logoURI:
    'https://raw.githubusercontent.com/aurora-is-near/aurora-press-kit/master/Logos/SVG/aurora-stack.svg',
  keywords: ['aurora', 'near', 'rainbow', 'bridge', 'audited', 'verified'],
  tags: {
    aurora: {
      name: 'Native Aurora',
      description: 'Tokens that were deployed initially on Aurora.',
    },
    near: {
      name: 'Native NEAR',
      description:
        'Tokens that were deployed initially on NEAR. They have an equivalent token in Aurora.',
    },
    ethereum: {
      name: 'Native Ethereum',
      description:
        'Tokens that were deployed initially on Ethereum. They have an equivalent token in NEAR and Aurora.',
    },
    bsc: {
      name: 'Native BSC',
      description:
        'Tokens that were deployed initially on BSC. They have an equivalent token in NEAR and Aurora.',
    },
    terra: {
      name: 'Native Terra',
      description:
        'Tokens that were deployed initially on Terra. They have an equivalent token in Aurora.',
    },
    allbridge: {
      name: 'Bridge Allbridge',
      description: 'Tokens that were bridged using Allbridge',
    },
  },
  timestamp: '2022-04-05T19:17:24+00:00',
  tokens: [
    {
      chainId: 1313161554,
      address: '0xc21ff01229e982d7c8b8691163b0a3cb8f357453',
      symbol: '$META',
      name: 'Meta Token',
      decimals: 24,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/$meta.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x293074789b247cab05357b08052468B5d7A23c5a',
      symbol: 'aUSDO',
      name: 'aUSDO',
      decimals: 8,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/aUSDO.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x4e834cdcc911605227eedddb89fad336ab9dc00a',
      symbol: 'AAVE',
      name: 'Aave Token',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/aave.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x2BAe00C8BC1868a5F7a216E881Bae9e662630111',
      symbol: 'ABR',
      name: 'Allbridge - Allbridge',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/abr_abr.svg',
      tags: ['ethereum', 'allbridge'],
    },
    {
      chainId: 1313161554,
      address: '0x6961775A3Cafa23fcd24Df8F9b72fc98692B9288',
      symbol: 'GATA',
      name: 'Gata Protocol Token',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/gata.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x95f09a800e80a17eac1ba746489c48a1e012d855',
      symbol: 'HBTC',
      name: 'Huobi BTC',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/hbtc.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x5183e1b1091804bc2602586919e6880ac1cf2896',
      symbol: 'USN',
      name: 'USN',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/usn.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0xC4bdd27c33ec7daa6fcfd8532ddB524Bf4038096',
      symbol: 'atLUNA',
      name: 'Luna Terra - Allbridge',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/abr_atluna.svg',
      tags: ['terra', 'allbridge'],
    },
    {
      chainId: 1313161554,
      address: '0x5ce9F0B6AFb36135b5ddBF11705cEB65E634A9dC',
      symbol: 'atUST',
      name: 'UST Terra - Allbridge',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/abr_atust.svg',
      tags: ['terra', 'allbridge'],
    },
    {
      chainId: 1313161554,
      address: '0x5C92A4A7f59A9484AFD79DbE251AD2380E589783',
      symbol: 'abBUSD',
      name: 'BUSD BSC - Allbridge',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/abr_busd.svg',
      tags: ['allbridge'],
    },
    {
      chainId: 1313161554,
      address: '0x0fAD0ED848A7A16526E8a7574e418B015Dbf41B5',
      symbol: 'PAD',
      name: 'SmartPad Token - Allbridge',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/abr_smartpad.svg',
      tags: ['ethereum', 'allbridge'],
    },
    {
      chainId: 1313161554,
      address: '0x0f00576d07B594Bdc1caf44b6014A6A02E5AFd48',
      symbol: 'SOL',
      name: 'SOL - Allbridge',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/abr_sol.svg',
      tags: ['allbridge'],
    },
    {
      chainId: 1313161554,
      address: '0xdc7acde9ff18b4d189010a21a44ce51ec874ea7c',
      symbol: 'agEUR',
      name: 'agEUR',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/ageur.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xb7e3617adb58dc34068522bd20cfe1660780b750',
      symbol: 'ANGLE',
      name: 'ANGLE',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/angle.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x8bec47865ade3b172a928df8f990bc7f2a3b9f79',
      symbol: 'AURORA',
      name: 'Aurora',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/aurora.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xb4530aa877d25e51c18677753acd80ffa54009b2',
      symbol: 'AVRIT',
      name: 'Avrit Learning',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/avrit.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x8973c9ec7b79fe880697cdbca744892682764c37',
      symbol: 'BAKED',
      name: 'BakedToken',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/baked.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xb59d0fdaf498182ff19c4e80c00ecfc4470926e2',
      symbol: 'BAL',
      name: 'Balancer',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/bal.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x2b9025aecc5ce7a8e6880d3e9c6e458927ecba04',
      symbol: 'BAT',
      name: 'Basic Attention Token',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/bat.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x4148d2Ce7816F0AE378d98b40eB3A7211E1fcF0D',
      symbol: 'BBT',
      name: 'BlueBit Token',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/bbt.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0xe4baf0af161bf03434d1c5a53957981493c12c99',
      symbol: 'bHOME',
      name: 'bHome',
      decimals: 6,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/bhome.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x130e6203f05805cd8c44093a53c7b50775eb4ca3',
      symbol: 'BIVE',
      name: 'Bizverse',
      decimals: 4,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/bive.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x9f1f933c660a1dc856f0e0fe058435879c5ccef0',
      symbol: 'BSTN',
      name: 'Bastion',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/bstn.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xdeacf0faa2b80af41470003b5f6cd113d47b4dcd',
      symbol: 'COMP',
      name: 'Compound',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/comp.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xabe9818c5fb5e751c4310be6f0f18c8d85f9bd7f',
      symbol: 'CREAM',
      name: 'Cream Finance',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/cream.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x026dda7f0f0a2e42163c9c80d2a5b6958e35fc49',
      symbol: 'CRF',
      name: 'Crafting Finance',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/crf.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xe3520349f477a5f6eb06107066048508498a291b',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/dai.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xfbd1d8dce2f97bc14239fd507183b98ff1354b39',
      symbol: 'DLTA',
      name: 'delta.theta',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/dlta.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xe301ed8c7630c9678c39e4e45193d1e7dfb914f7',
      symbol: 'DODO',
      name: 'DODO bird',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/dodo.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xd5c997724e4b5756d08e6464c01afbc5f6397236',
      symbol: 'FAME',
      name: 'FAME',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/fame.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xea62791aa682d455614eaa2a12ba3d9a2fd197af',
      symbol: 'FLX',
      name: 'Flux Token',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/flx.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xda2585430fef327ad8ee44af8f1f989a2a91a3d2',
      symbol: 'FRAX',
      name: 'Frax',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/frax.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xc8fdd32e0bf33f0396a18209188bb8c6fb8747d2',
      symbol: 'FXS',
      name: 'Frax Share',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/fxs.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x5ac53f985ea80c6af769b9272f35f122201d0f56',
      symbol: 'HAK',
      name: 'Hakuna Matata',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/hak.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x943f4bf75d5854e92140403255a471950ab8a26f',
      symbol: 'HAPI',
      name: 'HAPI',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/hapi.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x6454e4a4891c6b78a5a85304d34558dda5f3d6d8',
      symbol: 'JUMBO',
      name: 'Jumbo Exchange',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/jumbo.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0xE4eB03598f4DCAB740331fa432f4b85FF58AA97E',
      symbol: 'KSW',
      name: 'KillSwitchToken',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/ksw.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x918dbe087040a41b786f0da83190c293dae24749',
      symbol: 'LINEAR',
      name: 'LiNEAR',
      decimals: 24,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/linear.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x94190d8ef039c670c6d6b9990142e0ce2a1e3178',
      symbol: 'LINK',
      name: 'ChainLink Token',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/link.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xfca152a9916895bf564e3f26a611f9e1e6aa6e73',
      symbol: 'LUNA',
      name: 'Wrapped LUNA Token',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/luna.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x25e801Eb75859Ba4052C4ac4233ceC0264eaDF8c',
      symbol: 'LUNAR',
      name: 'LUNAR',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/lunar.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0xa33C3B53694419824722C10D99ad7cB16Ea62754',
      symbol: 'MECHA',
      name: 'Mecha',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/mecha.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x1d1f82d8b8fc72f29a8c268285347563cb6cd8b3',
      symbol: 'MKR',
      name: 'Maker',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/mkr.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xd126b48c072f4668e944a8895bc74044d5f2e85b',
      symbol: 'MNFT',
      name: 'MANUFACTORY',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/mnft.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x74974575d2f1668c63036d51ff48dbaa68e52408',
      symbol: 'MODA',
      name: 'moda',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/moda.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xC86Ca2BB9C9c9c9F140d832dE00BfA9e153FA1e3',
      symbol: 'NDOL',
      name: 'Necc Dollars',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/ndol.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x6EBA841F1201fFDDe7DDC2ba995D3308f6C4aEa0',
      symbol: 'NECC',
      name: 'Necc',
      decimals: 9,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/necc.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x90eb16621274fb47a071001fbbf7550948874cb5',
      symbol: 'NFD',
      name: 'Feisty Doge NFT',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/nfd.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x449f661c53aE0611a24c2883a910A563A7e42489',
      symbol: 'nNECC',
      name: 'Wrapped Staked Necc',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/nnecc.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x951cfdc9544b726872a8faf56792ef6704731aae',
      symbol: 'OCT',
      name: 'Octopus Network Token',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/oct.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x07b2055fbd17b601c780aeb3abf4c2b3a30c7aae',
      symbol: 'OIN',
      name: 'oinfinance',
      decimals: 8,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/oin.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xc2aa4b56e325266e32582f5f5cece7e88f0c11d2',
      symbol: 'PACHA',
      name: 'PachaVerse DAO',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/pacha.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x885f8CF6E45bdd3fdcDc644efdcd0AC93880c781',
      symbol: 'PAD',
      name: 'NearPad Token',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/pad.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x291c8fceaca3342b29cc36171deb98106f712c66',
      symbol: 'PICKLE',
      name: 'PickleToken',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/pickle.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x09c9d464b58d96837f8d8b6f4d9fe4ad408d3a4f',
      symbol: 'PLY',
      name: 'Aurigami Token',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/ply.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xf0f3b9Eee32b1F490A4b8720cf6F005d4aE9eA86',
      symbol: 'POLAR',
      name: 'POLAR',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/polar.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x8828a5047d093f6354e3fe29ffcb2761300dc994',
      symbol: 'PULSE',
      name: 'Pulse',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/pulse.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x221292443758f63563a1ed04b547278b05845fcb',
      symbol: 'REF',
      name: 'Ref Finance Token',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/ref.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x18921f1e257038e538ba24d49fa6495c8b1617bc',
      symbol: 'REN',
      name: 'Republic',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/ren.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xd9a4c034e69e5162ac02bec627475470a53c9a14',
      symbol: 'rMC',
      name: 'rMutantCoin',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/rmc.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xdc9be1ff012d3c6da818d136a3b2e5fdd4442f74',
      symbol: 'SNX',
      name: 'Synthetix Network Token',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/snx.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x1BDA7007C9e3Bc33267E883864137aF8eb53CC2D',
      symbol: 'SOLACE',
      name: 'solace',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/solace.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x9D6fc90b25976E40adaD5A3EdD08af9ed7a21729',
      symbol: 'SPOLAR',
      name: 'SPOLAR',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/spolar.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x07f9f7f963c5cd2bbffd30ccfb964be114332e30',
      symbol: 'STNEAR',
      name: 'Staked NEAR',
      decimals: 24,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/stnear.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x7821c773a12485b12a2b5b7bc451c3eb200986b1',
      symbol: 'SUSHI',
      name: 'SushiToken',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/sushi.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xFa94348467f64D5A457F75F8bc40495D33c65aBB',
      symbol: 'TRI',
      name: 'Trisolaris',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/tri.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x5454ba0a9e3552f7828616d80a9d2d869726e6f5',
      symbol: 'TUSD',
      name: 'TrueUSD',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/tusd.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x984c2505a14da732d7271416356f535953610340',
      symbol: 'UMINT',
      name: 'YouMinter',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/umint.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x1bc741235ec0ee86ad488fa49b69bb6c823ee7b7',
      symbol: 'UNI',
      name: 'Uniswap',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/uni.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xb12bfca5a55806aaf64e99521918a4bf0fc40802',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/usdc.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x4988a896b1227218e4a686fde5eabdcabd91571f',
      symbol: 'USDT',
      name: 'TetherUS',
      decimals: 6,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/usdt.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x098d5b6a26bca1d71f2335805d71b244f94e8a5f',
      symbol: 'UST',
      name: 'Wrapped UST Token',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/ust.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x17bC24b9bDD8A3E7486E3C3458a5954412F2ff60',
      symbol: 'VRA',
      name: 'Virtual Reality Asset',
      decimals: 4,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/vra.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x7faA64Faf54750a2E3eE621166635fEAF406Ab22',
      symbol: 'WANNA',
      name: 'WannaSwap',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/wanna.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0xf4eb217ba2454613b15dbdea6e5f22276410e89e',
      symbol: 'WBTC',
      name: 'Wrapped BTC',
      decimals: 8,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/wbtc.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d',
      symbol: 'wNEAR',
      name: 'Wrapped NEAR fungible token',
      decimals: 24,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/wnear.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0x99ec8f13b2afef5ec49073b9d20df109d25f78c0',
      symbol: 'WOO',
      name: 'Wootrade Network',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/woo.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xf34d508bac379825255cc80f66cbc89dfeff92e4',
      symbol: 'WSTR',
      name: 'WrappedStar',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/wstr.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x7ca1c28663b76cfde424a9494555b94846205585',
      symbol: 'XNL',
      name: 'Chronicle',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/xnl.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0x802119e4e253D5C19aA06A5d567C5a41596D6803',
      symbol: 'xTRI',
      name: 'TriBar',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/xtri.svg',
      tags: [],
    },
    {
      chainId: 1313161554,
      address: '0xa64514a8af3ff7366ad3d5daa5a548eefcef85e0',
      symbol: 'YFI',
      name: 'yearn.finance',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/yfi.svg',
      tags: ['ethereum'],
    },
  ],
  version: {
    major: 1,
    minor: 10,
    patch: 0,
  },
};

export const defaultTokenList =
  getAuroraConfig().networkId === 'testnet'
    ? tokenListTestnet
    : tokenListMainnet;
