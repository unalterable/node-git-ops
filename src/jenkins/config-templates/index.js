const fs = require('fs');
const { render } = require('mustache');
const indent = require('indent-string');

const readFile = name => fs.readFileSync(__dirname + '/' + name).toString();
const scriptsDir = 'default-scripts/';

const createPipelineJobConfig = vars => {
  const jenkinsSlave = vars.jenkinsSlave || 'npm-slave';

  const prepScript = vars.prepScript || render(readFile(scriptsDir + 'pipeline-prep.sh'), vars);
  const testScript = vars.testScript || render(readFile(scriptsDir + 'pipeline-test.sh'), vars);
  const buildScript = vars.buildScript || render(readFile(scriptsDir + 'pipeline-build.sh'), {
    imageName: vars.projectName,
    ...vars,
  });

  const pipelineScript = render(readFile('pipeline-script'), {
    ...vars,
    jenkinsSlave,
    prepScript: indent(prepScript, 6),
    testScript: indent(testScript, 6),
    buildScript: indent(buildScript, 6),
  });

  const pipelineJobConfig = render(readFile('pipeline-job.xml'), {
    ...vars,
    pipelineScript: indent(pipelineScript, 6),
  });

  return pipelineJobConfig;
};

const createFolderConfig = () => readFile('folder.xml');

module.exports = {
  createPipelineJobConfig,
  createFolderConfig,
};
