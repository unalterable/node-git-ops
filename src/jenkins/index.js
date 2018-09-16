const fs = require('fs');
const Jenkins = require('jenkins');

const readFile = (path) => fs.readFileSync(path).toString();

const folderConfig = () => readFile(__dirname + '/config-folder.xml');
const jobConfig = () => readFile(__dirname + '/config-job.xml');

const jenkinsClient = ({ host, username, password }) => {
  let jenkins = Jenkins({
    baseUrl: `http://${username}:${password}@${host}`,
    crumbIssuer: true,
    promisify: true,
  })

  const thisClient = {
    info: () => jenkins.info({depth: 2}),
    findFolder: async (folder) => (await thisClient.info()).jobs.find(({ jobs, name }) => jobs && name === folder),
    createFolder: name => jenkins.job.create(name, folderConfig()),
    createJob: name => jenkins.job.create(name, jobConfig()),
  };

  return thisClient;
}

module.exports = jenkinsClient;
