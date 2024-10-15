'use client';

import {
  DependencyList,
  EffectCallback,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
} from 'react';
import { debounce, DebounceSettings } from 'lodash';
import {
  safeJSONParse,
  safeJSONStringify,
  storageStore,
} from '../utils/common';

type DebounceOptions = number | ({ wait: number } & Partial<DebounceSettings>);
type RequestOptions<T> = {
  refreshDeps?: React.DependencyList;
  before?: () => boolean | undefined;
  manual?: boolean;
  onSuccess?: (res: T) => void;
  onError?: (err: Error) => void;
  debounceOptions?: DebounceOptions;
  retryCount?: number;
  retryInterval?: number;
  pollingInterval?: number;
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
    retryCount = 0,
    retryInterval = 0,
    pollingInterval,
  } = options || {};

  const pollingTimer = useRef<NodeJS.Timeout | null>(null);
  const clearPolling = useCallback(() => {
    if (pollingTimer.current) {
      clearTimeout(pollingTimer.current);
      pollingTimer.current = null;
    }
  }, []);

  const run = useCallback(async () => {
    clearPolling();
    let attempts = 0;

    const executeRequest = async () => {
      try {
        setLoading(true);
        const res = await request();
        setData(res);
        onSuccess?.(res);
        return true;
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err : new Error(String(err)));
        onError?.(err instanceof Error ? err : new Error(String(err)));
        return false;
      } finally {
        setLoading(false);
      }
    };

    const attemptRequest = async () => {
      const success = await executeRequest();
      if (!success && attempts < retryCount) {
        attempts += 1;
        setTimeout(attemptRequest, retryInterval);
      }
    };

    if (before && !before()) return;
    attemptRequest();

    if (pollingInterval) {
      pollingTimer.current = setTimeout(run, pollingInterval);
    }
  }, [
    request,
    onSuccess,
    onError,
    retryCount,
    retryInterval,
    before,
    pollingInterval,
  ]);

  useDebouncedEffect(
    () => {
      if (manual) return;
      if (before && !before()) return;
      clearPolling();
      run();
      return () => clearPolling();
    },
    [...refreshDeps, clearPolling],
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
    clearPolling,
  };
}

export function useDebouncedEffect(
  effect: EffectCallback,
  deps: React.DependencyList,
  debounceOptions?: DebounceOptions
) {
  useEffect(() => {
    const options =
      typeof debounceOptions === 'number'
        ? { wait: debounceOptions }
        : debounceOptions;
    const debouncedEffect = debounce(
      () => {
        const cleanupFn = effect();
        if (cleanupFn) {
          debouncedEffect.flush = cleanupFn as any;
        }
      },
      options?.wait,
      options
    );

    debouncedEffect();

    return () => {
      debouncedEffect.cancel();
      if (debouncedEffect.flush) {
        debouncedEffect.flush();
      }
    };
  }, [...deps]);
}

export function useAsyncMemo<T>(
  factory: () => Promise<T> | undefined | null,
  deps: DependencyList,
  initial?: T
) {
  const [val, setVal] = useState<T | undefined>(initial);
  useDebouncedEffect(
    () => {
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
    },
    deps,
    300
  );
  return val;
}

export function useAutoResetState<T>(defaultValue: T, wait?: number) {
  const [state, set] = useState<T>(defaultValue);
  const setState = (value: T) => {
    set(value);
    setTimeout(() => {
      set(defaultValue);
    }, wait || 1000);
  };
  return [state, setState] as const;
}

export function useTime(step?: 'second' | 'minute') {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const updateTime = () => setTime(Date.now());

    const interval = step === 'minute' ? 60000 : 1000;

    const timer = setInterval(updateTime, interval);

    return () => clearInterval(timer);
  }, [step]);

  return time;
}

export function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<() => void>();
  const intervalId = useRef<number | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    if (delay !== undefined && delay !== null) {
      intervalId.current = window.setInterval(tick, delay);
      return () => {
        if (intervalId.current) {
          window.clearInterval(intervalId.current);
        }
      };
    }
  }, [delay]);

  const cancel = () => {
    if (intervalId.current !== null) {
      window.clearInterval(intervalId.current);
      intervalId.current = null;
    }
  };

  return cancel;
}

