const { createActionRouter } = require('./action-router');
const { setupBuildJob, teardownBuildJob, setupDeployJob, teardownDeployJob } = require('./actions');

const router = createActionRouter();

router.fileAdded('projects/:projectName/build.json', async (change) => {
  await setupBuildJob({ projectName: change.params.projectName, options: change.file });
});

router.fileChanged('projects/:projectName/build.json', async (change) => {
  await teardownBuildJob({ projectName: change.params.projectName, options: change.file });
  await setupBuildJob({ projectName: change.params.projectName, options: change.file });
});

router.fileRemoved('projects/:projectName/build.json', async (change) => {
  await teardownBuildJob({ projectName: change.params.projectName, options: change.file });
});

router.fileAdded('projects/:projectName/deploy.json', async (change) => {
  await setupDeployJob({ projectName: change.params.projectName, options: change.file });
});

router.fileChanged('projects/:projectName/deploy.json', async (change) => {
  await teardownDeployJob({ projectName: change.params.projectName, options: change.file });
  await setupDeployJob({ projectName: change.params.projectName, options: change.file });
});

router.fileRemoved('projects/:projectName/deploy.json', async (change) => {
  await teardownDeployJob({ projectName: change.params.projectName, options: change.file });
});

router.anyChange('*path', async (file) => {});

module.exports = router;
