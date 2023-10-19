import { lazy } from 'react';

// 路由
const navs: {
  path: string;
  element: any;
  wrapper?: 'AutoHeight' | 'AutoHeightNoOffset' | ''
}[] = [
    {
      path: '/orderbook/perps',
      element: lazy(() =>
        import('./pages/Orderly/OrderlyPerpetual')
      ),
      wrapper: 'AutoHeightNoOffset',
    },
    {
      path: '/orderbook',
      element: lazy(() =>
        import('./pages/Orderly/OrderlyTradingBoard')
      ),
      wrapper: 'AutoHeightNoOffset',
    },
    {
      path: '/orderbook/spot',
      element: lazy(() =>
        import('./pages/Orderly/OrderlyTradingBoard')
      ),
      wrapper: 'AutoHeightNoOffset',
    },
    {
      path: '/account',
      element: lazy(() =>
        import('./pages/AccountPage')
      ),
    },
    {
      path: '/pools',
      element: lazy(() =>
        import('./pages/pools/LiquidityPage')
      ),
      wrapper: 'AutoHeight',
    },

    {
      path: '/orderly',
      element: lazy(() =>
        import('./pages/Orderly/PorfolioOrderly')
      ),
      wrapper: 'AutoHeight',
    },
    {
      path: '/burrow',
      element: lazy(() =>
        import('./pages/Burrow')
      ),
      wrapper: 'AutoHeight',
    },
    {
      path: '/overview',
      element: lazy(() =>
        import('./pages/Overview')
      ),
      wrapper: 'AutoHeight',
    },
    {
      path: '/portfolio',
      element: lazy(() =>
        import('./pages/Portfolio')
      ),
      wrapper: 'AutoHeight',
    },
    {
      path: '/poolV2/:id',
      element: lazy(() =>
        import('./pages/poolsV3/PoolDetailV3')
      ),
      wrapper: 'AutoHeight',
    },
    {
      path: '/farmsMigrate',
      element: lazy(() =>
        import('src/pages/farms/FarmsMigrate')
      ),
      wrapper: 'AutoHeight',
    },
    {
      path: '/v2farms/:id?',
      element: lazy(() =>
        import('src/pages/farms/FarmsBoostPage')
      ),
      wrapper: 'AutoHeight',
    },
    {
      path: '/xref',
      element: lazy(() =>
        import('src/pages/xref/XrefPage')
      ),
      wrapper: 'AutoHeight',
    },
    {
      path: '/risks',
      element: lazy(() =>
        import('./pages/RiskPage')
      ),
      wrapper: 'AutoHeight',
    },
    {
      path: '/sauce',
      element: lazy(() =>
        import('src/pages/stable/StableSwapEntry')
      ),
      wrapper: 'AutoHeight',
    },
   

    {
      path: '/',
      element: lazy(() =>
        import('./pages/SwapPage')
      ),
      wrapper: 'AutoHeight',
    },
  ]

export default navs;
