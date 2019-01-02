const Jenkins = require('jenkins');
const { createBuildJobConfig, createDeployJobConfig, createFolderConfig } = require('./config-templates/index');

const initJenkins = ({ host, username, password, dockerHub }) => {
  let jenkins = Jenkins({
    baseUrl: `http://${username}:${password}@${host}`,
    crumbIssuer: true,
    promisify: true,
  });

  const thisJenkins = {
    info: () => jenkins.info({ depth: 2 }),
    triggerBuild: (name, parameters = {}) => jenkins.job.build({ name, parameters }),
    destroyJob: (projectName, jobName) => jenkins.job.destroy(`${projectName}/${jobName}`),
    destroyFolder: (folderName) => jenkins.job.destroy(folderName),
    createFolder: (name) => jenkins.job.create(name, createFolderConfig()),
    createPipelineJob: (name, config) => jenkins.job.create(name, config),
    getJobConfig: (name) => jenkins.job.config(name),
    findFolder: async (folder) => {
      const info = await thisJenkins.info();
      return info.jobs.find(({ jobs, name }) => jobs && name === folder);
    },
    createFolderIfExists: async (name) => {
      const folder = await thisJenkins.findFolder(name);
      if (!folder) await thisJenkins.createFolder(name);
    },
    createProjectJob: async (projectName, jobName, config) => {
      const job = `${projectName}/${jobName}`;
      try {
        await thisJenkins.createFolderIfExists(projectName);
        await thisJenkins.createPipelineJob(job, config);
      }
      catch(e) {
        throw Error(`Could not create job '${job}'. (${e.message})`);
      }
    },
    createBuildJob: async (projectName, jobName, options) => {
      const job = `${projectName}/${jobName}`;
      const buildConfig = await createBuildJobConfig({ projectName, ...options });
      await thisJenkins.createProjectJob(projectName, jobName, buildConfig);
      await thisJenkins.triggerBuild(job);
    },
    createDeployJob: async (projectName, jobName, options) => {
      const deployConfig = await createDeployJobConfig({ projectName, ...options });
      await thisJenkins.createProjectJob(projectName, jobName, deployConfig);
    },
    getGithubHookUrl: () => `http://${host}/github-webhook`
  };

  return thisJenkins;
};

module.exports = initJenkins;
