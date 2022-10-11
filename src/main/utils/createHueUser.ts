export default async (ipAddress: string) => {
  const applicationName = 'woohue'
  const deviceName = 'electron app'
  // eslint-disable-next-line prefer-destructuring, global-require
  const v3 = require('node-hue-api').v3;
  return v3.api.createLocal(ipAddress).connect()
  .then((api: any) => {
    return api.users.createUser(applicationName, deviceName);
  })
  .then((createdUser: {username: string, clientkey: any}) => {
    // Display the details of user we just created (username and clientkey)
    // eslint-disable-next-line global-require
    const keytar = require('keytar')
    // eslint-disable-next-line promise/catch-or-return, promise/no-nesting
    keytar.setPassword("woohue", createdUser.username, createdUser.clientkey).then((response: any) => {
      console.log(response);
      console.log("User saved successfully");
      console.log(JSON.stringify(createdUser, null, 2));
      return createdUser.username;
    })
    return null;
  })

}
