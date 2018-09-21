const fs = require('fs');
const Mustache = require('mustache');

const Jenkins = require('jenkins');

const readFile = name => fs.readFileSync(__dirname + '/' + name).toString();

const folderConfig = () => readFile('config-folder.xml');
const pipelineJobConfig = vars => Mustache.render(readFile('config-pipeline-job.xml'), vars);

const jenkinsClient = ({ host, username, password }) => {
  let jenkins = Jenkins({
    baseUrl: `http://${username}:${password}@${host}`,
    crumbIssuer: true,
    promisify: true,
  })

  const thisJenkins = {

    info: () => jenkins.info({depth: 2}),

    findFolder: async (folder) => (await thisJenkins.info()).jobs.find(({ jobs, name }) => jobs && name === folder),

    createFolder: name => jenkins.job.create(name, folderConfig()),

    createPipelineJob: (name, vars) => jenkins.job.create(name, pipelineJobConfig(vars)),

    createProjectJob: async (projectName, jobName, options) => {
      const job = `${projectName}/${jobName}`;
      try{
        const folder = await thisJenkins.findFolder(projectName);
        if(!folder){
          await thisJenkins.createFolder(projectName);
        }
        const defaultOptions = {
          gitRepoUrl: 'https://github.com/unalterable/base-webpack-express-app.git',
          prepScript: 'docker',
          testScript: 'npm test',
          buildScript: 'docker',
        };
        await thisJenkins.createPipelineJob(job, {...defaultOptions, ...options});
        await thisJenkins.triggerBuild(job)
      }
      catch(e) {
        throw Error(`Could not create job '${job}'. ` + e.message);
      }
    },

    triggerBuild: job => jenkins.job.build(job),

    destroyJob: (projectName, jobName) => jenkins.job.destroy(`${projectName}/${jobName}`),

  };

  return thisJenkins;
}

module.exports = jenkinsClient;
