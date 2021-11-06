import axios from 'axios'

const fetcher = (url: string) => axios.get(url, {
  // withCredentials : 캐시 관련
  withCredentials: true
}).then((res) => res.data);

export default fetcher;