export default (host: string, username: string) => {
  // eslint-disable-next-line global-require
  const hueApi = require('node-hue-api');
  const {v3} = hueApi
  const api = v3.api.createLocal(host).connect(username);
  return api;
}
