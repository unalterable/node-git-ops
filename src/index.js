const config = require('./config');

const { createActionRouter } = require('./action-router');
const { getFilesChangedSinceLastCommit } = require('./git');

const myJenkins = initJenkins({
  host: config('jenkins.host'),
  username: config('jenkins.username'),
  password: config('jenkins.password'),
});

const buildMyRouter = () => {
  const router = createActionRouter();

  router.newRoute('projects/:name/build.json', async (change) => {
    const projectName = change.params.name;
    if (change.added || change.renamed){
      await myJenkins.createProjectJob(projectName, 'build')
    }
  }
);

  router.newRoute('*path', async (file) => {
    console.log(file)
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
