const _ = require('lodash');
const axios = require('axios');

const increments = {
  major: curr => ({ major: curr.major + 1, minor: 0, patch: 0 }),
  minor: curr => ({ ...curr, minor: curr.minor + 1, patch: 0 }),
  patch: curr => ({ ...curr, patch: curr.patch + 1 }),
}

const incrementVersion = majorMinorPatch => currentVersion =>
  increments[majorMinorPatch || 'patch'](currentVersion);

const printFormattedNumber = ({ major, minor, patch }) => console.log(`${major}.${minor}.${patch}`);

const fetchNextVersionFromHub = ({ dockerHubRepo }) => axios.get(`https://index.docker.io/v1/repositories/${dockerHubRepo}/tags`)
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
  .catch(err => ({ major: 0, minor: 0, patch: 0 }));

const getCurrentVersionFromHub = ({ dockerHubRepo, increment }) =>
  fetchNextVersionFromHub({ dockerHubRepo })
    .then(printFormattedNumber);

const getNextVersionFromHub = ({ dockerHubRepo, increment }) =>
  fetchNextVersionFromHub({ dockerHubRepo })
    .then(incrementVersion(increment))
    .then(printFormattedNumber);

module.exports = { getNextVersionFromHub };
