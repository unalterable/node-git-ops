const jenkinsClient = require('jenkins');
const getConfig = require('./config');

const host = getConfig('jenkins.host');
const username = getConfig('jenkins.username');
const password = getConfig('jenkins.password');

const jenkins = jenkinsClient({
  baseUrl: `http://${username}:${password}@${host}`,
  crumbIssuer: true,
  promisify: true,
});

module.exports = jenkins;
