const _ = require('lodash');
const axios = require('axios');

const incrementVersion = majorMinorPatch => ({ major, minor, patch }) => {
  switch(majorMinorPatch) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`
  }
}

const getNextVersion = ({ dockerHubRepo, increment }) => {
  return axios.get(`https://index.docker.io/v1/repositories/${dockerHubRepo}/tags`)
    .then(({data}) => _(data)
      .map(({ name }) => name.match(/^([0-9])*\.([0-9]*)\.([0-9]*)$/))
      .filter(match => match)
      .map(match => ({
        major: parseInt(match[1]),
        minor: parseInt(match[2]),
        patch: parseInt(match[3]),
      }))
      .sortBy(['major', 'minor', 'patch'])
      .last()
    )
    .then(currentVersion => currentVersion || { major: 0, minor: 0, patch: 0 })
    .catch(err => ({ major: 0, minor: 0, patch: 0 }))
    .then(incrementVersion(increment))
    .then(console.log)
}

module.exports = { getNextVersion };
