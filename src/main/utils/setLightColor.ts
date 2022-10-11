import connectToBridge from './connectToBridge';
// Todo: capture light state to return to normal
export default (ipAddress: string, username: string, lightId: number, color: {x: string, y: string}) => {
  // eslint-disable-next-line global-require
  const {v3} = require('node-hue-api');
  const {LightState} = v3.lightStates;
  connectToBridge(ipAddress, username).then((api: {lights: any}) => {

    const state = new LightState()
    .on()
    .xy(color.x, color.y)
    .brightness(100);
    return api.lights.setLightState(lightId, state).catch((err: Error) => console.error(err));
  }).catch((err: Error) => {
    console.error(err);
  })
}
