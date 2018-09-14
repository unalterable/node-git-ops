const path = require('path');
const uuid = require('uuid/v4');
const makeDir = require('make-dir');
const del = require('del');
const matcher = require('matcher');
const gitClient = require('simple-git/promise');
const gitDiffParser = require('git-diff-parser');

const dir = path.join(__dirname, '../');

const provisionWorkspaceDir = async (appDir) => {
  console.info('Clearing Workspace...')
  const gitWorkspaceFolderName = 'git-workspace';
  const gitWorkspaceDir = path.join(dir, gitWorkspaceFolderName);
  await del(gitWorkspaceDir);
  await makeDir(gitWorkspaceDir);
  console.info('...done');
  return gitWorkspaceDir;
};

const getGitRepo = async (repoUrl, workspaceDir) => {
  console.info(`Cloning Repo (${repoUrl})...`)
  const repoFolderName = uuid();
  const repoDir = path.join(workspaceDir, repoFolderName);
  await gitClient(workspaceDir).clone(repoUrl, repoDir);
  console.info('...done')
  return repoDir;
};

const getChangesSinceLastCommit = async repoDir => {
  const repo = gitClient(repoDir)
  const { latest: { hash: latestCommitHash} } = await repo.log();
  const diff = gitDiffParser(await repo.show([latestCommitHash]))
  return diff.commits[0];
};

const changeActionBuilder = (changes, repoDir ) =>
  (pathMatcher, cb) => {
    const matchedFiles = changes
      .files
      .filter(file => matcher.isMatch(file.name, pathMatcher))
      .map(file => ({
        ...file,
        file: require(path.join(repoDir, file.name)),
        lines: file
          .lines
          .filter(line => line.type !== 'normal'),
      }));

    if(matchedFiles.length > 0) {
      cb(pathMatcher.includes('*') ? matchedFiles : matchedFiles[0]);
    }
  }

const getChangeActioner = async (remoteRepoUrl) => {
  const workspaceDir = await provisionWorkspaceDir(dir);
  const repoDir = await getGitRepo(remoteRepoUrl, workspaceDir);
  const changesSinceLastCommit = await getChangesSinceLastCommit(repoDir)
  return changeActionBuilder(changesSinceLastCommit, repoDir);
};

module.exports = {
  getChangeActioner,
}
