const myActionRouter = require('./routes');
const { getFilesChangedSinceLastCommit } = require('./git');
const { getConfig } = require('./config');

const myGitOpsRepo = getConfig('git.gitOpsRepoUrl');

const processRepo = async (repoUrl, router) => {
  const changedFiles = await getFilesChangedSinceLastCommit(repoUrl);
  await router.filesToActions(changedFiles);
};

module.exports = processRepo(myGitOpsRepo, myActionRouter).catch(console.error);
