//import axios from 'axios';
import { getBaseUrl } from "../utils";
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

const loginFunc = async (urlOverride = undefined, withExpiry = true) => {
  const ignoreCreds = getIgnoreCreds();
  console.log("URL OVERRIDE: %o", urlOverride)

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
    console.log(`Sending login request to ${url} with creds ${JSON.stringify(creds)} for tenant: ${tenant}`);

    await axios.post(
      url,
      creds,
      {
        headers: {
          "Content-type": "application/json",
          "x-okapi-tenant": tenant
        },
      }
    ).then((internalResp) => {
      //console.log("HEADERS: %o", internalResp.headers)

      // We can't seem to set the cookie jar programatically, so directly set cookies on request instead
      req.setHeader('Cookie', internalResp.headers["set-cookie"])
  
      const token = internalResp.headers["x-okapi-token"]
      bru.setVar("x-okapi-token-value", token)
    })
    .catch(err => {
      console.error("WHAT HAPPENED HERE: %o", err);
    });
    
    if (!withExpiry) {
      // This is only populated on login, not login with expiry
      req.setHeader('x-okapi-token', getToken())
    }
  }
};

const login = (urlOverride) => loginFunc(urlOverride, false);
const loginWithExpiry = (urlOverride) => loginFunc(urlOverride);

export {
  getTenant,
  login,
  loginWithExpiry,
}