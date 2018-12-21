const myActionRouter = require('./routes');
const { getFilesChanged } = require('./git');
const { getConfig } = require('./config');

const myGitOpsRepo = getConfig('git.gitOpsRepoUrl');

const processRepo = async ({ repoUrl, router, since }) => {
  const changedFiles = await getFilesChanged({ repoUrl, since });
  const results = await router.filesToActions(changedFiles);
  if(results.some(result => result !== 'success')) throw Error('There were failures');
};

module.exports = processRepo({
  repoUrl: myGitOpsRepo,
  router: myActionRouter,
  since: 'first commit',
})
  .catch(error => console.error(error) || process.exit(1));
