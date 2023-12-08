export default async function request<T>(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return data as T;
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}
