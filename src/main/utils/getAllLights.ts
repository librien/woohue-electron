import connectToBridge from "./connectToBridge";

export default (ipAddress: string, username: string) => {
  return connectToBridge(ipAddress, username).then(api => {
    return api.lights.getAll().then(lights => {
      return lights;
    })
  });
}
