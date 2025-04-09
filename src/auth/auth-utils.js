const getTenant = () => {
  return bru.getEnvVar("x-okapi-tenant-value")
};

const getToken = () => {
  return bru.getVar("x-okapi-token")
};

const getIgnoreCreds = () => {
  return bru.getEnvVar("ignoreCreds")
}

const getUserName = () => {
  return bru.getEnvVar("username")
}

const getPassword = () => {
  return bru.getEnvVar("password")
}

const getCreds = () => {
  const username = getUserName();
  const password = getPassword();

  return {
    username,
    password
  }
}

export {
  getTenant,
  getToken,
  getIgnoreCreds,
  getUserName,
  getPassword,
  getCreds
};
