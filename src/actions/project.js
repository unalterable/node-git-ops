const config = require('../config');
const initJenkins = require('../jenkins');

const myJenkins = initJenkins({
  host: config('jenkins.host'),// + '/job/appFodlder',
  username: config('jenkins.username'),
  password: config('jenkins.password'),
});

const buildJson = async (change) => {
  if (change.added || change.renamed){
    try{
      const projectName = change.params.name;
      const folder = await myJenkins.findFolder(projectName);
      if(!folder){
        await myJenkins.createFolder(projectName);
      }
      await myJenkins.createJob(`${projectName}/build`);
    }
    catch(e) {
      throw Error(`Could not create job '${projectName}/build'. ` + e.message);
    }
  }
}

module.exports = {
  buildJson,
}
