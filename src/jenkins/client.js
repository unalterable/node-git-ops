const Jenkins = require('jenkins');
const { createBuildJobConfig, createFolderConfig } = require('./config-templates/index');

const initJenkins = ({ host, username, password }) => {
  let jenkins = Jenkins({
    baseUrl: `http://${username}:${password}@${host}`,
    crumbIssuer: true,
    promisify: true,
  });

  const thisJenkins = {
    info: () => jenkins.info({ depth: 2 }),
    triggerBuild: (name, parameters = {}) => jenkins.job.build({ name, parameters }),
    destroyJob: (projectName, jobName) => jenkins.job.destroy(`${projectName}/${jobName}`),
    destroyFolder: (projectName, jobName) => jenkins.job.destroy(projectName),
    createFolder: (name) => jenkins.job.create(name, createFolderConfig()),
    createPipelineJob: (name, vars) => jenkins.job.create(name, createBuildJobConfig(vars)),
    getJobConfig: (name) => jenkins.job.config(name),
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
        await thisJenkins.createPipelineJob(job, { ...options, projectName });
        await thisJenkins.triggerBuild(job)
      }
      catch(e) {
        throw Error(`Could not create job '${job}'. (${e.message})`);
      }
    },
    getGithubHookUrl: () => `http://${host}/github-webhook`
  };

  return thisJenkins;
}

module.exports = initJenkins;
