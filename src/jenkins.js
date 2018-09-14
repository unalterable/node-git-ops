const jenkinsClient = require('jenkins');
const getConfig = require('./config');

module.exports = () => {
  const host = getConfig('jenkins.host');
  const username = getConfig('jenkins.username');
  const password = getConfig('jenkins.password');

  return jenkinsClient({
    baseUrl: `http://${username}:${password}@${host}`,
    crumbIssuer: true,
    promisify: true,
  });
}
