const { jenkinsClient } = require('./jenkins/index');
const { githubClient, parseRepoUrl } = require('./github/index');
const { getFilesChangedSinceLastCommit } = require('./git');
const { createActionRouter } = require('./action-router');
const config = require('./config');

const myGitOpsRepo = config('git.gitOpsRepoUrl');

const buildMyRouter = () => {
  const router = createActionRouter();

  router.fileAdded('projects/:projectName/build.json', async (change) => {
    const { projectName } = change.params;
    const options = change.file;
    await jenkinsClient.createBuildJob(projectName, 'build', options);
    await githubClient.setWebhook({
      repo: parseRepoUrl(options.gitRepo),
      hookEndpoint: jenkinsClient.getGithubHookUrl(),
    });
  });

  router.fileRemoved('projects/:projectName/build.json', async (change) => {
    const { projectName } = change.params;
    const options = change.file;
    await jenkinsClient.destroyJob(projectName, 'build');
    const { jobs: jobsInFolder } = await jenkinsClient.findFolder(projectName);
    if (jobsInFolder.length === 0) await jenkinsClient.destroyFolder(projectName);
    await githubClient.removeWebhook({
      repo: parseRepoUrl(options.gitRepo),
      hookEndpoint: jenkinsClient.getGithubHookUrl(),
    });
  });

  router.fileAdded('projects/:projectName/deploy.json', async (change) => {
    const { projectName } = change.params;
    const options = change.file;
    await jenkinsClient.createDeployJob(projectName, 'deploy', options);
  });

  router.fileRemoved('projects/:projectName/deploy.json', async (change) => {
    const { projectName } = change.params;
    const options = change.file;
    await jenkinsClient.destroyJob(projectName, 'deploy');
    const { jobs: jobsInFolder } = await jenkinsClient.findFolder(projectName);
    if (jobsInFolder.length === 0) await jenkinsClient.destroyFolder(projectName);
  });

  router.anyChange('*path', async (file) => {
  });

  return router;
};

const processRepo = async (repoUrl, router) => {
  const changedFiles = await getFilesChangedSinceLastCommit(repoUrl);
  await router.filesToActions(changedFiles);
};

const myActionRouter = buildMyRouter();

processRepo(myGitOpsRepo, myActionRouter).catch(console.error);
