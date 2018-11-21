const fs = require('fs');
const { render } = require('mustache');
const indent = require('indent-string');

const readFile = name => fs.readFileSync(__dirname + '/' + name).toString();
const renderFile = (fileName, vars) => render(readFile(fileName), vars);
const renderDefaultScript = (fileName, vars) => render(readFile(`default-scripts/${fileName}`), vars);

const buildJobParameters = [
  {
    name: 'gitRef',
    description: 'Can be a git commit hash, git tag, or git branch name',
    defaultValue: 'master',
    trimString: 'true',
  },
  {
    name: 'versionIncrement',
    description: 'Increment the version how? (major, minor, or patch)',
    defaultValue: 'patch',
    trimString: 'true',
  },
];

const createBuildJobConfig = vars => {
  const jenkinsSlave = vars.jenkinsSlave || 'npm-slave';

  const prepScript = vars.prepScript || renderDefaultScript('prep-step.sh', vars);
  const testScript = vars.testScript || renderDefaultScript('test-step.sh', vars);
  const buildScript = vars.buildScript || renderDefaultScript('build-step.sh', {
    imageName: vars.projectName,
    ...vars,
  });

  const pipelineScript = renderDefaultScript('build-pipeline', {
    ...vars,
    jenkinsSlave,
    prepScript: indent(prepScript, 6),
    testScript: indent(testScript, 6),
    buildScript: indent(buildScript, 6),
  });

  const parameters = buildJobParameters
    .concat(vars.parameters || [])
    .map(param => renderFile('parameter.xml', param))
    .join('');

  const pipelineJobConfig = renderFile('pipeline-job.xml', {
    ...vars,
    parameters: indent(parameters, 8),
    pipelineScript: indent(pipelineScript, 6),
  });

  return pipelineJobConfig;
};

const createFolderConfig = () => readFile('folder.xml');

module.exports = {
  createBuildJobConfig,
  createFolderConfig,
};
