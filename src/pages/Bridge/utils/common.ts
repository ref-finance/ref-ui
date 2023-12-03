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
