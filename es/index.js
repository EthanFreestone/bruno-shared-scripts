var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var src_exports = {};
__export(src_exports, {
  getBaseUrl: () => getBaseUrl,
  getCreds: () => getCreds,
  getIgnoreCreds: () => getIgnoreCreds,
  getPassword: () => getPassword,
  getTenant: () => getTenant,
  getToken: () => getToken,
  getUserName: () => getUserName,
  login: () => login,
  loginWithExpiry: () => loginWithExpiry,
  setBaseUrl: () => setBaseUrl
});
module.exports = __toCommonJS(src_exports);

// src/utils/baseUrl.js
var okapiProtocol = bru.getEnvVar("okapiProtocol");
var okapiUrl = bru.getEnvVar("okapiUrl");
var okapiPort = bru.getEnvVar("okapiPort");
var getBaseUrl = () => {
  return bru.getEnvVar("baseUrl");
};
var setBaseUrl = () => {
  const baseUrl = `${okapiProtocol}://${okapiUrl}${okapiPort ? ":" + okapiPort : ""}`;
  bru.setEnvVar("baseUrl", baseUrl);
};

// src/auth/auth-utils.js
var getTenant = () => {
  return bru.getEnvVar("x-okapi-tenant-value");
};
var getToken = () => {
  return bru.getVar("x-okapi-token");
};
var getIgnoreCreds = () => {
  return bru.getEnvVar("ignoreCreds");
};
var getUserName = () => {
  return bru.getEnvVar("username");
};
var getPassword = () => {
  return bru.getEnvVar("password");
};
var getCreds = () => {
  const username = getUserName();
  const password = getPassword();
  return {
    username,
    password
  };
};

// src/auth/login.js
var axios = require("axios");
var getLoginWithExpiryUrl = () => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/bl-users/login-with-expiry`;
};
var getLoginUrl = () => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/authn/login`;
};
var loginFunc = async (urlOverride = void 0, withExpiry = true) => {
  const ignoreCreds = getIgnoreCreds();
  console.log("URL OVERRIDE: %o", urlOverride);
  const preExistingHeaders = req.getHeaders();
  const preExistingTenant = preExistingHeaders[Object.keys(preExistingHeaders).find((key) => key.toLowerCase() === "X-Okapi-Tenant".toLowerCase())];
  if (!preExistingTenant) {
    req.setHeader("x-okapi-tenant", getTenant());
  }
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
        }
      }
    ).then((internalResp) => {
      req.setHeader("Cookie", internalResp.headers["set-cookie"]);
      const token = internalResp.headers["x-okapi-token"];
      bru.setVar("x-okapi-token-value", token);
    }).catch((err) => {
      console.error("WHAT HAPPENED HERE: %o", err);
    });
    if (!withExpiry) {
      req.setHeader("x-okapi-token", getToken());
    }
  }
};
var login = (urlOverride) => loginFunc(urlOverride, false);
var loginWithExpiry = (urlOverride) => loginFunc(urlOverride);
