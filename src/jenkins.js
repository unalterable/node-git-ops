const jenkinsClient = require('jenkins');
const getConfig = require('./config');

const { host, username, password } = getConfig().jenkins;

const jenkins = jenkinsClient({
  baseUrl: `http://${username}:${password}@${host}`,
  crumbIssuer: true,
  promisify: true,
});

module.exports = jenkins;
