const Jenkins = require('jenkins');
const { createPipelineJobConfig, createFolderConfig } = require('./config-templates/index');

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
    createFolder: (name) => jenkins.job.create(name, createFolderConfig()),
    createPipelineJob: (name, vars) => jenkins.job.create(name, createPipelineJobConfig(vars)),
    getJobConfig: (name, vars) => jenkins.job.config(name),
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
        // must build with default params
        /* await thisJenkins.triggerBuild(job) */
      }
      catch(e) {
        throw Error(`Could not create job '${job}'. `, e.message);
      }
    },
    getGithubHookUrl: () => `http://${host}/github-webhook`
  };

  return thisJenkins;
}

module.exports = initJenkins;
