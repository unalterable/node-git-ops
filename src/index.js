const config = require('./config');
const initJenkins = require('./jenkins');
const { initConnection, parseRepoUrl } = require('./github');

const { createActionRouter } = require('./action-router');
const { getFilesChangedSinceLastCommit } = require('./git');

const myGitOpsRepo = config('git.gitOpsRepoUrl');

const myJenkins = initJenkins({
  host: config('jenkins.host'),
  username: config('jenkins.username'),
  password: config('jenkins.password'),
});

const myGithub = initConnection({
  username: config('github.username'),
  token: config('github.token'),
})

const buildMyRouter = () => {
  const router = createActionRouter();

  router.fileAdded('projects/:name/build.json', async (change) => {
    const projectName = change.params.name;
    const options = change.file;
    await myJenkins.createProjectJob(projectName, 'build', options);
    await myGithub.setWebhook({ repo: parseRepoUrl(options.gitRepo), hookEndpoint: myJenkins.getGithubHookUrl })
  });

  router.fileRemoved('projects/:name/build.json', async (change) => {
    const projectName = change.params.name;
    const options = change.file;
    await myJenkins.destroyJob(projectName, 'build');
    const { jobs: jobsInFolder } = await myJenkins.findFolder(projectName);
    if (jobsInFolder.length === 0) await myJenkins.destroyFolder(projectName);
    await myGithub.removeWebhook({ repo: parseRepoUrl(options.gitRepo), hookEndpoint: myJenkins.getGithubHookUrl })
  });

  router.anyChange('*path', async (file) => {
  });

  return router;
};

const processRepo = async (repoUrl, router) => {
  const changedFiles = await getFilesChangedSinceLastCommit(repoUrl) 
  await router.filesToActions(changedFiles);
};

const myActionRouter = buildMyRouter();

processRepo(myGitOpsRepo, myActionRouter).catch(console.error);
