const config = require('./config');
const { createActionRouter } = require('./actionRouter');
const { getFilesChangedSinceLastCommit } = require('./git');
const initJenkins = require('./jenkins');

const myJenkins = initJenkins({
  host: config('jenkins.host'),
  username: config('jenkins.username'),
  password: config('jenkins.password'),
});

const buildMyRouter = () => {
  const router = createActionRouter();

  router.newRoute('projects/:name/:file', async (file) => {
    if (file.added || file.renamed){
      console.log('file', file)
      const info = await myJenkins.info()
      console.log('info', info)
    }
  });

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

processRepo(myRepo, myActionRouter);
