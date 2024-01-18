import {
  DependencyList,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { debounce, DebounceSettings } from 'lodash';
import { safeJSONParse, safeJSONStringify } from '../utils/common';
import moment from 'moment';

type DebounceOptions = number | ({ wait: number } & Partial<DebounceSettings>);
type RequestOptions<T> = {
  refreshDeps?: React.DependencyList;
  before?: () => boolean | undefined;
  manual?: boolean;
  onSuccess?: (res: T) => void;
  onError?: (err: Error) => void;
  debounceOptions?: DebounceOptions;
};

export function useRequest<T>(
  request: () => Promise<T>,
  options?: RequestOptions<T>
) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const {
    refreshDeps = [],
    before,
    manual,
    onSuccess,
    onError,
    debounceOptions,
  } = options || {};

  const run = useCallback(async () => {
    try {
      setLoading(true);
      const res = await request();

      setData(res);
      onSuccess?.(res);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err : new Error(String(err)));
      onError?.(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [request, onSuccess, onError]);

  useDebouncedEffect(
    () => {
      if (manual) return;
      if (before && !before()) return;
      run();
    },
    [...refreshDeps],
    debounceOptions
  );

  return {
    run,
    data,
    setData,
    loading,
    setLoading,
    error,
    setError,
  };
}

export function useDebouncedEffect(
  effect: () => void,
  deps: React.DependencyList,
  debounceOptions?: DebounceOptions
) {
  useEffect(() => {
    const debouncedEffect =
      typeof debounceOptions === 'number'
        ? debounce(effect, debounceOptions)
        : debounce(effect, debounceOptions?.wait, debounceOptions);

    debouncedEffect();

    return () => debouncedEffect.cancel();
  }, [...deps, debounceOptions]);
}

export function useAsyncMemo<T>(
  factory: () => Promise<T> | undefined | null,
  deps: DependencyList
): T | undefined;
export function useAsyncMemo<T>(
  factory: () => Promise<T> | undefined | null,
  deps: DependencyList,
  initial: T
): T;
export function useAsyncMemo<T>(
  factory: () => Promise<T> | undefined | null,
  deps: DependencyList,
  initial?: T
) {
  const [val, setVal] = useState<T | undefined>(initial);
  useEffect(() => {
    let cancel = false;
    const promise = factory();
    if (promise === undefined || promise === null) return;
    promise.then((val) => {
      if (!cancel) {
        setVal(val);
      }
    });
    return () => {
      cancel = true;
    };
  }, deps);
  return val;
}

export function useStorageState<T>(
  key: string,
  defaultValue?: T
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    const value = localStorage.getItem(key);
    return (value ? safeJSONParse(value) : defaultValue) as T;
  });
  const setStorage = (value: T) => {
    setState(value);
    localStorage.setItem(key, safeJSONStringify(value) ?? '');
  };
  return [state, setStorage];
}

export function useAutoResetState<T>(
  defaultValue: T,
  wait?: number
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(defaultValue);
  const setStorage = (value: T) => {
    setState(value);
    setTimeout(() => {
      setState(defaultValue);
    }, wait || 1000);
  };
  return [state, setStorage];
}

export function useTime(step?: 'second' | 'minute') {
  const [time, setTime] = useState(moment());

  useEffect(() => {
    const updateTime = () => setTime(moment());

    const interval = step === 'minute' ? 60000 : 1000;

    const timer = setInterval(updateTime, interval);

    return () => clearInterval(timer);
  }, [step]);

  return time;
}
