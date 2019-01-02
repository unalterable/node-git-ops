const { jenkinsClient } = require('./jenkins/index');
const { githubClient, parseRepoUrl } = require('./github/index');

const setupBuildJob = async ({ projectName, appName, options }) => {
  const jobName = `${appName || projectName} (build)`;
  await jenkinsClient.createBuildJob(projectName, jobName, options);
  await githubClient.setWebhook({
    repo: parseRepoUrl(options.gitRepo),
    hookEndpoint: jenkinsClient.getGithubHookUrl(),
  });
};

const teardownBuildJob = async ({ projectName, appName, options }) => {
  const jobName = `${appName || projectName} (build)`;
  await jenkinsClient.destroyJob(projectName, jobName);
  const { jobs: jobsInFolder } = await jenkinsClient.findFolder(projectName);
  if (jobsInFolder.length === 0) await jenkinsClient.destroyFolder(projectName);
  await githubClient.removeWebhook({
    repo: parseRepoUrl(options.gitRepo),
    hookEndpoint: jenkinsClient.getGithubHookUrl(),
  });
};

const setupDeployJob = async ({ projectName, appName, options }) => {
  const jobName = `${appName || projectName} (deploy)`;
  await jenkinsClient.createDeployJob(projectName, jobName, options);
};

const teardownDeployJob = async ({ projectName, appName, options }) => {
  const jobName = `${appName || projectName} (deploy)`;
  await jenkinsClient.destroyJob(projectName, jobName);
  const { jobs: jobsInFolder } = await jenkinsClient.findFolder(projectName);
  if (jobsInFolder.length === 0) await jenkinsClient.destroyFolder(projectName);
};

module.exports = { setupBuildJob, teardownBuildJob, setupDeployJob, teardownDeployJob };
