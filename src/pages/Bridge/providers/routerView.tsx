import React, { createContext, useContext, useState } from 'react';

type Props = {
  routerView: 'entry' | 'history';
  changeRouterView: (view: Props['routerView']) => void;
};

export const RouterViewContext = createContext<Props>(null);

export function RouterViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [routerView, setRouterView] = useState<Props['routerView']>('entry');
  function changeRouterView(view: Props['routerView']) {
    setRouterView(view);
  }

  const exposes = {
    routerView,
    changeRouterView,
  };
  return (
    <RouterViewContext.Provider value={exposes}>
      {children}
    </RouterViewContext.Provider>
  );
}

export function useRouterViewContext() {
  const context = useContext(RouterViewContext);
  if (!context) {
    throw new Error(
      'useRouterViewContext must be used within a RouterViewProvider'
    );
  }
  return context;
}

export default RouterViewProvider;
