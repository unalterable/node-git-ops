const axios = require('axios');

const incrementVersion = majorMinorPatch => ({ major, minor, patch}) => {
  switch(majorMinorPatch) {
    case 'major':
      return `${parseInt(major) + 1}.0.0`
    case 'minor':
      return `${major}.${parseInt(minor) + 1}.0`
    case 'patch':
    default:
      return `${major}.${minor}.${parseInt(patch) + 1}`
  }
}

const getNextVersion = ({ dockerHubRepo, increment }) => {
  return axios.get(`https://index.docker.io/v1/repositories/${dockerHubRepo}/tags`)
    .then(({data}) => data
      .sort()
      .map(({ name }) => name.match(/^([0-9])*\.([0-9]*)\.([0-9]*)$/))
      .filter(match => match)
      .pop()
    )
    .then(([_, major, minor, patch]) => ({ major, minor, patch }))
    .then(incrementVersion(increment))
    .then(console.log)
}

module.exports = { getNextVersion };
