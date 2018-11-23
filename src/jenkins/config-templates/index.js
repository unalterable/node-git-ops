const fs = require('fs');
const { render } = require('mustache');
const indent = require('indent-string');

const defaultJenkinsSlave = 'npm-slave';

const readFile = name => fs.readFileSync(__dirname + '/' + name).toString();
const renderFile = (fileName, vars) => render(readFile(fileName), vars);
const renderDefaultScript = (fileName, vars) => render(readFile(`default-scripts/${fileName}`), vars);
const renderPipelineJob = ({ parameters, pipelineScript }) => renderFile('pipeline-job.xml', {
  parameters: indent(parameters, 8),
  pipelineScript: pipelineScript,
});
const renderJobParams = params => params.map(param => renderFile('parameter.xml', param)).join('');

const buildJobParams = [
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

const deployJobParams = [
  {
    name: 'dockerTag',
    description: 'The tag (usually a version number) of the image you`re trying to deploy`',
    defaultValue: 'latest',
    trimString: 'true',
  },
];

const createBuildJobConfig = vars => {
  const jenkinsSlave = vars.jenkinsSlave || defaultJenkinsSlave;
  const prepScript = vars.prepScript || renderDefaultScript('prep-step.sh', vars);
  const testScript = vars.testScript || renderDefaultScript('test-step.sh', vars);
  const buildScript = vars.buildScript || renderDefaultScript('build-step.sh', {
    imageName: vars.projectName,
    ...vars,
  });

  return renderPipelineJob({
    parameters: renderJobParams(buildJobParams.concat(vars.parameters || [])),
    pipelineScript: renderDefaultScript('build-pipeline', {
      gitRepo: vars.gitRepo,
      jenkinsSlave,
      prepScript: indent(prepScript, 6),
      testScript: indent(testScript, 6),
      buildScript: indent(buildScript, 6),
    }),
  });
};

const createDeployJobConfig = vars => {
  const jenkinsSlave = vars.jenkinsSlave || defaultJenkinsSlave;
  const deployScript = vars.deployScript || renderDefaultScript('deploy-step.sh', {
    namespace: vars.projectName,
    imageName: vars.projectName,
    serviceName: vars.applicationName || vars.projectName,
    applicationName: vars.applicationName || vars.projectName,
    containerPort: 3000,
    replicas: 1,
    maxSurge: 1,
    maxUnavailable: 0,
    ...vars,
  });

  return renderPipelineJob({
    parameters: renderJobParams(deployJobParams.concat(vars.parameters || [])),
    pipelineScript: renderDefaultScript('deploy-pipeline', {
      deployScript,
      jenkinsSlave,
    }),
  });
};

const createFolderConfig = () => readFile('folder.xml');

module.exports = {
  createBuildJobConfig,
  createDeployJobConfig,
  createFolderConfig,
};
