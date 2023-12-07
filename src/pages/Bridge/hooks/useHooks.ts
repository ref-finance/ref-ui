import { DependencyList, useEffect, useState } from 'react';
import { debounce, DebounceSettings } from 'lodash';
import { safeJSONParse, safeJSONStringify } from '../utils/common';

type Options<T> = {
  refreshDeps?: React.DependencyList;
  before?: () => boolean | undefined;
  manual?: boolean;
  onSuccess?: (res: T) => void;
  onError?: (err: Error) => void;
  debounceOptions?: number | ({ wait: number } & Partial<DebounceSettings>);
};

export function useRequest<T>(request: () => Promise<T>, options?: Options<T>) {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error>();
  const {
    refreshDeps = [],
    before,
    manual,
    onSuccess,
    onError,
    debounceOptions,
  } = options || {};
  const run = async () => {
    try {
      setLoading(true);
      const res = await request();
      setData(res);
      onSuccess && onSuccess(res);
    } catch (err) {
      console.error(err);
      setError(err);
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };
  const debounceRun = debounce(
    run,
    typeof debounceOptions === 'number'
      ? debounceOptions
      : debounceOptions?.wait || 0
  );
  useEffect(() => {
    if (manual) return;
    if (before && !before()) return;
    run();
  }, [...refreshDeps]);

  return {
    run: debounceOptions ? debounceRun : run,
    data,
    setData,
    loading,
    setLoading,
    error,
    setError,
  };
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
    if (value) {
      return safeJSONParse(value);
    }
    return defaultValue;
  });
  const setStorage = (value: T) => {
    setState(value);
    localStorage.setItem(key, safeJSONStringify(value));
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
