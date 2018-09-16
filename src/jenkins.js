const jenkinsClient = require('jenkins');
const getConfig = require('./config');

module.exports = ({ host, username, password }) => jenkinsClient({
  baseUrl: `http://${username}:${password}@${host}`,
  crumbIssuer: true,
  promisify: true,
});
