const okapiProtocol = bru.getEnvVar('okapiProtocol');
const okapiUrl = bru.getEnvVar('okapiUrl');
const okapiPort = bru.getEnvVar('okapiPort');

const getBaseUrl = () => {
  return bru.getEnvVar("baseUrl");
}

const setBaseUrl = () => {
  const baseUrl = `${okapiProtocol}://${okapiUrl}${okapiPort ? ':' + okapiPort : ''}`;
  //console.log("WHAT IS BASEURL: %o", baseUrl)
  bru.setEnvVar("baseUrl", baseUrl);
};

export {
  getBaseUrl,
  setBaseUrl,
}