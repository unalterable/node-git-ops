const config = require('./config');
const initJenkins = require('./jenkins')

const { createActionRouter } = require('./action-router');
const { getFilesChangedSinceLastCommit } = require('./git');

const myJenkins = initJenkins({
  host: config('jenkins.host'),
  username: config('jenkins.username'),
  password: config('jenkins.password'),
});

const buildMyRouter = () => {
  const router = createActionRouter();

  router.fileAdded('projects/:name/build.json', async (change) => {
    const projectName = change.params.name;
    const options = change.file;
    await myJenkins.createProjectJob(projectName, 'build', options);
  });

  router.fileRemoved('projects/:name/build.json', async (change) => {
    const projectName = change.params.name;
    await myJenkins.destroyJob(projectName, 'build');
    const { jobs: jobsInFolder } = await myJenkins.findFolder(projectName);
    if (jobsInFolder.length === 0){
      await myJenkins.destroyFolder(projectName);
    }
  });

  router.anyChange('*path', async (file) => {
  });

  return router;
};

const processRepo = async (repoUrl, router) => {
  const changedFiles = await getFilesChangedSinceLastCommit(repoUrl) 
  await router.filesToActions(changedFiles);
};

const myRepo = config('git.repoUrl');
const myActionRouter = buildMyRouter();

processRepo(myRepo, myActionRouter).catch(console.error);
