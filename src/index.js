const myActionRouter = require('./routes');
const { getFilesChanged } = require('./git');
const { getConfig } = require('./config');

const commitNeededMsg = 'Please supply a commit hash or `first commit` or `last commit`';

(async () => {
  try {
    const sinceCommit = process.argv[2];
    if(!sinceCommit) throw commitNeededMsg;

    const changedFiles = await getFilesChanged({
      repoUrl: getConfig('git.gitOpsRepoUrl'),
      since: sinceCommit,
    });

    const actions = await myActionRouter.filesToActions(changedFiles);

    let failures = false;
    for (const { action, params, file } of actions) {
      try {
        await action({ ...file, params });
        console.info(`'${file.path}': successfully actioned`);
      } catch (e) {
        console.info(`'${file.path}': action failed (${e})`);
        failures = true;
      }
    }

    if(failures) throw 'There were action failures';
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
