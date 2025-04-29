var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
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

// src/utils/baseUrl.js
var okapiProtocol, okapiUrl, okapiPort, getBaseUrl, setBaseUrl;
var init_baseUrl = __esm({
  "src/utils/baseUrl.js"() {
    okapiProtocol = bru.getEnvVar("okapiProtocol");
    okapiUrl = bru.getEnvVar("okapiUrl");
    okapiPort = bru.getEnvVar("okapiPort");
    getBaseUrl = () => {
      return bru.getEnvVar("baseUrl");
    };
    setBaseUrl = () => {
      const baseUrl = `${okapiProtocol}://${okapiUrl}${okapiPort ? ":" + okapiPort : ""}`;
      bru.setEnvVar("baseUrl", baseUrl);
    };
  }
});

// src/auth/auth-utils.js
var getTenant, getToken, getIgnoreCreds, getUserName, getPassword, getCreds;
var init_auth_utils = __esm({
  "src/auth/auth-utils.js"() {
    getTenant = () => {
      return bru.getEnvVar("x-okapi-tenant-value");
    };
    getToken = () => {
      return bru.getVar("x-okapi-token");
    };
    getIgnoreCreds = () => {
      return bru.getEnvVar("ignoreCreds");
    };
    getUserName = () => {
      return bru.getEnvVar("username");
    };
    getPassword = () => {
      return bru.getEnvVar("password");
    };
    getCreds = () => {
      const username = getUserName();
      const password = getPassword();
      return {
        username,
        password
      };
    };
  }
});

// src/auth/login.js
var axios, getLoginWithExpiryUrl, getLoginUrl, doALogin, loginFunc, login, loginWithExpiry;
var init_login = __esm({
  "src/auth/login.js"() {
    init_utils();
    init_auth_utils();
    axios = require("axios");
    getLoginWithExpiryUrl = () => {
      const baseUrl = getBaseUrl();
      return `${baseUrl}/bl-users/login-with-expiry`;
    };
    getLoginUrl = () => {
      const baseUrl = getBaseUrl();
      return `${baseUrl}/authn/login`;
    };
    doALogin = async ({
      urlOverride = void 0,
      withExpiry = true,
      suppressConsole = true
    } = {}) => {
      !suppressConsole && console.log(`doALogin(${urlOverride}, ${withExpiry})`);
      const ignoreCreds = getIgnoreCreds();
      const preExistingHeaders = req.getHeaders();
      const preExistingTenant = preExistingHeaders[Object.keys(preExistingHeaders).find((key) => key.toLowerCase() === "X-Okapi-Tenant".toLowerCase())];
      if (!preExistingTenant) {
        req.setHeader("x-okapi-tenant", getTenant());
      }
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
        ).catch((err) => {
          console.error("Failed to login to FOLIO: %o", err);
        });
      }
    };
    loginFunc = async ({
      urlOverride = void 0,
      withExpiry = true,
      suppressConsole = true
    } = {}) => {
      !suppressConsole && console.log(`loginFunc(${urlOverride}, ${withExpiry})`);
      await doALogin({ urlOverride, withExpiry, suppressConsole }).then((loginResp) => {
        !suppressConsole && console.log("Setting request headers...");
        req.setHeader("Cookie", loginResp.headers["set-cookie"]);
        const token = loginResp.headers["x-okapi-token"];
        bru.setVar("x-okapi-token-value", token);
        if (!withExpiry) {
          req.setHeader("x-okapi-token", getToken());
        }
      });
    };
    login = (urlOverride) => loginFunc({ urlOverride, withExpiry: false });
    loginWithExpiry = (urlOverride) => loginFunc({ urlOverride });
  }
});

// src/auth/index.js
var auth_exports = {};
__export(auth_exports, {
  doALogin: () => doALogin,
  getCreds: () => getCreds,
  getIgnoreCreds: () => getIgnoreCreds,
  getLoginUrl: () => getLoginUrl,
  getLoginWithExpiryUrl: () => getLoginWithExpiryUrl,
  getPassword: () => getPassword,
  getTenant: () => getTenant,
  getToken: () => getToken,
  getUserName: () => getUserName,
  login: () => login,
  loginWithExpiry: () => loginWithExpiry
});
var init_auth = __esm({
  "src/auth/index.js"() {
    init_login();
    init_auth_utils();
  }
});

// src/utils/config.js
var getBaseRequestConfig;
var init_config = __esm({
  "src/utils/config.js"() {
    init_auth();
    getBaseRequestConfig = () => {
      const tenant = getTenant();
      return {
        headers: {
          "Content-type": "application/json",
          "x-okapi-tenant": tenant
        }
      };
    };
  }
});

// src/utils/index.js
var utils_exports = {};
__export(utils_exports, {
  getBaseRequestConfig: () => getBaseRequestConfig,
  getBaseUrl: () => getBaseUrl,
  setBaseUrl: () => setBaseUrl
});
var init_utils = __esm({
  "src/utils/index.js"() {
    init_baseUrl();
    init_config();
  }
});

// src/index.js
var index_exports = {};
__export(index_exports, {
  doALogin: () => doALogin,
  getBaseRequestConfig: () => getBaseRequestConfig,
  getBaseUrl: () => getBaseUrl,
  getCreds: () => getCreds,
  getFolioAxios: () => getFolioAxios,
  getIgnoreCreds: () => getIgnoreCreds,
  getLoginUrl: () => getLoginUrl,
  getLoginWithExpiryUrl: () => getLoginWithExpiryUrl,
  getPassword: () => getPassword,
  getTenant: () => getTenant,
  getToken: () => getToken,
  getUserName: () => getUserName,
  login: () => login,
  loginWithExpiry: () => loginWithExpiry,
  setBaseUrl: () => setBaseUrl
});
module.exports = __toCommonJS(index_exports);
init_utils();
init_auth();

// src/folioRequest.js
var { doALogin: doALogin2 } = (init_auth(), __toCommonJS(auth_exports));
var axios2 = require("axios");
var { getBaseRequestConfig: getBaseRequestConfig2 } = (init_utils(), __toCommonJS(utils_exports));
var getFolioAxios = async ({
  urlOverride = void 0,
  withExpiry = true,
  suppressConsole = true
} = {}) => {
  return doALogin2({ urlOverride, withExpiry, suppressConsole }).then((loginResp) => {
    const config = getBaseRequestConfig2();
    config.headers.Cookie = loginResp.headers["set-cookie"];
    if (!withExpiry) {
      config.headers["x-okapi-token"] = loginResp.headers["x-okapi-token"];
    }
    !suppressConsole && console.log("folioRequest ready with config: %o", config);
    return axios2.create(config);
  });
};
