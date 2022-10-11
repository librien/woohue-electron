import connectToBridge from "./connectToBridge";

export default (ipAddress: string, username: string, lightId: number) => {
  return connectToBridge(ipAddress, username).then((api: any) => {
    return api.lights.getLightState(lightId);
  });
}
