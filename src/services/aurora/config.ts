export function getAuroraConfig(env: string = process.env.NEAR_ENV) {
  switch (env) {
    case 'production':
    case 'testnet':
      return {
        trisolarisAddress: '0x2cb45edb4517d5947afde3beabf95a582506858b',
        ethBridgeAddress: '0xe9217bc70b7ed1f598ddd3199e80b093fa71124f',
        WETH: '0x1b6A3d5B5DCdF7a37CFE35CeBC0C4bD28eA7e946',
        Pairs: {
          'wNEAR-USDC': '0x37401f53be96E28996d18A1964F47dF9e23b15D2',
          'ETH-USDC': '0x0084B7b4C64eDaaB4d7783e5Fe27f796C4783d44',
        },
      };
    case 'development':
    case 'mainnet':
      return {
        trisolarisAddress: '0x26ec2aFBDFdFB972F106100A3deaE5887353d9B9',
        ethBridgeAddress: '0xe9217bc70b7ed1f598ddd3199e80b093fa71124f',
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
          'wNEAR-LUNA': '0xdF8CbF89ad9b7dAFdd3e37acEc539eEcC8c47914',
          'wNEAR-UST': '0xa9eded3E339b9cd92bB6DEF5c5379d678131fF90',
          'TRI-USDT': '0x61C9E05d1Cdb1b70856c7a2c53fA9c220830633c',
          'wNEAR-AVAX': '0x6443532841a5279cb04420E61Cf855cBEb70dc8C',
          'wNEAR-BNB': '0x7be4a49AA41B34db70e539d4Ae43c7fBDf839DfA',
          'wNEAR-MATIC': '0x3dC236Ea01459F57EFc737A12BA3Bb5F3BFfD071',
          'wNEAR-FLX': '0x48887cEEA1b8AD328d5254BeF774Be91B90FaA09',
          'wNEAR-MECHA': '0xd62f9ec4C4d323A0C111d5e78b77eA33A2AA862f',
          'wNEAR-SOLACE': '0xdDAdf88b007B95fEb42DDbd110034C9a8e9746F2',
          'XTRI-STNEAR': '0x5913f644A10d98c79F2e0b609988640187256373',
          'wNEAR-stNEAR': '0x47924Ae4968832984F4091EEC537dfF5c38948a4',
        },
      };
    default:
      return {
        trisolarisAddress: '0x26ec2aFBDFdFB972F106100A3deaE5887353d9B9',
        ethBridgeAddress: '0xe9217bc70b7ed1f598ddd3199e80b093fa71124f',
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
          'wNEAR-LUNA': '0xdF8CbF89ad9b7dAFdd3e37acEc539eEcC8c47914',
          'wNEAR-UST': '0xa9eded3E339b9cd92bB6DEF5c5379d678131fF90',
          'TRI-USDT': '0x61C9E05d1Cdb1b70856c7a2c53fA9c220830633c',
          'wNEAR-AVAX': '0x6443532841a5279cb04420E61Cf855cBEb70dc8C',
          'wNEAR-BNB': '0x7be4a49AA41B34db70e539d4Ae43c7fBDf839DfA',
          'wNEAR-MATIC': '0x3dC236Ea01459F57EFc737A12BA3Bb5F3BFfD071',
          'wNEAR-FLX': '0x48887cEEA1b8AD328d5254BeF774Be91B90FaA09',
          'wNEAR-MECHA': '0xd62f9ec4C4d323A0C111d5e78b77eA33A2AA862f',
          'wNEAR-SOLACE': '0xdDAdf88b007B95fEb42DDbd110034C9a8e9746F2',
          'XTRI-STNEAR': '0x5913f644A10d98c79F2e0b609988640187256373',
          'wNEAR-stNEAR': '0x47924Ae4968832984F4091EEC537dfF5c38948a4',
        },
      };
  }
}

export const defaultTokenList = {
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
      chainId: 1313161554,
      address: '0x5ac53f985ea80c6af769b9272f35f122201d0f56',
      symbol: 'HAK',
      name: 'Hakuna Matata',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/HAK.svg',
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
      name: 'Allbridge (Allbridge)',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/abr_abr.svg',
      tags: ['ethereum', 'allbridge'],
    },
    {
      chainId: 1313161554,
      address: '0xC4bdd27c33ec7daa6fcfd8532ddB524Bf4038096',
      symbol: 'atLUNA',
      name: 'Luna Terra (Allbridge)',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/abr_atluna.svg',
      tags: ['terra', 'allbridge'],
    },
    {
      chainId: 1313161554,
      address: '0x5ce9F0B6AFb36135b5ddBF11705cEB65E634A9dC',
      symbol: 'atUST',
      name: 'UST Terra (Allbridge)',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/abr_atust.svg',
      tags: ['terra', 'allbridge'],
    },
    {
      chainId: 1313161554,
      address: '0x5C92A4A7f59A9484AFD79DbE251AD2380E589783',
      symbol: 'abBUSD',
      name: 'BUSD BSC (Allbridge)',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/abr_busd.svg',
      tags: ['allbridge'],
    },
    {
      chainId: 1313161554,
      address: '0x0fAD0ED848A7A16526E8a7574e418B015Dbf41B5',
      symbol: 'PAD',
      name: 'SmartPad Token (Allbridge)',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/abr_smartpad.svg',
      tags: ['ethereum', 'allbridge'],
    },
    {
      chainId: 1313161554,
      address: '0x0f00576d07B594Bdc1caf44b6014A6A02E5AFd48',
      symbol: 'SOL',
      name: 'SOL (Allbridge)',
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
      address: '0xe4baf0af161bf03434d1c5a53957981493c12c99',
      symbol: 'bHOME',
      name: 'bHOME',
      decimals: 6,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/bhome.svg',
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
      address: '0xa64514a8af3ff7366ad3d5daa5a548eefcef85e0',
      symbol: 'YFI',
      name: 'yearn.finance',
      decimals: 18,
      logoURI:
        'https://raw.githubusercontent.com/aurora-is-near/bridge-assets/master/tokens/yfi.svg',
      tags: ['ethereum'],
    },
    {
      chainId: 1313161554,
      address: '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB',
      symbol: 'WETH',
      name: 'Wrapped ETH',
      decimals: 18,
      logoURI:
        'https://dappimg.com/media/image/token/a412fe82bd2c11eb8d1e0242ac130005.png',
      tags: ['ethereum'],
    },
  ],
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
};
