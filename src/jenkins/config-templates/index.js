const fs = require('fs');
const Mustache = require('mustache');

const readFile = name => fs.readFileSync(__dirname + '/' + name).toString();
const scriptsDir = 'default-scripts/';

const createPipelineJobConfig = vars => {
  const prepScript = vars.prepScript || Mustache.render(readFile(scriptsDir + 'pipeline-prep.sh'), vars);
  const testScript = vars.testScript || Mustache.render(readFile(scriptsDir + 'pipeline-test.sh'), vars);
  const buildScript = vars.buildScript || Mustache.render(readFile(scriptsDir + 'pipeline-build.sh'), vars);

  const pipelineScript = Mustache.render(readFile('pipeline-script'), { ...vars, prepScript, testScript, buildScript });

  const pipelineJobConfig = Mustache.render(readFile('pipeline-job.xml'), { ...vars, pipelineScript });

  return pipelineJobConfig;
};

const createFolderConfig = () => readFile('folder.xml');

module.exports = {
  createPipelineJobConfig,
  createFolderConfig,
};
