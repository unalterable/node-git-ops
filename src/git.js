const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v4');
const makeDir = require('make-dir');
const del = require('del');
const gitClient = require('simple-git/promise');
const gitDiffParser = require('git-diff-parser');

const dir = path.join(__dirname, '../');

const provisionWorkspaceDir = async (appDir) => {
  console.info('Clearing Workspace...');
  const gitWorkspaceFolderName = 'git-workspace';
  const gitWorkspaceDir = path.join(dir, gitWorkspaceFolderName);
  await del(gitWorkspaceDir);
  await makeDir(gitWorkspaceDir);
  console.info('...done');
  return gitWorkspaceDir;
};

const getGitRepo = async (repoUrl, workspaceDir) => {
  console.info(`Cloning Repo (${repoUrl})...`);
  const repoFolderName = uuid();
  const repoDir = path.join(workspaceDir, repoFolderName);
  await gitClient(workspaceDir).clone(repoUrl, repoDir);
  console.info('...done');
  return repoDir;
};

const getDiffSinceLastCommit = async (repoDir) => {
  const repo = gitClient(repoDir);
  const { latest: { hash: latestCommitHash} } = await repo.log();
  const diff = await repo.show([latestCommitHash]);
  return diff;
};

const getFilesChangedSinceLastCommit = async (remoteRepoUrl) => {
  const workspaceDir = await provisionWorkspaceDir(dir);
  const repoDir = await getGitRepo(remoteRepoUrl, workspaceDir);
  const diff = await getDiffSinceLastCommit(repoDir);
  return gitDiffParser(diff)
    .commits[0]
    .files
    .map(file => ({
      ...file,
      path: file.name,
      file: !file.deleted && fs.readFileSync(path.join(repoDir, file.name).toString()),
      lines: file
        .lines
        .filter(line => line.type !== 'normal'),
    }));
};

module.exports = {
  getFilesChangedSinceLastCommit,
};
