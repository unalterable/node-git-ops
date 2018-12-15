const dockerStarter = require('docker-starter');
const { setConfigOverride } = require('../src/config');

const jenkins = dockerStarter({
  container: 'test-jenkins',
  image: 'djdplatform/test-jenkins',
  extraOptions: '',
  containerPort: 8080,
  publishedPort: 30000,
});

describe('', () => {
  before(async () => {
    const { host, port } = jenkins.ensureRunning();
    setConfigOverride('jenkins.host', `${host}:${port}`);
  });

  after(() => {
    /* jenkins.stopAndRemove(); */
  });


  it('works', async () => {
    await require('../src/index');
  });
});