export const useCountDown = (time: number, step?: 'second' | 'minute') => {
  const [count, setCount] = useState(isNaN(time) ? 0 : time);

  useEffect(() => {
    setCount(isNaN(time) ? 0 : time);
  }, [time]);

  useEffect(() => {
    const interval = step === 'minute' ? 60000 : 1000;
    const timer = setInterval(() => {
      setCount((currentCount) => {
        if (currentCount <= 1) {
          clearInterval(timer);
          return 0;
        }
        return currentCount - 1;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [step]);

  return count;
};

export interface UseInfiniteScrollProps {
  /**
   * Whether the infinite scroll is enabled.
   * @default true
   */
  isEnabled?: boolean;
  /**
   * Whether there are more items to load, the observer will disconnect when there are no more items to load.
   */
  hasMore?: boolean;
  /**
   * The distance in pixels before the end of the items that will trigger a call to load more.
   * @default 250
   */
  distance?: number;
  /**
   * Use loader element for the scroll detection.
   */
  shouldUseLoader?: boolean;
  /**
   * Callback to load more items.
   */
  onLoadMore?: () => void;
}

export function useInfiniteScroll(props: UseInfiniteScrollProps = {}) {
  const {
    hasMore,
    distance = 250,
    isEnabled = true,
    shouldUseLoader = true,
    onLoadMore,
  } = props;

  const scrollContainerRef = useRef<HTMLElement>(null);
  const loaderRef = useRef<HTMLElement>(null);

  const previousY = useRef<number>();
  const previousRatio = useRef<number>(0);

  useLayoutEffect(() => {
    const scrollContainerNode = scrollContainerRef.current;

    if (!isEnabled || !scrollContainerNode || !hasMore) return;

    if (shouldUseLoader) {
      const loaderNode = loaderRef.current;

      if (!loaderNode) return;

      const options = {
        root: scrollContainerNode,
        rootMargin: `0px 0px ${distance}px 0px`,
      };

      const listener = (entries: IntersectionObserverEntry[]) => {
        entries.forEach(
          ({ isIntersecting, intersectionRatio, boundingClientRect = {} }) => {
            const y = boundingClientRect.y || 0;

            if (
              isIntersecting &&
              intersectionRatio >= previousRatio.current &&
              (!previousY.current || y < previousY.current)
            ) {
              onLoadMore?.();
            }
            previousY.current = y;
            previousRatio.current = intersectionRatio;
          }
        );
      };

      const observer = new IntersectionObserver(listener, options);

      observer.observe(loaderNode);

      return () => observer.disconnect();
    } else {
      const debouncedOnLoadMore = onLoadMore
        ? debounce(onLoadMore, 200)
        : undefined;

      const checkIfNearBottom = () => {
        if (
          scrollContainerNode.scrollHeight - scrollContainerNode.scrollTop <=
          scrollContainerNode.clientHeight + distance
        ) {
          debouncedOnLoadMore?.();
        }
      };

      scrollContainerNode.addEventListener('scroll', checkIfNearBottom);

      return () => {
        scrollContainerNode.removeEventListener('scroll', checkIfNearBottom);
      };
    }
  }, [hasMore, distance, isEnabled, onLoadMore, shouldUseLoader]);

  return [loaderRef, scrollContainerRef];
}

export function useCopyClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      });
    },
    [setCopied]
  );

  return { copied, copy };
}

export function useStorageState<T>(
  key: string,
  defaultValue: T,
  options?: { storage?: Storage; namespace?: string }
) {
  const { storage, namespace = 'REF_DEFAULT' } = options || {};
  const storageAPI = storageStore(namespace, { storage });
  const [state, _setState] = useState<T>(() => {
    const storedValue = storageAPI?.get(key) as T;
    return storedValue !== undefined ? storedValue : defaultValue;
  });

  const setState: typeof _setState = (value) => {
    _setState(value);
    const _value = typeof value === 'function' ? (value as any)(state) : value;
    if (_value === undefined) {
      storageAPI?.remove(key);
    } else {
      storageAPI?.set(key, _value);
    }
  };

  return [state, setState] as const;
}
