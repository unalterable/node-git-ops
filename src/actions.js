const { jenkinsClient } = require('./jenkins/index');
const { githubClient, parseRepoUrl } = require('./github/index');

const setupBuildJob = async ({ projectName, options }) => {
  await jenkinsClient.createBuildJob(projectName, 'build', options);
  await githubClient.setWebhook({
    repo: parseRepoUrl(options.gitRepo),
    hookEndpoint: jenkinsClient.getGithubHookUrl(),
  });
};

const teardownBuildJob = async ({ projectName, options }) => {
  await jenkinsClient.destroyJob(projectName, 'build');
  const { jobs: jobsInFolder } = await jenkinsClient.findFolder(projectName);
  if (jobsInFolder.length === 0) await jenkinsClient.destroyFolder(projectName);
  await githubClient.removeWebhook({
    repo: parseRepoUrl(options.gitRepo),
    hookEndpoint: jenkinsClient.getGithubHookUrl(),
  });
};

const setupDeployJob = async ({ projectName, options }) => {
  await jenkinsClient.createDeployJob(projectName, 'deploy', options);
};

const teardownDeployJob = async ({ projectName, options }) => {
  await jenkinsClient.destroyJob(projectName, 'deploy');
  const { jobs: jobsInFolder } = await jenkinsClient.findFolder(projectName);
  if (jobsInFolder.length === 0) await jenkinsClient.destroyFolder(projectName);
};
