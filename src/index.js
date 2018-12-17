const myActionRouter = require('./routes');
const { getFilesChangedSinceLastCommit } = require('./git');
const { getConfig } = require('./config');

const myGitOpsRepo = getConfig('git.gitOpsRepoUrl');

const processRepo = async (repoUrl, router) => {
  const changedFiles = await getFilesChangedSinceLastCommit(repoUrl);
  const results = await router.filesToActions(changedFiles);
  if(results.some(result => result !== 'success')) throw Error('There were failures');
};

module.exports = processRepo(myGitOpsRepo, myActionRouter).catch(error => console.error(error) || process.exit(1));
