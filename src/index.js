const config = require('./config');
const git = require('./git');
const initJenkins = require('./jenkins');

(async () => {
  const action = await git.getChangeActioner(config('git.repoUrl'))

  action('projects/**', async (files) => {
    const jenkins = initJenkins();
    const info = await jenkins.info()
    console.log('info', info)
    console.log('files', files)
  })

  action('app/*', async (files) => {
    console.log(files)
  })

})().catch(console.error);
