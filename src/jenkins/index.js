const fs = require('fs');
const Mustache = require('mustache');
const Jenkins = require('jenkins');

const readFile = name => fs.readFileSync(__dirname + '/' + name).toString();
const folderConfig = () => readFile('config-folder.xml');
const pipelineJobConfig = vars => Mustache.render(readFile('config-pipeline-job.xml'), vars);

const defaultOptions = { prepScript: 'docker', testScript: 'npm test', buildScript: 'docker' };

const initJenkins = ({ host, username, password }) => {
  let jenkins = Jenkins({
    baseUrl: `http://${username}:${password}@${host}`,
    crumbIssuer: true,
    promisify: true,
  });

  const thisJenkins = {
    info: () => jenkins.info({ depth: 2 }),
    triggerBuild: (job) => jenkins.job.build(job),
    destroyJob: (projectName, jobName) => jenkins.job.destroy(`${projectName}/${jobName}`),
    destroyFolder: (projectName, jobName) => jenkins.job.destroy(projectName),
    createFolder: (name) => jenkins.job.create(name, folderConfig()),
    createPipelineJob: (name, vars) => jenkins.job.create(name, pipelineJobConfig(vars)),
    findFolder: async (folder) => {
      const info = await thisJenkins.info();
      return info.jobs.find(({ jobs, name }) => jobs && name === folder)
    },
    createFolderIfExists: async (name) => {
      const folder = await thisJenkins.findFolder(name);
      if (!folder) await thisJenkins.createFolder(name);
    },
    createProjectJob: async (projectName, jobName, options) => {
      const job = `${projectName}/${jobName}`;
      try {
        await thisJenkins.createFolderIfExists(projectName);
        await thisJenkins.createPipelineJob(job, {...defaultOptions, ...options});
        await thisJenkins.triggerBuild(job)
      }
      catch(e) {
        throw Error(`Could not create job '${job}'. ` + e.message);
      }
    },
    getGithubHookUrl: () => `http://${host}/github`
  };

  return thisJenkins;
}

module.exports = initJenkins;
