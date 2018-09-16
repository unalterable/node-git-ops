const config = require('./config');

const { createActionRouter } = require('./action-router');
const { getFilesChangedSinceLastCommit } = require('./git');
const { buildJson } = require('./actions/project');


const buildMyRouter = () => {
  const router = createActionRouter();

  router.newRoute('projects/:name/build.json', buildJson);

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
