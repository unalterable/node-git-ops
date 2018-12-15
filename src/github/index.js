const urlParse = require('url-parse');
const { getConfig } = require('../config');
const initClient = require('./client');

const githubClient = initClient({
  username: getConfig('github.username'),
  token: getConfig('github.token'),
});

const parseRepoUrl = (url) => {
  const parsedUrl = urlParse(url);
  const path = parsedUrl.pathname.split('/');
  const owner = path[1];
  const name = path[2].split('.')[0];
  return { name, owner };
};

module.exports = { githubClient, parseRepoUrl };
