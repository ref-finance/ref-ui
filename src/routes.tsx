import { lazy } from 'react';


interface Route {
  path: string;
  element: any;
  wrapper?: 'AutoHeight' | 'AutoHeightNoOffset' | ''
}
// 路由
const routes: Route[] = [
  {
    path: '/orderbook/perps',
    element: lazy(() =>
      import('src/pages/Orderly/OrderlyPerpetual')
    ),
    wrapper: 'AutoHeightNoOffset',
  },
  {
    path: '/orderbook',
    element: lazy(() =>
      import('src/pages/Orderly/OrderlyTradingBoard')
    ),
    wrapper: 'AutoHeightNoOffset',
  },
  {
    path: '/orderbook/spot',
    element: lazy(() =>
      import('src/pages/Orderly/OrderlyTradingBoard')
    ),
    wrapper: 'AutoHeightNoOffset',
  },
  {
    path: '/account',
    element: lazy(() =>
      import('src/pages/AccountPage')
    ),
  },
  {
    path: '/pools',
    element: lazy(() =>
      import('src/pages/pools/LiquidityPage')
    ),
    wrapper: 'AutoHeight',
  },

  {
    path: '/orderly',
    element: lazy(() =>
      import('src/pages/Orderly/PorfolioOrderly')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/burrow',
    element: lazy(() =>
      import('src/pages/Burrow')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/overview',
    element: lazy(() =>
      import('src/pages/Overview')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/portfolio',
    element: lazy(() =>
      import('src/pages/Portfolio')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/poolV2/:id',
    element: lazy(() =>
      import('src/pages/poolsV3/PoolDetailV3')
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
      import('src/pages/RiskPage')
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
    path: '/recent',
    element: lazy(() =>
      import('src/pages/RecentActivityPage')
    ),
    wrapper: '',
  },
  {
    path: '/more_pools/:tokenIds',
    element: lazy(() =>
      import('src/pages/pools/MorePoolsPage')
    ),
    wrapper: 'AutoHeight'
  },
  {
    path: '/pool/:id',
    element: lazy(() =>
      import('src/pages/pools/DetailsPage')
    ),
    wrapper: 'AutoHeight'
  },
  {
    path: '/pools/add-token',
    element: lazy(() =>
      import('src/pages/pools/AddTokenPage')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/airdrop',
    element: lazy(() =>
      import('src/pages/AirdropPage')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/farms',
    element: lazy(() =>
      import('src/pages/farms/FarmsPage')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/sauce/:id',
    element: lazy(() =>
      import('src/pages/stable/StableSwapRouter')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/myOrder',
    element: lazy(() =>
      import('src/pages/MyOrder')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/yourliquidity',
    element: lazy(() =>
      import('src/pages/poolsV3/YourLiquidityPageV3')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/yoursLiquidityDetailV2/:id/:status',
    element: lazy(() =>
      import('src/pages/poolsV3/YourLiquidityDetailV3')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/addLiquidityV2',
    element: lazy(() =>
      import('src/pages/poolsV3/AddYourLiquidityPageV3')
    ),
    wrapper: 'AutoHeight',
  },

  {
    path: '/',
    element: lazy(() =>
      import('src/pages/SwapPage')
    ),
    wrapper: 'AutoHeight',
  },
]

export default routes;
