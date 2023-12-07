export default function request<T>(url: string, options?: RequestInit) {
  return fetch(url, options)
    .then((res) => res.json())
    .then((res) => {
      return res as T;
    })
    .catch((err) => {
      console.log(err);
      return Promise.reject(err);
    });
}
