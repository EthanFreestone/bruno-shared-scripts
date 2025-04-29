const { doALogin } = require('./auth');

const axios = require('axios');
const { getBaseRequestConfig } = require('./utils');

export const getFolioAxios = async ({
  urlOverride = undefined,
  withExpiry = true,
  suppressConsole = true
} = {}) => {
  return doALogin({ urlOverride, withExpiry, suppressConsole }).then(loginResp => {

    const config = getBaseRequestConfig()
    config.headers.Cookie = loginResp.headers["set-cookie"]

    if (!withExpiry) {
      // This is only populated on login, not login with expiry
      config.headers['x-okapi-token'] = loginResp.headers["x-okapi-token"]
    }

    !suppressConsole && console.log("folioRequest ready with config: %o", config);
    return axios.create(config);
  })
}
