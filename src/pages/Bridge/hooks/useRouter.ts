import { useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

type RouteQuery = Record<string, any>;
export function useRoute<T extends RouteQuery = RouteQuery>() {
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const query = useMemo(
    () => Object.fromEntries(searchParams.entries()) as T,
    [searchParams]
  );
  return { ...location, searchParams, query };
}

export const useRouter = useHistory;
