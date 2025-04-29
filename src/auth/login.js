//import axios from 'axios';
import { getBaseRequestConfig, getBaseUrl } from "../utils";
import { getCreds, getIgnoreCreds, getTenant, getToken } from './auth-utils';

const axios = require('axios'); // This comes from bruno context...

// Right now login-with-expiry won't work against localhost
const getLoginWithExpiryUrl = () => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/bl-users/login-with-expiry`;
}

const getLoginUrl = () => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/authn/login`;
}

const doALogin = async ({
  urlOverride = undefined,
  withExpiry = true,
  suppressConsole = true
} = {}) => {
  !suppressConsole && console.log(`doALogin(${urlOverride}, ${withExpiry})`);

  const ignoreCreds = getIgnoreCreds();
  //console.log("URL OVERRIDE: %o", urlOverride)

  // Ensure that x-okapi-tenant is set if NOT set by request
  const preExistingHeaders = req.getHeaders();
  const preExistingTenant = preExistingHeaders[
    Object.keys(preExistingHeaders).find((key) => key.toLowerCase() === 'X-Okapi-Tenant'.toLowerCase())
    ] // Make sure this is case insensitive

  if (!preExistingTenant) {
    req.setHeader('x-okapi-tenant', getTenant()) // Keep an eye on this in PM we needed some funky stuff for "disabled" headers
  }

  // Way to ignore creds for local endpoints
  if (!ignoreCreds || ignoreCreds === false) {
    const url = urlOverride ?? (withExpiry ? getLoginWithExpiryUrl() : getLoginUrl());
    const creds = getCreds();
    const tenant = getTenant();
    const config = getBaseRequestConfig();
    !suppressConsole && console.log(`Sending login request to ${url} with creds ${JSON.stringify(creds)} for tenant: ${tenant}`);

    return await axios.post(
      url,
      creds,
      config
    )
  }
}

const loginFunc = async ({
  urlOverride = undefined,
  withExpiry = true,
  suppressConsole = true
} = {}) => {
  !suppressConsole && console.log(`loginFunc(${urlOverride}, ${withExpiry})`);
  await doALogin({ urlOverride, withExpiry, suppressConsole })
    .then((loginResp) => {
      !suppressConsole && console.log("Setting request headers...")
      // We can't seem to set the cookie jar programatically, so directly set cookies on request instead
      req.setHeader('Cookie', loginResp.headers["set-cookie"])

      const token = loginResp.headers["x-okapi-token"]
      bru.setVar("x-okapi-token-value", token)

      if (!withExpiry) {
        // This is only populated on login, not login with expiry
        req.setHeader('x-okapi-token', getToken())
      }
    })
    .catch(err => {
      console.error("Failed to login to folio: %o", err)
    });
}

const login = (urlOverride) => loginFunc({ urlOverride, withExpiry: false });
const loginWithExpiry = (urlOverride) => loginFunc({ urlOverride });

export {
  doALogin,
  getTenant,
  getLoginWithExpiryUrl,
  getLoginUrl,
  login,
  loginWithExpiry,
}