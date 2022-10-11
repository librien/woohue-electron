import { LightState } from 'renderer/types';
import connectToBridge from './connectToBridge';
// Todo: capture light state to return to normal
export default (ipAddress: string, username: string, light: number, state: LightState) => {
  // eslint-disable-next-line global-require
  const {v3} = require('node-hue-api');
  connectToBridge(ipAddress, username).then((api: any) => {
    // eslint-disable-next-line promise/no-nesting
    return api.lights.setLightState(light, state).catch((err: Error) => console.error(err));
  }).catch((err: Error) => {
    console.error(err);
  })
}
