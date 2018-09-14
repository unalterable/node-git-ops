const git = require('./git');
const jenkins = require('./jenkins');
const getConfig = require('./config');

const repoPath = getConfig('git.repoPath');

(async () => {
  const action = await git.getChangeActioner(repoPath)

  action('app/**', async (files) => {
    const info = await jenkins.info()
    console.log('info', info)
    console.log('files', files)
  })

  action('app/*', async (files) => {
    console.log(files)
  })

})();
