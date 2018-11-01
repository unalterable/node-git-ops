const config = require('../config');
const initClient = require('./client');

const jenkinsClient = initClient({
  host: config('jenkins.host'),
  username: config('jenkins.username'),
  password: config('jenkins.password'),
});

module.exports = { jenkinsClient };
