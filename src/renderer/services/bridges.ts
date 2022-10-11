const {v3} = require('node-hue-api');
// eslint-disable-next-line import/prefer-default-export
export const getBridges = async () => {
  // eslint-disable-next-line global-require
  const bridges = await require('node-hue-api').discovery.mdnsSearch()
  // setAvailableBridges(bridges);
  return bridges
}
