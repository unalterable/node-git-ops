const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v4');
const makeDir = require('make-dir');
const del = require('del');
const gitClient = require('simple-git/promise');
const gitDiffParser = require('git-diff-parser');

const dir = path.join(__dirname, '../');

const getPrevCommitHash = repo => repo.log().then(log => log.all[1].hash);
const getFirstCommitHash = repo => repo.log().then(log => log.all[log.all.length-1].hash);

const readJsonFromFile = (directory, fileName) => {
  try {
    const file = fs.readFileSync(path.join(directory, fileName)).toString();
    return JSON.parse(file);
  }
  catch (e) {
    throw Error (`File '${fileName} could not be read as JSON: ${e}`);
  }
};

const provisionWorkspaceDir = async (appDir) => {
  console.info('Clearing Workspace...');
  const gitWorkspaceFolderName = 'git-workspace';
  const gitWorkspaceDir = path.join(appDir, gitWorkspaceFolderName);
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

const getDiff = async (repoDir, since) => {
  const repo = gitClient(repoDir);
  const getHash = {'last commit': getPrevCommitHash, 'first commit': getFirstCommitHash }[since];
  const hash = getHash ? await getHash(repo) : since;
  const diff = await repo.diff([hash]);
  return gitDiffParser(diff).commits[0];
};

const getFilesChanged = async ({ repoUrl, since }) => {
  const workspaceDir = await provisionWorkspaceDir(dir);
  const repoDir = await getGitRepo(repoUrl, workspaceDir);
  const diff = await getDiff(repoDir, since || 'last commit');
  return diff
    .files
    .map(file => ({
      ...file,
      path: file.name,
      file: !file.deleted && readJsonFromFile(repoDir, file.name),
      lines: file.lines.filter(line => line.type !== 'normal'),
    }));
};

module.exports = {
  getFilesChanged,
};
