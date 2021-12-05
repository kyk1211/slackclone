import axios from 'axios';

const fetcher = <Data>(url: string) =>
  axios
    .get<Data>(url, {
      // withCredentials : 캐시 관련
      withCredentials: true,
    })
    .then((res) => res.data);

export default fetcher;
