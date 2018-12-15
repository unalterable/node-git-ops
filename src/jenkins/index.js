const { getConfig } = require('../config');
const initClient = require('./client');

const jenkinsClient = initClient({
  host: getConfig('jenkins.host'),
  username: getConfig('jenkins.username'),
  password: getConfig('jenkins.password'),
});

module.exports = { jenkinsClient };
