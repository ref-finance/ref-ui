import { lazy } from 'react';

import { isNewHostName } from './services/config';
interface Route {
  path: string;
  element: any;
  wrapper?: 'AutoHeight' | 'AutoHeightNoOffset' | '';
  exact?: boolean;
}
// 路由
const routes: Route[] = [
  {
    path: '/account',
    element: lazy(
      () => import(/* webpackChunkName: "account" */ 'src/pages/AccountPage')
    ),
  },
  {
    path: '/orderbook/perps',
    element: lazy(
      () =>
        import(
          /* webpackChunkName: "perps" */ 'src/pages/Orderly/OrderlyPerpetual'
        )
    ),
    wrapper: 'AutoHeightNoOffset',
  },
  {
    path: '/orderbook/spot',
    element: lazy(
      () =>
        import(
          /* webpackChunkName: "spot" */ 'src/pages/Orderly/OrderlyTradingBoard'
        )
    ),
    wrapper: 'AutoHeightNoOffset',
  },
  {
    path: '/orderbook',
    element: lazy(
      () =>
        import(
          /* webpackChunkName: "orderbook" */ 'src/pages/Orderly/OrderlyTradingBoard'
        )
    ),
    exact: true,
    wrapper: 'AutoHeightNoOffset',
  },
  {
    path: '/orderly',
    element: lazy(
      () =>
        import(
          /* webpackChunkName: "orderly" */ 'src/pages/Orderly/PorfolioOrderly'
        )
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/overview',
    element: lazy(
      () => import(/* webpackChunkName: "overview" */ 'src/pages/Overview')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/portfolio',
    element: lazy(
      () => import(/* webpackChunkName: "portfolio" */ 'src/pages/Portfolio')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/poolV2/:id',
    element: lazy(
      () =>
        import(
          /* webpackChunkName: "poolV2Detail" */ 'src/pages/poolsV3/PoolDetailV3'
        )
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/farmsMigrate',
    element: lazy(
      () =>
        import(
          /* webpackChunkName: "farmsMigrate" */ 'src/pages/farms/FarmsMigrate'
        )
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/v2farms/:id?',
    element: lazy(
      () =>
        import(
          /* webpackChunkName: "v2farmsDetail" */ 'src/pages/farms/FarmsBoostPage'
        )
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/xref',
    element: lazy(
      () => import(/* webpackChunkName: "xref" */ 'src/pages/xref/XrefPage')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/risks',
    element: lazy(
      () => import(/* webpackChunkName: "risks" */ 'src/pages/RiskPage')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/pools/add-token',
    element: lazy(
      () =>
        import(
          /* webpackChunkName: "addToken" */ 'src/pages/pools/AddTokenPage'
        )
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/pools',
    element: lazy(
      () =>
        import(
          /* webpackChunkName: "pools" */ 'src/pages/pools/LiquidityPage/LiquidityPage'
        )
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/pool/:id',
    element: lazy(
      () =>
        import(
          /* webpackChunkName: "poolDetail" */ 'src/pages/pools/DetailsPage'
        )
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/airdrop',
    element: lazy(
      () => import(/* webpackChunkName: "airdrop" */ 'src/pages/AirdropPage')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/farms',
    element: lazy(
      () => import(/* webpackChunkName: "farms" */ 'src/pages/farms/FarmsPage')
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/sauce/:id',
    element: lazy(
      () =>
        import(
          /* webpackChunkName: "sauceDetail" */ 'src/pages/stable/StableSwapRouter'
        )
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/sauce',
    element: lazy(
      () =>
        import(
          /* webpackChunkName: "sauce" */ 'src/pages/stable/StableSwapEntry'
        )
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/yourliquidity',
    element: lazy(
      () =>
        import(
          /* webpackChunkName: "yourliquidity" */ 'src/pages/poolsV3/YourLiquidityPageV3'
        )
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/yoursLiquidityDetailV2/:id/:status?',
    element: lazy(
      () =>
        import(
          /* webpackChunkName: "yoursLiquidityDetailV2Detail" */ 'src/pages/poolsV3/YourLiquidityDetailV3'
        )
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/addLiquidityV2',
    element: lazy(
      () =>
        import(
          /* webpackChunkName: "addLiquidityV2" */ 'src/pages/poolsV3/AddYourLiquidityPageV3'
        )
    ),
    wrapper: 'AutoHeight',
  },
  {
    path: '/spot',
    element: lazy(() => {
      if (isNewHostName) {
        return import(
          /* webpackChunkName: "spot" */ 'src/pages/Orderly/OrderlyTradingBoard'
        );
      } else {
        return import(/* webpackChunkName: "swap" */ 'src/pages/SwapPage');
      }
    }),
    wrapper: 'AutoHeight',
  },
  {
    path: '/swap',
    element: lazy(() => {
      return import(/* webpackChunkName: "swap" */ 'src/pages/SwapPage');
    }),
    wrapper: 'AutoHeight',
  },
  // {
  //   path: '/meme',
  //   element: lazy(() => {
  //     return import(
  //       /* webpackChunkName: "MemeHotPage" */ 'src/pages/MemeHotPage'
  //     );
  //   }),
  //   wrapper: 'AutoHeight',
  // },
  {
    path: '/meme',
    element: lazy(() => {
      return import(/* webpackChunkName: "MemePage" */ 'src/pages/MemePage');
    }),
    wrapper: 'AutoHeight',
  },
  {
    path: '/airdop',
    element: lazy(() => {
      return import(
        /* webpackChunkName: "memepage" */ 'src/pages/MemeAirdropListForMobile'
      );
    }),
    wrapper: 'AutoHeight',
  },
  {
    path: '/',
    element: lazy(() => {
      if (isNewHostName) {
        return import(
          /* webpackChunkName: "perps" */ 'src/pages/Orderly/OrderlyPerpetual'
        );
      } else {
        return import(/* webpackChunkName: "swap" */ 'src/pages/SwapPage');
      }
    }),
    wrapper: isNewHostName ? 'AutoHeightNoOffset' : 'AutoHeight',
  },
];

export default routes;
