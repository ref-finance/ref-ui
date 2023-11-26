export default function request(url: string, options?: RequestInit) {
  return fetch(url, options)
    .then((res) => res.json())
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.log(err);
      return Promise.reject(err);
    });
}
