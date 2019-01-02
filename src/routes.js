const { createActionRouter } = require('./action-router');
const { setupBuildJob, teardownBuildJob, setupDeployJob, teardownDeployJob } = require('./actions');

const router = createActionRouter();

router.fileAdded('projects/:projectName/build(-:appName).json', async (change) => {
  const { projectName, appName } = change.params;
  await setupBuildJob({ projectName, appName, options: change.file });
});

router.fileChanged('projects/:projectName/build(-:app).json', async (change) => {
  const { projectName, appName } = change.params;
  await teardownBuildJob({ projectName, appName, options: change.file });
  await setupBuildJob({ projectName, appName, options: change.file });
});

router.fileRemoved('projects/:projectName/build(-:app).json', async (change) => {
  const { projectName, appName } = change.params;
  await teardownBuildJob({ projectName, appName, options: change.file });
});

router.fileAdded('projects/:projectName/deploy(-:app).json', async (change) => {
  const { projectName, appName } = change.params;
  await setupDeployJob({ projectName, appName, options: change.file });
});

router.fileChanged('projects/:projectName/deploy(-:app).json', async (change) => {
  const { projectName, appName } = change.params;
  await teardownDeployJob({ projectName, appName, options: change.file });
  await setupDeployJob({ projectName, appName, options: change.file });
});

router.fileRemoved('projects/:projectName/deploy(-:app).json', async (change) => {
  const { projectName, appName } = change.params;
  await teardownDeployJob({ projectName, appName, options: change.file });
});

router.anyChange('*path', async (file) => {});

module.exports = router;
