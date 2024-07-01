export const logger = {
  log(...args: any[]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
};

export function safeJSONParse<T>(str: string): T | undefined {
  try {
    return JSON.parse(str) as T;
  } catch (e) {
    console.error('safeJSONParse', e);
    return undefined;
  }
}

export function safeJSONStringify(obj: any): string | undefined {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    console.error('safeJSONStringify', e);
    return undefined;
  }
}

export function storageStore(
  namespace?: string,
  options?: { storage?: Storage }
) {
  if (typeof window === 'undefined') return;
  const _namespace = namespace || 'default';
  const storage = options?.storage || window?.localStorage;
  const namespaceKey = (key: string) => {
    return _namespace + ':' + key;
  };
  return {
    set(key: string, value: any) {
      const _value = safeJSONStringify(value);
      _value
        ? storage.setItem(namespaceKey(key), _value)
        : storage.removeItem(namespaceKey(key));
    },
    get<T>(key: string) {
      const _value = storage.getItem(namespaceKey(key));
      return _value ? safeJSONParse<T>(_value) : undefined;
    },
    remove(key: string) {
      storage.removeItem(namespaceKey(key));
    },
    clearAll: function clearAll() {
      for (const key in storage) {
        if (key.startsWith(namespace + ':')) {
          storage.removeItem(key);
        }
      }
    },
  };
}

export function sleep(ms?: number) {
  return new Promise((resolve) => setTimeout(resolve, ms ?? 0));
}

export function generateUrl(
  url = '',
  query: Record<string, any>,
  hashes: Record<string, any> = {}
) {
  const queryStringParts = [];
  for (const key in query) {
    const value = query[key];
    if ([undefined, null, ''].includes(value)) continue;
    if (Array.isArray(value)) {
      value.forEach((_value) => {
        queryStringParts.push(
          encodeURIComponent(key) + '[]=' + encodeURIComponent(_value)
        );
      });
    } else {
      queryStringParts.push(
        encodeURIComponent(key) + '=' + encodeURIComponent(value)
      );
    }
  }
  const queryString = queryStringParts.join('&');
  if (queryString) {
    url += url.includes('?') ? '&' : '?';
    url += queryString;
  }

  const hashStringParts = [];
  for (const key in hashes) {
    const value = hashes[key];
    if ([undefined, null, ''].includes(value)) continue;
    hashStringParts.push(
      encodeURIComponent(key) + '=' + encodeURIComponent(value)
    );
  }
  const hashString = hashStringParts.join('&');
  if (hashString) {
    url += '#' + hashString;
  }

  return url;
}

export const getUrlQuery = (url?: string) => {
  try {
    const search = url
      ? url.split('?')[1]?.split('#')[0]
      : window.location.search.substring(1).split('#')[0];
    const urlSearchParams = new URLSearchParams(search);
    const entries = urlSearchParams.entries();
    const query = {} as Record<string, any>;
    for (const [key, value] of entries) {
      if (query[key]) {
        query[key] = Array.isArray(query[key])
          ? [...(query[key] as string[]), value]
          : [query[key], value];
      } else {
        query[key] = value;
      }
    }
    return query;
  } catch (error) {
    return {};
  }
};

export const getUrlHash = (
  url: string = window.location.href
): Record<string, string | string[]> => {
  const { hash } = new URL(url.endsWith('&') ? url.slice(0, -1) : url);

  if (!hash) return {};

  const hashParams = new URLSearchParams(hash.slice(1));
  const hashes: Record<string, string | string[]> = {};

  hashParams.forEach((value, key) => {
    hashes[key] = key in hashes ? [...hashes[key], value] : value;
  });

  return hashes;
};

export const isTruncated = (el: HTMLElement) => {
  if (!el) return false;
  if (el.scrollHeight > el.clientHeight) return true;

  const textContent = el;
  const targetW = textContent.getBoundingClientRect().width ?? 0;
  const range = document.createRange();
  range.setStart(textContent, 0);
  range.setEnd(textContent, textContent.childNodes.length);
  const rangeWidth = range.getBoundingClientRect().width;
  return rangeWidth > targetW;
};
